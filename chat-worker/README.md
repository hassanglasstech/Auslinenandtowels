# ALT Chat Worker — Deployment Guide

A Cloudflare Worker that powers the AI chat widget on auslinenandtowels.com.au.
Runs on Anthropic's Claude Haiku 4.5 (~$0.001 per conversation).

## One-time setup

1. **Cloudflare account** — free at [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Anthropic account** — [console.anthropic.com](https://console.anthropic.com) → add $5 credit → create API key (starts with `sk-ant-`)
3. **Install Wrangler** — open PowerShell:
   ```
   npm install -g wrangler
   ```
4. **Login** — opens browser:
   ```
   wrangler login
   ```

## Deploy

From the `chat-worker/` directory:

```
wrangler secret put ANTHROPIC_API_KEY
# paste your sk-ant-... key when prompted

wrangler secret put HANDOFF_WEBHOOK_URL
# OPTIONAL — paste a Zapier/Formspree/Make webhook URL.
# Leave blank by hitting Enter if you want handoff details only logged.

wrangler deploy
```

You'll see a URL like `https://alt-chat.<your-subdomain>.workers.dev`. Copy it.

## Wire into the site

Open `public_html/assets/chat-widget.js` line 11:
```js
apiEndpoint: 'https://alt-chat.your-subdomain.workers.dev/chat',
```
Replace with your real Worker URL (keep the `/chat` suffix). Re-upload to Hostinger.
The widget will now appear on every page and answer questions in your brand voice.

## Update knowledge later

Edit `worker.js` → `SYSTEM_PROMPT` → redeploy:
```
wrangler deploy
```

## Cost expectations

- Cloudflare Workers free tier: 100,000 requests/day (chat traffic won't get near this)
- Claude Haiku 4.5: ~$0.0008 per typical 4-message conversation
- 1,000 chats/month ≈ AU$1.20

## Disable the widget

If you want to take the chat down temporarily without redeploying:
in `public_html/assets/chat-widget.js`, revert line 11 to:
```js
apiEndpoint: 'https://alt-chat.your-subdomain.workers.dev/chat',
```
The widget will detect the placeholder and hide itself.
