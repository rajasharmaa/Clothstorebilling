import React, { useState, useEffect } from 'react';
import { X, CreditCard, Banknote, QrCode } from 'lucide-react';
import { SplitPaymentDetail } from '../../types';

interface SplitPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalPayable: number;
  onConfirm: (split: SplitPaymentDetail) => void;
}

export const SplitPaymentModal: React.FC<SplitPaymentModalProps> = ({
  isOpen,
  onClose,
  totalPayable,
  onConfirm,
}) => {
  const [cash, setCash] = useState<number>(0);
  const [upi, setUpi] = useState<number>(0);
  const [card, setCard] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      // Default to full cash
      setCash(totalPayable);
      setUpi(0);
      setCard(0);
    }
  }, [isOpen, totalPayable]);

  if (!isOpen) return null;

  const totalCollected = Number(cash || 0) + Number(upi || 0) + Number(card || 0);
  const difference = Math.round((totalPayable - totalCollected) * 100) / 100;
  const isMatch = Math.abs(difference) < 0.01;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({ cash: Number(cash) || 0, upi: Number(upi) || 0, card: Number(card) || 0 });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base">Split Payment Breakdown</h3>
            <p className="text-xs text-slate-400">Total Payable: ₹{totalPayable.toFixed(2)}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleApply} className="p-6 space-y-4">
          <div>
            <label className="flex items-center text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              <Banknote className="w-4 h-4 text-emerald-600 mr-1.5" />
              Cash Amount (₹)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={cash || ''}
              onChange={(e) => setCash(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-base font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="flex items-center text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              <QrCode className="w-4 h-4 text-blue-600 mr-1.5" />
              UPI / QR Amount (₹)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={upi || ''}
              onChange={(e) => setUpi(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-base font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="flex items-center text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              <CreditCard className="w-4 h-4 text-purple-600 mr-1.5" />
              Debit / Credit Card Amount (₹)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={card || ''}
              onChange={(e) => setCard(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-base font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="0.00"
            />
          </div>

          {/* Balance summary */}
          <div
            className={`p-3 rounded-lg border text-sm font-semibold flex items-center justify-between ${
              isMatch
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : difference > 0
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <span>Total Split: ₹{totalCollected.toFixed(2)}</span>
            <span>
              {isMatch
                ? '✓ Matched Exactly'
                : difference > 0
                ? `Remaining Due: ₹${difference.toFixed(2)}`
                : `Excess: ₹${Math.abs(difference).toFixed(2)}`}
            </span>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-md shadow-blue-500/20"
            >
              Save Split Modes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
