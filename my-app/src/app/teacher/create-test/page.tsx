'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface StudyMaterial {
  id: string
  title: string
  description: string
  fileName: string
  uploadDate: string
  teacherId: string
}

interface Question {
  id: string
  question: string
  type: 'multiple-choice' | 'short-answer' | 'essay'
  options?: string[]
  correctAnswer?: string
  points: number
}

export default function CreateTestPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([])
  const [selectedMaterial, setSelectedMaterial] = useState<string>('')
  const [testTitle, setTestTitle] = useState('')
  const [testDescription, setTestDescription] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
    question: '',
    type: 'multiple-choice',
    options: ['', '', '', ''],
    points: 1
  })

  useEffect(() => {
    console.log("🔍 CreateTestPage - Auth check:", { isLoading, isAuthenticated, user: user?.email })
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        console.log("🔍 CreateTestPage - Redirecting to login: not authenticated or no user")
        router.push("/auth/login")
        return
      }
      if (user.role !== "teacher") {
        console.log("🔍 CreateTestPage - Redirecting to student dashboard: user is not teacher")
        router.push("/student-dashboard")
        return
      }
      console.log("🔍 CreateTestPage - Auth check passed, staying on page")
    }
  }, [isAuthenticated, isLoading, user, router])

  useEffect(() => {
    // Load study materials from MongoDB API
    const loadStudyMaterials = async () => {
      const teacherId = user?._id || user?.id
      if (teacherId) {
        try {
          const response = await fetch(`/api/study-materials?teacherId=${teacherId}`)
          if (response.ok) {
            const result = await response.json()
            if (result.success) {
              setStudyMaterials(result.materials)
            }
          }
        } catch (error) {
          console.error('Failed to load study materials:', error)
        }
      }
    }
    
    if (user) {
      loadStudyMaterials()
    }
  }, [user])

  const addQuestion = () => {
    if (!currentQuestion.question?.trim()) {
      toast.error('Please enter a question')
      return
    }

    const newQuestion: Question = {
      id: Date.now().toString(),
      question: currentQuestion.question,
      type: currentQuestion.type || 'multiple-choice',
      options: currentQuestion.type === 'multiple-choice' ? currentQuestion.options?.filter(opt => opt.trim()) : undefined,
      points: currentQuestion.points || 1
    }

    setQuestions([...questions, newQuestion])
    setCurrentQuestion({
      question: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      points: 1
    })
  }

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id))
  }

  const createTest = async () => {
    if (!testTitle.trim() || !selectedMaterial || questions.length === 0) {
      toast.error('Please fill in all required fields and add at least one question')
      return
    }

    try {
      // Store test using MongoDB API
      const newTest = {
        title: testTitle,
        description: testDescription,
        materialId: selectedMaterial,
        questions: questions,
        teacherId: user?._id || user?.id,
        status: 'active'
      }

      const response = await fetch('/api/tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTest)
      })

      if (response.ok) {
        toast.success('Test created successfully!')
        router.push('/teacher/collect-answers')
      } else {
        const error = await response.json()
        toast.error(`Failed to create test: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to create test:', error)
      toast.error('Failed to create test. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-12 h-12 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Loading Test Creator</h2>
          <p className="text-muted-foreground">Please wait while we prepare your test creation tools...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user || user.role !== 'teacher') {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-primary p-2 rounded-xl">
                <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">AI-ASSIST</h1>
                <p className="text-sm text-muted-foreground">Create Test</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="bg-primary p-2 rounded-full">
                  <svg
                    className="w-5 h-5 text-primary-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/teacher-dashboard')}
            className="flex items-center text-primary hover:text-primary/80 mb-4 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Test</h1>
          <p className="text-muted-foreground text-lg">
            Create a test based on your uploaded study materials.
          </p>
        </div>

        {/* Test Setup */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-8 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Test Information</h2>
          
          <div className="space-y-6">
            {/* Select Study Material */}
            <div>
              <label htmlFor="material" className="block text-lg font-semibold text-foreground mb-3">
                Select Study Material *
              </label>
              {studyMaterials.length > 0 ? (
                <select
                  id="material"
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                >
                  <option value="">Choose a study material...</option>
                  {studyMaterials.map(material => (
                    <option key={material.id} value={material.id}>
                      {material.title} ({material.fileName})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-center py-8 bg-secondary/20 rounded-xl">
                  <p className="text-muted-foreground mb-4 text-lg">No study materials found.</p>
                  <button
                    onClick={() => router.push('/teacher/upload-material')}
                    className="bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors duration-200 font-medium"
                  >
                    Upload Study Material First
                  </button>
                </div>
              )}
            </div>

            {/* Test Title */}
            <div>
              <label htmlFor="title" className="block text-lg font-semibold text-foreground mb-3">
                Test Title *
              </label>
              <input
                type="text"
                id="title"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="e.g., Photosynthesis Quiz"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary placeholder-muted-foreground transition-all duration-200"
              />
            </div>

            {/* Test Description */}
            <div>
              <label htmlFor="description" className="block text-lg font-semibold text-foreground mb-3">
                Test Description (Optional)
              </label>
              <textarea
                id="description"
                value={testDescription}
                onChange={(e) => setTestDescription(e.target.value)}
                placeholder="Brief description of this test..."
                rows={3}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary placeholder-muted-foreground transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Add Questions */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-8 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Add Questions</h2>
          
          <div className="space-y-6">
            {/* Question Text */}
            <div>
              <label htmlFor="question" className="block text-lg font-semibold text-foreground mb-3">
                Question *
              </label>
              <textarea
                id="question"
                value={currentQuestion.question}
                onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                placeholder="Enter your question here..."
                rows={3}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary placeholder-muted-foreground transition-all duration-200"
              />
            </div>

            {/* Question Type and Points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="type" className="block text-lg font-semibold text-foreground mb-3">
                  Question Type
                </label>
                <select
                  id="type"
                  value={currentQuestion.type}
                  onChange={(e) => setCurrentQuestion({...currentQuestion, type: e.target.value as Question['type']})}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                >
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="short-answer">Short Answer</option>
                  <option value="essay">Essay</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="points" className="block text-lg font-semibold text-foreground mb-3">
                  Points
                </label>
                <input
                  type="number"
                  id="points"
                  value={currentQuestion.points}
                  onChange={(e) => setCurrentQuestion({...currentQuestion, points: parseInt(e.target.value) || 1})}
                  min="1"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                />
              </div>
            </div>

            {/* Multiple Choice Options */}
            {currentQuestion.type === 'multiple-choice' && (
              <div>
                <label className="block text-lg font-semibold text-foreground mb-3">
                  Answer Options
                </label>
                <div className="space-y-3">
                  {currentQuestion.options?.map((option, index) => (
                    <input
                      key={index}
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(currentQuestion.options || [])]
                        newOptions[index] = e.target.value
                        setCurrentQuestion({...currentQuestion, options: newOptions})
                      }}
                      placeholder={`Option ${index + 1}`}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary placeholder-muted-foreground transition-all duration-200"
                    />
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={addQuestion}
              className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors duration-200 font-medium"
            >
              Add Question
            </button>
          </div>
        </div>

        {/* Questions List */}
        {questions.length > 0 && (
          <div className="bg-card rounded-2xl shadow-sm border border-border p-8 mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Questions ({questions.length})
            </h2>
            
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} className="border border-border rounded-xl p-6 bg-background/50">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-foreground">
                      Question {index + 1} ({question.points} point{question.points !== 1 ? 's' : ''})
                    </h3>
                    <button
                      onClick={() => removeQuestion(question.id)}
                      className="text-destructive hover:text-destructive/80 transition-colors duration-200 p-1 rounded-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  <p className="text-foreground mb-3">{question.question}</p>
                  <p className="text-sm text-muted-foreground capitalize">{question.type.replace('-', ' ')}</p>
                  
                  {question.options && question.options.filter(opt => opt.trim()).length > 0 && (
                    <div className="mt-3 p-3 bg-secondary/20 rounded-lg">
                      <p className="text-sm font-medium text-foreground mb-2">Options:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {question.options.filter(opt => opt.trim()).map((option, idx) => (
                          <li key={idx} className="flex items-center">
                            <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                            {option}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Test Button */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => router.push('/teacher-dashboard')}
            className="px-8 py-3 border border-border text-foreground rounded-xl hover:bg-secondary/50 transition-colors duration-200 font-medium"
          >
            Cancel
          </button>
          
          <button
            onClick={createTest}
            disabled={!testTitle.trim() || !selectedMaterial || questions.length === 0}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors duration-200 font-medium"
          >
            Create Test
          </button>
        </div>
      </main>
    </div>
  )
}