import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuditLogDocument } from "../../schemas/audit-log.schema";

@Injectable()
export class AuditService {
  constructor(
    @InjectModel("AuditLog") private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async log(
    collection: string,
    documentId: string,
    changes: Record<string, { old: any; new: any }>,
    changedBy: string,
    reason?: string,
  ) {
    const entries = Object.entries(changes).map(([field, values]) => ({
      collection,
      documentId: new Types.ObjectId(documentId),
      field,
      oldValue: values.old,
      newValue: values.new,
      changedBy: new Types.ObjectId(changedBy),
      reason,
    }));

    if (entries.length > 0) {
      await this.auditLogModel.insertMany(entries);
    }
  }

  async getByDocument(collection: string, documentId: string) {
    return this.auditLogModel
      .find({
        collection,
        documentId: new Types.ObjectId(documentId),
      })
      .populate("changedBy", "name email")
      .sort({ createdAt: -1 });
  }

  async query(filters: {
    collection?: string;
    documentId?: string;
    changedBy?: string;
    startDate?: string;
    endDate?: string;
    cursor?: string;
    limit?: number;
  }) {
    const filter: any = {};
    if (filters.collection) filter.collection = filters.collection;
    if (filters.documentId) filter.documentId = new Types.ObjectId(filters.documentId);
    if (filters.changedBy) filter.changedBy = new Types.ObjectId(filters.changedBy);
    if (filters.startDate || filters.endDate) {
      filter.createdAt = {};
      if (filters.startDate) filter.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) filter.createdAt.$lte = new Date(filters.endDate);
    }

    const limit = Math.min(filters.limit || 50, 100);
    return this.auditLogModel
      .find(filter)
      .populate("changedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}
