'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';

export default function UploadSlidesPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user || user.role !== 'teacher') {
        router.push('/auth/login');
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a PDF file only');
        return;
      }
      
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Simulate upload processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store slide information in localStorage for the workflow
      const slideData = {
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        teacherId: user?.id,
        // In a real app, you'd store the actual file or its processed content
        fileContent: 'Stored slide content would go here'
      };
      
      localStorage.setItem('uploadedSlides', JSON.stringify(slideData));
      setSuccess(true);
      
      // Auto-proceed to next step after success
      setTimeout(() => {
        router.push('/teacher/student-responses');
      }, 1500);
      
    } catch (error) {
      setError('Failed to upload slide. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleNextStep = () => {
    router.push('/teacher/student-responses');
  };

  const handleBackToDashboard = () => {
    router.push('/teacher-dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={handleBackToDashboard}
                className="mr-4 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Upload Slides - Step 1 of 3</h1>
            </div>
            <div className="text-sm text-gray-500">
              Teacher: {user?.name}
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <span className="ml-2 text-sm font-medium text-blue-600">Upload Slides</span>
              </div>
              <div className="flex-1 mx-4 h-1 bg-gray-200 rounded">
                <div className="h-1 bg-blue-600 rounded" style={{ width: '33%' }}></div>
              </div>
              <div className="flex items-center">
                <div className="bg-gray-300 text-gray-500 rounded-full w-8 h-8 flex items-center justify-center text-sm">
                  2
                </div>
                <span className="ml-2 text-sm text-gray-500">Student Responses</span>
              </div>
              <div className="flex-1 mx-4 h-1 bg-gray-200 rounded"></div>
              <div className="flex items-center">
                <div className="bg-gray-300 text-gray-500 rounded-full w-8 h-8 flex items-center justify-center text-sm">
                  3
                </div>
                <span className="ml-2 text-sm text-gray-500">AI Analysis</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Lesson Slides</h2>
            <p className="text-gray-600">
              Upload your presentation file (PDF format) to begin AI analysis
            </p>
          </div>

          {/* Upload Area */}
          <div className="mb-8">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="slideUpload"
              />
              <label 
                htmlFor="slideUpload" 
                className="cursor-pointer block"
              >
                <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {file ? 'Change File' : 'Select Presentation File'}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  PDF files only, maximum 10MB
                </p>
                <div className="bg-blue-600 text-white px-6 py-2 rounded-lg inline-block hover:bg-blue-700 transition-colors">
                  {file ? 'Choose Different File' : 'Browse Files'}
                </div>
              </label>
            </div>

            {/* Selected File Info */}
            {file && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-green-100 rounded-full p-2 mr-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-green-800">{file.name}</p>
                    <p className="text-sm text-green-600">{Math.round(file.size / 1024)} KB</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Display */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">Slides uploaded successfully! Moving to next step...</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handleBackToDashboard}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            
            <div className="space-x-3">
              {file && !success && (
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    isUploading
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isUploading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </div>
                  ) : (
                    'Upload & Continue'
                  )}
                </button>
              )}
              
              {success && (
                <button
                  onClick={handleNextStep}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Next: Add Student Responses →
                </button>
              )}
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tips for Best Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <div className="bg-blue-100 rounded-full p-1 mr-3 mt-0.5">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Clear Text Content</h4>
                  <p className="text-xs text-gray-600">Ensure your PDF has readable text (not just images)</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-100 rounded-full p-1 mr-3 mt-0.5">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Complete Lessons</h4>
                  <p className="text-xs text-gray-600">Upload complete lesson content for better analysis</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}