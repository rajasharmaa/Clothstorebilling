# Current UI / UX & Functionality Audit — TARA COLLECTION

## 1. Executive Summary
The previous iteration of the TARA COLLECTION application was designed primarily as a split-pane desktop POS with an Electron wrapper, a wide left-side navigation rail, dense desktop data tables, and hardware features (barcode scanner listener, barcode label generation, and F2/F4/F8 keyboard shortcuts).

The actual operational reality of TARA COLLECTION is:
- **Single Android Smartphone** as the primary operating interface.
- **One Portable Bluetooth / USB Thermal Printer** (80mm / 58mm).
- **No barcode scanner, no barcode printer, no desktop keyboard.**

## 2. Identified Desktop & Hardware Bottlenecks
1. **Desktop Split Pane POS**: The billing page split horizontally with catalog on left and cart on right (w-[480px] fixed width), which causes horizontal truncation and overflow on mobile viewports (360px - 430px).
2. **Barcode & SKU Clutter**: Every variant displayed SKU and Barcode, inputs were listening for rapid hardware barcode scanner keypresses, and barcode label printing modals added unnecessary complexity.
3. **Wide Tables in Data Modules**: Products, Inventory, Stock Ledger, Purchases, and Sales History all used horizontal desktop `<table>` elements with 8-11 columns, requiring awkward sideways scrolling on mobile devices.
4. **Desktop Navigation**: A persistent 64-width (`w-64`) desktop sidebar occupied screen width, completely incompatible with phone viewports.
5. **Keyboard Shortcuts**: "F2 New Bill", "F4 Search", "F8 Pay" took up visual space and confused mobile users who only have a touch keyboard.
6. **No Mobile Bottom Sheet**: Adding variants required desktop modals rather than native mobile bottom sheets.
7. **No Quick Custom Item**: If an uninventoried item (e.g. seasonal rain coat or belt) was sold, the cashier had no way to bill it without formally creating a product master first.

## 3. Preserved Business Logic & Integrity
- Dual discount engine (% and ₹ bi-directional calculation) with automatic ₹50/pc rule.
- Atomic stock transaction deductions and sequential cash memo numbering (`TC-YYYY-XXXXXX`).
- Non-GST retail cash memo format (no GST/CGST/SGST/HSN slop).
- Existing products, clothing categories, customers, suppliers, expenses, and transaction logs.
