import React, { useState, useEffect, useRef } from 'react';
import { Student, AttendanceRecord, UserRole } from '../types';
import { playBarcodeBeep } from '../services/audioBeep';
import { CameraBarcodeScanner } from './CameraBarcodeScanner';
import {
  X,
  ScanLine,
  CheckCircle2,
  AlertCircle,
  Camera,
  Keyboard,
  Clock,
  Sparkles,
  UserCheck,
  Usb,
  Bluetooth,
  Radio,
  Search,
  Check,
  RotateCw
} from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  attendances?: AttendanceRecord[];
  onAttendanceRecorded: (record: AttendanceRecord, updatedStudent?: Student) => void;
  activeCoachName?: string;
  activeCoachId?: string;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  students,
  attendances = [],
  onAttendanceRecorded,
  activeCoachName = 'Coach Hendra Gunawan',
  activeCoachId = 'c1',
}) => {
  const [scannerMode, setScannerMode] = useState<'camera' | 'hardware' | 'manual'>('camera');
  const [manualCode, setManualCode] = useState('');
  const [hardwareBarcodeInput, setHardwareBarcodeInput] = useState('');
  const [searchStudentTerm, setSearchStudentTerm] = useState('');
  const [lockHardwareFocus, setLockHardwareFocus] = useState(true);

  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    student?: Student;
    timestamp?: string;
    source?: 'camera' | 'hardware' | 'manual';
  } | null>(null);

  const [recentScans, setRecentScans] = useState<
    Array<{ name: string; barcode: string; time: string; role: UserRole; status: string }>
  >([]);

  const hardwareInputRef = useRef<HTMLInputElement>(null);
  const manualInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus hardware scanner input or manual input
  useEffect(() => {
    if (!isOpen) return;

    if (scannerMode === 'hardware') {
      const focusHardware = () => hardwareInputRef.current?.focus();
      focusHardware();
      const interval = setInterval(() => {
        if (lockHardwareFocus && document.activeElement !== hardwareInputRef.current) {
          hardwareInputRef.current?.focus();
        }
      }, 1000);
      return () => clearInterval(interval);
    } else if (scannerMode === 'manual') {
      setTimeout(() => manualInputRef.current?.focus(), 150);
    }
  }, [isOpen, scannerMode, lockHardwareFocus]);

  // Global Hardware Barcode Scanner listener (USB Cable / Bluetooth HID)
  useEffect(() => {
    if (!isOpen) return;

    let buffer = '';
    let lastKeyTime = Date.now();

    const handleHardwareKeyDown = (e: KeyboardEvent) => {
      // If user is actively typing in the manual search box, don't intercept unless it's an Enter with rapid scanner buffer
      const target = e.target as HTMLElement;
      const isManualSearchInput = target && target.id === 'modal-student-search-input';

      const now = Date.now();
      const elapsed = now - lastKeyTime;
      lastKeyTime = now;

      if (e.key === 'Enter') {
        if (buffer.length >= 4) {
          const potentialBarcode = buffer.trim().toUpperCase();
          buffer = '';
          e.preventDefault();
          processBarcodeScan(potentialBarcode, 'hardware');
        } else {
          buffer = '';
        }
        return;
      }

      if (e.key.length === 1) {
        if (elapsed > 90 && !isManualSearchInput) {
          buffer = '';
        }
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleHardwareKeyDown);
    return () => {
      window.removeEventListener('keydown', handleHardwareKeyDown);
    };
  }, [isOpen, students]);

  if (!isOpen) return null;

  const processBarcodeScan = (
    codeToTest: string,
    source: 'camera' | 'hardware' | 'manual' = 'camera'
  ) => {
    const trimmed = codeToTest.trim().toUpperCase();
    if (!trimmed) return;

    // Look up student by barcode
    const matched = students.find((s) => s.barcode.toUpperCase() === trimmed);

    const now = new Date();
    const timeStr =
      now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) + ' WIB';
    const dateStr = now.toISOString().split('T')[0];

    if (!matched) {
      playBarcodeBeep(false);
      setScanResult({
        success: false,
        message: `Barcode "${trimmed}" tidak terdaftar di sistem akademi renang.`,
        source,
      });
      return;
    }

    if (matched.status !== 'active') {
      playBarcodeBeep(false);
      setScanResult({
        success: false,
        message: `Status siswa ${matched.name} tidak aktif. Hubungi Admin.`,
        student: matched,
        source,
      });
      return;
    }

    // CEK APAKAH SUDAH DIABSEN HARI INI (TIDAK BISA DOUBLE ABSEN DI HARI YANG SAMA)
    const alreadyAttendedToday = attendances.find(
      (att) => att.studentId === matched.id && att.dateStr === dateStr
    );

    if (alreadyAttendedToday) {
      playBarcodeBeep(false);
      setScanResult({
        success: false,
        message: `⛔ PERINGATAN: ${matched.name} (${matched.barcode}) SUDAH DIABSEN HARI INI pukul ${alreadyAttendedToday.timeStr} (Status: ${alreadyAttendedToday.status.toUpperCase()})! Tidak bisa absen dobel di hari yang sama.`,
        student: matched,
        source,
      });
      return;
    }

    // Check quota for all swimming classes
    const effectiveTotal = matched.totalQuota > 0 ? matched.totalQuota : 12;
    const currentRemaining = typeof matched.remainingQuota === 'number' ? matched.remainingQuota : effectiveTotal;

    if (currentRemaining <= 0) {
      playBarcodeBeep(false);
      setScanResult({
        success: false,
        message: `Kuota sesi renang ${matched.name} telah habis (0/${effectiveTotal}). Harap lakukan perpanjangan paket pertemuan.`,
        student: matched,
        source,
      });
      return;
    }

    // Deduct 1 quota for this attendance session
    const newRemaining = Math.max(0, currentRemaining - 1);
    const updatedStudent: Student = {
      ...matched,
      totalQuota: effectiveTotal,
      remainingQuota: newRemaining,
    };

    // Play successful audio beep
    playBarcodeBeep(true);

    const sourceLabel =
      source === 'camera'
        ? 'Scan Kamera Perangkat'
        : source === 'hardware'
        ? 'Mesin Barcode USB/Bluetooth'
        : 'Input Manual';

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      studentId: matched.id,
      studentName: matched.name,
      roleClass: matched.roleClass,
      dateStr: dateStr,
      timeStr: timeStr,
      coachId: activeCoachId,
      coachName: activeCoachName,
      status: 'hadir',
      poolLane: 'Kolam Utama - Jalur Presensi',
      verifiedByBarcode: true,
      notes: `Verifikasi ${sourceLabel} di tepi kolam`,
    };

    onAttendanceRecorded(newRecord, updatedStudent);

    setScanResult({
      success: true,
      message: `Presensi Berhasil: ${matched.name} (${matched.barcode})`,
      student: updatedStudent || matched,
      timestamp: timeStr,
      source,
    });

    setRecentScans((prev) => [
      {
        name: matched.name,
        barcode: matched.barcode,
        time: timeStr,
        role: matched.roleClass,
        status: 'Hadir',
      },
      ...prev.slice(0, 4),
    ]);

    setManualCode('');
    setHardwareBarcodeInput('');
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processBarcodeScan(manualCode, 'manual');
  };

  const handleHardwareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processBarcodeScan(hardwareBarcodeInput, 'hardware');
  };

  // Filtered students for quick search tab
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchStudentTerm.toLowerCase()) ||
      s.barcode.toLowerCase().includes(searchStudentTerm.toLowerCase()) ||
      s.roleClass.toLowerCase().includes(searchStudentTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shadow-md shadow-cyan-500/10">
              <ScanLine className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Presensi & Absensi Kolam Renang
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                  Real-Time
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pelatih Bertugas: <span className="font-semibold text-cyan-600 dark:text-cyan-400">{activeCoachName}</span>
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

        {/* Tab Selection */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-slate-200/60 dark:bg-slate-950 border border-slate-300 dark:border-slate-800">
            {/* Tab 1: Kamera Scanner */}
            <button
              type="button"
              onClick={() => setScannerMode('camera')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                scannerMode === 'camera'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Kamera Perangkat</span>
            </button>

            {/* Tab 2: Mesin Barcode Kabel / Bluetooth */}
            <button
              type="button"
              onClick={() => setScannerMode('hardware')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                scannerMode === 'hardware'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300'
              }`}
            >
              <Usb className="w-4 h-4" />
              <span>Mesin Barcode USB/BT</span>
            </button>

            {/* Tab 3: Manual Input & List */}
            <button
              type="button"
              onClick={() => setScannerMode('manual')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                scannerMode === 'manual'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300'
              }`}
            >
              <Keyboard className="w-4 h-4" />
              <span>Input Manual</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: Real Device Camera Barcode Scanner */}
          {scannerMode === 'camera' && (
            <div className="flex flex-col items-center">
              <CameraBarcodeScanner
                scannerId="poolside-barcode-camera-scanner"
                onScanSuccess={(code) => processBarcodeScan(code, 'camera')}
                onSwitchToHardware={() => setScannerMode('hardware')}
                onSwitchToManual={() => setScannerMode('manual')}
              />
              <p className="text-[11px] text-slate-400 mt-2 text-center max-w-sm">
                Arahkan kartu renang ke kotak pemindai kamera di atas. Sistem akan berbunyi 'bip' dan langsung mencatat kehadiran siswa secara instan.
              </p>
            </div>
          )}

          {/* TAB 2: Mesin Barcode Kabel / Bluetooth */}
          {scannerMode === 'hardware' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Standby Status Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-transparent border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Radio className="w-5 h-5 animate-pulse text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        Mesin Barcode USB & Bluetooth Siap Tembak
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Scanner kabel colok USB atau scanner Bluetooth nirkabel langsung aktif tanpa driver tambahan.
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-[10px] font-mono font-bold text-cyan-300 border border-slate-700 flex items-center gap-1">
                    <Usb className="w-3 h-3" /> USB HID
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-[10px] font-mono font-bold text-blue-300 border border-slate-700 flex items-center gap-1">
                    <Bluetooth className="w-3 h-3" /> Bluetooth
                  </span>
                </div>
              </div>

              {/* Hardware Scanner Dedicated Input Field */}
              <form onSubmit={handleHardwareSubmit} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ScanLine className="w-4 h-4 text-cyan-500" />
                    Target Input Tembakan Barcode Scanner:
                  </label>
                  <button
                    type="button"
                    onClick={() => setLockHardwareFocus(!lockHardwareFocus)}
                    className={`text-[11px] px-2 py-0.5 rounded-md font-semibold cursor-pointer transition-all ${
                      lockHardwareFocus
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {lockHardwareFocus ? '🔒 Kunci Fokus Otomatis: Aktif' : '🔓 Kunci Fokus: Lepas'}
                  </button>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Usb className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      ref={hardwareInputRef}
                      type="text"
                      value={hardwareBarcodeInput}
                      onChange={(e) => setHardwareBarcodeInput(e.target.value)}
                      placeholder="Tembakkan barcode scanner di sini (mis: AQUA-DSR-101)..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border-2 border-cyan-500/40 focus:border-cyan-400 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 font-mono text-sm uppercase shadow-inner"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Catat Absen
                  </button>
                </div>
              </form>

              {/* Instructions Guide */}
              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                <p className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                  Petunjuk Penggunaan Mesin Barcode Tepi Kolam:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-500 dark:text-slate-400 pl-1">
                  <li>Tancapkan pemindai USB ke laptop atau sambungkan pemindai Bluetooth ke tablet/ponsel.</li>
                  <li>Arahkan laser pemindai ke kartu swim pass siswa yang baru tiba.</li>
                  <li>Tekan pelatuk scanner (Bip!). Data presensi dan kuota akan otomatis tersimpan dalam detik itu juga.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: Manual Input & Search Siswa */}
          {scannerMode === 'manual' && (
            <div className="space-y-4 animate-fadeIn">
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Keyboard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    ref={manualInputRef}
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Ketik kode barcode siswa (Contoh: AQUA-DSR-101)..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm uppercase"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
                >
                  Scan & Catat
                </button>
              </form>

              {/* Quick Filter Search Siswa */}
              <div className="pt-2">
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="modal-student-search-input"
                    type="text"
                    value={searchStudentTerm}
                    onChange={(e) => setSearchStudentTerm(e.target.value)}
                    placeholder="Cari siswa berdasarkan nama atau kelas renang..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                  {filteredStudents.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => processBarcodeScan(st.barcode, 'manual')}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 hover:border-cyan-400 transition-all flex items-center justify-between text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={st.avatarUrl}
                          alt={st.name}
                          className="w-7 h-7 rounded-lg object-cover"
                        />
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {st.name}
                          </p>
                          <p className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">
                            {st.barcode}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold uppercase">
                        Presensi
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Scan Result Feedback Alert */}
          {scanResult && (
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3.5 animate-fadeIn ${
                scanResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
              }`}
            >
              {scanResult.success ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-6 h-6 text-rose-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm">{scanResult.message}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 font-medium text-slate-600 dark:text-slate-400">
                    {scanResult.source === 'camera'
                      ? '📷 Kamera'
                      : scanResult.source === 'hardware'
                      ? '🔌 Barcode Scanner'
                      : '⌨️ Manual'}
                  </span>
                </div>
                {scanResult.student && (
                  <div className="mt-2 text-xs flex flex-wrap gap-2 text-slate-600 dark:text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono">
                      {scanResult.student.barcode}
                    </span>
                    <span>Kelas: {scanResult.student.roleClass.toUpperCase()}</span>
                    <span>Waktu: {scanResult.timestamp}</span>
                    <span
                      className={`font-semibold ${
                        scanResult.student.remainingQuota <= 1
                          ? 'text-rose-600 dark:text-rose-400 font-bold'
                          : 'text-cyan-600 dark:text-cyan-400'
                      }`}
                    >
                      Sisa Kuota: {scanResult.student.remainingQuota} / {scanResult.student.totalQuota} Sesi
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Simulation Barcode Buttons */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                Uji Coba Tembak Barcode Siswa (Simulasi Cepat)
              </span>
              <span className="text-[11px] text-slate-400">{students.length} Siswa Terdaftar</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {students.slice(0, 6).map((student) => (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => processBarcodeScan(student.barcode, 'hardware')}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 hover:border-cyan-400 transition-all text-left group cursor-pointer"
                >
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-cyan-500">
                    {student.name}
                  </p>
                  <p className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">
                    {student.barcode}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Scans in Current Session */}
          {recentScans.length > 0 && (
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
              <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Presensi Terakhir Sesi Ini
              </h5>
              <div className="space-y-1.5">
                {recentScans.map((scan, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20"
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-500" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {scan.name}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">{scan.barcode}</span>
                    </div>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                      {scan.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Radio className="w-3.5 h-3.5 text-emerald-500" />
            <span>Kamera & Scanner Siap Digunakan</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
