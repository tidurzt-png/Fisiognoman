/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { TraitScores } from "../types";
import { Sparkles, Brain, Heart, Award, ShieldAlert } from "lucide-react";

interface AuraRadarChartProps {
  scores: TraitScores;
  auraColor: string;
  lang?: "id" | "en";
}

export default function AuraRadarChart({ scores, auraColor, lang = "id" }: AuraRadarChartProps) {
  const [animatedScores, setAnimatedScores] = useState<TraitScores>({
    creative: 0,
    analytical: 0,
    empathy: 0,
    leadership: 0,
    calmness: 0,
  });

  // Animate values on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScores({
        creative: scores.creative || 70,
        analytical: scores.analytical || 70,
        empathy: scores.empathy || 70,
        leadership: scores.leadership || 70,
        calmness: scores.calmness || 70,
      });
    }, 150);
    return () => clearTimeout(timer);
  }, [scores]);

  // Generate SVG Radar Polygon points
  // Center is (100, 100), radius is 75
  const getPoints = (s: TraitScores) => {
    const center = 100;
    const r = 75;
    
    // Five vertices angle: Creative (0), Analytical (72), Empathy (144), Leadership (216), Calmness (288)
    const angles = [
      -Math.PI / 2,                  // Top: Creative
      -Math.PI / 2 + (2 * Math.PI) / 5,  // Right top: Analytical
      -Math.PI / 2 + (4 * Math.PI) / 5,  // Right bottom: Empathy
      -Math.PI / 2 + (6 * Math.PI) / 5,  // Left bottom: Leadership
      -Math.PI / 2 + (8 * Math.PI) / 5,  // Left top: Calmness
    ];

    const values = [
      s.creative / 100,
      s.analytical / 100,
      s.empathy / 100,
      s.leadership / 100,
      s.calmness / 100,
    ];

    const points = angles.map((angle, i) => {
      const dist = values[i] * r;
      const x = center + dist * Math.cos(angle);
      const y = center + dist * Math.sin(angle);
      return `${x},${y}`;
    });

    return points.join(" ");
  };

  // Get background grid polygon points
  const getGridPoints = (factor: number) => {
    const center = 100;
    const r = 75 * factor;
    const angles = [
      -Math.PI / 2,
      -Math.PI / 2 + (2 * Math.PI) / 5,
      -Math.PI / 2 + (4 * Math.PI) / 5,
      -Math.PI / 2 + (6 * Math.PI) / 5,
      -Math.PI / 2 + (8 * Math.PI) / 5,
    ];
    return angles.map((angle) => {
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x},${y}`;
    }).join(" ");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      {/* Visual SVG Radar Map */}
      <div className="flex flex-col items-center justify-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
        <h4 className="font-display font-medium text-xs tracking-wider uppercase text-slate-400 mb-4">
          {lang === "en" ? "Personality Energy Mandala Map" : "Peta Mandala Energi Kepribadian"}
        </h4>
        <div className="relative w-full max-w-[220px] aspect-square">
          <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
            {/* Background grids */}
            <polygon points={getGridPoints(1.0)} fill="none" stroke="#e2e8f0" strokeWidth="1" />
            <polygon points={getGridPoints(0.8)} fill="none" stroke="#e2e8f0" strokeWidth="0.8" strokeDasharray="3" />
            <polygon points={getGridPoints(0.6)} fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
            <polygon points={getGridPoints(0.4)} fill="none" stroke="#e2e8f0" strokeWidth="0.8" strokeDasharray="3" />
            <polygon points={getGridPoints(0.2)} fill="none" stroke="#e2e8f0" strokeWidth="0.8" />

            {/* Axis lines */}
            {Array.from({ length: 5 }).map((_, i) => {
              const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
              const x2 = 100 + 75 * Math.cos(angle);
              const y2 = 100 + 75 * Math.sin(angle);
              return (
                <line key={i} x1="100" y1="100" x2={x2} y2={y2} stroke="#e2e8f0" strokeWidth="1" />
              );
            })}

            {/* Filled Radar area */}
            <polygon
              points={getPoints(animatedScores)}
              fill="rgba(99, 102, 241, 0.25)"
              stroke="rgb(79, 70, 229)"
              strokeWidth="2"
              className="transition-all duration-1000 ease-out"
            />

            {/* Data Points */}
            {Array.from({ length: 5 }).map((_, i) => {
              const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
              const values = [
                animatedScores.creative,
                animatedScores.analytical,
                animatedScores.empathy,
                animatedScores.leadership,
                animatedScores.calmness,
              ];
              const dist = (values[i] / 100) * 75;
              const x = 100 + dist * Math.cos(angle);
              const y = 100 + dist * Math.sin(angle);
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="4"
                  className="fill-indigo-600 stroke-white stroke-2 transition-all duration-1000 ease-out"
                />
              );
            })}

            {/* Radar Text Labels */}
            <text x="100" y="12" textAnchor="middle" className="font-display font-medium text-[8px] fill-violet-600">
              {lang === "en" ? "Creative" : "Kreatif"}
            </text>
            <text x="185" y="76" textAnchor="start" className="font-display font-medium text-[8px] fill-blue-600">
              {lang === "en" ? "Analytical" : "Analitis"}
            </text>
            <text x="150" y="188" textAnchor="start" className="font-display font-medium text-[8px] fill-emerald-600">
              {lang === "en" ? "Empathy" : "Empati"}
            </text>
            <text x="50" y="188" textAnchor="end" className="font-display font-medium text-[8px] fill-amber-600">
              {lang === "en" ? "Leader" : "Pemimpin"}
            </text>
            <text x="15" y="76" textAnchor="end" className="font-display font-medium text-[8px] fill-teal-600">
              {lang === "en" ? "Calm" : "Tenang"}
            </text>
          </svg>
        </div>
        <p className="text-[11px] text-slate-500 mt-3 text-center italic max-w-xs">
          {lang === "en" 
            ? `Mandala shows the dominance of your ${auraColor} aura vibration.`
            : `Mandala menunjukkan dominasi getaran aura ${auraColor} Anda.`}
        </p>
      </div>

      {/* Trait Progress List */}
      <div className="space-y-4">
        {/* Creative */}
        <div>
          <div className="flex justify-between items-center text-sm mb-1.5">
            <div className="flex items-center gap-1.5 text-violet-700 font-medium font-display">
              <Sparkles className="h-4 w-4" />
              <span>{lang === "en" ? "Creativity & Originality" : "Kreativitas & Orisinalitas"}</span>
            </div>
            <span className="font-mono text-xs font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
              {scores.creative || 70}%
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${scores.creative || 70}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="h-full bg-violet-500 rounded-full"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {lang === "en"
              ? "Ability to think 'out of the box' and create innovative solutions."
              : "Kemampuan berpikir 'out of the box' dan melahirkan solusi inovatif."}
          </p>
        </div>

        {/* Analytical */}
        <div>
          <div className="flex justify-between items-center text-sm mb-1.5">
            <div className="flex items-center gap-1.5 text-blue-700 font-medium font-display">
              <Brain className="h-4 w-4" />
              <span>{lang === "en" ? "Logic & Analysis" : "Logika & Analisis"}</span>
            </div>
            <span className="font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {scores.analytical || 70}%
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${scores.analytical || 70}%` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
              className="h-full bg-blue-500 rounded-full"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {lang === "en"
              ? "Sharpness in logical, critical, and structured problem-solving."
              : "Ketajaman pemecahan masalah secara logis, kritis, dan terstruktur."}
          </p>
        </div>

        {/* Empathy */}
        <div>
          <div className="flex justify-between items-center text-sm mb-1.5">
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium font-display">
              <Heart className="h-4 w-4" />
              <span>{lang === "en" ? "Empathy & Emotional Intelligence" : "Empati & Kecerdasan Emosional"}</span>
            </div>
            <span className="font-mono text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {scores.empathy || 70}%
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${scores.empathy || 70}%` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              className="h-full bg-emerald-500 rounded-full"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {lang === "en"
              ? "Sensitivity to feel other people's emotions and social precision."
              : "Sensitivitas merasakan perasaan orang lain dan ketepatan bersosialisasi."}
          </p>
        </div>

        {/* Leadership */}
        <div>
          <div className="flex justify-between items-center text-sm mb-1.5">
            <div className="flex items-center gap-1.5 text-amber-700 font-medium font-display">
              <Award className="h-4 w-4" />
              <span>{lang === "en" ? "Charisma & Leadership" : "Karisma & Kepemimpinan"}</span>
            </div>
            <span className="font-mono text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              {scores.leadership || 70}%
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${scores.leadership || 70}%` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
              className="h-full bg-amber-500 rounded-full"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {lang === "en"
              ? "Talent to inspire others, self-confidence, and clear assertiveness."
              : "Bakat menginspirasi orang lain, percaya diri, dan ketegasan arah tujuan."}
          </p>
        </div>

        {/* Calmness */}
        <div>
          <div className="flex justify-between items-center text-sm mb-1.5">
            <div className="flex items-center gap-1.5 text-teal-700 font-medium font-display">
              <ShieldAlert className="h-4 w-4" />
              <span>{lang === "en" ? "Calmness & Stress Management" : "Ketenangan & Manajemen Stres"}</span>
            </div>
            <span className="font-mono text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
              {scores.calmness || 70}%
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${scores.calmness || 70}%` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
              className="h-full bg-teal-500 rounded-full"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {lang === "en"
              ? "Mental resilience, inner peace, and emotional stability under pressure."
              : "Resiliensi mental, ketenangan batin, dan stabilitas emosi di bawah tekanan."}
          </p>
        </div>
      </div>
    </div>
  );
}
