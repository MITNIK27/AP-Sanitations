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
