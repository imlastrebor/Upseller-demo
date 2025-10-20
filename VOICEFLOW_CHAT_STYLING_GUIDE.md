# Voiceflow Embedded Chat — Custom Styling Guide for Codex

## 0. Overview
This document gives Codex detailed instructions for creating **custom styles** for the embedded Voiceflow chat widget used in this project.

**Goal:**  
Apply a unified visual style (colors, typography, spacing, borders, shadows) to the chat while keeping all overrides clean, scoped, and accessible.

---

## 1. Files and Structure

### Main Files
1. **index.html**
   - Already contains `window.voiceflow.chat.load({ ... })` inside the `<script>` block.
   - Codex will **extend** this config to include a custom stylesheet for the chat.
   - The embed is initialized inside the element with the id `voiceflow-target`.

2. **styles/vf-chat.css**
   - New CSS file where all Voiceflow-specific style overrides live.
   - This stylesheet will be loaded by Voiceflow’s `assistant.stylesheet` parameter.

3. **styles/tokens.css** *(optional)*
   - Holds CSS variables (color palette, fonts, radii, spacing).
   - Import this into `vf-chat.css` for consistency.

---

## 2. Chat Load Configuration

Codex should locate the existing `window.voiceflow.chat.load({...})` call in `index.html`.

### Instructions for Codex
- Keep all existing fields (`verify.projectID`, `url`, `versionID`, `render`, etc.) unchanged.
- Add a new `assistant` object that includes:
  - `type: "chat"`
  - `renderMode: "embed"`
  - Visual details like `header`, `avatar`, or `inputPlaceholder` (optional).
  - A `stylesheet` key that points to:
    - The hosted `styles/vf-chat.css` file **or**
    - A base64-encoded data URL containing the CSS.
- Do not remove or rename any existing properties.

> ⚠️ Ensure the stylesheet path or data URL is correct and loads successfully in the browser (check Network tab).

---

## 3. Styling Approach

- **Target only `.vfrc*` classes.**  
  Voiceflow widgets prefix all internal classes with `.vfrc`. This prevents global leaks.
- **Avoid direct element selectors.**  
  Don’t style `div`, `button`, etc., without a `.vfrc` scope.
- **Specificity:**  
  Prefer `.vfrc-class-name` over `!important`.
- **CSS Loading Order:**  
  The custom stylesheet will load after Voiceflow’s own styles, so overrides should naturally apply.
- **Keep it minimal:**  
  Only override visible components you need to customize.

---

## 4. Areas to Customize

Codex should create sections in `vf-chat.css` for each of these functional parts:

| Section | Description | Common Class Examples |
|----------|--------------|------------------------|
| **Launcher / Prompt** | Floating chat button, popup trigger | `.vfrc-launcher`, `.vfrc-prompt` |
| **Chat Container** | Main chat window surface | `.vfrc-chat`, `.vfrc-widget` |
| **Header** | Top bar with title/logo | `.vfrc-header` |
| **Messages** | Agent and user chat bubbles | `.vfrc-system-response .vfrc-message`, `.vfrc-user-response .vfrc-message` |
| **Composer / Input** | Message input area | `.vfrc-composer`, `.vfrc-input` |
| **Buttons / Quick Replies** | Response buttons | `.vfrc-buttons`, `.vfrc-button` |
| **Scrollbars / Overflow** | Chat scrolling | `.vfrc-chat` |
| **States** | Hover, focus-visible, disabled | use `:hover`, `:focus-visible`, etc. |

Each section should have:
- A short comment header.
- Scoped rules for that UI piece.
- Use design tokens for all color and spacing values.

---

## 5. Design Tokens

Define these variables in `tokens.css` or the top of `vf-chat.css`:

```css
:root {
  --vf-chat-bg: #000;
  --vf-msg-user-bg: #333;
  --vf-msg-agent-bg: #fff;
  --vf-text: #111;
  --vf-font-family: system-ui, sans-serif;
  --vf-radius: 12px;
  --vf-focus-ring: 2px solid #00f;
}
```

> Codex: Replace example values with your real design palette.  
> Then use these variables across all `.vfrc` selectors.

Also include a dark mode variant using `@media (prefers-color-scheme: dark)`.

---

## 6. Layout and Responsiveness

- Keep the chat container responsive within your layout.
- Make sure the bottom-right floating link **never overlaps** the chat input area.
- Use bottom padding or safe-area insets to maintain space.
- Test layouts on small screens (≤ 480px).

---

## 7. Accessibility Requirements

Codex should ensure:
- Visible focus outlines on all interactive elements.
- Minimum 4.5:1 text contrast ratio.
- Accessible names and `aria-labels` remain intact.
- `prefers-reduced-motion` respected for animations.
- Skip link (already in `index.html`) continues to target the chat container.

---

## 8. Delivery and Optimization

- Keep `vf-chat.css` concise (only Voiceflow overrides).
- Minify before embedding as base64.
- Use HTTP hosting for caching if possible.
- Do not modify `widget-next/bundle.mjs`.

---

## 9. QA Checklist

1. Confirm stylesheet loads after widget CSS.
2. Verify `.vfrc*` selectors apply (inspect with DevTools).
3. Test hover/focus/active/disabled states.
4. Toggle dark/light mode.
5. Test across mobile and desktop breakpoints.
6. Ensure floating link button doesn’t overlap chat elements.

---

## 10. Troubleshooting

| Issue | Likely Cause | Fix |
|--------|---------------|-----|
| Styles not applying | Wrong class name or stylesheet not loaded | Inspect `.vfrc` class and Network tab |
| Overrides inconsistent | Specificity too low | Use full `.vfrc` class path |
| Chat clipped by button | Add padding or z-index separation | Adjust layout container |

---

## 11. Summary of Edits

- **Edit**: `index.html` → Extend `window.voiceflow.chat.load()` with `assistant.stylesheet`.
- **Create**: `styles/vf-chat.css` → Implement all custom rules.
- **Optional**: `styles/tokens.css` → Store reusable CSS variables.

---

## 12. References

- [Voiceflow Embed Customization Docs](https://docs.voiceflow.com/docs/embed-customize-styling)
- [Voiceflow Advanced Styling Guide](https://docs.voiceflow.com/docs/advanced-styling)

---

**Author:** Senior Front-End Engineer  
**Purpose:** Enable Codex to safely and correctly apply custom Voiceflow chat styling.
