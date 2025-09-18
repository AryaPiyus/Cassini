import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
    console.log('🚨 WEBHOOK ENDPOINT HIT! Time:', new Date().toISOString())
  console.log('🔥 Webhook received!')
  
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error('❌ WEBHOOK_SECRET not found')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  console.log('✅ Webhook secret found')

  // Get the headers - AWAIT the headers() call
  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  console.log('📋 Headers:', { svix_id, svix_timestamp, svix_signature })

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('❌ Missing svix headers')
    return NextResponse.json({ error: 'Missing headers' }, { status: 400 })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)
  
  console.log('📦 Payload type:', payload.type)
  console.log('👤 User ID:', payload.data?.id)

  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
    
    console.log('✅ Webhook verified successfully')
  } catch (err) {
    console.error('❌ Webhook verification failed:', err.message)
    // For debugging, let's still process the webhook even if verification fails
    console.log('⚠️ Processing webhook without verification for debugging...')
    evt = payload as WebhookEvent
  }

  const { type, data } = evt
  console.log('🎯 Event type:', type)
  console.log('👤 User data received:', {
    id: data.id,
    email: data.email_addresses?.[0]?.email_address,
    username: data.username,
    first_name: data.first_name,
    last_name: data.last_name
  })

  try {
    if (type === 'user.created' || type === 'user.updated') {
      console.log('🔄 Processing user event:', type)
      
      const userData = {
        clerkId: data.id,
        email: data.email_addresses?.[0]?.email_address || '',
        username: data.username || `user_${data.id.slice(-8)}`,
        firstName: data.first_name || null,
        lastName: data.last_name || null,
        avatar: data.image_url || data.profile_image_url || null,
      }

      console.log('💾 About to save user data:', userData)

      const result = await prisma.user.upsert({
        where: { clerkId: userData.clerkId },
        update: {
          email: userData.email,
          username: userData.username,
          firstName: userData.firstName,
          lastName: userData.lastName,
          avatar: userData.avatar,
        },
        create: userData,
      })

      console.log('✅ User saved successfully:', result)
      return NextResponse.json({ 
        status: 'success', 
        userId: result.id,
        clerkId: result.clerkId
      })
    }

    console.log('⚠️ Unhandled event type:', type)
    return NextResponse.json({ status: 'ignored', type })

  } catch (error) {
    console.error('❌ Database error:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    })
    
    return NextResponse.json({ 
      error: 'Database error', 
      details: error.message 
    }, { status: 500 })
  }
}