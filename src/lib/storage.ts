import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { FaceProfile } from "./facialSimilarity";

export interface CustomGesture {
  id: string;
  name: string;
  emoji: string;
  landmarks: NormalizedLandmark[]; // normalized
  threshold: number; // confidence threshold, default ~0.75
}

export interface CustomExpression {
  id: string;
  name: string;
  emoji: string;
  profile: FaceProfile;
  threshold: number; // default ~0.85
}

export interface CustomCombo {
  id: string;
  name: string;
  emoji: string;
  landmarks: NormalizedLandmark[];
  profile: FaceProfile;
  thresholds: {
    gesture: number;
    expression: number;
  };
}

const STORAGE_KEYS = {
  GESTURES: 'vibetotype_custom_gestures',
  EXPRESSIONS: 'vibetotype_custom_expressions',
  COMBOS: 'vibetotype_custom_combos',
};

export const Storage = {
  getGestures: (): CustomGesture[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.GESTURES);
    return data ? JSON.parse(data) : [];
  },
  saveGestures: (gestures: CustomGesture[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.GESTURES, JSON.stringify(gestures));
  },
  getExpressions: (): CustomExpression[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.EXPRESSIONS);
    return data ? JSON.parse(data) : [];
  },
  saveExpressions: (expressions: CustomExpression[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.EXPRESSIONS, JSON.stringify(expressions));
  },
  getCombos: (): CustomCombo[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.COMBOS);
    return data ? JSON.parse(data) : [];
  },
  saveCombos: (combos: CustomCombo[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.COMBOS, JSON.stringify(combos));
  }
};
