'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import type { CustomerFormData } from '@/types/customer';

const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4f91]';
const emptyContact = { name: '', role: '', phone: '', email: '' };

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

export function CustomerForm({ initial }: { initial?: Partial<CustomerFormData> & { id?: string } }) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [form, setForm] = useState<CustomerFormData>({
    name: initial?.name ?? '', taxId: initial?.taxId ?? '',
    address: initial?.address ?? '', postalCode: initial?.postalCode ?? '',
    city: initial?.city ?? '', province: initial?.province ?? '',
    country: initial?.country ?? 'España', phone: initial?.phone ?? '',
    email: initial?.email ?? '', notes: initial?.notes ?? '',
    contacts: initial?.contacts ?? [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (field: keyof CustomerFormData, value: any) => setForm((p) => ({ ...p, [field]: value }));
  const updateContact = (i: number, field: string, value: string) =>
    update('contacts', form.contacts.map((c, idx) => idx === i ? { ...c, [field]: value } : c));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(isEdit ? `/api/customers/${initial!.id}` : '/api/customers', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Error al guardar');
      router.push('/clientes'); router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Datos del cliente</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nombre / Razón Social *"><input value={form.name} onChange={(e) => update('name', e.target.value)} className={inputCls} required /></Field>
          <Field label="CIF / NIF *"><input value={form.taxId} onChange={(e) => update('taxId', e.target.value)} className={inputCls} required /></Field>
          <Field label="Dirección *" className="md:col-span-2"><input value={form.address} onChange={(e) => update('address', e.target.value)} className={inputCls} required /></Field>
          <Field label="Código Postal *"><input value={form.postalCode} onChange={(e) => update('postalCode', e.target.value)} className={inputCls} required /></Field>
          <Field label="Ciudad *"><input value={form.city} onChange={(e) => update('city', e.target.value)} className={inputCls} required /></Field>
          <Field label="Provincia *"><input value={form.province} onChange={(e) => update('province', e.target.value)} className={inputCls} required /></Field>
          <Field label="País"><input value={form.country} onChange={(e) => update('country', e.target.value)} className={inputCls} /></Field>
          <Field label="Teléfono"><input type="tel" value={form.phone ?? ''} onChange={(e) => update('phone', e.target.value)} className={inputCls} /></Field>
          <Field label="Email"><input type="email" value={form.email ?? ''} onChange={(e) => update('email', e.target.value)} className={inputCls} /></Field>
          <Field label="Notas internas" className="md:col-span-2"><textarea value={form.notes ?? ''} onChange={(e) => update('notes', e.target.value)} className={`${inputCls} h-20 resize-none`} /></Field>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">Contactos <span className="text-slate-400 font-normal text-sm">(máx. 3)</span></h2>
          {form.contacts.length < 3 && (
            <button type="button" onClick={() => update('contacts', [...form.contacts, { ...emptyContact }])}
              className="flex items-center gap-1.5 text-sm text-[#1d4f91] hover:underline">
              <Plus className="w-4 h-4" /> Añadir contacto
            </button>
          )}
        </div>
        {form.contacts.length === 0 && <p className="text-slate-400 text-sm">Sin contactos añadidos.</p>}
        <div className="space-y-4">
          {form.contacts.map((contact, i) => (
            <div key={i} className="border border-slate-100 rounded-xl p-4 relative">
              <button type="button" onClick={() => update('contacts', form.contacts.filter((_, idx) => idx !== i))}
                className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                <Field label="Nombre *"><input value={contact.name} onChange={(e) => updateContact(i, 'name', e.target.value)} className={inputCls} required /></Field>
                <Field label="Cargo"><input value={contact.role ?? ''} onChange={(e) => updateContact(i, 'role', e.target.value)} className={inputCls} /></Field>
                <Field label="Teléfono"><input value={contact.phone ?? ''} onChange={(e) => updateContact(i, 'phone', e.target.value)} className={inputCls} /></Field>
                <Field label="Email"><input type="email" value={contact.email ?? ''} onChange={(e) => updateContact(i, 'email', e.target.value)} className={inputCls} /></Field>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm hover:bg-slate-50 transition-colors">Cancelar</button>
        <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2.5 bg-[#0f2747] text-white rounded-xl text-sm hover:bg-[#1d4f91] transition-colors disabled:opacity-50">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEdit ? 'Guardar cambios' : 'Crear cliente'}
        </button>
      </div>
    </form>
  );
}
