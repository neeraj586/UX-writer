const PRODUCT_KB = {
    products: ["Loyalty+", "Engage+", "Insights+", "Connect+", "Rewards+", "Member Care", "Dev Console", "Neo", "Vulcan", "InTouch", "AskAira"],
    dictionary: {
        "sees": "series", "see": "series", "card sees": "Card Series", "coupon sees": "Coupon Series",
        "mthod": "method", "methd": "method", "genration": "generation", "register": "enroll",
        "signup": "enrollment", "give": "issue", "sent": "issuance", "use": "redeem",
        "used": "redemption", "old transaction": "retro transaction", "hide": "mask"
    }
};

let bubble = null;
let panel = null;

function init() {
    document.addEventListener('mouseup', handleSelection);
    chrome.runtime.onMessage.addListener(async (request) => {
        const res = await chrome.storage.local.get(['extensionEnabled']);
        if (res.extensionEnabled === false) return;

        if (request.action === "toggle_panel" || request.action === "show_suggestions") {
            const selection = request.text || window.getSelection().toString().trim();
            showPanel(window.innerWidth / 2 - 160, 150, selection);
        }
    });

    document.addEventListener('mousedown', (e) => {
        if (panel && !panel.contains(e.target) && !bubble?.contains(e.target)) removePanel();
    });
}

async function handleSelection(e) {
    const res = await chrome.storage.local.get(['extensionEnabled']);
    if (res.extensionEnabled === false) return;

    const selection = window.getSelection().toString().trim();
    if (selection && selection.length < 500) showBubble(e.clientX, e.clientY, selection);
}

function showBubble(x, y, text) {
    removeBubble();
    bubble = document.createElement('div');
    bubble.id = 'ux-writer-bubble';
    bubble.innerHTML = `<svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:white;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`;
    bubble.style.cssText = `position:fixed; left:${x + 10}px; top:${y - 40}px; z-index:2147483647; background:#6366f1; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,0.4);`;
    bubble.onmousedown = (e) => {
        e.stopPropagation(); e.preventDefault();
        showPanel(x, y, text);
        removeBubble();
    };
    document.body.appendChild(bubble);
}

async function showPanel(x, y, text) {
    if (panel) removePanel();
    panel = document.createElement('div');
    panel.id = 'ux-writer-panel';
    panel.style.cssText = `position:fixed; left:${Math.min(x, window.innerWidth - 340)}px; top:${Math.min(y, window.innerHeight - 450)}px; z-index:2147483647; width:320px; background:#0f172a; border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:16px; box-shadow:0 20px 60px rgba(0,0,0,0.6); font-family:'Inter', sans-serif; color:white;`;

    await updatePanelContent(text);
    document.body.appendChild(panel);

    const input = document.getElementById('ux-manual-input');
    const contextInput = document.getElementById('ux-context-input');

    input?.focus();

    let debounceTimer;
    const triggerInPageRewrite = () => {
        clearTimeout(debounceTimer);
        const newList = document.getElementById('ux-suggestions-list');
        newList.innerHTML = '<div style="text-align:center; padding: 20px;"><div class="loading-spinner"></div></div>';

        debounceTimer = setTimeout(async () => {
            const suggestions = await getAISuggestions(input.value, contextInput.value);
            newList.innerHTML = suggestions ? suggestions.map(s => renderCard(s)).join('') : '';
            attachListeners();
        }, 800);
    };

    input?.addEventListener('input', triggerInPageRewrite);
    contextInput?.addEventListener('input', triggerInPageRewrite);

    document.getElementById('ux-close-btn').onclick = removePanel;
    attachListeners();
}

async function updatePanelContent(text) {
    const suggestions = await getAISuggestions(text);
    panel.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <span style="font-weight:700; font-size:14px; background:linear-gradient(90deg, #818cf8, #c084fc); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">Capillary UX Writer</span>
            <span id="ux-close-btn" style="cursor:pointer; font-size:18px; color:#64748b;">✕</span>
        </div>
        <input type="text" id="ux-manual-input" style="width:100%; box-sizing:border-box; padding:10px; border-radius:8px; background:#1e293b; border:1px solid #334155; color:white; font-size:13px; margin-bottom:8px; outline:none;" placeholder="Type / Paste here..." value="${text || ''}">
        <input type="text" id="ux-context-input" style="width:100%; box-sizing:border-box; padding:8px; border-radius:8px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); color:#94a3b8; font-size:11px; margin-bottom:16px; outline:none;" placeholder="Add context (e.g. Settings page)">
        <div id="ux-suggestions-list">${suggestions ? suggestions.map(s => renderCard(s)).join('') : ''}</div>
    `;
}

async function getAISuggestions(text, context = "") {
    if (!text) return null;
    const apiKey = typeof GROQ_KEY !== 'undefined' ? GROQ_KEY : '';

    try {
        const deepContext = typeof DEEP_DOCS_CONTEXT !== 'undefined' ? DEEP_DOCS_CONTEXT : { product_entities: [], featured_terms: [], us_standard: {}, style_guide: { core_principles: [], examples: [] } };
        const sg = deepContext.style_guide;

        const prompt = `You are a Senior UX Writer at Capillary Technologies specialising in SaaS product copy.

CAPILLARY STYLE GUIDE:
- Principles: ${sg.core_principles.join(', ')}
- Tone: ${sg.tone}
- Examples: ${sg.examples.map(ex => `"${ex.bad}" → "${ex.good}"`).join(' | ')}

CAPILLARY KNOWLEDGE:
- Products: ${deepContext.product_entities.slice(0, 20).join(', ')}
- Terms: ${deepContext.featured_terms.slice(0, 10).join(', ')}

SaaS UX WRITING STANDARDS (strictly follow all):
1. Sentence case always — capitalise only the first word and proper nouns. Never title case.
2. Full stop rules (critical — read carefully):
   - Buttons, labels, headings, nav items, tooltips, tab names → NEVER a full stop
   - Single-sentence descriptions or helper text → NO full stop
   - Multi-sentence descriptions or body copy (2+ sentences) → full stop after EACH sentence including the last
   - Example: "Save your changes. This cannot be undone." ✓   "Save your changes" ✓   "Save your changes." ✗
3. Active voice — "Issue coupon" not "Coupon is issued"
4. US English — no British spellings
5. Scannable and short — cut every word that doesn't add meaning
6. No filler words — remove "please", "simply", "just", "easily", "quickly"
7. Lead with the verb for actions — "Save changes", "Add member", "Issue coupon"
8. No marketing fluff — no "powerful", "seamless", "robust", "leverage"
9. Use correct Capillary terminology

INPUT:
- Text to rewrite: "${text}"
- Context: "${context || 'General'}"

Return ONLY a valid JSON array of exactly 3 suggestions, no markdown:
[{"label": "archetype", "text": "copy", "desc": "one-line reason"}]`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }]
            })
        });
        const data = await response.json();
        const aiText = data.choices[0].message.content;
        const jsonMatch = aiText.match(/\[.*\]/s);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : getHeuristicSuggestions(text, context, "(AI Parse Error)");
    } catch (e) {
        return getHeuristicSuggestions(text, context, "(Offline)");
    }
}

function getHeuristicSuggestions(text, context = "", suffix = "") {
    let val = text.toLowerCase();
    Object.keys(PRODUCT_KB.dictionary).forEach(k => val = val.replace(new RegExp(`\\b${k}\\b`, 'gi'), PRODUCT_KB.dictionary[k]));
    const toS = (s) => s.charAt(0).toUpperCase() + s.slice(1);

    const contextStr = context ? ` [Context: ${context}]` : "";

    return [
        { label: `Standard UX ${suffix}`, text: toS(val), desc: "US English correction." },
        { label: "Product Context", text: `Configure ${val} in ${PRODUCT_KB.products[0]}${contextStr}`, desc: "Capillary standard." },
        { label: "Action Oriented", text: `Launch ${val} now`, desc: "Conversion focused." }
    ];
}

function renderCard(s) {
    return `<div class="ux-suggestion-card" data-text="${s.text.replace(/"/g, '&quot;')}" style="background:rgba(30,41,59,0.8); border:1px solid rgba(255,255,255,0.05); border-radius:12px; padding:12px; margin-bottom:10px; cursor:pointer; position:relative;">
                <div style="font-size:9px; color:#818cf8; font-weight:700; text-transform:uppercase; margin-bottom:4px;">${s.label}</div>
                <div style="font-size:13px; color:#f1f5f9; line-height:1.5;">${s.text}</div>
                <div style="font-size:10px; color:#64748b; margin-top:4px;">${s.desc}</div>
            </div>`;
}

function attachListeners() {
    document.querySelectorAll('.ux-suggestion-card').forEach(card => {
        card.onclick = () => {
            const txt = card.getAttribute('data-text');
            navigator.clipboard.writeText(txt).then(() => {
                card.style.background = 'rgba(74, 222, 128, 0.2)';
                setTimeout(removePanel, 800);
            });
        };
    });
}

function removeBubble() { if (bubble) bubble.remove(); bubble = null; }
function removePanel() { if (panel) panel.remove(); panel = null; }

init();
