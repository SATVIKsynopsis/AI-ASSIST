import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const { email, password, role } = await request.json()

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check password (for demo, we'll use plain text comparison)
    // In production, use bcrypt.compare(password, user.password)
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check role matches
    if (user.role !== role) {
      return NextResponse.json(
        { error: 'Invalid role for this user' },
        { status: 401 }
      )
    }

    // Return user data (exclude password)
    const { password: _, ...userWithoutPassword } = user.toObject()
    
    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    })
    
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}