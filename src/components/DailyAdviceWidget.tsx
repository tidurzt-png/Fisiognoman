/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Flame,
  Lock,
  ChevronRight,
  Loader2,
  Quote,
  AlertTriangle,
  Compass,
  Zap,
} from "lucide-react";

interface DailyAdviceWidgetProps {
  subscriptionPlan: "free" | "weekly" | "monthly" | "yearly";
  onOpenSubscribe: () => void;
  userName: string;
  birthDate: string;
  zodiac?: string;
  shio?: string;
  weton?: string;
  lang: "id" | "en";
}

interface DailyAdviceData {
  advice: string;
  quote: string;
  motivation: string;
  energyScore: number;
  unfavorableTime: string;
  focusAuraColor: string;
}

export default function DailyAdviceWidget({
  subscriptionPlan,
  onOpenSubscribe,
  userName,
  birthDate,
  zodiac,
  shio,
  weton,
  lang,
}: DailyAdviceWidgetProps) {
  const [adviceData, setAdviceData] = useState<DailyAdviceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState<string | null>(null);

  const hasAccess = subscriptionPlan === "monthly" || subscriptionPlan === "yearly";

  // Load from local storage on mount
  useEffect(() => {
    try {
      const savedDate = localStorage.getItem("aura_daily_advice_date");
      const today = new Date().toDateString();
      if (savedDate === today) {
        const savedData = localStorage.getItem("aura_daily_advice_result");
        if (savedData) {
          setAdviceData(JSON.parse(savedData));
        }
      }
    } catch (e) {
      console.error("Failed to read local advice storage:", e);
    }
  }, []);

  const handlePullAdvice = async () => {
    setIsLoading(true);
    setError(null);

    const steps = lang === "en" ? [
      "Connecting spiritual gates...",
      "Reading zodiac & shio vibrations...",
      "Harmonizing weton neptu...",
      "Calculating obstacles & sengkolo...",
      "Formulating today's cosmic advice...",
    ] : [
      "Menghubungkan gerbang spiritual...",
      "Membaca getaran zodiak & shio...",
      "Mengharmonisasikan neptu weton...",
      "Mengkalkulasikan sengkolo & rintangan...",
      "Merumuskan wejangan kosmik hari ini...",
    ];

    let i = 0;
    setLoadingStep(steps[0]);
    const interval = setInterval(() => {
      if (i < steps.length - 1) {
        i++;
        setLoadingStep(steps[i]);
      }
    }, 1200);

    try {
      const response = await fetch("/api/daily-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName || (lang === "en" ? "User" : "Pengguna"),
          birthDate: birthDate || "",
          zodiac: zodiac || (lang === "en" ? "Unknown" : "Tidak diketahui"),
          shio: shio || (lang === "en" ? "Unknown" : "Tidak diketahui"),
          weton: weton || (lang === "en" ? "Unknown" : "Tidak diketahui"),
          lang,
        }),
      });

      if (!response.ok) {
        throw new Error(lang === "en" ? "Failed to formulate daily advice from server." : "Gagal merumuskan wejangan harian dari server.");
      }

      const result: DailyAdviceData = await response.json();
      setAdviceData(result);

      // Save to cache for today
      localStorage.setItem("aura_daily_advice_date", new Date().toDateString());
      localStorage.setItem("aura_daily_advice_result", JSON.stringify(result));
    } catch (err: any) {
      console.error(err);
      setError(err.message || (lang === "en" ? "Failed to pull daily spiritual guidance. Please try again." : "Gagal menarik wejangan spiritual harian. Coba lagi."));
    } finally {
      clearInterval(interval);
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="rounded-3xl border border-slate-150 bg-white p-6 shadow-sm overflow-hidden relative space-y-4">
      {/* Background design glow */}
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-amber-400/5 blur-2xl" />

      {/* Widget Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-amber-500/10 p-2 text-amber-600">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="font-display font-extrabold text-sm text-slate-800">
              {lang === "en" ? "Daily Spiritual Guidance" : "Wejangan Spiritual Harian"}
            </h4>
            <p className="text-[10px] text-slate-400">
              {lang === "en" ? "Today's self energy reflection" : "Refleksi energi diri hari ini"}
            </p>
          </div>
        </div>

        {hasAccess ? (
          <span className="text-[9px] font-bold bg-amber-500/15 border border-amber-500/20 text-amber-600 px-2.5 py-0.5 rounded-full animate-pulse uppercase tracking-wider font-mono">
            {subscriptionPlan === "yearly" ? (lang === "en" ? "Yearly VIP" : "VIP Tahunan") : "Premium"}
          </span>
        ) : (
          <span className="text-[9px] font-bold bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-mono uppercase">
            {lang === "en" ? "Unlock in Premium" : "Terbuka Di Premium"}
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!hasAccess ? (
          /* LOCKED STATE */
          <motion.div
            key="locked"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-4 space-y-4 flex flex-col items-center justify-center relative"
          >
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 relative">
              <div className="absolute -top-1.5 -right-1.5 rounded-full bg-amber-500 p-1 text-white shadow shadow-amber-500/30">
                <Lock className="h-3 w-3" />
              </div>
              <Compass className="h-10 w-10 text-slate-300 animate-spin-slow" />
            </div>

            <div className="space-y-1 text-center max-w-xs">
              <p className="text-xs font-bold text-slate-700">
                {lang === "en" ? "Today's Spiritual Guidance" : "Wejangan Spiritual Hari Ini"}
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed text-justify">
                {subscriptionPlan === "weekly" 
                  ? (lang === "en"
                      ? "The Weekly Plan gives you 10x daily face readings, but does not include daily advice or motivation. Upgrade to a Monthly or Yearly plan to unlock this guidance!"
                      : "Paket Mingguan memberikan Anda 10x limit harian pembacaan wajah, tetapi belum mencakup wejangan dan motivasi harian harian. Tingkatkan ke paket Bulanan atau Tahunan!")
                  : (lang === "en"
                      ? "Draw exclusive daily guidance aligned with your Javanese weton, Chinese zodiac, and Western horoscope."
                      : "Tarik petunjuk batin harian berdasarkan penyelarasan weton Jawa, shio, dan zodiak Barat Anda secara eksklusif.")}
              </p>
            </div>

            <button
              onClick={onOpenSubscribe}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-extrabold text-white hover:from-indigo-500 hover:to-violet-500 shadow-sm transition-all transform hover:scale-102 cursor-pointer"
            >
              {lang === "en"
                ? (subscriptionPlan === "weekly" ? "Upgrade Plan" : "Subscribe Now")
                : (subscriptionPlan === "weekly" ? "Upgrade Paket" : "Berlangganan Sekarang")}
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ) : isLoading ? (
          /* LOADING RETRIEVAL STATE */
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 space-y-4"
          >
            <div className="flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              <p className="font-mono text-xs text-indigo-600 font-semibold animate-pulse">
                {loadingStep}
              </p>
            </div>
          </motion.div>
        ) : error ? (
          /* ERROR STATE */
          <motion.div key="error" className="py-4 space-y-3 text-center">
            <p className="text-xs text-rose-600">{error}</p>
            <button
              onClick={handlePullAdvice}
              className="rounded-lg bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              {lang === "en" ? "Try Again" : "Coba Lagi"}
            </button>
          </motion.div>
        ) : adviceData ? (
          /* ACTIVE EXCLUSIVE DAILY ADVICE CARD DISPLAY */
          <motion.div
            key="advice-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 pt-1"
          >
            {/* Quote of the day */}
            <div className="rounded-2xl bg-gradient-to-br from-amber-50/40 to-indigo-50/20 border border-amber-100 p-4 space-y-2">
              <Quote className="h-5 w-5 text-amber-300" />
              <p className="text-xs text-slate-700 font-display italic leading-relaxed text-justify">
                "{adviceData.quote}"
              </p>
            </div>

            {/* General Advice */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">
                {lang === "en" ? "Today's Inner Advice" : "Wejangan Batin Hari Ini"}
              </span>
              <p className="text-xs leading-relaxed text-slate-600 text-justify">
                {adviceData.advice}
              </p>
            </div>

            {/* Yearly Plan Exclusive Motivation */}
            {subscriptionPlan === "yearly" && adviceData.motivation && (
              <div className="rounded-2xl bg-gradient-to-br from-amber-500/15 via-amber-400/10 to-transparent border border-amber-500/25 p-4 space-y-2 shadow-inner">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-amber-500 animate-pulse" />
                  {lang === "en" ? "Yearly Exclusive: Cosmic Motivation" : "Eksklusif Tahunan: Motivasi Kosmik"}
                </span>
                <p className="text-xs leading-relaxed text-amber-900/90 font-medium text-justify">
                  {adviceData.motivation}
                </p>
              </div>
            )}

            {/* Quick Metrics (Energy score & unfavorable time & color focus) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
              {/* Energy score */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-500">
                  <span className="flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                    {lang === "en" ? "Energy Harmony" : "Keselarasan Energi"}
                  </span>
                  <span className="font-mono font-bold text-indigo-600">{adviceData.energyScore}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${adviceData.energyScore}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className={`h-full ${getScoreBarColor(adviceData.energyScore)}`}
                  />
                </div>
              </div>

              {/* Unfavorable caution time */}
              <div className="rounded-xl bg-rose-50 border border-rose-100/50 p-2 flex items-start gap-1.5 text-rose-700">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
                <div>
                  <p className="font-bold text-[10px] uppercase tracking-wide">
                    {lang === "en" ? "Danger Hour (Caution)" : "Jam Naas (Waspada)"}
                  </p>
                  <p className="text-[10px] font-mono font-bold">{adviceData.unfavorableTime}</p>
                </div>
              </div>

              {/* Focus Aura Color */}
              <div className="sm:col-span-2 rounded-xl bg-indigo-50 border border-indigo-100/50 p-2 flex items-center justify-between text-indigo-800">
                <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
                  {lang === "en" ? "Today's Aligning Aura:" : "Aura Penyelaras Hari Ini:"}
                </span>
                <span className="font-display font-extrabold text-[11px] bg-indigo-600 text-white rounded-full px-2.5 py-0.5 shadow-sm">
                  {adviceData.focusAuraColor}
                </span>
              </div>
            </div>

            {/* Quick Re-pull capability */}
            <button
              onClick={handlePullAdvice}
              className="text-[10px] font-semibold text-slate-400 hover:text-indigo-600 transition-colors w-full text-center block pt-1.5 cursor-pointer"
            >
              {lang === "en" ? "Refresh Today's Spiritual Guidance" : "Perbarui Wejangan Spiritual Hari Ini"}
            </button>
          </motion.div>
        ) : (
          /* EMPTY PORTAL WAITING TO BE PULLED */
          <motion.div
            key="portal-unopened"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-6 space-y-4 flex flex-col items-center justify-center"
          >
            <div className="rounded-full bg-indigo-50 border border-indigo-100 p-4 text-indigo-600 animate-pulse shadow-sm">
              <Compass className="h-10 w-10 text-indigo-600 animate-spin-slow" />
            </div>

            <div className="space-y-1 max-w-xs text-center">
              <p className="text-xs font-extrabold text-slate-700">
                {lang === "en" ? "Spiritual Gate Unopened" : "Gerbang Wejangan Terbuka"}
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed text-justify">
                {birthDate
                  ? (lang === "en"
                      ? "Harmonize your weton, Chinese zodiac, and horoscope data to outline today's exclusive spiritual advice."
                      : "Sinergikan data weton lahir, shio, dan zodiak Anda untuk merumuskan wejangan spiritual eksklusif hari ini.")
                  : (lang === "en"
                      ? "Please enter your Birth Date in the reading form first so we can map your weton, Chinese zodiac, and horoscope destiny fully."
                      : "Silakan isi Tanggal Lahir terlebih dahulu di form pembacaan agar kami dapat memetakan takdir weton, shio, dan zodiak Anda secara utuh.")}
              </p>
            </div>

            <button
              onClick={handlePullAdvice}
              disabled={!birthDate}
              className="rounded-xl bg-slate-900 text-white font-semibold text-xs px-5 py-2.5 hover:bg-slate-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {lang === "en" ? "Draw Today's Guidance" : "Tarik Wejangan Hari Ini"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
