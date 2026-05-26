import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface TranscriptBoxProps {
  transcript: string;
  interimTranscript: string;
  error: string | null;
  setTranscript: (val: string) => void;
}

export function TranscriptBox({ transcript, interimTranscript, error, setTranscript }: TranscriptBoxProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass rounded-3xl flex flex-col overflow-hidden h-[500px] xl:h-full border border-white/10 shadow-2xl">
      <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
        <h2 className="font-bold text-zinc-200 flex items-center gap-2">
          Transcript
        </h2>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-sm text-zinc-300 font-medium"
          title="Copy Transcript"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          {copied ? <span className="text-emerald-400">Copied!</span> : "Copy"}
        </button>
      </div>
      <div className="flex-1 flex flex-col p-6 overflow-hidden gap-4">
        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg shrink-0">{error}</p>
        )}
        
        <textarea
          className="flex-1 w-full bg-transparent resize-none outline-none text-xl leading-relaxed text-zinc-200 scrollbar-thin"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Waiting for speech input..."
        />
        
        {interimTranscript && (
          <div className="shrink-0 p-3 bg-white/5 rounded-xl border border-white/5 text-emerald-400/80 text-lg leading-relaxed italic animate-pulse">
            {interimTranscript}
          </div>
        )}
      </div>
    </div>
  );
}
