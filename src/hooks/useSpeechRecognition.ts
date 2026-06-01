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
  
  // Native recognition refs
  const nativeRecognitionRef = useRef<any>(null);
  const usingNative = useRef<boolean>(false);

  const baseUrl = process.env.NEXT_PUBLIC_STT_BACKEND_URL || "http://localhost:10000";
  const STT_URL = baseUrl.endsWith("/api/stt") ? baseUrl : `${baseUrl.replace(/\/$/, "")}/api/stt`;

  // Initialize native recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;
      
      recognition.onresult = (event: any) => {
        let currentInterim = "";
        let finalTrans = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTrans += transcriptPiece + " ";
          } else {
            currentInterim += transcriptPiece;
          }
        }
        
        if (finalTrans) {
          setTranscript((prev) => (prev ? prev + " " + finalTrans.trim() : finalTrans.trim()));
        }
        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event: any) => {
        console.warn("Native SpeechRecognition error:", event.error);
        if (event.error === "not-allowed" || event.error === "audio-capture") {
          setError("Microphone permission denied or device not found.");
          setIsListening(false);
          usingNative.current = false;
        }
      };

      recognition.onend = () => {
        if (!isIntentionallyStopped.current && usingNative.current) {
          try {
            recognition.start();
          } catch(e) {}
        }
      };

      nativeRecognitionRef.current = recognition;
    }
  }, [language]);

  const processAudioChunk = async (blob: Blob) => {
    if (blob.size === 0) return;
    
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
      setInterimTranscript("");
    }
  };

  const startListening = useCallback(async () => {
    isIntentionallyStopped.current = false;
    setError(null);
    
    // First, try native browser speech recognition (fastest, free, no backend latency)
    if (nativeRecognitionRef.current) {
      try {
        usingNative.current = true;
        nativeRecognitionRef.current.start();
        setIsListening(true);
        return; // Successfully started native API, exit early!
      } catch (e: any) {
        // If it throws an error (e.g. already started), we can ignore it or fallback
        if (e.name !== "InvalidStateError") {
          console.warn("Native API failed to start, falling back to WebM chunks", e);
          usingNative.current = false;
        } else {
          setIsListening(true);
          return;
        }
      }
    }

    // --- FALLBACK TO BACKEND API (WebM Chunks) ---
    try {
      usingNative.current = false;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const recordChunk = () => {
        if (isIntentionallyStopped.current) return;
        
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && !isIntentionallyStopped.current) {
            processAudioChunk(event.data);
          }
        };

        mediaRecorder.start();
        
        chunkIntervalRef.current = setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
          }
          if (!isIntentionallyStopped.current) {
            recordChunk();
          }
        }, 3000);
      };

      recordChunk();
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
    
    // Stop native API if active
    if (usingNative.current && nativeRecognitionRef.current) {
      nativeRecognitionRef.current.stop();
      usingNative.current = false;
      setIsListening(false);
      return;
    }

    // Stop fallback API if active
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
