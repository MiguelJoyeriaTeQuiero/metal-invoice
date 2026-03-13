'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import type { SupplierFormData } from '@/types/supplier';

const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4f91]';

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

export function SupplierForm({ initial }: { initial?: Partial<SupplierFormData> & { id?: string } }) {
  const router = useRouter();
  const isEdit = !!initial?.id;

  const [form, setForm] = useState<SupplierFormData>({
    name: initial?.name ?? '',
    taxId: initial?.taxId ?? '',
    address: initial?.address ?? '',
    postalCode: initial?.postalCode ?? '',
    city: initial?.city ?? '',
    province: initial?.province ?? '',
    country: initial?.country ?? 'España',
    phone: initial?.phone ?? '',
    email: initial?.email ?? '',
    notes: initial?.notes ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (field: keyof SupplierFormData, value: string) =>
    setForm((p) => ({ ...p, [field]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(isEdit ? `/api/suppliers/${initial!.id}` : '/api/suppliers', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Error al guardar');
      router.push('/proveedores');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
      )}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Datos del proveedor</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nombre / Razón Social *">
            <input value={form.name} onChange={(e) => update('name', e.target.value)} className={inputCls} required />
          </Field>
          <Field label="CIF / NIF *">
            <input value={form.taxId} onChange={(e) => update('taxId', e.target.value)} className={inputCls} required />
          </Field>
          <Field label="Dirección *" className="md:col-span-2">
            <input value={form.address} onChange={(e) => update('address', e.target.value)} className={inputCls} required />
          </Field>
          <Field label="Código Postal *">
            <input value={form.postalCode} onChange={(e) => update('postalCode', e.target.value)} className={inputCls} required />
          </Field>
          <Field label="Ciudad *">
            <input value={form.city} onChange={(e) => update('city', e.target.value)} className={inputCls} required />
          </Field>
          <Field label="Provincia *">
            <input value={form.province} onChange={(e) => update('province', e.target.value)} className={inputCls} required />
          </Field>
          <Field label="País">
            <input value={form.country} onChange={(e) => update('country', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Teléfono">
            <input type="tel" value={form.phone ?? ''} onChange={(e) => update('phone', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Email">
            <input type="email" value={form.email ?? ''} onChange={(e) => update('email', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Notas internas" className="md:col-span-2">
            <textarea
              value={form.notes ?? ''}
              onChange={(e) => update('notes', e.target.value)}
              className={`${inputCls} h-20 resize-none`}
            />
          </Field>
        </div>
      </div>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-full sm:w-auto px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm hover:bg-slate-50 transition-colors text-center"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0f2747] text-white rounded-xl text-sm hover:bg-[#1d4f91] transition-colors disabled:opacity-50"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEdit ? 'Guardar cambios' : 'Crear proveedor'}
        </button>
      </div>
    </form>
  );
}
