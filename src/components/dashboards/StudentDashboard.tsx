import React, { useState, useRef, useEffect } from 'react';
import {
  Student,
  AttendanceRecord,
  PaymentRecord,
  PoolSchedule,
  Coach,
  ClassPricingPackage,
  AcademyProfile,
  BankAccountInfo,
} from '../../types';
import { ROLE_LABELS, OFFICIAL_BANK_ACCOUNTS, INITIAL_PRICING_PACKAGES, getEffectiveStudentQuota } from '../../data/mockData';
import { BarcodeCard } from '../BarcodeCard';
import {
  Waves,
  CalendarCheck,
  CreditCard,
  QrCode,
  User,
  Calendar,
  Clock,
  Phone,
  CheckCircle2,
  AlertCircle,
  FileText,
  BadgeCheck,
  UserCheck,
  Shield,
  Sparkles,
  Download,
  Printer,
  ChevronRight,
  TrendingUp,
  MapPin,
  Save,
  Camera,
  Upload,
  Loader2,
  Copy,
  Check,
  AlertTriangle,
  Eye,
  X,
  Receipt,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { compressAndResizeImage } from '../../services/imageUtils';
import { maskPhone, maskParentName, maskBirthDate } from '../../services/privacyUtils';

interface StudentDashboardProps {
  student: Student;
  attendances: AttendanceRecord[];
  payments: PaymentRecord[];
  schedules?: PoolSchedule[];
  coaches?: Coach[];
  pricingPackages?: ClassPricingPackage[];
  academyProfile?: AcademyProfile;
  bankAccounts?: BankAccountInfo[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onUpdateStudent?: (student: Student) => void;
  onUpdateAvatar?: (newAvatarUrl: string) => void;
  onUploadPaymentProof?: (newPayment: PaymentRecord) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  attendances,
  payments,
  schedules = [],
  coaches = [],
  pricingPackages = [],
  academyProfile,
  bankAccounts = [],
  activeTab,
  onTabChange,
  onUpdateStudent,
  onUpdateAvatar,
  onUploadPaymentProof,
}) => {
  if (!student) {
    return (
      <div className="p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mx-auto">
          <User className="w-8 h-8 opacity-70" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-white">
          Belum Ada Siswa Terdaftar (0 Data)
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Semua data telah direset menjadi 0. Hanya akun Admin yang aktif. Admin dapat mendaftarkan murid baru melalui menu Manajemen Profil Peserta.
        </p>
      </div>
    );
  }

  const roleMeta = ROLE_LABELS[student.roleClass] || {
    title: 'Kelas Siswa',
    subtitle: 'Program Renang Tirta Samudra',
    badgeBg: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30',
    textBadge: 'Siswa',
  };

  const assignedCoach = coaches.find((c) => c.id === student.assignedCoachId);
  const classSchedule = schedules.find((s) => s.roleClass === student.roleClass) || schedules[0];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadNotice(null);
      const compressed = await compressAndResizeImage(file, 400, 400, 0.85);

      if (onUpdateStudent) {
        onUpdateStudent({
          ...student,
          avatarUrl: compressed,
        });
      }
      if (onUpdateAvatar) {
        onUpdateAvatar(compressed);
      }
      setUploadNotice('Foto profil siswa berhasil diperbarui!');
      setTimeout(() => setUploadNotice(null), 3500);
    } catch (err: any) {
      console.error('Gagal upload foto siswa:', err);
      alert(err.message || 'Gagal mengunggah foto profil.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Editable profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [phoneInput, setPhoneInput] = useState(student.phone);
  const [parentNameInput, setParentNameInput] = useState(student.parentName);
  const [emergencyInput, setEmergencyInput] = useState(student.emergencyContact);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateStudent) {
      onUpdateStudent({
        ...student,
        phone: phoneInput,
        parentName: parentNameInput,
        emergencyContact: emergencyInput,
      });
      setProfileSaveSuccess(true);
      setIsEditingProfile(false);
      setTimeout(() => setProfileSaveSuccess(false), 3000);
    }
  };

  // Rekening Bank Aktif (hanya rekening dengan status aktif)
  const activeBankAccounts =
    bankAccounts && bankAccounts.length > 0
      ? bankAccounts.filter((b) => b.isActive !== false)
      : OFFICIAL_BANK_ACCOUNTS.filter((b) => b.isActive !== false);

  // Payment proof modal & transfer states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<string>(() => {
    return activeBankAccounts[0]?.bankCode || 'BRI';
  });
  const [senderAccountName, setSenderAccountName] = useState(student.parentName || '');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [transferNotes, setTransferNotes] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);
  const [copiedBankText, setCopiedBankText] = useState<string | null>(null);
  const [viewingProofUrl, setViewingProofUrl] = useState<string | null>(null);

  const proofInputRef = useRef<HTMLInputElement>(null);

  const effectivePackages =
    pricingPackages && pricingPackages.length > 0 ? pricingPackages : INITIAL_PRICING_PACKAGES;
  const studentPackage =
    effectivePackages.find((p) => p.roleClass === student.roleClass) || effectivePackages[0];

  useEffect(() => {
    if (studentPackage && !selectedPackageId) {
      setSelectedPackageId(studentPackage.id);
    }
  }, [studentPackage, selectedPackageId]);

  useEffect(() => {
    if (
      activeBankAccounts.length > 0 &&
      !activeBankAccounts.some((b) => b.bankCode === selectedBank)
    ) {
      setSelectedBank(activeBankAccounts[0].bankCode);
    }
  }, [activeBankAccounts, selectedBank]);

  const activeSelectedPackage =
    effectivePackages.find((p) => p.id === selectedPackageId) || studentPackage;

  // Quota calculation - Selaras dengan kelas renang & absensi
  const totalQuota = getEffectiveStudentQuota(student, effectivePackages);
  const actualAttended = attendances.filter((a) => a.status === 'hadir' || !a.status).length;
  const usedSessions =
    typeof student.manualExecutedSessions === 'number'
      ? Math.max(actualAttended, student.manualExecutedSessions)
      : actualAttended;
  const remainingQuota = Math.max(0, totalQuota - usedSessions);
  const isQuotaDepleted = remainingQuota <= 0;
  const quotaPercent = Math.min(100, Math.round((usedSessions / totalQuota) * 100));

  // Check if there is an unverified pending payment with proof uploaded
  const pendingProofPayment = payments.find(
    (p) => p.status === 'menunggu' && !!p.proofUrl
  );

  const handleCopyAccount = (accNumber: string, bankCode: string) => {
    navigator.clipboard.writeText(accNumber.replace(/[^0-9]/g, ''));
    setCopiedBankText(bankCode);
    setTimeout(() => setCopiedBankText(null), 2500);
  };

  const handleProofFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressAndResizeImage(file, 900, 900, 0.85);
      setProofImage(compressed);
    } catch (err: any) {
      console.error('Error compressing receipt image:', err);
      alert('Gagal memproses file gambar bukti transfer.');
    }
  };

  const handleSubmitPaymentProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofImage) {
      alert('Silakan pilih dan upload foto struk atau screenshot m-banking bukti transfer.');
      return;
    }

    setIsSubmittingPayment(true);

    const todayStr = new Date().toISOString().split('T')[0];
    const randId = Date.now().toString().slice(-6);

    const newPayment: PaymentRecord = {
      id: `pay-trf-${randId}`,
      invoiceNumber: `INV-TRF-${randId}`,
      studentId: student.id,
      studentName: student.name,
      roleClass: student.roleClass,
      packageName: activeSelectedPackage.packageName,
      amount: activeSelectedPackage.price,
      paymentDate: todayStr,
      dueDate: todayStr,
      paymentMethod: 'Transfer Bank',
      status: 'menunggu',
      proofUrl: proofImage,
      transferBankName: selectedBank,
      senderAccountName: senderAccountName.trim() || 'Wali Siswa',
      sessionsToAdd: activeSelectedPackage.sessionsCount || 12,
      notes: transferNotes.trim() || `Bukti transfer perpanjangan kuota dari wali ${student.name}`,
    };

    if (onUploadPaymentProof) {
      onUploadPaymentProof(newPayment);
    }

    setIsSubmittingPayment(false);
    setShowPaymentModal(false);
    setProofImage(null);
    setTransferNotes('');
    setPaymentNotice(
      `Bukti transfer pembayaran ${activeSelectedPackage.packageName} sebesar Rp ${activeSelectedPackage.price.toLocaleString('id-ID')} berhasil dikirim! Menunggu konfirmasi verifikasi admin kolam.`
    );
    setTimeout(() => setPaymentNotice(null), 9000);
  };

  // Recent attendance
  const recentAttendances = [...attendances].sort(
    (a, b) => new Date(`${b.dateStr}T${b.timeStr}`).getTime() - new Date(`${a.dateStr}T${a.timeStr}`).getTime()
  );

  // Recent payments
  const recentPayments = [...payments].sort(
    (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarFileChange}
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
      />

      {/* Upload notice */}
      {uploadNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{uploadNotice}</span>
        </div>
      )}

      {/* Top Banner Info: Siswa & Kelas Sesuai Login dengan Warna Khas Kelas */}
      <div className={`relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r ${roleMeta.bannerGradient} text-white shadow-xl shadow-cyan-900/10`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative group flex-shrink-0">
              {student.avatarUrl ? (
                <img
                  src={student.avatarUrl}
                  alt={student.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/60 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 border-2 border-white/60 shadow-md flex items-center justify-center text-white">
                  <User className="w-8 h-8 sm:w-10 sm:h-10 text-white/90" />
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                title="Ganti Foto Profil Siswa (Upload File)"
                className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
              >
                <Camera className="w-5 h-5 text-white" />
                <span className="text-[9px] font-bold mt-0.5">Ubah</span>
              </button>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-3 py-0.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold backdrop-blur-md">
                  {roleMeta.textBadge}
                </span>
                <span className="text-xs font-mono font-bold bg-black/30 px-2.5 py-0.5 rounded-full border border-white/20">
                  {student.barcode}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {student.name}
              </h1>
              <p className="text-xs sm:text-sm text-white/90 mt-1">
                {roleMeta.title} • {roleMeta.subtitle}
              </p>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold transition-all cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Mengunggah...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3 h-3" />
                    <span>Ganti Foto Profil</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick tab shortcuts */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onTabChange('card')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'card'
                  ? 'bg-white text-slate-900 shadow-lg'
                  : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Kartu Siswa</span>
            </button>
            <button
              onClick={() => onTabChange('attendance')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'attendance'
                  ? 'bg-white text-slate-900 shadow-lg'
                  : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Riwayat Masuk</span>
            </button>
            <button
              onClick={() => onTabChange('payments')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'payments'
                  ? 'bg-white text-slate-900 shadow-lg'
                  : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Riwayat Bayar</span>
            </button>
          </div>
        </div>
      </div>

      {profileSaveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Profil siswa berhasil diperbarui dan tersimpan di sistem.</span>
        </div>
      )}

      {paymentNotice && (
        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-800 dark:text-cyan-200 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-cyan-500 flex-shrink-0" />
          <span>{paymentNotice}</span>
        </div>
      )}

      {/* ======================================================================= */}
      {/* NOTIFIKASI BUKTI TRANSFER SEDANG MENUNGGU VERIFIKASI ADMIN               */}
      {/* ======================================================================= */}
      {pendingProofPayment && (
        <div className="p-5 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 dark:bg-amber-950/20 text-slate-800 dark:text-slate-100 shadow-sm animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Receipt className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-extrabold uppercase tracking-wider">
                    Menunggu Verifikasi Admin
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {pendingProofPayment.invoiceNumber}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                  Bukti Pembayaran Sudah Diterima Sistem
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Paket <strong>{pendingProofPayment.packageName}</strong> (Rp{' '}
                  {pendingProofPayment.amount.toLocaleString('id-ID')}) via{' '}
                  <strong>{pendingProofPayment.transferBankName || 'Transfer Bank'}</strong>. Admin
                  sedang mengecek mutasi transfer, kuota <strong>+{pendingProofPayment.sessionsToAdd || 12} sesi</strong> akan aktif otomatis setelah disetujui.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:self-center">
              {pendingProofPayment.proofUrl && (
                <button
                  type="button"
                  onClick={() => setViewingProofUrl(pendingProofPayment.proofUrl || null)}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>Lihat Bukti Transfer</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* NOTIFIKASI KUOTA HABIS & INFO NOMOR REKENING RESMI UNTUK TRANSFER        */}
      {/* ======================================================================= */}
      {isQuotaDepleted && (
        <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50 dark:from-rose-950/30 dark:via-amber-950/20 dark:to-orange-950/20 border-2 border-rose-500/40 shadow-lg shadow-rose-500/5 animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-rose-500/30">
                <AlertTriangle className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-0.5 rounded-full bg-rose-500 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-xs">
                    Pertemuan Habis (0 Sesi)
                  </span>
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                    Waktunya Membayar Perpanjangan
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1.5">
                  Kuota Latihan {student.name} Telah Habis
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Semua kuota pertemuan renang telah selesai digunakan. Untuk melanjutkan sesi latihan berikutnya bersama pelatih, silakan lakukan transfer pembayaran ke salah satu rekening resmi di bawah ini dan unggah foto bukti transfer.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPaymentModal(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer flex-shrink-0"
            >
              <Upload className="w-4 h-4" />
              <span>Bayar & Upload Bukti Transfer</span>
            </button>
          </div>

          {/* Kartu Daftar Nomor Rekening Resmi Kolam */}
          <div className="mt-6 pt-5 border-t border-rose-200/60 dark:border-rose-900/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                Daftar Rekening Bank Resmi Pembayaran Akademi:
              </span>
              <span className="text-[11px] text-slate-500">Klik untuk salin nomor rekening</span>
            </div>

            <div className={`grid grid-cols-1 ${activeBankAccounts.length > 1 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'max-w-md'} gap-3`}>
              {activeBankAccounts.map((bank) => {
                const isCopied = copiedBankText === bank.bankCode;
                return (
                  <div
                    key={bank.bankCode}
                    className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-cyan-400 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-black tracking-wider text-slate-700 dark:text-slate-300">
                          {bank.bankName}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyAccount(bank.accountNumber, bank.bankCode)}
                          className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                          title="Salin Nomor Rekening"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-600 dark:text-emerald-400">Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="mt-2">
                        <p className="font-mono text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-wide">
                          {bank.accountNumber}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                          a/n {bank.accountHolder}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB 1: DASBOARD                                                         */}
      {/* ======================================================================= */}
      {(activeTab === 'overview' || !activeTab) && (
        <div className="space-y-6">
          {/* Sesi & Kuota Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Sisa Kuota */}
            <div className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border ${
              isQuotaDepleted
                ? 'border-rose-400/80 dark:border-rose-800/80 ring-2 ring-rose-500/20'
                : 'border-slate-200 dark:border-slate-800'
            } shadow-sm flex flex-col justify-between`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Sisa Kuota Pertemuan
                  </span>
                  {isQuotaDepleted ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-black border border-rose-500/20">
                      HABIS
                    </span>
                  ) : remainingQuota <= 2 ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/20">
                      HAMPIR HABIS
                    </span>
                  ) : null}
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className={`text-3xl font-extrabold ${
                    isQuotaDepleted ? 'text-rose-600 dark:text-rose-400' : roleMeta.accentText
                  }`}>
                    {remainingQuota}
                  </span>
                  <span className="text-xs font-bold text-slate-400">/ {totalQuota} Sesi</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${isQuotaDepleted ? 'bg-rose-500' : roleMeta.barColor} h-full rounded-full transition-all`}
                    style={{ width: `${100 - quotaPercent}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-slate-400">
                    {usedSessions} sesi sudah dihadiri
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(true)}
                    className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>+ Perpanjang</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2: Total Hadir Masuk Kolam */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Kehadiran Masuk
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {attendances.length}
                  </span>
                  <span className="text-xs font-bold text-slate-400">Kali Hadir</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-4 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Semua terverifikasi barcode
              </p>
            </div>

            {/* Card 3: Status Pembayaran SPP */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Status Iuran / SPP
                </span>
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Lunas Aktif
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-4">
                Total {payments.length} transaksi tercatat
              </p>
            </div>

            {/* Card 4: Pelatih Pengampu */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Pelatih Pembimbing
                </span>
                <div className="mt-2 flex items-center gap-2.5">
                  <img
                    src={assignedCoach?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt="Coach"
                    className="w-8 h-8 rounded-full object-cover border"
                  />
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {assignedCoach?.name || 'Coach Hendra Gunawan'}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-4">
                {assignedCoach?.specialty || 'Head Coach Renang'}
              </p>
            </div>
          </div>

          {/* Grid: Jadwal Latihan & Kartu Swim Pass Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Jadwal & Log Masuk Terakhir */}
            <div className="lg:col-span-2 space-y-6">
              {/* Jadwal Latihan Sesuai Kelas */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-500" />
                    Jadwal Sesi Latihan ({roleMeta.title})
                  </h3>
                  <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full">
                    Rutin Mingguan
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {classSchedule?.className || roleMeta.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Jalur: {classSchedule?.lane || 'Kolam Renang Tirta Samudra'}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
                        {classSchedule?.day || 'Rabu & Sabtu'}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {classSchedule?.timeRange || '16:00 - 17:30 WIB'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Log Kehadiran Terakhir */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <CalendarCheck className="w-4 h-4 text-emerald-500" />
                      Presensi Kehadiran Terakhir
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Catatan absensi masuk kolam yang discan pelatih
                    </p>
                  </div>
                  <button
                    onClick={() => onTabChange('attendance')}
                    className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {recentAttendances.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Belum ada data riwayat presensi.</p>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {recentAttendances.slice(0, 3).map((item) => (
                      <div key={item.id} className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                              {item.dateStr} • {item.timeStr}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Diverifikasi oleh: {item.coachName} ({item.poolLane})
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                          Hadir (Scan Barcode)
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right 1 Col: Kartu Siswa Ringkas */}
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Kartu Siswa Digital
                </span>
                <p className="text-xs text-slate-500 text-center mb-4">
                  Tunjukkan barcode ini ke pelatih di tepi kolam
                </p>
                <div className="w-full flex justify-center">
                  <BarcodeCard student={student} standalone={true} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB 2: PROFIL SISWA SESUAI KELASNYA                                     */}
      {/* ======================================================================= */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <img
                    src={student.avatarUrl}
                    alt={student.name}
                    className={`w-16 h-16 rounded-2xl object-cover border-2 ${roleMeta.accentBorder} shadow-sm`}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    title="Ganti Foto Profil (Upload File)"
                    className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                  >
                    <Camera className="w-5 h-5 text-white" />
                  </button>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {student.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    NIS / Barcode:{' '}
                    <span className={`font-mono font-bold ${roleMeta.accentText}`}>
                      {student.barcode}
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload Foto Baru</span>
                  </button>
                </div>
              </div>

              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className={`px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:${roleMeta.accentBg} text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all cursor-pointer`}
              >
                {isEditingProfile ? 'Batal Edit' : 'Edit Kontak Profil'}
              </button>
            </div>

            {/* Profile Edit Form or Display */}
            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="mt-6 space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Nomor WhatsApp / HP Siswa:
                  </label>
                  <input
                    type="text"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Nama Orang Tua / Wali:
                  </label>
                  <input
                    type="text"
                    value={parentNameInput}
                    onChange={(e) => setParentNameInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Kontak Darurat:
                  </label>
                  <input
                    type="text"
                    value={emergencyInput}
                    onChange={(e) => setEmergencyInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-xl bg-gradient-to-r ${roleMeta.btnGradient} text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2`}
                >
                  <Save className="w-4 h-4" />
                  Simpan Perubahan
                </button>
              </form>
            ) : (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Kelas Renang
                  </span>
                  <p className="text-sm font-extrabold text-cyan-600 dark:text-cyan-400 mt-1">
                    {roleMeta.title}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{roleMeta.subtitle}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Usia & Jenis Kelamin
                  </span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {student.age} Tahun • {maskBirthDate(student.birthDate)} • {student.gender}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Bergabung sejak {student.joinedDate}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Status Siswa
                  </span>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Aktif Terdaftar
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Kuota {remainingQuota} / {totalQuota} pertemuan
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Orang Tua / Wali
                  </span>
                  <p className="text-sm font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
                    {maskParentName(student.parentName)}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Kontak: {maskPhone(student.phone)}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Kontak Darurat
                  </span>
                  <p className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-1">
                    {maskPhone(student.emergencyContact)}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Hubungi bila ada kendala</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Pelatih Pengampu
                  </span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {assignedCoach?.name || 'Coach Hendra Gunawan'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Telp: {assignedCoach?.phone || '0812-3456-7890'}
                  </p>
                </div>
              </div>
            )}

            {/* Catatan Instruktur */}
            <div className={`mt-6 p-4 rounded-2xl ${roleMeta.accentBg} ${roleMeta.accentBorder} border`}>
              <span className={`text-xs font-bold ${roleMeta.accentText} block mb-1`}>
                Catatan Instruktur / Pelatih:
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                "{student.notes || 'Siswa menunjukkan antusiasme yang baik dalam setiap sesi renang.'}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB 3: RIWAYAT MASUK (LOG PRESENSI KEHADIRAN)                           */}
      {/* ======================================================================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-emerald-500" />
                  Riwayat Masuk Kolam Renang
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Semua rekaman presensi kehadiran {student.name} yang diverifikasi dengan scanner barcode
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  Total {attendances.length} Sesi Hadir
                </span>
              </div>
            </div>

            {attendances.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <CalendarCheck className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-bold">Belum ada riwayat masuk kolam.</p>
                <p className="text-xs mt-1">
                  Saat pelatih menscan barcode kartu renang Anda, log presensi akan langsung muncul di sini.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4 font-bold">Tanggal Masuk</th>
                      <th className="py-3 px-4 font-bold">Jam Masuk</th>
                      <th className="py-3 px-4 font-bold">Jalur Kolam</th>
                      <th className="py-3 px-4 font-bold">Pelatih Bertugas</th>
                      <th className="py-3 px-4 font-bold">Verifikasi Barcode</th>
                      <th className="py-3 px-4 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                    {recentAttendances.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-bold">{rec.dateStr}</td>
                        <td className="py-3.5 px-4 font-mono text-cyan-600 dark:text-cyan-400">
                          {rec.timeStr}
                        </td>
                        <td className="py-3.5 px-4">{rec.poolLane}</td>
                        <td className="py-3.5 px-4 font-semibold">{rec.coachName}</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Barcode Valid
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px]">
                            Hadir
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB 4: RIWAYAT BAYAR (SPP & TAGIHAN SISWA)                              */}
      {/* ======================================================================= */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className={`w-5 h-5 ${roleMeta.accentText}`} />
                  Riwayat Pembayaran & SPP
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Rekap transaksi pembayaran iuran paket renang untuk {student.name}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className={`px-3 py-1 rounded-full ${roleMeta.badgeBg} text-xs font-bold`}>
                  {payments.length} Tagihan Tercatat
                </span>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-extrabold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Bayar / Upload Bukti Transfer</span>
                </button>
              </div>
            </div>

            {/* Notifikasi Jika Pertemuan Telah Selesai */}
            {isQuotaDepleted && (
              <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-500/15 via-amber-500/15 to-orange-500/15 border-2 border-rose-500/40 text-slate-900 dark:text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-rose-600 dark:text-rose-400">
                        Pemberitahuan: Sesi Pertemuan Latihan Telah Selesai!
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                        Kuota Habis
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {student.name} telah menyelesaikan total <strong>{usedSessions} kali masuk latihan</strong> (seluruh {totalQuota} pertemuan telah digunakan). Silakan lakukan transfer perpanjangan kuota paket renang.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPaymentModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Perpanjang / Transfer Sekarang</span>
                </button>
              </div>
            )}

            {payments.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-bold">Belum ada riwayat tagihan atau pembayaran.</p>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(true)}
                  className="mt-3 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Kirim Bukti Pembayaran Pertama</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4 font-bold">No. Invoice</th>
                      <th className="py-3 px-4 font-bold">Nama Paket Renang</th>
                      <th className="py-3 px-4 font-bold">Total Masuk Latihan & Status Sesi</th>
                      <th className="py-3 px-4 font-bold">Nominal</th>
                      <th className="py-3 px-4 font-bold">Tanggal Bayar</th>
                      <th className="py-3 px-4 font-bold">Metode / Bank</th>
                      <th className="py-3 px-4 font-bold">Bukti Transfer</th>
                      <th className="py-3 px-4 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                    {recentPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className={`py-3.5 px-4 font-mono font-bold ${roleMeta.accentText}`}>
                          {p.invoiceNumber}
                        </td>
                        <td className="py-3.5 px-4 font-semibold">
                          <div>
                            <span>{p.packageName}</span>
                            {p.sessionsToAdd && (
                              <span className="block text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">
                                +{p.sessionsToAdd} Sesi Latihan
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Total Masuk Latihan & Status Sesi */}
                        <td className="py-3.5 px-4">
                          {p.status === 'lunas' ? (
                            <div className="space-y-1.5 min-w-[170px]">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
                                  <CalendarCheck className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>Sudah Masuk: {usedSessions}x Latihan</span>
                                </span>
                                <span className="font-mono text-[10px] text-slate-500 font-bold">
                                  {usedSessions} / {totalQuota}
                                </span>
                              </div>

                              {/* Progress bar */}
                              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    isQuotaDepleted
                                      ? 'bg-rose-500'
                                      : 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                                  }`}
                                  style={{ width: `${quotaPercent}%` }}
                                />
                              </div>

                              {isQuotaDepleted ? (
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-[10px] border border-rose-500/30">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>Pertemuan Selesai (Habis)</span>
                                </div>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>{remainingQuota} Sesi Tersisa</span>
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="text-[10px] text-amber-600 font-bold bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 w-fit">
                              Menunggu Bayar (+{p.sessionsToAdd || 12} Sesi Baru)
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-bold">
                          Rp {p.amount.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3.5 px-4">{p.paymentDate || '-'}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-[10px] block w-fit">
                            {p.transferBankName ? `Transfer ${p.transferBankName}` : p.paymentMethod}
                          </span>
                          {p.senderAccountName && (
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              a/n {p.senderAccountName}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {p.proofUrl ? (
                            <button
                              type="button"
                              onClick={() => setViewingProofUrl(p.proofUrl || null)}
                              className="px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <Eye className="w-3 h-3 text-cyan-500" />
                              <span>Lihat Bukti</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[10px] italic">Kasir Langsung</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {p.status === 'lunas' ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] border border-emerald-500/20 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Lunas
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] border border-amber-500/20 inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              Menunggu Verifikasi
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB 5: KARTU SISWA SESUAI KELAS LOGIN NYA                               */}
      {/* ======================================================================= */}
      {activeTab === 'card' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center">
            <div className="text-center max-w-lg mb-6">
              <span className={`px-3 py-1 rounded-full ${roleMeta.badgeBg} text-xs font-bold`}>
                KARTU SISWA RESMI
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                Kartu Siswa ({roleMeta.title})
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Kartu identitas resmi dengan barcode presensi siswa {student.name}. Simpan di ponsel atau cetak kartu dalam gambar (PNG/JPG).
              </p>
            </div>

            <div className="max-w-md w-full">
              <BarcodeCard student={student} standalone={true} />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* MODAL: UPLOAD BUKTI TRANSFER PEMBAYARAN OLEH WALI ATLET                */}
      {/* ======================================================================= */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Upload Bukti Transfer Pembayaran
                  </h3>
                  <p className="text-xs text-slate-500">
                    Perpanjangan Kuota Sesi Latihan • {student.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPaymentProof} className="mt-5 space-y-5">
              {/* 1. Pilih Paket Renang */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  1. Pilih Paket Renang / Jumlah Pertemuan:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {effectivePackages.map((pkg) => {
                    const isSelected = pkg.id === selectedPackageId;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPackageId(pkg.id)}
                        className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-cyan-500 bg-cyan-50/60 dark:bg-cyan-950/30'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                              {pkg.packageName}
                            </p>
                            <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400">
                              {pkg.sessionsCount} Sesi Pertemuan
                            </span>
                          </div>
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            Rp {pkg.price.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Rekening Tujuan Transfer */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  2. Pilih Rekening Bank Tujuan Transfer:
                </label>
                <div className={`grid grid-cols-1 ${activeBankAccounts.length > 1 ? 'sm:grid-cols-2 md:grid-cols-4' : ''} gap-2`}>
                  {activeBankAccounts.map((bank) => {
                    const isSelected = selectedBank === bank.bankCode;
                    return (
                      <div
                        key={bank.bankCode}
                        onClick={() => setSelectedBank(bank.bankCode)}
                        className={`p-3 rounded-xl border cursor-pointer text-center transition-all ${
                          isSelected
                            ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 font-extrabold ring-2 ring-cyan-500/20'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <p className="text-xs font-bold">{bank.bankName}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Detail bank terpilih */}
                {(() => {
                  const currentBank =
                    activeBankAccounts.find((b) => b.bankCode === selectedBank) ||
                    activeBankAccounts[0] ||
                    OFFICIAL_BANK_ACCOUNTS[0];
                  const isCopied = copiedBankText === currentBank.bankCode;
                  return (
                    <div className="mt-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Nomor Rekening Tujuan:
                        </span>
                        <p className="font-mono text-base font-extrabold text-slate-900 dark:text-white">
                          {currentBank.accountNumber}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Bank {currentBank.bankName} • a/n {currentBank.accountHolder}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyAccount(currentBank.accountNumber, currentBank.bankCode)
                        }
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-600">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin No. Rek</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })()}
              </div>

              {/* 3. Atas Nama Pengirim */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  3. Nama Pengirim / Pemilik Rekening Transfer:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bpk. Bambang Sutrisno / Rekening Ibu"
                  value={senderAccountName}
                  onChange={(e) => setSenderAccountName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Nama yang tertera pada mutasi bank pengirim agar admin mudah mencocokkan.
                </span>
              </div>

              {/* 4. Upload Foto Struk Bukti Transfer */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  4. Foto Bukti Transfer (Screenshot m-Banking / Struk ATM):
                </label>
                <input
                  type="file"
                  ref={proofInputRef}
                  onChange={handleProofFileChange}
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                />

                {proofImage ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-slate-950 max-h-64 flex items-center justify-center">
                    <img
                      src={proofImage}
                      alt="Pratinjau Bukti Transfer"
                      className="max-h-60 object-contain"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => proofInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-lg bg-black/70 hover:bg-black text-white text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Upload className="w-3 h-3" /> Ganti
                      </button>
                      <button
                        type="button"
                        onClick={() => setProofImage(null)}
                        className="p-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-all cursor-pointer"
                        title="Hapus"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Siap Dikirim
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => proofInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-400 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-800/40"
                  >
                    <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Klik di sini untuk memilih foto bukti transfer
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Format PNG, JPG, JPEG atau WebP (Otomatis dikompres & dioptimasi)
                    </p>
                  </div>
                )}
              </div>

              {/* 5. Catatan Tambahan (Opsional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  5. Catatan Tambahan (Opsional):
                </label>
                <input
                  type="text"
                  placeholder="Misal: Perpanjangan untuk bulan depan / info transfer"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayment || !proofImage}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-extrabold shadow-lg shadow-cyan-600/25 flex items-center gap-2 transition-all cursor-pointer"
                >
                  {isSubmittingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mengirim Bukti...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Kirim Bukti Pembayaran ke Admin</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* MODAL: PRATINJAU BUKTI TRANSFER (FULL IMAGE)                            */}
      {/* ======================================================================= */}
      {viewingProofUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative bg-slate-900 rounded-3xl max-w-xl w-full p-4 overflow-hidden border border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 px-2">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-cyan-400" />
                Foto Struk / Bukti Transfer
              </span>
              <button
                type="button"
                onClick={() => setViewingProofUrl(null)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-center max-h-[70vh] overflow-auto rounded-xl bg-black">
              <img
                src={viewingProofUrl}
                alt="Bukti Transfer"
                className="max-h-[68vh] object-contain rounded-lg"
              />
            </div>
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => setViewingProofUrl(null)}
                className="px-5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

