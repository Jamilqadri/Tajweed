import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileSpreadsheet,
  Download,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Table,
  Filter,
} from 'lucide-react';

export const GoogleSheetsTab: React.FC = () => {
  const { googleSheets, courses } = useApp();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toLocaleTimeString());

  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setLastSyncTime(new Date().toLocaleTimeString());
      setIsSyncing(false);
    }, 600);
  };

  const handleExportCSV = () => {
    const headers = [
      'Student ID',
      'Full Name',
      'Father Name',
      'Mobile',
      'WhatsApp',
      'Course',
      'Class Type',
      'Preferred Time',
      'City',
      'State',
      'Status',
      'Timestamp',
    ];

    const rows = googleSheets.map((row) => [
      row.studentId,
      `"${row.fullName}"`,
      `"${row.fatherName}"`,
      row.mobile,
      row.whatsapp,
      `"${courses.find((c) => c.id === row.courseId)?.name || row.courseId}"`,
      row.classType,
      `"${row.preferredTime}"`,
      `"${row.city}"`,
      `"${row.state}"`,
      row.status,
      row.timestamp,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kanz_ut_tajweed_admissions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Sync Status */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Google Sheets Integration Layer</h3>
              <p className="text-xs text-slate-500">
                Primary Database: LMS Core • Sync Target: Google Sheets (Spreadsheet ID: 1gS_KanzUtTajweed_2026)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Sync Status Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Synced ({lastSyncTime})</span>
          </div>

          <button
            type="button"
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
            <span>Sync Now</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Interface Simulation */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-800">Sheet:</span>
            <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
              Form_Responses_Admissions (Total Rows: {googleSheets.length})
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Auto-appends on every new student submission
          </span>
        </div>

        <div className="overflow-x-auto max-h-[65vh]">
          <table className="w-full text-start text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-bold sticky top-0 border-b-2 border-slate-300">
              <tr>
                <th className="py-2.5 px-3 border-e border-slate-200 text-center w-12 bg-slate-200/60">#</th>
                <th className="py-2.5 px-3 border-e border-slate-200 text-start">Student ID</th>
                <th className="py-2.5 px-3 border-e border-slate-200 text-start">Full Name</th>
                <th className="py-2.5 px-3 border-e border-slate-200 text-start">Father Name</th>
                <th className="py-2.5 px-3 border-e border-slate-200 text-start">Mobile</th>
                <th className="py-2.5 px-3 border-e border-slate-200 text-start">Course</th>
                <th className="py-2.5 px-3 border-e border-slate-200 text-start">Class Type</th>
                <th className="py-2.5 px-3 border-e border-slate-200 text-start">Time Slot</th>
                <th className="py-2.5 px-3 border-e border-slate-200 text-start">City</th>
                <th className="py-2.5 px-3 border-e border-slate-200 text-center">Status</th>
                <th className="py-2.5 px-3 text-start">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
              {googleSheets.map((row, idx) => {
                const course = courses.find((c) => c.id === row.courseId);
                return (
                  <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-2 px-3 border-e border-slate-200 text-center text-slate-400 font-sans">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 border-e border-slate-200 font-bold text-blue-700">
                      {row.studentId}
                    </td>
                    <td className="py-2 px-3 border-e border-slate-200 font-sans font-semibold text-slate-900">
                      {row.fullName}
                    </td>
                    <td className="py-2 px-3 border-e border-slate-200 font-sans text-slate-600">
                      {row.fatherName}
                    </td>
                    <td className="py-2 px-3 border-e border-slate-200 text-slate-700">
                      {row.mobile}
                    </td>
                    <td className="py-2 px-3 border-e border-slate-200 font-sans text-slate-800">
                      {course?.name || row.courseId}
                    </td>
                    <td className="py-2 px-3 border-e border-slate-200 font-sans">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100">
                        {row.classType === 'group' ? 'Group' : '1-on-1'}
                      </span>
                    </td>
                    <td className="py-2 px-3 border-e border-slate-200 font-sans text-slate-600">
                      {row.preferredTime}
                    </td>
                    <td className="py-2 px-3 border-e border-slate-200 font-sans text-slate-600">
                      {row.city}
                    </td>
                    <td className="py-2 px-3 border-e border-slate-200 font-sans text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : row.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-400">
                      {row.timestamp}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
