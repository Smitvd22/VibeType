import { Classifications } from "@mediapipe/tasks-vision";

export interface FaceProfile {
  blendshapes: Record<string, number>;
}

export function extractFaceProfile(blendshapes: Classifications[]): FaceProfile {
  const profile: Record<string, number> = {};
  if (!blendshapes || blendshapes.length === 0) return { blendshapes: profile };

  const categories = blendshapes[0].categories;
  for (const cat of categories) {
    profile[cat.categoryName] = cat.score;
  }
  return { blendshapes: profile };
}

// Computes cosine similarity between two blendshape profiles
export function calculateFacialSimilarity(liveProfile: FaceProfile, savedProfile: FaceProfile): number {
  const keys = Object.keys(savedProfile.blendshapes);
  if (keys.length === 0) return 0;

  let dotProduct = 0;
  let normLive = 0;
  let normSaved = 0;

  for (const key of keys) {
    // Ignore neutral/head rotation blendshapes that don't represent facial expressions
    if (key.includes("head") || key === "neutral") continue;

    const lv = liveProfile.blendshapes[key] || 0;
    const sv = savedProfile.blendshapes[key] || 0;
    
    dotProduct += lv * sv;
    normLive += lv * lv;
    normSaved += sv * sv;
  }

  if (normLive === 0 || normSaved === 0) return 0;

  const similarity = dotProduct / (Math.sqrt(normLive) * Math.sqrt(normSaved));
  return Math.max(0, similarity);
}
