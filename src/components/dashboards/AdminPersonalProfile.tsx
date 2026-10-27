import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { AuthUser, UserRole } from '../../types';
import { compressAndResizeImage } from '../../services/imageUtils';
import {
  exportCardToImageDataUrl,
  triggerImageDownload,
  CardExportData,
} from '../../services/cardImageExport';
import {
  Shield,
  Camera,
  Upload,
  CheckCircle2,
  Copy,
  Check,
  QrCode,
  Printer,
  Download,
  KeyRound,
  Mail,
  Phone,
  User,
  Save,
  Loader2,
  Lock,
  Sparkles,
  Building2,
  Eye,
  EyeOff,
} from 'lucide-react';

interface AdminPersonalProfileProps {
  currentUser: AuthUser | null;
  onUpdateAvatar?: (newAvatarUrl: string) => void;
  onUpdateUser?: (updatedUser: AuthUser) => void;
  onViewBarcode?: (cardOrUser: any) => void;
}

export const AdminPersonalProfile: React.FC<AdminPersonalProfileProps> = ({
  currentUser,
  onUpdateAvatar,
  onUpdateUser,
  onViewBarcode,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  // Form states initialized with currentUser data
  const [name, setName] = useState(currentUser?.name || 'Administrator');
  const [username, setUsername] = useState(currentUser?.username || 'admin');
  const [email, setEmail] = useState(currentUser?.email || 'admin@tirtasamudra.com');
  const [phone, setPhone] = useState(currentUser?.phone || '0812-3456-7890');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedBarcode, setCopiedBarcode] = useState(false);

  // Sync form when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setUsername(currentUser.username || 'admin');
      setEmail(currentUser.email);
      setPhone(currentUser.phone || '0812-3456-7890');
    }
  }, [currentUser]);

  // QR Code preview generator
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const adminBarcode = currentUser?.barcode || 'AQUA-ADM-001';

  useEffect(() => {
    QRCode.toDataURL(adminBarcode, {
      width: 180,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate admin QR code:', err));
  }, [adminBarcode]);

  // Handle direct file upload for profile picture
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadNotice(null);
      // Compress and resize client-side to keep under 50KB for localStorage
      const compressedBase64 = await compressAndResizeImage(file, 400, 400, 0.85);

      if (onUpdateAvatar) {
        onUpdateAvatar(compressedBase64);
      }
      setUploadNotice('Foto profil admin berhasil diperbarui!');
      setTimeout(() => setUploadNotice(null), 3500);
    } catch (err: any) {
      console.error('Error saat upload foto admin:', err);
      alert(err.message || 'Gagal mengunggah foto profil.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCopyBarcode = () => {
    navigator.clipboard.writeText(adminBarcode);
    setCopiedBarcode(true);
    setTimeout(() => setCopiedBarcode(false), 2000);
  };

  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const updatedUser: AuthUser = {
      ...currentUser,
      name,
      username,
      email,
      phone,
      password: newPassword.trim() ? newPassword.trim() : currentUser.password,
    };

    if (onUpdateUser) {
      onUpdateUser(updatedUser);
    }
    setSaveSuccess(true);
    setNewPassword('');
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const adminCardData: CardExportData = {
    id: currentUser?.id || 'admin-root',
    name: name,
    barcode: adminBarcode,
    avatarUrl: currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    roleClass: 'admin' as UserRole,
    isStaff: true,
    staffTitle: 'Administrator Utama',
    roleBadge: 'ADMINISTRATOR',
    specialty: 'Manajemen & Operasional Klub',
    phone: phone,
    email: email,
    emergencyContact: phone,
    joinedDate: '2023-01-01',
  };

  const handleOpenAdminBarcode = () => {
    if (onViewBarcode) {
      onViewBarcode(adminCardData);
    }
  };

  const handleDownloadCard = async () => {
    try {
      const dataUrl = await exportCardToImageDataUrl('admin-card-badge', adminCardData, '');
      if (dataUrl) {
        triggerImageDownload(dataUrl, `kartu-admin-${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}-${adminBarcode}.png`);
      }
    } catch (e) {
      handleOpenAdminBarcode();
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
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-cyan-950 text-white shadow-xl border border-cyan-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Avatar with Camera upload trigger */}
            <div className="relative group shrink-0">
              <img
                src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                alt={name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-cyan-400 shadow-2xl ring-4 ring-cyan-500/20"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                title="Ganti foto profil dengan mengupload file foto dari perangkat"
                className="absolute inset-0 bg-black/60 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
              >
                <Camera className="w-6 h-6 text-cyan-300" />
                <span className="text-[10px] font-bold mt-1">Ubah Foto</span>
              </button>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-bold">
                  <Shield className="w-3.5 h-3.5" /> ADMINISTRATOR UTAMA
                </span>
                <span className="font-mono text-xs font-bold bg-black/40 px-2.5 py-0.5 rounded-full border border-cyan-400/30 text-cyan-200">
                  {adminBarcode}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{name}</h1>
              <p className="text-xs sm:text-sm text-cyan-200/80 mt-1">
                Akses Penuh Manajemen Sistem &bull; Klub Renang Tirta Samudra
              </p>

              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 px-3 py-1.5 rounded-xl shadow-md transition-all cursor-pointer"
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
              onClick={handleOpenAdminBarcode}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-cyan-300" />
              <span>Kartu Barcode Admin</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCard}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
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
                <User className="w-4 h-4 text-cyan-500" />
                Biodata &amp; Informasi Akun Admin
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Perbarui nama lengkap, username login, nomor kontak, atau ubah kata sandi
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              Hak Akses Superadmin
            </span>
          </div>

          {saveSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Biodata akun administrator berhasil disimpan ke sistem!</span>
            </div>
          )}

          <form onSubmit={handleSubmitProfile} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-500" />
                  Nama Lengkap Administrator
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Lengkap"
                  className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                  Username Login
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-500" />
                  Email Resmi
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@tirtasamudra.com"
                  className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

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
                  className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Optional Password update */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                Ganti Kata Sandi (Opsional)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Kosongkan jika tidak ingin mengubah password"
                  className="w-full px-3.5 py-2.5 pr-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Password saat ini tersimpan aman di akun Anda. Isi kolom di atas hanya bila ingin menggantinya.
              </p>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-slate-700 dark:text-slate-200 cursor-pointer flex items-center gap-2 transition-all"
              >
                <Camera className="w-4 h-4 text-cyan-500" />
                <span>Upload Foto Profil</span>
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs shadow-md shadow-cyan-600/30 flex items-center gap-2 cursor-pointer transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Profil Admin</span>
              </button>
            </div>
          </form>

          {/* Admin Privileges Badge Grid */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Hak Akses &amp; Wewenang Superadmin Aktif:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 text-indigo-900 dark:text-indigo-200 font-semibold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Kelola Kasir &amp; SPP</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-200 font-semibold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Manajemen Siswa</span>
              </div>
              <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/50 text-cyan-900 dark:text-cyan-200 font-semibold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span>Scanner Barcode</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-200 font-semibold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Cetak Semua Kartu</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Official Admin ID Card Preview */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-cyan-500" />
                Kartu ID Barcode Resmi
              </h3>
              <span className="text-[10px] font-bold text-slate-400">STAFF PASS</span>
            </div>

            {/* Visual Admin Card */}
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border border-indigo-500/30 p-4 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                    TS
                  </div>
                  <span className="font-extrabold text-[11px] tracking-tight">Tirta Samudra</span>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  ADMIN PASS
                </span>
              </div>

              <div className="flex items-center gap-3">
                {currentUser?.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-400 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 shrink-0">
                    <User className="w-8 h-8 text-cyan-300/90" />
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="font-black text-sm text-white truncate">{name}</h4>
                  <p className="font-mono text-xs font-bold text-cyan-300">{adminBarcode}</p>
                  <p className="text-[10px] text-cyan-100/70 mt-0.5 truncate">{email}</p>
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
                    {adminBarcode}
                  </span>
                  <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">● Status Aktif</span>
                </div>
              </div>
            </div>

            {/* Quick Barcode Copy */}
            <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">Nomor Barcode Admin:</span>
                <span className="font-mono font-extrabold text-xs text-slate-900 dark:text-white">
                  {adminBarcode}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyBarcode}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-cyan-600 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copiedBarcode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedBarcode ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={handleOpenAdminBarcode}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-600/20 cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Pratinjau &amp; Cetak Kartu Admin</span>
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
