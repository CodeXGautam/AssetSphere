import { connectToDatabase } from "@/lib/db";
import { AuditLog } from "@/models/audit-log";

export const auditLogService = {
  async record({
    actorId,
    action,
    entity,
    entityId,
    metadata,
  }: {
    actorId?: string;
    action: string;
    entity: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
  }) {
    await connectToDatabase();
    return AuditLog.create({
      actorId,
      action,
      entity,
      entityId,
      metadata,
    });
  },

  async list(limit = 50) {
    await connectToDatabase();
    return AuditLog.find().sort({ createdAt: -1 }).limit(limit).lean();
  },
};
