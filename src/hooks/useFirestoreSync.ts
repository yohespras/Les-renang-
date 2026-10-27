import { useState, useEffect, useRef } from 'react';
import {
  AuthUser,
  Student,
  Coach,
  AttendanceRecord,
  PaymentRecord,
  AcademyProfile,
  BankAccountInfo,
  StudentRegistration,
  ClassPricingPackage,
  GalleryItem,
} from '../types';
import {
  subscribeUsers,
  saveUserToFirestore,
  deleteUserFromFirestore,
  subscribeStudents,
  saveStudentToFirestore,
  deleteStudentFromFirestore,
  subscribeCoaches,
  saveCoachToFirestore,
  deleteCoachFromFirestore,
  subscribeAttendances,
  saveAttendanceToFirestore,
  deleteAttendanceFromFirestore,
  subscribePayments,
  savePaymentToFirestore,
  deletePaymentFromFirestore,
  subscribeBankAccounts,
  saveBankAccountToFirestore,
  deleteBankAccountFromFirestore,
  subscribeRegistrations,
  saveRegistrationToFirestore,
  deleteRegistrationFromFirestore,
  subscribePricingPackages,
  savePricingPackageToFirestore,
  deletePricingPackageFromFirestore,
  subscribeAcademyProfile,
  saveAcademyProfileToFirestore,
  subscribeGalleryItems,
  saveGalleryItemToFirestore,
  deleteGalleryItemFromFirestore,
  syncInitialLocalDataToFirestore,
} from '../services/firestoreSync';

interface UseFirestoreSyncProps {
  appUsers: AuthUser[];
  setAppUsers: React.Dispatch<React.SetStateAction<AuthUser[]>>;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  coaches: Coach[];
  setCoaches: React.Dispatch<React.SetStateAction<Coach[]>>;
  attendances: AttendanceRecord[];
  setAttendances: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  payments: PaymentRecord[];
  setPayments: React.Dispatch<React.SetStateAction<PaymentRecord[]>>;
  pricingPackages: ClassPricingPackage[];
  setPricingPackages: React.Dispatch<React.SetStateAction<ClassPricingPackage[]>>;
  bankAccounts: BankAccountInfo[];
  setBankAccounts: React.Dispatch<React.SetStateAction<BankAccountInfo[]>>;
  registrations: StudentRegistration[];
  setRegistrations: React.Dispatch<React.SetStateAction<StudentRegistration[]>>;
  galleryItems: GalleryItem[];
  setGalleryItems: React.Dispatch<React.SetStateAction<GalleryItem[]>>;
  academyProfile: AcademyProfile;
  setAcademyProfile: React.Dispatch<React.SetStateAction<AcademyProfile>>;
}

export function useFirestoreSync({
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
}: UseFirestoreSyncProps) {
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [syncCount, setSyncCount] = useState<number>(0);
  const initialMigrationDone = useRef(false);

  const appUsersRef = useRef(appUsers);
  appUsersRef.current = appUsers;
  const studentsRef = useRef(students);
  studentsRef.current = students;
  const coachesRef = useRef(coaches);
  coachesRef.current = coaches;
  const attendancesRef = useRef(attendances);
  attendancesRef.current = attendances;
  const paymentsRef = useRef(payments);
  paymentsRef.current = payments;
  const academyProfileRef = useRef(academyProfile);
  academyProfileRef.current = academyProfile;
  const bankAccountsRef = useRef(bankAccounts);
  bankAccountsRef.current = bankAccounts;

  useEffect(() => {
    if (!initialMigrationDone.current) {
      initialMigrationDone.current = true;
      syncInitialLocalDataToFirestore(
        appUsersRef.current,
        studentsRef.current,
        coachesRef.current,
        attendancesRef.current,
        paymentsRef.current,
        academyProfileRef.current,
        bankAccountsRef.current
      ).catch((e) => console.warn('Initial cloud migration notice:', e));
    }

    const unsubUsers = subscribeUsers((remoteUsers) => {
      if (remoteUsers && remoteUsers.length > 0) {
        setAppUsers(remoteUsers);
        localStorage.setItem('AQUA_APP_USERS', JSON.stringify(remoteUsers));
        setIsCloudSynced(true);
        setSyncCount((prev) => prev + 1);
      }
    });

    const unsubStudents = subscribeStudents((remoteStudents) => {
      setStudents(remoteStudents);
      localStorage.setItem('AQUA_STUDENTS', JSON.stringify(remoteStudents));
      setIsCloudSynced(true);
      setSyncCount((prev) => prev + 1);
    });

    const unsubCoaches = subscribeCoaches((remoteCoaches) => {
      setCoaches(remoteCoaches);
      localStorage.setItem('AQUA_COACHES', JSON.stringify(remoteCoaches));
      setIsCloudSynced(true);
      setSyncCount((prev) => prev + 1);
    });

    const unsubAttendances = subscribeAttendances((remoteAttendances) => {
      setAttendances(remoteAttendances);
      localStorage.setItem('AQUA_ATTENDANCES', JSON.stringify(remoteAttendances));
      setIsCloudSynced(true);
      setSyncCount((prev) => prev + 1);
    });

    const unsubPayments = subscribePayments((remotePayments) => {
      setPayments(remotePayments);
      localStorage.setItem('AQUA_PAYMENTS', JSON.stringify(remotePayments));
      setIsCloudSynced(true);
      setSyncCount((prev) => prev + 1);
    });

    const unsubProfile = subscribeAcademyProfile((remoteProfile) => {
      setAcademyProfile(remoteProfile);
      localStorage.setItem('AQUA_ACADEMY_PROFILE', JSON.stringify(remoteProfile));
      setIsCloudSynced(true);
      setSyncCount((prev) => prev + 1);
    });

    const unsubBanks = subscribeBankAccounts((remoteBanks) => {
      setBankAccounts(remoteBanks);
      localStorage.setItem('AQUA_BANK_ACCOUNTS', JSON.stringify(remoteBanks));
      setIsCloudSynced(true);
      setSyncCount((prev) => prev + 1);
    });

    const unsubRegs = subscribeRegistrations((remoteRegs) => {
      setRegistrations(remoteRegs);
      localStorage.setItem('AQUA_REGISTRATIONS', JSON.stringify(remoteRegs));
      setIsCloudSynced(true);
      setSyncCount((prev) => prev + 1);
    });

    const unsubPricing = subscribePricingPackages((remotePkgs) => {
      setPricingPackages(remotePkgs);
      localStorage.setItem('AQUA_PRICING_PACKAGES', JSON.stringify(remotePkgs));
      setIsCloudSynced(true);
      setSyncCount((prev) => prev + 1);
    });

    const unsubGallery = subscribeGalleryItems((remoteGallery) => {
      setGalleryItems(remoteGallery);
      localStorage.setItem('AQUA_GALLERY_ITEMS', JSON.stringify(remoteGallery));
      setIsCloudSynced(true);
      setSyncCount((prev) => prev + 1);
    });

    return () => {
      unsubUsers();
      unsubStudents();
      unsubCoaches();
      unsubAttendances();
      unsubPayments();
      unsubProfile();
      unsubBanks();
      unsubRegs();
      unsubPricing();
      unsubGallery();
    };
  }, [
    setAppUsers,
    setStudents,
    setCoaches,
    setAttendances,
    setPayments,
    setAcademyProfile,
    setBankAccounts,
    setRegistrations,
    setPricingPackages,
    setGalleryItems,
  ]);

  const syncSaveUser = (user: AuthUser) => saveUserToFirestore(user).catch(console.error);
  const syncDeleteUser = (id: string) => deleteUserFromFirestore(id).catch(console.error);

  const syncSaveStudent = (student: Student) => saveStudentToFirestore(student).catch(console.error);
  const syncDeleteStudent = (id: string) => deleteStudentFromFirestore(id).catch(console.error);

  const syncSaveCoach = (coach: Coach) => saveCoachToFirestore(coach).catch(console.error);
  const syncDeleteCoach = (id: string) => deleteCoachFromFirestore(id).catch(console.error);

  const syncSaveAttendance = (record: AttendanceRecord) => saveAttendanceToFirestore(record).catch(console.error);
  const syncDeleteAttendance = (id: string) => deleteAttendanceFromFirestore(id).catch(console.error);

  const syncSavePayment = (payment: PaymentRecord) => savePaymentToFirestore(payment).catch(console.error);
  const syncDeletePayment = (id: string) => deletePaymentFromFirestore(id).catch(console.error);

  const syncSaveBankAccount = (bank: BankAccountInfo) => saveBankAccountToFirestore(bank).catch(console.error);
  const syncDeleteBankAccount = (id: string) => deleteBankAccountFromFirestore(id).catch(console.error);

  const syncSaveRegistration = (reg: StudentRegistration) => saveRegistrationToFirestore(reg).catch(console.error);
  const syncDeleteRegistration = (id: string) => deleteRegistrationFromFirestore(id).catch(console.error);

  const syncSavePricingPackage = (pkg: ClassPricingPackage) => savePricingPackageToFirestore(pkg).catch(console.error);
  const syncDeletePricingPackage = (id: string) => deletePricingPackageFromFirestore(id).catch(console.error);

  const syncSaveAcademyProfile = (profile: AcademyProfile) => saveAcademyProfileToFirestore(profile).catch(console.error);

  const syncSaveGalleryItem = (item: GalleryItem) => saveGalleryItemToFirestore(item).catch(console.error);
  const syncDeleteGalleryItem = (id: string) => deleteGalleryItemFromFirestore(id).catch(console.error);

  return {
    isCloudSynced,
    syncCount,
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
  };
}
