import nodemailer from 'nodemailer'

interface LeadNotificationPayload {
  phone: string
  source: string
  whatsappOptIn: boolean
}

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function escapeHtml(str = '') {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendLeadNotification({ phone, source, whatsappOptIn }: LeadNotificationPayload): Promise<void> {
  const to = process.env.NOTIFY_EMAIL
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !to) {
    console.warn('[lead-notify] Email env vars not configured — skipping notification')
    return
  }

  const submittedAt = formatDate(new Date().toISOString())
  const transporter = createTransporter()

  await transporter.sendMail({
    from: `"AP Sanitations" <${process.env.SMTP_USER}>`,
    to,
    subject: `New Lead — AP Sanitations`,
    text: [
      `New enquiry received on AP Sanitations website.`,
      ``,
      `Phone:           +91 ${escapeHtml(phone)}`,
      `Source:          ${escapeHtml(source)}`,
      `WhatsApp opt-in: ${whatsappOptIn ? 'Yes' : 'No'}`,
      `Submitted:       ${submittedAt} IST`,
      ``,
      `View in Studio: https://sanity.io/manage`,
    ].join('\n'),
    html: `
      <div style="font-family: sans-serif; max-width: 480px; color: #1A1914;">
        <h2 style="color: #B8935A; margin-bottom: 4px;">New Lead — AP Sanitations</h2>
        <p style="color: #8A7A6A; margin-top: 0;">New enquiry received on the website.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr>
            <td style="padding: 8px 0; color: #8A7A6A; width: 140px;">Phone</td>
            <td style="padding: 8px 0; font-weight: 600;">+91 ${escapeHtml(phone)}</td>
          </tr>
          <tr style="background: #F7F5F0;">
            <td style="padding: 8px; color: #8A7A6A;">Source</td>
            <td style="padding: 8px;">${escapeHtml(source)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #8A7A6A;">WhatsApp opt-in</td>
            <td style="padding: 8px 0;">${whatsappOptIn ? '✅ Yes' : '❌ No'}</td>
          </tr>
          <tr style="background: #F7F5F0;">
            <td style="padding: 8px; color: #8A7A6A;">Submitted</td>
            <td style="padding: 8px;">${submittedAt} IST</td>
          </tr>
        </table>
        <p style="margin-top: 24px;">
          <a href="https://sanity.io/manage" style="background: #B8935A; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
            View in Sanity Studio
          </a>
        </p>
      </div>
    `,
  })
}



interface UserConfirmationPayload {
  name?: string
  email: string
}

export async function sendUserConfirmation({ name, email }: UserConfirmationPayload): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[user-confirm] SMTP env vars not configured — skipping confirmation')
    return
  }

  const greeting = name?.trim() ? `Hi ${escapeHtml(name.trim())},` : 'Hi,'
  const transporter = createTransporter()

  await transporter.sendMail({
    from: `"AP Sanitations" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Your enquiry has been received — AP Sanitations`,
    text: [
      `${greeting}`,
      ``,
      `Thank you for reaching out to AP Sanitations.`,
      ``,
      `We have received your enquiry and our team will call you within 24 hours.`,
      ``,
      `About AP Sanitations`,
      `Established in 2003 by Prem Sahni, AP Sanitations is Indore's trusted showroom for premium water solutions — from luxury bathroom fittings and rainfall showers to water purifiers and pool systems. Every brand we carry is personally vetted for quality and long-term reliability.`,
      ``,
      `Visit our showroom`,
      `LG-4, 31, Samyak Park Building, Nehru Park Rd, Builders Colony, Indore, Madhya Pradesh 452003`,
      ``,
      `Prefer WhatsApp? Message us at +91 9302104628`,
      ``,
      `Warm regards,`,
      `Prem Sahni`,
      `AP Sanitations, Indore`,
    ].join('\n'),
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin:0;padding:0;background:#F7F5F0;font-family:Georgia,serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F5F0;padding:32px 16px;">
          <tr><td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:4px;overflow:hidden;border:1px solid #E8E3DA;">

              <!-- Gold top bar -->
              <tr><td style="background:#B8935A;height:4px;"></td></tr>

              <!-- Header -->
              <tr><td style="padding:32px 40px 24px;border-bottom:1px solid #E8E3DA;">
                <p style="margin:0;font-family:sans-serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#8A7A6A;">AP Sanitations</p>
                <p style="margin:6px 0 0;font-family:Georgia,serif;font-size:22px;color:#1A1914;font-weight:normal;">Your enquiry has been received.</p>
              </td></tr>

              <!-- Body -->
              <tr><td style="padding:28px 40px;">
                <p style="margin:0 0 16px;font-family:sans-serif;font-size:15px;color:#1A1914;line-height:1.6;">${greeting}</p>
                <p style="margin:0 0 16px;font-family:sans-serif;font-size:15px;color:#3A3530;line-height:1.7;">
                  Thank you for reaching out. Our team will call you within <strong style="color:#1A1914;">24 hours</strong> to understand your requirements and guide you personally.
                </p>
                <p style="margin:0 0 24px;font-family:sans-serif;font-size:15px;color:#3A3530;line-height:1.7;">
                  In the meantime, you're welcome to visit our showroom or reach us on WhatsApp.
                </p>

                <!-- Divider -->
                <div style="height:1px;background:#E8E3DA;margin:0 0 24px;"></div>

                <!-- About -->
                <p style="margin:0 0 6px;font-family:sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#8A7A6A;">About AP Sanitations</p>
                <p style="margin:0 0 24px;font-family:sans-serif;font-size:13px;color:#6A5F55;line-height:1.7;">
                  Established in 2003 by Prem Sahni, AP Sanitations is Indore's trusted showroom for premium water solutions — luxury bathroom fittings, rainfall showers, water purifiers, and pool systems. Every brand is personally vetted for quality and long-term reliability.
                </p>

                <!-- Divider -->
                <div style="height:1px;background:#E8E3DA;margin:0 0 24px;"></div>

                <!-- Address -->
                <p style="margin:0 0 6px;font-family:sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#8A7A6A;">Showroom</p>
                <p style="margin:0 0 20px;font-family:sans-serif;font-size:13px;color:#3A3530;line-height:1.7;">
                  LG-4, 31, Samyak Park Building,<br>
                  Nehru Park Rd, Builders Colony,<br>
                  Indore, Madhya Pradesh 452003
                </p>

                <!-- WhatsApp CTA -->
                <a href="https://wa.me/919302104628"
                   style="display:inline-block;background:#25D366;color:#ffffff;font-family:sans-serif;font-size:13px;font-weight:600;text-decoration:none;padding:10px 22px;border-radius:4px;">
                  Chat on WhatsApp
                </a>
              </td></tr>

              <!-- Signature -->
              <tr><td style="padding:20px 40px 28px;border-top:1px solid #E8E3DA;background:#FDFCFA;">
                <p style="margin:0;font-family:Georgia,serif;font-style:italic;font-size:14px;color:#6A5F55;">Warm regards,</p>
                <p style="margin:4px 0 0;font-family:sans-serif;font-size:13px;color:#1A1914;font-weight:600;">Prem Sahni</p>
                <p style="margin:2px 0 0;font-family:sans-serif;font-size:12px;color:#8A7A6A;">AP Sanitations, Indore</p>
              </td></tr>

              <!-- Gold bottom bar -->
              <tr><td style="background:#B8935A;height:2px;"></td></tr>

            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  })
}


interface EnrichmentPayload {
  leadId: string
  name?: string
  email?: string
  productInterest?: string
}

const PRODUCT_LABELS: Record<string, string> = {
  'wellness-spa': 'Wellness & Spa',
  'pure-life': 'Pure Life (Water Purifiers)',
  'kitchen-harmony': 'Kitchen Harmony',
  'swimming-pool': 'Swimming Pool Systems',
  'invisible-infrastructure': 'Invisible Infrastructure',
  'shower-systems': 'Shower Systems',
  'bathroom-faucets': 'Bathroom Faucets',
  'bathtubs': 'Bathtubs',
}

export async function sendEnrichmentNotification({ name, email, productInterest }: EnrichmentPayload): Promise<void> {
  const to = process.env.NOTIFY_EMAIL
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !to) {
    console.warn('[lead-enrich] Email env vars not configured — skipping notification')
    return
  }

  const updatedAt = formatDate(new Date().toISOString())
  const productLabel = productInterest ? (PRODUCT_LABELS[productInterest] ?? productInterest) : null
  const transporter = createTransporter()

  const rows = [
    name          ? `<tr><td style="padding: 8px 0; color: #8A7A6A; width: 140px;">Name</td><td style="padding: 8px 0; font-weight: 600;">${escapeHtml(name)}</td></tr>` : '',
    productLabel  ? `<tr style="background: #F7F5F0;"><td style="padding: 8px; color: #8A7A6A;">Product Interest</td><td style="padding: 8px;">${escapeHtml(productLabel)}</td></tr>` : '',
    email         ? `<tr><td style="padding: 8px 0; color: #8A7A6A;">Email</td><td style="padding: 8px 0;">${escapeHtml(email)}</td></tr>` : '',
  ].filter(Boolean).join('')

  const textLines = [
    name         ? `Name:             ${escapeHtml(name)}` : '',
    productLabel ? `Product Interest: ${escapeHtml(productLabel)}` : '',
    email        ? `Email:            ${escapeHtml(email)}` : '',
  ].filter(Boolean)

  await transporter.sendMail({
    from: `"AP Sanitations" <${process.env.SMTP_USER}>`,
    to,
    subject: `Lead Update — AP Sanitations`,
    text: [
      `A lead has provided additional details.`,
      ``,
      ...textLines,
      ``,
      `Updated: ${updatedAt} IST`,
      `View in Studio: https://sanity.io/manage`,
    ].join('\n'),
    html: `
      <div style="font-family: sans-serif; max-width: 480px; color: #1A1914;">
        <h2 style="color: #B8935A; margin-bottom: 4px;">Lead Update — AP Sanitations</h2>
        <p style="color: #8A7A6A; margin-top: 0;">A lead has provided additional details.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          ${rows}
          <tr style="background: #F7F5F0;">
            <td style="padding: 8px; color: #8A7A6A;">Updated</td>
            <td style="padding: 8px;">${updatedAt} IST</td>
          </tr>
        </table>
        <p style="margin-top: 24px;">
          <a href="https://sanity.io/manage" style="background: #B8935A; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
            View in Sanity Studio
          </a>
        </p>
      </div>
    `,
  })
}
