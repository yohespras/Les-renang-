import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __deferredPWAInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

export interface DeviceInfo {
  isIOS: boolean;
  isIPad: boolean;
  isIPhone: boolean;
  isLaptopOrDesktop: boolean;
  isMac: boolean;
  isWindows: boolean;
  isAndroid: boolean;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined' && window.__deferredPWAInstallPrompt) {
      return window.__deferredPWAInstallPrompt;
    }
    return null;
  });
  const [isInstalled, setIsInstalled] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isIOS: false,
    isIPad: false,
    isIPhone: false,
    isLaptopOrDesktop: false,
    isMac: false,
    isWindows: false,
    isAndroid: false,
  });

  useEffect(() => {
    // 1. Detect standalone mode (already installed or running as PWA window)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');
    setIsInstalled(isStandalone);

    // 2. Comprehensive Device Detection:
    const ua = window.navigator.userAgent.toLowerCase();
    const platform = (window.navigator as unknown as { platform?: string }).platform || '';
    const maxTouch = window.navigator.maxTouchPoints || 0;

    // iPadOS 13+ reports as MacIntel with touch capabilities
    const isIPad =
      /ipad/i.test(ua) ||
      (platform === 'MacIntel' && maxTouch > 1) ||
      (/macintosh/i.test(ua) && maxTouch > 1);
    const isIPhone = /iphone|ipod/i.test(ua);
    const isIOS = isIPad || isIPhone;
    const isAndroid = /android/i.test(ua);
    const isMac = /macintosh|mac os x/i.test(ua) && !isIPad;
    const isWindows = /windows/i.test(ua);
    const isLaptopOrDesktop = !isIOS && !isAndroid;

    setDeviceInfo({
      isIOS,
      isIPad,
      isIPhone,
      isLaptopOrDesktop,
      isMac,
      isWindows,
      isAndroid,
    });

    if (window.__deferredPWAInstallPrompt) {
      setDeferredPrompt(window.__deferredPWAInstallPrompt);
    }

    // 3. Listen to beforeinstallprompt event (Chromium on Laptop, Edge, Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      window.__deferredPWAInstallPrompt = e as BeforeInstallPromptEvent;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleGlobalPromptReady = () => {
      if (window.__deferredPWAInstallPrompt) {
        setDeferredPrompt(window.__deferredPWAInstallPrompt);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      window.__deferredPWAInstallPrompt = null;
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('aqua:pwa-prompt-ready', handleGlobalPromptReady);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('aqua:pwa-prompt-ready', handleGlobalPromptReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async (): Promise<boolean> => {
    const promptEvent = deferredPrompt || window.__deferredPWAInstallPrompt;
    if (!promptEvent) return false;
    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        window.__deferredPWAInstallPrompt = null;
        setDeferredPrompt(null);
        return true;
      }
    } catch (err) {
      console.warn('Install prompt error:', err);
    }
    return false;
  };

  /**
   * Downloads a standalone universal HTML launcher file that works on ANY device
   * (Android, iPhone/iPad, Windows, Mac, Linux, Chromebook) even when inside an iframe or WebView.
   */
  const downloadUniversalAppLauncher = (appName: string, targetUrl?: string) => {
    const url =
      targetUrl ||
      (typeof window !== 'undefined'
        ? window.location.href.replace('ais-dev-', 'ais-pre-')
        : 'https://aquaflow.app');
    const cleanTitle = appName || 'Tirta Samudra Academy';
    const safeFileName = `Aplikasi-${cleanTitle.replace(/[^a-zA-Z0-9_-]/g, '-')}.html`;

    const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="theme-color" content="#06b6d4" />
  <title>${cleanTitle} - Peluncur Aplikasi Resmi</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #020617 0%, #0f172a 50%, #083344 100%);
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      text-align: center;
    }
    .card {
      max-width: 420px;
      width: 100%;
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid rgba(6, 182, 212, 0.35);
      border-radius: 28px;
      padding: 32px 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
    }
    .logo {
      width: 72px;
      height: 72px;
      border-radius: 20px;
      background: linear-gradient(135deg, #06b6d4, #2563eb);
      color: white;
      font-weight: 900;
      font-size: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 18px;
      box-shadow: 0 10px 25px rgba(6, 182, 212, 0.4);
    }
    h1 { font-size: 20px; font-weight: 800; margin-bottom: 8px; color: #ffffff; }
    p { font-size: 13px; color: #94a3b8; line-height: 1.5; margin-bottom: 24px; }
    .btn {
      display: inline-block;
      width: 100%;
      padding: 14px 20px;
      border-radius: 16px;
      background: linear-gradient(90deg, #06b6d4, #2563eb);
      color: #ffffff;
      font-weight: 800;
      font-size: 14px;
      text-decoration: none;
      box-shadow: 0 10px 20px rgba(6, 182, 212, 0.3);
    }
    .sub { margin-top: 16px; font-size: 11px; color: #64748b; }
  </style>
  <script>
    setTimeout(function() {
      window.location.replace(${JSON.stringify(url)});
    }, 600);
  </script>
</head>
<body>
  <div class="card">
    <div class="logo">TS</div>
    <h1>${cleanTitle}</h1>
    <p>Membuka portal manajemen akademi renang &amp; presensi barcode secara otomatis...</p>
    <a class="btn" href="${url}">Buka Aplikasi Sekarang</a>
    <div class="sub">Simpan file ini di Layar Utama / Desktop perangkat Anda untuk akses 1 klik kapan saja.</div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = safeFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS: deviceInfo.isIOS,
    isIPad: deviceInfo.isIPad,
    isLaptopOrDesktop: deviceInfo.isLaptopOrDesktop,
    deviceInfo,
    install,
    downloadUniversalAppLauncher,
  };
}

