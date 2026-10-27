import { toPng } from 'html-to-image';
import { Student, UserRole } from '../types';
import { ROLE_LABELS } from '../data/mockData';

export interface CardExportData {
  id: string;
  name: string;
  barcode: string;
  avatarUrl: string;
  roleClass: UserRole;
  age?: number;
  birthDate?: string;
  remainingQuota?: number;
  totalQuota?: number;
  parentName?: string;
  emergencyContact?: string;
  isStaff?: boolean;
  staffTitle?: string;
  roleBadge?: string;
  category?: 'student' | 'staff';
  specialty?: string;
  phone?: string;
  email?: string;
  joinedDate?: string;
  certifications?: string[];
  experienceYears?: number;
}

/**
 * Downloads a data URL as an image file on the user's device
 */
export const triggerImageDownload = (dataUrl: string, fileName: string) => {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Opens a print dialog specifically for the card image
 */
export const printImageDirectly = (dataUrl: string, studentName: string) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    // If popup blocked, create hidden iframe to print
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Cetak Kartu - ${studentName}</title>
          <style>
            @page { size: auto; margin: 10mm; }
            body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #fff; }
            img { max-width: 90mm; width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" onload="window.print();" />
        </body>
        </html>
      `);
      doc.close();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 3000);
    }
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Cetak Kartu Gambar - ${studentName}</title>
      <style>
        @page { size: auto; margin: 10mm; }
        body {
          margin: 0;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          font-family: system-ui, -apple-system, sans-serif;
          background-color: #f8fafc;
        }
        .container {
          text-align: center;
        }
        img {
          max-width: 95mm;
          width: 100%;
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        }
        .tip {
          margin-top: 15px;
          font-size: 12px;
          color: #64748b;
        }
        @media print {
          body { background: white; padding: 0; }
          .tip { display: none; }
          img { box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <img src="${dataUrl}" alt="Kartu Siswa" />
        <p class="tip">Ukuran kartu pas untuk ID Card PVC / Dompet Siswa. Klik Cetak / Print.</p>
      </div>
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
};

/**
 * Pure Canvas 2D fallback renderer
 * Guarantees zero CORS failures, 300 DPI high resolution, perfect typography and layout
 */
export const drawCardOnCanvas = (
  student: CardExportData | Student,
  qrDataUrl: string
): Promise<string> => {
  return new Promise((resolve) => {
    const width = 800;
    const height = 1100;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve('');
      return;
    }

    const isStaff = student.roleClass === 'admin' || student.roleClass === 'pelatih' || (student as CardExportData).isStaff;

    // Background Gradient based on student role class
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    if (student.roleClass === 'prestasi') {
      bgGradient.addColorStop(0, '#0c0a09');
      bgGradient.addColorStop(0.5, '#451a03');
      bgGradient.addColorStop(1, '#7f1d1d');
    } else if (student.roleClass === 'dasar') {
      bgGradient.addColorStop(0, '#082f49');
      bgGradient.addColorStop(0.5, '#0e7490');
      bgGradient.addColorStop(1, '#115e59');
    } else if (student.roleClass === 'pemula') {
      bgGradient.addColorStop(0, '#0f172a');
      bgGradient.addColorStop(0.5, '#1e3a8a');
      bgGradient.addColorStop(1, '#0369a1');
    } else if (student.roleClass === 'privat_4') {
      bgGradient.addColorStop(0, '#1e1b4b');
      bgGradient.addColorStop(0.5, '#4c1d95');
      bgGradient.addColorStop(1, '#312e81');
    } else if (student.roleClass === 'privat_8') {
      bgGradient.addColorStop(0, '#260618');
      bgGradient.addColorStop(0.5, '#831843');
      bgGradient.addColorStop(1, '#500724');
    } else if (student.roleClass === 'privat_12') {
      bgGradient.addColorStop(0, '#2a0808');
      bgGradient.addColorStop(0.5, '#991b1b');
      bgGradient.addColorStop(1, '#78350f');
    } else if (student.roleClass === 'pelatih') {
      bgGradient.addColorStop(0, '#022c22');
      bgGradient.addColorStop(0.5, '#115e59');
      bgGradient.addColorStop(1, '#064e3b');
    } else {
      bgGradient.addColorStop(0, '#0B132B');
      bgGradient.addColorStop(0.5, '#071A36');
      bgGradient.addColorStop(1, '#0C2E59');
    }
    ctx.fillStyle = bgGradient;

    // Rounded rectangle function helper
    const roundRect = (
      x: number,
      y: number,
      w: number,
      h: number,
      radius: number
    ) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    };

    // Class-specific color palette for printed card
    const getClassPalette = (role: string) => {
      switch (role) {
        case 'dasar': // Sky Aqua
          return {
            border: '#38bdf8',
            glow: 'rgba(56, 189, 248, 0.35)',
            topLine: 'rgba(56, 189, 248, 0.4)',
            logoFrom: '#38bdf8',
            logoTo: '#0d9488',
            titleColor: '#7dd3fc',
            badgeBg: 'rgba(56, 189, 248, 0.25)',
            badgeBorder: 'rgba(56, 189, 248, 0.7)',
            badgeText: '#e0f2fe',
            avatarBorder: '#38bdf8',
            idColor: '#bae6fd',
          };
        case 'pemula': // Ocean Cobalt
          return {
            border: '#3b82f6',
            glow: 'rgba(59, 130, 246, 0.35)',
            topLine: 'rgba(59, 130, 246, 0.4)',
            logoFrom: '#60a5fa',
            logoTo: '#2563eb',
            titleColor: '#93c5fd',
            badgeBg: 'rgba(59, 130, 246, 0.25)',
            badgeBorder: 'rgba(59, 130, 246, 0.7)',
            badgeText: '#eff6ff',
            avatarBorder: '#3b82f6',
            idColor: '#bfdbfe',
          };
        case 'prestasi': // Champion Flame Gold / Amber
          return {
            border: '#f59e0b',
            glow: 'rgba(245, 158, 11, 0.4)',
            topLine: 'rgba(245, 158, 11, 0.45)',
            logoFrom: '#fbbf24',
            logoTo: '#ea580c',
            titleColor: '#fde68a',
            badgeBg: 'rgba(245, 158, 11, 0.3)',
            badgeBorder: 'rgba(245, 158, 11, 0.8)',
            badgeText: '#fffbeb',
            avatarBorder: '#f59e0b',
            idColor: '#fef3c7',
          };
        case 'privat_4': // Royal Purple
          return {
            border: '#a855f7',
            glow: 'rgba(168, 85, 247, 0.35)',
            topLine: 'rgba(168, 85, 247, 0.4)',
            logoFrom: '#c084fc',
            logoTo: '#7e22ce',
            titleColor: '#e9d5ff',
            badgeBg: 'rgba(168, 85, 247, 0.25)',
            badgeBorder: 'rgba(168, 85, 247, 0.7)',
            badgeText: '#faf5ff',
            avatarBorder: '#a855f7',
            idColor: '#f3e8ff',
          };
        case 'privat_8': // Fuchsia Magenta
          return {
            border: '#ec4899',
            glow: 'rgba(236, 72, 153, 0.35)',
            topLine: 'rgba(236, 72, 153, 0.4)',
            logoFrom: '#f472b6',
            logoTo: '#be185d',
            titleColor: '#fbcfe8',
            badgeBg: 'rgba(236, 72, 153, 0.25)',
            badgeBorder: 'rgba(236, 72, 153, 0.7)',
            badgeText: '#fdf2f8',
            avatarBorder: '#ec4899',
            idColor: '#fce7f3',
          };
        case 'privat_12': // Crimson Ruby & Sunset Red
          return {
            border: '#f43f5e',
            glow: 'rgba(244, 63, 94, 0.4)',
            topLine: 'rgba(244, 63, 94, 0.45)',
            logoFrom: '#fb7185',
            logoTo: '#b91c1c',
            titleColor: '#fecdd3',
            badgeBg: 'rgba(244, 63, 94, 0.3)',
            badgeBorder: 'rgba(244, 63, 94, 0.8)',
            badgeText: '#fff1f2',
            avatarBorder: '#f43f5e',
            idColor: '#ffe4e6',
          };
        case 'pelatih': // Emerald
          return {
            border: '#10b981',
            glow: 'rgba(16, 185, 129, 0.35)',
            topLine: 'rgba(16, 185, 129, 0.4)',
            logoFrom: '#34d399',
            logoTo: '#059669',
            titleColor: '#a7f3d0',
            badgeBg: 'rgba(16, 185, 129, 0.25)',
            badgeBorder: 'rgba(16, 185, 129, 0.7)',
            badgeText: '#ecfdf5',
            avatarBorder: '#10b981',
            idColor: '#d1fae5',
          };
        default: // Admin / Default Indigo
          return {
            border: '#6366f1',
            glow: 'rgba(99, 102, 241, 0.35)',
            topLine: 'rgba(99, 102, 241, 0.4)',
            logoFrom: '#818cf8',
            logoTo: '#4f46e5',
            titleColor: '#c7d2fe',
            badgeBg: 'rgba(99, 102, 241, 0.25)',
            badgeBorder: 'rgba(99, 102, 241, 0.7)',
            badgeText: '#eef2ff',
            avatarBorder: '#6366f1',
            idColor: '#e0e7ff',
          };
      }
    };

    const palette = getClassPalette(student.roleClass);

    // Draw main card body with rounded corners
    roundRect(0, 0, width, height, 48);
    ctx.fill();

    // Class-specific subtle border
    ctx.lineWidth = 4;
    ctx.strokeStyle = palette.border;
    ctx.stroke();

    // Decorative radial gradient light
    const radial = ctx.createRadialGradient(width, 0, 10, width, 0, 400);
    radial.addColorStop(0, palette.glow);
    radial.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);

    // Header section
    // Top Bar line
    ctx.fillStyle = palette.topLine;
    ctx.fillRect(40, 120, width - 80, 2);

    // Club Logo Emblem
    roundRect(40, 36, 68, 68, 20);
    const logoGrad = ctx.createLinearGradient(40, 36, 108, 104);
    logoGrad.addColorStop(0, palette.logoFrom);
    logoGrad.addColorStop(1, palette.logoTo);
    ctx.fillStyle = logoGrad;
    ctx.fill();

    // Water wave icon in logo
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('🌊', 52, 84);

    // Title & Club text
    ctx.fillStyle = palette.titleColor;
    ctx.font = 'bold 28px sans-serif';
    const mainTitle = isStaff
      ? (student.roleClass === 'admin' ? 'AQUAFLOW ADMIN PASS' : 'AQUAFLOW COACH PASS')
      : 'AQUAFLOW PASS';
    ctx.fillText(mainTitle, 124, 68);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '500 18px sans-serif';
    ctx.fillText('Tirta Samudra Swimming Club', 124, 96);

    // Role / Class Badge
    const classInfo = ROLE_LABELS[student.roleClass] || { textBadge: 'SISWA' };
    const badgeText = isStaff
      ? (student.roleClass === 'admin' ? 'ADMIN UTAMA' : 'STAFF PELATIH')
      : classInfo.textBadge;
    ctx.font = 'bold 16px sans-serif';
    const badgeWidth = ctx.measureText(badgeText).width + 30;
    const badgeX = width - 40 - badgeWidth;

    roundRect(badgeX, 48, badgeWidth, 38, 19);
    ctx.fillStyle = palette.badgeBg;
    ctx.fill();
    ctx.strokeStyle = palette.badgeBorder;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = palette.badgeText;
    ctx.fillText(badgeText, badgeX + 15, 73);

    // Profile Info
    // Avatar placeholder / border
    roundRect(40, 150, 120, 120, 24);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = palette.avatarBorder;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw avatar image or person icon
    const drawAvatarOrInitials = () => {
      const continueDrawing = () => {
        // Name & ID
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px sans-serif';
        const truncatedName =
          student.name.length > 20
            ? student.name.substring(0, 18) + '...'
            : student.name;
        ctx.fillText(truncatedName, 180, 195);

        ctx.fillStyle = palette.idColor;
        ctx.font = '600 18px monospace';
        const idLabel = isStaff ? `BARCODE: ${student.barcode}` : `ID: ${student.id}`;
        ctx.fillText(idLabel, 180, 225);

        if (isStaff) {
          // Staff Tags: Specialty / Role & Phone
          const casted = student as CardExportData;
          const roleText = casted.specialty
            ? (casted.specialty.length > 22 ? casted.specialty.substring(0, 20) + '...' : casted.specialty)
            : (student.roleClass === 'admin' ? 'Administrator' : 'Pelatih Resmi');
          roundRect(180, 240, 180, 32, 8);
          ctx.fillStyle = '#1e293b';
          ctx.fill();
          ctx.fillStyle = '#cbd5e1';
          ctx.font = '500 14px sans-serif';
          ctx.fillText(roleText, 192, 262);

          const phoneText = casted.phone || '0812-3456-7890';
          roundRect(370, 240, 150, 32, 8);
          ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.fillStyle = '#6ee7b7';
          ctx.font = 'bold 14px sans-serif';
          ctx.fillText(phoneText, 382, 262);
        } else {
          // Student Age & Quota Tags
          const std = student as Student;
          const ageText = `Usia ${std.age ?? 10} Th`;
          roundRect(180, 240, 110, 32, 8);
          ctx.fillStyle = '#1e293b';
          ctx.fill();
          ctx.fillStyle = '#cbd5e1';
          ctx.font = '500 16px sans-serif';
          ctx.fillText(ageText, 192, 262);

          // Quota Tag
          const quotaText = `${std.remainingQuota ?? 10} / ${std.totalQuota ?? 12} Sesi`;
          roundRect(300, 240, 130, 32, 8);
          ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.fillStyle = '#6ee7b7';
          ctx.font = 'bold 16px sans-serif';
          ctx.fillText(quotaText, 312, 262);
        }

        // QR Code & Barcode Section Container (White card inside)
        const whiteBoxY = 300;
        const whiteBoxH = 680;
        roundRect(40, whiteBoxY, width - 80, whiteBoxH, 28);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // White box header
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 18px sans-serif';
        const boxHeader = isStaff ? 'SCAN IDENTIFIKASI & OTORISASI KOLAM' : 'SCAN PRESENSI & LOGIN KOLAM';
        ctx.fillText(boxHeader, 70, whiteBoxY + 45);

        roundRect(width - 40 - 160, whiteBoxY + 22, 130, 32, 16);
        ctx.fillStyle = '#dcfce7';
        ctx.fill();
        ctx.fillStyle = '#16a34a';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('STATUS AKTIF', width - 40 - 145, whiteBoxY + 43);

        // Draw QR Code
        const qrImg = new Image();
        qrImg.onload = () => {
          // Centered QR Code
          const qrSize = 340;
          const qrX = (width - qrSize) / 2;
          const qrY = whiteBoxY + 70;
          ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

          // Barcode Lines
          const barcodeY = qrY + qrSize + 40;
          const codeString = student.barcode || 'AQUA-001';

          ctx.fillStyle = '#0f172a';
          let startX = 140;
          const availableWidth = width - 280;
          const charCount = codeString.length;

          for (let i = 0; i < codeString.length; i++) {
            const charCode = codeString.charCodeAt(i);
            const w1 = ((charCode % 3) + 1.2) * 2.2;
            const gap = (((charCode >> 1) % 2) + 1.5) * 2;
            const w2 = ((charCode % 2) + 1) * 2;

            ctx.fillRect(startX, barcodeY, w1, 65);
            startX += w1 + gap;
            ctx.fillRect(startX, barcodeY, w2, 65);
            startX += w2 + 4;
          }

          // Barcode Text underneath
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 28px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`*${student.barcode}*`, width / 2, barcodeY + 110);
          ctx.textAlign = 'left';

          // Instructions in white box
          ctx.fillStyle = '#64748b';
          ctx.font = '500 16px sans-serif';
          ctx.textAlign = 'center';
          const instructionText = isStaff
            ? 'Kartu Pengenal Resmi Staff / Pelatih Tirta Samudra Swimming Club'
            : 'Arahkan ke Kamera atau Tembak Scanner Barcode Kabel/Bluetooth';
          ctx.fillText(instructionText, width / 2, barcodeY + 145);
          ctx.textAlign = 'left';

          // Footer info
          ctx.fillStyle = palette.titleColor;
          ctx.font = '500 18px sans-serif';
          if (isStaff) {
            const casted = student as CardExportData;
            ctx.fillText(`No. Telp: ${casted.phone || '-'}`, 45, 1030);
            ctx.textAlign = 'right';
            ctx.fillText(`Email: ${casted.email || 'info@tirta.com'}`, width - 45, 1030);
            ctx.textAlign = 'left';
          } else {
            const std = student as any;
            const waliText = `Wali: ${std.parentName || '-'}`;
            const birthText = std.birthDate ? ` • Lahir: ${std.birthDate}` : '';
            ctx.fillText(`${waliText}${birthText}`, 45, 1030);
            ctx.textAlign = 'right';
            ctx.fillText(`Darurat: ${std.emergencyContact || '-'}`, width - 45, 1030);
            ctx.textAlign = 'left';
          }

          ctx.fillStyle = palette.topLine;
          ctx.fillRect(40, 1055, width - 80, 1);

          ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
          ctx.font = '14px monospace';
          ctx.textAlign = 'center';
          const footerTag = isStaff ? 'Official Tirta Samudra Staff Pass ID' : 'Official Tirta Samudra Smart Pass ID';
          ctx.fillText(footerTag, width / 2, 1080);

          resolve(canvas.toDataURL('image/png'));
        };

        qrImg.onerror = () => {
          resolve(canvas.toDataURL('image/png'));
        };

        qrImg.src = qrDataUrl;
      };

      const drawPersonIcon = () => {
        ctx.save();
        roundRect(40, 150, 120, 120, 24);
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.strokeStyle = palette.avatarBorder;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.clip();

        // Icon orang (Person icon)
        ctx.fillStyle = '#94a3b8';
        // Lingkaran kepala
        ctx.beginPath();
        ctx.arc(100, 192, 22, 0, Math.PI * 2);
        ctx.fill();
        // Badan / bahu
        ctx.beginPath();
        ctx.ellipse(100, 252, 40, 28, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
        continueDrawing();
      };

      if (!student.avatarUrl || !student.avatarUrl.trim()) {
        drawPersonIcon();
        return;
      }

      const avatarImg = new Image();
      avatarImg.crossOrigin = 'anonymous';

      avatarImg.onload = () => {
        ctx.save();
        roundRect(40, 150, 120, 120, 24);
        ctx.clip();
        ctx.drawImage(avatarImg, 40, 150, 120, 120);
        ctx.restore();
        continueDrawing();
      };

      avatarImg.onerror = () => {
        drawPersonIcon();
      };

      avatarImg.src = student.avatarUrl;
    };

    drawAvatarOrInitials();
  });
};

/**
 * High-level export function
 * First tries html-to-image DOM screenshot, then falls back to canvas 2D
 */
export const exportCardToImageDataUrl = async (
  elementId: string,
  student: CardExportData | Student,
  qrDataUrl: string
): Promise<string> => {
  const el = document.getElementById(elementId);
  if (el) {
    try {
      const dataUrl = await toPng(el, {
        quality: 0.98,
        pixelRatio: 2.5,
        cacheBust: true,
        backgroundColor: '#0B132B',
      });
      return dataUrl;
    } catch (domError) {
      console.warn('html-to-image error, using canvas fallback:', domError);
    }
  }

  // Canvas fallback
  return drawCardOnCanvas(student, qrDataUrl);
};

