# 🛍️ TARA COLLECTION - Retail POS & Inventory Billing System

> **Men's Wear & Sports Wear** | Chhawni, Indore (M.P.)  
> Fast, Mobile-First Billing System with OTG USB Thermal Printing, Dynamic UPI QR & WhatsApp PDF Invoicing.

---

## 📥 Direct Downloads (डाउनलोड लिंक)

आप नीचे दिए गए डायरेक्ट लिंक पर क्लिक करके सीधे **APK (Mobile)** या **EXE (PC/Laptop)** डाउनलोड कर सकते हैं:

| Platform | Download Link | File Size | Description |
| :--- | :--- | :--- | :--- |
| 📱 **Android Mobile** | [👉 **Download Android APK (v1.0.0)**](https://github.com/rajasharmaa/Clothstorebilling/raw/main/release/Tara-Collection-POS-1.0.0.apk) | **4.77 MB** | Android 7.0+ (OTG Thermal Printer Ready) |
| 💻 **Windows PC / Laptop** | [👉 **Download Windows Portable EXE (v1.0.0)**](https://github.com/rajasharmaa/Clothstorebilling/raw/main/release/Tara-Collection-POS%201.0.0.exe) | **86.7 MB** | Windows 10/11 (No Installation Required) |

> 💡 **वैकल्पिक लिंक (GitHub Release Folder):**  
> आप GitHub के अंदर सीधे [`release/` फोल्डर](https://github.com/rajasharmaa/Clothstorebilling/tree/main/release) में जाकर भी दोनों फाइल्स डाउनलोड कर सकते हैं:
> - `release/Tara-Collection-POS-1.0.0.apk`
> - `release/Tara-Collection-POS 1.0.0.exe`

---

## 🔌 Android फोन में OTG Thermal Printer कैसे चलाएं:

1. **APK इंस्टॉल करें:**
   - ऊपर दिए गए लिंक से `Tara-Collection-POS-1.0.0.apk` डाउनलोड करें और फोन में इंस्टॉल करें (`Allow from Unknown Sources` allow करें)।
2. **OTG केबल कनेक्ट करें:**
   - अपने 2-inch / 3-inch (58mm / 80mm) USB Thermal Printer को OTG अडैप्टर के जरिए फोन से कनेक्ट करें।
   - फोन की **Settings** में जाकर **"OTG"** या **"OTG Connection"** को ON करें (Oppo, Vivo, Realme, Xiaomi आदि में आवश्यक)।
3. **प्रिंट करें:**
   - बिल बनने के बाद **"🔌 OTG USB Print"** या **"Thermal Print (ESC/POS)"** बटन दबाएं।
   - यदि आप RawBT इस्तेमाल करते हैं, तो 1-क्लिक में डायरेक्ट साइलेंट प्रिंट निकल जाएगा!

---

## ✨ मुख्य विशेषताएं (Key Features):

- 📱 **Mobile-First & Responsive UI:** मोबाइल में फुल-स्क्रीन बॉटम बार और स्वाइप कार्ट, कंप्यूटर में वाइड डेस्कटॉप लेआउट।
- ⚡ **Super Fast 3-Tap Billing:** केवल 3 टैप में कपड़ा सेलेक्ट करें, डिस्काउंट दें और बिल बनाएं।
- 💰 **Dual Discount Mode (% और ₹ दोनों):** पर्सेंटेज (%) या सीधे रुपए (₹) में डिस्काउंट दें, दोनों वैल्यू स्क्रीन पर साफ दिखेंगी।
- 📲 **WhatsApp PDF Share & Customer Mobile:** कस्टमर का नंबर डालकर 1-क्लिक में ओरिजिनल रसीद का PDF WhatsApp पर शेयर करें।
- 💳 **Dynamic Live UPI QR Code:** बिल का टोटल अमाउंट (जैसे ₹949.00) ऑटोमैटिक QR कोड में लोड होता है, कस्टमर PhonePe/GooglePay/Paytm से सीधे स्कैन करके पेमेंट कर सकता है।
- 📦 **Clothing-Specific Inventory:** Size (S, M, L, XL, 28, 30, 32...) और Color के अनुसार स्टॉक ट्रैकिंग।
- ➕ **Custom Item Quick Add:** बिना स्टॉक में सेव किए भी कोई भी नया कपड़ा तुरंत बिल में जोड़ें।
- 📊 **Offline & Local Storage:** बिना इंटरनेट के भी पूरा बिलिंग और स्टॉक रिकॉर्ड सुरक्षित रहता है।

---

## 🚀 Developers / Local Setup

```bash
# Clone the repository
git clone https://github.com/rajasharmaa/Clothstorebilling.git

# Enter project directory
cd Clothstorebilling

# Install dependencies
npm install

# Start Vite Web Dev Server
npm run dev

# Run Windows Desktop App (Electron)
npm run electron:dev

# Build Windows Portable EXE
npm run electron:build

# Sync & Build Android APK
npm run cap:sync
cd android && gradlew.bat assembleDebug
```

---

© 2026 **TARA COLLECTION**, Chhawni, Indore (M.P.)
