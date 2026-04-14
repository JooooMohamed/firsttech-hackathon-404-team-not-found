import {
  Injectable,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { Model, Connection, Types } from "mongoose";
import { nanoid } from "nanoid";
import { LedgerEntryDocument } from "../../schemas/ledger-entry.schema";
import { ExchangeTransactionDocument } from "../../schemas/exchange-transaction.schema";
import { WalletsService } from "../wallets/wallets.service";

const DEFAULT_FEE_PERCENT = 4; // 4% platform fee

@Injectable()
export class ExchangeService {
  private readonly logger = new Logger(ExchangeService.name);

  constructor(
    @InjectModel("LedgerEntry") private ledgerModel: Model<LedgerEntryDocument>,
    @InjectModel("ExchangeTransaction") private exchangeTxModel: Model<ExchangeTransactionDocument>,
    @InjectModel("LinkedProgram") private linkedProgramModel: Model<any>,
    @InjectModel("ProgramCatalog") private programCatalogModel: Model<any>,
    @InjectConnection() private connection: Connection,
    private walletsService: WalletsService,
  ) {}

  // 1 EPU = 1 AED
  convertToEPU(amount: number, aedRate: number): number {
    return amount * aedRate; // e.g. 1000 miles * 0.08 AED/mile = 80 EPU
  }

  convertFromEPU(epuAmount: number, aedRate: number): number {
    if (aedRate === 0) return 0;
    return Math.floor(epuAmount / aedRate); // e.g. 80 EPU / 0.08 = 1000 miles
  }

  calculateFee(epuAmount: number, feePercent = DEFAULT_FEE_PERCENT): number {
    return Math.floor(epuAmount * (feePercent / 100));
  }

  async getQuote(
    userId: string,
    sourceProgramId: string,
    targetType: "ep" | "partner",
    targetProgramId?: string,
    amount?: number,
  ) {
    const sourceProgram = await this.linkedProgramModel.findById(sourceProgramId);
    if (!sourceProgram) throw new BadRequestException("Source program not found");
    const resolvedAmount = amount || sourceProgram.balance;
    if (resolvedAmount <= 0) throw new BadRequestException("Amount must be positive");
    if (resolvedAmount > sourceProgram.balance) throw new BadRequestException("Insufficient balance");

    const epuValue = this.convertToEPU(resolvedAmount, sourceProgram.aedRate);
    const fee = this.calculateFee(epuValue);
    const netEpu = epuValue - fee;

    let targetAmount = 0;
    let targetCurrency = "EP";

    if (targetType === "ep") {
      targetAmount = Math.floor(netEpu * 10); // 1 EPU = 10 EP (since 1 AED = 10 EP at default rate)
      targetCurrency = "EP";
    } else if (targetProgramId) {
      const targetProgram = await this.linkedProgramModel.findById(targetProgramId);
      if (!targetProgram) throw new BadRequestException("Target program not found");
      targetAmount = this.convertFromEPU(netEpu, targetProgram.aedRate);
      targetCurrency = targetProgram.currency;
    }

    return {
      sourceAmount: resolvedAmount,
      sourceCurrency: sourceProgram.currency,
      sourceProgramName: sourceProgram.programName,
      epuValue,
      fee,
      feePercent: DEFAULT_FEE_PERCENT,
      netEpu,
      targetAmount,
      targetCurrency,
      rate: resolvedAmount > 0 ? targetAmount / resolvedAmount : 0,
    };
  }

  async execute(
    userId: string,
    sourceProgramId: string,
    targetType: "ep" | "partner",
    amount: number,
    targetProgramId?: string,
  ) {
    const txRef = nanoid(16);
    const sourceProgram = await this.linkedProgramModel.findById(sourceProgramId);
    if (!sourceProgram) throw new BadRequestException("Source program not found");
    if (sourceProgram.userId.toString() !== userId) throw new BadRequestException("Program not owned by user");
    if (amount <= 0 || amount > sourceProgram.balance) {
      throw new BadRequestException("Invalid amount or insufficient balance");
    }

    const epuValue = this.convertToEPU(amount, sourceProgram.aedRate);
    const fee = this.calculateFee(epuValue);
    const netEpu = epuValue - fee;

    let targetAmount = 0;

    // Deduct from source
    sourceProgram.balance -= amount;
    await sourceProgram.save();

    // Write ledger entries
    const ledgerEntries = [
      {
        txRef,
        accountType: "user_partner",
        accountId: new Types.ObjectId(userId),
        debit: amount,
        credit: 0,
        currency: sourceProgram.currency,
        memo: `Exchange out: ${amount} ${sourceProgram.currency} from ${sourceProgram.programName}`,
      },
      {
        txRef,
        accountType: "platform_fee",
        accountId: new Types.ObjectId(userId),
        debit: 0,
        credit: fee,
        currency: "EPU",
        memo: `Platform fee: ${fee} EPU (${DEFAULT_FEE_PERCENT}%)`,
      },
    ];

    if (targetType === "ep") {
      targetAmount = Math.floor(netEpu * 10);
      await this.walletsService.addPoints(userId, null, targetAmount);

      ledgerEntries.push({
        txRef,
        accountType: "user_ep",
        accountId: new Types.ObjectId(userId),
        debit: 0,
        credit: targetAmount,
        currency: "EP",
        memo: `Exchange in: ${targetAmount} EP`,
      });
    } else if (targetProgramId) {
      const targetProgram = await this.linkedProgramModel.findById(targetProgramId);
      if (!targetProgram) throw new BadRequestException("Target program not found");
      targetAmount = this.convertFromEPU(netEpu, targetProgram.aedRate);
      targetProgram.balance += targetAmount;
      await targetProgram.save();

      ledgerEntries.push({
        txRef,
        accountType: "user_partner",
        accountId: new Types.ObjectId(userId),
        debit: 0,
        credit: targetAmount,
        currency: targetProgram.currency,
        memo: `Exchange in: ${targetAmount} ${targetProgram.currency} to ${targetProgram.programName}`,
      });
    }

    await this.ledgerModel.insertMany(ledgerEntries);

    const exchangeTx = await this.exchangeTxModel.create({
      userId: new Types.ObjectId(userId),
      sourceType: "partner",
      sourceProgramId: new Types.ObjectId(sourceProgramId),
      sourceAmount: amount,
      targetType,
      targetProgramId: targetProgramId ? new Types.ObjectId(targetProgramId) : undefined,
      targetAmount,
      epuAmountIntermediate: epuValue,
      feeEpu: fee,
      feePercent: DEFAULT_FEE_PERCENT,
      status: "completed",
      txRef,
    });

    return {
      exchangeTransaction: exchangeTx,
      sourceDeducted: amount,
      targetCredited: targetAmount,
      fee,
      txRef,
    };
  }

  async getHistory(userId: string, limit = 20) {
    return this.exchangeTxModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate("sourceProgramId", "programName currency")
      .populate("targetProgramId", "programName currency")
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}
