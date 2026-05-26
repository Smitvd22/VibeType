import { useState, useCallback, useRef } from "react";
import { GestureDetection } from "./useGestureEmbeddings";
import { FaceDetection } from "./useFaceEmbeddings";
import { ComboDetection } from "./useComboEmbeddings";

export function useEmojiEngine(setTranscript: React.Dispatch<React.SetStateAction<string>>) {
  const lastEmojiTime = useRef<number>(0);
  const [activeEmoji, setActiveEmoji] = useState<{ id: number; char: string } | null>(null);

  const currentDetectionRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const evaluateDetections = useCallback((
    gestureDet: GestureDetection, 
    faceDet: FaceDetection,
    comboDet: ComboDetection
  ) => {
    const now = Date.now();
    if (now - lastEmojiTime.current < 2000) return; // 2 seconds cooldown after triggering
    
    let emojiToTrigger: string | null = null;

    if (comboDet.combo) {
       emojiToTrigger = comboDet.combo.emoji;
    } else if (gestureDet.gesture && faceDet.expression) {
       emojiToTrigger = `${faceDet.expression.emoji}${gestureDet.gesture.emoji}`;
    } else if (gestureDet.gesture) {
       emojiToTrigger = gestureDet.gesture.emoji;
    } else if (faceDet.expression) {
       emojiToTrigger = faceDet.expression.emoji;
    }

    if (emojiToTrigger !== currentDetectionRef.current) {
      currentDetectionRef.current = emojiToTrigger;
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (emojiToTrigger) {
        // Start a 3-second timer before triggering
        timeoutRef.current = setTimeout(() => {
          const triggerTime = Date.now();
          lastEmojiTime.current = triggerTime;
          setActiveEmoji({ id: triggerTime, char: emojiToTrigger! });
          
          setTranscript(prev => prev ? `${prev} ${emojiToTrigger!}` : emojiToTrigger!);
          
          setTimeout(() => {
            setActiveEmoji(prev => prev?.id === triggerTime ? null : prev);
          }, 1500);
          
          // Clear current detection so they have to move and come back to re-trigger
          currentDetectionRef.current = null;
        }, 3000);
      }
    }
  }, [setTranscript]);

  return { activeEmoji, evaluateDetections };
}
