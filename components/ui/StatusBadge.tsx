import { cn } from '@/lib/utils';
import type { InvoiceStatus } from '@/types/invoice';
import { INVOICE_STATUS_LABELS } from '@/types/invoice';

const colorMap: Record<InvoiceStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PAID: 'bg-green-100 text-green-800 border-green-200',
  PARTIAL: 'bg-blue-100 text-blue-800 border-blue-200',
  VOIDED: 'bg-red-100 text-red-800 border-red-200',
};

export function StatusBadge({ status, className }: { status: InvoiceStatus; className?: string }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', colorMap[status], className)}>
      {INVOICE_STATUS_LABELS[status]}
    </span>
  );
}
