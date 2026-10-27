import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
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
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
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
    const isIPad = /ipad/i.test(ua) || (platform === 'MacIntel' && maxTouch > 1) || (/macintosh/i.test(ua) && maxTouch > 1);
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

    // 3. Listen to beforeinstallprompt event (Chromium on Laptop, Edge, Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        return true;
      }
    } catch (err) {
      console.warn('Install prompt error:', err);
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS: deviceInfo.isIOS,
    isIPad: deviceInfo.isIPad,
    isLaptopOrDesktop: deviceInfo.isLaptopOrDesktop,
    deviceInfo,
    install,
  };
}
