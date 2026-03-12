export type InvoiceType = 'STANDARD' | 'RECTIFICATIVE';
export type InvoiceStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'VOIDED';
export type PaymentMethod = 'TRANSFER' | 'CARD';
export type ItemType = 'INGOT' | 'COIN';
export type Metal = 'GOLD' | 'SILVER';

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagada',
  PARTIAL: 'Parcial',
  VOIDED: 'Anulada',
};

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  PENDING: 'yellow',
  PAID: 'green',
  PARTIAL: 'blue',
  VOIDED: 'red',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  TRANSFER: 'Transferencia bancaria',
  CARD: 'Tarjeta',
};

export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  INGOT: 'Lingote',
  COIN: 'Moneda',
};

export const METAL_LABELS: Record<Metal, string> = {
  GOLD: 'Oro',
  SILVER: 'Plata',
};

export const IGIC_RATES: Record<Metal, number> = {
  GOLD: 0,
  SILVER: 0.15,
};

export type InvoiceLine = {
  id: string;
  invoiceId: string;
  lineOrder: number;
  itemType: ItemType;
  metal: Metal;
  product: string;
  description?: string | null;
  serialNumber?: string | null;
  weightGrams: number;
  purity: number;
  quantity: number;
  unitPrice: number;
  discount: number;
  igicRate: number;
  igicAmount: number;
  lineTotal: number;
  createdAt: Date;
  updatedAt: Date;
};

export type InvoiceLineFormData = Omit<
  InvoiceLine,
  'id' | 'invoiceId' | 'igicAmount' | 'lineTotal' | 'createdAt' | 'updatedAt'
>;

export type Invoice = {
  id: string;
  number: string;
  type: InvoiceType;
  status: InvoiceStatus;
  paymentMethod: PaymentMethod;
  issueDate: Date;
  dueDate?: Date | null;
  customerId: string;
  customer: {
    id: string;
    name: string;
    taxId: string;
    address: string;
    postalCode: string;
    city: string;
    province: string;
    country: string;
    email?: string | null;
    phone?: string | null;
  };
  originalId?: string | null;
  lines: InvoiceLine[];
  subtotal: number;
  totalDiscount: number;
  totalIgic: number;
  total: number;
  iban?: string | null;
  observations?: string | null;
  internalNotes?: string | null;
  sentAt?: Date | null;
  voidedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type InvoiceFormData = {
  type: InvoiceType;
  customerId: string;
  paymentMethod: PaymentMethod;
  issueDate: Date;
  dueDate?: Date;
  originalId?: string;
  lines: InvoiceLineFormData[];
  iban?: string;
  observations?: string;
  internalNotes?: string;
};

export type InvoiceListItem = Pick<
  Invoice,
  'id' | 'number' | 'type' | 'status' | 'paymentMethod' | 'issueDate' | 'total' | 'sentAt'
> & {
  customer: Pick<Invoice['customer'], 'id' | 'name' | 'taxId'>;
};

export type InvoiceFilters = {
  search?: string;
  status?: InvoiceStatus | 'ALL';
  type?: InvoiceType | 'ALL';
  customerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  pageSize?: number;
};

export type InvoiceTotals = {
  subtotal: number;
  totalDiscount: number;
  igicBreakdown: IgicBreakdown[];
  totalIgic: number;
  total: number;
};

export type IgicBreakdown = {
  rate: number;
  base: number;
  amount: number;
};
