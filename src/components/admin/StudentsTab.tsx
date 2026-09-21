import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  BookOpen,
  Phone,
  User,
  GraduationCap,
  Layers,
  Clock,
  X,
  CreditCard,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { SuperAdminDeleteModal } from './SuperAdminDeleteModal';
import { TeacherGenderIcon } from '../common/TeacherGenderIcon';

export const StudentsTab: React.FC = () => {
  const { students, courses, teachers, groups, updateStudentStatus, transferStudentTeacher } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [reassigningStudent, setReassigningStudent] = useState<Student | null>(null);
  const [selectedNewTeacherId, setSelectedNewTeacherId] = useState<string>('');

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.mobile.includes(searchTerm);
    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    return s.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-bold text-slate-900">Student Directory</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse enrolled students, monitor attendance schedules, and check fee status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute inset-y-0 start-3 my-auto text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, name, mobile..."
              className="w-full ps-9 pe-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold text-slate-700"
          >
            <option value="all">All Statuses ({students.length})</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 text-start">Student Details</th>
                <th className="py-3.5 px-4 text-start">Enrolled Course</th>
                <th className="py-3.5 px-4 text-start">Format / Group</th>
                <th className="py-3.5 px-4 text-start">Assigned Teacher</th>
                <th className="py-3.5 px-4 text-center">Fee Status</th>
                <th className="py-3.5 px-4 text-center">Account Status</th>
                <th className="py-3.5 px-4 text-end">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No students match your criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const course = courses.find((c) => c.id === student.courseId);
                  const teacher = teachers.find((t) => t.id === student.assignedTeacherId);
                  const group = student.groupId ? groups.find((g) => g.id === student.groupId) : null;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0">
                            {student.fullName[0]}
                          </div>
                          <div>
                            <div className="font-mono font-bold text-blue-700">{student.studentId}</div>
                            <div className="font-bold text-slate-900">{student.fullName}</div>
                            <div className="text-[11px] text-slate-400">{student.mobile}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{course?.name || 'Assigned Course'}</div>
                        <div className="text-[11px] text-slate-500">Joined: {student.admissionDate}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        {student.classType === 'group' ? (
                          <div>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              Group Class
                            </span>
                            <div className="text-[11px] font-medium text-slate-700 mt-0.5">
                              {group?.name || 'Assigned Group'}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              One-to-One
                            </span>
                            <div className="text-[11px] text-slate-500 mt-0.5">{student.oneToOneSlot || 'Custom slot'}</div>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {teacher ? (
                          <div className="flex items-center gap-2">
                            <div className="relative shrink-0">
                              <img
                                src={teacher.profilePhoto}
                                alt={teacher.fullName}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-2xs">
                                <TeacherGenderIcon
                                  gender={teacher.gender}
                                  teacherName={teacher.fullName}
                                  size={10}
                                />
                              </div>
                            </div>
                            <span className="font-semibold text-slate-800">{teacher.fullName}</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                            Teacher: Not Assigned
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            student.feeStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {student.feeStatus === 'paid' ? 'PAID' : 'PENDING'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            updateStudentStatus(
                              student.id,
                              student.status === 'active' ? 'inactive' : 'active'
                            )
                          }
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                            student.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {student.status === 'active' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-slate-400" />
                              <span>Inactive</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-end">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setReassigningStudent(student);
                              setSelectedNewTeacherId(student.assignedTeacherId || teachers[0]?.id || '');
                            }}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Reassign Teacher (استاد کی تبدیلی)"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedStudent(student)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Profile Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingStudent(student)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Profile Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in duration-150">
            <div className="bg-blue-900 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-xs text-blue-300 font-bold uppercase">Student Profile</span>
                <h4 className="text-lg font-bold">{selectedStudent.fullName}</h4>
                <p className="text-xs text-blue-200 font-mono">ID: {selectedStudent.studentId}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block font-medium">Father / Guardian</span>
                  <span className="font-bold text-slate-900">{selectedStudent.fatherName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Gender</span>
                  <span className="font-bold text-slate-900 capitalize">{selectedStudent.gender}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Age</span>
                  <span className="font-bold text-slate-900">{selectedStudent.age ? `${selectedStudent.age} years` : 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Mobile Number</span>
                  <span className="font-bold text-slate-900">{selectedStudent.mobile}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">WhatsApp Number</span>
                  <span className="font-bold text-slate-900">{selectedStudent.whatsapp}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">State & District</span>
                  <span className="font-bold text-slate-900">{selectedStudent.district ? `${selectedStudent.district}, ${selectedStudent.state}` : `${selectedStudent.city}, ${selectedStudent.state}`}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Full Address</span>
                  <span className="font-bold text-slate-900">{selectedStudent.address}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/80 border border-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-950 text-sm">Student Portal Login Credentials</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                    {selectedStudent.hasChangedPassword ? 'Custom Password' : 'Initial Password Active'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-700 text-xs">
                  <div>
                    <span className="text-slate-500 block">Login Student ID:</span>
                    <span className="font-mono font-bold text-purple-900 bg-white px-2 py-0.5 rounded border border-purple-200 inline-block">
                      {selectedStudent.studentId}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Password:</span>
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-purple-200 inline-block">
                      {selectedStudent.hasChangedPassword
                        ? '•••••••• (Changed by Student)'
                        : selectedStudent.mobile.replace(/\D/g, '').slice(-6) || '123456'}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500">
                  ابتدائی پاسورڈ موبائل کے آخری 6 ہندسے ہے۔ طالب علم کے تبدیل کرنے کے بعد صرف نیا پاسورڈ کام کرے گا۔
                </p>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
                <div className="font-bold text-blue-900 text-sm">Academic & Fee Details</div>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-500 block">Class Type:</span>
                    <span className="font-bold capitalize">{selectedStudent.classType.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Assigned Teacher:</span>
                    {teachers.find((t) => t.id === selectedStudent.assignedTeacherId) ? (
                      <span className="font-bold text-slate-900 inline-flex items-center gap-1.5 mt-0.5">
                        <TeacherGenderIcon
                          gender={teachers.find((t) => t.id === selectedStudent.assignedTeacherId)?.gender}
                          teacherName={teachers.find((t) => t.id === selectedStudent.assignedTeacherId)?.fullName}
                          size={13}
                        />
                        <span>{teachers.find((t) => t.id === selectedStudent.assignedTeacherId)?.fullName}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                        Teacher: Not Assigned
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500 block">Monthly Tuition Fee:</span>
                    <span className="font-bold text-blue-900">
                      ₹{selectedStudent.fee || selectedStudent.monthlyFee || (selectedStudent.classType === 'group' ? 500 : 1000)} / mo
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Fee Status:</span>
                    <span className="font-bold uppercase text-emerald-700">{selectedStudent.feeStatus}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Preferred Time:</span>
                    <span className="font-bold">{selectedStudent.preferredTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Admission Date:</span>
                    <span className="font-bold">{selectedStudent.admissionDate}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const s = selectedStudent;
                  setSelectedStudent(null);
                  setDeletingStudent(s);
                }}
                className="px-3.5 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Student</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reassign Teacher Modal */}
      {reassigningStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in duration-150">
            <div className="bg-emerald-800 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-300 font-bold uppercase">Academic Management</span>
                <h4 className="text-lg font-bold">استاد کی تبدیلی / Reassign Teacher</h4>
                <p className="text-xs text-emerald-100 font-mono">
                  {reassigningStudent.fullName} ({reassigningStudent.studentId})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReassigningStudent(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!selectedNewTeacherId) return;
                transferStudentTeacher(reassigningStudent.id, selectedNewTeacherId);
                setReassigningStudent(null);
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="text-slate-500">طالب علم کا موجودہ استاد / Current Teacher:</div>
                <div className="font-bold text-slate-800 text-sm">
                  {teachers.find((t) => t.id === reassigningStudent.assignedTeacherId)?.fullName || 'Not Assigned'}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  نیا استاد منتخب کریں / Select New Teacher *
                </label>
                <select
                  required
                  value={selectedNewTeacherId}
                  onChange={(e) => setSelectedNewTeacherId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                >
                  <option value="" disabled>
                    -- استاد کا انتخاب کریں --
                  </option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.gender === 'female' ? '👩‍🏫 ' : '👨‍🏫 '}
                      {t.fullName} ({t.assignedStudentIds?.length || 0} طلباء)
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[11px] leading-relaxed">
                استاد کی تبدیلی سے طالب علم کی تمام کلاسز، گوگل میٹ سیشنز، اور حاضری خود بخود نئے استاد کے پورٹل پر منتقل ہو جائیں گی۔
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReassigningStudent(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  منسوخ کریں (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20"
                >
                  تبدیلی محفوظ کریں (Save Reassignment)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Super Admin Delete Modal for Student */}
      <SuperAdminDeleteModal
        isOpen={!!deletingStudent}
        onClose={() => setDeletingStudent(null)}
        entityType="student"
        entity={deletingStudent}
      />
    </div>
  );
};
