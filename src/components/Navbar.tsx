import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { UserRole, Student, AuthUser } from '../types';
import { ROLE_LABELS } from '../data/mockData';
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
  ScanLine,
  FileSpreadsheet,
  QrCode,
  Waves,
  ChevronDown,
  User,
  LogOut,
  Camera,
  Upload,
  CheckCircle2,
  Copy,
  Sparkles,
  ShieldCheck,
  X,
  CreditCard,
  Phone,
  Mail,
  Loader2,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { compressAndResizeImage } from '../services/imageUtils';

interface NavbarProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onOpenMobileSidebar: () => void;
  onOpenScanner: () => void;
  onOpenSheets: () => void;
  studentsInRole: Student[];
  currentStudent?: Student;
  onSelectStudent: (student: Student) => void;
  onViewBarcode: (student: Student) => void;
  onViewUserBarcode?: (user: AuthUser) => void;
  onUpdateAvatar?: (newAvatarUrl: string) => void;
  currentUser: AuthUser | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onSelectRole,
  isDark,
  onToggleTheme,
  isSidebarOpen = true,
  onToggleSidebar,
  onOpenMobileSidebar,
  onOpenScanner,
  onOpenSheets,
  studentsInRole,
  currentStudent,
  onSelectStudent,
  onViewBarcode,
  onViewUserBarcode,
  onUpdateAvatar,
  currentUser,
  onLogout,
}) => {
  const roleMeta = ROLE_LABELS[currentRole];
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessNotice, setUploadSuccessNotice] = useState<string | null>(null);
  const [copiedBarcode, setCopiedBarcode] = useState(false);
  const [qrThumbnail, setQrThumbnail] = useState<string>('');

  // Effective barcode for current user
  const userBarcode =
    currentUser?.barcode ||
    (currentUser?.role === 'admin'
      ? 'AQUA-ADM-001'
      : currentUser?.role === 'pelatih'
      ? 'AQUA-CCH-101'
      : 'AQUA-STD-001');

  // Generate thumbnail QR Code when modal opens
  useEffect(() => {
    if (showProfileModal && userBarcode) {
      QRCode.toDataURL(userBarcode, {
        width: 140,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrThumbnail(url))
        .catch((err) => console.error('Gagal generate QR thumbnail:', err));
    }
  }, [showProfileModal, userBarcode]);

  // Handle direct file upload for profile photo
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadSuccessNotice(null);
      const compressedDataUrl = await compressAndResizeImage(file, 400, 400, 0.85);

      if (onUpdateAvatar) {
        onUpdateAvatar(compressedDataUrl);
      }
      setUploadSuccessNotice('Foto profil berhasil diunggah!');
      setTimeout(() => setUploadSuccessNotice(null), 3000);
    } catch (err: any) {
      console.error('Error saat upload foto profil:', err);
      alert(err.message || 'Gagal mengunggah foto profil.');
    } finally {
      setIsUploading(false);
      // Reset input value so same file can be re-selected if desired
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCopyBarcode = () => {
    navigator.clipboard.writeText(userBarcode);
    setCopiedBarcode(true);
    setTimeout(() => setCopiedBarcode(false), 2000);
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between">
      {/* Hidden File Picker */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
      />

      {/* Left: Mobile trigger & Current Section Title */}
      <div className="flex items-center gap-3">
        {/* Sidebar Toggle */}
        <button
          onClick={() => {
            if (onToggleSidebar) {
              onToggleSidebar();
            } else {
              onOpenMobileSidebar();
            }
          }}
          title={
            isSidebarOpen
              ? 'Sembunyikan Menu Sidebar (Landscape & Desktop)'
              : 'Tampilkan Menu Sidebar (Landscape & Desktop)'
          }
          className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border ${
            !isSidebarOpen
              ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30 shadow-sm shadow-cyan-500/10'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-5 h-5 hidden lg:block" />
          ) : (
            <PanelLeftOpen className="w-5 h-5 hidden lg:block text-cyan-600 dark:text-cyan-400" />
          )}
          <Menu className="w-5 h-5 lg:hidden" />
          <span className="hidden md:inline-block text-[11px] font-bold">
            {isSidebarOpen ? 'Sembunyikan' : 'Menu'}
          </span>
        </button>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
            <span>AquaFlow</span>
            <span>/</span>
          </div>
          <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            {roleMeta.title}
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full hidden sm:inline-block ${roleMeta.badgeBg}`}
            >
              {roleMeta.textBadge}
            </span>
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Poolside Scanner Button - Admin & Pelatih */}
        {(currentRole === 'admin' || currentRole === 'pelatih') && (
          <button
            onClick={onOpenScanner}
            title="Buka Scanner Barcode Kolam (Absensi Siswa)"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
          >
            <ScanLine className="w-4 h-4" />
            <span className="hidden sm:inline">Scan Absen</span>
          </button>
        )}

        {/* Google Sheets Trigger - Admin Only */}
        {currentRole === 'admin' && (
          <button
            onClick={onOpenSheets}
            title="Sinkronisasi Google Sheets & Simpan Otomatis Jam 00:00"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer relative"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">Sheets &amp; 00:00</span>
          </button>
        )}

                {/* Cloud Sync Status */}
        <div title="Cloud Firestore Real-Time: Data tersinkron otomatis antar HP, Tablet & Laptop" className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-[11px] font-semibold text-cyan-700 dark:text-cyan-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="hidden md:inline">Cloud Sync</span>
        </div>

        {/* PWA Install Button */}
        <PWAInstallButton variant="compact" />

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          title={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-600" />}
        </button>

        {/* User Profile Pill & Quick Actions */}
        {currentUser && (
          <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800 ml-1">
            <button
              onClick={() => setShowProfileModal(true)}
              title="Buka Profil Saya & Kartu Barcode (Upload Foto Profil)"
              className="group flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              <div className="relative">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-cyan-400 shadow-sm group-hover:scale-105 transition-transform"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950"></span>
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[110px]">
                  {currentUser.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono font-bold">
                    {userBarcode}
                  </span>
                </div>
              </div>
            </button>

            <button
              onClick={onLogout}
              title="Keluar dari Akun (Logout)"
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ======================================================================= */}
      {/* MODAL: PROFIL PENGGUNA & KARTU BARCODE (UPLOAD FOTO DARI FILE)         */}
      {/* ======================================================================= */}
      {showProfileModal && currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Top decorative gradient */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600"></div>

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Profil Akun & Barcode
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Ganti foto profil & kelola kartu ID digital
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowProfileModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Upload Success Alert */}
            {uploadSuccessNotice && (
              <div className="mt-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>{uploadSuccessNotice}</span>
              </div>
            )}

            {/* Profile Avatar & Upload Section */}
            <div className="mt-5 flex flex-col items-center text-center">
              <div className="relative group">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-24 h-24 rounded-3xl object-cover border-4 border-cyan-400/50 shadow-xl"
                />

                {/* Upload Button overlay on avatar */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  title="Klik untuk memilih file foto baru dari perangkat"
                  className="absolute inset-0 bg-black/60 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                >
                  <Camera className="w-6 h-6 text-cyan-300 mb-1" />
                  <span className="text-[10px] font-bold">Ganti Foto</span>
                </button>
              </div>

              {/* Upload Action Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Mengompres Foto...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Foto Profil Baru</span>
                  </>
                )}
              </button>

              <h4 className="text-lg font-black text-slate-900 dark:text-white mt-3">
                {currentUser.name}
              </h4>

              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${roleMeta.badgeBg}`}>
                  {currentUser.role === 'admin'
                    ? 'ADMINISTRATOR UTAMA'
                    : currentUser.role === 'pelatih'
                    ? 'STAFF PELATIH RESMI'
                    : roleMeta.textBadge}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  @{currentUser.username || currentUser.email.split('@')[0]}
                </span>
              </div>
            </div>

            {/* Barcode & QR Box */}
            <div className="mt-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Barcode ID Resmi:
                </span>
                <p className="font-mono text-base font-black text-cyan-600 dark:text-cyan-400 mt-0.5 truncate">
                  {userBarcode}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={handleCopyBarcode}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:text-cyan-600 transition-colors cursor-pointer"
                  >
                    {copiedBarcode ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Salin Barcode</span>
                      </>
                    )}
                  </button>

                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Aktif
                  </span>
                </div>
              </div>

              {/* QR Code preview */}
              {qrThumbnail ? (
                <img
                  src={qrThumbnail}
                  alt="QR Code"
                  className="w-16 h-16 rounded-xl border border-slate-200 dark:border-slate-700 bg-white p-1 flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse flex-shrink-0" />
              )}
            </div>

            {/* Contact Details */}
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-2 text-slate-400">
                  <Mail className="w-3.5 h-3.5" /> Email:
                </span>
                <span className="font-mono font-semibold truncate max-w-[200px]">
                  {currentUser.email}
                </span>
              </div>

              {currentUser.phone && (
                <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-2 text-slate-400">
                    <Phone className="w-3.5 h-3.5" /> Telepon / WA:
                  </span>
                  <span className="font-mono font-semibold">{currentUser.phone}</span>
                </div>
              )}
            </div>

            {/* Actions: View Barcode Pass Card or Logout */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowProfileModal(false);
                  if (onViewUserBarcode) {
                    onViewUserBarcode(currentUser);
                  }
                }}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 dark:text-white font-extrabold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <QrCode className="w-4 h-4" />
                <span>Lihat Kartu Barcode Saya (Cetak & Unduh PNG)</span>
              </button>

              <div className="flex items-center justify-between gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileModal(false);
                    onLogout();
                  }}
                  className="py-2 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
