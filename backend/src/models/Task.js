// backend/src/models/Task.js
import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    column: { type: mongoose.Schema.Types.ObjectId, ref: 'BoardColumn' }, // references column._id
    position: { type: Number, default: 0 }, // order within column
    status: { type: String, enum: ['todo', 'in-progress', 'review', 'done'], default: 'todo' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    watchers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dueDate: Date,
    labels: [String],
    attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    metadata: mongoose.Schema.Types.Mixed,
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Compound index for efficient queries by project + column + position
taskSchema.index({ project: 1, column: 1, position: 1 });

export default mongoose.model('Task', taskSchema);