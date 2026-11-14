import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi';

export interface Translations {
  // Navigation & Tabs
  newBill: string;
  stock: string;
  bills: string;
  more: string;
  dashboard: string;
  products: string;
  inventory: string;
  purchases: string;
  suppliers: string;
  customers: string;
  returns: string;
  expenses: string;
  reports: string;
  settings: string;

  // POS & Billing
  searchPlaceholder: string;
  customItem: string;
  allCategories: string;
  inStock: string;
  sizes: string;
  activeCart: string;
  emptyCart: string;
  tapToAdd: string;
  discount: string;
  billDiscount: string;
  subtotal: string;
  totalDiscount: string;
  finalPayable: string;
  saved: string;
  youSaved: string;
  generatePrintSlip: string;
  customerMobile: string;
  customerName: string;
  itemDiscountPrompt: string;
  applyDiscount: string;
  viewBillPrint: string;
  clearCart: string;

  // Payment Modes
  cash: string;
  upi: string;
  card: string;
  split: string;
  creditDue: string;
  cashReceived: string;
  changeReturn: string;

  // Live UPI QR
  liveUPIQR: string;
  scanToPay: string;
  editUPI: string;
  fullscreen: string;
  generatingQR: string;
  enterUPI: string;
  upiHelp: string;
  saveUPI: string;

  // Receipt & Print
  receiptTitle: string;
  otgUsbPrint: string;
  thermalPrint: string;
  sendWhatsApp: string;
  downloadPDF: string;
  close: string;
  shareOnWhatsApp: string;
  enterPhone: string;

  // Sales History
  searchBills: string;
  today: string;
  yesterday: string;
  last7Days: string;
  allBills: string;
  totalSales: string;
  cancelBill: string;
  reprint: string;

  // Language switcher
  langName: string;
  selectLanguage: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    newBill: 'New Bill',
    stock: 'Stock',
    bills: 'Bills',
    more: 'More',
    dashboard: 'Dashboard',
    products: 'Products',
    inventory: 'Inventory',
    purchases: 'Purchases',
    suppliers: 'Suppliers',
    customers: 'Customers',
    returns: 'Returns',
    expenses: 'Expenses',
    reports: 'Reports',
    settings: 'Settings',

    searchPlaceholder: 'Search by item name, category, or size...',
    customItem: '+ Custom Item',
    allCategories: 'All Items',
    inStock: 'in Stock',
    sizes: 'Sizes',
    activeCart: 'Active Cash Memo',
    emptyCart: 'Cart is empty',
    tapToAdd: 'Tap any item to add to bill',
    discount: 'Discount',
    billDiscount: 'Bill-Level Discount:',
    subtotal: 'Subtotal:',
    totalDiscount: 'Total Discount:',
    finalPayable: 'Final Payable:',
    saved: 'Saved:',
    youSaved: 'YOU SAVED',
    generatePrintSlip: 'Generate & Print Slip',
    customerMobile: 'Customer Mobile (Opt)',
    customerName: 'Customer Name',
    itemDiscountPrompt: 'Discount Per Piece (₹)',
    applyDiscount: 'Apply Discount',
    viewBillPrint: 'View Bill & Print',
    clearCart: 'Clear Cart',

    cash: 'Cash',
    upi: 'UPI',
    card: 'Card',
    split: 'Split',
    creditDue: 'Credit / Due',
    cashReceived: 'Cash Received:',
    changeReturn: 'Change to Return:',

    liveUPIQR: 'Live UPI QR (Auto Amount)',
    scanToPay: 'Scan to Pay Total Amount',
    editUPI: 'Edit UPI ID',
    fullscreen: 'Fullscreen',
    generatingQR: 'Generating QR...',
    enterUPI: 'Enter your shop UPI ID',
    upiHelp: 'Payments will be credited directly to your bank account',
    saveUPI: 'Save UPI ID',

    receiptTitle: 'Receipt Print & WhatsApp Share',
    otgUsbPrint: '🔌 OTG USB Print',
    thermalPrint: 'Thermal Print',
    sendWhatsApp: 'Send WhatsApp PDF',
    downloadPDF: 'Download PDF',
    close: 'Close',
    shareOnWhatsApp: 'Share on WhatsApp',
    enterPhone: 'Enter 10-digit mobile number',

    searchBills: 'Search bills by Bill No., Customer, Mobile...',
    today: 'Today',
    yesterday: 'Yesterday',
    last7Days: 'Last 7 Days',
    allBills: 'All Bills',
    totalSales: 'Total:',
    cancelBill: 'Cancel Bill',
    reprint: 'Reprint',

    langName: 'English',
    selectLanguage: 'Language',
  },
  hi: {
    newBill: 'नया बिल',
    stock: 'स्टॉक',
    bills: 'बिक्री पर्चियां',
    more: 'अन्य मेन्यू',
    dashboard: 'डैशबोर्ड',
    products: 'कपड़े व उत्पाद',
    inventory: 'इन्वेंट्री / स्टॉक',
    purchases: 'खरीदी एंट्री',
    suppliers: 'थोक सप्लायर',
    customers: 'ग्राहक व उधारी',
    returns: 'वापसी व एक्सचेंज',
    expenses: 'दुकान खर्चे',
    reports: 'रिपोर्ट व हिसाब',
    settings: 'दुकान सेटिंग',

    searchPlaceholder: 'आइटम का नाम, केटेगरी या साइज़ खोजें...',
    customItem: '+ अन्य आइटम',
    allCategories: 'सभी कपड़े',
    inStock: 'उपलब्ध',
    sizes: 'साइज़',
    activeCart: 'सक्रिय बिल',
    emptyCart: 'कार्ट खाली है',
    tapToAdd: 'बिल में जोड़ने के लिए किसी भी आइटम पर टैप करें',
    discount: 'छूट',
    billDiscount: 'बिल डिस्काउंट:',
    subtotal: 'सबटोटल:',
    totalDiscount: 'कुल छूट:',
    finalPayable: 'कुल देय राशि:',
    saved: 'बचत:',
    youSaved: 'आपकी बचत',
    generatePrintSlip: 'बिल बनाएं व प्रिंट करें',
    customerMobile: 'ग्राहक मोबाइल (वैकल्पिक)',
    customerName: 'ग्राहक का नाम',
    itemDiscountPrompt: 'छूट प्रति पीस (₹)',
    applyDiscount: 'छूट लागू करें',
    viewBillPrint: 'बिल देखें व प्रिंट करें',
    clearCart: 'कार्ट खाली करें',

    cash: 'कैश',
    upi: 'यूपीआई',
    card: 'कार्ड',
    split: 'स्प्लिट',
    creditDue: 'उधारी',
    cashReceived: 'प्राप्त कैश:',
    changeReturn: 'वापसी राशि:',

    liveUPIQR: 'लाइव UPI QR (ऑटो राशि)',
    scanToPay: 'स्कैन करने योग्य कुल राशि',
    editUPI: 'UPI ID बदलें',
    fullscreen: 'बड़ा करें',
    generatingQR: 'QR बन रहा है...',
    enterUPI: 'अपनी दुकान की UPI ID दर्ज करें',
    upiHelp: 'पेमेंट सीधे आपके बैंक खाते में क्रेडिट होगा',
    saveUPI: 'UPI ID सेव करें',

    receiptTitle: 'रसीद प्रिंट व WhatsApp शेयर',
    otgUsbPrint: '🔌 OTG USB प्रिंट',
    thermalPrint: 'थर्मल प्रिंट',
    sendWhatsApp: 'WhatsApp PDF भेजें',
    downloadPDF: 'PDF डाउनलोड करें',
    close: 'बंद करें',
    shareOnWhatsApp: 'व्हाट्सएप पर शेयर करें',
    enterPhone: '10 अंकों का मोबाइल नंबर डालें',

    searchBills: 'बिल नंबर, ग्राहक नाम या फोन से खोजें...',
    today: 'आज',
    yesterday: 'कल',
    last7Days: 'पिछले 7 दिन',
    allBills: 'सभी बिल',
    totalSales: 'कुल:',
    cancelBill: 'बिल रद्द करें',
    reprint: 'पुनः प्रिंट करें',

    langName: 'हिन्दी',
    selectLanguage: 'भाषा (Language)',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: translations.en,
});

const STORAGE_KEY = 'tara_collection_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === 'hi' ? 'hi' : 'en'; // Default to English as requested
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      console.error('Failed to save language', e);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t: translations[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

export const LanguageSelector: React.FC<{ className?: string; compact?: boolean }> = ({
  className = '',
  compact = false,
}) => {
  const { language, setLanguage } = useLanguage();

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors shadow-sm ${
          language === 'hi'
            ? 'bg-amber-500/10 text-amber-600 border-amber-300 hover:bg-amber-500/20'
            : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
        } ${className}`}
        title="Switch Language / भाषा बदलें"
      >
        <span>🌐</span>
        <span>{language === 'en' ? 'English' : 'हिन्दी'}</span>
      </button>
    );
  }

  return (
    <div className={`inline-flex items-center p-0.5 rounded-lg border border-slate-200 bg-slate-100 ${className}`}>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
          language === 'en'
            ? 'bg-white text-blue-700 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => setLanguage('hi')}
        className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
          language === 'hi'
            ? 'bg-white text-blue-700 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        हिन्दी
      </button>
    </div>
  );
};
