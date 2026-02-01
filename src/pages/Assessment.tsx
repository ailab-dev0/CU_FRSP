import { useState, useMemo } from 'react';
import { StatCard } from '../components/StatCard';
import { ScoreDistribution, PracticalVsTheory } from '../components/AssessmentChart';
import assessmentData from '../data/assessments.json';

interface Assessment {
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

export function Assessment() {
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'regNo' | 'total'>('regNo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // All students
  const allStudents = assessmentData as Assessment[];
  const allAssessed = allStudents.filter(s => s.hasAssessment && s.total > 0);

  // Get unique years
  const years = useMemo(() => {
    const yearSet = new Set(allStudents.map(s => s.year).filter(Boolean));
    return Array.from(yearSet).sort();
  }, [allStudents]);

  // Get sections for selected year (or all if no year selected)
  const sections = useMemo(() => {
    const filtered = selectedYear
      ? allStudents.filter(s => s.year === selectedYear)
      : allStudents;
    const sectionSet = new Set(filtered.map(s => s.section).filter(Boolean));
    return Array.from(sectionSet).sort();
  }, [allStudents, selectedYear]);

  // Filter students by selected year and section
  const students = useMemo(() => {
    if (!selectedSection) return [];

    return allStudents
      .filter(a => a.section === selectedSection)
      .sort((a, b) => {
        const multiplier = sortOrder === 'desc' ? -1 : 1;
        if (sortBy === 'name') {
          return (a.name || '').localeCompare(b.name || '') * multiplier;
        } else if (sortBy === 'regNo') {
          return a.regNo.localeCompare(b.regNo) * multiplier;
        }
        return (a.total - b.total) * multiplier;
      });
  }, [selectedSection, sortBy, sortOrder, allStudents]);

  // Assessed students in selected section
  const assessedStudents = useMemo(() => {
    return students.filter(s => s.hasAssessment && s.total > 0);
  }, [students]);

  // Filtered data for stats (by year if selected, otherwise all)
  const filteredForStats = useMemo(() => {
    if (selectedSection) {
      return assessedStudents;
    } else if (selectedYear) {
      return allAssessed.filter(s => s.year === selectedYear);
    }
    return allAssessed;
  }, [selectedYear, selectedSection, assessedStudents, allAssessed]);

  // Calculate stats
  const stats = useMemo(() => {
    const data = filteredForStats;
    if (data.length === 0) {
      return { avgTotal: 0, avgPractical: 0, avgTheory: 0, highest: 0, passRate: 0 };
    }

    const avgTotal = data.reduce((sum, a) => sum + a.total, 0) / data.length;
    const avgPractical = data.reduce((sum, a) => sum + a.practical, 0) / data.length;
    const avgTheory = data.reduce((sum, a) => sum + a.theory, 0) / data.length;
    const highest = Math.max(...data.map(a => a.total));
    const passRate = (data.filter(a => a.total >= 25).length / data.length) * 100;

    return { avgTotal, avgPractical, avgTheory, highest, passRate };
  }, [filteredForStats]);

  // Score distribution
  const distribution = useMemo(() => {
    const data = filteredForStats;
    const ranges = ['0-10', '11-20', '21-30', '31-40', '41-50'];
    return ranges.map((range) => {
      const [min, max] = range.split('-').map(Number);
      const count = data.filter(a => a.total >= min && a.total <= max).length;
      return { range, count };
    });
  }, [filteredForStats]);

  // Year-wise stats for overview
  const yearStats = useMemo(() => {
    return years.map(year => {
      const yearStudents = allStudents.filter(s => s.year === year);
      const yearAssessed = yearStudents.filter(s => s.hasAssessment && s.total > 0);
      const avgScore = yearAssessed.length > 0
        ? yearAssessed.reduce((sum, s) => sum + s.total, 0) / yearAssessed.length
        : 0;
      return {
        year,
        total: yearStudents.length,
        assessed: yearAssessed.length,
        avgScore
      };
    });
  }, [years, allStudents]);

  // Section-wise stats (filtered by year if selected)
  const sectionStats = useMemo(() => {
    const relevantSections = selectedYear
      ? sections
      : Array.from(new Set(allStudents.map(s => s.section))).sort();

    return relevantSections.map(section => {
      const sectionStudents = allStudents.filter(s => s.section === section);
      const sectionAssessed = sectionStudents.filter(s => s.hasAssessment && s.total > 0);
      const avgScore = sectionAssessed.length > 0
        ? sectionAssessed.reduce((sum, s) => sum + s.total, 0) / sectionAssessed.length
        : 0;
      const year = sectionStudents[0]?.year || '';
      return {
        section,
        year,
        total: sectionStudents.length,
        assessed: sectionAssessed.length,
        avgScore
      };
    });
  }, [sections, selectedYear, allStudents]);

  // Top performers for selected section
  const topPerformers = useMemo(() => {
    return [...assessedStudents].sort((a, b) => b.total - a.total).slice(0, 5);
  }, [assessedStudents]);

  // Total students count for stats
  const totalStudentsForStats = useMemo(() => {
    if (selectedSection) {
      return students.length;
    } else if (selectedYear) {
      return allStudents.filter(s => s.year === selectedYear).length;
    }
    return allStudents.length;
  }, [selectedYear, selectedSection, students, allStudents]);

  const assessedCountForStats = useMemo(() => {
    if (selectedSection) {
      return assessedStudents.length;
    } else if (selectedYear) {
      return allAssessed.filter(s => s.year === selectedYear).length;
    }
    return allAssessed.length;
  }, [selectedYear, selectedSection, assessedStudents, allAssessed]);

  const handleSort = (column: 'name' | 'regNo' | 'total') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(column);
      setSortOrder(column === 'total' ? 'desc' : 'asc');
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">Assessment</h2>
          <p className="text-apple-gray mt-1">
            {selectedSection
              ? `${selectedSection} Results`
              : selectedYear
              ? `${selectedYear} Overview`
              : 'FRSP Assessment Overview'}
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

          {selectedYear && (
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={totalStudentsForStats}
          subtitle={selectedSection || selectedYear || 'All students'}
        />
        <StatCard
          title="Assessed"
          value={assessedCountForStats}
          subtitle={totalStudentsForStats > 0 ? `${Math.round((assessedCountForStats / totalStudentsForStats) * 100)}% coverage` : '0% coverage'}
        />
        <StatCard
          title="Average Score"
          value={Math.round(stats.avgTotal)}
          subtitle="Out of 50"
        />
        <StatCard
          title="Pass Rate"
          value={`${Math.round(stats.passRate)}%`}
          subtitle="50%+ marks"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ScoreDistribution data={distribution} title="Score Distribution" />
        </div>
        <PracticalVsTheory
          practical={stats.avgPractical}
          theory={stats.avgTheory}
        />
      </div>

      {/* Overview: Year-wise breakdown (when no year selected) */}
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
                  <span className="text-apple-gray">Students: {year.total}</span>
                  <span className="text-apple-gray">Assessed: {year.assessed}</span>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <div className="flex-1 mr-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${year.total > 0 ? (year.assessed / year.total) * 100 : 0}%` }}
                    />
                  </div>
                  {year.assessed > 0 && (
                    <span className={`text-sm font-semibold ${
                      year.avgScore >= 40 ? 'text-green-600' :
                      year.avgScore >= 25 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      Avg: {Math.round(year.avgScore)}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Section-wise breakdown (when year selected but no section) */}
      {selectedYear && !selectedSection && (
        <div className="bg-white rounded-2xl p-6 shadow-apple">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Section-wise Summary - {selectedYear}</h3>
          <p className="text-sm text-apple-gray mb-4">Select a section to view student details</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sectionStats.map((section) => (
              <button
                key={section.section}
                onClick={() => setSelectedSection(section.section)}
                className="p-4 rounded-xl bg-apple-lightgray hover:bg-gray-200 transition-colors text-left"
              >
                <p className="font-semibold text-gray-900">{section.section}</p>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-apple-gray">Students: {section.total}</span>
                  <span className="text-apple-gray">Assessed: {section.assessed}</span>
                </div>
                <div className="mt-1 flex justify-between items-center">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${section.total > 0 ? (section.assessed / section.total) * 100 : 0}%` }}
                    />
                  </div>
                  {section.assessed > 0 && (
                    <span className={`text-sm font-semibold ${
                      section.avgScore >= 40 ? 'text-green-600' :
                      section.avgScore >= 25 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      Avg: {Math.round(section.avgScore)}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Section Selected: Show Top Performers + Student Table */}
      {selectedSection && (
        <>
          {/* Top Performers */}
          {topPerformers.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-apple">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                {topPerformers.map((student, idx) => (
                  <div
                    key={student.regNo}
                    className="flex items-center justify-between p-3 rounded-xl bg-green-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {student.name || `Student #${student.regNo}`}
                        </p>
                        <p className="text-xs text-apple-gray">{student.regNo}</p>
                      </div>
                    </div>
                    <span className="text-lg font-semibold text-green-600">
                      {Math.round(student.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Students Table */}
          <div className="bg-white rounded-2xl p-6 shadow-apple">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedSection} Students
              <span className="text-sm font-normal text-apple-gray ml-2">({students.length})</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-sm font-medium text-apple-gray">#</th>
                    <th
                      className="text-left py-3 px-4 text-sm font-medium text-apple-gray cursor-pointer hover:text-gray-900"
                      onClick={() => handleSort('name')}
                    >
                      Name {sortBy === 'name' && (sortOrder === 'desc' ? '↓' : '↑')}
                    </th>
                    <th
                      className="text-left py-3 px-4 text-sm font-medium text-apple-gray cursor-pointer hover:text-gray-900"
                      onClick={() => handleSort('regNo')}
                    >
                      Register No {sortBy === 'regNo' && (sortOrder === 'desc' ? '↓' : '↑')}
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-apple-gray">Practical</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-apple-gray">Theory</th>
                    <th
                      className="text-right py-3 px-4 text-sm font-medium text-apple-gray cursor-pointer hover:text-gray-900"
                      onClick={() => handleSort('total')}
                    >
                      Total {sortBy === 'total' && (sortOrder === 'desc' ? '↓' : '↑')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, idx) => (
                    <tr key={student.regNo} className="border-b border-gray-50 hover:bg-apple-lightgray">
                      <td className="py-3 px-4 text-sm text-apple-gray">{idx + 1}</td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {student.name || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-apple-gray">{student.regNo}</td>
                      <td className="py-3 px-4 text-sm text-right text-gray-900">
                        {student.hasAssessment ? Math.round(student.practical) : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-gray-900">
                        {student.hasAssessment ? Math.round(student.theory) : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-semibold">
                        {student.hasAssessment ? (
                          <span
                            className={
                              student.total >= 40
                                ? 'text-green-600'
                                : student.total >= 25
                                ? 'text-yellow-600'
                                : 'text-red-600'
                            }
                          >
                            {Math.round(student.total)}
                          </span>
                        ) : (
                          <span className="text-apple-gray">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
