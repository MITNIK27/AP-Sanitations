import { NextRequest, NextResponse } from 'next/server'
import { writeClient } from '../../../sanity/lib/writeClient'
import { sendLeadNotification, sendEnrichmentNotification, sendUserConfirmation } from '../../../lib/email'

export async function POST(req: NextRequest) {
  try {
    const { phone, source, whatsappOptIn } = await req.json()

    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    // 1. Dedup: return existing lead if the same phone submitted within the last 15 minutes
    const cutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString()
    const existing = await writeClient.fetch<{ _id: string } | null>(
      `*[_type == "lead" && phone == $phone && submittedAt > $cutoff][0]{ _id }`,
      { phone, cutoff }
    )
    if (existing) {
      return NextResponse.json({ success: true, leadId: existing._id })
    }

    // 2. Write lead to Sanity — this must succeed before anything else
    const doc = await writeClient.create({
      _type: 'lead',
      phone,
      source: source || 'contact-form',
      whatsappOptIn: whatsappOptIn ?? false,
      submittedAt: new Date().toISOString(),
    })

    // 2. Send alert email — best-effort, never blocks or fails the response
    sendLeadNotification({
      phone,
      source: source || 'contact-form',
      whatsappOptIn: whatsappOptIn ?? false,
    }).catch((err) => {
      console.error('[lead-notify] Email notification failed:', err)
    })

    return NextResponse.json({ success: true, leadId: doc._id })
  } catch (err) {
    console.error('Lead submission error:', err)
    return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { leadId, name, email, productInterest } = await req.json()

    if (!leadId || typeof leadId !== 'string') {
      return NextResponse.json({ error: 'leadId is required' }, { status: 400 })
    }

    // Only patch fields that have actual values
    const fields: Record<string, string> = {}
    if (name?.trim())         fields.name = name.trim()
    if (email?.trim())        fields.email = email.trim()
    if (productInterest?.trim()) fields.productInterest = productInterest.trim()

    // No meaningful data — nothing to do
    if (Object.keys(fields).length === 0) {
      return NextResponse.json({ success: true })
    }

    await writeClient.patch(leadId).set(fields).commit()

    // Send admin enrichment alert — best-effort
    sendEnrichmentNotification({ leadId, ...fields }).catch((err: unknown) => {
      console.error('[lead-enrich] Follow-up email failed:', err)
    })

    // Send user confirmation — only when email is present, best-effort
    if (fields.email) {
      sendUserConfirmation({ name: fields.name, email: fields.email }).catch((err: unknown) => {
        console.error('[user-confirm] Confirmation email failed:', err)
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Lead enrichment error:', err)
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
  }
}
