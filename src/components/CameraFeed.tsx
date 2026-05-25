"use client";

import { useWebcam } from "@/hooks/useWebcam";
import { useMediaPipeHands } from "@/hooks/useMediaPipeHands";
import { useMediaPipeFace } from "@/hooks/useMediaPipeFace";
import { classifyGesture } from "@/lib/GestureEngine";
import { classifyExpression } from "@/lib/ExpressionEngine";
import { VideoOff, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DrawingUtils, HandLandmarker, FaceLandmarker } from "@mediapipe/tasks-vision";

interface CameraFeedProps {
  onGesture?: (gesture: string) => void;
  onExpression?: (expression: string) => void;
}

export default function CameraFeed({ onGesture, onExpression }: CameraFeedProps) {
  // Suppress harmless MediaPipe WASM logs that Next.js Dev Overlay catches as errors
  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args: any[]) => {
      if (typeof args[0] === 'string' && (args[0].includes('XNNPACK') || args[0].includes('gl_context.cc') || args[0].includes('face_landmarker_graph.cc'))) return;
      originalError(...args);
    };
    
    console.warn = (...args: any[]) => {
      if (typeof args[0] === 'string' && (args[0].includes('XNNPACK') || args[0].includes('gl_context.cc') || args[0].includes('face_landmarker_graph.cc'))) return;
      originalWarn(...args);
    };

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  const { videoRef, isReady, error } = useWebcam();
  const { isModelLoaded: isHandModelLoaded, handResult } = useMediaPipeHands(videoRef);
  const { isFaceModelLoaded, faceResult } = useMediaPipeFace(videoRef);
  const isModelLoaded = isHandModelLoaded && isFaceModelLoaded;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentGesture, setCurrentGesture] = useState<string>("none");
  const [currentExpression, setCurrentExpression] = useState<string>("none");

  useEffect(() => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const drawingUtils = new DrawingUtils(ctx);

    // Hands
    if (handResult && handResult.landmarks && handResult.landmarks.length > 0) {
      for (const landmarks of handResult.landmarks) {
        drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
          color: "#8b5cf6",
          lineWidth: 4
        });
        drawingUtils.drawLandmarks(landmarks, { color: "#fafafa", lineWidth: 2, radius: 3 });
      }
      const gesture = classifyGesture(handResult.landmarks[0]);
      if (gesture !== currentGesture) {
        setCurrentGesture(gesture);
        if (onGesture) onGesture(gesture);
      }
    } else {
      if (currentGesture !== "none") {
        setCurrentGesture("none");
        if (onGesture) onGesture("none");
      }
    }

    // Face
    if (faceResult && faceResult.faceLandmarks && faceResult.faceLandmarks.length > 0) {
      for (const landmarks of faceResult.faceLandmarks) {
        drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, {
          color: "#0ea5e940",
          lineWidth: 1
        });
      }
    }
    
    if (faceResult && faceResult.faceBlendshapes && faceResult.faceBlendshapes.length > 0) {
      const expression = classifyExpression(faceResult.faceBlendshapes);
      if (expression !== currentExpression) {
        setCurrentExpression(expression);
        if (onExpression) onExpression(expression);
      }
    } else {
      if (currentExpression !== "none") {
        setCurrentExpression("none");
        if (onExpression) onExpression("none");
      }
    }

    ctx.restore();
  }, [handResult, faceResult]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black">
      {error ? (
        <div className="flex flex-col items-center gap-4 text-red-400">
          <VideoOff className="w-12 h-12" />
          <p className="font-medium text-center px-4">{error}</p>
        </div>
      ) : (
        <>
          {(!isReady || !isModelLoaded) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 gap-4 z-20 bg-black/60 backdrop-blur-sm">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="font-medium">
                {!isReady ? "Starting camera..." : "Loading AI models..."}
              </p>
            </div>
          )}
          <video
            ref={videoRef}
            className={`w-full h-full object-cover -scale-x-100 transition-opacity duration-500 ${(isReady && isModelLoaded) ? 'opacity-100' : 'opacity-0'}`}
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none -scale-x-100 z-10"
          />
          
          {/* Temporary Dev Overlay for Models */}
          <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-20">
            {currentGesture !== "none" && (
              <div className="glass px-4 py-2 rounded-xl text-white font-bold text-sm">
                Gesture: {currentGesture}
              </div>
            )}
            {currentExpression !== "none" && (
              <div className="glass px-4 py-2 rounded-xl text-white font-bold text-sm">
                Expression: {currentExpression}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
