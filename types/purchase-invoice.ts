export type PurchaseStatus = 'PENDING' | 'PAID' | 'VOIDED';
export type Metal = 'GOLD' | 'SILVER';
export type ItemType = 'INGOT' | 'COIN';

export const PURCHASE_STATUS_LABELS: Record<PurchaseStatus, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagada',
  VOIDED: 'Anulada',
};

export interface PurchaseInvoiceLineFormData {
  lineOrder: number;
  itemType: ItemType;
  metal: Metal;
  product: string;
  description?: string;
  serialNumber?: string;
  weightGrams: number;
  purity: number;
  quantity: number;
  unitPrice: number;
  discount: number;
  igicRate: number;
}

export interface PurchaseInvoiceFormData {
  supplierId: string;
  issueDate: Date;
  paymentMethod: string;
  iban?: string;
  lines: PurchaseInvoiceLineFormData[];
  observations?: string;
  internalNotes?: string;
}

export interface PurchaseInvoiceListItem {
  id: string;
  number: string;
  status: PurchaseStatus;
  issueDate: Date;
  total: string | number;
  paymentMethod: string;
  supplier: { name: string };
}

export interface PurchaseInvoice {
  id: string;
  number: string;
  status: PurchaseStatus;
  issueDate: Date;
  paymentMethod: string;
  iban?: string | null;
  subtotal: string | number;
  totalDiscount: string | number;
  totalIgic: string | number;
  total: string | number;
  observations?: string | null;
  internalNotes?: string | null;
  supplierId: string;
  supplier: {
    id: string;
    name: string;
    taxId: string;
    address: string;
    postalCode: string;
    city: string;
  };
  lines: {
    id: string;
    lineOrder: number;
    itemType: string;
    metal: string;
    product: string;
    description?: string | null;
    serialNumber?: string | null;
    weightGrams: string | number;
    purity: string | number;
    quantity: string | number;
    unitPrice: string | number;
    discount: string | number;
    igicRate: string | number;
    igicAmount: string | number;
    lineTotal: string | number;
  }[];
}
