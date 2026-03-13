import { cn } from '@/lib/utils';
import type { PurchaseStatus } from '@/types/purchase-invoice';
import { PURCHASE_STATUS_LABELS } from '@/types/purchase-invoice';

const colorMap: Record<PurchaseStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PAID: 'bg-green-100 text-green-800 border-green-200',
  VOIDED: 'bg-red-100 text-red-800 border-red-200',
};

export function PurchaseStatusBadge({
  status,
  className,
}: {
  status: PurchaseStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        colorMap[status],
        className,
      )}
    >
      {PURCHASE_STATUS_LABELS[status]}
    </span>
  );
}
