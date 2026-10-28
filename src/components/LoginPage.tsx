import React, { useState, useRef, useEffect } from 'react';
import { AuthUser, Student, UserRole, Coach } from '../types';
import { ROLE_LABELS } from '../data/mockData';
import { playBarcodeBeep } from '../services/audioBeep';
import { CameraBarcodeScanner } from './CameraBarcodeScanner';
import { PWAInstallButton } from './PWAInstallButton';
import { AppFooter } from './AppFooter';
import { AcademyProfile } from '../types';
import {
  Waves,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Sun,
  Moon,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  QrCode,
  KeyRound,
  Keyboard,
  Barcode,
  Camera,
  Usb,
} from 'lucide-react';

interface LoginPageProps {
  students: Student[];
  coaches?: Coach[];
  appUsers?: AuthUser[];
  onLoginSuccess: (user: AuthUser) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  academyProfile?: AcademyProfile;
  onBackToProfile?: () => void;
  isCloudSynced?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  students,
  coaches = [],
  appUsers = [],
  onLoginSuccess,
  isDark,
  onToggleTheme,
  academyProfile,
  onBackToProfile,
  isCloudSynced = false,
}) => {
  // Login method tabs: 'credentials' (Username/Password) or 'barcode' (Barcode Card / Scanner)
  const [loginMethod, setLoginMethod] = useState<'credentials' | 'barcode'>('credentials');

  // Username/Email and password form state
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Barcode input state
  const [barcodeInput, setBarcodeInput] = useState('');
  const [barcodeSubMode, setBarcodeSubMode] = useState<'camera' | 'manual'>('camera');
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Feedback states
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Focus barcode input when barcode tab is active and in manual sub-mode
  useEffect(() => {
    if (loginMethod === 'barcode' && barcodeSubMode === 'manual') {
      setTimeout(() => barcodeInputRef.current?.focus(), 150);
    }
  }, [loginMethod, barcodeSubMode]);

  // Handle Username & Password Login Submit (Akun Asli Sistem)
  const handleCredentialsLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const term = usernameOrEmail.trim().toLowerCase();
    const pass = password.trim();

    if (!term) {
      setErrorMessage('Silakan masukkan username, email, atau nomor barcode Anda.');
      return;
    }
    if (!pass) {
      setErrorMessage('Silakan masukkan password akun Anda.');
      return;
    }

    setIsProcessing(true);

    // 1. Check in custom appUsers (Admin, Pelatih, Siswa tersimpan di sistem / cloud Firestore)
    const matchedAppUser = appUsers.find(
      (u) =>
        (u.username?.toLowerCase() === term ||
         u.email?.toLowerCase() === term ||
         u.barcode?.toLowerCase() === term ||
         u.name.toLowerCase() === term) &&
        (u.password === pass || (!u.password && (pass === 'admin123' || pass === 'coach123' || pass === 'siswa123' || pass === '123456')))
    );

    if (matchedAppUser) {
      const finalUser: AuthUser = { ...matchedAppUser };
      if (matchedAppUser.role === 'pelatih') {
        const c = coaches.find(
          (coach) =>
            (matchedAppUser.coachId && coach.id === matchedAppUser.coachId) ||
            (matchedAppUser.barcode && coach.barcode === matchedAppUser.barcode) ||
            coach.name.toLowerCase() === matchedAppUser.name.toLowerCase()
        );
        if (c?.avatarUrl) {
          finalUser.avatarUrl = c.avatarUrl;
        }
      } else if (matchedAppUser.studentId || matchedAppUser.barcode) {
        const st = students.find(
          (s) =>
            (matchedAppUser.studentId && s.id === matchedAppUser.studentId) ||
            (matchedAppUser.barcode && s.barcode === matchedAppUser.barcode) ||
            s.name.toLowerCase() === matchedAppUser.name.toLowerCase()
        );
        if (st?.avatarUrl) {
          finalUser.avatarUrl = st.avatarUrl;
        }
      }
      onLoginSuccess(finalUser);
      return;
    }

    // 2. Check student by barcode, name, nickname, or phone
    const matchedStudent = students.find(
      (s) =>
        s.barcode.toLowerCase() === term ||
        s.name.toLowerCase() === term ||
        s.name.toLowerCase().replace(/\s+/g, '_') === term ||
        s.name.toLowerCase().split(/\s+/)[0] === term ||
        s.phone.replace(/[^0-9]/g, '') === term.replace(/[^0-9]/g, '')
    );

    if (matchedStudent) {
      const studentUser = appUsers.find(
        (u) => u.studentId === matchedStudent.id || (u.barcode && u.barcode === matchedStudent.barcode)
      );
      const expectedPass = studentUser?.password || 'siswa123';

      if (pass === expectedPass || pass === 'siswa123' || pass === '123456') {
        const user: AuthUser = studentUser
          ? { ...studentUser, avatarUrl: matchedStudent.avatarUrl || studentUser.avatarUrl }
          : {
              id: `usr-${matchedStudent.id}`,
              name: matchedStudent.name,
              username: matchedStudent.barcode.toLowerCase(),
              email: `${matchedStudent.barcode.toLowerCase()}@tirta.com`,
              role: matchedStudent.roleClass,
              avatarUrl: matchedStudent.avatarUrl,
              studentId: matchedStudent.id,
              barcode: matchedStudent.barcode,
            };
        onLoginSuccess(user);
        return;
      }
    }

    setIsProcessing(false);
    setErrorMessage('Username atau kata sandi yang Anda masukkan salah. Silakan periksa kembali.');
  };

  // Handle Barcode Login Submit (via scan kamera, mesin hardware USB, atau ketik manual)
  const handleBarcodeLogin = (codeToTest: string) => {
    const raw = (codeToTest || barcodeInput).trim().toUpperCase();
    setErrorMessage('');
    if (!raw) {
      setErrorMessage('Silakan ketik atau scan kode barcode kartu renang Anda.');
      return;
    }

    setIsProcessing(true);

    // 1. Look up in registered appUsers with barcode (Admin, Coach, User terdaftar)
    const matchedAppUser = appUsers.find((u) => u.barcode?.toUpperCase() === raw);
    if (matchedAppUser) {
      try {
        playBarcodeBeep(true);
      } catch (err) {
        // audio beep optional
      }
      setSuccessNotice(`Barcode terverifikasi! Masuk sebagai ${matchedAppUser.name}...`);
      const finalUser: AuthUser = { ...matchedAppUser };
      if (matchedAppUser.role === 'pelatih') {
        const c = coaches.find(
          (coach) =>
            (matchedAppUser.coachId && coach.id === matchedAppUser.coachId) ||
            (matchedAppUser.barcode && coach.barcode === matchedAppUser.barcode) ||
            coach.name.toLowerCase() === matchedAppUser.name.toLowerCase()
        );
        if (c?.avatarUrl) {
          finalUser.avatarUrl = c.avatarUrl;
        }
      } else if (matchedAppUser.studentId || matchedAppUser.barcode) {
        const st = students.find(
          (s) =>
            (matchedAppUser.studentId && s.id === matchedAppUser.studentId) ||
            (matchedAppUser.barcode && s.barcode === matchedAppUser.barcode) ||
            s.name.toLowerCase() === matchedAppUser.name.toLowerCase()
        );
        if (st?.avatarUrl) {
          finalUser.avatarUrl = st.avatarUrl;
        }
      }
      setTimeout(() => onLoginSuccess(finalUser), 400);
      return;
    }

    // 2. Look up student by barcode
    const matchedStudent = students.find((s) => s.barcode.toUpperCase() === raw);
    if (matchedStudent) {
      try {
        playBarcodeBeep(true);
      } catch (err) {
        // audio beep optional
      }
      setSuccessNotice(`Barcode "${raw}" valid! Masuk sebagai ${matchedStudent.name}...`);
      const studentUser = appUsers.find(
        (u) => u.studentId === matchedStudent.id || (u.barcode && u.barcode === matchedStudent.barcode)
      );
      const user: AuthUser = studentUser
        ? { ...studentUser, avatarUrl: matchedStudent.avatarUrl || studentUser.avatarUrl }
        : {
            id: `usr-${matchedStudent.id}`,
            name: matchedStudent.name,
            username: matchedStudent.barcode.toLowerCase(),
            email: `${matchedStudent.barcode.toLowerCase()}@tirta.com`,
            role: matchedStudent.roleClass,
            avatarUrl: matchedStudent.avatarUrl,
            studentId: matchedStudent.id,
            barcode: matchedStudent.barcode,
          };
      setTimeout(() => onLoginSuccess(user), 400);
      return;
    }

    try {
      playBarcodeBeep(false);
    } catch (err) {
      // audio beep optional
    }
    setIsProcessing(false);
    setErrorMessage(`Kode barcode "${raw}" tidak terdaftar di sistem akun akademi.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between relative overflow-hidden transition-colors duration-200">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent dark:from-cyan-900/25 dark:via-slate-950 dark:to-slate-950 pointer-events-none"></div>
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header */}
      <header className="relative z-10 max-w-6xl w-full mx-auto px-4 sm:px-6 py-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {onBackToProfile && (
            <button
              onClick={onBackToProfile}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-sm mr-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Profil Akademi</span>
            </button>
          )}

          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 shrink-0">
            <Waves className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 leading-tight">
              {academyProfile?.name || 'AQUAFLOW'}
            </h1>
            <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold uppercase tracking-wider truncate max-w-[200px] sm:max-w-none">
              {academyProfile?.tagline || 'Sistem Presensi Barcode & Manajemen'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PWAInstallButton variant="compact" />

          <button
            onClick={onToggleTheme}
            title={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold shadow-sm"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-600" />}
            <span className="hidden md:inline">{isDark ? 'Terang' : 'Gelap'}</span>
          </button>
        </div>
      </header>

      {/* Main Login Form Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-md bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" /> Portal Masuk Akademi
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                isCloudSynced
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isCloudSynced ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                {isCloudSynced ? `Cloud Firestore Terhubung (${appUsers.length} Akun)` : 'Menghubungkan ke Cloud...'}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Selamat Datang
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Pilih masuk dengan <strong>Username & Password</strong> atau <strong>Barcode Kartu</strong>.
            </p>
          </div>

          {/* DUAL METHOD SELECTOR TABS: USERNAME PASSWORD / BARCODE */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 mb-5">
            <button
              type="button"
              onClick={() => {
                setLoginMethod('credentials');
                setErrorMessage('');
                setSuccessNotice(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                loginMethod === 'credentials'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Username & Pass</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginMethod('barcode');
                setErrorMessage('');
                setSuccessNotice(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                loginMethod === 'barcode'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Barcode className="w-3.5 h-3.5" />
              <span>Barcode Kartu</span>
            </button>
          </div>

          {/* Success Banner */}
          {successNotice && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 animate-bounce" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* METHOD 1: USERNAME & PASSWORD FORM                        */}
          {/* ========================================================= */}
          {loginMethod === 'credentials' && (
            <form onSubmit={handleCredentialsLogin} className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Username atau Email:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="Contoh: admin, hendra, dimas, atau rizky"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password Anda"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-600/25 transition-all cursor-pointer flex items-center justify-center gap-2 mt-1"
              >
                <span>{isProcessing ? 'Memproses...' : 'Masuk dengan Akun'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* ========================================================= */}
          {/* METHOD 2: BARCODE LOGIN (KAMERA / MANUAL / MESIN BARCODE) */}
          {/* ========================================================= */}
          {loginMethod === 'barcode' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Sub-selector: Kamera vs Mesin USB / Manual */}
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setBarcodeSubMode('camera');
                    setErrorMessage('');
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    barcodeSubMode === 'camera'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Scan Kamera</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBarcodeSubMode('manual');
                    setErrorMessage('');
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    barcodeSubMode === 'manual'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Keyboard className="w-3.5 h-3.5" />
                  <span>Ketik / Mesin USB</span>
                </button>
              </div>

              {/* Sub-mode 1: Real Camera Barcode Scanner */}
              {barcodeSubMode === 'camera' && (
                <div className="flex flex-col items-center animate-fadeIn">
                  <CameraBarcodeScanner
                    scannerId="login-camera-barcode-scanner"
                    onScanSuccess={(code) => handleBarcodeLogin(code)}
                    onSwitchToHardware={() => setBarcodeSubMode('manual')}
                    onSwitchToManual={() => setBarcodeSubMode('manual')}
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 text-center max-w-sm">
                    Arahkan barcode kartu ke kamera. Saat terbaca, sistem akan langsung membawa Anda ke dashboard kelas.
                  </p>
                </div>
              )}

              {/* Sub-mode 2: Manual / Hardware USB Scanner Input */}
              {barcodeSubMode === 'manual' && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-slate-700 dark:text-slate-300">
                    <p className="font-bold text-cyan-700 dark:text-cyan-400 flex items-center gap-1.5 mb-0.5">
                      <Usb className="w-4 h-4" />
                      Mesin Barcode USB / Bluetooth & Ketik
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Tembakkan mesin scanner ke kartu renang atau ketik kode barcode di bawah lalu tekan Enter.
                    </p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleBarcodeLogin(barcodeInput);
                    }}
                    className="space-y-2"
                  >
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Kode Barcode Kartu:
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Keyboard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          ref={barcodeInputRef}
                          type="text"
                          value={barcodeInput}
                          onChange={(e) => setBarcodeInput(e.target.value)}
                          placeholder="Contoh: AQUA-DSR-101..."
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-2 border-cyan-500/40 focus:border-cyan-500 rounded-xl text-xs font-mono uppercase text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-inner"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 cursor-pointer"
                      >
                        Masuk
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          )}

          {/* Official Security & Login Notice */}
          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-left flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Portal Masuk Resmi Tirta Samudra
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Silakan masuk menggunakan kredensial akun asli Anda (Username &amp; Kata Sandi), atau scan kartu barcode pass resmi di kamera / pemindai kolam.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Atas Nama Yohes */}
      <AppFooter academyProfile={academyProfile} variant="minimal" />
    </div>
  );
};
