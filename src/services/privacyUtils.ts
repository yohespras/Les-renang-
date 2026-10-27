/**
 * Utility functions for masking sensitive personal data:
 * - Nomor telepon disamarkan (contoh: 0812-xxxx-xxxx)
 * - Nama wali atlet disembunyikan menjadi "xxx"
 * - Tanggal lahir disamarkan menjadi "xx-xx-xxxx"
 * 
 * Aturan khusus: KECUALI di KTA (Kartu Tanda Anggota resmi / Swim Pass),
 * data wali, telepon darurat, dan tanggal lahir tetap ditampilkan lengkap untuk identitas sah atlet.
 */

export function maskPhone(phone: string | undefined | null): string {
  if (!phone || !phone.trim()) return '-';
  const clean = phone.trim();
  const digits = clean.replace(/\D/g, '');
  if (digits.length >= 8) {
    const prefix = digits.slice(0, 4);
    return `${prefix}-xxxx-xxxx`;
  }
  return '08xx-xxxx-xxxx';
}

export function maskParentName(_name?: string | null): string {
  return 'xxx';
}

export function maskBirthDate(_dateStr?: string | null): string {
  return 'xx-xx-xxxx';
}
