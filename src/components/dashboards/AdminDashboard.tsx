import React, { useState, useEffect } from 'react';
import {
  Student,
  AttendanceRecord,
  PoolSchedule,
  UserRole,
  PaymentRecord,
  RevenueDataPoint,
  AuthUser,
  ClassPricingPackage,
  AcademyProfile,
  StudentRegistration,
  GalleryItem,
  BankAccountInfo,
} from '../../types';
import { Coach } from '../../types';
import {
  exportCardToImageDataUrl,
  triggerImageDownload,
  printImageDirectly,
  CardExportData,
} from '../../services/cardImageExport';
import { compressAndResizeImage } from '../../services/imageUtils';
import { maskPhone, maskParentName, maskBirthDate } from '../../services/privacyUtils';
import {
  ROLE_LABELS,
  INITIAL_REVENUE_TREND,
  INITIAL_PRICING_PACKAGES,
  DEFAULT_ACADEMY_PROFILE,
  INITIAL_REGISTRATIONS,
  INITIAL_COACHES,
  OFFICIAL_BANK_ACCOUNTS,
  getClassDefaultQuota,
  getEffectiveStudentQuota,
} from '../../data/mockData';
import { AdminProfileSettings } from './AdminProfileSettings';
import { AdminPersonalProfile } from './AdminPersonalProfile';
import {
  Users,
  CalendarCheck,
  Award,
  Sparkles,
  Search,
  Plus,
  QrCode,
  FileSpreadsheet,
  ScanLine,
  Trash2,
  Edit,
  Clock,
  Waves,
  TrendingUp,
  DollarSign,
  Receipt,
  UserCog,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  Download,
  Calendar,
  History,
  X,
  CreditCard,
  Shield,
  Layers,
  ChevronRight,
  Filter,
  Coins,
  Zap,
  Check,
  Tags,
  CalendarClock,
  Info,
  CalendarDays,
  BadgePercent,
  CheckSquare,
  Calculator,
  KeyRound,
  Eye,
  EyeOff,
  UserCheck,
  Building2,
  Globe,
  Camera,
  Upload,
  UserPlus,
  User,
  Copy,
} from 'lucide-react';

interface AdminDashboardProps {
  students: Student[];
  attendances: AttendanceRecord[];
  schedules: PoolSchedule[];
  payments: PaymentRecord[];
  revenueTrend?: RevenueDataPoint[];
  appUsers: AuthUser[];
  coaches?: Coach[];
  onAddCoach?: (newCoach: Coach, customAuth?: { username?: string; password?: string }) => void;
  onDeleteCoach?: (coachId: string) => void;
  pricingPackages?: ClassPricingPackage[];
  onUpdatePricingPackage?: (updatedPkg: ClassPricingPackage) => void;
  onAddPricingPackage?: (newPkg: ClassPricingPackage) => void;
  onDeletePricingPackage?: (pkgId: string) => void;
  activeTab?: 'overview' | 'profiles' | 'attendance' | 'payments' | 'pricing' | 'users' | 'admin-profile' | 'settings' | 'cards' | 'barcode' | string;
  onTabChange?: (tab: 'overview' | 'profiles' | 'attendance' | 'payments' | 'pricing' | 'users' | 'admin-profile' | 'settings' | 'cards' | string) => void;
  onOpenScanner: () => void;
  onOpenSheets: () => void;
  onViewBarcode: (studentOrStaff: any) => void;
  onAddStudent: (newStudent: Student, customAuth?: { username?: string; password?: string }) => void;
  onUpdateStudent: (updatedStudent: Student) => void;
  onDeleteStudent: (id: string) => void;
  onAddPayment: (newPayment: PaymentRecord) => void;
  onUpdatePayment?: (updatedPayment: PaymentRecord) => void;
  onDeletePayment?: (paymentId: string) => void;
  onUpdatePaymentStatus: (paymentId: string, newStatus: 'lunas' | 'menunggu' | 'jatuh_tempo') => void;
  onAddUser: (newUser: AuthUser) => void;
  onUpdateUser?: (updatedUser: AuthUser) => void;
  onDeleteUser: (userId: string) => void;
  onAddAttendance: (newRecord: AttendanceRecord) => void;
  onUpdateAttendance?: (updatedRecord: AttendanceRecord) => void;
  onDeleteAttendance?: (attendanceId: string) => void;
  onUpdateTotalAttendance?: (studentId: string, executedSessions: number, totalQuota: number, remainingQuota: number) => void;
  onResetStudentAttendance?: (studentId: string) => void;
  academyProfile?: AcademyProfile;
  onUpdateAcademyProfile?: (profile: AcademyProfile) => void;
  registrations?: StudentRegistration[];
  onUpdateRegistration?: (reg: StudentRegistration) => void;
  onDeleteRegistration?: (regId: string) => void;
  onApproveAndCreateStudent?: (reg: StudentRegistration, targetClass: UserRole, initialQuota: number) => void;
  onViewPublicLanding?: () => void;
  galleryItems?: GalleryItem[];
  onAddGalleryItem?: (item: GalleryItem) => void;
  onDeleteGalleryItem?: (itemId: string) => void;
  currentUser?: AuthUser | null;
  onUpdateAvatar?: (newAvatarUrl: string) => void;
  onVerifyPaymentProof?: (paymentId: string) => void;
  bankAccounts?: BankAccountInfo[];
  onAddBankAccount?: (newAcc: BankAccountInfo) => void;
  onUpdateBankAccount?: (updatedAcc: BankAccountInfo) => void;
  onDeleteBankAccount?: (accId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  students = [],
  attendances = [],
  schedules = [],
  payments = [],
  revenueTrend = INITIAL_REVENUE_TREND,
  appUsers = [],
  coaches = INITIAL_COACHES,
  onAddCoach,
  onDeleteCoach,
  pricingPackages = INITIAL_PRICING_PACKAGES,
  onUpdatePricingPackage = () => {},
  onAddPricingPackage = () => {},
  onDeletePricingPackage = () => {},
  activeTab: controlledActiveTab,
  onTabChange,
  onOpenScanner,
  onOpenSheets,
  onViewBarcode,
  onAddStudent,
  onUpdateStudent = () => {},
  onDeleteStudent,
  onAddPayment = () => {},
  onUpdatePayment = () => {},
  onDeletePayment = () => {},
  onUpdatePaymentStatus = () => {},
  onVerifyPaymentProof,
  bankAccounts = OFFICIAL_BANK_ACCOUNTS,
  onAddBankAccount = () => {},
  onUpdateBankAccount = () => {},
  onDeleteBankAccount = () => {},
  onAddUser = () => {},
  onUpdateUser = () => {},
  onDeleteUser = () => {},
  onAddAttendance = () => {},
  onUpdateAttendance = () => {},
  onDeleteAttendance = () => {},
  onUpdateTotalAttendance = () => {},
  onResetStudentAttendance = () => {},
  academyProfile = DEFAULT_ACADEMY_PROFILE,
  onUpdateAcademyProfile = () => {},
  registrations = INITIAL_REGISTRATIONS,
  onUpdateRegistration = () => {},
  onDeleteRegistration = () => {},
  onApproveAndCreateStudent = () => {},
  onViewPublicLanding,
  galleryItems = [],
  onAddGalleryItem = () => {},
  onDeleteGalleryItem = () => {},
  currentUser = null,
  onUpdateAvatar = () => {},
}) => {
  // Sub-tabs in Admin Dashboard (supports controlled activeTab from sidebar!)
  const [internalActiveTab, setInternalActiveTab] = useState<'overview' | 'profiles' | 'attendance' | 'payments' | 'pricing' | 'users' | 'admin-profile' | 'settings' | 'cards' | 'registrations'>('overview');

  const validTabs: Array<'overview' | 'profiles' | 'attendance' | 'payments' | 'pricing' | 'users' | 'admin-profile' | 'settings' | 'cards' | 'barcode' | 'registrations'> = [
    'overview',
    'profiles',
    'attendance',
    'payments',
    'pricing',
    'users',
    'admin-profile',
    'settings',
    'cards',
    'barcode',
    'registrations',
  ];

  // Card printing per class state (Diferensiasi Menu Cetak Kartu Per Kelas)
  const [selectedCardClass, setSelectedCardClass] = useState<string>('all');
  const [cardSearchTerm, setCardSearchTerm] = useState<string>('');
  const [batchPrintClassModal, setBatchPrintClassModal] = useState<string | null>(null);

  // Sync selectedCardClass if controlledActiveTab starts with 'cards-'
  useEffect(() => {
    if (controlledActiveTab && controlledActiveTab.startsWith('cards-')) {
      const targetClass = controlledActiveTab.replace('cards-', '');
      setSelectedCardClass(targetClass);
    }
  }, [controlledActiveTab]);

  const isCardsActive =
    controlledActiveTab === 'cards' ||
    controlledActiveTab === 'barcode' ||
    (controlledActiveTab && controlledActiveTab.startsWith('cards-')) ||
    internalActiveTab === 'cards' ||
    (internalActiveTab as string) === 'barcode';

  const activeTab: 'overview' | 'profiles' | 'attendance' | 'payments' | 'pricing' | 'users' | 'admin-profile' | 'settings' | 'cards' | 'registrations' = isCardsActive
    ? 'cards'
    : controlledActiveTab && validTabs.includes(controlledActiveTab as any)
    ? (controlledActiveTab as any)
    : internalActiveTab;

  const setActiveTab = (tab: 'overview' | 'profiles' | 'attendance' | 'payments' | 'pricing' | 'users' | 'admin-profile' | 'settings' | 'cards' | 'registrations') => {
    setInternalActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [attendanceDateFilter, setAttendanceDateFilter] = useState<string>('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');

  // Modals state
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddAttendanceModal, setShowAddAttendanceModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);
  const [viewingAdminProof, setViewingAdminProof] = useState<PaymentRecord | null>(null);
  const [verifyingPaymentId, setVerifyingPaymentId] = useState<string | null>(null);

  // Bank Account Management State (Pengaturan Nomor Rekening di Admin)
  const [showBankManagementModal, setShowBankManagementModal] = useState(false);
  const [showAddEditBankModal, setShowAddEditBankModal] = useState(false);
  const [editingBank, setEditingBank] = useState<BankAccountInfo | null>(null);
  const [bankFormData, setBankFormData] = useState({
    id: '',
    bankName: 'BRI (Bank Rakyat Indonesia)',
    bankCode: 'BRI',
    accountNumber: '0341-01-002918-50-3',
    accountHolder: academyProfile?.name || 'AquaFlow Tirta Samudra',
    notes: 'Rekening Utama Resmi Pembayaran Siswa',
    isActive: true,
  });

  const effectiveBankAccounts =
    bankAccounts && bankAccounts.length > 0 ? bankAccounts : OFFICIAL_BANK_ACCOUNTS;

  const [editingPayment, setEditingPayment] = useState<PaymentRecord | null>(null);
  const [editPaymentData, setEditPaymentData] = useState({
    id: '',
    invoiceNumber: '',
    studentId: '',
    packageName: '',
    amount: 0,
    paymentDate: '',
    paymentMethod: 'Transfer Bank' as 'Transfer Bank' | 'QRIS' | 'Tunai di Kolam' | 'Kartu Debit',
    status: 'lunas' as 'lunas' | 'menunggu',
    notes: '',
  });
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const [editUserData, setEditUserData] = useState({
    id: '',
    name: '',
    username: '',
    password: '',
    email: '',
    role: 'pelatih' as UserRole,
    phone: '',
    avatarUrl: '',
    studentId: '',
    coachId: '',
    barcode: '',
  });
  const [deletingUser, setDeletingUser] = useState<AuthUser | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [showUserPasswordMap, setShowUserPasswordMap] = useState<Record<string, boolean>>({});
  const [showAddUserPassword, setShowAddUserPassword] = useState(false);
  const [showEditUserPassword, setShowEditUserPassword] = useState(false);

  // Privacy Mask Active (Nomor telepon disamarkan, wali atlet disembunyikan 'xxx', tgl lahir disamarkan kecuali di KTA)
  const [privacyMaskActive, setPrivacyMaskActive] = useState(true);

  // New Student Form state
  const [newStudentData, setNewStudentData] = useState({
    name: '',
    roleClass: 'dasar' as UserRole,
    gender: 'Laki-laki' as 'Laki-laki' | 'Perempuan',
    age: 8,
    birthDate: '',
    phone: '',
    parentName: '',
    emergencyContact: '',
    totalQuota: 12,
    avatarUrl: '',
    notes: '',
    username: '',
    password: '',
  });

  // New Payment Form state
  const [newPaymentData, setNewPaymentData] = useState({
    studentId: students[0]?.id || '',
    packageName: 'Iuran Bulanan Kelas Dasar (12 Pertemuan)',
    amount: 350000,
    paymentMethod: 'Transfer Bank' as 'Transfer Bank' | 'QRIS' | 'Tunai di Kolam' | 'Kartu Debit',
    status: 'lunas' as 'lunas' | 'menunggu' | 'jatuh_tempo',
    notes: '',
  });

  // New User Form state
  const [newUserData, setNewUserData] = useState({
    name: '',
    username: '',
    password: '',
    email: '',
    role: 'pelatih' as UserRole,
    phone: '',
    avatarUrl: '',
    studentId: '',
    coachId: '',
    barcode: '',
  });

  // Dedicated Add Coach Modal State (Otomatis Username, Password, Barcode)
  const [showAddCoachModal, setShowAddCoachModal] = useState(false);
  const [showCoachPassword, setShowCoachPassword] = useState(false);
  const [coachFormData, setCoachFormData] = useState({
    name: '',
    phone: '',
    specialty: 'Gaya Dada, Gaya Bebas & Renang Prestasi',
    experienceYears: 4,
    assignedClasses: ['dasar', 'pemula', 'prestasi', 'privat_4', 'privat_8', 'privat_12'] as UserRole[],
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    barcode: '',
    username: '',
    password: 'coach123',
    email: '',
  });

  const getNextCoachBarcode = () => {
    const nums = (coaches || [])
      .map((c) => {
        const m = c.barcode?.match(/AQUA-CCH-(\d+)/);
        return m ? parseInt(m[1], 10) : 0;
      })
      .filter((n) => n > 0);
    const nextNum = nums.length > 0 ? Math.max(...nums) + 1 : 101;
    return `AQUA-CCH-${nextNum}`;
  };

  const handleOpenAddCoach = () => {
    const autoBarcode = getNextCoachBarcode();
    setCoachFormData({
      name: '',
      phone: '',
      specialty: 'Gaya Dada, Gaya Bebas & Renang Prestasi',
      experienceYears: 4,
      assignedClasses: ['dasar', 'pemula', 'prestasi', 'privat_4', 'privat_8', 'privat_12'],
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      barcode: autoBarcode,
      username: '',
      password: 'coach123',
      email: '',
    });
    setShowAddCoachModal(true);
  };

  // Attendance View & Editing state
  const [attendanceSubView, setAttendanceSubView] = useState<'today' | 'all'>('today');
  const [todaySearchTerm, setTodaySearchTerm] = useState('');

  // New Manual Attendance Form state
  const [newAttendanceData, setNewAttendanceData] = useState({
    studentId: students[0]?.id || '',
    dateStr: '',
    status: 'hadir' as 'hadir' | 'izin' | 'alpa',
    poolLane: 'Kolam Utama - Jalur 1',
    notes: 'Presensi dicatat manual oleh admin',
  });

  // Edit single attendance record state
  const [editingAttendance, setEditingAttendance] = useState<AttendanceRecord | null>(null);
  const [editAttendanceData, setEditAttendanceData] = useState({
    id: '',
    studentId: '',
    studentName: '',
    dateStr: '',
    timeStr: '',
    status: 'hadir' as 'hadir' | 'izin' | 'alpa',
    poolLane: '',
    coachName: '',
    notes: '',
  });

  // Edit Total Attendance & Quota state
  const [editingTotalAttendanceStudent, setEditingTotalAttendanceStudent] = useState<Student | null>(null);
  const [editTotalData, setEditTotalData] = useState({
    studentId: '',
    executedSessions: 0,
    totalQuota: 12,
    remainingQuota: 12,
    notes: '',
  });

  // View & Delete All Attendance History for a Student
  const [viewingStudentAttendanceHistory, setViewingStudentAttendanceHistory] = useState<Student | null>(null);
  const [historySearchTerm, setHistorySearchTerm] = useState('');

  // Pricing & Sessions State (Khusus Pemula & Prestasi Pembayaran Bulanan)
  const [pricingFilter, setPricingFilter] = useState<'all' | 'bulanan' | 'pemula_prestasi' | 'per_paket'>('all');
  const [showAddEditPackageModal, setShowAddEditPackageModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ClassPricingPackage | null>(null);
  const [notificationToast, setNotificationToast] = useState<{ show: boolean; message: string; type: 'success' | 'info' } | null>(null);

  // Pricing Form state
  const [packageFormData, setPackageFormData] = useState({
    id: '',
    roleClass: 'pemula' as UserRole,
    packageName: '',
    billingType: 'bulanan' as 'bulanan' | 'per_paket',
    price: 450000,
    sessionsCount: 12,
    sessionsPerWeek: 3,
    durationMinutes: 75,
    scheduleDescription: '',
    coachRatio: '1 Pelatih : 6 Siswa',
    poolLane: 'Kolam Utama - Kedalaman 1.2m',
    featuresText: '',
    isActive: true,
    notes: '',
  });

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setNotificationToast({ show: true, message, type });
    setTimeout(() => {
      setNotificationToast(null);
    }, 4000);
  };

  // Open Add Package Modal
  const handleOpenAddPackage = (defaultClass: UserRole = 'pemula') => {
    setEditingPackage(null);
    const isBulanan = defaultClass === 'pemula' || defaultClass === 'prestasi' || defaultClass === 'dasar';
    setPackageFormData({
      id: '',
      roleClass: defaultClass,
      packageName: defaultClass === 'pemula'
        ? 'Kelas Pemula (Pembayaran Bulanan)'
        : defaultClass === 'prestasi'
        ? 'Program Atlet Prestasi (Pembayaran Bulanan)'
        : `Paket ${defaultClass.replace('_', ' ')}`,
      billingType: isBulanan ? 'bulanan' : 'per_paket',
      price: defaultClass === 'pemula' ? 450000 : defaultClass === 'prestasi' ? 650000 : 350000,
      sessionsCount: defaultClass === 'pemula' ? 12 : defaultClass === 'prestasi' ? 16 : 8,
      sessionsPerWeek: defaultClass === 'pemula' ? 3 : defaultClass === 'prestasi' ? 4 : 2,
      durationMinutes: defaultClass === 'prestasi' ? 90 : 75,
      scheduleDescription: defaultClass === 'pemula'
        ? 'Selasa, Kamis, Sabtu (15:30 - 16:45 WIB)'
        : defaultClass === 'prestasi'
        ? 'Senin, Rabu, Jumat, Sabtu (05:30 & 16:00 WIB)'
        : 'Sesuai Jadwal Akademi',
      coachRatio: defaultClass === 'prestasi' ? '1 Pelatih : 4 Atlet' : '1 Pelatih : 6 Siswa',
      poolLane: defaultClass === 'prestasi' ? 'Kolam Olympic 50m - Jalur 4 & 5' : 'Kolam Utama - Jalur 1 & 2',
      featuresText: defaultClass === 'pemula'
        ? '12 Sesi Pertemuan Terbimbing per Bulan\nSistem Iuran Rutin Bulanan\nTarget Penguasaan Gaya Dada & Gaya Bebas 25m\nGratis Peminjaman Kickboard & Pull Buoy\nEvaluasi Kenaikan Tingkat Tiap Akhir Bulan'
        : '16 Sesi Latihan Intensif Atlet per Bulan\nSistem Iuran Rutin Bulanan\nLatihan Fisik Darat (Dryland Strength) & Interval Drills\nSimulasi Time Trial Stopwatch & Target PB\nPengurusan Lisensi Atlet PRSI & Sertifikat\nAkses Jalur Khusus Kolam Olympic 50m',
      isActive: true,
      notes: '',
    });
    setShowAddEditPackageModal(true);
  };

  // Open Edit Package Modal
  const handleOpenEditPackage = (pkg: ClassPricingPackage) => {
    setEditingPackage(pkg);
    setPackageFormData({
      id: pkg.id,
      roleClass: pkg.roleClass,
      packageName: pkg.packageName,
      billingType: pkg.billingType,
      price: pkg.price,
      sessionsCount: pkg.sessionsCount,
      sessionsPerWeek: pkg.sessionsPerWeek,
      durationMinutes: pkg.durationMinutes,
      scheduleDescription: pkg.scheduleDescription,
      coachRatio: pkg.coachRatio,
      poolLane: pkg.poolLane,
      featuresText: pkg.features.join('\n'),
      isActive: pkg.isActive,
      notes: pkg.notes || '',
    });
    setShowAddEditPackageModal(true);
  };

  // Save Package (Add or Edit)
  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    const features = packageFormData.featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    if (editingPackage) {
      const updated: ClassPricingPackage = {
        ...editingPackage,
        roleClass: packageFormData.roleClass,
        packageName: packageFormData.packageName,
        billingType: packageFormData.billingType,
        price: Number(packageFormData.price),
        sessionsCount: Number(packageFormData.sessionsCount),
        sessionsPerWeek: Number(packageFormData.sessionsPerWeek),
        durationMinutes: Number(packageFormData.durationMinutes),
        scheduleDescription: packageFormData.scheduleDescription,
        coachRatio: packageFormData.coachRatio,
        poolLane: packageFormData.poolLane,
        features: features.length > 0 ? features : editingPackage.features,
        isActive: packageFormData.isActive,
        notes: packageFormData.notes,
      };
      onUpdatePricingPackage(updated);
      showToast(`Paket "${updated.packageName}" berhasil diperbarui!`, 'success');
    } else {
      const newPkg: ClassPricingPackage = {
        id: `pkg-${Date.now()}`,
        roleClass: packageFormData.roleClass,
        packageName: packageFormData.packageName,
        billingType: packageFormData.billingType,
        price: Number(packageFormData.price),
        sessionsCount: Number(packageFormData.sessionsCount),
        sessionsPerWeek: Number(packageFormData.sessionsPerWeek),
        durationMinutes: Number(packageFormData.durationMinutes),
        scheduleDescription: packageFormData.scheduleDescription,
        coachRatio: packageFormData.coachRatio,
        poolLane: packageFormData.poolLane,
        features: features.length > 0 ? features : ['Pertemuan Terbimbing', 'Sistem Absensi Kolam'],
        isActive: packageFormData.isActive,
        notes: packageFormData.notes,
      };
      onAddPricingPackage(newPkg);
      showToast(`Paket "${newPkg.packageName}" berhasil ditambahkan!`, 'success');
    }
    setShowAddEditPackageModal(false);
  };

  // Delete Package
  const handleDeletePackage = (pkgId: string, pkgName: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus paket "${pkgName}"?`)) {
      onDeletePricingPackage(pkgId);
      showToast(`Paket "${pkgName}" berhasil dihapus.`, 'info');
    }
  };

  // Bank Account Action Handlers (Pengaturan Nomor Rekening Admin)
  const handleOpenAddBank = () => {
    setEditingBank(null);
    setBankFormData({
      id: `bank-${Date.now().toString().slice(-6)}`,
      bankName: 'BRI (Bank Rakyat Indonesia)',
      bankCode: 'BRI',
      accountNumber: '',
      accountHolder: academyProfile?.name || 'AquaFlow Tirta Samudra',
      notes: 'Rekening Pembayaran Siswa',
      isActive: true,
    });
    setShowAddEditBankModal(true);
  };

  const handleOpenEditBank = (acc: BankAccountInfo) => {
    setEditingBank(acc);
    setBankFormData({
      id: acc.id,
      bankName: acc.bankName,
      bankCode: acc.bankCode,
      accountNumber: acc.accountNumber,
      accountHolder: acc.accountHolder,
      notes: acc.notes || '',
      isActive: acc.isActive !== false,
    });
    setShowAddEditBankModal(true);
  };

  const handleSaveBankAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankFormData.accountNumber.trim()) {
      alert('Silakan masukkan nomor rekening bank.');
      return;
    }
    if (!bankFormData.accountHolder.trim()) {
      alert('Silakan masukkan nama pemilik rekening (atas nama).');
      return;
    }

    const newOrUpdated: BankAccountInfo = {
      id: editingBank ? editingBank.id : bankFormData.id || `bank-${Date.now()}`,
      bankName: bankFormData.bankName.trim(),
      bankCode: bankFormData.bankCode.trim().toUpperCase(),
      accountNumber: bankFormData.accountNumber.trim(),
      accountHolder: bankFormData.accountHolder.trim(),
      logoColor: bankFormData.bankCode.includes('BRI') ? 'text-cyan-600' : 'text-blue-600',
      badgeBg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600',
      isActive: bankFormData.isActive,
      notes: bankFormData.notes.trim(),
    };

    if (editingBank) {
      onUpdateBankAccount(newOrUpdated);
      showToast(`Rekening ${newOrUpdated.bankName} berhasil diperbarui!`);
    } else {
      onAddBankAccount(newOrUpdated);
      showToast(`Rekening ${newOrUpdated.bankName} berhasil ditambahkan!`);
    }
    setShowAddEditBankModal(false);
  };

  const handleToggleBankActive = (acc: BankAccountInfo) => {
    const updated = { ...acc, isActive: !acc.isActive };
    onUpdateBankAccount(updated);
    showToast(
      `Status rekening ${acc.bankName} diubah menjadi ${updated.isActive ? 'Aktif (Tampil di Wali)' : 'Non-aktif (Disembunyikan)'}.`,
      'info'
    );
  };

  const handleDeleteBank = (accId: string, bankName: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus rekening "${bankName}"?`)) {
      onDeleteBankAccount(accId);
      showToast(`Rekening ${bankName} berhasil dihapus.`);
    }
  };

  const handleSetOnlyBriActive = () => {
    effectiveBankAccounts.forEach((acc) => {
      const isBri = acc.bankCode.toUpperCase().includes('BRI') || acc.bankName.toUpperCase().includes('BRI');
      if (acc.isActive !== isBri) {
        onUpdateBankAccount({ ...acc, isActive: isBri });
      }
    });
    showToast('Pengaturan berhasil: Hanya rekening BRI yang diaktifkan!');
  };

  // Participant attendance summary filters
  const [participantSearchTerm, setParticipantSearchTerm] = useState('');
  const [participantClassFilter, setParticipantClassFilter] = useState('all');

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper: Jumlah sesi absen yang sudah dilaksanakan oleh masing-masing peserta
  const getStudentExecutedAttendance = (st: Student) => {
    const logs = attendances.filter(
      (a) =>
        (a.studentId === st.id ||
          (a.studentBarcode && a.studentBarcode.toUpperCase() === st.barcode.toUpperCase()) ||
          a.studentName.toLowerCase() === st.name.toLowerCase()) &&
        (a.status === 'hadir' || !a.status)
    );
    if (typeof st.manualExecutedSessions === 'number') {
      return Math.max(logs.length, st.manualExecutedSessions);
    }
    return logs.length;
  };

  // 1. STATISTIK ABSENSI (TOTAL ABSEN & JUMLAH DILAKSANAKAN SETIAP PESERTA)
  const totalExecutedAllStudents = students.reduce(
    (sum, st) => sum + getStudentExecutedAttendance(st),
    0
  );
  const avgExecutedPerStudent =
    students.length > 0 ? (totalExecutedAllStudents / students.length).toFixed(1) : '0';

  const totalAttendances = attendances.length;
  const todayAttendances = attendances.filter((a) => a.dateStr === todayStr);
  const totalPresent = attendances.filter((a) => a.status === 'hadir').length;
  const totalPermit = attendances.filter((a) => a.status === 'izin').length;
  const totalAbsent = attendances.filter((a) => a.status === 'alpa').length;
  const attendanceRate = totalAttendances > 0 ? Math.round((totalPresent / totalAttendances) * 100) : 100;

  // 2. STATISTIK PEMBAYARAN & PENDAPATAN
  const totalRevenue = payments
    .filter((p) => p.status === 'lunas')
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingRevenue = payments
    .filter((p) => p.status === 'menunggu' || p.status === 'jatuh_tempo')
    .reduce((sum, p) => sum + p.amount, 0);

  // Bukti Transfer Pembayaran Menunggu Verifikasi Admin
  const pendingProofPayments = payments.filter((p) => p.status === 'menunggu' && !!p.proofUrl);
  const pendingProofCount = pendingProofPayments.length;

  const handleAdminVerifyProof = (paymentId: string) => {
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) return;
    setVerifyingPaymentId(paymentId);
    if (onVerifyPaymentProof) {
      onVerifyPaymentProof(paymentId);
    } else {
      onUpdatePaymentStatus(paymentId, 'lunas');
    }
    setViewingAdminProof(null);
    setTimeout(() => {
      setVerifyingPaymentId(null);
      showToast(
        `Pembayaran ${payment.invoiceNumber} diverifikasi! Kuota +${payment.sessionsToAdd || 12} sesi otomatis ditambahkan ke ${payment.studentName}.`
      );
    }, 400);
  };

  const handleAdminRejectProof = (paymentId: string) => {
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) return;
    if (confirm(`Yakin ingin menolak bukti transfer faktur ${payment.invoiceNumber} dari ${payment.studentName}?`)) {
      if (onUpdatePayment) {
        onUpdatePayment({
          ...payment,
          proofUrl: undefined,
          notes: `${payment.notes || ''} [Bukti transfer ditolak admin pada ${new Date().toLocaleDateString('id-ID')}]`,
        });
      }
      setViewingAdminProof(null);
      showToast(`Bukti transfer ${payment.invoiceNumber} ditolak. Wali dapat mengunggah ulang.`);
    }
  };

  // 3. STATISTIK TOTAL SISWA PER KELAS
  const classBreakdown: Array<{ role: UserRole; count: number; label: string; bg: string; text: string }> = (
    ['dasar', 'pemula', 'prestasi', 'privat_4', 'privat_8', 'privat_12'] as UserRole[]
  ).map((r) => ({
    role: r,
    count: students.filter((s) => s.roleClass === r).length,
    label: ROLE_LABELS[r].title,
    bg: ROLE_LABELS[r].badgeBg,
    text: ROLE_LABELS[r].textBadge,
  }));

  // 4. STATISTIK & MANAJEMEN PERTEMUAN DAN HARGA (KHUSUS PEMULA & PRESTASI BULANAN)
  const pemulaStudents = students.filter((s) => s.roleClass === 'pemula');
  const prestasiStudents = students.filter((s) => s.roleClass === 'prestasi');

  const pemulaPkg = pricingPackages.find((p) => p.roleClass === 'pemula') || {
    id: 'pkg-pml-default',
    roleClass: 'pemula' as UserRole,
    packageName: 'Kelas Pemula (Pembayaran Bulanan)',
    billingType: 'bulanan' as const,
    price: 450000,
    sessionsCount: 12,
    sessionsPerWeek: 3,
    durationMinutes: 75,
    scheduleDescription: 'Selasa, Kamis, Sabtu (15:30 - 16:45 WIB)',
    coachRatio: '1 Pelatih : 6 Siswa',
    poolLane: 'Kolam Utama - Kedalaman 1.2m',
    features: ['12 Sesi Pertemuan Terbimbing per Bulan', 'Sistem Iuran Rutin Bulanan'],
    isActive: true,
  };

  const prestasiPkg = pricingPackages.find((p) => p.roleClass === 'prestasi') || {
    id: 'pkg-prs-default',
    roleClass: 'prestasi' as UserRole,
    packageName: 'Program Atlet Prestasi (Pembayaran Bulanan)',
    billingType: 'bulanan' as const,
    price: 650000,
    sessionsCount: 16,
    sessionsPerWeek: 4,
    durationMinutes: 90,
    scheduleDescription: 'Senin, Rabu, Jumat, Sabtu (05:30 & 16:00 WIB)',
    coachRatio: '1 Pelatih : 4 Atlet',
    poolLane: 'Kolam Olympic 50m - Jalur 4 & 5',
    features: ['16 Sesi Latihan Intensif Atlet per Bulan', 'Dryland Strength & Time Trial'],
    isActive: true,
  };

  const potentialMonthlyRevenue = (pemulaStudents.length * pemulaPkg.price) + (prestasiStudents.length * prestasiPkg.price);

  const filteredPricingPackages = pricingPackages.filter((pkg) => {
    if (pricingFilter === 'bulanan') return pkg.billingType === 'bulanan';
    if (pricingFilter === 'pemula_prestasi') return pkg.roleClass === 'pemula' || pkg.roleClass === 'prestasi';
    if (pricingFilter === 'per_paket') return pkg.billingType === 'per_paket';
    return true;
  });

  const getStudentMonthlyInvoice = (studentId: string) => {
    return payments.find((p) => p.studentId === studentId);
  };

  const [calcClass, setCalcClass] = useState<UserRole>('pemula');
  const [calcSessions, setCalcSessions] = useState<number>(12);

  // Handlers
  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentData.name) return;

    const prefixMap: Record<UserRole, string> = {
      admin: 'ADM',
      pelatih: 'PCH',
      dasar: 'DSR',
      pemula: 'PML',
      prestasi: 'PRS',
      privat_4: 'PV4',
      privat_8: 'PV8',
      privat_12: 'PV12',
    };

    const count = students.filter((s) => s.roleClass === newStudentData.roleClass).length + 1;
    const barcode = `AQUA-${prefixMap[newStudentData.roleClass]}-${100 + count}`;
    const id = `std-${Date.now()}`;

    const created: Student = {
      id,
      barcode,
      name: newStudentData.name,
      roleClass: newStudentData.roleClass,
      gender: newStudentData.gender,
      age: Number(newStudentData.age),
      birthDate: newStudentData.birthDate.trim() || undefined,
      phone: newStudentData.phone || '0812-0000-0000',
      parentName: newStudentData.parentName || 'Wali Siswa',
      emergencyContact: newStudentData.emergencyContact || newStudentData.phone,
      joinedDate: todayStr,
      status: 'active',
      remainingQuota: Number(newStudentData.totalQuota),
      totalQuota: Number(newStudentData.totalQuota),
      assignedCoachId: 'c1',
      avatarUrl: newStudentData.avatarUrl.trim() || `https://images.unsplash.com/photo-${1500000000000 + count * 12345}?w=150&auto=format&fit=crop&q=80`,
      notes: newStudentData.notes || 'Siswa baru terdaftar di akademi.',
    };

    // Generate username & password otomatis untuk Manajemen User
    const cleanName = created.name.toLowerCase();
    const parts = cleanName.split(/\s+/).filter(Boolean);
    const first = (parts[0] || 'siswa').replace(/[^a-z0-9]/g, '');
    const second = parts[1] ? parts[1].replace(/[^a-z0-9]/g, '') : '';
    const autoUsername =
      newStudentData.username?.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') ||
      (second ? `${first}_${second}` : first) ||
      'siswa';
    const autoPassword = newStudentData.password?.trim() || 'siswa123';

    onAddStudent(created, { username: autoUsername, password: autoPassword });
    setShowAddStudentModal(false);
    showToast(
      `Siswa "${created.name}" berhasil ditambahkan! Akun login otomatis dibuat: @${autoUsername} (Password: ${autoPassword}) dan aktif di Manajemen User.`,
      'success'
    );

    setNewStudentData({
      name: '',
      roleClass: 'dasar',
      gender: 'Laki-laki',
      age: 8,
      birthDate: '',
      phone: '',
      parentName: '',
      emergencyContact: '',
      totalQuota: 12,
      avatarUrl: '',
      notes: '',
      username: '',
      password: '',
    });
  };

  const handleUpdateStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    onUpdateStudent(editingStudent);
    setEditingStudent(null);
  };

  const handleCreatePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === newPaymentData.studentId) || students[0];
    if (!st) return;

    const newPay: PaymentRecord = {
      id: `pay-${Date.now()}`,
      invoiceNumber: `INV-${new Date().getFullYear()}-${1000 + payments.length + 1}`,
      studentId: st.id,
      studentName: st.name,
      roleClass: st.roleClass,
      packageName: newPaymentData.packageName,
      amount: Number(newPaymentData.amount),
      paymentDate: todayStr,
      dueDate: todayStr,
      paymentMethod: newPaymentData.paymentMethod,
      status: newPaymentData.status,
      notes: newPaymentData.notes || 'Pembayaran dicatat admin',
    };

    onAddPayment(newPay);
    setShowAddPaymentModal(false);
    showToast(`Pembayaran untuk "${st.name}" berhasil dicatat!`, 'success');
  };

  // Edit & Delete Payment Handlers
  const handleOpenEditPayment = (payment: PaymentRecord) => {
    setEditingPayment(payment);
    setEditPaymentData({
      id: payment.id,
      invoiceNumber: payment.invoiceNumber,
      studentId: payment.studentId,
      packageName: payment.packageName,
      amount: payment.amount,
      paymentDate: payment.paymentDate,
      paymentMethod: payment.paymentMethod,
      status: payment.status === 'lunas' ? 'lunas' : 'menunggu',
      notes: payment.notes || '',
    });
  };

  const handleUpdatePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment) return;

    const st = students.find((s) => s.id === editPaymentData.studentId);

    const updated: PaymentRecord = {
      ...editingPayment,
      studentId: st ? st.id : editingPayment.studentId,
      studentName: st ? st.name : editingPayment.studentName,
      roleClass: st ? st.roleClass : editingPayment.roleClass,
      packageName: editPaymentData.packageName,
      amount: Number(editPaymentData.amount),
      paymentDate: editPaymentData.paymentDate || todayStr,
      paymentMethod: editPaymentData.paymentMethod,
      status: editPaymentData.status,
      notes: editPaymentData.notes || 'Pembayaran dicatat admin',
    };

    onUpdatePayment(updated);
    setEditingPayment(null);
    showToast(`Data pembayaran "${updated.invoiceNumber}" berhasil diperbarui!`, 'success');
  };

  const handleDeletePayment = (paymentId: string, invoiceNumber: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data pembayaran invoice "${invoiceNumber}"?`)) {
      onDeletePayment(paymentId);
      showToast(`Catatan pembayaran "${invoiceNumber}" berhasil dihapus.`, 'info');
    }
  };

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.name || !newUserData.email) return;

    const isPelatih = newUserData.role === 'pelatih';

    let finalUsername = newUserData.username.trim();
    if (!finalUsername) {
      const cleanName = newUserData.name.trim().toLowerCase();
      const parts = cleanName.split(/\s+/).filter(Boolean);
      const first = (parts[0] || 'user').replace(/[^a-z0-9]/g, '');
      const second = parts[1] ? parts[1].replace(/[^a-z0-9]/g, '') : '';
      if (isPelatih) {
        finalUsername = second ? `${first}_${second}` : (first.startsWith('coach') ? first : `coach_${first}`);
      } else {
        finalUsername = newUserData.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
      }
    } else {
      finalUsername = finalUsername.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    }

    const autoBarcode = isPelatih
      ? newUserData.barcode.trim() || getNextCoachBarcode()
      : newUserData.barcode.trim() || undefined;

    const finalPassword =
      newUserData.password.trim() || (isPelatih ? 'coach123' : 'tirta123');

    const coachId = isPelatih
      ? newUserData.coachId.trim() || `cch-${Date.now().toString().slice(-5)}`
      : undefined;

    const newUser: AuthUser = {
      id: `usr-${Date.now()}`,
      name: newUserData.name.trim(),
      username: finalUsername,
      password: finalPassword,
      email: newUserData.email.trim().toLowerCase(),
      role: newUserData.role,
      phone: newUserData.phone.trim() || undefined,
      avatarUrl: newUserData.avatarUrl.trim() || (isPelatih
        ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'),
      studentId: newUserData.studentId.trim() || undefined,
      coachId: coachId,
      barcode: autoBarcode,
    };

    onAddUser(newUser);

    // Jika membuat akun pelatih, pastikan juga otomatis tercatat di data pelatih resmi (coaches)
    if (isPelatih && onAddCoach) {
      const newCoach: Coach = {
        id: coachId || `cch-${Date.now().toString().slice(-5)}`,
        barcode: autoBarcode || getNextCoachBarcode(),
        name: newUser.name,
        specialty: 'Pelatih Renang Resmi (Semua Gaya Renang)',
        phone: newUser.phone || '08xxxxxxxxxx',
        email: newUser.email,
        avatarUrl: newUser.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        assignedClasses: ['dasar', 'pemula', 'prestasi', 'privat_4', 'privat_8', 'privat_12'],
        experienceYears: 3,
        certifications: ['Lisensi Pelatih Akuatik Nasional'],
      };
      onAddCoach(newCoach, { username: newUser.username, password: newUser.password });
    }

    setShowAddUserModal(false);
    showToast(`Akun baru "${newUser.name}" (@${newUser.username}) dengan Barcode "${autoBarcode || '-'}" berhasil dibuat!`, 'success');
    setNewUserData({
      name: '',
      username: '',
      password: '',
      email: '',
      role: 'pelatih',
      phone: '',
      avatarUrl: '',
      studentId: '',
      coachId: '',
      barcode: '',
    });
  };

  // Submit Handler for Dedicated Coach Addition (Auto Barcode, Username, Password)
  const handleCreateCoachSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachFormData.name.trim()) {
      alert('Silakan masukkan nama lengkap pelatih.');
      return;
    }

    const cleanName = coachFormData.name.trim().toLowerCase();
    const parts = cleanName.split(/\s+/).filter(Boolean);
    const first = (parts[0] || 'coach').replace(/[^a-z0-9]/g, '');
    const second = parts[1] ? parts[1].replace(/[^a-z0-9]/g, '') : '';
    const baseUser = second ? `${first}_${second}` : (first.startsWith('coach') ? first : `coach_${first}`);

    const finalUsername = coachFormData.username.trim()
      ? coachFormData.username.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
      : baseUser || 'coach';

    const finalPassword = coachFormData.password.trim() || 'coach123';
    const finalBarcode = coachFormData.barcode.trim() || getNextCoachBarcode();
    const finalEmail = coachFormData.email.trim() || `${finalUsername}@aquaflow.id`;

    const newCoach: Coach = {
      id: `cch-${Date.now().toString().slice(-5)}`,
      barcode: finalBarcode,
      name: coachFormData.name.trim(),
      specialty: coachFormData.specialty.trim() || 'Pelatih Renang Resmi (Semua Usia)',
      phone: coachFormData.phone.trim() || '08xxxxxxxxxx',
      email: finalEmail,
      avatarUrl: coachFormData.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      assignedClasses: coachFormData.assignedClasses.length > 0
        ? coachFormData.assignedClasses
        : ['dasar', 'pemula', 'prestasi', 'privat_4', 'privat_8', 'privat_12'],
      experienceYears: Number(coachFormData.experienceYears) || 3,
      certifications: ['Lisensi Pelatih Akuatik Nasional'],
    };

    if (onAddCoach) {
      onAddCoach(newCoach, { username: finalUsername, password: finalPassword });
    } else {
      const newUser: AuthUser = {
        id: `usr-${Date.now()}`,
        name: newCoach.name,
        username: finalUsername,
        password: finalPassword,
        email: finalEmail,
        role: 'pelatih',
        phone: newCoach.phone,
        barcode: newCoach.barcode,
        avatarUrl: newCoach.avatarUrl,
        coachId: newCoach.id,
      };
      onAddUser(newUser);
    }

    setShowAddCoachModal(false);
    showToast(
      `Pelatih "${newCoach.name}" berhasil ditambahkan! Username: @${finalUsername}, Password: ${finalPassword}, Barcode: ${finalBarcode}.`,
      'success'
    );
  };

  const handleOpenEditUser = (user: AuthUser) => {
    setEditingUser(user);
    setEditUserData({
      id: user.id,
      name: user.name,
      username: user.username || user.email.split('@')[0].toLowerCase(),
      password: user.password || 'tirta123',
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      avatarUrl: user.avatarUrl || '',
      studentId: user.studentId || '',
      coachId: user.coachId || '',
      barcode: user.barcode || '',
    });
  };

  const handleUpdateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const finalUsername = editUserData.username.trim()
      ? editUserData.username.trim().toLowerCase().replace(/\s+/g, '_')
      : editUserData.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');

    const finalPassword = editUserData.password.trim() || editingUser.password || 'tirta123';

    const updatedUser: AuthUser = {
      ...editingUser,
      name: editUserData.name.trim(),
      username: finalUsername,
      password: finalPassword,
      email: editUserData.email.trim().toLowerCase(),
      role: editUserData.role,
      phone: editUserData.phone.trim() || undefined,
      avatarUrl: editUserData.avatarUrl.trim() || editingUser.avatarUrl,
      studentId: editUserData.studentId.trim() || undefined,
      coachId: editUserData.coachId.trim() || undefined,
      barcode: editUserData.barcode.trim() || undefined,
    };

    onUpdateUser(updatedUser);
    setEditingUser(null);
    showToast(`Akun pengguna "${updatedUser.name}" (@${updatedUser.username}) berhasil diperbarui!`, 'success');
  };

  const handleConfirmDeleteUser = () => {
    if (!deletingUser) return;
    onDeleteUser(deletingUser.id);
    showToast(`Akun pengguna "${deletingUser.name}" berhasil dihapus.`, 'info');
    setDeletingUser(null);
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowUserPasswordMap((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleCreateAttendanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === newAttendanceData.studentId);
    if (!st) return;

    const targetDate = newAttendanceData.dateStr || todayStr;

    // CEK DUPLIKAT ABSEN DI HARI YANG SAMA
    const alreadyAttended = attendances.find(
      (a) => a.studentId === st.id && a.dateStr === targetDate
    );

    if (alreadyAttended) {
      alert(`⚠️ PERINGATAN: Siswa "${st.name}" (${st.barcode}) SUDAH DIABSEN pada tanggal ${targetDate} (pukul ${alreadyAttended.timeStr}, Status: ${alreadyAttended.status.toUpperCase()})!\n\nSistem secara otomatis mencegah pencatatan absensi ganda (double absen) pada hari yang sama.`);
      return;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';

    const newAtt: AttendanceRecord = {
      id: `att-${Date.now()}`,
      studentId: st.id,
      studentName: st.name,
      roleClass: st.roleClass,
      dateStr: targetDate,
      timeStr,
      coachId: 'c1',
      coachName: 'Admin / Head Coach',
      status: newAttendanceData.status,
      poolLane: newAttendanceData.poolLane,
      verifiedByBarcode: false,
      notes: newAttendanceData.notes || 'Input Absen Manual',
    };

    onAddAttendance(newAtt);
    setShowAddAttendanceModal(false);
    showToast(`Presensi untuk "${st.name}" berhasil dicatat!`, 'success');
  };

  // Edit Single Attendance Handlers
  const handleOpenEditAttendance = (att: AttendanceRecord) => {
    setEditingAttendance(att);
    setEditAttendanceData({
      id: att.id,
      studentId: att.studentId,
      studentName: att.studentName,
      dateStr: att.dateStr,
      timeStr: att.timeStr,
      status: att.status,
      poolLane: att.poolLane,
      coachName: att.coachName,
      notes: att.notes || '',
    });
  };

  const handleUpdateAttendanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAttendance) return;

    // If changing date, verify it does not conflict with another attendance of the same student on the new date
    if (editAttendanceData.dateStr !== editingAttendance.dateStr) {
      const conflict = attendances.find(
        (a) =>
          a.id !== editingAttendance.id &&
          a.studentId === editingAttendance.studentId &&
          a.dateStr === editAttendanceData.dateStr
      );
      if (conflict) {
        alert(`Perhatian: Siswa sudah memiliki data presensi lain pada tanggal ${editAttendanceData.dateStr}! Tidak dapat menduplikasi absensi.`);
        return;
      }
    }

    const updated: AttendanceRecord = {
      ...editingAttendance,
      dateStr: editAttendanceData.dateStr,
      timeStr: editAttendanceData.timeStr,
      status: editAttendanceData.status,
      poolLane: editAttendanceData.poolLane,
      coachName: editAttendanceData.coachName,
      notes: editAttendanceData.notes,
    };

    onUpdateAttendance(updated);
    setEditingAttendance(null);
    showToast(`Data absensi "${updated.studentName}" berhasil diperbarui!`, 'success');
  };

  const handleDeleteAttendanceClick = (att: AttendanceRecord) => {
    if (
      window.confirm(
        `Apakah Anda yakin ingin menghapus catatan absensi:\n"${att.studentName}" pada tanggal ${att.dateStr} (${att.timeStr})?\n\nJika absensi ini berstatus Hadir, kuota pertemuan siswa akan otomatis disesuaikan kembali.`
      )
    ) {
      onDeleteAttendance(att.id);
      showToast(`Catatan absensi "${att.studentName}" berhasil dihapus.`, 'info');
    }
  };

  // Edit Total Attendance & Quota Handlers
  const handleOpenEditTotal = (st: Student) => {
    const executed = getStudentExecutedAttendance(st);
    const effectiveTotal = getEffectiveStudentQuota(st, pricingPackages);
    const calculatedRemaining = Math.max(0, effectiveTotal - executed);
    setEditingTotalAttendanceStudent(st);
    setEditTotalData({
      studentId: st.id,
      executedSessions: executed,
      totalQuota: effectiveTotal,
      remainingQuota: calculatedRemaining,
      notes: '',
    });
  };

  const handleSaveTotalAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTotalAttendanceStudent) return;

    const total = Math.max(1, Number(editTotalData.totalQuota));
    const executed = Math.max(0, Number(editTotalData.executedSessions));
    const remaining = Math.max(0, Number(editTotalData.remainingQuota));

    onUpdateTotalAttendance(
      editingTotalAttendanceStudent.id,
      executed,
      total,
      remaining
    );

    setEditingTotalAttendanceStudent(null);
    showToast(`Total absen & kuota siswa "${editingTotalAttendanceStudent.name}" berhasil diperbarui!`, 'success');
  };

  const handleResetAttendanceClick = (st: Student) => {
    if (
      window.confirm(
        `⚠️ KONFIRMASI RESET TOTAL ABSENSI:\n\nApakah Anda yakin ingin MENGHAPUS SEMUA riwayat absensi siswa "${st.name}" (${st.barcode})?\n\nSemua log absensi siswa ini akan dihapus dan sisa kuota akan dikembalikan penuh ke ${st.totalQuota} pertemuan.`
      )
    ) {
      onResetStudentAttendance(st.id);
      setEditingTotalAttendanceStudent(null);
      showToast(`Semua riwayat absensi untuk "${st.name}" berhasil di-reset.`, 'info');
    }
  };

  const formatRupiah = (amount: number) => {
    return 'Rp ' + amount.toLocaleString('id-ID');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner & Quick Actions */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 text-white shadow-xl border border-indigo-500/20">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-semibold mb-3">
              <Waves className="w-3.5 h-3.5" /> Tirta Samudra Swimming Academy Management
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Dashboard Administrator</h1>
            <p className="text-sm text-cyan-100/70 mt-1 max-w-xl">
              Pusat manajemen terpadu: pantau total siswa tiap kelas, grafik pendapatan, rekap absensi, pembayaran SPP/paket, dan kontrol hak akses user.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenScanner}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <ScanLine className="w-4 h-4" />
              Scanner Presensi Kamera
            </button>
            <button
              onClick={onOpenSheets}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Google Sheets Sync
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Total Siswa & Grafik Pendapatan</span>
        </button>

        <button
          onClick={() => setActiveTab('profiles')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'profiles'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Manajemen Profil Peserta ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'attendance'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Absen & Total Absen ({totalAttendances})</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap relative ${
            activeTab === 'payments'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Pembayaran & Kasir ({payments.length})</span>
          {pendingProofCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-slate-950 font-black animate-pulse flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
              <span>{pendingProofCount} Bukti Baru</span>
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'pricing'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Menejemen Pertemuan & Harga ({pricingPackages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <UserCog className="w-4 h-4" />
          <span>Manajemen User ({appUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('registrations')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'registrations'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Pendaftaran Murid Baru</span>
          {registrations.filter((r) => r.status === 'pending').length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-slate-950 font-black animate-pulse">
              {registrations.filter((r) => r.status === 'pending').length} Baru
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Profil Publik &amp; Pengaturan</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: TOTAL SISWA SETIAP KELAS & GRAFIK PENDAPATAN      */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Alert Banner for New Registrations */}
          {registrations.filter((r) => r.status === 'pending').length > 0 && (
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 border-2 border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fadeIn">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shrink-0 shadow-md shadow-amber-500/20">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{registrations.filter((r) => r.status === 'pending').length} Calon Murid Baru Menunggu Persetujuan!</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase">
                      Pendaftaran Online
                    </span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Calon siswa telah mengisi formulir online di halaman profil. Klik tombol untuk memverifikasi biodata, WhatsApp, dan membuat akun siswa otomatis.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('registrations')}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2 shrink-0 transition-all"
              >
                <span>Buka Kotak Masuk Pendaftaran</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Top Key Performance Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Siswa Akademi</p>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{students.length}</h3>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" /> 6 Kelas Aktif
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Pendapatan Lunas</p>
                <h3 className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatRupiah(totalRevenue)}
                </h3>
                <span className="text-[11px] font-semibold text-slate-500 mt-1">
                  Bulan Oktober 2026
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Absen Dilaksanakan</p>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {totalExecutedAllStudents} <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Sesi</span>
                </h3>
                <span className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 mt-1">
                  Rata-rata {avgExecutedPerStudent} sesi / peserta
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <CalendarCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Tagihan Menunggu</p>
                <h3 className="text-xl sm:text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                  {formatRupiah(pendingRevenue)}
                </h3>
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-1">
                  {payments.filter((p) => p.status === 'menunggu').length} Invoice Menunggu
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Receipt className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* 1. TOTAL SISWA SETIAP KELAS (VISUAL CARDS) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-500" />
                  Total Siswa Setiap Kelas Renang
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Rincian alokasi dan kapasitas murid di masing-masing tingkatan
                </p>
              </div>
              <button
                onClick={() => setShowAddStudentModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Siswa Baru
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {classBreakdown.map((item) => {
                const totalInClass = item.count;
                const percentage = students.length > 0 ? Math.round((totalInClass / students.length) * 100) : 0;
                return (
                  <div
                    key={item.role}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md inline-block mb-2 ${item.bg}`}>
                        {item.text}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.label}</h4>
                      <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                        {totalInClass} <span className="text-xs font-normal text-slate-400">Siswa</span>
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700/60">
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span>Porsi:</span>
                        <span className="font-bold text-cyan-600 dark:text-cyan-400">{percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TOTAL ABSEN SETIAP PESERTA: JUMLAH YANG SUDAH DILAKSANAKAN */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-emerald-500" />
                  Total Absen Setiap Peserta (Jumlah yang Sudah Dilaksanakan)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Rekap akumulasi pertemuan renang yang telah berhasil dilaksanakan dan diselesaikan oleh setiap siswa
                </p>
              </div>

              <button
                onClick={() => setActiveTab('attendance')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer transition-colors"
              >
                <span>Buka Detail Absen & Presensi</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {students.map((st) => {
                const effectiveTotal = getEffectiveStudentQuota(st, pricingPackages);
                const executedCount = getStudentExecutedAttendance(st);
                const remaining = Math.max(0, effectiveTotal - executedCount);
                const percent = effectiveTotal > 0 ? Math.min(100, Math.round((executedCount / effectiveTotal) * 100)) : 0;
                const roleMeta = ROLE_LABELS[st.roleClass];

                return (
                  <div
                    key={st.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={st.avatarUrl}
                            alt={st.name}
                            className="w-10 h-10 rounded-xl object-cover border border-cyan-400/30 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                              {st.name}
                            </h4>
                            <span className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">
                              {st.barcode}
                            </span>
                          </div>
                        </div>

                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border flex-shrink-0 ${roleMeta.badgeBg}`}>
                          {roleMeta.textBadge}
                        </span>
                      </div>

                      {/* Jumlah yang sudah dilaksanakan */}
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 mt-2">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-slate-500 text-[11px]">Total Absen:</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            {executedCount} Sesi Dilaksanakan
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                          <span>Sisa: {remaining} sesi</span>
                          <span>Paket: {effectiveTotal} sesi ({percent}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MENEJEMEN PERTEMUAN & HARGA BULANAN (PEMULA & PRESTASI) PREVIEW BANNER */}
          <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 rounded-3xl border border-cyan-800/40 p-6 text-white shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-bold">
                  <Coins className="w-3.5 h-3.5" />
                  <span>SISTEM PEMBAYARAN BULANAN RESMI</span>
                </div>
                <h3 className="text-lg font-extrabold text-white">
                  Menejemen Pertemuan & Iuran Bulanan (Pemula & Prestasi)
                </h3>
                <p className="text-xs text-slate-300 max-w-xl">
                  Kelas Pemula: <strong>{formatRupiah(pemulaPkg.price)}/bln</strong> ({pemulaPkg.sessionsCount} Sesi) • Kelas Prestasi: <strong>{formatRupiah(prestasiPkg.price)}/bln</strong> ({prestasiPkg.sessionsCount} Sesi). Jatuh tempo tanggal 5 setiap bulan.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('pricing')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Coins className="w-4 h-4" />
                  <span>Kelola Pertemuan & Harga</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 2. GRAFIK PENDAPATAN (REVENUE ANALYTICS) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Trend SVG Bar Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    Grafik Tren Pendapatan Akademi (Mei - Oktober 2026)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Pertumbuhan iuran SPP dan paket privat renang 6 bulan terakhir
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  +10.2% Pertumbuhan Bulan Ini
                </span>
              </div>

              {/* SVG Bar Chart Visualization */}
              <div className="h-64 w-full flex items-end justify-between gap-3 pt-8 pb-2 px-2 border-b border-slate-200 dark:border-slate-800">
                {revenueTrend.map((dp, i) => {
                  const maxRevenue = 20000000;
                  const heightPercent = Math.round((dp.revenue / maxRevenue) * 100);
                  const isCurrentMonth = i === revenueTrend.length - 1;
                  return (
                    <div key={dp.month} className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1 font-mono whitespace-nowrap">
                        {formatRupiah(dp.revenue)}
                      </div>
                      <div
                        className={`w-full max-w-[42px] rounded-t-xl transition-all duration-500 group-hover:brightness-110 shadow-md ${
                          isCurrentMonth
                            ? 'bg-gradient-to-t from-cyan-600 to-emerald-400 shadow-emerald-500/20'
                            : 'bg-gradient-to-t from-slate-300 to-slate-400 dark:from-slate-800 dark:to-cyan-600/60'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      ></div>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-2">
                        {dp.month}
                      </span>
                      <span className="text-[10px] text-slate-400">{dp.totalStudents} Siswa</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-4 pt-2">
                <span>Target Pendapatan Q4: <strong className="text-slate-900 dark:text-white">Rp 20.000.000 / bln</strong></span>
                <span>Rata-rata Pendapatan per Siswa: <strong className="text-slate-900 dark:text-white">{formatRupiah(Math.round(totalRevenue / students.length))}</strong></span>
              </div>
            </div>

            {/* Income breakdown by Swimming Package */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                  <CreditCard className="w-5 h-5 text-indigo-500" />
                  Distribusi Pendapatan Paket
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Kontribusi pemasukan per kategori les renang
                </p>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-purple-600 dark:text-purple-400">Paket Privat (4, 8, 12 Sesi)</span>
                      <span>{formatRupiah(4700000)} (26%)</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: '26%' }}></div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-cyan-600 dark:text-cyan-400">Kelas Pemula (Teknik 25m)</span>
                      <span>{formatRupiah(900000)} (15%)</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-amber-600 dark:text-amber-400">Kelas Prestasi & Atlet</span>
                      <span>{formatRupiah(1300000)} (20%)</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '20%' }}></div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-sky-600 dark:text-sky-400">Kelas Dasar (Adaptasi Air)</span>
                      <span>{formatRupiah(700000)} (12%)</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-sky-500 h-full rounded-full" style={{ width: '12%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('payments')}
                className="mt-4 w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Lihat Semua Invoice & Kwitansi</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: MANAJEMEN PROFIL PESERTA                           */}
      {/* ======================================================== */}
      {activeTab === 'profiles' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Controls: Search, Filter, Add */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari nama siswa, barcode, wali..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
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

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPrivacyMaskActive(!privacyMaskActive)}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  privacyMaskActive
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
                title="Sensor Privasi: Nomor telepon disamarkan, wali disembunyikan 'xxx', tgl lahir disamarkan (kecuali di KTA)"
              >
                {privacyMaskActive ? (
                  <>
                    <Shield className="w-3.5 h-3.5 text-amber-500" />
                    <span>Privasi Aktif (xxx)</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>Buka Sensor</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowAddStudentModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Pendaftaran Peserta Baru
              </button>
            </div>
          </div>

          {/* Participant Profiles Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students
              .filter((s) => {
                const matchSearch =
                  s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  s.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  s.parentName.toLowerCase().includes(searchTerm.toLowerCase());
                const matchRole = selectedRoleFilter === 'all' || s.roleClass === selectedRoleFilter;
                return matchSearch && matchRole;
              })
              .map((st) => {
                const roleMeta = ROLE_LABELS[st.roleClass];
                const effectiveTotal = getEffectiveStudentQuota(st, pricingPackages);
                const executedCount = getStudentExecutedAttendance(st);
                const remainingCount = Math.max(0, effectiveTotal - executedCount);
                const quotaPercent = effectiveTotal > 0 ? Math.min(100, Math.round((executedCount / effectiveTotal) * 100)) : 0;
                return (
                  <div
                    key={st.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-cyan-500/40 transition-all"
                  >
                    <div>
                      {/* Top Header Card */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={st.avatarUrl}
                            alt={st.name}
                            className="w-12 h-12 rounded-2xl object-cover border-2 border-cyan-400/40 shadow-sm"
                          />
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{st.name}</h4>
                            <span className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">
                              {st.barcode}
                            </span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${roleMeta.badgeBg}`}>
                          {roleMeta.textBadge}
                        </span>
                      </div>

                      {/* Participant Profile Details */}
                      <div className="space-y-2 text-xs py-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                          <span className="text-slate-400">Usia & Tgl Lahir:</span>
                          <span className="font-semibold">
                            {st.age} Th •{' '}
                            {privacyMaskActive
                              ? maskBirthDate(st.birthDate)
                              : st.birthDate || 'xx-xx-xxxx'}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                          <span className="text-slate-400">Orang Tua / Wali:</span>
                          <span className="font-semibold font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                            {privacyMaskActive ? maskParentName(st.parentName) : st.parentName}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                          <span className="text-slate-400">WhatsApp / HP:</span>
                          <span className="font-mono">
                            {privacyMaskActive ? maskPhone(st.phone) : st.phone}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                          <span className="text-slate-400">Kontak Darurat:</span>
                          <span className="font-mono font-semibold">
                            {privacyMaskActive ? maskPhone(st.emergencyContact) : st.emergencyContact}
                          </span>
                        </div>
                      </div>

                      {/* Quota Sesi & Total Absen Dilaksanakan */}
                      <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center text-xs font-bold mb-1">
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Total Absen Dilaksanakan:
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                            {executedCount} Sesi Selesai
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                          <span>Sisa Kuota: {remainingCount} Pertemuan</span>
                          <span>Total Paket: {effectiveTotal} Pertemuan</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full rounded-full"
                            style={{
                              width: `${quotaPercent}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Catatan Pelatih / Medis */}
                      {st.notes && (
                        <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 italic bg-amber-50 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/30">
                          "{st.notes}"
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => onViewBarcode(st)}
                        className="flex-1 py-2 px-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 text-cyan-700 dark:text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Cetak Swim Pass</span>
                      </button>

                      <button
                        onClick={() => setEditingStudent(st)}
                        title="Edit Profil Peserta"
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteStudent(st.id)}
                        title="Hapus Siswa"
                        className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: ABSEN & TOTAL ABSEN                                */}
      {/* ======================================================== */}
      {activeTab === 'attendance' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Total Absen Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">Total Absen Dilaksanakan</span>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {totalExecutedAllStudents} <span className="text-xs font-bold">Sesi</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Sudah diselesaikan peserta</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">Rata-rata per Peserta</span>
              <h3 className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-1">
                {avgExecutedPerStudent} <span className="text-xs font-bold">Sesi</span>
              </h3>
              <p className="text-[11px] text-cyan-600 dark:text-cyan-400 mt-0.5">Partisipasi pertemuan</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">Presensi Hari Ini</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{todayAttendances.length}</h3>
              <p className="text-[11px] text-emerald-600 mt-0.5">Terverifikasi Barcode Kolam</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">Total Peserta Aktif</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{students.length}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Siswa akademi terdaftar</p>
            </div>
          </div>

          {/* ======================================================== */}
          {/* REKAP TOTAL ABSEN SETIAP PESERTA (JUMLAH YANG SUDAH DILAKSANAKAN) */}
          {/* ======================================================== */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Total Absen Setiap Peserta (Jumlah yang Sudah Dilaksanakan)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Daftar rinci jumlah pertemuan/sesi yang telah dilaksanakan dan diselesaikan oleh masing-masing peserta
                </p>
              </div>

              {/* Filter & Search Peserta */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={participantSearchTerm}
                    onChange={(e) => setParticipantSearchTerm(e.target.value)}
                    placeholder="Cari nama siswa / barcode..."
                    className="pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 w-48 sm:w-56"
                  />
                </div>

                <select
                  value={participantClassFilter}
                  onChange={(e) => setParticipantClassFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
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

            {/* Table Rekap Total Absen Peserta */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Nama Peserta</th>
                    <th className="py-3 px-4">Kelas Renang</th>
                    <th className="py-3 px-4 text-center">Total Absen Dilaksanakan</th>
                    <th className="py-3 px-4">Progress Keterlaksanaan</th>
                    <th className="py-3 px-4 text-center">Sisa Pertemuan</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {students
                    .filter((st) => {
                      const matchSearch =
                        st.name.toLowerCase().includes(participantSearchTerm.toLowerCase()) ||
                        st.barcode.toLowerCase().includes(participantSearchTerm.toLowerCase());
                      const matchClass =
                        participantClassFilter === 'all' || st.roleClass === participantClassFilter;
                      return matchSearch && matchClass;
                    })
                    .map((st) => {
                      const effectiveTotalQuota = getEffectiveStudentQuota(st, pricingPackages);
                      const executedCount = getStudentExecutedAttendance(st);
                      const remainingCount = Math.max(0, effectiveTotalQuota - executedCount);
                      const percent =
                        effectiveTotalQuota > 0
                          ? Math.min(100, Math.round((executedCount / effectiveTotalQuota) * 100))
                          : 0;
                      const roleMeta = ROLE_LABELS[st.roleClass];
                      const isCompleted = remainingCount <= 0 || executedCount >= effectiveTotalQuota;

                      return (
                        <tr
                          key={st.id}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={st.avatarUrl}
                                alt={st.name}
                                className="w-9 h-9 rounded-xl object-cover border border-cyan-400/40 flex-shrink-0"
                              />
                              <div>
                                <p className="font-extrabold text-slate-900 dark:text-white">
                                  {st.name}
                                </p>
                                <span className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">
                                  {st.barcode}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${roleMeta.badgeBg}`}
                            >
                              {roleMeta.textBadge}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setViewingStudentAttendanceHistory(st);
                                setHistorySearchTerm('');
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs sm:text-sm border border-emerald-500/30 shadow-sm transition-all cursor-pointer group"
                              title="Klik untuk melihat semua riwayat absensi siswa ini dan hapus jika ada kesalahan"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                              <span>{executedCount} Sesi Dilaksanakan</span>
                              <span className="text-[10px] bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 px-1.5 py-0.5 rounded-md font-bold ml-1">
                                Riwayat
                              </span>
                            </button>
                          </td>

                          <td className="py-3.5 px-4 min-w-[150px]">
                            <div className="flex justify-between text-[11px] font-semibold mb-1">
                              <span className="text-slate-600 dark:text-slate-300 font-medium">
                                {executedCount} dari {effectiveTotalQuota} Pertemuan
                              </span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                {percent}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isCompleted ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                                }`}
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-center font-bold">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-xs font-black inline-flex items-center gap-1 ${
                                isCompleted
                                  ? 'bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400'
                                  : remainingCount <= 2
                                  ? 'bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300'
                                  : 'bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400'
                              }`}
                            >
                              <span>{remainingCount} Pertemuan</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            {isCompleted ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 inline-flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Selesai (Habis)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Berjalan ({remainingCount} Sisa)
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setViewingStudentAttendanceHistory(st);
                                  setHistorySearchTerm('');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                                title="Tampilkan Semua Riwayat Absensi & Hapus Kesalahan"
                              >
                                <History className="w-3 h-3" />
                                Riwayat
                              </button>
                              <button
                                onClick={() => onViewBarcode(st)}
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                                title="Lihat Barcode Kartu Presensi"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenEditTotal(st)}
                                className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                                title="Edit Total Absen Selesai & Kuota Siswa"
                              >
                                <Edit className="w-3 h-3" />
                                Edit Total
                              </button>
                              <button
                                onClick={() => {
                                  setNewAttendanceData((prev) => ({ ...prev, studentId: st.id, dateStr: todayStr }));
                                  setShowAddAttendanceModal(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] transition-colors cursor-pointer"
                              >
                                + Absen
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SUB-VIEW NAVIGATION: SIAPA SAJA MASUK HARI INI vs SEMUA RIWAYAT */}
          {/* ======================================================== */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setAttendanceSubView('today')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  attendanceSubView === 'today'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300'
                }`}
              >
                <Waves className="w-4 h-4" />
                <span>Siapa Saja Masuk Hari Ini</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  attendanceSubView === 'today' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  {todayAttendances.length} Siswa
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAttendanceSubView('all')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  attendanceSubView === 'all'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Semua Riwayat Presensi</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  attendanceSubView === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  {attendances.length}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2 pr-1">
              <button
                onClick={() => {
                  setNewAttendanceData((prev) => ({ ...prev, dateStr: todayStr }));
                  setShowAddAttendanceModal(true);
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Input Absen Manual
              </button>

              <button
                onClick={onOpenScanner}
                className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-600/20"
              >
                <ScanLine className="w-3.5 h-3.5" />
                Scanner Kamera
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* VIEW 1: DAFTAR SIAPA SAJA YANG MASUK HARI INI            */}
          {/* ======================================================== */}
          {attendanceSubView === 'today' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Today's Highlight Summary Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-slate-900/5 dark:to-slate-900 border border-cyan-500/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      Daftar Siswa Masuk & Diabsen Hari Ini
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Tanggal:{' '}
                    <span className="font-bold text-cyan-600 dark:text-cyan-400">
                      {new Date().toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    Proteksi Ganda Aktif: Siswa yang sudah diabsen hari ini tidak dapat diabsen ganda.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Total Masuk</p>
                    <p className="text-lg font-black text-cyan-600 dark:text-cyan-400">{todayAttendances.length}</p>
                  </div>
                  <div className="px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Hadir</p>
                    <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      {todayAttendances.filter((a) => a.status === 'hadir').length}
                    </p>
                  </div>
                  <div className="px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Izin / Alpa</p>
                    <p className="text-lg font-black text-amber-600 dark:text-amber-400">
                      {todayAttendances.filter((a) => a.status !== 'hadir').length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Search Bar for Today's Attendees */}
              <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={todaySearchTerm}
                    onChange={(e) => setTodaySearchTerm(e.target.value)}
                    placeholder="Cari siswa masuk hari ini (nama / barcode)..."
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                {todaySearchTerm && (
                  <button
                    onClick={() => setTodaySearchTerm('')}
                    className="text-xs text-rose-500 hover:underline cursor-pointer"
                  >
                    Reset Pencarian
                  </button>
                )}
              </div>

              {/* Table of Today's Attendees */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4">Siswa Masuk Hari Ini</th>
                        <th className="py-3.5 px-4">Kelas Renang</th>
                        <th className="py-3.5 px-4">Waktu Masuk</th>
                        <th className="py-3.5 px-4">Jalur Kolam</th>
                        <th className="py-3.5 px-4">Metode Presensi</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Pelatih</th>
                        <th className="py-3.5 px-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {todayAttendances
                        .filter((att) => {
                          if (!todaySearchTerm) return true;
                          const term = todaySearchTerm.toLowerCase();
                          return (
                            att.studentName.toLowerCase().includes(term) ||
                            (att.studentId && att.studentId.toLowerCase().includes(term))
                          );
                        })
                        .map((att) => {
                          const studentObj = students.find((s) => s.id === att.studentId);
                          return (
                            <tr
                              key={att.id}
                              className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                            >
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  {studentObj && (
                                    <img
                                      src={studentObj.avatarUrl}
                                      alt={att.studentName}
                                      className="w-8 h-8 rounded-xl object-cover border border-cyan-400/40 flex-shrink-0"
                                    />
                                  )}
                                  <div>
                                    <p className="font-extrabold text-slate-900 dark:text-white">{att.studentName}</p>
                                    <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono font-bold">
                                      {studentObj ? studentObj.barcode : att.studentId}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 uppercase">
                                  {att.roleClass.replace('_', ' ')}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 font-mono">
                                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                                  <Clock className="w-3.5 h-3.5 text-cyan-500" />
                                  <span>{att.timeStr}</span>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">{att.poolLane}</td>

                              <td className="py-3.5 px-4">
                                {att.verifiedByBarcode ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                    <ScanLine className="w-3 h-3" /> Scan Barcode Kamera
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-slate-500">Manual Entry</span>
                                )}
                              </td>

                              <td className="py-3.5 px-4">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    att.status === 'hadir'
                                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                      : att.status === 'izin'
                                      ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                      : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                                  }`}
                                >
                                  {att.status}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                                {att.coachName}
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleOpenEditAttendance(att)}
                                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-cyan-50 hover:text-cyan-600 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                                    title="Edit Absen Siswa Ini"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAttendanceClick(att)}
                                    className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                                    title="Hapus Absen Siswa Ini"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}

                      {todayAttendances.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-400">
                            <Waves className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2 animate-bounce" />
                            <p className="font-bold text-sm text-slate-600 dark:text-slate-300">
                              Belum ada siswa yang masuk / diabsen hari ini
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              Gunakan Scanner Barcode Kamera di tepi kolam atau tombol Input Absen Manual.
                            </p>
                            <div className="flex items-center justify-center gap-2 mt-4">
                              <button
                                onClick={onOpenScanner}
                                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer"
                              >
                                Buka Scanner Kamera
                              </button>
                              <button
                                onClick={() => {
                                  setNewAttendanceData((prev) => ({ ...prev, dateStr: todayStr }));
                                  setShowAddAttendanceModal(true);
                                }}
                                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
                              >
                                Input Absen Manual
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 2: SEMUA RIWAYAT PRESENSI & LOG HISTORI              */}
          {/* ======================================================== */}
          {attendanceSubView === 'all' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Filters & Actions Bar */}
              <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Filter Tanggal:</span>
                  </div>

                  <input
                    type="date"
                    value={attendanceDateFilter}
                    onChange={(e) => setAttendanceDateFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs dark:border-slate-700"
                  />

                  {attendanceDateFilter && (
                    <button
                      onClick={() => setAttendanceDateFilter('')}
                      className="text-xs text-rose-500 hover:underline cursor-pointer font-bold"
                    >
                      Reset Filter Tanggal
                    </button>
                  )}
                </div>

                <span className="text-xs text-slate-400">
                  Menampilkan{' '}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {attendances.filter((att) => !attendanceDateFilter || att.dateStr === attendanceDateFilter).length}
                  </strong>{' '}
                  dari {attendances.length} Log Presensi
                </span>
              </div>

              {/* Attendance Table */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4">Siswa</th>
                        <th className="py-3.5 px-4">Kelas</th>
                        <th className="py-3.5 px-4">Tanggal & Jam</th>
                        <th className="py-3.5 px-4">Jalur Kolam</th>
                        <th className="py-3.5 px-4">Metode Presensi</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Pelatih</th>
                        <th className="py-3.5 px-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {attendances
                        .filter((att) => !attendanceDateFilter || att.dateStr === attendanceDateFilter)
                        .map((att) => (
                          <tr key={att.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-4">
                              <p className="font-bold text-slate-900 dark:text-white">{att.studentName}</p>
                              <span className="text-[10px] text-slate-400 font-mono">{att.studentId}</span>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 uppercase">
                                {att.roleClass.replace('_', ' ')}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 font-mono">
                              <p className="font-bold text-slate-800 dark:text-slate-200">{att.dateStr}</p>
                              <p className="text-[11px] text-cyan-600 dark:text-cyan-400">{att.timeStr}</p>
                            </td>

                            <td className="py-3.5 px-4">{att.poolLane}</td>

                            <td className="py-3.5 px-4">
                              {att.verifiedByBarcode ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                  <ScanLine className="w-3 h-3" /> Scan Barcode Kamera
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-500">Manual Entry</span>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  att.status === 'hadir'
                                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                    : att.status === 'izin'
                                    ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                    : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                                }`}
                              >
                                {att.status}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                              {att.coachName}
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditAttendance(att)}
                                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-cyan-50 hover:text-cyan-600 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                                  title="Edit Data Absensi"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteAttendanceClick(att)}
                                  className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                                  title="Hapus Data Absensi"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: PEMBAYARAN & KASIR (BILLING)                       */}
      {/* ======================================================== */}
      {activeTab === 'payments' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Attention Banner for Pending Transfer Proofs */}
          {pendingProofCount > 0 && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border-2 border-amber-500/40 dark:bg-amber-950/20 shadow-lg shadow-amber-500/5 animate-fadeIn">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Receipt className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                        Notifikasi Kasir
                      </span>
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                        {pendingProofCount} Bukti Pembayaran Baru Diunggah Wali Atlet
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                      Wali Atlet Menunggu Verifikasi Transfer & Penambahan Kuota
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Klik <strong>"Verifikasi & Tambah Kuota"</strong> untuk otomatis mengubah status menjadi lunas dan mengisi sesi latihan ke barcode siswa.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPaymentStatusFilter('menunggu_bukti')}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer flex-shrink-0"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filter {pendingProofCount} Bukti Transfer</span>
                </button>
              </div>

              {/* Quick cards for pending proof payments */}
              <div className="mt-4 pt-4 border-t border-amber-500/20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {pendingProofPayments.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-900/60 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                          {p.invoiceNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-extrabold border border-amber-500/20">
                          {p.transferBankName || 'Transfer'}
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">
                        {p.studentName}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {p.packageName} (+{p.sessionsToAdd || 12} sesi)
                      </p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                        Rp {p.amount.toLocaleString('id-ID')}
                        {p.senderAccountName && (
                          <span className="text-[10px] font-normal text-slate-500 block">
                            a/n {p.senderAccountName}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setViewingAdminProof(p)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-500" />
                        <span>Lihat Bukti</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAdminVerifyProof(p.id)}
                        disabled={verifyingPaymentId === p.id}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-extrabold shadow-sm flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verifikasi (+{p.sessionsToAdd || 12} Sesi)</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Billing Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Penerimaan Lunas</p>
                <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatRupiah(totalRevenue)}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {payments.filter((p) => p.status === 'lunas').length} Transaksi Terkonfirmasi
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Tagihan Menunggu Verifikasi</p>
                <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                  {formatRupiah(pendingRevenue)}
                </h3>
                <p className="text-[11px] text-amber-600 mt-0.5">
                  {payments.filter((p) => p.status === 'menunggu').length} Tagihan Tertunda
                  {pendingProofCount > 0 && ` (${pendingProofCount} ada bukti transfer)`}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Total Invoice Diterbitkan</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {payments.length} Faktur
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Musim Les Oktober 2026</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Receipt className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Notifikasi Siswa Yang Telah Menyelesaikan Sesi Pertemuan (Kuota Habis) */}
          {(() => {
            const finishedStudents = students.filter((s) => {
              const total = getEffectiveStudentQuota(s, pricingPackages);
              const executed = getStudentExecutedAttendance(s);
              const rem = Math.max(0, total - executed);
              return (s.remainingQuota !== undefined && s.remainingQuota <= 0) || rem <= 0 || executed >= total;
            });
            if (finishedStudents.length === 0) return null;

            return (
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-orange-500/10 border-2 border-rose-500/30 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fadeIn">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Notifikasi: {finishedStudents.length} Siswa Telah Menyelesaikan Seluruh Sesi Latihan
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                        Kuota Habis
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      Siswa berikut telah menyelesaikan seluruh kuota pertemuannya. Silakan hubungi orang tua / wali atau catat perpanjangan iuran:
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                      {finishedStudents.map((st) => {
                        const total = getEffectiveStudentQuota(st, pricingPackages);
                        const executed = getStudentExecutedAttendance(st);
                        return (
                          <span
                            key={st.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/60 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-xs"
                          >
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                            <span>{st.name}</span>
                            <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 font-extrabold">
                              ({executed}/{total} Sesi Selesai)
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddPaymentModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Catat Pembayaran Perpanjangan</span>
                </button>
              </div>
            );
          })()}

          {/* Card Info & Pengaturan Rekening Bank Resmi (Transfer Wali) */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Pengaturan Nomor Rekening Bank Pembayaran (Transfer Siswa)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Nomor rekening yang dilihat oleh wali murid saat kuota habis &amp; melakukan pembayaran
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSetOnlyBriActive}
                  className="px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 text-[11px] font-bold border border-cyan-200 dark:border-cyan-800 transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                  title="Aktifkan rekening BRI saja dan nonaktifkan bank lain"
                >
                  <Zap className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Setel Hanya BRI Aktif</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowBankManagementModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Kelola Rekening ({effectiveBankAccounts.length})</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenAddBank}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Rekening</span>
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {effectiveBankAccounts.map((acc) => (
                <div
                  key={acc.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                    acc.isActive
                      ? 'border-cyan-400 dark:border-cyan-800 bg-cyan-50/40 dark:bg-cyan-950/20 ring-1 ring-cyan-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="font-mono text-xs font-black text-slate-900 dark:text-white">
                        {acc.bankName}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          acc.isActive
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {acc.isActive ? 'Aktif (Tampil)' : 'Non-aktif'}
                      </span>
                    </div>
                    <p className="text-sm font-mono font-black text-slate-900 dark:text-white mt-1.5 tracking-wide">
                      {acc.accountNumber}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      a/n {acc.accountHolder}
                    </p>
                    {acc.notes && (
                      <p className="text-[10px] text-slate-400 mt-1 italic truncate">
                        {acc.notes}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px]">
                    <button
                      type="button"
                      onClick={() => handleToggleBankActive(acc)}
                      className={`font-bold hover:underline cursor-pointer ${
                        acc.isActive ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {acc.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditBank(acc)}
                        className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 font-bold text-slate-700 dark:text-slate-300 cursor-pointer shadow-xs"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBank(acc.id, acc.bankName)}
                        className="px-2 py-1 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 font-bold cursor-pointer"
                        title="Hapus Rekening"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Table Controls */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase">Status:</span>
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="py-2 px-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs dark:border-slate-700 font-bold"
              >
                <option value="all">Semua Status</option>
                {pendingProofCount > 0 && (
                  <option value="menunggu_bukti">
                    ⚠️ Menunggu Verifikasi Bukti ({pendingProofCount})
                  </option>
                )}
                <option value="lunas">Lunas</option>
                <option value="menunggu">Menunggu Pembayaran</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowBankManagementModal(true)}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 font-bold text-xs shadow-xs cursor-pointer transition-all"
              >
                <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Pengaturan Rekening Bank ({effectiveBankAccounts.filter((b) => b.isActive).length} Aktif)</span>
              </button>

              <button
                onClick={() => setShowAddPaymentModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Catat Pembayaran Baru</span>
              </button>
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">No. Invoice</th>
                    <th className="py-3.5 px-4">Peserta Renang</th>
                    <th className="py-3.5 px-4">Paket / Kuota</th>
                    <th className="py-3.5 px-4">Sesi Latihan (Masuk / Total)</th>
                    <th className="py-3.5 px-4">Nominal</th>
                    <th className="py-3.5 px-4">Metode Bayar</th>
                    <th className="py-3.5 px-4">Bukti Transfer</th>
                    <th className="py-3.5 px-4">Tanggal</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {payments
                    .filter((p) => {
                      if (paymentStatusFilter === 'menunggu_bukti') {
                        return p.status === 'menunggu' && !!p.proofUrl;
                      }
                      if (paymentStatusFilter === 'all') return true;
                      return p.status === paymentStatusFilter;
                    })
                    .map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          {p.invoiceNumber}
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900 dark:text-white">{p.studentName}</p>
                          <span className="text-[10px] text-slate-400 capitalize">{p.roleClass.replace('_', ' ')}</span>
                        </td>

                        <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-300">
                          <div>
                            <span className="font-semibold">{p.packageName}</span>
                            {p.sessionsToAdd && (
                              <span className="block text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">
                                +{p.sessionsToAdd} Sesi
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Sesi Latihan (Masuk / Total) & Notifikasi Selesai */}
                        <td className="py-3.5 px-4">
                          {(() => {
                            const st = students.find((s) => s.id === p.studentId);
                            if (!st) {
                              return <span className="text-slate-400 font-mono text-[10px]">-</span>;
                            }
                            const executed = getStudentExecutedAttendance(st);
                            const total = getEffectiveStudentQuota(st, pricingPackages);
                            const remaining = Math.max(0, total - executed);
                            const isFinished = remaining <= 0 || executed >= total;
                            const percent = Math.min(100, Math.round((executed / total) * 100));

                            if (p.status !== 'lunas') {
                              return (
                                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                  Menunggu Bayar (+{p.sessionsToAdd || 12} Sesi)
                                </span>
                              );
                            }

                            return (
                              <div className="space-y-1 min-w-[150px]">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
                                    <CalendarCheck className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Masuk: {executed}x Latihan</span>
                                  </span>
                                  <span className="font-mono text-[10px] text-slate-500 font-bold">
                                    {executed}/{total}
                                  </span>
                                </div>

                                {/* Mini Progress bar */}
                                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      isFinished ? 'bg-rose-500' : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>

                                {isFinished ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-[10px] border border-rose-500/30">
                                    <AlertCircle className="w-3 h-3 text-rose-500" />
                                    <span>Pertemuan Selesai (Habis)</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>{remaining} Sesi Tersisa</span>
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white font-mono">
                          {formatRupiah(p.amount)}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold text-[10px] block w-fit">
                            {p.transferBankName ? `Transfer ${p.transferBankName}` : p.paymentMethod}
                          </span>
                          {p.senderAccountName && (
                            <span className="text-[10px] text-slate-500 block mt-0.5 truncate max-w-[120px]">
                              a/n {p.senderAccountName}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {p.proofUrl ? (
                            <button
                              type="button"
                              onClick={() => setViewingAdminProof(p)}
                              className="px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                            >
                              <Eye className="w-3 h-3 text-cyan-500" />
                              <span>Lihat Bukti</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[10px] italic">Kasir Langsung</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-500">{p.paymentDate}</td>

                        <td className="py-3.5 px-4">
                          <select
                            value={p.status}
                            onChange={(e) => onUpdatePaymentStatus(p.id, e.target.value as any)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase cursor-pointer border ${
                              p.status === 'lunas'
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            }`}
                          >
                            <option value="lunas">LUNAS</option>
                            <option value="menunggu">MENUNGGU</option>
                          </select>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {p.status === 'menunggu' && p.proofUrl && (
                              <button
                                type="button"
                                onClick={() => handleAdminVerifyProof(p.id)}
                                disabled={verifyingPaymentId === p.id}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] cursor-pointer shadow-sm transition-all"
                                title="Verifikasi dan Tambah Kuota Pertemuan"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Verifikasi (+{p.sessionsToAdd || 12})</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenEditPayment(p)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] cursor-pointer shadow-sm transition-all"
                              title="Edit Pembayaran"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeletePayment(p.id, p.invoiceNumber)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] cursor-pointer shadow-sm transition-all"
                              title="Hapus Pembayaran"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus</span>
                            </button>
                            <button
                              onClick={() => setSelectedReceipt(p)}
                              title="Cetak Kwitansi Pembayaran"
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: MENEJEMEN PERTEMUAN & HARGA (PEMULA & PRESTASI)    */}
      {/* ======================================================== */}
      {activeTab === 'pricing' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Header Action Banner */}
          <div className="p-6 bg-gradient-to-r from-cyan-900/90 via-slate-900 to-indigo-950 rounded-3xl border border-cyan-800/50 shadow-xl text-white relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
            <div className="absolute right-32 -bottom-16 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-bold mb-3">
                  <Coins className="w-3.5 h-3.5" />
                  <span>SISTEM IURAN BULANAN: PEMULA & PRESTASI</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Menejemen Pertemuan & Harga Kursus Renang
                </h2>
                <p className="text-xs sm:text-sm text-cyan-100/80 mt-1.5 leading-relaxed">
                  Konfigurasi kuota pertemuan bulanan, hari & jam latihan, durasi sesi, serta penetapan harga iuran rutin bulanan untuk kelas Pemula dan Prestasi.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => handleOpenAddPackage('pemula')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Paket Baru</span>
                </button>
              </div>
            </div>
          </div>

          {/* Top 4 KPI Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                  Iuran Bulanan Pemula
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {formatRupiah(pemulaPkg.price)}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {pemulaPkg.sessionsCount} Sesi / Bln (~{formatRupiah(Math.round(pemulaPkg.price / pemulaPkg.sessionsCount))}/sesi)
                </p>
                <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">
                  <Users className="w-3 h-3" /> {pemulaStudents.length} Siswa Terdaftar
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <Coins className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Iuran Bulanan Prestasi
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {formatRupiah(prestasiPkg.price)}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {prestasiPkg.sessionsCount} Sesi / Bln (~{formatRupiah(Math.round(prestasiPkg.price / prestasiPkg.sessionsCount))}/sesi)
                </p>
                <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  <Award className="w-3 h-3" /> {prestasiStudents.length} Atlet Terbina
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Potensi Omset Bulanan
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatRupiah(potentialMonthlyRevenue)}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  Estimasi dari {pemulaStudents.length + prestasiStudents.length} Siswa Aktif
                </p>
                <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-3 h-3" /> Langganan Rutin
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total Paket Terdaftar
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {pricingPackages.length} Paket
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {pricingPackages.filter((p) => p.billingType === 'bulanan').length} Bulanan • {pricingPackages.filter((p) => p.billingType === 'per_paket').length} Per Paket
                </p>
                <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                  <Layers className="w-3 h-3" /> Siap Digunakan
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Tags className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 1: SOROTAN UTAMA KELAS PEMULA & PRESTASI BULANAN */}
          {/* ======================================================== */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-500" />
                  Sistem Pembayaran Bulanan: Kelas Pemula & Kelas Prestasi
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Dua program utama dengan skema iuran bulanan rutin untuk siswa pemula dan atlet pembinaan prestasi.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CARD 1: KELAS PEMULA (BULANAN) */}
              <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-cyan-500/40 dark:border-cyan-500/30 shadow-lg shadow-cyan-500/5 overflow-hidden flex flex-col justify-between">
                <div>
                  {/* Card Header Banner */}
                  <div className="p-6 bg-gradient-to-br from-cyan-600 to-blue-700 text-white relative">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-[11px] font-black uppercase tracking-wider">
                        PEMBAYARAN BULANAN
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-extrabold uppercase">
                        {pemulaPkg.sessionsCount} Sesi / Bulan
                      </span>
                    </div>

                    <h4 className="text-xl font-black mt-3">{pemulaPkg.packageName}</h4>
                    <p className="text-xs text-cyan-100 mt-0.5">
                      Untuk anak & remaja yang ingin mahir 2 gaya renang dengan frekuensi 3x seminggu.
                    </p>

                    <div className="mt-4 pt-4 border-t border-white/20 flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-cyan-200">Iuran Bulanan Rutin</span>
                        <div className="text-3xl font-black tracking-tight">
                          {formatRupiah(pemulaPkg.price)}
                          <span className="text-xs font-medium text-cyan-200 ml-1">/ bulan</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-cyan-200">Biaya per Pertemuan</span>
                        <div className="text-base font-bold text-cyan-100">
                          ~{formatRupiah(Math.round(pemulaPkg.price / pemulaPkg.sessionsCount))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Specification Grid */}
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <CalendarCheck className="w-3 h-3 text-cyan-500" /> Total Sesi
                        </span>
                        <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {pemulaPkg.sessionsCount} Pertemuan
                        </p>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-cyan-500" /> Frekuensi
                        </span>
                        <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {pemulaPkg.sessionsPerWeek}x Seminggu
                        </p>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-cyan-500" /> Durasi / Sesi
                        </span>
                        <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {pemulaPkg.durationMinutes} Menit
                        </p>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Users className="w-3 h-3 text-cyan-500" /> Rasio Coach
                        </span>
                        <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {pemulaPkg.coachRatio}
                        </p>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 col-span-2">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Waves className="w-3 h-3 text-cyan-500" /> Jalur & Kolam
                        </span>
                        <p className="text-xs font-bold text-slate-900 dark:text-white mt-1 truncate">
                          {pemulaPkg.poolLane}
                        </p>
                      </div>
                    </div>

                    {/* Schedule */}
                    <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                      <div className="flex items-center gap-2">
                        <CalendarClock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        <span className="text-xs font-bold text-cyan-900 dark:text-cyan-200">
                          Jadwal Latihan:
                        </span>
                      </div>
                      <p className="text-xs font-medium text-cyan-800 dark:text-cyan-300 mt-1">
                        {pemulaPkg.scheduleDescription}
                      </p>
                    </div>

                    {/* Features List */}
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Fasilitas & Keunggulan Program:
                      </span>
                      <ul className="mt-2 space-y-2">
                        {pemulaPkg.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                            <Check className="w-3.5 h-3.5 text-cyan-500 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Active Students in Pemula */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Siswa Terdaftar ({pemulaStudents.length} Murid)
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {pemulaStudents.map((st) => {
                          const inv = getStudentMonthlyInvoice(st.id);
                          const isPaid = inv?.status === 'lunas';
                          return (
                            <div
                              key={st.id}
                              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                            >
                              <img
                                src={st.avatarUrl}
                                alt={st.name}
                                className="w-5 h-5 rounded-full object-cover"
                              />
                              <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                                {st.name}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                                  isPaid
                                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                }`}
                              >
                                {isPaid ? 'Lunas' : 'Menunggu'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEditPackage(pemulaPkg)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-sm"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDeletePackage(pemulaPkg.id, pemulaPkg.packageName)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>

              {/* CARD 2: KELAS PRESTASI (BULANAN) */}
              <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500/40 dark:border-amber-500/30 shadow-lg shadow-amber-500/5 overflow-hidden flex flex-col justify-between">
                <div>
                  {/* Card Header Banner */}
                  <div className="p-6 bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 text-white relative">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
                        <Award className="w-3 h-3" /> PEMBINAAN ATLET UNGGULAN
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-300 text-slate-950 text-[10px] font-extrabold uppercase">
                        {prestasiPkg.sessionsCount} Sesi / Bulan
                      </span>
                    </div>

                    <h4 className="text-xl font-black mt-3">{prestasiPkg.packageName}</h4>
                    <p className="text-xs text-amber-100 mt-0.5">
                      Program intensif atlet jalur kejuaraan dengan program latihan 4x seminggu + fisik darat.
                    </p>

                    <div className="mt-4 pt-4 border-t border-white/20 flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-amber-200">Iuran Bulanan Rutin</span>
                        <div className="text-3xl font-black tracking-tight">
                          {formatRupiah(prestasiPkg.price)}
                          <span className="text-xs font-medium text-amber-200 ml-1">/ bulan</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-amber-200">Biaya per Pertemuan</span>
                        <div className="text-base font-bold text-amber-100">
                          ~{formatRupiah(Math.round(prestasiPkg.price / prestasiPkg.sessionsCount))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Specification Grid */}
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <CalendarCheck className="w-3 h-3 text-amber-500" /> Total Sesi
                        </span>
                        <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {prestasiPkg.sessionsCount} Pertemuan
                        </p>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500" /> Frekuensi
                        </span>
                        <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {prestasiPkg.sessionsPerWeek}x Seminggu
                        </p>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500" /> Durasi / Sesi
                        </span>
                        <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {prestasiPkg.durationMinutes} Menit
                        </p>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Users className="w-3 h-3 text-amber-500" /> Rasio Coach
                        </span>
                        <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {prestasiPkg.coachRatio}
                        </p>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 col-span-2">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Waves className="w-3 h-3 text-amber-500" /> Jalur & Kolam
                        </span>
                        <p className="text-xs font-bold text-slate-900 dark:text-white mt-1 truncate">
                          {prestasiPkg.poolLane}
                        </p>
                      </div>
                    </div>

                    {/* Schedule */}
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                      <div className="flex items-center gap-2">
                        <CalendarClock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                          Jadwal Atlet:
                        </span>
                      </div>
                      <p className="text-xs font-medium text-amber-800 dark:text-amber-300 mt-1">
                        {prestasiPkg.scheduleDescription}
                      </p>
                    </div>

                    {/* Features List */}
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Fasilitas & Keunggulan Atlet:
                      </span>
                      <ul className="mt-2 space-y-2">
                        {prestasiPkg.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                            <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Active Athletes in Prestasi */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Atlet Terbina ({prestasiStudents.length} Atlet)
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {prestasiStudents.map((st) => {
                          const inv = getStudentMonthlyInvoice(st.id);
                          const isPaid = inv?.status === 'lunas';
                          return (
                            <div
                              key={st.id}
                              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                            >
                              <img
                                src={st.avatarUrl}
                                alt={st.name}
                                className="w-5 h-5 rounded-full object-cover"
                              />
                              <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                                {st.name}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                                  isPaid
                                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                }`}
                              >
                                {isPaid ? 'Lunas' : 'Menunggu'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEditPackage(prestasiPkg)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-sm"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDeletePackage(prestasiPkg.id, prestasiPkg.packageName)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 2: TABEL MENEJEMEN PERTEMUAN & HARGA             */}
          {/* ======================================================== */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Coins className="w-5 h-5 text-indigo-500" />
                  Tabel Menejemen Pertemuan & Harga
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Daftar konfigurasi paket renang, kuota sesi, jadwal latihan, dan tarif resmi akademi.
                </p>
              </div>

              <button
                onClick={() => handleOpenAddPackage('pemula')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Paket Baru</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">No</th>
                    <th className="py-3 px-3">Paket Kursus</th>
                    <th className="py-3 px-3">Kategori Kelas</th>
                    <th className="py-3 px-3">Sistem Pembayaran</th>
                    <th className="py-3 px-3">Pertemuan / Sesi</th>
                    <th className="py-3 px-3">Jadwal & Durasi</th>
                    <th className="py-3 px-3">Harga / Tarif</th>
                    <th className="py-3 px-3">Biaya / Sesi</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {pricingPackages.map((pkg, idx) => {
                    const isBulanan = pkg.billingType === 'bulanan';
                    const costPerSession = Math.round(pkg.price / (pkg.sessionsCount || 1));
                    return (
                      <tr key={pkg.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-3 px-3">
                          <p className="font-bold text-slate-900 dark:text-white">{pkg.packageName}</p>
                          <span className="text-[10px] text-slate-400 line-clamp-1">{pkg.notes || pkg.scheduleDescription}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {ROLE_LABELS[pkg.roleClass]?.title || pkg.roleClass}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              isBulanan
                                ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                                : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                            }`}
                          >
                            {isBulanan ? 'Bulanan' : 'Per Paket'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                          {pkg.sessionsCount} Pertemuan
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                          <div>{pkg.sessionsPerWeek}x / minggu</div>
                          <span className="text-[10px] text-slate-400">{pkg.durationMinutes} menit/sesi</span>
                        </td>
                        <td className="py-3 px-3 font-bold font-mono text-slate-900 dark:text-white">
                          {formatRupiah(pkg.price)}
                          <span className="text-[10px] text-slate-400 font-normal ml-0.5">{isBulanan ? '/bln' : ''}</span>
                        </td>
                        <td className="py-3 px-3 font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                          ~{formatRupiah(costPerSession)}
                        </td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => {
                              const updated = { ...pkg, isActive: !pkg.isActive };
                              onUpdatePricingPackage(updated);
                              showToast(`Status paket ${pkg.packageName} berhasil diubah!`, 'info');
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                              pkg.isActive
                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                            }`}
                          >
                            {pkg.isActive ? 'Aktif' : 'Non-aktif'}
                          </button>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditPackage(pkg)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] cursor-pointer shadow-sm transition-all"
                              title="Edit Paket"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeletePackage(pkg.id, pkg.packageName)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] cursor-pointer shadow-sm transition-all"
                              title="Hapus Paket"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 3: KATALOG SELURUH PAKET PERTEMUAN & HARGA       */}
          {/* ======================================================== */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Tags className="w-5 h-5 text-indigo-500" />
                  Katalog Seluruh Paket Pertemuan & Harga Akademi
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Daftar seluruh paket renang reguler bulanan dan paket privat intensif 1-on-1.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setPricingFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    pricingFilter === 'all'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Semua ({pricingPackages.length})
                </button>
                <button
                  onClick={() => setPricingFilter('bulanan')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    pricingFilter === 'bulanan'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Iuran Bulanan ({pricingPackages.filter((p) => p.billingType === 'bulanan').length})
                </button>
                <button
                  onClick={() => setPricingFilter('pemula_prestasi')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    pricingFilter === 'pemula_prestasi'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Pemula & Prestasi
                </button>
                <button
                  onClick={() => setPricingFilter('per_paket')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    pricingFilter === 'per_paket'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Paket Privat ({pricingPackages.filter((p) => p.billingType === 'per_paket').length})
                </button>
              </div>
            </div>

            {/* Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPricingPackages.map((pkg) => {
                const isBulanan = pkg.billingType === 'bulanan';
                const costPerSession = Math.round(pkg.price / (pkg.sessionsCount || 1));

                return (
                  <div
                    key={pkg.id}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-cyan-500/50 transition-all"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            isBulanan
                              ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
                              : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                          }`}
                        >
                          {isBulanan ? 'IURAN BULANAN' : 'PAKET KONTRAK'}
                        </span>

                        <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {pkg.sessionsCount} Sesi
                        </span>
                      </div>

                      {/* Package Name */}
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {pkg.packageName}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {pkg.notes || pkg.scheduleDescription}
                      </p>

                      {/* Price Section */}
                      <div className="my-4 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-baseline justify-between">
                        <div>
                          <span className="text-[10px] text-slate-500 font-medium">Harga / Tarif</span>
                          <div className="text-xl font-black text-slate-900 dark:text-white">
                            {formatRupiah(pkg.price)}
                            <span className="text-[10px] font-normal text-slate-500 ml-1">
                              {isBulanan ? '/ bln' : '/ paket'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 font-medium">Per Sesi</span>
                          <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
                            ~{formatRupiah(costPerSession)}
                          </div>
                        </div>
                      </div>

                      {/* Specs List */}
                      <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 mb-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {pkg.sessionsPerWeek}x seminggu • {pkg.durationMinutes} menit/sesi
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Rasio: {pkg.coachRatio}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Waves className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{pkg.poolLane}</span>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          Benefit Unggulan:
                        </span>
                        <ul className="mt-1.5 space-y-1">
                          {pkg.features.slice(0, 3).map((f, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                              <Check className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditPackage(pkg)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-sm transition-all"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeletePackage(pkg.id, pkg.packageName)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-sm transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          const updated = { ...pkg, isActive: !pkg.isActive };
                          onUpdatePricingPackage(updated);
                          showToast(`Status paket ${pkg.packageName} berhasil diubah!`, 'info');
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                          pkg.isActive
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                        }`}
                      >
                        {pkg.isActive ? 'Aktif' : 'Non-aktif'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 4: KALKULATOR & SIMULASI BIAYA PERTEMUAN RENANG */}
          {/* ======================================================== */}
          <div className="p-6 bg-gradient-to-br from-indigo-900/40 via-slate-900 to-slate-900 rounded-3xl border border-indigo-800/40 shadow-sm text-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-indigo-400" />
                  Kalkulator & Simulasi Biaya Sesi Murid
                </h3>
                <p className="text-xs text-slate-400">
                  Hitung perbandingan biaya sesi bulanan vs tiket lepasan untuk konsultasi wali murid.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                Alat Bantu Kasir & Admin
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-300">Pilih Kelas Renang</label>
                <select
                  value={calcClass}
                  onChange={(e) => setCalcClass(e.target.value as UserRole)}
                  className="w-full mt-1.5 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="pemula">Kelas Pemula (Bulanan)</option>
                  <option value="prestasi">Kelas Prestasi (Bulanan)</option>
                  <option value="dasar">Kelas Dasar (Bulanan)</option>
                  <option value="privat_4">Privat 4 Sesi</option>
                  <option value="privat_8">Privat 8 Sesi</option>
                  <option value="privat_12">Privat 12 Sesi</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">
                  Rencana Pertemuan / Bulan ({calcSessions} Sesi)
                </label>
                <input
                  type="range"
                  min="4"
                  max="24"
                  step="2"
                  value={calcSessions}
                  onChange={(e) => setCalcSessions(Number(e.target.value))}
                  className="w-full mt-3 accent-cyan-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>4 Sesi</span>
                  <span>12 Sesi (Rekomendasi)</span>
                  <span>24 Sesi</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-800/60 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-indigo-300">
                    Estimasi Biaya per Sesi
                  </span>
                  <div className="text-2xl font-black text-cyan-300 mt-0.5">
                    {formatRupiah(
                      Math.round(
                        (calcClass === 'pemula'
                          ? 450000
                          : calcClass === 'prestasi'
                          ? 650000
                          : calcClass === 'dasar'
                          ? 350000
                          : 1600000) / calcSessions
                      )
                    )}
                    <span className="text-xs font-normal text-slate-400 ml-1">/ sesi</span>
                  </div>
                </div>
                <p className="text-[11px] text-emerald-400 mt-2 font-medium">
                  ✓ Lebih hemat 45% dibanding les panggilan per-sesi lepas.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: MANAJEMEN USER (ADMIN, PELATIH, SISWA)             */}
      {/* ======================================================== */}
      {activeTab === 'users' && (() => {
        const filteredUsers = appUsers.filter((u) => {
          const searchLower = userSearchTerm.toLowerCase();
          const matchesSearch =
            userSearchTerm === '' ||
            u.name.toLowerCase().includes(searchLower) ||
            (u.username && u.username.toLowerCase().includes(searchLower)) ||
            u.email.toLowerCase().includes(searchLower) ||
            (u.phone && u.phone.includes(userSearchTerm)) ||
            (u.barcode && u.barcode.toLowerCase().includes(searchLower));

          const matchesRole =
            userRoleFilter === 'all' ||
            (userRoleFilter === 'siswa'
              ? u.role !== 'admin' && u.role !== 'pelatih'
              : u.role === userRoleFilter);

          return matchesSearch && matchesRole;
        });

        const totalAdmin = appUsers.filter((u) => u.role === 'admin').length;
        const totalPelatih = appUsers.filter((u) => u.role === 'pelatih').length;
        const totalSiswa = appUsers.filter((u) => u.role !== 'admin' && u.role !== 'pelatih').length;

        return (
          <div className="space-y-6 animate-fadeIn">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Akun Pengguna</p>
                  <h4 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{appUsers.length}</h4>
                  <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">Terdaftar di Sistem</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <UserCog className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Administrator</p>
                  <h4 className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">{totalAdmin}</h4>
                  <span className="text-[10px] text-slate-400">Akses Penuh Manajemen</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Staff Pelatih</p>
                  <h4 className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{totalPelatih}</h4>
                  <span className="text-[10px] text-slate-400">Presensi & Kolam</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Akun Siswa / Wali</p>
                  <h4 className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">{totalSiswa}</h4>
                  <span className="text-[10px] text-slate-400">Portal Siswa & Barcode</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Header Controls & Filter Bar */}
            <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <UserCog className="w-5 h-5 text-indigo-500" />
                    Manajemen Akun Pengguna & Hak Akses
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Buat, edit, ubah username & kata sandi, serta hapus akun pengguna akademi
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => handleOpenAddCoach()}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Tambah Pelatih Baru</span>
                  </button>

                  <button
                    onClick={() => setShowAddUserModal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah User Baru</span>
                  </button>
                </div>
              </div>

              {/* Search & Filter Row */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="sm:col-span-8 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    placeholder="Cari berdasarkan nama, username (@...), email login, atau nomor HP..."
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {userSearchTerm && (
                    <button
                      onClick={() => setUserSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="sm:col-span-4 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="all">Semua Hak Akses ({appUsers.length})</option>
                    <option value="admin">Administrator ({totalAdmin})</option>
                    <option value="pelatih">Staff Pelatih ({totalPelatih})</option>
                    <option value="siswa">Murid / Siswa ({totalSiswa})</option>
                    <option value="dasar">Kelas Dasar</option>
                    <option value="pemula">Kelas Pemula</option>
                    <option value="prestasi">Kelas Prestasi</option>
                    <option value="privat_4">Privat 4</option>
                    <option value="privat_8">Privat 8</option>
                    <option value="privat_12">Privat 12</option>
                  </select>
                </div>
              </div>
            </div>

            {/* User Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Nama & Profil</th>
                      <th className="py-3.5 px-4">Username Login</th>
                      <th className="py-3.5 px-4">Kata Sandi</th>
                      <th className="py-3.5 px-4">Email Login</th>
                      <th className="py-3.5 px-4">Hak Akses / Peran</th>
                      <th className="py-3.5 px-4">Nomor HP / WA</th>
                      <th className="py-3.5 px-4">ID Terkait</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          <UserCog className="w-10 h-10 mx-auto mb-2 opacity-30 text-indigo-400" />
                          <p className="font-semibold text-slate-700 dark:text-slate-300">Tidak ada pengguna yang cocok</p>
                          <p className="text-[11px] text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau ubah filter hak akses</p>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const roleMeta = ROLE_LABELS[u.role];
                        const displayUsername = u.username || u.email.split('@')[0];
                        const isPassVisible = !!showUserPasswordMap[u.id];
                        const displayPassword = u.password || 'tirta123';

                        return (
                          <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                            {/* Profil & Nama */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={u.avatarUrl}
                                  alt={u.name}
                                  className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                                  onError={(e: any) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
                                  }}
                                />
                                <div className="min-w-0">
                                  <p className="font-extrabold text-slate-900 dark:text-white truncate">{u.name}</p>
                                  <p className="text-[11px] text-slate-400 font-mono truncate">{u.id}</p>
                                </div>
                              </div>
                            </td>

                            {/* Username Login */}
                            <td className="py-3.5 px-4">
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-[11px] border border-indigo-200 dark:border-indigo-800/60">
                                <KeyRound className="w-3 h-3 text-indigo-500" />
                                <span>@{displayUsername}</span>
                              </div>
                            </td>

                            {/* Password Login */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5 font-mono text-xs">
                                <span className={`px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold ${isPassVisible ? '' : 'tracking-widest'}`}>
                                  {isPassVisible ? displayPassword : '••••••••'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => togglePasswordVisibility(u.id)}
                                  title={isPassVisible ? 'Sembunyikan Kata Sandi' : 'Lihat Kata Sandi'}
                                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                >
                                  {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </td>

                            {/* Email */}
                            <td className="py-3.5 px-4 font-mono text-cyan-600 dark:text-cyan-400 text-xs">
                              {u.email}
                            </td>

                            {/* Role */}
                            <td className="py-3.5 px-4">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleMeta.badgeBg}`}>
                                {roleMeta.textBadge}
                              </span>
                            </td>

                            {/* Kontak */}
                            <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                              {u.phone || '-'}
                            </td>

                            {/* ID Terkait */}
                            <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                              {u.barcode || u.coachId || u.studentId || (u.role === 'admin' ? 'Superadmin' : '-')}
                            </td>

                            {/* Aksi */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditUser(u)}
                                  title="Edit Akun Pengguna & Kata Sandi"
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] cursor-pointer shadow-sm transition-all"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => setDeletingUser(u)}
                                  title="Hapus Akun Pengguna"
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] cursor-pointer shadow-sm transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Hapus</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ======================================================== */}
      {/* MENU PROFIL ADMIN (BIODATA, GANTI FOTO & BARCODE PASS)   */}
      {/* ======================================================== */}
      {activeTab === 'admin-profile' && (
        <AdminPersonalProfile
          currentUser={currentUser || null}
          onUpdateAvatar={onUpdateAvatar}
          onUpdateUser={onUpdateUser}
          onViewBarcode={onViewBarcode}
        />
      )}

      {/* ======================================================== */}
      {/* TAB 7: PENGATURAN PROFIL PUBLIK & PENDAFTARAN            */}
      {/* ======================================================== */}
      {(activeTab === 'settings' || activeTab === 'registrations') && (
        <AdminProfileSettings
          academyProfile={academyProfile}
          onUpdateAcademyProfile={onUpdateAcademyProfile}
          registrations={registrations}
          onUpdateRegistration={onUpdateRegistration}
          onDeleteRegistration={onDeleteRegistration}
          onApproveAndCreateStudent={onApproveAndCreateStudent}
          pricingPackages={pricingPackages}
          onViewPublicLanding={onViewPublicLanding}
          galleryItems={galleryItems}
          onAddGalleryItem={onAddGalleryItem}
          onDeleteGalleryItem={onDeleteGalleryItem}
          initialSubSection={activeTab === 'registrations' ? 'registrations' : 'profile'}
        />
      )}

      {/* ======================================================== */}
      {/* TAB 8: CETAK KARTU SWIM PASS BARCODE PER KELAS           */}
      {/* ======================================================== */}
      {activeTab === 'cards' && (() => {
        // Staff members (Admin & Coaches) with Barcodes
        const staffMembers: CardExportData[] = [
          ...appUsers
            .filter((u) => u.role === 'admin')
            .map((u) => ({
              id: u.id,
              name: u.name,
              barcode: u.barcode || 'AQUA-ADM-001',
              roleBadge: 'ADMINISTRATOR',
              category: 'staff' as const,
              roleClass: 'admin' as UserRole,
              avatarUrl: u.avatarUrl,
              specialty: 'Manajemen & Operasional Klub',
              emergencyContact: u.phone || '0812-3456-7890',
              phone: u.phone || '0812-3456-7890',
              email: u.email || 'admin@tirtasamudra.com',
              joinedDate: '2023-01-01',
            })),
          ...coaches.map((c, idx) => ({
            id: c.id,
            name: c.name,
            barcode: c.barcode || `AQUA-CCH-10${idx + 1}`,
            roleBadge: 'PELATIH RESMI',
            category: 'staff' as const,
            roleClass: 'pelatih' as UserRole,
            avatarUrl: c.avatarUrl,
            specialty: c.specialty,
            phone: c.phone,
            email: c.email || 'coach@tirtasamudra.com',
            emergencyContact: c.phone,
            joinedDate: '2023-03-01',
            certifications: c.certifications,
            experienceYears: c.experienceYears,
          })),
        ];

        const filteredStaffMembers = staffMembers.filter((s) => {
          if (!cardSearchTerm.trim()) return true;
          const q = cardSearchTerm.toLowerCase();
          return (
            s.name.toLowerCase().includes(q) ||
            s.barcode.toLowerCase().includes(q) ||
            (s.specialty && s.specialty.toLowerCase().includes(q))
          );
        });

        // Class options metadata
        const classTabs: Array<{ id: string; label: string; role: UserRole | 'all'; desc: string; color: string; badgeBg: string }> = [
          { id: 'all', label: 'Semua Murid', role: 'all', desc: 'Semua murid aktif dari seluruh kelas', color: 'from-cyan-600 to-blue-600', badgeBg: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20' },
          { id: 'staff', label: 'Pelatih & Admin', role: 'all', desc: 'Kartu ID & Barcode resmi pelatih dan administrator', color: 'from-emerald-600 to-teal-700', badgeBg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
          { id: 'dasar', label: 'Kelas Dasar', role: 'dasar', desc: 'Adaptasi air, water confidence & balita', color: 'from-sky-500 to-blue-600', badgeBg: 'bg-sky-500/10 text-sky-600 border-sky-500/20' },
          { id: 'pemula', label: 'Kelas Pemula', role: 'pemula', desc: 'Penguasaan teknik 4 gaya renang', color: 'from-cyan-600 to-teal-600', badgeBg: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20' },
          { id: 'prestasi', label: 'Kelas Prestasi', role: 'prestasi', desc: 'Atlet binaan kompetisi & time trial', color: 'from-amber-500 to-orange-600', badgeBg: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
          { id: 'privat_4', label: 'Privat 4 Sesi', role: 'privat_4', desc: 'Pendampingan privat intensif 4 sesi', color: 'from-indigo-500 to-purple-600', badgeBg: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' },
          { id: 'privat_8', label: 'Privat 8 Sesi', role: 'privat_8', desc: 'Pendampingan privat 8 sesi terstruktur', color: 'from-purple-500 to-pink-600', badgeBg: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
          { id: 'privat_12', label: 'Privat 12 Sesi', role: 'privat_12', desc: 'Paket privat komprehensif master 12 sesi', color: 'from-fuchsia-500 to-rose-600', badgeBg: 'bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-500/20' },
        ];

        const activeClassTab = classTabs.find((c) => c.id === selectedCardClass) || classTabs[0];

        const filteredCardsStudents = students.filter((s) => {
          const matchClass = selectedCardClass === 'all' || s.roleClass === selectedCardClass;
          const matchQuery =
            !cardSearchTerm.trim() ||
            s.name.toLowerCase().includes(cardSearchTerm.toLowerCase()) ||
            s.barcode.toLowerCase().includes(cardSearchTerm.toLowerCase()) ||
            s.parentName.toLowerCase().includes(cardSearchTerm.toLowerCase());
          return matchClass && matchQuery;
        });

        const isStaffTab = selectedCardClass === 'staff';
        const displayedCount = isStaffTab ? filteredStaffMembers.length : filteredCardsStudents.length;
        const totalCategoryCount = isStaffTab ? staffMembers.length : (selectedCardClass === 'all' ? students.length : students.filter(s => s.roleClass === selectedCardClass).length);

        return (
          <div className="space-y-6 animate-fadeIn">
            {/* Header Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-cyan-950 text-white shadow-xl border border-cyan-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                  <QrCode className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                      Cetak Kartu Member / ID Barcode per Kategori
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Menu Terpisah per Kelas &amp; Staf
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-cyan-200/80 mt-1">
                    Pilih menu kelas atau Pelatih &amp; Admin di bawah untuk memfilter, pratinjau kartu barcode, atau mencetak massal lembar A4.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3.5 py-2 rounded-2xl bg-white/10 text-white font-mono font-bold text-xs border border-white/10">
                  {displayedCount} / {totalCategoryCount} {isStaffTab ? 'Staf & Pelatih' : 'Murid Terdaftar'}
                </span>
              </div>
            </div>

            {/* Menu Navigasi Pemisah Kelas (Class & Staff Switcher Buttons) */}
            <div className="p-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2 overflow-x-auto">
              {classTabs.map((ct) => {
                const count = ct.id === 'all' 
                  ? students.length 
                  : ct.id === 'staff' 
                  ? staffMembers.length 
                  : students.filter((s) => s.roleClass === ct.id).length;
                const isSelected = selectedCardClass === ct.id;
                return (
                  <button
                    key={ct.id}
                    onClick={() => {
                      setSelectedCardClass(ct.id);
                      if (onTabChange) {
                        onTabChange(`cards-${ct.id}` as any);
                      }
                    }}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                      isSelected
                        ? `bg-gradient-to-r ${ct.color} text-white shadow-md shadow-cyan-600/20 scale-102`
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{ct.label}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                        isSelected ? 'bg-white/20 text-white font-extrabold' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Class Action Bar: Title, Batch Print Button, Search */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-3.5 h-10 rounded-full bg-gradient-to-b ${activeClassTab.color}`} />
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {activeClassTab.label}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {activeClassTab.desc} &bull; Menampilkan {displayedCount} {isStaffTab ? 'staf' : 'murid'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="relative min-w-[220px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={cardSearchTerm}
                    onChange={(e) => setCardSearchTerm(e.target.value)}
                    placeholder={isStaffTab ? "Cari nama / barcode staf..." : "Cari nama / barcode di kelas ini..."}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {isStaffTab && (
                  <button
                    onClick={() => handleOpenAddCoach()}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer whitespace-nowrap"
                    title="Tambah Pelatih Baru (Auto Barcode, Username, Password)"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Tambah Pelatih Baru</span>
                  </button>
                )}

                <button
                  onClick={() => setBatchPrintClassModal(selectedCardClass)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition-all cursor-pointer whitespace-nowrap"
                  title="Buka Lembar Cetak A4 untuk Semua Kartu Ini"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Semua Kartu {activeClassTab.label} Sekaligus (A4)</span>
                </button>
              </div>
            </div>

            {/* Cards Grid: Staff OR Students */}
            {isStaffTab ? (
              filteredStaffMembers.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500">
                  <QrCode className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                  <p className="font-bold text-sm">Tidak ada staf atau pelatih ditemukan.</p>
                  <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian Anda.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredStaffMembers.map((st) => (
                    <div
                      key={st.id}
                      className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-emerald-500/50 transition-all flex flex-col justify-between overflow-hidden group"
                    >
                      {/* Card Preview Header */}
                      <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white relative">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {academyProfile.logoUrl ? (
                              <img
                                src={academyProfile.logoUrl}
                                alt="Logo"
                                className="w-7 h-7 rounded-lg object-cover ring-1 ring-emerald-400/40"
                              />
                            ) : (
                              <Waves className="w-5 h-5 text-emerald-400" />
                            )}
                            <span className="font-extrabold text-xs tracking-tight text-white line-clamp-1">
                              {academyProfile.name}
                            </span>
                          </div>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                            {st.roleBadge || 'STAFF'}
                          </span>
                        </div>

                        {/* Staff Info */}
                        <div className="flex items-center gap-3.5 pt-1">
                          {st.avatarUrl ? (
                            <img
                              src={st.avatarUrl}
                              alt={st.name}
                              className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400/60 shadow-md ring-2 ring-emerald-500/20 shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-emerald-400/60 shadow-md ring-2 ring-emerald-500/20 flex items-center justify-center text-emerald-300 shrink-0">
                              <User className="w-8 h-8 text-emerald-300/90" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h4 className="font-black text-base text-white truncate leading-snug">
                              {st.name}
                            </h4>
                            <p className="font-mono text-xs font-bold text-emerald-300 tracking-wider">
                              {st.barcode}
                            </p>
                            <p className="text-[11px] text-emerald-100/70 mt-0.5 truncate">
                              {st.specialty || 'Staf Resmi Klub Renang'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Card Body Details */}
                      <div className="p-5 space-y-3">
                        <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-slate-400">Jabatan / Spesialis:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[170px]">
                            {st.specialty || '-'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-slate-400">Kontak Telepon:</span>
                          <span className="font-mono text-slate-700 dark:text-slate-300">{st.phone || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Status ID Card:</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Resmi Terdaftar
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                        <button
                          onClick={() => onViewBarcode(st)}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                          title="Lihat Pratinjau Kartu Staff & Cetak Individual"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Pratinjau &amp; Cetak</span>
                        </button>

                        <button
                          onClick={async () => {
                            try {
                              const dataUrl = await exportCardToImageDataUrl(`card-staff-${st.id}`, st, '');
                              if (dataUrl) {
                                triggerImageDownload(
                                  dataUrl,
                                  `kartu-staff-${st.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}-${st.barcode}.png`
                                );
                              }
                            } catch (e) {
                              onViewBarcode(st);
                            }
                          }}
                          className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-300 hover:text-emerald-600 text-xs font-bold transition-colors cursor-pointer"
                          title="Unduh Gambar HD (PNG)"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              filteredCardsStudents.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500">
                  <QrCode className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                  <p className="font-bold text-sm">Tidak ada kartu peserta ditemukan di kelas ini.</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Coba ubah kata kunci pencarian atau pilih kelas lain pada tab di atas.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredCardsStudents.map((st) => {
                    const roleMeta = ROLE_LABELS[st.roleClass];
                    return (
                      <div
                        key={st.id}
                        className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-cyan-500/50 transition-all flex flex-col justify-between overflow-hidden group"
                      >
                        {/* Card Preview Header */}
                        <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950 text-white relative">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {academyProfile.logoUrl ? (
                                <img
                                  src={academyProfile.logoUrl}
                                  alt="Logo"
                                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-cyan-400/40"
                                />
                              ) : (
                                <Waves className="w-5 h-5 text-cyan-400" />
                              )}
                              <span className="font-extrabold text-xs tracking-tight text-white line-clamp-1">
                                {academyProfile.name}
                              </span>
                            </div>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${roleMeta.badgeBg}`}>
                              {roleMeta.textBadge}
                            </span>
                          </div>

                          {/* Student Info */}
                          <div className="flex items-center gap-3.5 pt-1">
                            {st.avatarUrl ? (
                              <img
                                src={st.avatarUrl}
                                alt={st.name}
                                className="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-400/60 shadow-md ring-2 ring-cyan-500/20 shrink-0"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-cyan-400/60 shadow-md ring-2 ring-cyan-500/20 flex items-center justify-center text-cyan-300 shrink-0">
                                <User className="w-8 h-8 text-cyan-300/90" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <h4 className="font-black text-base text-white truncate leading-snug">
                                {st.name}
                              </h4>
                              <p className="font-mono text-xs font-bold text-cyan-300 tracking-wider">
                                {st.barcode}
                              </p>
                              <p className="text-[11px] text-cyan-100/70 mt-0.5">
                                {st.gender} &bull; {st.age} Th &bull; Wali: {st.parentName}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Card Body Details */}
                        <div className="p-5 space-y-3">
                          <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-400">Sisa Kuota:</span>
                            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                              {st.remainingQuota} / {st.totalQuota} Pertemuan
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-400">Kontak Darurat:</span>
                            <span className="font-mono text-slate-700 dark:text-slate-300">{st.emergencyContact}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">Bergabung:</span>
                            <span className="font-mono text-slate-700 dark:text-slate-300">{st.joinedDate}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                          <button
                            onClick={() => onViewBarcode(st)}
                            className="flex-1 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                            title="Lihat Pratinjau Kartu & Cetak Individual"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Pratinjau &amp; Cetak</span>
                          </button>

                          <button
                            onClick={async () => {
                              try {
                                const dataUrl = await exportCardToImageDataUrl(`card-${st.id}`, st, '');
                                if (dataUrl) {
                                  triggerImageDownload(
                                    dataUrl,
                                    `kartu-${st.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}-${st.barcode}.png`
                                  );
                                }
                              } catch (e) {
                                onViewBarcode(st);
                              }
                            }}
                            className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-cyan-50 dark:hover:bg-cyan-950/60 text-slate-700 dark:text-slate-300 hover:text-cyan-600 text-xs font-bold transition-colors cursor-pointer"
                            title="Unduh Gambar HD (PNG)"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        );
      })()}

      {/* ======================================================== */}
      {/* MODAL: CETAK MASSAL KARTU KELAS (LEMBAR A4 PRINT)        */}
      {/* ======================================================== */}
      {batchPrintClassModal && (() => {
        const targetClass = batchPrintClassModal;
        const isStaffTarget = targetClass === 'staff';

        const targetClassStudents = students.filter(
          (s) => targetClass === 'all' || s.roleClass === targetClass
        );

        const targetStaffList: CardExportData[] = [
          ...appUsers
            .filter((u) => u.role === 'admin')
            .map((u) => ({
              id: u.id,
              name: u.name,
              barcode: u.barcode || 'AQUA-ADM-001',
              roleBadge: 'ADMINISTRATOR',
              category: 'staff' as const,
              roleClass: 'admin' as UserRole,
              avatarUrl: u.avatarUrl,
              specialty: 'Manajemen & Operasional Klub',
              emergencyContact: u.phone || '0812-3456-7890',
              phone: u.phone || '0812-3456-7890',
              email: u.email || 'admin@tirtasamudra.com',
            })),
          ...coaches.map((c, idx) => ({
            id: c.id,
            name: c.name,
            barcode: c.barcode || `AQUA-CCH-10${idx + 1}`,
            roleBadge: 'PELATIH RESMI',
            category: 'staff' as const,
            roleClass: 'pelatih' as UserRole,
            avatarUrl: c.avatarUrl,
            specialty: c.specialty,
            phone: c.phone,
            email: c.email || 'coach@tirtasamudra.com',
            emergencyContact: c.phone,
          })),
        ];

        const classTitle = isStaffTarget
          ? 'Pelatih & Admin (Official Staff Pass)'
          : targetClass === 'all'
          ? 'Semua Murid'
          : ROLE_LABELS[targetClass as UserRole]?.title || targetClass;

        const totalItemsCount = isStaffTarget ? targetStaffList.length : targetClassStudents.length;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col justify-between">
              {/* Header toolbar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                      Lembar Cetak Massal: {classTitle}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Format siap cetak kertas A4 / laminasi untuk {totalItemsCount} kartu {isStaffTarget ? 'staf' : 'murid'}.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak Sekarang (Print)</span>
                  </button>
                  <button
                    onClick={() => setBatchPrintClassModal(null)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Printable Cards Sheet */}
              <div className="flex-1 overflow-y-auto py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {isStaffTarget ? (
                    targetStaffList.map((st) => (
                      <div
                        key={st.id}
                        className="p-4 rounded-2xl border-2 border-emerald-500/40 bg-white dark:bg-slate-950 flex flex-col justify-between space-y-3"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                            {academyProfile.name}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-600">
                            {st.roleBadge || 'STAFF'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {st.avatarUrl ? (
                            <img
                              src={st.avatarUrl}
                              alt={st.name}
                              className="w-12 h-12 rounded-xl object-cover border border-emerald-400 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-emerald-400 flex items-center justify-center text-emerald-500 shrink-0">
                              <User className="w-6 h-6" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-black text-xs text-slate-900 dark:text-white truncate">{st.name}</p>
                            <p className="font-mono text-[10px] text-emerald-600 font-bold">{st.barcode}</p>
                            <p className="text-[10px] text-slate-500 truncate">{st.specialty || 'Staf Resmi'}</p>
                          </div>
                        </div>

                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 text-center font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                          ID PASS: {st.barcode}
                        </div>

                        <div className="text-[9px] text-slate-400 flex justify-between">
                          <span>Kontak: {st.phone || '-'}</span>
                          <span>{st.email || '-'}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    targetClassStudents.map((st) => (
                      <div
                        key={st.id}
                        className="p-4 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 flex flex-col justify-between space-y-3"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                            {academyProfile.name}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-cyan-500/10 text-cyan-600">
                            {ROLE_LABELS[st.roleClass]?.textBadge}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {st.avatarUrl ? (
                            <img
                              src={st.avatarUrl}
                              alt={st.name}
                              className="w-12 h-12 rounded-xl object-cover border shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-cyan-400/50 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
                              <User className="w-6 h-6" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-black text-xs text-slate-900 dark:text-white truncate">{st.name}</p>
                            <p className="font-mono text-[10px] text-cyan-600 font-bold">{st.barcode}</p>
                            <p className="text-[10px] text-slate-500">{st.age} Th &bull; {st.gender}</p>
                          </div>
                        </div>

                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 text-center font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300 border">
                          PASS: {st.barcode}
                        </div>

                        <div className="text-[9px] text-slate-400 flex justify-between">
                          <span>Wali: {st.parentName}</span>
                          <span>Darurat: {st.emergencyContact}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ======================================================== */}
      {/* MODAL: EDIT PROFIL SISWA PESERTA                         */}
      {/* ======================================================== */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Edit className="w-4 h-4 text-cyan-500" />
              Edit Profil Peserta: {editingStudent.name}
            </h3>

            <form onSubmit={handleUpdateStudentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Usia (Tahun)</label>
                  <input
                    type="number"
                    value={editingStudent.age}
                    onChange={(e) => setEditingStudent({ ...editingStudent, age: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Sisa Kuota Sesi</label>
                  <input
                    type="number"
                    value={editingStudent.remainingQuota}
                    onChange={(e) => setEditingStudent({ ...editingStudent, remainingQuota: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-bold text-cyan-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Orang Tua / Wali</label>
                  <input
                    type="text"
                    value={editingStudent.parentName}
                    onChange={(e) => setEditingStudent({ ...editingStudent, parentName: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700"
                  />
                  <p className="text-[10px] text-amber-500 mt-0.5">Disembunyikan 'xxx' pada tabel, tampil di KTA</p>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={editingStudent.birthDate || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, birthDate: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-mono"
                  />
                  <p className="text-[10px] text-amber-500 mt-0.5">Disamarkan xx-xx-xxxx pada tabel, tampil di KTA</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">WhatsApp / HP</label>
                  <input
                    type="text"
                    value={editingStudent.phone}
                    onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-mono"
                  />
                  <p className="text-[10px] text-amber-500 mt-0.5">Disamarkan pada tabel, tampil di KTA</p>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Kontak Darurat</label>
                  <input
                    type="text"
                    value={editingStudent.emergencyContact}
                    onChange={(e) => setEditingStudent({ ...editingStudent, emergencyContact: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-mono"
                  />
                  <p className="text-[10px] text-amber-500 mt-0.5">Disamarkan pada tabel, tampil di KTA</p>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Catatan Medis & Adaptasi Renang</label>
                <textarea
                  rows={2}
                  value={editingStudent.notes}
                  onChange={(e) => setEditingStudent({ ...editingStudent, notes: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Foto Profil Peserta (Upload File)</label>
                <div className="mt-1 flex items-center gap-3">
                  <img
                    src={editingStudent.avatarUrl}
                    alt="Foto Profil"
                    className="w-12 h-12 rounded-xl object-cover border border-cyan-400 shrink-0"
                  />
                  <label className="px-3 py-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold hover:bg-cyan-100 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Foto Baru</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          try {
                            const dataUrl = await compressAndResizeImage(f, 400, 400, 0.85);
                            setEditingStudent({ ...editingStudent, avatarUrl: dataUrl });
                          } catch (err: any) {
                            alert(err.message || 'Gagal upload foto');
                          }
                        }
                      }}
                    />
                  </label>
                  <input
                    type="url"
                    value={editingStudent.avatarUrl}
                    onChange={(e) => setEditingStudent({ ...editingStudent, avatarUrl: e.target.value })}
                    placeholder="Atau URL foto..."
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 text-[11px]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: TAMBAH SISWA BARU                                  */}
      {/* ======================================================== */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Pendaftaran Siswa Les Renang Baru
            </h3>
            <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  required
                  value={newStudentData.name}
                  onChange={(e) => setNewStudentData({ ...newStudentData, name: e.target.value })}
                  placeholder="Contoh: Muhammad Alif"
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Kelas / Program Siswa</label>
                  <select
                    value={newStudentData.roleClass}
                    onChange={(e) => {
                      const newClass = e.target.value as UserRole;
                      const defaultQuota = getClassDefaultQuota(newClass, pricingPackages);
                      setNewStudentData({
                        ...newStudentData,
                        roleClass: newClass,
                        totalQuota: defaultQuota,
                      });
                    }}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-medium"
                  >
                    <optgroup label="Pendaftaran Murid Baru (Terbuka)">
                      <option value="dasar">Kelas Dasar (12 Pertemuan)</option>
                      <option value="privat_4">Kelas Privat 4 Sesi (4 Pertemuan)</option>
                      <option value="privat_8">Kelas Privat 8 Sesi (8 Pertemuan)</option>
                      <option value="privat_12">Kelas Privat 12 Sesi (12 Pertemuan)</option>
                    </optgroup>
                    <optgroup label="Jalur Kenaikan Tingkat (Khusus Evaluasi Pelatih)">
                      <option value="pemula">Kelas Pemula (12 Pertemuan)</option>
                      <option value="prestasi">Kelas Prestasi (16 Pertemuan)</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Kuota Pertemuan Kelas</span>
                    <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">Otomatis Paket</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={newStudentData.totalQuota}
                    onChange={(e) =>
                      setNewStudentData({
                        ...newStudentData,
                        totalQuota: Math.max(1, Number(e.target.value)),
                      })
                    }
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-cyan-500/40 rounded-xl dark:border-slate-700 font-black text-cyan-600 dark:text-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Usia (Tahun)</label>
                  <input
                    type="number"
                    min="4"
                    max="65"
                    value={newStudentData.age}
                    onChange={(e) => setNewStudentData({ ...newStudentData, age: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Jenis Kelamin</label>
                  <select
                    value={newStudentData.gender}
                    onChange={(e) =>
                      setNewStudentData({
                        ...newStudentData,
                        gender: e.target.value as 'Laki-laki' | 'Perempuan',
                      })
                    }
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-medium"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Orang Tua / Wali</label>
                  <input
                    type="text"
                    value={newStudentData.parentName}
                    onChange={(e) => setNewStudentData({ ...newStudentData, parentName: e.target.value })}
                    placeholder="Bpk. Hendro"
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700"
                  />
                  <p className="text-[10px] text-amber-500 mt-0.5">Disembunyikan 'xxx' pada tabel umum, tampil di KTA</p>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={newStudentData.birthDate}
                    onChange={(e) => setNewStudentData({ ...newStudentData, birthDate: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-mono"
                  />
                  <p className="text-[10px] text-amber-500 mt-0.5">Disamarkan xx-xx-xxxx pada tabel umum, tampil di KTA</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">No. WhatsApp</label>
                  <input
                    type="text"
                    value={newStudentData.phone}
                    onChange={(e) => setNewStudentData({ ...newStudentData, phone: e.target.value })}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-mono"
                  />
                  <p className="text-[10px] text-amber-500 mt-0.5">Disamarkan pada tabel umum, tampil di KTA</p>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Kontak Darurat</label>
                  <input
                    type="text"
                    value={newStudentData.emergencyContact}
                    onChange={(e) => setNewStudentData({ ...newStudentData, emergencyContact: e.target.value })}
                    placeholder="0813-xxxx-xxxx"
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-mono"
                  />
                  <p className="text-[10px] text-amber-500 mt-0.5">Disamarkan pada tabel umum, tampil di KTA</p>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Foto Profil Peserta (Upload File)</label>
                <div className="mt-1 flex items-center gap-3">
                  {newStudentData.avatarUrl ? (
                    <img
                      src={newStudentData.avatarUrl}
                      alt="Foto Profil"
                      className="w-12 h-12 rounded-xl object-cover border border-cyan-400 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                      <Camera className="w-5 h-5" />
                    </div>
                  )}
                  <label className="px-3 py-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold hover:bg-cyan-100 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          try {
                            const dataUrl = await compressAndResizeImage(f, 400, 400, 0.85);
                            setNewStudentData({ ...newStudentData, avatarUrl: dataUrl });
                          } catch (err: any) {
                            alert(err.message || 'Gagal upload foto');
                          }
                        }
                      }}
                    />
                  </label>
                  <input
                    type="url"
                    value={newStudentData.avatarUrl}
                    onChange={(e) => setNewStudentData({ ...newStudentData, avatarUrl: e.target.value })}
                    placeholder="Atau URL foto..."
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 text-[11px]"
                  />
                </div>
              </div>

              {/* Akun Login Siswa & Wali Otomatis Masuk ke Manajemen User */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <UserCog className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-extrabold text-xs text-indigo-950 dark:text-indigo-200">
                      Akun Login Siswa (Otomatis Masuk ke Manajemen User)
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Auto Active</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Username dan kata sandi dibuat otomatis ke <strong>Manajemen User &amp; Akun</strong> agar murid/wali dapat login langsung ke portal siswa.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <KeyRound className="w-3 h-3 text-indigo-500" />
                      <span>Username Login:</span>
                    </label>
                    <div className="relative mt-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">@</span>
                      <input
                        type="text"
                        value={
                          newStudentData.username ||
                          (newStudentData.name
                            ? newStudentData.name
                                .trim()
                                .toLowerCase()
                                .split(/\s+/)
                                .filter(Boolean)
                                .slice(0, 2)
                                .join('_')
                                .replace(/[^a-z0-9_]/g, '')
                            : '')
                        }
                        onChange={(e) =>
                          setNewStudentData({
                            ...newStudentData,
                            username: e.target.value.toLowerCase().replace(/\s+/g, '_'),
                          })
                        }
                        placeholder="otomatis_dari_nama"
                        className="w-full pl-6 pr-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl dark:border-slate-700 font-mono text-xs font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Kata Sandi Login:
                    </label>
                    <input
                      type="text"
                      value={newStudentData.password || 'siswa123'}
                      onChange={(e) => setNewStudentData({ ...newStudentData, password: e.target.value })}
                      placeholder="siswa123"
                      className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border rounded-xl dark:border-slate-700 font-mono text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold cursor-pointer"
                >
                  Simpan & Generate Barcode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CATAT PEMBAYARAN BARU                             */}
      {/* ======================================================== */}
      {showAddPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-500" />
              Catat Pembayaran SPP / Paket Renang
            </h3>

            <form onSubmit={handleCreatePaymentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Pilih Siswa</label>
                <select
                  value={newPaymentData.studentId}
                  onChange={(e) => setNewPaymentData({ ...newPaymentData, studentId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.barcode} - {s.roleClass.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Nominal Pembayaran (Rp)</label>
                  <input
                    type="number"
                    value={newPaymentData.amount}
                    onChange={(e) => setNewPaymentData({ ...newPaymentData, amount: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Metode Bayar</label>
                  <select
                    value={newPaymentData.paymentMethod}
                    onChange={(e: any) => setNewPaymentData({ ...newPaymentData, paymentMethod: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700"
                  >
                    <option value="Transfer Bank">Transfer Bank</option>
                    <option value="QRIS">QRIS Kasir</option>
                    <option value="Tunai di Kolam">Tunai di Kolam</option>
                    <option value="Kartu Debit">Kartu Debit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Keterangan / Paket</label>
                <input
                  type="text"
                  value={newPaymentData.packageName}
                  onChange={(e) => setNewPaymentData({ ...newPaymentData, packageName: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddPaymentModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT DATA PEMBAYARAN                               */}
      {/* ======================================================== */}
      {editingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Edit Data Pembayaran
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    {editingPayment.invoiceNumber} • {editingPayment.studentName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingPayment(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePaymentSubmit} className="space-y-4 text-xs mt-4">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Pilih Siswa</label>
                <select
                  value={editPaymentData.studentId}
                  onChange={(e) => setEditPaymentData({ ...editPaymentData, studentId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.barcode} - {s.roleClass.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Paket / Keterangan Pembayaran</label>
                <input
                  type="text"
                  required
                  value={editPaymentData.packageName}
                  onChange={(e) => setEditPaymentData({ ...editPaymentData, packageName: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Nominal Pembayaran (Rp)</label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    required
                    value={editPaymentData.amount}
                    onChange={(e) => setEditPaymentData({ ...editPaymentData, amount: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Tanggal Bayar</label>
                  <input
                    type="date"
                    required
                    value={editPaymentData.paymentDate}
                    onChange={(e) => setEditPaymentData({ ...editPaymentData, paymentDate: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Metode Bayar</label>
                  <select
                    value={editPaymentData.paymentMethod}
                    onChange={(e: any) => setEditPaymentData({ ...editPaymentData, paymentMethod: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700"
                  >
                    <option value="Transfer Bank">Transfer Bank</option>
                    <option value="QRIS">QRIS Kasir</option>
                    <option value="Tunai di Kolam">Tunai di Kolam</option>
                    <option value="Kartu Debit">Kartu Debit</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Status Pembayaran</label>
                  <select
                    value={editPaymentData.status}
                    onChange={(e: any) => setEditPaymentData({ ...editPaymentData, status: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-bold"
                  >
                    <option value="lunas">LUNAS</option>
                    <option value="menunggu">MENUNGGU PEMBAYARAN</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Catatan Tambahan</label>
                <input
                  type="text"
                  value={editPaymentData.notes}
                  onChange={(e) => setEditPaymentData({ ...editPaymentData, notes: e.target.value })}
                  placeholder="Opsional: No referensi transfer / catatan admin"
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPayment(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer shadow-md shadow-amber-500/20"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: INPUT ABSEN MANUAL                                 */}
      {/* ======================================================== */}
      {showAddAttendanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-cyan-500" />
                Catat Kehadiran Siswa Manual
              </h3>
              <button
                type="button"
                onClick={() => setShowAddAttendanceModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAttendanceSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Pilih Siswa</label>
                <select
                  value={newAttendanceData.studentId}
                  onChange={(e) => setNewAttendanceData({ ...newAttendanceData, studentId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-semibold"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.barcode} - {s.roleClass.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Tanggal Kehadiran</label>
                <input
                  type="date"
                  value={newAttendanceData.dateStr || todayStr}
                  onChange={(e) => setNewAttendanceData({ ...newAttendanceData, dateStr: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-mono"
                />
              </div>

              {/* Duplicate check warning */}
              {(() => {
                const targetDate = newAttendanceData.dateStr || todayStr;
                const dup = attendances.find(
                  (a) => a.studentId === newAttendanceData.studentId && a.dateStr === targetDate
                );
                if (dup) {
                  return (
                    <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500 mt-0.5" />
                      <div>
                        <p className="font-bold">Siswa Sudah Diabsen di Hari Ini!</p>
                        <p className="text-[11px] mt-0.5">
                          Tercatat pada pukul {dup.timeStr} (Status: {dup.status.toUpperCase()}). Tidak dapat melakukan presensi ganda di hari yang sama.
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Status Kehadiran</label>
                  <select
                    value={newAttendanceData.status}
                    onChange={(e: any) => setNewAttendanceData({ ...newAttendanceData, status: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-bold"
                  >
                    <option value="hadir">Hadir</option>
                    <option value="izin">Izin</option>
                    <option value="alpa">Alpa</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Jalur Kolam</label>
                  <input
                    type="text"
                    value={newAttendanceData.poolLane}
                    onChange={(e) => setNewAttendanceData({ ...newAttendanceData, poolLane: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Catatan Tambahan</label>
                <input
                  type="text"
                  value={newAttendanceData.notes}
                  onChange={(e) => setNewAttendanceData({ ...newAttendanceData, notes: e.target.value })}
                  placeholder="Contoh: Datang tepat waktu / izin orang tua"
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddAttendanceModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={Boolean(
                    attendances.find(
                      (a) =>
                        a.studentId === newAttendanceData.studentId &&
                        a.dateStr === (newAttendanceData.dateStr || todayStr)
                    )
                  )}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-bold cursor-pointer disabled:cursor-not-allowed shadow-md shadow-cyan-600/20"
                >
                  Simpan Presensi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT DATA ABSENSI TERTENTU                         */}
      {/* ======================================================== */}
      {editingAttendance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <Edit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Edit Data Absensi Siswa
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {editAttendanceData.studentName} ({editingAttendance.studentId})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingAttendance(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateAttendanceSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Tanggal Absen</label>
                  <input
                    type="date"
                    required
                    value={editAttendanceData.dateStr}
                    onChange={(e) => setEditAttendanceData({ ...editAttendanceData, dateStr: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Jam Masuk</label>
                  <input
                    type="text"
                    required
                    value={editAttendanceData.timeStr}
                    onChange={(e) => setEditAttendanceData({ ...editAttendanceData, timeStr: e.target.value })}
                    placeholder="mis: 08:30:00 WIB"
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Status Kehadiran</label>
                  <select
                    value={editAttendanceData.status}
                    onChange={(e: any) => setEditAttendanceData({ ...editAttendanceData, status: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-bold"
                  >
                    <option value="hadir">Hadir</option>
                    <option value="izin">Izin</option>
                    <option value="alpa">Alpa</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Jalur Kolam</label>
                  <input
                    type="text"
                    value={editAttendanceData.poolLane}
                    onChange={(e) => setEditAttendanceData({ ...editAttendanceData, poolLane: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Pelatih Bertugas</label>
                <input
                  type="text"
                  value={editAttendanceData.coachName}
                  onChange={(e) => setEditAttendanceData({ ...editAttendanceData, coachName: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Catatan</label>
                <input
                  type="text"
                  value={editAttendanceData.notes}
                  onChange={(e) => setEditAttendanceData({ ...editAttendanceData, notes: e.target.value })}
                  placeholder="Catatan verifikasi / evaluasi pelatih"
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700"
                />
              </div>

              <div className="flex justify-between items-center gap-3 pt-3 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteAttendanceClick(editingAttendance);
                    setEditingAttendance(null);
                  }}
                  className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus Absen
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingAttendance(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold cursor-pointer shadow-md shadow-cyan-600/20"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT TOTAL ABSEN & SISA KUOTA SISWA               */}
      {/* ======================================================== */}
      {editingTotalAttendanceStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={editingTotalAttendanceStudent.avatarUrl}
                  alt={editingTotalAttendanceStudent.name}
                  className="w-10 h-10 rounded-2xl object-cover border border-cyan-400"
                />
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Edit Total Absen & Kuota Siswa
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    {editingTotalAttendanceStudent.name} • {editingTotalAttendanceStudent.barcode}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingTotalAttendanceStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTotalAttendance} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-1 text-slate-600 dark:text-slate-300">
                <p className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-cyan-500" />
                  Pengaturan Langsung Total Absen Dilaksanakan:
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Ubah total absensi atau kuota pertemuan jika terdapat penyesuaian manual, dispensasi sakit, atau pembaruan paket les renang.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Total Absen Selesai
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editTotalData.executedSessions}
                    onChange={(e) => {
                      const exec = Number(e.target.value);
                      const rem = Math.max(0, editTotalData.totalQuota - exec);
                      setEditTotalData({
                        ...editTotalData,
                        executedSessions: exec,
                        remainingQuota: rem,
                      });
                    }}
                    className="w-full mt-1 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-emerald-500/40 rounded-xl dark:border-slate-700 font-black text-emerald-600 dark:text-emerald-400 text-sm"
                  />
                  <span className="text-[10px] text-slate-400">Sesi Terlaksana</span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Total Kuota Paket
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editTotalData.totalQuota}
                    onChange={(e) => {
                      const tot = Number(e.target.value);
                      const rem = Math.max(0, tot - editTotalData.executedSessions);
                      setEditTotalData({
                        ...editTotalData,
                        totalQuota: tot,
                        remainingQuota: rem,
                      });
                    }}
                    className="w-full mt-1 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-bold text-sm"
                  />
                  <span className="text-[10px] text-slate-400">Total Pertemuan</span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Sisa Pertemuan
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editTotalData.remainingQuota}
                    onChange={(e) => {
                      const rem = Number(e.target.value);
                      const exec = Math.max(0, editTotalData.totalQuota - rem);
                      setEditTotalData({
                        ...editTotalData,
                        remainingQuota: rem,
                        executedSessions: exec,
                      });
                    }}
                    className="w-full mt-1 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-cyan-500/40 rounded-xl dark:border-slate-700 font-black text-cyan-600 dark:text-cyan-400 text-sm"
                  />
                  <span className="text-[10px] text-slate-400">Sisa Kuota</span>
                </div>
              </div>

              {/* Riwayat Absensi Siswa Ini (Bisa Dihapus jika Salah) */}
              {(() => {
                const studentAtts = attendances.filter(
                  (a) => a.studentId === editingTotalAttendanceStudent.id
                );
                return (
                  <div className="pt-3 border-t dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5 text-cyan-500" />
                        Riwayat Log Absensi ({studentAtts.length} Catatan):
                      </p>
                      <span className="text-[10px] text-slate-400">
                        Hapus record jika ada salah absen
                      </span>
                    </div>

                    {studentAtts.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic py-2">
                        Belum ada riwayat absensi tercatat untuk siswa ini.
                      </p>
                    ) : (
                      <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                        {studentAtts.map((att) => (
                          <div
                            key={att.id}
                            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[11px]"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                  att.status === 'hadir'
                                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                    : att.status === 'izin'
                                    ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                    : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                                }`}
                              >
                                {att.status}
                              </span>
                              <span className="font-bold text-slate-700 dark:text-slate-300">
                                {att.dateStr}
                              </span>
                              <span className="text-slate-400 font-mono">
                                {att.timeStr}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  handleOpenEditAttendance(att);
                                  setEditingTotalAttendanceStudent(null);
                                }}
                                className="p-1 rounded-lg text-slate-500 hover:text-cyan-600 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                                title="Edit Absen Ini"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  handleDeleteAttendanceClick(att);
                                }}
                                className="p-1 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/40 cursor-pointer"
                                title="Hapus Log Absen Ini"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleResetAttendanceClick(editingTotalAttendanceStudent)}
                  className="px-3.5 py-2.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Reset / Hapus Semua Log Absen
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingTotalAttendanceStudent(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow-md shadow-emerald-600/20"
                  >
                    Simpan Total & Kuota
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: SEMUA RIWAYAT TOTAL ABSEN PESERTA (BISA HAPUS JIKA SALAH) */}
      {/* ======================================================== */}
      {viewingStudentAttendanceHistory && (() => {
        const currentStudent =
          students.find((s) => s.id === viewingStudentAttendanceHistory.id) ||
          viewingStudentAttendanceHistory;
        const studentAttendances = attendances.filter(
          (a) => a.studentId === currentStudent.id
        );
        const filteredStudentAttendances = studentAttendances.filter((att) => {
          if (!historySearchTerm) return true;
          const term = historySearchTerm.toLowerCase();
          return (
            att.dateStr.toLowerCase().includes(term) ||
            att.timeStr.toLowerCase().includes(term) ||
            att.status.toLowerCase().includes(term) ||
            att.coachName.toLowerCase().includes(term) ||
            (att.notes && att.notes.toLowerCase().includes(term))
          );
        });
        const executedCount = getStudentExecutedAttendance(currentStudent);
        const roleMeta = ROLE_LABELS[currentStudent.roleClass] || {
          title: currentStudent.roleClass,
          badgeBg: 'bg-cyan-100 text-cyan-800',
          textBadge: currentStudent.roleClass.toUpperCase(),
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn overflow-y-auto">
            <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={currentStudent.avatarUrl}
                    alt={currentStudent.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-400/40 shadow-sm flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                        {currentStudent.name}
                      </h3>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${roleMeta.badgeBg}`}>
                        {roleMeta.textBadge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                      <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                        {currentStudent.barcode}
                      </span>
                      <span>•</span>
                      <span>Usia: {currentStudent.age} Th • Tgl: {privacyMaskActive ? maskBirthDate(currentStudent.birthDate) : (currentStudent.birthDate || 'xx-xx-xxxx')}</span>
                      <span>•</span>
                      <span>Wali: {privacyMaskActive ? maskParentName(currentStudent.parentName) : currentStudent.parentName}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setViewingStudentAttendanceHistory(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Total Absen Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">Total Sesi Hadir</span>
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-300 mt-0.5">
                    {executedCount} Sesi
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-center">
                  <span className="text-[11px] font-bold text-cyan-700 dark:text-cyan-400">Sisa Kuota</span>
                  <p className="text-xl font-black text-cyan-600 dark:text-cyan-300 mt-0.5">
                    {currentStudent.remainingQuota} Pertemuan
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Total Paket</span>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    {currentStudent.totalQuota} Pertemuan
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                  <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400">Total Log Tercatat</span>
                  <p className="text-xl font-black text-indigo-600 dark:text-indigo-300 mt-0.5">
                    {studentAttendances.length} Catatan
                  </p>
                </div>
              </div>

              {/* Alert / Notice regarding editing and deleting errors */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5 mb-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">Semua Riwayat Absensi & Koreksi Kesalahan:</p>
                  <p className="text-[11px] mt-0.5">
                    Jika ada kesalahan input tanggal, jam, status, atau siswa salah diabsen, klik tombol <strong className="text-rose-600 dark:text-rose-400">Hapus (Ikon Tong Sampah)</strong> pada baris terkait. Menghapus absensi Hadir akan otomatis mengembalikan 1 kuota sesi ke sisa kuota siswa.
                  </p>
                </div>
              </div>

              {/* Search within student attendance history */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={historySearchTerm}
                    onChange={(e) => setHistorySearchTerm(e.target.value)}
                    placeholder="Cari tanggal, pelatih, status, catatan..."
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                {historySearchTerm && (
                  <button
                    onClick={() => setHistorySearchTerm('')}
                    className="text-xs text-rose-500 hover:underline cursor-pointer font-semibold"
                  >
                    Reset Filter
                  </button>
                )}
                <span className="text-xs text-slate-500 font-semibold">
                  {filteredStudentAttendances.length} dari {studentAttendances.length} Riwayat
                </span>
              </div>

              {/* Table of Attendance History */}
              <div className="flex-1 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider sticky top-0 z-10">
                    <tr>
                      <th className="py-3 px-3.5 text-center">#</th>
                      <th className="py-3 px-3.5">Tanggal & Jam</th>
                      <th className="py-3 px-3.5">Status</th>
                      <th className="py-3 px-3.5">Jalur & Pelatih</th>
                      <th className="py-3 px-3.5">Metode</th>
                      <th className="py-3 px-3.5">Catatan</th>
                      <th className="py-3 px-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {filteredStudentAttendances.map((att, idx) => (
                      <tr key={att.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3.5 text-center font-bold text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3.5 font-mono">
                          <p className="font-bold text-slate-900 dark:text-white">{att.dateStr}</p>
                          <div className="flex items-center gap-1 text-[11px] text-cyan-600 dark:text-cyan-400 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{att.timeStr}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase inline-block ${
                              att.status === 'hadir'
                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                : att.status === 'izin'
                                ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                            }`}
                          >
                            {att.status}
                          </span>
                        </td>
                        <td className="py-3 px-3.5">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{att.poolLane}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Pelatih: {att.coachName}</p>
                        </td>
                        <td className="py-3 px-3.5">
                          {att.verifiedByBarcode ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              <ScanLine className="w-3 h-3" /> Barcode
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">Manual Entry</span>
                          )}
                        </td>
                        <td className="py-3 px-3.5 text-slate-500 dark:text-slate-400 max-w-[180px] truncate" title={att.notes}>
                          {att.notes || '-'}
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                handleOpenEditAttendance(att);
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-cyan-50 hover:text-cyan-600 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                              title="Edit Absen Ini"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleDeleteAttendanceClick(att);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                              title="Hapus Absen Siswa Ini Jika Terjadi Kesalahan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredStudentAttendances.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          <CalendarCheck className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                          <p className="font-bold text-sm text-slate-600 dark:text-slate-300">
                            {studentAttendances.length === 0
                              ? 'Belum ada riwayat absensi tercatat untuk siswa ini.'
                              : 'Tidak ada riwayat absensi yang cocok dengan filter pencarian.'}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            Anda dapat mencatat presensi baru menggunakan tombol di bawah.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Modal Footer */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewAttendanceData((prev) => ({
                        ...prev,
                        studentId: currentStudent.id,
                        dateStr: todayStr,
                      }));
                      setShowAddAttendanceModal(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-600/20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    + Catat Absen Baru
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleOpenEditTotal(currentStudent);
                      setViewingStudentAttendanceHistory(null);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit Kuota / Total
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setViewingStudentAttendanceHistory(null)}
                  className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  Tutup Riwayat
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ======================================================== */}
      {/* MODAL: TAMBAH USER AKUN                                  */}
      {/* ======================================================== */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <UserCog className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Buat Akun Pengguna Baru
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Daftarkan username, password, dan hak akses login sistem
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-4 text-xs mt-4">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Nama Lengkap Pengguna <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  placeholder="Contoh: Coach Rendy Septian / Staff Admin"
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Username Akun</span>
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400">@</span>
                    <input
                      type="text"
                      value={newUserData.username}
                      onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                      placeholder="rendy_coach"
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Tanpa spasi. Otomatis dibuat jika kosong.</p>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Kata Sandi (Password)</span>
                    <button
                      type="button"
                      onClick={() => setShowAddUserPassword(!showAddUserPassword)}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {showAddUserPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showAddUserPassword ? 'Tutup' : 'Lihat'}</span>
                    </button>
                  </label>
                  <input
                    type={showAddUserPassword ? 'text' : 'password'}
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    placeholder="tirta123 (default)"
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Bawaan jika kosong: <strong>tirta123</strong></p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Email Login <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    placeholder="rendy@tirta.com"
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Hak Akses / Peran
                  </label>
                  <select
                    value={newUserData.role}
                    onChange={(e: any) => {
                      const newRole = e.target.value;
                      if (newRole === 'pelatih') {
                        setNewUserData({
                          ...newUserData,
                          role: newRole,
                          barcode: newUserData.barcode || getNextCoachBarcode(),
                          password: newUserData.password || 'coach123',
                        });
                      } else {
                        setNewUserData({ ...newUserData, role: newRole });
                      }
                    }}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-bold text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="admin">Administrator (Akses Penuh)</option>
                    <option value="pelatih">Staff Pelatih (Presensi Kolam &amp; Barcode Otomatis)</option>
                    <option value="dasar">Siswa Kelas Dasar</option>
                    <option value="pemula">Siswa Kelas Pemula</option>
                    <option value="prestasi">Siswa Kelas Prestasi</option>
                    <option value="privat_4">Siswa Privat 4 Sesi</option>
                    <option value="privat_8">Siswa Privat 8 Sesi</option>
                    <option value="privat_12">Siswa Privat 12 Sesi</option>
                  </select>
                </div>
              </div>

              {newUserData.role === 'pelatih' && (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Mode Pelatih: Barcode <strong>{newUserData.barcode || getNextCoachBarcode()}</strong> &amp; Password <strong>coach123</strong> otomatis dibuat &amp; disinkronkan ke daftar pelatih resmi.</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Nomor Telepon / WhatsApp</label>
                  <input
                    type="text"
                    value={newUserData.phone}
                    onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                    placeholder="08xxxxxxxxxx"
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">ID / Barcode Terkait (Opsional)</label>
                  <input
                    type="text"
                    value={newUserData.barcode}
                    onChange={(e) => setNewUserData({ ...newUserData, barcode: e.target.value })}
                    placeholder="AQUA-DSR-101 / c1 / std-01"
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Foto Profil (Avatar) - Upload File / URL</label>
                <div className="mt-1 flex items-center gap-3">
                  {newUserData.avatarUrl ? (
                    <img
                      src={newUserData.avatarUrl}
                      alt="Avatar"
                      className="w-12 h-12 rounded-xl object-cover border border-indigo-400 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                      <Camera className="w-5 h-5" />
                    </div>
                  )}
                  <label className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          try {
                            const dataUrl = await compressAndResizeImage(f, 400, 400, 0.85);
                            setNewUserData({ ...newUserData, avatarUrl: dataUrl });
                          } catch (err: any) {
                            alert(err.message || 'Gagal upload foto');
                          }
                        }
                      }}
                    />
                  </label>
                  <input
                    type="url"
                    value={newUserData.avatarUrl}
                    onChange={(e) => setNewUserData({ ...newUserData, avatarUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 text-[11px] text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold cursor-pointer text-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  Simpan & Buat Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: TAMBAH PELATIH BARU (AUTO AKUN, PASSWORD, BARCODE) */}
      {/* ======================================================== */}
      {showAddCoachModal && (() => {
        const cleanName = coachFormData.name.trim().toLowerCase();
        const parts = cleanName.split(/\s+/).filter(Boolean);
        const first = (parts[0] || 'coach').replace(/[^a-z0-9]/g, '');
        const second = parts[1] ? parts[1].replace(/[^a-z0-9]/g, '') : '';
        const suggestedUser = second ? `${first}_${second}` : (first.startsWith('coach') ? first : `coach_${first}`);
        const previewUser = coachFormData.username.trim()
          ? coachFormData.username.trim().toLowerCase().replace(/\s+/g, '_')
          : suggestedUser || 'coach';
        const previewBarcode = coachFormData.barcode.trim() || getNextCoachBarcode();
        const previewPassword = coachFormData.password.trim() || 'coach123';

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn overflow-y-auto">
            <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Tambah Pelatih Baru</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] border border-emerald-500/20 uppercase">
                        Auto Barcode &amp; Akun
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Sistem otomatis membuat username, password (coach123), dan barcode presensi
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddCoachModal(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Automatic Generation Highlights */}
              <div className="my-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Kredensial &amp; Barcode Pelatih Dibuat Otomatis
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    Siap Login &amp; Absensi
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {/* Barcode Badge */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/80 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 font-bold">Barcode ID Pelatih:</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-mono font-black text-emerald-700 dark:text-emerald-300">
                        {previewBarcode}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(previewBarcode);
                          showToast('Barcode pelatih disalin!');
                        }}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-emerald-600 cursor-pointer"
                        title="Salin Barcode"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Username Badge */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/80 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 font-bold">Username Login:</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-mono font-black text-indigo-600 dark:text-indigo-400 truncate">
                        @{previewUser}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(previewUser);
                          showToast('Username pelatih disalin!');
                        }}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-indigo-600 cursor-pointer"
                        title="Salin Username"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Password Badge */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/80 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 font-bold">Password Login:</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-mono font-black text-slate-800 dark:text-white">
                        {showCoachPassword ? previewPassword : '••••••••'}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => setShowCoachPassword(!showCoachPassword)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                          title={showCoachPassword ? 'Sembunyikan' : 'Lihat Password'}
                        >
                          {showCoachPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(previewPassword);
                            showToast('Password disalin!');
                          }}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                          title="Salin Password"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Input */}
              <form onSubmit={handleCreateCoachSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Nama Lengkap Pelatih <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={coachFormData.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      const cName = newName.trim().toLowerCase();
                      const cParts = cName.split(/\s+/).filter(Boolean);
                      const f = (cParts[0] || 'coach').replace(/[^a-z0-9]/g, '');
                      const s = cParts[1] ? cParts[1].replace(/[^a-z0-9]/g, '') : '';
                      const autoU = s ? `${f}_${s}` : (f.startsWith('coach') ? f : `coach_${f}`);
                      setCoachFormData({
                        ...coachFormData,
                        name: newName,
                        username: autoU,
                        email: `${autoU}@aquaflow.id`,
                      });
                    }}
                    placeholder="Contoh: Coach Rendy Pratama, S.Or"
                    className="w-full mt-1 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Nomor WhatsApp / Telepon <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={coachFormData.phone}
                      onChange={(e) => setCoachFormData({ ...coachFormData, phone: e.target.value })}
                      placeholder="0812-3456-7890"
                      className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Pengalaman Melatih (Tahun)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="40"
                      value={coachFormData.experienceYears}
                      onChange={(e) => setCoachFormData({ ...coachFormData, experienceYears: Number(e.target.value) })}
                      className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-semibold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Spesialisasi Gaya Renang &amp; Kualifikasi
                  </label>
                  <input
                    type="text"
                    value={coachFormData.specialty}
                    onChange={(e) => setCoachFormData({ ...coachFormData, specialty: e.target.value })}
                    placeholder="Contoh: Gaya Dada & Bebas / Spesialis Prestasi & Time Trial"
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Kustom Username (Opsional)
                    </label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400">@</span>
                      <input
                        type="text"
                        value={coachFormData.username}
                        onChange={(e) => setCoachFormData({ ...coachFormData, username: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                        placeholder={previewUser}
                        className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Kustom Barcode (Opsional)
                    </label>
                    <input
                      type="text"
                      value={coachFormData.barcode}
                      onChange={(e) => setCoachFormData({ ...coachFormData, barcode: e.target.value.toUpperCase() })}
                      placeholder={previewBarcode}
                      className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Avatar Photo */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Foto Profil Pelatih
                  </label>
                  <div className="mt-1 flex items-center gap-3">
                    {coachFormData.avatarUrl ? (
                      <img
                        src={coachFormData.avatarUrl}
                        alt="Avatar"
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500 shadow shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                        <Camera className="w-5 h-5" />
                      </div>
                    )}
                    <label className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            try {
                              const dataUrl = await compressAndResizeImage(f, 400, 400, 0.85);
                              setCoachFormData({ ...coachFormData, avatarUrl: dataUrl });
                            } catch (err: any) {
                              alert(err.message || 'Gagal upload foto');
                            }
                          }
                        }}
                      />
                    </label>
                    <input
                      type="url"
                      value={coachFormData.avatarUrl}
                      onChange={(e) => setCoachFormData({ ...coachFormData, avatarUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 text-[11px] text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 pt-3 border-t dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddCoachModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold cursor-pointer text-slate-700 dark:text-slate-300"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow-md shadow-emerald-600/20 flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Simpan &amp; Buat Pelatih</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* ======================================================== */}
      {/* MODAL: EDIT AKUN PENGGUNA (USERNAME, PASSWORD & PERAN)   */}
      {/* ======================================================== */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Edit Akun Pengguna: {editingUser.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Perbarui profil, ubah username login, ganti password, & hak akses
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUserSubmit} className="space-y-4 text-xs mt-4">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Nama Lengkap Pengguna <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editUserData.name}
                  onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                  placeholder="Nama lengkap pengguna"
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Username Login</span>
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400">@</span>
                    <input
                      type="text"
                      required
                      value={editUserData.username}
                      onChange={(e) => setEditUserData({ ...editUserData, username: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                      placeholder="username_pengguna"
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Digunakan untuk login ke sistem</p>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Ganti Kata Sandi (Password)</span>
                    <button
                      type="button"
                      onClick={() => setShowEditUserPassword(!showEditUserPassword)}
                      className="text-[10px] text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {showEditUserPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showEditUserPassword ? 'Tutup' : 'Lihat'}</span>
                    </button>
                  </label>
                  <input
                    type={showEditUserPassword ? 'text' : 'password'}
                    value={editUserData.password}
                    onChange={(e) => setEditUserData({ ...editUserData, password: e.target.value })}
                    placeholder="Masukkan password baru"
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Biarkan jika tidak ingin mengubah</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Email Login <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={editUserData.email}
                    onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                    placeholder="nama@tirta.com"
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Peran / Hak Akses
                  </label>
                  <select
                    value={editUserData.role}
                    onChange={(e: any) => setEditUserData({ ...editUserData, role: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-bold text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="admin">Administrator (Akses Penuh)</option>
                    <option value="pelatih">Staff Pelatih (Presensi Kolam)</option>
                    <option value="dasar">Siswa Kelas Dasar</option>
                    <option value="pemula">Siswa Kelas Pemula</option>
                    <option value="prestasi">Siswa Kelas Prestasi</option>
                    <option value="privat_4">Siswa Privat 4 Sesi</option>
                    <option value="privat_8">Siswa Privat 8 Sesi</option>
                    <option value="privat_12">Siswa Privat 12 Sesi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Nomor Telepon / WhatsApp</label>
                  <input
                    type="text"
                    value={editUserData.phone}
                    onChange={(e) => setEditUserData({ ...editUserData, phone: e.target.value })}
                    placeholder="08xxxxxxxxxx"
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">ID / Barcode Terkait</label>
                  <input
                    type="text"
                    value={editUserData.barcode}
                    onChange={(e) => setEditUserData({ ...editUserData, barcode: e.target.value })}
                    placeholder="AQUA-DSR-101 / c1 / std-01"
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Foto Profil (Avatar) - Upload File / URL</label>
                <div className="mt-1 flex items-center gap-3">
                  {editUserData.avatarUrl ? (
                    <img
                      src={editUserData.avatarUrl}
                      alt="Avatar"
                      className="w-12 h-12 rounded-xl object-cover border border-amber-400 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                      <Camera className="w-5 h-5" />
                    </div>
                  )}
                  <label className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Foto Baru</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          try {
                            const dataUrl = await compressAndResizeImage(f, 400, 400, 0.85);
                            setEditUserData({ ...editUserData, avatarUrl: dataUrl });
                          } catch (err: any) {
                            alert(err.message || 'Gagal upload foto');
                          }
                        }
                      }}
                    />
                  </label>
                  <input
                    type="url"
                    value={editUserData.avatarUrl}
                    onChange={(e) => setEditUserData({ ...editUserData, avatarUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 text-[11px] text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold cursor-pointer text-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer shadow-md shadow-amber-500/20"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: KONFIRMASI HAPUS PENGGUNA                         */}
      {/* ======================================================== */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-rose-200 dark:border-rose-900/40 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Hapus Akun Pengguna?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Apakah Anda yakin ingin menghapus akun pengguna ini dari akademi?
            </p>

            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-center gap-3 text-left">
              <img
                src={deletingUser.avatarUrl}
                alt={deletingUser.name}
                className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                onError={(e: any) => {
                  e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                  {deletingUser.name}
                </p>
                <p className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 truncate">
                  @{deletingUser.username || deletingUser.email.split('@')[0]}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {deletingUser.email}
                </p>
              </div>
            </div>

            <p className="text-[11px] text-rose-500 dark:text-rose-400 font-semibold mt-3">
              Perhatian: Akun yang dihapus tidak akan dapat login kembali.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-5">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 cursor-pointer transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-xs text-white shadow-lg shadow-rose-600/30 cursor-pointer transition-all"
              >
                Ya, Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CETAK KWITANSI / INVOICE PREVIEW                  */}
      {/* ======================================================== */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl text-slate-900 border border-slate-200">
            <div className="text-center border-b pb-4 mb-4">
              <span className="text-[10px] font-bold tracking-widest text-cyan-600 uppercase">
                Tirta Samudra Swimming Academy
              </span>
              <h3 className="text-lg font-black text-slate-900">KWITANSI RESMI PEMBAYARAN</h3>
              <p className="font-mono text-xs text-slate-500">{selectedReceipt.invoiceNumber}</p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Nama Siswa:</span>
                <span className="font-bold text-slate-900">{selectedReceipt.studentName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Kategori Paket:</span>
                <span className="font-bold text-slate-900 capitalize">{selectedReceipt.roleClass.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Keterangan:</span>
                <span className="font-semibold text-slate-700">{selectedReceipt.packageName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Metode Pembayaran:</span>
                <span className="font-bold text-slate-900">{selectedReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Tanggal Transaksi:</span>
                <span className="font-mono">{selectedReceipt.paymentDate}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-slate-900 text-sm font-extrabold">
                <span>TOTAL DIBAYAR:</span>
                <span className="text-emerald-600 font-mono">{formatRupiah(selectedReceipt.amount)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Status Pembayaran:</span>
                <span className="font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-full">
                  {selectedReceipt.status}
                </span>
              </div>

              {/* Status Sesi Pertemuan Siswa */}
              {(() => {
                const st = students.find((s) => s.id === selectedReceipt.studentId);
                if (!st) return null;
                const executed = getStudentExecutedAttendance(st);
                const total = getEffectiveStudentQuota(st, pricingPackages);
                const remaining = Math.max(0, total - executed);
                const isFinished = remaining <= 0 || executed >= total;
                return (
                  <div className="pt-2 mt-1 border-t border-dashed border-slate-200 space-y-1.5">
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-500 flex items-center gap-1 font-semibold">
                        <CalendarCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Total Masuk Latihan:</span>
                      </span>
                      <span className="font-mono font-black text-slate-900">
                        {executed}x Latihan <span className="text-slate-400 font-normal">/ {total} Sesi</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-500 font-semibold">Status Sesi Pertemuan:</span>
                      {isFinished ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-black text-[10px] flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-rose-500" />
                          <span>Pertemuan Selesai (Kuota Habis)</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 font-bold text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>Sedang Berjalan ({remaining} Sisa Sesi)</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak Kwitansi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT / TAMBAH PAKET PERTEMUAN & HARGA              */}
      {/* ======================================================== */}
      {showAddEditPackageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {editingPackage ? 'Edit Paket Pertemuan & Harga' : 'Tambah Paket Pertemuan & Harga Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Atur kuota sesi, jadwal latihan, dan tarif iuran bulanan
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddEditPackageModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Nama Paket Kursus</label>
                <input
                  type="text"
                  required
                  value={packageFormData.packageName}
                  onChange={(e) => setPackageFormData({ ...packageFormData, packageName: e.target.value })}
                  placeholder="Contoh: Kelas Pemula (Pembayaran Bulanan)"
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Kategori Kelas</label>
                  <select
                    value={packageFormData.roleClass}
                    onChange={(e) => setPackageFormData({ ...packageFormData, roleClass: e.target.value as UserRole })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700"
                  >
                    <option value="pemula">Kelas Pemula (Paling Populer)</option>
                    <option value="prestasi">Kelas Prestasi (Atlet Unggulan)</option>
                    <option value="dasar">Kelas Dasar (Adaptasi Air)</option>
                    <option value="privat_4">Privat 4 Pertemuan</option>
                    <option value="privat_8">Privat 8 Pertemuan</option>
                    <option value="privat_12">Privat 12 Pertemuan</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Sistem Pembayaran</label>
                  <select
                    value={packageFormData.billingType}
                    onChange={(e) => setPackageFormData({ ...packageFormData, billingType: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-bold"
                  >
                    <option value="bulanan">Pembayaran Bulanan (Iuran Rutin)</option>
                    <option value="per_paket">Pembayaran Per Paket (Kontrak)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {packageFormData.billingType === 'bulanan' ? 'Iuran Bulanan (Rp)' : 'Harga Paket (Rp)'}
                  </label>
                  <input
                    type="number"
                    min="10000"
                    step="5000"
                    required
                    value={packageFormData.price}
                    onChange={(e) => setPackageFormData({ ...packageFormData, price: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Jumlah Pertemuan / Sesi</label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    required
                    value={packageFormData.sessionsCount}
                    onChange={(e) => setPackageFormData({ ...packageFormData, sessionsCount: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Frekuensi per Minggu</label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    required
                    value={packageFormData.sessionsPerWeek}
                    onChange={(e) => setPackageFormData({ ...packageFormData, sessionsPerWeek: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Durasi Sesi (Menit)</label>
                  <input
                    type="number"
                    min="30"
                    max="180"
                    step="15"
                    required
                    value={packageFormData.durationMinutes}
                    onChange={(e) => setPackageFormData({ ...packageFormData, durationMinutes: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Rasio Pelatih : Siswa</label>
                  <input
                    type="text"
                    value={packageFormData.coachRatio}
                    onChange={(e) => setPackageFormData({ ...packageFormData, coachRatio: e.target.value })}
                    placeholder="Contoh: 1 Pelatih : 6 Siswa"
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Jalur Kolam</label>
                  <input
                    type="text"
                    value={packageFormData.poolLane}
                    onChange={(e) => setPackageFormData({ ...packageFormData, poolLane: e.target.value })}
                    placeholder="Contoh: Kolam Utama - Jalur 1 & 2"
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Jadwal & Hari Latihan</label>
                  <input
                    type="text"
                    value={packageFormData.scheduleDescription}
                    onChange={(e) => setPackageFormData({ ...packageFormData, scheduleDescription: e.target.value })}
                    placeholder="Contoh: Selasa, Kamis, Sabtu (15:30 WIB)"
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Fasilitas & Benefit (Tulis 1 baris per benefit)
                </label>
                <textarea
                  rows={3}
                  value={packageFormData.featuresText}
                  onChange={(e) => setPackageFormData({ ...packageFormData, featuresText: e.target.value })}
                  placeholder="Contoh:&#10;12 Sesi Pertemuan Terbimbing&#10;Gratis Peminjaman Kickboard&#10;Evaluasi Kenaikan Tingkat Bulanan"
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="packageIsActive"
                  checked={packageFormData.isActive}
                  onChange={(e) => setPackageFormData({ ...packageFormData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-cyan-600 accent-cyan-600 cursor-pointer"
                />
                <label htmlFor="packageIsActive" className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Paket Aktif & Ditampilkan di Pendaftaran
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddEditPackageModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold cursor-pointer shadow-md shadow-cyan-600/20"
                >
                  {editingPackage ? 'Simpan Perubahan' : 'Tambah Paket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: PRATINJAU BUKTI TRANSFER & VERIFIKASI ADMIN        */}
      {/* ======================================================== */}
      {viewingAdminProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Verifikasi Bukti Transfer Pembayaran
                  </h3>
                  <p className="text-xs text-slate-500">
                    {viewingAdminProof.invoiceNumber} • {viewingAdminProof.studentName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingAdminProof(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Details */}
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Paket</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                    {viewingAdminProof.packageName}
                  </p>
                  <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-extrabold">
                    +{viewingAdminProof.sessionsToAdd || 12} Sesi Latihan
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Nominal</span>
                  <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
                    Rp {viewingAdminProof.amount.toLocaleString('id-ID')}
                  </p>
                  <span className="text-[10px] text-slate-400">Harus sesuai mutasi</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Rekening Tujuan</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                    {viewingAdminProof.transferBankName || 'Transfer Bank'}
                  </p>
                  <span className="text-[10px] text-slate-400">Rekening Resmi</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Pengirim</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                    {viewingAdminProof.senderAccountName || 'Wali Siswa'}
                  </p>
                  <span className="text-[10px] text-slate-400">Atas Nama Rekening</span>
                </div>
              </div>

              {viewingAdminProof.notes && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200">
                  <strong>Catatan Pengirim:</strong> "{viewingAdminProof.notes}"
                </div>
              )}

              {/* Struk / Screenshot Image */}
              <div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">
                  Foto Bukti Transfer (Screenshot m-Banking / Struk ATM):
                </span>
                <div className="rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-black flex items-center justify-center max-h-96">
                  {viewingAdminProof.proofUrl ? (
                    <img
                      src={viewingAdminProof.proofUrl}
                      alt="Struk Transfer"
                      className="max-h-96 object-contain"
                    />
                  ) : (
                    <div className="p-8 text-center text-slate-400">
                      <AlertCircle className="w-8 h-8 mx-auto mb-1 opacity-50" />
                      <p className="text-xs">Foto bukti transfer tidak tersedia.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setViewingAdminProof(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Tutup
                </button>

                <div className="flex items-center gap-2">
                  {viewingAdminProof.status === 'menunggu' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleAdminRejectProof(viewingAdminProof.id)}
                        className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs font-bold transition-all cursor-pointer"
                      >
                        Tolak Bukti
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAdminVerifyProof(viewingAdminProof.id)}
                        disabled={verifyingPaymentId === viewingAdminProof.id}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/25 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verifikasi & Tambah +{viewingAdminProof.sessionsToAdd || 12} Kuota Sesi</span>
                      </button>
                    </>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold flex items-center gap-1.5 border border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4" />
                      Sudah Diverifikasi Lunas
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: PENGATURAN KELOLA NOMOR REKENING BANK             */}
      {/* ======================================================== */}
      {showBankManagementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Pengaturan Nomor Rekening Pembayaran
                  </h3>
                  <p className="text-xs text-slate-500">
                    Atur rekening bank resmi tujuan transfer yang dilihat oleh wali atlet saat kuota habis &amp; membayar iuran
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBankManagementModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="mt-4 p-4 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Opsi Cepat Rekening Bank:
                </p>
                <p className="text-[11px] text-slate-500">
                  Total {effectiveBankAccounts.length} rekening terdaftar ({effectiveBankAccounts.filter((b) => b.isActive).length} aktif ditampilkan ke siswa)
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSetOnlyBriActive}
                  className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                  title="Hanya aktifkan rekening BRI saja"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Setel Hanya BRI Aktif</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenAddBank}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Rekening Baru</span>
                </button>
              </div>
            </div>

            {/* Bank Accounts List Table */}
            <div className="mt-4 overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Nama Bank</th>
                    <th className="py-3 px-4">Nomor Rekening</th>
                    <th className="py-3 px-4">Atas Nama (Pemilik)</th>
                    <th className="py-3 px-4">Status di Siswa</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {effectiveBankAccounts.map((acc) => (
                    <tr
                      key={acc.id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors ${
                        acc.isActive ? 'bg-cyan-50/20 dark:bg-cyan-950/10' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <Building2 className={`w-4 h-4 ${acc.isActive ? 'text-cyan-600' : 'text-slate-400'}`} />
                          <div>
                            <span>{acc.bankName}</span>
                            {acc.notes && (
                              <span className="block text-[10px] text-slate-400 font-normal">
                                {acc.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-black text-sm text-slate-900 dark:text-white">
                        {acc.accountNumber}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {acc.accountHolder}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleBankActive(acc)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black cursor-pointer transition-all flex items-center gap-1 w-fit ${
                            acc.isActive
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-500 hover:bg-slate-300'
                          }`}
                          title="Klik untuk aktifkan/nonaktifkan rekening ini"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${acc.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          <span>{acc.isActive ? 'Aktif (Tampil)' : 'Non-aktif (Sembunyi)'}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditBank(acc)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] cursor-pointer shadow-xs transition-all flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBank(acc.id, acc.bankName)}
                            className="p-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 font-bold cursor-pointer transition-all"
                            title="Hapus Rekening"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Tip: Jika hanya menggunakan 1 rekening (misal BRI saja), pastikan hanya rekening tersebut yang bertanda <strong>Aktif</strong>.
              </span>
              <button
                type="button"
                onClick={() => setShowBankManagementModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: FORM TAMBAH / EDIT NOMOR REKENING BANK             */}
      {/* ======================================================== */}
      {showAddEditBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {editingBank ? 'Edit Nomor Rekening Bank' : 'Tambah Rekening Bank Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Masukkan rincian nomor rekening resmi transfer siswa
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddEditBankModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Bank Presets Buttons */}
            <div className="mt-4">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Pilih Bank Cepat (Preset):
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { name: 'BRI (Bank Rakyat Indonesia)', code: 'BRI' },
                  { name: 'BCA (Bank Central Asia)', code: 'BCA' },
                  { name: 'Bank Mandiri', code: 'MANDIRI' },
                  { name: 'BNI (Bank Negara Indonesia)', code: 'BNI' },
                  { name: 'BSI (Bank Syariah Indonesia)', code: 'BSI' },
                  { name: 'CIMB Niaga', code: 'CIMB' },
                  { name: 'Bank Permata', code: 'PERMATA' },
                  { name: 'Bank Jago', code: 'JAGO' },
                ].map((preset) => (
                  <button
                    key={preset.code}
                    type="button"
                    onClick={() =>
                      setBankFormData({
                        ...bankFormData,
                        bankName: preset.name,
                        bankCode: preset.code,
                      })
                    }
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer text-center ${
                      bankFormData.bankCode === preset.code
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 font-black'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {preset.code}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveBankAccount} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Bank <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={bankFormData.bankName}
                  onChange={(e) => setBankFormData({ ...bankFormData, bankName: e.target.value })}
                  placeholder="Contoh: BRI (Bank Rakyat Indonesia)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kode Singkat <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    value={bankFormData.bankCode}
                    onChange={(e) => setBankFormData({ ...bankFormData, bankCode: e.target.value.toUpperCase() })}
                    placeholder="BRI / BCA"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor Rekening <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    value={bankFormData.accountNumber}
                    onChange={(e) => setBankFormData({ ...bankFormData, accountNumber: e.target.value })}
                    placeholder="Contoh: 0341-01-002918-50-3"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Atas Nama Pemilik Rekening <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={bankFormData.accountHolder}
                  onChange={(e) => setBankFormData({ ...bankFormData, accountHolder: e.target.value })}
                  placeholder="Contoh: AquaFlow Tirta Samudra / Nama Anda"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Rekening (Opsional):
                </label>
                <input
                  type="text"
                  value={bankFormData.notes}
                  onChange={(e) => setBankFormData({ ...bankFormData, notes: e.target.value })}
                  placeholder="Contoh: Rekening Utama Resmi Pembayaran Siswa"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Aktifkan &amp; Tampilkan ke Siswa
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Jika dicentang, wali murid akan melihat rekening ini saat membayar
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="bankIsActive"
                  checked={bankFormData.isActive}
                  onChange={(e) => setBankFormData({ ...bankFormData, isActive: e.target.checked })}
                  className="w-5 h-5 rounded text-cyan-600 accent-cyan-600 cursor-pointer"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddEditBankModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingBank ? 'Simpan Perubahan' : 'Simpan Rekening'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* FLOATING TOAST NOTIFICATION                              */}
      {/* ======================================================== */}
      {notificationToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="px-5 py-3 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-2xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold">{notificationToast.message}</span>
            <button
              onClick={() => setNotificationToast(null)}
              className="text-slate-400 hover:text-white ml-2 text-xs cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
