import { Sale, ShopSettings } from '../types';

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(amount)
    .replace('₹', '₹ ');
}

export function generateThermalReceiptHTML(
  sale: Sale,
  settings: ShopSettings,
  paperWidth: '58mm' | '80mm' = '80mm'
): string {
  const is58 = paperWidth === '58mm';
  // Physical printable area on thermal heads: 58mm roll has ~48mm printable head, 80mm has ~72mm
  const printableWidth = is58 ? '48mm' : '72mm';
  const baseFontSize = is58 ? '12px' : '13px';
  const headingSize = is58 ? '16px' : '19px';
  const smallFontSize = is58 ? '11px' : '11.5px';
  const microFontSize = is58 ? '10.5px' : '11px';

  const dateObj = new Date(sale.date);
  const formattedDate = dateObj.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = dateObj.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const itemsHtml = sale.items
    .map((item, idx) => {
      const itemOriginalTotal = (item.rate * item.quantity).toFixed(2);
      const variantDetails = [item.size ? `Size: ${item.size}` : '', item.color ? `Color: ${item.color}` : '']
        .filter(Boolean)
        .join(' | ');

      return `
      <tr style="border-bottom: 1px dashed #000;">
        <td style="padding: 4px 0; vertical-align: top; word-break: break-word; overflow-wrap: break-word;">
          <div style="font-weight: 700; color: #000; font-size: ${baseFontSize}; line-height: 1.35;">${idx + 1}. ${item.productName || 'Item'}</div>
          ${
            variantDetails
              ? `<div style="font-size: ${smallFontSize}; font-weight: 600; color: #000; margin-top: 1px; line-height: 1.3;">${variantDetails}</div>`
              : ''
          }
        </td>
        <td style="padding: 4px 2px; text-align: center; vertical-align: top; font-weight: 700; color: #000; font-size: ${baseFontSize}; white-space: nowrap;">${item.quantity}</td>
        <td style="padding: 4px 0; text-align: right; vertical-align: top; font-weight: 700; color: #000; font-size: ${baseFontSize}; font-family: monospace; white-space: nowrap;">₹${itemOriginalTotal}</td>
      </tr>
    `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt - ${sale.billNumber}</title>
  <style>
    @page {
      margin: 0;
      size: ${paperWidth} auto;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #fff;
      color: #000;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      margin: 0 auto;
      padding: ${is58 ? '4px 3px 20px 3px' : '6px 4px 28px 4px'};
      width: ${printableWidth};
      max-width: ${printableWidth};
      font-size: ${baseFontSize};
      line-height: 1.35;
      color: #000;
      word-break: break-word;
      overflow-wrap: break-word;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .bold { font-weight: 700; }
    .divider {
      border-top: 1px dashed #000;
      margin: 6px 0;
    }
    .double-divider {
      border-top: 2px dashed #000;
      margin: 6px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: inherit;
      color: #000;
    }
    th {
      border-bottom: 1px dashed #000;
      padding: 3px 0;
      font-weight: 700;
      font-size: ${smallFontSize};
      text-transform: uppercase;
      color: #000;
    }
    .savings-box {
      border: 1px dashed #000;
      background: #f4f4f4;
      padding: 5px;
      margin: 6px 0;
      text-align: center;
      font-weight: 800;
      font-size: ${baseFontSize};
      letter-spacing: 0.3px;
      color: #000;
    }
    .footer-box {
      margin-top: 8px;
      font-size: ${smallFontSize};
      color: #000;
      line-height: 1.35;
      word-break: break-word;
      overflow-wrap: break-word;
    }
    @media print {
      html, body {
        width: ${printableWidth} !important;
        max-width: ${printableWidth} !important;
        margin: 0 auto !important;
        padding: ${is58 ? '2mm 1mm 10mm 1mm' : '3mm 2mm 12mm 2mm'} !important;
        color: #000 !important;
      }
    }
  </style>
</head>
<body>
  <div class="text-center">
    <div style="font-size: ${headingSize}; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase; color: #000; line-height: 1.25;">
      ${settings?.shopName || 'TARA COLLECTION'}
    </div>
    <div style="font-size: ${smallFontSize}; font-weight: 700; margin-top: 2px; color: #000; line-height: 1.3;">
      ${settings?.tagline || ''}
    </div>
    <div style="font-size: ${microFontSize}; font-weight: 600; margin-top: 2px; color: #000; line-height: 1.35;">
      ${settings?.address || ''}
    </div>
    <div style="font-size: ${smallFontSize}; font-weight: 700; margin-top: 2px; color: #000;">
      Ph: ${settings?.phone || ''}
    </div>
    <div style="margin-top: 5px; font-weight: 800; font-size: ${smallFontSize}; letter-spacing: 0.5px; color: #000;">
      *** RETAIL CASH MEMO ***
    </div>
  </div>

  <div class="divider"></div>

  <table style="line-height: 1.35;">
    <tr>
      <td style="padding: 1px 0; font-size: ${smallFontSize}; vertical-align: top;"><strong>Memo #:</strong> <span style="font-family: monospace; font-weight: 700;">${sale.billNumber}</span></td>
      <td class="text-right" style="padding: 1px 0; font-size: ${smallFontSize}; vertical-align: top; white-space: nowrap;"><strong>Date:</strong> ${formattedDate}</td>
    </tr>
    <tr>
      <td style="padding: 1px 0; font-size: ${smallFontSize}; vertical-align: top;"><strong>Cashier:</strong> ${sale.cashierName}</td>
      <td class="text-right" style="padding: 1px 0; font-size: ${smallFontSize}; vertical-align: top; white-space: nowrap;"><strong>Time:</strong> ${formattedTime}</td>
    </tr>
    ${
      sale.customerName || sale.customerMobile
        ? `
    <tr>
      <td colspan="2" style="padding: 2px 0; font-size: ${smallFontSize}; vertical-align: top; word-break: break-word;">
        <strong>Customer:</strong> ${sale.customerName || 'Walk-in'} 
        ${sale.customerMobile ? `(${sale.customerMobile})` : ''}
      </td>
    </tr>`
        : ''
    }
  </table>

  <div class="divider"></div>

  <table>
    <thead>
      <tr>
        <th style="text-align: left; width: 56%;">Item</th>
        <th style="text-align: center; width: 14%;">Qty</th>
        <th style="text-align: right; width: 30%;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <div class="divider"></div>

  <table style="line-height: 1.4; font-size: ${baseFontSize};">
    <tr>
      <td style="color: #000; font-weight: 600;">Subtotal:</td>
      <td class="text-right" style="font-family: monospace; font-weight: 700; white-space: nowrap;">₹${sale.totalOriginalAmount.toFixed(2)}</td>
    </tr>
    ${
      sale.totalDiscount > 0
        ? `
    <tr style="color: #000; font-weight: 700;">
      <td>Total Discount:</td>
      <td class="text-right" style="font-family: monospace; font-weight: 700; white-space: nowrap;">-₹${sale.totalDiscount.toFixed(2)}</td>
    </tr>`
        : ''
    }
  </table>

  <div class="double-divider"></div>

  <table>
    <tr style="font-size: ${is58 ? '14px' : '16px'}; font-weight: 900; color: #000;">
      <td>GRAND TOTAL:</td>
      <td class="text-right" style="font-family: monospace; white-space: nowrap;">₹${sale.finalPayable.toFixed(2)}</td>
    </tr>
  </table>

  ${
    sale.totalDiscount > 0
      ? `
  <div class="savings-box">
    *** YOU SAVED ₹${sale.totalDiscount.toFixed(2)}! ***
  </div>`
      : ''
  }

  <div class="divider"></div>

  <table style="line-height: 1.4; font-size: ${baseFontSize};">
    <tr>
      <td style="color: #000; font-weight: 600;">Payment Mode:</td>
      <td class="text-right" style="font-weight: 700; white-space: nowrap;">${sale.paymentMode}</td>
    </tr>
    <tr>
      <td style="color: #000; font-weight: 600;">Amount Paid:</td>
      <td class="text-right" style="font-family: monospace; font-weight: 700; white-space: nowrap;">₹${sale.amountReceived.toFixed(2)}</td>
    </tr>
    ${
      sale.balanceDue > 0
        ? `
    <tr style="font-weight: 700; color: #000;">
      <td>Balance Due:</td>
      <td class="text-right" style="font-family: monospace; white-space: nowrap;">₹${sale.balanceDue.toFixed(2)}</td>
    </tr>`
        : `
    <tr>
      <td style="color: #000; font-weight: 600;">Balance Due:</td>
      <td class="text-right" style="font-family: monospace; font-weight: 700; white-space: nowrap;">₹0.00</td>
    </tr>`
    }
  </table>

  <div class="double-divider"></div>

  <div class="text-center footer-box">
    <div style="font-weight: 700; font-size: ${smallFontSize}; color: #000;">${settings?.receiptFooter || 'Thank you! Visit again.'}</div>
    ${
      settings?.exchangePolicy
        ? `<div style="margin-top: 4px; font-size: ${microFontSize}; font-weight: 600; color: #000; line-height: 1.35;">${settings.exchangePolicy}</div>`
        : ''
    }
    <div style="margin-top: 6px; font-size: ${microFontSize}; font-weight: 600; color: #000;">Generated via TARA POS System</div>
  </div>
</body>
</html>
`;
}

export function generateA4ReceiptHTML(sale: Sale, settings: ShopSettings): string {
  const dateObj = new Date(sale.date);
  const formattedDate = dateObj.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = dateObj.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const rows = sale.items
    .map(
      (item, idx) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 10px; text-align: center;">${idx + 1}</td>
      <td style="padding: 10px;">
        <div style="font-weight: 600; color: #111827;">${item.productName}</div>
        <div style="font-size: 12px; color: #6b7280;">Category: ${item.category}</div>
      </td>
      <td style="padding: 10px; text-align: center;">${item.size}</td>
      <td style="padding: 10px; text-align: center;">${item.color}</td>
      <td style="padding: 10px; text-align: center; font-weight: 600;">${item.quantity}</td>
      <td style="padding: 10px; text-align: right;">₹${item.rate.toFixed(2)}</td>
      <td style="padding: 10px; text-align: right; color: #047857;">
        ${
          item.discountAmount > 0
            ? `-₹${item.discountAmount.toFixed(2)}`
            : '-'
        }
      </td>
      <td style="padding: 10px; text-align: right; font-weight: 700; color: #111827;">
        ₹${item.finalAmount.toFixed(2)}
      </td>
    </tr>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Cash Memo - ${sale.billNumber}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      color: #1f2937;
      background: #fff;
      font-size: 14px;
      line-height: 1.5;
    }
    .header-box {
      display: flex;
      justify-content: space-between;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .shop-title {
      font-size: 26px;
      font-weight: 800;
      color: #1e3a8a;
      letter-spacing: -0.5px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
      border-radius: 6px;
      font-weight: 700;
      font-size: 14px;
    }
    table { width: 100%; border-collapse: collapse; }
    th {
      background: #f8fafc;
      padding: 10px;
      border-bottom: 2px solid #cbd5e1;
      font-weight: 700;
      color: #334155;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="header-box">
    <div>
      <div class="shop-title">${settings.shopName}</div>
      <div style="font-weight: 600; color: #4b5563; margin-top: 2px;">${settings.tagline}</div>
      <div style="color: #6b7280; font-size: 13px; margin-top: 4px; max-width: 400px;">
        ${settings.address}
      </div>
      <div style="color: #374151; font-weight: 600; font-size: 13px; margin-top: 2px;">
        Phone: ${settings.phone}
      </div>
    </div>
    <div style="text-align: right;">
      <div class="badge">RETAIL CASH MEMO</div>
      <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">(Non-GST Retail Sale)</div>
      <div style="font-size: 18px; font-weight: 800; color: #111827; margin-top: 8px;">
        # ${sale.billNumber}
      </div>
      <div style="font-size: 13px; color: #4b5563;">Date: ${formattedDate} | ${formattedTime}</div>
    </div>
  </div>

  <div style="display: flex; justify-content: space-between; background: #f9fafb; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px;">
    <div>
      <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 700;">Customer Details</div>
      <div style="font-size: 15px; font-weight: 700; color: #111827; margin-top: 2px;">
        ${sale.customerName || 'Walk-in Customer'}
      </div>
      ${sale.customerMobile ? `<div style="font-size: 13px; color: #4b5563;">Mobile: ${sale.customerMobile}</div>` : ''}
      ${sale.customerAddress ? `<div style="font-size: 13px; color: #4b5563;">Address: ${sale.customerAddress}</div>` : ''}
    </div>
    <div style="text-align: right;">
      <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 700;">Billing Agent</div>
      <div style="font-size: 14px; font-weight: 600; color: #111827; margin-top: 2px;">${sale.cashierName}</div>
      <div style="font-size: 13px; color: #4b5563;">Payment Mode: <strong style="color: #1e40af;">${sale.paymentMode}</strong></div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 5%;">#</th>
        <th style="text-align: left; width: 40%;">Item Description</th>
        <th style="width: 8%;">Size</th>
        <th style="width: 10%;">Color</th>
        <th style="width: 7%;">Qty</th>
        <th style="text-align: right; width: 10%;">Rate</th>
        <th style="text-align: right; width: 10%;">Discount</th>
        <th style="text-align: right; width: 10%;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <div style="display: flex; justify-content: space-between; margin-top: 24px;">
    <div style="width: 50%; padding-right: 20px;">
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px; margin-bottom: 12px;">
        <div style="color: #166534; font-weight: 800; font-size: 15px;">
          🎉 Total Savings on this Bill: ₹${sale.totalDiscount.toFixed(2)}
        </div>
        <div style="color: #15803d; font-size: 12px; margin-top: 4px;">
          Thank you for choosing ${settings.shopName}! We appreciate your trust.
        </div>
      </div>
      <div style="font-size: 12px; color: #4b5563; line-height: 1.5;">
        <strong>Exchange Policy:</strong><br>
        ${settings.exchangePolicy}
      </div>
    </div>

    <div style="width: 45%;">
      <table style="width: 100%;">
        <tr>
          <td style="padding: 6px 0; color: #4b5563;">Original Subtotal:</td>
          <td style="padding: 6px 0; text-align: right; font-weight: 600;">₹${sale.totalOriginalAmount.toFixed(2)}</td>
        </tr>
        ${
          sale.totalItemDiscount > 0
            ? `
        <tr>
          <td style="padding: 6px 0; color: #047857;">Item-level Discounts:</td>
          <td style="padding: 6px 0; text-align: right; color: #047857; font-weight: 600;">-₹${sale.totalItemDiscount.toFixed(2)}</td>
        </tr>`
            : ''
        }
        ${
          sale.billDiscountAmount > 0
            ? `
        <tr>
          <td style="padding: 6px 0; color: #047857;">Bill Discount:</td>
          <td style="padding: 6px 0; text-align: right; color: #047857; font-weight: 600;">-₹${sale.billDiscountAmount.toFixed(2)}</td>
        </tr>`
            : ''
        }
        <tr style="border-top: 2px solid #e5e7eb; border-bottom: 2px solid #111827;">
          <td style="padding: 10px 0; font-size: 18px; font-weight: 800; color: #111827;">Grand Total:</td>
          <td style="padding: 10px 0; text-align: right; font-size: 20px; font-weight: 900; color: #1d4ed8;">
            ₹${sale.finalPayable.toFixed(2)}
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #4b5563;">Amount Received:</td>
          <td style="padding: 6px 0; text-align: right; font-weight: 600;">₹${sale.amountReceived.toFixed(2)}</td>
        </tr>
        ${
          sale.balanceDue > 0
            ? `
        <tr style="color: #b91c1c; font-weight: 700;">
          <td style="padding: 6px 0;">Balance Due:</td>
          <td style="padding: 6px 0; text-align: right;">₹${sale.balanceDue.toFixed(2)}</td>
        </tr>`
            : `
        <tr>
          <td style="padding: 6px 0; color: #4b5563;">Balance Due:</td>
          <td style="padding: 6px 0; text-align: right;">₹0.00</td>
        </tr>`
        }
      </table>
    </div>
  </div>

  <div style="margin-top: 50px; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 15px; color: #9ca3af; font-size: 11px;">
    ${settings.receiptFooter} • For queries, contact ${settings.phone}
  </div>
</body>
</html>
`;
}

/**
 * Generate formatted text for instant WhatsApp sharing
 */
export function generateWhatsAppMessage(sale: Sale, settings: ShopSettings): string {
  const dateObj = new Date(sale.date);
  const formattedDate = dateObj.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  let msg = `*${settings.shopName}*\n`;
  msg += `${settings.tagline}\n`;
  msg += `Address: ${settings.address}\n`;
  msg += `Phone: ${settings.phone}\n\n`;
  msg += `*RETAIL CASH MEMO*\n`;
  msg += `Bill No: *${sale.billNumber}*\n`;
  msg += `Date: ${formattedDate}\n`;
  if (sale.customerName) msg += `Customer: ${sale.customerName}\n`;
  msg += `--------------------------------\n`;

  sale.items.forEach((item, i) => {
    msg += `${i + 1}. *${item.productName}*\n`;
    msg += `   Size: ${item.size} | Color: ${item.color} | Qty: ${item.quantity}\n`;
    msg += `   Rate: Rs. ${item.rate.toFixed(0)} | Total: *Rs. ${(item.rate * item.quantity).toFixed(0)}*\n`;
    if (item.discountAmount > 0) {
      msg += `   (Chhoot: -Rs. ${item.discountAmount.toFixed(0)})\n`;
    }
  });

  msg += `--------------------------------\n`;
  msg += `Subtotal: Rs. ${sale.totalOriginalAmount.toFixed(2)}\n`;
  if (sale.totalDiscount > 0) {
    msg += `Total Discount: -Rs. ${sale.totalDiscount.toFixed(2)}\n`;
  }
  msg += `*GRAND TOTAL: Rs. ${sale.finalPayable.toFixed(2)}*\n`;
  if (sale.totalDiscount > 0) {
    msg += `*YOU SAVED: Rs. ${sale.totalDiscount.toFixed(2)}!*\n`;
  }
  msg += `Payment Mode: ${sale.paymentMode}\n`;
  if (sale.balanceDue > 0) {
    msg += `Balance Due: Rs. ${sale.balanceDue.toFixed(2)}\n`;
  }
  msg += `\n${settings.receiptFooter}\n`;
  msg += `Exchange policy: ${settings.exchangePolicy}`;

  return msg;
}

/**
 * Trigger print via Native Android Print, Android USB OTG RawBT, Electron silent print, or hidden iframe
 */
export async function triggerPrint(
  sale: Sale,
  settings: ShopSettings,
  paperWidth: '58mm' | '80mm' | 'A4' = '80mm',
  mode: 'auto' | 'rawbt' | 'standard' = 'auto'
): Promise<{ success: boolean; message?: string }> {
  const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;
  const androidPrint = typeof window !== 'undefined' ? (window as any).AndroidPrint : undefined;

  const html =
    paperWidth === 'A4'
      ? generateA4ReceiptHTML(sale, settings)
      : generateThermalReceiptHTML(sale, settings, paperWidth);

  // 1. Android Native APK Environment (Phone APK)
  if (androidPrint && typeof androidPrint.printHTML === 'function') {
    const base64Html = btoa(unescape(encodeURIComponent(html)));

    if (mode === 'rawbt') {
      try {
        const sent = androidPrint.printRawBT(base64Html);
        return {
          success: sent,
          message: sent
            ? 'OTG Thermal Printer ko command bhej di gayi!'
            : 'RawBT Thermal Printer app kholi ja rahi hai...',
        };
      } catch (e) {
        console.warn('AndroidPrint RawBT failed, falling back to system print', e);
      }
    }

    // Default or fallback on Android: Native System PrintManager
    try {
      androidPrint.printHTML(html, `Bill_${sale.billNumber}`);
      return { success: true, message: 'Android Print dialog khul raha hai...' };
    } catch (e) {
      console.warn('AndroidPrint printHTML failed', e);
    }
  }

  // 2. Electron Silent Print (for Windows Desktop / Portable EXE)
  if (isElectron) {
    try {
      // Pass html string as first argument to avoid [object Object] coercion in Electron IPC
      const res = await (window as any).electronAPI.silentPrint(html, '', paperWidth);
      if (res && res.success) return { success: true, message: 'Print sent to desktop printer!' };
    } catch (e) {
      console.warn('Electron silent print failed, falling back', e);
    }
  }

  // 3. Direct Android USB OTG RawBT Print via custom URI (Browser fallback)
  if (mode === 'rawbt') {
    try {
      const base64Html = btoa(unescape(encodeURIComponent(html)));
      window.location.href = `rawbt:data:text/html;base64,${base64Html}`;
      return { success: true, message: 'Sent to OTG Thermal Printer!' };
    } catch (e) {
      console.warn('RawBT intent failed, falling back to spooler', e);
    }
  }

  // 4. Robust Hidden Iframe Print (Browser & Web fallback)
  return new Promise((resolve) => {
    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.visibility = 'hidden';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();

        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            setTimeout(() => {
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
              }
            }, 3000);
            resolve({ success: true, message: 'Print window opened' });
          } catch (err) {
            console.error('Iframe print error', err);
            window.print();
            resolve({ success: true });
          }
        }, 400);
      } else {
        window.print();
        resolve({ success: true });
      }
    } catch (err) {
      console.error('Print failed', err);
      window.print();
      resolve({ success: true });
    }
  });
}

/**
 * Direct 1-tap OTG USB Thermal Printer function for Android
 */
export function printViaOTGUsb(
  sale: Sale,
  settings: ShopSettings,
  paperWidth: '58mm' | '80mm' = '80mm'
): Promise<{ success: boolean; message?: string }> {
  return triggerPrint(sale, settings, paperWidth, 'rawbt');
}
