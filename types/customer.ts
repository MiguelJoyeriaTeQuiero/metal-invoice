export type Contact = {
  id: string;
  customerId: string;
  name: string;
  role?: string | null;
  phone?: string | null;
  email?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Customer = {
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
  contacts: Contact[];
  createdAt: Date;
  updatedAt: Date;
};

export type CustomerFormData = Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'contacts'> & {
  contacts: Omit<Contact, 'id' | 'customerId' | 'createdAt' | 'updatedAt'>[];
};

export type CustomerListItem = Pick<
  Customer,
  'id' | 'name' | 'taxId' | 'city' | 'phone' | 'email'
> & {
  _count: { invoices: number };
};
