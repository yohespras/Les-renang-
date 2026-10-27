import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
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
  INITIAL_APP_USERS,
  INITIAL_PRICING_PACKAGES,
  DEFAULT_ACADEMY_PROFILE,
  OFFICIAL_BANK_ACCOUNTS,
} from '../data/mockData';

/**
 * Remove undefined properties from objects before saving to Firestore,
 * preventing Firestore runtime serialization exceptions.
 */
export function cleanDataForFirestore<T>(data: T): T {
  if (data === null || data === undefined) return data;
  if (Array.isArray(data)) {
    return data.map(cleanDataForFirestore) as unknown as T;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        cleaned[key] = cleanDataForFirestore(value);
      }
    }
    return cleaned as T;
  }
  return data;
}

// -------------------------------------------------------------
// 1. Generic Firestore Helpers with Error Tracking
// -------------------------------------------------------------

export async function upsertFirestoreDoc<T extends { id: string }>(
  collectionName: string,
  item: T
): Promise<void> {
  const path = `${collectionName}/${item.id}`;
  try {
    const docRef = doc(db, collectionName, item.id);
    const cleaned = cleanDataForFirestore(item);
    await setDoc(docRef, cleaned, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteFirestoreDoc(
  collectionName: string,
  id: string
): Promise<void> {
  const path = `${collectionName}/${id}`;
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export function subscribeFirestoreCollection<T extends { id: string }>(
  collectionName: string,
  onUpdate: (items: T[]) => void
): Unsubscribe {
  const colRef = collection(db, collectionName);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: T[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as T);
      });
      onUpdate(items);
    },
    (err) => {
      console.warn(`[Firestore] Subscription note for ${collectionName}:`, err.message);
      handleFirestoreError(err, OperationType.GET, collectionName);
    }
  );
}

// -------------------------------------------------------------
// 2. Specific Collection Listeners and Mutations
// -------------------------------------------------------------

// USERS
export function subscribeUsers(onUpdate: (users: AuthUser[]) => void): Unsubscribe {
  return subscribeFirestoreCollection<AuthUser>('users', (users) => {
    // If empty on first connection, seed initial admin
    if (users.length === 0) {
      seedInitialUsers();
    } else {
      onUpdate(users);
    }
  });
}

export async function saveUserToFirestore(user: AuthUser): Promise<void> {
  await upsertFirestoreDoc('users', user);
}

export async function deleteUserFromFirestore(id: string): Promise<void> {
  await deleteFirestoreDoc('users', id);
}

export async function seedInitialUsers(): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const u of INITIAL_APP_USERS) {
      const docRef = doc(db, 'users', u.id);
      batch.set(docRef, cleanDataForFirestore(u), { merge: true });
    }
    await batch.commit();
  } catch (e) {
    console.error('Error seeding initial users:', e);
  }
}

// STUDENTS
export function subscribeStudents(onUpdate: (students: Student[]) => void): Unsubscribe {
  return subscribeFirestoreCollection<Student>('students', onUpdate);
}

export async function saveStudentToFirestore(student: Student): Promise<void> {
  await upsertFirestoreDoc('students', student);
}

export async function deleteStudentFromFirestore(id: string): Promise<void> {
  await deleteFirestoreDoc('students', id);
}

// COACHES
export function subscribeCoaches(onUpdate: (coaches: Coach[]) => void): Unsubscribe {
  return subscribeFirestoreCollection<Coach>('coaches', onUpdate);
}

export async function saveCoachToFirestore(coach: Coach): Promise<void> {
  await upsertFirestoreDoc('coaches', coach);
}

export async function deleteCoachFromFirestore(id: string): Promise<void> {
  await deleteFirestoreDoc('coaches', id);
}

// ATTENDANCES
export function subscribeAttendances(onUpdate: (records: AttendanceRecord[]) => void): Unsubscribe {
  return subscribeFirestoreCollection<AttendanceRecord>('attendances', (records) => {
    // Sort latest first
    const sorted = [...records].sort((a, b) => {
      const d1 = `${a.dateStr} ${a.timeStr}`;
      const d2 = `${b.dateStr} ${b.timeStr}`;
      return d2.localeCompare(d1);
    });
    onUpdate(sorted);
  });
}

export async function saveAttendanceToFirestore(record: AttendanceRecord): Promise<void> {
  await upsertFirestoreDoc('attendances', record);
}

export async function deleteAttendanceFromFirestore(id: string): Promise<void> {
  await deleteFirestoreDoc('attendances', id);
}

// PAYMENTS
export function subscribePayments(onUpdate: (payments: PaymentRecord[]) => void): Unsubscribe {
  return subscribeFirestoreCollection<PaymentRecord>('payments', (payments) => {
    const sorted = [...payments].sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));
    onUpdate(sorted);
  });
}

export async function savePaymentToFirestore(payment: PaymentRecord): Promise<void> {
  await upsertFirestoreDoc('payments', payment);
}

export async function deletePaymentFromFirestore(id: string): Promise<void> {
  await deleteFirestoreDoc('payments', id);
}

// BANK ACCOUNTS
export function subscribeBankAccounts(onUpdate: (accounts: BankAccountInfo[]) => void): Unsubscribe {
  return subscribeFirestoreCollection<BankAccountInfo>('bankAccounts', (accs) => {
    if (accs.length === 0) {
      seedInitialBankAccounts();
    } else {
      onUpdate(accs);
    }
  });
}

export async function saveBankAccountToFirestore(bank: BankAccountInfo): Promise<void> {
  await upsertFirestoreDoc('bankAccounts', bank);
}

export async function deleteBankAccountFromFirestore(id: string): Promise<void> {
  await deleteFirestoreDoc('bankAccounts', id);
}

export async function seedInitialBankAccounts(): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const b of OFFICIAL_BANK_ACCOUNTS) {
      const docRef = doc(db, 'bankAccounts', b.id);
      batch.set(docRef, cleanDataForFirestore(b), { merge: true });
    }
    await batch.commit();
  } catch (e) {
    console.error('Error seeding bank accounts:', e);
  }
}

// REGISTRATIONS
export function subscribeRegistrations(onUpdate: (regs: StudentRegistration[]) => void): Unsubscribe {
  return subscribeFirestoreCollection<StudentRegistration>('registrations', onUpdate);
}

export async function saveRegistrationToFirestore(reg: StudentRegistration): Promise<void> {
  await upsertFirestoreDoc('registrations', reg);
}

export async function deleteRegistrationFromFirestore(id: string): Promise<void> {
  await deleteFirestoreDoc('registrations', id);
}

// PRICING PACKAGES
export function subscribePricingPackages(onUpdate: (pkgs: ClassPricingPackage[]) => void): Unsubscribe {
  return subscribeFirestoreCollection<ClassPricingPackage>('pricingPackages', (pkgs) => {
    if (pkgs.length === 0) {
      seedInitialPricingPackages();
    } else {
      onUpdate(pkgs);
    }
  });
}

export async function savePricingPackageToFirestore(pkg: ClassPricingPackage): Promise<void> {
  await upsertFirestoreDoc('pricingPackages', pkg);
}

export async function deletePricingPackageFromFirestore(id: string): Promise<void> {
  await deleteFirestoreDoc('pricingPackages', id);
}

export async function seedInitialPricingPackages(): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const p of INITIAL_PRICING_PACKAGES) {
      const docRef = doc(db, 'pricingPackages', p.id);
      batch.set(docRef, cleanDataForFirestore(p), { merge: true });
    }
    await batch.commit();
  } catch (e) {
    console.error('Error seeding pricing packages:', e);
  }
}

// ACADEMY PROFILE
export function subscribeAcademyProfile(onUpdate: (profile: AcademyProfile) => void): Unsubscribe {
  const docRef = doc(db, 'academyProfile', 'main');
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as AcademyProfile);
      } else {
        saveAcademyProfileToFirestore(DEFAULT_ACADEMY_PROFILE);
        onUpdate(DEFAULT_ACADEMY_PROFILE);
      }
    },
    (err) => {
      console.warn('[Firestore] Profile subscription note:', err.message);
      handleFirestoreError(err, OperationType.GET, 'academyProfile/main');
    }
  );
}

export async function saveAcademyProfileToFirestore(profile: AcademyProfile): Promise<void> {
  try {
    const docRef = doc(db, 'academyProfile', 'main');
    await setDoc(docRef, cleanDataForFirestore(profile), { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'academyProfile/main');
  }
}

// GALLERY ITEMS
export function subscribeGalleryItems(onUpdate: (items: GalleryItem[]) => void): Unsubscribe {
  return subscribeFirestoreCollection<GalleryItem>('galleryItems', onUpdate);
}

export async function saveGalleryItemToFirestore(item: GalleryItem): Promise<void> {
  await upsertFirestoreDoc('galleryItems', item);
}

export async function deleteGalleryItemFromFirestore(id: string): Promise<void> {
  await deleteFirestoreDoc('galleryItems', id);
}


/**
 * Automatically syncs local data to Firestore if the Firestore database is newly provisioned/empty.
 * This guarantees that newly created students, coaches, attendances, and accounts from the current device
 * are immediately stored in the cloud for all mobile devices and tablets to read.
 */
export async function syncInitialLocalDataToFirestore(
  localUsers: AuthUser[],
  localStudents: Student[],
  localCoaches: Coach[],
  localAttendances: AttendanceRecord[],
  localPayments: PaymentRecord[],
  localProfile: AcademyProfile,
  localBanks: BankAccountInfo[]
): Promise<void> {
  try {
    // 1. Users
    const usersSnap = await getDocs(collection(db, 'users'));
    if (usersSnap.empty && localUsers.length > 0) {
      const batch = writeBatch(db);
      for (const u of localUsers) {
        batch.set(doc(db, 'users', u.id), cleanDataForFirestore(u), { merge: true });
      }
      await batch.commit();
    }

    // 2. Students
    const studentsSnap = await getDocs(collection(db, 'students'));
    if (studentsSnap.empty && localStudents.length > 0) {
      const batch = writeBatch(db);
      for (const s of localStudents) {
        batch.set(doc(db, 'students', s.id), cleanDataForFirestore(s), { merge: true });
      }
      await batch.commit();
    }

    // 3. Coaches
    const coachesSnap = await getDocs(collection(db, 'coaches'));
    if (coachesSnap.empty && localCoaches.length > 0) {
      const batch = writeBatch(db);
      for (const c of localCoaches) {
        batch.set(doc(db, 'coaches', c.id), cleanDataForFirestore(c), { merge: true });
      }
      await batch.commit();
    }

    // 4. Attendances
    const attendancesSnap = await getDocs(collection(db, 'attendances'));
    if (attendancesSnap.empty && localAttendances.length > 0) {
      const batch = writeBatch(db);
      for (const a of localAttendances) {
        batch.set(doc(db, 'attendances', a.id), cleanDataForFirestore(a), { merge: true });
      }
      await batch.commit();
    }

    // 5. Payments
    const paymentsSnap = await getDocs(collection(db, 'payments'));
    if (paymentsSnap.empty && localPayments.length > 0) {
      const batch = writeBatch(db);
      for (const p of localPayments) {
        batch.set(doc(db, 'payments', p.id), cleanDataForFirestore(p), { merge: true });
      }
      await batch.commit();
    }

    // 6. Bank Accounts
    const banksSnap = await getDocs(collection(db, 'bankAccounts'));
    if (banksSnap.empty && localBanks.length > 0) {
      const batch = writeBatch(db);
      for (const b of localBanks) {
        batch.set(doc(db, 'bankAccounts', b.id), cleanDataForFirestore(b), { merge: true });
      }
      await batch.commit();
    }
  } catch (err) {
    console.warn('[Firestore] Sync local to cloud initial check notice:', err);
  }
}
