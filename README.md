# 🛍️ TARA COLLECTION - Retail POS & Inventory Billing System

> **Men's Wear & Sports Wear** | Chhawni, Indore (M.P.)  
> Fast, Mobile-First Retail POS with OTG USB Thermal Printing, Dynamic UPI QR, Camera Barcode Scanner, Multi-Language, and Offline Backup.

---

## 📥 Direct Downloads (डाउनलोड लिंक)

आप नीचे दिए गए डायरेक्ट लिंक पर क्लिक करके सीधे **APK (Mobile)** या **EXE (PC/Laptop)** डाउनलोड कर सकते हैं:

| Platform | Download Link | File Size | Description |
| :--- | :--- | :--- | :--- |
| 📱 **Android Mobile** | [👉 **Download Android APK (v1.0.0)**](https://github.com/rajasharmaa/Clothstorebilling/raw/main/release/Tara-Collection-POS-1.0.0.apk) | **4.77 MB** | Android 7.0+ (OTG Thermal Printer & Camera Barcode Ready) |
| 💻 **Windows PC / Laptop** | [👉 **Download Windows Portable EXE (v1.0.0)**](https://github.com/rajasharmaa/Clothstorebilling/raw/main/release/Tara-Collection-POS%201.0.0.exe) | **86.7 MB** | Windows 10/11 (No Installation Required) |

> 💡 **GitHub Release Files:**  
> आप GitHub के अंदर सीधे [`release/` फोल्डर](https://github.com/rajasharmaa/Clothstorebilling/tree/main/release) में जाकर भी दोनों फाइल्स डाउनलोड कर सकते हैं:
> - `release/Tara-Collection-POS-1.0.0.apk`
> - `release/Tara-Collection-POS 1.0.0.exe`

---

## ✨ मुख्य विशेषताएं (Key Features):

1. **📷 Camera Barcode & QR Scanner:**
   - मोबाइल फोन के कैमरे से कपड़ों के टैग का बारकोड या क्यूआर कोड तुरंत स्कैन करें।
   - बारकोड स्कैन होते ही कपड़ा स्वतः बिल में जुड़ जाता है।

2. **🔌 Android OTG Thermal & System Printing:**
   - 2-inch (58mm) और 3-inch (80mm) USB OTG थर्मल प्रिंटर सपोर्ट (RawBT डायरेक्ट 1-क्लिक प्रिंट)।
   - Android System Print Dialog व A4 फुल इनवॉइस सपोर्ट।

3. **🌐 Tri-Lingual Support (बहुभाषी):**
   - **English**, **हिन्दी**, और **मराठी (मराठी)** भाषा सपोर्ट। 1-टैप में पूरी ऐप की भाषा बदलें।

4. **🌙 Dark & Light Theme:**
   - दिन और रात के लिए डार्क / लाइट मोड टॉगल।

5. **📥 CSV & Excel Data Export:**
   - **Sales History**: सभी बिलों की सूची Excel/CSV में डाउनलोड करें।
   - **Inventory / Stock**: पूरा स्टॉक व मूल्यांकन CSV में एक्सपोर्ट करें।
   - **Customer Khata**: ग्राहकों की उधारी व फोन नंबर CSV में डाउनलोड करें।
   - **Expenses**: दुकान के सभी खर्चों का हिसाब CSV में निकालें।
   - **Financial Reports**: बिक्री, मुनाफा और केटेगरी रिपोर्ट एक्सपोर्ट करें।

6. **💾 Mobile Backup & Restore (JSON):**
   - 1-क्लिक में पूरी दुकान का डेटा बैकअप (JSON) डाउनलोड करें और कभी भी दूसरे फोन या कंप्यूटर में रिस्टोर करें।

7. **💳 Dynamic Live UPI QR Code:**
   - बिल का कुल देय अमाउंट (जैसे ₹649.00) ऑटोमैटिक QR में लोड होता है, ग्राहक सीधे PhonePe / GooglePay / Paytm से स्कैन करके भुगतान कर सकता है।

8. **💰 Dual Discount Mode (% और ₹ दोनों):**
   - पर्सेंटेज (%) या सीधे रुपए (₹) में छूट दें।

9. **📲 WhatsApp PDF Share:**
   - ग्राहक का मोबाइल नंबर डालकर 1-क्लिक में रसीद का PDF WhatsApp पर भेजें।

---

## 🔌 Android फोन में OTG Thermal Printer कैसे चलाएं:

1. **APK इंस्टॉल करें:**
   - ऊपर दिए गए लिंक से `Tara-Collection-POS-1.0.0.apk` डाउनलोड करें और फोन में इंस्टॉल करें (`Allow from Unknown Sources` allow करें)।
2. **OTG केबल कनेक्ट करें:**
   - अपने 2-inch / 3-inch (58mm / 80mm) USB Thermal Printer को OTG अडैप्टर के जरिए फोन से कनेक्ट करें।
   - फोन की **Settings** में जाकर **"OTG"** या **"OTG Connection"** को ON करें (Oppo, Vivo, Realme, Xiaomi आदि में आवश्यक)।
3. **प्रिंट करें:**
   - बिल बनने के बाद **"🔌 OTG USB Print"** या **"System Print"** बटन दबाएं।
   - यदि आप RawBT इस्तेमाल करते हैं, तो 1-क्लिक में डायरेक्ट प्रिंट निकल जाएगा!

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
npx cap sync
cd android && gradlew.bat assembleDebug
```

---

© 2026 **TARA COLLECTION**, Chhawni, Indore (M.P.)
