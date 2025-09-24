import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import StudyMaterial from '../../../models/StudyMaterial';
import AIAnalysis from '../../../models/AIAnalysis';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { testId, materialId } = await req.json();
    
    console.log('🔍 AI Improve Material API - Received:', { testId, materialId });
    
    if (!testId || !materialId) {
      return NextResponse.json(
        { error: 'Missing testId or materialId' },
        { status: 400 }
      );
    }

    // Get the analysis data
    const analysis = await AIAnalysis.findOne({ testId }).sort({ analysisDate: -1 });
    console.log('🔍 AI Improve Material API - Analysis found:', !!analysis);
    if (!analysis) {
      return NextResponse.json(
        { error: 'No analysis found for this test' },
        { status: 404 }
      );
    }

    // Get the original material
    const material = await StudyMaterial.findById(materialId);
    console.log('🔍 AI Improve Material API - Material found:', !!material);
    if (!material) {
      return NextResponse.json(
        { error: 'Material not found' },
        { status: 404 }
      );
    }

    // Generate improved content document
    const improvedDocument = generateImprovedDocument(material, analysis);
    
    // Return downloadable content
    return NextResponse.json({
      success: true,
      content: improvedDocument,
      filename: `${material.title.replace(/[^a-zA-Z0-9]/g, '_')}_AI_Improved.txt`
    });

  } catch (error) {
    console.error('Error generating improved material:', error);
    return NextResponse.json(
      { error: 'Failed to generate improved material' },
      { status: 500 }
    );
  }
}

function generateImprovedDocument(material: any, analysis: any): string {
  const date = new Date().toLocaleDateString();
  
  let document = `AI-IMPROVED STUDY MATERIAL
Generated on: ${date}
Original Material: ${material.title}

==============================================
INSTRUCTIONS FOR TEACHER:
==============================================
1. Review the improvements suggested below
2. Edit and enhance the content as you see fit
3. Use the "Update Materials" feature to upload your final version
4. Students will see the updated material with an "UPDATED" marker

==============================================
ORIGINAL CONTENT:
==============================================
${material.content || material.description || 'No content available'}

==============================================
AI ANALYSIS SUMMARY:
==============================================
- Misconceptions Found: ${analysis.studentMisconceptions?.length || 0}
- Content Guidance Points: ${analysis.contentGuidance?.length || 0}
- Overall Insights: ${analysis.overallInsights?.length || 0}

==============================================
MISCONCEPTIONS TO ADDRESS:
==============================================
`;

  if (analysis.studentMisconceptions && analysis.studentMisconceptions.length > 0) {
    analysis.studentMisconceptions.forEach((misc: any, index: number) => {
      document += `
${index + 1}. CONCEPT: ${misc.concept}
   MISCONCEPTION: ${misc.misconception}
   SEVERITY: ${misc.severity}
   STUDENTS AFFECTED: ${misc.studentsAffected?.join(', ') || 'Unknown'}
   
   SUGGESTED IMPROVEMENT:
   - Add clear explanation about ${misc.concept}
   - Include examples that differentiate correct vs incorrect understanding
   - Consider adding practice questions that address this specific misconception
   
   ${'-'.repeat(50)}`;
    });
  } else {
    document += `No specific misconceptions identified.`;
  }

  document += `

==============================================
CONTENT IMPROVEMENT GUIDANCE:
==============================================
`;

  if (analysis.contentGuidance && analysis.contentGuidance.length > 0) {
    analysis.contentGuidance.forEach((guidance: any, index: number) => {
      document += `
${index + 1}. SECTION: ${guidance.section || 'General'}
   ${guidance.pageNumber ? `PAGE: ${guidance.pageNumber}` : ''}
   
   CURRENT CONTENT:
   ${guidance.currentContent || 'Not specified'}
   
   ISSUES IDENTIFIED:
   ${guidance.issues?.map((issue: string) => `   • ${issue}`).join('\n') || '   • No specific issues listed'}
   
   SPECIFIC IMPROVEMENTS:
   ${guidance.specificImprovements?.map((imp: string) => `   ✓ ${imp}`).join('\n') || '   ✓ No specific improvements listed'}
   
   PRIORITY: ${guidance.priority || 'Medium'}
   
   ${'-'.repeat(50)}`;
    });
  } else {
    document += `No specific content guidance available.`;
  }

  document += `

==============================================
OVERALL INSIGHTS:
==============================================
`;

  if (analysis.overallInsights && analysis.overallInsights.length > 0) {
    analysis.overallInsights.forEach((insight: string, index: number) => {
      document += `${index + 1}. ${insight}\n`;
    });
  } else {
    document += `No overall insights available.`;
  }

  document += `

==============================================
RECOMMENDED NEXT STEPS:
==============================================
1. Review each misconception and add clarifying content
2. Implement the specific improvements suggested above
3. Add examples and practice exercises where needed
4. Consider the priority levels when deciding what to address first
5. Test the improved content with students to ensure clarity

==============================================
END OF AI-GENERATED IMPROVEMENT REPORT
==============================================
`;

  return document;
}