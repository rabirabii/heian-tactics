import { LucideIcon } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string;
  detail: string;
  Icon: LucideIcon;
  accent?: boolean; // if true, use accent color for icon and maybe value highlight
}

export function MetricCard({
  label,
  value,
  detail,
  Icon,
  accent = false,
}: MetricCardProps) {
  return (
    <div className="panel-bg border-2-black shadow-hard rounded-none p-4 hover-press">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-data text-xs uppercase tracking-wide text-secondary">
            {label}
          </p>
          <p className={`font-display font-bold text-2xl ink tabular-nums ${accent ? 'accent' : ''}`}>
            {value}
          </p>
          <p className="font-data text-xs text-secondary">{detail}</p>
        </div>
        <div className="flex-center">
          <Icon className={`icon-16 ink ${accent ? 'accent' : ''}`} />
        </div>
      </div>
    </div>
  );
}