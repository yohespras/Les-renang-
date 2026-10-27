import React, { useState } from 'react';
import {
  AcademyProfile,
  StudentRegistration,
  Student,
  AuthUser,
  UserRole,
  ClassPricingPackage,
  GalleryItem,
} from '../../types';
import { ROLE_LABELS } from '../../data/mockData';
import { maskPhone, maskParentName, maskBirthDate } from '../../services/privacyUtils';
import {
  Building2,
  Globe,
  Image as ImageIcon,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  Coins,
  CheckCircle2,
  XCircle,
  AlertCircle,
  UserPlus,
  Trash2,
  Save,
  Sparkles,
  ExternalLink,
  Users,
  Search,
  Filter,
  Eye,
  Plus,
  RefreshCw,
  Upload,
  Camera,
  Calendar,
  X,
  Check,
  ChevronRight,
  Shield,
} from 'lucide-react';

interface AdminProfileSettingsProps {
  academyProfile: AcademyProfile;
  onUpdateAcademyProfile: (profile: AcademyProfile) => void;
  registrations: StudentRegistration[];
  onUpdateRegistration: (registration: StudentRegistration) => void;
  onDeleteRegistration: (regId: string) => void;
  onApproveAndCreateStudent: (
    registration: StudentRegistration,
    targetClass: UserRole,
    initialQuota: number
  ) => void;
  pricingPackages: ClassPricingPackage[];
  onViewPublicLanding?: () => void;
  galleryItems?: GalleryItem[];
  onAddGalleryItem?: (item: GalleryItem) => void;
  onDeleteGalleryItem?: (itemId: string) => void;
  initialSubSection?: 'profile' | 'registrations' | 'gallery';
}

export const AdminProfileSettings: React.FC<AdminProfileSettingsProps> = ({
  academyProfile,
  onUpdateAcademyProfile,
  registrations = [],
  onUpdateRegistration,
  onDeleteRegistration,
  onApproveAndCreateStudent,
  pricingPackages,
  onViewPublicLanding,
  galleryItems = [],
  onAddGalleryItem,
  onDeleteGalleryItem,
  initialSubSection = 'profile',
}) => {
  // Active sub tab inside settings: 'profile', 'registrations', or 'gallery'
  const [activeSubSection, setActiveSubSection] = useState<'profile' | 'registrations' | 'gallery'>(initialSubSection);

  React.useEffect(() => {
    if (initialSubSection) {
      setActiveSubSection(initialSubSection);
    }
  }, [initialSubSection]);

  // Form states for profile
  const [name, setName] = useState(academyProfile.name);
  const [tagline, setTagline] = useState(academyProfile.tagline);
  const [description, setDescription] = useState(academyProfile.description);
  const [aboutStory, setAboutStory] = useState(academyProfile.aboutStory);
  const [logoUrl, setLogoUrl] = useState(academyProfile.logoUrl);
  const [heroImageUrl, setHeroImageUrl] = useState(academyProfile.heroImageUrl);
  const [phone, setPhone] = useState(academyProfile.phone);
  const [whatsapp, setWhatsapp] = useState(academyProfile.whatsapp);
  const [email, setEmail] = useState(academyProfile.email);
  const [address, setAddress] = useState(academyProfile.address);
  const [operatingHours, setOperatingHours] = useState(academyProfile.operatingHours);
  const [registrationFee, setRegistrationFee] = useState(academyProfile.registrationFee);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(academyProfile.isRegistrationOpen);
  const [footerName, setFooterName] = useState(academyProfile.footerName || 'Yohes');
  const [facilities, setFacilities] = useState<string[]>(academyProfile.facilities);
  const [newFacilityInput, setNewFacilityInput] = useState('');

  // Filter state for registrations
  const [regFilterStatus, setRegFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [regSearchQuery, setRegSearchQuery] = useState('');
  const [privacyMaskRegistrations, setPrivacyMaskRegistrations] = useState(true);

  // Notification alert
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Quick Presets for Image & Logo
  const logoPresets = [
    {
      name: 'Logo Renang Biru',
      url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=200&auto=format&fit=crop&q=80',
    },
    {
      name: 'Logo Perenang Gaya Dada',
      url: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=200&auto=format&fit=crop&q=80',
    },
    {
      name: 'Logo Gelombang Cyan',
      url: 'https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?w=200&auto=format&fit=crop&q=80',
    },
  ];

  const heroPresets = [
    {
      name: 'Kolam Semi-Olympic Jernih',
      url: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=1600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Pelatih Renang Bersama Anak',
      url: 'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=1600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Kompetisi Jalur Olympic',
      url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Resort & Family Pool Terang',
      url: 'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=1600&auto=format&fit=crop&q=80',
    },
  ];

  // Upload loading & notice states
  const [uploadLoading, setUploadLoading] = useState<'logo' | 'hero' | null>(null);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  // Resize and compress image file to keep base64 compact & fast
  const processImageFile = (file: File, maxWidth = 1200, maxHeight = 900, quality = 0.85): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'hero') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Harap pilih file gambar (JPG, PNG, WEBP).');
      return;
    }

    try {
      setUploadLoading(target);
      const dataUrl = await processImageFile(file, target === 'logo' ? 400 : 1400, target === 'logo' ? 400 : 800);
      if (target === 'logo') {
        setLogoUrl(dataUrl);
        setUploadNotice('Foto Logo akademi berhasil diunggah!');
      } else {
        setHeroImageUrl(dataUrl);
        setUploadNotice('Foto Hero Banner kolam berhasil diunggah!');
      }
      setTimeout(() => setUploadNotice(null), 3500);
    } catch (err) {
      console.error('Gagal upload gambar:', err);
      alert('Gagal memproses file foto. Silakan coba file lain.');
    } finally {
      setUploadLoading(null);
      e.target.value = '';
    }
  };

  // Gallery Management States
  const [showAddGalleryModal, setShowAddGalleryModal] = useState(false);
  const [galleryFilterCategory, setGalleryFilterCategory] = useState<string>('all');
  const [newGalleryData, setNewGalleryData] = useState({
    title: '',
    category: 'dasar' as GalleryItem['category'],
    imageUrl: '',
    caption: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [galleryImageUploading, setGalleryImageUploading] = useState(false);

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setGalleryImageUploading(true);
      const dataUrl = await processImageFile(file, 1000, 700);
      setNewGalleryData((prev) => ({ ...prev, imageUrl: dataUrl }));
    } catch (err) {
      console.error(err);
      alert('Gagal memproses foto.');
    } finally {
      setGalleryImageUploading(false);
      e.target.value = '';
    }
  };

  const handleCreateGalleryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryData.imageUrl) {
      alert('Silakan upload foto atau masukkan URL gambar!');
      return;
    }
    const catLabels: Record<GalleryItem['category'], string> = {
      dasar: 'Kelas Dasar & Balita',
      pemula: 'Kelas Pemula',
      prestasi: 'Kelas Prestasi',
      privat: 'Kelas Privat',
      fun_safety: 'Water Safety & Fun',
      evaluasi: 'Evaluasi & Kenaikan Tingkat',
    };
    const newItem: GalleryItem = {
      id: `gal-${Date.now()}`,
      title: newGalleryData.title.trim() || 'Dokumentasi Latihan Renang',
      category: newGalleryData.category,
      categoryLabel: catLabels[newGalleryData.category],
      imageUrl: newGalleryData.imageUrl,
      caption: newGalleryData.caption.trim() || 'Aktivitas latihan renang siswa.',
      date: newGalleryData.date,
    };
    onAddGalleryItem?.(newItem);
    setShowAddGalleryModal(false);
    setNewGalleryData({
      title: '',
      category: 'dasar',
      imageUrl: '',
      caption: '',
      date: new Date().toISOString().split('T')[0],
    });
    setUploadNotice('Foto latihan berhasil ditambahkan ke Galeri!');
    setTimeout(() => setUploadNotice(null), 3500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AcademyProfile = {
      name: name.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      aboutStory: aboutStory.trim(),
      logoUrl: logoUrl.trim(),
      heroImageUrl: heroImageUrl.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim(),
      address: address.trim(),
      operatingHours: operatingHours.trim(),
      registrationFee: Number(registrationFee) || 0,
      isRegistrationOpen,
      facilities,
      footerName: footerName.trim() || 'Yohes',
    };

    onUpdateAcademyProfile(updated);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3500);
  };

  const handleAddFacility = () => {
    if (!newFacilityInput.trim()) return;
    setFacilities([...facilities, newFacilityInput.trim()]);
    setNewFacilityInput('');
  };

  const handleRemoveFacility = (index: number) => {
    setFacilities(facilities.filter((_, i) => i !== index));
  };

  // Filter registrations
  const filteredRegistrations = registrations.filter((reg) => {
    const matchStatus = regFilterStatus === 'all' || reg.status === regFilterStatus;
    const matchQuery =
      reg.fullName.toLowerCase().includes(regSearchQuery.toLowerCase()) ||
      reg.id.toLowerCase().includes(regSearchQuery.toLowerCase()) ||
      reg.phone.includes(regSearchQuery) ||
      reg.parentName.toLowerCase().includes(regSearchQuery.toLowerCase());
    return matchStatus && matchQuery;
  });

  const pendingCount = registrations.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950 to-blue-950 text-white shadow-xl border border-cyan-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Pengaturan Profil Akademi &amp; Pendaftaran
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Admin CMS
              </span>
            </div>
            <p className="text-xs sm:text-sm text-cyan-200/80 mt-1">
              Atur nama akademi, logo, foto banner, kontak, pendaftaran online, dan kelola pendaftar baru.
            </p>
          </div>
        </div>

        {onViewPublicLanding && (
          <button
            onClick={onViewPublicLanding}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold border border-white/20 backdrop-blur-md transition-all cursor-pointer"
          >
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Lihat Profil Publik Sebelum Login</span>
          </button>
        )}
      </div>

      {/* Sub Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubSection('profile')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubSection === 'profile'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Pengaturan Profil, Nama &amp; Gambar</span>
        </button>

        <button
          onClick={() => setActiveSubSection('registrations')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 relative ${
            activeSubSection === 'registrations'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Inbox Pendaftar Murid Baru</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubSection('gallery')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 relative ${
            activeSubSection === 'gallery'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Galeri Latihan ({galleryItems.length})</span>
        </button>
      </div>

      {/* SECTION 1: PROFILE, BRANDING & CMS SETTINGS */}
      {activeSubSection === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6 animate-fadeIn">
          {saveSuccessNotice && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm flex items-center gap-3 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <strong>Pengaturan Berhasil Disimpan!</strong>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Perubahan nama, logo, gambar, kontak, dan footer atas nama {footerName} telah aktif di seluruh halaman publik dan dashboard.
                </p>
              </div>
            </div>
          )}

          {/* 1. Identitas Akademi */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-cyan-500" />
              <span>Identitas &amp; Slogan Akademi</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nama Akademi / Sekolah Renang *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: AquaFlow Swimming Academy"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tagline / Slogan Utama *
                </label>
                <input
                  type="text"
                  required
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Contoh: Mencetak Perenang Tangguh & Berprestasi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Deskripsi Singkat (Tampil di Hero Section)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi singkat yang memikat calon murid..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Cerita Profil &amp; Visi Misi (Tampil di Bagian Profil)
              </label>
              <textarea
                rows={3}
                value={aboutStory}
                onChange={(e) => setAboutStory(e.target.value)}
                placeholder="Sejarah berdirinya akademi, komitmen keselamatan, kurikulum..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
              />
            </div>

            {/* Nama Pemilik di Footer (Mandatory requirement) */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-cyan-900 dark:text-cyan-200 block">
                    Nama Penanggung Jawab / Pemilik di Footer *
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Akan ditampilkan di seluruh footer sistem: <em>"Semua sistem dikelola atas nama {footerName}"</em>
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={footerName}
                  onChange={(e) => setFooterName(e.target.value)}
                  placeholder="Yohes"
                  className="w-full sm:w-48 px-3.5 py-2 rounded-xl border border-cyan-300 dark:border-cyan-700 bg-white dark:bg-slate-800 text-sm font-bold text-cyan-700 dark:text-cyan-300 focus:ring-2 focus:ring-cyan-500 outline-none text-center"
                />
              </div>
            </div>
          </div>

          {/* 2. Media Visual, Logo & Banner (Dapat Diupload dari File Foto) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-cyan-500" />
                  <span>Gambar Logo &amp; Hero Banner Kolam Renang</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Bisa di-edit dengan <strong>meng-upload file foto dari perangkat (HP/Komputer)</strong> atau memasukkan URL gambar.
                </p>
              </div>
              {uploadNotice && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 animate-fadeIn">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {uploadNotice}
                </span>
              )}
            </div>

            {/* Logo Settings with File Upload */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Logo Resmi Akademi (Tampil di Navbar, Kartu Member &amp; Footer)
                </label>
                {logoUrl && logoUrl.startsWith('data:') && (
                  <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md">
                    ✓ Menggunakan Foto Upload Lokal
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <div className="relative group shrink-0">
                  <img
                    src={logoUrl || 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=200&auto=format&fit=crop&q=80'}
                    alt="Preview Logo"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-500/60 shadow-md ring-4 ring-cyan-500/10"
                  />
                  <label
                    htmlFor="logo-file-input"
                    className="absolute inset-0 bg-black/50 text-white rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold"
                  >
                    <Camera className="w-5 h-5 mb-0.5 text-cyan-300" />
                    <span>Ganti Foto</span>
                  </label>
                </div>

                <div className="flex-1 w-full space-y-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <input
                      type="file"
                      id="logo-file-input"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'logo')}
                      className="hidden"
                    />
                    <label
                      htmlFor="logo-file-input"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{uploadLoading === 'logo' ? 'Memproses...' : 'Upload Foto Logo Baru'}</span>
                    </label>

                    {logoUrl && logoUrl.startsWith('data:') && (
                      <button
                        type="button"
                        onClick={() => setLogoUrl(logoPresets[0].url)}
                        className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-rose-100 text-slate-700 dark:text-slate-300 hover:text-rose-600 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Reset ke Default
                      </button>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Atau masukkan URL Logo langsung:</span>
                    <input
                      type="url"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
                <span className="font-semibold text-[11px]">Pilihan Cepat Logo:</span>
                {logoPresets.map((lp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setLogoUrl(lp.url)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/60 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    {lp.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Hero Image Settings with File Upload */}
            <div className="space-y-4 pt-5 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Foto Hero Banner Kolam Renang (Tampil di Header Landing Page &amp; Latar Belakang)
                </label>
                {heroImageUrl && heroImageUrl.startsWith('data:') && (
                  <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md">
                    ✓ Menggunakan Foto Upload Lokal
                  </span>
                )}
              </div>

              {/* Banner Preview & Click Upload */}
              <div className="relative rounded-2xl overflow-hidden aspect-[21/9] max-h-52 border-2 border-slate-200 dark:border-slate-700 group shadow-md">
                <img
                  src={heroImageUrl || 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=1600&auto=format&fit=crop&q=80'}
                  alt="Preview Hero Banner"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex flex-col justify-end p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-white text-xs font-extrabold block">Pratinjau Hero Banner Halaman Depan</span>
                      <span className="text-cyan-200 text-[11px]">Format rasio lebar (16:9 atau 21:9) paling optimal</span>
                    </div>

                    <input
                      type="file"
                      id="hero-file-input"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'hero')}
                      className="hidden"
                    />
                    <label
                      htmlFor="hero-file-input"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg transition-all cursor-pointer shrink-0"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{uploadLoading === 'hero' ? 'Mengunggah...' : 'Upload Foto Banner Kolam'}</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Atau masukkan URL Foto Banner:</span>
                  <input
                    type="url"
                    value={heroImageUrl}
                    onChange={(e) => setHeroImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-4 sm:pt-0">
                  <span className="font-semibold text-[11px] text-slate-500 w-full">Preset Foto Kolam:</span>
                  {heroPresets.map((hp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setHeroImageUrl(hp.url)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/60 text-slate-700 dark:text-slate-300 text-[10px] font-medium border border-slate-200 dark:border-slate-700 cursor-pointer"
                    >
                      {hp.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Kontak, Lokasi & Fasilitas */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Phone className="w-5 h-5 text-cyan-500" />
              <span>Kontak &amp; Lokasi Kolam</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nomor WhatsApp Admin (Untuk Notifikasi Pendaftaran) *
                </label>
                <input
                  type="text"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="0812-3456-7890"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Telepon Kantor
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(021) 7892-4455"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Resmi
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@aquaflow-academy.id"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Alamat Lengkap Kolam Renang
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Kompleks Olahraga Tirta Prima, Jl. Danau Biru No. 88, Jakarta"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Jam Operasional Latihan
                </label>
                <input
                  type="text"
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  placeholder="Setiap Hari: 06:00 - 20:00 WIB"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
            </div>

            {/* Pendaftaran Settings */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Biaya Formulir Pendaftaran Murid Baru (IDR)
                </label>
                <input
                  type="number"
                  value={registrationFee}
                  onChange={(e) => setRegistrationFee(Number(e.target.value))}
                  placeholder="150000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Status Pendaftaran Online
                </label>
                <select
                  value={isRegistrationOpen ? 'true' : 'false'}
                  onChange={(e) => setIsRegistrationOpen(e.target.value === 'true')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-cyan-500 outline-none font-semibold"
                >
                  <option value="true">Buka (Calon murid dapat mendaftar online)</option>
                  <option value="false">Tutup Sementara (Kuota Penuh)</option>
                </select>
              </div>
            </div>

            {/* Fasilitas Management */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Daftar Fasilitas Kolam Renang (Tampil di Landing Page)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFacilityInput}
                  onChange={(e) => setNewFacilityInput(e.target.value)}
                  placeholder="Tambah fasilitas baru, misal: Sauna & Jacuzzi..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFacility();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddFacility}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {facilities.map((fac, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <span>{fac}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFacility(idx)}
                      className="text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Save Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-600/25 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Seluruh Pengaturan Profil</span>
            </button>
          </div>
        </form>
      )}

      {/* SECTION 2: REGISTRATION INBOX & APPROVAL */}
      {activeSubSection === 'registrations' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Controls bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={regSearchQuery}
                onChange={(e) => setRegSearchQuery(e.target.value)}
                placeholder="Cari nama, no. registrasi, no. WA..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setPrivacyMaskRegistrations(!privacyMaskRegistrations)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  privacyMaskRegistrations
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
                title="Sensor Privasi Data Pendaftar: Nomor WA disamarkan, nama orang tua disembunyikan 'xxx', dan tanggal lahir disamarkan"
              >
                {privacyMaskRegistrations ? (
                  <>
                    <Shield className="w-3.5 h-3.5 text-amber-500" />
                    <span>Privasi (xxx)</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>Buka Sensor</span>
                  </>
                )}
              </button>
              {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setRegFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    regFilterStatus === st
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {st === 'all'
                    ? 'Semua'
                    : st === 'pending'
                    ? `Menunggu (${pendingCount})`
                    : st === 'approved'
                    ? 'Disetujui'
                    : 'Ditolak'}
                </button>
              ))}
            </div>
          </div>

          {/* Registrations List */}
          {filteredRegistrations.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500">
              <UserPlus className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="font-bold text-sm">Belum ada pendaftaran dengan kriteria ini.</p>
              <p className="text-xs text-slate-400 mt-1">
                Pendaftar yang mengisi formulir online di halaman profil akan otomatis muncul di sini.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRegistrations.map((reg) => {
                const pkg = pricingPackages.find((p) => p.roleClass === reg.roleClass);
                const initialQuota = pkg?.sessionsCount || 12;

                return (
                  <div
                    key={reg.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-cyan-500/40 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                  >
                    {/* Left: Registration Details */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                          {reg.id}
                        </span>
                        <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                          {reg.fullName} ({reg.nickname})
                        </h4>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          &bull; Usia: {reg.age} Tahun &bull; Tgl Lahir:{' '}
                          {privacyMaskRegistrations ? maskBirthDate(reg.birthDate) : reg.birthDate} &bull;{' '}
                          {reg.gender}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            reg.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                              : reg.status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                          }`}
                        >
                          {reg.status === 'pending'
                            ? 'Menunggu Persetujuan'
                            : reg.status === 'approved'
                            ? 'Sudah Disetujui (Siswa Aktif)'
                            : 'Ditolak'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-1">
                        <div>
                          <strong>Kelas Pilihan:</strong>{' '}
                          <span className="font-bold text-cyan-600 dark:text-cyan-400">
                            {ROLE_LABELS[reg.roleClass].title}
                          </span>
                        </div>
                        <div>
                          <strong>Orang Tua:</strong>{' '}
                          {privacyMaskRegistrations ? (
                            <span className="font-mono text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">
                              {maskParentName(reg.parentName)}
                            </span>
                          ) : (
                            reg.parentName
                          )}
                        </div>
                        <div>
                          <strong>WhatsApp:</strong>{' '}
                          {privacyMaskRegistrations ? (
                            <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                              {maskPhone(reg.phone)}
                            </span>
                          ) : (
                            <a
                              href={`https://wa.me/${reg.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                            >
                              {reg.phone}
                            </a>
                          )}
                        </div>
                      </div>

                      {reg.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                          Catatan: "{reg.notes}"
                        </p>
                      )}
                      {reg.medicalHistory && reg.medicalHistory !== 'Tidak ada riwayat penyakit' && (
                        <p className="text-xs text-rose-500 dark:text-rose-400">
                          Riwayat Medis: {reg.medicalHistory}
                        </p>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {/* WhatsApp Chat button */}
                      <a
                        href={`https://wa.me/${reg.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Halo Bapak/Ibu ${reg.parentName}, terima kasih telah mendaftar di ${academyProfile.name} untuk ananda ${reg.fullName} (No: ${reg.id}).`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Chat WA</span>
                      </a>

                      {/* Approve Button */}
                      {reg.status !== 'approved' && (
                        <button
                          onClick={() => onApproveAndCreateStudent(reg, reg.roleClass, initialQuota)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Setujui &amp; Jadikan Murid Aktif</span>
                        </button>
                      )}

                      {/* Reject/Delete */}
                      <button
                        onClick={() => {
                          if (window.confirm(`Hapus data pendaftaran ${reg.fullName}?`)) {
                            onDeleteRegistration(reg.id);
                          }
                        }}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Hapus Pendaftar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 3: GALERI LATIHAN AKADEMI (CMS FOTO AKTIVITAS)   */}
      {/* ======================================================== */}
      {activeSubSection === 'gallery' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header & Controls */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Camera className="w-5 h-5 text-cyan-500" />
                  <span>Koleksi Galeri Latihan &amp; Aktivitas Kolam</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  {galleryItems.length} Foto
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Upload foto kegiatan latihan anak, teknik 4 gaya, atlet prestasi, dan water safety yang ditampilkan di profil publik.
              </p>
            </div>

            <button
              onClick={() => setShowAddGalleryModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah / Upload Foto Latihan</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-bold">
            {[
              { id: 'all', label: 'Semua Kategori' },
              { id: 'dasar', label: 'Kelas Dasar & Balita' },
              { id: 'pemula', label: 'Kelas Pemula' },
              { id: 'prestasi', label: 'Kelas Prestasi' },
              { id: 'privat', label: 'Kelas Privat' },
              { id: 'fun_safety', label: 'Water Safety & Fun' },
              { id: 'evaluasi', label: 'Evaluasi & Ujian' },
            ].map((cat) => {
              const count = cat.id === 'all' ? galleryItems.length : galleryItems.filter((g) => g.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setGalleryFilterCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    galleryFilterCategory === cat.id
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${galleryFilterCategory === cat.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Photo Gallery Grid */}
          {galleryItems.filter((item) => galleryFilterCategory === 'all' || item.category === galleryFilterCategory).length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500">
              <Camera className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="font-bold text-sm">Belum ada foto latihan di kategori ini.</p>
              <p className="text-xs text-slate-400 mt-1">
                Klik tombol "Tambah / Upload Foto Latihan" di atas untuk menambahkan dokumentasi baru.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {galleryItems
                .filter((item) => galleryFilterCategory === 'all' || item.category === galleryFilterCategory)
                .map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-cyan-500/40 transition-all group"
                  >
                    <div>
                      {/* Image Thumbnail */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-950/70 text-cyan-300 backdrop-blur-md border border-cyan-500/30">
                            {item.categoryLabel}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-slate-950/70 text-slate-300 backdrop-blur-md">
                            {item.date}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-2">
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {item.caption}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 mt-2">
                      <span className="text-[11px] font-semibold text-slate-400">
                        Tampil di Publik
                      </span>
                      <button
                        onClick={() => {
                          if (window.confirm(`Hapus foto "${item.title}" dari galeri?`)) {
                            onDeleteGalleryItem?.(item.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Hapus Foto Galeri"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: TAMBAH FOTO GALERI LATIHAN BARU                   */}
      {/* ======================================================== */}
      {showAddGalleryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-cyan-500" />
                <span>Upload Foto Latihan ke Galeri</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddGalleryModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGalleryItem} className="space-y-4 text-xs">
              {/* Photo Upload Area */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Foto Dokumentasi Latihan *
                </label>

                {newGalleryData.imageUrl ? (
                  <div className="relative rounded-2xl overflow-hidden aspect-[16/9] border-2 border-cyan-500/50 mb-2 group">
                    <img
                      src={newGalleryData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setNewGalleryData((prev) => ({ ...prev, imageUrl: '' }))}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                      title="Ganti Foto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-center space-y-2">
                    <Camera className="w-8 h-8 mx-auto text-slate-400" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      Pilih file foto dari perangkat (HP / Komputer)
                    </p>
                    <input
                      type="file"
                      id="gallery-file-upload"
                      accept="image/*"
                      onChange={handleGalleryImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="gallery-file-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer shadow-sm transition-all"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{galleryImageUploading ? 'Memproses Foto...' : 'Pilih File Gambar'}</span>
                    </label>
                  </div>
                )}

                {/* Alternative URL */}
                <div className="mt-2">
                  <span className="text-[11px] text-slate-400 block mb-1">Atau tempel URL Gambar langsung:</span>
                  <input
                    type="url"
                    value={newGalleryData.imageUrl}
                    onChange={(e) => setNewGalleryData((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Judul Foto / Aktivitas *
                </label>
                <input
                  type="text"
                  required
                  value={newGalleryData.title}
                  onChange={(e) => setNewGalleryData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Contoh: Drill Kayuhan Gaya Bebas 25 Meter"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>

              {/* Category & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Kategori Latihan
                  </label>
                  <select
                    value={newGalleryData.category}
                    onChange={(e) => setNewGalleryData((prev) => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    <option value="dasar">Kelas Dasar &amp; Balita</option>
                    <option value="pemula">Kelas Pemula</option>
                    <option value="prestasi">Kelas Prestasi</option>
                    <option value="privat">Kelas Privat</option>
                    <option value="fun_safety">Water Safety &amp; Fun</option>
                    <option value="evaluasi">Evaluasi &amp; Kenaikan Tingkat</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Tanggal Latihan
                  </label>
                  <input
                    type="date"
                    value={newGalleryData.date}
                    onChange={(e) => setNewGalleryData((prev) => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>
              </div>

              {/* Caption */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Keterangan Singkat
                </label>
                <textarea
                  rows={2}
                  value={newGalleryData.caption}
                  onChange={(e) => setNewGalleryData((prev) => ({ ...prev, caption: e.target.value }))}
                  placeholder="Ceritakan momen latihan ini, teknik yang diajarkan, atau evaluasi pelatih..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700 text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddGalleryModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold cursor-pointer shadow-md shadow-cyan-600/20"
                >
                  Simpan ke Galeri Publik
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
