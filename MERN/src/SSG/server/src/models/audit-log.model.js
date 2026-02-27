// server/src/models/audit-log.model.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const auditLogSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'LOCK', 'UNLOCK', 'ASSIGN_ROLE', 'REVOKE_ROLE'],
    index: true
  },
  resource: {
    type: String,
    required: true, // e.g., 'User', 'Role'
  },
  resourceId: {
    type: Schema.Types.ObjectId, // The ID of the item being modified
    required: true
  },
  details: {
    type: Schema.Types.Mixed, // Store previous/new state, or specific properties changed
    default: {}
  },
  ipAddress: String,
  userAgent: String,
}, {
  timestamps: true,
});

export default mongoose.model('AuditLog', auditLogSchema);
