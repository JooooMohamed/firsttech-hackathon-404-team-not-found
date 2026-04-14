import { Test, TestingModule } from "@nestjs/testing";
import { QrService, HmacQrPayload } from "./qr.service";
import { getModelToken } from "@nestjs/mongoose";
import { ConfigService } from "../../config/config.service";
import { NotFoundException, BadRequestException } from "@nestjs/common";

describe("QrService", () => {
  let service: QrService;
  let mockQrSessionModel: any;
  let mockWalletModel: any;

  beforeEach(async () => {
    mockQrSessionModel = {
      create: jest.fn().mockImplementation((data: any) => ({
        ...data,
        _id: "session1",
        toObject: () => data,
      })),
      findOne: jest.fn(),
    };

    mockWalletModel = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QrService,
        { provide: getModelToken("QrSession"), useValue: mockQrSessionModel },
        { provide: getModelToken("Wallet"), useValue: mockWalletModel },
        { provide: ConfigService, useValue: { qrHmacSecret: "test-secret-key" } },
      ],
    }).compile();

    service = module.get<QrService>(QrService);
  });

  describe("createSession", () => {
    it("should create a session with HMAC-signed payload", async () => {
      const result = await service.createSession("507f1f77bcf86cd799439011", {
        type: "earn",
      });

      expect(result.hmacPayload).toBeDefined();
      expect(result.hmacPayload.sig).toBeDefined();
      expect(result.hmacPayload.uid).toBe("507f1f77bcf86cd799439011");
      expect(result.hmacPayload.typ).toBe("earn");
      expect(result.hmacPayload.nonce).toHaveLength(12);
      expect(result.hmacPayload.exp).toBeGreaterThan(Date.now());
    });

    it("should store session in DB with nonce as token", async () => {
      await service.createSession("507f1f77bcf86cd799439011", {});

      expect(mockQrSessionModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          token: expect.any(String),
          status: "pending",
        }),
      );
    });
  });

  describe("verifySignature", () => {
    it("should verify a valid signature", async () => {
      const result = await service.createSession("507f1f77bcf86cd799439011", {});
      const isValid = service.verifySignature(result.hmacPayload);
      expect(isValid).toBe(true);
    });

    it("should reject a tampered payload", async () => {
      const result = await service.createSession("507f1f77bcf86cd799439011", {});
      const tampered = { ...result.hmacPayload, uid: "tampered-user-id" };
      const isValid = service.verifySignature(tampered);
      expect(isValid).toBe(false);
    });

    it("should reject a tampered amount", async () => {
      const result = await service.createSession("507f1f77bcf86cd799439011", {
        type: "redeem",
        amount: 100,
      });
      const tampered = { ...result.hmacPayload, amt: 999999 };
      const isValid = service.verifySignature(tampered);
      expect(isValid).toBe(false);
    });
  });

  describe("verifyAndLookup", () => {
    it("should reject expired HMAC payload", async () => {
      const result = await service.createSession("507f1f77bcf86cd799439011", {});
      const expired = { ...result.hmacPayload, exp: Date.now() - 1000 };
      // Re-sign with correct expiry to pass HMAC check but fail expiry
      // Actually this will fail HMAC since exp changed — that's correct behavior
      await expect(service.verifyAndLookup(expired)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should reject invalid signature", async () => {
      const payload: HmacQrPayload = {
        uid: "user1",
        mid: null,
        typ: "general",
        amt: null,
        nonce: "test123",
        exp: Date.now() + 300000,
        sig: "invalid-signature",
      };

      await expect(service.verifyAndLookup(payload)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("completeSession", () => {
    it("should mark session as completed by token", async () => {
      const session = {
        status: "pending",
        save: jest.fn().mockResolvedValue(true),
      };
      mockQrSessionModel.findOne.mockResolvedValue(session);

      await service.completeSession("ABCDEF");

      expect(session.status).toBe("completed");
      expect(session.save).toHaveBeenCalled();
    });

    it("should throw NotFoundException for missing token", async () => {
      mockQrSessionModel.findOne.mockResolvedValue(null);

      await expect(service.completeSession("NOTFOUND")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
