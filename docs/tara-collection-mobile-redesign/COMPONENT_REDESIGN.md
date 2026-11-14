# Component Redesign Specifications

## 1. Bottom Navigation Bar (`MobileBottomNav.tsx`)
- Fixed bottom container with safe-area padding (`pb-safe`).
- 4 touch items with 48px min touch areas:
  - ShoppingCart: "Billing"
  - Layers: "Stock"
  - Receipt: "Bills"
  - Grid / MoreHorizontal: "More"
- Badge counters on Cart items.
- Active tab highlighted in vibrant Tara Blue (`text-blue-600 bg-blue-50/80 rounded-xl`).

## 2. Product Variant Selection Bottom Sheet
- Replaces desktop popup modal.
- Slides up from screen bottom with backdrop blur.
- Shows Product Name, Category tag, Price.
- Size chips: `[30] [32] [34] [36]` with stock count.
- Color chips: `[Dark Blue] [Black]`.
- Large Quantity stepper `[-] [ 1 ] [+]`.
- Full-width "ADD TO BILL" primary button (₹999 - ₹50 auto disc = ₹949).

## 3. Quick Custom Item Sheet
- Simple modal sheet to bill uninventoried items.
- Fields: Item Name (e.g. "Rain Coat" or "Belt"), Selling Price (₹), Quantity, Discount (₹).
- Added to cart with `isCustom: true`, skipping inventory deduction.

## 4. Mobile Cart Bottom Sheet & Sticky Footer
- Sticky bottom footer when cart has items:
  `[ 2 Items | Disc: ₹100 | Total: ₹1,898 ] [ VIEW CART / PAY → ]`
- Tap expands the Cart Bottom Sheet:
  - Line items with size & color.
  - Large `+` and `-` quantity steppers.
  - Dual discount inputs (% and ₹).
  - Bill-level discount.
  - Customer selection (Walk-in / Phone).
  - "Continue to Payment" button.

## 5. Mobile Payment & Success Screen
- Payment Sheet: Grand Total, payment mode buttons (Cash, UPI, Card, Due, Split), Cash received & change.
- Success Screen: Animated green check, Bill Number, Grand Total, large touch buttons: "PRINT SLIP", "WHATSAPP SHARE", "NEW BILL".

## 6. Stock Cards & Quick Adjustment Sheet
- Replaces 10-column table with responsive product cards showing size/color chips with colored stock badges (Green: >3 pcs, Orange: 1-3 pcs, Red: 0 pcs).
- Tapping a variant chip directly opens "Stock Adjustment" bottom sheet (+ Add Stock, - Remove Damaged, Set Quantity).
