import {
  Student,
  Coach,
  AttendanceRecord,
  TimeTrialRecord,
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
} from '../types';

// ============================================================================
// 1. DATA PENGGUNA RESMI (HANYA ADMIN UTAMA)
// ============================================================================
export const INITIAL_APP_USERS: AuthUser[] = [
  {
    id: 'usr-admin-1',
    name: 'Yohes Prasetyo (Admin Utama)',
    username: 'admin',
    password: 'admin123',
    email: 'admin@tirta.com',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    phone: '0811-9988-7766',
    barcode: 'AQUA-ADM-001',
  },
];

// ============================================================================
// 2. DATA UTAMA SISTEM: BERSIH NOL (0 DATA - SIAP OPERASIONAL ASLI)
// ============================================================================
export const INITIAL_COACHES: Coach[] = [];

export const INITIAL_STUDENTS: Student[] = [];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];

export const INITIAL_PAYMENTS: PaymentRecord[] = [];

export const INITIAL_REGISTRATIONS: StudentRegistration[] = [];

export const INITIAL_TIME_TRIALS: TimeTrialRecord[] = [];

export const INITIAL_REVENUE_TREND: RevenueDataPoint[] = [];

// ============================================================================
// 3. JADWAL KOLAM RENANG STANDAR
// ============================================================================
export const INITIAL_SCHEDULES: PoolSchedule[] = [
  {
    id: 'sch-1',
    className: 'Kelas Dasar Adaptasi Air',
    roleClass: 'dasar',
    day: 'Senin & Rabu',
    timeRange: '15:30 - 17:00 WIB',
    coachName: 'Belum Ditugaskan',
    lane: 'Kolam Dangkal (Jalur 1)',
    maxCapacity: 10,
    currentEnrolled: 0,
  },
  {
    id: 'sch-2',
    className: 'Kelas Pemula Gaya Dada & Bebas',
    roleClass: 'pemula',
    day: 'Selasa & Kamis',
    timeRange: '16:00 - 17:30 WIB',
    coachName: 'Belum Ditugaskan',
    lane: 'Kolam Utama (Jalur 2 & 3)',
    maxCapacity: 12,
    currentEnrolled: 0,
  },
  {
    id: 'sch-3',
    className: 'Program Atlet Prestasi',
    roleClass: 'prestasi',
    day: 'Senin s/d Jumat',
    timeRange: '16:30 - 18:30 WIB',
    coachName: 'Belum Ditugaskan',
    lane: 'Kolam Olympic (Jalur 4, 5, 6)',
    maxCapacity: 15,
    currentEnrolled: 0,
  },
  {
    id: 'sch-4',
    className: 'Kelas Privat 4 Pertemuan',
    roleClass: 'privat_4',
    day: 'Fleksibel',
    timeRange: '08:00 - 09:30 WIB',
    coachName: 'Belum Ditugaskan',
    lane: 'Jalur Privat Eksklusif (Jalur 8)',
    maxCapacity: 2,
    currentEnrolled: 0,
  },
  {
    id: 'sch-5',
    className: 'Kelas Privat 8 Pertemuan',
    roleClass: 'privat_8',
    day: 'Fleksibel',
    timeRange: '15:30 - 17:00 WIB',
    coachName: 'Belum Ditugaskan',
    lane: 'Jalur Privat Eksklusif (Jalur 7)',
    maxCapacity: 2,
    currentEnrolled: 0,
  },
  {
    id: 'sch-6',
    className: 'Kelas Privat 12 Pertemuan',
    roleClass: 'privat_12',
    day: 'Fleksibel',
    timeRange: '07:30 - 09:00 WIB',
    coachName: 'Belum Ditugaskan',
    lane: 'Kolam Olympic (Jalur 1)',
    maxCapacity: 2,
    currentEnrolled: 0,
  },
];

// ============================================================================
// 4. METADATA TAMPILAN PER KELAS / ROLE
// ============================================================================
export const ROLE_LABELS: Record<
  UserRole,
  {
    title: string;
    subtitle: string;
    color: string;
    badgeBg: string;
    textBadge: string;
    bannerGradient: string;
    accentText: string;
    accentBg: string;
    accentBorder: string;
    btnGradient: string;
    barColor: string;
  }
> = {
  admin: {
    title: 'Administrator',
    subtitle: 'Manajemen Penuh Akademi & Kolam Renang',
    color: 'from-blue-600 to-indigo-700',
    badgeBg: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-600 dark:text-indigo-400',
    textBadge: 'Admin Utama',
    bannerGradient: 'from-slate-900 via-indigo-950 to-blue-900',
    accentText: 'text-indigo-600 dark:text-indigo-400',
    accentBg: 'bg-indigo-500/10',
    accentBorder: 'border-indigo-500/30',
    btnGradient: 'from-indigo-600 to-blue-600',
    barColor: 'bg-indigo-500',
  },
  pelatih: {
    title: 'Pelatih / Coach',
    subtitle: 'Presensi Barcode, Jadwal & Evaluasi Renang',
    color: 'from-emerald-600 to-teal-700',
    badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
    textBadge: 'Staff Pelatih',
    bannerGradient: 'from-slate-900 via-teal-950 to-emerald-800',
    accentText: 'text-emerald-600 dark:text-emerald-400',
    accentBg: 'bg-emerald-500/10',
    accentBorder: 'border-emerald-500/30',
    btnGradient: 'from-emerald-600 to-teal-600',
    barColor: 'bg-emerald-500',
  },
  dasar: {
    title: 'Kelas Dasar',
    subtitle: 'Adaptasi Air, Water Confidence & Mengapung',
    color: 'from-sky-400 to-cyan-500',
    badgeBg: 'bg-sky-500/15 border-sky-500/30 text-sky-600 dark:text-sky-300',
    textBadge: 'Level 1: Dasar',
    bannerGradient: 'from-sky-500 via-cyan-500 to-teal-600',
    accentText: 'text-sky-600 dark:text-sky-400',
    accentBg: 'bg-sky-500/10',
    accentBorder: 'border-sky-500/30',
    btnGradient: 'from-sky-500 to-cyan-500',
    barColor: 'bg-sky-500',
  },
  pemula: {
    title: 'Kelas Pemula',
    subtitle: 'Teknik Gaya Dada & Gaya Bebas Dasar (15m - 25m)',
    color: 'from-cyan-600 to-blue-600',
    badgeBg: 'bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-300',
    textBadge: 'Level 2: Pemula',
    bannerGradient: 'from-cyan-600 via-blue-600 to-indigo-700',
    accentText: 'text-blue-600 dark:text-blue-400',
    accentBg: 'bg-blue-500/10',
    accentBorder: 'border-blue-500/30',
    btnGradient: 'from-blue-600 to-cyan-600',
    barColor: 'bg-blue-500',
  },
  prestasi: {
    title: 'Kelas Prestasi',
    subtitle: 'Atlet Klub Renang, Target Waktu & Kompetisi',
    color: 'from-amber-500 to-orange-600',
    badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400',
    textBadge: 'Level 3: Atlet Prestasi',
    bannerGradient: 'from-amber-600 via-orange-600 to-red-700',
    accentText: 'text-amber-600 dark:text-amber-400',
    accentBg: 'bg-amber-500/10',
    accentBorder: 'border-amber-500/30',
    btnGradient: 'from-amber-500 to-orange-600',
    barColor: 'bg-amber-500',
  },
  privat_4: {
    title: 'Kelas Privat 4',
    subtitle: 'Paket 4 Sesi 1-on-1 Intensif & Fleksibel',
    color: 'from-purple-600 to-violet-700',
    badgeBg: 'bg-purple-500/15 border-purple-500/30 text-purple-600 dark:text-purple-400',
    textBadge: 'Privat: 4 Sesi',
    bannerGradient: 'from-purple-700 via-violet-700 to-indigo-800',
    accentText: 'text-purple-600 dark:text-purple-400',
    accentBg: 'bg-purple-500/10',
    accentBorder: 'border-purple-500/30',
    btnGradient: 'from-purple-600 to-violet-600',
    barColor: 'bg-purple-500',
  },
  privat_8: {
    title: 'Kelas Privat 8',
    subtitle: 'Paket 8 Sesi Terstruktur Bersama Instruktur',
    color: 'from-pink-600 to-rose-700',
    badgeBg: 'bg-pink-500/15 border-pink-500/30 text-pink-600 dark:text-pink-400',
    textBadge: 'Privat: 8 Sesi',
    bannerGradient: 'from-pink-600 via-rose-600 to-purple-800',
    accentText: 'text-pink-600 dark:text-pink-400',
    accentBg: 'bg-pink-500/10',
    accentBorder: 'border-pink-500/30',
    btnGradient: 'from-pink-600 to-rose-600',
    barColor: 'bg-pink-500',
  },
  privat_12: {
    title: 'Kelas Privat 12',
    subtitle: 'Paket Lengkap 12 Sesi Penguasaan Multi-Gaya',
    color: 'from-rose-600 to-red-700',
    badgeBg: 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400',
    textBadge: 'Privat: 12 Sesi',
    bannerGradient: 'from-rose-700 via-red-700 to-amber-700',
    accentText: 'text-rose-600 dark:text-rose-400',
    accentBg: 'bg-rose-500/10',
    accentBorder: 'border-rose-500/30',
    btnGradient: 'from-rose-600 to-red-600',
    barColor: 'bg-rose-500',
  },
};

// ============================================================================
// 5. MASTER HARGA & PAKET KELAS (DAPAT DIATUR ADMIN)
// ============================================================================
export const INITIAL_PRICING_PACKAGES: ClassPricingPackage[] = [
  {
    id: 'pkg-pml-1',
    roleClass: 'pemula',
    packageName: 'Kelas Pemula (Pembayaran Bulanan)',
    billingType: 'bulanan',
    price: 450000,
    sessionsCount: 12,
    sessionsPerWeek: 3,
    durationMinutes: 75,
    scheduleDescription: 'Selasa, Kamis, Sabtu (15:30 - 16:45 WIB)',
    coachRatio: '1 Pelatih : 6 Siswa',
    poolLane: 'Kolam Utama - Kedalaman 1.2m',
    features: [
      '12 Sesi Pertemuan Terbimbing per Bulan (3x seminggu)',
      'Sistem Iuran Rutin Bulanan',
      'Target Penguasaan Gaya Dada & Gaya Bebas 25m',
      'Peminjaman Papan Luncur (Kickboard) & Pull Buoy Gratis',
      'Evaluasi Kenaikan Tingkat Berkala Setiap Akhir Bulan',
      'Presensi Kehadiran Kolam via Scan Barcode Cepat',
    ],
    isActive: true,
    notes: 'Jalur kenaikan tingkat setelah menyelesaikan evaluasi lulus Kelas Dasar.',
  },
  {
    id: 'pkg-prs-1',
    roleClass: 'prestasi',
    packageName: 'Program Atlet Prestasi (Pembayaran Bulanan)',
    billingType: 'bulanan',
    price: 650000,
    sessionsCount: 16,
    sessionsPerWeek: 4,
    durationMinutes: 90,
    scheduleDescription: 'Senin, Rabu, Jumat, Sabtu (05:30 & 16:00 WIB)',
    coachRatio: '1 Pelatih : 4 Atlet',
    poolLane: 'Kolam Olympic 50m - Jalur Khusus Atlet 4 & 5',
    features: [
      '16 Sesi Latihan Intensif Atlet per Bulan (4x seminggu)',
      'Sistem Iuran Rutin Bulanan',
      'Latihan Fisik Darat (Dryland Strength) & Interval Drills',
      'Uji Coba Waktu (Time Trial) Bulanan & Evaluasi Personal Best',
      'Fasilitas Sertifikat & Pengurusan Lisensi Atlet PRSI',
      'Akses Jalur Khusus Kolam Olympic 50m Tanpa Hambatan Umum',
    ],
    isActive: true,
    notes: 'Program pembinaan atlet kompetisi khusus jalur rekomendasi seleksi pelatih.',
  },
  {
    id: 'pkg-dsr-1',
    roleClass: 'dasar',
    packageName: 'Kelas Dasar Adaptasi Air (Bulanan)',
    billingType: 'bulanan',
    price: 350000,
    sessionsCount: 12,
    sessionsPerWeek: 3,
    durationMinutes: 60,
    scheduleDescription: 'Senin, Rabu, Jumat (16:00 - 17:00 WIB)',
    coachRatio: '1 Pelatih : 5 Siswa',
    poolLane: 'Kolam Dangkal - Kedalaman 0.8m',
    features: [
      '12 Sesi Pertemuan per Bulan',
      'Sistem Pembayaran Bulanan',
      'Fokus Mengatasi Takut Air, Meluncur & Mengapung',
      'Instruktur Khusus Ramah Anak Usia Dini',
    ],
    isActive: true,
    notes: 'Kelas pengenalan air untuk balita dan anak pemula pertama kali renang.',
  },
  {
    id: 'pkg-pv4-1',
    roleClass: 'privat_4',
    packageName: 'Paket Privat Intensif 4 Pertemuan 1-on-1',
    billingType: 'per_paket',
    price: 900000,
    sessionsCount: 4,
    sessionsPerWeek: 1,
    durationMinutes: 60,
    scheduleDescription: 'Jadwal Fleksibel (Perjanjian dengan Pelatih)',
    coachRatio: '1 Pelatih : 1 Siswa',
    poolLane: 'Jalur Privat Kolam Utama',
    features: [
      '4 Sesi Privat Eksklusif Tatap Muka 1-on-1',
      'Sistem Bayar Per Paket Kontrak',
      'Bebas Pilih Instruktur Favorit',
      'Jadwal & Jam Fleksibel Mengikuti Murid',
    ],
    isActive: true,
    notes: 'Solusi cepat untuk kebutuhan tes instansi atau belajar gaya tertentu.',
  },
  {
    id: 'pkg-pv8-1',
    roleClass: 'privat_8',
    packageName: 'Paket Privat Terstruktur 8 Pertemuan 1-on-1',
    billingType: 'per_paket',
    price: 1600000,
    sessionsCount: 8,
    sessionsPerWeek: 2,
    durationMinutes: 60,
    scheduleDescription: 'Jadwal Fleksibel 2x Seminggu',
    coachRatio: '1 Pelatih : 1 Siswa',
    poolLane: 'Jalur Privat Kolam Utama',
    features: [
      '8 Sesi Privat Eksklusif 1-on-1',
      'Sistem Bayar Per Paket Kontrak',
      'Penguasaan 2 Gaya Renang Lengkap',
      'Analisis Video Gerakan Tangan & Kaki',
    ],
    isActive: true,
    notes: 'Paket privat terpopuler untuk hasil terukur dalam 1 bulan.',
  },
  {
    id: 'pkg-pv12-1',
    roleClass: 'privat_12',
    packageName: 'Paket Privat Master Complete 12 Pertemuan',
    billingType: 'per_paket',
    price: 2200000,
    sessionsCount: 12,
    sessionsPerWeek: 3,
    durationMinutes: 75,
    scheduleDescription: 'Jadwal Fleksibel 3x Seminggu',
    coachRatio: '1 Pelatih : 1 Siswa',
    poolLane: 'Jalur Privat & Jalur Olympic',
    features: [
      '12 Sesi Privat Komprehensif Lengkap',
      'Sistem Bayar Per Paket Kontrak',
      'Kuasai 4 Gaya Renang + Stamina Jarak Jauh',
      'Sertifikat Kelulusan & Video Dokumentasi HD',
    ],
    isActive: true,
    notes: 'Program privat komplit untuk penguasaan total berenang profesional.',
  },
];

// ============================================================================
// 6. PROFIL AKADEMI
// ============================================================================
export const DEFAULT_ACADEMY_PROFILE: AcademyProfile = {
  name: 'AquaFlow Swimming Academy',
  tagline: 'Mencetak Perenang Tangguh, Berkarakter & Berprestasi Tingkat Nasional',
  description: 'Akademi renang terkemuka dengan kurikulum terstruktur, pelatih bersertifikasi PRSI, sistem absensi barcode/QR unik, dan fasilitas kolam semi-olympic air jernih ramah keluarga.',
  aboutStory: 'Didirikan sejak tahun 2018, AquaFlow berkomitmen melatih anak-anak hingga dewasa dari adaptasi air nol sampai menjadi atlet renang berprestasi. Kami mengedepankan keamanan maksimal, rasio pelatih ideal, dan teknologi modern untuk memantau perkembangan setiap murid.',
  logoUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=200&auto=format&fit=crop&q=80',
  heroImageUrl: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=1600&auto=format&fit=crop&q=80',
  phone: '(021) 7892-4455',
  whatsapp: '0812-3456-7890',
  email: 'info@aquaflow-academy.id',
  address: 'Kompleks Olahraga Tirta Prima, Jl. Danau Biru No. 88, Jakarta Selatan',
  operatingHours: 'Setiap Hari: 06:00 - 20:00 WIB',
  registrationFee: 150000,
  isRegistrationOpen: true,
  facilities: [
    'Kolam Semi-Olympic 50 Meter 8 Jalur',
    'Kolam Air Hangat Khusus Anak & Balita',
    'Sistem Filtrasi Air Ozon & Bebas Klorin Berlebih',
    'Kamar Bilas & Shower Air Hangat VIP',
    'Kafe & Area Tunggu Nyaman AC Free Wi-Fi',
    'Tribun Penonton & CCTV Keamanan 24 Jam',
  ],
  footerName: 'Yohes',
};

// ============================================================================
// 7. GALERI DOKUMENTASI
// ============================================================================
export const INITIAL_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-01',
    title: 'Latihan Adaptasi Air & Water Confidence Balita',
    category: 'dasar',
    categoryLabel: 'Kelas Dasar & Balita',
    imageUrl: 'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=800&auto=format&fit=crop&q=80',
    caption: 'Anak-anak kelas dasar belajar adaptasi air dan mengapung dengan gembira bersama pelatih bersertifikasi.',
    date: '2026-10-18',
  },
  {
    id: 'gal-02',
    title: 'Penyempurnaan Teknik Gaya Bebas (Freestyle Drill)',
    category: 'pemula',
    categoryLabel: 'Kelas Pemula',
    imageUrl: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800&auto=format&fit=crop&q=80',
    caption: 'Siswa kelas pemula melatih rotasi tubuh (body roll) dan kayuhan tangan gaya bebas 25 meter.',
    date: '2026-10-17',
  },
  {
    id: 'gal-03',
    title: 'Simulasi Start Block & Diving Atlet Binaan',
    category: 'prestasi',
    categoryLabel: 'Kelas Prestasi',
    imageUrl: 'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=800&auto=format&fit=crop&q=80',
    caption: 'Atlet binaan melatih waktu reaksi start dan streamline entry ke air dengan kecepatan tinggi.',
    date: '2026-10-16',
  },
  {
    id: 'gal-04',
    title: 'Coaching 1-on-1 Intensif Kelas Privat',
    category: 'privat',
    categoryLabel: 'Kelas Privat',
    imageUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&auto=format&fit=crop&q=80',
    caption: 'Pendampingan privat eksklusif dengan koreksi teknik biomekanik langsung di tepi kolam.',
    date: '2026-10-15',
  },
  {
    id: 'gal-05',
    title: 'Water Safety Day & Teknik Penyelamatan Diri',
    category: 'fun_safety',
    categoryLabel: 'Water Safety & Fun',
    imageUrl: 'https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?w=800&auto=format&fit=crop&q=80',
    caption: 'Edukasi keselamatan di kolam renang dan teknik treading water (menginjak air) aman bagi siswa.',
    date: '2026-10-12',
  },
  {
    id: 'gal-06',
    title: 'Penyerahan Piagam & Medali Kenaikan Tingkat',
    category: 'evaluasi',
    categoryLabel: 'Evaluasi & Kenaikan Tingkat',
    imageUrl: 'https://images.unsplash.com/photo-1560090995-01632a28895b?w=800&auto=format&fit=crop&q=80',
    caption: 'Apresiasi atas keberhasilan siswa menuntaskan kurikulum tingkat kemahiran renang 4 gaya.',
    date: '2026-10-08',
  },
];

// ============================================================================
// 8. REKENING RESMI PEMBAYARAN AKADEMI
// ============================================================================
export { type BankAccountInfo } from '../types';

export const OFFICIAL_BANK_ACCOUNTS: BankAccountInfo[] = [
  {
    id: 'bank-bri',
    bankName: 'BRI (Bank Rakyat Indonesia)',
    bankCode: 'BRI',
    accountNumber: '0341-01-002918-50-3',
    accountHolder: 'AquaFlow Tirta Samudra',
    logoColor: 'text-cyan-600',
    badgeBg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600',
    isActive: true,
    notes: 'Rekening Utama Resmi Pembayaran Siswa',
  },
  {
    id: 'bank-bca',
    bankName: 'BCA (Bank Central Asia)',
    bankCode: 'BCA',
    accountNumber: '8830-9912-34',
    accountHolder: 'AquaFlow Tirta Samudra',
    logoColor: 'text-blue-600',
    badgeBg: 'bg-blue-500/10 border-blue-500/30 text-blue-600',
    isActive: false,
    notes: 'Rekening Cadangan (Nonaktif)',
  },
  {
    id: 'bank-mandiri',
    bankName: 'Bank Mandiri',
    bankCode: 'MANDIRI',
    accountNumber: '137-00-2918291-8',
    accountHolder: 'AquaFlow Tirta Samudra',
    logoColor: 'text-amber-600',
    badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-600',
    isActive: false,
    notes: 'Rekening Cadangan (Nonaktif)',
  },
  {
    id: 'bank-bni',
    bankName: 'BNI (Bank Negara Indonesia)',
    bankCode: 'BNI',
    accountNumber: '0812-4455-6677',
    accountHolder: 'AquaFlow Tirta Samudra',
    logoColor: 'text-teal-600',
    badgeBg: 'bg-teal-500/10 border-teal-500/30 text-teal-600',
    isActive: false,
    notes: 'Rekening Cadangan (Nonaktif)',
  },
];

