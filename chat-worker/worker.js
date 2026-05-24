// Australian Linen & Towels — Cloudflare Worker for chat widget
// Routes:
//   POST /chat     → forwards conversation to Anthropic, returns reply
//   POST /handoff  → emails team via simple webhook (or logs for now)
//
// Deploy:
//   1. npm install -g wrangler
//   2. wrangler login
//   3. wrangler secret put ANTHROPIC_API_KEY     ← paste your sk-ant-... key
//   4. wrangler secret put HANDOFF_WEBHOOK_URL   ← optional; e.g. Zapier or Formspree webhook
//   5. wrangler deploy
//
// After deploy, update assets/chat-widget.js  CONFIG.apiEndpoint  with the Worker URL.

const SYSTEM_PROMPT = `You are the AI sales assistant for Australian Linen & Towels (auslinenandtowels.com.au), a B2B wholesale supplier of commercial hospitality linen in Australia.

ABOUT THE BUSINESS:
- Based in Griffith, NSW (no street address, no showroom)
- Sells to hotels, motels, day spas, serviced apartments, short-stay operators, Airbnb hosts, resorts, salons, gyms, aged care
- Free shipping Australia-wide on orders over AU$100
- 14-day return policy (NOT 30)
- No samples, no embroidery, no international shipping
- Trading hours: Mon–Fri 9am–5pm AEDT
- Phone 0414 533 449 · info@auslinenandtowels.com.au
- ABN 86 602 936 725

PRODUCT RANGE (~112 SKUs):
- Towels: white, charcoal, camel, black, navy + 10 elegant colours (aqua, cherry, coffee, fuchsia, garnet, lime, mirage, pink, purple, royal blue). 450–700 GSM. Bath / hand / face / mat / bath sheet.
- Bed linen: white sheets (single/double/queen/king flat + fitted), pillowcases, satin-stripe top sheets, camel sheets, navy sheets
- Quilts: Pinnacle microfibre (S/D/Q/K), navy cover quilts
- Quilt covers: satin stripe S/D/Q/K + camel + navy
- Mattress protectors (waterproof fitted) — all sizes + mattress topper + pillow protector
- Microfibre pillows: soft / medium / firm / king / european / vacuum-pack
- Blankets: cellular cotton (beige + blue) + faux-wool polar fleece
- Speciality: pool towels, gym towels (pack 25/50/100), salon towels, tea towels, terry bath robes

PRICING POLICY (critical):
- NEVER quote prices. All pricing is trade-only and by quote.
- If asked for price, say: "Our pricing is trade-only — we send tailored quotes within 1 business day. Want me to grab your details so our team can send through pricing for the specific items you need?"
- Then escalate via the contact form.

USEFUL TOOLS YOU CAN POINT USERS TO:
- /collection.html — full catalogue with filters
- /room-package.html — bulk quote calculator (enter rooms + bed mix → instant package)
- /trade-account.html — open a wholesale account (48hr approval)
- /faq.html — GSM guide, wash cycles, AU bed sizes
- /contact.html — talk to a human

STYLE:
- Concise. Australian English. No hype.
- If the user has a complex requirement (custom colour, large volume, urgent timeline, multi-property procurement), escalate with the JSON flag "escalate": true and a brief "escalateReason".
- For simple queries (GSM advice, sizes, delivery), answer directly without escalating.

ALWAYS respond as JSON: {"reply": "...", "escalate": false|true, "escalateReason": "..."}
Do NOT wrap the JSON in markdown code fences.`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = corsHeaders(request);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === '/chat' && request.method === 'POST') {
      return handleChat(request, env, cors);
    }
    if (url.pathname === '/handoff' && request.method === 'POST') {
      return handleHandoff(request, env, cors);
    }
    return json({ error: 'Not found' }, 404, cors);
  }
};

async function handleChat(request, env, cors) {
  let body;
  try { body = await request.json(); }
  catch (e) { return json({ error: 'Invalid JSON' }, 400, cors); }

  const messages = Array.isArray(body.messages) ? body.messages.slice(-10) : [];
  if (!messages.length) return json({ error: 'No messages' }, 400, cors);
  if (!env.ANTHROPIC_API_KEY) return json({ error: 'API key not configured' }, 500, cors);

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: messages.map(m => ({ role: m.role, content: m.content }))
      })
    });
    if (!r.ok) {
      const errText = await r.text();
      return json({ reply: "Our AI assistant is briefly unavailable. Please email info@auslinenandtowels.com.au or call 0414 533 449.", escalate: true, escalateReason: "Chat service hiccup — please share your details for a callback.", _diag: errText.slice(0, 200) }, 200, cors);
    }
    const data = await r.json();
    const text = (data.content && data.content[0] && data.content[0].text) || '';

    // The model returns JSON per the system prompt
    let parsed;
    try { parsed = JSON.parse(text); }
    catch (e) { parsed = { reply: text, escalate: false }; }

    return json(parsed, 200, cors);
  } catch (err) {
    return json({ reply: "Connection issue. Please call 0414 533 449 or email info@auslinenandtowels.com.au.", escalate: true, escalateReason: "Temporary service issue — leave your contact and we'll be in touch." }, 200, cors);
  }
}

async function handleHandoff(request, env, cors) {
  let body;
  try { body = await request.json(); } catch (e) { return json({ ok: false }, 400, cors); }
  const { name, email, phone, summary, page } = body;
  if (!name || !email) return json({ ok: false, error: 'Missing name/email' }, 400, cors);

  // If a webhook URL is configured, POST there (Zapier / Formspree / Make.com / your own endpoint)
  if (env.HANDOFF_WEBHOOK_URL) {
    try {
      await fetch(env.HANDOFF_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, phone: phone || '',
          source_page: page || '',
          conversation: summary || '',
          received_at: new Date().toISOString()
        })
      });
    } catch (e) { /* swallow, still return ok so widget UX completes */ }
  }
  // If no webhook, the request still succeeds — the user sees confirmation
  // and the conversation summary is logged in Cloudflare for manual triage.
  console.log('CHAT HANDOFF:', JSON.stringify({ name, email, phone, page, summary }));

  return json({ ok: true }, 200, cors);
}

function json(obj, status, extra) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json', ...(extra || {}) }
  });
}

function corsHeaders(request) {
  const allow = [
    'https://auslinenandtowels.com.au',
    'https://www.auslinenandtowels.com.au'
  ];
  const origin = request.headers.get('Origin') || '';
  const allowed = allow.includes(origin) ? origin : allow[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  };
}
