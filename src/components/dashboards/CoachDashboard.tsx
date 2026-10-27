import React, { useState, useRef } from 'react';
import { Student, AttendanceRecord, PoolSchedule, Coach, AuthUser } from '../../types';
import {
  ScanLine,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Star,
  MessageSquare,
  Users,
  Waves,
  Sparkles,
  QrCode,
  Camera,
  Upload,
  Loader2,
  Activity,
  UserCheck,
  User,
} from 'lucide-react';
import { compressAndResizeImage } from '../../services/imageUtils';
import { CoachPersonalProfile } from './CoachPersonalProfile';

interface CoachDashboardProps {
  students: Student[];
  attendances: AttendanceRecord[];
  schedules: PoolSchedule[];
  coaches: Coach[];
  activeCoachId?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  currentUser?: AuthUser | null;
  onOpenScanner: () => void;
  onViewBarcode: (student: Student) => void;
  onViewCoachBarcode?: (coach: Coach) => void;
  onUpdateCoachAvatar?: (newAvatarUrl: string, coachId: string) => void;
  onUpdateCoach?: (updatedCoach: Coach) => void;
}

export const CoachDashboard: React.FC<CoachDashboardProps> = ({
  students,
  attendances,
  schedules,
  coaches,
  activeCoachId = 'c1',
  activeTab = 'overview',
  onTabChange,
  currentUser,
  onOpenScanner,
  onViewBarcode,
  onViewCoachBarcode,
  onUpdateCoachAvatar,
  onUpdateCoach,
}) => {
  const currentCoach = coaches.find((c) => c.id === activeCoachId) || coaches[0];
  const [internalTab, setInternalTab] = useState<'overview' | 'profile' | 'schedules' | 'evaluation'>('overview');
  const currentActiveTab = (activeTab as any) || internalTab;

  const setActiveTab = (t: 'overview' | 'profile' | 'schedules' | 'evaluation') => {
    setInternalTab(t);
    if (onTabChange) onTabChange(t);
  };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  if (!currentCoach) {
    return (
      <div className="p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
          <UserCheck className="w-8 h-8 opacity-70" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-white">
          Belum Ada Pelatih Terdaftar (0 Data)
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Semua data telah direset menjadi 0. Hanya akun Admin yang aktif. Admin dapat mendaftarkan pelatih baru melalui menu Pengguna &amp; Akun Staf.
        </p>
      </div>
    );
  }

  const handleCoachAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadNotice(null);
      const compressed = await compressAndResizeImage(file, 400, 400, 0.85);
      if (onUpdateCoachAvatar) {
        onUpdateCoachAvatar(compressed, currentCoach.id);
      }
      setUploadNotice('Foto profil pelatih berhasil diperbarui!');
      setTimeout(() => setUploadNotice(null), 3500);
    } catch (err: any) {
      console.error('Error saat upload foto pelatih:', err);
      alert(err.message || 'Gagal mengunggah foto profil pelatih.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Evaluation form state
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [ratings, setRatings] = useState({
    waterConfidence: 4,
    breathing: 4,
    kicking: 3,
    armStroke: 4,
    stamina: 3,
  });
  const [feedbackNote, setFeedbackNote] = useState('');
  const [evaluationLogs, setEvaluationLogs] = useState<Array<{
    studentName: string;
    date: string;
    avgScore: number;
    note: string;
  }>>([
    {
      studentName: 'Dimas Ardiansyah',
      date: '12 Okt 2026',
      avgScore: 4.2,
      note: 'Adaptasi air sangat pesat, floating terlentang sudah tenang tanpa panik.',
    },
    {
      studentName: 'Farhan Maulana',
      date: '10 Okt 2026',
      avgScore: 4.8,
      note: 'Dolphin kick kuat pada 15 meter awal. Pertahankan ritme kayuhan sprint.',
    },
  ]);
  const [evalSubmitted, setEvalSubmitted] = useState(false);
  const [presenceFilter, setPresenceFilter] = useState<'today' | 'all'>('today');
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendances = attendances.filter((att) => att.dateStr === todayStr);
  const displayedAttendances = presenceFilter === 'today' ? todayAttendances : attendances;

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === selectedStudentId);
    if (!st) return;

    const avg = Number(
      (
        (ratings.waterConfidence +
          ratings.breathing +
          ratings.kicking +
          ratings.armStroke +
          ratings.stamina) /
        5
      ).toFixed(1)
    );

    setEvaluationLogs([
      {
        studentName: st.name,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        avgScore: avg,
        note: feedbackNote || 'Teknik renang dinilai baik dan konsisten selama sesi.',
      },
      ...evaluationLogs,
    ]);

    setFeedbackNote('');
    setEvalSubmitted(true);
    setTimeout(() => setEvalSubmitted(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hidden File Picker for Coach Avatar */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleCoachAvatarUpload}
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
      />

      {/* Upload success notification */}
      {uploadNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{uploadNotice}</span>
        </div>
      )}

      {/* Tab Switcher Navigation */}
      <div className="p-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            currentActiveTab === 'overview'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Dashboard &amp; Kolam</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            currentActiveTab === 'profile'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Profil Pelatih &amp; Barcode</span>
          <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-emerald-400/20 text-emerald-300">Resmi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('schedules')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            currentActiveTab === 'schedules'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Jadwal Mengajar ({schedules.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('evaluation')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            currentActiveTab === 'evaluation'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Evaluasi Siswa</span>
        </button>
      </div>

      {/* Conditionally render Profile Tab OR Dashboard/Overview Views */}
      {currentActiveTab === 'profile' ? (
        <CoachPersonalProfile
          currentCoach={currentCoach}
          currentUser={currentUser}
          onUpdateCoachAvatar={onUpdateCoachAvatar}
          onUpdateCoach={onUpdateCoach}
          onViewCoachBarcode={onViewCoachBarcode}
        />
      ) : (
        <>
          {/* Coach Header Banner */}
          <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shadow-xl border border-emerald-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative group">
              {currentCoach.avatarUrl ? (
                <img
                  src={currentCoach.avatarUrl}
                  alt={currentCoach.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-400 shadow-lg"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-950/60 border-2 border-emerald-400 shadow-lg flex items-center justify-center text-emerald-300">
                  <User className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-300/90" />
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                title="Ganti foto profil pelatih (upload dari file)"
                className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
              >
                <Camera className="w-5 h-5 text-emerald-300" />
                <span className="text-[9px] font-bold mt-0.5">Ubah</span>
              </button>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                  <Waves className="w-3.5 h-3.5" /> Pelatih Resmi Akademi
                </span>
                <span className="font-mono text-xs font-bold bg-black/40 px-2.5 py-0.5 rounded-full border border-emerald-400/30 text-emerald-200">
                  {currentCoach.barcode || 'AQUA-CCH-101'}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight">{currentCoach.name}</h1>
              <p className="text-xs text-emerald-100/80 mt-0.5">{currentCoach.specialty}</p>

              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-300 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Mengompres...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3 h-3" />
                      <span>Upload Foto Profil</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onViewCoachBarcode && (
              <button
                type="button"
                onClick={() => onViewCoachBarcode(currentCoach)}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-emerald-300" />
                <span>Kartu Barcode Pelatih</span>
              </button>
            )}

            <button
              onClick={onOpenScanner}
              className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-extrabold text-sm shadow-xl shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <ScanLine className="w-5 h-5" />
              Scanner Barcode Siswa Tepi Kolam
            </button>
          </div>
        </div>
      </div>

      {/* Teaching Schedule & Pool Lanes Today */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" />
                Jadwal Mengajar & Jalur Kolam
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Alokasi waktu dan jalur perenang di Kolam Tirta Samudra
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
              Hari Ini Aktif
            </span>
          </div>

          <div className="space-y-3">
            {schedules.map((sch) => (
              <div
                key={sch.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-emerald-500/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">{sch.className}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      {sch.day}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {sch.timeRange}
                  </p>
                  <p className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold mt-0.5">
                    {sch.lane}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {sch.currentEnrolled} / {sch.maxCapacity} Siswa
                    </p>
                    <p className="text-[10px] text-slate-400">Kapasitas Sesi</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Poolside Presence List */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-500" />
                Siswa Masuk di Kolam
              </h3>
              <p className="text-[11px] text-slate-400">Daftar siswa hadir dan terverifikasi</p>
            </div>

            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setPresenceFilter('today')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  presenceFilter === 'today'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Hari Ini ({todayAttendances.length})
              </button>
              <button
                type="button"
                onClick={() => setPresenceFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  presenceFilter === 'all'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Semua ({attendances.length})
              </button>
            </div>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-80">
            {displayedAttendances.map((att) => {
              const isToday = att.dateStr === todayStr;
              return (
                <div
                  key={att.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs hover:border-cyan-500/30 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 dark:text-white">{att.studentName}</p>
                      {isToday && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[9px] border border-emerald-500/20">
                          Hari Ini
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 capitalize mt-0.5">
                      {att.roleClass.replace('_', ' ')} • {att.poolLane}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {att.timeStr}
                    </span>
                    <p className="text-[10px] text-slate-400 font-mono">{att.dateStr}</p>
                  </div>
                </div>
              );
            })}

            {displayedAttendances.length === 0 && (
              <div className="py-8 text-center text-slate-400">
                <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-1" />
                <p className="font-bold text-xs text-slate-600 dark:text-slate-300">
                  {presenceFilter === 'today'
                    ? 'Belum ada siswa masuk hari ini'
                    : 'Belum ada data presensi'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Scan barcode siswa saat tiba di kolam renang.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Swimming Skill Evaluation Tool */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Input Penilaian & Evaluasi Teknik Renang Siswa
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Catat perkembangan teknik pernapasan, streamline, tendangan kaki, dan daya tahan
            </p>
          </div>
        </div>

        {evalSubmitted && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4" /> Evaluasi renang berhasil disimpan dan diperbarui!
          </div>
        )}

        <form onSubmit={handleSaveEvaluation} className="space-y-5 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Pilih Siswa</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full mt-1.5 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-semibold"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.barcode} - {s.roleClass.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Metric sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 mb-1">
                <span>Adaptasi & Ketenangan Air</span>
                <span className="text-amber-500">{ratings.waterConfidence}/5 ★</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={ratings.waterConfidence}
                onChange={(e) => setRatings({ ...ratings, waterConfidence: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 mb-1">
                <span>Teknik Pernapasan (Breathing)</span>
                <span className="text-cyan-500">{ratings.breathing}/5 ★</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={ratings.breathing}
                onChange={(e) => setRatings({ ...ratings, breathing: Number(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 mb-1">
                <span>Kekuatan Tendangan Kaki</span>
                <span className="text-emerald-500">{ratings.kicking}/5 ★</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={ratings.kicking}
                onChange={(e) => setRatings({ ...ratings, kicking: Number(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 mb-1">
                <span>Tarikan Tangan (Catch & Pull)</span>
                <span className="text-blue-500">{ratings.armStroke}/5 ★</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={ratings.armStroke}
                onChange={(e) => setRatings({ ...ratings, armStroke: Number(e.target.value) })}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 mb-1">
                <span>Daya Tahan / Stamina (Endurance)</span>
                <span className="text-purple-500">{ratings.stamina}/5 ★</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={ratings.stamina}
                onChange={(e) => setRatings({ ...ratings, stamina: Number(e.target.value) })}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Catatan Pelatih & Rekomendasi Latihan</label>
            <textarea
              rows={2}
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
              placeholder="Contoh: Pertahankan posisi kepala menatap dasar kolam saat meluncur..."
              className="w-full mt-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition-all shadow-md shadow-emerald-600/20"
            >
              Simpan Evaluasi Sesi
            </button>
          </div>
        </form>

        {/* Recent Evaluation Log List */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Riwayat Evaluasi Terakhir
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {evaluationLogs.map((log, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 dark:text-white">{log.studentName}</span>
                  <span className="font-bold text-amber-500 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500" /> {log.avgScore} / 5
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed italic">
                  "{log.note}"
                </p>
                <p className="text-[10px] text-slate-400 mt-2 font-mono">{log.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};
