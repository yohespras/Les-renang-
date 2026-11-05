import React, { useEffect, useState } from 'react';
import {
  Download,
  Share2,
  Printer,
  X,
  CheckCircle2,
  ExternalLink,
  Smartphone,
} from 'lucide-react';
import {
  shareImageFileUniversal,
  printImageDirectly,
  triggerImageDownload,
} from '../services/cardImageExport';

interface DownloadPayload {
  dataUrl: string;
  blobUrl: string;
  fileName: string;
}

export const UniversalDownloadModal: React.FC = () => {
  const [payload, setPayload] = useState<DownloadPayload | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  useEffect(() => {
    const handleUniversalDownload = (e: Event) => {
      const customEvent = e as CustomEvent<DownloadPayload>;
      if (customEvent.detail) {
        setPayload(customEvent.detail);
        setShareStatus(null);
      }
    };

    window.addEventListener('aqua:universal-file-download', handleUniversalDownload);
    return () => {
      window.removeEventListener('aqua:universal-file-download', handleUniversalDownload);
    };
  }, []);

  if (!payload) return null;

  const handleClose = () => {
    if (payload.blobUrl) {
      setTimeout(() => URL.revokeObjectURL(payload.blobUrl), 5000);
    }
    setPayload(null);
  };

  const handleNativeShareOrSave = async () => {
    const ok = await shareImageFileUniversal(payload.dataUrl, payload.fileName);
    if (ok) {
      setShareStatus('Berhasil membuka menu Simpan / Bagikan perangkat!');
    } else {
      // Fallback: trigger direct download
      triggerImageDownload(payload.dataUrl, payload.fileName, true);
      setShareStatus('File sedang diunduh. Anda juga dapat menekan tahan gambar di bawah lalu pilih "Simpan Gambar".');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-cyan-500/40 p-5 sm:p-6 shadow-2xl text-white flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                Siap Disimpan di Perangkat Anda
              </h3>
              <p className="text-[11px] text-slate-400">
                Mendukung HP Android, iPhone/iPad (iOS), Tablet &amp; Laptop/PC
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto space-y-4 py-4 flex-1">
          {/* Action Buttons for Any Device */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a
              href={payload.blobUrl || payload.dataUrl}
              download={payload.fileName}
              onClick={() => {
                setShareStatus('Unduhan file PNG dimulai...');
              }}
              className="py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer text-center"
            >
              <Download className="w-4 h-4" />
              <span>Download File (PNG HD)</span>
            </a>

            <button
              type="button"
              onClick={handleNativeShareOrSave}
              className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Simpan ke Galeri / WA</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <a
              href={payload.blobUrl || payload.dataUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka di Tab Baru</span>
            </a>

            <button
              type="button"
              onClick={() => printImageDirectly(payload.dataUrl, payload.fileName)}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cetak Kartu</span>
            </button>
          </div>

          {shareStatus && (
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold text-center">
              {shareStatus}
            </div>
          )}

          {/* Universal Mobile Tip + Long-Press Image Preview */}
          <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 text-center space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] font-bold">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Tips HP (iPhone / Android / Browser WA): Tekan &amp; Tahan Gambar untuk Simpan</span>
            </div>

            <div className="flex justify-center">
              <img
                src={payload.dataUrl}
                alt={payload.fileName}
                className="max-h-[42vh] w-auto object-contain rounded-2xl border border-cyan-500/30 shadow-xl select-all"
              />
            </div>

            <p className="text-[10px] text-slate-400 font-mono truncate px-2">
              {payload.fileName}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all cursor-pointer"
          >
            Selesai &amp; Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
