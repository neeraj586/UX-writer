# Capillary UX Writer

AI-powered UX writing assistant for Capillary Technologies — available as a **Chrome Extension** and a **Figma Plugin**.

Paste any UI copy and instantly get 3 rewritten suggestions that follow SaaS UX writing standards and Capillary's tone of voice.

---

## What It Does

- Rewrites UI copy using Gemini AI
- Follows SaaS UX writing rules (no full stops, active voice, sentence case, verb-first)
- Uses Capillary product terminology (e.g. "enroll" not "register", "redeem" not "use")
- Accepts a URL or instruction in the context field to guide the tone
- Works inside Figma (apply directly to text layers) or any webpage (via Chrome extension)

---

## Chrome Extension — Setup Guide

### Step 1 — Load the Extension in Chrome

1. Open Chrome and go to `chrome://extensions`
2. Turn on **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select the folder: `UX-writer` (the root folder, not the figma-plugin subfolder)
5. The extension will appear in your Chrome toolbar

### Step 2 — Pin It

1. Click the puzzle piece icon 🧩 in the Chrome toolbar
2. Find **Capillary UX Writer** and click the pin icon 📌

### Step 3 — Use It

**Option A — Popup (recommended)**
1. Click the extension icon in the toolbar
2. Type or paste your UI copy in the text box
3. Optionally add context (e.g. a page URL, or an instruction like "make it formal")
4. Suggestions appear automatically as you type
5. Click any card to copy it to your clipboard

**Option B — Bubble (on any webpage)**
1. Select any text on a webpage
2. A small purple bubble appears — click it
3. The suggestion panel opens with 3 rewritten options
4. Click any card to copy it

### Enable / Disable
Use the toggle inside the popup to turn the extension on or off without uninstalling it.

---

## Figma Plugin — Setup Guide

### Step 1 — Load the Plugin in Figma

1. Open Figma (desktop app)
2. Go to any file
3. From the top menu: **Plugins → Development → Import plugin from manifest…**
4. Select the file: `UX-writer/figma-plugin/manifest.json`
5. The plugin is now available under **Plugins → Development → Capillary UX Writer**

### Step 2 — Use It

1. Select a text layer in your Figma file
2. Open the plugin: **Plugins → Development → Capillary UX Writer**
3. The selected text is fetched automatically
4. Optionally add an instruction in the context box (e.g. "shorter", "more direct", a URL)
5. Click **✨ Rewrite** to get 3 AI-powered suggestions
6. Click **Apply to Figma** to replace the text in your design, or **Copy** to copy it

> **Tip:** Switching between text layers auto-fetches the new text — no need to click "Fetch from Figma" again.

---

## Context Field — How to Use It

The context field accepts three types of input:

| Input | What It Does |
|-------|-------------|
| A page name (e.g. `Settings page`) | Adds product context to the suggestion |
| An instruction (e.g. `make it more formal`) | AI rewrites following that instruction |
| A URL (e.g. `https://example.com/docs`) | AI reads the page and uses it as context |

---

## UX Writing Rules Applied

All suggestions follow these standards automatically:

1. **No full stops** at the end of UI strings
2. **Sentence case** — only the first word and proper nouns are capitalised
3. **Active voice** — "Issue coupon" not "Coupon is issued"
4. **US English** — "canceled" not "cancelled"
5. **Short and scannable** — every unnecessary word is cut
6. **No filler words** — no "please", "simply", "just", "easily"
7. **Verb-first for actions** — "Save changes", "Add member", "Issue coupon"
8. **No marketing language** — no "powerful", "seamless", "robust"
9. **Capillary terminology** — correct product names and terms

---

## Capillary Terminology Reference

| Avoid | Use Instead |
|-------|------------|
| Register | Enroll |
| Sign up | Enrollment |
| Give | Issue |
| Use (a coupon) | Redeem |
| Used | Redemption |
| Old transaction | Retro transaction |
| Hide | Mask |
| Sent | Issuance |

---

## Folder Structure

```
UX-writer/
├── manifest.json         ← Chrome Extension config
├── popup.html            ← Extension popup UI
├── popup.js              ← Popup logic
├── content.js            ← In-page bubble
├── background.js         ← Service worker
├── options.html          ← Extension settings page
├── options.js            ← Settings logic
├── inject.css            ← Bubble styles
├── docs_context.js       ← Capillary knowledge base
├── README.md             ← This guide
└── figma-plugin/
    ├── manifest.json     ← Figma Plugin config
    ├── code.js           ← Plugin backend (Figma API)
    ├── ui.html           ← Plugin UI
    └── docs_context.js   ← Capillary knowledge base
```

---

## Troubleshooting

**Extension not showing suggestions?**
- Make sure the extension is enabled (check the toggle in the popup)
- Try reloading the page

**Figma plugin not opening?**
- Make sure you're using the Figma desktop app (not browser)
- Re-import the plugin via the manifest file

**Suggestions look generic / offline mode?**
- The API key is hard-coded — if you see "(Rule-based)" labels, the AI call may have failed
- Check your internet connection

---

Built for the Capillary Technologies UX team.
