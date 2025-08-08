import mongoose from 'mongoose';

const fileStructureSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['file', 'directory', 'split-file'], required: true },
  size: { type: Number, default: 0 },
  path: { type: String, required: true },
  imageUrl: { type: String },
  content: { type: String }, // Add content field for file previews
  children: [{ type: mongoose.Schema.Types.Mixed }],
  // New fields for manifest format
  hash: { type: String },
  cid: { type: String },
  byte_length: { type: Number },
  media_type: { type: String },
  piece_cid: { type: String },
  parts: [{ type: mongoose.Schema.Types.Mixed }] // For split-files
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
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  // New fields for manifest format
  manifestFile: { type: String }, // Path to manifest file in MinIO
  manifestData: { type: mongoose.Schema.Types.Mixed }, // Original manifest data
  spec: { type: String }, // @spec from manifest
  specVersion: { type: String }, // @spec_version from manifest
  manifestType: { type: String }, // @type from manifest
  version: { type: String }, // version from manifest
  openWith: { type: String }, // open_with from manifest
  license: { type: String }, // license from manifest
  projectUrl: { type: String }, // project_url from manifest
  uuid: { type: String }, // uuid from manifest
  nPieces: { type: Number }, // n_pieces from manifest
  pieces: [{ type: mongoose.Schema.Types.Mixed }] // pieces array from manifest
}, { timestamps: true });

// Index for search functionality
datasetSchema.index({ title: 'text', description: 'text', tags: 'text' });

export default mongoose.model('Dataset', datasetSchema); 