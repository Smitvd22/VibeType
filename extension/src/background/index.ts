import { ExtensionMessage } from '../shared/messageTypes';

const VIBE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://vibetype.com' 
  : 'http://localhost:3000';

chrome.commands.onCommand.addListener((command: string) => {
  if (command === "toggle-vibe") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
      const activeTab = tabs[0];
      if (activeTab?.id) {
        const msg: ExtensionMessage = { type: 'TOGGLE_VIBE' };
        chrome.tabs.sendMessage(activeTab.id, msg).catch((err: unknown) => {
          console.warn("Could not send toggle message to content script:", err);
        });
      }
    });
  }
});

chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  if (message.type === 'SESSION_STATUS') {
    fetch(`${VIBE_URL}/api/auth/session`)
      .then(res => res.json())
      .then(data => sendResponse(data))
      .catch((err) => {
        console.error("Session fetch failed", err);
        sendResponse({ user: null });
      });
    return true; // required for async response
  }
});
