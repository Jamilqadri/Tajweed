import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Teacher } from '../../types';
import {
  GraduationCap,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  Eye,
  Users,
  Layers,
  Calendar,
  Clock,
  X,
  BookOpen,
  Copy,
  Check,
  Phone,
  Mail,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { SuperAdminDeleteModal } from './SuperAdminDeleteModal';
import { TeacherGenderIcon } from '../common/TeacherGenderIcon';

export const TeachersTab: React.FC = () => {
  const { teachers, students, groups, courses, addTeacher, updateTeacher } = useApp();

  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [portfolioModal, setPortfolioModal] = useState<{ teacher: Teacher; activeTab: 'students' | 'groups' } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [address, setAddress] = useState('');
  const [qualification, setQualification] = useState('');
  const [tajweedQualification, setTajweedQualification] = useState('');
  const [experience, setExperience] = useState('');
  const [languages, setLanguages] = useState('English, Urdu, Arabic');
  const [specialization, setSpecialization] = useState('Hafs an Asim');
  const [initialPassword, setInitialPassword] = useState('teacher123');

  const resetForm = () => {
    setFullName('');
    setFatherName('');
    setMobile('');
    setWhatsapp('');
    setEmail('');
    setCity('');
    setState('');
    setAddress('');
    setQualification('');
    setTajweedQualification('');
    setExperience('');
    setInitialPassword('teacher123');
    setIsCreating(false);
    setEditingTeacher(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !mobile || !email) return;

    const cleanEmail = email.trim().toLowerCase();

    if (editingTeacher) {
      updateTeacher(editingTeacher.id, {
        fullName,
        fatherName,
        mobile,
        whatsapp,
        email: cleanEmail,
        gender,
        city,
        state,
        address,
        qualification,
        tajweedQualification,
        experience,
        languages: languages.split(',').map((s) => s.trim()),
        specialization,
        initialPassword: initialPassword || 'teacher123',
      });
    } else {
      addTeacher(
        {
          fullName,
          fatherName,
          profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          joiningDate: new Date().toISOString().split('T')[0],
          mobile,
          whatsapp: whatsapp || mobile,
          email: cleanEmail,
          gender,
          city,
          state,
          address,
          qualification,
          tajweedQualification,
          experience,
          languages: languages.split(',').map((s) => s.trim()),
          specialization,
          status: 'active',
          assignedStudentIds: [],
          assignedGroupIds: [],
          availableSlots: [
            { day: 'Mon-Sat', startTime: '06:00', endTime: '10:00', isBooked: false },
            { day: 'Mon-Sat', startTime: '18:00', endTime: '22:00', isBooked: false },
          ],
          initialPassword: initialPassword || 'teacher123',
        },
        initialPassword || 'teacher123'
      );
    }
    resetForm();
  };

  const startEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFullName(teacher.fullName);
    setFatherName(teacher.fatherName || '');
    setMobile(teacher.mobile);
    setWhatsapp(teacher.whatsapp || '');
    setEmail(teacher.email);
    setGender(teacher.gender || 'male');
    setCity(teacher.city || '');
    setState(teacher.state || '');
    setAddress(teacher.address || '');
    setQualification(teacher.qualification);
    setTajweedQualification(teacher.tajweedQualification);
    setExperience(teacher.experience);
    setLanguages(teacher.languages.join(', '));
    setSpecialization(teacher.specialization);
    setInitialPassword(teacher.initialPassword || 'teacher123');
    setIsCreating(true);
  };

  const toggleTeacherStatus = (teacher: Teacher) => {
    updateTeacher(teacher.id, {
      status: teacher.status === 'active' ? 'inactive' : 'active',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & New Teacher Button */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-bold text-slate-900">Faculty & Teachers</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage certified instructors, review schedules, and track assigned student cohorts.
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
            <span>Add New Teacher</span>
          </button>
        )}
      </div>

      {/* Create / Edit Form Modal */}
      {isCreating && (
        <form
          onSubmit={handleSave}
          className="bg-white p-6 rounded-2xl border-2 border-blue-200 shadow-lg space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-bold text-slate-900 text-base">
              {editingTeacher ? 'Edit Teacher Profile' : 'Register New Certified Teacher'}
            </h4>
            <button type="button" onClick={resetForm} className="text-slate-400 hover:text-slate-700 p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Qari Muhammad Saeed"
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Father's Name</label>
              <input
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="e.g. Abdul Ghafoor"
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@kanzutajweed.com"
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Mobile *</label>
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="9876543210"
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">WhatsApp</label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="9876543210"
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900"
              />
            </div>

            {/* Custom Credentials Section */}
            <div className="sm:col-span-3 bg-blue-50/80 border border-blue-200 rounded-xl p-3.5">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-bold text-blue-900 text-xs">
                  Teacher Login Credentials / استاد کی لاگ ان اسناد
                </span>
                <span className="text-[10px] text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full font-medium">
                  Email = Login ID
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Login ID (ای میل لاگ ان آئی ڈی)
                  </label>
                  <div className="w-full p-2.5 rounded-lg border border-blue-200 bg-white text-slate-700 font-mono text-xs flex items-center justify-between">
                    <span className="truncate">{email.trim() || 'teacher.email@kanzutajweed.com'}</span>
                    <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium">Fixed to Email</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    استاد کا لاگ ان آئی ڈی ان کی ای میل ہوگی (کوئی الگ یوزر آئی ڈی نہیں ہے)
                  </p>
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Initial Password / ابتدائی پاسورڈ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={initialPassword}
                    onChange={(e) => setInitialPassword(e.target.value)}
                    placeholder="e.g. teacher123 or strong password"
                    className="w-full p-2.5 rounded-lg border border-blue-300 bg-white text-slate-900 font-mono text-xs focus:ring-2 focus:ring-blue-200"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    ایڈمن استاد کے لیے ابتدائی پاسورڈ مقرر کرے (بعد میں تبدیل کیا جا سکتا ہے)
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">General Qualification</label>
              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="e.g. Fazil-e-Dars-e-Nizami / M.A Islamic Studies"
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tajweed Sanad / Ijazah</label>
              <input
                type="text"
                value={tajweedQualification}
                onChange={(e) => setTajweedQualification(e.target.value)}
                placeholder="e.g. Sanad Muttasil in Hafs an Asim"
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Teaching Experience</label>
              <input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="e.g. 8 Years"
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Languages Spoken</label>
              <input
                type="text"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                placeholder="e.g. Urdu, English, Arabic"
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Specialization</label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g. Noorani Qaida & Phonetics"
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">City & State</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Hyderabad"
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
              {editingTeacher ? 'Save Changes' : 'Register Teacher'}
            </button>
          </div>
        </form>
      )}

      {/* Teachers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {teachers.map((teacher) => {
          const directStudents = students.filter((s) => s.assignedTeacherId === teacher.id);
          const teacherGroups = groups.filter((g) => g.teacherId === teacher.id);
          const groupStudents = students.filter(
            (s) =>
              s.assignedGroupId &&
              teacherGroups.some(
                (g) =>
                  g.id === s.assignedGroupId ||
                  (g.studentIds && (g.studentIds.includes(s.id) || g.studentIds.includes(s.studentId)))
              ) &&
              !directStudents.some((ds) => ds.id === s.id)
          );
          const allTeacherStudents = [...directStudents, ...groupStudents];

          return (
            <div
              key={teacher.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:border-blue-400 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={teacher.profilePhoto}
                        alt={teacher.fullName}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-blue-600"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs">
                        <TeacherGenderIcon
                          gender={teacher.gender}
                          teacherName={teacher.fullName}
                          size={15}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-slate-900 text-base">{teacher.fullName}</h4>
                        <TeacherGenderIcon
                          gender={teacher.gender}
                          teacherName={teacher.fullName}
                          variant="badge"
                          size={13}
                        />
                      </div>
                      <span className="text-xs text-blue-600 font-medium">{teacher.specialization}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleTeacherStatus(teacher)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      teacher.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {teacher.status === 'active' ? 'Active' : 'Inactive'}
                  </button>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                  <div><strong>Sanad:</strong> {teacher.tajweedQualification}</div>
                  <div><strong>Experience:</strong> {teacher.experience}</div>
                  <div><strong>Languages:</strong> {teacher.languages.join(', ')}</div>
                </div>

                {/* Login Credentials Box */}
                <div className="mt-3 bg-blue-50/70 border border-blue-100 rounded-xl p-3 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-950 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      <span>Login ID (Email):</span>
                    </span>
                    <span className="font-medium text-slate-800 text-[11px] truncate max-w-[160px]" title={teacher.email}>
                      {teacher.email}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Password:</span>
                    </span>
                    <span className="font-mono font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-blue-100 text-[11px]">
                      {teacher.initialPassword || 'teacher123'}
                    </span>
                  </div>
                  <div className="pt-1.5 border-t border-blue-100/70 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        const creds = `Kanz-ul-Tajweed Teacher Login:\nLogin ID (Email): ${teacher.email}\nPassword: ${teacher.initialPassword || 'teacher123'}`;
                        navigator.clipboard.writeText(creds);
                        setCopiedId(teacher.id);
                        setTimeout(() => setCopiedId(null), 2500);
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 px-2 py-0.5 rounded hover:bg-blue-100/60 transition-colors"
                    >
                      {copiedId === teacher.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Login Info</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Interactive Counts & Portfolio Trigger */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={() => setPortfolioModal({ teacher, activeTab: 'students' })}
                    className="p-3 bg-blue-50/80 hover:bg-blue-100 rounded-xl transition-all border border-blue-200/80 text-center group cursor-pointer shadow-2xs hover:shadow-xs"
                    title="Click to view assigned students details / طلباء کی تفصیلات دیکھیں"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                      <span className="text-xl font-black text-blue-950">{allTeacherStudents.length}</span>
                    </div>
                    <div className="text-[11px] text-blue-800 font-bold mt-0.5">Assigned Students</div>
                    <div className="text-[10px] text-blue-600 font-medium group-hover:underline">تفصیلات دیکھیں &larr;</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPortfolioModal({ teacher, activeTab: 'groups' })}
                    className="p-3 bg-indigo-50/80 hover:bg-indigo-100 rounded-xl transition-all border border-indigo-200/80 text-center group cursor-pointer shadow-2xs hover:shadow-xs"
                    title="Click to view running groups details / گروپس کی تفصیلات دیکھیں"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <Layers className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                      <span className="text-xl font-black text-indigo-950">{teacherGroups.length}</span>
                    </div>
                    <div className="text-[11px] text-indigo-800 font-bold mt-0.5">Assigned Groups</div>
                    <div className="text-[10px] text-indigo-600 font-medium group-hover:underline">تفصیلات دیکھیں &larr;</div>
                  </button>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPortfolioModal({ teacher, activeTab: 'students' })}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1.5 bg-blue-50 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Students & Groups (تفصیل)</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectedTeacher(teacher)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Teaching Slots"
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(teacher)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Teacher"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingTeacher(teacher)}
                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Teacher"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Teacher Schedule & Full Profile Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in duration-150">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img
                    src={selectedTeacher.profilePhoto}
                    alt={selectedTeacher.fullName}
                    className="w-10 h-10 rounded-xl object-cover border border-blue-500"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs">
                    <TeacherGenderIcon
                      gender={selectedTeacher.gender}
                      teacherName={selectedTeacher.fullName}
                      size={13}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base">{selectedTeacher.fullName}</h4>
                    <TeacherGenderIcon
                      gender={selectedTeacher.gender}
                      teacherName={selectedTeacher.fullName}
                      variant="badge"
                      size={13}
                    />
                  </div>
                  <p className="text-xs text-slate-400">{selectedTeacher.specialization}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTeacher(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div><strong>Email:</strong> {selectedTeacher.email}</div>
                <div><strong>Mobile:</strong> {selectedTeacher.mobile}</div>
                <div><strong>WhatsApp:</strong> {selectedTeacher.whatsapp}</div>
                <div><strong>City:</strong> {selectedTeacher.city}</div>
                <div><strong>Qualification:</strong> {selectedTeacher.qualification}</div>
                <div><strong>Tajweed Sanad:</strong> {selectedTeacher.tajweedQualification}</div>
              </div>

              {/* Time Slots & Schedule */}
              <div>
                <h5 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Availability & Teaching Slots</span>
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  {(selectedTeacher.availableSlots || [
                    { day: 'Mon-Sat', startTime: '06:00', endTime: '10:00', isBooked: false },
                    { day: 'Mon-Sat', startTime: '18:00', endTime: '22:00', isBooked: false },
                  ]).map((slot, idx) => {
                    const isObj = typeof slot === 'object' && slot !== null;
                    const slotObj = isObj ? (slot as any) : null;
                    const day = slotObj ? slotObj.day : 'Daily';
                    const timeRange = slotObj ? `${slotObj.startTime} – ${slotObj.endTime}` : String(slot);
                    const isBooked = slotObj ? Boolean(slotObj.isBooked) : false;

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border flex items-center justify-between ${
                          isBooked
                            ? 'bg-amber-50 border-amber-200 text-amber-900'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        }`}
                      >
                        <div>
                          <div className="font-bold">{day}</div>
                          <div className="text-[11px]">{timeRange}</div>
                        </div>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white">
                          {isBooked ? 'Booked' : 'Available'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTeacher(null)}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Portfolio & Assigned Students / Groups Detailed Breakdown Modal */}
      {portfolioModal && (() => {
        const modalTeacher = portfolioModal.teacher;
        const modalDirectStudents = students.filter((s) => s.assignedTeacherId === modalTeacher.id);
        const modalTeacherGroups = groups.filter((g) => g.teacherId === modalTeacher.id);
        const modalGroupStudents = students.filter(
          (s) =>
            s.assignedGroupId &&
            modalTeacherGroups.some(
              (g) =>
                g.id === s.assignedGroupId ||
                (g.studentIds && (g.studentIds.includes(s.id) || g.studentIds.includes(s.studentId)))
            ) &&
            !modalDirectStudents.some((ds) => ds.id === s.id)
        );
        const modalAllStudents = [...modalDirectStudents, ...modalGroupStudents];

        return (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in duration-150">
              {/* Header */}
              <div className="bg-slate-900 text-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <img
                        src={modalTeacher.profilePhoto}
                        alt={modalTeacher.fullName}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-500 shadow-md"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs">
                        <TeacherGenderIcon
                          gender={modalTeacher.gender}
                          teacherName={modalTeacher.fullName}
                          size={16}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold">{modalTeacher.fullName}</h3>
                        <TeacherGenderIcon
                          gender={modalTeacher.gender}
                          teacherName={modalTeacher.fullName}
                          variant="badge"
                          size={13}
                        />
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          modalTeacher.status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {modalTeacher.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-xs text-blue-400 font-medium">{modalTeacher.specialization} • {modalTeacher.tajweedQualification}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Experience: {modalTeacher.experience} | Sanad: {modalTeacher.qualification}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPortfolioModal(null)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Teacher Login Credentials Banner */}
                <div className="mt-4 bg-slate-800/90 border border-slate-700 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-4 text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-slate-400">Login Email:</span>
                      <strong className="text-white font-mono">{modalTeacher.email}</strong>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-slate-400">Teacher ID:</span>
                      <strong className="text-indigo-300 font-mono">{modalTeacher.teacherId}</strong>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-slate-400">Password:</span>
                      <strong className="text-amber-300 font-mono">{modalTeacher.initialPassword || 'teacher123'}</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const text = `Kanz-ul-Tajweed Teacher Login:\nEmail: ${modalTeacher.email}\nPassword: ${modalTeacher.initialPassword || 'teacher123'}\nTeacher ID: ${modalTeacher.teacherId}`;
                      navigator.clipboard.writeText(text);
                      setCopiedId(modalTeacher.id);
                      setTimeout(() => setCopiedId(null), 2500);
                    }}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    {copiedId === modalTeacher.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Login Credentials</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPortfolioModal({ teacher: modalTeacher, activeTab: 'students' })}
                  className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                    portfolioModal.activeTab === 'students'
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Assigned Students (زیرِ تعلیم طلباء)</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    portfolioModal.activeTab === 'students' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {modalAllStudents.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPortfolioModal({ teacher: modalTeacher, activeTab: 'groups' })}
                  className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                    portfolioModal.activeTab === 'groups'
                      ? 'border-indigo-600 text-indigo-700'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Running Groups (فعال گروپس)</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    portfolioModal.activeTab === 'groups' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {modalTeacherGroups.length}
                  </span>
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {portfolioModal.activeTab === 'students' ? (
                  <div className="space-y-4">
                    {modalAllStudents.length === 0 ? (
                      <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-bold text-slate-700">No Students Currently Assigned</p>
                        <p className="text-xs text-slate-500 mt-1">
                          اس استاد کے پاس فی الوقت کوئی طالب علم تفویض نہیں ہے۔ ایڈمشنز ٹیب سے طالب علم تفویض کریں۔
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {modalAllStudents.map((std) => {
                          const stdCourse = courses.find((c) => c.id === (std.assignedCourseId || std.courseId));
                          const stdGroup = groups.find((g) => g.id === std.assignedGroupId);
                          const isDirect = std.assignedTeacherId === modalTeacher.id;

                          return (
                            <div
                              key={std.id}
                              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition-all space-y-2"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-[10px] font-black text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                      {std.studentId}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      std.classType === 'one_to_one' ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'
                                    }`}>
                                      {std.classType === 'one_to_one' ? 'One-to-One' : 'Group Class'}
                                    </span>
                                  </div>
                                  <h4 className="font-bold text-slate-900 text-sm mt-1">{std.fullName}</h4>
                                  <p className="text-[11px] text-slate-500">S/O {std.fatherName} • {std.city || 'Pakistan'}</p>
                                </div>

                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  std.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {std.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                              </div>

                              <div className="bg-slate-50 p-2.5 rounded-lg text-xs space-y-1 text-slate-600">
                                <div><strong>Course:</strong> {stdCourse?.name || 'Tajweed ul Quran'}</div>
                                {std.classType === 'group' && stdGroup && (
                                  <div><strong>Group:</strong> <span className="text-indigo-700 font-semibold">{stdGroup.name}</span></div>
                                )}
                                <div>
                                  <strong>Class Timing:</strong>{' '}
                                  {std.oneToOneSchedule
                                    ? `${std.oneToOneSchedule.days?.join(', ')} @ ${std.oneToOneSchedule.time}`
                                    : (stdGroup ? `${stdGroup.scheduleDays?.join(', ') || stdGroup.days?.join(', ') || 'Weekly'} @ ${stdGroup.scheduleTime || stdGroup.startTime || '19:00'}` : (std.preferredTime || std.oneToOneSlot || 'Evening'))}
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-xs pt-1">
                                <span className="text-slate-500 font-mono text-[11px]">{std.mobile}</span>
                                {std.whatsapp && (
                                  <a
                                    href={`https://wa.me/${std.whatsapp.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    <span>WhatsApp</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {modalTeacherGroups.length === 0 ? (
                      <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-bold text-slate-700">No Groups Currently Assigned</p>
                        <p className="text-xs text-slate-500 mt-1">
                          اس استاد کے پاس فی الوقت کوئی گروپ تفویض نہیں ہے۔
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {modalTeacherGroups.map((grp) => {
                          const grpCourse = courses.find((c) => c.id === grp.courseId);
                          const enrolledStudents = students.filter(
                            (s) =>
                              s.assignedGroupId === grp.id ||
                              (grp.studentIds && (grp.studentIds.includes(s.id) || grp.studentIds.includes(s.studentId)))
                          );
                          const capacity = grp.maxCapacity || grp.capacity || 10;
                          const currentCount = enrolledStudents.length;
                          const fillPercent = Math.min(100, Math.round((currentCount / capacity) * 100));

                          return (
                            <div
                              key={grp.id}
                              className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-all space-y-4"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-slate-900 text-base">{grp.name}</h4>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                      {grpCourse?.name || 'Tajweed Group'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Schedule: {grp.scheduleDays?.join(', ') || grp.days?.join(', ') || 'Weekly'} @ {grp.scheduleTime || grp.startTime || '19:00'} - {grp.endTime || '19:45'}</span>
                                  </p>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className="text-end">
                                    <div className="text-sm font-black text-slate-900">
                                      {currentCount} / {capacity}
                                    </div>
                                    <div className="text-[10px] text-slate-500">Students Enrolled</div>
                                  </div>
                                  {grp.meetLink && (
                                    <a
                                      href={grp.meetLink}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                      <span>Google Meet</span>
                                    </a>
                                  )}
                                </div>
                              </div>

                              {/* Capacity Bar */}
                              <div>
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      fillPercent >= 100 ? 'bg-amber-500' : 'bg-indigo-600'
                                    }`}
                                    style={{ width: `${fillPercent}%` }}
                                  />
                                </div>
                              </div>

                              {/* Enrolled Students inside this Group */}
                              <div className="pt-3 border-t border-slate-100">
                                <h5 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Enrolled Students in this Group ({enrolledStudents.length}):</span>
                                </h5>

                                {enrolledStudents.length === 0 ? (
                                  <p className="text-xs text-slate-400 italic">No students enrolled yet in this group.</p>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                    {enrolledStudents.map((std) => (
                                      <div
                                        key={std.id}
                                        className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                                      >
                                        <div>
                                          <div className="font-bold text-slate-900">{std.fullName}</div>
                                          <div className="font-mono text-[10px] text-blue-600">{std.studentId}</div>
                                        </div>
                                        {std.whatsapp && (
                                          <a
                                            href={`https://wa.me/${std.whatsapp.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-emerald-600 hover:text-emerald-700 p-1"
                                            title="Chat on WhatsApp"
                                          >
                                            <MessageCircle className="w-3.5 h-3.5" />
                                          </a>
                                        )}
                                      </div>
                                    ))}
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
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Total Active Capacity: {modalAllStudents.length} Students across {modalTeacherGroups.length} Groups
                </p>
                <button
                  type="button"
                  onClick={() => setPortfolioModal(null)}
                  className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-colors"
                >
                  Close / بند کریں
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Super Admin Delete Modal for Teacher */}
      <SuperAdminDeleteModal
        isOpen={!!deletingTeacher}
        onClose={() => setDeletingTeacher(null)}
        entityType="teacher"
        entity={deletingTeacher}
      />
    </div>
  );
};
