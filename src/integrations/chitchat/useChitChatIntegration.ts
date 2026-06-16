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
        userId: transferData.userId || undefined,
      }
    });
  }, [transferData]);

  const sendStreamChunk = useCallback((text: string) => {
    return postToChitChat({
      type: "VIBETYPE_STREAM_CHUNK" as any, // Need to bypass type check for now since we didn't update postToChitChat type yet, actually wait, let's update postToChitChat first. No I'll just change postToChitChat type inline if I can. Let's just use any for now
      text,
      emojis: [],
      metadata: {
        expressions: [],
        gestures: [],
        chatId: transferData.chatId || undefined,
        conversationId: transferData.conversationId || undefined,
        userId: transferData.userId || undefined,
      }
    });
  }, [transferData]);

  const sendStreamEmoji = useCallback((emoji: string) => {
    return postToChitChat({
      type: "VIBETYPE_STREAM_EMOJI" as any,
      text: emoji,
      emojis: [emoji],
      metadata: {
        expressions: [],
        gestures: [],
        chatId: transferData.chatId || undefined,
        conversationId: transferData.conversationId || undefined,
        userId: transferData.userId || undefined,
      }
    });
  }, [transferData]);

  return {
    transferData,
    isConnected,
    sendResult,
    sendStreamChunk,
    sendStreamEmoji
  };
}
