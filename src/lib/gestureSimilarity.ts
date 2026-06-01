import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { normalizeHandLandmarks } from "./landmarkNormalization";

export function mirrorLandmarks(landmarks: NormalizedLandmark[]): NormalizedLandmark[] {
  return landmarks.map(l => ({
    ...l,
    x: 1 - l.x
  }));
}

// Calculate Euclidean distance between two vectors of normalized landmarks
export function calculateGestureSimilarity(
  liveLandmarks: NormalizedLandmark[],
  savedLandmarks: NormalizedLandmark[]
): number {
  if (liveLandmarks.length !== savedLandmarks.length || savedLandmarks.length === 0) return 0;

  const normLive = normalizeHandLandmarks(liveLandmarks);
  
  let totalDistance = 0;
  for (let i = 0; i < normLive.length; i++) {
    const l = normLive[i];
    const s = savedLandmarks[i]; // assuming saved is already normalized
    const dist = Math.sqrt(
      Math.pow(l.x - s.x, 2) + 
      Math.pow(l.y - s.y, 2) + 
      Math.pow(l.z - s.z, 2)
    );
    totalDistance += dist;
  }

  // Average distance per landmark
  const avgDistance = totalDistance / normLive.length;
  
  // Convert distance to a confidence score between 0 and 1
  const score = Math.max(0, 1 - (avgDistance * 2)); 
  return score;
}

export function calculateMultiHandSimilarity(
  liveHands: NormalizedLandmark[][],
  savedHands: NormalizedLandmark[][]
): number {
  if (liveHands.length === 0 || savedHands.length === 0) return 0;

  if (savedHands.length === 1) {
    // Single hand gesture: check against all live hands, normal and mirrored
    let bestScore = 0;
    const saved = savedHands[0];
    
    for (const liveHand of liveHands) {
      const normalScore = calculateGestureSimilarity(liveHand, saved);
      const mirroredLive = mirrorLandmarks(liveHand);
      const mirroredScore = calculateGestureSimilarity(mirroredLive, saved);
      
      bestScore = Math.max(bestScore, normalScore, mirroredScore);
    }
    return bestScore;
  } else if (savedHands.length === 2) {
    // Two-handed gesture: requires at least 2 live hands
    if (liveHands.length < 2) return 0;

    const s1 = savedHands[0];
    const s2 = savedHands[1];
    const l1 = liveHands[0];
    const l2 = liveHands[1];

    // Scenario A: Hand 1 matches Hand 1, Hand 2 matches Hand 2
    const scoreA = (calculateGestureSimilarity(l1, s1) + calculateGestureSimilarity(l2, s2)) / 2;
    // Scenario B: Swapped
    const scoreB = (calculateGestureSimilarity(l2, s1) + calculateGestureSimilarity(l1, s2)) / 2;

    // Mirrored Scenarios: Mirror both live hands
    const ml1 = mirrorLandmarks(l1);
    const ml2 = mirrorLandmarks(l2);

    const scoreC = (calculateGestureSimilarity(ml1, s1) + calculateGestureSimilarity(ml2, s2)) / 2;
    const scoreD = (calculateGestureSimilarity(ml2, s1) + calculateGestureSimilarity(ml1, s2)) / 2;

    return Math.max(scoreA, scoreB, scoreC, scoreD);
  }

  return 0;
}
