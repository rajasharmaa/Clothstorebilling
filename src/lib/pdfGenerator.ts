import { jsPDF } from 'jspdf';
import { Sale, ShopSettings } from '../types';

/**
 * Generates an official, beautifully formatted PDF Retail Cash Memo for TARA COLLECTION
 */
export function generateReceiptPDF(sale: Sale, settings: ShopSettings): jsPDF {
  // A5 page (148mm x 210mm) is the standard retail invoice size in India - highly readable on phones & printable
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5',
  });

  const pageWidth = 148;
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;
  let y = 14;

  // --- HEADER SECTION ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(settings.shopName || 'TARA COLLECTION', pageWidth / 2, y, { align: 'center' });

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(37, 99, 235); // blue-600
  doc.text(settings.tagline || "MEN'S WEAR | SPORTS WEAR", pageWidth / 2, y, { align: 'center' });

  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(settings.address || 'Chhawni, Indore (M.P.)', pageWidth / 2, y, { align: 'center' });

  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`Phone / WhatsApp: ${settings.phone || '7000627153'}`, pageWidth / 2, y, { align: 'center' });

  // Divider Line
  y += 4;
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);

  // --- MEMO TITLE & BILL INFO ---
  y += 5;
  doc.setFillColor(241, 245, 249); // slate-100
  doc.roundedRect(margin, y - 3.5, contentWidth, 7, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('RETAIL CASH MEMO', pageWidth / 2, y + 1, { align: 'center' });

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

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

  // Left Column
  doc.text(`Memo #: `, margin, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(sale.billNumber, margin + 14, y);

  // Right Column (Date/Time)
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Date: ${formattedDate}  ${formattedTime}`, pageWidth - margin, y, { align: 'right' });

  // Customer Info
  if (sale.customerName || sale.customerMobile) {
    y += 4.5;
    doc.text(
      `Customer: ${sale.customerName || 'Valued Customer'}${
        sale.customerMobile ? ` (${sale.customerMobile})` : ''
      }`,
      margin,
      y
    );
  }

  // --- ITEMS TABLE HEADER ---
  y += 6;
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);

  doc.text('#', margin + 2, y + 4.2);
  doc.text('ITEM DESCRIPTION', margin + 8, y + 4.2);
  doc.text('QTY', margin + 74, y + 4.2, { align: 'center' });
  doc.text('RATE', margin + 96, y + 4.2, { align: 'right' });
  doc.text('AMOUNT', pageWidth - margin - 2, y + 4.2, { align: 'right' });

  // --- ITEMS ROWS ---
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);

  sale.items.forEach((item, index) => {
    // Alternating row background
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 7, 'F');
    }

    doc.setFont('helvetica', 'bold');
    doc.text(String(index + 1), margin + 2, y + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    const itemName = item.productName.length > 28 ? item.productName.slice(0, 27) + '..' : item.productName;
    doc.text(itemName, margin + 8, y + 4.5);

    // Size / Color badge
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`[${item.size}/${item.color}]`, margin + 50, y + 4.5);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(String(item.quantity), margin + 74, y + 4.5, { align: 'center' });
    doc.text(`Rs.${item.rate.toFixed(0)}`, margin + 96, y + 4.5, { align: 'right' });
    doc.text(`Rs.${(item.rate * item.quantity).toFixed(2)}`, pageWidth - margin - 2, y + 4.5, { align: 'right' });

    y += 7;
  });

  // Table bottom border
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);

  // --- FINANCIAL TOTALS BOX ---
  y += 4;
  const summaryX = margin + 50;
  const summaryWidth = contentWidth - 50;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Subtotal:', summaryX, y);
  doc.text(`Rs. ${sale.totalOriginalAmount.toFixed(2)}`, pageWidth - margin - 2, y, { align: 'right' });

  if (sale.totalDiscount > 0) {
    y += 4.5;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 163, 74); // emerald-600
    doc.text('Total Discount (Chhoot):', summaryX, y);
    doc.text(`- Rs. ${sale.totalDiscount.toFixed(2)}`, pageWidth - margin - 2, y, { align: 'right' });
  }

  y += 5;
  doc.setFillColor(238, 242, 255); // indigo-50
  doc.setDrawColor(99, 102, 241);
  doc.roundedRect(summaryX - 2, y - 3.5, summaryWidth + 2, 8, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 58, 138); // blue-900
  doc.text('GRAND TOTAL:', summaryX, y + 2);
  doc.text(`Rs. ${sale.finalPayable.toFixed(2)}`, pageWidth - margin - 2, y + 2, { align: 'right' });

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Payment Mode: ${sale.paymentMode}`, summaryX, y);
  doc.text(`Status: COMPLETED (PAID)`, pageWidth - margin - 2, y, { align: 'right' });

  // Savings Announcement if discount given
  if (sale.totalDiscount > 0) {
    y += 6;
    doc.setFillColor(220, 252, 231); // green-100
    doc.setDrawColor(34, 197, 94);
    doc.roundedRect(margin, y, contentWidth, 6, 1, 1, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(21, 128, 61);
    doc.text(`*** YOU SAVED Rs. ${sale.totalDiscount.toFixed(2)} ON THIS BILL! ***`, pageWidth / 2, y + 4.2, {
      align: 'center',
    });
    y += 6;
  }

  // --- FOOTER & POLICIES ---
  y = Math.max(y + 8, 185);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);

  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Thank you for shopping with TARA COLLECTION!', pageWidth / 2, y, { align: 'center' });

  y += 3.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Exchange within 7 days with original tag and bill. No cash refund.', pageWidth / 2, y, {
    align: 'center',
  });

  return doc;
}

/**
 * Downloads the receipt PDF directly to the user's computer or smartphone
 */
export function downloadReceiptPDF(sale: Sale, settings: ShopSettings): void {
  const doc = generateReceiptPDF(sale, settings);
  const filename = `Tara_Collection_Bill_${sale.billNumber}.pdf`;
  doc.save(filename);
}

/**
 * Shares the PDF directly via WhatsApp:
 * - On Mobile (Web Share API): directly attaches the PDF document to WhatsApp chat!
 * - On Desktop: downloads the PDF and opens WhatsApp Web with customer phone number!
 */
export async function sharePDFOnWhatsApp(
  sale: Sale,
  settings: ShopSettings,
  recipientMobile?: string
): Promise<{ success: boolean; method: 'web_share' | 'whatsapp_web' }> {
  const targetMobile = (recipientMobile || sale.customerMobile || '').replace(/\D/g, '');
  const doc = generateReceiptPDF(sale, settings);
  const filename = `Tara_Collection_Bill_${sale.billNumber}.pdf`;
  const pdfBlob = doc.output('blob');

  // Try Native Web Share API with File Attachment (Standard on Android & iOS mobile)
  if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
    const file = new File([pdfBlob], filename, { type: 'application/pdf' });
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `${settings.shopName} Bill #${sale.billNumber}`,
          text: `Greetings from ${settings.shopName}! Here is your bill #${sale.billNumber} (Total: Rs. ${sale.finalPayable.toFixed(2)}). Thank you for shopping with us!`,
        });
        return { success: true, method: 'web_share' };
      } catch (err) {
        // User cancelled share dialog or fallback
        console.log('Native share closed/cancelled', err);
      }
    }
  }

  // Fallback for Desktop Browsers (download PDF + open WhatsApp chat)
  doc.save(filename);

  const cleanMobile = targetMobile.length === 10 ? `91${targetMobile}` : targetMobile;
  const message = encodeURIComponent(
    `Greetings from *${settings.shopName}*! Here is your bill *#${sale.billNumber}* (Total: *Rs. ${sale.finalPayable.toFixed(2)}*).\n\nPDF invoice has been downloaded. Thank you for shopping with us! 🙏`
  );

  const whatsappUrl = cleanMobile
    ? `https://api.whatsapp.com/send?phone=${cleanMobile}&text=${message}`
    : `https://api.whatsapp.com/send?text=${message}`;

  window.open(whatsappUrl, '_blank');
  return { success: true, method: 'whatsapp_web' };
}
