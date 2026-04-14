import { Test, TestingModule } from "@nestjs/testing";
import { WalletsService } from "./wallets.service";
import { getModelToken } from "@nestjs/mongoose";
import { NotFoundException, BadRequestException } from "@nestjs/common";

describe("WalletsService", () => {
  let service: WalletsService;
  let mockWalletModel: any;

  beforeEach(async () => {
    mockWalletModel = {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletsService,
        { provide: getModelToken("Wallet"), useValue: mockWalletModel },
      ],
    }).compile();

    service = module.get<WalletsService>(WalletsService);
  });

  describe("addPoints", () => {
    it("should add points to a global wallet via atomic upsert", async () => {
      const wallet = { userId: "user1", merchantId: null, balance: 150 };
      mockWalletModel.findOneAndUpdate.mockResolvedValue(wallet);

      const result = await service.addPoints("507f1f77bcf86cd799439011", null, 100);

      expect(mockWalletModel.findOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ merchantId: null }),
        expect.objectContaining({ $inc: { balance: 100 } }),
        { upsert: true, new: true },
      );
      expect(result.balance).toBe(150);
    });

    it("should add points to a merchant-specific wallet", async () => {
      const wallet = { userId: "user1", merchantId: "merchant1", balance: 50 };
      mockWalletModel.findOneAndUpdate.mockResolvedValue(wallet);

      const result = await service.addPoints(
        "507f1f77bcf86cd799439011",
        "507f1f77bcf86cd799439012",
        50,
      );

      expect(result.balance).toBe(50);
    });
  });

  describe("deductPoints", () => {
    it("should deduct points when balance is sufficient", async () => {
      const wallet = { userId: "user1", merchantId: null, balance: 50 };
      mockWalletModel.findOneAndUpdate.mockResolvedValue(wallet);

      const result = await service.deductPoints("507f1f77bcf86cd799439011", null, 50);

      expect(mockWalletModel.findOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ balance: { $gte: 50 } }),
        { $inc: { balance: -50 } },
        { new: true },
      );
      expect(result.balance).toBe(50);
    });

    it("should throw BadRequestException when balance is insufficient", async () => {
      mockWalletModel.findOneAndUpdate.mockResolvedValue(null);
      mockWalletModel.findOne.mockResolvedValue({ balance: 10 }); // wallet exists but low balance

      await expect(
        service.deductPoints("507f1f77bcf86cd799439011", null, 100),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw NotFoundException when wallet does not exist", async () => {
      mockWalletModel.findOneAndUpdate.mockResolvedValue(null);
      mockWalletModel.findOne.mockResolvedValue(null); // wallet doesn't exist

      await expect(
        service.deductPoints("507f1f77bcf86cd799439011", null, 100),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("getWalletsForUser", () => {
    it("should return all wallets for a user", async () => {
      const wallets = [
        { userId: "user1", merchantId: null, balance: 100 },
        { userId: "user1", merchantId: "m1", balance: 50 },
      ];
      mockWalletModel.find.mockResolvedValue(wallets);

      const result = await service.getWalletsForUser("507f1f77bcf86cd799439011");
      expect(result).toHaveLength(2);
    });
  });

  describe("getGlobalWallet", () => {
    it("should return the global wallet (merchantId = null)", async () => {
      const wallet = { userId: "user1", merchantId: null, balance: 500 };
      mockWalletModel.findOne.mockResolvedValue(wallet);

      const result = await service.getGlobalWallet("507f1f77bcf86cd799439011");
      expect(result!.balance).toBe(500);
      expect(mockWalletModel.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ merchantId: null }),
      );
    });
  });
});
