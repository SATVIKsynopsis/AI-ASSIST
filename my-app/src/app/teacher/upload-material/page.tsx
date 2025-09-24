'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'
import { StudyMaterialManager } from '../../../utils/dataStore'
import { toast } from 'sonner'

export default function UploadMaterialPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [materialTitle, setMaterialTitle] = useState('')
  const [materialDescription, setMaterialDescription] = useState('')

  useEffect(() => {
    console.log("🔍 UploadMaterialPage - Auth check:", { isLoading, isAuthenticated, user: user?.email })
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        console.log("🔍 UploadMaterialPage - Redirecting to login: not authenticated or no user")
        router.push("/auth/login")
        return
      }
      if (user.role !== "teacher") {
        console.log("🔍 UploadMaterialPage - Redirecting to student dashboard: user is not teacher")
        router.push("/student-dashboard")
        return
      }
      console.log("🔍 UploadMaterialPage - Auth check passed, staying on page")
    }
  }, [isAuthenticated, isLoading, user, router])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !materialTitle.trim()) {
      toast.error('Please select a file and enter a title')
      return
    }

    setUploadStatus('uploading')

    try {
      // Extract text content from the file
      let extractedContent = ''
      
      if (selectedFile.type === 'text/plain' || selectedFile.name.endsWith('.txt')) {
        // For text files, read directly
        extractedContent = await selectedFile.text()
      } else if (selectedFile.type.includes('pdf')) {
        // For PDFs, we'll simulate content extraction (in real app, use pdf-parse)
        extractedContent = `PDF Content from ${selectedFile.name}: This material contains important concepts that students need to understand. The content includes definitions, examples, and key principles related to the subject matter.`
      } else {
        // For other files, add a placeholder
        extractedContent = `Content from ${selectedFile.name}: Material uploaded for student learning. This document contains study information that will be analyzed against student test performance.`
      }
      
      // Upload material via API
      const materialData = {
        title: materialTitle,
        description: materialDescription,
        content: extractedContent,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        teacherId: user?._id || user?.id
      }
      
      const response = await fetch('/api/study-materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(materialData),
      })

      const result = await response.json()
      
      if (result.success) {
        setUploadStatus('success')
        // Redirect after success
        setTimeout(() => {
          router.push('/teacher/create-test')
        }, 2000)
      } else {
        throw new Error(result.error || 'Upload failed')
      }
      
    } catch (error) {
      console.error('Upload failed:', error)
      setUploadStatus('error')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-12 h-12 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Loading Upload Page</h2>
          <p className="text-muted-foreground">Please wait while we prepare your upload tools...</p>
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
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">AI-ASSIST</h1>
                <p className="text-sm text-muted-foreground">Upload Study Material</p>
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
          
          <h1 className="text-3xl font-bold text-foreground mb-2">Upload Study Material</h1>
          <p className="text-muted-foreground text-lg">
            Upload PDF documents, slides, or other study materials that your students will learn from.
          </p>
        </div>

        {/* Upload Form */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-8 mb-8">
          <div className="space-y-8">
            {/* Material Title */}
            <div>
              <label htmlFor="title" className="block text-lg font-semibold text-foreground mb-3">
                Material Title *
              </label>
              <input
                type="text"
                id="title"
                value={materialTitle}
                onChange={(e) => setMaterialTitle(e.target.value)}
                placeholder="e.g., Introduction to Photosynthesis"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary placeholder-muted-foreground transition-all duration-200"
              />
            </div>

            {/* Material Description */}
            <div>
              <label htmlFor="description" className="block text-lg font-semibold text-foreground mb-3">
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={materialDescription}
                onChange={(e) => setMaterialDescription(e.target.value)}
                placeholder="Brief description of what this material covers..."
                rows={4}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary placeholder-muted-foreground transition-all duration-200"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-lg font-semibold text-foreground mb-3">
                Upload Study Material *
              </label>
              
              <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary transition-colors duration-200 bg-background/50">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <div className="bg-secondary rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  
                  {selectedFile ? (
                    <div>
                      <p className="text-xl font-semibold text-foreground">{selectedFile.name}</p>
                      <p className="text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xl font-semibold text-foreground">Click to upload a file</p>
                      <p className="text-muted-foreground">PDF, DOC, DOCX, PPT, PPTX, TXT up to 50MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Upload Button */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                onClick={() => router.push('/teacher-dashboard')}
                className="px-8 py-3 border border-border text-foreground rounded-xl hover:bg-secondary/50 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
              
              <button
                onClick={handleUpload}
                disabled={!selectedFile || !materialTitle.trim() || uploadStatus === 'uploading'}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors duration-200 font-medium flex items-center"
              >
                {uploadStatus === 'uploading' ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : uploadStatus === 'success' ? (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Uploaded!
                  </>
                ) : (
                  'Upload Material'
                )}
              </button>
            </div>

            {/* Status Messages */}
            {uploadStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <div className="ml-3">
                    <p className="text-green-800 font-semibold">Material uploaded successfully!</p>
                    <p className="text-green-700">Redirecting to test creation...</p>
                  </div>
                </div>
              </div>
            )}

            {uploadStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="ml-3">
                    <p className="text-red-800 font-semibold">Upload failed</p>
                    <p className="text-red-700">Please try again or check your connection.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 rounded-2xl p-8 border border-blue-200">
          <h3 className="text-xl font-semibold text-blue-900 mb-4">💡 Tips for Better Study Materials</h3>
          <ul className="space-y-3 text-blue-800">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
              Use clear headings and structured content for better AI analysis
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
              Include key concepts, definitions, and examples
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
              PDF files work best for text extraction and analysis
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
              Keep file sizes under 50MB for faster processing
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}