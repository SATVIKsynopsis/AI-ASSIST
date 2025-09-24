'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '../../../../contexts/AuthContext'
import { toast } from 'sonner'

interface Question {
  id: string
  question: string
  type: 'multiple-choice' | 'short-answer' | 'essay'
  options?: string[]
  points: number
}

interface Test {
  id: string
  title: string
  description: string
  materialId: string
  questions: Question[]
  createdDate: string
  teacherId: string
}

interface TestAnswers {
  [questionId: string]: string
}

export default function TakeTestPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const testId = params.testId as string

  const [test, setTest] = useState<Test | null>(null)
  const [answers, setAnswers] = useState<TestAnswers>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(3600) // 1 hour in seconds
  const [showSubmitModal, setShowSubmitModal] = useState(false)

  useEffect(() => {
    console.log("🔍 TakeTestPage - Auth check:", { isLoading, isAuthenticated, user: user?.email })
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        console.log("🔍 TakeTestPage - Redirecting to login: not authenticated or no user")
        router.push('/auth/login')
        return
      }
      if (user.role !== 'student') {
        console.log("🔍 TakeTestPage - Redirecting to teacher dashboard: user is not student")
        router.push('/teacher-dashboard')
        return
      }
      console.log("🔍 TakeTestPage - Auth check passed, staying on page")
      
      loadTestAndCheckSubmission()
    }
  }, [isAuthenticated, isLoading, user, router])

  const loadTestAndCheckSubmission = async () => {
    try {
      // Check if student already submitted this test with specific API call
      const submissionsResponse = await fetch(`/api/test-submissions?testId=${testId}&studentId=${user?._id || user?.id}`)
      if (submissionsResponse.ok) {
        const result = await submissionsResponse.json()
        if (result.success && result.submissions && result.submissions.length > 0) {
          toast.error('You have already taken this test and cannot retake it!')
          router.push('/student-dashboard')
          return
        }
      }

      // Also check all submissions as a fallback
      const allSubmissionsResponse = await fetch('/api/test-submissions')
      if (allSubmissionsResponse.ok) {
        const result = await allSubmissionsResponse.json()
        if (result.success && result.submissions) {
          const existingSubmission = result.submissions.find(
            (sub: any) => sub.testId === testId && sub.studentId === (user?._id || user?.id)
          )

          if (existingSubmission) {
            toast.error('You have already taken this test and cannot retake it!')
            router.push('/student-dashboard')
            return
          }
        }
      }

      // Load test data
      const testsResponse = await fetch('/api/tests?studentAccess=true')
      if (testsResponse.ok) {
        const result = await testsResponse.json()
        if (result.success) {
          const foundTest = result.tests.find((t: Test) => t.id === testId)
          
          if (foundTest) {
            console.log('🔍 Debug - Found test:', foundTest)
            console.log('🔍 Debug - Test questions:', foundTest.questions)
            console.log('🔍 Debug - First question ID:', foundTest.questions[0]?.id)
            setTest(foundTest)
          } else {
            toast.error('Test not found!')
            router.push('/student-dashboard')
          }
        } else {
          toast.error('Failed to load test!')
          router.push('/student-dashboard')
        }
      } else {
        toast.error('Failed to load test!')
        router.push('/student-dashboard')
      }
    } catch (error) {
      console.error('Failed to load test:', error)
      toast.error('Failed to load test!')
      router.push('/student-dashboard')
    }
  }

  // Timer effect
  useEffect(() => {
    if (timeRemaining <= 0) {
      handleSubmitTest()
      return
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerChange = (questionId: string, answer: string) => {
    console.log('🔍 Debug - handleAnswerChange called with:', { questionId, answer })
    setAnswers(prev => {
      const newAnswers = {
        ...prev,
        [questionId]: answer
      }
      console.log('🔍 Debug - Updated answers:', newAnswers)
      return newAnswers
    })
  }

  const handleNextQuestion = () => {
    if (test && currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleSubmitTest = async () => {
    if (!test || !user) return
    
    setIsSubmitting(true)
    
    try {
      console.log('🔍 Debug - Current answers object:', answers)
      console.log('🔍 Debug - Object.entries(answers):', Object.entries(answers))
      
      // Transform answers from object to array format expected by model
      const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer
      }))
      
      console.log('🔍 Debug - Transformed answers array:', answersArray)
      
      // Create submission
      const submission = {
        testId: test.id,
        studentId: user._id || user.id,
        studentName: user.name,
        answers: answersArray,
        timeSpent: 3600 - timeRemaining
      }

      console.log('🔍 Debug - Final submission object:', JSON.stringify(submission, null, 2))

      // Save submission using MongoDB API
      const response = await fetch('/api/test-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission)
      })

      if (response.ok) {
        toast.success('Test submitted successfully!')
        router.push('/student-dashboard')
      } else {
        const error = await response.json()
        toast.error(`Failed to submit test: ${error.error}`)
      }
      
    } catch (error) {
      console.error('Submission failed:', error)
      toast.error('Failed to submit test. Please try again.')
    } finally {
      setIsSubmitting(false)
      setShowSubmitModal(false)
    }
  }

  const getAnsweredCount = () => {
    if (!test) return 0
    return test.questions.filter(q => answers[q.id]).length
  }

  const isTestComplete = () => {
    if (!test) return false
    return test.questions.every(q => answers[q.id])
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-12 h-12 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Loading Test</h2>
          <p className="text-muted-foreground">Please wait while we prepare your test...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user || user.role !== 'student') {
    return null
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-12 h-12 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Loading Test</h2>
          <p className="text-muted-foreground">Please wait while we prepare your test...</p>
        </div>
      </div>
    )
  }

  const currentQuestion = test.questions[currentQuestionIndex]
  
  console.log('🔍 Debug - Current question:', currentQuestion)
  console.log('🔍 Debug - Current question ID:', currentQuestion.id)

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
                <p className="text-sm text-muted-foreground">Taking Test</p>
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

      {/* Test Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{test.title}</h1>
              <p className="text-muted-foreground">
                Question {currentQuestionIndex + 1} of {test.questions.length}
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Progress */}
              <div className="text-sm text-muted-foreground">
                Answered: {getAnsweredCount()}/{test.questions.length}
              </div>
              
              {/* Timer */}
              <div className={`text-sm font-mono px-4 py-2 rounded-xl ${
                timeRemaining < 300 ? 'bg-red-100 text-red-800' : 'bg-primary/10 text-primary'
              }`}>
                ⏱️ {formatTime(timeRemaining)}
              </div>
              
              {/* Submit Button */}
              <button
                onClick={() => setShowSubmitModal(true)}
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-xl hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground transition-colors duration-200 font-medium"
              >
                Submit Test
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{width: `${((currentQuestionIndex + 1) / test.questions.length) * 100}%`}}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-card rounded-2xl shadow-sm border border-border p-8 mb-8">
          {/* Question */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Question {currentQuestionIndex + 1}
              </h2>
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
              </span>
            </div>
            
            <p className="text-foreground text-lg leading-relaxed mb-8">
              {currentQuestion.question}
            </p>

            {/* Answer Input */}
            <div className="space-y-4">
              {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.filter(opt => opt.trim()).map((option, index) => (
                    <label key={index} className="flex items-center p-4 border border-border rounded-xl hover:bg-secondary/50 cursor-pointer transition-colors duration-200">
                      <input
                        type="radio"
                        name={`question_${currentQuestion.id}`}
                        value={option}
                        checked={answers[currentQuestion.id] === option}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                        className="w-4 h-4 text-primary border-border focus:ring-primary"
                      />
                      <span className="ml-4 text-foreground">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'short-answer' && (
                <input
                  type="text"
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder="Enter your answer..."
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary placeholder-muted-foreground transition-all duration-200"
                />
              )}

              {currentQuestion.type === 'essay' && (
                <textarea
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder="Write your essay answer here..."
                  rows={8}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary placeholder-muted-foreground transition-all duration-200"
                />
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t border-border">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex items-center px-6 py-2 text-muted-foreground hover:text-foreground disabled:text-muted-foreground/50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <div className="text-sm text-muted-foreground">
              {answers[currentQuestion.id] ? '✓ Answered' : 'Not answered'}
            </div>

            <button
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === test.questions.length - 1}
              className="flex items-center px-6 py-2 text-primary hover:text-primary/80 disabled:text-muted-foreground/50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
            >
              Next
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Question Navigator */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Question Navigator</h3>
          <div className="grid grid-cols-10 gap-3">
            {test.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-12 h-12 rounded-xl text-sm font-medium transition-all duration-200 ${
                  index === currentQuestionIndex 
                    ? 'bg-primary text-primary-foreground scale-105' 
                    : answers[test.questions[index].id]
                    ? 'bg-green-100 text-green-800 hover:bg-green-200 hover:scale-105'
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:scale-105'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border p-8 max-w-md w-full">
            <h3 className="text-xl font-semibold text-foreground mb-4">Submit Test</h3>
            <p className="text-muted-foreground mb-6">
              {isTestComplete() 
                ? `You have answered all ${test.questions.length} questions. Are you sure you want to submit?`
                : `You have answered ${getAnsweredCount()} out of ${test.questions.length} questions. Unanswered questions will be marked as blank.`
              }
            </p>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-6 py-2 text-foreground border border-border rounded-xl hover:bg-secondary/50 transition-colors duration-200 font-medium"
              >
                Continue Test
              </button>
              <button
                onClick={handleSubmitTest}
                disabled={isSubmitting}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground transition-colors duration-200 font-medium"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Test'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}