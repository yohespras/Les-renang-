import React, { useState } from 'react';
import { UserRole, ClassPricingPackage, AcademyProfile, StudentRegistration } from '../types';
import { ROLE_LABELS } from '../data/mockData';
import {
  X,
  User,
  Calendar,
  Phone,
  MapPin,
  HeartHandshake,
  CheckCircle2,
  Send,
  MessageCircle,
  FileCheck,
  Sparkles,
  Waves,
  ShieldCheck,
  Clock,
  Coins,
  Lock,
  AlertCircle,
} from 'lucide-react';

export const ALLOWED_REGISTRATION_CLASSES: UserRole[] = ['dasar', 'privat_4', 'privat_8', 'privat_12'];

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  pricingPackages: ClassPricingPackage[];
  academyProfile: AcademyProfile;
  initialRoleClass?: UserRole;
  onRegisterSubmit: (registration: StudentRegistration) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  pricingPackages,
  academyProfile,
  initialRoleClass = 'dasar',
  onRegisterSubmit,
}) => {
  const safeInitialRoleClass: UserRole = ALLOWED_REGISTRATION_CLASSES.includes(initialRoleClass)
    ? initialRoleClass
    : 'dasar';

  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [age, setAge] = useState<number>(7);
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [roleClass, setRoleClass] = useState<UserRole>(safeInitialRoleClass);

  // Sync roleClass if initialRoleClass changes while open
  React.useEffect(() => {
    if (ALLOWED_REGISTRATION_CLASSES.includes(initialRoleClass)) {
      setRoleClass(initialRoleClass);
    } else {
      setRoleClass('dasar');
    }
  }, [initialRoleClass, isOpen]);
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [preferredSchedule, setPreferredSchedule] = useState('');
  const [notes, setNotes] = useState('');

  // Submitted success state
  const [submittedData, setSubmittedData] = useState<StudentRegistration | null>(null);

  if (!isOpen) return null;

  // Calculate age when birth date changes
  const handleBirthDateChange = (val: string) => {
    setBirthDate(val);
    if (val) {
      const birth = new Date(val);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        calculatedAge--;
      }
      if (calculatedAge >= 0) setAge(calculatedAge);
    }
  };

  const selectedPackage = pricingPackages.find((p) => p.roleClass === roleClass && p.isActive) || pricingPackages[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !parentName.trim() || !phone.trim()) {
      alert('Mohon lengkapi Nama Calon Siswa, Nama Orang Tua, dan Nomor WhatsApp!');
      return;
    }

    const regId = `REG-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const finalRoleClass: UserRole = ALLOWED_REGISTRATION_CLASSES.includes(roleClass) ? roleClass : 'dasar';
    const newReg: StudentRegistration = {
      id: regId,
      fullName: fullName.trim(),
      nickname: nickname.trim() || fullName.split(' ')[0],
      birthDate: birthDate || '2018-01-01',
      age: Number(age) || 7,
      gender,
      roleClass: finalRoleClass,
      parentName: parentName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      medicalHistory: medicalHistory.trim() || 'Tidak ada riwayat penyakit',
      preferredSchedule: preferredSchedule.trim() || 'Mengikuti jadwal kelas yang tersedia',
      registrationDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      notes: notes.trim(),
    };

    onRegisterSubmit(newReg);
    setSubmittedData(newReg);
  };

  const handleWhatsAppConfirmation = () => {
    if (!submittedData) return;
    const cleanPhone = academyProfile.whatsapp.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Halo Admin ${academyProfile.name},\nSaya baru saja mendaftar secara online melalui sistem PWA atas nama:\n\n` +
      `*No. Registrasi:* ${submittedData.id}\n` +
      `*Nama Siswa:* ${submittedData.fullName} (${submittedData.age} th)\n` +
      `*Kelas Renang:* ${ROLE_LABELS[submittedData.roleClass].title}\n` +
      `*Orang Tua:* ${submittedData.parentName}\n` +
      `*No. WhatsApp:* ${submittedData.phone}\n\n` +
      `Mohon info lanjutan untuk jadwal briefing kolam dan pembayaran. Terima kasih!`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const resetAndClose = () => {
    setSubmittedData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden text-slate-800 dark:text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-cyan-600 to-blue-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
              <Waves className="w-6 h-6 text-cyan-200" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Pendaftaran Murid Baru</h3>
              <p className="text-xs text-cyan-100">
                {academyProfile.name} &bull; Pendaftaran Resmi Online
              </p>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {submittedData ? (
            /* Success State */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border-2 border-emerald-500">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                  Pendaftaran Berhasil Dikirim!
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  Data calon murid telah tercatat di sistem admin kami. Silakan simpan nomor pendaftaran berikut:
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 max-w-md mx-auto">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                  Nomor Pendaftaran Resmi
                </span>
                <p className="text-2xl font-extrabold text-cyan-700 dark:text-cyan-300 font-mono mt-1">
                  {submittedData.id}
                </p>
                <div className="mt-3 pt-3 border-t border-cyan-200/60 dark:border-cyan-800/60 text-xs text-left space-y-1 text-slate-600 dark:text-slate-300">
                  <p><strong>Nama:</strong> {submittedData.fullName}</p>
                  <p><strong>Kelas:</strong> {ROLE_LABELS[submittedData.roleClass].title}</p>
                  <p><strong>Orang Tua:</strong> {submittedData.parentName} ({submittedData.phone})</p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <button
                  onClick={handleWhatsAppConfirmation}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 cursor-pointer transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Konfirmasi via WhatsApp</span>
                </button>
                <button
                  onClick={resetAndClose}
                  className="px-5 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm cursor-pointer transition-all"
                >
                  Selesai
                </button>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Info banner */}
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-start gap-3 text-xs text-cyan-900 dark:text-cyan-200">
                <Sparkles className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                <p>
                  Daftarkan putra-putri Anda sekarang! Biaya pendaftaran formulir sebesar{' '}
                  <strong>Rp {academyProfile.registrationFee.toLocaleString('id-ID')}</strong> mencakup kartu swim pass barcode, topi renang akademi, dan buku panduan capaian.
                </p>
              </div>

              {/* Data Calon Siswa */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-cyan-500" />
                  <span>Data Calon Siswa</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Nama Lengkap Calon Siswa *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Muhammad Aditya Pratama"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Nama Panggilan
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Adit"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Tanggal Lahir
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => handleBirthDateChange(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Usia (Tahun)
                    </label>
                    <input
                      type="number"
                      min={3}
                      max={70}
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Jenis Kelamin
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as 'Laki-laki' | 'Perempuan')}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Pilihan Program Kelas */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Waves className="w-4 h-4 text-cyan-500" />
                    <span>Pilihan Program Kelas Renang</span>
                  </h4>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    Terbuka Murid Baru
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ALLOWED_REGISTRATION_CLASSES.map((r) => {
                    const isSelected = roleClass === r;
                    const pkg = pricingPackages.find((p) => p.roleClass === r);
                    return (
                      <div
                        key={r}
                        onClick={() => setRoleClass(r)}
                        className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-cyan-500 bg-cyan-50/80 dark:bg-cyan-950/40 text-cyan-900 dark:text-cyan-200 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs sm:text-sm">{ROLE_LABELS[r].title}</span>
                          {pkg && (
                            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                              Rp {pkg.price.toLocaleString('id-ID')}
                            </span>
                          )}
                        </div>
                        {pkg && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                            {pkg.sessionsCount} Sesi &bull; {pkg.scheduleDescription}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Callout Info Jalur Kenaikan Tingkat (Pemula & Prestasi) */}
                <div className="p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                    <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Kelas Pemula &amp; Kelas Prestasi Khusus Kenaikan Tingkat</span>
                  </div>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                    Pendaftaran murid baru hanya tersedia untuk <strong>Kelas Dasar</strong> dan <strong>Kelas Privat (1-on-1)</strong>. <strong>Kelas Pemula</strong> dan <strong>Kelas Prestasi</strong> hanya dapat diikuti melalui jalur evaluasi &amp; rekomendasi promosi kenaikan tingkat oleh tim pelatih resmi.
                  </p>
                </div>
              </div>

              {/* Data Orang Tua & Kontak */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-cyan-500" />
                  <span>Data Orang Tua / Wali</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Nama Orang Tua / Wali *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Bambang Alamsyah"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Nomor WhatsApp Aktif *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Contoh: 081234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-cyan-600 dark:text-cyan-400">
                  * Privasi Terjamin: Nama wali disembunyikan 'xxx', nomor kontak &amp; tanggal lahir disamarkan di sistem umum (hanya dicetak pada KTA resmi atlet).
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Alamat Domisili
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Jl. Danau Laut No. 42, Kebayoran Baru, Jakarta Selatan"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Riwayat Kesehatan / Catatan Air
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Asma ringan, belum pernah berenang"
                      value={medicalHistory}
                      onChange={(e) => setMedicalHistory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Hari Latihan yang Diminati
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Sabtu & Minggu Pagi"
                      value={preferredSchedule}
                      onChange={(e) => setPreferredSchedule(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-md shadow-cyan-500/20 cursor-pointer transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Formulir Pendaftaran</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
