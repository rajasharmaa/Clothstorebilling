/**
 * Dual Discount Engine for TARA COLLECTION POS
 * Provides bi-directional synchronization between percentage (%) and rupee amount (₹)
 * Handles item-level and bill-level discounts with strict validations and rounding.
 */

export interface DiscountCalculationInput {
  baseAmount: number; // For item: rate * qty; For bill: subtotal after item discounts
  enteredType: 'PERCENT' | 'AMOUNT';
  value: number;
  maxPercentAllowed?: number;
}

export interface DiscountResult {
  percent: number;
  amount: number;
  finalAmount: number;
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Rounds a number strictly to two decimal places
 */
export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Calculate synchronized discount values
 */
export function calculateDiscount(input: DiscountCalculationInput): DiscountResult {
  const { baseAmount, enteredType, value, maxPercentAllowed = 100 } = input;

  if (baseAmount <= 0) {
    return {
      percent: 0,
      amount: 0,
      finalAmount: 0,
      isValid: true,
    };
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
      errorMessage: exceedsAllowed
        ? `Discount ${percent}% exceeds maximum allowed limit of ${maxPercentAllowed}%`
        : undefined,
    };
  } else {
    // enteredType === 'AMOUNT'
    const amount = Math.min(baseAmount, rawVal);
    const percent = baseAmount > 0 ? round2((amount / baseAmount) * 100) : 0;
    const finalAmount = round2(Math.max(0, baseAmount - amount));

    const exceedsAllowed = percent > maxPercentAllowed;

    return {
      percent,
      amount: round2(amount),
      finalAmount,
      isValid: !exceedsAllowed,
      errorMessage: exceedsAllowed
        ? `Discount ₹${amount} (${percent}%) exceeds limit of ${maxPercentAllowed}%`
        : undefined,
    };
  }
}

export interface BillSummary {
  totalOriginalAmount: number; // Sum of (rate * qty) for all items
  totalItemDiscount: number; // Sum of item discounts
  subtotalAfterItemDiscount: number; // totalOriginalAmount - totalItemDiscount
  billDiscountPercent: number;
  billDiscountAmount: number;
  totalDiscount: number; // totalItemDiscount + billDiscountAmount
  effectiveDiscountPercent: number; // (totalDiscount / totalOriginalAmount) * 100
  finalPayable: number;
  totalItemsCount: number;
  totalQuantity: number;
}

/**
 * Compute the complete bill summary
 */
export function calculateBillSummary(
  items: Array<{ rate: number; quantity: number; discountAmount: number }>,
  billDiscountInput: { type: 'PERCENT' | 'AMOUNT'; value: number; maxPercent?: number }
): BillSummary {
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
    maxPercentAllowed: billDiscountInput.maxPercent ?? 100,
  });

  const billDiscountAmount = billDiscountResult.amount;
  const billDiscountPercent = billDiscountResult.percent;

  const totalDiscount = round2(totalItemDiscount + billDiscountAmount);
  const finalPayable = round2(Math.max(0, totalOriginalAmount - totalDiscount));

  const effectiveDiscountPercent =
    totalOriginalAmount > 0 ? round2((totalDiscount / totalOriginalAmount) * 100) : 0;

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
    totalQuantity,
  };
}
