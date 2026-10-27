import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Download,
  Smartphone,
  Tablet,
  Laptop,
  X,
  CheckCircle,
  Share,
  PlusSquare,
  Sparkles,
  Info,
  Check,
  QrCode,
  Copy,
  AlertTriangle,
  Send,
  ExternalLink,
} from 'lucide-react';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'primary' | 'outline' | 'compact' | 'pill';
  showText?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'outline',
  showText = true,
}) => {
  const { isInstallable, isInstalled, isIOS, isIPad, isLaptopOrDesktop, deviceInfo, install } =
    usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'laptop' | 'share'>(() => {
    if (isIOS || isIPad) return 'ios';
    if (isLaptopOrDesktop) return 'laptop';
    return 'android';
  });
  const [isInstalling, setIsInstalling] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isInsideIframe, setIsInsideIframe] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // Detect if app is currently loaded inside AI Studio preview iframe and compute public URL
  useEffect(() => {
    try {
      setIsInsideIframe(window.self !== window.top);
    } catch {
      setIsInsideIframe(true);
    }

    const currentUrl =
      typeof window !== 'undefined'
        ? window.location.href.replace('ais-dev-', 'ais-pre-')
        : '';
    setShareUrl(currentUrl);

    if (currentUrl) {
      QRCode.toDataURL(currentUrl, {
        width: 180,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then(setQrCodeDataUrl)
        .catch(console.error);
    }
  }, []);

  // If already running inside installed standalone PWA
  if (isInstalled) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        <CheckCircle className="w-3.5 h-3.5" />
        <span>PWA Terpasang</span>
      </span>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      const installed = await install();
      setIsInstalling(false);
      if (!installed) {
        setShowGuideModal(true);
      }
    } else {
      if (isIOS || isIPad) {
        setActiveTab('ios');
      } else if (isLaptopOrDesktop) {
        setActiveTab('laptop');
      } else {
        setActiveTab('android');
      }
      setShowGuideModal(true);
    }
  };

  const handleCopyLink = () => {
    const url = shareUrl || window.location.href.replace('ais-dev-', 'ais-pre-');
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const url = shareUrl || window.location.href.replace('ais-dev-', 'ais-pre-');
    const text = encodeURIComponent(
      `Buka dan pasang aplikasi AquaFlow di HP / Tablet Anda:\n${url}\n(Buka langsung di Chrome atau Safari untuk memasang ke layar utama)`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const getStyleClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20';
      case 'compact':
        return 'bg-cyan-50 hover:bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:hover:bg-cyan-900/60 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 text-xs px-2.5 py-1.5';
      case 'pill':
        return 'bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm';
      case 'outline':
      default:
        return 'border border-cyan-500/40 hover:border-cyan-500 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300';
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        disabled={isInstalling}
        title="Pasang aplikasi AquaFlow di Tablet, Laptop, atau HP Anda (PWA)"
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer active:scale-95 ${getStyleClasses()} ${className}`}
      >
        <Download className="w-4 h-4 text-cyan-500" />
        {showText && (
          <span>
            {isIPad
              ? 'Pasang di iPad / Tab'
              : isIOS
              ? 'Pasang di iPhone'
              : isLaptopOrDesktop
              ? 'Download di Laptop / PC'
              : 'Pasang Aplikasi di HP'}
          </span>
        )}
      </button>

      {/* Comprehensive Universal PWA Installation Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-left relative overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Pasang AquaFlow di Perangkat Lain</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Aplikasi web progresif resmi (PWA) untuk HP Android, iPhone, iPad, Tablet &amp; Laptop
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Crucial Notice: If opened inside preview iframe */}
            {isInsideIframe && (
              <div className="mt-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1.5 flex-1">
                  <p className="font-bold">
                    Buka di Tab Baru / Perangkat Lain untuk Menginstal
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                    Browser (Chrome/Safari) secara otomatis <strong>menonaktifkan instalasi PWA</strong> jika aplikasi dibuka di dalam bingkai iframe AI Studio. Buka tautan publik langsung di HP atau perangkat lain Anda.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] transition-colors cursor-pointer shadow-sm"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Link Tersalin!' : 'Salin Tautan Publik'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleShareWhatsApp}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim ke WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Device Switcher Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 my-4 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('android')}
                className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'android'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="truncate">Android</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ios')}
                className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'ios'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
                <span className="truncate">iPhone / iPad</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('laptop')}
                className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'laptop'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span className="truncate">Laptop / PC</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('share')}
                className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'share'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span className="truncate">Scan QR</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="overflow-y-auto space-y-4 pr-1 flex-1">
              {/* TAB 1: ANDROID HP & TABLET */}
              {activeTab === 'android' && (
                <div className="space-y-3 animate-fadeIn text-xs">
                  {/* Direct Prompt if supported in this browser */}
                  {isInstallable && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-emerald-700 dark:text-emerald-300">
                          Browser Siap Memasang Aplikasi
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Ketuk tombol untuk memasang AquaFlow langsung ke HP Android Anda.
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          const res = await install();
                          if (res) setShowGuideModal(false);
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
                      >
                        Pasang Sekarang
                      </button>
                    </div>
                  )}

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase">
                        Panduan Android (Google Chrome)
                      </span>
                    </div>

                    <div className="space-y-2 text-slate-600 dark:text-slate-300">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">Buka di Browser Google Chrome</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Jika link dibuka dari WhatsApp atau Telegram, ketuk titik 3 di WA lalu pilih <strong>"Buka di Browser"</strong> (Chrome).
                          </p>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">Ketuk Menu Titik Tiga (⋮) di Sudut Kanan Atas</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Terletak di baris atas browser Chrome di HP Anda.
                          </p>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">Pilih "Instal Aplikasi" / "Tambahkan ke Layar Utama"</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Ikon aplikasi AquaFlow akan langsung muncul di menu dan layar utama HP Anda seperti aplikasi Play Store.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: IPHONE & IPAD (SAFARI) */}
              {activeTab === 'ios' && (
                <div className="space-y-3 animate-fadeIn text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold uppercase">
                        Khusus iPhone &amp; iPad (Wajib Browser Safari)
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Apple mewajibkan instalasi PWA dilakukan lewat browser <strong>Safari</strong> bawaan Apple.
                    </p>

                    <div className="space-y-2 text-slate-600 dark:text-slate-300">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                        <div className="p-1 rounded bg-blue-500 text-white shrink-0 mt-0.5">
                          <Share className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">Langkah 1: Ketuk Ikon "Bagikan" (Share) di Safari</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Ikon kotak dengan panah mengarah ke atas di bilah bawah (iPhone) atau bilah atas (iPad).
                          </p>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                        <div className="p-1 rounded bg-slate-700 text-white shrink-0 mt-0.5">
                          <PlusSquare className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">Langkah 2: Pilih "Tambah ke Layar Utama" (Add to Home Screen)</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Gulir menu pop-up Safari ke bawah dan ketuk pilihan tersebut.
                          </p>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                        <div className="p-1 rounded bg-emerald-500 text-white shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">Langkah 3: Ketuk "Tambah" (Add) di Sudut Kanan Atas</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Aplikasi AquaFlow akan langsung terpasang di Homescreen iOS Anda dan siap dibuka fullscreen tanpa bilah browser.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: LAPTOP / PC GUIDE */}
              {activeTab === 'laptop' && (
                <div className="space-y-3 animate-fadeIn text-xs">
                  {isInstallable && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-cyan-700 dark:text-cyan-300">
                          Instalasi Langsung Terdeteksi
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Browser laptop Anda siap memasang AquaFlow ke desktop.
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          const res = await install();
                          if (res) setShowGuideModal(false);
                        }}
                        className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-md shadow-cyan-600/20 cursor-pointer"
                      >
                        Pasang Sekarang
                      </button>
                    </div>
                  )}

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                    <p className="font-bold text-slate-900 dark:text-white">
                      Cara Pasang di Laptop Windows / Mac (Chrome &amp; Edge):
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      1. Buka tautan di Google Chrome atau Microsoft Edge.<br />
                      2. Perhatikan di ujung kanan <strong>bilah alamat (Address bar)</strong> atas.<br />
                      3. Klik ikon komputer/download <strong>"Instal AquaFlow"</strong>.<br />
                      4. Aplikasi langsung tersemat di Taskbar dan Start Menu komputer.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 4: SCAN QR & SHARE */}
              {activeTab === 'share' && (
                <div className="space-y-3 animate-fadeIn text-center text-xs">
                  <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col items-center">
                    <p className="font-bold text-slate-900 dark:text-white mb-1">
                      Buka di Perangkat Lain via Scan QR
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mb-3">
                      Arahkan kamera HP atau tablet Anda ke kode QR di bawah untuk langsung membuka aplikasi:
                    </p>

                    {qrCodeDataUrl ? (
                      <div className="p-3 rounded-2xl bg-white shadow-lg border border-slate-200 dark:border-slate-700 mb-3">
                        <img src={qrCodeDataUrl} alt="QR Code PWA" className="w-40 h-40" />
                      </div>
                    ) : (
                      <div className="w-40 h-40 rounded-2xl bg-slate-200 animate-pulse mb-3" />
                    )}

                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 cursor-pointer"
                      >
                        {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedLink ? 'Link Berhasil Disalin!' : 'Salin Tautan'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleShareWhatsApp}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>Kirim ke WhatsApp</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>Ringan • Cepat • Siap Offline</span>
              </span>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 cursor-pointer"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
