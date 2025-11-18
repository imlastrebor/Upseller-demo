# Voiceflow DM API Integration for Collecting Responses and Feedback

## 1. Goal and High-Level Architecture

**Goal:**  
Integrate a Voiceflow assistant via the Dialog Manager API (DM API) so that:

1. The client (web/app) sends user messages to a backend.
2. The backend calls Voiceflow’s DM API to advance the conversation.
3. The backend receives Voiceflow response **traces**, extracts the relevant content, and:
   - Sends a simplified representation back to the client for display.
   - Stores the **full traces** and a **rendered message** in a database as a “bot turn” (or similar).
4. The client shows a **thumbs up / thumbs down** control for each bot response.
5. When a user clicks 👍 or 👎, the client sends feedback to the backend.
6. The backend stores the feedback, linking it to the specific bot turn and its Voiceflow traces.

This document is written for an AI code generator (Codex) that already understands the existing codebase. It should use the patterns and frameworks already present in the project.

Do **not** hard-code specific libraries or frameworks unless they already exist in the project. Instead, follow the described responsibilities and data flows.

---

## 2. Voiceflow DM API Basics

### 2.1 Dialog Manager API Overview

The **Dialog Manager API (DM API)** allows an external application to talk with a Voiceflow diagram using HTTP calls to the **interact** endpoint.

Key characteristics:

- The DM API **manages conversation state server-side**.
- The API is **not stateless**: responses depend on both the incoming request and the stored conversation state.
- Each user is identified by a **`userID`** path parameter.
- Multiple conversation sessions can run simultaneously, each with a different `userID`.  
  - Example:  
    - Customer A → `/state/user/customerA/interact`  
    - Customer B → `/state/user/customerB/interact`

### 2.2 Conversation State and `userID`

- Every DM API endpoint takes a **`userID`** parameter.
- The server uses `userID` to maintain a unique conversation state object per user.
- Recommended properties for `userID`:
  - **Unique** per user to avoid leaking one user’s context to another.
  - **Non-sensitive** (avoid emails, real names, phone numbers).

Codex should map the project’s notion of user/session to a `userID` string and consistently use it on every DM call for that user.

### 2.3 `versionID` / Environment Selection

The DM API accepts a **`versionID` header**, which is a version alias:

- `development` – version shown on the Voiceflow Creator canvas.
- `production` – published version.

Workflow for updating versions:

- For **development**:
  1. Change the diagram on the canvas and NLU manager.
  2. Click **Run** on the Voiceflow canvas to compile.
  3. Click **Train Assistant** in Prototype to train NLU.
- For **production**:
  1. Change the diagram.
  2. Click **Publish** in the top-right of the Voiceflow canvas.

Codex should make the header configurable. Use:

- `versionID: development` for testing.
- `versionID: production` for live usage.

---

## 3. The `interact` Endpoint (Non-Streaming)

This is the **recommended** endpoint for the initial implementation.

### 3.1 Endpoint and Purpose

**Endpoint:**

```text
POST https://general-runtime.voiceflow.com/state/user/{userID}/interact
```

Purpose:

- Advance the conversation session for a given user.
- Return an **array of response traces** that describe what the assistant did (e.g., messages, images, cards, custom actions, etc.).

### 3.2 Required Headers

- `Authorization`: DM API key (Dialog Manager API key from Voiceflow).
- `versionID`: `"development"` or `"production"`.
- `Content-Type`: `application/json`.

Codex should implement a HTTP client that always sends these headers.

### 3.3 Request Body: `action`

The request body contains an `action` object representing what the user did.

Common action types:

1. **Launch request** – start a new conversation:
   - `action.type = "launch"`
2. **Text request** – user sends a message:
   - `action.type = "text"`
   - `action.payload` is the text content.
3. **Intent request** – if using custom NLU on the client/backend side:
   - `action.type = "intent"`
   - `action.payload` contains intent name, entities, etc.
4. **Event request** – custom events:
   - `action.type = "event"`
   - `action.payload` describes the event.

Codex should:

- Use `"launch"` when starting a session (e.g., first interaction for that `userID`).
- Use `"text"` for subsequent free-form user messages, passing the user’s message string.
- Use `"intent"` or `"event"` only if the project explicitly requires them.

### 3.4 Response Format

The endpoint responds with an **array of trace objects**:

```json
[
  {
    "type": "speak",
    "payload": {
      "type": "message",
      "message": "would you like fries with that?"
    }
  },
  {
    "type": "visual",
    "payload": {
      "image": "https://voiceflow.com/pizza.png"
    }
  }
]
```

- Each trace has:
  - `type`: identifies the trace type.
  - `payload`: type-specific data.
  - `time`: Unix timestamp when the step ran (if provided).

Codex must treat **this entire array** as the canonical description of what Voiceflow did on that turn.

### 3.5 `verbose` Query Parameter (Legacy)

- `?verbose=true` returns an older, “legacy” structure that includes `state` and `trace`.
- For new integrations, this should remain `false` (default).
- Codex should ignore `verbose` unless legacy behavior is required.

### 3.6 Error Handling

The endpoint may return errors such as:

- **400 Bad Request** – e.g. missing or invalid `versionID` or project not published.
- **401 Auth Key Required** – missing or invalid `Authorization` header.
- **404 Model not found** – development version not rendered (Run not clicked).

Codex should implement centralized error handling, logging relevant details, and surfacing appropriate messages to the application layer.

---

## 4. Trace Types and How to Use Them

Traces represent **every output** from Voiceflow. The DM API returns an array of such traces after each call.

Core concepts:

- Every trace has a `type`, `payload`, and `time`.
- The `type` determines how the frontend should render it and how logging should handle it.

Codex must support at least the following trace types for display and logging.

### 4.1 `type: "text"`

Produced by:

- Text Step
- Response AI Step
- No match re-prompt
- No reply re-prompt
- Global No Match
- Global No Reply

Payload example (simplified):

```json
{
  "type": "text",
  "time": 1720552033,
  "payload": {
    "slate": { ... },
    "message": "Hello there!

Select an option or ask me a question",
    "delay": 1000
  }
}
```

Relevant fields:

- `payload.message`: plain text representation.
- `payload.slate`: structured content; may be used if rich formatting is needed.
- `payload.delay`: delay in ms between responses.

Codex should:

- Extract `payload.message` and accumulate it into a displayable string for the UI (“rendered message”).
- Optionally respect `delay` for typing indicators or message delays.

### 4.2 `type: "speak"`

Produced by:

- Speak Step
- Audio Step
- No match reprompt / no reply reprompt
- Global No Match / Global No Reply

Two variants:

1. **TTS message** (Speak Step):

   - `payload.type = "message"`
   - `payload.message` – text content
   - `payload.src` – base64-encoded audio data URI
   - `payload.voice` – voice name (e.g. `"Ivy"`)

2. **Audio file** (Audio Step):

   - `payload.type = "audio"`
   - `payload.src` – URL to audio file
   - `payload.message` – empty string

Codex should:

- Treat `speak` traces similar to `text` for display purposes (`payload.message`), if it is not empty.
- Optionally support the audio data/URL if the frontend accommodates audio playback.

### 4.3 `type: "visual"`

Produced by Image Steps.

Payload example:

```json
{
  "type": "visual",
  "time": 1720552033,
  "payload": {
    "visualType": "image",
    "image": "https://example.com/file.png",
    "dimensions": {
      "width": 800,
      "height": 800
    },
    "canvasVisibility": "full"
  }
}
```

Codex should:

- Capture `payload.image` as image URL for the UI.
- Store the entire trace in the DB for analytics.

### 4.4 `type: "cardV2"`

Produced by Card Steps.

Payload contains:

- `imageUrl`
- `title`
- `description` (with text and slate)
- `buttons`

Buttons include a `request` object with:

- `request.type` – **path ID** (e.g. `"path-xyz"`) or other action type.
- `request.payload` – includes `label` and `actions`.

Codex should:

- Render cards with title, description, image, and buttons in the UI.
- When a button is clicked:
  - Use `request.type` and `request.payload` to construct the **next `action`** for the next DM API call.
  - Example: if `request.type` is `"path-xyz"`, the next request body should use that type in the `action` (see below under `choice`).

### 4.5 `type: "no-reply"`

Produced when a No Reply setting is active.

Example:

```json
{
  "type": "no-reply",
  "time": 1720552033,
  "payload": {
    "timeout": 10
  }
}
```

Semantics:

- `payload.timeout` is in seconds.
- If the user does not respond within this timeout, the client must trigger another DM request with request type `"no-reply"` to fetch the corresponding no-reply message:

```json
{
  "request": {
    "type": "no-reply"
  }
}
```

Codex should:

- Use this trace to set up timers on the frontend or backend.
- If the timeout expires without user input, call DM again with the specified `request` format.

### 4.6 `type: "carousel"`

Produced by Carousel Steps.

Payload contains:

- `layout`
- An array of `cards` (similar to CardV2) with:
  - `id`
  - `title`
  - `description`
  - `imageUrl`
  - `buttons` (with `request.type` and `request.payload`).

Codex should:

- Render carousel cards and their buttons in the UI.
- Handle button clicks the same way as `cardV2` (using `request.type` to form the next `action`).

### 4.7 `type: "choice"` – Button Step

Produced by Button/Choice Steps.

Buttons may have different `request.type` patterns:

#### a) Path-based choice

Example:

```json
{
  "type": "choice",
  "payload": {
    "buttons": [
      {
        "name": "Order coffee",
        "request": {
          "type": "path-cmd906pp400433b7ujbsbiotm",
          "payload": {
            "label": "Order coffee"
          }
        }
      }
    ]
  }
}
```

To handle a button click:

- Use the `request.type` as the DM **action type** on the next request.
- Optionally, pass the `label` as `payload.label` (also used as `last_utterance` in Voiceflow).

#### b) Intent-based choice

Example:

```json
{
  "type": "choice",
  "payload": {
    "buttons": [
      {
        "name": "Check account for balance",
        "request": {
          "type": "intent",
          "payload": {
            "label": "Check account for balance",
            "query": "Check account for balance",
            "entities": [],
            "intent": {
              "name": "Check account for balance"
            }
          }
        }
      }
    ]
  }
}
```

To handle a button click:

- Call DM with `action.type = "intent"`.
- Set `action.payload` to include:
  - `intent.name`
  - `query`
  - `entities`

Alternatively, the client can use `"text"` requests and send the button label as user input.

#### c) Agent step choice with `request.type = "text"`

Example:

```json
{
  "type": "choice",
  "payload": {
    "buttons": [
      {
        "name": "Check account balance",
        "request": {
          "type": "text",
          "payload": "Check account balance"
        }
      }
    ]
  }
}
```

To handle a button click:

- Treat this as if the user typed the given text.
- Next request to DM: `action.type = "text"`, `action.payload` is the `request.payload` string.

Codex should implement generic handling that checks the `request.type` and constructs the appropriate `action` for the next DM call.

### 4.8 `Custom Actions`

Custom Action traces:

- `type` is a **string you define** in the Creator.
- `payload` can be a text or a JSON object (depending on how the Custom Action is configured).
- `defaultPath` indicates which path index is the default (0-based).
- `paths` is an array of possible events (e.g. `done`, `cancel`).

Example (JSON body format):

```json
{
  "type": "calendar",
  "time": 1720552033,
  "payload": {
    "today": 1700096585398
  },
  "defaultPath": 0,
  "paths": [
    { "event": { "type": "done" } },
    { "event": { "type": "cancel" } }
  ]
}
```

Codex should:

- Detect traces whose `type` matches known Custom Action names.
- Parse `payload` accordingly.
- Use this data for any custom integration logic (e.g. external calendar APIs, internal services).
- Store the trace in the DB along with the rest.

### 4.9 `type: "end"`

Indicates the flow reached an End step.

- Payload may be `null` or omitted.
- For chat agents, a typical example is:

```json
{
  "type": "end",
  "time": 1720552033,
  "payload": null
}
```

Codex should interpret this as:

- The conversation reached an end state for that flow.
- The client may choose to disable input or show a “start over” option.

---

## 5. Streaming Endpoint (Optional / Future)

This section is informative for future extension. The initial implementation should **use the non-streaming `interact` endpoint**.

### 5.1 `interact/stream` Endpoint

**Endpoint:**

```text
POST https://general-runtime.voiceflow.com/v2/project/{projectID}/user/{userID}/interact/stream
```

Characteristics:

- Uses **Server-Sent Events (SSE)** with `Accept: text/event-stream`.
- Returns events in `text/event-stream` format:
  - `event: trace`
  - `event: state` (optional)
  - `event: end`

Key parameters:

- Path:
  - `projectID` – obtained from agent settings (not the same as the creator URL).
  - `userID` – unique per user/session.
- Query:
  - `environment` – similar to `versionID` (`development` / `production`).
  - `completion_events` – `true` or `false` (for LLM token streaming).
  - `state` – `true` or `false` (whether to send back user state events).
- Body:
  - `action` – same semantics as non-streaming.
  - `variables` – optional variables to merge into user state.

Codex should understand this is similar to the non-streaming `interact`, but responses are delivered as a stream of events instead of a single JSON array.

### 5.2 Completion Events (`completion_events=true`)

If `completion_events=true` is set:

- The assistant chunks LLM responses into **`completion` traces** instead of a single `text` or `speak` trace.
- Each `completion` trace has a `payload.state`:

  - `"start"` – start of completion.
  - `"content"` – partial text chunk (in `payload.content`).
  - `"end"` – completion finished and may include token usage.

Codex should, if needed in the future:

- Concatenate all `payload.content` chunks between `"start"` and `"end"` into a final message.
- Use that final message as the “rendered message” for logging and feedback.
- Optionally render partial content in real time in the UI.

For now, Codex can ignore streaming and completion events in the implementation.

---

## 6. Data Model for Logging and Feedback

Codex should create or reuse DB tables/entities that separate **bot turns** and **feedback**.

### 6.1 Bot Turn Entity

A generic example (names can be adjusted to match the project):

- `id` – primary key (UUID or similar).
- `user_id` – internal user identifier.
- `session_id` – optional conversation/session identifier.
- `vf_user_id` – the `userID` used with DM API.
- `traces` – JSON field storing the **full array of DM traces** returned by `interact`.
- `rendered_message` – text or structured representation used for UI display (e.g. combined `text` + `speak` messages).
- `created_at` – timestamp of when the turn was stored.
- Optionally:
  - `agent_name` or `project_id` if multiple agents are used.
  - `end_reached` – boolean if an `end` trace was present.
  - `raw_request` – the DM `action` used for this turn.

Codex should:

- Insert a `BotTurn` row **after** each successful DM API call.
- Generate a unique `id` and expose it to the frontend as `turnId` (or similar).

### 6.2 Feedback Entity

A separate table for thumbs feedback, linked by `turn_id`:

- `id` – primary key.
- `turn_id` – foreign key referencing `BotTurn.id`.
- `rating` – e.g. `"up"` or `"down"`.
- `comment` – optional string for free-text feedback.
- `created_at` – timestamp.

Codex should ensure referential integrity (e.g., via DB-level foreign key or application logic) so feedback always references a valid `BotTurn`.

---

## 7. Backend Flow: Handling User Messages

Codex should implement a backend endpoint that:

1. Receives a user message from the client.
2. Calls the DM API `interact` endpoint.
3. Extracts and prepares the response for the client.
4. Logs the turn in the DB.

### 7.1 Input

The endpoint should accept at least:

- `userId` – internal user identifier.
- `sessionId` – optional; used to group a chat session.
- `message` – user’s text message (for subsequent messages).
- `isFirstMessage` or similar – flag indicating whether to send a `launch` or `text` action (or this can be inferred based on internal session logic).

### 7.2 Constructing the DM Request

Codex should:

- Map `userId` / `sessionId` to a **`vf_user_id`** string.
- Build the request body:

  - If starting conversation:
    - `action.type = "launch"`
  - Else:
    - `action.type = "text"`
    - `action.payload` = user message string

- Set headers:
  - `Authorization` = Voiceflow DM API key.
  - `versionID` = `development` or `production`.

### 7.3 Parsing the DM Response

The DM response is an **array of traces**.

Codex should:

1. **Store the full trace array** in DB (`traces` JSON field).
2. **Derive a simplified representation** to return to the frontend:
   - Collect all `text` traces → `payload.message`.
   - Optionally include `speak` traces → `payload.message` when not empty.
   - Include cards/carousels/visuals as structured data if the frontend supports them.
3. Construct a `rendered_message` string (or structured object) from the relevant traces.

Considerations:

- Multiple `text` traces may appear in a single response. Codex should concatenate them in order (e.g. with blank lines or separators).
- Cards and choices may not have plain text but are still important to log for analytics; they should also be passed to the frontend.

### 7.4 Creating the BotTurn Record

Once the traces and rendered message are prepared, Codex should:

- Create a new `BotTurn` row with:
  - `user_id`
  - `session_id`
  - `vf_user_id`
  - `traces` (full DM traces JSON)
  - `rendered_message`
  - `created_at`
  - Any other relevant metadata.
- Persist it to the DB and obtain the new `id` (turn identifier).

### 7.5 Response to Frontend

The backend should respond to the client with:

- `turnId` – the `BotTurn.id` for feedback linkage.
- `message` or equivalent content (the `rendered_message` or structured UI object).
- `traces` or a simplified structure representing text, choices, cards, etc.

Codex should match the existing API style (e.g., wrap in a standard response envelope if used in the project).

---

## 8. Frontend Flow: Rendering and Feedback

Codex should update the frontend chat UI logic so that it is aware of `turnId` and can send feedback.

### 8.1 Rendering Bot Messages

When the frontend receives a response from the backend, it should:

- Display the `rendered_message` (and any structured UI like cards, carousels, etc.).
- Associate each displayed bot message with its `turnId`.

For example, each bot bubble may contain metadata including the `turnId`.

### 8.2 Showing Thumbs Controls

For each bot message (or group of messages representing a single turn), the UI should show:

- 👍 (thumbs up)
- 👎 (thumbs down)

These controls must be linked to the corresponding `turnId` so that feedback is recorded for the correct DM turn.

### 8.3 Submitting Feedback

On thumbs click, the frontend should call a backend endpoint, e.g. `/feedback` (naming is flexible), with body fields such as:

- `turnId` – ID of the `BotTurn` row.
- `rating` – `"up"` or `"down"`.
- Optional `comment` – text input if you allow the user to explain their rating.

Codex should also handle basic UX feedback (e.g., disabling thumbs after submission or showing a “thanks” state).

---

## 9. Backend: Feedback Endpoint

Codex should add a backend endpoint to receive feedback submissions.

### 9.1 Input

Fields:

- `turnId` – required, must correspond to an existing `BotTurn.id`.
- `rating` – required, allowed values: `"up"` or `"down"` (or similar enums).
- `comment` – optional string.

### 9.2 Logic

Steps:

1. Validate input.
2. Verify that `turnId` exists in `BotTurn` table.
3. Insert a new `Feedback` row:
   - `turn_id = turnId`
   - `rating`
   - `comment` (if any)
   - `created_at` = now
4. Optionally, return updated analytics or a success response.

### 9.3 Error Cases

Codex should handle:

- Unknown `turnId` → respond with appropriate error.
- Invalid `rating` → validation error.
- Database errors → log and return generic error message.

---

## 10. Putting It All Together (Flow Summary)

This section summarizes the entire lifecycle of a conversation turn with feedback.

### 10.1 New Turn

1. **User types a message** (or first open triggers a launch).
2. **Frontend → Backend**: send message and session info.
3. **Backend → Voiceflow DM**:
   - Construct `action` (`launch` or `text`).
   - Call `POST /state/user/{userID}/interact` with headers.
4. **Voiceflow DM → Backend**:
   - Returns an array of traces for that turn.
5. **Backend**:
   - Stores full traces and metadata in `BotTurn` table.
   - Derives `rendered_message` and other UI-friendly data.
   - Responds to frontend with `turnId` + content.
6. **Frontend**:
   - Renders bot response.
   - Associates thumbs UI with `turnId`.

### 10.2 Feedback

1. User clicks 👍 or 👎 on a bot response.
2. **Frontend → Backend**: send `{ turnId, rating, comment? }`.
3. **Backend**:
   - Validates input.
   - Inserts `Feedback` row linked to `BotTurn`.
4. Optionally, update UI to show feedback is recorded.

### 10.3 Future Extensions (Optional)

Later, Codex can:

- Replace `interact` with `interact/stream` to support streaming responses.
- Add `completion_events=true` for token-level streaming of AI messages.
- Continue using the same DB structure (`BotTurn` + `Feedback`), but derive `rendered_message` from concatenated completion chunks.
- Add more analytics linking feedback back to:
  - specific steps in the Voiceflow flow.
  - variables used.
  - user behavior patterns.

---

## 11. Requirements Summary for Codex

When Codex implements this, it should:

1. **Implement DM API client**:
   - `POST /state/user/{userID}/interact` with proper headers and `action` body.
2. **Integrate with existing user/session handling** to generate consistent `vf_user_id` values.
3. **Parse DM trace arrays** and:
   - Store the full JSON in DB.
   - Derive `rendered_message` from `text`/`speak` and optionally other traces.
4. **Create or reuse DB tables**:
   - `BotTurn` for Voiceflow turns.
   - `Feedback` for thumbs feedback linked by `turn_id`.
5. **Expose backend endpoints**:
   - Chat endpoint: handle user message → call DM → log → respond with `turnId` + content.
   - Feedback endpoint: accept `{ turnId, rating, comment? }` → insert Feedback row.
6. **Update frontend**:
   - Display bot messages with thumbs controls.
   - On thumbs click, send feedback to feedback endpoint.

Codex should follow existing architectural patterns (e.g., controllers, services, repositories) and integrate this behavior cleanly into the project’s current stack.
