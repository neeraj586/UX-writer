const PRODUCT_KB = {
    products: ["Loyalty+", "Engage+", "Insights+", "Connect+", "Rewards+", "Member Care", "Dev Console", "Neo", "Vulcan", "InTouch", "AskAira"],
    dictionary: {
        "sees": "series", "see": "series", "card sees": "Card Series", "coupon sees": "Coupon Series",
        "mthod": "method", "methd": "method", "genration": "generation", "register": "enroll",
        "signup": "enrollment", "give": "issue", "sent": "issuance", "use": "redeem",
        "used": "redemption", "old transaction": "retro transaction", "hide": "mask"
    }
};

const input = document.getElementById('main-input');
const results = document.getElementById('results');
const status = document.getElementById('copy-status');

let debounceTimer;

const contextInput = document.getElementById('context-input');
const extensionToggle = document.getElementById('extension-toggle');
const masterStatus = document.getElementById('master-status');

// Load master toggle state
chrome.storage.local.get(['extensionEnabled'], (res) => {
    const isEnabled = res.extensionEnabled !== false;
    extensionToggle.checked = isEnabled;
    updateStatusUI(isEnabled);
});

extensionToggle.addEventListener('change', (e) => {
    const isEnabled = e.target.checked;
    chrome.storage.local.set({ extensionEnabled: isEnabled });
    updateStatusUI(isEnabled);
});

function updateStatusUI(isEnabled) {
    if (isEnabled) {
        masterStatus.innerText = "Extension is Active";
        masterStatus.style.color = "#818cf8";
    } else {
        masterStatus.innerText = "Extension is Disabled";
        masterStatus.style.color = "#ef4444";
    }
}

function triggerRewrite() {
    clearTimeout(debounceTimer);
    const val = input.value.trim();
    const context = contextInput.value.trim();

    if (!val) {
        results.innerHTML = '<div style="font-size: 13px; color: #64748b; text-align: center; padding: 40px;">Enter copy to get True AI suggestions.</div>';
        return;
    }

    results.innerHTML = '<div style="text-align:center; padding: 20px;"><div class="loading-spinner"></div><div style="font-size:11px; color:#818cf8; margin-top:8px;">Gemini AI is thinking...</div></div>';

    debounceTimer = setTimeout(async () => {
        const suggestions = await getAISuggestions(val, context);
        results.innerHTML = suggestions.map(s => renderCard(s)).join('');
        attachListeners();
    }, 600);
}

input.addEventListener('input', triggerRewrite);
contextInput.addEventListener('input', triggerRewrite);

async function getAISuggestions(text, context = "") {
    const res = await chrome.storage.local.get(['gemini_api_key']);
    const apiKey = res.gemini_api_key;

    if (!apiKey) {
        return getHeuristicSuggestions(text, context, "(Offline Mode)");
    }

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
1. NO periods/full stops at the end — UI labels, buttons, tooltips, headings and short strings never end with punctuation
2. Sentence case only — capitalise first word and proper nouns only
3. Active voice — "Issue coupon" not "Coupon is issued"
4. US English — no British spellings
5. Scannable and short — cut every word that doesn't add meaning
6. No filler words — remove "please", "simply", "just", "easily", "quickly"
7. Lead with the verb for actions — "Save changes", "Add member", "Issue coupon"
8. No marketing fluff — no "powerful", "seamless", "robust", "leverage"
9. Use correct Capillary terminology

INPUT:
- Text to rewrite: "${text}"
- Context: "${context || 'No specific context'}"

Return ONLY a valid JSON array of exactly 3 suggestions, no markdown:
[{"label": "archetype", "text": "copy", "desc": "one-line reason"}]`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        const aiText = data.candidates[0].content.parts[0].text;
        const jsonMatch = aiText.match(/\[.*\]/s);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : getHeuristicSuggestions(text, context, "(AI Failed)");
    } catch (err) {
        console.error("AI Error:", err);
        return getHeuristicSuggestions(text, context, "(Offline Fallback)");
    }
}

function getHeuristicSuggestions(text, context = "", suffix = "") {
    let val = text.toLowerCase();
    Object.keys(PRODUCT_KB.dictionary).forEach(k => {
        const regex = new RegExp(`\\b${k}\\b`, 'gi');
        val = val.replace(regex, PRODUCT_KB.dictionary[k]);
    });
    const toSentenceCase = (s) => s.charAt(0).toUpperCase() + s.slice(1);

    const contextStr = context ? ` [Context: ${context}]` : "";

    return [
        { label: `Standard UX ${suffix}`, text: toSentenceCase(val), desc: "Direct correction." },
        { label: "Product Context", text: `Configure ${val} in ${PRODUCT_KB.products[0]}${contextStr}`, desc: "Aligned with product standards." },
        { label: "Action Oriented", text: `Launch ${val} now`, desc: "Conversion focused." }
    ];
}

function renderCard(s) {
    return `
        <div class="card" style="background:rgba(30,41,59,0.8); border:1px solid rgba(129,140,248,0.2); border-radius:12px; padding:14px; margin-bottom:12px; cursor:pointer;" data-text="${s.text.replace(/"/g, '&quot;')}">
            <div class="label" style="font-size:9px; color:#818cf8; font-weight:800; text-transform:uppercase; margin-bottom:4px;">${s.label}</div>
            <div class="text" style="font-size:14px; color:#f8fafc; line-height:1.4;">${s.text}</div>
            <div style="font-size:10px; color:#64748b; margin-top:6px;">${s.desc}</div>
        </div>`;
}

function attachListeners() {
    document.querySelectorAll('.card').forEach(card => {
        card.onclick = () => {
            const txt = card.getAttribute('data-text');
            navigator.clipboard.writeText(txt).then(() => {
                status.style.display = 'block';
                setTimeout(() => { status.style.display = 'none'; }, 1000);
            });
        };
    });
}
