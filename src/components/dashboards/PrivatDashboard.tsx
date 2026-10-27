import React, { useState } from 'react';
import { Student, AttendanceRecord, UserRole } from '../../types';
import { BarcodeCard } from '../BarcodeCard';
import {
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  QrCode,
  UserCheck,
  AlertCircle,
  Send,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';

interface PrivatDashboardProps {
  student: Student;
  attendances: AttendanceRecord[];
  sessionVariant: 'privat_4' | 'privat_8' | 'privat_12';
}

export const PrivatDashboard: React.FC<PrivatDashboardProps> = ({
  student,
  attendances,
  sessionVariant,
}) => {
  const [showFullCard, setShowFullCard] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingDate, setBookingDate] = useState('2026-10-16');
  const [bookingTime, setBookingTime] = useState('08:30 WIB');
  const [bookingNotes, setBookingNotes] = useState('Fokus latihan pernapasan gaya dada');

  const totalSessions = sessionVariant === 'privat_4' ? 4 : sessionVariant === 'privat_8' ? 8 : 12;
  const remaining = student.remainingQuota;
  const completed = Math.max(0, totalSessions - remaining);
  const progressPercent = Math.round((completed / totalSessions) * 100);

  const getVariantTitle = () => {
    if (sessionVariant === 'privat_4') return 'Paket Privat 4 Sesi Intensif';
    if (sessionVariant === 'privat_8') return 'Paket Privat 8 Sesi Terstruktur';
    return 'Paket Privat 12 Sesi Master Complete';
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSuccess(true);
    setTimeout(() => setBookingSuccess(false), 4000);
  };

  // Generate curriculum steps based on variant
  const curriculumSteps = Array.from({ length: totalSessions }, (_, i) => {
    const sessionNum = i + 1;
    const isDone = sessionNum <= completed;
    let focus = `Fokus Teknik Sesi ke-${sessionNum}`;
    if (sessionNum === 1) focus = 'Asesmen Awal, Adaptasi Kedalaman & Keseimbangan Streamline';
    else if (sessionNum === 2) focus = 'Teknik Kaki & Sinkronisasi Pernapasan Gaya Dada';
    else if (sessionNum === 3) focus = 'Tarikan Tangan & Meluncur Horizontal Jarak 15m';
    else if (sessionNum === 4) focus = 'Simulasi Ketahanan 25m & Uji Kelulusan Paket 4';
    else if (sessionNum === 5) focus = 'Pengenalan Gaya Bebas & Rotasi Pinggul';
    else if (sessionNum === 6) focus = 'Pernapasan Samping (Bilateral Breathing) Gaya Bebas';
    else if (sessionNum === 7) focus = 'Kombinasi Gaya Dada & Gaya Bebas Bolak-Balik';
    else if (sessionNum === 8) focus = 'Uji Ketahanan 50m & Evaluasi Paket 8';
    else if (sessionNum === 9) focus = 'Teknik Gaya Punggung (Backstroke) Santai';
    else if (sessionNum === 10) focus = 'Dolphin Kick & Pengenalan Gaya Kupu-kupu Dasar';
    else if (sessionNum === 11) focus = 'Latihan Open Water / Ketahanan Kedalaman 2-3 Meter';
    else if (sessionNum === 12) focus = 'Ujian Kelulusan 4 Gaya Renang & Sertifikat Master';

    return { sessionNum, isDone, focus };
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner for Kelas Privat */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/30 border border-purple-400/30 text-purple-200 text-xs font-bold mb-3 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" /> {getVariantTitle()} (1-on-1 Dedicated Coach)
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Dashboard Privat: {student.name}
            </h1>
            <p className="text-sm text-purple-200 mt-1 leading-relaxed">
              Instruktur privat khusus mendampingi langsung di dalam air. Tunjukkan barcode setiap kedatangan di kolam.
            </p>
          </div>

          <button
            onClick={() => setShowFullCard(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-purple-400 hover:bg-purple-300 text-slate-950 font-extrabold text-xs shadow-xl shadow-purple-950/30 transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            Buka Swim Pass Privat
          </button>
        </div>
      </div>

      {/* Quota Progress & Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Big Ring Quota Progress */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Status Kuota Sesi
            </h3>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
              {progressPercent}% Terlaksana
            </span>
          </div>

          <div className="flex items-center justify-center my-4">
            <div className="relative w-36 h-36 rounded-full border-8 border-slate-100 dark:border-slate-800 flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full border-8 border-purple-500 transition-all duration-1000"
                style={{
                  clipPath: `polygon(50% 50%, -50% -50%, ${progressPercent * 2}% 0%, 100% 100%, 0% 100%)`,
                }}
              ></div>
              <div className="text-center">
                <span className="text-3xl font-black text-slate-900 dark:text-white">{completed}</span>
                <span className="text-slate-400 font-bold"> / {totalSessions}</span>
                <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Sesi Selesai</p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-center">
            <p className="text-xs font-semibold text-purple-900 dark:text-purple-300">
              Sisa Kuota: <span className="font-extrabold text-purple-600 dark:text-purple-400">{remaining} Pertemuan</span>
            </p>
          </div>
        </div>

        {/* Assigned Instructor Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Instruktur Privat Khusus
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                alt="Coach Privat"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-400 shadow-md"
              />
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Coach Maya Novita</h4>
                <p className="text-xs text-purple-600 dark:text-purple-400">Instruktur Privat Spesialis</p>
                <span className="text-[10px] text-slate-400">WA: 0821-6677-3344</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
              "Pendampingan 1-on-1 memastikan materi disesuaikan dengan kecepatan belajar dan target fisik Anda."
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Lintasan Privat Khusus:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">Jalur 8 & Kolam Privat</span>
          </div>
        </div>

        {/* Barcode Swim Pass */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-between">
          <div className="w-full text-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
              Swim Pass Privat
            </h3>
            <p className="text-[11px] text-slate-500 mb-2">Scan di tepi kolam mengurangi kuota</p>
          </div>
          <BarcodeCard student={student} standalone={true} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Form for Next Private Session */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-purple-500" />
            Reservasi Jadwal Sesi Privat Berikutnya
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Sebagai anggota kelas privat, Anda bebas memilih jadwal kolam sesuai kenyamanan Anda
          </p>

          {bookingSuccess && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Pengajuan jadwal berhasil dikirimkan ke Coach Maya!
            </div>
          )}

          <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Pilih Tanggal Latihan</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Pilihan Jam Sesi</label>
                <select
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700"
                >
                  <option value="07:00 WIB">Pagi (07:00 - 08:30 WIB)</option>
                  <option value="08:30 WIB">Pagi (08:30 - 10:00 WIB)</option>
                  <option value="16:00 WIB">Sore (16:00 - 17:30 WIB)</option>
                  <option value="18:30 WIB">Malam (18:30 - 20:00 WIB)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Fokus Latihan yang Diinginkan</label>
              <input
                type="text"
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                placeholder="Contoh: Latihan pernapasan rileks atau simulasi tes fisik"
                className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer transition-all shadow-md shadow-purple-600/20"
            >
              <Send className="w-4 h-4" />
              Kirim Reservasi Sesi ke Pelatih
            </button>
          </form>
        </div>

        {/* Curriculum Milestones per Session */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            Roadmap Pertemuan {getVariantTitle()}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Tahapan materi latihan personal langkah demi langkah
          </p>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {curriculumSteps.map((step) => (
              <div
                key={step.sessionNum}
                className={`p-3 rounded-2xl border text-xs flex items-center gap-3 ${
                  step.isDone
                    ? 'bg-emerald-500/5 border-emerald-500/30 dark:bg-emerald-500/10'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                    step.isDone
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {step.isDone ? '✓' : step.sessionNum}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-bold ${
                      step.isDone
                        ? 'text-emerald-900 dark:text-emerald-300'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    Pertemuan #{step.sessionNum}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{step.focus}</p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    step.isDone
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {step.isDone ? 'Selesai' : 'Berikutnya'}
                </span>
              </div>
            ))}
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
