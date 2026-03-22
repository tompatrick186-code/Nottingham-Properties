import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, string>;

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { name, email, phone, message, propertyId, propertyTitle, subject, source } = body;

  // Log to console if no Resend key (dev mode)
  const resendKey = import.meta.env.RESEND_API_KEY;
  const landlordEmail = import.meta.env.LANDLORD_EMAIL || 'hello@nottinghamproperties.co.uk';

  if (!resendKey) {
    console.log('[ENQUIRY - no Resend key, logging only]', { name, email, phone, propertyId, message });
    return new Response(JSON.stringify({ success: true, mode: 'logged' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const resend = new Resend(resendKey);

  const propertyInfo = propertyTitle ? `Property: ${propertyTitle} (${propertyId})` : `Subject: ${subject || 'General enquiry'}`;
  const sourceInfo = source === 'contact-page' ? 'via Contact Page' : 'via Property Enquiry Form';

  const emailBody = `
New enquiry received ${sourceInfo}

${propertyInfo}

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}

Message:
${message || 'No message provided'}

---
Sent from nottinghamproperties.co.uk
  `.trim();

  try {
    await resend.emails.send({
      from: 'Nottingham Properties <noreply@nottinghamproperties.co.uk>',
      to: landlordEmail,
      replyTo: email,
      subject: `New enquiry${propertyTitle ? ` — ${propertyTitle}` : ''} from ${name}`,
      text: emailBody,
    });

    // Send confirmation to enquirer
    await resend.emails.send({
      from: 'Nottingham Properties <hello@nottinghamproperties.co.uk>',
      to: email,
      subject: 'We received your enquiry — Nottingham Properties',
      text: `Hi ${name},\n\nThank you for your enquiry${propertyTitle ? ` about ${propertyTitle}` : ''}. We'll be in touch shortly — usually within a few hours.\n\nIn the meantime, feel free to call us on 0115 900 1234.\n\nBest regards,\nNottingham Properties`,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Resend error:', err);
    return new Response(JSON.stringify({ error: 'Failed to send email' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
