import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'review', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    dueDate: Date,
    startDate: Date,
    completedDate: Date,
    estimatedHours: Number,
    actualHours: Number,
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    labels: [String],
    attachments: [
      {
        url: String,
        filename: String,
        uploadedBy: mongoose.Schema.Types.ObjectId,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    subtasks: [
      {
        title: String,
        completed: { type: Boolean, default: false },
        completedDate: Date,
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    watchers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    relatedTasks: [
      {
        task: mongoose.Schema.Types.ObjectId,
        type: {
          type: String,
          enum: ['blocks', 'blocked-by', 'relates-to', 'duplicate'],
        },
      },
    ],
    customFields: mongoose.Schema.Types.Mixed,
    activity: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activity',
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Task', taskSchema);