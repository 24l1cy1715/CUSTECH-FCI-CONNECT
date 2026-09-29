import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, Download, Share2, ExternalLink, QrCode } from 'lucide-react';
import { Button } from '@/components/common/Button';
import toast from 'react-hot-toast';

interface PortfolioShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  fullName: string;
  headline?: string | null;
  department?: string | null;
}

export const PortfolioShareModal: React.FC<PortfolioShareModalProps> = ({
  isOpen,
  onClose,
  username,
  fullName,
  headline,
  department,
}) => {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Build public URL - prefer production domain if on web, or current window location origin
  const baseUrl =
    window.location.hostname.includes('pages.dev') || window.location.hostname.includes('custech')
      ? window.location.origin
      : 'https://custech-fci-connect.pages.dev';
  const portfolioUrl = `${baseUrl}/u/${username}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(portfolioUrl);
      setCopied(true);
      toast.success('Portfolio link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${fullName} — CUSTECH FCI Portfolio`,
          text: `Check out ${fullName}'s technical portfolio on CUSTECH FCI Connect:`,
          url: portfolioUrl,
        });
        toast.success('Shared successfully!');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  const handleDownloadQR = () => {
    try {
      const svg = qrRef.current?.querySelector('svg');
      if (!svg) return;

      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      // High-res QR render
      canvas.width = 1000;
      canvas.height = 1000;

      img.onload = () => {
        if (!ctx) return;
        // Draw white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Draw QR
        ctx.drawImage(img, 100, 100, 800, 800);

        // Add branding footer
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${fullName} • CUSTECH FCI`, 500, 950);

        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `${username}-fci-portfolio-qr.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
        toast.success('QR Code downloaded!');
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (err) {
      console.error(err);
      toast.error('Could not download QR code image');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-text-muted hover:text-text hover:bg-surface-raised transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider">
            <QrCode className="w-3.5 h-3.5" />
            Digital Portfolio ID
          </div>
          <h3 className="font-display font-bold text-xl sm:text-2xl text-primary dark:text-white">
            Share Portfolio
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary">
            Scan to view verified student identity, skills, and projects.
          </p>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center">
          <div
            ref={qrRef}
            className="p-5 bg-white rounded-2xl shadow-lg border-4 border-accent/30 flex items-center justify-center"
          >
            <QRCodeSVG
              value={portfolioUrl}
              size={200}
              level="H"
              includeMargin={false}
              fgColor="#090d16"
              bgColor="#ffffff"
            />
          </div>
          <span className="mt-3 text-xs font-mono font-medium text-text-muted">
            /u/{username}
          </span>
        </div>

        {/* URL Pill & Copy */}
        <div className="flex items-center gap-2 p-2 bg-surface-raised border border-border rounded-xl text-left">
          <input
            type="text"
            readOnly
            value={portfolioUrl}
            className="flex-1 bg-transparent border-none text-xs font-mono text-text outline-none px-2 select-all truncate"
          />
          <Button
            size="sm"
            variant={copied ? 'secondary' : 'primary'}
            onClick={handleCopy}
            className="shrink-0 text-xs py-1.5 px-3"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            variant="outline"
            onClick={handleDownloadQR}
            className="w-full flex items-center justify-center gap-1.5 text-xs py-2.5"
          >
            <Download className="w-4 h-4" />
            Download QR
          </Button>
          <Button
            variant="primary"
            onClick={handleNativeShare}
            className="w-full flex items-center justify-center gap-1.5 text-xs py-2.5"
          >
            <Share2 className="w-4 h-4" />
            Share Portfolio
          </Button>
        </div>
      </div>
    </div>
  );
};
