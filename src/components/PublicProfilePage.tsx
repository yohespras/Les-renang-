import React, { useState } from 'react';
import {
  AcademyProfile,
  ClassPricingPackage,
  Coach,
  PoolSchedule,
  UserRole,
  StudentRegistration,
  GalleryItem,
} from '../types';
import { ROLE_LABELS, INITIAL_GALLERY_ITEMS } from '../data/mockData';
import { PWAInstallButton } from './PWAInstallButton';
import { AppFooter } from './AppFooter';
import { RegistrationModal } from './RegistrationModal';
import {
  Waves,
  Sparkles,
  ShieldCheck,
  UserCheck,
  CalendarCheck,
  Award,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  LogIn,
  Sun,
  Moon,
  CheckCircle2,
  Users,
  Compass,
  Zap,
  ArrowRight,
  MessageCircle,
  Camera,
  ZoomIn,
  X,
  Calendar,
  Lock,
} from 'lucide-react';

interface PublicProfilePageProps {
  academyProfile: AcademyProfile;
  pricingPackages: ClassPricingPackage[];
  coaches: Coach[];
  schedules: PoolSchedule[];
  onOpenLogin: () => void;
  onRegisterSubmit: (registration: StudentRegistration) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  galleryItems?: GalleryItem[];
}

export const PublicProfilePage: React.FC<PublicProfilePageProps> = ({
  academyProfile,
  pricingPackages,
  coaches,
  schedules,
  onOpenLogin,
  onRegisterSubmit,
  isDark,
  onToggleTheme,
  galleryItems = INITIAL_GALLERY_ITEMS,
}) => {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedClassForRegister, setSelectedClassForRegister] = useState<UserRole>('dasar');
  const [selectedGalleryCategory, setSelectedGalleryCategory] = useState<string>('all');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  const handleOpenRegisterWithClass = (role: UserRole) => {
    // Pendaftaran murid baru hanya terbuka untuk Kelas Dasar dan Kelas Privat
    const allowedRoles: UserRole[] = ['dasar', 'privat_4', 'privat_8', 'privat_12'];
    const safeRole = allowedRoles.includes(role) ? role : 'dasar';
    setSelectedClassForRegister(safeRole);
    setIsRegisterModalOpen(true);
  };

  const cleanPhone = academyProfile.whatsapp.replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* 1. Public Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Logo & Name */}
          <div className="flex items-center gap-3">
            {academyProfile.logoUrl ? (
              <img
                src={academyProfile.logoUrl}
                alt={academyProfile.name}
                className="w-10 h-10 rounded-2xl object-cover ring-2 ring-cyan-500/30 shadow-md"
              />
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                <Waves className="w-6 h-6" />
              </div>
            )}
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white block leading-tight">
                {academyProfile.name}
              </span>
              <span className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 block">
                Akademi Renang &amp; Presensi Barcode
              </span>
            </div>
          </div>

          {/* Quick Nav Anchor Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#tentang" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              Profil
            </a>
            <a href="#fasilitas" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              Fasilitas
            </a>
            <a href="#program" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              Program &amp; Biaya
            </a>
            <a href="#galeri" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              Galeri Latihan
            </a>
            <a href="#pelatih" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              Pelatih
            </a>
            <a href="#kontak" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              Kontak
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* PWA Install Button */}
            <PWAInstallButton variant="compact" />

            {/* Dark / Light Toggle */}
            <button
              onClick={onToggleTheme}
              title={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Pendaftaran Button */}
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer"
            >
              <span>Daftar Baru</span>
            </button>

            {/* Login Button */}
            <button
              onClick={onOpenLogin}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk Portal</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-cyan-500/10 via-blue-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 dark:bg-cyan-950/60 border border-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                <span>Akademi Renang Berbasis Absensi Barcode &bull; PWA Ready</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                {academyProfile.name}
              </h1>

              <p className="text-base sm:text-lg text-cyan-700 dark:text-cyan-400 font-semibold">
                {academyProfile.tagline}
              </p>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                {academyProfile.description}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
                <button
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>Daftar Murid Baru Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onOpenLogin}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 hover:border-cyan-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold text-sm sm:text-base shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-cyan-500" />
                  <span>Login Portal Akun</span>
                </button>
              </div>

              {/* Highlight bullet points */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Pelatih Berlisensi Resmi</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-cyan-500 shrink-0" />
                  <span>Absensi Barcode 1-Detik</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Jalur Atlet &amp; Rekreasi</span>
                </div>
              </div>
            </div>

            {/* Hero Right Media Banner */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 aspect-[4/3] group">
                <img
                  src={academyProfile.heroImageUrl}
                  alt={academyProfile.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                {/* Floating Glass Stats */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/10 text-white flex items-center justify-between">
                  <div>
                    <span className="block text-xs text-cyan-300 font-bold uppercase tracking-wider">
                      Fasilitas Terakreditasi
                    </span>
                    <span className="text-sm font-extrabold">Kolam Semi-Olympic &amp; Air Hangat</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs text-cyan-300 font-bold uppercase tracking-wider">
                      Status Pendaftaran
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      Buka Sekarang
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Section Profil & Tentang Kami */}
      <section id="tentang" className="py-14 bg-white dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
              Profil Akademi
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Mendidik dengan Hati, Melatih dengan Disiplin
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {academyProfile.aboutStory}
            </p>
          </div>

          {/* 3 Keunggulan Utama */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Kurikulum Terstruktur &amp; Aman
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Mulai dari adaptasi hilangkan takut air di kelas Dasar, penguasaan 4 gaya di kelas Pemula, hingga pemantapan catatan waktu kompetisi di kelas Prestasi.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Teknologi Barcode Presisi
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Setiap siswa mendapatkan Swim Pass ber-barcode unik. Absensi dilakukan tepi kolam dalam 1 detik langsung terdata ke riwayat masuk orang tua.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Rasio Pelatih Ideal
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Maksimal 1 pelatih mendampingi 5 murid untuk kelas reguler, serta opsi 1-on-1 untuk paket Privat intensif agar perhatian instruktur tetap maksimal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Section Fasilitas Kolam Renang */}
      <section id="fasilitas" className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
                Fasilitas Unggulan
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                Kenyamanan &amp; Standar Kebersihan Terbaik
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              Semua fasilitas dirawat secara berkala dengan standar sanitasi tinggi demi kesehatan perenang.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {academyProfile.facilities.map((fac, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5 shadow-sm hover:border-cyan-500/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 font-bold text-sm">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{fac}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Tersedia untuk semua murid &amp; orang tua pendamping.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Section Program Kelas & Biaya */}
      <section id="program" className="py-14 bg-white dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
              Pilihan Program &amp; Biaya
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Paket Latihan Sesuai Tingkat Kemampuan
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Pendaftaran murid baru dibuka untuk <strong>Kelas Dasar</strong> dan <strong>Kelas Privat (1-on-1)</strong>. Kelas Pemula dan Prestasi merupakan jalur pembinaan khusus melalui kenaikan tingkat / evaluasi pelatih.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pricingPackages.map((pkg) => {
              const isPromotionOnly = pkg.roleClass === 'pemula' || pkg.roleClass === 'prestasi';
              return (
                <div
                  key={pkg.id}
                  className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-300 flex flex-col justify-between ${
                    pkg.roleClass === 'dasar' || pkg.roleClass === 'privat_8'
                      ? 'border-cyan-500 shadow-xl shadow-cyan-500/10 ring-2 ring-cyan-500/20'
                      : isPromotionOnly
                      ? 'border-amber-200 dark:border-amber-900/40 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          isPromotionOnly
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                            : 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20'
                        }`}
                      >
                        {ROLE_LABELS[pkg.roleClass].title}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">
                        {isPromotionOnly
                          ? 'Kenaikan Tingkat'
                          : pkg.billingType === 'bulanan'
                          ? 'Bulanan'
                          : 'Paket Kontrak'}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                      {pkg.packageName}
                    </h3>

                    <div className="mt-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                        Rp {pkg.price.toLocaleString('id-ID')}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                        {pkg.sessionsCount} Sesi Pertemuan ({pkg.durationMinutes} menit/sesi)
                      </span>
                    </div>

                    <div className="py-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                      <p className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-cyan-500 shrink-0" />
                        <span>{pkg.scheduleDescription}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-cyan-500 shrink-0" />
                        <span>Rasio: {pkg.coachRatio}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Waves className="w-4 h-4 text-cyan-500 shrink-0" />
                        <span>Jalur: {pkg.poolLane}</span>
                      </p>
                    </div>

                    <div className="pt-2 pb-4 space-y-1.5 border-t border-slate-100 dark:border-slate-800">
                      {pkg.features.slice(0, 3).map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {isPromotionOnly ? (
                    <div className="mt-4 pt-1">
                      <div className="w-full py-2.5 px-3 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 border border-amber-500/20 select-none">
                        <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>Khusus Kenaikan Tingkat</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="italic text-[10px]">Jalur evaluasi pelatih</span>
                        <button
                          onClick={() => handleOpenRegisterWithClass('dasar')}
                          className="font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer flex items-center gap-0.5"
                        >
                          <span>Daftar Dasar Dulu</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenRegisterWithClass(pkg.roleClass)}
                      className="mt-4 w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-cyan-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Daftar Kelas Ini</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5.5. Section Galeri Latihan & Aktivitas Kolam */}
      <section id="galeri" className="py-16 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 flex items-center justify-center gap-2">
              <Camera className="w-4 h-4" />
              <span>Dokumentasi &amp; Aktivitas Renang</span>
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white">
              Galeri Latihan &amp; Momen Kebersamaan
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
              Momen nyata pembelajaran renang anak, pembinaan teknik biomekanik 4 gaya, kesiapan atlet kejuaraan, serta edukasi keselamatan air (water safety).
            </p>

            {/* Category Filter Pills */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
              {[
                { id: 'all', label: 'Semua Momen' },
                { id: 'dasar', label: 'Kelas Dasar & Balita' },
                { id: 'pemula', label: 'Kelas Pemula' },
                { id: 'prestasi', label: 'Kelas Prestasi' },
                { id: 'privat', label: 'Kelas Privat' },
                { id: 'fun_safety', label: 'Water Safety & Fun' },
                { id: 'evaluasi', label: 'Evaluasi & Ujian' },
              ].map((cat) => {
                const count = cat.id === 'all' ? galleryItems.length : galleryItems.filter((g) => g.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedGalleryCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedGalleryCategory === cat.id
                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/25 scale-105'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-cyan-500'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedGalleryCategory === cat.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Photo Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems
              .filter((item) => selectedGalleryCategory === 'all' || item.category === selectedGalleryCategory)
              .map((item) => (
                <div
                  key={item.id}
                  onClick={() => setLightboxItem(item)}
                  className="group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-cyan-500/50 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-950/75 text-cyan-300 backdrop-blur-md border border-cyan-500/30">
                        {item.categoryLabel}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-8 h-8 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg">
                        <ZoomIn className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[10px] font-mono text-cyan-200 flex items-center gap-1 mb-1">
                        <Calendar className="w-3 h-3" />
                        {item.date}
                      </span>
                      <h4 className="font-extrabold text-sm sm:text-base leading-snug line-clamp-1 drop-shadow-sm text-white group-hover:text-cyan-300 transition-colors">
                        {item.title}
                      </h4>
                    </div>
                  </div>

                  <div className="p-4 bg-white dark:bg-slate-900">
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.caption}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxItem && (
        <div
          onClick={() => setLightboxItem(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700/50 cursor-default"
          >
            <div className="relative aspect-[16/10] bg-black max-h-[65vh]">
              <img
                src={lightboxItem.imageUrl}
                alt={lightboxItem.title}
                className="w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={() => setLightboxItem(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/70 hover:bg-rose-600 text-white backdrop-blur-md transition-colors cursor-pointer"
                title="Tutup Pratinjau"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                  {lightboxItem.categoryLabel}
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Tanggal: {lightboxItem.date}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                {lightboxItem.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                {lightboxItem.caption}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 6. Section Tim Pelatih */}
      <section id="pelatih" className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
              Instruktur &amp; Pelatih
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Didampingi Pelatih Bersertifikasi
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Tim pelatih kami berlisensi renang nasional, sabar mendampingi pemula, dan berpengalaman mencetak atlet.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coaches.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  src={c.avatarUrl}
                  alt={c.name}
                  className="w-20 h-20 rounded-2xl mx-auto object-cover ring-2 ring-cyan-500/30 shadow-md"
                />
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    {c.name}
                  </h4>
                  <p className="text-xs font-medium text-cyan-600 dark:text-cyan-400">
                    {c.specialty}
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-1">
                  {c.assignedClasses.map((cls) => (
                    <span
                      key={cls}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      {ROLE_LABELS[cls].title}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Section Kontak & Lokasi */}
      <section id="kontak" className="py-14 bg-gradient-to-br from-cyan-900 to-slate-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-300">
                Pusat Pelatihan &amp; Kolam Renang
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                Siap Memulai Langkah Pertama di Kolam Renang?
              </h2>
              <p className="text-sm sm:text-base text-cyan-100/80 leading-relaxed max-w-xl">
                Hubungi kami sekarang untuk konsultasi kelas, jadwal uji coba (trial session), atau kunjungi langsung fasilitas kolam renang kami.
              </p>

              <div className="space-y-3 text-xs sm:text-sm text-cyan-50 pt-2">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span>{academyProfile.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span>Jam Operasional: {academyProfile.operatingHours}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span>Telepon Kantor: {academyProfile.phone}</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-3">
                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat WhatsApp Resmi ({academyProfile.whatsapp})</span>
                </a>

                <button
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all cursor-pointer"
                >
                  <span>Form Pendaftaran Online</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 space-y-4">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>Panduan Pendaftaran Cepat</span>
                </h3>
                <div className="space-y-3 text-xs text-cyan-100/90 leading-relaxed">
                  <p>1. Isi formulir pendaftaran online secara lengkap.</p>
                  <p>2. Dapatkan Nomor Registrasi resmi &amp; konfirmasi via WhatsApp.</p>
                  <p>3. Ambil Kartu Swim Pass Barcode &amp; ikuti sesi pengenalan kolam.</p>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <button
                    onClick={onOpenLogin}
                    className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-extrabold text-xs transition-colors cursor-pointer"
                  >
                    Sudah Punya Akun? Masuk ke Portal Siswa &amp; Pelatih
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Registration Modal */}
      <RegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        pricingPackages={pricingPackages}
        academyProfile={academyProfile}
        initialRoleClass={selectedClassForRegister}
        onRegisterSubmit={onRegisterSubmit}
      />

      {/* 9. Footer Atas Nama Yohes */}
      <AppFooter academyProfile={academyProfile} variant="full" />
    </div>
  );
};
