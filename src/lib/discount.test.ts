import { calculateDiscount, calculateBillSummary, round2 } from './discount';

export function runDiscountVerification(): { passed: boolean; results: string[] } {
  const results: string[] = [];
  let allPassed = true;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      results.push(`✅ PASS: ${desc}`);
    } else {
      results.push(`❌ FAIL: ${desc}`);
      allPassed = false;
    }
  }

  // 1. 10% discount on ₹1,000 = ₹100, final ₹900
  const t1 = calculateDiscount({ baseAmount: 1000, enteredType: 'PERCENT', value: 10 });
  assert(t1.amount === 100 && t1.finalAmount === 900 && t1.percent === 10, '10% on ₹1,000 = ₹100');

  // 2. ₹150 discount on ₹1,000 = 15%, final ₹850
  const t2 = calculateDiscount({ baseAmount: 1000, enteredType: 'AMOUNT', value: 150 });
  assert(t2.amount === 150 && t2.finalAmount === 850 && t2.percent === 15, '₹150 on ₹1,000 = 15%');

  // 3. 0% discount
  const t3 = calculateDiscount({ baseAmount: 1000, enteredType: 'PERCENT', value: 0 });
  assert(t3.amount === 0 && t3.finalAmount === 1000 && t3.percent === 0, '0% discount = ₹0');

  // 4. Maximum allowed discount enforcement
  const t4 = calculateDiscount({
    baseAmount: 1000,
    enteredType: 'PERCENT',
    value: 25,
    maxPercentAllowed: 15,
  });
  assert(!t4.isValid && t4.errorMessage?.includes('limit of 15%'), 'Enforces max discount limit');

  // 5. Discount greater than base amount (capped at baseAmount)
  const t5 = calculateDiscount({ baseAmount: 500, enteredType: 'AMOUNT', value: 600 });
  assert(t5.amount === 500 && t5.finalAmount === 0, 'Discount cannot exceed eligible selling price');

  // 6. Rounding test: 33.333% on 999 = 333
  const t6 = calculateDiscount({ baseAmount: 999, enteredType: 'PERCENT', value: 33.33 });
  assert(t6.amount === 332.97 && t6.finalAmount === 666.03, 'Correct decimal precision rounding');

  // 7. Complete Bill Summary with Item & Bill discounts
  // Subtotal = 2 * 1000 = 2000. Item discount = 200 (10%). Subtotal after item disc = 1800.
  // Bill discount = 5% of 1800 = 90. Total discount = 290. Final payable = 1710.
  // Effective overall discount = (290 / 2000) * 100 = 14.5%
  const summary = calculateBillSummary(
    [
      { rate: 1000, quantity: 1, discountAmount: 100 },
      { rate: 1000, quantity: 1, discountAmount: 100 },
    ],
    { type: 'PERCENT', value: 5 }
  );

  assert(summary.totalOriginalAmount === 2000, 'Original total is ₹2,000');
  assert(summary.totalItemDiscount === 200, 'Total item discount is ₹200');
  assert(summary.billDiscountAmount === 90, 'Bill discount (5% of 1800) is ₹90');
  assert(summary.totalDiscount === 290, 'Total discount is ₹290');
  assert(summary.effectiveDiscountPercent === 14.5, 'Effective overall discount is 14.5%');
  assert(summary.finalPayable === 1710, 'Final payable is ₹1,710');

  return { passed: allPassed, results };
}
