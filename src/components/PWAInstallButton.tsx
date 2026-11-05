import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { getLiveAcademyProfile } from '../data/mockData';
import {
  Download,
  Smartphone,
  Tablet,
  Laptop,
  X,
  CheckCircle,
  Share,
  PlusSquare,
  Check,
  QrCode,
  Copy,
  AlertTriangle,
  Send,
  ExternalLink,
  FileDown,
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
  const {
    isInstallable,
    isInstalled,
    isIOS,
    isIPad,
    isLaptopOrDesktop,
    install,
    downloadUniversalAppLauncher,
  } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'laptop' | 'share'>(() => {
    if (isIOS || isIPad) return 'ios';
    if (isLaptopOrDesktop) return 'laptop';
    return 'android';
  });
  const [isInstalling, setIsInstalling] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadedLauncher, setDownloadedLauncher] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isInsideIframe, setIsInsideIframe] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [, setProfileTick] = useState(0);

  useEffect(() => {
    const onUpdate = () => setProfileTick((t) => t + 1);
    window.addEventListener('aqua:profile-updated', onUpdate);
    return () => window.removeEventListener('aqua:profile-updated', onUpdate);
  }, []);

  const liveProfile = getLiveAcademyProfile();
  const appTitle = liveProfile.effectiveName || 'Tirta Samudra Academy';

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

  const handleDownloadLauncher = () => {
    downloadUniversalAppLauncher(appTitle, shareUrl);
    setDownloadedLauncher(true);
    setTimeout(() => setDownloadedLauncher(false), 3500);
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
      `Buka dan download aplikasi ${appTitle} di HP / Tablet / Laptop Anda:\n${url}\n(Bisa dibuka di perangkat apa saja: Android, iPhone, iPad, atau Laptop)`
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
        type="button"
        onClick={handleInstallClick}
        disabled={isInstalling}
        title={`Download & Pasang Aplikasi ${appTitle} di Perangkat Apa Saja (HP Android, iPhone, iPad, Tablet, Laptop/PC)`}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer active:scale-95 ${getStyleClasses()} ${className}`}
      >
        {isInstalled ? (
          <>
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            {showText && <span>Aplikasi Terpasang (Bagikan / Download)</span>}
          </>
        ) : (
          <>
            <Download className="w-4 h-4 text-cyan-500 shrink-0" />
            {showText && (
              <span>
                {isIPad
                  ? 'Download di iPad / Tab'
                  : isIOS
                  ? 'Download di iPhone'
                  : isLaptopOrDesktop
                  ? 'Download Aplikasi'
                  : 'Download Aplikasi di HP'}
              </span>
            )}
          </>
        )}
      </button>

      {/* Comprehensive Universal PWA & Multi-Device Download Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-left relative overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 shrink-0">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Download &amp; Pasang di Perangkat Apa Saja</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {appTitle} • Mendukung Android, iPhone, iPad, Tablet, Windows &amp; Mac
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Universal 1-Click Direct Download Box (Works on 100% of Devices & Browsers) */}
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-cyan-600/15 via-blue-600/10 to-emerald-600/15 border-2 border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-black uppercase">
                  <span>Bisa di Semua Device (Universal)</span>
                </div>
                <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                  Download Langsung ke Perangkat Ini
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Unduh peluncur aplikasi resmi atau pasang langsung ke layar utama HP Android, iPhone/iPad, maupun Desktop PC.
                </p>
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                {isInstallable && (
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await install();
                      if (res) setShowGuideModal(false);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Instal Aplikasi Sekarang</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleDownloadLauncher}
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-600/25 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {downloadedLauncher ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Berhasil Diunduh!</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4" />
                      <span>Download Peluncur Aplikasi</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* If opened inside preview iframe */}
            {isInsideIframe && (
              <div className="mt-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                    Untuk menginstal aplikasi penuh (PWA) di Chrome/Safari, buka tautan langsung di tab baru atau kirim ke HP Anda:
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={shareUrl || window.location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[11px] transition-colors cursor-pointer shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka di Tab Baru</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 text-white font-bold text-[11px] cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Tersalin' : 'Salin Link'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Device Switcher Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 my-3.5 shrink-0">
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
            <div className="overflow-y-auto space-y-3 pr-1 flex-1">
              {/* TAB 1: ANDROID HP & TABLET */}
              {activeTab === 'android' && (
                <div className="space-y-3 animate-fadeIn text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase">
                        HP &amp; Tablet Android (Chrome / Samsung / Mi Browser)
                      </span>
                    </div>

                    <div className="space-y-2 text-slate-600 dark:text-slate-300">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">Klik Tombol "Download Peluncur Aplikasi" di Atas atau Buka di Chrome</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Jika dibuka dari WhatsApp, ketuk titik 3 di pojok kanan atas WA lalu pilih <strong>"Buka di Chrome"</strong>.
                          </p>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">Ketuk Menu Titik Tiga (⋮) di Sudut Kanan Atas Browser</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Pilih menu <strong>"Instal Aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.
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
                        iPhone &amp; iPad (Safari iOS)
                      </span>
                    </div>

                    <div className="space-y-2 text-slate-600 dark:text-slate-300">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                        <div className="p-1 rounded bg-blue-500 text-white shrink-0 mt-0.5">
                          <Share className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">Langkah 1: Ketuk Ikon "Bagikan" (Share) di Safari</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Ketuk ikon kotak dengan panah ke atas di bilah bawah Safari, atau klik tombol <strong>Download Peluncur Aplikasi</strong> di atas.
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
                            Ketuk <strong>Tambah (Add)</strong> di pojok kanan atas. Aplikasi {appTitle} langsung muncul di layar utama iPhone/iPad Anda.
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
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                    <p className="font-bold text-slate-900 dark:text-white">
                      Cara Download di Laptop Windows / Mac / Chromebook:
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      1. Klik tombol biru <strong>"Download Peluncur Aplikasi"</strong> di atas untuk mengunduh file peluncur langsung ke komputer Anda.<br />
                      2. Atau klik ikon komputer/unduh di sisi kanan <strong>Address Bar (Bilah Alamat)</strong> Chrome / Microsoft Edge untuk memasang ke Desktop &amp; Taskbar.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 4: SCAN QR & SHARE */}
              {activeTab === 'share' && (
                <div className="space-y-3 animate-fadeIn text-center text-xs">
                  <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col items-center">
                    <p className="font-bold text-slate-900 dark:text-white mb-1">
                      Scan QR untuk Download di HP / Tablet Lain
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mb-3">
                      Arahkan kamera HP Android atau iPhone ke kode QR ini untuk langsung membuka &amp; mengunduh aplikasi:
                    </p>

                    {qrCodeDataUrl ? (
                      <div className="p-3 rounded-2xl bg-white shadow-lg border border-slate-200 dark:border-slate-700 mb-3">
                        <img src={qrCodeDataUrl} alt="QR Code Aplikasi" className="w-36 h-36" />
                      </div>
                    ) : (
                      <div className="w-36 h-36 rounded-2xl bg-slate-200 animate-pulse mb-3" />
                    )}

                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 cursor-pointer"
                      >
                        {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedLink ? 'Link Berhasil Disalin!' : 'Salin Tautan Aplikasi'}</span>
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
                <span>Kompatibel Semua Device (Android, iOS &amp; PC)</span>
              </span>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
