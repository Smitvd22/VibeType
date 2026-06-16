import { useState, useEffect } from 'react';
import { Mic, Sparkles } from 'lucide-react';
import { ExtensionMessage } from '../shared/messageTypes';
import { insertTextIntoField } from './textInjector';

export const FloatingWidget = () => {
  const [activeElement, setActiveElement] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);


  useEffect(() => {
    // Focus tracking
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target instanceof HTMLInputElement || 
        target instanceof HTMLTextAreaElement || 
        target.isContentEditable
      ) {
        // Position widget near the input
        const rect = target.getBoundingClientRect();
        setPosition({
          top: window.scrollY + rect.bottom + 5,
          left: window.scrollX + rect.right - 50,
        });
        setActiveElement(target);
      }
    };

    const handleBlur = (_e: FocusEvent) => {
      // Add a small delay so clicking the widget doesn't immediately hide it
      setTimeout(() => {
        if (!document.activeElement || document.activeElement === document.body) {
          setPosition(null);
        }
      }, 200);
    };

    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);

    // Keyboard shortcut listener from Background Script
    const extensionMessageListener = (msg: ExtensionMessage) => {
      if (msg.type === 'TOGGLE_VIBE') {
        toggleRecording();
      }
    };
    chrome.runtime.onMessage.addListener(extensionMessageListener);

    // Message listener dispatched from content script
    const customMessageListener = (e: Event) => {
      const data = (e as CustomEvent).detail;
      if (!activeElement) return;

      if (data.type === 'VIBETYPE_STREAM_CHUNK' || data.type === 'VIBETYPE_STREAM_EMOJI') {
        if (data.text) {
          insertTextIntoField(activeElement, data.text);
        }
      } else if (data.type === 'VIBETYPE_MESSAGE') {
        // Full message at the end
        if (data.text) {
          insertTextIntoField(activeElement, data.text + " ");
        }
        if (data.emojis && data.emojis.length > 0) {
          insertTextIntoField(activeElement, data.emojis.join(''));
        }
      }
    };
    window.addEventListener('vibetype_msg', customMessageListener);

    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
      chrome.runtime.onMessage.removeListener(extensionMessageListener);
      window.removeEventListener('vibetype_msg', customMessageListener);
    };
  }, [activeElement]);

  const toggleRecording = () => {
    // Open the main VibeType application
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? "https://vibe-type-kappa.vercel.app" 
      : "http://localhost:3000";

    window.open(
      `${baseUrl}/?source=extension`,
      "_blank",
      "width=500,height=750,menubar=no,toolbar=no,location=no,status=no"
    );
  };

  if (!position) return null;

  return (
    <div 
      style={{ 
        position: 'absolute', 
        top: position.top, 
        left: position.left, 
        zIndex: 999999 
      }}
      className="flex items-center gap-2"
    >
      <button
        onMouseDown={(e) => { e.preventDefault(); toggleRecording(); }} // Prevent blur
        className="flex items-center justify-center p-2 rounded-full shadow-lg transition-all bg-emerald-500 hover:bg-emerald-600 text-white"
        title="VibeType (Alt+Space)"
      >
        <Mic size={18} />
      </button>
      <div className="bg-black/80 backdrop-blur-md rounded-full p-2 shadow-lg text-yellow-400">
        <Sparkles size={18} />
      </div>
    </div>
  );
};
