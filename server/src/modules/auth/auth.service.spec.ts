import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import { getModelToken } from "@nestjs/mongoose";
import { UnauthorizedException, ConflictException } from "@nestjs/common";
import { EmailService } from "../email/email.service";
import * as bcrypt from "bcrypt";

jest.mock("bcrypt");

describe("AuthService", () => {
  let service: AuthService;
  let mockUserModel: any;
  let mockWalletModel: any;
  let mockMagicLinkModel: any;
  let mockJwtService: any;
  let mockEmailService: any;

  beforeEach(async () => {
    mockUserModel = {
      findOne: jest.fn(),
      create: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };

    mockWalletModel = {
      create: jest.fn(),
      findOneAndUpdate: jest.fn(),
    };

    mockMagicLinkModel = {
      create: jest.fn(),
      findOne: jest.fn(),
      updateMany: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue("mock-jwt-token"),
    };

    mockEmailService = {
      sendMagicLink: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken("User"), useValue: mockUserModel },
        { provide: getModelToken("Wallet"), useValue: mockWalletModel },
        { provide: getModelToken("MagicLink"), useValue: mockMagicLinkModel },
        { provide: JwtService, useValue: mockJwtService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe("login", () => {
    it("should return token and user on valid credentials", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@demo.com",
        password: "hashed",
        roles: ["member"],
        toObject: () => ({ _id: "user123", email: "test@demo.com", roles: ["member"] }),
      };
      mockUserModel.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login("test@demo.com", "demo123");

      expect(result.token).toBe("mock-jwt-token");
      expect(mockJwtService.sign).toHaveBeenCalled();
    });

    it("should throw UnauthorizedException on wrong password", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@demo.com",
        password: "hashed",
      };
      mockUserModel.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login("test@demo.com", "wrong")).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException when user not found", async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(service.login("no@user.com", "pass")).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("register", () => {
    it("should throw ConflictException for duplicate email", async () => {
      mockUserModel.findOne.mockResolvedValue({ email: "exists@demo.com" });

      await expect(
        service.register({
          name: "Test",
          email: "exists@demo.com",
          password: "Test1234",
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("requestMagicLink", () => {
    it("should create a magic link and send email", async () => {
      mockMagicLinkModel.updateMany.mockResolvedValue({});
      mockMagicLinkModel.create.mockResolvedValue({});

      const result = await service.requestMagicLink("test@demo.com");

      expect(result.message).toContain("Check your email");
      expect(mockEmailService.sendMagicLink).toHaveBeenCalledWith(
        "test@demo.com",
        expect.any(String),
      );
      expect(mockMagicLinkModel.updateMany).toHaveBeenCalled();
    });
  });

  describe("verifyMagicLink", () => {
    it("should return token for valid magic link with existing user", async () => {
      const mockLink = {
        email: "test@demo.com",
        expiresAt: new Date(Date.now() + 300000),
        used: false,
        save: jest.fn(),
      };
      mockMagicLinkModel.findOne.mockResolvedValue(mockLink);

      const mockUser = {
        _id: "user123",
        email: "test@demo.com",
        roles: ["member"],
        toObject: () => ({ _id: "user123", email: "test@demo.com", roles: ["member"] }),
      };
      mockUserModel.findOne.mockResolvedValue(mockUser);

      const result = await service.verifyMagicLink("valid-token");

      expect(result.token).toBe("mock-jwt-token");
      expect(mockLink.used).toBe(true);
      expect(mockLink.save).toHaveBeenCalled();
    });

    it("should reject invalid/used magic link", async () => {
      mockMagicLinkModel.findOne.mockResolvedValue(null);

      await expect(service.verifyMagicLink("invalid")).rejects.toThrow();
    });
  });
});
