export interface ExtensionPayload {
  type: "VIBETYPE_MESSAGE" | "VIBETYPE_STREAM_CHUNK" | "VIBETYPE_STREAM_EMOJI";
  text?: string;
  emojis?: string[];
  metadata?: {
    expressions?: string[];
    gestures?: string[];
    timestamp?: number;
  };
}

export function postToExtension(payload: ExtensionPayload): boolean {
  if (typeof window === "undefined" || !window.opener) {
    return false;
  }

  try {
    const fullPayload: ExtensionPayload = {
      ...payload,
      metadata: {
        ...payload.metadata,
        timestamp: Date.now()
      }
    };
    
    // For extension, targetOrigin must be '*' since it can be injected on any host
    window.opener.postMessage(fullPayload, "*");
    return true;
  } catch (error) {
    console.error("Failed to post message to Extension", error);
    return false;
  }
}
