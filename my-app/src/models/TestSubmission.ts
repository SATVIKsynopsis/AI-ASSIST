import mongoose from 'mongoose'

const TestSubmissionSchema = new mongoose.Schema({
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
  }],
  score: {
    type: Number,
    default: 0,
  },
  maxScore: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['submitted', 'graded', 'pending'],
    default: 'submitted',
  },
}, {
  timestamps: true
})

export default mongoose.models.TestSubmission || mongoose.model('TestSubmission', TestSubmissionSchema)