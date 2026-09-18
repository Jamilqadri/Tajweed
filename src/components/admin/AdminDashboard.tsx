import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ScheduledClass } from '../../types';
import {
  Users,
  UserCheck,
  GraduationCap,
  BookOpen,
  Calendar,
  CreditCard,
  Clock,
  Video,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Layers,
  ArrowRight,
  Shield,
  Activity,
} from 'lucide-react';
import { AdminManagementTab } from './AdminManagementTab';
import { AdmissionsTab } from './AdmissionsTab';
import { StudentsTab } from './StudentsTab';
import { TeachersTab } from './TeachersTab';
import { CoursesTab } from './CoursesTab';
import { GroupsTab } from './GroupsTab';
import { ClassesTab } from './ClassesTab';
import { FeesTab } from './FeesTab';
import { GoogleSheetsTab } from './GoogleSheetsTab';
import { ClassMeetModal } from '../classroom/ClassMeetModal';

interface AdminDashboardProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const {
    students,
    teachers,
    courses,
    classes,
    payments,
    groups,
    currentRole,
    currentUser,
    activityLogs,
    t,
  } = useApp();

  const [activeMeetClass, setActiveMeetClass] = useState<ScheduledClass | null>(null);

  // Computed Metrics
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === 'active' || s.admissionStatus === 'verified').length;
  const totalTeachers = teachers.filter((t) => t.status === 'active').length;
  const activeCourses = courses.filter((c) => c.status === 'active').length;
  const pendingAdmissions = students.filter((s) => s.admissionStatus === 'pending').length;
  const pendingFees = payments.filter((p) => p.status === 'pending').length;

  // Filter today's classes
  const todayStr = '2026-09-20'; // Current simulation date
  const todaysClasses = classes.filter((c) => c.date === todayStr);

  // Render Sub-Views based on currentTab
  if (currentTab === 'admin_management' && currentRole === 'super_admin') {
    return <AdminManagementTab />;
  }
  if (currentTab === 'admissions') {
    return <AdmissionsTab />;
  }
  if (currentTab === 'students') {
    return <StudentsTab />;
  }
  if (currentTab === 'teachers') {
    return <TeachersTab />;
  }
  if (currentTab === 'courses') {
    return <CoursesTab />;
  }
  if (currentTab === 'groups') {
    return <GroupsTab />;
  }
  if (currentTab === 'classes' || currentTab === 'schedule') {
    return <ClassesTab />;
  }
  if (currentTab === 'fees') {
    return <FeesTab />;
  }
  if (currentTab === 'google_sheets') {
    return <GoogleSheetsTab />;
  }
  if (currentTab === 'activity_logs') {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            <h3 className="text-xl font-bold text-slate-900">System Audit & Activity Logs</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Immutable log of all user registrations, admission approvals, and administrative actions.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100 text-xs">
            {activityLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs">
                    {log.userRole[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{log.action}</div>
                    <div className="text-slate-500">{log.details}</div>
                  </div>
                </div>
                <div className="text-slate-400 font-mono text-[11px]">{log.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (currentTab === 'settings') {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-xl font-bold text-slate-900">Academy Settings</h3>
          <p className="text-xs text-slate-500 mt-1">
            Global configurations for Kanz Ut Tajweed Online Learning Management System.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 max-w-xl text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Academy Name</label>
            <input
              type="text"
              readOnly
              value="KANZ UT TAJWEED"
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Max Students Per Group Class</label>
            <input
              type="number"
              readOnly
              value={10}
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50"
            />
            <span className="text-[11px] text-slate-400">Strictly locked to 10 for quality assurance.</span>
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Live Video Class Join Window</label>
            <input
              type="text"
              readOnly
              value="5 Minutes Before Scheduled Start Time"
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Google Sheets Sync Target</label>
            <input
              type="text"
              readOnly
              value="Connected (1gS_KanzUtTajweed_2026)"
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 text-emerald-700 font-semibold"
            />
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT VIEW: Overview Dashboard
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold mb-1 border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{currentRole === 'super_admin' ? 'SUPER ADMIN CONSOLE' : 'ADMINISTRATIVE CONSOLE'}</span>
          </div>
          <div className="space-y-0.5">
            <span className="block text-sm sm:text-base font-medium text-blue-200 tracking-wide">
              Assalamu Alaikum
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {currentUser?.name}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-blue-100">
            Overview of admissions, live classroom schedules, faculty allocations, and fee receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {pendingAdmissions > 0 && (
            <button
              type="button"
              onClick={() => onSelectTab('admissions')}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-colors flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>{pendingAdmissions} Pending Admissions</span>
            </button>
          )}

          {pendingFees > 0 && (
            <button
              type="button"
              onClick={() => onSelectTab('fees')}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md transition-colors flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>{pendingFees} Fee Receipts</span>
            </button>
          )}
        </div>
      </div>

      {/* 7 Core Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div
          onClick={() => onSelectTab('students')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('totalStudents')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{totalStudents}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            {activeStudents} {t('activeStudents')}
          </div>
        </div>

        {/* Total Teachers */}
        <div
          onClick={() => onSelectTab('teachers')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('totalTeachers')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{totalTeachers}</div>
          <div className="text-[11px] text-slate-500 mt-1">Certified Tajweed Qaris</div>
        </div>

        {/* Active Courses */}
        <div
          onClick={() => onSelectTab('courses')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('activeCourses')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{activeCourses}</div>
          <div className="text-[11px] text-slate-500 mt-1">{groups.length} Active Cohorts</div>
        </div>

        {/* Today's Classes */}
        <div
          onClick={() => onSelectTab('classes')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('todaysClasses')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{todaysClasses.length}</div>
          <div className="text-[11px] text-blue-600 font-semibold mt-1">Live Video Classes</div>
        </div>

        {/* Pending Admissions */}
        <div
          onClick={() => onSelectTab('admissions')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('pendingAdmissions')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{pendingAdmissions}</div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">Awaiting Verification</div>
        </div>

        {/* Pending Fee Verification */}
        <div
          onClick={() => onSelectTab('fees')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('pendingFeeVerification')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{pendingFees}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Receipts to verify</div>
        </div>

        {/* Super Admin Quick Link */}
        {currentRole === 'super_admin' && (
          <div
            onClick={() => onSelectTab('admin_management')}
            className="bg-purple-50 p-5 rounded-2xl border border-purple-200 shadow-xs hover:border-purple-400 hover:shadow-md transition-all cursor-pointer group col-span-2 sm:col-span-1"
          >
            <div className="flex items-center justify-between text-purple-600 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                Admin Roles
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-purple-900">Manage</div>
            <div className="text-[11px] text-purple-700 font-semibold mt-1">Granular RBAC</div>
          </div>
        )}
      </div>

      {/* Today's Live Classes Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{t('todaysClasses')}</h3>
            <p className="text-xs text-slate-500">
              Live Video Class sessions scheduled for today ({todayStr})
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSelectTab('classes')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800"
          >
            <span>View Full Schedule</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 text-start">Student / Group</th>
                <th className="py-3 px-4 text-start">Course</th>
                <th className="py-3 px-4 text-start">Teacher</th>
                <th className="py-3 px-4 text-start">Time</th>
                <th className="py-3 px-4 text-start">Class Type</th>
                <th className="py-3 px-4 text-center">{t('googleMeet')}</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {todaysClasses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    No classes scheduled for today.
                  </td>
                </tr>
              ) : (
                todaysClasses.map((cls) => {
                  const course = courses.find((c) => c.id === cls.courseId);
                  const teacher = teachers.find((t) => t.id === cls.teacherId);
                  const group = cls.groupId ? groups.find((g) => g.id === cls.groupId) : null;
                  const student = cls.studentId ? students.find((s) => s.id === cls.studentId) : null;

                  return (
                    <tr key={cls.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {cls.classType === 'group' ? group?.name : student?.fullName}
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        {course?.name}
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        {teacher?.fullName}
                      </td>

                      <td className="py-3 px-4 font-semibold text-blue-900">
                        {cls.time} ({cls.durationMinutes}m)
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {cls.classType === 'group' ? 'Group Class' : 'One-to-One'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setActiveMeetClass(cls)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Meet</span>
                        </button>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            cls.status === 'live'
                              ? 'bg-red-100 text-red-800 animate-pulse'
                              : cls.status === 'completed'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {cls.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Classroom Modal */}
      {activeMeetClass && (
        <ClassMeetModal
          classItem={activeMeetClass}
          onClose={() => setActiveMeetClass(null)}
        />
      )}
    </div>
  );
};
