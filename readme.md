#  Smart Reading Assistant (Chrome Extension)

A lightweight, real-time Chrome Extension built with JavaScript that brings the power of AI directly to your browser. This tool helps users safely navigate the web and process information faster by utilizing the **OpenRouter API** to run advanced AI models seamlessly in the background.

##  Features
* ** Website Authenticity Check:** Analyzes the current domain and gives a quick safety assessment to protect users from phishing or malicious sites.
* ** Instant Page Summarization:** With one click, it reads the content of the page you are on and generates a concise, easy-to-read summary.
* **Modern, Clean UI:** Features a responsive, scrollable popup interface that stays out of your way while delivering information clearly.

## Tech Stack
* **Frontend:** HTML, CSS (Integrated UI), JavaScript 
* **Backend/API:** Google Gemini API (Powered by Gemini Flash)
* **Architecture:** Chrome Extension Manifest V3

##  How to Install & Run Locally

To protect API quotas, this repository does not include an active API key. You will need to generate your own free key to use the extension.

**Step 1: Get Your Free API Key**
1. Go to [Google AI Studio](https://aistudio.google.com/) and sign in with a personal Google account.
2. Click on **Get API key** in the left menu.
3. Click the **Create API key** button.
4. Copy the generated key.

**Step 2: Add the Key to the Code**
1. Download or clone this repository to your computer.
2. Open the `background.js` file.
3. On line 1, replace the placeholder text with your actual key:
   `let apiKey = 'YOUR_API_KEY_HERE';`
4. Save the file.

**Step 3: Load into Google Chrome**
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Turn on **Developer mode** (toggle switch in the top right corner).
3. Click the **Load unpacked** button in the top left.
4. Select the folder containing this project.
5. Pin the extension to your Chrome toolbar, click it, and start analyzing web pages!
