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
};

// Global Hindi translation dictionary for whole-software multi-language support
export const HINDI_DICTIONARY: Record<string, string> = {
  // Sidebar & Navigation
  'Dashboard': 'दुकान डैशबोर्ड',
  'New Billing': 'नया बिल (POS)',
  'Sales History': 'बिक्री पर्चियां (इतिहास)',
  'Products': 'कपड़े व उत्पाद',
  'Inventory / Stock': 'इन्वेंट्री / स्टॉक',
  'Purchase Entry': 'खरीदी एंट्री (Stock In)',
  'Suppliers': 'थोक सप्लायर',
  'Customers': 'ग्राहक व उधारी खाता',
  'Returns & Exchange': 'वापसी व एक्सचेंज',
  'Expenses': 'दुकान खर्चे',
  'Reports & Analytics': 'रिपोर्ट व हिसाब',
  'Settings': 'दुकान सेटिंग्स',
  'Retail POS & Stock': 'कपड़ा बिलिंग व स्टॉक',
  'All Items': 'सभी कपड़े',

  // Common UI words
  'Search': 'खोजें',
  'Add': 'जोड़ें',
  'Add New': 'नया जोड़ें',
  'Save': 'सेव करें',
  'Cancel': 'रद्द करें',
  'Delete': 'हटाएं',
  'Edit': 'संशोधित करें',
  'Update': 'अपडेट करें',
  'Close': 'बंद करें',
  'Print': 'प्रिंट करें',
  'Download': 'डाउनलोड करें',
  'Share': 'शेयर करें',
  'Export': 'एक्सपोर्ट',
  'Import': 'इम्पोर्ट',
  'Actions': 'कार्य',
  'Status': 'स्थिति',
  'Active': 'सक्रिय',
  'Inactive': 'निष्क्रिय',
  'Date': 'तारीख',
  'Total': 'कुल',
  'Subtotal': 'सबटोटल',
  'Quantity': 'मात्रा (Pcs)',
  'Qty': 'मात्रा',
  'Price': 'कीमत',
  'Rate': 'दर (₹)',
  'Amount': 'राशि (₹)',
  'Discount': 'छूट',
  'Final Payable': 'कुल देय राशि',
  'Paid': 'जमा',
  'Due': 'बाकी',
  'Balance Due': 'उधारी बाकी',
  'Cash Received': 'प्राप्त कैश',
  'Change to Return': 'वापसी राशि',
  'Payment Mode': 'भुगतान प्रकार',
  'Cash': 'कैश',
  'UPI': 'यूपीआई',
  'Card': 'कार्ड',
  'Split': 'स्प्लिट',
  'Credit / Due': 'उधारी',
  'Customer': 'ग्राहक',
  'Mobile': 'मोबाइल',
  'Customer Name': 'ग्राहक का नाम',
  'Customer Mobile': 'ग्राहक का मोबाइल',
  'Note': 'विवरण / नोट',
  'Yes': 'हाँ',
  'No': 'नहीं',

  // Dashboard Metrics
  "Today's Sales": 'आज की कुल बिक्री',
  "Today's Revenue": 'आज की आमदनी',
  "Today's Bills": 'आज के कुल बिल',
  'Items Sold': 'बिके हुए कपड़े (Pcs)',
  'Gross Profit': 'सकल मुनाफा (Profit)',
  'Total Inventory Value': 'स्टॉक का कुल मूल्य',
  'Low Stock Items': 'कम स्टॉक वाले कपड़े',
  'Out of Stock': 'स्टॉक खत्म (0 Pcs)',
  'Top Selling Products': 'सबसे ज्यादा बिकने वाले कपड़े',
  'Recent Bills': 'हाल ही की बिक्री पर्चियां',
  'Recent Invoices': 'हाल की पर्चियां',
  'Sales by Category': 'केटेगरी अनुसार बिक्री',
  'Payment Modes': 'पेमेंट मोड विश्लेषण',
  'Quick Billing': 'तुरंत नया बिल बनाएं',

  // Products & Inventory
  'Product Name': 'कपड़े का नाम',
  'Item Code': 'आइटम कोड / बारकोड',
  'Category': 'केटेगरी',
  'Select Category': 'केटेगरी चुनें',
  'Purchase Price': 'खरीद भाव (₹)',
  'Selling Price': 'बिक्री भाव (₹)',
  'Sizes': 'उपलब्ध साइज़',
  'Colors': 'रंग (Color)',
  'Stock': 'स्टॉक',
  'In Stock': 'स्टॉक में उपलब्ध',
  'Low Stock Alert': 'कम स्टॉक चेतावनी',
  'Add Product': 'नया कपड़ा जोड़ें',
  'Add New Product': 'नया कपड़ा स्टॉक में जोड़ें',
  'Edit Product': 'कपड़ा विवरण बदलें',
  'Adjust Stock': 'स्टॉक घटाएं या बढ़ाएं',
  'Stock Adjustment': 'स्टॉक एडजस्टमेंट',
  'Total Products': 'कुल कपड़े (प्रकार)',
  'Total Pcs in Stock': 'स्टॉक में कुल पीस',
  'Add Variant': 'साइज़/कलर जोड़ें',

  // Purchases
  'Add Purchase': 'नया माल स्टॉक में जोड़ें (खरीदी)',
  'Purchase Stock In': 'खरीदी स्टॉक एंट्री',
  'Supplier': 'थोक सप्लायर',
  'Invoice No': 'खरीदी बिल / चालान नं.',
  'Purchase Date': 'खरीदी तारीख',
  'Total Purchase Cost': 'कुल खरीदी लागत',

  // Customers & Khata
  'Add Customer': 'नया ग्राहक जोड़ें',
  'Customer Ledger': 'ग्राहक उधारी खाता',
  'Receive Payment': 'उधारी जमा करें',
  'Payment History': 'भुगतान इतिहास',
  'Settle Due': 'खाता क्लियर करें',

  // Suppliers
  'Add Supplier': 'नया सप्लायर जोड़ें',
  'Supplier Name': 'सप्लायर का नाम',
  'Contact Person': 'संपर्क व्यक्ति',
  'Firm Name': 'कंपनी या दुकान का नाम',

  // Returns & Expenses
  'Return Item': 'कपड़ा वापसी / रिटर्न',
  'Return Reason': 'वापसी का कारण',
  'Refund': 'रिफंड (पैसे वापसी)',
  'Exchange': 'एक्सचेंज (बदली)',
  'Add Expense': 'दुकान खर्चा जोड़ें',
  'Expense Category': 'खर्चे की श्रेणी',
  'Expense Amount': 'खर्चा राशि (₹)',
  'Daily Store Expenses': 'दुकान के दैनिक खर्चे',

  // Reports
  'Sales Report': 'बिक्री रिपोर्ट',
  'Profit Report': 'मुनाफा रिपोर्ट',
  'Stock Report': 'स्टॉक रिपोर्ट',
  'Daily Summary': 'दैनिक समरी',
  'Monthly Summary': 'मासिक समरी',

  // User Switch
  'Switch Cashier / Role': 'स्टाफ / रोल बदलें',
  'Select Staff Account': 'स्टाफ खाता चुनें',
  'Enter 4-Digit Security PIN': '4-अंकों का सुरक्षा पिन दर्ज करें',
  'Switch User': 'यूज़र बदलें',

  // Receipt & Print
  'Generate & Print Slip': 'बिल बनाएं व पर्ची प्रिंट करें',
  'Thermal Print': 'थर्मल प्रिंट',
  'Send WhatsApp PDF': 'WhatsApp PDF भेजें',
  'Download PDF': 'PDF डाउनलोड करें',
  'Bill Number': 'बिल नंबर',
  'Cash Memo': 'कैश मेमो',
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
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === 'hi' ? 'hi' : 'en'; // Default to English
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

  const tr = (text: string): string => {
    if (language === 'hi') {
      return HINDI_DICTIONARY[text] || text;
    }
    return text;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t: translations[language],
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
    return (
      <button
        type="button"
        onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors shadow-sm select-none ${
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
    <div className={`inline-flex items-center p-0.5 rounded-lg border border-slate-200 bg-slate-100 select-none ${className}`}>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
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
        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
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
