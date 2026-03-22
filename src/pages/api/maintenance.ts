import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const POST: APIRoute = async ({ request }) => {
  const resendKey = import.meta.env.RESEND_API_KEY;
  const landlordEmail = import.meta.env.LANDLORD_EMAIL || 'hello@jhholdings.co.uk';

  let issueType: string;
  let description: string;
  let urgency: string;
  let accessTime: string;

  try {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      issueType = formData.get('issueType') as string;
      description = formData.get('description') as string;
      urgency = formData.get('urgency') as string;
      accessTime = formData.get('accessTime') as string || 'Not specified';
    } else {
      const json = await request.json();
      issueType = json.issueType;
      description = json.description;
      urgency = json.urgency;
      accessTime = json.accessTime || 'Not specified';
    }
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
  }

  if (!resendKey) {
    console.log('[MAINTENANCE REQUEST - no Resend key, logging only]', {
      issueType,
      urgency,
      description,
      accessTime,
    });
    return new Response(JSON.stringify({ success: true, mode: 'logged' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const resend = new Resend(resendKey);

  const urgencyEmoji = urgency === 'Urgent' ? '🚨' : urgency === 'Medium' ? '⚠️' : 'ℹ️';

  const emailBody = `
${urgencyEmoji} New Maintenance Request — ${urgency} Priority

Issue Type: ${issueType}
Urgency: ${urgency}
Best access time: ${accessTime}

Description:
${description}

---
Submitted via the J & H Holdings Ltd Tenant Portal
  `.trim();

  try {
    await resend.emails.send({
      from: 'J & H Holdings Ltd Portal <noreply@jhholdings.co.uk>',
      to: landlordEmail,
      subject: `${urgencyEmoji} Maintenance Request [${urgency}]: ${issueType}`,
      text: emailBody,
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
