import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../lib/mongodb'
import Test from '../../../models/Test'
import StudyMaterial from '../../../models/StudyMaterial'
import User from '../../../models/User'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')
    const studentAccess = searchParams.get('studentAccess')

    let tests
    
    if (teacherId) {
      // Get tests created by teacher
      tests = await Test.find({ teacherId }).populate('materialId', 'title').sort({ createdAt: -1 })
    } else if (studentAccess === 'true') {
      // Get active tests for students
      tests = await Test.find({ status: 'active' }).populate('teacherId', 'name').populate('materialId', 'title').sort({ createdAt: -1 })
    } else {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      )
    }
    
    // Transform _id to id for frontend compatibility
    const transformedTests = tests.map(test => {
      const testObj = test.toObject()
      const transformedQuestions = testObj.questions.map((question: any) => ({
        ...question,
        id: question._id.toString()
      }))
      
      console.log('🔍 Debug API - Original questions:', testObj.questions)
      console.log('🔍 Debug API - Transformed questions:', transformedQuestions)
      
      return {
        ...testObj,
        id: test._id.toString(),
        questions: transformedQuestions
      }
    })
    
    return NextResponse.json({
      success: true,
      tests: transformedTests
    })
    
  } catch (error) {
    console.error('Get tests error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const testData = await request.json()

    const test = new Test(testData)
    await test.save()
    
    // Transform _id to id for frontend compatibility
    const testObj = test.toObject()
    const transformedTest = {
      ...testObj,
      id: test._id.toString(),
      questions: testObj.questions.map((question: any) => ({
        ...question,
        id: question._id.toString()
      }))
    }
    
    return NextResponse.json({
      success: true,
      test: transformedTest
    })
    
  } catch (error) {
    console.error('Create test error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}