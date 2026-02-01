interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({ title, value, subtitle, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-apple hover:shadow-apple-hover transition-shadow">
      <p className="text-xs font-medium text-apple-gray uppercase tracking-wide">
        {title}
      </p>
      <div className="mt-1 flex items-baseline gap-2">
        <p className="text-3xl font-semibold text-gray-900 tracking-tight">
          {value}
        </p>
        {trend && (
          <span
            className={`text-sm font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-apple-gray">{subtitle}</p>
      )}
    </div>
  );
}
