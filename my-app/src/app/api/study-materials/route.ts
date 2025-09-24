import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import StudyMaterial from '@/models/StudyMaterial'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')
    const studentAccess = searchParams.get('studentAccess')

    // If student access is requested, return all materials
    if (studentAccess === 'true') {
      const materials = await StudyMaterial.find({}).sort({ createdAt: -1 })
      
      // Transform _id to id for frontend compatibility
      const transformedMaterials = materials.map(material => ({
        ...material.toObject(),
        id: material._id.toString()
      }))
      
      return NextResponse.json({
        success: true,
        materials: transformedMaterials
      })
    }

    if (!teacherId) {
      return NextResponse.json(
        { error: 'Teacher ID is required' },
        { status: 400 }
      )
    }

    const materials = await StudyMaterial.find({ teacherId }).sort({ createdAt: -1 })
    
    // Transform _id to id for frontend compatibility
    const transformedMaterials = materials.map(material => ({
      ...material.toObject(),
      id: material._id.toString()
    }))
    
    return NextResponse.json({
      success: true,
      materials: transformedMaterials
    })
    
  } catch (error) {
    console.error('Get study materials error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const materialData = await request.json()

    const material = new StudyMaterial(materialData)
    await material.save()
    
    // Transform _id to id for frontend compatibility
    const transformedMaterial = {
      ...material.toObject(),
      id: material._id.toString()
    }
    
    return NextResponse.json({
      success: true,
      material: transformedMaterial
    })
    
  } catch (error) {
    console.error('Create study material error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}