let menu = null;

// 1. LISTEN FOR HIGHLIGHTED TEXT
document.addEventListener('mouseup', (e) => {
    // Wait a tiny fraction of a second so Chrome registers the selection
    setTimeout(() => {
        let selectedText = window.getSelection().toString().trim();

        // If you click somewhere else, remove the menu
        if (menu && !menu.contains(e.target)) {
            menu.remove();
            menu = null;
        }

        // If text is highlighted, show the pop-up buttons!
        if (selectedText.length > 5 && !menu) {
            menu = document.createElement('div');
            menu.id = "smart-reading-menu";
            menu.style.position = "absolute";
            menu.style.top = `${e.pageY + 12}px`;
            menu.style.left = `${e.pageX}px`;
            menu.style.background = "#fff";
            menu.style.border = "1px solid #ccc";
            menu.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
            menu.style.padding = "5px";
            menu.style.borderRadius = "8px";
            menu.style.zIndex = "2147483647"; // Maximum possible value, guarantees it stays on top!
            menu.style.display = "flex";
            menu.style.gap = "5px";

            // Explain Button
            let btnExplain = document.createElement('button');
            btnExplain.innerText = "Explain";
            btnExplain.style.cursor = "pointer";
            btnExplain.style.border = "none";
            btnExplain.style.padding = "6px 10px";
            btnExplain.style.background = "#007bff";
            btnExplain.style.color = "white";
            btnExplain.style.borderRadius = "4px";
            btnExplain.onclick = () => callAgent("explain", selectedText);

            // Fact Check Button
            let btnFactCheck = document.createElement('button');
            btnFactCheck.innerText = "Fact Check";
            btnFactCheck.style.cursor = "pointer";
            btnFactCheck.style.border = "none";
            btnFactCheck.style.padding = "6px 10px";
            btnFactCheck.style.background = "#28a745";
            btnFactCheck.style.color = "white";
            btnFactCheck.style.borderRadius = "4px";
            btnFactCheck.onclick = () => callAgent("factCheck", selectedText);

            menu.appendChild(btnExplain);
            menu.appendChild(btnFactCheck);
            document.body.appendChild(menu);
        }
    }, 50);
});

// 2. TRIGGER THE AI WHEN A BUTTON IS CLICKED
function callAgent(actionType, text) {
    // Delete the small menu instantly
    if (menu) {
        menu.remove();
        menu = null;
    }

    // Clear the blue highlight so the text looks normal again
    window.getSelection().removeAllRanges();

    // Open the big AI chat box (if it isn't open already)
    let ui = document.getElementById("smart-reading-ui");
    if (!ui) {
        createUI(); 
        ui = document.getElementById("smart-reading-ui");
    }
    
    // Show the "Investigating..." loading text
    let messagesDiv = document.getElementById("smart-reading-messages");
    let loadingId = "load-" + Date.now();
    messagesDiv.innerHTML += `<div id="${loadingId}" style="margin-bottom: 10px; color: #666;"><i>Agent is investigating... 🕵️</i></div>`;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    // Send the text to background.js
    chrome.runtime.sendMessage({ action: actionType, text: text }, (response) => {
        // Remove the loading text
        let loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.remove();
        
        // Show the AI's final answer!
        if (chrome.runtime.lastError) {
             messagesDiv.innerHTML += `<div style="margin-bottom: 10px; color: red;">🛑 Error: ${chrome.runtime.lastError.message}</div>`;
        } else if (response && response.reply) {
             messagesDiv.innerHTML += `<div style="margin-bottom: 10px; background: #e9ecef; padding: 10px; border-radius: 8px;"><b>AI:</b> <br>${response.reply}</div>`;
        }
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
}

// 3. CREATE THE MAIN CHAT BOX UI
function createUI() {
    let ui = document.createElement('div');
    ui.id = "smart-reading-ui";
    ui.style.position = "fixed";
    ui.style.bottom = "20px";
    ui.style.right = "20px";
    ui.style.width = "350px";
    ui.style.height = "400px";
    ui.style.background = "white";
    ui.style.border = "1px solid #ccc";
    ui.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
    ui.style.borderRadius = "10px";
    ui.style.zIndex = "2147483647"; // Keep chat box on top of everything
    ui.style.display = "flex";
    ui.style.flexDirection = "column";
    ui.style.fontFamily = "Arial, sans-serif";

    // Header
    let header = document.createElement('div');
    header.style.background = "#333";
    header.style.color = "white";
    header.style.padding = "10px";
    header.style.fontWeight = "bold";
    header.style.display = "flex";
    header.style.justifyContent = "space-between";
    header.innerText = "🤖 AI Assistant";

    // Close X Button
    let closeBtn = document.createElement('span');
    closeBtn.innerText = "✖";
    closeBtn.style.cursor = "pointer";
    closeBtn.onclick = () => ui.remove();
    header.appendChild(closeBtn);
    ui.appendChild(header);

    // Chat History Area
    let messagesDiv = document.createElement('div');
    messagesDiv.id = "smart-reading-messages";
    messagesDiv.style.flex = "1";
    messagesDiv.style.padding = "10px";
    messagesDiv.style.overflowY = "auto";
    messagesDiv.style.fontSize = "14px";
    messagesDiv.style.lineHeight = "1.5";
    ui.appendChild(messagesDiv);

    // Typing Input Area (For follow-up questions)
    let inputArea = document.createElement('div');
    inputArea.style.display = "flex";
    inputArea.style.padding = "10px";
    inputArea.style.borderTop = "1px solid #ccc";
    
    let input = document.createElement('input');
    input.type = "text";
    input.placeholder = "Ask a follow-up...";
    input.style.flex = "1";
    input.style.padding = "8px";
    input.style.border = "1px solid #ccc";
    input.style.borderRadius = "4px";
    
    let sendBtn = document.createElement('button');
    sendBtn.innerText = "Send";
    sendBtn.style.marginLeft = "5px";
    sendBtn.style.padding = "8px 12px";
    sendBtn.style.background = "#007bff";
    sendBtn.style.color = "white";
    sendBtn.style.border = "none";
    sendBtn.style.borderRadius = "4px";
    sendBtn.style.cursor = "pointer";
    
    sendBtn.onclick = () => {
        let text = input.value;
        if (!text) return;
        messagesDiv.innerHTML += `<div style="margin-bottom: 10px; text-align: right; color: blue;"><b>You:</b> ${text}</div>`;
        input.value = "";
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        callAgent("chat", text);
    };

    inputArea.appendChild(input);
    inputArea.appendChild(sendBtn);
    ui.appendChild(inputArea);

    document.body.appendChild(ui);
}
