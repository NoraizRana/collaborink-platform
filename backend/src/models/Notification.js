import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
    },
    type: {
      type: String,
      enum: [
        'task_assigned',
        'task_mentioned',
        'message_mention',
        'file_shared',
        'meeting_invite',
        'comment_added',
        'task_completed',
        'team_invite',
      ],
      required: true,
    },
    title: String,
    message: String,
    link: String,
    resourceId: mongoose.Schema.Types.ObjectId,
    resourceType: String,
    isRead: { type: Boolean, default: false },
    readAt: Date,
    actionButtons: [
      {
        label: String,
        action: String,
        actionId: String,
      },
    ],
    channel: {
      type: String,
      enum: ['in-app', 'email', 'push'],
      default: 'in-app',
    },
    sent: { type: Boolean, default: false },
    sentAt: Date,
    createdAt: {
      type: Date,
      default: Date.now,
      index: { expireAfterSeconds: 2592000 }, // 30 days TTL
    },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);