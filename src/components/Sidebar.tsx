import React from 'react';
import { UserRole, Student, AuthUser } from '../types';
import { ROLE_LABELS } from '../data/mockData';
import {
  Waves,
  TrendingUp,
  Users,
  CalendarCheck,
  CreditCard,
  UserCog,
  GraduationCap,
  Sparkles,
  QrCode,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  ScanLine,
  Sun,
  Moon,
  Trophy,
  Activity,
  Layers,
  ChevronRight,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  X,
  Compass,
  Timer,
  BookOpen,
  LogOut,
  Target,
  Award,
  Coins,
  Building2,
  Globe,
  Shield,
  UserCheck,
  User,
  UserPlus,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface SidebarProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onOpenScanner: () => void;
  onOpenSheets: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
  currentStudent?: Student;
  currentUser: AuthUser | null;
  onLogout: () => void;
  pendingRegistrationsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  onSelectRole,
  isDark,
  onToggleTheme,
  isOpenMobile,
  onCloseMobile,
  isSidebarOpen = true,
  onToggleSidebar,
  onOpenScanner,
  onOpenSheets,
  activeView,
  setActiveView,
  currentStudent,
  currentUser,
  onLogout,
  pendingRegistrationsCount = 0,
}) => {
  const roleConfig = ROLE_LABELS[currentRole];
  const [cardsMenuExpanded, setCardsMenuExpanded] = React.useState(true);

  // Dynamic Navigation menu items specifically tailored per active class / role
  const getNavItems = () => {
    switch (currentRole) {
      case 'admin':
        return [
          {
            id: 'overview',
            label: 'Total Siswa & Pendapatan',
            desc: 'Statistik 6 kelas & grafik omset bulanan',
            icon: TrendingUp,
          },
          {
            id: 'admin-profile',
            label: 'Profil Admin',
            desc: 'Biodata admin, barcode & upload foto',
            icon: Shield,
          },
          {
            id: 'registrations',
            label: 'Pendaftaran Murid Baru',
            desc: 'Kotak masuk pendaftar & persetujuan siswa',
            icon: UserPlus,
            badge: pendingRegistrationsCount && pendingRegistrationsCount > 0 ? `${pendingRegistrationsCount} Baru` : undefined,
          },
          {
            id: 'profiles',
            label: 'Manajemen Profil Peserta',
            desc: 'Daftar murid, kuota sesi & cetak pass',
            icon: Users,
          },
          {
            id: 'attendance',
            label: 'Absen & Total Absen',
            desc: 'Rekap kehadiran & verifikasi barcode',
            icon: CalendarCheck,
          },
          {
            id: 'payments',
            label: 'Pembayaran & Kasir SPP',
            desc: 'Rekening bank transfer (BRI), invoice & bukti',
            icon: CreditCard,
          },
          {
            id: 'pricing',
            label: 'Menejemen Pertemuan & Harga',
            desc: 'Atur sesi, iuran bulanan pemula & prestasi',
            icon: Coins,
          },
          {
            id: 'users',
            label: 'Manajemen User & Akun',
            desc: 'Admin, pelatih, & murid akademi',
            icon: UserCog,
          },
          {
            id: 'settings',
            label: 'Profil Publik & Pengaturan',
            desc: 'Atur nama, logo, banner & fasilitas',
            icon: Building2,
          },
          {
            id: 'cards',
            label: 'Cetak Kartu per Kelas',
            desc: 'Pilihan menu cetak pass per kelas',
            icon: QrCode,
            subItems: [
              { id: 'cards-all', label: 'Semua Murid', badge: 'All' },
              { id: 'cards-staff', label: 'Pelatih & Admin', badge: 'Staff' },
              { id: 'cards-dasar', label: 'Kelas Dasar', badge: 'Dasar' },
              { id: 'cards-pemula', label: 'Kelas Pemula', badge: 'Pemula' },
              { id: 'cards-prestasi', label: 'Kelas Prestasi', badge: 'Prestasi' },
              { id: 'cards-privat_4', label: 'Privat 4 Sesi', badge: 'Privat 4' },
              { id: 'cards-privat_8', label: 'Privat 8 Sesi', badge: 'Privat 8' },
              { id: 'cards-privat_12', label: 'Privat 12 Sesi', badge: 'Privat 12' },
            ],
          },
          {
            id: 'scanner',
            label: 'Scanner Barcode Kamera',
            desc: 'Pemindai kehadiran kamera kolam',
            icon: ScanLine,
            action: onOpenScanner,
          },
          {
            id: 'sheets',
            label: 'Sinkronisasi Google Sheets',
            desc: 'Ekspor log presensi ke spreadsheet',
            icon: FileSpreadsheet,
            action: onOpenSheets,
          },
        ];

      case 'pelatih':
        return [
          {
            id: 'overview',
            label: 'Dashboard Pelatih',
            desc: 'Jadwal hari ini & jalur kolam renang',
            icon: Activity,
          },
          {
            id: 'profile',
            label: 'Profil Pelatih',
            desc: 'Biodata pelatih, barcode & upload foto',
            icon: UserCheck,
          },
          {
            id: 'scanner',
            label: 'Scanner Presensi Kolam',
            desc: 'Scan barcode murid tepi kolam',
            icon: ScanLine,
            action: onOpenScanner,
          },
          {
            id: 'schedules',
            label: 'Jadwal Mengajar & Jalur',
            desc: 'Kolam Dangkal, Utama & Olympic',
            icon: Calendar,
          },
          {
            id: 'evaluation',
            label: 'Evaluasi Teknik Renang',
            desc: 'Nilai pernapasan, kayuhan & stamina',
            icon: CheckCircle2,
          },
          {
            id: 'sheets',
            label: 'Google Sheets Sinkron',
            desc: 'Ekspor data presensi ke Google Drive',
            icon: FileSpreadsheet,
            action: onOpenSheets,
          },
        ];

      case 'dasar':
      case 'pemula':
      case 'prestasi':
      case 'privat_4':
      case 'privat_8':
      case 'privat_12':
      default:
        return [
          {
            id: 'overview',
            label: 'Dasboard',
            desc: `Ringkasan latihan ${roleConfig.title}`,
            icon: Waves,
          },
          {
            id: 'profile',
            label: 'Profil Siswa',
            desc: `Biodata siswa sesuai ${roleConfig.title}`,
            icon: Users,
          },
          {
            id: 'attendance',
            label: 'Riwayat Masuk',
            desc: 'Rekap presensi masuk kolam',
            icon: CalendarCheck,
          },
          {
            id: 'payments',
            label: 'Riwayat Bayar',
            desc: 'Status SPP & riwayat kuitansi',
            icon: CreditCard,
          },
          {
            id: 'card',
            label: 'Kartu Siswa',
            desc: `Kartu resmi kelas ${roleConfig.title}`,
            icon: QrCode,
          },
        ];
    }
  };

  const navItems = getNavItems();
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fadeIn"
        ></div>
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'lg:w-72' : 'lg:w-20'
        } ${
          isOpenMobile ? 'w-72 translate-x-0' : 'w-72 -translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className={`border-b border-slate-200 dark:border-slate-800 flex items-center transition-all ${
          isSidebarOpen ? 'p-4 sm:p-5 landscape:py-3 justify-between' : 'p-3 flex-col justify-center gap-2'
        }`}>
          <div className={`flex items-center ${isSidebarOpen ? 'gap-3' : 'justify-center'}`}>
            <div
              onClick={() => {
                if (!isSidebarOpen && onToggleSidebar) onToggleSidebar();
              }}
              title="AQUAFLOW Tirta Samudra"
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 flex-shrink-0 cursor-pointer"
            >
              <Waves className="w-6 h-6 animate-pulse" />
            </div>
            {isSidebarOpen && (
              <div className="min-w-0">
                <h2 className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                  AQUA<span className="text-cyan-500">FLOW</span>
                </h2>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider truncate">
                  Tirta Samudra Academy
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              if (onToggleSidebar) onToggleSidebar();
              onCloseMobile();
            }}
            title={isSidebarOpen ? 'Sembunyikan Menu Sidebar' : 'Perluas Menu Sidebar'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isSidebarOpen ? (
              <>
                <ChevronsLeft className="w-5 h-5 hidden lg:block" />
                <X className="w-5 h-5 lg:hidden" />
              </>
            ) : (
              <ChevronsRight className="w-5 h-5 hidden lg:block text-cyan-600 dark:text-cyan-400" />
            )}
          </button>
        </div>

        {/* Current Active Role Badge */}
        {isSidebarOpen ? (
          <div className="p-3.5 mx-3.5 mt-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-900/80 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Akun Aktif</span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${roleConfig.badgeBg}`}>
                {roleConfig.textBadge}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{roleConfig.title}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{roleConfig.subtitle}</p>

            {currentStudent && currentRole !== 'admin' && currentRole !== 'pelatih' && (
              <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={currentStudent.avatarUrl}
                    alt={currentStudent.name}
                    className="w-6 h-6 rounded-lg object-cover border"
                  />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {currentStudent.name}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400">
                  {currentStudent.barcode}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div
            title={`Status Akun: ${roleConfig.title} (${roleConfig.subtitle})`}
            className="p-2 mx-2 mt-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center cursor-default"
          >
            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${roleConfig.badgeBg} truncate`}>
              {roleConfig.textBadge.slice(0, 3)}
            </span>
          </div>
        )}

        {/* Scrollable Navigation Sections */}
        <div className={`flex-1 overflow-y-auto space-y-4 ${isSidebarOpen ? 'px-3.5 py-3' : 'px-2 py-3'}`}>
          {/* Dynamic Navigation Menu for Active Role */}
          <div>
            {isSidebarOpen && (
              <div className="flex items-center justify-between px-2 mb-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Menu {roleConfig.title}
                </p>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-extrabold">
                  {navItems.length} Menu
                </span>
              </div>
            )}

            <div className="space-y-1">
              {navItems.map((item: any) => {
                const Icon = item.icon;
                const hasSub = Array.isArray(item.subItems) && item.subItems.length > 0;
                const isItemActive =
                  activeView === item.id ||
                  (hasSub && (activeView.startsWith('cards') || activeView === 'barcode'));

                return (
                  <div key={item.id} className="space-y-1">
                    <button
                      onClick={() => {
                        if (item.action) {
                          item.action();
                          onCloseMobile();
                        } else if (hasSub) {
                          setCardsMenuExpanded((prev) => !prev);
                          if (!isItemActive) {
                            setActiveView('cards-all');
                          }
                        } else {
                          setActiveView(item.id);
                          onCloseMobile();
                        }
                      }}
                      title={`${item.label} • ${item.desc}`}
                      className={`w-full flex items-center rounded-xl transition-all cursor-pointer group relative ${
                        isSidebarOpen
                          ? `justify-between px-3 py-2.5 text-left ${
                              isItemActive
                                ? `bg-gradient-to-r ${roleConfig.btnGradient || 'from-cyan-600 to-blue-600'} text-white shadow-md`
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                            }`
                          : `justify-center p-2.5 ${
                              isItemActive
                                ? `bg-gradient-to-r ${roleConfig.btnGradient || 'from-cyan-600 to-blue-600'} text-white shadow-md scale-105`
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-cyan-600 dark:hover:text-cyan-400'
                            }`
                      }`}
                    >
                      <div className={`flex items-center gap-2.5 ${isSidebarOpen ? 'min-w-0' : 'justify-center'}`}>
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isItemActive
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-cyan-500'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        {isSidebarOpen && (
                          <div className="min-w-0">
                            <p className={`text-xs font-bold truncate ${isItemActive ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                              {item.label}
                            </p>
                            <p className={`text-[10px] truncate ${isItemActive ? 'text-cyan-100' : 'text-slate-400 dark:text-slate-500'}`}>
                              {item.desc}
                            </p>
                          </div>
                        )}
                      </div>

                      {isSidebarOpen && (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {item.badge && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              isItemActive
                                ? 'bg-white text-cyan-900 shadow-sm'
                                : 'bg-amber-500 text-slate-950 shadow-sm animate-pulse'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                          {hasSub ? (
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${
                                isItemActive ? 'text-white' : 'text-slate-400'
                              } ${cardsMenuExpanded ? 'rotate-180' : ''}`}
                            />
                          ) : isItemActive ? (
                            <ChevronRight className="w-4 h-4 text-white flex-shrink-0" />
                          ) : null}
                        </div>
                      )}

                      {/* Floating Tooltip when collapsed on desktop */}
                      {!isSidebarOpen && (
                        <div className="hidden lg:group-hover:flex absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl whitespace-nowrap shadow-xl z-50 pointer-events-none items-center gap-2 border border-slate-700">
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold">
                              {item.badge}
                            </span>
                          )}
                          {isItemActive && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>}
                        </div>
                      )}
                    </button>

                    {/* Sub Menu per Kelas (When expanded and Sidebar is open) */}
                    {hasSub && isSidebarOpen && cardsMenuExpanded && (
                      <div className="pl-6 pr-1 py-1 space-y-1 animate-fadeIn">
                        {item.subItems.map((sub: any) => {
                          const isSubActive =
                            activeView === sub.id ||
                            (sub.id === 'cards-all' && (activeView === 'cards' || activeView === 'barcode'));
                          return (
                            <button
                              key={sub.id}
                              onClick={() => {
                                setActiveView(sub.id);
                                onCloseMobile();
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                                isSubActive
                                  ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-extrabold border border-cyan-500/40 shadow-sm'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              <span className="truncate">{sub.label}</span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                                  isSubActive
                                    ? 'bg-cyan-500 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                }`}
                              >
                                {sub.badge}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: Poolside Quick Utilities (Hanya Admin & Pelatih untuk Absen) */}
          {(currentRole === 'admin' || currentRole === 'pelatih') && (
            <div className={`pt-3 border-t border-slate-200 dark:border-slate-800 ${!isSidebarOpen ? 'flex flex-col items-center gap-2' : ''}`}>
              {isSidebarOpen && (
                <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Alat Tepi Kolam
                </p>
              )}
              {isSidebarOpen ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onOpenScanner();
                      onCloseMobile();
                    }}
                    className="p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-left transition-all cursor-pointer flex flex-col gap-1"
                  >
                    <ScanLine className="w-4 h-4" />
                    <span className="text-xs font-bold leading-tight">Scanner Kamera</span>
                    <span className="text-[9px] text-slate-500">Scan Presensi</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenSheets();
                      onCloseMobile();
                    }}
                    className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-left transition-all cursor-pointer flex flex-col gap-1"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span className="text-xs font-bold leading-tight">Google Sheets</span>
                    <span className="text-[9px] text-slate-500">Ekspor Data</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 w-full">
                  <button
                    onClick={() => {
                      onOpenScanner();
                      onCloseMobile();
                    }}
                    title="Buka Scanner Barcode Kamera"
                    className="w-10 h-10 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center transition-all cursor-pointer relative group"
                  >
                    <ScanLine className="w-4 h-4" />
                    <div className="hidden lg:group-hover:flex absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-lg whitespace-nowrap shadow-xl z-50 pointer-events-none">
                      Scanner Barcode Kamera
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onOpenSheets();
                      onCloseMobile();
                    }}
                    title="Sinkronisasi Google Sheets"
                    className="w-10 h-10 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-all cursor-pointer relative group"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <div className="hidden lg:group-hover:flex absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-lg whitespace-nowrap shadow-xl z-50 pointer-events-none">
                      Google Sheets Sync
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer: User Profile, Logout & Theme Toggle */}
        <div className={`border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 space-y-2 ${
          isSidebarOpen ? 'p-3.5' : 'p-2 flex flex-col items-center'
        }`}>
          {currentUser && (
            isSidebarOpen ? (
              <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                <div
                  onClick={() => {
                    if (currentRole === 'admin') {
                      setActiveView('admin-profile');
                    } else if (currentRole === 'pelatih') {
                      setActiveView('profile');
                    }
                  }}
                  className={`flex items-center gap-2.5 min-w-0 ${
                    currentRole === 'admin' || currentRole === 'pelatih'
                      ? 'cursor-pointer hover:opacity-85 transition-opacity'
                      : ''
                  }`}
                  title={
                    currentRole === 'admin'
                      ? 'Buka Profil Admin'
                      : currentRole === 'pelatih'
                      ? 'Buka Profil Pelatih'
                      : undefined
                  }
                >
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-lg object-cover border border-cyan-400 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-slate-400 capitalize truncate flex items-center gap-1">
                      <span>{currentUser.role.replace('_', ' ')}</span>
                      {(currentRole === 'admin' || currentRole === 'pelatih') && (
                        <span className="text-[9px] text-cyan-500 font-semibold">• Profil</span>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  title="Keluar / Logout Akun"
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer flex-shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative group">
                <button
                  onClick={onLogout}
                  title={`Login sebagai ${currentUser.name} • Klik untuk Logout`}
                  className="w-10 h-10 rounded-xl relative overflow-hidden border-2 border-cyan-400 hover:border-rose-500 transition-colors cursor-pointer flex items-center justify-center"
                >
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-rose-600/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <LogOut className="w-4 h-4" />
                  </div>
                </button>
                <div className="hidden lg:group-hover:flex absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-lg whitespace-nowrap shadow-xl z-50 pointer-events-none">
                  {currentUser.name} (Logout)
                </div>
              </div>
            )
          )}

          {isSidebarOpen ? (
            <PWAInstallButton variant="pill" className="w-full justify-center" />
          ) : (
            <div className="relative group">
              <PWAInstallButton variant="compact" />
              <div className="hidden lg:group-hover:flex absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-lg whitespace-nowrap shadow-xl z-50 pointer-events-none">
                Pasang Aplikasi PWA
              </div>
            </div>
          )}

          <button
            onClick={onToggleTheme}
            title={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all cursor-pointer shadow-sm ${
              isSidebarOpen ? 'w-full flex items-center justify-between px-3 py-2' : 'w-10 h-10 flex items-center justify-center'
            }`}
          >
            {isSidebarOpen ? (
              <>
                <div className="flex items-center gap-2.5">
                  {isDark ? (
                    <Moon className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-500" />
                  )}
                  <span>Mode {isDark ? 'Gelap (Navy Kolam)' : 'Terang (Azure)'}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
                  Ganti
                </span>
              </>
            ) : (
              isDark ? (
                <Moon className="w-4 h-4 text-cyan-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
