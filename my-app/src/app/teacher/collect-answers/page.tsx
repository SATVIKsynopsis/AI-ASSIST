'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface Test {
  id: string
  title: string
  description: string
  materialId: string
  createdDate: string
  teacherId: string
  status: string
}

interface TestSubmission {
  id: string
  testId: string
  studentId: string
  studentName: string
  answers: Record<string, string>
  submittedDate: string
  score?: number
}

export default function CollectAnswersPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [tests, setTests] = useState<Test[]>([])
  const [selectedTest, setSelectedTest] = useState<string>('')
  const [submissions, setSubmissions] = useState<TestSubmission[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    console.log("🔍 CollectAnswersPage - Auth check:", { isLoading, isAuthenticated, user: user?.email })
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        console.log("🔍 CollectAnswersPage - Redirecting to login: not authenticated or no user")
        router.push('/auth/login')
        return
      }
      if (user.role !== 'teacher') {
        console.log("🔍 CollectAnswersPage - Redirecting to student dashboard: user is not teacher")
        router.push('/student-dashboard')
        return
      }
      console.log("🔍 CollectAnswersPage - Auth check passed, staying on page")
      
      loadTests()
    }
  }, [isAuthenticated, isLoading, user, router])

  useEffect(() => {
    if (selectedTest) {
      loadSubmissions(selectedTest)
    } else {
      setSubmissions([])
    }
  }, [selectedTest])

  const loadTests = async () => {
    const teacherId = user?._id || user?.id
    if (teacherId) {
      try {
        const response = await fetch(`/api/tests?teacherId=${teacherId}`)
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setTests(result.tests)
          }
        }
      } catch (error) {
        console.error('Failed to load tests:', error)
      }
    }
  }

  const loadSubmissions = async (testId: string) => {
    setLoading(true)
    
    try {
      const response = await fetch(`/api/test-submissions?testId=${testId}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setSubmissions(result.submissions)
        }
      }
    } catch (error) {
      console.error('Failed to load submissions:', error)
      setSubmissions([])
    } finally {
      setLoading(false)
    }
  }

  const proceedToAnalysis = () => {
    if (!selectedTest || submissions.length === 0) {
      toast.error('Please select a test with submissions first')
      return
    }
    
    router.push(`/teacher/ai-analysis?testId=${selectedTest}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-12 h-12 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Loading Answers</h2>
          <p className="text-muted-foreground">Please wait while we collect student submissions...</p>
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">AI-ASSIST</h1>
                <p className="text-sm text-muted-foreground">Collect Answers</p>
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

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
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
          
          <h1 className="text-3xl font-bold text-foreground mb-2">Collect Test Answers</h1>
          <p className="text-muted-foreground text-lg">
            View and manage student test submissions for AI analysis.
          </p>
        </div>

        {/* Test Selection */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-8 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Select Test</h2>
          
          {tests.length > 0 ? (
            <div>
              <label htmlFor="test-select" className="block text-lg font-semibold text-foreground mb-3">
                Choose a test to view submissions:
              </label>
              <select
                id="test-select"
                value={selectedTest}
                onChange={(e) => setSelectedTest(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
              >
                <option value="">Select a test...</option>
                {tests.map(test => (
                  <option key={test.id} value={test.id}>
                    {test.title} (Created: {new Date(test.createdDate).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="text-center py-8 bg-secondary/20 rounded-xl">
              <div className="bg-secondary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">No Tests Found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create tests to start collecting student submissions for analysis.
              </p>
              <button
                onClick={() => router.push('/teacher/create-test')}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors duration-200 font-medium"
              >
                Create Your First Test
              </button>
            </div>
          )}
        </div>

        {/* Submissions */}
        {selectedTest && (
          <div className="bg-card rounded-2xl shadow-sm border border-border p-8 mb-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold text-foreground">
                Student Submissions ({submissions.length})
              </h2>
              
              {submissions.length > 0 && (
                <button
                  onClick={proceedToAnalysis}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors duration-200 font-medium flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Analyze with AI
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="loading-spinner w-12 h-12 mx-auto mb-6"></div>
                <p className="text-muted-foreground">Loading submissions...</p>
              </div>
            ) : submissions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-secondary/20">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {submissions.map((submission) => (
                      <tr key={submission.id} className="hover:bg-secondary/10 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center mr-4">
                              <span className="text-primary font-medium text-sm">
                                {submission.studentName ? submission.studentName.split(' ').map(n => n[0]).join('') : 'S'}
                              </span>
                            </div>
                            <div className="text-sm font-semibold text-foreground">
                              {submission.studentName || 'Student'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {new Date(submission.submittedDate).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {submission.score ? (
                            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                              submission.score >= 80 ? 'bg-green-100 text-green-800' :
                              submission.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {submission.score}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground/70">Not graded</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-primary hover:text-primary/80 mr-6 transition-colors duration-200">
                            View Answers
                          </button>
                          <button className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-secondary/20 rounded-xl">
                <div className="bg-secondary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">No Submissions Yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Students haven't submitted answers for this test yet.
                </p>
                <div className="text-sm text-muted-foreground">
                  Share the test with students and wait for submissions to analyze.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 rounded-2xl p-8 border border-blue-200">
          <h3 className="text-xl font-semibold text-blue-900 mb-4">📋 How it Works</h3>
          <ol className="space-y-3 text-blue-800">
            <li className="flex items-start">
              <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">1</span>
              <span>Select a test from the dropdown above</span>
            </li>
            <li className="flex items-start">
              <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">2</span>
              <span>Review student submissions and scores</span>
            </li>
            <li className="flex items-start">
              <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">3</span>
              <span>Click "Analyze with AI" to compare answers with study material</span>
            </li>
            <li className="flex items-start">
              <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">4</span>
              <span>Get insights on student misconceptions and material improvements</span>
            </li>
          </ol>
        </div>
      </main>
    </div>
  )
}