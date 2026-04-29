// backend/src/models/Board.js
import mongoose from 'mongoose';

const columnSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  title: { type: String, required: true },
  color: { type: String, default: '#EEF2FF' },
  order: { type: Number, default: 0 }, // used for ordering
  settings: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { _id: false });

const boardSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, unique: true },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  columns: [columnSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  settings: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

export default mongoose.model('Board', boardSchema);