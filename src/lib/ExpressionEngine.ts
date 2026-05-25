import { Classifications } from "@mediapipe/tasks-vision";

export type Expression = "smile" | "laugh" | "surprise" | "none";

export function classifyExpression(blendshapes: Classifications[]): Expression {
  if (!blendshapes || blendshapes.length === 0) return "none";

  const categories = blendshapes[0].categories;
  
  const shapeMap = new Map<string, number>();
  for (const cat of categories) {
    shapeMap.set(cat.categoryName, cat.score);
  }

  const smileLeft = shapeMap.get("mouthSmileLeft") || 0;
  const smileRight = shapeMap.get("mouthSmileRight") || 0;
  const jawOpen = shapeMap.get("jawOpen") || 0;

  // Smile and laugh logic
  if (smileLeft > 0.5 && smileRight > 0.5) {
    if (jawOpen > 0.3) {
      return "laugh";
    }
    return "smile";
  }

  // Surprise logic
  const browOuterUpLeft = shapeMap.get("browOuterUpLeft") || 0;
  const browOuterUpRight = shapeMap.get("browOuterUpRight") || 0;
  if (jawOpen > 0.4 && browOuterUpLeft > 0.5 && browOuterUpRight > 0.5) {
    return "surprise";
  }

  return "none";
}
