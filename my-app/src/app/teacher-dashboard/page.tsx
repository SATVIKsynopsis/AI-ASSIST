"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { DataStore } from "@/utils/dataStore"

interface AIAnalysis {
  id: string;
  testId: string;
  materialId: string;
  analysisDate: string;
  studentMisconceptions: any[];
  contentGuidance: any[];
  overallInsights: string[];
}

export default function TeacherDashboard() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()
  const [aiAnalyses, setAiAnalyses] = useState<AIAnalysis[]>([])
  const [loadingAnalyses, setLoadingAnalyses] = useState(true)

  useEffect(() => {
    console.log("🔍 TeacherDashboard - Auth check:", { isLoading, isAuthenticated, user: user?.email })
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        console.log("🔍 TeacherDashboard - Redirecting to login: not authenticated or no user")
        router.push("/auth/login")
        return
      }
      if (user.role !== "teacher") {
        console.log("🔍 TeacherDashboard - Redirecting to student dashboard: user is not teacher")
        router.push("/student-dashboard")
        return
      }
      console.log("🔍 TeacherDashboard - Auth check passed, staying on page")
      
      // Load AI analyses for this teacher
      loadAIAnalyses()
    }
  }, [isAuthenticated, isLoading, user, router])

  const loadAIAnalyses = async () => {
    try {
      setLoadingAnalyses(true)
      const teacherId = user?._id || user?.id
      console.log('🔍 Loading AI analyses for teacher:', teacherId)
      
      if (teacherId) {
        const response = await fetch(`/api/ai-analysis?teacherId=${teacherId}`)
        console.log('🔍 AI analyses response status:', response.status)
        
        if (response.ok) {
          const analyses = await response.json()
          console.log('🔍 AI analyses received:', analyses)
          setAiAnalyses(analyses || [])
        } else {
          console.error('🔍 Failed to load AI analyses:', response.statusText)
        }
      }
    } catch (error) {
      console.error('🔍 Failed to load AI analyses:', error)
    } finally {
      setLoadingAnalyses(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleAnalyzeSlides = () => {
    router.push("/upload")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-12 h-12 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Loading Dashboard</h2>
          <p className="text-muted-foreground">Please wait while we prepare your teaching tools...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user || user.role !== "teacher") {
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
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">AI-ASSIST</h1>
                <p className="text-sm text-muted-foreground">Educator Dashboard</p>
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
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-xl transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0 mb-12">
          <div className="bg-primary rounded-2xl p-8 text-primary-foreground relative overflow-hidden">
            <div className="relative">
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-primary-foreground/20 p-3 rounded-xl">
                  <svg
                    className="w-8 h-8 text-primary-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2 text-balance">Welcome back, {user.name}!</h2>
                  <p className="text-primary-foreground/80 text-lg text-pretty">
                    Transform your teaching with AI-powered insights and student performance analytics
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-primary-foreground/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-primary-foreground/80">AI Analysis Available</div>
                </div>
                <div className="bg-primary-foreground/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold">Real-time</div>
                  <div className="text-primary-foreground/80">Student Insights</div>
                </div>
                <div className="bg-primary-foreground/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold">Smart</div>
                  <div className="text-primary-foreground/80">Content Recommendations</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-0 mb-12">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-foreground mb-4 text-balance">Your Teaching Workflow</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Follow these simple steps to analyze your teaching materials and get actionable insights for better
              student outcomes
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Step 1: Upload Study Material */}
            <div className="group bg-card rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-border hover:border-primary/20 relative overflow-hidden flex flex-col h-full">
              <div className="p-8 relative flex flex-col h-full">
                <div className="bg-primary w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-8 h-8 text-primary-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="mb-6 flex-grow">
                  <h4 className="text-xl font-bold text-foreground mb-3">Upload Study Material</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Upload your lesson presentations, PDFs, or documents that students will study from.
                  </p>
                </div>
                <button
                  onClick={() => router.push("/teacher/upload-material")}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors duration-200 group-hover:scale-105"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>Start Upload</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8l-8-8-8 8" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>

            {/* Step 2: Create Test */}
            <div className="group bg-card rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-border hover:border-primary/20 relative overflow-hidden flex flex-col h-full">
              <div className="p-8 relative flex flex-col h-full">
                <div className="bg-accent w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                </div>
                <div className="mb-6 flex-grow">
                  <h4 className="text-xl font-bold text-foreground mb-3">Create Test</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Design comprehensive tests based on your study materials to assess student understanding.
                  </p>
                </div>
                <button
                  onClick={() => router.push("/teacher/create-test")}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3 rounded-lg font-medium transition-colors duration-200 group-hover:scale-105"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>Create Test</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </span>
                </button>
              </div>
            </div>

            {/* Step 3: Collect Test Answers */}
            <div className="group bg-card rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-border hover:border-primary/20 relative overflow-hidden flex flex-col h-full">
              <div className="p-8 relative flex flex-col h-full">
                <div className="bg-secondary w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-8 h-8 text-secondary-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <div className="mb-6 flex-grow">
                  <h4 className="text-xl font-bold text-foreground mb-3">Collect Answers</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Gather and review student test responses to prepare for comprehensive analysis.
                  </p>
                </div>
                <button
                  onClick={() => router.push("/teacher/collect-answers")}
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground px-6 py-3 rounded-lg font-medium transition-colors duration-200 group-hover:scale-105"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>View Responses</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </span>
                </button>
              </div>
            </div>

            {/* Step 4: AI Analysis */}
            <div className="group bg-card rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-border hover:border-primary/20 relative overflow-hidden flex flex-col h-full">
              <div className="p-8 relative flex flex-col h-full">
                <div className="bg-primary w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-8 h-8 text-primary-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="mb-6 flex-grow">
                  <h4 className="text-xl font-bold text-foreground mb-3">AI Analysis</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Get AI-powered insights on student performance and material improvement recommendations.
                  </p>
                </div>
                <button
                  onClick={() => router.push("/teacher/ai-analysis")}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors duration-200 group-hover:scale-105"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>Run Analysis</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-sm border border-border p-8 text-center">
            <div className="bg-accent/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-8-10h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z"
                />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-foreground mb-3">Try Demo Mode</h4>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Experience the full workflow with sample content and see how AI analysis works
            </p>
            <button
              onClick={() => router.push("/teacher/demo")}
              className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Start Demo
            </button>
          </div>
        </div>

        {/* AI Analyses Section */}
        <div className="px-4 sm:px-0 mb-8">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-foreground mb-4 text-balance">Your AI Analyses</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              View and review your completed AI analyses and insights
            </p>
          </div>
          
          {loadingAnalyses ? (
            <div className="bg-card rounded-2xl shadow-sm border border-border p-8 text-center">
              <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading AI analyses...</p>
            </div>
          ) : aiAnalyses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {aiAnalyses.map((analysis) => (
                <div key={analysis.id} className="group bg-card rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-border hover:border-primary/20 relative overflow-hidden">
                  <div className="p-8 relative">
                    <div className="bg-secondary w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-8 h-8 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-foreground mb-3">Analysis #{analysis.id.slice(-6)}</h4>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {analysis.studentMisconceptions?.length || 0} misconceptions identified
                    </p>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {analysis.overallInsights?.length || 0} insights generated
                    </p>
                    <p className="text-xs text-muted-foreground mb-6">
                      Created: {new Date(analysis.analysisDate).toLocaleDateString()}
                    </p>
                    <button 
                      onClick={() => router.push(`/teacher/ai-analysis?testId=${analysis.testId}`)}
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3 px-4 rounded-lg font-medium transition-colors duration-200 group-hover:scale-105"
                    >
                      View Analysis
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-2xl shadow-sm border border-border p-8 text-center mb-8">
              <div className="bg-secondary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-3">No AI Analyses Yet</h4>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Complete your first workflow to generate AI-powered insights about your teaching materials and student understanding.
              </p>
            </div>
          )}
        </div>

        <div className="px-4 sm:px-0">
          <h3 className="text-xl font-semibold text-foreground mb-6">What You Can Do</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
              <h4 className="font-semibold text-foreground mb-3">Identify Misconceptions</h4>
              <p className="text-muted-foreground">
                AI analyzes student responses to identify common misunderstandings and knowledge gaps.
              </p>
            </div>
            <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
              <h4 className="font-semibold text-foreground mb-3">Slide Analysis</h4>
              <p className="text-muted-foreground">
                Get feedback on slide clarity, missing examples, and areas needing visual improvements.
              </p>
            </div>
            <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
              <h4 className="font-semibold text-foreground mb-3">Improvement Suggestions</h4>
              <p className="text-muted-foreground">
                Receive actionable recommendations to enhance your teaching materials and approach.
              </p>
            </div>
            <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
              <h4 className="font-semibold text-foreground mb-3">Track Progress</h4>
              <p className="text-muted-foreground">
                Monitor how your teaching improvements impact student understanding over time.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
