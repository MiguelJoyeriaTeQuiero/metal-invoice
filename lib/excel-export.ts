import * as XLSX from 'xlsx';
import type { InvoiceListItem } from '@/types/invoice';
import type { Customer } from '@/types/customer';

export function exportInvoicesToExcel(invoices: InvoiceListItem[]): Buffer {
  const rows = invoices.map((inv) => ({
    'Número': inv.number,
    'Tipo': inv.type === 'STANDARD' ? 'Factura' : 'Rectificativa',
    'Estado': statusLabel(inv.status),
    'Cliente': inv.customer.name,
    'CIF/NIF': inv.customer.taxId,
    'Fecha Emisión': new Date(inv.issueDate).toLocaleDateString('es-ES'),
    'Forma de Pago': inv.paymentMethod === 'TRANSFER' ? 'Transferencia' : 'Tarjeta',
    'Total (€)': Number(inv.total),
    'Enviada': inv.sentAt ? 'Sí' : 'No',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 18 }, { wch: 14 }, { wch: 12 }, { wch: 30 },
    { wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 12 }, { wch: 8 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Facturas');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
}

export function exportCustomersToExcel(customers: Customer[]): Buffer {
  const rows = customers.map((c) => ({
    'Nombre / Razón Social': c.name,
    'CIF/NIF': c.taxId,
    'Dirección': c.address,
    'C.P.': c.postalCode,
    'Ciudad': c.city,
    'Provincia': c.province,
    'País': c.country,
    'Teléfono': c.phone ?? '',
    'Email': c.email ?? '',
    'Contactos': c.contacts.map((ct) => ct.name).join(' | '),
    'Notas': c.notes ?? '',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 30 }, { wch: 14 }, { wch: 30 }, { wch: 8 },
    { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 16 },
    { wch: 28 }, { wch: 40 }, { wch: 30 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Clientes');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'Pendiente', PAID: 'Pagada', PARTIAL: 'Parcial', VOIDED: 'Anulada',
  };
  return map[status] ?? status;
}
