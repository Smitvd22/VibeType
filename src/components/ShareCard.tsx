import { Check, Copy, ExternalLink, X, Send } from "lucide-react";
import { useState } from "react";

interface ShareCardProps {
  text: string;
  emojis: string[];
  expressions: string[];
  gestures: string[];
  shareUrl: string;
  isConnected: boolean;
  isExtension?: boolean;
  onSendToChitChat: () => void;
  onClose: () => void;
}

export function ShareCard({ text, emojis, expressions, gestures, shareUrl, isConnected, isExtension, onSendToChitChat, onClose }: ShareCardProps) {
  const [copied, setCopied] = useState(false);
  const [sentMessage, setSentMessage] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    onSendToChitChat();
    setSentMessage(true);
    setTimeout(() => setSentMessage(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass relative w-full max-w-2xl rounded-3xl border border-white/20 p-8 shadow-2xl animate-in slide-in-from-bottom-8 duration-500 overflow-y-auto max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-3xl font-black mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-emerald-400">
          Session Complete
        </h2>

        <div className="space-y-6">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Generated Text</h3>
            <p className="text-xl text-white leading-relaxed font-medium">
              {text || <span className="text-zinc-600 italic">No text generated</span>}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Detected Emojis</h3>
              <div className="flex flex-wrap gap-2 text-3xl">
                {emojis.length > 0 ? emojis.map((e, i) => <span key={i} className="hover:scale-125 transition-transform cursor-default">{e}</span>) : <span className="text-sm text-zinc-600">None</span>}
              </div>
            </div>
            <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Detected Expressions</h3>
              <div className="flex flex-wrap gap-2">
                {expressions.length > 0 ? expressions.map((e, i) => (
                  <span key={i} className="px-2 py-1 bg-white/10 rounded-md text-xs font-semibold text-zinc-300">{e}</span>
                )) : <span className="text-sm text-zinc-600">None</span>}
              </div>
            </div>
            <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Detected Gestures</h3>
              <div className="flex flex-wrap gap-2">
                {gestures.length > 0 ? gestures.map((g, i) => (
                  <span key={i} className="px-2 py-1 bg-white/10 rounded-md text-xs font-semibold text-zinc-300">{g}</span>
                )) : <span className="text-sm text-zinc-600">None</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <button
            onClick={handleCopy}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
            {copied ? "Copied Link!" : "Copy Link"}
          </button>

          {isConnected ? (
            <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleSend}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                {sentMessage ? <Check className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                {sentMessage ? "Sent!" : isExtension ? "Insert into Page" : "Send to ChitChat"}
              </button>
              {sentMessage && <span className="text-xs text-emerald-400 font-medium">Message sent to {isExtension ? "Page" : "ChitChat"}</span>}
            </div>
          ) : (
             <div className="w-full sm:w-auto p-3 text-center bg-white/5 rounded-xl border border-white/10 text-zinc-400 text-sm font-medium">
               Not launched from {isExtension ? "an Extension" : "ChitChat"}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
