import { connectToDatabase } from "@/lib/db";
import { AuditLog } from "@/models/audit-log";
import mongoose from "mongoose";

export const auditLogService = {
  async record({
    actorId,
    action,
    entity,
    entityId,
    metadata,
    orgId,
  }: {
    actorId?:  string;
    action:    string;
    entity:    string;
    entityId?: string;
    metadata?: Record<string, unknown>;
    orgId?:    string;
  }) {
    await connectToDatabase();
    return AuditLog.create({
      actorId,
      action,
      entity,
      entityId,
      metadata,
      orgId: orgId ? new mongoose.Types.ObjectId(orgId) : undefined,
    });
  },

  async list(orgId?: string | null, limit = 50) {
    await connectToDatabase();
    const filter = orgId ? { orgId: new mongoose.Types.ObjectId(orgId) } : {};
    return AuditLog.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
  },
};
