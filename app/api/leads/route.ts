import { NextRequest, NextResponse } from 'next/server'
import { writeClient } from '../../../sanity/lib/writeClient'

export async function POST(req: NextRequest) {
  try {
    const { phone, source, whatsappOptIn } = await req.json()

    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    // Store lead in Sanity
    await writeClient.create({
      _type: 'lead',
      phone,
      source: source || 'contact-form',
      whatsappOptIn: whatsappOptIn ?? false,
      submittedAt: new Date().toISOString(),
    })

    // TODO (Phase 3C): If whatsappOptIn, call AiSensy API here to send
    // confirmation to customer and alert to Prem Sahni.
    // Requires: AISENSY_API_KEY in .env.local + approved message templates.

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Lead submission error:', err)
    return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 })
  }
}
