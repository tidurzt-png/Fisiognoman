/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion } from "motion/react";
import { AnalysisResult } from "../types";
import AuraRadarChart from "./AuraRadarChart";
import {
  Sparkles,
  Calendar,
  Compass,
  TrendingUp,
  Award,
  ChevronRight,
  Printer,
  ChevronLeft,
  Briefcase,
  Heart,
  Activity,
  DollarSign,
  Quote,
  Flame,
  CheckCircle2,
  Info,
  Eye,
  Wind,
  BookOpen,
} from "lucide-react";

interface ReportDashboardProps {
  name: string;
  photoUrl?: string;
  result: AnalysisResult;
  onReset: () => void;
  lang?: "id" | "en";
}

export default function ReportDashboard({ name, photoUrl, result, onReset, lang = "id" }: ReportDashboardProps) {
  const [activeTab, setActiveTab] = useState<"aura" | "birth" | "fortune" | "advice">("aura");

  const { visualAnalysis, birthAnalysis, monthlyFortune, psychologicalAdvice } = result;

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Determine Aura Gradient based on Aura Color
  const getAuraGradient = (colorStr: string) => {
    const c = colorStr.toLowerCase();
    if (c.includes("biru")) return "from-blue-500/20 to-indigo-500/20 border-blue-200 text-blue-800";
    if (c.includes("hijau")) return "from-emerald-500/20 to-teal-500/20 border-emerald-200 text-emerald-800";
    if (c.includes("kuning")) return "from-amber-400/20 to-yellow-500/20 border-amber-200 text-amber-800";
    if (c.includes("oranye") || c.includes("jingga")) return "from-orange-500/20 to-amber-500/20 border-orange-200 text-orange-800";
    if (c.includes("merah")) return "from-rose-500/20 to-pink-500/20 border-rose-200 text-rose-800";
    if (c.includes("violet") || c.includes("ungu")) return "from-purple-500/20 to-violet-500/20 border-purple-200 text-purple-800";
    return "from-indigo-500/20 to-slate-500/20 border-indigo-200 text-indigo-800";
  };

  const getAuraColorBadge = (colorStr: string) => {
    const c = colorStr.toLowerCase();
    if (c.includes("biru")) return "bg-blue-600 text-white";
    if (c.includes("hijau")) return "bg-emerald-600 text-white";
    if (c.includes("kuning")) return "bg-amber-500 text-slate-900";
    if (c.includes("oranye")) return "bg-orange-500 text-white";
    if (c.includes("merah")) return "bg-rose-600 text-white";
    if (c.includes("violet") || c.includes("ungu")) return "bg-purple-600 text-white";
    return "bg-indigo-600 text-white";
  };

  // Score colors
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-100";
    return "text-rose-600 bg-rose-50 border-rose-100";
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-4xl mx-auto space-y-8 print:p-0"
    >
      
      {/* Header Summary Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-xl border border-indigo-900 print:text-slate-900 print:bg-white print:border-slate-200 print:shadow-none">
        {/* Absolute design accents */}
        <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-indigo-500/10 blur-3xl print:hidden" />
        <div className="absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-violet-500/10 blur-3xl print:hidden" />

        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start relative z-10">
          {/* Selfie / Avatar Thumbnail */}
          {photoUrl ? (
            <div className="relative">
              <img
                src={photoUrl}
                alt={name}
                className="h-28 w-28 md:h-32 md:w-32 rounded-2xl object-cover ring-4 ring-white/10 shadow-lg print:ring-slate-200"
              />
              <span className={`absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-md ${getAuraColorBadge(visualAnalysis.auraColor)}`}>
                {visualAnalysis.auraColor}
              </span>
            </div>
          ) : (
            <div className="relative">
              <div className="flex h-28 w-28 md:h-32 md:w-32 items-center justify-center rounded-2xl bg-indigo-900/50 text-indigo-200 text-4xl font-display font-extrabold ring-4 ring-white/10 print:bg-slate-100 print:text-slate-500 print:ring-slate-200">
                {name.charAt(0).toUpperCase()}
              </div>
              <span className={`absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-md ${getAuraColorBadge(visualAnalysis.auraColor)}`}>
                {lang === "en" ? `${visualAnalysis.auraColor} Aura` : `Aura ${visualAnalysis.auraColor}`}
              </span>
            </div>
          )}

          {/* User profile briefs */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="space-y-1">
              <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight">
                {lang === "en" ? `${name}'s Character Report` : `Laporan Kepribadian ${name}`}
              </h2>
              <p className="text-indigo-200 text-sm flex items-center justify-center md:justify-start gap-1.5 print:text-slate-600">
                <Calendar className="h-4 w-4" />
                <span>{lang === "en" ? "Born:" : "Lahir:"} {birthAnalysis.birthDateFormatted}</span>
                <span className="opacity-40">•</span>
                <span className="font-semibold font-display text-indigo-300 print:text-indigo-600">Life Path {birthAnalysis.lifePathNumber}</span>
              </p>
            </div>

            <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-w-2xl print:text-slate-700">
              {lang === "en" ? (
                <>
                  The combination of the cosmic vibrations of your Western zodiac <span className="text-indigo-300 font-semibold print:text-indigo-700">{birthAnalysis.zodiac}</span>, Chinese shio <span className="text-indigo-300 font-semibold print:text-indigo-700">{birthAnalysis.shio}</span>, and the visual reflection of your facial aura yields a unique and dynamic psychological profile.
                </>
              ) : (
                <>
                  Kombinasi getaran kosmik zodiak <span className="text-indigo-300 font-semibold print:text-indigo-700">{birthAnalysis.zodiac}</span>, shio <span className="text-indigo-300 font-semibold print:text-indigo-700">{birthAnalysis.shio}</span>, serta refleksi visual pancaran aura wajah Anda melahirkan profil psikologi yang unik dan dinamis.
                </>
              )}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1 no-print">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold hover:bg-white/15 transition-all">
                🌟 {birthAnalysis.zodiac}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold hover:bg-white/15 transition-all">
                {lang === "en" ? `🐉 Shio ${birthAnalysis.shio}` : `🐉 Shio ${birthAnalysis.shio}`}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold hover:bg-white/15 transition-all">
                {lang === "en" ? `🔢 Life Path ${birthAnalysis.lifePathNumber}` : `🔢 Angka ${birthAnalysis.lifePathNumber}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Actions Panel (Printing & back) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-1.5 text-slate-600 hover:text-slate-800 text-sm font-semibold transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> {lang === "en" ? "Change Identity / New Analysis" : "Ganti Identitas / Analisis Baru"}
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-all shadow-md transform hover:scale-[1.02]"
        >
          <Printer className="h-4 w-4" /> {lang === "en" ? "Print Report / Save PDF" : "Cetak Laporan / Simpan PDF"}
        </button>
      </div>

      {/* Interactive Tabs Menu */}
      <div className="border-b border-slate-200 no-print">
        <nav className="-mb-px flex space-x-2 md:space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("aura")}
            className={`flex items-center gap-2 py-4 px-3 border-b-2 font-display font-semibold text-xs md:text-sm transition-all cursor-pointer ${
              activeTab === "aura"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"
            }`}
          >
            <Sparkles className="h-4.5 w-4.5" />
            <span>{lang === "en" ? "Aura & Face Traits" : "Aura & Karakter Wajah"}</span>
          </button>
          <button
            onClick={() => setActiveTab("birth")}
            className={`flex items-center gap-2 py-4 px-3 border-b-2 font-display font-semibold text-xs md:text-sm transition-all cursor-pointer ${
              activeTab === "birth"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"
            }`}
          >
            <Compass className="h-4.5 w-4.5" />
            <span>{lang === "en" ? "Birth Traits" : "Karakter Lahir"}</span>
          </button>
          <button
            onClick={() => setActiveTab("fortune")}
            className={`flex items-center gap-2 py-4 px-3 border-b-2 font-display font-semibold text-xs md:text-sm transition-all cursor-pointer ${
              activeTab === "fortune"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"
            }`}
          >
            <TrendingUp className="h-4.5 w-4.5" />
            <span>{lang === "en" ? `${monthlyFortune.monthName} Fortune` : `Peruntungan ${monthlyFortune.monthName}`}</span>
          </button>
          <button
            onClick={() => setActiveTab("advice")}
            className={`flex items-center gap-2 py-4 px-3 border-b-2 font-display font-semibold text-xs md:text-sm transition-all cursor-pointer ${
              activeTab === "advice"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"
            }`}
          >
            <Award className="h-4.5 w-4.5" />
            <span>{lang === "en" ? "Advice & Solutions" : "Nasihat & Solusi"}</span>
          </button>
        </nav>
      </div>

      {/* TABS PANELS (Print renders ALL panels sequentially, screen renders activeTab) */}
      <div className="space-y-12">
        
        {/* TAB 1: Aura & Visual Profile */}
        <div className={`${activeTab === "aura" ? "block" : "hidden"} print:block print-card rounded-2xl bg-white border border-slate-100 p-6 md:p-8 shadow-sm space-y-6`}>
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-display font-bold text-lg md:text-xl text-slate-800 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-500" />
              <span>{lang === "en" ? "Aura & Face Traits Analysis" : "Analisis Aura & Getaran Karakter Visual"}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {lang === "en" ? "Based on the reading of your facial tone, balance, expression, and optical impression." : "Berdasarkan hasil pembacaan rona, keseimbangan, ekspresi, dan impresi optik wajah Anda."}
            </p>
          </div>

          {/* Aura Meaning alert banner */}
          <div className={`rounded-2xl border bg-gradient-to-r p-5 flex flex-col md:flex-row gap-4 items-start md:items-center ${getAuraGradient(visualAnalysis.auraColor)}`}>
            <div className={`rounded-xl p-3 flex-shrink-0 ${getAuraColorBadge(visualAnalysis.auraColor)}`}>
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm tracking-wide uppercase">
                {lang === "en" ? `Detected Aura: ${visualAnalysis.auraColor}` : `Aura Terbaca: ${visualAnalysis.auraColor}`}
              </h4>
              <p className="text-xs leading-relaxed mt-1 opacity-90">
                {visualAnalysis.auraMeaning}
              </p>
            </div>
          </div>

          {/* Radar Chart Mounting */}
          <div className="pt-2">
            <AuraRadarChart scores={visualAnalysis.scores} auraColor={visualAnalysis.auraColor} lang={lang} />
          </div>

          {/* Vibe description */}
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-5 space-y-3">
            <h4 className="font-display font-semibold text-sm text-slate-700">
              {lang === "en" ? `Facial Visual Vibration Description (${visualAnalysis.visualVibe}):` : `Deskripsi Vibrasi Visual Wajah (${visualAnalysis.visualVibe}):`}
            </h4>
            <p className="text-xs leading-relaxed text-slate-600 text-justify">
              {visualAnalysis.visualVibeExplanation}
            </p>
            {!visualAnalysis.hasPhoto && (
              <div className="flex items-center gap-2 rounded-lg bg-indigo-50 border border-indigo-100 p-3 text-[11px] text-indigo-700">
                <Info className="h-4 w-4" />
                <span>
                  {lang === "en" 
                    ? "Note: This analysis is based on numerology vibrations because you did not upload a face photo. Upload a face photo to get a precise physiognomy and aura reading."
                    : "Catatan: Analisis ini bersifat hipotesis vibrasi numerologi karena Anda tidak mengunggah foto wajah. Unggah foto wajah Anda untuk mendapatkan pembacaan fisiognomi dan pancaran aura yang presisi."}
                </span>
              </div>
            )}
          </div>

          {/* Fisiognomi & Feng Shui Wajah */}
          {visualAnalysis.fisiognomiTradisional && visualAnalysis.fengshuiWajah && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div className="rounded-2xl border border-slate-150 bg-gradient-to-br from-indigo-50/10 to-violet-50/20 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-violet-100 p-2 text-violet-700">
                    <Eye className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-slate-800 text-sm">{lang === "en" ? "Traditional Physiognomy (Mian Xiang)" : "Fisiognomi Tradisional (Mian Xiang)"}</h4>
                    <p className="text-[10px] text-slate-400">{lang === "en" ? "Character & fate analysis through facial features" : "Analisis karakter & nasib lewat wajah"}</p>
                  </div>
                </div>
                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex items-center justify-between pb-1 border-b border-dashed border-slate-100">
                    <span className="font-semibold text-slate-700">{lang === "en" ? "Dominant Face Shape:" : "Bentuk Wajah Dominan:"} </span>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 font-medium text-[10px]">
                      {visualAnalysis.fisiognomiTradisional.dominantFaceShape}
                    </span>
                  </div>
                  <div className="border-l-2 border-violet-200 pl-2.5">
                    <span className="font-semibold text-slate-700 block mb-0.5">{lang === "en" ? "Eyes & Gaze:" : "Sorot Mata & Tatapan:"}</span>
                    <p className="text-justify leading-relaxed">{visualAnalysis.fisiognomiTradisional.eyeReading}</p>
                  </div>
                  <div className="border-l-2 border-violet-200 pl-2.5">
                    <span className="font-semibold text-slate-700 block mb-0.5">{lang === "en" ? "Forehead (Wisdom Area):" : "Dahi (Area Kebijaksanaan):"}</span>
                    <p className="text-justify leading-relaxed">{visualAnalysis.fisiognomiTradisional.foreheadReading}</p>
                  </div>
                  <div className="border-l-2 border-violet-200 pl-2.5">
                    <span className="font-semibold text-slate-700 block mb-0.5">{lang === "en" ? "Nose & Chin (Wealth Area):" : "Hidung & Dagu (Kemakmuran):"}</span>
                    <p className="text-justify leading-relaxed">{visualAnalysis.fisiognomiTradisional.noseChinReading}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-150 bg-gradient-to-br from-teal-50/10 to-emerald-50/20 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
                    <Wind className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-slate-800 text-sm">{lang === "en" ? "Facial Structure Feng Shui" : "Feng Shui Struktur Wajah"}</h4>
                    <p className="text-[10px] text-slate-400">{lang === "en" ? "Qi energy & facial element harmony" : "Harmonisasi energi Qi & Elemen Wajah"}</p>
                  </div>
                </div>
                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex items-center justify-between pb-1 border-b border-dashed border-slate-100">
                    <span className="font-semibold text-slate-700">{lang === "en" ? "Dominant Face Element:" : "Elemen Wajah Dominan:"} </span>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium text-[10px]">
                      {visualAnalysis.fengshuiWajah.facialElement}
                    </span>
                  </div>
                  <div className="border-l-2 border-emerald-200 pl-2.5">
                    <span className="font-semibold text-slate-700 block mb-0.5">{lang === "en" ? "Element Characteristics:" : "Karakteristik Elemen:"}</span>
                    <p className="text-justify leading-relaxed">{visualAnalysis.fengshuiWajah.elementDescription}</p>
                  </div>
                  <div className="border-l-2 border-emerald-200 pl-2.5">
                    <span className="font-semibold text-slate-700 block mb-0.5">{lang === "en" ? "Luckiest Feature:" : "Fitur Hoki Terbesar:"}</span>
                    <p className="text-justify leading-relaxed font-medium text-emerald-800 bg-emerald-50/40 p-2 rounded-lg border border-emerald-100/40">{visualAnalysis.fengshuiWajah.auspiciousFeature}</p>
                  </div>
                  <div className="border-l-2 border-emerald-200 pl-2.5">
                    <span className="font-semibold text-slate-700 block mb-0.5">{lang === "en" ? "Qi & Balance Advice:" : "Saran Qi & Keseimbangan:"}</span>
                    <p className="text-justify leading-relaxed">{visualAnalysis.fengshuiWajah.balanceEnergyAdvice}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* TAB 2: Birth Psychology Traits */}
        <div className={`${activeTab === "birth" ? "block" : "hidden"} print:block print:print-page-break print-card rounded-2xl bg-white border border-slate-100 p-6 md:p-8 shadow-sm space-y-8`}>
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-display font-bold text-lg md:text-xl text-slate-800 flex items-center gap-2">
              <Compass className="h-5 w-5 text-indigo-500" />
              <span>{lang === "en" ? "Birth Psychology Analysis (Numerology & Astrology)" : "Analisis Psikologi Lahir (Numerologi & Astrologi)"}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {lang === "en" ? "Studying your fundamental self-disposition based on life path numerology and astrology." : "Mempelajari sifat dasar pembawaan diri berdasarkan ilmu numerologi angka kehidupan dan astrologi."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center">
            {/* Life Path Number display */}
            <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 border border-slate-100 rounded-2xl h-full">
              <h4 className="font-display font-medium text-xs tracking-wider uppercase text-slate-400 mb-3">
                Life Path Number
              </h4>
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600 text-white font-display text-4xl font-extrabold shadow-lg shadow-indigo-100 ring-4 ring-indigo-50">
                {birthAnalysis.lifePathNumber}
              </div>
              <p className="text-[11px] text-slate-400 mt-2 italic font-mono">
                {lang === "en" ? "Life Path Vibration" : "Getaran Angka Kehidupan"}
              </p>
            </div>

            {/* Life path description */}
            <div className="md:col-span-8 space-y-3">
              <h4 className="font-display font-bold text-slate-700">
                {lang === "en" ? `Destiny of Number ${birthAnalysis.lifePathNumber}:` : `Takdir Angka ${birthAnalysis.lifePathNumber}:`}
              </h4>
              <p className="text-xs leading-relaxed text-slate-600 text-justify">
                {birthAnalysis.lifePathMeaning}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            {/* Western Zodiac card */}
            <div className="rounded-xl border border-slate-100 bg-gradient-to-br from-indigo-50/10 to-indigo-50/30 p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌌</span>
                <h4 className="font-display font-bold text-indigo-950 text-base">
                  {lang === "en" ? `Western Zodiac: ${birthAnalysis.zodiac}` : `Zodiak Barat: ${birthAnalysis.zodiac}`}
                </h4>
              </div>
              <p className="text-xs leading-relaxed text-slate-600 text-justify">
                {birthAnalysis.zodiacTraits}
              </p>
            </div>

            {/* Chinese Zodiac (Shio) card */}
            <div className="rounded-xl border border-slate-100 bg-gradient-to-br from-amber-50/10 to-amber-50/30 p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🐉</span>
                <h4 className="font-display font-bold text-amber-950 text-base">
                  {lang === "en" ? `Chinese Zodiac (Shio): ${birthAnalysis.shio}` : `Shio Tionghoa: ${birthAnalysis.shio}`}
                </h4>
              </div>
              <p className="text-xs leading-relaxed text-slate-600 text-justify">
                {birthAnalysis.shioTraits}
              </p>
            </div>

            {/* Primbon Jawa & Weton card */}
            {birthAnalysis.primbonJawa && (
              <div className="rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50/20 to-orange-50/10 p-6 space-y-4 col-span-1 md:col-span-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-xl bg-amber-100 p-2 text-amber-800">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-amber-950 text-base">{lang === "en" ? "Javanese Primbon & Weton Calculation" : "Primbon Jawa & Perhitungan Weton"}</h4>
                      <p className="text-[10px] text-amber-700/80">{lang === "en" ? "Local wisdom & weton birth characteristics" : "Kearifan lokal & watak weton kelahiran"}</p>
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-display font-extrabold text-xs md:text-sm shadow-sm border border-amber-200">
                      Weton: {birthAnalysis.primbonJawa.weton}
                    </span>
                    <span className="block text-[10px] text-amber-700 mt-1 font-semibold">
                      {lang === "en" ? "Neptu Value:" : "Jumlah Neptu:"} {birthAnalysis.primbonJawa.neptu}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
                  <div className="space-y-1.5 bg-white/60 p-4 rounded-xl border border-amber-100/40">
                    <h5 className="font-display font-bold text-amber-900 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      {lang === "en" ? "Birth Character & Disposition:" : "Karakter & Watak Lahir:"}
                    </h5>
                    <p className="text-justify leading-relaxed text-slate-600">
                      {birthAnalysis.primbonJawa.watakLahir}
                    </p>
                  </div>
                  <div className="space-y-1.5 bg-amber-50/30 p-4 rounded-xl border border-amber-100/40">
                    <h5 className="font-display font-bold text-amber-900 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      {lang === "en" ? "Advice & Safety Guidance:" : "Wejangan & Saran Keselamatan:"}
                    </h5>
                    <p className="text-justify leading-relaxed text-slate-600">
                      {birthAnalysis.primbonJawa.wetonFortuneAdvice}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* TAB 3: Monthly Fortune Forecast */}
        <div className={`${activeTab === "fortune" ? "block" : "hidden"} print:block print:print-page-break print-card rounded-2xl bg-white border border-slate-100 p-6 md:p-8 shadow-sm space-y-8`}>
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-bold text-lg md:text-xl text-slate-800 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                <span>{lang === "en" ? "Monthly Fortune Map" : "Peta Peruntungan Bulanan"}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {lang === "en" 
                  ? `Psychological forecasting of your energy vibrations for ${monthlyFortune.monthName}.`
                  : `Forecasting psikologis getaran energi Anda pada bulan ${monthlyFortune.monthName}.`}
              </p>
            </div>
            
            {/* Overall Monthly Score circular */}
            <div className="flex items-center gap-3 bg-emerald-50 px-4 py-2 border border-emerald-100 rounded-2xl flex-shrink-0 self-start sm:self-center">
              <div className="font-mono text-2xl font-black text-emerald-700">
                {monthlyFortune.overallScore}%
              </div>
              <div className="text-[10px] text-emerald-600">
                <div className="font-display font-extrabold tracking-wide uppercase">{lang === "en" ? "Fortune Index" : "Index Peruntungan"}</div>
                <div>{lang === "en" ? "Energy Balance" : "Keseimbangan Energi"}</div>
              </div>
            </div>
          </div>

          {/* Bento-grid of 4 major areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Career card */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-600">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <h4 className="font-display font-bold text-sm">{lang === "en" ? "Career & Business" : "Karir & Bisnis"}</h4>
                </div>
                <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-full border ${getScoreColor(monthlyFortune.career.score)}`}>
                  {lang === "en" ? "Score" : "Skor"}: {monthlyFortune.career.score}/100
                </span>
              </div>
              
              {/* Custom Score Progress Bar - Animated with Framer Motion */}
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${monthlyFortune.career.score}%` }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
                  className={`h-full rounded-full ${getScoreBarColor(monthlyFortune.career.score)}`}
                />
              </div>

              <p className="text-xs leading-relaxed text-slate-600">
                {monthlyFortune.career.description}
              </p>
            </div>

            {/* Romance/Social card */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="rounded-xl bg-pink-500/10 p-2.5 text-pink-600">
                    <Heart className="h-5 w-5" />
                  </div>
                  <h4 className="font-display font-bold text-sm">{lang === "en" ? "Romance & Relationships" : "Asmara & Hubungan"}</h4>
                </div>
                <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-full border ${getScoreColor(monthlyFortune.romance.score)}`}>
                  {lang === "en" ? "Score" : "Skor"}: {monthlyFortune.romance.score}/100
                </span>
              </div>

              {/* Custom Score Progress Bar - Animated with Framer Motion */}
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${monthlyFortune.romance.score}%` }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                  className={`h-full rounded-full ${getScoreBarColor(monthlyFortune.romance.score)}`}
                />
              </div>

              <p className="text-xs leading-relaxed text-slate-600">
                {monthlyFortune.romance.description}
              </p>
            </div>

            {/* Health card */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-600">
                    <Activity className="h-5 w-5" />
                  </div>
                  <h4 className="font-display font-bold text-sm">{lang === "en" ? "Health & Vitality" : "Kesehatan & Energi"}</h4>
                </div>
                <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-full border ${getScoreColor(monthlyFortune.health.score)}`}>
                  {lang === "en" ? "Score" : "Skor"}: {monthlyFortune.health.score}/100
                </span>
              </div>

              {/* Custom Score Progress Bar - Animated with Framer Motion */}
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${monthlyFortune.health.score}%` }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                  className={`h-full rounded-full ${getScoreBarColor(monthlyFortune.health.score)}`}
                />
              </div>

              <p className="text-xs leading-relaxed text-slate-600">
                {monthlyFortune.health.description}
              </p>
            </div>

            {/* Finance card */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-600">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <h4 className="font-display font-bold text-sm">{lang === "en" ? "Finance & Wealth" : "Keuangan & Finansial"}</h4>
                </div>
                <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-full border ${getScoreColor(monthlyFortune.finance.score)}`}>
                  {lang === "en" ? "Score" : "Skor"}: {monthlyFortune.finance.score}/100
                </span>
              </div>

              {/* Custom Score Progress Bar - Animated with Framer Motion */}
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${monthlyFortune.finance.score}%` }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
                  className={`h-full rounded-full ${getScoreBarColor(monthlyFortune.finance.score)}`}
                />
              </div>

              <p className="text-xs leading-relaxed text-slate-600">
                {monthlyFortune.finance.description}
              </p>
            </div>

          </div>
        </div>

        {/* TAB 4: Solutions & Practical Advice */}
        <div className={`${activeTab === "advice" ? "block" : "hidden"} print:block print:print-page-break print-card rounded-2xl bg-white border border-slate-100 p-6 md:p-8 shadow-sm space-y-8`}>
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-display font-bold text-lg md:text-xl text-slate-800 flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              <span>{lang === "en" ? "Psychological Advice & Practical Therapy" : "Nasihat Psikologi & Terapi Praktis"}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {lang === "en" ? "Clinical guidance and action plans to maximize your daily potential." : "Panduan klinis dan saran tindakan untuk memaksimalkan potensi harian Anda."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Strengths card */}
            <div className="rounded-xl border border-slate-100 bg-emerald-50/10 p-5 space-y-3">
              <h4 className="font-display font-bold text-slate-700 flex items-center gap-2 text-sm">
                <span className="rounded bg-emerald-100 p-1 text-emerald-600">✓</span>
                {lang === "en" ? "Your Main Character Strengths:" : "Kekuatan Karakter Utama Anda:"}
              </h4>
              <ul className="space-y-2.5">
                {psychologicalAdvice.strengths.map((str, idx) => (
                  <li key={idx} className="flex gap-2 text-xs text-slate-600">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Growth areas card */}
            <div className="rounded-xl border border-slate-100 bg-rose-50/10 p-5 space-y-3">
              <h4 className="font-display font-bold text-slate-700 flex items-center gap-2 text-sm">
                <span className="rounded bg-rose-100 p-1 text-rose-600">!</span>
                {lang === "en" ? "Areas for Self-Development:" : "Area Pengembangan Diri:"}
              </h4>
              <ul className="space-y-2.5">
                {psychologicalAdvice.growthAreas.map((growth, idx) => (
                  <li key={idx} className="flex gap-2 text-xs text-slate-600">
                    <ChevronRight className="h-4.5 w-4.5 text-rose-500 flex-shrink-0 mt-0.5" />
                    <span>{growth}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Affirmation Block */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50/40 p-6 border border-indigo-100 flex flex-col md:flex-row gap-4 items-start">
            <Quote className="h-10 w-10 text-indigo-200 flex-shrink-0" />
            <div className="space-y-1">
              <h4 className="font-display font-semibold text-xs text-indigo-500 tracking-wider uppercase">
                {lang === "en" ? "Your Daily Positive Affirmation" : "Afirmasi Positif Harian Anda"}
              </h4>
              <p className="font-display font-medium text-slate-700 text-sm md:text-base italic leading-relaxed">
                "{psychologicalAdvice.dailyAffirmation}"
              </p>
            </div>
          </div>

          {/* Practical task box */}
          <div className="rounded-xl bg-slate-900 text-slate-100 p-5 space-y-3 print:bg-white print:text-slate-800 print:border print:border-slate-200">
            <h4 className="font-display font-bold text-slate-200 text-sm flex items-center gap-1.5 print:text-slate-800">
              {lang === "en" ? "⚡ Recommended Therapy & Practical Exercise:" : "⚡ Terapi & Latihan Praktis Rekomendasi:"}
            </h4>
            <p className="text-xs leading-relaxed text-slate-300 text-justify print:text-slate-600">
              {psychologicalAdvice.practicalTip}
            </p>
          </div>

        </div>

      </div>

    </motion.div>
  );
}
