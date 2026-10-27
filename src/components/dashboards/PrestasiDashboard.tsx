import React, { useState, useEffect } from 'react';
import { Student, AttendanceRecord, TimeTrialRecord } from '../../types';
import { BarcodeCard } from '../BarcodeCard';
import { INITIAL_TIME_TRIALS } from '../../data/mockData';
import {
  Trophy,
  Timer,
  Play,
  Square,
  RotateCcw,
  Plus,
  TrendingDown,
  Award,
  Zap,
  Calendar,
  Flame,
  CheckCircle2,
  QrCode,
} from 'lucide-react';

interface PrestasiDashboardProps {
  student: Student;
  attendances: AttendanceRecord[];
}

export const PrestasiDashboard: React.FC<PrestasiDashboardProps> = ({ student, attendances }) => {
  const [showFullCard, setShowFullCard] = useState(false);
  const [timeTrials, setTimeTrials] = useState<TimeTrialRecord[]>(() => {
    const saved = localStorage.getItem('AQUA_TIME_TRIALS');
    return saved ? JSON.parse(saved) : INITIAL_TIME_TRIALS;
  });

  // Interactive Stopwatch State
  const [stopwatchActive, setStopwatchActive] = useState(false);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [selectedStroke, setSelectedStroke] = useState<'Gaya Bebas' | 'Gaya Dada' | 'Gaya Punggung' | 'Gaya Kupu-kupu' | 'Gaya Ganti'>('Gaya Bebas');
  const [selectedDistance, setSelectedDistance] = useState<number>(50);

  useEffect(() => {
    let interval: any = null;
    if (stopwatchActive) {
      interval = setInterval(() => {
        setStopwatchSeconds((prev) => +(prev + 0.01).toFixed(2));
      }, 10);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [stopwatchActive]);

  const handleSaveRecordedTime = () => {
    if (stopwatchSeconds <= 0) return;

    const newRecord: TimeTrialRecord = {
      id: `tt-${Date.now()}`,
      studentId: student.id,
      stroke: selectedStroke,
      distanceMeters: selectedDistance,
      timeSeconds: stopwatchSeconds,
      date: new Date().toISOString().split('T')[0],
      isPersonalBest: stopwatchSeconds < 27.0,
      notes: `Sesi latihan time trial kolam olympic 50m`,
    };

    const updated = [newRecord, ...timeTrials];
    setTimeTrials(updated);
    localStorage.setItem('AQUA_TIME_TRIALS', JSON.stringify(updated));
    setStopwatchActive(false);
    setStopwatchSeconds(0);
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    const ms = Math.floor((sec * 100) % 100);
    return `${mins > 0 ? mins.toString().padStart(2, '0') + ':' : ''}${secs
      .toString()
      .padStart(2, '0')}.${ms.toString().padStart(2, '0')}s`;
  };

  const studentTrials = timeTrials.filter((t) => t.studentId === student.id || student.roleClass === 'prestasi');

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner for Kelas Prestasi */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 border border-white/20 text-amber-200 text-xs font-bold mb-3 backdrop-blur-md">
              <Trophy className="w-3.5 h-3.5" /> Divisi Atlet Prestasi & Atletik Nasional
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {student.name} — Atlet Tirta Samudra 🥇
            </h1>
            <p className="text-sm text-amber-100 mt-1 leading-relaxed">
              Fokus pada akselerasi start, ketajaman flip turn, dan pemecahan Personal Best (PB).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFullCard(true)}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-xl shadow-slate-950/30 transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-amber-400" />
              Swim Pass Atlet
            </button>
          </div>
        </div>
      </div>

      {/* Personal Best Cards */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-500" />
          Rekor Waktu Terbaik Atlet (Personal Best)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-[11px] font-bold text-slate-500">50m Gaya Bebas</p>
            <h4 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">26.82s</h4>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full mt-1 inline-block">
              PB Musim Ini ★
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-[11px] font-bold text-slate-500">100m Gaya Bebas</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">58.45s</h4>
            <span className="text-[10px] text-slate-400 mt-1 inline-block">Limit O2SN: 59.00s</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-[11px] font-bold text-slate-500">50m Gaya Kupu-kupu</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">29.10s</h4>
            <span className="text-[10px] text-amber-600 font-bold mt-1 inline-block">Reaksi Start 0.65s</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-[11px] font-bold text-slate-500">50m Gaya Dada</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">35.10s</h4>
            <span className="text-[10px] text-slate-400 mt-1 inline-block">Stroke Rate: 42/min</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Stopwatch & Time Trial Input */}
        <div className="lg:col-span-2 space-y-6">
          {/* Interactive Stopwatch Tool */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Timer className="w-5 h-5 text-cyan-500" />
                  Stopwatch Time Trial Latihan
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Gunakan stopwatch saat sesi sprint di jalur 50m Olympic
                </p>
              </div>
            </div>

            {/* Big Stopwatch Display */}
            <div className="p-8 rounded-2xl bg-slate-950 text-cyan-400 font-mono text-center border border-slate-800 shadow-inner flex flex-col items-center">
              <span className="text-5xl sm:text-6xl font-black tracking-widest text-cyan-300">
                {formatSeconds(stopwatchSeconds)}
              </span>
              <p className="text-xs text-slate-400 mt-2 font-sans">
                {selectedDistance}m {selectedStroke}
              </p>
            </div>

            {/* Stopwatch Controls */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {!stopwatchActive ? (
                <button
                  type="button"
                  onClick={() => setStopwatchActive(true)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Mulai Stopwatch
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStopwatchActive(false)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 cursor-pointer"
                >
                  <Square className="w-4 h-4 fill-white" />
                  Stop
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setStopwatchActive(false);
                  setStopwatchSeconds(0);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>

              <button
                type="button"
                onClick={handleSaveRecordedTime}
                disabled={stopwatchSeconds <= 0}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-cyan-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Simpan ke Log Atlet
              </button>
            </div>

            {/* Stroke and Distance Selector */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Gaya Renang:</label>
                <select
                  value={selectedStroke}
                  onChange={(e: any) => setSelectedStroke(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700"
                >
                  <option value="Gaya Bebas">Gaya Bebas (Freestyle)</option>
                  <option value="Gaya Dada">Gaya Dada (Breaststroke)</option>
                  <option value="Gaya Kupu-kupu">Gaya Kupu-kupu (Butterfly)</option>
                  <option value="Gaya Punggung">Gaya Punggung (Backstroke)</option>
                  <option value="Gaya Ganti">Gaya Ganti (Individual Medley)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Jarak Lintasan:</label>
                <select
                  value={selectedDistance}
                  onChange={(e) => setSelectedDistance(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700"
                >
                  <option value={50}>50 Meter (Sprint)</option>
                  <option value={100}>100 Meter</option>
                  <option value={200}>200 Meter</option>
                  <option value={400}>400 Meter</option>
                </select>
              </div>
            </div>
          </div>

          {/* Time Trial History Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Riwayat Catatan Waktu Latihan & Seleksi
            </h3>
            <div className="space-y-2.5">
              {studentTrials.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {item.distanceMeters}m {item.stroke}
                      </span>
                      {item.isPersonalBest && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          Personal Best ★
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.notes}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black font-mono text-cyan-600 dark:text-cyan-400">
                      {item.timeSeconds.toFixed(2)}s
                    </span>
                    <p className="text-[10px] text-slate-400 font-mono">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Swim Pass & Training Schedule */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col items-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 uppercase tracking-wider">
              Swim Pass Atlet
            </h3>
            <p className="text-[11px] text-slate-500 mb-4 text-center">
              Barcode lisensi resmi atlet Tirta Samudra
            </p>
            <BarcodeCard student={student} standalone={true} />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              Jadwal Sesi Latihan Atlet
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Hari:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Selasa, Kamis, Sabtu, Minggu</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Waktu:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">05:30 - 08:00 WIB (Pagi)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Lintasan:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Olympic 50m - Jalur 5 & 6</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Head Coach:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Coach Hendra Gunawan</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showFullCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative max-w-md w-full bg-transparent flex flex-col items-center">
            <BarcodeCard student={student} onClose={() => setShowFullCard(false)} />
          </div>
        </div>
      )}
    </div>
  );
};
