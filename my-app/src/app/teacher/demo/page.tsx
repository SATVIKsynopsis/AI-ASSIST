'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function DemoPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);

  // Demo slides data for hackathon presentation
  const demoSlides = [
    {
      id: 1,
      title: "Machine Learning Fundamentals",
      content: "Introduction to supervised and unsupervised learning algorithms",
      keyPoints: ["Data preprocessing", "Model training", "Evaluation metrics"],
      studentQuestions: 3,
      comprehensionLevel: "medium"
    },
    {
      id: 2,
      title: "Neural Networks Deep Dive",
      content: "Understanding backpropagation and gradient descent",
      keyPoints: ["Activation functions", "Learning rates", "Architecture design"],
      studentQuestions: 5,
      comprehensionLevel: "low"
    },
    {
      id: 3,
      title: "Real-world Applications",
      content: "Case studies in computer vision and NLP",
      keyPoints: ["Image classification", "Text analysis", "Model deployment"],
      studentQuestions: 2,
      comprehensionLevel: "high"
    }
  ];

  const realTimeMetrics = {
    totalStudents: 24,
    activeNow: 18,
    avgComprehension: 73,
    questionsAsked: 12,
    strugglingStudents: 5,
    confidentStudents: 11
  };

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user || user.role !== 'teacher') {
        router.push('/auth/login');
        return;
      }
    }

    // Load analysis data
    const existingAnalysis = localStorage.getItem('aiAnalysisResult');
    if (existingAnalysis) {
      setAnalysisData(JSON.parse(existingAnalysis));
    }

    // Check if demo mode was activated
    const demoMode = localStorage.getItem('demoModeActive');
    if (demoMode === 'true') {
      // Auto-start in presentation mode for hackathon demo
      setIsFullscreen(true);
    }
  }, [isAuthenticated, isLoading, user, router]);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const nextSlide = () => {
    if (currentSlide < demoSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      nextSlide();
    } else if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'Escape') {
      setIsFullscreen(false);
    } else if (e.key === 'a' || e.key === 'A') {
      setShowAnalytics(!showAnalytics);
    }
  };

  const getComprehensionColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getComprehensionBg = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-100';
      case 'medium': return 'bg-yellow-100';
      case 'low': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const currentSlideData = demoSlides[currentSlide];

  return (
    <div 
      className={`${isFullscreen ? 'fixed inset-0 z-50 bg-gray-900' : 'min-h-screen bg-gray-50'}`}
      onKeyDown={handleKeyPress}
      tabIndex={0}
    >
      {/* Demo Header (hidden in fullscreen) */}
      {!isFullscreen && (
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <button
                  onClick={() => router.push('/teacher/ai-analysis')}
                  className="mr-4 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  ← Back to Analysis
                </button>
                <h1 className="text-2xl font-bold text-gray-900">🎉 Demo Mode - Live Presentation</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  Teacher: {user?.name}
                </div>
                <button
                  onClick={toggleFullscreen}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Enter Fullscreen
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Demo Controls (always visible) */}
      <div className={`${isFullscreen ? 'fixed top-4 right-4 z-50' : 'bg-white border-b px-4 py-3'}`}>
        <div className="flex items-center space-x-4">
          {!isFullscreen && (
            <div className="text-sm text-gray-600">
              Slide {currentSlide + 1} of {demoSlides.length}
            </div>
          )}
          
          <div className="flex space-x-2">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className={`px-3 py-1 rounded ${currentSlide === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white text-sm`}
            >
              ← Prev
            </button>
            <button
              onClick={nextSlide}
              disabled={currentSlide === demoSlides.length - 1}
              className={`px-3 py-1 rounded ${currentSlide === demoSlides.length - 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white text-sm`}
            >
              Next →
            </button>
          </div>
          
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`px-3 py-1 rounded text-white text-sm ${showAnalytics ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'}`}
          >
            {showAnalytics ? 'Hide' : 'Show'} Analytics
          </button>
          
          {isFullscreen && (
            <button
              onClick={toggleFullscreen}
              className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-sm"
            >
              Exit Fullscreen
            </button>
          )}
        </div>
      </div>

      {/* Main Demo Content */}
      <div className={`flex ${isFullscreen ? 'h-screen pt-16' : 'min-h-screen'}`}>
        {/* Slide Content */}
        <div className={`${showAnalytics ? 'w-2/3' : 'w-full'} ${isFullscreen ? 'bg-gray-900 text-white' : 'bg-white'} transition-all duration-300`}>
          <div className={`${isFullscreen ? 'p-12' : 'p-8'} h-full flex flex-col justify-center`}>
            {/* Slide Header */}
            <div className="text-center mb-8">
              <h1 className={`${isFullscreen ? 'text-6xl' : 'text-4xl'} font-bold mb-4 ${isFullscreen ? 'text-white' : 'text-gray-900'}`}>
                {currentSlideData.title}
              </h1>
              <p className={`${isFullscreen ? 'text-2xl text-gray-300' : 'text-xl text-gray-600'} max-w-4xl mx-auto`}>
                {currentSlideData.content}
              </p>
            </div>

            {/* Slide Key Points */}
            <div className="max-w-4xl mx-auto">
              <h2 className={`${isFullscreen ? 'text-3xl text-gray-300' : 'text-2xl text-gray-700'} font-semibold mb-6 text-center`}>
                Key Learning Points
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {currentSlideData.keyPoints.map((point, index) => (
                  <div 
                    key={index} 
                    className={`${isFullscreen ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4 text-center`}
                  >
                    <div className={`${isFullscreen ? 'bg-blue-600' : 'bg-blue-100'} rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3`}>
                      <span className={`${isFullscreen ? 'text-white' : 'text-blue-600'} font-bold text-lg`}>
                        {index + 1}
                      </span>
                    </div>
                    <p className={`${isFullscreen ? 'text-gray-200' : 'text-gray-700'} font-medium`}>
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Metrics for this slide */}
            {!isFullscreen && (
              <div className="mt-8 max-w-2xl mx-auto">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{currentSlideData.studentQuestions}</div>
                        <div className="text-sm text-blue-800">Questions Asked</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getComprehensionColor(currentSlideData.comprehensionLevel)}`}>
                          {currentSlideData.comprehensionLevel.toUpperCase()}
                        </div>
                        <div className="text-sm text-gray-600">Comprehension</div>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-lg ${getComprehensionBg(currentSlideData.comprehensionLevel)}`}>
                      <span className={`font-medium ${getComprehensionColor(currentSlideData.comprehensionLevel)}`}>
                        Slide {currentSlide + 1} Status
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation hint for fullscreen */}
            {isFullscreen && (
              <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 text-gray-400 text-sm">
                Use arrow keys or space to navigate • Press 'A' to toggle analytics • ESC to exit
              </div>
            )}
          </div>
        </div>

        {/* Real-time Analytics Panel */}
        {showAnalytics && (
          <div className={`w-1/3 ${isFullscreen ? 'bg-gray-800 text-white border-l border-gray-600' : 'bg-white border-l border-gray-200'} p-6 overflow-y-auto`}>
            <h2 className={`text-2xl font-bold mb-6 ${isFullscreen ? 'text-white' : 'text-gray-900'}`}>
              📊 Live Analytics
            </h2>
            
            {/* Current Class Metrics */}
            <div className="mb-6">
              <h3 className={`text-lg font-semibold mb-4 ${isFullscreen ? 'text-gray-200' : 'text-gray-700'}`}>
                Class Overview
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={`${isFullscreen ? 'text-gray-300' : 'text-gray-600'}`}>Total Students</span>
                  <span className={`font-bold ${isFullscreen ? 'text-white' : 'text-gray-900'}`}>
                    {realTimeMetrics.totalStudents}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`${isFullscreen ? 'text-gray-300' : 'text-gray-600'}`}>Active Now</span>
                  <span className="font-bold text-green-500">{realTimeMetrics.activeNow}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`${isFullscreen ? 'text-gray-300' : 'text-gray-600'}`}>Avg Comprehension</span>
                  <span className="font-bold text-blue-500">{realTimeMetrics.avgComprehension}%</span>
                </div>
                <div className="flex justify-between">
                  <span className={`${isFullscreen ? 'text-gray-300' : 'text-gray-600'}`}>Questions Asked</span>
                  <span className="font-bold text-purple-500">{realTimeMetrics.questionsAsked}</span>
                </div>
              </div>
            </div>

            {/* Student Status */}
            <div className="mb-6">
              <h3 className={`text-lg font-semibold mb-4 ${isFullscreen ? 'text-gray-200' : 'text-gray-700'}`}>
                Student Status
              </h3>
              <div className="space-y-3">
                <div className={`${isFullscreen ? 'bg-gray-700' : 'bg-green-50'} p-3 rounded`}>
                  <div className="flex justify-between items-center">
                    <span className={`${isFullscreen ? 'text-gray-200' : 'text-green-700'} font-medium`}>
                      😊 Confident
                    </span>
                    <span className="font-bold text-green-500">{realTimeMetrics.confidentStudents}</span>
                  </div>
                </div>
                <div className={`${isFullscreen ? 'bg-gray-700' : 'bg-red-50'} p-3 rounded`}>
                  <div className="flex justify-between items-center">
                    <span className={`${isFullscreen ? 'text-gray-200' : 'text-red-700'} font-medium`}>
                      😰 Struggling
                    </span>
                    <span className="font-bold text-red-500">{realTimeMetrics.strugglingStudents}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            {analysisData && (
              <div className="mb-6">
                <h3 className={`text-lg font-semibold mb-4 ${isFullscreen ? 'text-gray-200' : 'text-gray-700'}`}>
                  🤖 AI Insights
                </h3>
                <div className={`${isFullscreen ? 'bg-gray-700' : 'bg-blue-50'} p-3 rounded text-sm`}>
                  <p className={`${isFullscreen ? 'text-gray-200' : 'text-blue-800'} font-medium mb-2`}>
                    Immediate Action Needed:
                  </p>
                  <p className={`${isFullscreen ? 'text-gray-300' : 'text-blue-700'}`}>
                    {analysisData.nextSteps?.immediateActions?.[0] || "Continue monitoring student responses"}
                  </p>
                </div>
              </div>
            )}

            {/* Recent Questions */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${isFullscreen ? 'text-gray-200' : 'text-gray-700'}`}>
                💭 Recent Questions
              </h3>
              <div className="space-y-2 text-sm">
                <div className={`${isFullscreen ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-700'} p-2 rounded`}>
                  "How does the learning rate affect convergence?"
                </div>
                <div className={`${isFullscreen ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-700'} p-2 rounded`}>
                  "When should I use ReLU vs Sigmoid?"
                </div>
                <div className={`${isFullscreen ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-700'} p-2 rounded`}>
                  "Can you explain gradient descent again?"
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Demo Exit Options (non-fullscreen) */}
      {!isFullscreen && (
        <div className="bg-white border-t p-6">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Demo Mode - Showing real-time teaching analytics and slide presentation
            </div>
            <div className="space-x-4">
              <button
                onClick={() => router.push('/teacher-dashboard')}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Return to Dashboard
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('demoModeActive');
                  router.push('/teacher/ai-analysis');
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}