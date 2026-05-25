"use client";

import { Mic, MicOff, Sparkles, Activity, Copy, Check } from "lucide-react";
import dynamic from "next/dynamic";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useEmojiEngine } from "@/hooks/useEmojiEngine";
import { useState, useRef } from "react";

const CameraFeed = dynamic(() => import("@/components/CameraFeed"), { 
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 gap-4 z-20 bg-black/60 backdrop-blur-sm">
      <p className="font-medium">Loading camera...</p>
    </div>
  )
});

export default function Home() {
  const { transcript, interimTranscript, isListening, startListening, stopListening, setTranscript, error: speechError } = useSpeechRecognition();
  const { activeEmoji, evaluateEmoji, mappings, saveMappings } = useEmojiEngine(setTranscript);
  const [uiExpression, setUiExpression] = useState("none");
  const [uiGesture, setUiGesture] = useState("none");
  
  const uiExpressionRef = useRef("none");
  const uiGestureRef = useRef("none");

  const [copied, setCopied] = useState(false);

  const handleExpression = (exp: string) => {
    setUiExpression(exp);
    uiExpressionRef.current = exp;
    evaluateEmoji(exp, uiGestureRef.current);
  };

  const handleGesture = (gest: string) => {
    setUiGesture(gest);
    uiGestureRef.current = gest;
    evaluateEmoji(uiExpressionRef.current, gest);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateMapping = (id: string, field: 'expression' | 'gesture' | 'emoji', value: string) => {
    const newMappings = mappings.map(m => m.id === id ? { ...m, [field]: value } : m);
    saveMappings(newMappings);
  };

  const addMapping = () => {
    const newMappings = [...mappings, { id: Date.now().toString(), expression: 'none', gesture: 'none', emoji: '✨' }];
    saveMappings(newMappings);
  };

  const removeMapping = (id: string) => {
    const newMappings = mappings.filter(m => m.id !== id);
    saveMappings(newMappings);
  };

  return (
    <main className="flex-1 flex flex-col items-center p-4 sm:p-8 w-full max-w-7xl mx-auto relative overflow-hidden">
      {/* Floating Animated Emoji Overlay */}
      {activeEmoji && (
        <div key={activeEmoji.id} className="pointer-events-none fixed inset-0 flex items-center justify-center z-50 animate-bounce">
          <span className="text-[12rem] drop-shadow-2xl opacity-90 transition-transform scale-150 duration-700 ease-out">{activeEmoji.char}</span>
        </div>
      )}

      {/* Header */}
      <header className="w-full flex items-center justify-between mb-8 glass rounded-2xl p-4 px-6 z-10">
        <div className="flex items-center gap-2 text-primary-500">
          <Sparkles className="w-6 h-6" />
          <h1 className="text-xl font-bold tracking-tight text-white">VibeType</h1>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              isListening ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
            }`}
          >
            {isListening ? (
              <>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                Listening
              </>
            ) : (
              <>
                <MicOff className="w-4 h-4" />
                Start Mic
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 z-10 pb-8">
        
        {/* Left Column: Media Feed & Stats */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <section className="w-full aspect-video glass rounded-3xl overflow-hidden relative flex flex-col items-center justify-center border border-white/10 bg-black shadow-2xl">
            <CameraFeed onGesture={handleGesture} onExpression={handleExpression} />
            
            {/* Floating Overlays */}
            <div className="absolute top-4 right-4 flex gap-2">
              <div className={`glass px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${isListening ? 'text-emerald-400' : 'text-zinc-500'}`}>
                <Mic className="w-3 h-3" /> Speech
              </div>
              <div className="glass px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 text-blue-400">
                <Activity className="w-3 h-3" /> Vision
              </div>
            </div>
          </section>
          
          <section className="glass rounded-2xl p-6 flex flex-row items-center justify-around text-center">
            <div>
              <div className="text-2xl mb-1">{uiExpression === "smile" ? "😊" : uiExpression === "laugh" ? "😂" : "😐"}</div>
              <div className="text-xs text-zinc-400">Expression: {uiExpression}</div>
            </div>
            <div>
              <div className="text-2xl mb-1">{uiGesture === "thumbs_up" ? "👍" : uiGesture === "peace_sign" ? "✌️" : uiGesture === "open_palm" ? "👋" : "🤚"}</div>
              <div className="text-xs text-zinc-400">Gesture: {uiGesture}</div>
            </div>
          </section>

          {/* Emoji Mapping Customization UI */}
          <section className="glass rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="font-semibold text-zinc-200">Emoji Mappings</h3>
            <p className="text-sm text-zinc-400">Customize how your expressions and gestures map to emojis.</p>
            
            <div className="grid grid-cols-4 gap-2 text-sm font-medium text-zinc-400 mt-2 mb-1">
              <div>Expression</div>
              <div>Gesture</div>
              <div className="text-center">Emoji</div>
              <div></div>
            </div>
            
            <div className="flex flex-col gap-3">
              {mappings.map(mapping => (
                <div key={mapping.id} className="grid grid-cols-4 gap-2 items-center">
                  <select 
                    value={mapping.expression}
                    onChange={(e) => updateMapping(mapping.id, 'expression', e.target.value)}
                    className="bg-white/10 rounded-lg p-2.5 text-white outline-none focus:ring-2 focus:ring-primary-500 border border-white/5"
                  >
                    <option value="none" className="bg-zinc-900">None</option>
                    <option value="smile" className="bg-zinc-900">Smile</option>
                    <option value="laugh" className="bg-zinc-900">Laugh</option>
                    <option value="surprise" className="bg-zinc-900">Surprise</option>
                  </select>
                  
                  <select 
                    value={mapping.gesture}
                    onChange={(e) => updateMapping(mapping.id, 'gesture', e.target.value)}
                    className="bg-white/10 rounded-lg p-2.5 text-white outline-none focus:ring-2 focus:ring-primary-500 border border-white/5"
                  >
                    <option value="none" className="bg-zinc-900">None</option>
                    <option value="thumbs_up" className="bg-zinc-900">Thumbs Up</option>
                    <option value="peace_sign" className="bg-zinc-900">Peace Sign</option>
                    <option value="open_palm" className="bg-zinc-900">Open Palm</option>
                  </select>

                  <div className="flex justify-center">
                    <input 
                      type="text" 
                      value={mapping.emoji}
                      onChange={(e) => updateMapping(mapping.id, 'emoji', e.target.value)}
                      className="bg-white/10 rounded-lg p-2 w-16 text-center text-2xl text-white outline-none focus:ring-2 focus:ring-primary-500 border border-white/5"
                    />
                  </div>
                  
                  <button 
                    onClick={() => removeMapping(mapping.id)}
                    className="text-red-400 hover:bg-red-400/10 p-2.5 rounded-lg transition-colors text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            
            <button 
              onClick={addMapping}
              className="mt-4 border border-white/10 hover:bg-white/10 text-white rounded-xl py-3 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Add Custom Mapping
            </button>
          </section>
        </div>

        {/* Right Column: Live Transcript */}
        <div className="glass rounded-3xl flex flex-col overflow-hidden h-[600px] lg:h-auto">
          <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
            <h2 className="font-semibold text-zinc-200 flex items-center gap-2">
              Transcript
            </h2>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-sm text-zinc-300"
              title="Copy Transcript"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? <span className="text-emerald-400">Copied!</span> : "Copy"}
            </button>
          </div>
          <div className="flex-1 flex flex-col p-6 overflow-hidden gap-4">
            {speechError && (
              <p className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg shrink-0">{speechError}</p>
            )}
            
            <textarea
              className="flex-1 w-full bg-transparent resize-none outline-none text-lg leading-relaxed text-zinc-200 scrollbar-thin"
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
        
      </div>
    </main>
  );
}
