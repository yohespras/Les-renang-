import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  createSwimmingSpreadsheet,
  exportStudentsToSheets,
  exportAttendanceToSheets,
  getAccessToken,
  extractSpreadsheetId,
} from '../services/googleSheetsService';
import {
  isAutoSaveEnabled,
  setAutoSaveEnabled,
  getDailyMidnightHistory,
  getTimeUntilMidnight,
  performDailyMidnightSave,
  exportHistoryAsJSON,
  exportHistoryAsCSV,
  DailyMidnightSnapshot,
} from '../services/dailyAutoSaveService';
import { Student, AttendanceRecord } from '../types';
import {
  X,
  FileSpreadsheet,
  ExternalLink,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TableProperties,
  LogOut,
  HelpCircle,
  Clock,
  History,
  Download,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  Database,
  Calendar,
  Check,
} from 'lucide-react';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  attendances: AttendanceRecord[];
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  students,
  attendances,
}) => {
  const [activeTab, setActiveTab] = useState<'sync' | 'autosave' | 'history'>('autosave');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Spreadsheet config
  const [rawInputId, setRawInputId] = useState<string>(() => {
    return localStorage.getItem('AQUA_LAST_SPREADSHEET_ID') || '';
  });
  const [spreadsheetId, setSpreadsheetId] = useState<string>(() => {
    return extractSpreadsheetId(localStorage.getItem('AQUA_LAST_SPREADSHEET_ID') || '');
  });
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string>(() => {
    return localStorage.getItem('AQUA_LAST_SPREADSHEET_URL') || '';
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Auto-Save 00:00 State
  const [autoSaveActive, setAutoSaveActive] = useState<boolean>(isAutoSaveEnabled());
  const [countdown, setCountdown] = useState<string>(getTimeUntilMidnight().formatted);
  const [historyList, setHistoryList] = useState<DailyMidnightSnapshot[]>(getDailyMidnightHistory());
  const [isTestingAutoSave, setIsTestingAutoSave] = useState(false);

  // Destructive/mutating action confirmation modal state (Workspace Skill Mandatory Rule)
  const [pendingAction, setPendingAction] = useState<{
    type: 'create_and_sync' | 'sync_students' | 'sync_attendance' | 'test_autosave';
    title: string;
    description: string;
  } | null>(null);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Countdown timer updater (every 1 second)
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeUntilMidnight().formatted);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Refresh history on custom event
  useEffect(() => {
    const handleSnapshotSaved = () => {
      setHistoryList(getDailyMidnightHistory());
    };
    window.addEventListener('aqua:daily-autosave-completed', handleSnapshotSaved);
    return () => window.removeEventListener('aqua:daily-autosave-completed', handleSnapshotSaved);
  }, []);

  if (!isOpen) return null;

  const handleIdChange = (val: string) => {
    setRawInputId(val);
    const cleanId = extractSpreadsheetId(val);
    setSpreadsheetId(cleanId);
    localStorage.setItem('AQUA_LAST_SPREADSHEET_ID', cleanId);
    if (cleanId) {
      const url = `https://docs.google.com/spreadsheets/d/${cleanId}/edit`;
      setSpreadsheetUrl(url);
      localStorage.setItem('AQUA_LAST_SPREADSHEET_URL', url);
    } else {
      setSpreadsheetUrl('');
      localStorage.removeItem('AQUA_LAST_SPREADSHEET_URL');
    }
  };

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        setStatusMessage({
          type: 'success',
          text: `Berhasil terhubung sebagai ${res.user.displayName || res.user.email}!`,
        });
      }
    } catch (err: unknown) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Gagal menghubungkan Google Account.',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await logoutGoogle();
    setUser(null);
    setToken(null);
    setStatusMessage({ type: 'info', text: 'Telah keluar dari akun Google.' });
  };

  // Toggle Auto-save
  const handleToggleAutoSave = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextState = e.target.checked;
    setAutoSaveActive(nextState);
    setAutoSaveEnabled(nextState);
    setStatusMessage({
      type: nextState ? 'success' : 'info',
      text: nextState
        ? 'Simpan Otomatis Jam 00:00 telah AKTIF. Sistem akan mengarsipkan data setiap tengah malam.'
        : 'Simpan Otomatis Jam 00:00 dinonaktifkan.',
    });
  };

  // Trigger confirmation dialogs for mutating operations
  const requestSyncStudents = () => {
    if (!spreadsheetId) {
      setStatusMessage({ type: 'error', text: 'Tentukan atau buat Google Spreadsheet terlebih dahulu.' });
      return;
    }
    setPendingAction({
      type: 'sync_students',
      title: 'Perbarui Data Siswa di Google Sheets?',
      description: `Akan mengekspor dan menimpa data ${students.length} siswa ke sheet 'Daftar Siswa'. Apakah Anda ingin melanjutkan?`,
    });
  };

  const requestSyncAttendance = () => {
    if (!spreadsheetId) {
      setStatusMessage({ type: 'error', text: 'Tentukan atau buat Google Spreadsheet terlebih dahulu.' });
      return;
    }
    setPendingAction({
      type: 'sync_attendance',
      title: 'Perbarui Log Absensi Kolam di Google Sheets?',
      description: `Akan mengekspor data ${attendances.length} catatan kehadiran ke sheet 'Log Absensi Kolam'. Apakah Anda ingin melanjutkan?`,
    });
  };

  const requestCreateAndSync = () => {
    setPendingAction({
      type: 'create_and_sync',
      title: 'Buat Spreadsheet Baru & Sinkronkan Semua Data?',
      description: `Aplikasi akan membuat satu Google Spreadsheet baru berjudul 'AquaFlow - Data & Absensi Les Renang' di akun Google Anda, otomatis menyiapkan sheet 'Daftar Siswa', 'Log Absensi Kolam', dan 'Rekap Harian 00.00', lalu mengisi data lengkap.`,
    });
  };

  const requestTestAutoSave = () => {
    setPendingAction({
      type: 'test_autosave',
      title: 'Jalankan Uji Coba Simpan Jam 00:00 Sekarang?',
      description: `Akan mensimulasikan penyimpanan otomatis tengah malam sekarang juga: menghitung rekap kuota, jumlah presensi, estimasi omset, dan jika Google Sheets terhubung akan langsung ditambahkan ke baris baru 'Rekap Harian 00.00'.`,
    });
  };

  const executeConfirmedAction = async () => {
    if (!pendingAction) return;
    const action = pendingAction.type;
    setPendingAction(null);
    setStatusMessage(null);

    if (action === 'test_autosave') {
      setIsTestingAutoSave(true);
      try {
        const snapshot = await performDailyMidnightSave(students, attendances, true);
        setHistoryList(getDailyMidnightHistory());
        setStatusMessage({
          type: 'success',
          text: `Uji Coba Berhasil! ${snapshot.sheetsSyncStatus}. Log tersimpan di riwayat.`,
        });
      } catch (err: unknown) {
        setStatusMessage({
          type: 'error',
          text: err instanceof Error ? err.message : 'Gagal menjalankan uji coba simpan otomatis.',
        });
      } finally {
        setIsTestingAutoSave(false);
      }
      return;
    }

    setIsProcessing(true);
    try {
      const currentToken = await getAccessToken();
      if (!currentToken) {
        throw new Error('Sesi Google belum aktif. Silakan login dengan Google terlebih dahulu.');
      }

      if (action === 'create_and_sync') {
        const sheet = await createSwimmingSpreadsheet('AquaFlow - Data & Absensi Les Renang Tirta Samudra');
        setSpreadsheetId(sheet.id);
        setRawInputId(sheet.id);
        setSpreadsheetUrl(sheet.url);
        localStorage.setItem('AQUA_LAST_SPREADSHEET_ID', sheet.id);
        localStorage.setItem('AQUA_LAST_SPREADSHEET_URL', sheet.url);

        await exportStudentsToSheets(sheet.id, students);
        await exportAttendanceToSheets(sheet.id, attendances);

        setStatusMessage({
          type: 'success',
          text: `Spreadsheet baru berhasil dibuat dan seluruh ${students.length} data siswa & ${attendances.length} catatan absensi telah disinkronkan!`,
        });
      } else if (action === 'sync_students') {
        await exportStudentsToSheets(spreadsheetId, students);
        setStatusMessage({
          type: 'success',
          text: `Data ${students.length} siswa berhasil diperbarui ke Google Sheets!`,
        });
      } else if (action === 'sync_attendance') {
        await exportAttendanceToSheets(spreadsheetId, attendances);
        setStatusMessage({
          type: 'success',
          text: `Log ${attendances.length} absensi kolam berhasil diperbarui ke Google Sheets!`,
        });
      }
    } catch (err: unknown) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Terjadi kesalahan saat berkomunikasi dengan Google Sheets API.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Google Sheets &amp; Simpan Otomatis 00:00</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sinkronisasi data siswa, rekapan kehadiran, &amp; backup otomatis tengah malam
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 pb-1 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60">
            <button
              type="button"
              onClick={() => setActiveTab('autosave')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'autosave'
                  ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4 text-cyan-500" />
              <span>Simpan Otomatis 00:00</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sync')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'sync'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UploadCloud className="w-4 h-4 text-emerald-500" />
              <span>Koneksi Google Sheets</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <History className="w-4 h-4 text-blue-500" />
              <span>Riwayat Snapshot ({historyList.length})</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Status Message Alert */}
          {statusMessage && (
            <div
              className={`p-4 rounded-2xl border text-xs flex items-start gap-3 animate-fadeIn ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-800 dark:text-blue-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              ) : statusMessage.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
              ) : (
                <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 font-medium leading-relaxed">{statusMessage.text}</div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 1: PENYIMPANAN OTOMATIS JAM 00:00 (MIDNIGHT ENGINE) */}
          {/* ========================================================= */}
          {activeTab === 'autosave' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Highlight Card: Countdown to 00:00 */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 text-white shadow-xl border border-cyan-500/30 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="relative flex h-2.5 w-2.5">
                        {autoSaveActive ? (
                          <>
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                          </>
                        ) : (
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-500"></span>
                        )}
                      </span>
                      <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                        {autoSaveActive ? 'Jadwal Simpan Otomatis Aktif' : 'Jadwal Simpan Otomatis Nonaktif'}
                      </span>
                    </div>
                    <h4 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white flex items-center gap-2">
                      <Clock className="w-6 h-6 text-cyan-400" />
                      <span>{countdown}</span>
                    </h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Waktu tersisa menuju penyimpanan otomatis tengah malam berikutnya (Pukul 00:00:00).
                    </p>
                  </div>

                  {/* Toggle Switch */}
                  <label className="flex items-center gap-3 bg-white/10 hover:bg-white/15 px-4 py-2.5 rounded-2xl border border-white/10 cursor-pointer transition-colors shrink-0">
                    <input
                      type="checkbox"
                      checked={autoSaveActive}
                      onChange={handleToggleAutoSave}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 relative"></div>
                    <span className="text-xs font-bold text-white">
                      {autoSaveActive ? 'Aktif' : 'Mati'}
                    </span>
                  </label>
                </div>

                {/* Sub Features & Quick Status */}
                <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-white/5">
                    <p className="text-[10px] text-slate-400">Total Siswa Terdaftar</p>
                    <p className="text-sm font-bold text-cyan-300">{students.length} Murid</p>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5">
                    <p className="text-[10px] text-slate-400">Absensi Hari Ini</p>
                    <p className="text-sm font-bold text-emerald-300">
                      {
                        attendances.filter(
                          (a) => a.dateStr === new Date().toISOString().split('T')[0]
                        ).length
                      }{' '}
                      Sesi
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5">
                    <p className="text-[10px] text-slate-400">Target Google Sheets</p>
                    <p className="text-sm font-bold text-amber-300 truncate">
                      {spreadsheetId ? `${spreadsheetId.slice(0, 8)}...` : 'Belum Ditentukan'}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5">
                    <p className="text-[10px] text-slate-400">Riwayat Tersimpan</p>
                    <p className="text-sm font-bold text-purple-300">{historyList.length} Hari</p>
                  </div>
                </div>
              </div>

              {/* Action Cards: Uji Simpan 00:00 & Unduh Offline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isTestingAutoSave}
                  onClick={requestTestAutoSave}
                  className="p-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 text-left transition-all group disabled:opacity-50 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                      {isTestingAutoSave ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </span>
                    <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase bg-cyan-500/10 px-2.5 py-0.5 rounded-full">
                      Uji Langsung
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                    Uji Simpan Jam 00:00 Sekarang
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Jalankan proses penyimpanan tengah malam langsung tanpa harus menunggu jam 12 malam untuk memastikan data tersimpan.
                  </p>
                </button>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      <Download className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">Cadangan Offline</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                    Unduh Arsip Snapshot Midnight
                  </h5>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => exportHistoryAsCSV(historyList)}
                      disabled={historyList.length === 0}
                      className="flex-1 py-1.5 px-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      Unduh CSV
                    </button>
                    <button
                      type="button"
                      onClick={() => exportHistoryAsJSON(historyList)}
                      disabled={historyList.length === 0}
                      className="flex-1 py-1.5 px-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      Unduh JSON
                    </button>
                  </div>
                </div>
              </div>

              {/* Informative Explanation */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <p className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Bagaimana Cara Kerja Simpan Otomatis Jam 00:00?
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  1. Setiap malam tepat pukul <strong>00:00:00</strong>, sistem secara otomatis merekam seluruh siswa, sisa kuota, dan log kehadiran hari itu ke basis data snapshot lokal.<br />
                  2. Jika akun Google dan target Spreadsheet terhubung, baris rekapan otomatis dimasukkan ke lembar <strong>'Rekap Harian 00.00'</strong> di Google Sheets.<br />
                  3. Jika laptop sedang tertidur (sleep) saat jam 00:00, heartbeat sistem akan langsung melakukan auto-save begitu laptop dinyalakan kembali di pagi hari.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: KONEKSI & SINKRONISASI GOOGLE SHEETS */}
          {/* ========================================================= */}
          {activeTab === 'sync' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Google Auth Status Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                {user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || ''}
                          className="w-10 h-10 rounded-full border border-emerald-400"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center">
                          {user.email?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Terhubung dengan Akun Google
                        </p>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {user.displayName || user.email}
                        </h4>
                        <p className="text-[11px] text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Keluar
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Hubungkan Akun Google Anda
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Masuk untuk mengaktifkan sinkronisasi otomatis ke Google Drive &amp; Sheets.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSignIn}
                      disabled={isLoggingIn}
                      className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-60"
                    >
                      {isLoggingIn ? (
                        <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />
                      ) : (
                        <svg className="w-4 h-4" viewBox="0 0 48 48">
                          <path
                            fill="#EA4335"
                            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                          />
                          <path
                            fill="#4285F4"
                            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                          />
                          <path
                            fill="#34A853"
                            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                          />
                        </svg>
                      )}
                      <span>{isLoggingIn ? 'Menghubungkan...' : 'Sign in with Google'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Spreadsheet Target Input with Auto-extract */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Link / ID Google Spreadsheet Target:
                  </label>
                  {spreadsheetUrl && (
                    <a
                      href={spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Buka di Google Sheets
                    </a>
                  )}
                </div>
                <input
                  type="text"
                  value={rawInputId}
                  onChange={(e) => handleIdChange(e.target.value)}
                  placeholder="Tempelkan link Google Sheets lengkap (https://docs.google.com/spreadsheets/d/...) atau ID dokumen"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {spreadsheetId && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>ID Spreadsheet Terdeteksi: <strong>{spreadsheetId}</strong></span>
                  </p>
                )}
              </div>

              {/* Sync Actions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* Buat & Sync Semua */}
                <button
                  type="button"
                  disabled={!user || isProcessing}
                  onClick={requestCreateAndSync}
                  className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-left transition-all group disabled:opacity-50 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      <TableProperties className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Otomatis
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    Buat Spreadsheet Baru &amp; Sync Semua
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Buat file baru di Google Drive Anda lengkap dengan tab Siswa, Absensi, &amp; Rekap Harian 00.00.
                  </p>
                </button>

                {/* Sync Siswa */}
                <button
                  type="button"
                  disabled={!user || !spreadsheetId || isProcessing}
                  onClick={requestSyncStudents}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:bg-cyan-500/5 hover:border-cyan-500/40 text-left transition-all group disabled:opacity-50 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                      <UploadCloud className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      {students.length} Siswa
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                    Sync Data Siswa
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Kirim daftar biodata, barcode, usia, kontak wali, dan kuota ke tab 'Daftar Siswa'.
                  </p>
                </button>

                {/* Sync Absensi */}
                <button
                  type="button"
                  disabled={!user || !spreadsheetId || isProcessing}
                  onClick={requestSyncAttendance}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:bg-blue-500/5 hover:border-blue-500/40 text-left transition-all group disabled:opacity-50 cursor-pointer sm:col-span-2"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      {attendances.length} Log Presensi
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    Sync Seluruh Log Absensi Kolam Renang
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Kirim seluruh riwayat scan barcode absensi, tanggal, waktu, jalur kolam, dan pelatih ke tab 'Log Absensi Kolam'.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: RIWAYAT SNAPSHOT 00:00 */}
          {/* ========================================================= */}
          {activeTab === 'history' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                    Log Catatan Simpan Otomatis Tengah Malam
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Tersimpan permanen di memori sistem lokal &amp; Google Sheets
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => exportHistoryAsCSV(historyList)}
                    disabled={historyList.length === 0}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    Ekspor CSV
                  </button>
                </div>
              </div>

              {historyList.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs space-y-2">
                  <Clock className="w-8 h-8 text-slate-400 mx-auto opacity-50" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">
                    Belum Ada Catatan Simpan Otomatis 00:00
                  </p>
                  <p className="text-[11px] max-w-sm mx-auto">
                    Sistem akan otomatis mencatat setiap pukul 00:00 malam, atau Anda dapat mengklik tombol <strong>"Uji Simpan Jam 00:00 Sekarang"</strong> di tab pertama untuk mencobanya.
                  </p>
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm max-h-72 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-[11px] font-bold sticky top-0 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="p-3">Waktu &amp; Tanggal</th>
                        <th className="p-3">Siswa (Aktif)</th>
                        <th className="p-3">Presensi</th>
                        <th className="p-3">Sisa Kuota</th>
                        <th className="p-3">Status Google Sheets</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                      {historyList.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-3 font-mono text-[11px]">
                            {item.timestamp}
                            {item.isManualTest && (
                              <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold">
                                Uji Coba
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-semibold">
                            {item.totalStudents} ({item.activeStudents} aktif)
                          </td>
                          <td className="p-3">{item.todayAttendances} sesi</td>
                          <td className="p-3 font-mono">{item.totalRemainingQuota} sesi</td>
                          <td className="p-3 text-[11px]">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${
                                item.syncedToSheets
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {item.syncedToSheets ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : (
                                <Database className="w-3 h-3" />
                              )}
                              <span>{item.sheetsSyncStatus}</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Jadwal 00:00: {autoSaveActive ? '🟢 Siap Otomatis' : '⚪ Nonaktif'}
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Mandatory Workspace Confirmation Modal */}
      {pendingAction && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              {pendingAction.title}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              {pendingAction.description}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                Batalkan
              </button>
              <button
                type="button"
                onClick={executeConfirmedAction}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                Ya, Konfirmasi &amp; Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
