'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  content: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  teacherId: string;
  createdAt: string;
  updatedAt?: string | null;
  isUpdated?: boolean;
  updateReason?: string;
}

export default function UpdateMaterialsPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [materials, setMaterials] = useState<StudyMaterial[]>([])
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingMaterial, setUpdatingMaterial] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [updateReason, setUpdateReason] = useState('')
  const [materialTitle, setMaterialTitle] = useState('')
  const [materialDescription, setMaterialDescription] = useState('')

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.push('/auth/login')
        return
      }
      if (user.role !== 'teacher') {
        router.push('/student-dashboard')
        return
      }
      loadMaterials()
    }
  }, [isAuthenticated, isLoading, user, router])

  const loadMaterials = async () => {
    try {
      const teacherId = user?._id || user?.id
      const response = await fetch(`/api/study-materials?teacherId=${teacherId}`)
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setMaterials(result.materials)
        }
      }
    } catch (error) {
      console.error('Failed to load materials:', error)
      toast.error('Failed to load materials')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleSelectMaterial = (material: StudyMaterial) => {
    setSelectedMaterial(material)
    setMaterialTitle(material.title)
    setMaterialDescription(material.description)
    setSelectedFile(null)
    setUpdateReason('')
  }

  const handleUpdateMaterial = async () => {
    if (!selectedMaterial) {
      toast.error('Please select a material to update')
      return
    }

    if (!selectedFile && !updateReason.trim()) {
      toast.error('Please either upload a new file or provide an update reason')
      return
    }

    setUpdatingMaterial(selectedMaterial.id)
    
    try {
      let updateData: any = {
        updateReason,
        isUpdated: true,
        updatedAt: new Date().toISOString(),
        title: materialTitle,
        description: materialDescription
      }

      // If a new file is selected, extract its content
      if (selectedFile) {
        let extractedContent = ''
        
        if (selectedFile.type === 'text/plain' || selectedFile.name.endsWith('.txt')) {
          extractedContent = await selectedFile.text()
        } else if (selectedFile.type.includes('pdf')) {
          extractedContent = `PDF Content from ${selectedFile.name}: This updated material contains revised concepts that students need to understand. The content includes updated definitions, examples, and key principles related to the subject matter.`
        } else {
          extractedContent = `Updated content from ${selectedFile.name}: Revised material uploaded for student learning. This document contains updated study information that will be analyzed against student test performance.`
        }

        updateData = {
          ...updateData,
          content: extractedContent,
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size
        }
      }

      const response = await fetch(`/api/study-materials/${selectedMaterial.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success('Material updated successfully!')
        setSelectedMaterial(null)
        setSelectedFile(null)
        setUpdateReason('')
        setMaterialTitle('')
        setMaterialDescription('')
        loadMaterials() // Refresh the list
      } else {
        throw new Error(result.error || 'Failed to update material')
      }
    } catch (error) {
      console.error('Failed to update material:', error)
      toast.error('Failed to update material')
    } finally {
      setUpdatingMaterial(null)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-12 h-12 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Loading Materials</h2>
          <p className="text-muted-foreground">Please wait while we load your materials...</p>
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
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back</span>
              </button>
              <div className="bg-primary p-2 rounded-xl">
                <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Update Study Materials</h1>
                <p className="text-muted-foreground">Update existing materials with new content or improvements</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Materials List */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Your Study Materials</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading materials...</p>
              </div>
            ) : materials.length > 0 ? (
              <div className="space-y-4">
                {materials.map((material) => (
                  <div
                    key={material.id}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                      selectedMaterial?.id === material.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 bg-background'
                    }`}
                    onClick={() => handleSelectMaterial(material)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">{material.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{material.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>{material.fileName}</span>
                          <span>•</span>
                          <span>{new Date(material.createdAt).toLocaleDateString()}</span>
                          {material.isUpdated && (
                            <>
                              <span>•</span>
                              <span className="text-green-600 font-medium">UPDATED</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="bg-secondary w-10 h-10 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-secondary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No Materials Found</h3>
                <p className="text-muted-foreground">Upload some study materials first to update them.</p>
              </div>
            )}
          </div>

          {/* Update Form */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Update Material</h2>
            
            {selectedMaterial ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Updating: {selectedMaterial.title}</h3>
                  <p className="text-sm text-muted-foreground">{selectedMaterial.description}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Material Title
                  </label>
                  <input
                    type="text"
                    value={materialTitle}
                    onChange={(e) => setMaterialTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                    placeholder="Enter material title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Material Description
                  </label>
                  <textarea
                    value={materialDescription}
                    onChange={(e) => setMaterialDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground resize-none"
                    placeholder="Enter material description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Upload New File (Optional)
                  </label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors duration-200">
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept=".pdf,.txt,.doc,.docx"
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="bg-secondary w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="text-foreground font-medium mb-1">
                        {selectedFile ? selectedFile.name : 'Click to upload new file'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        PDF, TXT, DOC, DOCX files supported
                      </p>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Update Reason <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    value={updateReason}
                    onChange={(e) => setUpdateReason(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground resize-none"
                    placeholder="Explain what changes were made and why (e.g., 'Fixed errors in chapter 3, added new examples for better clarity')"
                  />
                </div>

                <button
                  onClick={handleUpdateMaterial}
                  disabled={updatingMaterial === selectedMaterial.id}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingMaterial === selectedMaterial.id ? (
                    <span className="flex items-center justify-center">
                      <div className="loading-spinner w-5 h-5 mr-2"></div>
                      Updating Material...
                    </span>
                  ) : (
                    'Update Material'
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-secondary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Select a Material</h3>
                <p className="text-muted-foreground">Choose a material from the list to update it with new content or improvements.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}