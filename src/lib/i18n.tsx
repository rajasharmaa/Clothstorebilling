import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'hi' | 'mr';

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
    newBill: 'नया बिलिंग',
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
  mr: {
    newBill: 'नवीन बिल',
    stock: 'स्टॉक',
    bills: 'विक्री पावत्या',
    more: 'इतर मेनू',
    dashboard: 'डॅशबोर्ड',
    products: 'कपडे व उत्पादने',
    inventory: 'इन्व्हेंटरी / स्टॉक',
    purchases: 'खरेदी नोंद',
    suppliers: 'घाऊक विक्रेते',
    customers: 'ग्राहक व उधारी',
    returns: 'परतावा व बदल',
    expenses: 'दुकानाचे खर्च',
    reports: 'अहवाल व हिशोब',
    settings: 'दुकान सेटिंग',

    searchPlaceholder: 'कपड्याचे नाव, प्रकार किंवा माप शोधा...',
    customItem: '+ इतर आयटम',
    allCategories: 'सर्व कपडे',
    inStock: 'उपलब्ध',
    sizes: 'मापे',
    activeCart: 'चालू बिल',
    emptyCart: 'कार्ट रिकामी आहे',
    tapToAdd: 'बिलात जोडण्यासाठी टॅप करा',
    discount: 'सूट',
    billDiscount: 'बिल सूट:',
    subtotal: 'एकूण रक्कम:',
    totalDiscount: 'एकूण सूट:',
    finalPayable: 'अंतिम देय रक्कम:',
    saved: 'बचत:',
    youSaved: 'आपली बचत',
    generatePrintSlip: 'बिल बनवा व प्रिंट करा',
    customerMobile: 'ग्राहक मोबाईल (पर्यायी)',
    customerName: 'ग्राहकाचे नाव',
    itemDiscountPrompt: 'प्रति नग सूट (₹)',
    applyDiscount: 'सूट लागू करा',
    viewBillPrint: 'बिल पहा व प्रिंट करा',
    clearCart: 'कार्ट साफ करा',

    cash: 'रोख (Cash)',
    upi: 'UPI',
    card: 'कार्ड',
    split: 'स्प्लिट',
    creditDue: 'उधारी',
    cashReceived: 'मिळालेली रोख:',
    changeReturn: 'परत द्यायची रक्कम:',

    liveUPIQR: 'लाईव्ह UPI QR कोड',
    scanToPay: 'पैसे भरण्यासाठी स्कॅन करा',
    editUPI: 'UPI ID बदला',
    fullscreen: 'मोठे करा',
    generatingQR: 'QR तयार होत आहे...',
    enterUPI: 'आपला दुकान UPI ID टाका',
    upiHelp: 'पैसे थेट आपल्या बँक खात्यात जमा होतील',
    saveUPI: 'UPI ID सेव्ह करा',

    receiptTitle: 'पावती प्रिंट व WhatsApp पाठवा',
    otgUsbPrint: '🔌 OTG USB प्रिंट',
    thermalPrint: 'थर्मल प्रिंट',
    sendWhatsApp: 'WhatsApp PDF पाठवा',
    downloadPDF: 'PDF डाउनलोड करा',
    close: 'बंद करा',
    shareOnWhatsApp: 'WhatsApp वर पाठवा',
    enterPhone: '१० अंकी मोबाईल नंबर टाका',

    searchBills: 'बिल क्र., ग्राहक किंवा फोनने शोधा...',
    today: 'आज',
    yesterday: 'काल',
    last7Days: 'मागील ७ दिवस',
    allBills: 'सर्व बिले',
    totalSales: 'एकूण:',
    cancelBill: 'बिल रद्द करा',
    reprint: 'पुन्हा प्रिंट करा',

    langName: 'मराठी',
    selectLanguage: 'भाषा',
  },
};

// Devanagari Dictionary (Hindi and Marathi)
export const MULTILANG_DICTIONARY: Record<string, { hi: string; mr: string }> = {
  'Dashboard': { hi: 'दुकान डैशबोर्ड', mr: 'दुकान डॅशबोर्ड' },
  'New Billing': { hi: 'नया बिल (POS)', mr: 'नवीन बिल (POS)' },
  'Sales History': { hi: 'बिक्री पर्चियां (इतिहास)', mr: 'विक्री इतिहास' },
  'Products': { hi: 'कपड़े व उत्पाद', mr: 'कपडे व उत्पादने' },
  'Inventory / Stock': { hi: 'इन्वेंट्री / स्टॉक', mr: 'इन्व्हेंटरी / स्टॉक' },
  'Purchase Entry': { hi: 'खरीदी एंट्री (Stock In)', mr: 'खरेदी नोंद (Stock In)' },
  'Suppliers': { hi: 'थोक सप्लायर', mr: 'घाऊक विक्रेते' },
  'Customers': { hi: 'ग्राहक व उधारी खाता', mr: 'ग्राहक व उधारी खाते' },
  'Returns & Exchange': { hi: 'वापसी व एक्सचेंज', mr: 'परतावा व बदल' },
  'Expenses': { hi: 'दुकान खर्चे', mr: 'दुकानाचे खर्च' },
  'Reports & Analytics': { hi: 'रिपोर्ट व हिसाब', mr: 'अहवाल व विश्लेषण' },
  'Settings': { hi: 'दुकान सेटिंग्स', mr: 'दुकान सेटिंग' },
  'Retail POS & Stock': { hi: 'कपड़ा बिलिंग व स्टॉक', mr: 'कापड बिलिंग व स्टॉक' },
  'All Items': { hi: 'सभी कपड़े', mr: 'सर्व कपडे' },
  'Search': { hi: 'खोजें', mr: 'शोधा' },
  'Add': { hi: 'जोड़ें', mr: 'जोडा' },
  'Add New': { hi: 'नया जोड़ें', mr: 'नवीन जोडा' },
  'Save': { hi: 'सेव करें', mr: 'सेव्ह करा' },
  'Cancel': { hi: 'रद्द करें', mr: 'रद्द करा' },
  'Delete': { hi: 'हटाएं', mr: 'हटवा' },
  'Edit': { hi: 'संशोधित करें', mr: 'बदला' },
  'Close': { hi: 'बंद करें', mr: 'बंद करा' },
  'Print': { hi: 'प्रिंट करें', mr: 'प्रिंट करा' },
  'Download': { hi: 'डाउनलोड करें', mr: 'डाउनलोड करा' },
  'Export': { hi: 'एक्सपोर्ट', mr: 'एक्सपोर्ट' },
  'Import': { hi: 'इम्पोर्ट', mr: 'इम्पोर्ट' },
  'Total': { hi: 'कुल', mr: 'एकूण' },
  'Subtotal': { hi: 'सबटोटल', mr: 'एकूण रक्कम' },
  'Quantity': { hi: 'मात्रा (Pcs)', mr: 'प्रमाण (Pcs)' },
  'Qty': { hi: 'मात्रा', mr: 'प्रमाण' },
  'Price': { hi: 'कीमत', mr: 'किंमत' },
  'Discount': { hi: 'छूट', mr: 'सूट' },
  'Final Payable': { hi: 'कुल देय राशि', mr: 'अंतिम देय रक्कम' },
  'Cash Received': { hi: 'प्राप्त कैश', mr: 'मिळालेली रोख' },
  'Payment Mode': { hi: 'भुगतान प्रकार', mr: 'पेमेंट प्रकार' },
  'Cash': { hi: 'कैश', mr: 'रोख' },
  'UPI': { hi: 'यूपीआई', mr: 'UPI' },
  'Card': { hi: 'कार्ड', mr: 'कार्ड' },
  'Split': { hi: 'स्प्लिट', mr: 'स्प्लिट' },
  'Credit / Due': { hi: 'उधारी', mr: 'उधारी' },
  'Customer': { hi: 'ग्राहक', mr: 'ग्राहक' },
  'Mobile': { hi: 'मोबाइल', mr: 'मोबाईल' },
  "Today's Sales": { hi: 'आज की कुल बिक्री', mr: 'आजची एकूण विक्री' },
  "Today's Revenue": { hi: 'आज की आमदनी', mr: 'आजचे उत्पन्न' },
  'Stock Report': { hi: 'स्टॉक रिपोर्ट', mr: 'स्टॉक अहवाल' },
  'Sales Report': { hi: 'बिक्री रिपोर्ट', mr: 'विक्री अहवाल' },
  'Profit Report': { hi: 'मुनाफा रिपोर्ट', mr: 'नफा अहवाल' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
  tr: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: translations.en,
  tr: (text: string) => text,
});

const STORAGE_KEY = 'tara_collection_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language;
      return (saved === 'hi' || saved === 'mr' || saved === 'en') ? saved : 'en';
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
    const cycle: Record<Language, Language> = { en: 'hi', hi: 'mr', mr: 'en' };
    setLanguage(cycle[language]);
  };

  const tr = (text: string): string => {
    if (language === 'hi' || language === 'mr') {
      const match = MULTILANG_DICTIONARY[text];
      if (match) return match[language] || text;
    }
    return text;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t: translations[language] || translations.en,
        tr,
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
    const nextLang: Record<Language, Language> = { en: 'hi', hi: 'mr', mr: 'en' };
    const label: Record<Language, string> = { en: 'EN', hi: 'हिन्दी', mr: 'मराठी' };

    return (
      <button
        type="button"
        onClick={() => setLanguage(nextLang[language])}
        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-xs font-bold border transition-colors shadow-xs select-none ${
          language !== 'en'
            ? 'bg-amber-500/10 text-amber-600 border-amber-300 hover:bg-amber-500/20'
            : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
        } ${className}`}
        title="Switch Language / भाषा बदला"
      >
        <span>🌐</span>
        <span>{label[language]}</span>
      </button>
    );
  }

  return (
    <div className={`inline-flex items-center p-0.5 rounded-lg border border-slate-200 bg-slate-100 select-none ${className}`}>
      {(['en', 'hi', 'mr'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLanguage(l)}
          className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
            language === l
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {l === 'en' ? 'English' : l === 'hi' ? 'हिन्दी' : 'मराठी'}
        </button>
      ))}
    </div>
  );
};
