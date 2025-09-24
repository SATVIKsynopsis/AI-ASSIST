import mongoose from 'mongoose'

const StudyMaterialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  fileName: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  content: {
    type: String,
    default: '',
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isUpdated: {
    type: Boolean,
    default: false,
  },
  updatedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true
})

export default mongoose.models.StudyMaterial || mongoose.model('StudyMaterial', StudyMaterialSchema)