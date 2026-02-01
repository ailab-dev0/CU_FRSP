import { useState, useMemo } from 'react';
import { StatCard } from '../components/StatCard';
import { AttendanceChart } from '../components/AttendanceChart';
import attendanceData from '../data/attendance.json';
import studentData from '../data/assessments.json';

interface Session {
  time: string;
  absent: number[];
  absentCount: number;
}

interface AttendanceDay {
  date: string;
  sessions: Session[];
}

interface AttendanceBatch {
  batch: string;
  days: AttendanceDay[];
}

interface Student {
  name: string;
  regNo: string;
  email: string;
  year: string;
  section: string;
  gender: string;
  practical: number;
  theory: number;
  total: number;
  hasAssessment: boolean;
}

// Map attendance batches to unified year/section
// Week 1 (Jan 20-22): 2 BCOM batches -> 1st Year sections
// Week 2 (Jan 27-29): 4 BCOM batches -> 2nd Year sections
const ATTENDANCE_BATCH_MAP: Record<string, { year: string; section: string }> = {
  '2 BCOM A': { year: '1st Year', section: '1BCOM A' },
  '2 BCOM B': { year: '1st Year', section: '1BCOM B' },
  '2 BCOM C': { year: '1st Year', section: '1BCOM C' },
  '2 BCOM D': { year: '1st Year', section: '1BCOM D' },
  '2 BCOM F': { year: '1st Year', section: '1BCOM E' },
  '4 BCOM A': { year: '2nd Year', section: '1BCOMA&T' },
  '4 BCOM B': { year: '2nd Year', section: '1BCOMAFA' },
  '4 BCOM C': { year: '2nd Year', section: '1BCOMF&I A' },
  '4 BCOM D': { year: '2nd Year', section: '1BCOMF&I B' },
  '4 BCOM F': { year: '2nd Year', section: '1BCOMSF' },
};

export function Attendance() {
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');
  const [detailedViewSection, setDetailedViewSection] = useState<string>('');

  const students = studentData as Student[];
  const attendanceBatches = Object.keys(attendanceData);

  // Get unique years from student data
  const years = useMemo(() => {
    const yearSet = new Set(students.map(s => s.year).filter(Boolean));
    return Array.from(yearSet).sort();
  }, [students]);

  // Get sections for selected year from student data
  const sections = useMemo(() => {
    if (!selectedYear) return [];
    const filtered = students.filter(s => s.year === selectedYear);
    const sectionSet = new Set(filtered.map(s => s.section).filter(Boolean));
    return Array.from(sectionSet).sort();
  }, [students, selectedYear]);

  // Find attendance batch for selected section
  const selectedAttendanceBatch = useMemo(() => {
    if (!selectedSection) return '';
    const entry = Object.entries(ATTENDANCE_BATCH_MAP).find(
      ([_, mapping]) => mapping.year === selectedYear && mapping.section === selectedSection
    );
    return entry ? entry[0] : '';
  }, [selectedYear, selectedSection]);

  // Check if section has attendance data
  const hasAttendanceData = (section: string, year: string) => {
    return Object.values(ATTENDANCE_BATCH_MAP).some(
      m => m.year === year && m.section === section
    );
  };

  // Get students for selected section
  const sectionStudents = useMemo(() => {
    if (!selectedSection) return [];
    return students.filter(s => s.section === selectedSection);
  }, [students, selectedSection]);

  const totalStudents = sectionStudents.length;

  // Get attendance data for selected batch
  const batchData = selectedAttendanceBatch
    ? (attendanceData as Record<string, AttendanceBatch>)[selectedAttendanceBatch]
    : null;

  // Calculate daily stats
  const dailyStats = useMemo(() => {
    if (!batchData || totalStudents === 0) return [];
    return batchData.days.map((day) => {
      const avgAbsent = day.sessions.reduce((sum, s) => sum + s.absentCount, 0) / day.sessions.length;
      const attendance = ((totalStudents - avgAbsent) / totalStudents) * 100;
      return {
        date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: day.date,
        attendance,
        absent: Math.round(avgAbsent),
        sessions: day.sessions,
      };
    });
  }, [batchData, totalStudents]);

  const avgAttendance = dailyStats.length > 0
    ? dailyStats.reduce((sum, d) => sum + d.attendance, 0) / dailyStats.length
    : 0;
  const totalDays = dailyStats.length;

  // Year-wise stats
  const yearStats = useMemo(() => {
    return years.map(year => {
      const yearStudents = students.filter(s => s.year === year);
      const yearSections = Array.from(new Set(yearStudents.map(s => s.section)));
      const sectionsWithData = yearSections.filter(sec => hasAttendanceData(sec, year));

      let totalAttendanceSum = 0;
      let daysCount = 0;

      sectionsWithData.forEach(section => {
        const batchEntry = Object.entries(ATTENDANCE_BATCH_MAP).find(
          ([_, m]) => m.year === year && m.section === section
        );
        if (batchEntry) {
          const data = (attendanceData as Record<string, AttendanceBatch>)[batchEntry[0]];
          const sectionTotal = students.filter(s => s.section === section).length;
          data.days.forEach(day => {
            const avgAbsent = day.sessions.reduce((sum, s) => sum + s.absentCount, 0) / day.sessions.length;
            const attendance = ((sectionTotal - avgAbsent) / sectionTotal) * 100;
            totalAttendanceSum += attendance;
            daysCount++;
          });
        }
      });

      return {
        year,
        totalStudents: yearStudents.length,
        sections: yearSections.length,
        sectionsWithData: sectionsWithData.length,
        avgAttendance: daysCount > 0 ? totalAttendanceSum / daysCount : 0,
        hasData: sectionsWithData.length > 0
      };
    });
  }, [years, students]);

  // Section stats for selected year
  const sectionStats = useMemo(() => {
    if (!selectedYear) return [];
    const yearStudents = students.filter(s => s.year === selectedYear);
    const yearSections = Array.from(new Set(yearStudents.map(s => s.section))).sort();

    return yearSections.map(section => {
      const sectionStudentCount = students.filter(s => s.section === section).length;
      const hasData = hasAttendanceData(section, selectedYear);

      let avgAttendance = 0;
      let days = 0;

      if (hasData) {
        const batchEntry = Object.entries(ATTENDANCE_BATCH_MAP).find(
          ([_, m]) => m.year === selectedYear && m.section === section
        );
        if (batchEntry) {
          const data = (attendanceData as Record<string, AttendanceBatch>)[batchEntry[0]];
          let totalAttendanceSum = 0;
          data.days.forEach(day => {
            const avgAbsent = day.sessions.reduce((sum, s) => sum + s.absentCount, 0) / day.sessions.length;
            const attendance = ((sectionStudentCount - avgAbsent) / sectionStudentCount) * 100;
            totalAttendanceSum += attendance;
          });
          avgAttendance = data.days.length > 0 ? totalAttendanceSum / data.days.length : 0;
          days = data.days.length;
        }
      }

      return {
        section,
        totalStudents: sectionStudentCount,
        avgAttendance,
        days,
        hasData
      };
    });
  }, [selectedYear, students]);

  // Sections with attendance data for detailed view dropdown
  const sectionsWithAttendance = useMemo(() => {
    if (!selectedYear) return [];
    return sectionStats.filter(s => s.hasData).map(s => s.section);
  }, [selectedYear, sectionStats]);

  // Detailed view section data (when year selected but not section)
  const detailedSection = selectedSection || detailedViewSection;
  const detailedAttendanceBatch = useMemo(() => {
    if (!detailedSection) return '';
    const entry = Object.entries(ATTENDANCE_BATCH_MAP).find(
      ([_, mapping]) => mapping.section === detailedSection
    );
    return entry ? entry[0] : '';
  }, [detailedSection]);

  const detailedBatchData = detailedAttendanceBatch
    ? (attendanceData as Record<string, AttendanceBatch>)[detailedAttendanceBatch]
    : null;

  const detailedSectionStudents = useMemo(() => {
    if (!detailedSection) return [];
    return students.filter(s => s.section === detailedSection);
  }, [students, detailedSection]);

  const detailedDailyStats = useMemo(() => {
    if (!detailedBatchData || detailedSectionStudents.length === 0) return [];
    const totalStudentsInSection = detailedSectionStudents.length;
    return detailedBatchData.days.map((day) => {
      const avgAbsent = day.sessions.reduce((sum, s) => sum + s.absentCount, 0) / day.sessions.length;
      const attendance = ((totalStudentsInSection - avgAbsent) / totalStudentsInSection) * 100;
      return {
        date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: day.date,
        attendance,
        absent: Math.round(avgAbsent),
        sessions: day.sessions,
      };
    });
  }, [detailedBatchData, detailedSectionStudents]);

  // Extract roll number from register number
  // Each section has a different base register number
  const getRollFromRegNo = (regNo: string, section: string): number => {
    const num = parseInt(regNo);
    if (isNaN(num)) return 0;

    // Section bases (register number - base = roll number)
    const sectionBases: Record<string, number> = {
      '1BCOM A': 2510100,      // 2510101-2510179
      '1BCOM B': 2510200,      // 2510201-2510277
      '1BCOM C': 2510300,      // 2510301-2510378
      '1BCOM D': 2510400,      // 2510401-2510476
      '1BCOM E': 2510500,      // 2510501-2510577
      '1BCOMA&T': 2511000,     // 2511001-2511088
      '1BCOMAFA': 2511100,     // 2511101-2511178
      '1BCOMF&I A': 2511300,   // 2511301-2511377
      '1BCOMF&I B': 2511400,   // 2511401-2511477
      '1BCOMSF': 2511500,      // 2511501-2511592
    };

    const base = sectionBases[section];
    if (!base) return 0;

    return num - base;
  };

  // Detailed view student stats
  const detailedStudentStats = useMemo(() => {
    if (!detailedAttendanceBatch || !detailedBatchData || detailedSectionStudents.length === 0) return [];

    const sortedStudents = [...detailedSectionStudents].sort((a, b) =>
      a.regNo.localeCompare(b.regNo)
    );

    return sortedStudents.map((student) => {
      const roll = getRollFromRegNo(student.regNo, student.section);
      let totalSessions = 0;
      let absentSessions = 0;

      const days: Record<string, { present: number; absent: number; total: number }> = {};

      detailedDailyStats.forEach(day => {
        const dayTotalSessions = day.sessions.length;
        const dayAbsentSessions = day.sessions.filter(s => s.absent.includes(roll)).length;
        days[day.fullDate] = {
          present: dayTotalSessions - dayAbsentSessions,
          absent: dayAbsentSessions,
          total: dayTotalSessions
        };
        totalSessions += dayTotalSessions;
        absentSessions += dayAbsentSessions;
      });

      const presentSessions = totalSessions - absentSessions;
      const attendanceRate = totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 100;

      return {
        ...student,
        roll,
        totalSessions,
        presentSessions,
        absentSessions,
        attendanceRate,
        days
      };
    });
  }, [detailedAttendanceBatch, detailedBatchData, detailedSectionStudents, detailedDailyStats]);

  // Overall stats
  const overallStats = useMemo(() => {
    const totalStudentsAll = students.length;
    let totalAttendanceSum = 0;
    let daysCount = 0;

    attendanceBatches.forEach(batch => {
      const mapping = ATTENDANCE_BATCH_MAP[batch];
      if (mapping) {
        const data = (attendanceData as Record<string, AttendanceBatch>)[batch];
        const batchStudentCount = students.filter(s => s.section === mapping.section).length;
        data.days.forEach(day => {
          const avgAbsent = day.sessions.reduce((sum, s) => sum + s.absentCount, 0) / day.sessions.length;
          const attendance = ((batchStudentCount - avgAbsent) / batchStudentCount) * 100;
          totalAttendanceSum += attendance;
          daysCount++;
        });
      }
    });

    return {
      totalStudents: totalStudentsAll,
      avgAttendance: daysCount > 0 ? totalAttendanceSum / daysCount : 0
    };
  }, [students, attendanceBatches]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">Attendance</h2>
          <p className="text-apple-gray mt-1">
            {selectedSection
              ? `${selectedSection} - ${selectedYear}`
              : selectedYear
              ? `${selectedYear} Overview`
              : 'Session-wise attendance tracking'}
          </p>
        </div>

        {/* Year & Section Filters */}
        <div className="flex gap-2">
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setSelectedSection('');
            }}
            className="px-4 py-2 rounded-xl bg-white border-0 shadow-apple text-sm font-medium text-gray-900 focus:ring-2 focus:ring-apple-blue"
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          {selectedYear && sections.length > 0 && (
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white border-0 shadow-apple text-sm font-medium text-gray-900 focus:ring-2 focus:ring-apple-blue"
            >
              <option value="">All Sections</option>
              {sections.map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </select>
          )}

          {(selectedYear || selectedSection) && (
            <button
              onClick={() => {
                setSelectedYear('');
                setSelectedSection('');
              }}
              className="px-4 py-2 rounded-xl bg-gray-100 text-sm font-medium text-gray-600 hover:bg-gray-200"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={selectedSection ? totalStudents : overallStats.totalStudents}
          subtitle={selectedSection || selectedYear || 'All students'}
        />
        <StatCard
          title="Avg Attendance"
          value={selectedSection && selectedAttendanceBatch ? `${Math.round(avgAttendance)}%` : selectedSection ? 'No data' : `${Math.round(overallStats.avgAttendance)}%`}
          subtitle={selectedSection && selectedAttendanceBatch ? `${totalDays} days tracked` : 'Across tracked sections'}
        />
        <StatCard
          title="Sessions/Day"
          value="5"
          subtitle="07:00 - 11:45"
        />
        <StatCard
          title="Total Sessions"
          value={selectedSection && selectedAttendanceBatch ? 5 : selectedYear ? 15 : 30}
          subtitle={selectedSection && selectedAttendanceBatch ? '5 classes per day' : selectedYear ? '5 classes × 3 days' : '15 per year × 2 years'}
        />
      </div>

      {/* Attendance Chart */}
      {selectedSection && selectedAttendanceBatch && dailyStats.length > 0 && (
        <AttendanceChart data={dailyStats} title="Daily Attendance Trend" />
      )}

      {/* No data message */}
      {selectedSection && !selectedAttendanceBatch && (
        <div className="bg-yellow-50 rounded-2xl p-6 text-center">
          <p className="text-yellow-800 font-medium">No attendance data available for {selectedSection}</p>
          <p className="text-yellow-600 text-sm mt-1">Attendance tracking is only available for 1BCOM A and 1BCOM B</p>
        </div>
      )}

      {/* View Mode Toggle */}
      {(selectedSection && selectedAttendanceBatch) || (selectedYear && !selectedSection) ? (
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('summary')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              viewMode === 'summary'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 shadow-apple'
            }`}
          >
            Summary View
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              viewMode === 'detailed'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 shadow-apple'
            }`}
          >
            Detailed View
          </button>
        </div>
      ) : null}

      {/* Year-wise Summary */}
      {!selectedYear && !selectedSection && (
        <div className="bg-white rounded-2xl p-6 shadow-apple">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Year-wise Summary</h3>
          <p className="text-sm text-apple-gray mb-4">Select a year to view sections</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {yearStats.map((year) => (
              <button
                key={year.year}
                onClick={() => setSelectedYear(year.year)}
                className="p-4 rounded-xl bg-apple-lightgray hover:bg-gray-200 transition-colors text-left"
              >
                <p className="font-semibold text-gray-900 text-lg">{year.year}</p>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-apple-gray">Students: {year.totalStudents}</span>
                  <span className="text-apple-gray">Sections: {year.sections}</span>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  {year.hasData ? (
                    <>
                      <div className="flex-1 mr-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            year.avgAttendance >= 90 ? 'bg-green-500' :
                            year.avgAttendance >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${year.avgAttendance}%` }}
                        />
                      </div>
                      <span className={`text-sm font-semibold ${
                        year.avgAttendance >= 90 ? 'text-green-600' :
                        year.avgAttendance >= 75 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {Math.round(year.avgAttendance)}%
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-apple-gray">No attendance data</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Section-wise Summary */}
      {selectedYear && !selectedSection && (
        <div className="bg-white rounded-2xl p-6 shadow-apple">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Section-wise Summary - {selectedYear}</h3>
          <p className="text-sm text-apple-gray mb-4">Select a section to view details</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sectionStats.map((section) => (
              <button
                key={section.section}
                onClick={() => setSelectedSection(section.section)}
                className="p-4 rounded-xl bg-apple-lightgray hover:bg-gray-200 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900">{section.section}</p>
                  {!section.hasData && (
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">No data</span>
                  )}
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-apple-gray">Students: {section.totalStudents}</span>
                  {section.hasData && <span className="text-apple-gray">Days: {section.days}</span>}
                </div>
                {section.hasData && (
                  <div className="mt-1 flex justify-between items-center">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          section.avgAttendance >= 90 ? 'bg-green-500' :
                          section.avgAttendance >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${section.avgAttendance}%` }}
                      />
                    </div>
                    <span className={`text-sm font-semibold ${
                      section.avgAttendance >= 90 ? 'text-green-600' :
                      section.avgAttendance >= 75 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {Math.round(section.avgAttendance)}%
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Summary View */}
      {selectedSection && selectedAttendanceBatch && viewMode === 'summary' && (
        <>
          <div className="bg-white rounded-2xl p-6 shadow-apple">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Session-wise Breakdown</h3>
            <div className="space-y-6">
              {dailyStats.map((day) => (
                <div key={day.fullDate} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{day.date}</h4>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        day.attendance >= 90
                          ? 'bg-green-100 text-green-700'
                          : day.attendance >= 75
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {Math.round(day.attendance)}% present
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-3">
                    {day.sessions.map((session, idx) => (
                      <div
                        key={idx}
                        className="bg-apple-lightgray rounded-xl p-3 text-center"
                      >
                        <p className="text-xs text-apple-gray font-medium">{session.time}</p>
                        <p className="text-2xl font-semibold text-gray-900 mt-1">
                          {totalStudents - session.absentCount}
                        </p>
                        <p className="text-xs text-apple-gray">
                          {session.absentCount} absent
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </>
      )}

      {/* Detailed View */}
      {selectedYear && viewMode === 'detailed' && (
        <div className="bg-white rounded-2xl p-6 shadow-apple">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {detailedSection ? `${detailedSection} Attendance` : 'Student Attendance'}
              {detailedSection && (
                <span className="text-sm font-normal text-apple-gray ml-2">
                  ({detailedSectionStudents.length} students)
                </span>
              )}
            </h3>
            {!selectedSection && sectionsWithAttendance.length > 0 && (
              <select
                value={detailedViewSection}
                onChange={(e) => setDetailedViewSection(e.target.value)}
                className="px-4 py-2 rounded-xl bg-apple-lightgray border-0 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-apple-blue"
              >
                <option value="">Select Section</option>
                {sectionsWithAttendance.map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </select>
            )}
          </div>

          {detailedSection && detailedAttendanceBatch ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-sm font-medium text-apple-gray">#</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-apple-gray">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-apple-gray">Reg No</th>
                    {detailedDailyStats.map(day => (
                      <th key={day.fullDate} className="text-center py-3 px-4 text-sm font-medium text-apple-gray">
                        {day.date}
                      </th>
                    ))}
                    <th className="text-center py-3 px-4 text-sm font-medium text-apple-gray">Present</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-apple-gray">Absent</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-apple-gray">%</th>
                  </tr>
                </thead>
                <tbody>
                  {detailedStudentStats.map((student) => (
                    <tr key={student.regNo} className="border-b border-gray-50 hover:bg-apple-lightgray">
                      <td className="py-3 px-4 text-sm text-apple-gray">{student.roll}</td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{student.name || '-'}</td>
                      <td className="py-3 px-4 text-sm text-apple-gray">{student.regNo}</td>
                      {detailedDailyStats.map(day => {
                        const dayData = student.days[day.fullDate];
                        const isAbsent = dayData?.absent > 0;
                        return (
                          <td key={day.fullDate} className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${
                              isAbsent
                                ? 'bg-red-100 text-red-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {dayData?.present || 0}/{dayData?.total || 0}
                            </span>
                          </td>
                        );
                      })}
                      <td className="py-3 px-4 text-center text-sm text-green-600 font-medium">
                        {student.presentSessions}
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-red-600 font-medium">
                        {student.absentSessions}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`text-sm font-semibold ${
                          student.attendanceRate >= 90
                            ? 'text-green-600'
                            : student.attendanceRate >= 75
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                          {Math.round(student.attendanceRate)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-apple-gray">
              Select a section to view detailed attendance
            </div>
          )}
        </div>
      )}
    </div>
  );
}
