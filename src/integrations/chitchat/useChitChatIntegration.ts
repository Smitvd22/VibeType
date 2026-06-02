import { useEffect, useState, useCallback } from "react";
import { postToChitChat } from "./postToChitChat";

interface SessionTransferData {
  chatId: string | null;
  userId: string | null;
  conversationId: string | null;
}

export function useChitChatIntegration() {
  const [transferData, setTransferData] = useState<SessionTransferData>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return {
        chatId: params.get("chatId"),
        userId: params.get("userId"),
        conversationId: params.get("conversationId"),
      };
    }
    return { chatId: null, userId: null, conversationId: null };
  });

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const CHITCHAT_URL = process.env.NEXT_PUBLIC_CHITCHAT_URL;
    
    // Handshake
    if (window.opener && CHITCHAT_URL) {
      try {
        const targetOrigin = new URL(CHITCHAT_URL).origin;
        window.opener.postMessage({ type: "VIBETYPE_READY" }, targetOrigin);
        setIsConnected(true);
      } catch (error) {
        console.error("Failed to send ready message", error);
      }
    }
  }, []);

  const sendResult = useCallback((text: string, emojis: string[], expressions: string[], gestures: string[]) => {
    return postToChitChat({
      text,
      emojis,
      metadata: {
        expressions,
        gestures,
        chatId: transferData.chatId || undefined,
        conversationId: transferData.conversationId || undefined,
      }
    });
  }, [transferData]);

  return {
    transferData,
    isConnected,
    sendResult
  };
}
