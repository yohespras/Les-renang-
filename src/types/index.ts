export type UserRole =
  | 'admin'
  | 'pelatih'
  | 'dasar'
  | 'pemula'
  | 'prestasi'
  | 'privat_4'
  | 'privat_8'
  | 'privat_12';

export interface AuthUser {
  id: string;
  name: string;
  username?: string;
  password?: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  phone?: string;
  studentId?: string;
  coachId?: string;
  barcode?: string;
}

export interface Student {
  id: string;
  barcode: string; // e.g. AQUA-DSR-101
  name: string;
  gender: 'Laki-laki' | 'Perempuan';
  age: number;
  birthDate?: string;
  roleClass: UserRole;
  phone: string;
  parentName: string;
  emergencyContact: string;
  joinedDate: string;
  status: 'active' | 'inactive';
  remainingQuota: number;
  totalQuota: number;
  assignedCoachId: string;
  avatarUrl: string;
  notes: string;
}

export interface Coach {
  id: string;
  barcode?: string;
  name: string;
  specialty: string;
  phone: string;
  email?: string;
  avatarUrl: string;
  assignedClasses: UserRole[];
  experienceYears?: number;
  certifications?: string[];
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentBarcode?: string;
  roleClass: UserRole;
  dateStr: string; // YYYY-MM-DD
  timeStr: string; // HH:mm:ss
  coachId: string;
  coachName: string;
  status: 'hadir' | 'izin' | 'alpa';
  poolLane: string;
  verifiedByBarcode: boolean;
  notes?: string;
}

export interface SkillMilestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedDate?: string;
}

export interface TimeTrialRecord {
  id: string;
  studentId: string;
  stroke: 'Gaya Bebas' | 'Gaya Dada' | 'Gaya Punggung' | 'Gaya Kupu-kupu' | 'Gaya Ganti';
  distanceMeters: number;
  timeSeconds: number; // e.g. 29.45
  date: string;
  isPersonalBest: boolean;
  notes?: string;
}

export interface PrivateSessionLog {
  sessionNumber: number;
  date: string;
  time: string;
  coachName: string;
  focusDrill: string;
  attended: boolean;
  feedback: string;
}

export interface PoolSchedule {
  id: string;
  className: string;
  roleClass: UserRole;
  day: string;
  timeRange: string;
  coachName: string;
  lane: string;
  maxCapacity: number;
  currentEnrolled: number;
}

export interface PaymentRecord {
  id: string;
  invoiceNumber: string;
  studentId: string;
  studentName: string;
  roleClass: UserRole;
  packageName: string;
  amount: number; // in IDR
  paymentDate: string; // YYYY-MM-DD
  dueDate: string;
  paymentMethod: 'Transfer Bank' | 'QRIS' | 'Tunai di Kolam' | 'Kartu Debit';
  status: 'lunas' | 'menunggu' | 'jatuh_tempo';
  notes?: string;
  proofUrl?: string;
  transferBankName?: string;
  senderAccountName?: string;
  sessionsToAdd?: number;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface RevenueDataPoint {
  month: string;
  revenue: number;
  totalStudents: number;
  newEnrollments: number;
}

export interface ClassPricingPackage {
  id: string;
  roleClass: UserRole;
  packageName: string;
  billingType: 'bulanan' | 'per_paket';
  price: number; // in IDR
  sessionsCount: number; // e.g. 12 pertemuan per bulan (pemula), 16 pertemuan per bulan (prestasi)
  sessionsPerWeek: number; // frekuensi pertemuan per minggu
  durationMinutes: number; // durasi menit per sesi
  scheduleDescription: string;
  coachRatio: string;
  poolLane: string;
  dueDay?: number;
  features: string[];
  isActive: boolean;
  notes?: string;
}

export interface AcademyProfile {
  name: string;
  tagline: string;
  description: string;
  aboutStory: string;
  logoUrl: string;
  heroImageUrl: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  operatingHours: string;
  registrationFee: number;
  isRegistrationOpen: boolean;
  facilities: string[];
  footerName: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'dasar' | 'pemula' | 'prestasi' | 'privat' | 'fun_safety' | 'evaluasi';
  categoryLabel: string;
  imageUrl: string;
  caption: string;
  date: string;
}

export interface StudentRegistration {
  id: string;
  fullName: string;
  nickname: string;
  birthDate: string;
  age: number;
  gender: 'Laki-laki' | 'Perempuan';
  roleClass: UserRole;
  parentName: string;
  phone: string;
  address: string;
  medicalHistory: string;
  preferredSchedule: string;
  registrationDate: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

export interface BankAccountInfo {
  id: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  logoColor?: string;
  badgeBg?: string;
  isActive: boolean;
  notes?: string;
}

