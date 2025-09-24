'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface StudentResponse {
  id: string;
  studentName: string;
  question: string;
  response: string;
  confidence: 'low' | 'medium' | 'high';
  timestamp: string;
}

export default function StudentResponsesPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [responses, setResponses] = useState<StudentResponse[]>([]);
  const [newResponse, setNewResponse] = useState({
    studentName: '',
    question: '',
    response: '',
    confidence: 'medium' as 'low' | 'medium' | 'high'
  });
  const [isAdding, setIsAdding] = useState(false);
  const [slidesData, setSlidesData] = useState<any>(null);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user || user.role !== 'teacher') {
        router.push('/auth/login');
        return;
      }
    }

    // Check if slides were uploaded
    const uploadedSlides = localStorage.getItem('uploadedSlides');
    if (!uploadedSlides) {
      router.push('/teacher/upload-slides');
      return;
    }
    
    setSlidesData(JSON.parse(uploadedSlides));
    
    // Load existing responses
    const existingResponses = localStorage.getItem('studentResponses');
    if (existingResponses) {
      setResponses(JSON.parse(existingResponses));
    } else {
      // Load demo responses for hackathon demo
      const demoResponses: StudentResponse[] = [
        {
          id: '1',
          studentName: 'Alex Chen',
          question: 'What is the main concept explained in slide 3?',
          response: 'I think it\'s about machine learning algorithms, specifically neural networks. But I\'m not sure about the backpropagation part.',
          confidence: 'medium',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          studentName: 'Sarah Johnson',
          question: 'How does the gradient descent algorithm work?',
          response: 'I understand that it minimizes the cost function by adjusting weights, but I\'m confused about the learning rate parameter.',
          confidence: 'low',
          timestamp: new Date().toISOString()
        },
        {
          id: '3',
          studentName: 'Mike Rodriguez',
          question: 'Can you explain the difference between supervised and unsupervised learning?',
          response: 'Supervised learning uses labeled data for training, while unsupervised learning finds patterns in unlabeled data. I feel confident about this concept.',
          confidence: 'high',
          timestamp: new Date().toISOString()
        }
      ];
      setResponses(demoResponses);
      localStorage.setItem('studentResponses', JSON.stringify(demoResponses));
    }
  }, [isAuthenticated, isLoading, user, router]);

  const handleAddResponse = () => {
    if (!newResponse.studentName || !newResponse.question || !newResponse.response) {
      alert('Please fill in all fields');
      return;
    }

    const response: StudentResponse = {
      id: Date.now().toString(),
      ...newResponse,
      timestamp: new Date().toISOString()
    };

    const updatedResponses = [...responses, response];
    setResponses(updatedResponses);
    localStorage.setItem('studentResponses', JSON.stringify(updatedResponses));
    
    setNewResponse({
      studentName: '',
      question: '',
      response: '',
      confidence: 'medium'
    });
    setIsAdding(false);
  };

  const handleDeleteResponse = (id: string) => {
    const updatedResponses = responses.filter(r => r.id !== id);
    setResponses(updatedResponses);
    localStorage.setItem('studentResponses', JSON.stringify(updatedResponses));
  };

  const handleContinue = () => {
    if (responses.length === 0) {
      alert('Please add at least one student response to continue');
      return;
    }
    router.push('/teacher/ai-analysis');
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'low': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'low': return '😰';
      case 'medium': return '🤔';
      case 'high': return '😊';
      default: return '😐';
    }
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
                onClick={() => router.push('/teacher/upload-slides')}
                className="mr-4 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Student Responses - Step 2 of 3</h1>
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
                <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                  ✓
                </div>
                <span className="ml-2 text-sm font-medium text-green-600">Upload Slides</span>
              </div>
              <div className="flex-1 mx-4 h-1 bg-gray-200 rounded">
                <div className="h-1 bg-blue-600 rounded" style={{ width: '66%' }}></div>
              </div>
              <div className="flex items-center">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <span className="ml-2 text-sm font-medium text-blue-600">Student Responses</span>
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
      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Slides Info */}
        {slidesData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-2 mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-blue-900">Uploaded: {slidesData.fileName}</p>
                <p className="text-sm text-blue-700">Ready to collect student responses</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Responses List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Student Responses ({responses.length})
                  </h2>
                  <button
                    onClick={() => setIsAdding(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    + Add Response
                  </button>
                </div>
              </div>

              <div className="p-6">
                {responses.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.13 8.13 0 01-2.939-.515l-3.561 3.561A2 2 0 015 21V7a2 2 0 012-2h14a2 2 0 012 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No student responses yet</h3>
                    <p className="text-gray-600 mb-4">Add student questions and responses to begin AI analysis</p>
                    <button
                      onClick={() => setIsAdding(true)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add First Response
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {responses.map((response) => (
                      <div key={response.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center">
                            <div className="bg-purple-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                              <span className="text-purple-600 font-medium text-sm">
                                {response.studentName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{response.studentName}</h4>
                              <p className="text-sm text-gray-500">
                                {new Date(response.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(response.confidence)}`}>
                              {getConfidenceIcon(response.confidence)} {response.confidence}
                            </span>
                            <button
                              onClick={() => handleDeleteResponse(response.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <h5 className="font-medium text-gray-700 mb-1">Question:</h5>
                          <p className="text-gray-900 text-sm bg-gray-50 p-2 rounded">{response.question}</p>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-700 mb-1">Response:</h5>
                          <p className="text-gray-900 text-sm">{response.response}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Add Response Form */}
          <div className="lg:col-span-1">
            {isAdding && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Add New Response</h3>
                  <button
                    onClick={() => setIsAdding(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student Name
                    </label>
                    <input
                      type="text"
                      value={newResponse.studentName}
                      onChange={(e) => setNewResponse({...newResponse, studentName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter student name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question/Topic
                    </label>
                    <input
                      type="text"
                      value={newResponse.question}
                      onChange={(e) => setNewResponse({...newResponse, question: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="What was the question about?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student Response
                    </label>
                    <textarea
                      value={newResponse.response}
                      onChange={(e) => setNewResponse({...newResponse, response: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter the student's response or question"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student Confidence Level
                    </label>
                    <select
                      value={newResponse.confidence}
                      onChange={(e) => setNewResponse({...newResponse, confidence: e.target.value as 'low' | 'medium' | 'high'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">😰 Low - Confused/Uncertain</option>
                      <option value="medium">🤔 Medium - Somewhat Understanding</option>
                      <option value="high">😊 High - Confident/Clear</option>
                    </select>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={handleAddResponse}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Response
                    </button>
                    <button
                      onClick={() => setIsAdding(false)}
                      className="px-4 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Responses</span>
                  <span className="font-semibold text-gray-900">{responses.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">😊 High Confidence</span>
                  <span className="font-semibold text-green-600">
                    {responses.filter(r => r.confidence === 'high').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">🤔 Medium Confidence</span>
                  <span className="font-semibold text-yellow-600">
                    {responses.filter(r => r.confidence === 'medium').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">😰 Low Confidence</span>
                  <span className="font-semibold text-red-600">
                    {responses.filter(r => r.confidence === 'low').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => router.push('/teacher/upload-slides')}
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ← Previous Step
          </button>
          
          <button
            onClick={handleContinue}
            disabled={responses.length === 0}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              responses.length === 0
                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Continue to AI Analysis →
          </button>
        </div>
      </main>
    </div>
  );
}