export interface Supplier {
  id: string;
  name: string;
  taxId: string;
  address: string;
  postalCode: string;
  city: string;
  province: string;
  country: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplierListItem {
  id: string;
  name: string;
  taxId: string;
  city: string;
  phone?: string | null;
  email?: string | null;
  _count: { purchaseInvoices: number };
}

export interface SupplierFormData {
  name: string;
  taxId: string;
  address: string;
  postalCode: string;
  city: string;
  province: string;
  country: string;
  phone?: string;
  email?: string;
  notes?: string;
}
