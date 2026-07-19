/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useState, useEffect } from "react";
import { Camera, VideoOff, RefreshCw, Check, X } from "lucide-react";

interface WebcamCaptureProps {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
}

export default function WebcamCapture({ onCapture, onClose }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Initialize camera
  useEffect(() => {
    async function startCamera() {
      try {
        setError(null);
        setIsReady(false);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setIsReady(true);
          };
        }
      } catch (err: any) {
        console.error("Camera access error:", err);
        setError(
          "Gagal mengakses kamera. Pastikan Anda telah memberikan izin kamera di browser Anda dan tidak sedang digunakan oleh aplikasi lain."
        );
      }
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }

  function handleCapture() {
    if (videoRef.current && isReady) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Flip horizontally to act as a mirror
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64 jpeg
        const base64 = canvas.toDataURL("image/jpeg", 0.85);
        setCapturedImage(base64);
        stopCamera();
      }
    }
  }

  function handleRetake() {
    setCapturedImage(null);
    setError(null);
    setIsReady(false);
    // Restart stream
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setIsReady(true);
          };
        }
      })
      .catch((err) => {
        setError("Gagal menyalakan kembali kamera.");
      });
  }

  function handleConfirm() {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-4">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-indigo-600" />
            <h3 className="font-display font-semibold text-slate-800">Ambil Foto Wajah</h3>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="relative flex flex-col items-center justify-center bg-slate-950 p-6 min-h-[320px]">
          {error ? (
            <div className="flex flex-col items-center text-center p-6 text-slate-200">
              <VideoOff className="h-12 w-12 text-rose-500 mb-3" />
              <p className="text-sm max-w-xs">{error}</p>
              <button
                onClick={handleRetake}
                className="mt-4 flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-all"
              >
                <RefreshCw className="h-4 w-4" /> Coba Lagi
              </button>
            </div>
          ) : !capturedImage ? (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center">
              {/* Mirror effect */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover scale-x-[-1]"
              />
              {!isReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-slate-400">
                  <RefreshCw className="h-8 w-8 animate-spin text-indigo-500 mb-2" />
                  <span className="text-sm">Menyalakan kamera...</span>
                </div>
              )}
              {isReady && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <button
                    onClick={handleCapture}
                    className="flex items-center gap-2 rounded-full bg-white/90 px-6 py-2.5 font-medium text-slate-900 shadow-lg hover:bg-white transition-all transform hover:scale-105"
                  >
                    <Camera className="h-5 w-5 text-indigo-600" /> Ambil Foto
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full aspect-video rounded-xl overflow-hidden bg-slate-900">
              <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Footer */}
        {capturedImage && (
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4">
            <button
              onClick={handleRetake}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4" /> Foto Ulang
            </button>
            <button
              onClick={handleConfirm}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors shadow-sm"
            >
              <Check className="h-4 w-4" /> Gunakan Foto Ini
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
