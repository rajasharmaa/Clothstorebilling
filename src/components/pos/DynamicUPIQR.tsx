import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Sparkles,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  X,
  Edit3,
  Save,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { StorageService } from '../../lib/storage';

interface DynamicUPIQRProps {
  amount: number;
  upiId?: string;
  payeeName?: string;
  billNumber?: string;
  className?: string;
  compact?: boolean;
  onUpiUpdated?: (newUpiId: string, newPayeeName: string) => void;
}

export const DynamicUPIQR: React.FC<DynamicUPIQRProps> = ({
  amount,
  upiId: propUpiId,
  payeeName: propPayeeName,
  billNumber,
  className = '',
  compact = false,
  onUpiUpdated,
}) => {
  // Read current saved settings or fallback to props
  const savedSettings = StorageService.getSettings();
  const [currentUpiId, setCurrentUpiId] = useState<string>(
    propUpiId || savedSettings.upiId || '7000627153@upi'
  );
  const [currentPayeeName, setCurrentPayeeName] = useState<string>(
    propPayeeName || savedSettings.upiPayeeName || savedSettings.shopName || 'TARA COLLECTION'
  );

  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Edit UPI modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUpiInput, setEditUpiInput] = useState('');
  const [editPayeeInput, setEditPayeeInput] = useState('');

  // Keep in sync with prop changes
  useEffect(() => {
    if (propUpiId && propUpiId !== currentUpiId) {
      setCurrentUpiId(propUpiId);
    }
  }, [propUpiId]);

  useEffect(() => {
    if (propPayeeName && propPayeeName !== currentPayeeName) {
      setCurrentPayeeName(propPayeeName);
    }
  }, [propPayeeName]);

  // Generate UPI URI conforming to NPCI specification:
  // upi://pay?pa=<vpa>&pn=<name>&am=<amount>&cu=INR&tn=<note>
  const formattedAmount = Math.max(0, amount).toFixed(2);
  const transactionNote = billNumber ? `Bill ${billNumber}` : `Tara Collection Bill`;
  const upiUri = `upi://pay?pa=${encodeURIComponent(currentUpiId)}&pn=${encodeURIComponent(
    currentPayeeName
  )}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(upiUri, {
      width: isFullscreen ? 360 : 180,
      margin: 1,
      color: {
        dark: '#0f172a', // Deep slate
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (isMounted) setQrUrl(url);
      })
      .catch((err) => {
        console.error('Error generating UPI QR code:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [upiUri, isFullscreen, compact]);

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(currentUpiId);
    setCopied(true);
    toast.success(`UPI ID कॉपी किया: ${currentUpiId}`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenEditModal = () => {
    setEditUpiInput(currentUpiId);
    setEditPayeeInput(currentPayeeName);
    setIsEditModalOpen(true);
  };

  const handleSaveUpi = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUpi = editUpiInput.trim();
    if (!cleanUpi) {
      toast.error('कृपया मान्य UPI ID दर्ज करें (जैसे: 7000627153@upi)');
      return;
    }
    if (!cleanUpi.includes('@')) {
      toast.error('UPI ID में "@" होना ज़रूरी है (उदा. number@paytm या name@okhdfcbank)');
      return;
    }

    const cleanPayee = editPayeeInput.trim() || 'TARA COLLECTION';

    // Save to persistent settings
    const settings = StorageService.getSettings();
    settings.upiId = cleanUpi;
    settings.upiPayeeName = cleanPayee;
    StorageService.saveSettings(settings);

    // Update state
    setCurrentUpiId(cleanUpi);
    setCurrentPayeeName(cleanPayee);
    setIsEditModalOpen(false);

    if (onUpiUpdated) {
      onUpiUpdated(cleanUpi, cleanPayee);
    }

    toast.success(`UPI ID अपडेट हो गई: ${cleanUpi}! अब सारा पेमेंट इसी पर आएगा।`);
  };

  if (amount <= 0) {
    return (
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center text-xs text-amber-800">
        ₹0.00 के लिए UPI QR उपलब्ध नहीं है। कृपया कार्ट में कपड़े जोड़ें।
      </div>
    );
  }

  return (
    <>
      <div
        className={`bg-white rounded-2xl border-2 border-emerald-500/80 shadow-md p-3.5 flex flex-col items-center select-none text-center relative overflow-hidden transition-all ${className}`}
      >
        {/* Top Header Badge */}
        <div className="w-full flex items-center justify-between gap-1 mb-2">
          <div className="flex items-center space-x-1.5 bg-emerald-100 text-emerald-800 text-[11px] font-black px-2.5 py-0.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>लाइव UPI QR (Auto Amount)</span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={handleOpenEditModal}
              className="flex items-center space-x-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg active:scale-95 transition-all border border-emerald-200"
              title="अपनी UPI ID बदलें"
            >
              <Edit3 className="w-3 h-3" />
              <span>UPI ID बदलें</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="flex items-center space-x-1 text-[11px] font-bold text-slate-600 hover:text-blue-600 bg-slate-100 px-2 py-0.5 rounded-lg active:scale-95 transition-all"
              title="ग्राहक को दिखाने के लिए बड़ा करें"
            >
              <Maximize2 className="w-3 h-3" />
              <span>बड़ा करें</span>
            </button>
          </div>
        </div>

        {/* Side-by-Side: QR on Left, Info on Right (Compact & Clean) */}
        <div className="w-full flex items-center space-x-3 bg-slate-50/70 p-2 rounded-xl border border-slate-200/80">
          {/* QR Code Canvas/Image */}
          <div className="p-1 bg-white rounded-lg border border-slate-200 shadow-xs shrink-0 flex items-center justify-center">
            {qrUrl ? (
              <img
                src={qrUrl}
                alt={`UPI QR code for ₹${formattedAmount}`}
                className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded"
              />
            ) : (
              <div className="w-24 h-24 flex items-center justify-center text-xs text-slate-400">
                QR बन रहा है...
              </div>
            )}
          </div>

          {/* Details on Right */}
          <div className="flex-1 min-w-0 text-left space-y-1">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              स्कैन करने योग्य कुल राशि
            </div>
            <div className="text-xl font-black text-emerald-600 tracking-tight leading-none font-mono">
              ₹{formattedAmount}
            </div>

            <div className="pt-0.5">
              <div className="text-xs font-black text-slate-800 tracking-wide uppercase truncate">
                {currentPayeeName}
              </div>
              <div className="flex items-center space-x-1 mt-0.5">
                <span className="font-mono text-[10px] text-slate-700 font-bold bg-white border border-slate-200 px-1.5 py-0.5 rounded max-w-[150px] truncate">
                  {currentUpiId}
                </span>
                <button
                  type="button"
                  onClick={handleCopyUPI}
                  className="p-0.5 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition-colors"
                  title="Copy UPI ID"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>

            {/* Supported UPI Apps */}
            <div className="flex items-center space-x-1 pt-0.5 text-[9px] font-bold text-slate-500">
              <span className="bg-white border border-slate-200 px-1.5 py-0.2 rounded text-blue-700">GPay</span>
              <span className="bg-white border border-slate-200 px-1.5 py-0.2 rounded text-indigo-700">PhonePe</span>
              <span className="bg-white border border-slate-200 px-1.5 py-0.2 rounded text-sky-700">Paytm</span>
              <span className="bg-white border border-slate-200 px-1.5 py-0.2 rounded text-emerald-700">BHIM</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= EDIT UPI ID MODAL ================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 text-left">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 leading-tight">
                    अपनी UPI ID सेट करें
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    पेमेंट सीधे इसी बैंक/UPI खाते में जाएगा
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUpi} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  UPI ID (उदा. PhonePe, GPay, Paytm):
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. 7000627153@upi या yourname@okaxis"
                  value={editUpiInput}
                  onChange={(e) => setEditUpiInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />

                {/* Quick handle suggestions */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {['@upi', '@paytm', '@ybl', '@okaxis', '@okicici', '@ibl'].map((handle) => (
                    <button
                      key={handle}
                      type="button"
                      onClick={() => {
                        const base = editUpiInput.split('@')[0] || '7000627153';
                        setEditUpiInput(base + handle);
                      }}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[10px] font-mono font-bold transition-colors"
                    >
                      {handle}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  खाता धारक / दुकान का नाम (Payee Name):
                </label>
                <input
                  type="text"
                  placeholder="TARA COLLECTION"
                  value={editPayeeInput}
                  onChange={(e) => setEditPayeeInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 flex items-start space-x-2">
                <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  यह UPI ID हमेशा के लिए सेव हो जाएगी। ग्राहक द्वारा QR कोड स्कैन करते ही पेमेंट सीधे इसी खाते में पहुंचेगा।
                </span>
              </div>

              <div className="flex space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl active:scale-95 text-xs"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl active:scale-95 text-xs shadow-md flex items-center justify-center space-x-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>सेव करें (Save)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= FULL SCREEN CUSTOMER SCAN DISPLAY MODAL ================= */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center border-4 border-emerald-500 shadow-2xl relative">
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute right-4 top-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center space-x-1.5 bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full mb-3">
              <ShieldCheck className="w-4 h-4" />
              <span>सुरक्षित डिजिटल UPI भुगतान</span>
            </div>

            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              {currentPayeeName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              किसी भी UPI ऐप (GPay, PhonePe, Paytm) से स्कैन करें
            </p>

            <div className="my-4 py-2 px-4 bg-emerald-50 rounded-2xl border border-emerald-200 inline-block">
              <div className="text-xs font-bold text-emerald-800 uppercase">कुल भुगतान राशि</div>
              <div className="text-4xl font-black text-emerald-600 tracking-tight leading-none mt-1">
                ₹{formattedAmount}
              </div>
            </div>

            <div className="p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-lg flex items-center justify-center mx-auto w-fit">
              {qrUrl && (
                <img
                  src={qrUrl}
                  alt={`UPI QR ₹${formattedAmount}`}
                  className="w-56 h-56 object-contain"
                />
              )}
            </div>

            <div className="mt-4 text-xs text-slate-500 font-mono font-bold">
              UPI ID: {currentUpiId}
            </div>

            <button
              onClick={() => setIsFullscreen(false)}
              className="mt-5 w-full py-3 bg-slate-900 text-white font-bold text-sm rounded-xl active:scale-95 shadow-md"
            >
              बंद करें (Close)
            </button>
          </div>
        </div>
      )}
    </>
  );
};
