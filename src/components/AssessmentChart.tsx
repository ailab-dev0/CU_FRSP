import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';

interface ScoreDistributionProps {
  data: Array<{
    range: string;
    count: number;
  }>;
  title?: string;
}

export function ScoreDistribution({ data, title }: ScoreDistributionProps) {
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
              dataKey="range"
              tick={{ fontSize: 11, fill: '#86868b' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e5e5' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#86868b' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)',
              }}
              formatter={(value) => [value, 'Students']}
            />
            <Bar dataKey="count" fill="#0071e3" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface AttendanceScoreBarProps {
  data: Array<{
    range: string;
    avgScore: number;
    count: number;
  }>;
  title?: string;
}

export function AttendanceScoreBar({ data, title }: AttendanceScoreBarProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-apple h-full flex flex-col">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <div className="flex-1 min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="range"
              tick={{ fontSize: 11, fill: '#86868b' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e5e5' }}
            />
            <YAxis
              domain={[0, 50]}
              tick={{ fontSize: 11, fill: '#86868b' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'avgScore') return [value.toFixed(1), 'Avg Score'];
                return [value, name];
              }}
            />
            <Bar dataKey="avgScore" fill="#34c759" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-4 mt-2">
        {data.map(g => (
          <span key={g.range} className="text-[10px] text-apple-gray">
            {g.range}: {g.count}
          </span>
        ))}
      </div>
    </div>
  );
}

interface PracticalVsTheoryProps {
  practical: number;
  theory: number;
}

const COLORS = ['#0071e3', '#34c759'];

export function PracticalVsTheory({ practical, theory }: PracticalVsTheoryProps) {
  const data = [
    { name: 'Practical', value: practical, max: 20 },
    { name: 'Theory', value: theory, max: 30 },
  ];
  const total = practical + theory;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-apple h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Avg. Score Breakdown</h3>
      <div className="flex-1 min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)',
              }}
              formatter={(value, name) => {
                const item = data.find(d => d.name === name);
                return [`${Number(value).toFixed(1)} / ${item?.max}`, String(name)];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center mb-3">
        <span className="text-2xl font-bold text-gray-900">{total.toFixed(1)}</span>
        <span className="text-apple-gray"> / 50</span>
      </div>
      <div className="flex justify-center gap-6">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[index] }}
            />
            <span className="text-sm text-apple-gray">
              {item.name}: {item.value.toFixed(1)}/{item.max}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface CorrelationChartProps {
  data: Array<{
    name: string;
    attendance: number;
    score: number;
    section: string;
  }>;
  title?: string;
  correlation: number;
}

const SECTION_COLORS: Record<string, string> = {
  '1BCOM A': '#0071e3',
  '1BCOM B': '#34c759',
  '1BCOM C': '#ff9500',
  '1BCOM D': '#af52de',
  '1BCOM E': '#ff3b30',
  '1BCOMA&T': '#5856d6',
  '1BCOMAFA': '#00c7be',
  '1BCOMF&I A': '#ff2d55',
  '1BCOMF&I B': '#a2845e',
  '1BCOMSF': '#64d2ff',
};

export function AttendanceScoreCorrelation({ data, title, correlation }: CorrelationChartProps) {
  // Group by attendance ranges for summary
  const attendanceGroups = [
    { range: '< 70%', min: 0, max: 70 },
    { range: '70-80%', min: 70, max: 80 },
    { range: '80-90%', min: 80, max: 90 },
    { range: '90-100%', min: 90, max: 101 },
  ];

  const groupedData = attendanceGroups.map(group => {
    const studentsInRange = data.filter(
      s => s.attendance >= group.min && s.attendance < group.max
    );
    const avgScore = studentsInRange.length > 0
      ? studentsInRange.reduce((sum, s) => sum + s.score, 0) / studentsInRange.length
      : 0;
    return {
      range: group.range,
      avgScore: Math.round(avgScore * 10) / 10,
      count: studentsInRange.length,
    };
  });

  return (
    <div className="bg-white rounded-2xl p-5 shadow-apple">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      )}
      <div className="flex items-center gap-3 mb-3">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          correlation >= 0.5 ? 'bg-green-100 text-green-700' :
          correlation >= 0.3 ? 'bg-yellow-100 text-yellow-700' :
          correlation >= 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
        }`}>
          Correlation: {correlation >= 0 ? '+' : ''}{correlation.toFixed(2)}
        </span>
        <span className="text-sm text-apple-gray">
          {correlation >= 0.5 ? 'Strong positive' :
           correlation >= 0.3 ? 'Moderate positive' :
           correlation >= 0 ? 'Weak positive' : 'Negative'} correlation
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Scatter Plot */}
        <div>
          <p className="text-sm text-apple-gray mb-2">Individual Students</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  type="number"
                  dataKey="attendance"
                  name="Attendance"
                  domain={[50, 100]}
                  tick={{ fontSize: 11, fill: '#86868b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e5e5' }}
                  tickFormatter={(value) => `${Math.round(value)}%`}
                />
                <YAxis
                  type="number"
                  dataKey="score"
                  name="Score"
                  domain={[0, 50]}
                  tick={{ fontSize: 11, fill: '#86868b' }}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: 'Score', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#86868b' }}
                />
                <ZAxis range={[40, 40]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)',
                  }}
                  formatter={(value, name) => {
                    if (name === 'Attendance') return [`${Number(value).toFixed(0)}%`, 'Attendance'];
                    if (name === 'Score') return [Number(value).toFixed(1), 'Score'];
                    return [value, name];
                  }}
                />
                {Object.entries(SECTION_COLORS).map(([section, color]) => (
                  <Scatter
                    key={section}
                    name={section}
                    data={data.filter(d => d.section === section)}
                    fill={color}
                    opacity={0.7}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grouped Bar Chart */}
        <div>
          <p className="text-sm text-apple-gray mb-2">Avg Score by Attendance</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={groupedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="range"
                  tick={{ fontSize: 11, fill: '#86868b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e5e5' }}
                />
                <YAxis
                  domain={[0, 50]}
                  tick={{ fontSize: 11, fill: '#86868b' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)',
                  }}
                  formatter={(value, name) => {
                    if (name === 'avgScore') return [Number(value).toFixed(1), 'Avg Score'];
                    return [value, name];
                  }}
                />
                <Bar dataKey="avgScore" fill="#0071e3" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2">
            {groupedData.map(g => (
              <span key={g.range} className="text-[10px] text-apple-gray">
                {g.range}: {g.count}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
