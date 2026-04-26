import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'task_created',
        'task_updated',
        'task_completed',
        'comment_added',
        'file_uploaded',
        'meeting_created',
        'member_joined',
        'project_created',
        'channel_created',
      ],
      required: true,
    },
    action: String,
    resource: {
      type: String,
      enum: ['task', 'project', 'file', 'message', 'meeting', 'member'],
    },
    resourceId: mongoose.Schema.Types.ObjectId,
    relatedUser: mongoose.Schema.Types.ObjectId,
    details: mongoose.Schema.Types.Mixed,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: { expireAfterSeconds: 2592000 }, // 30 days TTL
    },
  },
  { timestamps: true }
);

export default mongoose.model('Activity', activitySchema);