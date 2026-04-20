import { Test, TestingModule } from "@nestjs/testing";
import { TransactionsService } from "./transactions.service";
import { WalletsService } from "../wallets/wallets.service";
import { MerchantsService } from "../merchants/merchants.service";
import { EventsService } from "../events/events.service";
import { TiersService } from "../tiers/tiers.service";
import { getModelToken } from "@nestjs/mongoose";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";

describe("TransactionsService", () => {
  let service: TransactionsService;
  let mockTransactionModel: any;
  let mockQrSessionModel: any;
  let mockOfferModel: any;
  let mockUserModel: any;
  let mockLinkedProgramModel: any;
  let mockWalletsService: any;
  let mockMerchantsService: any;
  let mockEventsService: any;
  let mockTiersService: any;

  const userId = "507f1f77bcf86cd799439011";
  const merchantId = "507f1f77bcf86cd799439012";

  const activeMerchant = {
    _id: merchantId,
    name: "Test Merchant",
    status: "ACTIVE",
    earnRate: 10,
    bonusMultiplier: 1,
    minSpend: 0,
    redemptionEnabled: true,
    crossSmeRedemption: true,
  };

  beforeEach(async () => {
    mockTransactionModel = {
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
      aggregate: jest.fn(),
    };

    mockQrSessionModel = {
      findOne: jest.fn(),
    };

    mockOfferModel = {
      find: jest.fn().mockResolvedValue([]),
    };

    mockUserModel = {
      findById: jest.fn().mockResolvedValue({ lifetimeEP: 0 }),
      findByIdAndUpdate: jest.fn().mockResolvedValue({}),
    };

    mockLinkedProgramModel = {
      findOne: jest.fn().mockResolvedValue(null),
    };

    mockWalletsService = {
      addPoints: jest.fn().mockResolvedValue({ balance: 100 }),
      deductPoints: jest.fn().mockResolvedValue({ balance: 0 }),
    };

    mockMerchantsService = {
      findById: jest.fn().mockResolvedValue(activeMerchant),
    };

    mockEventsService = {
      emitToUser: jest.fn(),
      emitToMerchant: jest.fn(),
    };

    mockTiersService = {
      getTierMultiplier: jest.fn().mockReturnValue(1),
      checkAndUpgradeTier: jest.fn().mockResolvedValue({ upgraded: false }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getModelToken("Transaction"),
          useValue: mockTransactionModel,
        },
        { provide: getModelToken("QrSession"), useValue: mockQrSessionModel },
        { provide: getModelToken("Offer"), useValue: mockOfferModel },
        { provide: getModelToken("User"), useValue: mockUserModel },
        {
          provide: getModelToken("LinkedProgram"),
          useValue: mockLinkedProgramModel,
        },
        { provide: WalletsService, useValue: mockWalletsService },
        { provide: MerchantsService, useValue: mockMerchantsService },
        { provide: EventsService, useValue: mockEventsService },
        { provide: TiersService, useValue: mockTiersService },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  // ── earn() ──────────────────────────────────────────────
  describe("earn", () => {
    it("should earn points and return transaction result", async () => {
      const txDoc = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        merchantId: new Types.ObjectId(merchantId),
        type: "earn",
        points: 100,
        amountAed: 10,
      };
      mockTransactionModel.create.mockResolvedValue(txDoc);

      const result = (await service.earn({
        merchantId,
        userId,
        amountAed: 10,
      })) as any;

      expect(result.transaction).toEqual(txDoc);
      expect(result.totalPoints).toBe(100); // 10 AED * earnRate 10
      expect(mockWalletsService.addPoints).toHaveBeenCalledWith(
        userId,
        null,
        100,
      );
      expect(mockEventsService.emitToUser).toHaveBeenCalled();
      expect(mockEventsService.emitToMerchant).toHaveBeenCalled();
    });

    it("should reject if merchant is paused", async () => {
      mockMerchantsService.findById.mockResolvedValue({
        ...activeMerchant,
        status: "PAUSED",
      });

      await expect(
        service.earn({ merchantId, userId, amountAed: 10 }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should reject if amount is below minSpend", async () => {
      mockMerchantsService.findById.mockResolvedValue({
        ...activeMerchant,
        minSpend: 50,
      });

      await expect(
        service.earn({ merchantId, userId, amountAed: 10 }),
      ).rejects.toThrow("Minimum spend is 50 AED");
    });

    it("should apply tier multiplier when user has higher tier", async () => {
      mockTiersService.getTierMultiplier.mockReturnValue(1.25);
      mockUserModel.findById.mockResolvedValue({ lifetimeEP: 30000 });
      const txDoc = {
        _id: new Types.ObjectId(),
        type: "earn",
        points: 125,
      };
      mockTransactionModel.create.mockResolvedValue(txDoc);

      const result = (await service.earn({
        merchantId,
        userId,
        amountAed: 10,
      })) as any;

      // base 100, tier bonus = floor(100 * 0.25) = 25, total = 125
      expect(result.totalPoints).toBe(125);
      expect(result.tierBonus).toBe(25);
    });

    it("should apply bonus offers (multiplier)", async () => {
      mockOfferModel.find.mockResolvedValue([
        { title: "Double Points", value: 2, type: "bonus" },
      ]);
      const txDoc = { _id: new Types.ObjectId(), type: "earn", points: 200 };
      mockTransactionModel.create.mockResolvedValue(txDoc);

      const result = (await service.earn({
        merchantId,
        userId,
        amountAed: 10,
      })) as any;

      // base 100, offer 2x → bonus = (100*2 - 100) = 100, total = 200
      expect(result.totalPoints).toBe(200);
      expect(result.bonusPoints).toBe(100);
    });

    it("should return existing transaction for duplicate idempotencyKey", async () => {
      const existingTx = {
        _id: new Types.ObjectId(),
        type: "earn",
        points: 100,
        idempotencyKey: "key-123",
      };
      mockTransactionModel.findOne.mockResolvedValue(existingTx);

      const result = (await service.earn({
        merchantId,
        userId,
        amountAed: 10,
        idempotencyKey: "key-123",
      })) as any;

      expect(result.duplicate).toBe(true);
      expect(result.transaction).toEqual(existingTx);
      expect(mockWalletsService.addPoints).not.toHaveBeenCalled();
    });

    it("should validate QR token and override userId", async () => {
      const qrUserId = "507f1f77bcf86cd799439099";
      const session = {
        token: "ABC123",
        userId: new Types.ObjectId(qrUserId),
        merchantId: new Types.ObjectId(merchantId),
        status: "pending",
        expiresAt: new Date(Date.now() + 60000),
        save: jest.fn(),
      };
      mockQrSessionModel.findOne.mockResolvedValue(session);
      mockUserModel.findById.mockResolvedValue({ lifetimeEP: 0 });
      const txDoc = { _id: new Types.ObjectId(), type: "earn", points: 100 };
      mockTransactionModel.create.mockResolvedValue(txDoc);

      const result = await service.earn({
        merchantId,
        userId, // will be overridden
        amountAed: 10,
        qrToken: "abc123",
      });

      // Points should be added for the QR user, not the passed userId
      expect(mockWalletsService.addPoints).toHaveBeenCalledWith(
        qrUserId,
        null,
        100,
      );
      expect(session.status).toBe("completed");
      expect(session.save).toHaveBeenCalled();
    });

    it("should reject expired QR token", async () => {
      mockQrSessionModel.findOne.mockResolvedValue({
        token: "ABC123",
        status: "pending",
        expiresAt: new Date(Date.now() - 60000), // expired
      });

      await expect(
        service.earn({ merchantId, userId, amountAed: 10, qrToken: "ABC123" }),
      ).rejects.toThrow("QR session expired");
    });
  });

  // ── redeem() ────────────────────────────────────────────
  describe("redeem", () => {
    it("should redeem points and return result", async () => {
      const txDoc = {
        _id: new Types.ObjectId(),
        type: "redeem",
        points: 50,
      };
      mockTransactionModel.create.mockResolvedValue(txDoc);

      const result = (await service.redeem({
        merchantId,
        userId,
        points: 50,
      })) as any;

      expect(result.pointsRedeemed).toBe(50);
      expect(mockWalletsService.deductPoints).toHaveBeenCalledWith(
        userId,
        null,
        50,
      );
    });

    it("should reject if merchant is paused", async () => {
      mockMerchantsService.findById.mockResolvedValue({
        ...activeMerchant,
        status: "PAUSED",
      });

      await expect(
        service.redeem({ merchantId, userId, points: 50 }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should reject if redemption is disabled", async () => {
      mockMerchantsService.findById.mockResolvedValue({
        ...activeMerchant,
        redemptionEnabled: false,
      });

      await expect(
        service.redeem({ merchantId, userId, points: 50 }),
      ).rejects.toThrow("Redemption not enabled");
    });

    it("should enforce cross-SME restriction", async () => {
      mockMerchantsService.findById.mockResolvedValue({
        ...activeMerchant,
        crossSmeRedemption: false,
      });
      // User earned only 30 at this merchant
      mockTransactionModel.aggregate
        .mockResolvedValueOnce([{ _id: null, total: 30 }]) // earned
        .mockResolvedValueOnce([{ _id: null, total: 0 }]); // redeemed

      await expect(
        service.redeem({ merchantId, userId, points: 50 }),
      ).rejects.toThrow("only allows redeeming points earned here");
    });

    it("should return existing transaction for duplicate idempotencyKey", async () => {
      const existingTx = {
        _id: new Types.ObjectId(),
        type: "redeem",
        idempotencyKey: "redeem-key",
      };
      mockTransactionModel.findOne.mockResolvedValue(existingTx);

      const result = (await service.redeem({
        merchantId,
        userId,
        points: 50,
        idempotencyKey: "redeem-key",
      })) as any;

      expect(result.duplicate).toBe(true);
      expect(mockWalletsService.deductPoints).not.toHaveBeenCalled();
    });
  });

  // ── voidTransaction() ──────────────────────────────────
  describe("voidTransaction", () => {
    it("should void an earn transaction and reverse wallet", async () => {
      const tx = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        merchantId: new Types.ObjectId(merchantId),
        type: "earn",
        points: 100,
        voidedAt: null,
        save: jest.fn(),
      };
      mockTransactionModel.findById.mockResolvedValue(tx);

      const result = await service.voidTransaction(
        tx._id.toString(),
        "507f1f77bcf86cd799439099",
        "mistake",
      );

      expect(result.voided).toBe(true);
      expect(mockWalletsService.deductPoints).toHaveBeenCalledWith(
        userId,
        null,
        100,
      );
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
        $inc: { lifetimeEP: -100 },
      });
      expect(tx.voidedAt).toBeDefined();
      expect(tx.save).toHaveBeenCalled();
    });

    it("should void a redeem transaction and restore wallet", async () => {
      const tx = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        merchantId: new Types.ObjectId(merchantId),
        type: "redeem",
        points: 50,
        voidedAt: null,
        save: jest.fn(),
      };
      mockTransactionModel.findById.mockResolvedValue(tx);

      const result = await service.voidTransaction(
        tx._id.toString(),
        "507f1f77bcf86cd799439099",
      );

      expect(result.voided).toBe(true);
      expect(mockWalletsService.addPoints).toHaveBeenCalledWith(
        userId,
        null,
        50,
      );
    });

    it("should throw if transaction not found", async () => {
      mockTransactionModel.findById.mockResolvedValue(null);

      await expect(
        service.voidTransaction(
          "507f1f77bcf86cd799439000",
          "507f1f77bcf86cd799439099",
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw if transaction already voided", async () => {
      mockTransactionModel.findById.mockResolvedValue({
        voidedAt: new Date(),
      });

      await expect(
        service.voidTransaction(
          "507f1f77bcf86cd799439000",
          "507f1f77bcf86cd799439099",
        ),
      ).rejects.toThrow("already voided");
    });
  });

  // ── getByUserId() ──────────────────────────────────────
  describe("getByUserId", () => {
    it("should return cursor-paginated transactions", async () => {
      const items = Array.from({ length: 3 }, (_, i) => ({
        _id: new Types.ObjectId(),
        type: "earn",
        points: (i + 1) * 10,
      }));
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(items),
      };
      mockTransactionModel.find.mockReturnValue(mockQuery);

      const result = await service.getByUserId(userId, { limit: 20 });

      expect(result.items).toHaveLength(3);
      expect(result.hasMore).toBe(false);
    });

    it("should apply date filters", async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };
      mockTransactionModel.find.mockReturnValue(mockQuery);

      await service.getByUserId(userId, {
        startDate: "2026-01-01",
        endDate: "2026-01-31",
      });

      const filter = mockTransactionModel.find.mock.calls[0][0];
      expect(filter.createdAt).toBeDefined();
      expect(filter.createdAt.$gte).toBeInstanceOf(Date);
      expect(filter.createdAt.$lte).toBeInstanceOf(Date);
    });
  });

  // ── getMerchantStats() ─────────────────────────────────
  describe("getMerchantStats", () => {
    it("should return aggregated stats", async () => {
      mockTransactionModel.aggregate.mockResolvedValue([
        {
          totalPointsIssued: 1000,
          totalPointsRedeemed: 300,
          totalTransactions: 50,
          activeMembers: 10,
        },
      ]);

      const result = await service.getMerchantStats(merchantId);

      expect(result.totalPointsIssued).toBe(1000);
      expect(result.activeMembers).toBe(10);
    });

    it("should return zeros when no transactions exist", async () => {
      mockTransactionModel.aggregate.mockResolvedValue([]);

      const result = await service.getMerchantStats(merchantId);

      expect(result.totalPointsIssued).toBe(0);
      expect(result.totalTransactions).toBe(0);
    });
  });

  // ── getUserInsights() ──────────────────────────────────
  describe("getUserInsights", () => {
    it("should return 30-day insights with top merchant", async () => {
      mockTransactionModel.aggregate.mockResolvedValue([
        {
          _id: { type: "earn", merchantId: new Types.ObjectId(merchantId) },
          total: 500,
          count: 5,
        },
        {
          _id: { type: "redeem", merchantId: new Types.ObjectId(merchantId) },
          total: 100,
          count: 2,
        },
      ]);
      mockMerchantsService.findById.mockResolvedValue({
        name: "Test Merchant",
        logo: "logo.png",
      });

      const result = await service.getUserInsights(userId);

      expect(result.earned).toBe(500);
      expect(result.redeemed).toBe(100);
      expect(result.txCount).toBe(7);
      expect(result.topMerchant).toBeDefined();
      expect(result.topMerchant!.name).toBe("Test Merchant");
    });
  });
});
