import React, { useState, useEffect } from 'react';
import { Sale, ShopSettings } from '../../types';
import {
  X,
  Printer,
  FileText,
  Share2,
  CheckCircle,
  Copy,
  Receipt,
  RotateCcw,
  Download,
  Phone,
  Send,
  Cable,
} from 'lucide-react';
import {
  generateThermalReceiptHTML,
  generateA4ReceiptHTML,
  generateWhatsAppMessage,
  triggerPrint,
} from '../../lib/receipt';
import {
  downloadReceiptPDF,
  sharePDFOnWhatsApp,
} from '../../lib/pdfGenerator';
import { toast } from 'sonner';
import { useLanguage } from '../../lib/i18n';

interface ReceiptModalProps {
  sale: Sale | null;
  settings: ShopSettings;
  isOpen: boolean;
  onClose: () => void;
  onNewBill: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  sale,
  settings,
  isOpen,
  onClose,
  onNewBill,
}) => {
  const { t, language } = useLanguage();
  const [printFormat, setPrintFormat] = useState<'80mm' | '58mm' | 'A4'>(
    settings.receiptPaperSize || '80mm'
  );
  const [copied, setCopied] = useState(false);
  const [shareMobile, setShareMobile] = useState<string>(sale?.customerMobile || '');
  const [isSharingPdf, setIsSharingPdf] = useState(false);

  useEffect(() => {
    if (sale?.customerMobile) {
      setShareMobile(sale.customerMobile);
    }
  }, [sale]);

  if (!isOpen || !sale) return null;

  const handlePrint = async () => {
    const res = await triggerPrint(sale, settings, printFormat);
    if (!res.success && res.message) {
      toast.error(res.message);
    } else {
      toast.success('Print command sent!');
    }
  };

  // WhatsApp PDF Share
  const handleSharePDF = async () => {
    const cleanMobile = shareMobile.replace(/\D/g, '');
    if (cleanMobile.length > 0 && cleanMobile.length < 10) {
      toast.error(language === 'hi' ? 'कृपया पूरा 10 अंकों का मोबाइल नंबर दर्ज करें' : 'Please enter a valid 10-digit mobile number');
      return;
    }

    setIsSharingPdf(true);
    toast.loading(language === 'hi' ? 'WhatsApp PDF तैयार हो रहा है...' : 'Generating WhatsApp PDF...', { id: 'pdf-share' });

    try {
      const res = await sharePDFOnWhatsApp(sale, settings, cleanMobile);
      if (res.method === 'web_share') {
        toast.success(language === 'hi' ? 'WhatsApp पर बिल PDF शेयर कर दिया गया!' : 'Bill PDF shared via WhatsApp!', { id: 'pdf-share' });
      } else {
        toast.success(language === 'hi' ? 'PDF डाउनलोड हो गया! WhatsApp चैट खुल गई है।' : 'PDF downloaded! WhatsApp chat opened.', { id: 'pdf-share' });
      }
    } catch (e) {
      toast.error(language === 'hi' ? 'PDF शेयर करने में समस्या आई' : 'Failed to share PDF', { id: 'pdf-share' });
    } finally {
      setIsSharingPdf(false);
    }
  };

  // Direct PDF Download
  const handleDownloadPDF = () => {
    try {
      downloadReceiptPDF(sale, settings);
      toast.success(language === 'hi' ? 'Bill PDF डाउनलोड हो गया!' : 'Bill PDF downloaded!');
    } catch (e) {
      toast.error(language === 'hi' ? 'PDF डाउनलोड करने में त्रुटि आई' : 'Error downloading PDF');
    }
  };

  // WhatsApp Text Message
  const handleWhatsAppTextMessage = () => {
    const cleanMobile = shareMobile.replace(/\D/g, '');
    const message = generateWhatsAppMessage(sale, settings);
    const encoded = encodeURIComponent(message);
    const fullMobile = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
    const url = fullMobile
      ? `https://api.whatsapp.com/send?phone=${fullMobile}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, '_blank');
  };

  const handleCopyText = () => {
    const message = generateWhatsAppMessage(sale, settings);
    navigator.clipboard.writeText(message);
    setCopied(true);
    toast.success('Bill summary copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Cash Memo Finalized</h3>
              <p className="text-xs text-slate-400">Bill #{sale.billNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* WhatsApp & Mobile Number Action Toolbar */}
        <div className="p-3 bg-emerald-50/80 border-b border-emerald-200 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          {/* Customer WhatsApp Mobile Input */}
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-xs text-emerald-900 flex items-center space-x-1">
              <span>📱 WhatsApp No:</span>
            </span>
            <div className="flex items-center bg-white border border-emerald-300 rounded-lg px-2.5 py-1 shadow-xs focus-within:ring-2 focus-within:ring-emerald-500">
              <span className="text-xs font-bold text-slate-500 mr-1 font-mono">🇮🇳 +91</span>
              <input
                type="text"
                placeholder="Mobile (10 digits)"
                value={shareMobile}
                onChange={(e) => setShareMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-36 text-xs font-mono font-bold text-slate-800 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons: PDF Share, Download, Text */}
          <div className="flex items-center space-x-1.5 flex-wrap">
            <button
              onClick={handleSharePDF}
              disabled={isSharingPdf}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all shadow-sm shadow-emerald-600/30 disabled:opacity-50"
              title="Share PDF bill on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{t.sendWhatsApp}</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-colors shadow-xs"
              title="Download PDF Invoice"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>PDF Download</span>
            </button>

            <button
              onClick={handleWhatsAppTextMessage}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 transition-colors"
              title="Send text message on WhatsApp"
            >
              <Send className="w-3.5 h-3.5 text-emerald-700" />
              <span>Text</span>
            </button>

            <button
              onClick={handleCopyText}
              className="flex items-center space-x-1 px-2 py-1.5 rounded-lg text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-300 transition-colors"
              title="Copy text bill"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Paper Size Selector */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center space-x-2 text-slate-700 font-semibold">
            <span>Thermal Format:</span>
            {(['80mm', '58mm', 'A4'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setPrintFormat(fmt)}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                  printFormat === fmt
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {fmt === '80mm' ? '80mm Thermal' : fmt === '58mm' ? '58mm Thermal' : 'A4 Invoice'}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {printFormat === '80mm' ? '3-Inch Roll' : printFormat === '58mm' ? '2-Inch Roll' : 'Full Page'}
          </span>
        </div>

        {/* Live Receipt Preview */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-200 flex justify-center items-start">
          <iframe
            srcDoc={
              printFormat === 'A4'
                ? generateA4ReceiptHTML(sale, settings)
                : generateThermalReceiptHTML(sale, settings, printFormat)
            }
            title="Receipt Preview"
            className="bg-white shadow-2xl rounded-xl border border-slate-300 transition-all"
            style={{
              width: printFormat === '58mm' ? '300px' : printFormat === '80mm' ? '380px' : '620px',
              height: '520px',
            }}
          />
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              onClose();
              onNewBill();
            }}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Next Bill (F2)</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => triggerPrint(sale, settings, printFormat, 'rawbt')}
              className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors active:scale-95"
              title="Print directly to USB OTG thermal printer"
            >
              <Cable className="w-4 h-4 text-emerald-600" />
              <span>OTG USB Print</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25 active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
