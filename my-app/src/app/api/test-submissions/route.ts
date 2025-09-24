import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../lib/mongodb'
import TestSubmission from '../../../models/TestSubmission'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const testId = searchParams.get('testId')
    const studentId = searchParams.get('studentId')

    let query: any = {}
    
    if (testId) query.testId = testId
    if (studentId) query.studentId = studentId

    const submissions = await TestSubmission.find(query)
      .populate('studentId', 'name email')
      .populate('testId', 'title')
      .sort({ createdAt: -1 })
    
    // Transform _id to id for frontend compatibility
    const transformedSubmissions = submissions.map(submission => ({
      ...submission.toObject(),
      id: submission._id.toString()
    }))
    
    return NextResponse.json({
      success: true,
      submissions: transformedSubmissions
    })
    
  } catch (error) {
    console.error('Get test submissions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const submissionData = await request.json()

    console.log('🔍 Test Submission API - Received data:', JSON.stringify(submissionData, null, 2))
    
    // Check if student has already submitted this test
    const existingSubmission = await TestSubmission.findOne({
      testId: submissionData.testId,
      studentId: submissionData.studentId
    })
    
    if (existingSubmission) {
      return NextResponse.json(
        { error: 'You have already submitted this test' },
        { status: 400 }
      )
    }
    
    const submission = new TestSubmission(submissionData)
    console.log('🔍 Test Submission API - Created submission object:', submission)
    
    await submission.save()
    console.log('🔍 Test Submission API - Saved submission successfully')
    
    // Transform _id to id for frontend compatibility
    const transformedSubmission = {
      ...submission.toObject(),
      id: submission._id.toString()
    }
    
    return NextResponse.json({
      success: true,
      submission: transformedSubmission
    })
    
  } catch (error) {
    console.error('Create test submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}