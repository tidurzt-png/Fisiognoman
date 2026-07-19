/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit to handle base64 images
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Shared lazy-loaded Gemini client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Kunci API (GEMINI_API_KEY) belum dikonfigurasi. Harap atur di panel Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Structured response schema for Gemini
const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    visualAnalysis: {
      type: Type.OBJECT,
      properties: {
        hasPhoto: { type: Type.BOOLEAN, description: "Apakah foto wajah diunggah dan dianalisis" },
        auraColor: { type: Type.STRING, description: "Warna aura visual yang terdeteksi, misal 'Biru Indigo', 'Hijau Emerald', 'Kuning Emas', 'Oranye Kreatif', 'Merah Karismatik', 'Violet Mistis'" },
        auraMeaning: { type: Type.STRING, description: "Arti psikologis mendalam dari warna aura tersebut dalam bahasa Indonesia" },
        visualVibe: { type: Type.STRING, description: "3 kata sifat penjelas aura wajah, dipisahkan koma, misal 'Kreatif, Tenang, Fokus'" },
        visualVibeExplanation: { type: Type.STRING, description: "Penjelasan detail psikologi ekspresi wajah, sorot mata, dan impresi visual pertama" },
        scores: {
          type: Type.OBJECT,
          properties: {
            creative: { type: Type.INTEGER, description: "Skor kreativitas (0-100)" },
            analytical: { type: Type.INTEGER, description: "Skor analitis (0-100)" },
            empathy: { type: Type.INTEGER, description: "Skor empati (0-100)" },
            leadership: { type: Type.INTEGER, description: "Skor kepemimpinan (0-100)" },
            calmness: { type: Type.INTEGER, description: "Skor ketenangan/kedamaian diri (0-100)" }
          },
          required: ["creative", "analytical", "empathy", "leadership", "calmness"]
        },
        fisiognomiTradisional: {
          type: Type.OBJECT,
          properties: {
            dominantFaceShape: { type: Type.STRING, description: "Bentuk wajah dominan menurut tradisi pembacaan wajah (fisiognomi/Mian Xiang), e.g. 'Tanah (Kotak/Persegi)', 'Logam (Bulat)', 'Api (Segitiga)', 'Kayu (Persegi Panjang)', 'Air (Bergelombang/Oval)'" },
            eyeReading: { type: Type.STRING, description: "Analisis tatapan, bentuk mata, dan sorot mata menurut tradisi fisiognomi Timur & Barat" },
            foreheadReading: { type: Type.STRING, description: "Analisis dahi, kening, dan area kebijaksanaan atas menurut fisiognomi" },
            noseChinReading: { type: Type.STRING, description: "Analisis hidung (pilar kekayaan) dan dagu (kemakmuran hari tua) menurut fisiognomi" }
          },
          required: ["dominantFaceShape", "eyeReading", "foreheadReading", "noseChinReading"]
        },
        fengshuiWajah: {
          type: Type.OBJECT,
          properties: {
            facialElement: { type: Type.STRING, description: "Elemen Feng Shui wajah dominan, e.g. 'Kayu', 'Api', 'Tanah', 'Logam', 'Air'" },
            elementDescription: { type: Type.STRING, description: "Penjelasan kecocokan energi wajah dengan elemen Feng Shui tersebut" },
            auspiciousFeature: { type: Type.STRING, description: "Bagian wajah pembawa hoki terbesar menurut kaidah Feng Shui wajah" },
            balanceEnergyAdvice: { type: Type.STRING, description: "Saran menyeimbangkan aliran energi Qi di wajah untuk menarik kemakmuran" }
          },
          required: ["facialElement", "elementDescription", "auspiciousFeature", "balanceEnergyAdvice"]
        }
      },
      required: ["hasPhoto", "auraColor", "auraMeaning", "visualVibe", "visualVibeExplanation", "scores", "fisiognomiTradisional", "fengshuiWajah"]
    },
    birthAnalysis: {
      type: Type.OBJECT,
      properties: {
        birthDateFormatted: { type: Type.STRING, description: "Tanggal lahir terformat rapi, misal '24 Oktober 1995'" },
        lifePathNumber: { type: Type.INTEGER, description: "Angka Life Path Numerologi (1-9, atau 11, 22, 33)" },
        lifePathMeaning: { type: Type.STRING, description: "Penjelasan mendalam arti angka Life Path bagi kepribadian mereka dalam bahasa Indonesia" },
        zodiac: { type: Type.STRING, description: "Zodiak Barat, misal 'Scorpio'" },
        zodiacTraits: { type: Type.STRING, description: "Sifat utama psikologi Zodiak Barat tersebut" },
        shio: { type: Type.STRING, description: "Shio Tionghoa, misal 'Babi Kayu' atau 'Anjing'" },
        shioTraits: { type: Type.STRING, description: "Sifat utama Shio tersebut dalam karir dan hubungan" },
        primbonJawa: {
          type: Type.OBJECT,
          properties: {
            weton: { type: Type.STRING, description: "Weton lahir Javanese, e.g., 'Senin Kliwon', 'Sabtu Pahing'" },
            neptu: { type: Type.INTEGER, description: "Jumlah Neptu menurut Primbon Jawa (misal 12, 15, 18)" },
            watakLahir: { type: Type.STRING, description: "Penjelasan watak, pembawaan, kelebihan, serta kelemahan bawaan berdasarkan Weton menurut Primbon Jawa asli" },
            wetonFortuneAdvice: { type: Type.STRING, description: "Saran peruntungan dan keselamatan dalam keseharian berdasarkan naskah Primbon" }
          },
          required: ["weton", "neptu", "watakLahir", "wetonFortuneAdvice"]
        }
      },
      required: ["birthDateFormatted", "lifePathNumber", "lifePathMeaning", "zodiac", "zodiacTraits", "shio", "shioTraits", "primbonJawa"]
    },
    monthlyFortune: {
      type: Type.OBJECT,
      properties: {
        monthName: { type: Type.STRING, description: "Nama bulan yang dianalisis, misal 'Juli 2026'" },
        overallScore: { type: Type.INTEGER, description: "Skor peruntungan keseluruhan bulan ini (0-100)" },
        career: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            description: { type: Type.STRING, description: "Ramalan karir psikologis & tantangan bulan ini" }
          },
          required: ["score", "description"]
        },
        romance: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            description: { type: Type.STRING, description: "Ramalan asmara & hubungan sosial bulan ini" }
          },
          required: ["score", "description"]
        },
        health: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            description: { type: Type.STRING, description: "Saran kesehatan & manajemen energi/stres" }
          },
          required: ["score", "description"]
        },
        finance: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            description: { type: Type.STRING, description: "Kondisi finansial & saran pengelolaan dana" }
          },
          required: ["score", "description"]
        }
      },
      required: ["monthName", "overallScore", "career", "romance", "health", "finance"]
    },
    psychologicalAdvice: {
      type: Type.OBJECT,
      properties: {
        strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 poin kekuatan utama karakter mereka" },
        growthAreas: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 poin area pengembangan diri / kelemahan yang harus disadari" },
        dailyAffirmation: { type: Type.STRING, description: "Satu kalimat afirmasi positif harian yang sangat menyentuh" },
        practicalTip: { type: Type.STRING, description: "Latihan praktis harian psikologis yang relevan, misal meditasi pernapasan 5 menit atau jurnaling" }
      },
      required: ["strengths", "growthAreas", "dailyAffirmation", "practicalTip"]
    }
  },
  required: ["visualAnalysis", "birthAnalysis", "monthlyFortune", "psychologicalAdvice"]
};

/// POST Endpoint for Analis Psikologi
app.post("/api/analyze", async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, birthDate, photo, selectedMonth, lang = "id" } = req.body;

    if (!birthDate) {
      res.status(400).json({ error: lang === "en" ? "Date of birth is required." : "Tanggal lahir wajib diisi." });
      return;
    }

    const ai = getGeminiClient();

    // Prepare content parts
    const parts: any[] = [];

    // Extract photo base64 if provided
    let hasPhoto = false;
    if (photo && typeof photo === "string" && photo.startsWith("data:")) {
      const matches = photo.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const base64Data = matches[2];
        parts.push({
          inlineData: {
            mimeType,
            data: base64Data,
          },
        });
        hasPhoto = true;
      }
    }

    const promptText = `
      Anda adalah pakar psikologi kepribadian, ahli mikroekspresi wajah (fisiognomi/Mian Xiang), konsultan Feng Shui wajah, ahli Primbon Jawa kuno, serta pakar numerologi dan perilaku.
      
      Lakukan analisis kepribadian psikologis lintas budaya dan tradisi yang mendalam untuk individu berikut:
      - Nama: ${name || "Pengguna"}
      - Tanggal Lahir: ${birthDate} (Format: YYYY-MM-DD)
      - Bulan Ramalan Peruntungan yang Diminta: ${selectedMonth || "Bulan ini"}
      
      CRITICAL REQUIREMENT (WAJIB DIPATUHI):
      - JANGAN TERLALU MEMUJI ATAU MEMBERIKAN SANJUNGAN KOSONG. Analisis harus objektif, jujur, realistis, dan berimbang.
      - WAJIB MENYERTAKAN SISI NEGATIF, kelemahan bawaan, cacat watak, potensi bahaya, kecenderungan buruk, ataupun kebocoran energi/peruntungan di setiap kategori analisis. Pengguna ingin mengetahui sisi gelap/lemah mereka secara jujur agar bisa melakukan refleksi diri dan berbenah.
      
      INSTRUKSI KHUSUS ANALISIS:
      
      1. FISIOGNOMI WAJAH & FENG SHUI WAJAH:
         - Jika ada FOTO WAJAH terlampir (${hasPhoto ? "YA, ADA FOTO" : "TIDAK ADA FOTO"}):
           * Analisis dahi (Tiga Istana / San Ting bagian atas - kecerdasan, restu leluhur), mata (sorot jiwa, fokus, kehangatan empati), hidung (pilar kekayaan & ambisi), serta dagu & rahang (keteguhan prinsip, stabilitas emosi, kemakmuran hari tua).
           * Tentukan Elemen Feng Shui Wajah (Kayu, Api, Tanah, Logam, atau Air) berdasarkan bentuk struktur wajah dominan. Jelaskan keseimbangan aliran energi Qi pada wajah tersebut, fitur paling membawa hoki (auspicious feature), serta cara menyeimbangkannya secara psikologis-spiritual.
           * SISI NEGATIF WAJAH: Ungkapkan apa kekurangan atau ketidakseimbangan energi Qi pada wajah yang dianalisis (misal: dahi terlalu sempit/berkerut menunjukkan hambatan berpikir, hidung kurang kokoh menunjukkan potensi kebocoran finansial, tatapan mata yang lelah/tidak fokus menunjukkan keraguan mental, atau bentuk rahang yang keras menunjukkan sifat keras kepala yang merugikan diri sendiri).
         - Jika TIDAK ADA FOTO, tetapkan 'hasPhoto: false'. Berikan analisis fisiognomi hipotesis dan elemen wajah Feng Shui yang paling selaras dengan elemen kelahiran dan nomor kehidupan mereka, lengkap dengan penjelasan sisi ketidakseimbangan energinya.
         
      2. PRIMBON JAWA & WETON:
         - Berdasarkan tanggal lahir ${birthDate}, hitung atau perkirakan Weton Jawa (Hari + Pasaran, misal Senin Kliwon, Selasa Legi, Rabu Pahing, Kamis Pon, Jumat Wage, Sabtu Kliwon, Minggu Pon, dll.) secara akurat atau berikan estimasi sinkronisitas kosmik yang relevan.
         - Tentukan nilai Neptu weton tersebut (misal Senin Kliwon = neptu 12, Jumat Kliwon = neptu 14, dsb).
         - Berikan deskripsi Watak Lahir asli berdasarkan Primbon Jawa yang mendalam, hangat, mendidik, dan penuh wejangan luhur.
         - WAJIB sertakan sifat-sifat buruk bawaan Weton ini menurut kitab Primbon asli (misal: mudah marah/grusa-grusu, boros, pencemburu, keras kepala, gampang tersinggung, suka membantah, atau mudah patah semangat). Jangan disembunyikan atau diperhalus berlebihan.
         - Berikan wejangan keselamatan atau peruntungan taktis harian (wetonFortuneAdvice) berdasarkan kearifan lokal Primbon untuk menghindari rintangan (apes/sengkolo).
      
      3. NUMEROLOGI & ASTROLOGI BARAT & SHIO:
         - Hitung Angka Life Path Numerologi (1-9, atau master number 11, 22, 33).
         - Analisis Zodiak Barat beserta sifat psikologisnya, termasuk kelemahan psikologis terbesarnya.
         - Analisis Shio Tionghoa beserta elemen tahun lahirnya, termasuk tantangan karakter terburuk dari Shio tersebut.
      
      4. PERUNTUNGAN BULANAN (untuk bulan "${selectedMonth}"):
         - Berikan skor peruntungan keseluruhan (overall score, 0-100).
         - Tulis ulasan ramalan psikologis & tantangan taktis yang realistis (tidak hanya yang bagus-bagus saja) (masing-masing 3-4 kalimat penuh makna) untuk bidang: Karir/Pekerjaan, Hubungan/Asmara, Kesehatan & Stres, serta Keuangan/Finansial. Sebutkan secara konkret jika ada potensi kerugian, konflik, stres, atau kendala kesehatan di bulan tersebut.
      
      5. NASIHAT PSIKOLOGIS & TERAPI PRAKTIS:
         - 3 Kekuatan utama karakter (strengths).
         - 3 Area pengembangan diri/kelemahan utama (growth areas / weaknesses) yang jujur, kritis, langsung pada sasaran, dan tidak diperhalus secara berlebihan.
         - 1 Kalimat Afirmasi Harian yang realistis (bukan sekadar kepositifan beracun/toxic positivity).
         - 1 Tips Latihan Praktis Psikologis harian yang konkret (teknik grounding, jurnalisme rasa syukur, mindfulness).
          
      PENTING (LANGUAGE REQUIREMENT):
      Seluruh isi laporan harus disampaikan secara konsisten dalam ${lang === "en" ? "Bahasa Inggris (English)" : "Bahasa Indonesia"}.
      - JIKA bahasa yang dipilih adalah Bahasa Inggris (lang = 'en'), pastikan semua teks penjelasan, deskripsi, saran, weton, shio, zodiak, dan semua string di dalam objek JSON menggunakan bahasa Inggris. Namun untuk nama weton (seperti 'Senin Kliwon') atau istilah primbon yang khas tetap sebutkan nama aslinya tapi berikan penjelasannya dalam bahasa Inggris.
      - JIKA bahasa yang dipilih adalah Bahasa Indonesia (lang = 'id'), seluruh laporan harus disampaikan dalam Bahasa Indonesia.
      
      Pastikan analisis penuh empati, jujur, objektif, tidak segan membongkar kelemahan, bernuansa kebijaksanaan klasik namun tetap sejalan dengan psikologi modern yang konstruktif dan memotivasi. Hindari sanjungan kosong yang tidak mendidik.
    `;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: lang === "en"
          ? "You are a highly skilled psychological counseling assistant who is honest, objective, does not hesitate to reveal the weaknesses or negative sides of the user's character for real self-development, avoids excessive flattery, and presents a realistic monthly fortune analysis in English."
          : "Anda adalah asisten konseling psikologi handal yang jujur, objektif, tidak ragu mengungkap kelemahan atau sisi negatif karakter pengguna demi pengembangan diri yang nyata, menghindari sanjungan berlebihan, dan menyajikan analisis peruntungan bulanan yang realistis dalam bahasa Indonesia.",
      },
    });

    const textResult = response.text;
    if (!textResult) {
      throw new Error("Tidak menerima respons teks dari model AI.");
    }

    const jsonResult = JSON.parse(textResult.trim());
    res.json(jsonResult);
  } catch (error: any) {
    console.error("Error analyzing profile:", error);
    res.status(500).json({ error: error.message || "Terjadi kesalahan internal pada server saat menganalisis." });
  }
});

// Daily Advice response schema for subscription
const dailyAdviceSchema = {
  type: Type.OBJECT,
  properties: {
    advice: { type: Type.STRING, description: "Wejangan harian psikologis-spiritual yang jujur, konkret, menyentuh, realistis, dan berimbang." },
    quote: { type: Type.STRING, description: "Kutipan refleksi diri hari ini yang mendalam." },
    motivation: { type: Type.STRING, description: "Motivasi harian kosmik khusus untuk membakar semangat pantang menyerah, menginspirasi, dan penuh energi positif." },
    energyScore: { type: Type.INTEGER, description: "Skor keselarasan energi hari ini (0-100)" },
    unfavorableTime: { type: Type.STRING, description: "Waktu naas/rentan hari ini yang perlu diwaspadai, misal 'Jam 13:00 - 15:00'" },
    focusAuraColor: { type: Type.STRING, description: "Warna getaran aura fokus untuk mediasi hari ini, misal 'Kuning Kunyit', 'Ungu Lembayung'" }
  },
  required: ["advice", "quote", "motivation", "energyScore", "unfavorableTime", "focusAuraColor"]
};

// POST Endpoint for Wejangan Harian Eksklusif (Premium Subscription)
app.post("/api/daily-advice", async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, birthDate, zodiac, shio, weton, lang = "id" } = req.body;
    const ai = getGeminiClient();

    const promptText = `
      Berikan "Wejangan Harian Kosmik" yang jujur, objektif, dan realistis (tanpa memuja berlebihan, sertakan tantangan nyata hari ini) untuk individu berikut:
      - Nama: ${name || "Pengguna"}
      - Tanggal Lahir: ${birthDate || "Tidak diketahui"}
      - Zodiak: ${zodiac || "Tidak diketahui"}
      - Shio: ${shio || "Tidak diketahui"}
      - Weton: ${weton || "Tidak diketahui"}
      
      Pastikan nasihat mencakup potensi rintangan atau sengkolo hari ini (misal emosi labil, kebocoran uang tak terduga, atau miskomunikasi) serta cara praktis melaluinya dengan tenang. JANGAN gunakan sanjungan kosong.

      PENTING (KOSMIK MOTIVASI):
      Berikan satu paragraf motivasi harian (motivation) yang menginspirasi, membakar semangat pantang menyerah, penuh dengan dorongan energi positif kosmik untuk melangkah maju memenangkan hari.

      PENTING (LANGUAGE):
      Tulis seluruh wejangan, kutipan (quote), motivasi (motivation), focusAuraColor, dan unfavorableTime dalam ${lang === "en" ? "Bahasa Inggris (English)" : "Bahasa Indonesia"}.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ text: promptText }],
      config: {
        responseMimeType: "application/json",
        responseSchema: dailyAdviceSchema,
        systemInstruction: lang === "en"
          ? "You are a wise, objective, honest, realistic, and educational spiritual advisor and humanistic-transpersonal psychology counselor. You provide balanced daily guidance and encouraging motivation without toxic positivity, in English."
          : "Anda adalah penasihat spiritual dan konselor psikologi humanistik-transpersonal Jawa yang bijak, objektif, jujur, realistis, dan mendidik. Anda memberikan ramalan harian berimbang dan motivasi penyemangat tanpa kepositifan palsu.",
      },
    });

    const textResult = response.text;
    if (!textResult) {
      throw new Error("Tidak menerima respons dari model AI.");
    }

    res.json(JSON.parse(textResult.trim()));
  } catch (error: any) {
    console.error("Error generating daily advice:", error);
    res.status(500).json({ error: error.message || "Gagal merumuskan wejangan harian." });
  }
});

// Serve frontend assets and handle Routing
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AuraPsych] Server running on http://localhost:${PORT} under NODE_ENV=${process.env.NODE_ENV || "development"}`);
  });
}

startServer();
