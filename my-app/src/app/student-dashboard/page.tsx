'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Test {
  id: string;
  title: string;
  description: string;
  materialId: string;
  createdDate: string;
  teacherId: string;
  status: string;
}

interface TestSubmission {
  id: string;
  testId: string;
  studentId: string;
  submittedAt?: string;
  score?: number;
  status?: string;
}

interface StudyMaterial {
  id: string;
  title: string;
  description?: string;
  fileName?: string;
  fileType?: string;
  uploadDate?: string;
  teacherId?: string;
  isUpdated?: boolean;
  updatedAt?: string | null;
}

export default function StudentDashboard() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [availableTests, setAvailableTests] = useState<Test[]>([]);
  const [submittedTests, setSubmittedTests] = useState<string[]>([]);
  const [attemptedTests, setAttemptedTests] = useState<TestSubmission[]>([]);
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);

  useEffect(() => {
    console.log("🔍 StudentDashboard - Auth check:", { isLoading, isAuthenticated, user: user?.email })
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        console.log("🔍 StudentDashboard - Redirecting to login: not authenticated or no user")
        router.push('/auth/login');
        return;
      }
      if (user.role !== 'student') {
        console.log("🔍 StudentDashboard - Redirecting to teacher dashboard: user is not student")
        router.push('/teacher-dashboard');
        return;
      }
      console.log("🔍 StudentDashboard - Auth check passed, staying on page")
      
      // Load available tests, student's submissions, and study materials
      loadTests();
      loadStudyMaterials();
    }
  }, [isAuthenticated, isLoading, user, router]);

  const loadTests = async () => {
    try {
      // Load all active tests from MongoDB API
      const testsResponse = await fetch('/api/tests?studentAccess=true');
      if (testsResponse.ok) {
        const result = await testsResponse.json();
        if (result.success) {
          const activeTests = result.tests.filter((test: Test) => test.status === 'active');
          setAvailableTests(activeTests);
        }
      }

      // Load student's submissions from MongoDB API
      const submissionsResponse = await fetch('/api/test-submissions');
      if (submissionsResponse.ok) {
        const result = await submissionsResponse.json();
        console.log('🔍 Student Dashboard - All submissions:', result);
        if (result.success) {
          const studentSubmissions = result.submissions
            .filter((sub: TestSubmission) => sub.studentId === (user?._id || user?.id));
          
          console.log('🔍 Student Dashboard - Current user ID:', user?._id || user?.id);
          console.log('🔍 Student Dashboard - Filtered student submissions:', studentSubmissions);
          
          // Set attempted tests with full submission data
          setAttemptedTests(studentSubmissions);
          
          // Set submitted test IDs for checking availability
          const submittedTestIds = studentSubmissions.map((sub: TestSubmission) => sub.testId);
          console.log('🔍 Student Dashboard - Submitted test IDs:', submittedTestIds);
          setSubmittedTests(submittedTestIds);
        }
      }
    } catch (error) {
      console.error('Failed to load tests and submissions:', error);
    }
  };

  const loadStudyMaterials = async () => {
    try {
      const response = await fetch('/api/study-materials?studentAccess=true');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log('🔍 Debug - Study materials loaded:', result.materials);
          console.log('🔍 Debug - First material with update info:', result.materials[0]);
          setStudyMaterials(result.materials);
        }
      }
    } catch (error) {
      console.error('Failed to load study materials:', error);
    }
  };

  const handleTakeTest = async (testId: string) => {
    // Double-check if student has already taken this test
    const hasAlreadyTaken = submittedTests.includes(testId);
    const hasAttempted = attemptedTests.some(attempt => attempt.testId === testId);
    
    if (hasAlreadyTaken || hasAttempted) {
      toast.error('You have already taken this test and cannot retake it.');
      return;
    }

    // Additional API check to be absolutely sure
    try {
      const response = await fetch(`/api/test-submissions?testId=${testId}&studentId=${user?._id || user?.id}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.submissions && result.submissions.length > 0) {
          toast.error('You have already taken this test and cannot retake it.');
          // Refresh the data to sync the UI
          loadTests();
          return;
        }
      }
    } catch (error) {
      console.error('Error checking test submission status:', error);
    }

    // If all checks pass, navigate to the test
    router.push(`/student/take-test/${testId}`);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-12 h-12 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Loading Dashboard</h2>
          <p className="text-muted-foreground">Please wait while we prepare your learning tools...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'student') {
    return null;
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
                    d="M12 14.816c1.457 0 2.992-.143 4.295-.426 1.578-.343 2.705-1.113 2.705-2.201 0-1.088-1.127-1.858-2.705-2.201-1.303-.283-2.838-.426-4.295-.426s-2.992.143-4.295.426c-1.578.343-2.705 1.113-2.705 2.201 0 1.088 1.127 1.858 2.705 2.201 1.303.283 2.838.426 4.295.426z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 14.816v5.184"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">AI-ASSIST</h1>
                <p className="text-sm text-muted-foreground">Student Dashboard</p>
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
        {/* Welcome Section */}
        <div className="px-4 sm:px-0 mb-8">
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
                  <h2 className="text-3xl font-bold mb-2 text-balance">Welcome, {user.name}! 🎓</h2>
                  <p className="text-primary-foreground/80 text-lg text-pretty">
                    Your learning journey with AI-powered insights starts here. Track your progress and understanding.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                <div className="bg-primary-foreground/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-primary-foreground/80">Lessons Completed</div>
                </div>
                <div className="bg-primary-foreground/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold">0%</div>
                  <div className="text-primary-foreground/80">Average Score</div>
                </div>
                <div className="bg-primary-foreground/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-primary-foreground/80">Concepts Mastered</div>
                </div>
                <div className="bg-primary-foreground/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-primary-foreground/80">Study Hours</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Available Tests */}
        <div className="px-4 sm:px-0 mb-8">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-foreground mb-4 text-balance">Available Tests</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Take tests assigned by your teachers and track your learning progress
            </p>
            {/* Debug info - remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">
                  Debug: Submitted tests: {submittedTests.length > 0 ? submittedTests.join(', ') : 'None'}
                </p>
                <p className="text-sm text-gray-600">
                  Attempted tests: {attemptedTests.length}
                </p>
              </div>
            )}
          </div>
          
          {availableTests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {availableTests.map((test) => {
                const isCompleted = submittedTests.includes(test.id);
                const hasAttempted = attemptedTests.some(attempt => attempt.testId === test.id);
                const finalIsCompleted = isCompleted || hasAttempted;
                
                console.log('🔍 Test render check:', {
                  testId: test.id,
                  isCompleted,
                  hasAttempted,
                  finalIsCompleted,
                  submittedTests,
                  attemptedTests: attemptedTests.map(a => a.testId)
                });
                
                return (
                  <div key={test.id} className="group bg-card rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-border hover:border-primary/20 relative overflow-hidden">
                    <div className="p-8 relative">
                      <div className={`rounded-full w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ${
                        finalIsCompleted ? 'bg-green-100' : 'bg-accent'
                      }`}>
                        {finalIsCompleted ? (
                          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-8 h-8 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                      </div>
                      <h4 className="text-xl font-bold text-foreground mb-3">{test.title}</h4>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        {test.description || 'No description available'}
                      </p>
                      <p className="text-xs text-muted-foreground mb-6">
                        Created: {new Date(test.createdDate).toLocaleDateString()}
                      </p>
                      {finalIsCompleted ? (
                        <div className="w-full bg-green-100 text-green-800 py-3 px-4 rounded-lg text-center font-medium">
                          ✓ Completed
                        </div>
                      ) : (
                        <button
                          onClick={() => handleTakeTest(test.id)}
                          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3 px-4 rounded-lg font-medium transition-colors duration-200 group-hover:scale-105"
                        >
                          Take Test
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-card rounded-2xl shadow-sm border border-border p-8 text-center mb-8">
              <div className="bg-secondary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-3">No Tests Available</h4>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Your teachers haven't created any tests yet. Check back later!
              </p>
            </div>
          )}
        </div>

        {/* Attempted Tests */}
        {attemptedTests.length > 0 && (
          <div className="px-4 sm:px-0 mb-8">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-foreground mb-4 text-balance">Attempted Tests</h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
                View your completed tests and scores
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {attemptedTests.map((submission) => {
                const test = availableTests.find(t => t.id === submission.testId);
                return (
                  <div key={submission.id} className="group bg-card rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-border hover:border-green-500/20 relative overflow-hidden">
                    <div className="p-8 relative">
                      <div className="rounded-full w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 bg-green-100">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-bold text-foreground mb-3">{test?.title || 'Test'}</h4>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        Status: {submission.status || 'Submitted'}
                      </p>
                      {submission.score !== undefined && (
                        <p className="text-sm text-muted-foreground mb-4">
                          Score: {submission.score}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mb-6">
                        Submitted: {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : 'Recently'}
                      </p>
                      <div className="w-full bg-green-100 text-green-800 py-3 px-4 rounded-lg text-center font-medium">
                        ✓ Completed
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Study Materials */}
        <div className="px-4 sm:px-0 mb-8" data-section="study-materials">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-foreground mb-4 text-balance">Study Materials</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Access learning resources and study guides uploaded by your teachers
            </p>
          </div>
          
          {studyMaterials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {studyMaterials.map((material) => {
                console.log('🔍 Material debug:', { 
                  id: material.id, 
                  title: material.title, 
                  isUpdated: material.isUpdated, 
                  updatedAt: material.updatedAt 
                });
                return (
                <div key={material.id} className="group bg-card rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-border hover:border-primary/20 relative overflow-hidden">
                  {material.isUpdated && (
                    <div className="absolute top-4 right-4 z-10">
                      <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center space-x-1 animate-pulse">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>UPDATED</span>
                      </span>
                    </div>
                  )}
                  <div className="p-8 relative">
                    <div className="bg-secondary w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-8 h-8 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-foreground mb-3">{material.title}</h4>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {material.description || 'Study material provided by your teacher'}
                    </p>
                    {material.fileName && (
                      <p className="text-xs text-muted-foreground mb-4">
                        File: {material.fileName}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mb-2">
                      Uploaded: {material.uploadDate ? new Date(material.uploadDate).toLocaleDateString() : 'Recently'}
                    </p>
                    {material.isUpdated && material.updatedAt && (
                      <p className="text-xs text-green-600 mb-4 font-medium">
                        ✨ Updated: {new Date(material.updatedAt).toLocaleDateString()}
                      </p>
                    )}
                    <div className="mb-6"></div>
                    <button 
                      onClick={() => router.push(`/student/study-material/${material.id}`)}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-4 rounded-lg font-medium transition-colors duration-200 group-hover:scale-105"
                    >
                      View Material
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-card rounded-2xl shadow-sm border border-border p-8 text-center mb-8">
              <div className="bg-secondary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-3">No Study Materials Available</h4>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Your teachers haven't uploaded any study materials yet. Check back later!
              </p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="px-4 sm:px-0 mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-6">Recent Activity</h3>
          <div className="bg-card rounded-2xl shadow-sm border border-border">
            <div className="p-8 text-center">
              <div className="bg-secondary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-3">No Recent Activity</h4>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Your learning journey will appear here once you start engaging with lessons.
              </p>
              <div className="text-sm text-muted-foreground">
                Connect with your teacher to get started with personalized AI-powered learning.
              </div>
            </div>
          </div>
        </div>

        {/* Learning Benefits */}
        <div className="px-4 sm:px-0 mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-6">How AI Helps Your Learning</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
              <h4 className="font-semibold text-foreground mb-3">🎯 Personalized Insights</h4>
              <p className="text-muted-foreground">
                Get personalized feedback on your understanding and areas where you can improve.
              </p>
            </div>
            <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
              <h4 className="font-semibold text-foreground mb-3">📚 Adaptive Learning</h4>
              <p className="text-muted-foreground">
                Receive study materials and exercises tailored to your learning style and pace.
              </p>
            </div>
            <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
              <h4 className="font-semibold text-foreground mb-3">🔍 Misconception Detection</h4>
              <p className="text-muted-foreground">
                AI identifies and helps correct common misconceptions before they become learning barriers.
              </p>
            </div>
            <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
              <h4 className="font-semibold text-foreground mb-3">📈 Progress Tracking</h4>
              <p className="text-muted-foreground">
                Monitor your learning progress and celebrate your achievements along the way.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-4 sm:px-0">
          <h3 className="text-xl font-semibold text-foreground mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => {
                // Scroll to study materials section
                const studyMaterialsSection = document.querySelector('[data-section="study-materials"]');
                if (studyMaterialsSection) {
                  studyMaterialsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-card rounded-2xl shadow-sm border border-border p-6 text-left hover:border-primary/20 transition-all duration-200 group"
            >
              <div className="bg-primary/10 rounded-xl w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 className="font-semibold text-foreground mb-2">Study Materials</h4>
              <p className="text-muted-foreground text-sm">Access learning resources and study guides</p>
            </button>

            <button
              onClick={() => router.push('/student/progress')}
              className="bg-card rounded-2xl shadow-sm border border-border p-6 text-left hover:border-primary/20 transition-all duration-200 group"
            >
              <div className="bg-accent/10 rounded-xl w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="font-semibold text-foreground mb-2">Progress Report</h4>
              <p className="text-muted-foreground text-sm">View your learning progress and achievements</p>
            </button>

            <button
              onClick={() => router.push('/student/help')}
              className="bg-card rounded-2xl shadow-sm border border-border p-6 text-left hover:border-primary/20 transition-all duration-200 group"
            >
              <div className="bg-secondary/10 rounded-xl w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <svg className="w-6 h-6 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-foreground mb-2">Get Help</h4>
              <p className="text-muted-foreground text-sm">Find support and learning assistance</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}