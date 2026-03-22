import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';
import properties from '../../data/properties.json';

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ reply: "I'm sorry, I'm not able to respond right now. Please call us on 0115 900 1234 or email hello@jhholdings.co.uk." }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body: { messages: { role: string; content: string }[]; userInfo?: { name?: string; email?: string } };

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { messages = [], userInfo = {} } = body;

  const systemPrompt = `You are a friendly, helpful assistant for J & H Holdings Ltd — a private landlord managing quality residential flats across Nottingham, England.

Your tone is warm, professional, and very British. You should:
- Use British English (flat, not apartment; tenancy, not lease; estate agent, etc.)
- Be helpful with: availability questions, viewing bookings, rent queries, application process, general questions about Nottingham
- Never be pushy or salesy — just genuinely helpful
- If someone wants to book a viewing or sounds interested, politely ask for their name and email address
- Keep responses concise and conversational

Here are the current properties:
${JSON.stringify(properties, null, 2)}

Key info:
- No agency fees
- Private landlord — direct contact
- Phone: 0115 900 1234
- Email: hello@jhholdings.co.uk
- Applications: proof of income (3x monthly rent), references, ID required
- Deposits: equivalent to 5 weeks' rent, held with TDS
- Viewings: available Mon–Sat by appointment

If a user gives their name or email, acknowledge it naturally and remember it for the conversation.`;

  try {
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 512,
      system: systemPrompt,
      messages: messages.slice(-10).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    const reply = response.content[0].type === 'text' ? response.content[0].text : '';

    // Extract name/email if mentioned (simple heuristic)
    const updatedUserInfo = { ...userInfo };
    const emailMatch = messages[messages.length - 1]?.content.match(/[\w.+-]+@[\w-]+\.[a-z.]{2,}/i);
    if (emailMatch) updatedUserInfo.email = emailMatch[0];

    return new Response(
      JSON.stringify({ reply, userInfo: updatedUserInfo }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Anthropic API error:', err);
    return new Response(
      JSON.stringify({ reply: "I'm having a bit of trouble right now. Please try again, or give us a call on 0115 900 1234." }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
