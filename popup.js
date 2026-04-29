// Button 1: Check Website Authenticity
document.getElementById('btn-safety').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        let url = new URL(tabs[0].url);
        sendToAI("askSafety", "", url.hostname);
    });
});

// Button 2: Summarize Page
document.getElementById('btn-summarize').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.scripting.executeScript({
            target: {tabId: tabs[0].id},
            function: () => document.body.innerText
        }, (results) => {
            if (results && results[0]) {
                sendToAI("summarizePage", results[0].result.substring(0, 3000));
            }
        });
    });
});

// Send request to background.js
function sendToAI(actionName, dataText = "", domainName = "") {
    document.getElementById('chat-box').innerHTML = `<i style="color:gray;">Agent is investigating... 🕵️</i>`;
    
    chrome.runtime.sendMessage({
        action: actionName, 
        text: dataText, 
        domain: domainName
    }, function(response) {
        if (chrome.runtime.lastError) {
            document.getElementById('chat-box').innerHTML = `<b style="color:red;">Extension Error: ${chrome.runtime.lastError.message}</b>`;
            return;
        }
        if (response && response.reply) {
            document.getElementById('chat-box').innerHTML = response.reply;
        } else {
            document.getElementById('chat-box').innerHTML = `<b style="color:red;">Unknown Error Occurred.</b>`;
        }
    });
}
