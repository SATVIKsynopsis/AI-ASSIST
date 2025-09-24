'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

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

export default function StudyMaterialViewPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const materialId = params.materialId as string

  const [material, setMaterial] = useState<StudyMaterial | null>(null)
  const [loadingMaterial, setLoadingMaterial] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.push('/auth/login')
        return
      }
      if (user.role !== 'student') {
        router.push('/teacher-dashboard')
        return
      }
      
      loadMaterial()
    }
  }, [isAuthenticated, isLoading, user, router, materialId])

  const loadMaterial = async () => {
    try {
      setLoadingMaterial(true)
      const response = await fetch('/api/study-materials?studentAccess=true')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          const foundMaterial = result.materials.find((m: StudyMaterial) => m.id === materialId)
          if (foundMaterial) {
            setMaterial(foundMaterial)
          } else {
            toast.error('Study material not found')
            router.push('/student-dashboard')
          }
        }
      } else {
        toast.error('Failed to load study material')
        router.push('/student-dashboard')
      }
    } catch (error) {
      console.error('Failed to load study material:', error)
      toast.error('Failed to load study material')
      router.push('/student-dashboard')
    } finally {
      setLoadingMaterial(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (isLoading || loadingMaterial) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-12 h-12 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Loading Study Material</h2>
          <p className="text-muted-foreground">Please wait while we load the content...</p>
        </div>
      </div>
    )
  }

  if (!material) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Material Not Found</h2>
          <p className="text-muted-foreground mb-6">The study material you're looking for could not be found.</p>
          <button
            onClick={() => router.push('/student-dashboard')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/student-dashboard')}
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Dashboard</span>
              </button>
            </div>
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
                <p className="text-xs text-muted-foreground">Student</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Material Header */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-4 rounded-2xl">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{material.title}</h1>
                {material.description && (
                  <p className="text-lg text-muted-foreground">{material.description}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Material Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {material.fileName && (
              <div className="bg-secondary/20 rounded-xl p-4">
                <div className="text-sm font-medium text-muted-foreground">File Name</div>
                <div className="text-lg font-semibold text-foreground">{material.fileName}</div>
              </div>
            )}
            {material.fileType && (
              <div className="bg-secondary/20 rounded-xl p-4">
                <div className="text-sm font-medium text-muted-foreground">File Type</div>
                <div className="text-lg font-semibold text-foreground">{material.fileType.toUpperCase()}</div>
              </div>
            )}
            {material.fileSize && (
              <div className="bg-secondary/20 rounded-xl p-4">
                <div className="text-sm font-medium text-muted-foreground">File Size</div>
                <div className="text-lg font-semibold text-foreground">{formatFileSize(material.fileSize)}</div>
              </div>
            )}
          </div>
          
          {material.uploadDate && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Uploaded: {new Date(material.uploadDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}
        </div>

        {/* Material Content */}
        <div className="bg-card rounded-2xl shadow-sm border border-border">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Content</h2>
            
            {material.content ? (
              <div className="prose prose-lg max-w-none">
                <div className="bg-background rounded-xl p-6 border border-border">
                  <pre className="whitespace-pre-wrap font-sans text-foreground leading-relaxed">
                    {material.content}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-secondary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">No Content Available</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  The content for this study material is not available for preview. Please contact your teacher for more information.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4 no-print">
          <button
            onClick={() => router.push('/student-dashboard')}
            className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => window.print()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Print Material
          </button>
        </div>
      </main>
    </div>
  )
}