'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnalysisResponse } from '@/types';

interface ResultCardProps {
  title: string;
  items: string[];
  icon: React.ReactNode;
  bgColor: string;
}

function ResultCard({ title, items, icon, bgColor }: ResultCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-4">
        <div className={`p-2 rounded-lg ${bgColor} mr-3`}>
          {icon}
        </div>
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      </div>
      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="text-indigo-500 mr-2 mt-1">•</span>
              <span className="text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 italic">No items found in this category.</p>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [analysisResults, setAnalysisResults] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedResults = sessionStorage.getItem('analysisResults');
    if (storedResults) {
      try {
        const results: AnalysisResponse = JSON.parse(storedResults);
        setAnalysisResults(results);
      } catch (error) {
        console.error('Failed to parse analysis results:', error);
        router.push('/');
      }
    } else {
      router.push('/');
    }
    setIsLoading(false);
  }, [router]);

  const handleNewAnalysis = () => {
    sessionStorage.removeItem('analysisResults');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!analysisResults) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Analysis Found</h1>
          <p className="text-gray-600 mb-6">Please upload a file and student answers first.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go to Upload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Analysis Results
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            AI-powered insights for your teaching materials
          </p>
          <button
            onClick={handleNewAnalysis}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            New Analysis
          </button>
        </div>

        {/* Summary Section */}
        {analysisResults.summary && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg bg-blue-100 mr-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Executive Summary</h2>
            </div>
            <div className="prose prose-lg text-gray-700">
              <p>{analysisResults.summary}</p>
            </div>
          </div>
        )}

        {/* Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ResultCard
            title="Student Misconceptions"
            items={analysisResults.misconceptions || []}
            bgColor="bg-red-100"
            icon={
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            }
          />

          <ResultCard
            title="Slide Weaknesses"
            items={analysisResults.slideWeaknesses || []}
            bgColor="bg-yellow-100"
            icon={
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
          />

          <ResultCard
            title="Improvement Suggestions"
            items={analysisResults.improvements || []}
            bgColor="bg-green-100"
            icon={
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          />

          {/* Additional Actions Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg bg-indigo-100 mr-3">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Next Steps</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Recommended Actions:</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Review identified misconceptions with students</li>
                  <li>• Update slides based on improvement suggestions</li>
                  <li>• Add visual aids or examples where weaknesses were found</li>
                  <li>• Consider follow-up assessments to track progress</li>
                </ul>
              </div>
              <button
                onClick={handleNewAnalysis}
                className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Analyze Another Set
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500">
          <p className="text-sm">
            Generated by AI-ASSIST • Results are suggestions and should be reviewed by educators
          </p>
        </div>
      </div>
    </div>
  );
}