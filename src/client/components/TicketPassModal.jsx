import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, MapPin, Copy, Check, Printer, ShieldCheck } from 'lucide-react';

export function TicketPassModal({ ticket, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !ticket) return null;

  const { event, tier, quantity, qrCode, bookingId } = ticket;

  const handleCopyCode = () => {
    if (qrCode) {
      navigator.clipboard.writeText(qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        id="ticket-pass-container"
        className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 shadow-xl relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs uppercase tracking-wider font-bold text-zinc-800 dark:text-zinc-200">
              Confirmed Digital Pass #{bookingId}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <span className="inline-block px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 mb-2">
              General Admission Pass
            </span>
            <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 leading-tight">
              {event?.title}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              <MapPin className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
              <span>{event?.venue}</span>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="my-6 p-6 bg-white border border-zinc-200 dark:border-zinc-700 text-center flex flex-col items-center justify-center shadow-inner">
            <QRCodeSVG
              value={qrCode || 'EVENTPULSE-DEMO-PASS'}
              size={180}
              level="H"
              fgColor="#18181b"
              bgColor="#ffffff"
            />
            <span className="mt-3 text-xs font-mono font-bold text-zinc-800">
              {qrCode}
            </span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">
              Door Validation Scan
            </span>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 mb-6">
            <div>
              <span className="text-zinc-400 dark:text-zinc-500 uppercase text-[10px] font-bold block">Tier</span>
              <strong className="text-zinc-900 dark:text-zinc-100">{tier?.tier_name}</strong>
            </div>
            <div>
              <span className="text-zinc-400 dark:text-zinc-500 uppercase text-[10px] font-bold block">Quantity</span>
              <strong className="text-zinc-900 dark:text-zinc-100">{quantity} Seat(s)</strong>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCopyCode}
              className="flex-1 py-2.5 px-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy Code'}
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print Pass
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
