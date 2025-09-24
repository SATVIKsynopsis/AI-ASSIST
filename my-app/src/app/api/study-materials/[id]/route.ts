import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import StudyMaterial from '@/models/StudyMaterial'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const { id } = params
    const updateData = await request.json()

    const updatedMaterial = await StudyMaterial.findByIdAndUpdate(
      id,
      {
        ...updateData,
        updatedAt: new Date(),
        isUpdated: true
      },
      { new: true }
    )

    if (!updatedMaterial) {
      return NextResponse.json(
        { error: 'Material not found' },
        { status: 404 }
      )
    }

    // Transform _id to id for frontend compatibility
    const transformedMaterial = {
      ...updatedMaterial.toObject(),
      id: updatedMaterial._id.toString()
    }

    return NextResponse.json({
      success: true,
      material: transformedMaterial
    })

  } catch (error) {
    console.error('Update study material error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const { id } = params
    const formData = await request.formData()
    
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const file = formData.get('file') as File
    const teacherId = formData.get('teacherId') as string

    if (!title || !file || !teacherId) {
      return NextResponse.json(
        { error: 'Title, file, and teacherId are required' },
        { status: 400 }
      )
    }

    // Read file content
    const fileContent = await file.text()

    // Update the material with new content
    const updatedMaterial = await StudyMaterial.findByIdAndUpdate(
      id,
      {
        title,
        description: description || '',
        content: fileContent,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        teacherId,
        isUpdated: true,
        updatedAt: new Date(),
        uploadDate: new Date() // Update the upload date as well
      },
      { new: true }
    )

    if (!updatedMaterial) {
      return NextResponse.json(
        { error: 'Material not found' },
        { status: 404 }
      )
    }

    // Transform _id to id for frontend compatibility
    const transformedMaterial = {
      ...updatedMaterial.toObject(),
      id: updatedMaterial._id.toString()
    }

    return NextResponse.json({
      success: true,
      material: transformedMaterial,
      message: 'Material updated successfully'
    })

  } catch (error) {
    console.error('Update material error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const { id } = params

    const material = await StudyMaterial.findById(id)

    if (!material) {
      return NextResponse.json(
        { error: 'Material not found' },
        { status: 404 }
      )
    }

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
    console.error('Get study material error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
