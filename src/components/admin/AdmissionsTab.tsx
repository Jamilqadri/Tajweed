import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Admission, ClassType } from '../../types';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  BookOpen,
  Calendar,
  AlertTriangle,
  FileSpreadsheet,
  X,
  Phone,
  MapPin,
  Check,
} from 'lucide-react';

export const AdmissionsTab: React.FC = () => {
  const {
    admissions,
    courses,
    teachers,
    groups,
    verifyAdmission,
    rejectAdmission,
    checkTeacherConflict,
    t,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Verification Assignment Form State
  const [assignCourseId, setAssignCourseId] = useState('');
  const [assignTeacherId, setAssignTeacherId] = useState('');
  const [assignClassType, setAssignClassType] = useState<ClassType>('group');
  const [assignGroupId, setAssignGroupId] = useState('');
  const [assignSlotTime, setAssignSlotTime] = useState('19:00');
  const [assignSlotDay, setAssignSlotDay] = useState('Mon, Wed, Fri');
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const filteredAdmissions = admissions.filter((a) => {
    if (statusFilter === 'all') return true;
    return a.admissionStatus === statusFilter;
  });

  const openVerifyModal = (adm: Admission) => {
    setSelectedAdmission(adm);
    setAssignCourseId(adm.courseId);
    setAssignClassType(adm.classType);
    setAssignTeacherId(teachers[0]?.id || '');
    const matchedGroup = groups.find((g) => g.courseId === adm.courseId);
    setAssignGroupId(matchedGroup?.id || groups[0]?.id || '');
    setConflictWarning(null);
    setIsVerifying(true);
  };

  const handleTeacherChange = (teacherId: string) => {
    setAssignTeacherId(teacherId);
    if (assignClassType === 'one_to_one') {
      const conflict = checkTeacherConflict(teacherId, '2026-09-20', assignSlotTime, 'one_to_one');
      if (conflict.hasConflict) {
        setConflictWarning(conflict.reason || 'Teacher has a scheduling conflict.');
      } else {
        setConflictWarning(null);
      }
    }
  };

  const handleClassTypeChange = (ct: ClassType) => {
    setAssignClassType(ct);
    setConflictWarning(null);
  };

  const handleExecuteVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmission) return;

    if (assignClassType === 'one_to_one') {
      const conflict = checkTeacherConflict(assignTeacherId, '2026-09-20', assignSlotTime, 'one_to_one');
      if (conflict.hasConflict) {
        setConflictWarning(conflict.reason || 'Teacher cannot be double booked.');
        return;
      }
    }

    verifyAdmission(selectedAdmission.id, {
      courseId: assignCourseId,
      teacherId: assignTeacherId,
      classType: assignClassType,
      groupId: assignClassType === 'group' ? assignGroupId : undefined,
      oneToOneSlot:
        assignClassType === 'one_to_one'
          ? `${assignSlotDay} at ${assignSlotTime}`
          : undefined,
    });

    setIsVerifying(false);
    setSelectedAdmission(null);
  };

  const handleReject = (adm: Admission) => {
    const reason = prompt('Reason for admission rejection (optional):', 'Requirements not met / schedule mismatch');
    if (reason !== null) {
      rejectAdmission(adm.id, reason);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-bold text-slate-900">Admissions Processing</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review applicant applications, verify qualifications, and assign teachers and cohorts.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {(['pending', 'verified', 'rejected', 'all'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'verified' ? 'Verified' : st} {st === 'pending' && `(${admissions.filter((a) => a.admissionStatus === 'pending').length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Admissions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 text-start">Student ID & Name</th>
                <th className="py-3.5 px-4 text-start">Course & Format</th>
                <th className="py-3.5 px-4 text-start">Contact & City</th>
                <th className="py-3.5 px-4 text-start">Applied Date</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAdmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No applications found in this category.
                  </td>
                </tr>
              ) : (
                filteredAdmissions.map((adm) => {
                  const course = courses.find((c) => c.id === adm.courseId);
                  return (
                    <tr key={adm.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-blue-700">{adm.studentId}</div>
                        <div className="font-bold text-slate-900 text-sm">{adm.fullName}</div>
                        <div className="text-[11px] text-slate-500">S/O {adm.fatherName}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{course?.name || 'Selected Course'}</div>
                        <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {adm.classType === 'group' ? 'Group Class' : 'One-to-One'}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-0.5">Pref: {adm.preferredTime}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="font-medium text-slate-800">{adm.mobile}</div>
                        <div className="text-[11px] text-slate-500">{adm.city}, {adm.state}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">
                        {adm.createdAt}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            adm.admissionStatus === 'verified'
                              ? 'bg-emerald-100 text-emerald-800'
                              : adm.admissionStatus === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800 animate-pulse'
                          }`}
                        >
                          {adm.admissionStatus === 'verified' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {adm.admissionStatus === 'rejected' && <XCircle className="w-3 h-3 text-red-600" />}
                          {adm.admissionStatus === 'pending' && <Clock className="w-3 h-3 text-amber-600" />}
                          <span className="capitalize">{adm.admissionStatus}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View details */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAdmission(adm);
                              setIsVerifying(false);
                            }}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Full Application"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Verify Admission */}
                          {adm.admissionStatus === 'pending' && (
                            <>
                              <button
                                type="button"
                                onClick={() => openVerifyModal(adm)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1 shadow-xs"
                                title="Verify & Assign"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Verify</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleReject(adm)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Reject"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
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

      {/* Verification & Assignment Modal */}
      {isVerifying && selectedAdmission && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-blue-900 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-xs text-blue-300 font-bold uppercase">Admission Verification</span>
                <h4 className="text-lg font-bold">
                  Assign Teacher & Cohort for {selectedAdmission.fullName}
                </h4>
                <p className="text-xs text-blue-200">Student ID: {selectedAdmission.studentId}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsVerifying(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteVerification} className="p-6 space-y-4 text-xs">
              {conflictWarning && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
                  <div>
                    <span className="font-bold block">Scheduling Conflict Detected:</span>
                    <span>{conflictWarning}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Course Selection */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Confirm Course</label>
                  <select
                    value={assignCourseId}
                    onChange={(e) => setAssignCourseId(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Class Type */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Class Type</label>
                  <select
                    value={assignClassType}
                    onChange={(e) => handleClassTypeChange(e.target.value as ClassType)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs"
                  >
                    <option value="group">Group Class (Max 10)</option>
                    <option value="one_to_one">One-to-One Class</option>
                  </select>
                </div>

                {/* Teacher Selection */}
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Assign Certified Teacher</label>
                  <select
                    value={assignTeacherId}
                    onChange={(e) => handleTeacherChange(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName} ({t.specialization} • {t.languages.join('/')})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cohort OR 1-on-1 Schedule */}
                {assignClassType === 'group' ? (
                  <div className="col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Select Cohort / Group (Max 10 Students)
                    </label>
                    <select
                      value={assignGroupId}
                      onChange={(e) => setAssignGroupId(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs"
                    >
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} ({g.studentIds?.length ?? 0}/{g.maxCapacity || g.capacity || 10} Students • {g.scheduleDays?.join(', ') || g.days?.join(', ') || 'Weekly'} @ {g.scheduleTime || g.startTime || '19:00'})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Slot Days</label>
                      <input
                        type="text"
                        value={assignSlotDay}
                        onChange={(e) => setAssignSlotDay(e.target.value)}
                        placeholder="e.g. Mon, Wed, Fri"
                        className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Slot Time</label>
                      <input
                        type="time"
                        value={assignSlotTime}
                        onChange={(e) => {
                          setAssignSlotTime(e.target.value);
                          const conflict = checkTeacherConflict(assignTeacherId, '2026-09-20', e.target.value, 'one_to_one');
                          if (conflict.hasConflict) setConflictWarning(conflict.reason || null);
                          else setConflictWarning(null);
                        }}
                        className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 text-xs"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsVerifying(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
                >
                  Confirm & Approve Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full 14-Field Application Inspection Modal */}
      {selectedAdmission && !isVerifying && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in duration-150">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-xs text-blue-400 font-bold uppercase">Application Review</span>
                <h4 className="text-lg font-bold">{selectedAdmission.fullName}</h4>
                <p className="text-xs text-slate-400">Student ID: {selectedAdmission.studentId}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAdmission(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block font-medium">Full Name</span>
                  <span className="font-bold text-slate-900">{selectedAdmission.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Father / Guardian</span>
                  <span className="font-bold text-slate-900">{selectedAdmission.fatherName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Gender</span>
                  <span className="font-bold text-slate-900 capitalize">{selectedAdmission.gender}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Date of Birth</span>
                  <span className="font-bold text-slate-900">{selectedAdmission.dob}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Mobile Number</span>
                  <span className="font-bold text-slate-900">{selectedAdmission.mobile}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">WhatsApp Number</span>
                  <span className="font-bold text-slate-900">{selectedAdmission.whatsapp}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block font-medium">City & State</span>
                  <span className="font-bold text-slate-900">{selectedAdmission.city}, {selectedAdmission.state}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Address</span>
                  <span className="font-bold text-slate-900">{selectedAdmission.address}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-blue-50/70 p-4 rounded-xl border border-blue-200">
                <div>
                  <span className="text-blue-600 block font-medium">Class Type Selected</span>
                  <span className="font-bold text-blue-950 capitalize">{selectedAdmission.classType.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-blue-600 block font-medium">Preferred Time</span>
                  <span className="font-bold text-blue-950">{selectedAdmission.preferredTime}</span>
                </div>
                <div>
                  <span className="text-blue-600 block font-medium">Previous Knowledge</span>
                  <span className="font-bold text-blue-950">{selectedAdmission.previousKnowledge}</span>
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-blue-600 block font-medium">Additional Note</span>
                  <span className="font-medium text-slate-700">{selectedAdmission.additionalNote || 'None provided'}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Initial password generated: last 6 digits of mobile
              </span>

              <div className="flex items-center gap-2">
                {selectedAdmission.admissionStatus === 'pending' && (
                  <button
                    type="button"
                    onClick={() => openVerifyModal(selectedAdmission)}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
                  >
                    Verify & Assign Cohort
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedAdmission(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
