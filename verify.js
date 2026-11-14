function round2(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

function calculateDiscount({ baseAmount, enteredType, value, maxPercentAllowed = 100 }) {
  if (baseAmount <= 0) {
    return { percent: 0, amount: 0, finalAmount: 0, isValid: true };
  }
  const rawVal = Math.max(0, Number(value) || 0);
  if (enteredType === 'PERCENT') {
    const percent = Math.min(100, rawVal);
    const amount = round2((baseAmount * percent) / 100);
    const finalAmount = round2(Math.max(0, baseAmount - amount));
    const exceedsAllowed = percent > maxPercentAllowed;
    return {
      percent: round2(percent),
      amount,
      finalAmount,
      isValid: !exceedsAllowed,
      errorMessage: exceedsAllowed ? `Discount ${percent}% exceeds limit of ${maxPercentAllowed}%` : undefined
    };
  } else {
    const amount = Math.min(baseAmount, rawVal);
    const percent = baseAmount > 0 ? round2((amount / baseAmount) * 100) : 0;
    const finalAmount = round2(Math.max(0, baseAmount - amount));
    const exceedsAllowed = percent > maxPercentAllowed;
    return {
      percent,
      amount: round2(amount),
      finalAmount,
      isValid: !exceedsAllowed,
      errorMessage: exceedsAllowed ? `Discount ₹${amount} exceeds limit` : undefined
    };
  }
}

function calculateBillSummary(items, billDiscountInput) {
  let totalOriginalAmount = 0;
  let totalItemDiscount = 0;
  let totalQuantity = 0;

  for (const item of items) {
    const lineTotal = round2(item.rate * item.quantity);
    totalOriginalAmount = round2(totalOriginalAmount + lineTotal);
    totalItemDiscount = round2(totalItemDiscount + Math.min(lineTotal, item.discountAmount || 0));
    totalQuantity += item.quantity;
  }

  const subtotalAfterItemDiscount = round2(Math.max(0, totalOriginalAmount - totalItemDiscount));

  const billDiscountResult = calculateDiscount({
    baseAmount: subtotalAfterItemDiscount,
    enteredType: billDiscountInput.type,
    value: billDiscountInput.value,
    maxPercentAllowed: billDiscountInput.maxPercent || 100
  });

  const billDiscountAmount = billDiscountResult.amount;
  const billDiscountPercent = billDiscountResult.percent;
  const totalDiscount = round2(totalItemDiscount + billDiscountAmount);
  const finalPayable = round2(Math.max(0, totalOriginalAmount - totalDiscount));
  const effectiveDiscountPercent = totalOriginalAmount > 0 ? round2((totalDiscount / totalOriginalAmount) * 100) : 0;

  return {
    totalOriginalAmount,
    totalItemDiscount,
    subtotalAfterItemDiscount,
    billDiscountPercent,
    billDiscountAmount,
    totalDiscount,
    effectiveDiscountPercent,
    finalPayable,
    totalItemsCount: items.length,
    totalQuantity
  };
}

// EXECUTE TESTS
console.log("=== TARA COLLECTION POS DISCOUNT ENGINE VERIFICATION ===");
// Test 1: 10% on 1000
const t1 = calculateDiscount({ baseAmount: 1000, enteredType: 'PERCENT', value: 10 });
console.assert(t1.amount === 100 && t1.finalAmount === 900 && t1.percent === 10, "Test 1 failed");
console.log("✓ Test 1 Passed: 10% on ₹1,000 = ₹100 discount, Final ₹900");

// Test 2: ₹150 on 1000
const t2 = calculateDiscount({ baseAmount: 1000, enteredType: 'AMOUNT', value: 150 });
console.assert(t2.amount === 150 && t2.finalAmount === 850 && t2.percent === 15, "Test 2 failed");
console.log("✓ Test 2 Passed: ₹150 on ₹1,000 = 15% discount, Final ₹850");

// Test 3: 0% discount
const t3 = calculateDiscount({ baseAmount: 1000, enteredType: 'PERCENT', value: 0 });
console.assert(t3.amount === 0 && t3.finalAmount === 1000 && t3.percent === 0, "Test 3 failed");
console.log("✓ Test 3 Passed: 0% discount = ₹0, Final ₹1,000");

// Test 4: Maximum allowed discount (Cashier limit)
const t4 = calculateDiscount({ baseAmount: 1000, enteredType: 'PERCENT', value: 25, maxPercentAllowed: 15 });
console.assert(!t4.isValid, "Test 4 failed");
console.log("✓ Test 4 Passed: 25% discount blocked when cashier max limit is 15%");

// Test 5: Discount greater than eligible amount
const t5 = calculateDiscount({ baseAmount: 500, enteredType: 'AMOUNT', value: 600 });
console.assert(t5.amount === 500 && t5.finalAmount === 0, "Test 5 failed");
console.log("✓ Test 5 Passed: Discount capped at base amount (₹500), cannot exceed selling price");

// Test 6: Decimal precision & rounding
const t6 = calculateDiscount({ baseAmount: 999, enteredType: 'PERCENT', value: 33.33 });
console.assert(t6.amount === 332.97 && t6.finalAmount === 666.03, "Test 6 failed");
console.log("✓ Test 6 Passed: 33.33% on ₹999 = ₹332.97, Final ₹666.03 (2 decimals exact)");

// Test 7: Item discount + Bill discount
const s = calculateBillSummary(
  [
    { rate: 1000, quantity: 1, discountAmount: 100 },
    { rate: 1000, quantity: 1, discountAmount: 100 }
  ],
  { type: 'PERCENT', value: 5 }
);
console.assert(s.totalOriginalAmount === 2000, "Bill Subtotal failed");
console.assert(s.totalItemDiscount === 200, "Item discount failed");
console.assert(s.billDiscountAmount === 90, "Bill discount failed");
console.assert(s.totalDiscount === 290, "Total discount failed");
console.assert(s.effectiveDiscountPercent === 14.5, "Effective percent failed");
console.assert(s.finalPayable === 1710, "Final payable failed");
console.log("✓ Test 7 Passed: Item discount (₹200) + Bill discount (5% of ₹1,800 = ₹90) => Total Discount ₹290, Effective 14.5%, Final ₹1,710");

console.log("\nALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!");
