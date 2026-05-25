import { useState, useEffect, useRef, useCallback } from "react";

export interface EmojiMapping {
  id: string;
  expression: string;
  gesture: string;
  emoji: string;
}

const DEFAULT_MAPPINGS: EmojiMapping[] = [
  { id: '1', expression: 'smile', gesture: 'none', emoji: '😊' },
  { id: '2', expression: 'laugh', gesture: 'none', emoji: '😂' },
  { id: '3', expression: 'none', gesture: 'thumbs_up', emoji: '👍' },
  { id: '4', expression: 'none', gesture: 'peace_sign', emoji: '✌️' },
  { id: '5', expression: 'none', gesture: 'open_palm', emoji: '👋' }
];

export function useEmojiEngine(setTranscript: React.Dispatch<React.SetStateAction<string>>) {
  const lastEmojiTime = useRef<number>(0);
  const [activeEmoji, setActiveEmoji] = useState<{ id: number; char: string } | null>(null);
  const [mappings, setMappings] = useState<EmojiMapping[]>(DEFAULT_MAPPINGS);

  useEffect(() => {
    const saved = localStorage.getItem('vibetotype_emoji_mappings');
    if (saved) {
      try {
        setMappings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse emoji mappings", e);
      }
    }
  }, []);

  const saveMappings = (newMappings: EmojiMapping[]) => {
    setMappings(newMappings);
    localStorage.setItem('vibetotype_emoji_mappings', JSON.stringify(newMappings));
  };

  const evaluateEmoji = useCallback((expression: string, gesture: string) => {
    if (expression === "none" && gesture === "none") return;
    
    const now = Date.now();
    if (now - lastEmojiTime.current < 2000) return;

    // Prioritize exact combinations (e.g. smile + peace_sign)
    let matchedMapping = mappings.find(m => 
      m.expression === expression && m.gesture === gesture && m.expression !== "none" && m.gesture !== "none"
    );

    // If no combination, look for individual matches
    if (!matchedMapping) {
      matchedMapping = mappings.find(m => 
        (m.expression === expression && m.gesture === "none") ||
        (m.gesture === gesture && m.expression === "none")
      );
    }

    if (matchedMapping) {
      lastEmojiTime.current = now;
      setActiveEmoji({ id: now, char: matchedMapping.emoji });
      
      setTranscript(prev => prev ? `${prev} ${matchedMapping.emoji}` : matchedMapping.emoji);
      
      setTimeout(() => {
        setActiveEmoji(prev => prev?.id === now ? null : prev);
      }, 1500);
    }
  }, [mappings, setTranscript]);

  return { activeEmoji, evaluateEmoji, mappings, saveMappings };
}
