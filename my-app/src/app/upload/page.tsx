'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnalysisResponse } from '@/types';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [studentAnswers, setStudentAnswers] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    if (!studentAnswers.trim()) {
      setError('Please enter student answers');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('studentAnswers', studentAnswers.trim());

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data: AnalysisResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      sessionStorage.setItem('analysisResults', JSON.stringify(data));
      router.push('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => router.push('/')}
            className="mb-4 text-indigo-600 hover:text-indigo-700 font-medium"
          >
            ← Back to Home
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Analysis Tool
          </h1>
          <p className="text-lg text-gray-600">
            Upload your slides and student answers to get AI-powered insights
          </p>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Slide Presentation (PDF)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {file && (
                  <div className="mt-2 text-sm text-green-600">
                    ✓ Selected: {file.name} ({Math.round(file.size / 1024)}KB)
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Maximum file size: 10MB. Only PDF files are supported.
              </p>
            </div>

            {/* Student Answers */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Student Answers
              </label>
              <textarea
                value={studentAnswers}
                onChange={(e) => setStudentAnswers(e.target.value)}
                placeholder={`Paste multiple student answers here. For example:

Student 1: Photosynthesis happens only during the day...
Student 2: Plants breathe oxygen like humans do...
Student 3: Chlorophyll makes plants green and helps them make food...

Include as many student responses as possible for better analysis.`}
                className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Include multiple student responses separated by line breaks for better analysis.
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <p className="mt-1 text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !file || !studentAnswers.trim()}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
                isLoading || !file || !studentAnswers.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </div>
              ) : (
                'Analyze with AI'
              )}
            </button>
          </form>

          {/* Features */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What you&apos;ll get:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <div className="bg-indigo-100 rounded-full p-1 mr-3 mt-0.5">
                  <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Student Misconceptions</h4>
                  <p className="text-xs text-gray-600">Identify common misunderstandings</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-indigo-100 rounded-full p-1 mr-3 mt-0.5">
                  <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Slide Weaknesses</h4>
                  <p className="text-xs text-gray-600">Areas that need improvement</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-indigo-100 rounded-full p-1 mr-3 mt-0.5">
                  <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Improvement Suggestions</h4>
                  <p className="text-xs text-gray-600">Actionable recommendations</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-indigo-100 rounded-full p-1 mr-3 mt-0.5">
                  <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Analysis Summary</h4>
                  <p className="text-xs text-gray-600">Overall insights and next steps</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}