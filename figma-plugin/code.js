figma.showUI(__html__, { width: 400, height: 600, themeColors: true });

// Load API key from plugin storage
figma.clientStorage.getAsync('gemini_api_key').then(key => {
    figma.ui.postMessage({ type: 'api-key', key: key || '' });
});

// Auto-fetch whenever user selects a different text layer in Figma
figma.on('selectionchange', () => {
    const selection = figma.currentPage.selection;
    if (selection.length > 0 && selection[0].type === "TEXT") {
        figma.ui.postMessage({ type: 'selection', text: selection[0].characters });
    }
});

figma.ui.onmessage = async (msg) => {
    if (msg.type === 'get-selection') {
        const selection = figma.currentPage.selection;
        if (selection.length > 0 && selection[0].type === "TEXT") {
            figma.ui.postMessage({ type: 'selection', text: selection[0].characters });
        } else {
            figma.notify("Please select a text layer");
        }
    }

    if (msg.type === 'update-text') {
        const selection = figma.currentPage.selection;
        if (selection.length > 0 && selection[0].type === "TEXT") {
            // Load fonts before updating
            await figma.loadFontAsync(selection[0].fontName);
            selection[0].characters = msg.text;
            figma.notify("Text updated! ✨");
        }
    }

    if (msg.type === 'save-api-key') {
        await figma.clientStorage.setAsync('gemini_api_key', msg.key);
        figma.notify("API Key saved! 🚀");
    }
};
