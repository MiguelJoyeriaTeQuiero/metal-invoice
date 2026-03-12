import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCard {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  color?: string;
}

export function StatsCards({ stats }: { stats: StatCard[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map(({ label, value, sub, icon: Icon, color }) => (
        <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
              {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
            </div>
            <div className={cn('p-2.5 rounded-xl', color ?? 'bg-blue-50')}>
              <Icon className="w-5 h-5 text-[#1d4f91]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
