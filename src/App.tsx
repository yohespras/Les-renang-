import React, { useState, useEffect, useRef } from 'react';
import {
  UserRole,
  Student,
  AttendanceRecord,
  Coach,
  PoolSchedule,
  AuthUser,
  PaymentRecord,
  ClassPricingPackage,
  AcademyProfile,
  StudentRegistration,
  GalleryItem,
  BankAccountInfo,
} from './types';
import {
  INITIAL_STUDENTS,
  INITIAL_COACHES,
  INITIAL_SCHEDULES,
  INITIAL_ATTENDANCE,
  INITIAL_PAYMENTS,
  INITIAL_REVENUE_TREND,
  INITIAL_APP_USERS,
  INITIAL_PRICING_PACKAGES,
  DEFAULT_ACADEMY_PROFILE,
  INITIAL_REGISTRATIONS,
  INITIAL_GALLERY_ITEMS,
  OFFICIAL_BANK_ACCOUNTS,
} from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { BarcodeCard } from './components/BarcodeCard';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { LoginPage } from './components/LoginPage';
import { PublicProfilePage } from './components/PublicProfilePage';
import { AppFooter } from './components/AppFooter';
import { PanelLeftOpen, Clock, CheckCircle2, X } from 'lucide-react';
import {
  initDailyAutoSaveScheduler,
  DailyMidnightSnapshot,
} from './services/dailyAutoSaveService';

// Dashboards per Class / Role
import { useFirestoreSync } from './hooks/useFirestoreSync';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { CoachDashboard } from './components/dashboards/CoachDashboard';
import { StudentDashboard } from './components/dashboards/StudentDashboard';
import { DasarDashboard } from './components/dashboards/DasarDashboard';
import { PemulaDashboard } from './components/dashboards/PemulaDashboard';
import { PrestasiDashboard } from './components/dashboards/PrestasiDashboard';
import { PrivatDashboard } from './components/dashboards/PrivatDashboard';

export default function App() {
  // Ensure default admin user is present if local storage is completely empty
  if (typeof window !== 'undefined' && !localStorage.getItem('AQUA_APP_USERS')) {
    localStorage.setItem('AQUA_APP_USERS', JSON.stringify(INITIAL_APP_USERS));
  }

  // Real-time Cloud Firestore Synchronization State across devices
  

  // Theme state (Dark & Light)
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('AQUA_THEME');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('AQUA_AUTH_USER');
    return saved ? JSON.parse(saved) : null;
  });

  // Active Role state
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return currentUser?.role || 'admin';
  });
  const [activeView, setActiveView] = useState<string>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Desktop & Landscape Sidebar collapse state
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('AQUA_SIDEBAR_OPEN');
    if (saved !== null) return saved === 'true';
    return true; // default open
  });

  const handleToggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setMobileSidebarOpen((prev) => !prev);
    } else {
      setIsSidebarOpen((prev) => {
        const next = !prev;
        localStorage.setItem('AQUA_SIDEBAR_OPEN', String(next));
        return next;
      });
    }
  };

  // Keyboard shortcut Ctrl+B / Cmd+B to toggle sidebar anytime
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        handleToggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Core Data State (persisted in localStorage)
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('AQUA_STUDENTS');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [attendances, setAttendances] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('AQUA_ATTENDANCES');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const saved = localStorage.getItem('AQUA_PAYMENTS');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [appUsers, setAppUsers] = useState<AuthUser[]>(() => {
    const saved = localStorage.getItem('AQUA_APP_USERS');
    return saved ? JSON.parse(saved) : INITIAL_APP_USERS;
  });

  const [pricingPackages, setPricingPackages] = useState<ClassPricingPackage[]>(() => {
    const saved = localStorage.getItem('AQUA_PRICING_PACKAGES');
    return saved ? JSON.parse(saved) : INITIAL_PRICING_PACKAGES;
  });

  // Pre-login screen: 'profile' (Public Landing & Profile) or 'login' (Login Portal)
  const [preLoginView, setPreLoginView] = useState<'profile' | 'login'>('profile');

  // Academy Profile & CMS State (persisted in localStorage)
  const [academyProfile, setAcademyProfile] = useState<AcademyProfile>(() => {
    const saved = localStorage.getItem('AQUA_ACADEMY_PROFILE');
    return saved ? JSON.parse(saved) : DEFAULT_ACADEMY_PROFILE;
  });

  const handleUpdateAcademyProfile = (updated: AcademyProfile) => {
    setAcademyProfile(updated);
    localStorage.setItem('AQUA_ACADEMY_PROFILE', JSON.stringify(updated));
    syncSaveAcademyProfile(updated);
  };

  // Online Registrations State (persisted in localStorage)
  const [registrations, setRegistrations] = useState<StudentRegistration[]>(() => {
    const saved = localStorage.getItem('AQUA_REGISTRATIONS');
    return saved ? JSON.parse(saved) : INITIAL_REGISTRATIONS;
  });

  const handleAddRegistration = (newReg: StudentRegistration) => {
    const updated = [newReg, ...registrations];
    setRegistrations(updated);
    localStorage.setItem('AQUA_REGISTRATIONS', JSON.stringify(updated));
    syncSaveRegistration(newReg);
  };

  const handleUpdateRegistration = (updatedReg: StudentRegistration) => {
    const updated = registrations.map((r) => (r.id === updatedReg.id ? updatedReg : r));
    setRegistrations(updated);
    localStorage.setItem('AQUA_REGISTRATIONS', JSON.stringify(updated));
    syncSaveRegistration(updatedReg);
  };

  const handleDeleteRegistration = (regId: string) => {
    const updated = registrations.filter((r) => r.id !== regId);
    setRegistrations(updated);
    localStorage.setItem('AQUA_REGISTRATIONS', JSON.stringify(updated));
    syncDeleteRegistration(regId);
  };

  // Galeri Latihan State (persisted in localStorage)
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() => {
    const saved = localStorage.getItem('AQUA_GALLERY_ITEMS');
    return saved ? JSON.parse(saved) : INITIAL_GALLERY_ITEMS;
  });

  const handleAddGalleryItem = (newItem: GalleryItem) => {
    const updated = [newItem, ...galleryItems];
    setGalleryItems(updated);
    localStorage.setItem('AQUA_GALLERY_ITEMS', JSON.stringify(updated));
    syncSaveGalleryItem(newItem);
  };

  const handleDeleteGalleryItem = (itemId: string) => {
    const updated = galleryItems.filter((g) => g.id !== itemId);
    setGalleryItems(updated);
    localStorage.setItem('AQUA_GALLERY_ITEMS', JSON.stringify(updated));
    syncDeleteGalleryItem(itemId);
  };

  const [coaches, setCoaches] = useState<Coach[]>(() => {
    const saved = localStorage.getItem('AQUA_COACHES');
    return saved ? JSON.parse(saved) : INITIAL_COACHES;
  });
  const [schedules] = useState<PoolSchedule[]>(INITIAL_SCHEDULES);

  // Rekening Bank Resmi Pembayaran (persisted in localStorage)
  const [bankAccounts, setBankAccounts] = useState<BankAccountInfo[]>(() => {
    const saved = localStorage.getItem('AQUA_BANK_ACCOUNTS');
    return saved ? JSON.parse(saved) : OFFICIAL_BANK_ACCOUNTS;
  });

  const handleAddBankAccount = (newAcc: BankAccountInfo) => {
    const updated = [...bankAccounts, newAcc];
    setBankAccounts(updated);
    localStorage.setItem('AQUA_BANK_ACCOUNTS', JSON.stringify(updated));
    syncSaveBankAccount(newAcc);
  };

  const handleUpdateBankAccount = (updatedAcc: BankAccountInfo) => {
    const updated = bankAccounts.map((b) => (b.id === updatedAcc.id ? updatedAcc : b));
    setBankAccounts(updated);
    localStorage.setItem('AQUA_BANK_ACCOUNTS', JSON.stringify(updated));
    syncSaveBankAccount(updatedAcc);
  };

  
  // -------------------------------------------------------------
  // Real-time Cloud Firestore Synchronization across All Devices (Mobile, Tablet, Desktop)
  // -------------------------------------------------------------
  const {
    isCloudSynced,
    syncSaveUser,
    syncDeleteUser,
    syncSaveStudent,
    syncDeleteStudent,
    syncSaveCoach,
    syncDeleteCoach,
    syncSaveAttendance,
    syncDeleteAttendance,
    syncSavePayment,
    syncDeletePayment,
    syncSaveBankAccount,
    syncDeleteBankAccount,
    syncSaveRegistration,
    syncDeleteRegistration,
    syncSavePricingPackage,
    syncDeletePricingPackage,
    syncSaveAcademyProfile,
    syncSaveGalleryItem,
    syncDeleteGalleryItem,
  } = useFirestoreSync({
    appUsers,
    setAppUsers,
    students,
    setStudents,
    coaches,
    setCoaches,
    attendances,
    setAttendances,
    payments,
    setPayments,
    pricingPackages,
    setPricingPackages,
    bankAccounts,
    setBankAccounts,
    registrations,
    setRegistrations,
    galleryItems,
    setGalleryItems,
    academyProfile,
    setAcademyProfile,
  });

  const handleDeleteBankAccount = (accId: string) => {
    const updated = bankAccounts.filter((b) => b.id !== accId);
    setBankAccounts(updated);
    localStorage.setItem('AQUA_BANK_ACCOUNTS', JSON.stringify(updated));
    syncDeleteBankAccount(accId);
  };

  // Modals state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSheetsOpen, setIsSheetsOpen] = useState(false);
  const [barcodeCardModal, setBarcodeCardModal] = useState<any | null>(null);

  // Active student for student dashboards
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    return currentUser?.studentId || '';
  });

  // Daily 00:00 AutoSave Notification Toast
  const [autoSaveToast, setAutoSaveToast] = useState<{
    date: string;
    text: string;
  } | null>(null);

  // References for scheduler to access latest state without re-triggering timers
  const studentsRef = useRef(students);
  studentsRef.current = students;
  const attendancesRef = useRef(attendances);
  attendancesRef.current = attendances;

  // Initialize Daily 00:00 Auto-Save Engine
  useEffect(() => {
    const cleanup = initDailyAutoSaveScheduler(
      () => studentsRef.current,
      () => attendancesRef.current
    );

    const handleAutoSaveCompleted = (e: Event) => {
      const customEvent = e as CustomEvent<DailyMidnightSnapshot>;
      const snap = customEvent.detail;
      setAutoSaveToast({
        date: snap.date,
        text: `Simpan Otomatis Jam 00:00 Berhasil: ${snap.totalStudents} siswa & ${snap.todayAttendances} absensi tercatat (${snap.sheetsSyncStatus}).`,
      });
      setTimeout(() => setAutoSaveToast(null), 8000);
    };

    window.addEventListener('aqua:daily-autosave-completed', handleAutoSaveCompleted);

    return () => {
      cleanup();
      window.removeEventListener('aqua:daily-autosave-completed', handleAutoSaveCompleted);
    };
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('AQUA_THEME', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('AQUA_THEME', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  // Filter students belonging to current role
  const studentsInCurrentRole = students.filter((s) => s.roleClass === currentRole);
  const currentStudent =
    studentsInCurrentRole.find((s) => s.id === selectedStudentId) ||
    studentsInCurrentRole[0] ||
    students[0];

  // When switching role, ensure selectedStudentId matches student in that class
  const handleSelectRole = (role: UserRole) => {
    setCurrentRole(role);
    const inRole = students.filter((s) => s.roleClass === role);
    if (inRole.length > 0) {
      setSelectedStudentId(inRole[0].id);
    }
    setActiveView('overview');
  };

  // Login Handler
  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    localStorage.setItem('AQUA_AUTH_USER', JSON.stringify(user));
    setCurrentRole(user.role);
    if (user.studentId) {
      setSelectedStudentId(user.studentId);
    } else {
      const inRole = students.filter((s) => s.roleClass === user.role);
      if (inRole.length > 0) {
        setSelectedStudentId(inRole[0].id);
      }
    }
    setActiveView('overview');
  };

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('AQUA_AUTH_USER');
    setCurrentUser(null);
  };

  // Otomatis sinkronisasi currentUser saat appUsers diperbarui dari Cloud Firestore
  useEffect(() => {
    if (!currentUser) return;
    const freshUser = appUsers.find(
      (u) =>
        u.id === currentUser.id ||
        (currentUser.barcode && u.barcode === currentUser.barcode) ||
        (currentUser.username && u.username?.toLowerCase() === currentUser.username.toLowerCase())
    );
    if (freshUser && freshUser.avatarUrl && freshUser.avatarUrl !== currentUser.avatarUrl) {
      const updated = {
        ...currentUser,
        avatarUrl: freshUser.avatarUrl,
        name: freshUser.name || currentUser.name,
      };
      setCurrentUser(updated);
      try {
        localStorage.setItem('AQUA_AUTH_USER', JSON.stringify(updated));
      } catch (e) {}
    }
  }, [appUsers]);

  // Handle Attendance Scan Recorded
  const handleAttendanceRecorded = (record: AttendanceRecord, updatedStudent?: Student) => {
    const updatedAttendances = [record, ...attendances];
    setAttendances(updatedAttendances);
    localStorage.setItem('AQUA_ATTENDANCES', JSON.stringify(updatedAttendances));
    syncSaveAttendance(record);

    if (updatedStudent) {
      const updatedStudents = students.map((s) =>
        s.id === updatedStudent.id ? updatedStudent : s
      );
      setStudents(updatedStudents);
      localStorage.setItem('AQUA_STUDENTS', JSON.stringify(updatedStudents));
      syncSaveStudent(updatedStudent);
    }
  };

  // Update attendance record
  const handleUpdateAttendance = (updatedRecord: AttendanceRecord) => {
    const prev = attendances.find((a) => a.id === updatedRecord.id);
    const updatedAttendances = attendances.map((a) =>
      a.id === updatedRecord.id ? updatedRecord : a
    );
    setAttendances(updatedAttendances);
    localStorage.setItem('AQUA_ATTENDANCES', JSON.stringify(updatedAttendances));
    syncSaveAttendance(updatedRecord);

    // If status changed from/to 'hadir', adjust student quota
    if (prev && prev.status !== updatedRecord.status) {
      const student = students.find((s) => s.id === updatedRecord.studentId);
      if (student) {
        let newRemaining = student.remainingQuota;
        if (prev.status === 'hadir' && updatedRecord.status !== 'hadir') {
          newRemaining = Math.min(student.totalQuota, (student.remainingQuota ?? 0) + 1);
        } else if (prev.status !== 'hadir' && updatedRecord.status === 'hadir') {
          newRemaining = Math.max(0, (student.remainingQuota ?? student.totalQuota) - 1);
        }
        if (newRemaining !== student.remainingQuota) {
          const updatedStudent = { ...student, remainingQuota: newRemaining };
          const updatedStudents = students.map((s) => (s.id === student.id ? updatedStudent : s));
          setStudents(updatedStudents);
          localStorage.setItem('AQUA_STUDENTS', JSON.stringify(updatedStudents));
          syncSaveStudent(updatedStudent);
        }
      }
    }
  };

  // Delete attendance record
  const handleDeleteAttendance = (attendanceId: string) => {
    const recordToDelete = attendances.find((a) => a.id === attendanceId);
    if (!recordToDelete) return;

    const updatedAttendances = attendances.filter((a) => a.id !== attendanceId);
    setAttendances(updatedAttendances);
    localStorage.setItem('AQUA_ATTENDANCES', JSON.stringify(updatedAttendances));
    syncDeleteAttendance(attendanceId);

    // If deleted record was 'hadir', restore quota for student
    if (recordToDelete.status === 'hadir') {
      const student = students.find((s) => s.id === recordToDelete.studentId);
      if (student) {
        const updatedStudent = {
          ...student,
          remainingQuota: Math.min(student.totalQuota, (student.remainingQuota ?? 0) + 1),
        };
        const updatedStudents = students.map((s) => (s.id === student.id ? updatedStudent : s));
        setStudents(updatedStudents);
        localStorage.setItem('AQUA_STUDENTS', JSON.stringify(updatedStudents));
        syncSaveStudent(updatedStudent);
      }
    }
  };

  // Direct edit of total attendance and quota for a student
  const handleUpdateTotalAttendance = (
    studentId: string,
    executedSessions: number,
    totalQuota: number,
    remainingQuota: number
  ) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const updatedStudent: Student = {
      ...student,
      totalQuota,
      remainingQuota,
      manualExecutedSessions: executedSessions,
    };
    const updatedStudents = students.map((s) => (s.id === student.id ? updatedStudent : s));
    setStudents(updatedStudents);
    localStorage.setItem('AQUA_STUDENTS', JSON.stringify(updatedStudents));
    syncSaveStudent(updatedStudent);
  };

  // Reset all attendance logs for a student
  const handleResetStudentAttendance = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const studentLogs = attendances.filter((a) => a.studentId === studentId);
    const updatedAttendances = attendances.filter((a) => a.studentId !== studentId);
    setAttendances(updatedAttendances);
    localStorage.setItem('AQUA_ATTENDANCES', JSON.stringify(updatedAttendances));
    studentLogs.forEach((l) => syncDeleteAttendance(l.id));

    // Restore full quota
    const updatedStudent: Student = {
      ...student,
      remainingQuota: student.totalQuota,
      manualExecutedSessions: 0,
    };
    const updatedStudents = students.map((s) => (s.id === student.id ? updatedStudent : s));
    setStudents(updatedStudents);
    localStorage.setItem('AQUA_STUDENTS', JSON.stringify(updatedStudents));
    syncSaveStudent(updatedStudent);
  };

  // Add new student (otomatis buat akun login di Manajemen User)
  const handleAddStudent = (
    newStudent: Student,
    customAuth?: { username?: string; password?: string }
  ) => {
    const updated = [newStudent, ...students];
    setStudents(updated);
    localStorage.setItem('AQUA_STUDENTS', JSON.stringify(updated));
    syncSaveStudent(newStudent);

    // OTOMATIS: Buat akun login siswa di Manajemen User
    const existingUser = appUsers.find(
      (u) => u.studentId === newStudent.id || (u.barcode && u.barcode === newStudent.barcode)
    );

    if (!existingUser) {
      let finalUsername = '';
      if (customAuth?.username && customAuth.username.trim()) {
        finalUsername = customAuth.username.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      } else {
        const cleanName = newStudent.name.trim().toLowerCase();
        const parts = cleanName.split(/\s+/).filter(Boolean);
        const first = (parts[0] || 'siswa').replace(/[^a-z0-9]/g, '');
        const second = parts[1] ? parts[1].replace(/[^a-z0-9]/g, '') : '';
        const baseCandidate = second ? `${first}_${second}` : first;
        let candidate = baseCandidate || 'siswa';
        let suffix = 1;
        while (appUsers.some((u) => u.username?.toLowerCase() === candidate.toLowerCase())) {
          candidate = `${baseCandidate}${suffix}`;
          suffix++;
        }
        finalUsername = candidate;
      }

      const finalPassword =
        customAuth?.password && customAuth.password.trim()
          ? customAuth.password.trim()
          : 'siswa123';

      const newUser: AuthUser = {
        id: `usr-std-${newStudent.id.replace(/[^a-zA-Z0-9]/g, '')}`,
        name: newStudent.name,
        username: finalUsername,
        password: finalPassword,
        email: `${finalUsername}@aquaflow.id`,
        role: newStudent.roleClass,
        phone: newStudent.phone,
        studentId: newStudent.id,
        barcode: newStudent.barcode,
        avatarUrl: newStudent.avatarUrl,
      };

      const updatedUsers = [newUser, ...appUsers];
      setAppUsers(updatedUsers);
      localStorage.setItem('AQUA_APP_USERS', JSON.stringify(updatedUsers));
      syncSaveUser(newUser);
    }
  };

  // Auto-sync: Pastikan setiap murid di Manajemen Profil Peserta selalu memiliki akun login di Manajemen User
  useEffect(() => {
    if (students.length === 0) return;

    setAppUsers((prevUsers) => {
      let hasNew = false;
      let updatedUsers = [...prevUsers];
      const newlyCreated: AuthUser[] = [];

      students.forEach((st) => {
        const exists = updatedUsers.some(
          (u) => u.studentId === st.id || (u.barcode && u.barcode === st.barcode)
        );
        if (!exists) {
          hasNew = true;
          const cleanName = st.name.trim().toLowerCase();
          const parts = cleanName.split(/\s+/).filter(Boolean);
          const first = (parts[0] || 'siswa').replace(/[^a-z0-9]/g, '');
          const second = parts[1] ? parts[1].replace(/[^a-z0-9]/g, '') : '';
          const baseCandidate = second ? `${first}_${second}` : first;
          let candidate = baseCandidate || 'siswa';
          let suffix = 1;
          while (updatedUsers.some((u) => u.username?.toLowerCase() === candidate.toLowerCase())) {
            candidate = `${baseCandidate}${suffix}`;
            suffix++;
          }

          const newUser: AuthUser = {
            id: `usr-std-${st.id.replace(/[^a-zA-Z0-9]/g, '')}`,
            name: st.name,
            username: candidate,
            password: 'siswa123',
            email: `${candidate}@aquaflow.id`,
            role: st.roleClass,
            phone: st.phone,
            studentId: st.id,
            barcode: st.barcode,
            avatarUrl: st.avatarUrl,
          };
          updatedUsers = [newUser, ...updatedUsers];
          newlyCreated.push(newUser);
        }
      });

      if (hasNew) {
        localStorage.setItem('AQUA_APP_USERS', JSON.stringify(updatedUsers));
        newlyCreated.forEach((u) => syncSaveUser(u));
        return updatedUsers;
      }
      return prevUsers;
    });
  }, [students]);

  // Add new coach (otomatis buat barcode AQUA-CCH-10X, username, password coach123, dan akun login di Manajemen User)
  const handleAddCoach = (
    newCoach: Coach,
    customAuth?: { username?: string; password?: string }
  ) => {
    // 1. Otomatis buat barcode pelatih unik jika belum ada
    let barcode = newCoach.barcode;
    if (!barcode || !barcode.trim()) {
      const existingCoachNums = coaches
        .map((c) => {
          const m = c.barcode?.match(/AQUA-CCH-(\d+)/);
          return m ? parseInt(m[1], 10) : 0;
        })
        .filter((n) => n > 0);
      const nextNum = existingCoachNums.length > 0 ? Math.max(...existingCoachNums) + 1 : 101;
      barcode = `AQUA-CCH-${nextNum}`;
    }

    const coachWithBarcode: Coach = {
      ...newCoach,
      barcode,
    };

    const updatedCoaches = [coachWithBarcode, ...coaches];
    setCoaches(updatedCoaches);
    localStorage.setItem('AQUA_COACHES', JSON.stringify(updatedCoaches));
    syncSaveCoach(coachWithBarcode);

    // 2. OTOMATIS: Buat akun login pelatih di Manajemen User
    const existingUser = appUsers.find(
      (u) =>
        (u.coachId && u.coachId === coachWithBarcode.id) ||
        (u.barcode && u.barcode === coachWithBarcode.barcode) ||
        (u.role === 'pelatih' && u.name.toLowerCase() === coachWithBarcode.name.toLowerCase())
    );

    if (!existingUser) {
      let finalUsername = '';
      if (customAuth?.username && customAuth.username.trim()) {
        finalUsername = customAuth.username
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '');
      } else {
        const cleanName = coachWithBarcode.name.trim().toLowerCase();
        const parts = cleanName.split(/\s+/).filter(Boolean);
        const first = (parts[0] || 'coach').replace(/[^a-z0-9]/g, '');
        const second = parts[1] ? parts[1].replace(/[^a-z0-9]/g, '') : '';
        const baseCandidate = second ? `${first}_${second}` : (first.startsWith('coach') ? first : `coach_${first}`);
        let candidate = baseCandidate || 'coach';
        let suffix = 1;
        while (appUsers.some((u) => u.username?.toLowerCase() === candidate.toLowerCase())) {
          candidate = `${baseCandidate}${suffix}`;
          suffix++;
        }
        finalUsername = candidate;
      }

      const finalPassword =
        customAuth?.password && customAuth.password.trim()
          ? customAuth.password.trim()
          : 'coach123';

      const newUser: AuthUser = {
        id: `usr-cch-${coachWithBarcode.id.replace(/[^a-zA-Z0-9]/g, '') || Date.now()}`,
        name: coachWithBarcode.name,
        username: finalUsername,
        password: finalPassword,
        email: coachWithBarcode.email || `${finalUsername}@aquaflow.id`,
        role: 'pelatih',
        phone: coachWithBarcode.phone,
        coachId: coachWithBarcode.id,
        barcode: coachWithBarcode.barcode,
        avatarUrl: coachWithBarcode.avatarUrl,
      };

      const updatedUsers = [newUser, ...appUsers];
      setAppUsers(updatedUsers);
      localStorage.setItem('AQUA_APP_USERS', JSON.stringify(updatedUsers));
      syncSaveUser(newUser);
    }
  };

  // Auto-sync: Pastikan setiap Pelatih di daftar pelatih selalu memiliki akun login di Manajemen User
  useEffect(() => {
    if (coaches.length === 0) return;

    setAppUsers((prevUsers) => {
      let hasNew = false;
      let updatedUsers = [...prevUsers];
      const newlyCreated: AuthUser[] = [];

      coaches.forEach((c, idx) => {
        const exists = updatedUsers.some(
          (u) =>
            (u.coachId && u.coachId === c.id) ||
            (u.barcode && u.barcode === c.barcode) ||
            (u.role === 'pelatih' && u.name.toLowerCase() === c.name.toLowerCase())
        );
        if (!exists) {
          hasNew = true;
          const cleanName = c.name.trim().toLowerCase();
          const parts = cleanName.split(/\s+/).filter(Boolean);
          const first = (parts[0] || 'coach').replace(/[^a-z0-9]/g, '');
          const second = parts[1] ? parts[1].replace(/[^a-z0-9]/g, '') : '';
          const baseCandidate = second ? `${first}_${second}` : (first.startsWith('coach') ? first : `coach_${first}`);
          let candidate = baseCandidate || 'coach';
          let suffix = 1;
          while (updatedUsers.some((u) => u.username?.toLowerCase() === candidate.toLowerCase())) {
            candidate = `${baseCandidate}${suffix}`;
            suffix++;
          }

          const fallbackBarcode = c.barcode || `AQUA-CCH-10${idx + 1}`;

          const newUser: AuthUser = {
            id: `usr-cch-${c.id.replace(/[^a-zA-Z0-9]/g, '') || Date.now()}`,
            name: c.name,
            username: candidate,
            password: 'coach123',
            email: c.email || `${candidate}@aquaflow.id`,
            role: 'pelatih',
            phone: c.phone,
            coachId: c.id,
            barcode: fallbackBarcode,
            avatarUrl: c.avatarUrl,
          };
          updatedUsers = [newUser, ...updatedUsers];
          newlyCreated.push(newUser);
        }
      });

      if (hasNew) {
        localStorage.setItem('AQUA_APP_USERS', JSON.stringify(updatedUsers));
        newlyCreated.forEach((u) => syncSaveUser(u));
        return updatedUsers;
      }
      return prevUsers;
    });
  }, [coaches]);

  // Delete coach
  const handleDeleteCoach = (coachId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data pelatih ini? Akun login pengguna terkait di Manajemen User juga akan dihapus.')) {
      const updated = coaches.filter((c) => c.id !== coachId);
      setCoaches(updated);
      localStorage.setItem('AQUA_COACHES', JSON.stringify(updated));
      syncDeleteCoach(coachId);

      // Hapus juga akun user terkait di Manajemen User & Cloud Firestore
      const usersToDelete = appUsers.filter((u) => u.coachId === coachId);
      usersToDelete.forEach((u) => syncDeleteUser(u.id));

      setAppUsers((prev) => {
        const updatedUsers = prev.filter((u) => u.coachId !== coachId);
        localStorage.setItem('AQUA_APP_USERS', JSON.stringify(updatedUsers));
        return updatedUsers;
      });
    }
  };

  // Update existing student
  const handleUpdateStudent = (updatedStudent: Student) => {
    const updated = students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
    setStudents(updated);
    localStorage.setItem('AQUA_STUDENTS', JSON.stringify(updated));
    syncSaveStudent(updatedStudent);

    // Sinkronisasi data ke Manajemen User & Cloud Firestore
    setAppUsers((prev) => {
      let matchedUser: AuthUser | null = null;
      const updatedUsers = prev.map((u) => {
        if (u.studentId === updatedStudent.id || (u.barcode && u.barcode === updatedStudent.barcode)) {
          matchedUser = {
            ...u,
            name: updatedStudent.name,
            role: updatedStudent.roleClass,
            phone: updatedStudent.phone,
            avatarUrl: updatedStudent.avatarUrl,
          };
          return matchedUser;
        }
        return u;
      });
      localStorage.setItem('AQUA_APP_USERS', JSON.stringify(updatedUsers));
      if (matchedUser) {
        syncSaveUser(matchedUser);
      }
      return updatedUsers;
    });

    // Sinkronisasi ke sesi aktif currentUser jika merupakan siswa ini
    if (
      currentUser &&
      (currentUser.studentId === updatedStudent.id ||
        (currentUser.barcode && currentUser.barcode === updatedStudent.barcode))
    ) {
      const updatedCurr = {
        ...currentUser,
        name: updatedStudent.name,
        role: updatedStudent.roleClass,
        phone: updatedStudent.phone,
        avatarUrl: updatedStudent.avatarUrl,
      };
      setCurrentUser(updatedCurr);
      try {
        localStorage.setItem('AQUA_AUTH_USER', JSON.stringify(updatedCurr));
      } catch (e) {}
    }
  };

  // Delete student
  const handleDeleteStudent = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus siswa ini dari akademi? Akun login pengguna terkait di Manajemen User juga akan dihapus.')) {
      const updated = students.filter((s) => s.id !== id);
      setStudents(updated);
      localStorage.setItem('AQUA_STUDENTS', JSON.stringify(updated));
      syncDeleteStudent(id);

      // Hapus juga akun user terkait di Manajemen User & Cloud Firestore
      const usersToDelete = appUsers.filter((u) => u.studentId === id);
      usersToDelete.forEach((u) => syncDeleteUser(u.id));

      setAppUsers((prev) => {
        const updatedUsers = prev.filter((u) => u.studentId !== id);
        localStorage.setItem('AQUA_APP_USERS', JSON.stringify(updatedUsers));
        return updatedUsers;
      });
    }
  };

  // Add new payment
  const handleAddPayment = (newPayment: PaymentRecord) => {
    const updated = [newPayment, ...payments];
    setPayments(updated);
    localStorage.setItem('AQUA_PAYMENTS', JSON.stringify(updated));
    syncSavePayment(newPayment);
  };

  // Update payment status (e.g. mark lunas)
  const handleUpdatePaymentStatus = (paymentId: string, newStatus: 'lunas' | 'menunggu' | 'jatuh_tempo') => {
    const updated = payments.map((p) => (p.id === paymentId ? { ...p, status: newStatus } : p));
    setPayments(updated);
    localStorage.setItem('AQUA_PAYMENTS', JSON.stringify(updated));
    const pUpdated = updated.find(p => p.id === paymentId);
    if (pUpdated) syncSavePayment(pUpdated);
  };

  // Verify uploaded transfer proof and recharge student sessions
  const handleVerifyPaymentProof = (paymentId: string) => {
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) return;

    const sessionsToAdd = payment.sessionsToAdd || 12;

    const updatedPayments: PaymentRecord[] = payments.map((p) =>
      p.id === paymentId
        ? {
            ...p,
            status: 'lunas' as const,
            verifiedAt: new Date().toISOString().split('T')[0],
            verifiedBy: currentUser?.name || 'Admin',
          }
        : p
    );
    setPayments(updatedPayments);
    localStorage.setItem('AQUA_PAYMENTS', JSON.stringify(updatedPayments));

    const updatedStudents = students.map((s) => {
      if (s.id === payment.studentId) {
        return {
          ...s,
          remainingQuota: (s.remainingQuota || 0) + sessionsToAdd,
          totalQuota: (s.totalQuota || 0) + sessionsToAdd,
        };
      }
      return s;
    });
    setStudents(updatedStudents);
    localStorage.setItem('AQUA_STUDENTS', JSON.stringify(updatedStudents));
    const pVer = updatedPayments.find(p => p.id === paymentId);
    if (pVer) syncSavePayment(pVer);
    const sVer = updatedStudents.find(s => s.id === payment.studentId);
    if (sVer) syncSaveStudent(sVer);
  };

  // Update payment details
  const handleUpdatePayment = (updatedPayment: PaymentRecord) => {
    const updated = payments.map((p) => (p.id === updatedPayment.id ? updatedPayment : p));
    setPayments(updated);
    localStorage.setItem('AQUA_PAYMENTS', JSON.stringify(updated));
    syncSavePayment(updatedPayment);
  };

  // Delete payment
  const handleDeletePayment = (paymentId: string) => {
    const updated = payments.filter((p) => p.id !== paymentId);
    setPayments(updated);
    localStorage.setItem('AQUA_PAYMENTS', JSON.stringify(updated));
    syncDeletePayment(paymentId);
  };

  // Add new app user
  const handleAddUser = (newUser: AuthUser) => {
    const updated = [newUser, ...appUsers];
    setAppUsers(updated);
    localStorage.setItem('AQUA_APP_USERS', JSON.stringify(updated));
    syncSaveUser(newUser);

    // Jika akun baru adalah pelatih, pastikan juga otomatis tercatat di data pelatih (coaches)
    if (newUser.role === 'pelatih') {
      const coachExists = coaches.some(
        (c) =>
          (newUser.coachId && c.id === newUser.coachId) ||
          (newUser.barcode && c.barcode === newUser.barcode) ||
          c.name.toLowerCase() === newUser.name.toLowerCase()
      );
      if (!coachExists) {
        let coachBarcode = newUser.barcode;
        if (!coachBarcode || !coachBarcode.trim()) {
          const existingNums = coaches
            .map((c) => {
              const m = c.barcode?.match(/AQUA-CCH-(\d+)/);
              return m ? parseInt(m[1], 10) : 0;
            })
            .filter((n) => n > 0);
          const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 101;
          coachBarcode = `AQUA-CCH-${nextNum}`;
        }

        const newCoach: Coach = {
          id: newUser.coachId || `cch-${Date.now().toString().slice(-5)}`,
          barcode: coachBarcode,
          name: newUser.name,
          specialty: 'Pelatih Renang Resmi (Semua Gaya Renang)',
          phone: newUser.phone || '08xxxxxxxxxx',
          email: newUser.email,
          avatarUrl: newUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          assignedClasses: ['dasar', 'pemula', 'prestasi', 'privat_4', 'privat_8', 'privat_12'],
          experienceYears: 3,
          certifications: ['Lisensi Pelatih Akuatik Nasional'],
        };
        const updatedCoaches = [newCoach, ...coaches];
        setCoaches(updatedCoaches);
        localStorage.setItem('AQUA_COACHES', JSON.stringify(updatedCoaches));
      }
    }
  };

  // Update app user
  const handleUpdateUser = (updatedUser: AuthUser) => {
    const updated = appUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    setAppUsers(updated);
    localStorage.setItem('AQUA_APP_USERS', JSON.stringify(updated));
    syncSaveUser(updatedUser);
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      localStorage.setItem('AQUA_AUTH_USER', JSON.stringify(updatedUser));
    }
    // Sync with coaches list if this user is a coach
    if (updatedUser.role === 'pelatih' || updatedUser.coachId) {
      let targetCoach: Coach | null = null;
      const updatedCoaches = coaches.map((c) => {
        if (
          (updatedUser.coachId && c.id === updatedUser.coachId) ||
          (updatedUser.barcode && c.barcode === updatedUser.barcode) ||
          c.name.toLowerCase() === updatedUser.name.toLowerCase()
        ) {
          targetCoach = {
            ...c,
            name: updatedUser.name,
            avatarUrl: updatedUser.avatarUrl,
            barcode: updatedUser.barcode || c.barcode,
            email: updatedUser.email || c.email,
            phone: updatedUser.phone || c.phone,
          };
          return targetCoach;
        }
        return c;
      });
      setCoaches(updatedCoaches);
      try {
        localStorage.setItem('AQUA_COACHES', JSON.stringify(updatedCoaches));
      } catch (e) {}
      if (targetCoach) {
        syncSaveCoach(targetCoach);
      }
    }

    // Sync with students list if this user is a student
    if (updatedUser.studentId || (updatedUser.barcode && updatedUser.barcode.startsWith('AQUA-STD'))) {
      let targetStudent: Student | null = null;
      const updatedStudents = students.map((s) => {
        if (
          (updatedUser.studentId && s.id === updatedUser.studentId) ||
          (updatedUser.barcode && s.barcode === updatedUser.barcode) ||
          s.name.toLowerCase() === updatedUser.name.toLowerCase()
        ) {
          targetStudent = {
            ...s,
            name: updatedUser.name,
            avatarUrl: updatedUser.avatarUrl,
            phone: updatedUser.phone || s.phone,
          };
          return targetStudent;
        }
        return s;
      });
      setStudents(updatedStudents);
      try {
        localStorage.setItem('AQUA_STUDENTS', JSON.stringify(updatedStudents));
      } catch (e) {}
      if (targetStudent) {
        syncSaveStudent(targetStudent);
      }
    }
  };

  // Avatar and Profile updates for all roles (Admin, Coaches, and Students)
  const handleUpdateAvatar = (newAvatarUrl: string) => {
    if (!currentUser) return;

    // 1. Update currentUser
    const updatedUser: AuthUser = { ...currentUser, avatarUrl: newAvatarUrl };
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('AQUA_AUTH_USER', JSON.stringify(updatedUser));
    } catch (e) {
      console.warn('Quota error saving AQUA_AUTH_USER:', e);
    }

    // 2. Update appUsers and PERSIST TO FIRESTORE
    let foundInAppUsers = false;
    const updatedUsers = appUsers.map((u) => {
      if (u.id === currentUser.id || (currentUser.barcode && u.barcode === currentUser.barcode)) {
        foundInAppUsers = true;
        return { ...u, avatarUrl: newAvatarUrl };
      }
      return u;
    });
    const finalUsers = foundInAppUsers ? updatedUsers : [updatedUser, ...updatedUsers];
    setAppUsers(finalUsers);
    try {
      localStorage.setItem('AQUA_APP_USERS', JSON.stringify(finalUsers));
    } catch (e) {
      console.warn('Quota error saving AQUA_APP_USERS:', e);
    }
    // SIMPAN KE CLOUD FIRESTORE AGAR PERSISTEN SETELAH LOGOUT & DI SEMUA PERANGKAT
    syncSaveUser(updatedUser);

    // 3. If coach, also sync coaches list and PERSIST TO FIRESTORE
    if (currentUser.role === 'pelatih' || currentUser.coachId) {
      let targetCoach: Coach | null = null;
      const updatedCoaches = coaches.map((c) => {
        if (
          (currentUser.coachId && c.id === currentUser.coachId) ||
          (currentUser.barcode && c.barcode === currentUser.barcode) ||
          c.name.toLowerCase() === currentUser.name.toLowerCase()
        ) {
          targetCoach = { ...c, avatarUrl: newAvatarUrl };
          return targetCoach;
        }
        return c;
      });
      setCoaches(updatedCoaches);
      try {
        localStorage.setItem('AQUA_COACHES', JSON.stringify(updatedCoaches));
      } catch (e) {}
      if (targetCoach) {
        syncSaveCoach(targetCoach);
      }
    }

    // 4. If student, also sync students list and PERSIST TO FIRESTORE
    if (currentUser.studentId || (currentUser.barcode && currentUser.barcode.startsWith('AQUA-STD'))) {
      let targetStudent: Student | null = null;
      const updatedStudents = students.map((s) => {
        if (
          (currentUser.studentId && s.id === currentUser.studentId) ||
          (currentUser.barcode && s.barcode === currentUser.barcode) ||
          s.name.toLowerCase() === currentUser.name.toLowerCase()
        ) {
          targetStudent = { ...s, avatarUrl: newAvatarUrl };
          return targetStudent;
        }
        return s;
      });
      setStudents(updatedStudents);
      try {
        localStorage.setItem('AQUA_STUDENTS', JSON.stringify(updatedStudents));
      } catch (e) {}
      if (targetStudent) {
        syncSaveStudent(targetStudent);
      }
    }
  };

  const handleUpdateCoachAvatar = (newAvatarUrl: string, coachId: string) => {
    // 1. Update coaches state and PERSIST TO FIRESTORE
    let targetCoach: Coach | null = null;
    const updatedCoaches = coaches.map((c) => {
      if (c.id === coachId) {
        targetCoach = { ...c, avatarUrl: newAvatarUrl };
        return targetCoach;
      }
      return c;
    });
    setCoaches(updatedCoaches);
    try {
      localStorage.setItem('AQUA_COACHES', JSON.stringify(updatedCoaches));
    } catch (e) {}
    if (targetCoach) {
      syncSaveCoach(targetCoach);
    }

    // 2. Update appUsers if coach has user account and PERSIST TO FIRESTORE
    let matchedUser: AuthUser | null = null;
    const updatedUsers = appUsers.map((u) => {
      if (
        u.coachId === coachId ||
        (targetCoach && (u.barcode === (targetCoach as Coach).barcode || u.name.toLowerCase() === (targetCoach as Coach).name.toLowerCase()))
      ) {
        matchedUser = { ...u, avatarUrl: newAvatarUrl };
        return matchedUser;
      }
      return u;
    });
    setAppUsers(updatedUsers);
    try {
      localStorage.setItem('AQUA_APP_USERS', JSON.stringify(updatedUsers));
    } catch (e) {}
    if (matchedUser) {
      syncSaveUser(matchedUser);
    }

    // 3. If active currentUser is this coach, update currentUser
    if (
      currentUser &&
      (currentUser.coachId === coachId ||
        (targetCoach && currentUser.name.toLowerCase() === (targetCoach as Coach).name.toLowerCase()))
    ) {
      const updatedUser = { ...currentUser, avatarUrl: newAvatarUrl };
      setCurrentUser(updatedUser);
      try {
        localStorage.setItem('AQUA_AUTH_USER', JSON.stringify(updatedUser));
      } catch (e) {}
    }
  };

  const handleUpdateCoach = (updatedCoach: Coach) => {
    const updated = coaches.map((c) => (c.id === updatedCoach.id ? updatedCoach : c));
    setCoaches(updated);
    try {
      localStorage.setItem('AQUA_COACHES', JSON.stringify(updated));
    } catch (e) {}
    syncSaveCoach(updatedCoach);

    // Also update appUsers if coach has user account & Cloud Firestore
    let matchedCoachUser: AuthUser | null = null;
    const updatedUsers = appUsers.map((u) => {
      if (
        u.coachId === updatedCoach.id ||
        (u.barcode && u.barcode === updatedCoach.barcode) ||
        u.name.toLowerCase() === updatedCoach.name.toLowerCase()
      ) {
        matchedCoachUser = {
          ...u,
          name: updatedCoach.name,
          avatarUrl: updatedCoach.avatarUrl,
          phone: updatedCoach.phone,
          email: updatedCoach.email || u.email,
          barcode: updatedCoach.barcode || u.barcode,
        };
        return matchedCoachUser;
      }
      return u;
    });
    setAppUsers(updatedUsers);
    try {
      localStorage.setItem('AQUA_APP_USERS', JSON.stringify(updatedUsers));
    } catch (e) {}
    if (matchedCoachUser) {
      syncSaveUser(matchedCoachUser);
    }

    // If currentUser is this coach
    if (
      currentUser &&
      (currentUser.coachId === updatedCoach.id ||
        currentUser.name.toLowerCase() === updatedCoach.name.toLowerCase())
    ) {
      const updatedCurr = {
        ...currentUser,
        name: updatedCoach.name,
        avatarUrl: updatedCoach.avatarUrl,
        phone: updatedCoach.phone,
        email: updatedCoach.email || currentUser.email,
        barcode: updatedCoach.barcode || currentUser.barcode,
      };
      setCurrentUser(updatedCurr);
      try {
        localStorage.setItem('AQUA_AUTH_USER', JSON.stringify(updatedCurr));
      } catch (e) {}
    }
  };

  // Delete app user
  const handleDeleteUser = (userId: string) => {
    const updated = appUsers.filter((u) => u.id !== userId);
    setAppUsers(updated);
    localStorage.setItem('AQUA_APP_USERS', JSON.stringify(updated));
    syncDeleteUser(userId);
  };

  // Pricing Package Handlers
  const handleUpdatePricingPackage = (updatedPkg: ClassPricingPackage) => {
    const updated = pricingPackages.map((p) => (p.id === updatedPkg.id ? updatedPkg : p));
    setPricingPackages(updated);
    localStorage.setItem('AQUA_PRICING_PACKAGES', JSON.stringify(updated));
    syncSavePricingPackage(updatedPkg);
  };

  const handleAddPricingPackage = (newPkg: ClassPricingPackage) => {
    const updated = [newPkg, ...pricingPackages];
    setPricingPackages(updated);
    localStorage.setItem('AQUA_PRICING_PACKAGES', JSON.stringify(updated));
    syncSavePricingPackage(newPkg);
  };

  const handleDeletePricingPackage = (pkgId: string) => {
    const updated = pricingPackages.filter((p) => p.id !== pkgId);
    setPricingPackages(updated);
    localStorage.setItem('AQUA_PRICING_PACKAGES', JSON.stringify(updated));
    syncDeletePricingPackage(pkgId);
  };

  // Handler to approve online registration and automatically generate a Student record & login account
  const handleApproveAndCreateStudent = (
    reg: StudentRegistration,
    targetClass: UserRole,
    initialQuota: number
  ) => {
    const codeMap: Record<string, string> = {
      dasar: 'DSR',
      pemula: 'PML',
      prestasi: 'PRS',
      privat_4: 'PV4',
      privat_8: 'PV8',
      privat_12: 'PV12',
    };
    const code = codeMap[targetClass] || 'REN';
    const randNum = 100 + Math.floor(Math.random() * 899);
    const newBarcode = `AQUA-${code}-${randNum}`;
    const newStudentId = `std-${code.toLowerCase()}-${Date.now().toString().slice(-4)}`;

    const newStudent: Student = {
      id: newStudentId,
      barcode: newBarcode,
      name: reg.fullName,
      gender: reg.gender,
      age: reg.age,
      birthDate: reg.birthDate,
      roleClass: targetClass,
      phone: reg.phone,
      parentName: reg.parentName,
      emergencyContact: reg.phone,
      joinedDate: new Date().toISOString().split('T')[0],
      status: 'active',
      remainingQuota: initialQuota,
      totalQuota: initialQuota,
      assignedCoachId: coaches[0]?.id || 'c1',
      avatarUrl:
        reg.gender === 'Perempuan'
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      notes: reg.notes || `Pendaftaran online resmi: ${reg.id}`,
    };

    const updatedStudents = [newStudent, ...students];
    setStudents(updatedStudents);
    localStorage.setItem('AQUA_STUDENTS', JSON.stringify(updatedStudents));
    syncSaveStudent(newStudent);

    // Create user login credentials
    const baseUsername = (reg.nickname || reg.fullName.split(' ')[0])
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    const cleanUsername = `${baseUsername || 'siswa'}${Math.floor(10 + Math.random() * 89)}`;

    const newUser: AuthUser = {
      id: `usr-std-${newStudent.id.replace(/[^a-zA-Z0-9]/g, '')}`,
      name: reg.fullName,
      username: cleanUsername,
      password: 'siswa123',
      email: `${cleanUsername}@aquaflow.id`,
      role: targetClass,
      avatarUrl: newStudent.avatarUrl,
      phone: reg.phone,
      studentId: newStudent.id,
      barcode: newStudent.barcode,
    };

    const updatedUsers = [newUser, ...appUsers];
    setAppUsers(updatedUsers);
    localStorage.setItem('AQUA_APP_USERS', JSON.stringify(updatedUsers));
    syncSaveUser(newUser);

    // Mark registration as approved
    const updatedRegs = registrations.map((r) =>
      r.id === reg.id ? { ...r, status: 'approved' as const } : r
    );
    setRegistrations(updatedRegs);
    localStorage.setItem('AQUA_REGISTRATIONS', JSON.stringify(updatedRegs));
    const targetApprovedReg = updatedRegs.find((r) => r.id === reg.id);
    if (targetApprovedReg) {
      syncSaveRegistration(targetApprovedReg);
    }

    alert(
      `Pendaftaran ${reg.fullName} berhasil disetujui!\n\n` +
      `- NIS / Barcode: ${newBarcode}\n` +
      `- Username Login: ${cleanUsername}\n` +
      `- Password Default: siswa123\n` +
      `- Kelas: ${targetClass.toUpperCase()}\n` +
      `- Kuota Sesi: ${initialQuota} Pertemuan\n\n` +
      `Siswa sekarang dapat login menggunakan username atau scan barcode!`
    );
  };

  // If not logged in, render Public Profile or dedicated Login Page!
  if (!currentUser) {
    if (preLoginView === 'profile') {
      return (
        <PublicProfilePage
          academyProfile={academyProfile}
          pricingPackages={pricingPackages}
          coaches={coaches}
          schedules={schedules}
          onOpenLogin={() => setPreLoginView('login')}
          onRegisterSubmit={handleAddRegistration}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          galleryItems={galleryItems}
        />
      );
    }

    return (
      <LoginPage
        students={students}
        coaches={coaches}
        appUsers={appUsers}
        onLoginSuccess={handleLoginSuccess}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        academyProfile={academyProfile}
        onBackToProfile={() => setPreLoginView('profile')}
        isCloudSynced={isCloudSynced}
      />
    );
  }

  // Render the specific dashboard for the active role
  const renderDashboardContent = () => {
    // If coach clicked Swim Pass from sidebar, show Swim Pass management
    if (activeView === 'barcode' && currentRole === 'pelatih') {
      const displayStudent = currentStudent || students.find((s) => s.id === selectedStudentId) || students[0];
      return (
        <div className="flex flex-col items-center justify-center py-6 px-4 max-w-4xl mx-auto w-full">
          <div className="w-full text-center mb-6">
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold">
              KARTU PRESENSI RESMI
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
              Kartu Swim Pass Digital & Barcode
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Barcode unik untuk setiap siswa guna mempermudah absensi kehadiran di tepi kolam renang.
            </p>
          </div>

          {students.length > 1 && (
            <div className="mb-6 flex flex-wrap items-center justify-center gap-2 max-w-2xl">
              <span className="text-xs font-bold text-slate-400">Pilih Siswa:</span>
              {students.map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStudentId(st.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    displayStudent?.id === st.id
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-cyan-500'
                  }`}
                >
                  {st.name} ({st.barcode})
                </button>
              ))}
            </div>
          )}

          {displayStudent && (
            <div className="max-w-md w-full">
              <BarcodeCard student={displayStudent} standalone={true} />
            </div>
          )}
        </div>
      );
    }

    switch (currentRole) {
      case 'admin':
        return (
          <AdminDashboard
            students={students}
            attendances={attendances}
            schedules={schedules}
            payments={payments}
            revenueTrend={INITIAL_REVENUE_TREND}
            appUsers={appUsers}
            pricingPackages={pricingPackages}
            onUpdatePricingPackage={handleUpdatePricingPackage}
            onAddPricingPackage={handleAddPricingPackage}
            onDeletePricingPackage={handleDeletePricingPackage}
            coaches={coaches}
            onAddCoach={handleAddCoach}
            onDeleteCoach={handleDeleteCoach}
            activeTab={activeView as any}
            onTabChange={(tab) => setActiveView(tab)}
            onOpenScanner={() => setIsScannerOpen(true)}
            onOpenSheets={() => setIsSheetsOpen(true)}
            onViewBarcode={(item) => setBarcodeCardModal(item)}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            onAddPayment={handleAddPayment}
            onUpdatePayment={handleUpdatePayment}
            onDeletePayment={handleDeletePayment}
            onUpdatePaymentStatus={handleUpdatePaymentStatus}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onAddAttendance={(rec) => handleAttendanceRecorded(rec)}
            onUpdateAttendance={handleUpdateAttendance}
            onDeleteAttendance={handleDeleteAttendance}
            onUpdateTotalAttendance={handleUpdateTotalAttendance}
            onResetStudentAttendance={handleResetStudentAttendance}
            academyProfile={academyProfile}
            onUpdateAcademyProfile={handleUpdateAcademyProfile}
            registrations={registrations}
            onUpdateRegistration={handleUpdateRegistration}
            onDeleteRegistration={handleDeleteRegistration}
            onApproveAndCreateStudent={handleApproveAndCreateStudent}
            onViewPublicLanding={() => {
              handleLogout();
              setPreLoginView('profile');
            }}
            galleryItems={galleryItems}
            onAddGalleryItem={handleAddGalleryItem}
            onDeleteGalleryItem={handleDeleteGalleryItem}
            currentUser={currentUser}
            onUpdateAvatar={handleUpdateAvatar}
            onVerifyPaymentProof={handleVerifyPaymentProof}
            bankAccounts={bankAccounts}
            onAddBankAccount={handleAddBankAccount}
            onUpdateBankAccount={handleUpdateBankAccount}
            onDeleteBankAccount={handleDeleteBankAccount}
          />
        );

      case 'pelatih':
        return (
          <CoachDashboard
            students={students}
            attendances={attendances}
            schedules={schedules}
            coaches={coaches}
            pricingPackages={pricingPackages}
            activeCoachId={currentUser?.coachId || 'c1'}
            activeTab={activeView}
            onTabChange={(tab) => setActiveView(tab)}
            currentUser={currentUser}
            onOpenScanner={() => setIsScannerOpen(true)}
            onViewBarcode={(st) => setBarcodeCardModal(st)}
            onViewCoachBarcode={(cch) => setBarcodeCardModal(cch)}
            onUpdateCoachAvatar={handleUpdateCoachAvatar}
            onUpdateCoach={handleUpdateCoach}
          />
        );

      // Student roles: Dasar, Pemula, Prestasi, Privat
      case 'dasar':
      case 'pemula':
      case 'prestasi':
      case 'privat_4':
      case 'privat_8':
      case 'privat_12':
      default:
        return (
          <StudentDashboard
            student={currentStudent}
            attendances={attendances.filter((a) => a.studentId === currentStudent?.id)}
            payments={payments.filter((p) => p.studentId === currentStudent?.id)}
            schedules={schedules}
            coaches={coaches}
            pricingPackages={pricingPackages}
            academyProfile={academyProfile}
            bankAccounts={bankAccounts}
            activeTab={activeView === 'barcode' ? 'card' : activeView}
            onTabChange={(tab) => setActiveView(tab)}
            onUpdateStudent={handleUpdateStudent}
            onUpdateAvatar={handleUpdateAvatar}
            onUploadPaymentProof={handleAddPayment}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased selection:bg-cyan-500 selection:text-white transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        currentRole={currentRole}
        onSelectRole={handleSelectRole}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={handleToggleSidebar}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenSheets={() => setIsSheetsOpen(true)}
        activeView={activeView}
        setActiveView={setActiveView}
        currentStudent={currentStudent}
        currentUser={currentUser}
        onLogout={handleLogout}
        pendingRegistrationsCount={registrations.filter((r) => r.status === 'pending').length}
      />

      {/* Main App Content Area */}
      <div
        className={`${
          isSidebarOpen ? 'lg:pl-72' : 'lg:pl-20'
        } flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out`}
      >
        {/* Top Navbar */}
        <Navbar
          currentRole={currentRole}
          onSelectRole={handleSelectRole}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={handleToggleSidebar}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenScanner={() => setIsScannerOpen(true)}
          onOpenSheets={() => setIsSheetsOpen(true)}
          studentsInRole={studentsInCurrentRole}
          currentStudent={currentStudent}
          onSelectStudent={(st) => setSelectedStudentId(st.id)}
          onViewBarcode={(st) => setBarcodeCardModal(st)}
          onViewUserBarcode={(usr) => setBarcodeCardModal(usr)}
          onUpdateAvatar={handleUpdateAvatar}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderDashboardContent()}
        </main>

        {/* Global Footer Atas Nama Yohes */}
        <AppFooter academyProfile={academyProfile} variant="full" />
      </div>

      {/* Poolside Barcode Scanner Modal (Hanya Admin dan Pelatih untuk Absen) */}
      {(currentRole === 'admin' || currentRole === 'pelatih') && (
        <BarcodeScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          students={students}
          attendances={attendances}
          onAttendanceRecorded={handleAttendanceRecorded}
          activeCoachName="Coach Hendra Gunawan"
          activeCoachId="c1"
        />
      )}

      {/* Google Sheets & 00:00 AutoSave Integration Modal */}
      <GoogleSheetsModal
        isOpen={isSheetsOpen}
        onClose={() => setIsSheetsOpen(false)}
        students={students}
        attendances={attendances}
      />

      {/* Floating 00:00 Auto-Save Notification Toast */}
      {autoSaveToast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md w-full p-4 rounded-2xl bg-slate-900/95 text-white border border-cyan-500/40 shadow-2xl backdrop-blur-md animate-fadeIn flex items-start gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0 mt-0.5">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simpan Otomatis 00:00 Berhasil</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{autoSaveToast.date}</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">{autoSaveToast.text}</p>
          </div>
          <button
            onClick={() => setAutoSaveToast(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Swim / Staff Pass Barcode Modal Preview */}
      {barcodeCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative max-w-md w-full bg-transparent flex flex-col items-center">
            <BarcodeCard
              cardData={barcodeCardModal}
              student={
                barcodeCardModal.roleClass &&
                barcodeCardModal.roleClass !== 'admin' &&
                barcodeCardModal.roleClass !== 'pelatih' &&
                barcodeCardModal.parentName
                  ? barcodeCardModal
                  : undefined
              }
              coach={
                barcodeCardModal.specialty || barcodeCardModal.role === 'pelatih'
                  ? barcodeCardModal
                  : undefined
              }
              user={barcodeCardModal.username ? barcodeCardModal : undefined}
              onClose={() => setBarcodeCardModal(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
