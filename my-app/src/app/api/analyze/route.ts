import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { extractTextFromPDF, isValidPDF } from '@/lib/pdf';
import { AnalysisResponse } from '@/types';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const studentAnswers = formData.get('studentAnswers') as string;

    // Validate inputs
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    if (!studentAnswers || studentAnswers.trim().length === 0) {
      return NextResponse.json(
        { error: 'Student answers are required' },
        { status: 400 }
      );
    }

    // Convert file to buffer and validate
    const buffer = Buffer.from(await file.arrayBuffer());
    
    if (!isValidPDF(buffer)) {
      return NextResponse.json(
        { error: 'Invalid PDF file format' },
        { status: 400 }
      );
    }

    // Extract text from PDF
    let slideText: string;
    try {
      slideText = await extractTextFromPDF(buffer);
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'Failed to extract text from PDF',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 400 }
      );
    }

    // Create structured prompt for OpenAI
    const prompt = `As an AI Teacher Assistant, analyze the following educational content and provide insights:

**SLIDE CONTENT:**
${slideText}

**STUDENT ANSWERS:**
${studentAnswers}

Please provide a comprehensive analysis in JSON format with the following structure:
{
  "misconceptions": ["List of specific student misconceptions identified"],
  "slideWeaknesses": ["Areas where slides could be improved for clarity"],
  "improvements": ["Specific suggestions to enhance the slides"],
  "summary": "A brief overview of the analysis and key recommendations"
}

Focus on:
1. Identifying gaps between what slides teach and what students understand
2. Common misconceptions revealed in student responses  
3. Missing examples, visuals, or explanations in slides
4. Concrete, actionable improvements for the teacher

Respond ONLY with valid JSON - no additional text or markdown formatting.`;

    // Call OpenAI GPT-4o
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert educational AI assistant that analyzes teaching materials and student responses to identify learning gaps and suggest improvements. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      return NextResponse.json(
        { error: 'No response received from AI' },
        { status: 500 }
      );
    }

    // Parse AI response
    let analysisResult;
    try {
      analysisResult = JSON.parse(responseText);
      
      // Validate the response structure
      if (!analysisResult.misconceptions || !Array.isArray(analysisResult.misconceptions) ||
          !analysisResult.slideWeaknesses || !Array.isArray(analysisResult.slideWeaknesses) ||
          !analysisResult.improvements || !Array.isArray(analysisResult.improvements) ||
          !analysisResult.summary || typeof analysisResult.summary !== 'string') {
        throw new Error('Invalid response structure from AI');
      }
    } catch (error) {
      console.error('Failed to parse AI response:', responseText);
      return NextResponse.json(
        { error: 'Failed to parse AI analysis results' },
        { status: 500 }
      );
    }

    // Return successful response
    const response: AnalysisResponse = {
      misconceptions: analysisResult.misconceptions,
      slideWeaknesses: analysisResult.slideWeaknesses,
      improvements: analysisResult.improvements,
      summary: analysisResult.summary,
      success: true
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'OpenAI API authentication failed' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}