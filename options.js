document.getElementById('save-btn').onclick = () => {
    const key = document.getElementById('api-key').value.trim();
    if (!key) {
        showStatus('Please enter a valid key', '#ef4444');
        return;
    }

    chrome.storage.local.set({ gemini_api_key: key }, () => {
        showStatus('API Key saved successfully! 🚀', '#4ade80');
        setTimeout(() => {
            window.close();
        }, 1500);
    });
};

function showStatus(msg, color) {
    const status = document.getElementById('status');
    status.innerText = msg;
    status.style.color = color;
}

// Load existing key
chrome.storage.local.get(['gemini_api_key'], (res) => {
    if (res.gemini_api_key) {
        document.getElementById('api-key').value = res.gemini_api_key;
    }
});
