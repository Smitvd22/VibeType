import { useState, useEffect, useRef } from "react";
import { FaceLandmarker, FilesetResolver, FaceLandmarkerResult, Classifications } from "@mediapipe/tasks-vision";

export function useMediaPipeFace(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  onResult?: (blendshapes: Classifications[] | null) => void
) {
  const [isFaceModelLoaded, setIsFaceModelLoaded] = useState(false);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const [faceResult, setFaceResult] = useState<FaceLandmarkerResult | null>(null);
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
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numFaces: 1,
          outputFaceBlendshapes: true
        });

        if (active) {
          faceLandmarkerRef.current = landmarker;
          setIsFaceModelLoaded(true);
        }
      } catch (err) {
        console.error("Failed to load FaceLandmarker", err);
      }
    }

    initModel();

    return () => {
      active = false;
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (!isFaceModelLoaded || !videoRef.current) return;

    const video = videoRef.current;
    
    function predictWebcam() {
      if (!video) return;
      if (video.videoWidth === 0 || video.readyState < 2) {
        requestRef.current = requestAnimationFrame(predictWebcam);
        return;
      }

      if (video.currentTime !== lastVideoTimeRef.current && faceLandmarkerRef.current) {
        lastVideoTimeRef.current = video.currentTime;
        try {
          const result = faceLandmarkerRef.current.detectForVideo(video, performance.now());
          setFaceResult(result);
          if (onResultRef.current) {
            onResultRef.current(result.faceBlendshapes?.length > 0 ? result.faceBlendshapes : null);
          }
        } catch (e) {
          console.warn("Face landmarker warning:", e);
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
  }, [isFaceModelLoaded, videoRef]);

  return { isFaceModelLoaded, faceResult };
}
