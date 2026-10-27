import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import {
  Camera,
  CameraOff,
  RefreshCw,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Flashlight,
  Upload,
  SwitchCamera,
  ExternalLink,
  Lock,
  Usb,
  Keyboard,
  HelpCircle,
  FileImage,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { playBarcodeBeep } from '../services/audioBeep';

// BarcodeDetector TypeScript declaration for modern Web API
declare global {
  interface Window {
    BarcodeDetector?: any;
  }
}

interface CameraBarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  scannerId?: string;
  autoStart?: boolean;
  onSwitchToHardware?: () => void;
  onSwitchToManual?: () => void;
}

export const CameraBarcodeScanner: React.FC<CameraBarcodeScannerProps> = ({
  onScanSuccess,
  scannerId = 'camera-barcode-reader',
  autoStart = true,
  onSwitchToHardware,
  onSwitchToManual,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [lastScannedText, setLastScannedText] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [activeEngine, setActiveEngine] = useState<'native' | 'html5' | 'idle'>('idle');
  const [guideTab, setGuideTab] = useState<'chrome' | 'safari' | 'android'>('chrome');
  const [isUploading, setIsUploading] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isStoppingRef = useRef(false);
  const lastScannedTimeRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Detect whether running in iframe preview
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  // Stop camera media streams and background detection loops
  const stopAllStreams = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      mediaStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning && !isStoppingRef.current) {
      isStoppingRef.current = true;
      html5QrCodeRef.current
        .stop()
        .catch((e) => console.warn('Html5Qrcode stop error:', e))
        .finally(() => {
          isStoppingRef.current = false;
        });
    }

    setIsScanning(false);
    setActiveEngine('idle');
  };

  // Enumerate cameras if permitted
  const enumerateDevices = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices
          .filter((d) => d.kind === 'videoinput')
          .map((d, index) => ({
            id: d.deviceId,
            label: d.label || `Kamera ${index + 1}`,
          }));
        setCameras(videoDevices);
        if (videoDevices.length > 0 && !selectedCameraId) {
          const backCam = videoDevices.find(
            (c) =>
              c.label.toLowerCase().includes('back') ||
              c.label.toLowerCase().includes('rear') ||
              c.label.toLowerCase().includes('environment')
          );
          setSelectedCameraId(backCam ? backCam.id : videoDevices[0].id);
        }
      }
    } catch (err) {
      console.warn('Gagal membaca daftar kamera:', err);
    }
  };

  // Start Scanner with Multi-stage Fallback Strategy
  const startScanner = async () => {
    setErrorMessage(null);
    setPermissionDenied(false);
    stopAllStreams();

    // Check if browser supports camera API
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage(
        'Browser Anda tidak mendukung WebRTC camera API. Silakan gunakan tombol Upload Foto Barcode di bawah atau ketik manual.'
      );
      return;
    }

    // Try Engine 1: Native BarcodeDetector (Supported in Chrome/Edge/Android)
    const hasNativeBarcodeDetector = 'BarcodeDetector' in window;

    let stream: MediaStream | null = null;

    try {
      // Primary constraint attempt
      const primaryConstraints: MediaStreamConstraints = {
        video: selectedCameraId
          ? { deviceId: { exact: selectedCameraId } }
          : {
              facingMode: { ideal: facingMode },
            },
        audio: false,
      };

      try {
        stream = await navigator.mediaDevices.getUserMedia(primaryConstraints);
      } catch (primaryErr: any) {
        // If not a permission denial, try fallback basic constraint
        if (
          primaryErr.name !== 'NotAllowedError' &&
          primaryErr.name !== 'PermissionDeniedError'
        ) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } else {
          throw primaryErr;
        }
      }

      mediaStreamRef.current = stream;

      // Check for torch capability
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities: any = videoTrack.getCapabilities ? videoTrack.getCapabilities() : {};
        if (capabilities.torch) {
          setHasTorch(true);
        }
      }

      await enumerateDevices();

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsScanning(true);

      if (hasNativeBarcodeDetector) {
        // High-Performance Native Barcode Detector Loop
        setActiveEngine('native');
        const supportedFormats = [
          'code_128',
          'code_39',
          'ean_13',
          'ean_8',
          'qr_code',
          'upc_a',
        ];

        let detector: any = null;
        try {
          detector = new window.BarcodeDetector({ formats: supportedFormats });
        } catch {
          detector = new window.BarcodeDetector();
        }

        const scanLoop = async () => {
          if (!videoRef.current || !mediaStreamRef.current) return;

          if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes && barcodes.length > 0) {
                const detected = barcodes[0].rawValue;
                const now = Date.now();
                // Prevent duplicate trigger within 2 seconds
                if (detected && now - lastScannedTimeRef.current > 2000) {
                  lastScannedTimeRef.current = now;
                  setLastScannedText(detected);
                  playBarcodeBeep(true);
                  onScanSuccess(detected);
                }
              }
            } catch (detectErr) {
              // Frame scan error can be safely ignored
            }
          }

          animationFrameRef.current = requestAnimationFrame(scanLoop);
        };

        animationFrameRef.current = requestAnimationFrame(scanLoop);
      } else {
        // Fallback Engine 2: Use Html5Qrcode on the mounted element
        setActiveEngine('html5');
        // Stop raw stream since Html5Qrcode manages camera internally
        stream.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;

        if (!html5QrCodeRef.current) {
          html5QrCodeRef.current = new Html5Qrcode(scannerId, {
            formatsToSupport: [
              Html5QrcodeSupportedFormats.QR_CODE,
              Html5QrcodeSupportedFormats.CODE_128,
              Html5QrcodeSupportedFormats.CODE_39,
              Html5QrcodeSupportedFormats.EAN_13,
              Html5QrcodeSupportedFormats.EAN_8,
              Html5QrcodeSupportedFormats.UPC_A,
              Html5QrcodeSupportedFormats.UPC_E,
            ],
            verbose: false,
          });
        }

        await html5QrCodeRef.current.start(
          selectedCameraId ? selectedCameraId : { facingMode: facingMode },
          {
            fps: 15,
            qrbox: { width: 260, height: 260 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            const now = Date.now();
            if (now - lastScannedTimeRef.current > 2000) {
              lastScannedTimeRef.current = now;
              setLastScannedText(decodedText);
              playBarcodeBeep(true);
              onScanSuccess(decodedText);
            }
          },
          () => {}
        );
      }
    } catch (err: any) {
      console.warn('Gagal memulai kamera scanner:', err);
      setIsScanning(false);
      setActiveEngine('idle');

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
        setErrorMessage(
          'Izin kamera diblokir oleh browser. Klik ikon gembok/kamera di kolom URL browser untuk mengizinkan akses kamera, atau gunakan input manual / mesin barcode.'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('Tidak ada kamera yang terhubung pada perangkat ini.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setErrorMessage(
          'Kamera sedang digunakan oleh aplikasi lain (seperti Zoom/Meet). Tutup aplikasi lain lalu coba lagi.'
        );
      } else {
        setErrorMessage(
          err.message || 'Gagal menyalakan kamera. Periksa izin kamera browser Anda.'
        );
      }
    }
  };

  // Flip camera between front and back
  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    setSelectedCameraId('');
    setTimeout(() => {
      startScanner();
    }, 100);
  };

  // Toggle flashlight / torch
  const handleToggleTorch = async () => {
    if (!mediaStreamRef.current) return;
    const track = mediaStreamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const nextTorch = !torchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextTorch }],
        });
        setTorchOn(nextTorch);
      } catch (e) {
        console.warn('Gagal mengatur lampu senter:', e);
      }
    }
  };

  // Handle uploading barcode image file from disk / gallery
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMessage(null);

    try {
      // 1. Try BarcodeDetector on image bitmap if supported (fastest & handles 1D barcodes)
      if ('BarcodeDetector' in window) {
        try {
          const img = new Image();
          img.src = URL.createObjectURL(file);
          await img.decode();
          const detector = new window.BarcodeDetector({
            formats: ['code_128', 'code_39', 'ean_13', 'ean_8', 'qr_code', 'upc_a'],
          });
          const codes = await detector.detect(img);
          if (codes && codes.length > 0) {
            const detected = codes[0].rawValue;
            setLastScannedText(detected);
            playBarcodeBeep(true);
            onScanSuccess(detected);
            setIsUploading(false);
            return;
          }
        } catch {
          // ignore, proceed to html5QrCode
        }
      }

      // 2. Try Html5Qrcode with all barcode formats enabled
      const qrScanner = new Html5Qrcode(`${scannerId}-file-temp`, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
        ],
        verbose: false,
      });

      const decoded = await qrScanner.scanFile(file, true);
      if (decoded) {
        setLastScannedText(decoded);
        playBarcodeBeep(true);
        onScanSuccess(decoded);
        setIsUploading(false);
        return;
      }
    } catch (uploadErr) {
      console.warn('Scan file error:', uploadErr);
      setErrorMessage(
        'Tidak dapat mendeteksi barcode/QR code pada foto tersebut. Pastikan barcode kartu terlihat jelas, tidak buram, atau gunakan input kode di bawah.'
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Open direct app URL in new tab (bypasses iframe permission restrictions)
  const handleOpenInNewTab = () => {
    try {
      window.open(window.location.href, '_blank');
    } catch {
      // fallback
      window.location.reload();
    }
  };

  // Auto-start on mount if requested
  useEffect(() => {
    if (autoStart) {
      startScanner();
    }

    return () => {
      stopAllStreams();
    };
  }, []);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Hidden container for file scanner helper */}
      <div id={`${scannerId}-file-temp`} className="hidden"></div>

      {/* Scanner Viewport Box */}
      <div className="relative w-full max-w-sm rounded-2xl overflow-hidden bg-slate-950 border-2 border-dashed border-cyan-500/60 shadow-2xl flex flex-col items-center justify-center min-h-[300px] aspect-square">
        {/* Native Video Feed Element */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`w-full h-full object-cover ${activeEngine === 'native' ? 'block' : 'hidden'}`}
        />

        {/* html5-qrcode mount container for Engine 2 */}
        <div
          id={scannerId}
          className={`w-full h-full overflow-hidden ${activeEngine === 'html5' ? 'block' : 'hidden'}`}
        ></div>

        {/* Laser scanner animation overlay when camera is running */}
        {isScanning && (
          <div className="pointer-events-none absolute inset-x-8 top-1/2 -translate-y-1/2 h-44 border-2 border-cyan-400/80 rounded-2xl flex items-center justify-center overflow-hidden">
            {/* Animated Laser Line */}
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_16px_#22d3ee] animate-bounce"></div>

            {/* Corner Target Brackets */}
            <div className="absolute top-2 left-2 w-5 h-5 border-t-3 border-l-3 border-cyan-400"></div>
            <div className="absolute top-2 right-2 w-5 h-5 border-t-3 border-r-3 border-cyan-400"></div>
            <div className="absolute bottom-2 left-2 w-5 h-5 border-b-3 border-l-3 border-cyan-400"></div>
            <div className="absolute bottom-2 right-2 w-5 h-5 border-b-3 border-r-3 border-cyan-400"></div>

            <div className="absolute bottom-3 px-2 py-0.5 rounded-full bg-slate-950/80 text-[10px] text-cyan-300 font-mono">
              Posisikan Barcode di Tengah Kotak
            </div>
          </div>
        )}

        {/* State when not scanning or camera error / permission denied */}
        {!isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center bg-slate-950/95 backdrop-blur-md z-10 overflow-y-auto">
            {/* Icon */}
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-2.5 shadow-lg ${
                permissionDenied
                  ? 'bg-amber-500/15 border border-amber-500/40 text-amber-400 shadow-amber-500/20'
                  : 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 shadow-cyan-500/20'
              }`}
            >
              {permissionDenied ? (
                <Lock className="w-7 h-7 animate-pulse text-amber-400" />
              ) : (
                <Camera className="w-7 h-7 text-cyan-400" />
              )}
            </div>

            <h4 className="text-sm font-bold text-white mb-1">
              {permissionDenied ? 'Izin Kamera Terblokir' : 'Kamera Siap Diaktifkan'}
            </h4>

            {/* Explanatory Text */}
            <p className="text-[11px] text-slate-300 max-w-xs mb-3.5 leading-relaxed">
              {permissionDenied
                ? 'Browser Anda belum mengizinkan akses kamera langsung. Klik tombol di bawah untuk mencoba kembali atau pilih jalur alternatif instan.'
                : errorMessage ||
                  'Izinkan akses kamera browser agar sistem dapat memindai barcode kartu renang secara otomatis.'}
            </p>

            {/* Action Buttons Container */}
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {/* Button 1: Re-request Camera Permission directly on user click */}
              <button
                type="button"
                onClick={startScanner}
                className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Coba Buka Kamera Lagi
              </button>

              {/* If in iframe preview, provide open in new tab option */}
              {isInIframe && (
                <button
                  type="button"
                  onClick={handleOpenInNewTab}
                  className="w-full px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Buka di Tab Baru (Izin Penuh)
                </button>
              )}

              {/* Button 2: Switch to Mesin Barcode (Hardware Scanner) */}
              {onSwitchToHardware && (
                <button
                  type="button"
                  onClick={onSwitchToHardware}
                  className="w-full px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Usb className="w-3.5 h-3.5" />
                  Gunakan Mesin Barcode (USB / BT)
                </button>
              )}

              {/* Button 3: Switch to Manual Input */}
              {onSwitchToManual && (
                <button
                  type="button"
                  onClick={onSwitchToManual}
                  className="w-full px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Keyboard className="w-3.5 h-3.5" />
                  Gunakan Input Manual / Username
                </button>
              )}

              {/* Button 4: Upload Barcode Photo fallback */}
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-900 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <FileImage className="w-3.5 h-3.5" />
                {isUploading ? 'Memindai Foto...' : 'Upload Foto Kartu dari Galeri'}
              </button>
            </div>

            {/* Toggle Step-by-Step Unblock Guide */}
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="mt-3 text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showGuide ? 'Tutup Panduan Buka Blokir' : 'Cara Buka Blokir Kamera Browser'}</span>
              {showGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        )}

        {/* Engine status indicator */}
        {isScanning && (
          <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-950/80 border border-cyan-500/30 text-[10px] text-cyan-300 font-semibold backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Kamera Live ({facingMode === 'environment' ? 'Belakang' : 'Depan'})</span>
          </div>
        )}
      </div>

      {/* Hidden file input for photo upload & camera snapshot */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Success alert on barcode detection */}
      {lastScannedText && (
        <div className="mt-3 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn w-full max-w-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="truncate">
            Barcode Terbaca: <strong className="font-mono text-white">{lastScannedText}</strong>
          </span>
        </div>
      )}

      {/* Step-by-Step Unblock Guide Expandable Panel */}
      {showGuide && (
        <div className="mt-3 w-full max-w-sm p-3.5 rounded-2xl bg-slate-900 border border-amber-500/40 text-xs text-slate-300 animate-fadeIn">
          <div className="flex items-center gap-2 text-amber-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
            <Lock className="w-4 h-4" />
            <span>Petunjuk Mengizinkan Kamera di Browser</span>
          </div>

          {/* Guide Browser Tabs */}
          <div className="grid grid-cols-3 gap-1 mb-2.5 p-1 bg-slate-950 rounded-xl">
            <button
              type="button"
              onClick={() => setGuideTab('chrome')}
              className={`py-1 text-[10px] font-bold rounded-lg transition-all ${
                guideTab === 'chrome' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Chrome / Edge
            </button>
            <button
              type="button"
              onClick={() => setGuideTab('safari')}
              className={`py-1 text-[10px] font-bold rounded-lg transition-all ${
                guideTab === 'safari' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Safari (iOS/Mac)
            </button>
            <button
              type="button"
              onClick={() => setGuideTab('android')}
              className={`py-1 text-[10px] font-bold rounded-lg transition-all ${
                guideTab === 'android' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Android HP
            </button>
          </div>

          {/* Step Contents */}
          {guideTab === 'chrome' && (
            <div className="space-y-1.5 text-[11px] leading-relaxed text-slate-300">
              <p>
                <strong>Langkah 1:</strong> Lihat kolom alamat URL browser di bagian paling atas.
              </p>
              <p>
                <strong>Langkah 2:</strong> Klik ikon <strong>Gembok (🔒)</strong> atau ikon <strong>Setelan Situs / Kamera</strong> di sebelah kiri alamat web.
              </p>
              <p>
                <strong>Langkah 3:</strong> Pada baris <strong>Kamera</strong>, ubah status dari <em>Blokir</em> ke <strong>Izinkan (Allow)</strong>.
              </p>
              <p>
                <strong>Langkah 4:</strong> Klik tombol <em>"Coba Buka Kamera Lagi"</em> di atas.
              </p>
            </div>
          )}

          {guideTab === 'safari' && (
            <div className="space-y-1.5 text-[11px] leading-relaxed text-slate-300">
              <p>
                <strong>Langkah 1:</strong> Klik tombol <strong>aA</strong> di sebelah kiri kolom URL Safari (atau menu Safari di Mac).
              </p>
              <p>
                <strong>Langkah 2:</strong> Pilih <strong>Pengaturan Situs Web (Website Settings)</strong>.
              </p>
              <p>
                <strong>Langkah 3:</strong> Pada bagian <strong>Kamera</strong>, ubah ke <strong>Izinkan (Allow)</strong>.
              </p>
              <p>
                <strong>Langkah 4:</strong> Muat ulang / refresh halaman aplikasi.
              </p>
            </div>
          )}

          {guideTab === 'android' && (
            <div className="space-y-1.5 text-[11px] leading-relaxed text-slate-300">
              <p>
                <strong>Langkah 1:</strong> Klik titik tiga (<strong>⋮</strong>) di pojok kanan atas browser Chrome.
              </p>
              <p>
                <strong>Langkah 2:</strong> Buka <strong>Setelan</strong> → <strong>Setelan Situs</strong> → <strong>Kamera</strong>.
              </p>
              <p>
                <strong>Langkah 3:</strong> Cari alamat web ini di daftar 'Diblokir' lalu klik <strong>Hapus & Setel Ulang</strong>.
              </p>
            </div>
          )}

          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">Atau langsung buka di tab mandiri:</span>
            <button
              type="button"
              onClick={handleOpenInNewTab}
              className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              <ExternalLink className="w-3 h-3" />
              Buka Tab Baru
            </button>
          </div>
        </div>
      )}

      {/* Camera Switcher and Live Controls */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 w-full max-w-sm text-xs">
        <div className="flex items-center gap-1.5">
          {/* Flip Front / Back Camera */}
          <button
            type="button"
            onClick={handleToggleFacingMode}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold flex items-center gap-1.5 cursor-pointer text-xs transition-colors"
          >
            <SwitchCamera className="w-3.5 h-3.5 text-cyan-400" />
            <span>{facingMode === 'environment' ? 'Kamera Belakang' : 'Kamera Depan'}</span>
          </button>

          {/* Flashlight button if supported */}
          {hasTorch && (
            <button
              type="button"
              onClick={handleToggleTorch}
              className={`p-1.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                torchOn
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title="Lampu Senter Kamera"
            >
              <Flashlight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Select camera device if multiple cameras detected */}
        {cameras.length > 1 && (
          <select
            value={selectedCameraId}
            onChange={(e) => {
              setSelectedCameraId(e.target.value);
              setTimeout(() => {
                startScanner();
              }, 100);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 max-w-[140px] truncate"
          >
            {cameras.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};
