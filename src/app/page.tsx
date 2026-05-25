"use client";

import { Mic, MicOff, Sparkles, Activity } from "lucide-react";
import dynamic from "next/dynamic";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useEmojiEngine } from "@/hooks/useEmojiEngine";
import { useState } from "react";

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
  const { triggerEmoji, activeEmoji } = useEmojiEngine(setTranscript);
  const [uiExpression, setUiExpression] = useState("none");
  const [uiGesture, setUiGesture] = useState("none");

  const handleExpression = (exp: string) => {
    setUiExpression(exp);
    triggerEmoji(exp);
  };

  const handleGesture = (gest: string) => {
    setUiGesture(gest);
    triggerEmoji(gest);
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
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 z-10">
        
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
        </div>

        {/* Right Column: Live Transcript */}
        <div className="glass rounded-3xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
            <h2 className="font-semibold text-zinc-200 flex items-center gap-2">
              Transcript
            </h2>
          </div>
          <div className="flex-1 p-6 overflow-y-auto text-lg leading-relaxed text-zinc-200 flex flex-col gap-4">
            {speechError && (
              <p className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">{speechError}</p>
            )}
            {!transcript && !interimTranscript && !speechError && (
              <p className="opacity-50 italic">Waiting for speech input...</p>
            )}
            <p className="whitespace-pre-wrap">
              {transcript}
              {interimTranscript && (
                <span className="text-emerald-400 opacity-80"> {interimTranscript}</span>
              )}
            </p>
          </div>
        </div>
        
      </div>
    </main>
  );
}
