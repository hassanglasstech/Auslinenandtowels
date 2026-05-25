// Australian Linen & Towels — AI Chat Widget
// Uses Claude Haiku 4.5 via Cloudflare Worker proxy
// Escalation: detects complex queries and shows contact form

(function () {
  // ==========================================
  // CONFIGURATION
  // ==========================================
  const CONFIG = {
    // Replace with your deployed Cloudflare Worker URL
    apiEndpoint: 'https://alt-chat.your-subdomain.workers.dev/chat',
  };
  // Hide widget until a real endpoint is configured (no broken-chat UX on prod)
  if (CONFIG.apiEndpoint.indexOf('your-subdomain') !== -1) return;
  Object.assign(CONFIG, {

    // Welcome message shown when chat opens
    welcomeMessage: "Hi! I'm the Australian Linen & Towels assistant. I can help with product specs, pricing, delivery, or orders. What can I help you with?",

    // Shown when user needs human follow-up
    escalationMessage: "This sounds like it needs our team's attention. Can I pass your details to a specialist who'll get back to you within 1 business day?",

    // Brand colours
    primaryColor: '#1a1f4e',
    accentColor: '#b8933a',
    accentSoft: '#d4b568',
    surface: '#faf8f3',
    line: '#e5e0d2',

    // Suggested first prompts shown as clickable chips
    suggestions: [
      'What GSM towels do hotels use?',
      'How do I open a trade account?',
      'Delivery times across Australia',
      'How do I get a quote?',
    ],

    // Contact details to show if AI escalates
    contact: {
      phone: '0414 533 449',
      email: 'info@auslinenandtowels.com.au',
    },
  });

  // ==========================================
  // STATE
  // ==========================================
  let isOpen = false;
  let messages = []; // conversation history
  let isTyping = false;
  let hasEscalated = false;

  // ==========================================
  // UI INJECTION
  // ==========================================
  const styles = `
    .alt-chat-btn {
      position: fixed;
      bottom: 100px;
      right: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: ${CONFIG.primaryColor};
      border: none;
      cursor: pointer;
      box-shadow: 0 6px 24px rgba(26, 31, 78, 0.3);
      z-index: 9998;
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${CONFIG.accentSoft};
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .alt-chat-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 8px 28px rgba(26, 31, 78, 0.4);
    }
    .alt-chat-btn svg { width: 28px; height: 28px; }
    .alt-chat-btn.hidden { display: none; }
    .alt-chat-btn .badge {
      position: absolute;
      top: -4px; right: -4px;
      width: 20px; height: 20px;
      background: ${CONFIG.accentColor};
      border-radius: 50%;
      border: 2px solid #fff;
      display: flex; align-items: center; justify-content: center;
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      font-family: -apple-system, sans-serif;
    }

    .alt-chat-window {
      position: fixed;
      bottom: 100px;
      right: 20px;
      width: 380px;
      max-width: calc(100vw - 40px);
      height: 560px;
      max-height: calc(100vh - 140px);
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.18);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 9999;
      font-family: 'Inter', -apple-system, sans-serif;
    }
    .alt-chat-window.open { display: flex; }

    .alt-chat-header {
      background: ${CONFIG.primaryColor};
      color: #fff;
      padding: 18px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }
    .alt-chat-header .avatar {
      width: 38px; height: 38px;
      border-radius: 50%;
      background: ${CONFIG.accentColor};
      display: flex; align-items: center; justify-content: center;
      font-family: 'Inter', sans-serif;
      font-style: italic;
      font-size: 18px;
      color: #fff;
    }
    .alt-chat-header .info { flex: 1; }
    .alt-chat-header h4 {
      font-family: 'Inter', sans-serif;
      font-weight: 500;
      font-size: 17px;
      line-height: 1.2;
      margin: 0;
    }
    .alt-chat-header .status {
      font-size: 11px;
      color: ${CONFIG.accentSoft};
      margin-top: 2px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .alt-chat-header .status::before {
      content: '';
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #4ade80;
    }
    .alt-chat-header .close {
      background: transparent;
      border: 0;
      color: #fff;
      cursor: pointer;
      padding: 6px;
      opacity: 0.7;
    }
    .alt-chat-header .close:hover { opacity: 1; }
    .alt-chat-header .close svg { width: 20px; height: 20px; }

    .alt-chat-body {
      flex: 1;
      overflow-y: auto;
      padding: 18px 18px 8px;
      background: ${CONFIG.surface};
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .alt-msg {
      max-width: 85%;
      padding: 11px 14px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.5;
      word-wrap: break-word;
    }
    .alt-msg.bot {
      align-self: flex-start;
      background: #fff;
      color: #1a1d2e;
      border-bottom-left-radius: 4px;
      border: 1px solid ${CONFIG.line};
    }
    .alt-msg.user {
      align-self: flex-end;
      background: ${CONFIG.primaryColor};
      color: #fff;
      border-bottom-right-radius: 4px;
    }
    .alt-msg strong { font-weight: 500; }
    .alt-msg a { color: ${CONFIG.accentColor}; border-bottom: 1px solid currentColor; }

    .alt-typing {
      align-self: flex-start;
      display: flex;
      gap: 4px;
      padding: 14px 16px;
      background: #fff;
      border-radius: 12px;
      border-bottom-left-radius: 4px;
      border: 1px solid ${CONFIG.line};
    }
    .alt-typing span {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: ${CONFIG.accentColor};
      animation: alt-bounce 1.4s infinite;
      opacity: 0.5;
    }
    .alt-typing span:nth-child(2) { animation-delay: 0.2s; }
    .alt-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes alt-bounce {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
      30% { transform: translateY(-5px); opacity: 1; }
    }

    .alt-suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 4px 0 10px;
    }
    .alt-suggestions button {
      background: #fff;
      border: 1px solid ${CONFIG.line};
      padding: 7px 11px;
      font-size: 12px;
      color: ${CONFIG.primaryColor};
      cursor: pointer;
      border-radius: 16px;
      font-family: inherit;
      transition: background 0.15s;
    }
    .alt-suggestions button:hover {
      background: ${CONFIG.primaryColor};
      color: #fff;
      border-color: ${CONFIG.primaryColor};
    }

    .alt-handoff-card {
      background: #fff;
      border: 1px solid ${CONFIG.line};
      border-left: 3px solid ${CONFIG.accentColor};
      border-radius: 8px;
      padding: 14px;
      margin: 8px 0;
      font-size: 13.5px;
    }
    .alt-handoff-card h5 {
      font-family: 'Inter', sans-serif;
      font-size: 17px;
      color: ${CONFIG.primaryColor};
      font-weight: 500;
      margin-bottom: 6px;
    }
    .alt-handoff-card p { color: #6b6e7d; margin-bottom: 12px; }
    .alt-handoff-card input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid ${CONFIG.line};
      border-radius: 6px;
      font-family: inherit;
      font-size: 13px;
      margin-bottom: 8px;
      outline: none;
      box-sizing: border-box;
    }
    .alt-handoff-card input:focus { border-color: ${CONFIG.primaryColor}; }
    .alt-handoff-card button {
      width: 100%;
      background: ${CONFIG.primaryColor};
      color: #fff;
      border: 0;
      padding: 11px;
      border-radius: 6px;
      cursor: pointer;
      font-family: inherit;
      font-size: 12px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      font-weight: 500;
    }
    .alt-handoff-card button:hover { background: #252a5c; }
    .alt-handoff-card .divider {
      text-align: center;
      font-size: 11px;
      color: #6b6e7d;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin: 14px 0 10px;
    }
    .alt-handoff-card .quick-contact {
      display: flex;
      gap: 6px;
    }
    .alt-handoff-card .quick-contact a {
      flex: 1;
      text-align: center;
      padding: 10px;
      border: 1px solid ${CONFIG.line};
      border-radius: 6px;
      font-size: 12px;
      color: ${CONFIG.primaryColor};
      font-weight: 500;
      text-decoration: none;
    }
    .alt-handoff-card .quick-contact a:hover {
      background: ${CONFIG.surface};
    }

    .alt-chat-footer {
      padding: 10px 14px;
      border-top: 1px solid ${CONFIG.line};
      background: #fff;
      flex-shrink: 0;
    }
    .alt-chat-footer form {
      display: flex;
      gap: 8px;
      align-items: flex-end;
    }
    .alt-chat-footer textarea {
      flex: 1;
      border: 1px solid ${CONFIG.line};
      border-radius: 18px;
      padding: 10px 14px;
      font-family: inherit;
      font-size: 14px;
      resize: none;
      outline: none;
      max-height: 80px;
      min-height: 38px;
      line-height: 1.4;
    }
    .alt-chat-footer textarea:focus { border-color: ${CONFIG.primaryColor}; }
    .alt-chat-footer button {
      background: ${CONFIG.primaryColor};
      color: #fff;
      border: 0;
      width: 38px; height: 38px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background 0.15s;
    }
    .alt-chat-footer button:hover:not(:disabled) { background: #252a5c; }
    .alt-chat-footer button:disabled { opacity: 0.4; cursor: not-allowed; }
    .alt-chat-footer button svg { width: 18px; height: 18px; }
    .alt-chat-footer .disclaimer {
      text-align: center;
      font-size: 10px;
      color: #9ca0af;
      margin-top: 6px;
      letter-spacing: 0.04em;
    }

    @media (max-width: 480px) {
      .alt-chat-btn { bottom: 88px; right: 14px; width: 54px; height: 54px; }
      .alt-chat-btn svg { width: 24px; height: 24px; }
      .alt-chat-window {
        bottom: 0; right: 0; left: 0;
        width: 100%;
        max-width: 100%;
        height: 100vh;
        height: 100dvh;
        max-height: 100vh;
        border-radius: 0;
      }
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  // Build DOM
  const chatBtn = document.createElement('button');
  chatBtn.className = 'alt-chat-btn';
  chatBtn.setAttribute('aria-label', 'Open chat assistant');
  chatBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
    <span class="badge">1</span>
  `;

  const chatWindow = document.createElement('div');
  chatWindow.className = 'alt-chat-window';
  chatWindow.innerHTML = `
    <div class="alt-chat-header">
      <div class="avatar">L</div>
      <div class="info">
        <h4>Linen Assistant</h4>
        <div class="status">Online · Replies instantly</div>
      </div>
      <button class="close" aria-label="Close chat">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
    </div>
    <div class="alt-chat-body" id="alt-chat-body"></div>
    <div class="alt-chat-footer">
      <form id="alt-chat-form">
        <textarea id="alt-chat-input" placeholder="Type your question..." rows="1" maxlength="500"></textarea>
        <button type="submit" id="alt-chat-send" aria-label="Send">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </form>
      <div class="disclaimer">AI assistant · Verify pricing &amp; lead times with team</div>
    </div>
  `;

  document.body.appendChild(chatBtn);
  document.body.appendChild(chatWindow);

  const body = chatWindow.querySelector('#alt-chat-body');
  const form = chatWindow.querySelector('#alt-chat-form');
  const input = chatWindow.querySelector('#alt-chat-input');
  const sendBtn = chatWindow.querySelector('#alt-chat-send');

  // ==========================================
  // UI FUNCTIONS
  // ==========================================
  function openChat() {
    isOpen = true;
    chatWindow.classList.add('open');
    chatBtn.classList.add('hidden');
    const badge = chatBtn.querySelector('.badge');
    if (badge) badge.style.display = 'none';
    if (messages.length === 0) {
      addBotMessage(CONFIG.welcomeMessage);
      renderSuggestions();
    }
    setTimeout(() => input.focus(), 300);
  }

  function closeChat() {
    isOpen = false;
    chatWindow.classList.remove('open');
    chatBtn.classList.remove('hidden');
  }

  function addBotMessage(text) {
    const msg = document.createElement('div');
    msg.className = 'alt-msg bot';
    msg.innerHTML = formatMessage(text);
    body.appendChild(msg);
    messages.push({ role: 'assistant', content: text });
    scrollToBottom();
  }

  function addUserMessage(text) {
    const msg = document.createElement('div');
    msg.className = 'alt-msg user';
    msg.textContent = text;
    body.appendChild(msg);
    messages.push({ role: 'user', content: text });
    scrollToBottom();
  }

  function formatMessage(text) {
    // Basic markdown: **bold**, line breaks, URLs
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>')
      .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
  }

  function showTyping() {
    removeTyping();
    const el = document.createElement('div');
    el.className = 'alt-typing';
    el.id = 'alt-typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    body.appendChild(el);
    scrollToBottom();
  }
  function removeTyping() {
    const el = document.getElementById('alt-typing');
    if (el) el.remove();
  }

  function scrollToBottom() {
    setTimeout(() => { body.scrollTop = body.scrollHeight; }, 50);
  }

  function renderSuggestions() {
    const existing = body.querySelector('.alt-suggestions');
    if (existing) existing.remove();
    const container = document.createElement('div');
    container.className = 'alt-suggestions';
    CONFIG.suggestions.forEach(s => {
      const btn = document.createElement('button');
      btn.textContent = s;
      btn.addEventListener('click', () => {
        input.value = s;
        handleSubmit();
      });
      container.appendChild(btn);
    });
    body.appendChild(container);
    scrollToBottom();
  }

  function removeSuggestions() {
    const existing = body.querySelector('.alt-suggestions');
    if (existing) existing.remove();
  }

  function showHandoffCard(reason) {
    hasEscalated = true;
    const card = document.createElement('div');
    card.className = 'alt-handoff-card';
    card.innerHTML = `
      <h5>Connect with our team</h5>
      <p>${reason || "Share your contact details and a specialist will follow up within 1 business day."}</p>
      <input type="text" id="alt-hand-name" placeholder="Your name" />
      <input type="email" id="alt-hand-email" placeholder="Business email" />
      <input type="tel" id="alt-hand-phone" placeholder="Phone (optional)" />
      <button id="alt-hand-submit">Send Details →</button>
      <div class="divider">— or contact directly —</div>
      <div class="quick-contact">
        <a href="tel:${CONFIG.contact.phone.replace(/\s/g, '')}">📞 ${CONFIG.contact.phone}</a>
        <a href="mailto:${CONFIG.contact.email}">✉ Email</a>
      </div>
    `;
    body.appendChild(card);
    scrollToBottom();

    card.querySelector('#alt-hand-submit').addEventListener('click', () => {
      const name = card.querySelector('#alt-hand-name').value.trim();
      const email = card.querySelector('#alt-hand-email').value.trim();
      const phone = card.querySelector('#alt-hand-phone').value.trim();

      if (!name || !email) {
        alert('Please provide at least your name and email.');
        return;
      }

      // Build conversation summary for handoff
      const summary = messages.map(m => `${m.role === 'user' ? 'Customer' : 'Assistant'}: ${m.content}`).join('\n\n');

      // Submit handoff to worker (worker emails to info@auslinenandtowels.com.au)
      fetch(CONFIG.apiEndpoint.replace('/chat', '/handoff'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, summary, page: window.location.href }),
      }).catch(() => {});

      card.innerHTML = `
        <h5>Thank you, ${name.split(' ')[0]}!</h5>
        <p>Your enquiry has been forwarded to our team. A specialist will contact you at <strong>${email}</strong> within 1 business day.</p>
        <p style="margin-top: 10px; font-size: 12px;">For urgent enquiries: <a href="tel:${CONFIG.contact.phone.replace(/\s/g, '')}" style="color: ${CONFIG.primaryColor}; border-bottom: 1px solid ${CONFIG.accentColor};">${CONFIG.contact.phone}</a></p>
      `;
    });
  }

  // ==========================================
  // CLAUDE API CALL via Cloudflare Worker
  // ==========================================
  async function sendToAPI(userMessage) {
    try {
      const response = await fetch(CONFIG.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.slice(-10), // last 10 turns only, keep context small
        }),
      });

      if (!response.ok) throw new Error('API error');
      const data = await response.json();

      return {
        reply: data.reply || "I'm having trouble connecting right now. Would you like me to take your details so our team can follow up?",
        escalate: !!data.escalate,
        escalateReason: data.escalateReason || null,
      };
    } catch (err) {
      console.error('Chat API error:', err);
      return {
        reply: "I'm having a connection issue. For the fastest help, please call us at " + CONFIG.contact.phone + " or email " + CONFIG.contact.email + ".",
        escalate: true,
        escalateReason: "Our chat is temporarily unavailable. Drop your details and we'll get back to you.",
      };
    }
  }

  // ==========================================
  // HANDLE MESSAGE SUBMIT
  // ==========================================
  async function handleSubmit(e) {
    if (e) e.preventDefault();
    const text = input.value.trim();
    if (!text || isTyping) return;

    removeSuggestions();
    addUserMessage(text);
    input.value = '';
    input.style.height = 'auto';

    isTyping = true;
    sendBtn.disabled = true;
    showTyping();

    const result = await sendToAPI(text);
    removeTyping();

    addBotMessage(result.reply);

    if (result.escalate && !hasEscalated) {
      setTimeout(() => showHandoffCard(result.escalateReason), 400);
    }

    isTyping = false;
    sendBtn.disabled = false;
    input.focus();
  }

  // ==========================================
  // EVENT LISTENERS
  // ==========================================
  chatBtn.addEventListener('click', openChat);
  chatWindow.querySelector('.close').addEventListener('click', closeChat);
  form.addEventListener('submit', handleSubmit);

  // Auto-resize textarea
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 80) + 'px';
  });

  // Shift+Enter = newline, Enter = send
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  });

  // Expose for debugging
  window.ALT_CHAT = { open: openChat, close: closeChat };
})();
