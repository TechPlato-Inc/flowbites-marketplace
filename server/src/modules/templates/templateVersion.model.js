import mongoose from 'mongoose';

const templateVersionSchema = new mongoose.Schema({
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: true,
  },
  version: {
    type: String,
    required: true,
  },
  releaseNotes: {
    type: String,
    maxlength: 2000,
  },
  changes: [{
    type: String, // e.g., "Added dark mode support", "Fixed mobile layout"
  }],
  templateFile: String,
  fileSize: Number,
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

templateVersionSchema.index({ templateId: 1, createdAt: -1 });
templateVersionSchema.index({ templateId: 1, version: 1 }, { unique: true });

export const TemplateVersion = mongoose.model('TemplateVersion', templateVersionSchema);
