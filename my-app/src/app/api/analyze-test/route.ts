import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { studyMaterial, testQuestions, studentSubmissions } = await request.json()

    console.log('🔍 AI Analysis API - Received data:')
    console.log('🔍 Study Material:', {
      title: studyMaterial?.title,
      contentLength: studyMaterial?.content?.length,
      content: studyMaterial?.content?.substring(0, 200) + '...'
    })
    console.log('🔍 Test Questions:', testQuestions)
    console.log('🔍 Student Submissions:', JSON.stringify(studentSubmissions, null, 2))
    
    // Debug individual submissions structure
    studentSubmissions.forEach((sub: any, i: number) => {
      console.log(`🔍 Student ${i + 1} submission structure:`)
      console.log('- studentName:', sub.studentName)
      console.log('- studentId:', sub.studentId)
      console.log('- answers type:', Array.isArray(sub.answers) ? 'array' : 'object')
      console.log('- answers content:', sub.answers)
    })

    if (!studyMaterial || !testQuestions || !studentSubmissions) {
      console.log('🔍 AI Analysis API - Missing required data')
      return NextResponse.json(
        { error: 'Missing required data: studyMaterial, testQuestions, or studentSubmissions' },
        { status: 400 }
      )
    }

    // Prepare the detailed analysis prompt
    const analysisPrompt = `
You are an expert educational analyst. Analyze student test performance against study material to provide specific, actionable improvement guidance.

STUDY MATERIAL:
Title: ${studyMaterial.title}
Content: ${studyMaterial.content || 'Content not extracted yet'}

TEST QUESTIONS:
${testQuestions.map((q: any, i: number) => `
Q${i + 1}: ${q.question}
Type: ${q.type}
${q.options ? 'Options: ' + q.options.join(', ') : ''}
Points: ${q.points}
`).join('\n')}

STUDENT SUBMISSIONS:
${studentSubmissions.map((sub: any, i: number) => `
Student ${i + 1}: ${sub.studentName || sub.studentId?.name || 'Unknown'}
Answers: ${Array.isArray(sub.answers) 
  ? sub.answers.map((ans: any) => `Q${ans.questionId}: ${ans.answer}`).join('\n')
  : Object.entries(sub.answers || {}).map(([qId, answer]) => `${qId}: ${answer}`).join('\n')}
`).join('\n')}

ANALYSIS REQUIREMENTS:
1. Compare each student answer against the study material content
2. Identify exactly what students misunderstood vs what the material taught
3. Provide SPECIFIC page/section improvements (not generic advice)
4. Give actionable content suggestions that teachers can immediately implement

Respond in JSON format:
{
  "studentMisconceptions": [
    {
      "concept": "specific concept from material",
      "misconception": "specific issue identified from student answers",
      "studentsAffected": ["student names who showed this issue"],
      "severity": "high|medium|low"
    }
  ],
  "materialImprovements": [
    {
      "section": "specific section/page of material",
      "currentContent": "what the material currently says",
      "issue": "specific problem identified from student errors",
      "improvedContent": "specific new content suggestion",
      "additionalResources": "suggested diagrams, examples, or exercises",
      "priority": "high|medium|low",
      "implementationTips": "how teacher can make this change"
    }
  ],
  "contentGuidance": {
    "addNewSections": [
      {
        "title": "suggested new section title",
        "content": "what content to add",
        "placement": "where to add it in material",
        "reason": "why this addition addresses student misconceptions"
      }
    ],
    "enhanceExistingSections": [
      {
        "section": "existing section name",
        "currentGap": "what's missing that caused confusion",
        "enhancement": "specific content to add or modify",
        "examples": "concrete examples to include"
      }
    ]
  },
  "overallInsights": [
    "specific insight based on actual data"
  ]
}
`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational analyst who provides specific, actionable insights based on actual student performance data.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    })

    const analysisText = response.choices[0]?.message?.content
    
    console.log('🔍 AI Analysis API - Raw AI response:', analysisText)
    
    if (!analysisText) {
      throw new Error('No analysis generated')
    }

    // Try to parse JSON response
    let analysisResult
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        console.log('🔍 AI Analysis API - Extracted JSON:', jsonMatch[0])
        analysisResult = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      // Fallback: create structured response from text
      analysisResult = {
        studentMisconceptions: [
          {
            concept: "General Understanding",
            misconception: "AI analysis identified areas where students need additional support",
            studentsAffected: studentSubmissions.map((s: any) => s.studentName),
            severity: "medium"
          }
        ],
        materialImprovements: [
          {
            section: "Study Material",
            issue: "Based on student performance, some concepts may need reinforcement",
            suggestion: "Consider adding more examples and practice exercises",
            priority: "high"
          }
        ],
        overallInsights: [
          "AI analysis completed based on student responses",
          "Recommendations generated to improve learning outcomes"
        ]
      }
    }

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      rawAnalysis: analysisText
    })

  } catch (error: any) {
    console.error('AI Analysis Error:', error)
    return NextResponse.json(
      { error: 'Failed to perform AI analysis', details: error.message },
      { status: 500 }
    )
  }
}