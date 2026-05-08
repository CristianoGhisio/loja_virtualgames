import { prisma } from './prisma';

interface AuditLogParams {
  action: string;
  module: string;
  entity: string;
  entityId: string;
  oldValue?: unknown;
  newValue?: unknown;
  userId?: string;
  ip?: string;
}

export async function createAuditLog({
  action,
  module,
  entity,
  entityId,
  oldValue,
  newValue,
  userId,
  ip
}: AuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        module,
        entity,
        entityId,
        oldValue: oldValue ? JSON.stringify(oldValue) : null,
        newValue: newValue ? JSON.stringify(newValue) : null,
        userId,
        ip,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}
