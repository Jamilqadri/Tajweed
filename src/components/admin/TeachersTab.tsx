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
} from 'lucide-react';

export const TeachersTab: React.FC = () => {
  const { teachers, students, groups, addTeacher, updateTeacher } = useApp();

  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

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
  const [customUserId, setCustomUserId] = useState('');
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
    setCustomUserId('');
    setInitialPassword('teacher123');
    setIsCreating(false);
    setEditingTeacher(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !mobile || !email) return;

    if (editingTeacher) {
      updateTeacher(editingTeacher.id, {
        fullName,
        fatherName,
        mobile,
        whatsapp,
        email,
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
          email,
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
        initialPassword || 'teacher123',
        customUserId.trim() || undefined
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
    setCustomUserId(teacher.teacherId || '');
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
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-blue-900 text-xs">
                  Login Credentials / لاگ ان یوزر آئی ڈی اور پاسورڈ
                </span>
                <span className="text-[10px] text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full font-medium">
                  Super Admin Configured
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Teacher User ID / یوزر آئی ڈی
                  </label>
                  <input
                    type="text"
                    value={customUserId}
                    onChange={(e) => setCustomUserId(e.target.value)}
                    placeholder="e.g. KT-TEA-04 or qari_ahmed (Leave blank to auto-generate)"
                    className="w-full p-2.5 rounded-lg border border-blue-300 bg-white text-slate-900 font-mono text-xs focus:ring-2 focus:ring-blue-200"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    ٹیچر کا لاگ ان یوزر آئی ڈی درج کریں یا خودکار تخلیق کے لیے خالی رہنے دیں
                  </p>
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Password / لاگ ان پاسورڈ <span className="text-red-500">*</span>
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
                    ٹیچر کے لیے اپنا منتخب کردہ پاسورڈ لکھیں (Default: teacher123)
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
          const assignedStudents = students.filter((s) => s.assignedTeacherId === teacher.id);
          const assignedGroups = groups.filter((g) => g.teacherId === teacher.id);

          return (
            <div
              key={teacher.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:border-blue-400 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={teacher.profilePhoto}
                      alt={teacher.fullName}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-blue-600"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{teacher.fullName}</h4>
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

                {/* Login Credentials Badge */}
                <div className="mt-3 bg-blue-50/60 border border-blue-100 rounded-xl p-2.5 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-bold text-blue-900 mb-1">
                    <span>Credentials / لاگ ان تفصیلات</span>
                    <span className="font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-[10px]">
                      {teacher.teacherId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span>Password / پاسورڈ:</span>
                    <span className="font-mono font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-blue-100">
                      {teacher.initialPassword || 'teacher123'}
                    </span>
                  </div>
                </div>

                {/* Counts */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <div className="text-lg font-black text-blue-900">{assignedStudents.length}</div>
                    <div className="text-[10px] text-slate-500 font-medium">Assigned Students</div>
                  </div>
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <div className="text-lg font-black text-indigo-900">{assignedGroups.length}</div>
                    <div className="text-[10px] text-slate-500 font-medium">Assigned Groups</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedTeacher(teacher)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Schedule</span>
                </button>

                <button
                  type="button"
                  onClick={() => startEdit(teacher)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
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
                <img
                  src={selectedTeacher.profilePhoto}
                  alt={selectedTeacher.fullName}
                  className="w-10 h-10 rounded-xl object-cover border border-blue-500"
                />
                <div>
                  <h4 className="font-bold text-base">{selectedTeacher.fullName}</h4>
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
    </div>
  );
};
