import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminUser, Teacher, Student } from '../../types';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
  UserX,
  Trash2,
  X,
  Users,
  GraduationCap,
  Shield,
  Info,
} from 'lucide-react';

export interface SuperAdminDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'admin' | 'teacher' | 'student';
  entity: AdminUser | Teacher | Student | null;
  onSuccess?: () => void;
}

export const SuperAdminDeleteModal: React.FC<SuperAdminDeleteModalProps> = ({
  isOpen,
  onClose,
  entityType,
  entity,
  onSuccess,
}) => {
  const {
    students,
    teachers,
    admins,
    groups,
    updateStudentStatus,
    transferStudentTeacher,
    transferStudentAdmin,
    deleteTeacher,
    deleteAdmin,
    deleteStudent,
  } = useApp();

  const [confirmationInput, setConfirmationInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedTransferTeacherId, setSelectedTransferTeacherId] = useState('');
  const [selectedTransferAdminId, setSelectedTransferAdminId] = useState('');
  const [batchTeacherId, setBatchTeacherId] = useState('');
  const [batchAdminId, setBatchAdminId] = useState('');
  const [transferredStudentIds, setTransferredStudentIds] = useState<Record<string, string>>({});

  // Reset state on open/entity change
  useEffect(() => {
    setConfirmationInput('');
    setIsDeleting(false);
    setSelectedTransferTeacherId('');
    setSelectedTransferAdminId('');
    setBatchTeacherId('');
    setBatchAdminId('');
    setTransferredStudentIds({});
  }, [isOpen, entity]);

  // Compute assigned students for Teacher
  const teacherAssignedStudents = useMemo(() => {
    if (entityType !== 'teacher' || !entity) return [];
    const teacher = entity as Teacher;

    // Direct student assignments
    const teacherGroupIds = groups
      .filter((g) => g.teacherId === teacher.id)
      .map((g) => g.id);

    return students.filter((s) => {
      const isDirect =
        s.assignedTeacherId === teacher.id ||
        s.assignedTeacherId === teacher.teacherId ||
        (s.assignedTeacher && s.assignedTeacher === teacher.fullName);
      const isInTeacherList =
        teacher.assignedStudentIds &&
        (teacher.assignedStudentIds.includes(s.id) || teacher.assignedStudentIds.includes(s.studentId));
      const isInTeacherGroup =
        (s.assignedGroupId && teacherGroupIds.includes(s.assignedGroupId)) ||
        (s.groupId && teacherGroupIds.includes(s.groupId)) ||
        groups.some(
          (g) =>
            g.teacherId === teacher.id &&
            g.studentIds &&
            (g.studentIds.includes(s.id) || g.studentIds.includes(s.studentId))
        );

      return isDirect || isInTeacherList || isInTeacherGroup;
    });
  }, [entityType, entity, students, groups]);

  // Compute assigned students for Admin
  const adminAssignedStudents = useMemo(() => {
    if (entityType !== 'admin' || !entity) return [];
    const admin = entity as AdminUser;

    return students.filter((s) => {
      const isDirect =
        s.assignedAdminId === admin.id ||
        s.assignedAdminId === admin.userId ||
        s.assignedAdmin === admin.name ||
        s.assignedAdmin === admin.fullName;
      const isInAdminList =
        admin.assignedStudentIds &&
        (admin.assignedStudentIds.includes(s.id) || admin.assignedStudentIds.includes(s.studentId));

      return isDirect || isInAdminList;
    });
  }, [entityType, entity, students]);

  const assignedStudents = entityType === 'teacher' ? teacherAssignedStudents : adminAssignedStudents;

  // Other available teachers for transfer
  const availableTeachers = useMemo(() => {
    if (!entity) return [];
    return teachers.filter((t) => t.id !== entity.id && t.status === 'active');
  }, [teachers, entity]);

  // Other available admins for transfer
  const availableAdmins = useMemo(() => {
    if (!entity) return [];
    return admins.filter((a) => a.id !== entity.id && a.status === 'active');
  }, [admins, entity]);

  // Check if each student is handled
  const isStudentHandled = (student: Student): boolean => {
    // 1. If student was transferred in this session
    if (transferredStudentIds[student.id]) return true;

    // 2. If student is disabled (inactive)
    if (student.status === 'inactive') return true;

    // 3. If teacher deletion: check if student has already been reassigned to a different teacher
    if (entityType === 'teacher' && entity) {
      const teacher = entity as Teacher;
      const stillDirectlyAssigned =
        student.assignedTeacherId === teacher.id ||
        student.assignedTeacherId === teacher.teacherId;
      if (!stillDirectlyAssigned && student.assignedTeacherId) {
        return true;
      }
    }

    // 4. If admin deletion: check if student has already been reassigned to a different admin
    if (entityType === 'admin' && entity) {
      const admin = entity as AdminUser;
      const stillAssigned = student.assignedAdminId === admin.id || student.assignedAdminId === admin.userId;
      if (!stillAssigned && student.assignedAdminId) {
        return true;
      }
    }

    return false;
  };

  const unhandledStudents = assignedStudents.filter((s) => !isStudentHandled(s));
  const canDeleteProceed = entityType === 'student' || unhandledStudents.length === 0;
  const isConfirmationWordValid = confirmationInput.trim() === 'DELETE';

  if (!isOpen || !entity) return null;

  // Handlers
  const handleDisableStudent = (student: Student) => {
    updateStudentStatus(student.id, 'inactive');
  };

  const handleEnableStudent = (student: Student) => {
    updateStudentStatus(student.id, 'active');
  };

  const handleTransferStudentToTeacher = (studentId: string, newTeacherId: string) => {
    if (!newTeacherId) return;
    const targetTeacher = teachers.find((t) => t.id === newTeacherId);
    if (!targetTeacher) return;
    transferStudentTeacher(studentId, newTeacherId);
    setTransferredStudentIds((prev) => ({ ...prev, [studentId]: targetTeacher.fullName }));
  };

  const handleTransferStudentToAdmin = (studentId: string, newAdminId: string) => {
    if (!newAdminId) return;
    const targetAdmin = admins.find((a) => a.id === newAdminId);
    if (!targetAdmin) return;
    transferStudentAdmin(studentId, newAdminId);
    setTransferredStudentIds((prev) => ({ ...prev, [studentId]: targetAdmin.fullName || targetAdmin.name }));
  };

  const handleBatchDisableAll = () => {
    unhandledStudents.forEach((s) => {
      updateStudentStatus(s.id, 'inactive');
    });
  };

  const handleBatchTransferAll = () => {
    if (entityType === 'teacher' && batchTeacherId) {
      const targetTeacher = teachers.find((t) => t.id === batchTeacherId);
      if (!targetTeacher) return;
      unhandledStudents.forEach((s) => {
        transferStudentTeacher(s.id, batchTeacherId);
        setTransferredStudentIds((prev) => ({ ...prev, [s.id]: targetTeacher.fullName }));
      });
    } else if (entityType === 'admin' && batchAdminId) {
      const targetAdmin = admins.find((a) => a.id === batchAdminId);
      if (!targetAdmin) return;
      unhandledStudents.forEach((s) => {
        transferStudentAdmin(s.id, batchAdminId);
        setTransferredStudentIds((prev) => ({ ...prev, [s.id]: targetAdmin.fullName || targetAdmin.name }));
      });
    }
  };

  const handleFinalDelete = () => {
    if (!canDeleteProceed || !isConfirmationWordValid) return;
    setIsDeleting(true);

    try {
      if (entityType === 'teacher') {
        deleteTeacher(entity.id);
      } else if (entityType === 'admin') {
        deleteAdmin(entity.id);
      } else if (entityType === 'student') {
        deleteStudent(entity.id);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Error during deletion:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const getEntityTitle = () => {
    if (entityType === 'teacher') {
      const t = entity as Teacher;
      return {
        name: t.fullName,
        sub: `Teacher ID: ${t.teacherId || t.id} • ${t.specialization || 'Quran Teacher'}`,
        urduType: 'استاد کو حذف کریں',
      };
    }
    if (entityType === 'admin') {
      const a = entity as AdminUser;
      return {
        name: a.fullName || a.name,
        sub: `Admin Email: ${a.email} • Role: Administrator`,
        urduType: 'ایڈمنسٹریٹر کو حذف کریں',
      };
    }
    const s = entity as Student;
    return {
      name: s.fullName,
      sub: `Student ID: ${s.studentId} • Course: ${s.courseId || 'General'}`,
      urduType: 'طالب علم کو حذف کریں',
    };
  };

  const titleInfo = getEntityTitle();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-red-600 to-rose-700 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">
                  Delete {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
                </h3>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">
                  {titleInfo.urduType}
                </span>
              </div>
              <p className="text-xs text-red-100 font-medium mt-0.5">
                Super Admin Security &amp; Safety Rule Enforced
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Target Entity Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900 text-base">{titleInfo.name}</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">{titleInfo.sub}</div>
            </div>
            <div className="text-end">
              <span className="inline-block px-2.5 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-lg uppercase tracking-wider">
                Target for deletion
              </span>
            </div>
          </div>

          {/* Teacher or Admin: Assigned Students Verification Step */}
          {entityType !== 'student' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h4 className="font-bold text-slate-900 text-sm">
                    Assigned Students ({assignedStudents.length}) / وابستہ طلباء
                  </h4>
                </div>
                <div>
                  {unhandledStudents.length === 0 ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      All Handled / تمام طلباء نمٹا دیے گئے
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      {unhandledStudents.length} Pending Action
                    </span>
                  )}
                </div>
              </div>

              {/* Requirement Rule Notice */}
              {assignedStudents.length > 0 && unhandledStudents.length > 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-950">
                    <Shield className="w-4 h-4 text-amber-600" />
                    <span>Mandatory Rule: Students Must Be Disabled or Transferred First</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    حذف کرنے سے پہلے ہر طالب علم کو غیر فعال (Disable) کریں یا کسی دوسرے {entityType === 'teacher' ? 'استاد' : 'ایڈمن'} کو منتقل (Transfer) کریں۔
                    تمام طلباء کو نمٹائے بغیر حذف کی اجازت نہیں ہوگی۔
                  </p>
                </div>
              ) : assignedStudents.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 flex items-center gap-2">
                  <Info className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>No students are currently assigned to this {entityType}. You can proceed with deletion directly.</span>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>All assigned students have been successfully Disabled or Transferred. Deletion is now unlocked!</span>
                </div>
              )}

              {/* Batch Actions Toolbar (if multiple unhandled students) */}
              {unhandledStudents.length > 1 && (
                <div className="bg-slate-100/80 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
                    Quick Batch Actions for All Remaining ({unhandledStudents.length}):
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleBatchDisableAll}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Disable All Remaining</span>
                    </button>

                    {entityType === 'teacher' && availableTeachers.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <select
                          value={batchTeacherId}
                          onChange={(e) => setBatchTeacherId(e.target.value)}
                          className="p-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 max-w-[180px]"
                        >
                          <option value="">Select target teacher...</option>
                          {availableTeachers.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.fullName}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          disabled={!batchTeacherId}
                          onClick={handleBatchTransferAll}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          <span>Transfer All</span>
                        </button>
                      </div>
                    )}

                    {entityType === 'admin' && availableAdmins.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <select
                          value={batchAdminId}
                          onChange={(e) => setBatchAdminId(e.target.value)}
                          className="p-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 max-w-[180px]"
                        >
                          <option value="">Select target admin...</option>
                          {availableAdmins.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.fullName || a.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          disabled={!batchAdminId}
                          onClick={handleBatchTransferAll}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          <span>Transfer All</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Student Rows List */}
              {assignedStudents.length > 0 && (
                <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                  {assignedStudents.map((student) => {
                    const isHandled = isStudentHandled(student);
                    const transferredToName = transferredStudentIds[student.id];

                    return (
                      <div
                        key={student.id}
                        className={`p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                          isHandled ? 'bg-emerald-50/40' : 'bg-white'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{student.fullName}</span>
                            <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                              {student.studentId}
                            </span>
                            {transferredToName ? (
                              <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <ArrowRightLeft className="w-2.5 h-2.5" />
                                Transferred to {transferredToName}
                              </span>
                            ) : student.status === 'inactive' ? (
                              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <XCircle className="w-2.5 h-2.5" />
                                Disabled (غیر فعال)
                              </span>
                            ) : (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Course: {student.courseId || 'Enrolled'} • Class: {student.classType === 'group' ? 'Group' : 'One-to-One'}
                          </div>
                        </div>

                        {/* Individual Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Disable / Enable Toggle */}
                          {student.status === 'active' ? (
                            <button
                              type="button"
                              onClick={() => handleDisableStudent(student)}
                              className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1"
                              title="Disable Student Account"
                            >
                              <UserX className="w-3 h-3 text-amber-700" />
                              <span>Disable</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleEnableStudent(student)}
                              className="px-2.5 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-[11px] font-semibold transition-colors"
                              title="Re-enable Student Account"
                            >
                              <span>Re-enable</span>
                            </button>
                          )}

                          {/* Transfer Dropdown */}
                          {entityType === 'teacher' && availableTeachers.length > 0 && (
                            <div className="flex items-center gap-1">
                              <select
                                defaultValue=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleTransferStudentToTeacher(student.id, e.target.value);
                                  }
                                }}
                                className="text-[11px] py-1 px-1.5 border border-slate-300 rounded-lg bg-white text-slate-700 max-w-[140px]"
                              >
                                <option value="" disabled>
                                  Transfer to...
                                </option>
                                {availableTeachers.map((t) => (
                                  <option key={t.id} value={t.id}>
                                    {t.fullName}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {entityType === 'admin' && availableAdmins.length > 0 && (
                            <div className="flex items-center gap-1">
                              <select
                                defaultValue=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleTransferStudentToAdmin(student.id, e.target.value);
                                  }
                                }}
                                className="text-[11px] py-1 px-1.5 border border-slate-300 rounded-lg bg-white text-slate-700 max-w-[140px]"
                              >
                                <option value="" disabled>
                                  Transfer to...
                                </option>
                                {availableAdmins.map((a) => (
                                  <option key={a.id} value={a.id}>
                                    {a.fullName || a.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Student Direct Deletion Notice */}
          {entityType === 'student' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-900 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-red-950">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Permanent Student Deletion / طالب علم کا مکمل اخراج</span>
              </div>
              <p className="text-[11px] text-red-800 leading-relaxed">
                Students can be deleted directly without transferring or disabling. This will remove their student record, portal login access, fee records, and group enrollments permanently.
              </p>
            </div>
          )}

          {/* Final Verification: Confirmation Word Input */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              canDeleteProceed
                ? 'bg-slate-50 border-slate-300'
                : 'bg-slate-100/60 border-slate-200 opacity-60 pointer-events-none'
            }`}
          >
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  Type <span className="text-red-600 font-mono font-black tracking-wider">DELETE</span> to confirm permanent deletion:
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  تصدیق کے لیے نیچے دیے گئے خانے میں <span className="font-bold font-mono">DELETE</span> لکھیں۔
                </p>
                <input
                  type="text"
                  value={confirmationInput}
                  onChange={(e) => setConfirmationInput(e.target.value)}
                  placeholder="Type DELETE here"
                  disabled={!canDeleteProceed}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-mono text-xs text-slate-900 focus:ring-2 focus:ring-red-200 focus:border-red-600 uppercase"
                />
              </div>

              {!canDeleteProceed && (
                <div className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Deletion locked until all {unhandledStudents.length} assigned students are Disabled or Transferred.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
          >
            Cancel / منسوخ کریں
          </button>

          <button
            type="button"
            onClick={handleFinalDelete}
            disabled={!canDeleteProceed || !isConfirmationWordValid || isDeleting}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs transition-all flex items-center gap-2 shadow-xs"
          >
            <Trash2 className="w-4 h-4" />
            <span>
              {isDeleting
                ? 'Deleting...'
                : `Confirm & Delete ${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
