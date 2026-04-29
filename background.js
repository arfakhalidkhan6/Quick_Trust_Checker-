let apiKey = 'YOUR_API_KEY_HERE'; // Paste your Google Gemini API Key here!
let tabMemories = {}; 

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
      let isFloatingMenu = !!sender.tab; 
      let tabId = sender.tab ? sender.tab.id : "popup";
      
      let systemPrompt = "Answer concisely.";
      let geminiContents = [];

      // 1. ROUTE THE ACTIONS & SET SYSTEM PROMPT
      if (request.action === "askSafety") {
        geminiContents.push({ role: "user", parts: [{ text: `I am visiting ${request.domain}. In 2 short sentences, tell me if this is a known, authentic, and safe website.` }]});
      }
      else if (request.action === "summarizePage") {
        geminiContents.push({ role: "user", parts: [{ text: `Please write a concise 3-bullet point summary of this article: \n\n${request.text}` }]});
      }
      else if (request.action === "explain") {
        systemPrompt = "You are a teacher. Explain the text simply in under 3 sentences.";
        geminiContents.push({ role: "user", parts: [{ text: `Explain: "${request.text}"` }]});
      } 
      else if (request.action === "factCheck") {
        
        systemPrompt = `You are an elite Fact-Checking AI. You have access to Google Search. You MUST check the live internet to verify the user's claim before answering.

You MUST reply using EXACTLY this format:
<b> Accuracy Score:</b> [Insert 0-100%]
<b> Explanation:</b> [Insert 2 concise sentences explaining the facts using the live data you found]
<b>🔗 Sources:</b> [List the specific websites you found in your live search]`;
        geminiContents.push({ role: "user", parts: [{ text: `Fact check this claim: "${request.text}"` }]});
      } 
      else if (request.action === "chat") {
        if (isFloatingMenu) {
            if (!tabMemories[tabId]) tabMemories[tabId] = [];
            
            // Load history into Gemini's format
            geminiContents = tabMemories[tabId].map(msg => ({
                role: msg.role === "assistant" ? "model" : "user",
                parts: [{ text: msg.content }]
            }));
            
            // Add new message
            geminiContents.push({ role: "user", parts: [{ text: request.text }] });
            tabMemories[tabId].push({ role: "user", content: request.text });
        } else {
            geminiContents.push({ role: "user", parts: [{ text: request.text }] });
        }
      }

      // 2. TALK TO GOOGLE GEMINI (With Live Search!)
      fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: geminiContents,

            tools: [{ googleSearch: {} }] 
        }) 
      })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
           sendResponse({ reply: "Gemini API Error: " + data.error.message });
           return;
        }
        
        let reply = data.candidates[0].content.parts[0].text;
        reply = reply.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>'); // Format bolding
        
        if (isFloatingMenu && ["chat", "explain", "factCheck"].includes(request.action)) {
            if (!tabMemories[tabId]) tabMemories[tabId] = [];
            tabMemories[tabId].push({ role: "assistant", content: reply });
        }
        
        sendResponse({ reply: reply });
      })
      .catch(err => {
        sendResponse({ reply: "Network Error: " + err.message });
      });
      
  } catch (e) {
      sendResponse({ reply: "Code Crash: " + e.message });
  }

  return true; 
});

chrome.tabs.onRemoved.addListener((tabId) => {
  delete tabMemories[tabId];
});
