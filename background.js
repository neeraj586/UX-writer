chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "ux-writer-suggest",
        title: "Get UX Suggestions",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "ux-writer-suggest") {
        chrome.tabs.sendMessage(tab.id, {
            action: "show_suggestions",
            text: info.selectionText
        });
    }
});

// Handle the Keyboard Command (Cmd+Shift+X)
chrome.commands.onCommand.addListener((command) => {
    if (command === "show-ux-writer") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "toggle_panel" });
            }
        });
    }
});
