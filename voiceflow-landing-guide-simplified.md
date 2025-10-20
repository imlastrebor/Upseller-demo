# Voiceflow Chat Landing Page — Project Guide

This guide describes how to build an accessible, high-performance landing page that embeds a Voiceflow chat, with a full-viewport background image and a bottom-right link button.

---

## Overview

**Goal:**  
Build a minimal, mobile-first landing page that fills the viewport with a background image, embeds a Voiceflow chat widget as the main content, and includes a bottom-right link button that never overlaps the chat.

**Core principles:**  
- Responsive layout (mobile-first)
- Accessibility (skip link, focus styles, semantic landmarks)
- Performance (preload background, avoid layout shifts, defer scripts)
- Static site (no frameworks or build tools)

---

## Folder Structure

Create a new project folder with this structure:

```
your-project/
  index.html
  styles/
    main.css
  assets/
    popup_bg.png
    favicon.ico
```

> Replace `popup_bg.png` with your real background image and `favicon.ico` with your icon file.

---

## Step-by-Step Instructions for Codex (in VS Code)

### 1. Project setup

1. Open VS Code.  
2. Create a new folder for the project.  
3. Inside the folder, create subfolders named `styles` and `assets`.  
4. Add your background image and favicon to the `assets` folder.  
5. Open the folder in VS Code and start a new file called `index.html`.

> **Codex prompt example:**  
> “Create an HTML5 document with semantic structure and link to a CSS file at `styles/main.css`.”

---

### 2. Base HTML file

Ask Codex to create the base structure for `index.html` with:

- A proper HTML5 doctype and `<meta>` tags for viewport, description, and social metadata.  
- Links to the favicon and stylesheet.  
- A preloaded hero image for performance.  
- A skip link for accessibility.  
- Semantic landmarks: `<header>`, `<main>`, and `<footer>`.  
- Inside `<main>`, a wrapper for the chat area where you’ll paste your Voiceflow embed later.  
- A bottom-right link button (the floating action button).

> **Codex prompt example:**  
> “Add a Voiceflow embed placeholder in the main section, with clear comments showing where to paste the real embed code later.”

---

### 3. CSS file

In `styles/main.css`, instruct Codex to:

- Use CSS variables to define the button size and spacing.  
- Apply a full-viewport responsive background image.  
- Center the main chat area and make it fill all available space.  
- Add padding to reserve space for the floating button so it doesn’t overlap the chat.  
- Include visible focus styles and skip link visibility on focus.  
- Make the floating button `position: fixed` at bottom-right with spacing variables.  
- Add a hover effect and proper focus outline.

> **Codex prompt example:**  
> “Write CSS for a full-screen background image layout where the main content takes all space except reserved padding for a fixed bottom-right button.”

---

### 4. Accessibility Enhancements

Ask Codex to ensure:

- A visible skip link appears when focused.  
- All interactive elements have focus outlines.  
- The layout uses proper semantic tags (`header`, `main`, `footer`).  
- ARIA labels are included where necessary (e.g., for the chat region and floating button).

---

### 5. Voiceflow Chat Embed

When ready, replace the placeholder comment in the main chat section with your **Voiceflow embed snippet**.

- Paste your official Voiceflow script where the placeholder comment indicates.  
- Prefer `defer` or `async` attributes so the embed doesn’t block initial rendering.  
- Let CSS control the chat height/width (avoid inline styles that set fixed heights).

---

### 6. Replace Assets & Links

- Update all paths to your real background image and favicon.  
- Replace the placeholder link in the floating button with your real URL.  
- Adjust metadata: title, description, and Open Graph/Twitter fields.  

> **Codex prompt example:**  
> “Add Open Graph and Twitter metadata tags for the site title, description, and image.”

---

### 7. Testing Locally

- Open the `index.html` file in your browser or use VS Code’s Live Server extension.  
- Check that:  
  - The background image fills the viewport.  
  - The chat is centered and visible.  
  - The floating button does not overlap the chat.  
  - The skip link is reachable with the Tab key.  
  - Focus outlines are visible.  
  - No layout shifts occur while loading.

---

### 8. Publishing Options

**Option A — Netlify Drop (simplest):**  
- Visit [Netlify Drop](https://app.netlify.com/drop).  
- Drag and drop your project folder to deploy instantly.

**Option B — Vercel:**  
- Create a new project on Vercel and upload the folder.  
- No build command needed (static site).

**Option C — GitHub Pages:**  
- Push the project to a GitHub repository.  
- Enable GitHub Pages from the repository settings and deploy from the `main` branch.

---

### 9. Final Checklist

Before publishing, verify these items:

- ✅ Background image is optimized and preloaded.  
- ✅ Chat area uses all available space.  
- ✅ Floating button never overlaps chat.  
- ✅ Metadata and favicon are in place.  
- ✅ Voiceflow embed loads after the page renders.  
- ✅ Focus and accessibility features work correctly.

---

## Summary

By following these steps, Codex can generate your landing page automatically inside VS Code.  
It will produce an HTML + CSS static site ready for deployment on Netlify, Vercel, or GitHub Pages.  
Your role is to replace placeholders (background, favicon, embed, button link) and verify layout and accessibility before publishing.
