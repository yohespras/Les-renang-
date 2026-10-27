import React, { useState } from 'react';
import { Student, AttendanceRecord } from '../../types';
import { BarcodeCard } from '../BarcodeCard';
import {
  Waves,
  CheckCircle2,
  Circle,
  QrCode,
  Sparkles,
  Calendar,
  Clock,
  Heart,
  Smile,
  Shield,
  Medal,
} from 'lucide-react';

interface DasarDashboardProps {
  student: Student;
  attendances: AttendanceRecord[];
}

export const DasarDashboard: React.FC<DasarDashboardProps> = ({ student, attendances }) => {
  const [showFullCard, setShowFullCard] = useState(false);

  // Milestones for Level 1: Dasar
  const [milestones, setMilestones] = useState([
    { id: 'm1', title: 'Meniup Gelembung Air (Bubble Blowing)', desc: 'Mengeluarkan napas di dalam air tanpa menelan air', done: true },
    { id: 'm2', title: 'Menenggelamkan Kepala (Submersion)', desc: 'Menyelam mengambil koin di kolam kedalaman 80cm', done: true },
    { id: 'm3', title: 'Mengapung Tengkurap (Prone Starfish Float)', desc: 'Badan relaks horizontal di permukaan air selama 10 detik', done: true },
    { id: 'm4', title: 'Mengapung Terlentang (Back Float)', desc: 'Telinga sejajar air, bernapas normal tanpa panik', done: true },
    { id: 'm5', title: 'Meluncur Dorong Dinding (Streamline Glide)', desc: 'Meluncur sejauh 5 meter tanpa menggunakan papan pelampung', done: false },
    { id: 'm6', title: 'Injak-injak Air Dasar (Treading Water)', desc: 'Mempertahankan kepala di atas air selama 30 detik di bagian dalam', done: false },
  ]);

  const toggleMilestone = (id: string) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, done: !m.done } : m))
    );
  };

  const completedCount = milestones.filter((m) => m.done).length;
  const progressPercent = Math.round((completedCount / milestones.length) * 100);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner for Kelas Dasar */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-700 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold mb-3 backdrop-blur-md">
              <Smile className="w-3.5 h-3.5" /> Level 1: Pengenalan Air & Water Confidence
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Halo, {student.name}! 🏊‍♂️
            </h1>
            <p className="text-sm text-cyan-100 mt-1 leading-relaxed">
              Selamat datang di zona belajar ceria. Tunjukkan Barcode Pass unikmu ke pelatih di tepi kolam saat mulai latihan!
            </p>
          </div>

          <button
            onClick={() => setShowFullCard(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-cyan-50 text-cyan-800 font-extrabold text-xs shadow-xl shadow-cyan-900/20 transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-cyan-600" />
            Buka Swim Pass Barcode
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Progress & Milestones */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Bar Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Pencapaian Milestone Kelas Dasar
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Target adaptasi air sebelum naik ke Kelas Pemula
                </p>
              </div>
              <span className="text-sm font-extrabold text-cyan-600 dark:text-cyan-400">
                {completedCount} dari {milestones.length} Lulus ({progressPercent}%)
              </span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            {/* Checklist */}
            <div className="mt-6 space-y-2.5">
              {milestones.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleMilestone(item.id)}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                    item.done
                      ? 'bg-emerald-500/5 border-emerald-500/30 dark:bg-emerald-500/10'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-cyan-400'
                  }`}
                >
                  <button type="button" className="mt-0.5 flex-shrink-0 cursor-pointer">
                    {item.done ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                    )}
                  </button>
                  <div className="flex-1">
                    <h4
                      className={`text-xs font-bold ${
                        item.done ? 'text-emerald-900 dark:text-emerald-300 line-through opacity-80' : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips for Kids & Parents */}
          <div className="bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-slate-900 dark:to-cyan-950/40 rounded-3xl border border-cyan-200 dark:border-cyan-800 p-6">
            <h4 className="text-sm font-bold text-cyan-900 dark:text-cyan-300 flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              Pesan Hangat Pelatih (Coach Sarah)
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
              "Kunci utama renang dasar adalah rasa percaya diri di air. Jangan buru-buru ingin cepat bisa gaya renang; nikmati sensasi mengapung santai. Air adalah teman kita!"
            </p>
          </div>
        </div>

        {/* Right Column: Swim Pass Preview & Schedule */}
        <div className="space-y-6">
          {/* Embedded Swim Pass */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col items-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 uppercase tracking-wider">
              Swim Pass Barcode
            </h3>
            <p className="text-[11px] text-slate-500 mb-4 text-center">
              Scan barcode ini di tepi kolam untuk mencatat kehadiran
            </p>
            <BarcodeCard student={student} standalone={true} />
          </div>

          {/* Schedule Info */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-500" />
              Jadwal Sesi Kelas Dasar
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Hari:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Senin & Kamis</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Pukul:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">15:30 - 17:00 WIB</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Lokasi:</span>
                <span className="font-bold text-cyan-600 dark:text-cyan-400">Kolam Dangkal (0.8m) Jalur 1 & 2</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Pelatih Pendamping:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Coach Sarah Agustina</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Modal Card if requested */}
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
