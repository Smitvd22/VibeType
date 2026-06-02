export interface VibeTypePayload {
  type: "VIBETYPE_MESSAGE";
  text: string;
  emojis: string[];
  metadata: {
    expressions: string[];
    gestures: string[];
    timestamp: number;
    chatId?: string;
    conversationId?: string;
  };
}

export function postToChitChat(payload: Omit<VibeTypePayload, "type" | "metadata"> & { metadata: Omit<VibeTypePayload["metadata"], "timestamp"> }): boolean {
  const CHITCHAT_URL = process.env.NEXT_PUBLIC_CHITCHAT_URL;
  
  if (!CHITCHAT_URL) {
    console.error("Missing NEXT_PUBLIC_CHITCHAT_URL");
    return false;
  }

  if (typeof window === "undefined" || !window.opener) {
    return false;
  }

  try {
    const fullPayload: VibeTypePayload = {
      type: "VIBETYPE_MESSAGE",
      text: payload.text,
      emojis: payload.emojis,
      metadata: {
        ...payload.metadata,
        timestamp: Date.now()
      }
    };
    
    // Create a URL object to ensure proper origin matching
    const targetOrigin = new URL(CHITCHAT_URL).origin;

    window.opener.postMessage(fullPayload, targetOrigin);
    return true;
  } catch (error) {
    console.error("Failed to post message to ChitChat", error);
    return false;
  }
}
