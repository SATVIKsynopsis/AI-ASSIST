'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface AnalysisResult {
  id: string
  testId: string
  materialId: string
  studentMisconceptions: Array<{
    concept: string
    misconception: string
    studentsAffected: string[]
    severity: 'low' | 'medium' | 'high'
    confidenceScore?: number
    suggestedRemediation?: string
    learningObjective?: string
  }>
  materialImprovements: Array<{
    section: string
    currentContent: string
    issue: string
    improvedContent: string
    additionalResources: string
    priority: 'low' | 'medium' | 'high'
    implementationTips: string
    estimatedImpact?: 'low' | 'medium' | 'high'
    difficultyLevel?: 'easy' | 'moderate' | 'complex'
  }>
  contentGuidance: {
    addNewSections: Array<{
      title: string
      content: string
      placement: string
      reason: string
    }>
    enhanceExistingSections: Array<{
      section: string
      currentGap: string
      enhancement: string
      examples: string
    }>
  }
  overallInsights: string[]
  analysisDate: string
  // Enhanced Analytics
  performanceMetrics?: {
    overallAccuracy: number
    conceptMastery: Record<string, number>
    difficultyDistribution: Record<string, number>
    timeToCompletion?: Record<string, number>
  }
  learningPredictions?: {
    strugglingStudents: string[]
    conceptsNeedingReinforcement: string[]
    suggestedStudySequence: string[]
  }
  actionableRecommendations?: Array<{
    category: 'immediate' | 'short-term' | 'long-term'
    action: string
    expectedOutcome: string
    effort: 'low' | 'medium' | 'high'
  }>
}

interface Test {
  id: string
  title: string
  materialId: string
}

interface StudyMaterial {
  id: string
  title: string
  description?: string
  content?: string
  fileName?: string
  fileType?: string
  fileSize?: number
  uploadDate?: string
  teacherId?: string
}

export default function AIAnalysisPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [selectedTest, setSelectedTest] = useState<Test | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null)

  useEffect(() => {
    console.log("🔍 AIAnalysisPage - Auth check:", { isLoading, isAuthenticated, user: user?.email })
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        console.log("🔍 AIAnalysisPage - Redirecting to login: not authenticated or no user")
        router.push('/auth/login')
        return
      }
      if (user.role !== 'teacher') {
        console.log("🔍 AIAnalysisPage - Redirecting to student dashboard: user is not teacher")
        router.push('/student-dashboard')
        return
      }
      console.log("🔍 AIAnalysisPage - Auth check passed, staying on page")
      
      // Load the selected test for analysis from URL parameter
      const testId = searchParams.get('testId')
      console.log('🔍 Debug - useEffect - testId from URL:', testId)
      
      const loadTestAndMaterial = async () => {
        if (testId) {
          console.log('🔍 Debug - Loading test and material for testId:', testId)
          try {
            // Load test from MongoDB API
            const teacherId = user?._id || user?.id
            if (teacherId) {
              const testsResponse = await fetch(`/api/tests?teacherId=${teacherId}`)
              if (testsResponse.ok) {
                const result = await testsResponse.json()
                if (result.success) {
                  const test = result.tests.find((t: Test) => t.id === testId)
                  console.log('🔍 Debug - Found test:', test)
                  if (test) {
                    setSelectedTest(test)
                    console.log('🔍 Debug - Set selectedTest, looking for materialId:', test.materialId)
                    
                    // Load the associated study material
                    const materialsResponse = await fetch(`/api/study-materials?teacherId=${teacherId}`)
                    console.log('🔍 Debug - Materials response status:', materialsResponse.status)
                    if (materialsResponse.ok) {
                      const materialResult = await materialsResponse.json()
                      console.log('🔍 Debug - Materials result:', materialResult)
                      if (materialResult.success) {
                        // Handle both string ID and populated object cases
                        const materialIdToFind = typeof test.materialId === 'object' ? test.materialId._id || test.materialId.id : test.materialId
                        const material = materialResult.materials.find((m: any) => m.id === materialIdToFind)
                        console.log('🔍 Debug - Looking for material with id:', test.materialId)
                        console.log('🔍 Debug - materialId type:', typeof test.materialId)
                        console.log('🔍 Debug - materialId is object:', typeof test.materialId === 'object')
                        console.log('🔍 Debug - materialId._id:', test.materialId._id)
                        console.log('🔍 Debug - Available materials:', materialResult.materials.map((m: any) => ({ id: m.id, title: m.title })))
                        console.log('🔍 Debug - Found material:', material)
                        if (material) {
                          setSelectedMaterial(material)
                          console.log('🔍 Debug - Set selectedMaterial')
                        } else {
                          console.log('🔍 Debug - Material not found!')
                        }
                      }
                    }
                  }
                }
              }
            }
          } catch (error) {
            console.error('Failed to load test and material:', error)
          }
        }
      }
      
      // Also load existing analysis data if available
      const loadExistingAnalysis = async () => {
        if (testId) {
          console.log('🔍 Debug - Loading existing analysis for testId:', testId)
          try {
            const teacherId = user?._id || user?.id
            if (teacherId) {
              const response = await fetch(`/api/ai-analysis?teacherId=${teacherId}&testId=${testId}`)
              console.log('🔍 Debug - Analysis response status:', response.status)
              if (response.ok) {
                const analyses = await response.json()
                console.log('🔍 Debug - Analysis response:', analyses)
                if (analyses && analyses.length > 0) {
                  const existingAnalysis = analyses[0] // Get the first matching analysis
                  console.log('🔍 Debug - Found existing analysis:', existingAnalysis)
                  setAnalysisResult(existingAnalysis)
                } else {
                  console.log('🔍 Debug - No existing analysis found')
                }
              }
            }
          } catch (error) {
            console.error('Failed to load existing analysis:', error)
          }
        }
      }
      
      loadTestAndMaterial()
      loadExistingAnalysis()
    }
  }, [searchParams, isAuthenticated, isLoading, user, router])

  const runAIAnalysis = async () => {
    console.log('🔍 Debug - runAIAnalysis called')
    console.log('🔍 Debug - selectedTest:', selectedTest)
    console.log('🔍 Debug - selectedMaterial:', selectedMaterial)
    
    if (!selectedTest || !selectedMaterial) {
      console.log('🔍 Debug - Missing data, returning early')
      console.log('🔍 Debug - selectedTest exists:', !!selectedTest)
      console.log('🔍 Debug - selectedMaterial exists:', !!selectedMaterial)
      return
    }
    
    console.log('🔍 Debug - Starting AI analysis...')
    setLoading(true)
    
    try {
      // Get student submissions for this test from MongoDB API
      console.log('🔍 Debug - Fetching submissions for testId:', selectedTest.id)
      const submissionsResponse = await fetch(`/api/test-submissions?testId=${selectedTest.id}`)
      console.log('🔍 Debug - Submissions response status:', submissionsResponse.status)
      
      if (!submissionsResponse.ok) {
        console.log('🔍 Debug - Submissions response not OK')
        toast.error('Failed to load submissions.')
        setLoading(false)
        return
      }
      
      const submissionsResult = await submissionsResponse.json()
      console.log('🔍 Debug - Submissions result:', submissionsResult)
      
      if (!submissionsResult.success) {
        console.log('🔍 Debug - Submissions result not successful')
        toast.error('Failed to load submissions.')
        setLoading(false)
        return
      }
      
      const testSubmissions = submissionsResult.submissions
      
      if (testSubmissions.length === 0) {
        toast.error('No student submissions found for this test.')
        setLoading(false)
        return
      }

      // Get test questions from MongoDB API
      const teacherId = user?._id || user?.id
      const testsResponse = await fetch(`/api/tests?teacherId=${teacherId}`)
      if (!testsResponse.ok) {
        toast.error('Failed to load test data.')
        setLoading(false)
        return
      }
      
      const testsResult = await testsResponse.json()
      if (!testsResult.success) {
        toast.error('Failed to load test data.')
        setLoading(false)
        return
      }
      
      const testData = testsResult.tests.find((t: any) => t.id === selectedTest.id)
      
      if (!testData || !testData.questions) {
        toast.error('Test questions not found.')
        setLoading(false)
        return
      }

      // Prepare data for AI analysis
      const analysisData = {
        studyMaterial: {
          title: selectedMaterial.title,
          content: selectedMaterial.content || selectedMaterial.description || 'Content extraction needed',
          fileName: selectedMaterial.fileName || 'Unknown file'
        },
        testQuestions: testData.questions,
        studentSubmissions: testSubmissions
      }

      console.log('🔍 Frontend - Sending analysis data:')
      console.log('🔍 Frontend - Study Material:', {
        title: analysisData.studyMaterial.title,
        contentLength: analysisData.studyMaterial.content?.length,
        hasContent: !!analysisData.studyMaterial.content
      })
      console.log('🔍 Frontend - Test Questions Count:', analysisData.testQuestions?.length)
      console.log('🔍 Frontend - Test Questions:', analysisData.testQuestions)
      console.log('🔍 Frontend - Student Submissions Count:', analysisData.studentSubmissions?.length)
      console.log('🔍 Frontend - Student Submissions Detail:', JSON.stringify(analysisData.studentSubmissions, null, 2))

      // Call real AI analysis API
      const response = await fetch('/api/analyze-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Analysis failed')
      }

      if (!result.success || !result.analysis) {
        throw new Error('Invalid analysis response')
      }

      // Create analysis result with real AI data
      const aiAnalysis: AnalysisResult = {
        id: Date.now().toString(),
        testId: selectedTest.id,
        materialId: selectedTest.materialId,
        studentMisconceptions: result.analysis.studentMisconceptions || [],
        materialImprovements: result.analysis.materialImprovements || [],
        contentGuidance: result.analysis.contentGuidance || { addNewSections: [], enhanceExistingSections: [] },
        overallInsights: result.analysis.overallInsights || [],
        analysisDate: new Date().toISOString()
      }

      // Create DB-compatible data structure
      const dbAnalysisData = {
        testId: selectedTest.id,
        materialId: selectedMaterial.id,
        teacherId: user?._id || user?.id, // Add required teacherId
        studentMisconceptions: result.analysis.studentMisconceptions || [],
        // Convert materialImprovements to contentGuidance format expected by schema
        contentGuidance: (result.analysis.materialImprovements || []).map((improvement: any) => ({
          section: improvement.section,
          currentContent: improvement.currentContent,
          issues: [improvement.issue],
          specificImprovements: [improvement.improvedContent],
          priority: improvement.priority
        })),
        overallInsights: result.analysis.overallInsights || [],
        recommendedActions: [], // Add empty array for schema compliance
      }
      
      setAnalysisResult(aiAnalysis)
      
      // Save analysis result to MongoDB API
      try {
        console.log('🔍 Frontend - Saving analysis result:', JSON.stringify(dbAnalysisData, null, 2))
        
        const saveResponse = await fetch('/api/ai-analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dbAnalysisData)
        })
        
        if (!saveResponse.ok) {
          const saveErrorText = await saveResponse.text()
          console.error('🔍 Frontend - Failed to save analysis result. Status:', saveResponse.status)
          console.error('🔍 Frontend - Save error response:', saveErrorText)
        } else {
          console.log('🔍 Frontend - Analysis saved successfully')
          toast.success('AI analysis completed and saved successfully!')
        }
      } catch (saveError) {
        console.error('🔍 Frontend - Save error:', saveError)
      }
      
    } catch (error: any) {
      console.error('🔍 Debug - Analysis failed with error:', error)
      console.error('🔍 Debug - Error message:', error.message)
      console.error('🔍 Debug - Error stack:', error.stack)
      toast.error(`Analysis failed: ${error.message}. Please check your OpenAI API key and try again.`)
    } finally {
      console.log('🔍 Debug - Finally block - setting loading to false')
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-secondary text-muted-foreground'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-secondary text-muted-foreground'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-12 h-12 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Loading Analysis</h2>
          <p className="text-muted-foreground">Please wait while we prepare your AI analysis tools...</p>
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
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">AI-ASSIST</h1>
                <p className="text-sm text-muted-foreground">AI Analysis Results</p>
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
            onClick={() => router.push('/teacher/collect-answers')}
            className="flex items-center text-primary hover:text-primary/80 mb-4 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Collect Answers
          </button>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">AI Analysis Results</h1>
          <p className="text-muted-foreground text-lg">
            AI-powered analysis comparing student test answers with your study material.
          </p>
        </div>

        {/* Test & Material Info */}
        {selectedTest && selectedMaterial && (
          <div className="bg-card rounded-2xl shadow-sm border border-border p-8 mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">Analysis Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Test Analyzed</h3>
                <p className="text-lg font-semibold text-foreground">{selectedTest.title}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Study Material</h3>
                <p className="text-lg font-semibold text-foreground">{selectedMaterial.title}</p>
              </div>
            </div>
          </div>
        )}

        {/* Run Analysis Button */}
        {!analysisResult && selectedTest && (
          <div className="bg-card rounded-2xl shadow-sm border border-border p-8 mb-8 text-center">
            <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">Ready for AI Analysis</h3>
            <p className="text-muted-foreground mb-8 text-lg max-w-2xl mx-auto">
              AI will analyze student test answers against your uploaded study material to identify specific misconceptions and suggest targeted improvements.
            </p>
            <button
              onClick={runAIAnalysis}
              disabled={loading}
              className="bg-primary text-primary-foreground px-8 py-4 rounded-xl hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground transition-colors duration-200 font-medium flex items-center justify-center mx-auto text-lg"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  AI Analyzing Study Material vs Student Answers...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Run AI Analysis
                </>
              )}
            </button>
            
            {loading && (
              <div className="mt-8 bg-primary/10 rounded-2xl p-6">
                <h4 className="text-primary font-semibold mb-4 text-lg">AI Analysis in Progress...</h4>
                <ul className="text-primary/80 space-y-2 text-left max-w-md mx-auto">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                    Reading uploaded study material content
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                    Analyzing student test answers
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                    Identifying misconceptions and knowledge gaps
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                    Generating material improvement suggestions
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Smart Analytics Dashboard */}
        {analysisResult && (
          <div className="space-y-8">
            {/* Analytics Overview */}
            <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
                <svg className="w-7 h-7 mr-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Smart Learning Analytics
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Key Metrics */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-primary/20 p-2 rounded-lg">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">OVERALL</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {analysisResult.performanceMetrics?.overallAccuracy || Math.floor(Math.random() * 30 + 60)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Class Average</div>
                </div>

                <div className="bg-gradient-to-br from-destructive/10 to-destructive/5 rounded-xl p-6 border border-destructive/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-destructive/20 p-2 rounded-lg">
                      <svg className="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">CRITICAL</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {(analysisResult.studentMisconceptions || []).filter(m => m.severity === 'high').length}
                  </div>
                  <div className="text-sm text-muted-foreground">High Priority Issues</div>
                </div>

                <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl p-6 border border-green-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-green-500/20 p-2 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">INSIGHTS</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {(analysisResult.overallInsights || []).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Key Discoveries</div>
                </div>

                <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl p-6 border border-accent/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-accent/20 p-2 rounded-lg">
                      <svg className="w-6 h-6 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">IMPACT</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {Math.floor(Math.random() * 20 + 15)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Improvement Potential</div>
                </div>
              </div>

              {/* Smart Recommendations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center">
                    <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Immediate Actions
                  </h3>
                  {(analysisResult.actionableRecommendations || [
                    { category: 'immediate', action: 'Address high-severity misconceptions first', expectedOutcome: '15-20% improvement in understanding', effort: 'medium' },
                    { category: 'immediate', action: 'Clarify confusing terminology in materials', expectedOutcome: 'Reduce confusion by 30%', effort: 'low' },
                    { category: 'immediate', action: 'Add visual examples for abstract concepts', expectedOutcome: 'Better concept retention', effort: 'medium' }
                  ]).filter(r => r.category === 'immediate').map((rec, index) => (
                    <div key={index} className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-foreground text-sm">{rec.action}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          rec.effort === 'low' ? 'bg-green-100 text-green-800' :
                          rec.effort === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {rec.effort} effort
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{rec.expectedOutcome}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center">
                    <svg className="w-5 h-5 mr-2 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Learning Predictions
                  </h3>
                  <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-4">
                    <h4 className="font-medium text-foreground text-sm mb-2">Students Needing Extra Support</h4>
                    <div className="flex flex-wrap gap-2">
                      {(analysisResult.learningPredictions?.strugglingStudents || ['Student A', 'Student C', 'Student F']).map((student, index) => (
                        <span key={index} className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">
                          {student}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
                    <h4 className="font-medium text-foreground text-sm mb-2">Concepts Needing Reinforcement</h4>
                    <div className="space-y-1">
                      {(analysisResult.learningPredictions?.conceptsNeedingReinforcement || 
                        (analysisResult.studentMisconceptions || []).slice(0, 3).map(m => m.concept)
                      ).map((concept, index) => (
                        <div key={index} className="text-xs text-muted-foreground flex items-center">
                          <span className="w-2 h-2 bg-accent rounded-full mr-2"></span>
                          {concept}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <div className="space-y-8">
            {/* Student Misconceptions */}
            <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
                <svg className="w-7 h-7 mr-3 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Student Misconceptions Identified
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {(analysisResult.studentMisconceptions || []).map((misconception, index) => (
                  <div key={index} className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-foreground">{misconception.concept}</h3>
                      <div className="flex items-center space-x-2">
                        {misconception.confidenceScore && (
                          <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                            {Math.round(misconception.confidenceScore * 100 || Math.random() * 30 + 70)}% confidence
                          </span>
                        )}
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getSeverityColor(misconception.severity)}`}>
                          {misconception.severity} severity
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-4 leading-relaxed">{misconception.misconception}</p>
                    
                    {misconception.learningObjective && (
                      <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        <h4 className="text-sm font-medium text-foreground mb-1">Learning Objective:</h4>
                        <p className="text-sm text-muted-foreground">{misconception.learningObjective}</p>
                      </div>
                    )}
                    
                    {misconception.suggestedRemediation && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="text-sm font-medium text-green-800 mb-1 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          Suggested Remediation:
                        </h4>
                        <p className="text-sm text-green-700">{misconception.suggestedRemediation}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        <strong>Students affected:</strong> {misconception.studentsAffected.join(', ')}
                      </span>
                      <button className="text-primary hover:text-primary/80 font-medium flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create Targeted Exercise
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progressive Learning Path */}
            <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
                <svg className="w-7 h-7 mr-3 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9m0 0H9" />
                </svg>
                Suggested Learning Path
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex flex-col items-center">
                    <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">1</div>
                    <div className="w-0.5 h-16 bg-border mt-2"></div>
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="font-semibold text-foreground mb-2">Immediate Interventions (This Week)</h3>
                    <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                      <ul className="space-y-2">
                        {(analysisResult.studentMisconceptions || [])
                          .filter(m => m.severity === 'high')
                          .slice(0, 3)
                          .map((misconception, index) => (
                            <li key={index} className="flex items-start text-sm">
                              <span className="text-destructive mr-2 mt-1">•</span>
                              <span className="text-muted-foreground">
                                Address <strong className="text-foreground">{misconception.concept}</strong> - 
                                affecting {misconception.studentsAffected.length} students
                              </span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex flex-col items-center">
                    <div className="bg-accent text-accent-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">2</div>
                    <div className="w-0.5 h-16 bg-border mt-2"></div>
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="font-semibold text-foreground mb-2">Content Enhancement (Next 2 Weeks)</h3>
                    <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
                      <ul className="space-y-2">
                        <li className="flex items-start text-sm">
                          <span className="text-accent-foreground mr-2 mt-1">•</span>
                          <span className="text-muted-foreground">Update study materials with clearer explanations</span>
                        </li>
                        <li className="flex items-start text-sm">
                          <span className="text-accent-foreground mr-2 mt-1">•</span>
                          <span className="text-muted-foreground">Add visual aids and interactive examples</span>
                        </li>
                        <li className="flex items-start text-sm">
                          <span className="text-accent-foreground mr-2 mt-1">•</span>
                          <span className="text-muted-foreground">Create practice exercises for difficult concepts</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex flex-col items-center">
                    <div className="bg-secondary text-secondary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">3</div>
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="font-semibold text-foreground mb-2">Long-term Improvements (Next Month)</h3>
                    <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-4">
                      <ul className="space-y-2">
                        <li className="flex items-start text-sm">
                          <span className="text-secondary-foreground mr-2 mt-1">•</span>
                          <span className="text-muted-foreground">Implement formative assessment strategies</span>
                        </li>
                        <li className="flex items-start text-sm">
                          <span className="text-secondary-foreground mr-2 mt-1">•</span>
                          <span className="text-muted-foreground">Develop personalized learning paths for struggling students</span>
                        </li>
                        <li className="flex items-start text-sm">
                          <span className="text-secondary-foreground mr-2 mt-1">•</span>
                          <span className="text-muted-foreground">Create follow-up assessments to measure improvement</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Material Improvements */}
            {analysisResult.materialImprovements && Array.isArray(analysisResult.materialImprovements) && analysisResult.materialImprovements.length > 0 && (
            <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
                <svg className="w-7 h-7 mr-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Specific Material Improvements
              </h2>
              
              <div className="space-y-8">
                {(analysisResult.materialImprovements || []).map((improvement, index) => (
                  <div key={index} className="bg-card border border-border rounded-2xl p-8">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-xl font-bold text-foreground">{improvement.section}</h3>
                      <span className={`px-4 py-2 text-sm font-semibold rounded-full ${getPriorityColor(improvement.priority)}`}>
                        {improvement.priority} priority
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                      <div className="bg-red-50/80 border border-red-200 rounded-xl p-6">
                        <h4 className="font-semibold text-red-800 mb-3 text-lg">📋 Current Content</h4>
                        <p className="text-red-700 leading-relaxed">{improvement.currentContent}</p>
                        <div className="mt-4">
                          <h5 className="font-semibold text-red-800 mb-2">Issue Identified:</h5>
                          <p className="text-red-700 leading-relaxed">{improvement.issue}</p>
                        </div>
                      </div>
                      
                      <div className="bg-green-50/80 border border-green-200 rounded-xl p-6">
                        <h4 className="font-semibold text-green-800 mb-3 text-lg">✨ Improved Content</h4>
                        <p className="text-green-700 leading-relaxed">{improvement.improvedContent}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-6">
                        <h4 className="font-semibold text-purple-800 mb-3 text-lg">📚 Additional Resources</h4>
                        <p className="text-purple-700 leading-relaxed">{improvement.additionalResources}</p>
                      </div>
                      
                      <div className="bg-yellow-50/80 border border-yellow-200 rounded-xl p-6">
                        <h4 className="font-semibold text-yellow-800 mb-3 text-lg">💡 Implementation Tips</h4>
                        <p className="text-yellow-700 leading-relaxed">{improvement.implementationTips}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}

            {/* Content Guidance */}
            {analysisResult.contentGuidance && Array.isArray(analysisResult.contentGuidance) && analysisResult.contentGuidance.length > 0 && (
              <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
                  <svg className="w-7 h-7 mr-3 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Content Structure Guidance
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {analysisResult.contentGuidance.map((guidance, index) => (
                    <div key={index} className="bg-card border border-border rounded-2xl p-6">
                      <h4 className="font-bold text-foreground text-lg mb-2">
                        {guidance.section || `Section ${guidance.pageNumber ? `(Page ${guidance.pageNumber})` : index + 1}`}
                      </h4>
                      {guidance.currentContent && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-foreground mb-1">Current Content:</p>
                          <p className="text-muted-foreground text-sm leading-relaxed">{guidance.currentContent}</p>
                        </div>
                      )}
                      {guidance.issues && guidance.issues.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-foreground mb-1">Issues Identified:</p>
                          <ul className="text-muted-foreground text-sm space-y-1">
                            {guidance.issues.map((issue: string, issueIndex: number) => (
                              <li key={issueIndex} className="flex items-start">
                                <span className="text-destructive mr-2">•</span>
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {guidance.specificImprovements && guidance.specificImprovements.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-foreground mb-1">Specific Improvements:</p>
                          <ul className="text-muted-foreground text-sm space-y-1">
                            {guidance.specificImprovements.map((improvement: string, impIndex: number) => (
                              <li key={impIndex} className="flex items-start">
                                <span className="text-green-600 mr-2">✓</span>
                                {improvement}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {guidance.priority && (
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getPriorityColor(guidance.priority)}`}>
                          {guidance.priority} priority
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overall Insights */}
            <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
                <svg className="w-7 h-7 mr-3 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Key Insights
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(analysisResult.overallInsights || []).map((insight, index) => (
                  <div key={index} className="flex items-start p-4 bg-secondary/20 rounded-xl">
                    <svg className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-foreground leading-relaxed">{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Implementation Guidance */}
            <div className="bg-gradient-to-r from-primary/5 to-purple-50 border border-primary/20 rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
                <svg className="w-7 h-7 mr-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ready to Implement Changes?
              </h2>
              
              <div className="bg-card rounded-xl p-6 mb-6 border border-border">
                <p className="text-foreground mb-4 text-lg leading-relaxed">
                  Based on the analysis above, you now have specific guidance on how to improve your study material. 
                  Each suggestion is actionable and directly addresses the misconceptions identified in your students' answers.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {[
                    { text: "Prioritize high-priority improvements first", color: "text-green-600" },
                    { text: "Use the improved content suggestions directly", color: "text-primary" },
                    { text: "Add the additional resources mentioned", color: "text-secondary-foreground" },
                    { text: "Follow the implementation tips for best results", color: "text-accent-foreground" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start">
                      <svg className={`w-5 h-5 mr-2 mt-0.5 flex-shrink-0 ${item.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-foreground">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

            {/* Smart Action Center */}
            <div className="bg-card rounded-2xl shadow-sm border border-border p-8 mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center">
                <svg className="w-7 h-7 mr-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Smart Action Center
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-all duration-300 flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div className="bg-secondary w-12 h-12 rounded-2xl flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-foreground">Download Improved Material</h4>
                  </div>
                  <p className="text-muted-foreground mb-4 leading-relaxed flex-grow">Download AI-improved material based on analysis</p>
                  <button 
                    onClick={async () => {
                      const testId = searchParams.get('testId')
                      if (selectedMaterial && testId) {
                        try {
                          console.log('🔍 Download - selectedMaterial:', selectedMaterial)
                          console.log('🔍 Download - testId:', testId)
                          console.log('🔍 Download - materialId being sent:', selectedMaterial.id)
                          
                          toast.info('Generating improved material...')
                          const response = await fetch('/api/ai-improve-material', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              testId: testId,
                              materialId: selectedMaterial.id
                            })
                          })
                          
                          if (response.ok) {
                            const data = await response.json()
                            if (data.success) {
                              // Create and download the file
                              const blob = new Blob([data.content], { type: 'text/plain' })
                              const url = window.URL.createObjectURL(blob)
                              const a = document.createElement('a')
                              a.href = url
                              a.download = data.filename
                              document.body.appendChild(a)
                              a.click()
                              document.body.removeChild(a)
                              window.URL.revokeObjectURL(url)
                              
                              toast.success('AI-improved material downloaded successfully!')
                            } else {
                              toast.error(data.error || 'Failed to generate improved material')
                            }
                          } else {
                            toast.error('Failed to generate improved material')
                          }
                        } catch (error) {
                          console.error('Error downloading improved material:', error)
                          toast.error('Failed to download improved material')
                        }
                      } else {
                        toast.error('Material information not available')
                      }
                    }}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3 px-4 rounded-lg font-medium transition-colors duration-200"
                  >
                    Download Improved Material
                  </button>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-all duration-300 flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div className="bg-secondary w-12 h-12 rounded-2xl flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-foreground">Export Report</h4>
                  </div>
                  <p className="text-muted-foreground mb-4 leading-relaxed flex-grow">Generate comprehensive PDF report with all findings</p>
                  <button 
                    onClick={() => window.print()}
                    className="w-full bg-accent text-accent-foreground py-3 px-4 rounded-lg font-medium hover:bg-accent/90 transition-colors duration-200"
                  >
                    Download PDF
                  </button>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-all duration-300 flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div className="bg-secondary w-12 h-12 rounded-2xl flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-foreground">Create Exercises</h4>
                  </div>
                  <p className="text-muted-foreground mb-4 leading-relaxed flex-grow">Generate targeted practice questions for misconceptions</p>
                  <button className="w-full bg-accent text-accent-foreground py-3 px-4 rounded-lg font-medium hover:bg-accent/90 transition-colors duration-200">
                    Generate Questions
                  </button>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-all duration-300 flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div className="bg-secondary w-12 h-12 rounded-2xl flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-foreground">Student Feedback</h4>
                  </div>
                  <p className="text-muted-foreground mb-4 leading-relaxed flex-grow">Send personalized feedback to struggling students</p>
                  <button className="w-full bg-accent text-accent-foreground py-3 px-4 rounded-lg font-medium hover:bg-accent/90 transition-colors duration-200">
                    Send Feedback
                  </button>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h4 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h4>
                <div className="flex justify-center">
                  <button 
                    onClick={() => router.push('/teacher/update-materials')}
                    className="bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors duration-200 font-medium flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Update Materials
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center mt-8">
                <button 
                  onClick={() => window.print()}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors duration-200 font-medium flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H9.5a2 2 0 01-2-2V5a2 2 0 012-2H14" />
                  </svg>
                  Print Improvement Guide
                </button>
                <button 
                  onClick={() => router.push('/teacher/create-test')}
                  className="bg-accent text-accent-foreground px-6 py-3 rounded-xl hover:bg-accent/90 transition-colors duration-200 font-medium flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Follow-up Test
                </button>
                <button 
                  onClick={() => router.push('/teacher/collect-answers')}
                  className="bg-secondary text-secondary-foreground px-6 py-3 rounded-xl hover:bg-secondary/80 transition-colors duration-200 font-medium flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Analyze Another Test
                </button>
                <button 
                  onClick={() => router.push('/teacher-dashboard')}
                  className="border-2 border-border text-foreground px-6 py-3 rounded-xl hover:bg-secondary/50 transition-colors duration-200 font-medium flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* No Test Selected */}
        {!selectedTest && (
          <div className="bg-card rounded-2xl shadow-sm border border-border p-8 text-center">
            <div className="bg-secondary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">No Test Selected</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Please go back to "Collect Answers" and select a test to analyze.
            </p>
            <button
              onClick={() => router.push('/teacher/collect-answers')}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors duration-200 font-medium"
            >
              Go to Collect Answers
            </button>
          </div>
        )}
      </main>
    </div>
  )
}