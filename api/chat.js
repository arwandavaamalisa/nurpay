export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    const messages = [];
    if (body.system) {
      messages.push({ role: 'system', content: body.system });
    }
    (body.messages || []).forEach(m => messages.push(m));

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        max_tokens: body.max_tokens || 1000,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    const text = data?.choices?.[0]?.message?.content
      || data?.error?.message
      || JSON.stringify(data);

    const result = {
      content: [{ type: 'text', text: text }]
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error', detail: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
