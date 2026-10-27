import React, { useEffect, useState, useMemo } from 'react';
import QRCode from 'qrcode';
import { Student, Coach, AuthUser } from '../types';
import { ROLE_LABELS } from '../data/mockData';
import {
  Printer,
  Waves,
  ShieldCheck,
  Download,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Eye,
  X,
  Award,
  Phone,
  Mail,
  UserCheck,
  User,
} from 'lucide-react';
import {
  CardExportData,
  exportCardToImageDataUrl,
  triggerImageDownload,
  printImageDirectly,
} from '../services/cardImageExport';

interface BarcodeCardProps {
  student?: Student;
  coach?: Coach;
  user?: AuthUser;
  cardData?: CardExportData;
  onClose?: () => void;
  standalone?: boolean;
}

export const BarcodeCard: React.FC<BarcodeCardProps> = ({
  student,
  coach,
  user,
  cardData,
  onClose,
  standalone = false,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessNotice, setExportSuccessNotice] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  // Normalize whatever input is given into CardExportData
  const effectiveCard: CardExportData = useMemo(() => {
    if (cardData) return cardData;
    if (student) {
      return {
        id: student.id,
        name: student.name,
        barcode: student.barcode,
        avatarUrl: student.avatarUrl,
        roleClass: student.roleClass,
        age: student.age,
        birthDate: student.birthDate,
        remainingQuota: student.remainingQuota,
        totalQuota: student.totalQuota,
        parentName: student.parentName,
        emergencyContact: student.emergencyContact,
        isStaff: false,
      };
    }
    if (coach) {
      return {
        id: coach.id,
        name: coach.name,
        barcode: coach.barcode || `AQUA-CCH-${coach.id.replace('c', '10')}`,
        avatarUrl: coach.avatarUrl,
        roleClass: 'pelatih',
        isStaff: true,
        specialty: coach.specialty,
        phone: coach.phone,
        email: coach.email || `${coach.name.split(' ')[0].toLowerCase()}@tirta.com`,
      };
    }
    if (user) {
      const isStaffRole = user.role === 'admin' || user.role === 'pelatih';
      const fallbackBarcode =
        user.barcode ||
        (user.role === 'admin'
          ? 'AQUA-ADM-001'
          : user.role === 'pelatih'
          ? 'AQUA-CCH-101'
          : 'AQUA-STD-001');
      return {
        id: user.id,
        name: user.name,
        barcode: fallbackBarcode,
        avatarUrl: user.avatarUrl,
        roleClass: user.role,
        isStaff: isStaffRole,
        phone: user.phone || '0812-3456-7890',
        email: user.email,
        specialty:
          user.role === 'admin'
            ? 'Kepala Manajemen & Operasional Kolam'
            : 'Staff Pelatih Resmi Tirta Samudra',
      };
    }
    return {
      id: 'pass-01',
      name: 'Peserta Tirta Samudra',
      barcode: 'AQUA-MBR-001',
      avatarUrl:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      roleClass: 'dasar',
      isStaff: false,
    };
  }, [student, coach, user, cardData]);

  const isStaff =
    effectiveCard.isStaff ||
    effectiveCard.roleClass === 'admin' ||
    effectiveCard.roleClass === 'pelatih';

  useEffect(() => {
    if (!effectiveCard.barcode) return;
    QRCode.toDataURL(effectiveCard.barcode, {
      width: 240,
      margin: 1,
      color: {
        dark: '#0B132B',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Gagal generate QR Code:', err));
  }, [effectiveCard.barcode]);

  useEffect(() => {
    setImgError(false);
  }, [effectiveCard.avatarUrl]);

  const handlePrintDocument = () => {
    window.print();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(effectiveCard.barcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Unduh kartu sebagai file gambar (PNG HD)
  const handleDownloadImage = async () => {
    setIsExporting(true);
    setExportSuccessNotice(null);

    try {
      const dataUrl = await exportCardToImageDataUrl(
        `card-${effectiveCard.id}`,
        effectiveCard,
        qrDataUrl
      );
      if (dataUrl) {
        const prefix = isStaff ? 'kartu-staff' : 'kartu-renang';
        const fileName = `${prefix}-${effectiveCard.name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '_')}-${effectiveCard.barcode}.png`;
        triggerImageDownload(dataUrl, fileName);
        setExportSuccessNotice('Gambar kartu berhasil diunduh (PNG HD)!');
        setTimeout(() => setExportSuccessNotice(null), 3500);
      }
    } catch (err) {
      console.error('Gagal mengunduh kartu dalam format gambar:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Cetak kartu dalam format gambar langsung
  const handlePrintImageOnly = async () => {
    setIsExporting(true);
    try {
      const dataUrl = await exportCardToImageDataUrl(
        `card-${effectiveCard.id}`,
        effectiveCard,
        qrDataUrl
      );
      if (dataUrl) {
        printImageDirectly(dataUrl, effectiveCard.name);
      }
    } catch (err) {
      console.error('Gagal mencetak gambar kartu:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Buka preview gambar kartu
  const handlePreviewImage = async () => {
    setIsExporting(true);
    try {
      const dataUrl = await exportCardToImageDataUrl(
        `card-${effectiveCard.id}`,
        effectiveCard,
        qrDataUrl
      );
      if (dataUrl) {
        setPreviewImageUrl(dataUrl);
      }
    } catch (err) {
      console.error('Gagal membuat preview kartu gambar:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const classInfo = ROLE_LABELS[effectiveCard.roleClass] || {
    textBadge: 'SISWA',
    badgeBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',
  };

  const getCardTheme = (role: string) => {
    switch (role) {
      case 'dasar':
        return {
          cardBg: 'from-slate-950 via-sky-950 to-teal-950 border-sky-400/40',
          titleColor: 'text-sky-300',
          avatarBorder: 'border-sky-400/70 shadow-sky-950',
          logoGrad: 'from-sky-400 to-teal-500',
          glow: 'from-sky-400',
        };
      case 'pemula':
        return {
          cardBg: 'from-slate-950 via-blue-950 to-indigo-950 border-blue-400/40',
          titleColor: 'text-blue-300',
          avatarBorder: 'border-blue-400/70 shadow-blue-950',
          logoGrad: 'from-cyan-400 to-blue-600',
          glow: 'from-blue-400',
        };
      case 'prestasi':
        return {
          cardBg: 'from-slate-950 via-amber-950 to-rose-950 border-amber-400/50',
          titleColor: 'text-amber-300',
          avatarBorder: 'border-amber-400/80 shadow-amber-950',
          logoGrad: 'from-amber-400 to-orange-600',
          glow: 'from-amber-400',
        };
      case 'privat_4':
        return {
          cardBg: 'from-slate-950 via-purple-950 to-violet-950 border-purple-400/50',
          titleColor: 'text-purple-300',
          avatarBorder: 'border-purple-400/80 shadow-purple-950',
          logoGrad: 'from-purple-400 to-violet-600',
          glow: 'from-purple-400',
        };
      case 'privat_8':
        return {
          cardBg: 'from-slate-950 via-pink-950 to-rose-950 border-pink-400/50',
          titleColor: 'text-pink-300',
          avatarBorder: 'border-pink-400/80 shadow-pink-950',
          logoGrad: 'from-pink-400 to-rose-600',
          glow: 'from-pink-400',
        };
      case 'privat_12':
        return {
          cardBg: 'from-slate-950 via-rose-950 to-amber-950 border-rose-400/50',
          titleColor: 'text-rose-300',
          avatarBorder: 'border-rose-400/80 shadow-rose-950',
          logoGrad: 'from-rose-400 to-amber-600',
          glow: 'from-rose-400',
        };
      case 'pelatih':
        return {
          cardBg: 'from-slate-950 via-emerald-950 to-teal-950 border-emerald-400/50',
          titleColor: 'text-emerald-300',
          avatarBorder: 'border-emerald-400/80 shadow-emerald-950',
          logoGrad: 'from-emerald-400 to-teal-600',
          glow: 'from-emerald-400',
        };
      default:
        return {
          cardBg: 'from-slate-950 via-indigo-950 to-blue-950 border-indigo-400/40',
          titleColor: 'text-indigo-300',
          avatarBorder: 'border-indigo-400/70 shadow-indigo-950',
          logoGrad: 'from-indigo-400 to-blue-600',
          glow: 'from-indigo-400',
        };
    }
  };

  const cardTheme = getCardTheme(effectiveCard.roleClass);

  return (
    <div className={`flex flex-col items-center ${standalone ? 'w-full' : 'p-2'}`}>
      {/* Swim Pass / Staff ID Card */}
      <div
        id={`card-${effectiveCard.id}`}
        className={`printable-card relative w-full max-w-[390px] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br ${cardTheme.cardBg} text-white border p-6 flex flex-col justify-between transition-transform duration-300 hover:scale-[1.01]`}
      >
        {/* Decorative Wave & Holographic shimmer background */}
        <div
          className={`absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] ${cardTheme.glow} via-transparent to-transparent`}
        ></div>
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Card Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${cardTheme.logoGrad} flex items-center justify-center text-slate-950 shadow-md`}
            >
              <Waves className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4
                className={`font-extrabold text-sm tracking-wider uppercase ${cardTheme.titleColor}`}
              >
                {isStaff
                  ? effectiveCard.roleClass === 'admin'
                    ? 'AQUAFLOW ADMIN PASS'
                    : 'AQUAFLOW COACH PASS'
                  : 'AQUAFLOW PASS'}
              </h4>
              <p className="text-[10px] text-white/70 font-medium">
                Tirta Samudra Swimming Club
              </p>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
              isStaff
                ? effectiveCard.roleClass === 'admin'
                  ? 'bg-indigo-500/20 border border-indigo-400/40 text-indigo-200'
                  : 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-200'
                : classInfo.badgeBg
            }`}
          >
            {isStaff
              ? effectiveCard.roleClass === 'admin'
                ? 'ADMIN UTAMA'
                : 'STAFF PELATIH'
              : classInfo.textBadge}
          </span>
        </div>

        {/* Profile Info */}
        <div className="relative z-10 my-4 flex items-center gap-4">
          {effectiveCard.avatarUrl && !imgError ? (
            <img
              src={effectiveCard.avatarUrl}
              alt={effectiveCard.name}
              crossOrigin="anonymous"
              onError={() => setImgError(true)}
              className={`w-16 h-16 rounded-2xl object-cover border-2 ${cardTheme.avatarBorder} shadow-lg shrink-0`}
            />
          ) : (
            <div
              className={`w-16 h-16 rounded-2xl border-2 ${cardTheme.avatarBorder} bg-slate-800/90 flex items-center justify-center text-slate-300 shadow-lg shrink-0`}
              title="Foto KTA (Default)"
            >
              <User className="w-9 h-9 text-cyan-300/90" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-lg font-bold truncate text-white">
                {effectiveCard.name}
              </h3>
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            </div>
            <p className="text-xs text-cyan-200/80 font-mono mt-0.5">
              {isStaff ? `BARCODE: ${effectiveCard.barcode}` : `ID: ${effectiveCard.id}`}
            </p>

            {isStaff ? (
              <div className="flex flex-col gap-1 mt-1.5">
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300 truncate max-w-[200px]">
                  {effectiveCard.specialty ||
                    (effectiveCard.roleClass === 'admin'
                      ? 'Administrator Kolam'
                      : 'Pelatih Resmi')}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono">
                  {effectiveCard.phone || '0812-3456-7890'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300">
                  Usia {effectiveCard.age ?? 10} Th
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-medium">
                  {effectiveCard.remainingQuota ?? 10} / {effectiveCard.totalQuota ?? 12} Sesi
                </span>
              </div>
            )}
          </div>
        </div>

        {/* QR Code & Barcode Section */}
        <div className="relative z-10 bg-white rounded-2xl p-4 flex flex-col items-center justify-center text-slate-900 shadow-inner">
          <div className="flex items-center justify-between w-full mb-2 px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
              {isStaff ? 'Scan Identifikasi & Otorisasi' : 'Scan Presensi Kolam'}
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
              STATUS AKTIF
            </span>
          </div>

          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QR Code ${effectiveCard.barcode}`}
              className="w-32 h-32 rounded-lg border border-slate-200"
            />
          ) : (
            <div className="w-32 h-32 bg-slate-100 animate-pulse rounded-lg flex items-center justify-center">
              <span className="text-xs text-slate-400">Loading QR...</span>
            </div>
          )}

          {/* Barcode Visual Strips */}
          <div className="w-full mt-3 flex flex-col items-center">
            <div className="h-9 w-full flex items-stretch justify-center gap-[2px] px-4 overflow-hidden">
              {effectiveCard.barcode.split('').map((char, idx) => {
                const charCode = char.charCodeAt(0);
                const width1 = (charCode % 3) + 1;
                const width2 = ((charCode >> 1) % 2) + 1;
                return (
                  <React.Fragment key={idx}>
                    <div style={{ width: `${width1 * 2}px` }} className="bg-slate-900"></div>
                    <div style={{ width: `${width2}px` }} className="bg-transparent"></div>
                    <div style={{ width: `${(idx % 2) + 1}px` }} className="bg-slate-900"></div>
                  </React.Fragment>
                );
              })}
            </div>
            <p className="font-mono text-xs font-bold tracking-widest text-slate-800 mt-1">
              *{effectiveCard.barcode}*
            </p>
          </div>
        </div>

        {/* Card Footer */}
        <div className="relative z-10 mt-4 flex items-center justify-between text-[11px] text-cyan-200/70 pt-2 border-t border-cyan-500/20">
          {isStaff ? (
            <>
              <span className="truncate max-w-[170px]">
                Telp: {effectiveCard.phone || '-'}
              </span>
              <span className="truncate max-w-[170px]">
                Email: {effectiveCard.email || 'info@tirta.com'}
              </span>
            </>
          ) : (
            <>
              <span className="truncate max-w-[140px]" title={`Wali: ${effectiveCard.parentName || '-'}`}>
                Wali: {effectiveCard.parentName || '-'}
              </span>
              {effectiveCard.birthDate && (
                <span className="text-[10px] text-cyan-200/90 font-mono">
                  Lahir: {effectiveCard.birthDate}
                </span>
              )}
              <span className="truncate max-w-[130px]" title={`Darurat: ${effectiveCard.emergencyContact || '-'}`}>
                Darurat: {effectiveCard.emergencyContact || '-'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Export Success Banner */}
      {exportSuccessNotice && (
        <div className="mt-3 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{exportSuccessNotice}</span>
        </div>
      )}

      {/* Action Controls */}
      <div className="no-print mt-5 w-full max-w-[390px] space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          {/* Unduh Gambar Kartu PNG */}
          <button
            onClick={handleDownloadImage}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 dark:text-white shadow-lg shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-50"
            title="Download gambar kartu dalam format PNG definisi tinggi untuk disimpan di galeri HP atau cetak PVC"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Membuat Gambar...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Unduh Gambar (PNG)</span>
              </>
            )}
          </button>

          {/* Cetak Gambar Langsung */}
          <button
            onClick={handlePrintImageOnly}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 shadow-md transition-all cursor-pointer disabled:opacity-50"
            title="Buka jendela cetak ukuran kartu ID Card langsung tanpa header halaman browser"
          >
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            <span>Cetak Gambar Kartu</span>
          </button>
        </div>

        {/* Secondary Action Row: Preview Gambar, Salin Barcode, Cetak Print Biasa, Tutup */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={handlePreviewImage}
            disabled={isExporting}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-[11px] font-semibold bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Lihat Gambar</span>
          </button>

          <button
            onClick={handleCopyCode}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-[11px] font-semibold bg-slate-800/80 hover:bg-slate-800 text-cyan-200 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Salin Barcode</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrintDocument}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-[11px] font-semibold bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
            title="Cetak via browser print"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Cetak Dokumen</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="py-2 px-3 rounded-xl text-[11px] font-semibold bg-slate-700/50 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
            >
              Tutup
            </button>
          )}
        </div>
      </div>

      {/* Modal Preview Gambar Kartu */}
      {previewImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-sm w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white">Preview Gambar Kartu (PNG)</h4>
              </div>
              <button
                onClick={() => setPreviewImageUrl(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <img
              src={previewImageUrl}
              alt="Preview Kartu"
              className="w-full max-h-[60vh] object-contain rounded-2xl shadow-lg border border-cyan-500/30"
            />

            <div className="mt-4 flex items-center gap-2 w-full">
              <button
                onClick={() => {
                  const prefix = isStaff ? 'kartu-staff' : 'kartu-renang';
                  const fileName = `${prefix}-${effectiveCard.name
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, '_')}-${effectiveCard.barcode}.png`;
                  triggerImageDownload(previewImageUrl, fileName);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-cyan-500/20"
              >
                <Download className="w-4 h-4" />
                Unduh Gambar Ini
              </button>
              <button
                onClick={() => printImageDirectly(previewImageUrl, effectiveCard.name)}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
              >
                <Printer className="w-4 h-4" />
                Cetak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
