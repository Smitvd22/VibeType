import { useState, useEffect, useRef, useCallback } from "react";

export function useSpeechRecognition(language: string = "en") {
  const [transcript, setTranscript] = useState<string>("");
  const [interimTranscript, setInterimTranscript] = useState<string>(""); // Used as a "processing..." indicator
  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isIntentionallyStopped = useRef<boolean>(true);
  const chunkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingChunk = useRef<boolean>(false);

  const STT_URL = process.env.NEXT_PUBLIC_STT_BACKEND_URL || "http://localhost:10000/api/stt";

  const processAudioChunk = async (blob: Blob) => {
    if (blob.size === 0 || isProcessingChunk.current) return;
    
    isProcessingChunk.current = true;
    setInterimTranscript("...");

    try {
      const formData = new FormData();
      formData.append("file", blob, "audio.webm");
      formData.append("language", language);

      const response = await fetch(STT_URL, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.transcript) {
          setTranscript((prev) => (prev ? prev + " " + data.transcript : data.transcript));
        }
      } else {
        console.error("STT Backend returned an error", response.status);
      }
    } catch (err) {
      console.error("Failed to process audio chunk", err);
    } finally {
      isProcessingChunk.current = false;
      setInterimTranscript("");
    }
  };

  const startListening = useCallback(async () => {
    try {
      isIntentionallyStopped.current = false;
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && !isIntentionallyStopped.current) {
          processAudioChunk(event.data);
        }
      };

      // Record in chunks of 3000ms (3 seconds) to simulate streaming
      mediaRecorder.start(3000);
      setIsListening(true);
      setError(null);
    } catch (err: any) {
      console.error("Microphone access denied or error:", err);
      setError("Microphone permission denied or device not found.");
      setIsListening(false);
    }
  }, [language]);

  const stopListening = useCallback(() => {
    isIntentionallyStopped.current = true;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsListening(false);
    
    if (chunkIntervalRef.current) {
      clearInterval(chunkIntervalRef.current);
    }
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return { 
    transcript, 
    interimTranscript, 
    isListening, 
    startListening, 
    stopListening, 
    clearTranscript,
    setTranscript,
    error 
  };
}
