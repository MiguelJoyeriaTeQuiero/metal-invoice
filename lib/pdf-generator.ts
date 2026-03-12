import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Invoice } from '@/types/invoice';
import { formatCurrency } from './invoice-calculations';

const BRAND = {
  dark: [15, 39, 71] as [number, number, number],
  mid: [29, 79, 145] as [number, number, number],
  light: [240, 245, 255] as [number, number, number],
};

export function generateInvoicePDF(invoice: Invoice): Buffer {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(...BRAND.dark);
  doc.rect(0, 0, pageWidth, 38, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(process.env.COMPANY_NAME ?? 'Tu Empresa', 14, 15);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    [`CIF: ${process.env.COMPANY_TAX_ID ?? ''}`, process.env.COMPANY_ADDRESS ?? '', `Tel: ${process.env.COMPANY_PHONE ?? ''}  ·  ${process.env.COMPANY_EMAIL ?? ''}`],
    14, 22
  );
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.type === 'STANDARD' ? 'FACTURA' : 'FACTURA RECTIFICATIVA', pageWidth - 14, 13, { align: 'right' });
  doc.setFontSize(16);
  doc.text(invoice.number, pageWidth - 14, 22, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha: ${new Date(invoice.issueDate).toLocaleDateString('es-ES')}`, pageWidth - 14, 29, { align: 'right' });

  // Cliente
  doc.setTextColor(0, 0, 0);
  doc.setFillColor(...BRAND.light);
  doc.rect(14, 44, pageWidth / 2 - 20, 42, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND.dark);
  doc.text('CLIENTE', 18, 51);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);
  const c = invoice.customer;
  doc.text(c.name, 18, 58);
  doc.text(`CIF/NIF: ${c.taxId}`, 18, 64);
  doc.text(c.address, 18, 70);
  doc.text(`${c.postalCode} ${c.city}, ${c.province}`, 18, 76);
  doc.text(c.country, 18, 82);

  // Tabla de líneas
  autoTable(doc, {
    startY: 94,
    margin: { left: 14, right: 14 },
    head: [['Producto', 'Tipo', 'Metal', 'Peso(g)', 'Pureza', 'Cant.', 'P.Unit.', 'Dto%', 'IGIC%', 'Total']],
    body: invoice.lines.map((l) => [
      l.product + (l.description ? `\n${l.description}` : '') + (l.serialNumber ? `\nS/N: ${l.serialNumber}` : ''),
      l.itemType === 'INGOT' ? 'Lingote' : 'Moneda',
      l.metal === 'GOLD' ? 'Oro' : 'Plata',
      Number(l.weightGrams).toFixed(4),
      `${(Number(l.purity) * 100).toFixed(2)}%`,
      Number(l.quantity).toFixed(4),
      formatCurrency(Number(l.unitPrice)),
      `${Number(l.discount).toFixed(2)}%`,
      `${(Number(l.igicRate) * 100).toFixed(0)}%`,
      formatCurrency(Number(l.lineTotal)),
    ]),
    headStyles: { fillColor: BRAND.dark, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: BRAND.light },
    columnStyles: { 0: { cellWidth: 42 }, 3: { halign: 'right' }, 5: { halign: 'right' }, 6: { halign: 'right' }, 7: { halign: 'right' }, 8: { halign: 'right' }, 9: { halign: 'right' } },
  });

  // Totales
  const finalY = (doc as any).lastAutoTable.finalY + 6;
  const totalsX = pageWidth - 70;
  doc.setFontSize(9);
  const rows: [string, string][] = [
    ['Subtotal:', formatCurrency(Number(invoice.subtotal))],
    ['Descuentos:', `- ${formatCurrency(Number(invoice.totalDiscount))}`],
  ];
  if (Number(invoice.totalIgic) > 0) rows.push(['IGIC 15%:', formatCurrency(Number(invoice.totalIgic))]);
  rows.forEach(([label, value], i) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(label, totalsX, finalY + i * 7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(value, pageWidth - 14, finalY + i * 7, { align: 'right' });
  });
  const totalY = finalY + rows.length * 7 + 2;
  doc.setFillColor(...BRAND.dark);
  doc.rect(totalsX - 4, totalY - 5, pageWidth - totalsX - 10, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TOTAL:', totalsX, totalY + 1.5);
  doc.text(formatCurrency(Number(invoice.total)), pageWidth - 14, totalY + 1.5, { align: 'right' });

  // Pie
  const footerY = totalY + 20;
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  if (invoice.paymentMethod === 'TRANSFER' && invoice.iban) {
    doc.setFont('helvetica', 'bold');
    doc.text('Forma de pago: Transferencia bancaria', 14, footerY);
    doc.setFont('helvetica', 'normal');
    doc.text(`IBAN: ${invoice.iban}`, 14, footerY + 6);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.text('Forma de pago: Tarjeta', 14, footerY);
  }
  if (invoice.observations) {
    doc.setFont('helvetica', 'bold');
    doc.text('Observaciones:', 14, footerY + 14);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.observations, 14, footerY + 20, { maxWidth: pageWidth - 28 });
  }
  const legalY = doc.internal.pageSize.getHeight() - 20;
  doc.setFillColor(240, 240, 240);
  doc.rect(0, legalY - 4, pageWidth, 24, 'F');
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text('Documento emitido conforme a la normativa vigente. Conserve este documento para cualquier reclamación.', pageWidth / 2, legalY + 2, { align: 'center' });

  return Buffer.from(doc.output('arraybuffer'));
}
