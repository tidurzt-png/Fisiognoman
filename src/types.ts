/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TraitScores {
  creative: number;     // 0-100
  analytical: number;   // 0-100
  empathy: number;      // 0-100
  leadership: number;   // 0-100
  calmness: number;     // 0-100
}

export interface FortuneCategory {
  score: number;        // 0-100
  description: string;  // Detailed explanation in Indonesian
}

export interface AnalysisResult {
  visualAnalysis: {
    hasPhoto: boolean;
    auraColor: string;
    auraMeaning: string;
    visualVibe: string;
    visualVibeExplanation: string;
    scores: TraitScores;
    fisiognomiTradisional?: {
      dominantFaceShape: string;
      eyeReading: string;
      foreheadReading: string;
      noseChinReading: string;
    };
    fengshuiWajah?: {
      facialElement: string;
      elementDescription: string;
      auspiciousFeature: string;
      balanceEnergyAdvice: string;
    };
  };
  birthAnalysis: {
    birthDateFormatted: string;
    lifePathNumber: number;
    lifePathMeaning: string;
    zodiac: string;
    zodiacTraits: string;
    shio: string;
    shioTraits: string;
    primbonJawa?: {
      weton: string;
      neptu: number;
      watakLahir: string;
      wetonFortuneAdvice: string;
    };
  };
  monthlyFortune: {
    monthName: string;
    overallScore: number; // 0-100
    career: FortuneCategory;
    romance: FortuneCategory;
    health: FortuneCategory;
    finance: FortuneCategory;
  };
  psychologicalAdvice: {
    strengths: string[];
    growthAreas: string[];
    dailyAffirmation: string;
    practicalTip: string;
  };
}

export interface HistoryRecord {
  id: string;
  name: string;
  birthDate: string;
  photoUrl?: string; // Local storage thumbnail
  selectedMonth: string;
  dateAnalyzed: string;
  result: AnalysisResult;
}
