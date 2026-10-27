import React from 'react';
import { Waves, Heart, ShieldCheck, Sparkles } from 'lucide-react';
import { AcademyProfile } from '../types';

interface AppFooterProps {
  academyProfile?: AcademyProfile;
  className?: string;
  variant?: 'minimal' | 'full';
}

export const AppFooter: React.FC<AppFooterProps> = ({
  academyProfile,
  className = '',
  variant = 'full',
}) => {
  const currentYear = new Date().getFullYear();
  const academyName = academyProfile?.name || 'AquaFlow Swimming Academy';
  const footerOwner = academyProfile?.footerName || 'Yohes';

  if (variant === 'minimal') {
    return (
      <footer className={`py-4 px-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 ${className}`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium">
            <Waves className="w-4 h-4 text-cyan-500" />
            <span>&copy; {currentYear} {academyName}</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
            <span>Dikelola &amp; Dikembangkan atas nama</span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold border border-cyan-500/20">
              {footerOwner}
            </span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={`bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-10 pb-6 text-slate-600 dark:text-slate-300 transition-colors ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-200/80 dark:border-slate-800/80">
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                <Waves className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
                  {academyName}
                </span>
                <span className="block text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">
                  Sistem Presensi &amp; Manajemen Terintegrasi
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              {academyProfile?.description ||
                'Akademi renang modern dengan kurikulum profesional, absensi barcode instan, sistem multi-role, dan pendaftaran online.'}
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Sistem Absensi Barcode Presisi &amp; PWA Ready</span>
            </div>
          </div>

          {/* Col 2: Informasi Kolam & Operasional */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              Lokasi &amp; Jam Latihan
            </h4>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              {academyProfile?.address || 'Kompleks Olahraga Tirta Prima, Jl. Danau Biru No. 88, Jakarta'}
            </p>
            <p className="font-medium text-slate-700 dark:text-slate-300">
              {academyProfile?.operatingHours || 'Setiap Hari: 06:00 - 20:00 WIB'}
            </p>
          </div>

          {/* Col 3: Hubungi Kami */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              Layanan Informasi
            </h4>
            <p className="text-slate-500 dark:text-slate-400">
              WhatsApp:{' '}
              <a
                href={`https://wa.me/${academyProfile?.whatsapp?.replace(/[^0-9]/g, '') || '6281234567890'}`}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline"
              >
                {academyProfile?.whatsapp || '0812-3456-7890'}
              </a>
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              Telepon: {academyProfile?.phone || '(021) 7892-4455'}
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              Email: {academyProfile?.email || 'info@aquaflow-academy.id'}
            </p>
          </div>
        </div>

        {/* Bottom Bar: Mandatory Footer Atas Nama Yohes */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <span>&copy; {currentYear} {academyName}. Seluruh Hak Cipta Dilindungi.</span>
          </div>

          {/* Identity credit Yohes */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="text-slate-600 dark:text-slate-300">
              Semua sistem dikelola &amp; dibangun dengan
            </span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span className="font-bold text-slate-900 dark:text-white">
              atas nama <span className="text-cyan-600 dark:text-cyan-400">{footerOwner}</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
