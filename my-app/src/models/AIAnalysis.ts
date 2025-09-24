import mongoose from 'mongoose'

const StudentMisconceptionSchema = new mongoose.Schema({
  concept: String,
  misconception: String,
  studentsAffected: [String],
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
})

const ContentGuidanceSchema = new mongoose.Schema({
  pageNumber: Number,
  section: String,
  currentContent: String,
  issues: [String],
  specificImprovements: [String],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
})

const AIAnalysisSchema = new mongoose.Schema({
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true,
  },
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyMaterial',
    required: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  studentMisconceptions: [StudentMisconceptionSchema],
  contentGuidance: [ContentGuidanceSchema],
  overallInsights: [String],
  recommendedActions: [String],
  analysisDate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true
})

export default mongoose.models.AIAnalysis || mongoose.model('AIAnalysis', AIAnalysisSchema)