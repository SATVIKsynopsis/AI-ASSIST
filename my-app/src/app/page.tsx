"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const handleGetStarted = () => {
    router.push("/auth/login")
  }

  const handleWatchDemo = () => {
    router.push("/teacher/demo")
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary p-2 rounded-lg">
                <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z"
                  />
                </svg>
              </div>
              <span className="text-xl font-semibold text-foreground">AI-ASSIST</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground font-medium transition-colors">
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-muted-foreground hover:text-foreground font-medium transition-colors"
              >
                How it Works
              </a>
              <button
                onClick={handleGetStarted}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-accent/10"></div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
          <div
            className={`transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <div className="inline-flex items-center space-x-2 bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-medium mb-8">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Powered by GPT-4o AI Technology</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight text-balance">
              Transform Your Teaching
              <span className="block text-primary">with AI Insights</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed text-pretty">
              The first AI assistant that analyzes student responses, identifies misconceptions, and provides
              <span className="text-foreground font-medium"> instant teaching improvements</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                onClick={handleGetStarted}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-all duration-200 flex items-center space-x-2"
              >
                <span>Start Free Analysis</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button
                onClick={handleWatchDemo}
                className="border border-border text-foreground px-8 py-3 rounded-lg font-medium hover:bg-accent transition-all duration-200 flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <span>Watch Demo</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-muted-foreground">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium">No Credit Card Required</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium">Real-time Analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium">Trusted by Educators</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-destructive/10 text-destructive px-4 py-2 rounded-full text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <span>The Teaching Challenge</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight text-balance">
              Stop Teaching in the
              <span className="block text-destructive">Dark</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed text-pretty">
              You spend hours creating lessons, but have no idea if students actually understand.
              <span className="text-foreground font-medium"> Traditional feedback comes too late</span> to make a real
              difference.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-xl border border-border">
              <div className="bg-destructive/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-4">Silent Confusion</h3>
              <p className="text-muted-foreground leading-relaxed">
                Students sit quietly with misconceptions you never discover until it's exam time and grades suffer.
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl border border-border">
              <div className="bg-chart-2/20 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-chart-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-4">Wasted Time</h3>
              <p className="text-muted-foreground leading-relaxed">
                Hours spent creating materials that miss the mark because you don't know what students actually struggle
                with.
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl border border-border">
              <div className="bg-chart-1/20 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-chart-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.467-.881-6.08-2.33"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-4">Generic Feedback</h3>
              <p className="text-muted-foreground leading-relaxed">
                One-size-fits-all teaching approaches that don't address individual learning gaps and misconceptions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Features */}
      <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/90"></div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-primary-foreground/10 backdrop-blur-sm text-primary-foreground px-4 py-2 rounded-full text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>The AI Solution</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight text-balance">
              Instant Teaching
              <span className="block text-chart-1">Superpowers</span>
            </h2>
            <p className="text-lg text-primary-foreground/80 max-w-3xl mx-auto leading-relaxed text-pretty">
              Get real-time insights into every student's understanding and
              <span className="text-primary-foreground font-medium"> transform confusion into clarity instantly</span>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-primary-foreground/10 backdrop-blur-sm p-8 rounded-xl border border-primary-foreground/20 hover:bg-primary-foreground/20 transition-all duration-300">
              <div className="bg-chart-3/20 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-chart-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Mind-Reading AI Analysis</h3>
              <p className="text-primary-foreground/80 leading-relaxed mb-6">
                Our GPT-4o AI instantly analyzes every student response, identifying misconceptions and knowledge gaps
                in real-time.
              </p>
              <div className="flex items-center space-x-2 text-chart-1 font-medium text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Instant Detection</span>
              </div>
            </div>

            <div className="bg-primary-foreground/10 backdrop-blur-sm p-8 rounded-xl border border-primary-foreground/20 hover:bg-primary-foreground/20 transition-all duration-300">
              <div className="bg-chart-4/20 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-chart-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Precision Insights</h3>
              <p className="text-primary-foreground/80 leading-relaxed mb-6">
                Get specific, actionable recommendations on exactly what concepts to reinforce and how to fix learning
                gaps.
              </p>
              <div className="flex items-center space-x-2 text-chart-1 font-medium text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Targeted Action Plans</span>
              </div>
            </div>

            <div className="bg-primary-foreground/10 backdrop-blur-sm p-8 rounded-xl border border-primary-foreground/20 hover:bg-primary-foreground/20 transition-all duration-300">
              <div className="bg-chart-5/20 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-chart-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Lightning-Fast Results</h3>
              <p className="text-primary-foreground/80 leading-relaxed mb-6">
                No more waiting weeks for feedback. Adjust your teaching approach immediately while the lesson is still
                fresh.
              </p>
              <div className="flex items-center space-x-2 text-chart-1 font-medium text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
                </svg>
                <span>Real-time Adjustments</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Simple 3-Step Process</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight text-balance">
              From Confusion to
              <span className="block text-primary">Clarity in Minutes</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed text-pretty">
              Our AI does the heavy lifting while you focus on what matters most:
              <span className="text-foreground font-medium">great teaching</span>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
            <div className="text-center">
              <div className="bg-primary text-primary-foreground w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-semibold text-card-foreground mb-4">Upload & Share</h3>
                <div className="bg-muted p-4 rounded-lg mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-accent p-2 rounded-lg">
                      <svg
                        className="w-5 h-5 text-accent-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <span className="text-muted-foreground font-medium text-sm">Drag & drop your slides</span>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Upload your lesson slides and let students answer questions during or after class
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-primary text-primary-foreground w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-semibold text-card-foreground mb-4">AI Analysis</h3>
                <div className="bg-muted p-4 rounded-lg mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-accent p-2 rounded-lg">
                      <svg
                        className="w-5 h-5 text-accent-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <span className="text-muted-foreground font-medium text-sm">GPT-4o processes everything</span>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Our AI identifies misconceptions, compares student understanding, and analyzes your slides
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-primary text-primary-foreground w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-semibold text-card-foreground mb-4">Get Insights</h3>
                <div className="bg-muted p-4 rounded-lg mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-accent p-2 rounded-lg">
                      <svg
                        className="w-5 h-5 text-accent-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <span className="text-muted-foreground font-medium text-sm">Actionable recommendations</span>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Receive specific improvements for your slides and targeted teaching strategies
                </p>
              </div>
            </div>
          </div>

          {/* Results Preview */}
          <div className="bg-card border border-border rounded-xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold text-card-foreground mb-4">See Real Results</h3>
              <p className="text-muted-foreground">Here's what teachers discover about their lessons:</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-muted/50 p-6 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="bg-destructive w-3 h-3 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-destructive mb-2">Misconception Detected</h4>
                    <p className="text-muted-foreground text-sm">
                      "Demo Student confused artificial intelligence with machine learning - needs clarification on the
                      distinction"
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-muted/50 p-6 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="bg-chart-5 w-3 h-3 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-chart-5 mb-2">Improvement Suggestion</h4>
                    <p className="text-muted-foreground text-sm">
                      "Add visual comparison chart showing AI vs ML with concrete examples to slide 3"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-chart-5/20 text-chart-5 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>Loved by Educators</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight text-balance">
              Teachers Are
              <span className="block text-primary">Raving About It</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-card p-8 rounded-xl border border-border">
              <div className="flex items-center mb-6">
                <div className="bg-primary w-12 h-12 rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                  S
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-card-foreground">Dr. Sarah Chen</h4>
                  <p className="text-muted-foreground text-sm">Computer Science Professor</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-chart-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed italic">
                "This tool revealed gaps in my teaching I never knew existed. My students' understanding improved
                dramatically after implementing the AI suggestions."
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl border border-border">
              <div className="flex items-center mb-6">
                <div className="bg-primary w-12 h-12 rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                  M
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-card-foreground">Prof. Michael Rodriguez</h4>
                  <p className="text-muted-foreground text-sm">Engineering Department</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-chart-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed italic">
                "I save 5 hours per week on grading and get insights that would take months to discover manually.
                Absolutely game-changing!"
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl border border-border">
              <div className="flex items-center mb-6">
                <div className="bg-primary w-12 h-12 rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                  L
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-card-foreground">Dr. Lisa Thompson</h4>
                  <p className="text-muted-foreground text-sm">Mathematics Professor</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-chart-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed italic">
                "The AI caught misconceptions in my calculus course that I missed completely. Student performance
                increased by 23% this semester."
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">98%</div>
              <p className="text-muted-foreground font-medium text-sm">Accuracy Rate</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-chart-4 mb-2">5hrs</div>
              <p className="text-muted-foreground font-medium text-sm">Time Saved Weekly</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-chart-5 mb-2">23%</div>
              <p className="text-muted-foreground font-medium text-sm">Performance Boost</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-chart-2 mb-2">1000+</div>
              <p className="text-muted-foreground font-medium text-sm">Happy Teachers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/90"></div>

        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 bg-primary-foreground/10 backdrop-blur-sm text-primary-foreground px-4 py-2 rounded-full text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Limited Time - Free Beta Access</span>
            </div>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight text-balance">
            Stop Guessing.
            <span className="block text-chart-1">Start Knowing.</span>
          </h2>

          <p className="text-lg text-primary-foreground/80 mb-10 max-w-2xl mx-auto leading-relaxed text-pretty">
            Join <span className="text-primary-foreground font-semibold">1,000+ educators</span> who've already
            discovered their teaching superpowers
          </p>

          <div className="mb-12">
            <button
              onClick={handleGetStarted}
              className="bg-chart-1 text-primary px-10 py-4 rounded-lg font-semibold text-lg hover:bg-chart-1/90 transform hover:scale-105 transition-all duration-300 inline-flex items-center space-x-3"
            >
              <span>Get Your Free Analysis</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center justify-center space-x-2">
              <div className="bg-chart-5 w-5 h-5 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-primary-foreground/80 font-medium text-sm">Setup in 2 minutes</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="bg-chart-5 w-5 h-5 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-primary-foreground/80 font-medium text-sm">No credit card needed</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="bg-chart-5 w-5 h-5 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-primary-foreground/80 font-medium text-sm">Instant results</span>
            </div>
          </div>

          <p className="text-primary-foreground/60 text-sm">
            🚀 <span className="font-medium">Free during beta</span> - Full access to all features
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-16 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-primary p-2 rounded-lg">
                  <svg
                    className="w-6 h-6 text-primary-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z"
                    />
                  </svg>
                </div>
                <span className="text-xl font-semibold text-card-foreground">AI-ASSIST</span>
              </div>
              <p className="text-muted-foreground leading-relaxed max-w-md mb-6">
                Empowering educators worldwide with AI-driven insights to create exceptional learning experiences.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="bg-muted p-3 rounded-lg hover:bg-accent transition-colors">
                  <svg className="w-5 h-5 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="bg-muted p-3 rounded-lg hover:bg-accent transition-colors">
                  <svg className="w-5 h-5 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-card-foreground font-semibold mb-4">Product</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    How it Works
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-card-foreground font-semibold mb-4">Support</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border text-center">
            <p className="text-muted-foreground text-sm">
              © 2025 AI-ASSIST. Made with ❤️ for educators worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
