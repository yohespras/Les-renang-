import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Student,
  AttendanceRecord,
  ClassPricingPackage,
  SessionCompletionNotification,
  NotificationAttendanceDateItem,
  BankAccountInfo,
  AcademyProfile,
} from '../types';
import {
  ROLE_LABELS,
  INITIAL_PRICING_PACKAGES,
  OFFICIAL_BANK_ACCOUNTS,
  DEFAULT_NOTIFICATION_TITLE,
  DEFAULT_NOTIFICATION_TEMPLATE,
  getEffectiveStudentQuota,
  getLiveAcademyProfile,
} from '../data/mockData';
import {
  Bell,
  Send,
  Calendar,
  CalendarCheck,
  Clock,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Search,
  Trash2,
  Copy,
  Check,
  X,
  Users,
  Sparkles,
  ExternalLink,
  History,
  MessageSquare,
  Building2,
  Filter,
  Settings,
  RotateCcw,
  Save,
  Eye,
} from 'lucide-react';

interface SessionNotificationManagerProps {
  students: Student[];
  attendances: AttendanceRecord[];
  pricingPackages?: ClassPricingPackage[];
  notifications: SessionCompletionNotification[];
  bankAccounts?: BankAccountInfo[];
  academyProfile?: AcademyProfile;
  onUpdateAcademyProfile?: (profile: AcademyProfile) => void;
  senderName: string;
  senderRole: 'admin' | 'pelatih';
  onSendNotification: (notif: SessionCompletionNotification) => void;
  onDeleteNotification: (id: string) => void;
  preselectedStudentId?: string | null;
  onClearPreselected?: () => void;
}

const TEMPLATE_VARIABLES: Array<{ key: string; label: string; desc: string }> = [
  { key: '{nama_wali}', label: 'Nama Wali', desc: 'Nama Orang Tua / Wali siswa' },
  { key: '{nama_siswa}', label: 'Nama Siswa', desc: 'Nama lengkap peserta' },
  { key: '{barcode}', label: 'NIS / Barcode', desc: 'Kode barcode kartu siswa' },
  { key: '{kelas}', label: 'Kelas', desc: 'Nama kelas renang peserta' },
  { key: '{nama_akademi}', label: 'Nama Akademi', desc: 'Nama akademi aktif' },
  { key: '{terlaksana}', label: 'Sesi Hadir', desc: 'Jumlah pertemuan selesai' },
  { key: '{total_kuota}', label: 'Total Kuota', desc: 'Total kuota paket' },
  { key: '{daftar_tanggal}', label: 'Tanggal Absen', desc: 'Daftar tanggal & jam hadir' },
  { key: '{paket_berikutnya}', label: 'Paket Lanjut', desc: 'Nama paket tagihan berikutnya' },
  { key: '{jumlah_sesi}', label: 'Jml Sesi Baru', desc: 'Jumlah sesi paket baru' },
  { key: '{nominal}', label: 'Nominal Rp', desc: 'Nominal tagihan terformat' },
  { key: '{jatuh_tempo}', label: 'Tgl Jatuh Tempo', desc: 'Jadwal waktunya bayar kembali' },
  { key: '{daftar_rekening}', label: 'Rekening Resmi', desc: 'Daftar rekening aktif akademi' },
];

const formatIndoDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(`${dateStr}T00:00:00`);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const formatWhatsAppPhone = (raw?: string): string | null => {
  if (!raw) return null;
  const digits = raw.replace(/[^0-9]/g, '');
  if (!digits) return null;
  if (digits.startsWith('0')) return `62${digits.slice(1)}`;
  if (digits.startsWith('62')) return digits;
  return `62${digits}`;
};

export const SessionNotificationManager: React.FC<SessionNotificationManagerProps> = ({
  students = [],
  attendances = [],
  pricingPackages = [],
  notifications = [],
  bankAccounts = [],
  academyProfile,
  onUpdateAcademyProfile,
  senderName,
  senderRole,
  onSendNotification,
  onDeleteNotification,
  preselectedStudentId,
  onClearPreselected,
}) => {
  const effectivePackages =
    pricingPackages && pricingPackages.length > 0 ? pricingPackages : INITIAL_PRICING_PACKAGES;
  const activeBanks =
    bankAccounts && bankAccounts.length > 0
      ? bankAccounts.filter((b) => b.isActive !== false)
      : OFFICIAL_BANK_ACCOUNTS.filter((b) => b.isActive !== false);
  const liveProfile = getLiveAcademyProfile(academyProfile);

  const activeTemplateTitle =
    (liveProfile.notificationTitle || '').trim() || DEFAULT_NOTIFICATION_TITLE;
  const activeTemplateBody =
    (liveProfile.notificationTemplate || '').trim() || DEFAULT_NOTIFICATION_TEMPLATE;
  const activeDefaultDueDays =
    typeof liveProfile.notificationDueDays === 'number' && liveProfile.notificationDueDays >= 0
      ? liveProfile.notificationDueDays
      : 3;

  const getDefaultDueDateStr = (daysOffset = activeDefaultDueDays) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
  };

  const [subTab, setSubTab] = useState<'students' | 'history' | 'settings'>('students');
  const [statusFilter, setStatusFilter] = useState<'finished' | 'almost' | 'all'>('finished');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Template Settings Editor State
  const templateTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [templateTitleInput, setTemplateTitleInput] = useState<string>(activeTemplateTitle);
  const [templateBodyInput, setTemplateBodyInput] = useState<string>(activeTemplateBody);
  const [dueDaysInput, setDueDaysInput] = useState<number>(activeDefaultDueDays);

  useEffect(() => {
    setTemplateTitleInput((liveProfile.notificationTitle || '').trim() || DEFAULT_NOTIFICATION_TITLE);
    setTemplateBodyInput((liveProfile.notificationTemplate || '').trim() || DEFAULT_NOTIFICATION_TEMPLATE);
    setDueDaysInput(
      typeof liveProfile.notificationDueDays === 'number' && liveProfile.notificationDueDays >= 0
        ? liveProfile.notificationDueDays
        : 3
    );
  }, [liveProfile.notificationTitle, liveProfile.notificationTemplate, liveProfile.notificationDueDays]);

  // Compose Notification Modal State
  const [composeStudent, setComposeStudent] = useState<Student | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [nextPackageName, setNextPackageName] = useState<string>('');
  const [nextSessionsCount, setNextSessionsCount] = useState<number>(8);
  const [amountDue, setAmountDue] = useState<number>(0);
  const [dueDate, setDueDate] = useState<string>(() => getDefaultDueDateStr(3));
  const [customTitle, setCustomTitle] = useState<string>(activeTemplateTitle);
  const [customMessage, setCustomMessage] = useState<string>('');

  const showFeedback = (msg: string) => {
    setFeedbackBanner(msg);
    setTimeout(() => setFeedbackBanner(null), 5000);
  };

  // Isolate strictly per student attendance records with status 'hadir'
  const getStudentAttendanceItems = (st: Student): NotificationAttendanceDateItem[] => {
    const logs = attendances.filter((a) => {
      const isPresent = a.status === 'hadir' || !a.status;
      if (!isPresent) return false;
      if (a.studentId) return a.studentId === st.id;
      if (a.studentBarcode && st.barcode) {
        return (
          a.studentBarcode.trim().toUpperCase() === st.barcode.trim().toUpperCase() &&
          a.studentName?.trim().toLowerCase() === st.name?.trim().toLowerCase()
        );
      }
      return !!a.studentName && a.studentName.trim().toLowerCase() === st.name?.trim().toLowerCase();
    });

    return [...logs]
      .sort((a, b) => `${a.dateStr} ${a.timeStr}`.localeCompare(`${b.dateStr} ${b.timeStr}`))
      .map((a) => ({
        dateStr: a.dateStr,
        timeStr: a.timeStr,
        poolLane: a.poolLane,
        coachName: a.coachName,
        status: a.status || 'hadir',
      }));
  };

  const getStudentQuotaStats = (st: Student) => {
    const dateItems = getStudentAttendanceItems(st);
    const totalQuota = getEffectiveStudentQuota(st, effectivePackages);
    const executedSessions =
      typeof st.manualExecutedSessions === 'number'
        ? Math.max(dateItems.length, st.manualExecutedSessions)
        : dateItems.length;
    const remainingQuota = Math.max(0, totalQuota - executedSessions);
    return {
      dateItems,
      totalQuota,
      executedSessions,
      remainingQuota,
    };
  };

  const buildDefaultMessage = (
    st: Student,
    dates: NotificationAttendanceDateItem[],
    pkgName: string,
    sessionsCount: number,
    price: number,
    payDueDate: string,
    executedCount: number,
    totalCount: number,
    templateOverride?: string
  ) => {
    const datesText =
      dates.length > 0
        ? dates
            .map(
              (d, idx) =>
                `  ${idx + 1}. ${formatIndoDate(d.dateStr)} (${d.timeStr}${d.poolLane ? ` • ${d.poolLane}` : ''})`
            )
            .join('\n')
        : `  (${executedCount} pertemuan tercatat pada sistem)`;

    const bankText =
      activeBanks.length > 0
        ? activeBanks
            .map((b) => `- ${b.bankName}: ${b.accountNumber} (a/n ${b.accountHolder})`)
            .join('\n')
        : '- Hubungi admin untuk nomor rekening resmi';

    const classLabel = ROLE_LABELS[st.roleClass]?.title || st.roleClass;
    const rawTemplate =
      (templateOverride !== undefined ? templateOverride : activeTemplateBody) ||
      DEFAULT_NOTIFICATION_TEMPLATE;

    const replacements: Record<string, string> = {
      '{nama_wali}': st.parentName || st.name,
      '{nama_siswa}': st.name,
      '{barcode}': st.barcode || st.id,
      '{kelas}': classLabel,
      '{nama_akademi}': liveProfile.effectiveName,
      '{terlaksana}': String(executedCount),
      '{total_kuota}': String(totalCount),
      '{daftar_tanggal}': datesText,
      '{paket_berikutnya}': pkgName,
      '{jumlah_sesi}': String(sessionsCount),
      '{nominal}': `Rp ${price.toLocaleString('id-ID')}`,
      '{jatuh_tempo}': formatIndoDate(payDueDate),
      '{daftar_rekening}': bankText,
    };

    let result = rawTemplate;
    Object.entries(replacements).forEach(([token, val]) => {
      result = result.split(token).join(val);
    });
    return result;
  };

  const openComposeModal = (st: Student) => {
    const stats = getStudentQuotaStats(st);
    const defaultPkg =
      effectivePackages.find((p) => p.roleClass === st.roleClass) || effectivePackages[0];
    const defaultDueStr = getDefaultDueDateStr(activeDefaultDueDays);

    const pkgId = defaultPkg?.id || '';
    const pkgName = defaultPkg?.packageName || `Paket ${ROLE_LABELS[st.roleClass]?.title || st.roleClass}`;
    const pkgSessions = defaultPkg?.sessionsCount || stats.totalQuota || 8;
    const pkgPrice = defaultPkg?.price || 0;

    setComposeStudent(st);
    setSelectedPackageId(pkgId);
    setNextPackageName(pkgName);
    setNextSessionsCount(pkgSessions);
    setAmountDue(pkgPrice);
    setDueDate(defaultDueStr);
    setCustomTitle(activeTemplateTitle);
    setCustomMessage(
      buildDefaultMessage(
        st,
        stats.dateItems,
        pkgName,
        pkgSessions,
        pkgPrice,
        defaultDueStr,
        stats.executedSessions,
        stats.totalQuota
      )
    );
  };

  useEffect(() => {
    if (preselectedStudentId) {
      const target = students.find((s) => s.id === preselectedStudentId);
      if (target) {
        openComposeModal(target);
      }
      if (onClearPreselected) onClearPreselected();
    }
  }, [preselectedStudentId]);

  const handlePackageSelectChange = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    const pkg = effectivePackages.find((p) => p.id === pkgId);
    if (pkg && composeStudent) {
      const stats = getStudentQuotaStats(composeStudent);
      setNextPackageName(pkg.packageName);
      setNextSessionsCount(pkg.sessionsCount);
      setAmountDue(pkg.price);
      setCustomMessage(
        buildDefaultMessage(
          composeStudent,
          stats.dateItems,
          pkg.packageName,
          pkg.sessionsCount,
          pkg.price,
          dueDate,
          stats.executedSessions,
          stats.totalQuota
        )
      );
    }
  };

  const handleRegenerateMessage = (
    overridePkgName = nextPackageName,
    overrideSessions = nextSessionsCount,
    overridePrice = amountDue,
    overrideDue = dueDate
  ) => {
    if (!composeStudent) return;
    const stats = getStudentQuotaStats(composeStudent);
    setCustomMessage(
      buildDefaultMessage(
        composeStudent,
        stats.dateItems,
        overridePkgName,
        overrideSessions,
        overridePrice,
        overrideDue,
        stats.executedSessions,
        stats.totalQuota
      )
    );
  };

  const handleSubmitNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeStudent) return;

    const stats = getStudentQuotaStats(composeStudent);
    const newNotif: SessionCompletionNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      studentId: composeStudent.id,
      studentName: composeStudent.name,
      studentBarcode: composeStudent.barcode,
      roleClass: composeStudent.roleClass,
      parentName: composeStudent.parentName,
      phone: composeStudent.phone,
      totalQuota: stats.totalQuota,
      executedSessions: stats.executedSessions,
      remainingQuota: stats.remainingQuota,
      attendanceDates: stats.dateItems,
      nextPackageName: nextPackageName.trim() || 'Perpanjangan Paket Latihan',
      nextSessionsCount: Math.max(1, Number(nextSessionsCount) || 8),
      amountDue: Math.max(0, Number(amountDue) || 0),
      dueDate,
      title: customTitle.trim() || activeTemplateTitle,
      message: customMessage.trim(),
      senderName,
      senderRole,
      sentAt: new Date().toISOString(),
      status: 'unread',
    };

    onSendNotification(newNotif);
    setComposeStudent(null);
    showFeedback(
      `Pemberitahuan selesai absen & tagihan pertemuan berikutnya untuk "${composeStudent.name}" berhasil dikirim!`
    );
  };

  const handleInsertVariable = (token: string) => {
    const textarea = templateTextareaRef.current;
    if (!textarea) {
      setTemplateBodyInput((prev) => `${prev}${prev.endsWith('\n') || !prev ? '' : ' '}${token}`);
      return;
    }
    const start = textarea.selectionStart ?? templateBodyInput.length;
    const end = textarea.selectionEnd ?? templateBodyInput.length;
    const nextVal =
      templateBodyInput.slice(0, start) + token + templateBodyInput.slice(end);
    setTemplateBodyInput(nextVal);
    setTimeout(() => {
      textarea.focus();
      const cursor = start + token.length;
      textarea.setSelectionRange(cursor, cursor);
    }, 0);
  };

  const handleSaveTemplateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedTitle = templateTitleInput.trim() || DEFAULT_NOTIFICATION_TITLE;
    const cleanedBody = templateBodyInput.trim() || DEFAULT_NOTIFICATION_TEMPLATE;
    const cleanedDueDays = Math.max(0, Math.min(60, Number(dueDaysInput) || 0));

    if (onUpdateAcademyProfile) {
      onUpdateAcademyProfile({
        ...liveProfile,
        notificationTitle: cleanedTitle,
        notificationTemplate: cleanedBody,
        notificationDueDays: cleanedDueDays,
      });
      showFeedback(
        'Pengaturan template pemberitahuan berhasil disimpan & disinkronkan ke semua perangkat!'
      );
    } else {
      try {
        const nextProfile = {
          ...liveProfile,
          notificationTitle: cleanedTitle,
          notificationTemplate: cleanedBody,
          notificationDueDays: cleanedDueDays,
        };
        localStorage.setItem('AQUA_ACADEMY_PROFILE', JSON.stringify(nextProfile));
        showFeedback('Pengaturan template pemberitahuan tersimpan secara lokal.');
      } catch (err) {}
    }
  };

  const handleResetTemplateSettings = () => {
    setTemplateTitleInput(DEFAULT_NOTIFICATION_TITLE);
    setTemplateBodyInput(DEFAULT_NOTIFICATION_TEMPLATE);
    setDueDaysInput(3);
    if (onUpdateAcademyProfile) {
      onUpdateAcademyProfile({
        ...liveProfile,
        notificationTitle: DEFAULT_NOTIFICATION_TITLE,
        notificationTemplate: DEFAULT_NOTIFICATION_TEMPLATE,
        notificationDueDays: 3,
      });
    }
    showFeedback('Template pemberitahuan dikembalikan ke pengaturan standar.');
  };

  const finishedStudents = useMemo(
    () => students.filter((s) => getStudentQuotaStats(s).remainingQuota <= 0),
    [students, attendances, pricingPackages]
  );

  const almostFinishedStudents = useMemo(
    () =>
      students.filter((s) => {
        const rem = getStudentQuotaStats(s).remainingQuota;
        return rem > 0 && rem <= 2;
      }),
    [students, attendances, pricingPackages]
  );

  const handleBulkSendFinished = () => {
    if (finishedStudents.length === 0) {
      showFeedback('Saat ini tidak ada peserta yang kuota pertemuannya habis.');
      return;
    }

    const dueStr = getDefaultDueDateStr(activeDefaultDueDays);

    let sentCount = 0;
    finishedStudents.forEach((st, idx) => {
      const stats = getStudentQuotaStats(st);
      const pkg =
        effectivePackages.find((p) => p.roleClass === st.roleClass) || effectivePackages[0];
      const pkgName = pkg?.packageName || `Paket ${ROLE_LABELS[st.roleClass]?.title || st.roleClass}`;
      const pkgSessions = pkg?.sessionsCount || stats.totalQuota || 8;
      const pkgPrice = pkg?.price || 0;

      const notif: SessionCompletionNotification = {
        id: `notif-bulk-${Date.now()}-${idx}-${st.id.slice(-4)}`,
        studentId: st.id,
        studentName: st.name,
        studentBarcode: st.barcode,
        roleClass: st.roleClass,
        parentName: st.parentName,
        phone: st.phone,
        totalQuota: stats.totalQuota,
        executedSessions: stats.executedSessions,
        remainingQuota: stats.remainingQuota,
        attendanceDates: stats.dateItems,
        nextPackageName: pkgName,
        nextSessionsCount: pkgSessions,
        amountDue: pkgPrice,
        dueDate: dueStr,
        title: activeTemplateTitle,
        message: buildDefaultMessage(
          st,
          stats.dateItems,
          pkgName,
          pkgSessions,
          pkgPrice,
          dueStr,
          stats.executedSessions,
          stats.totalQuota
        ),
        senderName,
        senderRole,
        sentAt: new Date(Date.now() + idx).toISOString(),
        status: 'unread',
      };

      onSendNotification(notif);
      sentCount += 1;
    });

    showFeedback(
      `Berhasil mengirim pemberitahuan absen selesai & tagihan ke ${sentCount} peserta yang kuotanya habis!`
    );
  };

  const filteredStudents = students.filter((st) => {
    const matchSearch =
      st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (st.barcode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (st.parentName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchClass = classFilter === 'all' || st.roleClass === classFilter;
    const rem = getStudentQuotaStats(st).remainingQuota;
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'finished' && rem <= 0) ||
      (statusFilter === 'almost' && rem > 0 && rem <= 2);
    return matchSearch && matchClass && matchStatus;
  });

  const handleCopyText = (text: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/20">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                Pemberitahuan Absen Selesai &amp; Pembayaran Berikutnya
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-[10px] font-black">
                {finishedStudents.length} Kuota Habis
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Kirim pemberitahuan ke akun peserta &amp; WhatsApp orang tua lengkap dengan{' '}
              <strong>tanggal-tanggal kehadiran</strong> serta{' '}
              <strong>jadwal waktunya membayar kembali</strong> untuk pertemuan berikutnya.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setSubTab('settings')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${
              subTab === 'settings'
                ? 'bg-cyan-600 text-white border-cyan-600 shadow-md shadow-cyan-600/20'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Pengaturan Template</span>
          </button>

          <button
            type="button"
            onClick={handleBulkSendFinished}
            disabled={finishedStudents.length === 0}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 disabled:opacity-40 text-white text-xs font-extrabold shadow-lg shadow-rose-600/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Kirim Massal ({finishedStudents.length} Selesai)</span>
          </button>
        </div>
      </div>

      {/* Inline Feedback Banner */}
      {feedbackBanner && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{feedbackBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackBanner(null)}
            className="p-1 rounded-lg hover:bg-emerald-500/20 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setSubTab('students')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              subTab === 'students'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Daftar Peserta &amp; Tgl Hadir ({students.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              subTab === 'history'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Riwayat Terkirim ({notifications.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              subTab === 'settings'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Pengaturan Template</span>
          </button>
        </div>

        {subTab === 'students' && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('finished')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                statusFilter === 'finished'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Kuota Habis ({finishedStudents.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('almost')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                statusFilter === 'almost'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Hampir Habis ≤2 ({almostFinishedStudents.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Semua Peserta ({students.length})
            </button>
          </div>
        )}
      </div>

      {/* VIEW 1: STUDENT LIST WITH DATES */}
      {subTab === 'students' && (
        <div className="space-y-4">
          {/* Search & Class Filter */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama peserta, barcode, atau nama wali..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                <option value="all">Semua Kelas</option>
                <option value="dasar">Kelas Dasar</option>
                <option value="pemula">Kelas Pemula</option>
                <option value="prestasi">Kelas Prestasi</option>
                <option value="privat_4">Privat 4 Sesi</option>
                <option value="privat_8">Privat 8 Sesi</option>
                <option value="privat_12">Privat 12 Sesi</option>
              </select>
            </div>
          </div>

          {/* Student Cards Grid */}
          {filteredStudents.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-10 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 opacity-80" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Tidak ada peserta pada kategori filter ini
              </h3>
              <p className="text-xs text-slate-400">
                Ubah filter ke "Semua Peserta" jika ingin mengirim pemberitahuan ke siswa yang masih memiliki sisa kuota.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredStudents.map((st) => {
                const stats = getStudentQuotaStats(st);
                const isFinished = stats.remainingQuota <= 0;
                const roleMeta = ROLE_LABELS[st.roleClass];
                const lastNotif = notifications.find((n) => n.studentId === st.id);

                return (
                  <div
                    key={st.id}
                    className={`bg-white dark:bg-slate-900 rounded-3xl border-2 p-5 shadow-sm flex flex-col justify-between gap-4 transition-all ${
                      isFinished
                        ? 'border-rose-500/40 bg-rose-50/20 dark:bg-rose-950/10'
                        : stats.remainingQuota <= 2
                        ? 'border-amber-500/40'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Header Student Info */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={st.avatarUrl}
                            alt={st.name}
                            className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                                {st.name}
                              </h4>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  roleMeta?.badgeBg || 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {roleMeta?.textBadge || st.roleClass}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                              {st.barcode} • Wali: {st.parentName || '-'} ({st.phone || '-'})
                            </p>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-black shrink-0 ${
                            isFinished
                              ? 'bg-rose-500 text-white'
                              : stats.remainingQuota <= 2
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {isFinished
                            ? `Selesai (${stats.executedSessions}/${stats.totalQuota})`
                            : `Sisa ${stats.remainingQuota}/${stats.totalQuota} Sesi`}
                        </span>
                      </div>

                      {/* Attendance Dates List */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-extrabold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                            <CalendarCheck className="w-3.5 h-3.5 text-cyan-500" />
                            <span>Tanggal-Tanggal Kehadiran ({stats.dateItems.length} Catatan):</span>
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            Total {stats.executedSessions} / {stats.totalQuota} Sesi
                          </span>
                        </div>

                        {stats.dateItems.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic">
                            Belum ada log tanggal absensi tercatat (atau diset manual {stats.executedSessions} sesi).
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                            {stats.dateItems.map((d, idx) => (
                              <span
                                key={`${d.dateStr}-${d.timeStr}-${idx}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-700 dark:text-slate-200"
                              >
                                <span className="font-black text-cyan-600 dark:text-cyan-400">
                                  #{idx + 1}
                                </span>
                                <span className="font-mono font-bold">{d.dateStr}</span>
                                <span className="text-slate-400">({d.timeStr})</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Last Sent Info */}
                      {lastNotif && (
                        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[11px]">
                          <span className="text-cyan-700 dark:text-cyan-300 font-bold flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            Notif terakhir: {formatIndoDate(lastNotif.sentAt.split('T')[0])} • Jatuh tempo:{' '}
                            {formatIndoDate(lastNotif.dueDate)}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                              lastNotif.status === 'paid'
                                ? 'bg-emerald-500 text-white'
                                : lastNotif.status === 'read'
                                ? 'bg-blue-500 text-white'
                                : 'bg-amber-500 text-slate-950'
                            }`}
                          >
                            {lastNotif.status === 'paid'
                              ? 'Sudah Bayar'
                              : lastNotif.status === 'read'
                              ? 'Sudah Dibaca'
                              : 'Terkirim'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] text-slate-500">
                        Pengirim: <strong className="text-slate-700 dark:text-slate-300">{senderName}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => openComposeModal(st)}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-extrabold shadow-md shadow-cyan-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim Notif Selesai &amp; Bayar</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: SENT NOTIFICATIONS HISTORY */}
      {subTab === 'history' && (
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-2">
              <Bell className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Belum Ada Riwayat Pemberitahuan Terkirim
              </h3>
              <p className="text-xs text-slate-400">
                Pilih peserta di tab Daftar Peserta untuk mengirim pemberitahuan absen selesai dan jadwal pembayaran berikutnya.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notif) => {
                const waDigits = formatWhatsAppPhone(notif.phone);
                const waHref = waDigits
                  ? `https://wa.me/${waDigits}?text=${encodeURIComponent(notif.message)}`
                  : null;
                const isCopied = copiedId === notif.id;

                return (
                  <div
                    key={notif.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {notif.studentName}
                          </h4>
                          <span className="font-mono text-[10px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-800">
                            {notif.studentBarcode || notif.studentId}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              notif.status === 'paid'
                                ? 'bg-emerald-500 text-white'
                                : notif.status === 'read'
                                ? 'bg-blue-500 text-white'
                                : 'bg-amber-500 text-slate-950'
                            }`}
                          >
                            {notif.status === 'paid'
                              ? 'Sudah Bayar'
                              : notif.status === 'read'
                              ? 'Sudah Dibaca Siswa'
                              : 'Belum Dibaca Siswa'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          Dikirim oleh <strong>{notif.senderName}</strong> ({notif.senderRole.toUpperCase()}) •{' '}
                          {new Date(notif.sentAt).toLocaleString('id-ID')}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyText(notif.message, notif.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-emerald-600 dark:text-emerald-400">Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin Teks</span>
                            </>
                          )}
                        </button>

                        {waHref && (
                          <a
                            href={waHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Kirim via WhatsApp</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => onDeleteNotification(notif.id)}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 cursor-pointer"
                          title="Hapus Riwayat Pemberitahuan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="md:col-span-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                        <p className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                          <CalendarCheck className="w-3.5 h-3.5 text-cyan-500" />
                          Tanggal Absen Terlampir ({notif.attendanceDates?.length || 0} Sesi):
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {(notif.attendanceDates || []).map((d, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300"
                            >
                              #{i + 1} {d.dateStr} ({d.timeStr})
                            </span>
                          ))}
                          {(!notif.attendanceDates || notif.attendanceDates.length === 0) && (
                            <span className="text-[11px] text-slate-400 italic">
                              {notif.executedSessions}/{notif.totalQuota} sesi tercatat selesai
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-500/30 space-y-1">
                        <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                          Waktunya Bayar Berikutnya:
                        </p>
                        <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                          Rp {(notif.amountDue || 0).toLocaleString('id-ID')}
                        </p>
                        <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          {notif.nextPackageName} ({notif.nextSessionsCount} Sesi)
                        </p>
                        <p className="text-[11px] font-black text-rose-600 dark:text-rose-400 flex items-center gap-1 pt-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Jatuh Tempo: {formatIndoDate(notif.dueDate)}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: PENGATURAN TEMPLATE PEMBERITAHUAN */}
      {subTab === 'settings' && (() => {
        const sampleStudent: Student = students[0] || {
          id: 'sample-1',
          barcode: 'AQUA-DSR-101',
          name: 'Budi Santoso',
          gender: 'Laki-laki',
          age: 9,
          birthDate: '2017-04-12',
          roleClass: 'dasar',
          phone: '081234567890',
          parentName: 'Ibu Sari',
          emergencyContact: '081234567890',
          joinedDate: '2026-09-01',
          status: 'active',
          remainingQuota: 0,
          totalQuota: 8,
          avatarUrl: '',
        };
        const sampleStats = students[0]
          ? getStudentQuotaStats(students[0])
          : {
              dateItems: [
                { dateStr: '2026-10-05', timeStr: '16:00', poolLane: 'Jalur 1' },
                { dateStr: '2026-10-12', timeStr: '16:00', poolLane: 'Jalur 1' },
              ],
              totalQuota: 8,
              executedSessions: 8,
              remainingQuota: 0,
            };
        const samplePkg =
          effectivePackages.find((p) => p.roleClass === sampleStudent.roleClass) || effectivePackages[0];
        const previewDueDate = getDefaultDueDateStr(dueDaysInput);
        const previewText = buildDefaultMessage(
          sampleStudent,
          sampleStats.dateItems,
          samplePkg?.packageName || 'Paket Kelas Dasar',
          samplePkg?.sessionsCount || 8,
          samplePkg?.price || 350000,
          previewDueDate,
          sampleStats.executedSessions,
          sampleStats.totalQuota,
          templateBodyInput
        );

        return (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <form
              onSubmit={handleSaveTemplateSettings}
              className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Pengaturan Template Pemberitahuan
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Sesuaikan format pesan, judul, dan tenggat pembayaran otomatis saat mengirim notifikasi.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleResetTemplateSettings}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Standar</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Judul Pemberitahuan Default (Tampil di Akun Peserta):
                  </label>
                  <input
                    type="text"
                    required
                    value={templateTitleInput}
                    onChange={(e) => setTemplateTitleInput(e.target.value)}
                    placeholder="Contoh: Absen Pertemuan Telah Selesai • Waktunya Bayar Kembali"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tenggat Bayar Default (Hari):
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    required
                    value={dueDaysInput}
                    onChange={(e) => setDueDaysInput(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-extrabold text-cyan-600 dark:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Otomatis +{dueDaysInput} hari dari tanggal kirim
                  </span>
                </div>
              </div>

              {/* Clickable Placeholder Variables */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-extrabold text-slate-700 dark:text-slate-200 block">
                  Variabel Otomatis (Klik untuk menyisipkan ke template):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {TEMPLATE_VARIABLES.map((v) => (
                    <button
                      key={v.key}
                      type="button"
                      onClick={() => handleInsertVariable(v.key)}
                      title={v.desc}
                      className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-cyan-500/30 hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 font-mono text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>+ {v.key}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Isi Template Pesan Pemberitahuan &amp; WhatsApp:
                </label>
                <textarea
                  ref={templateTextareaRef}
                  rows={12}
                  required
                  value={templateBodyInput}
                  onChange={(e) => setTemplateBodyInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[11px] text-slate-800 dark:text-slate-200 leading-relaxed focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold shadow-lg shadow-cyan-600/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Pengaturan Template</span>
                </button>
              </div>
            </form>

            {/* Live Preview Card */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Eye className="w-4 h-4 text-emerald-500" />
                    Pratinjau Hasil Pesan
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                    Live Preview
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/25 border border-cyan-500/30">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 block">
                    Judul Notif Peserta:
                  </span>
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {templateTitleInput || DEFAULT_NOTIFICATION_TITLE}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[420px] overflow-y-auto">
                  {previewText}
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Pratinjau menggunakan data contoh peserta ({sampleStudent.name}). Saat dikirim satuan maupun massal, seluruh variabel akan terisi otomatis sesuai data masing-masing peserta.
              </p>
            </div>
          </div>
        );
      })()}

      {/* COMPOSE / SEND NOTIFICATION MODAL */}
      {composeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Kirim Pemberitahuan Absen Selesai &amp; Pembayaran
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {composeStudent.name} ({composeStudent.barcode}) • Wali: {composeStudent.parentName || '-'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setComposeStudent(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const stats = getStudentQuotaStats(composeStudent);
              const waDigits = formatWhatsAppPhone(composeStudent.phone);
              const waHref = waDigits
                ? `https://wa.me/${waDigits}?text=${encodeURIComponent(customMessage)}`
                : null;

              return (
                <form onSubmit={handleSubmitNotification} className="space-y-4 text-xs">
                  {/* Recorded Dates Summary */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
                        <CalendarCheck className="w-4 h-4 text-cyan-500" />
                        Tanggal &amp; Waktu Absen Tercatat ({stats.executedSessions}/{stats.totalQuota} Sesi):
                      </span>
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                        Sisa Kuota: {stats.remainingQuota} Sesi
                      </span>
                    </div>
                    {stats.dateItems.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">
                        Tidak ada log tanggal scan individual, sistem akan melampirkan total {stats.executedSessions} pertemuan.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                        {stats.dateItems.map((d, idx) => (
                          <div
                            key={iKey(d, idx)}
                            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                          >
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              #{idx + 1}. {formatIndoDate(d.dateStr)}
                            </span>
                            <span className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {d.timeStr}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Next Payment Config */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Pilih Paket Pertemuan Berikutnya:
                      </label>
                      <select
                        value={selectedPackageId}
                        onChange={(e) => handlePackageSelectChange(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                      >
                        {effectivePackages.map((pkg) => (
                          <option key={pkg.id} value={pkg.id}>
                            {pkg.packageName} ({pkg.sessionsCount} Sesi - Rp {pkg.price.toLocaleString('id-ID')})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Waktunya Membayar Kembali (Tanggal Jatuh Tempo):
                      </label>
                      <input
                        type="date"
                        required
                        value={dueDate}
                        onChange={(e) => {
                          const newDue = e.target.value;
                          setDueDate(newDue);
                          handleRegenerateMessage(
                            nextPackageName,
                            nextSessionsCount,
                            amountDue,
                            newDue
                          );
                        }}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-amber-500/40 font-mono font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Nama Paket Tagihan:
                      </label>
                      <input
                        type="text"
                        required
                        value={nextPackageName}
                        onChange={(e) => setNextPackageName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Jumlah Sesi Berikutnya:
                      </label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={nextSessionsCount}
                        onChange={(e) => setNextSessionsCount(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Nominal Bayar (Rp):
                      </label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={amountDue}
                        onChange={(e) => setAmountDue(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-extrabold text-emerald-600 dark:text-emerald-400"
                      />
                    </div>
                  </div>

                  {/* Active Bank Info Preview */}
                  <div className="p-3 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/20 border border-cyan-500/20 flex items-center gap-2 text-[11px] text-cyan-800 dark:text-cyan-300">
                    <Building2 className="w-4 h-4 shrink-0" />
                    <span>
                      Rekening Tujuan Aktif:{' '}
                      {activeBanks.map((b) => `${b.bankName} ${b.accountNumber}`).join(' • ')}
                    </span>
                  </div>

                  {/* Editable Title & Message */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Judul Pemberitahuan:
                    </label>
                    <input
                      type="text"
                      required
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white mb-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />

                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">
                        Isi Pesan Pemberitahuan (Mengikuti Template Tersimpan • Dapat Diedit):
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRegenerateMessage()}
                        className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                      >
                        Terapkan Template Tersimpan
                      </button>
                    </div>
                    <textarea
                      rows={8}
                      required
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[11px] text-slate-800 dark:text-slate-200 leading-relaxed focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyText(customMessage, 'modal-copy')}
                        className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedId === 'modal-copy' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin Pesan</span>
                          </>
                        )}
                      </button>

                      {waHref && (
                        <a
                          href={waHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Buka WhatsApp Wali</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setComposeStudent(null)}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold flex items-center gap-1.5 shadow-lg shadow-cyan-600/20 cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>Kirim ke Akun Peserta</span>
                      </button>
                    </div>
                  </div>
                </form>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

function iKey(d: NotificationAttendanceDateItem, idx: number) {
  return `${d.dateStr}-${d.timeStr}-${idx}`;
}
