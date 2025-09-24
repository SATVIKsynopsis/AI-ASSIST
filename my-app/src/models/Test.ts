import mongoose from 'mongoose'

const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['multiple-choice', 'short-answer', 'essay'],
    required: true,
  },
  options: [{
    type: String,
  }],
  correctAnswer: {
    type: String,
  },
  points: {
    type: Number,
    default: 1,
  },
})

const TestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
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
  questions: [QuestionSchema],
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed'],
    default: 'active',
  },
  dueDate: {
    type: Date,
  },
}, {
  timestamps: true
})

export default mongoose.models.Test || mongoose.model('Test', TestSchema)