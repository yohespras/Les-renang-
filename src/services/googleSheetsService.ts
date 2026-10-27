import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Student, AttendanceRecord } from '../types';
import { maskPhone } from './privacyUtils';

// Initialize Firebase App once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));

// In-memory token cache (CRITICAL: Do NOT store in localStorage/sessionStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal memperoleh token akses dari Google Auth. Pastikan pop-up diizinkan.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google Sign-In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

/**
 * Extracts raw Google Sheet ID even if the user pastes a full browser URL
 * e.g. https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing
 */
export function extractSpreadsheetId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

/**
 * Ensures required sheet tabs exist in the target spreadsheet.
 * Automatically adds missing sheets to avoid 'Unable to parse range' errors.
 */
export async function ensureSheetsExist(
  spreadsheetId: string,
  requiredTitles: string[]
): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error('Token Google tidak ditemukan. Silakan login kembali.');

  const cleanId = extractSpreadsheetId(spreadsheetId);

  // 1. Fetch current sheets metadata
  const metaRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}?fields=sheets.properties.title`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!metaRes.ok) {
    const err = await metaRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Gagal membaca metadata Google Spreadsheet.');
  }

  const metaData = await metaRes.json();
  const existingTitles = new Set(
    (metaData.sheets || []).map((s: { properties?: { title?: string } }) => s.properties?.title)
  );

  // 2. Determine which sheets are missing
  const missingTitles = requiredTitles.filter((title) => !existingTitles.has(title));

  if (missingTitles.length === 0) {
    return;
  }

  // 3. Batch add missing sheets
  const requests = missingTitles.map((title) => ({
    addSheet: {
      properties: {
        title,
        gridProperties: {
          frozenRowCount: 1,
        },
      },
    },
  }));

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    }
  );

  if (!updateRes.ok) {
    const err = await updateRes.json().catch(() => ({}));
    console.warn('Batch add sheet warning:', err);
  }
}

/**
 * Creates a new Google Spreadsheet for swimming academy management
 */
export async function createSwimmingSpreadsheet(title: string): Promise<{ id: string; url: string }> {
  const token = await getAccessToken();
  if (!token) throw new Error('Silakan masuk dengan Google terlebih dahulu.');

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: title || `AquaFlow - Data & Absensi Les Renang (${new Date().toLocaleDateString('id-ID')})`,
      },
      sheets: [
        { properties: { title: 'Daftar Siswa', gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: 'Log Absensi Kolam', gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: 'Rekap Harian 00.00', gridProperties: { frozenRowCount: 1 } } },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Gagal membuat Google Spreadsheet baru.');
  }

  const data = await res.json();
  return {
    id: data.spreadsheetId,
    url: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
  };
}

/**
 * Exports students list to Google Sheets
 */
export async function exportStudentsToSheets(rawSpreadsheetId: string, students: Student[]) {
  const token = await getAccessToken();
  if (!token) throw new Error('Token Google tidak ditemukan. Silakan login kembali.');

  const spreadsheetId = extractSpreadsheetId(rawSpreadsheetId);
  await ensureSheetsExist(spreadsheetId, ['Daftar Siswa']);

  const headers = [
    'Barcode ID',
    'Nama Lengkap',
    'Kelas / Level',
    'Usia',
    'Jenis Kelamin',
    'No. Telp / WA',
    'Nama Orang Tua / Wali',
    'Kontak Darurat',
    'Sisa Kuota',
    'Total Kuota',
    'Status',
    'Tanggal Bergabung',
    'Catatan Khusus Pelatih',
    'Terakhir Disinkronkan',
  ];

  const nowStr = new Date().toLocaleString('id-ID');
  const rows = students.map((s) => [
    s.barcode,
    s.name,
    s.roleClass.toUpperCase(),
    s.age,
    s.gender,
    maskPhone(s.phone),
    'xxx',
    maskPhone(s.emergencyContact),
    s.remainingQuota,
    s.totalQuota,
    s.status === 'active' ? 'Aktif' : 'Non-Aktif',
    s.joinedDate,
    s.notes || '-',
    nowStr,
  ]);

  const valueRange = {
    range: "'Daftar Siswa'!A1:N" + (rows.length + 1),
    majorDimension: 'ROWS',
    values: [headers, ...rows],
  };

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Daftar Siswa'!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(valueRange),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Gagal mengekspor data siswa ke Google Sheets');
  }

  return await res.json();
}

/**
 * Exports poolside attendance records to Google Sheets
 */
export async function exportAttendanceToSheets(rawSpreadsheetId: string, records: AttendanceRecord[]) {
  const token = await getAccessToken();
  if (!token) throw new Error('Token Google tidak ditemukan. Silakan login kembali.');

  const spreadsheetId = extractSpreadsheetId(rawSpreadsheetId);
  await ensureSheetsExist(spreadsheetId, ['Log Absensi Kolam']);

  const headers = [
    'ID Presensi',
    'Barcode Siswa',
    'Nama Siswa',
    'Kelas',
    'Tanggal',
    'Waktu Scan',
    'Pelatih Pendamping',
    'Status Kehadiran',
    'Jalur Kolam',
    'Terverifikasi Barcode',
    'Catatan Sesi',
    'Waktu Rekam Sistem',
  ];

  const nowStr = new Date().toLocaleString('id-ID');
  const rows = records.map((a) => [
    a.id,
    a.studentId,
    a.studentName,
    a.roleClass.toUpperCase(),
    a.dateStr,
    a.timeStr,
    a.coachName,
    a.status.toUpperCase(),
    a.poolLane,
    a.verifiedByBarcode ? 'YA (Barcode Scan)' : 'Manual',
    a.notes || '-',
    nowStr,
  ]);

  const valueRange = {
    range: "'Log Absensi Kolam'!A1:L" + (rows.length + 1),
    majorDimension: 'ROWS',
    values: [headers, ...rows],
  };

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Log Absensi Kolam'!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(valueRange),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Gagal mengekspor log absensi ke Google Sheets');
  }

  return await res.json();
}

/**
 * Appends a daily midnight (00:00) backup snapshot record to Google Sheets
 */
export async function appendDailyMidnightSnapshotToSheets(
  rawSpreadsheetId: string,
  snapshot: {
    date: string;
    timestamp: string;
    totalStudents: number;
    activeStudents: number;
    todayAttendances: number;
    totalRemainingQuota: number;
    monthlyRevenueEstimate: number;
    status: string;
  }
) {
  const token = await getAccessToken();
  if (!token) throw new Error('Token Google tidak ditemukan. Silakan hubungkan akun Google.');

  const spreadsheetId = extractSpreadsheetId(rawSpreadsheetId);
  await ensureSheetsExist(spreadsheetId, ['Rekap Harian 00.00']);

  const headers = [
    'Tanggal Catat (00:00)',
    'Waktu Eksekusi',
    'Total Siswa Terdaftar',
    'Siswa Aktif',
    'Total Absensi Hari Ini',
    'Sisa Kuota Berjalan',
    'Estimasi Omset/Bulan (IDR)',
    'Status Sistem 00:00',
  ];

  // First ensure header row is present
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Rekap Harian 00.00'!A1:H1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: "'Rekap Harian 00.00'!A1:H1",
        majorDimension: 'ROWS',
        values: [headers],
      }),
    }
  ).catch(() => {});

  const row = [
    snapshot.date,
    snapshot.timestamp,
    snapshot.totalStudents,
    snapshot.activeStudents,
    snapshot.todayAttendances,
    snapshot.totalRemainingQuota,
    `Rp ${snapshot.monthlyRevenueEstimate.toLocaleString('id-ID')}`,
    snapshot.status,
  ];

  // Append new snapshot row
  const appendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Rekap Harian 00.00'!A:H:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [row],
      }),
    }
  );

  if (!appendRes.ok) {
    const err = await appendRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Gagal menyimpan snapshot jam 00:00 ke Google Sheets');
  }

  return await appendRes.json();
}
