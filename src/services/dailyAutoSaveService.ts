import { Student, AttendanceRecord } from '../types';
import {
  extractSpreadsheetId,
  getAccessToken,
  exportStudentsToSheets,
  exportAttendanceToSheets,
  appendDailyMidnightSnapshotToSheets,
} from './googleSheetsService';

export interface DailyMidnightSnapshot {
  id: string;
  date: string; // e.g. "2026-10-24"
  timestamp: string; // e.g. "24/10/2026 00:00:00"
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  todayAttendances: number;
  totalRemainingQuota: number;
  monthlyRevenueEstimate: number;
  syncedToSheets: boolean;
  sheetsSyncStatus: string;
  isManualTest?: boolean;
}

const STORAGE_KEY_HISTORY = 'AQUA_DAILY_MIDNIGHT_BACKUPS';
const STORAGE_KEY_ENABLED = 'AQUA_AUTOSYNC_ENABLED';
const STORAGE_KEY_LAST_EXEC = 'AQUA_LAST_MIDNIGHT_EXECUTION_DATE';

/**
 * Returns whether 00:00 auto-save is enabled (default: true)
 */
export function isAutoSaveEnabled(): boolean {
  const val = localStorage.getItem(STORAGE_KEY_ENABLED);
  return val === null ? true : val === 'true';
}

/**
 * Toggles or sets auto-save enabled status
 */
export function setAutoSaveEnabled(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEY_ENABLED, String(enabled));
}

/**
 * Gets recorded history of midnight snapshots
 */
export function getDailyMidnightHistory(): DailyMidnightSnapshot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse midnight history:', err);
    return [];
  }
}

/**
 * Saves a new snapshot to persistent local history
 */
function saveSnapshotToHistory(snapshot: DailyMidnightSnapshot) {
  try {
    const history = getDailyMidnightHistory();
    // Keep up to 60 days of midnight logs
    const updated = [snapshot, ...history.filter((s) => s.id !== snapshot.id)].slice(0, 60);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save snapshot to history:', err);
  }
}

/**
 * Calculates remaining hours, minutes, and seconds until the next 00:00:00
 */
export function getTimeUntilMidnight(): {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  formatted: string;
} {
  const now = new Date();
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0
  );
  const diffMs = Math.max(0, nextMidnight.getTime() - now.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formatted = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return { hours, minutes, seconds, totalSeconds, formatted };
}

/**
 * Executes a full midnight backup and syncs to Google Sheets if available
 */
export async function performDailyMidnightSave(
  students: Student[],
  attendances: AttendanceRecord[],
  isManualTest: boolean = false
): Promise<DailyMidnightSnapshot> {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const fullTimestamp = `${now.toLocaleDateString('id-ID')} ${timeStr}`;

  // Calculate statistics
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === 'active').length;
  const inactiveStudents = totalStudents - activeStudents;
  const todayAttendances = attendances.filter((a) => a.dateStr === dateStr).length;
  const totalRemainingQuota = students.reduce((acc, s) => acc + (s.remainingQuota || 0), 0);

  // Estimation: active students * 350.000 average tuition
  const monthlyRevenueEstimate = activeStudents * 350000;

  let syncedToSheets = false;
  let sheetsSyncStatus = 'Tersimpan di Penyimpanan Lokal Sistem';

  // Check if target spreadsheet is configured & Google token is active
  const targetSheetId = localStorage.getItem('AQUA_LAST_SPREADSHEET_ID');
  const token = await getAccessToken().catch(() => null);

  if (targetSheetId && token) {
    try {
      const cleanId = extractSpreadsheetId(targetSheetId);
      // 1. Append daily snapshot record
      await appendDailyMidnightSnapshotToSheets(cleanId, {
        date: dateStr,
        timestamp: fullTimestamp,
        totalStudents,
        activeStudents,
        todayAttendances,
        totalRemainingQuota,
        monthlyRevenueEstimate,
        status: isManualTest ? 'Sukses (Uji Manual)' : 'Sukses Otomatis Jam 00:00',
      });

      // 2. Refresh full student roster & attendance
      await exportStudentsToSheets(cleanId, students);
      await exportAttendanceToSheets(cleanId, attendances);

      syncedToSheets = true;
      sheetsSyncStatus = `Tersinkron Penuh ke Google Sheets (${cleanId.slice(0, 6)}...)`;
    } catch (err: unknown) {
      console.warn('Sheets sync during midnight save failed:', err);
      sheetsSyncStatus = `Gagal Sync Sheets: ${err instanceof Error ? err.message : 'Error koneksi'}`;
    }
  } else if (!targetSheetId) {
    sheetsSyncStatus = 'Belum Ada ID Spreadsheet Terpilih (Data Aman Tersimpan Lokal)';
  } else {
    sheetsSyncStatus = 'Sesi Akun Google Belum Terhubung (Data Aman Tersimpan Lokal)';
  }

  const snapshot: DailyMidnightSnapshot = {
    id: `snap-${dateStr}-${Date.now()}`,
    date: dateStr,
    timestamp: fullTimestamp,
    totalStudents,
    activeStudents,
    inactiveStudents,
    todayAttendances,
    totalRemainingQuota,
    monthlyRevenueEstimate,
    syncedToSheets,
    sheetsSyncStatus,
    isManualTest,
  };

  // Persist locally
  saveSnapshotToHistory(snapshot);
  if (!isManualTest) {
    localStorage.setItem(STORAGE_KEY_LAST_EXEC, dateStr);
  }

  // Dispatch custom event for UI banners/toasts
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('aqua:daily-autosave-completed', {
        detail: snapshot,
      })
    );
  }

  return snapshot;
}

/**
 * Initializes the Midnight Auto-Save Scheduler.
 * Sets up exact timer for 00:00:00 plus periodic checks for background tab / waking laptop.
 */
export function initDailyAutoSaveScheduler(
  getStudents: () => Student[],
  getAttendances: () => AttendanceRecord[]
): () => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let intervalId: NodeJS.Timeout | null = null;

  const scheduleNextMidnight = () => {
    if (timeoutId) clearTimeout(timeoutId);

    const { totalSeconds } = getTimeUntilMidnight();
    const msUntilMidnight = Math.max(1000, totalSeconds * 1000);

    console.log(`[AquaFlow] Jadwal simpan otomatis 00:00 diset dalam ${Math.round(msUntilMidnight / 1000 / 60)} menit.`);

    timeoutId = setTimeout(async () => {
      if (isAutoSaveEnabled()) {
        console.log('[AquaFlow] Jam 00:00 tercapai. Menjalankan simpan otomatis harian...');
        try {
          await performDailyMidnightSave(getStudents(), getAttendances(), false);
        } catch (err) {
          console.error('[AquaFlow] Error during midnight save:', err);
        }
      }
      // Reschedule for next midnight
      scheduleNextMidnight();
    }, msUntilMidnight);
  };

  scheduleNextMidnight();

  // Heartbeat check every 60 seconds (catches cases where laptop was sleeping through 00:00)
  intervalId = setInterval(() => {
    if (!isAutoSaveEnabled()) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const lastExec = localStorage.getItem(STORAGE_KEY_LAST_EXEC);

    // If it's after 00:00 and today hasn't been saved yet, trigger save
    const currentHour = new Date().getHours();
    if (lastExec !== todayStr && currentHour === 0) {
      console.log('[AquaFlow Heartbeat] Terdeteksi jam 00:00 belum tereksekusi. Menjalankan simpan sekarang...');
      performDailyMidnightSave(getStudents(), getAttendances(), false).catch(console.error);
    }
  }, 60000);

  return () => {
    if (timeoutId) clearTimeout(timeoutId);
    if (intervalId) clearInterval(intervalId);
  };
}

/**
 * Exports snapshot history as JSON file
 */
export function exportHistoryAsJSON(history: DailyMidnightSnapshot[]) {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `AquaFlow_Cadangan_00.00_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Exports snapshot history as CSV file
 */
export function exportHistoryAsCSV(history: DailyMidnightSnapshot[]) {
  const headers = [
    'Tanggal Catat',
    'Waktu Eksekusi',
    'Total Siswa',
    'Siswa Aktif',
    'Siswa Non-Aktif',
    'Absensi Hari Ini',
    'Sisa Kuota',
    'Estimasi Omset',
    'Status Google Sheets',
  ];

  const rows = history.map((h) => [
    h.date,
    h.timestamp,
    h.totalStudents,
    h.activeStudents,
    h.inactiveStudents,
    h.todayAttendances,
    h.totalRemainingQuota,
    h.monthlyRevenueEstimate,
    `"${h.sheetsSyncStatus.replace(/"/g, '""')}"`,
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `AquaFlow_Log_00.00_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}
