'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Mail, XCircle, FileEdit, Loader2 } from 'lucide-react';
import type { Invoice } from '@/types/invoice';

export function InvoiceActions({ invoice }: { invoice: Invoice }) {
  const router = useRouter();
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingVoid, setLoadingVoid] = useState(false);
  const [message, setMessage] = useState('');

  async function handlePdf() {
    setLoadingPdf(true);
    const res = await fetch(`/api/invoices/${invoice.id}/pdf`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${invoice.number}.pdf`; a.click();
    URL.revokeObjectURL(url); setLoadingPdf(false);
  }

  async function handleEmail() {
    setLoadingEmail(true); setMessage('');
    const res = await fetch(`/api/invoices/${invoice.id}/email`, { method: 'POST' });
    const data = await res.json();
    setMessage(res.ok ? '✅ Email enviado correctamente' : `❌ ${data.error}`);
    setLoadingEmail(false);
    if (res.ok) router.refresh();
  }

  async function handleVoid() {
    if (!confirm('¿Seguro que deseas anular esta factura? Esta acción no se puede deshacer.')) return;
    setLoadingVoid(true);
    const res = await fetch(`/api/invoices/${invoice.id}/void`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) router.refresh();
    else setMessage(`❌ ${data.error}`);
    setLoadingVoid(false);
  }

  const isVoided = invoice.status === 'VOIDED';

  return (
    <div className="flex flex-wrap items-center gap-2">
      {message && <span className="text-sm px-3 py-1 bg-slate-100 rounded-lg">{message}</span>}
      <button onClick={handlePdf} disabled={loadingPdf}
        className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition-colors disabled:opacity-50">
        {loadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}PDF
      </button>
      <button onClick={handleEmail} disabled={loadingEmail || isVoided}
        className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition-colors disabled:opacity-50">
        {loadingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}Enviar email
      </button>
      {!isVoided && <>
        <a href={`/facturas/${invoice.id}/rectificativa`}
          className="flex items-center gap-2 px-4 py-2 border border-orange-200 text-orange-700 rounded-lg text-sm hover:bg-orange-50 transition-colors">
          <FileEdit className="w-4 h-4" />Rectificativa
        </a>
        <button onClick={handleVoid} disabled={loadingVoid}
          className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-700 rounded-lg text-sm hover:bg-red-50 transition-colors disabled:opacity-50">
          {loadingVoid ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}Anular
        </button>
      </>}
    </div>
  );
}
