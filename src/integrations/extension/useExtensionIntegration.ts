import { useEffect, useState, useCallback } from "react";
import { postToExtension } from "./postToExtension";

export function useExtensionIntegration() {
  const [isExtension, setIsExtension] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // A function to check and connect
    const checkAndConnect = () => {
      if (typeof window === "undefined") return;

      try {
        const urlParams = new URLSearchParams(window.location.search);
        const isExt = urlParams.get("source") === "extension";
        
        console.log("[VibeType] Extension check:", { 
          source: urlParams.get("source"), 
          hasOpener: !!window.opener,
          href: window.location.href
        });

        if (isExt && window.opener) {
          console.log("[VibeType] Connecting to extension!");
          setIsExtension(true);
          window.opener.postMessage({ type: "VIBETYPE_READY" }, "*");
          setIsConnected(true);
        }
      } catch (err) {
        console.error("Extension integration error:", err);
      }
    };

    // Check immediately
    checkAndConnect();

    // Also check on load just in case
    window.addEventListener("load", checkAndConnect);
    return () => window.removeEventListener("load", checkAndConnect);
  }, []);

  const sendResult = useCallback((text: string, emojis: string[], expressions: string[], gestures: string[]) => {
    return postToExtension({
      type: "VIBETYPE_MESSAGE",
      text,
      emojis,
      metadata: {
        expressions,
        gestures,
      }
    });
  }, []);

  const sendStreamChunk = useCallback((text: string) => {
    return postToExtension({
      type: "VIBETYPE_STREAM_CHUNK",
      text,
    });
  }, []);

  const sendStreamEmoji = useCallback((emoji: string) => {
    return postToExtension({
      type: "VIBETYPE_STREAM_EMOJI",
      text: emoji,
    });
  }, []);

  return {
    isExtension,
    isConnected,
    sendResult,
    sendStreamChunk,
    sendStreamEmoji
  };
}
