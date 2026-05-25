import { useState, useCallback, useRef } from "react";

const EMOJI_MAP: Record<string, string> = {
  smile: "😊",
  laugh: "😂",
  thumbs_up: "👍",
  peace_sign: "✌️",
  open_palm: "👋"
};

export function useEmojiEngine(setTranscript: React.Dispatch<React.SetStateAction<string>>) {
  const lastEmojiTime = useRef<number>(0);
  const [activeEmoji, setActiveEmoji] = useState<{ id: number; char: string } | null>(null);

  const triggerEmoji = useCallback((type: string) => {
    if (type === "none" || type === "surprise") return; // Surprise is not mapped to an emoji yet
    
    const now = Date.now();
    // Debounce emojis to avoid spamming the transcript
    if (now - lastEmojiTime.current < 2000) return;
    
    const emoji = EMOJI_MAP[type];
    if (emoji) {
      lastEmojiTime.current = now;
      setActiveEmoji({ id: now, char: emoji });
      
      // Append to transcript
      setTranscript(prev => prev ? `${prev} ${emoji}` : emoji);
      
      setTimeout(() => {
        setActiveEmoji(prev => prev?.id === now ? null : prev);
      }, 1500);
    }
  }, [setTranscript]);

  return { triggerEmoji, activeEmoji };
}
