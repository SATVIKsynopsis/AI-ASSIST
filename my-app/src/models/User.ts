import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['teacher', 'student'],
    required: true,
  },
  // Teacher-specific fields
  institution: {
    type: String,
    required: false
  },
  subject: {
    type: String,
    required: false
  },
  // Student-specific fields
  grade: {
    type: String,
    required: false
  },
  studentId: {
    type: String,
    required: false
  },
}, {
  timestamps: true
})

export default mongoose.models.User || mongoose.model('User', UserSchema)