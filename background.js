let languageModel = null;

async function initializeLanguageModel() {
    try {
        console.log('Initializing language model...');
        const capabilities = await ai.languageModel.capabilities();
        
        if (capabilities && capabilities.available !== 'no') {
            // Create the language model here
            languageModel = await ai.languageModel.create();
            
            if (capabilities.available !== 'readily') {
                languageModel.addEventListener('downloadprogress', (e) => {
                    console.log(`Language model download progress: ${e.loaded}/${e.total}`);
                });
                await languageModel.ready;
            }
            
            console.log('Language model initialized successfully');
        } else {
            console.error('Language model is not available');
        }
    } catch (error) {
        console.error('Error initializing language model:', error);
    }
}

// Initialize when the extension starts
initializeLanguageModel();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_LANGUAGE_MODEL') {
        sendResponse({ languageModel: languageModel !== null });
    } else if (request.type === 'ANALYZE_COMMENTS') {
        analyzeComments(request.comments)
            .then(result => sendResponse({ success: true, result }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Required for async response
    }
});

async function analyzeComments(commentsText) {
    if (!languageModel) {
        throw new Error('Language model not initialized');
    }

    const maxCharacters = 4000;
    if (commentsText.length > maxCharacters) {
        commentsText = commentsText.slice(0, maxCharacters);
    }

    const result = await languageModel.prompt(
        "Analyze the text and segregate pointwise into Complaints, Pain Points, User Requests, and Other insights. For each category, provide a bullet-point list of the main points. If a category doesn't have any relevant points, you can omit it.\n\n" + commentsText
    );

    return result;
}

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error)); 