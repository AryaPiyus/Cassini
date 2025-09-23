import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { clerkId, firstName, lastName } = await req.json();
    
    console.log('🔄 Updating user data:', { clerkId, firstName, lastName });
    
    if (!clerkId) {
      return NextResponse.json({ error: 'ClerkId is required' }, { status: 400 });
    }

    // First, try to find the user
    const existingUser = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!existingUser) {
      console.log('⚠️ User not found, creating new user with names');
      // If user doesn't exist, create it (webhook might be delayed)
      const newUser = await prisma.user.create({
        data: {
          clerkId,
          email: '', // Will be updated by webhook later
          username: `user_${clerkId.slice(-8)}`, // Temporary username
          firstName: firstName || null,
          lastName: lastName || null,
        }
      });
      
      console.log('✅ New user created:', newUser);
      return NextResponse.json({ 
        success: true, 
        user: newUser,
        action: 'created'
      });
    }

    // If user exists, update it
    const updatedUser = await prisma.user.update({
      where: { clerkId },
      data: {
        firstName: firstName || null,
        lastName: lastName || null,
      },
    });

    console.log('✅ User updated successfully:', updatedUser);
    
    return NextResponse.json({ 
      success: true, 
      user: updatedUser,
      action: 'updated'
    });
    
  } catch (error: any) {
    console.error('❌ Error updating user:', error);
    
    return NextResponse.json({ 
      error: 'Failed to update user', 
      details: error?.message 
    }, { status: 500 });
  }
}
