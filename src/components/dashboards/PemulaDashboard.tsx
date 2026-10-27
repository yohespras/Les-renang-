import React, { useState } from 'react';
import { Student, AttendanceRecord } from '../../types';
import { BarcodeCard } from '../BarcodeCard';
import {
  Waves,
  CheckCircle2,
  Trophy,
  Target,
  QrCode,
  Calendar,
  Clock,
  Compass,
  Activity,
  Award,
} from 'lucide-react';

interface PemulaDashboardProps {
  student: Student;
  attendances: AttendanceRecord[];
}

export const PemulaDashboard: React.FC<PemulaDashboardProps> = ({ student, attendances }) => {
  const [showFullCard, setShowFullCard] = useState(false);

  // Stroke mastery checkpoints
  const [skills, setSkills] = useState([
    {
      stroke: 'Gaya Dada (Breaststroke)',
      level: '85%',
      details: 'Tendangan katak simetris, dorongan meluncur kuat, pernapasan 1 tarikan 1 dorongan',
      status: 'Hampir Sempurna',
      color: 'from-cyan-500 to-blue-600',
    },
    {
      stroke: 'Gaya Bebas (Freestyle)',
      level: '70%',
      details: 'Flutter kick kontinu, pernapasan samping 3 kayuhan (bilateral breathing)',
      status: 'Sedang Dilatih',
      color: 'from-blue-600 to-indigo-600',
    },
    {
      stroke: 'Gaya Punggung Dasar (Backstroke)',
      level: '50%',
      details: 'Posisi pinggul sejajar permukaan, kayuhan kincir angin lembut',
      status: 'Tahap Pengenalan',
      color: 'from-teal-500 to-emerald-600',
    },
  ]);

  const [distanceTarget, setDistanceTarget] = useState(18); // out of 25m

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Banner for Kelas Pemula */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-cyan-700 via-blue-800 to-indigo-900 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-400/20 border border-cyan-400/30 text-cyan-300 text-xs font-bold mb-3 backdrop-blur-md">
              <Compass className="w-3.5 h-3.5" /> Level 2: Teknik Gaya Dada & Gaya Bebas (15m - 25m)
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Dashboard Siswa: {student.name} 🏊
            </h1>
            <p className="text-sm text-cyan-100 mt-1 leading-relaxed">
              Fokus pada kontinuitas kayuhan dan efisiensi tarikan napas. Tunjukkan barcode saat masuk kolam.
            </p>
          </div>

          <button
            onClick={() => setShowFullCard(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-xs shadow-xl shadow-cyan-950/30 transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            Buka Swim Pass Barcode
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stroke Mastery & Distance Challenge */}
        <div className="lg:col-span-2 space-y-6">
          {/* 25 Meter Distance Challenge Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-rose-500" />
                  Target Jarak Non-Stop Kolam (25 Meter)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Target kelulusan kelas pemula adalah mampu renang 25m tanpa berhenti atau menyentuh dasar.
                </p>
              </div>
              <span className="text-lg font-black text-rose-600 dark:text-rose-400">
                {distanceTarget} / 25 Meter
              </span>
            </div>

            <div className="relative w-full bg-slate-100 dark:bg-slate-800 h-6 rounded-2xl overflow-hidden p-1 flex items-center">
              <div
                className="bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 h-full rounded-xl transition-all duration-700 flex items-center justify-end pr-2 text-[10px] text-white font-bold"
                style={{ width: `${(distanceTarget / 25) * 100}%` }}
              >
                {Math.round((distanceTarget / 25) * 100)}%
              </div>
            </div>

            <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-mono">
              <span>0m (Dinding Start)</span>
              <span>12.5m (Tengah Kolam)</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">25m (Finish Flag)</span>
            </div>
          </div>

          {/* Stroke Mastery Breakdown */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-cyan-500" />
              Progres Penguasaan Gaya Renang
            </h3>

            <div className="space-y-4">
              {skills.map((s, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{s.stroke}</span>
                    <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">{s.level}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full bg-gradient-to-r ${s.color} rounded-full`}
                      style={{ width: s.level }}
                    ></div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{s.details}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Coach Advice */}
          <div className="p-5 rounded-3xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
            <span className="font-bold block mb-1">Catatan Coach Budi Santoso:</span>
            "Rizky sudah memiliki dorongan kaki katak yang sangat kuat. Jaga agar tidak terburu-buru mengambil napas, biarkan tubuh meluncur 1-2 detik setelah setiap tendangan kaki."
          </div>
        </div>

        {/* Right Column: Swim Pass & Class Info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col items-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 uppercase tracking-wider">
              Swim Pass Barcode
            </h3>
            <p className="text-[11px] text-slate-500 mb-4 text-center">
              Scan barcode kartu renang di pintu masuk kolam
            </p>
            <BarcodeCard student={student} standalone={true} />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-500" />
              Jadwal Sesi Kelas Pemula
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Hari:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Selasa & Jumat</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Pukul:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">16:00 - 17:30 WIB</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Jalur:</span>
                <span className="font-bold text-cyan-600 dark:text-cyan-400">Kolam Utama Jalur 3 & 4</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Pelatih:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Coach Budi Santoso</span>
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
