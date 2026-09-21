import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ScheduledClass, ClassType, ClassStatus } from '../../types';
import {
  Calendar,
  Plus,
  Video,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Play,
  X,
  Users,
  UserCheck,
  Check,
  ExternalLink,
} from 'lucide-react';
import { GoogleMeetLauncherModal } from '../classroom/GoogleMeetLauncherModal';
import { GoogleMeetSettingsCard } from './GoogleMeetSettingsCard';
import { TeacherGenderIcon } from '../common/TeacherGenderIcon';
import { isRealGoogleMeetLink } from '../../lib/googleMeetService';

export const ClassesTab: React.FC = () => {
  const {
    classes,
    courses,
    teachers,
    students,
    groups,
    scheduleClass,
    updateClassStatus,
    joinLiveClass,
    checkTeacherConflict,
  } = useApp();

  const [isCreating, setIsCreating] = useState(false);
  const [activeMeetClass, setActiveMeetClass] = useState<ScheduledClass | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'group' | 'one_to_one'>('all');

  // Opens Google Meet summary & launcher modal
  const handleAdminJoinClass = (cls: ScheduledClass) => {
    setActiveMeetClass(cls);
  };

  // Form State
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [teacherId, setTeacherId] = useState(teachers[0]?.id || '');
  const [classType, setClassType] = useState<ClassType>('group');
  const [groupId, setGroupId] = useState(groups[0]?.id || '');
  const [studentId, setStudentId] = useState(students[0]?.id || '');
  const [date, setDate] = useState('2026-09-20');
  const [time, setTime] = useState('19:00');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [conflictError, setConflictError] = useState<string | null>(null);

  const filteredClasses = classes.filter((c) => {
    if (filterType === 'all') return true;
    return c.classType === filterType;
  });

  const groupClassesCount = classes.filter((c) => c.classType === 'group').length;
  const oneToOneClassesCount = classes.filter((c) => c.classType === 'one_to_one').length;

  const resetForm = () => {
    setIsCreating(false);
    setConflictError(null);
  };

  const handleTeacherOrTimeChange = (newTeacherId: string, newDate: string, newTime: string, newType: ClassType) => {
    const conflict = checkTeacherConflict(newTeacherId, newDate, newTime, newType);
    if (conflict.hasConflict) {
      setConflictError(conflict.reason || 'Teacher has a scheduling conflict at this time.');
    } else {
      setConflictError(null);
    }
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Verify conflict
    const conflict = checkTeacherConflict(teacherId, date, time, classType);
    if (conflict.hasConflict) {
      setConflictError(conflict.reason || 'Teacher cannot have two classes at the same time.');
      return;
    }

    scheduleClass({
      courseId,
      teacherId,
      classType,
      groupId: classType === 'group' ? groupId : undefined,
      studentId: classType === 'one_to_one' ? studentId : undefined,
      date,
      time,
      durationMinutes,
      status: 'scheduled',
    });

    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Google Meet & Calendar Integration Panel */}
      <GoogleMeetSettingsCard />

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-bold text-slate-900">Class Scheduling & Sessions</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time schedule with automated teacher conflict prevention and Video Class room integration.
          </p>
        </div>

        {!isCreating && (
          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsCreating(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Class</span>
          </button>
        )}
      </div>

      {/* Scheduler Form */}
      {isCreating && (
        <form
          onSubmit={handleScheduleSubmit}
          className="bg-white p-6 rounded-2xl border-2 border-blue-200 shadow-lg space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-bold text-slate-900 text-base">Schedule New Live Session</h4>
            <button type="button" onClick={resetForm} className="text-slate-400 hover:text-slate-700 p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {conflictError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <div>
                <span className="font-bold">Teacher Double-Booking Prevention:</span>
                <span className="block mt-0.5">{conflictError}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Course</label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Teacher</label>
              <select
                value={teacherId}
                onChange={(e) => {
                  setTeacherId(e.target.value);
                  handleTeacherOrTimeChange(e.target.value, date, time, classType);
                }}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Class Type</label>
              <select
                value={classType}
                onChange={(e) => {
                  const ct = e.target.value as ClassType;
                  setClassType(ct);
                  handleTeacherOrTimeChange(teacherId, date, time, ct);
                }}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900"
              >
                <option value="group">Group Class (Cohorts)</option>
                <option value="one_to_one">One-to-One Class</option>
              </select>
            </div>

            {classType === 'group' ? (
              <div className="sm:col-span-3">
                <label className="block font-bold text-slate-700 mb-1">Select Group Cohort</label>
                <select
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.studentIds?.length ?? 0}/{g.maxCapacity || g.capacity || 10} Students)
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="sm:col-span-3">
                <label className="block font-bold text-slate-700 mb-1">Select One-to-One Student</label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.studentId})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  handleTeacherOrTimeChange(teacherId, e.target.value, time, classType);
                }}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => {
                  setTime(e.target.value);
                  handleTeacherOrTimeChange(teacherId, date, e.target.value, classType);
                }}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Duration (Minutes)</label>
              <input
                type="number"
                min={15}
                max={120}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
            >
              Schedule Session
            </button>
          </div>
        </form>
      )}

      {/* Access Rule Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-2xl p-4 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600/50 flex items-center justify-center shrink-0 border border-blue-400/30">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="font-bold text-sm text-white flex items-center gap-2">
              <span>Admin Class Access: Unrestricted</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Join Anytime
              </span>
            </div>
            <p className="text-blue-200 text-[11px] mt-0.5">
              Both Group Classes and One-to-One Classes are always visible. Admins and Teachers can join sessions at any time without time restrictions.
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-xl border border-white/15 self-start sm:self-center shrink-0">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
              filterType === 'all'
                ? 'bg-white text-blue-950 shadow-xs'
                : 'text-blue-200 hover:text-white'
            }`}
          >
            All Classes ({classes.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('group')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
              filterType === 'group'
                ? 'bg-white text-blue-950 shadow-xs'
                : 'text-blue-200 hover:text-white'
            }`}
          >
            Group Classes ({groupClassesCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('one_to_one')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
              filterType === 'one_to_one'
                ? 'bg-white text-blue-950 shadow-xs'
                : 'text-blue-200 hover:text-white'
            }`}
          >
            One-to-One ({oneToOneClassesCount})
          </button>
        </div>
      </div>

      {/* Classes Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 text-start">Course & Batch / Student</th>
                <th className="py-3.5 px-4 text-start">Teacher</th>
                <th className="py-3.5 px-4 text-start">Date & Time</th>
                <th className="py-3.5 px-4 text-start">Video Class Room</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-end">Session Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No classes found matching the selected filter.
                  </td>
                </tr>
              ) : (
                filteredClasses.map((cls) => {
                  const course = courses.find((c) => c.id === cls.courseId);
                  const teacher = teachers.find((t) => t.id === cls.teacherId);
                  const group = cls.groupId ? groups.find((g) => g.id === cls.groupId) : null;
                  const student = cls.studentId ? students.find((s) => s.id === cls.studentId) : null;

                  return (
                    <tr key={cls.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{course?.name}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            {cls.classType === 'group' ? 'Group Class' : '1-on-1'}
                          </span>
                          <span className="text-slate-600 font-medium">
                            {cls.classType === 'group' ? group?.name : student?.fullName}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <TeacherGenderIcon
                            gender={teacher?.gender}
                            teacherName={teacher?.fullName}
                            size={14}
                          />
                          <div className="font-semibold text-slate-800">{teacher?.fullName}</div>
                        </div>
                        <div className="text-[11px] text-slate-400">{teacher?.specialization}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{cls.date}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-600" />
                          <span>{cls.time} ({cls.durationMinutes} mins)</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleAdminJoinClass(cls)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
                            title="Admin Access: You can join this Google Meet live room anytime."
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Join Google Meet</span>
                          </button>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                            {isRealGoogleMeetLink(cls.meetLink) ? (
                              <>
                                <span className="truncate max-w-[110px] text-slate-700 font-semibold">
                                  {cls.meetLink.replace('https://meet.google.com/', '')}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(cls.meetLink);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 underline text-[10px] font-sans font-bold"
                                  title="Copy Google Meet Link"
                                >
                                  Copy
                                </button>
                              </>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-sans italic">
                                Created on launch
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          cls.status === 'live'
                            ? 'bg-red-100 text-red-800 animate-pulse'
                            : cls.status === 'completed'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {cls.status === 'live' ? 'LIVE NOW' : cls.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-end">
                      <div className="flex items-center justify-end gap-1.5">
                        {cls.status === 'scheduled' && (
                          <button
                            type="button"
                            onClick={() => updateClassStatus(cls.id, 'live')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1"
                            title="Start Class"
                          >
                            <Play className="w-3 h-3" />
                            <span>Start</span>
                          </button>
                        )}
                        {cls.status === 'live' && (
                          <button
                            type="button"
                            onClick={() => updateClassStatus(cls.id, 'completed')}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1"
                            title="Finish Class"
                          >
                            <Check className="w-3 h-3" />
                            <span>Finish</span>
                          </button>
                        )}
                        {cls.status !== 'completed' && cls.status !== 'cancelled' && (
                          <button
                            type="button"
                            onClick={() => updateClassStatus(cls.id, 'cancelled')}
                            className="p-1 text-slate-400 hover:text-red-600 rounded"
                            title="Cancel Class"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Google Meet Classroom Modal */}
      {activeMeetClass && (
        <GoogleMeetLauncherModal
          classItem={activeMeetClass}
          onClose={() => setActiveMeetClass(null)}
        />
      )}
    </div>
  );
};
