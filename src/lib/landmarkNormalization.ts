import { NormalizedLandmark } from "@mediapipe/tasks-vision";

export function normalizeHandLandmarks(landmarks: NormalizedLandmark[]): NormalizedLandmark[] {
  if (!landmarks || landmarks.length === 0) return [];

  // Translate so that wrist (landmark 0) is at origin (0,0,0)
  const wrist = landmarks[0];
  const translated = landmarks.map(lm => ({
    x: lm.x - wrist.x,
    y: lm.y - wrist.y,
    z: lm.z - wrist.z,
    visibility: lm.visibility
  }));

  // Find max distance from origin to scale down to 1
  let maxDist = 0;
  for (const lm of translated) {
    const dist = Math.sqrt(lm.x * lm.x + lm.y * lm.y + lm.z * lm.z);
    if (dist > maxDist) maxDist = dist;
  }

  if (maxDist === 0) return translated as NormalizedLandmark[];

  // Scale all landmarks
  return translated.map(lm => ({
    x: lm.x / maxDist,
    y: lm.y / maxDist,
    z: lm.z / maxDist,
    visibility: lm.visibility
  }));
}
