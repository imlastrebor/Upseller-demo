# Widget Analytics Handoff – Quick Start for Codex Agent

## Goal
Implement client-side tracking for the Voiceflow widget so key events (e.g., `widget_seen`, `feedback_submitted`, custom goals) are sent to our analytics API and land in Supabase with the right shape.

## Key Endpoints & Tokens
- Analytics API: `https://upseller-analytics.vercel.app/api/events`
- Auth: Bearer token per tenant (test tenant): `test_sandbox_write_token_123`
- Voiceflow project (test): `68f9dca7b9abe8c36ec96e77`
- Widget host element: `#voiceflow-chat` (shadow DOM contains `.vfrc-widget`)

## Database Expectations (`events_raw`)
Every event is stored as a row with:
- `id` (PK, auto)
- `event_id` (UUID you supply, used for idempotency)
- `tenant_id` (resolved by server, based on token)
- `project_id` (optional – include in payload)
- `session_id` (add this from the widget; stable per chat session)
- `user_id` (optional, anon/hash if needed)
- `event_name` (e.g., `widget_seen`, `feedback_submitted`, `chat_goal`)
- `occurred_at`, `received_at`
- `properties` (JSONB) – event-specific fields (rating, prompt, label, page, etc.)

Indexes exist on `(tenant_id, session_id)` and `(tenant_id, event_name)`.

## Required Client Payload Shape
POST to `/api/events` with:
```json
{
  "events": [
    {
      "event_id": "<uuid>",
      "event_name": "feedback_submitted",
      "session_id": "<stable-session-id>",
      "project_id": "68f9dca7b9abe8c36ec96e77",
      "occurred_at": "2025-11-14T12:00:00Z",   // optional, defaults to now
      "properties": {
        "rating": "up",                        // event-specific
        "prompt": "Tarvitsetko apua jossakin muussa?",
        "label": "Kyllä",
        "page": "/"
      }
    }
  ]
}
```
Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`.

## Current Front-End Helpers (in `upseller-analytics-test.js`)
- `sendWidgetEvent(eventName, props)`: POSTS to `/api/events` with token, project_id, and (you should) include `session_id`.
- `trackWidgetSeenOnce()`: Sends `widget_seen` when widget appears (uses MutationObserver on `#voiceflow-chat` and its shadow DOM).

## Session ID
- Generate a non-PII UUID on page load, store in `localStorage`, reuse for all events:
  ```js
  const UPS_SESSION_ID = localStorage.getItem('ups_session_id') || (() => {
    const id = crypto.randomUUID();
    localStorage.setItem('ups_session_id', id);
    return id;
  })();
  ```
- Include `session_id: UPS_SESSION_ID` in every event payload.

## What to Implement
1) **Feedback tracking**
- On thumb/button click, call `sendWidgetEvent('feedback_submitted', { rating: 'up'|'down', prompt: '<bot message>', label: '<button text>', page: location.pathname, session_id: UPS_SESSION_ID })`.
- Replace console logs/mock feedback with real event sends.

2) **Custom goal tracking**
- Listen for Voiceflow widget messages (`postMessage` with `type: 'trace'`) and map prompts/buttons to goals, OR
- Have Voiceflow emit custom traces/events you can catch via `window.voiceflow.chat.on('trace:custom', handler)`.
- When detected, call `sendWidgetEvent('chat_goal', { goal: '<id>', label: '<button>', prompt: '<question>', session_id: UPS_SESSION_ID, page: location.pathname })`.

3) **Ensure CORS origins are allowlisted**
- Origins must exist in Supabase `tenant_domains` for the given tenant (e.g., `https://upseller-demo.vercel.app`, `http://localhost:3000`). If you add a new site, insert the origin; no code change needed.

## Listening to Voiceflow Widget Events (if avoiding DOM scraping)
- The widget posts traces to `window` via `postMessage`. You can:
  ```js
  window.addEventListener('message', (event) => {
    if (event.source !== window || event.data?.type !== 'trace') return;
    const trace = event.data.payload?.trace ?? [];
    // parse trace to find last system prompt + user choice if needed
  });
  ```
- Or subscribe to custom traces if Voiceflow emits them:
  ```js
  window.voiceflow?.chat?.on?.('trace:custom', (data) => {
    // data.payload.{ event, goal, label, metadata }
    sendWidgetEvent('chat_goal', { ...data.payload, session_id: UPS_SESSION_ID, page: location.pathname });
  });
  ```

## Verification Steps
- Load the page, ensure `POST /api/events` fires for `widget_seen`.
- Click feedback button, ensure `POST /api/events` fires with `event_name=feedback_submitted`.
- Query Supabase:
  ```sql
  select event_name, session_id, properties
  from events_raw
  where event_name in ('widget_seen','feedback_submitted')
  order by occurred_at desc
  limit 10;
  ```
- For totals: `select event_name, count(*) from events_raw where tenant_id='<...>' group by event_name;`

## Notes / Constraints
- All secrets (token) are currently in the site script; do not embed the token in Voiceflow flows.
- Avoid a wide table; keep event-specific fields in `properties`.
- Idempotency: do not reuse `event_id` unless you intend to suppress duplicates.
- RLS: service-role ingests; tenant-facing reads will come later (Metabase can use views).

Deliverable: Wire feedback and custom goals using the above pattern, reuse `sendWidgetEvent`, include `session_id`, and confirm events land in `events_raw` with `rating` and `prompt` in `properties`.
