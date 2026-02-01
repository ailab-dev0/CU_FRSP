import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface AttendanceChartProps {
  data: Array<{
    date: string;
    attendance: number;
    absent?: number;
  }>;
  title?: string;
}

export function AttendanceChart({ data, title }: AttendanceChartProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-apple h-full flex flex-col">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#86868b' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e5e5' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#86868b' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)',
              }}
              formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Attendance']}
            />
            <Bar dataKey="attendance" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.attendance >= 90 ? '#34c759' : entry.attendance >= 75 ? '#ff9500' : '#ff3b30'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
