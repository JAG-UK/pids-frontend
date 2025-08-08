import mongoose from 'mongoose';

const fileStructureSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['file', 'directory'], required: true },
  size: { type: Number, default: 0 },
  path: { type: String, required: true },
  imageUrl: { type: String },
  content: { type: String }, // Add content field for file previews
  children: [{ type: mongoose.Schema.Types.Mixed }]
}, { timestamps: true });

const datasetSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  format: { type: String, required: true },
  size: { type: Number, required: true },
  tags: [{ type: String }],
  dateCreated: { type: Date, default: Date.now },
  dateUpdated: { type: Date, default: Date.now },
  fileStructure: [fileStructureSchema],
  isPublic: { type: Boolean, default: true },
  createdBy: { type: String, default: 'admin' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

// Index for search functionality
datasetSchema.index({ title: 'text', description: 'text', tags: 'text' });

export default mongoose.model('Dataset', datasetSchema); 