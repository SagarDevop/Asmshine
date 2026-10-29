const AuditLog = require('../models/AuditLog');

/**
 * Audit Service:
 * Records actions taken by administrators for security compliance and tracking.
 */
const logAdminAction = async ({
  req,
  action,
  resourceType,
  resourceId = '',
  details = {}
}) => {
  try {
    const actor = req?.user;
    const ipAddress =
      req?.headers['x-forwarded-for'] ||
      req?.connection?.remoteAddress ||
      req?.socket?.remoteAddress ||
      '';

    await AuditLog.create({
      actor: actor?._id || null,
      actorName: actor?.name || 'System',
      actorEmail: actor?.email || '',
      actorRole: actor?.role || 'admin',
      action,
      resourceType,
      resourceId: String(resourceId),
      details,
      ipAddress: String(ipAddress)
    });
  } catch (error) {
    // Non-blocking: Audit logging errors should not break the main transaction
    console.warn('[AuditService] Failed to record audit log:', error.message);
  }
};

module.exports = {
  logAdminAction
};
