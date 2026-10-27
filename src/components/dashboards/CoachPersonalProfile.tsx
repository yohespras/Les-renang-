import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { Coach, AuthUser, UserRole } from '../../types';
import { ROLE_LABELS } from '../../data/mockData';
import { compressAndResizeImage } from '../../services/imageUtils';
import {
  exportCardToImageDataUrl,
  triggerImageDownload,
  CardExportData,
} from '../../services/cardImageExport';
import {
  Waves,
  Camera,
  Upload,
  CheckCircle2,
  Copy,
  Check,
  QrCode,
  Printer,
  Download,
  Mail,
  Phone,
  User,
  Save,
  Loader2,
  Award,
  Calendar,
  Sparkles,
  Medal,
  Clock,
  Briefcase,
  Layers,
} from 'lucide-react';

interface CoachPersonalProfileProps {
  currentCoach: Coach;
  currentUser?: AuthUser | null;
  onUpdateCoachAvatar?: (newAvatarUrl: string, coachId: string) => void;
  onUpdateCoach?: (updatedCoach: Coach) => void;
  onViewCoachBarcode?: (coach: Coach) => void;
}

export const CoachPersonalProfile: React.FC<CoachPersonalProfileProps> = ({
  currentCoach,
  currentUser,
  onUpdateCoachAvatar,
  onUpdateCoach,
  onViewCoachBarcode,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  // Form states initialized with currentCoach data
  const [name, setName] = useState(currentCoach.name);
  const [specialty, setSpecialty] = useState(currentCoach.specialty);
  const [phone, setPhone] = useState(currentCoach.phone);
  const [email, setEmail] = useState(currentCoach.email || 'coach@tirtasamudra.com');
  const [experienceYears, setExperienceYears] = useState<number>(currentCoach.experienceYears || 5);
  const [certificationsText, setCertificationsText] = useState<string>(
    (currentCoach.certifications || ['Pelatih Renang Lisensi B PRSI', 'Sertifikasi Water Safety & First Aid']).join(', ')
  );

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedBarcode, setCopiedBarcode] = useState(false);

  // Sync when currentCoach changes
  useEffect(() => {
    setName(currentCoach.name);
    setSpecialty(currentCoach.specialty);
    setPhone(currentCoach.phone);
    setEmail(currentCoach.email || 'coach@tirtasamudra.com');
    setExperienceYears(currentCoach.experienceYears || 5);
    setCertificationsText(
      (currentCoach.certifications || ['Pelatih Renang Lisensi B PRSI', 'Sertifikasi Water Safety & First Aid']).join(', ')
    );
  }, [currentCoach]);

  // QR Code preview generator
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const coachBarcode = currentCoach.barcode || 'AQUA-CCH-101';

  useEffect(() => {
    QRCode.toDataURL(coachBarcode, {
      width: 180,
      margin: 1,
      color: {
        dark: '#064e3b',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate coach QR code:', err));
  }, [coachBarcode]);

  // Handle direct file upload for profile picture
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadNotice(null);
      // Compress and resize client-side to keep under 50KB for localStorage
      const compressedBase64 = await compressAndResizeImage(file, 400, 400, 0.85);

      if (onUpdateCoachAvatar) {
        onUpdateCoachAvatar(compressedBase64, currentCoach.id);
      }
      setUploadNotice('Foto profil pelatih berhasil diperbarui!');
      setTimeout(() => setUploadNotice(null), 3500);
    } catch (err: any) {
      console.error('Error saat upload foto pelatih:', err);
      alert(err.message || 'Gagal mengunggah foto profil pelatih.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCopyBarcode = () => {
    navigator.clipboard.writeText(coachBarcode);
    setCopiedBarcode(true);
    setTimeout(() => setCopiedBarcode(false), 2000);
  };

  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();

    const certList = certificationsText
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const updatedCoach: Coach = {
      ...currentCoach,
      name,
      specialty,
      phone,
      email,
      experienceYears: Number(experienceYears) || 0,
      certifications: certList,
    };

    if (onUpdateCoach) {
      onUpdateCoach(updatedCoach);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const coachCardData: CardExportData = {
    id: currentCoach.id,
    name: name,
    barcode: coachBarcode,
    avatarUrl: currentCoach.avatarUrl,
    roleClass: 'pelatih' as UserRole,
    isStaff: true,
    staffTitle: 'Pelatih Resmi Akademi',
    roleBadge: 'PELATIH RESMI',
    specialty: specialty,
    phone: phone,
    email: email,
    emergencyContact: phone,
    joinedDate: '2023-03-01',
    certifications: currentCoach.certifications,
    experienceYears: experienceYears,
  };

  const handleOpenCoachBarcode = () => {
    if (onViewCoachBarcode) {
      onViewCoachBarcode(currentCoach);
    }
  };

  const handleDownloadCard = async () => {
    try {
      const dataUrl = await exportCardToImageDataUrl('coach-card-badge', coachCardData, '');
      if (dataUrl) {
        triggerImageDownload(dataUrl, `kartu-pelatih-${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}-${coachBarcode}.png`);
      }
    } catch (e) {
      handleOpenCoachBarcode();
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
      />

      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white shadow-xl border border-emerald-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Avatar with Camera upload trigger */}
            <div className="relative group shrink-0">
              <img
                src={currentCoach.avatarUrl}
                alt={name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-emerald-400 shadow-2xl ring-4 ring-emerald-500/20"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                title="Ganti foto profil dengan mengupload file foto dari perangkat"
                className="absolute inset-0 bg-black/60 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
              >
                <Camera className="w-6 h-6 text-emerald-300" />
                <span className="text-[10px] font-bold mt-1">Ubah Foto</span>
              </button>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                  <Waves className="w-3.5 h-3.5" /> PELATIH RESMI AKADEMI
                </span>
                <span className="font-mono text-xs font-bold bg-black/40 px-2.5 py-0.5 rounded-full border border-emerald-400/30 text-emerald-200">
                  {coachBarcode}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{name}</h1>
              <p className="text-xs sm:text-sm text-emerald-200/80 mt-1">
                {specialty} &bull; {experienceYears} Tahun Pengalaman Melatih
              </p>

              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Mengunggah...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Ganti Foto Profil (Upload File)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleOpenCoachBarcode}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-emerald-300" />
              <span>Kartu Barcode Pelatih</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCard}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Pass HD (PNG)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upload Notification */}
      {uploadNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{uploadNotice}</span>
        </div>
      )}

      {/* Main Grid: Profile Form & ID Barcode Pass Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Profile Edit Form */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-500" />
                Biodata &amp; Kredensial Pelatih
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Perbarui nama, spesialisasi gaya renang, kontak, dan sertifikasi kepelatihan
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Pelatih Terdaftar
            </span>
          </div>

          {saveSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Profil pelatih berhasil diperbarui dan disimpan!</span>
            </div>
          )}

          <form onSubmit={handleSubmitProfile} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-500" />
                  Nama Lengkap Pelatih
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Lengkap Pelatih"
                  className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-500" />
                  Spesialisasi Gaya Renang
                </label>
                <input
                  type="text"
                  required
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="mis: Gaya Dada, Gaya Bebas & Balita"
                  className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  Nomor WhatsApp / HP
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812-3456-7890"
                  className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-500" />
                  Email Pelatih
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="coach@tirtasamudra.com"
                  className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  Pengalaman (Tahun)
                </label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  required
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Medal className="w-3.5 h-3.5 text-amber-500" />
                Sertifikasi &amp; Lisensi Kepelatihan (Pisahkan dengan koma)
              </label>
              <textarea
                rows={2}
                value={certificationsText}
                onChange={(e) => setCertificationsText(e.target.value)}
                placeholder="mis: Pelatih Renang Lisensi B PRSI, Sertifikasi First Aid & CPR, Water Safety Instructor"
                className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Kelas Binaan Pelatih */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-2">
                <Layers className="w-3.5 h-3.5" />
                Kelas Renang Binaan Anda:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentCoach.assignedClasses.map((cls) => (
                  <span
                    key={cls}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 shadow-xs"
                  >
                    {ROLE_LABELS[cls]?.title || cls}
                  </span>
                ))}
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-slate-700 dark:text-slate-200 cursor-pointer flex items-center gap-2 transition-all"
              >
                <Camera className="w-4 h-4 text-emerald-500" />
                <span>Upload Foto Profil</span>
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-2 cursor-pointer transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Profil Pelatih</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Official Coach ID Card Preview */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-500" />
                Kartu ID Barcode Resmi
              </h3>
              <span className="text-[10px] font-bold text-slate-400">COACH PASS</span>
            </div>

            {/* Visual Coach Card */}
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white border border-emerald-500/30 p-4 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    TS
                  </div>
                  <span className="font-extrabold text-[11px] tracking-tight">Tirta Samudra</span>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  COACH PASS
                </span>
              </div>

              <div className="flex items-center gap-3">
                {currentCoach.avatarUrl ? (
                  <img
                    src={currentCoach.avatarUrl}
                    alt={name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 shrink-0">
                    <User className="w-8 h-8 text-emerald-300/90" />
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="font-black text-sm text-white truncate">{name}</h4>
                  <p className="font-mono text-xs font-bold text-emerald-300">{coachBarcode}</p>
                  <p className="text-[10px] text-emerald-100/70 mt-0.5 truncate">{specialty}</p>
                </div>
              </div>

              {/* QR Code and Barcode box */}
              <div className="p-3 rounded-xl bg-white text-slate-950 flex items-center justify-between gap-3">
                {qrDataUrl && (
                  <img src={qrDataUrl} alt="QR Code" className="w-14 h-14 object-contain" />
                )}
                <div className="text-right">
                  <span className="text-[8px] font-bold uppercase text-slate-400 block">ID BARCODE</span>
                  <span className="font-mono font-black text-xs text-slate-900 tracking-wider block">
                    {coachBarcode}
                  </span>
                  <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">● Pelatih Aktif</span>
                </div>
              </div>
            </div>

            {/* Quick Barcode Copy */}
            <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">Nomor Barcode Pelatih:</span>
                <span className="font-mono font-extrabold text-xs text-slate-900 dark:text-white">
                  {coachBarcode}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyBarcode}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-emerald-600 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copiedBarcode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedBarcode ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={handleOpenCoachBarcode}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Pratinjau &amp; Cetak Kartu Pelatih</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCard}
              className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Unduh File Kartu (PNG)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
