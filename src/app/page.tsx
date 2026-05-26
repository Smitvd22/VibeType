"use client";

import { Mic, MicOff, Sparkles, Activity, Wrench } from "lucide-react";
import dynamic from "next/dynamic";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useEmojiEngine } from "@/hooks/useEmojiEngine";
import { useState, useCallback, useEffect } from "react";
import { NormalizedLandmark, Classifications } from "@mediapipe/tasks-vision";
import { useFaceEmbeddings } from "@/hooks/useFaceEmbeddings";
import { useGestureEmbeddings } from "@/hooks/useGestureEmbeddings";
import { useComboEmbeddings } from "@/hooks/useComboEmbeddings";

import { EmojiOverlay } from "@/components/EmojiOverlay";
import { TranscriptBox } from "@/components/TranscriptBox";
import { DetectionPanel } from "@/components/DetectionPanel";
import { TrainingPanel } from "@/components/TrainingPanel";

const CameraFeed = dynamic(() => import("@/components/CameraFeed"), { 
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 gap-4 z-20 bg-black/60 backdrop-blur-sm rounded-3xl border border-white/10">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-bold tracking-widest uppercase text-sm">Initializing Optics</p>
    </div>
  )
});

export default function Home() {
  const { transcript, interimTranscript, isListening, startListening, stopListening, setTranscript, error: speechError } = useSpeechRecognition();
  const { activeEmoji, evaluateDetections } = useEmojiEngine(setTranscript);

  const [liveLandmarks, setLiveLandmarks] = useState<NormalizedLandmark[] | null>(null);
  const [liveBlendshapes, setLiveBlendshapes] = useState<Classifications[] | null>(null);

  const { detection: gestureDetection, refreshGestures } = useGestureEmbeddings(liveLandmarks);
  const { detection: faceDetection, refreshExpressions } = useFaceEmbeddings(liveBlendshapes);
  const { detection: comboDetection, refreshCombos } = useComboEmbeddings(liveLandmarks, liveBlendshapes);

  const [mode, setMode] = useState<"live" | "training">("live");

  // Evaluate whenever detection changes
  useEffect(() => {
    if (mode === "live") {
      evaluateDetections(gestureDetection, faceDetection, comboDetection);
    }
  }, [gestureDetection, faceDetection, comboDetection, mode, evaluateDetections]);

  const handleProfileAdded = useCallback(() => {
    refreshGestures();
    refreshExpressions();
    refreshCombos();
  }, [refreshGestures, refreshExpressions, refreshCombos]);

  return (
    <main className="flex-1 flex flex-col items-center p-4 sm:p-8 w-full max-w-[1400px] mx-auto relative overflow-hidden min-h-screen">
      <EmojiOverlay activeEmoji={activeEmoji} />

      {/* Header */}
      <header className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 glass rounded-2xl p-4 px-6 z-10 border border-white/10 shadow-lg">
        <div className="flex items-center gap-3 text-primary-400">
          <div className="bg-primary-500/20 p-2 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">VibeType</h1>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-4">
          <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
            <button 
              onClick={() => setMode("live")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === "live" ? "bg-white/10 text-white shadow-sm" : "text-zinc-400 hover:text-white"}`}
            >
              Live Mode
            </button>
            <button 
              onClick={() => setMode("training")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === "training" ? "bg-primary-500/20 text-primary-400 shadow-sm" : "text-zinc-400 hover:text-white"}`}
            >
              <Wrench className="w-4 h-4" /> Training Mode
            </button>
          </div>

          <button
            onClick={isListening ? stopListening : startListening}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-bold shadow-lg ${
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
                Mic Off
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="w-full grid grid-cols-1 xl:grid-cols-3 gap-8 flex-1 z-10 pb-8">
        
        {/* Left Column: Media Feed & Controls */}
        <div className="xl:col-span-2 flex flex-col gap-8">
          <section className="w-full aspect-video relative flex flex-col items-center justify-center">
            <CameraFeed 
              onHandsDetected={setLiveLandmarks}
              onFaceDetected={setLiveBlendshapes}
            />
            
            {/* Floating Overlays */}
            <div className="absolute top-4 right-4 flex gap-2">
              <div className={`glass px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${isListening ? 'text-emerald-400' : 'text-zinc-500'}`}>
                <Mic className="w-3 h-3" /> Speech
              </div>
              <div className="glass px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 text-blue-400">
                <Activity className="w-3 h-3" /> Vision AI
              </div>
            </div>
          </section>
          
          {mode === "live" ? (
            <DetectionPanel faceDetection={faceDetection} gestureDetection={gestureDetection} />
          ) : (
            <section className="flex justify-center w-full">
               <TrainingPanel 
                 currentLandmarks={liveLandmarks} 
                 currentBlendshapes={liveBlendshapes}
                 onProfileAdded={handleProfileAdded}
               />
            </section>
          )}
        </div>

        {/* Right Column: Live Transcript */}
        {mode === "live" && (
          <TranscriptBox 
            transcript={transcript}
            interimTranscript={interimTranscript}
            error={speechError}
            setTranscript={setTranscript}
          />
        )}
        {mode === "training" && (
          <div className="glass rounded-3xl p-8 flex flex-col gap-4 border border-white/10 opacity-90 shadow-xl h-fit">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2"><Wrench className="w-6 h-6 text-primary-400"/> Training Mode</h2>
            <p className="text-zinc-300 leading-relaxed text-lg">
              Create your own emoji language by capturing your body's movements.
            </p>
            <ul className="text-zinc-400 leading-relaxed list-disc list-inside space-y-2 mt-4 font-medium">
              <li>Strike a pose or make a face.</li>
              <li>Name it and assign an emoji.</li>
              <li>Click <span className="text-white">Capture</span> to save the AI profile.</li>
              <li>Switch back to <span className="text-white">Live Mode</span> and the system will automatically recognize your trained actions.</li>
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
