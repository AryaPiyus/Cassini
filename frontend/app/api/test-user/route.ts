import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    const testUser = await prisma.user.create({
      data: {
        clerkId: `test_${Date.now()}`,
        email: body.email || 'test@example.com',
        username: body.username || 'testuser',
        firstName: body.firstName || 'Test',
        lastName: body.lastName || 'User',
        avatar: null,
      }
    })

    return NextResponse.json({ 
      success: true, 
      user: testUser 
    })
  } catch (error) {
    console.error('Test user creation error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const users = await prisma.user.findMany()
    const count = await prisma.user.count()
    
    return NextResponse.json({ 
      success: true, 
      count,
      users 
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}