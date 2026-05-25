import { NormalizedLandmark } from "@mediapipe/tasks-vision";

export type Gesture = "thumbs_up" | "peace_sign" | "open_palm" | "none";

export function classifyGesture(landmarks: NormalizedLandmark[]): Gesture {
  if (!landmarks || landmarks.length !== 21) return "none";

  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const thumbMcp = landmarks[2];
  
  const indexTip = landmarks[8];
  const indexPip = landmarks[6];
  const indexMcp = landmarks[5];

  const middleTip = landmarks[12];
  const middlePip = landmarks[10];

  const ringTip = landmarks[16];
  const ringPip = landmarks[14];

  const pinkyTip = landmarks[20];
  const pinkyPip = landmarks[18];

  // In video coordinates, y goes down (0 is top, 1 is bottom)
  // So "extended" means y is smaller (higher up) than the PIP joint
  const isIndexExtended = indexTip.y < indexPip.y;
  const isMiddleExtended = middleTip.y < middlePip.y;
  const isRingExtended = ringTip.y < ringPip.y;
  const isPinkyExtended = pinkyTip.y < pinkyPip.y;

  // Thumbs up logic: thumb tip is higher than index mcp and wrist, and other fingers are curled
  const isThumbUp = thumbTip.y < indexMcp.y && thumbTip.y < wrist.y;
  
  if (isThumbUp && !isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
    return "thumbs_up";
  }

  // Peace sign: index and middle extended, ring and pinky curled
  if (isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended) {
    return "peace_sign";
  }

  // Open palm: all fingers extended
  if (isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended) {
    return "open_palm";
  }

  return "none";
}
