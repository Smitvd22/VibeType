import { useState, useEffect, useRef } from "react";
import { HandLandmarker, FilesetResolver, HandLandmarkerResult, NormalizedLandmark } from "@mediapipe/tasks-vision";

export function useMediaPipeHands(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  onResult?: (landmarks: NormalizedLandmark[] | null) => void
) {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const [handResult, setHandResult] = useState<HandLandmarkerResult | null>(null);
  const requestRef = useRef<number>(0);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    let active = true;

    async function initModel() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        if (active) {
          handLandmarkerRef.current = landmarker;
          setIsModelLoaded(true);
        }
      } catch (err) {
        console.error("Failed to load HandLandmarker", err);
      }
    }

    initModel();

    return () => {
      active = false;
      if (handLandmarkerRef.current) {
        handLandmarkerRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (!isModelLoaded || !videoRef.current) return;

    const video = videoRef.current;
    
    function predictWebcam() {
      if (!video) return;
      if (video.videoWidth === 0 || video.readyState < 2) {
        requestRef.current = requestAnimationFrame(predictWebcam);
        return;
      }

      if (video.currentTime !== lastVideoTimeRef.current && handLandmarkerRef.current) {
        lastVideoTimeRef.current = video.currentTime;
        try {
          const result = handLandmarkerRef.current.detectForVideo(video, performance.now());
          setHandResult(result);
          if (onResultRef.current) {
            onResultRef.current(result.landmarks?.length > 0 ? result.landmarks[0] : null);
          }
        } catch (e) {
          console.warn("Hand landmarker warning:", e);
        }
      }
      requestRef.current = requestAnimationFrame(predictWebcam);
    }

    const onPlaying = () => {
      requestRef.current = requestAnimationFrame(predictWebcam);
    };

    video.addEventListener("playing", onPlaying);
    if (!video.paused && !video.ended) {
      requestRef.current = requestAnimationFrame(predictWebcam);
    }

    return () => {
      video.removeEventListener("playing", onPlaying);
      cancelAnimationFrame(requestRef.current);
    };
  }, [isModelLoaded, videoRef]);

  return { isModelLoaded, handResult };
}
