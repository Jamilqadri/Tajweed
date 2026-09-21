import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Group } from '../../types';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Users,
  CheckCircle2,
  Clock,
  Calendar,
  X,
  UserPlus,
  Video,
  ExternalLink,
  Copy,
} from 'lucide-react';
import { TeacherGenderIcon } from '../common/TeacherGenderIcon';
import { isRealGoogleMeetLink } from '../../lib/googleMeetService';

export const GroupsTab: React.FC = () => {
  const { groups, courses, teachers, students, addGroup, updateGroup, deleteGroup } = useApp();

  const [isCreating, setIsCreating] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [teacherId, setTeacherId] = useState(teachers[0]?.id || '');
  const [scheduleDays, setScheduleDays] = useState('Mon, Wed, Fri');
  const [scheduleTime, setScheduleTime] = useState('19:00');
  const [maxCapacity, setMaxCapacity] = useState(10);
  const [meetLink, setMeetLink] = useState('');

  const resetForm = () => {
    setName('');
    setCourseId(courses[0]?.id || '');
    setTeacherId(teachers[0]?.id || '');
    setScheduleDays('Mon, Wed, Fri');
    setScheduleTime('19:00');
    setMaxCapacity(10);
    setMeetLink('');
    setIsCreating(false);
    setEditingGroup(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !courseId || !teacherId) return;

    if (editingGroup) {
      updateGroup(editingGroup.id, {
        name,
        courseId,
        teacherId,
        scheduleDays: scheduleDays.split(',').map((s) => s.trim()),
        scheduleTime,
        maxCapacity: Math.min(10, Number(maxCapacity)),
        meetLink: meetLink.trim(),
      });
    } else {
      addGroup({
        name,
        courseId,
        teacherId,
        studentIds: [],
        scheduleDays: scheduleDays.split(',').map((s) => s.trim()),
        scheduleTime,
        maxCapacity: Math.min(10, Number(maxCapacity)),
        status: 'active',
        meetLink: meetLink.trim(),
      });
    }
    resetForm();
  };

  const startEdit = (group: Group) => {
    setEditingGroup(group);
    setName(group.name);
    setCourseId(group.courseId);
    setTeacherId(group.teacherId);
    setScheduleDays(group.scheduleDays?.join(', ') || group.days?.join(', ') || '');
    setScheduleTime(group.scheduleTime || group.startTime || '19:00');
    setMaxCapacity(group.maxCapacity || group.capacity || 10);
    setMeetLink(group.meetLink || '');
    setIsCreating(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-bold text-slate-900">Group Cohorts</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage interactive group classes (strictly capped at maximum 10 students per batch).
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
            <span>Create New Group</span>
          </button>
        )}
      </div>

      {/* Form */}
      {isCreating && (
        <form
          onSubmit={handleSave}
          className="bg-white p-6 rounded-2xl border-2 border-blue-200 shadow-lg space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-bold text-slate-900 text-base">
              {editingGroup ? 'Edit Group Cohort' : 'Create New Group Cohort'}
            </h4>
            <button type="button" onClick={resetForm} className="text-slate-400 hover:text-slate-700 p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Group Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tajweed Batch C (Evening)"
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Course *</label>
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
              <label className="block font-bold text-slate-700 mb-1">Teacher *</label>
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
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
              <label className="block font-bold text-slate-700 mb-1">Days of Week</label>
              <input
                type="text"
                value={scheduleDays}
                onChange={(e) => setScheduleDays(e.target.value)}
                placeholder="Mon, Wed, Fri"
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Class Time</label>
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Max Capacity (Max 10)</label>
              <input
                type="number"
                min={1}
                max={10}
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(Math.min(10, Number(e.target.value)))}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block font-bold text-slate-700 mb-1">
                Google Meet Room Link (Optional / مستقل میٹنگ لنک)
              </label>
              <input
                type="text"
                value={meetLink}
                onChange={(e) => setMeetLink(e.target.value)}
                placeholder="https://meet.google.com/abc-defg-hij"
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 font-mono text-xs"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Enter permanent Google Meet room URL for this group, or leave blank to launch via teacher's account.
              </p>
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
              {editingGroup ? 'Update Group' : 'Create Group'}
            </button>
          </div>
        </form>
      )}

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => {
          const course = courses.find((c) => c.id === group.courseId);
          const teacher = teachers.find((t) => t.id === group.teacherId);
          const enrolledCount = group.studentIds?.length ?? students.filter(s => s.assignedGroupId === group.id).length;
          const maxCap = group.maxCapacity || group.capacity || 10;
          const isFull = enrolledCount >= maxCap;
          const groupDays = group.scheduleDays?.join(', ') || group.days?.join(', ') || 'Mon, Wed, Fri';
          const groupTime = group.scheduleTime || group.startTime || '19:00';

          return (
            <div
              key={group.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:border-blue-400 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {course?.name || 'Assigned Course'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isFull ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isFull ? `FULL (${maxCap}/${maxCap})` : `${enrolledCount}/${maxCap} Enrolled`}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-base">{group.name}</h4>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span><strong>Days:</strong> {groupDays}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span><strong>Time:</strong> {groupTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="flex items-center gap-1.5">
                      <strong>Teacher:</strong>
                      {teacher ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                          <TeacherGenderIcon
                            gender={teacher.gender}
                            teacherName={teacher.fullName}
                            size={12}
                          />
                          <span>{teacher.fullName}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">Unassigned</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Batch Enrollment</span>
                    <span className="font-bold text-slate-800">
                      {enrolledCount} / {maxCap} Max
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        isFull ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(100, (enrolledCount / maxCap) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Google Meet Room */}
                <div className="mt-3.5 p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                      <Video className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-blue-800">Google Meet Room</div>
                      <div className="text-xs font-mono text-slate-800 font-semibold truncate max-w-[160px]">
                        {isRealGoogleMeetLink(group.meetLink)
                          ? group.meetLink!.replace('https://meet.google.com/', '')
                          : 'Not assigned yet'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isRealGoogleMeetLink(group.meetLink) && (
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(group.meetLink!)}
                        className="p-1.5 text-xs text-blue-800 hover:bg-blue-100 rounded-md transition-colors"
                        title="Copy Google Meet Link"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <a
                      href={isRealGoogleMeetLink(group.meetLink) ? group.meetLink! : 'https://meet.google.com/new'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
                      title="Open Google Meet Space"
                    >
                      <span>Join</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedGroup(group)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Users className="w-4 h-4" />
                  <span>View Students ({enrolledCount})</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => startEdit(group)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete group ${group.name}?`)) {
                        deleteGroup(group.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enrolled Students Modal */}
      {selectedGroup && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in duration-150">
            <div className="bg-blue-900 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-xs text-blue-300 font-bold uppercase">Enrolled Cohort</span>
                <h4 className="text-lg font-bold">{selectedGroup.name}</h4>
                <p className="text-xs text-blue-200">
                  {selectedGroup.studentIds?.length ?? students.filter(s => s.assignedGroupId === selectedGroup.id).length} of {selectedGroup.maxCapacity || selectedGroup.capacity || 10} students enrolled
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGroup(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-2 text-xs max-h-[60vh] overflow-y-auto">
              {((selectedGroup.studentIds && selectedGroup.studentIds.length > 0)
                ? selectedGroup.studentIds
                : students.filter(s => s.assignedGroupId === selectedGroup.id).map(s => s.id)
              ).length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  No students have been assigned to this group yet.
                </div>
              ) : (
                ((selectedGroup.studentIds && selectedGroup.studentIds.length > 0)
                  ? selectedGroup.studentIds
                  : students.filter(s => s.assignedGroupId === selectedGroup.id).map(s => s.id)
                ).map((sid) => {
                  const student = students.find((s) => s.id === sid);
                  return (
                    <div
                      key={sid}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{student?.fullName || sid}</div>
                        <div className="font-mono text-[11px] text-blue-600">{student?.studentId}</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedGroup(null)}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
