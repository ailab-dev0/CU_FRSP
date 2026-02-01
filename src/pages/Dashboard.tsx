import { StatCard } from '../components/StatCard';
import { AttendanceChart } from '../components/AttendanceChart';
import { ScoreDistribution, PracticalVsTheory, AttendanceScoreBar } from '../components/AssessmentChart';
import { BatchTable } from '../components/BatchTable';
import attendanceData from '../data/attendance.json';
import assessmentData from '../data/assessments.json';
import studentsData from '../data/students.json';

// Map attendance batches to unified sections
const ATTENDANCE_BATCH_MAP: Record<string, string> = {
  '2 BCOM A': '1BCOM A',
  '2 BCOM B': '1BCOM B',
  '2 BCOM C': '1BCOM C',
  '2 BCOM D': '1BCOM D',
  '2 BCOM F': '1BCOM E',
  '4 BCOM A': '1BCOMA&T',
  '4 BCOM B': '1BCOMAFA',
  '4 BCOM C': '1BCOMF&I A',
  '4 BCOM D': '1BCOMF&I B',
  '4 BCOM F': '1BCOMSF',
};

interface AttendanceDay {
  date: string;
  sessions: Array<{ time: string; absent: number[]; absentCount: number }>;
}

interface AttendanceBatch {
  batch: string;
  days: AttendanceDay[];
}

interface Assessment {
  name: string;
  regNo: string;
  year: string;
  section: string;
  practical: number;
  theory: number;
  total: number;
  hasAssessment: boolean;
}

// Calculate attendance stats
function calculateAttendanceStats(data: Record<string, AttendanceBatch>) {
  const stats: Array<{ batch: string; totalStudents: number; avgAttendance: number; days: Array<{ date: string; attendance: number }> }> = [];

  // Estimate total students per batch based on max roll numbers
  const batchTotals: Record<string, number> = {
    '2 BCOM A': 75,
    '4 BCOM A': 75,
  };

  for (const [batch, batchData] of Object.entries(data)) {
    const totalStudents = batchTotals[batch] || 75;
    const dailyStats = batchData.days.map((day) => {
      // Average absent across all sessions
      const totalAbsent = day.sessions.reduce((sum, s) => sum + s.absentCount, 0);
      const avgAbsent = totalAbsent / day.sessions.length;
      const attendance = ((totalStudents - avgAbsent) / totalStudents) * 100;
      return {
        date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        attendance,
        absent: avgAbsent,
      };
    });

    const avgAttendance = dailyStats.reduce((sum, d) => sum + d.attendance, 0) / dailyStats.length;

    stats.push({
      batch,
      totalStudents,
      avgAttendance,
      days: dailyStats,
    });
  }

  return stats;
}

// Calculate assessment stats
function calculateAssessmentStats(data: Assessment[]) {
  const validAssessments = data.filter(a => a.total > 0);
  const avgTotal = validAssessments.reduce((sum, a) => sum + a.total, 0) / validAssessments.length;
  const avgPractical = validAssessments.reduce((sum, a) => sum + a.practical, 0) / validAssessments.length;
  const avgTheory = validAssessments.reduce((sum, a) => sum + a.theory, 0) / validAssessments.length;

  // Score distribution
  const ranges = ['0-10', '11-20', '21-30', '31-40', '41-50'];
  const distribution = ranges.map((range) => {
    const [min, max] = range.split('-').map(Number);
    const count = validAssessments.filter(a => a.total >= min && a.total <= max).length;
    return { range, count };
  });

  return { avgTotal, avgPractical, avgTheory, distribution, total: validAssessments.length };
}

// Extract roll number from register number
function getRollFromRegNo(regNo: string, section: string): number {
  const num = parseInt(regNo);
  if (isNaN(num)) return 0;

  // Section bases (register number - base = roll number)
  const sectionBases: Record<string, number> = {
    '1BCOM A': 2510100,
    '1BCOM B': 2510200,
    '1BCOM C': 2510300,
    '1BCOM D': 2510400,
    '1BCOM E': 2510500,
    '1BCOMA&T': 2511000,
    '1BCOMAFA': 2511100,
    '1BCOMF&I A': 2511300,
    '1BCOMF&I B': 2511400,
    '1BCOMSF': 2511500,
  };

  const base = sectionBases[section];
  if (!base) return 0;

  return num - base;
}

// Calculate correlation between attendance and assessment
function calculateCorrelation(
  students: Assessment[],
  attendanceDataObj: Record<string, AttendanceBatch>
) {
  const correlationData: Array<{
    name: string;
    attendance: number;
    score: number;
    section: string;
  }> = [];

  // For each section that has attendance data
  Object.entries(ATTENDANCE_BATCH_MAP).forEach(([batch, section]) => {
    const batchData = attendanceDataObj[batch];
    if (!batchData) return;

    // Get students in this section with assessment scores, sorted by regNo
    const sectionStudents = students
      .filter(s => s.section === section && s.hasAssessment && s.total > 0)
      .sort((a, b) => a.regNo.localeCompare(b.regNo));

    // Calculate attendance for each student using roll number from regNo
    sectionStudents.forEach((student) => {
      const roll = getRollFromRegNo(student.regNo, section);
      if (roll <= 0) return;

      let totalSessions = 0;
      let absentSessions = 0;

      batchData.days.forEach(day => {
        day.sessions.forEach(session => {
          totalSessions++;
          if (session.absent.includes(roll)) {
            absentSessions++;
          }
        });
      });

      const attendanceRate = totalSessions > 0
        ? ((totalSessions - absentSessions) / totalSessions) * 100
        : 100;

      correlationData.push({
        name: student.name || student.regNo,
        attendance: attendanceRate,
        score: student.total,
        section,
      });
    });
  });

  // Calculate Pearson correlation coefficient
  if (correlationData.length < 2) return { data: correlationData, correlation: 0 };

  const n = correlationData.length;
  const sumX = correlationData.reduce((sum, d) => sum + d.attendance, 0);
  const sumY = correlationData.reduce((sum, d) => sum + d.score, 0);
  const sumXY = correlationData.reduce((sum, d) => sum + d.attendance * d.score, 0);
  const sumX2 = correlationData.reduce((sum, d) => sum + d.attendance * d.attendance, 0);
  const sumY2 = correlationData.reduce((sum, d) => sum + d.score * d.score, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  const correlation = denominator !== 0 ? numerator / denominator : 0;

  return { data: correlationData, correlation };
}

export function Dashboard() {
  const attendanceStats = calculateAttendanceStats(attendanceData as Record<string, AttendanceBatch>);
  const assessmentStats = calculateAssessmentStats(assessmentData as Assessment[]);
  const correlationResult = calculateCorrelation(
    assessmentData as Assessment[],
    attendanceData as Record<string, AttendanceBatch>
  );

  const totalStudents = studentsData.length;
  const overallAttendance = attendanceStats.reduce((sum, b) => sum + b.avgAttendance, 0) / attendanceStats.length;

  // Combine all daily attendance for chart
  const allDailyAttendance = attendanceStats.flatMap(b =>
    b.days.map(d => ({ ...d, batch: b.batch }))
  ).sort((a, b) => a.date.localeCompare(b.date));

  // Batch data for tables
  const attendanceBatches = attendanceStats.map(b => ({
    name: ATTENDANCE_BATCH_MAP[b.batch] || b.batch,
    students: b.totalStudents,
    attendance: b.avgAttendance,
    link: `/attendance`,
  }));

  // Calculate avg score by attendance ranges
  const attendanceScoreGroups = [
    { range: '< 70%', min: 0, max: 70 },
    { range: '70-80%', min: 70, max: 80 },
    { range: '80-90%', min: 80, max: 90 },
    { range: '90-100%', min: 90, max: 101 },
  ].map(group => {
    const studentsInRange = correlationResult.data.filter(
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
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">Overview</h2>
        <p className="text-apple-gray mt-1">FRSP Session Analytics - January 2026</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total Students"
          value={totalStudents.toLocaleString()}
          subtitle="1BCOM enrolled"
        />
        <StatCard
          title="Avg Attendance"
          value={`${Math.round(overallAttendance)}%`}
          subtitle="Across all sessions"
        />
        <StatCard
          title="Avg Assessment"
          value={Math.round(assessmentStats.avgTotal)}
          subtitle="Out of 50 marks"
        />
        <StatCard
          title="Assessments Taken"
          value={assessmentStats.total}
          subtitle="1BCOM students"
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Attendance Chart */}
        <div className="lg:col-span-2">
          <AttendanceChart
            data={allDailyAttendance}
            title="Daily Attendance Rate"
          />
        </div>
        {/* Right Column - Score Breakdown */}
        <PracticalVsTheory
          practical={assessmentStats.avgPractical}
          theory={assessmentStats.avgTheory}
        />
      </div>

      {/* Score Distribution & Attendance Score */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ScoreDistribution
          data={assessmentStats.distribution}
          title="Assessment Score Distribution"
        />
        <AttendanceScoreBar
          data={attendanceScoreGroups}
          title="Avg Score by Attendance"
        />
      </div>

      {/* Section Table */}
      <BatchTable
        title="Attendance by Section"
        batches={attendanceBatches}
      />
    </div>
  );
}
