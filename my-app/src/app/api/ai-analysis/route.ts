import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import AIAnalysis from '../../../models/AIAnalysis';
import StudyMaterial from '../../../models/StudyMaterial';

// GET - Fetch AI analyses
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const url = new URL(req.url);
    const testId = url.searchParams.get('testId');
    const teacherId = url.searchParams.get('teacherId');
    
    let query: any = {};
    if (testId) query.testId = testId;
    if (teacherId) query.teacherId = teacherId;
    
    const analyses = await AIAnalysis.find(query).sort({ analysisDate: -1 });
    
    // Transform _id to id for frontend compatibility
    const transformedAnalyses = analyses.map(analysis => ({
      ...analysis.toObject(),
      id: analysis._id.toString()
    }))
    
    return NextResponse.json(transformedAnalyses);
  } catch (error) {
    console.error('Error fetching AI analyses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI analyses' },
      { status: 500 }
    );
  }
}

// POST - Create new AI analysis
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const data = await req.json();
    console.log('🔍 AI Analyses API - Received data for saving:', JSON.stringify(data, null, 2));
    
    const newAnalysis = new AIAnalysis({
      testId: data.testId,
      materialId: data.materialId,
      teacherId: data.teacherId,
      studentMisconceptions: data.studentMisconceptions,
      contentGuidance: data.contentGuidance,
      overallInsights: data.overallInsights,
      recommendedActions: data.recommendedActions || []
    });
    
    console.log('🔍 AI Analyses API - Created new analysis object:', newAnalysis);
    
    const savedAnalysis = await newAnalysis.save();
    
    // Transform _id to id for frontend compatibility
    const transformedAnalysis = {
      ...savedAnalysis.toObject(),
      id: savedAnalysis._id.toString()
    }
    
    console.log('🔍 AI Analyses API - Analysis saved successfully');
    return NextResponse.json(transformedAnalysis, { status: 201 });
  } catch (error) {
    console.error('🔍 AI Analyses API - Error creating AI analysis:', error);
    console.error('🔍 AI Analyses API - Error details:', error.message);
    console.error('🔍 AI Analyses API - Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Failed to create AI analysis' },
      { status: 500 }
    );
  }
}