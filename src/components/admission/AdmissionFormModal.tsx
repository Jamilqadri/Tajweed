import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  CheckCircle2,
  Copy,
  BookOpen,
  Calendar,
  Phone,
  User,
  MapPin,
  Clock,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { ClassType } from '../../types';

interface AdmissionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

export const AdmissionFormModal: React.FC<AdmissionFormModalProps> = ({
  isOpen,
  onClose,
  onOpenLogin,
}) => {
  const { t, courses, submitAdmission, language } = useApp();

  const [fullName, setFullName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [address, setAddress] = useState('');
  const [courseId, setCourseId] = useState(courses[0]?.id || 'course_1');
  const [classType, setClassType] = useState<ClassType>('group');
  const [preferredTime, setPreferredTime] = useState('Evening (7:00 PM - 8:00 PM)');
  const [previousKnowledge, setPreviousKnowledge] = useState('Can read Arabic without Tajweed rules');
  const [additionalNote, setAdditionalNote] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<{
    studentId: string;
    initialPassword: string;
    fullName: string;
  } | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !fatherName || !mobile || !city) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const res = submitAdmission({
        fullName,
        fatherName,
        mobile,
        whatsapp: whatsapp || mobile,
        dob: dob || '2005-01-01',
        gender,
        city,
        state: state || 'N/A',
        address: address || city,
        courseId,
        classType,
        preferredTime,
        previousKnowledge,
        additionalNote,
      });

      setSubmittedResult({
        studentId: res.studentId,
        initialPassword: res.initialPassword,
        fullName,
      });
      setIsSubmitting(false);
    }, 600);
  };

  const handleCopyId = () => {
    if (submittedResult?.studentId) {
      navigator.clipboard.writeText(submittedResult.studentId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const resetForm = () => {
    setFullName('');
    setFatherName('');
    setMobile('');
    setWhatsapp('');
    setDob('');
    setCity('');
    setState('');
    setAddress('');
    setAdditionalNote('');
    setSubmittedResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 text-white p-6 sm:p-8 relative">
          <button
            type="button"
            onClick={resetForm}
            className="absolute top-5 end-5 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold mb-3 border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>KANZ UT TAJWEED ACADEMY</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t('admissionFormTitle')}
          </h2>
          <p className="mt-1 text-blue-100 text-sm sm:text-base">
            {t('admissionFormSubtitle')}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
          {submittedResult ? (
            /* Success State */
            <div className="text-center py-6 sm:py-8 space-y-6 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  {t('admissionSuccessTitle')}
                </h3>
                <p className="text-slate-600 text-sm mt-1 max-w-md mx-auto">
                  {t('admissionSuccessDesc')}
                </p>
              </div>

              {/* Student Credentials Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-md mx-auto text-start space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-blue-200/60">
                  <div>
                    <span className="text-xs font-medium text-blue-700 uppercase tracking-wider block">
                      {t('yourGeneratedStudentId')}
                    </span>
                    <span className="text-2xl font-extrabold text-blue-900 tracking-wider">
                      {submittedResult.studentId}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-blue-700 border border-blue-300 hover:bg-blue-100 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedId ? 'Copied!' : 'Copy ID'}</span>
                  </button>
                </div>

                <div>
                  <span className="text-xs font-medium text-slate-600 block">
                    {t('yourInitialPassword')}
                  </span>
                  <span className="font-mono text-lg font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-blue-200 inline-block mt-1">
                    {submittedResult.initialPassword}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Keep this ID and password safe. You can change your password anytime after login.
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-2 text-xs text-blue-800 bg-blue-100/70 p-2.5 rounded-lg">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-blue-600" />
                  <span>{t('googleSheetSyncNotice')}</span>
                </div>
              </div>

              {/* Next Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    onOpenLogin();
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-500/20 transition-all"
                >
                  <span>{t('studentLogin')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  {t('close')}
                </button>
              </div>
            </div>
          ) : (
            /* Application Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Personal Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-base border-b border-slate-200 pb-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Personal & Guardian Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('fullName')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Abdullah Khan"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('fatherGuardianName')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      placeholder="e.g. Tariq Khan"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('mobileNumber')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="e.g. 9876543210 (10 digits)"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900"
                    />
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      Last 6 digits will be your initial portal password
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('whatsappNumber')}
                    </label>
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="Leave blank if same as mobile"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('dateOfBirth')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('gender')} <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setGender('male')}
                        className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                          gender === 'male'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {t('male')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender('female')}
                        className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                          gender === 'female'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {t('female')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Address & Location */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-base border-b border-slate-200 pb-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span>Location Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('city')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Hyderabad / London"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('state')}
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Telangana"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('address')}
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street, locality, area details"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Course & Class Type Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-base border-b border-slate-200 pb-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span>Academic Course & Class Type</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Select Course */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('selectCourse')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={courseId}
                      onChange={(e) => setCourseId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 bg-white"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.duration} • ₹{c.fee}/mo)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Class Type: Exactly Two Options */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('classType')} <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setClassType('group')}
                        className={`p-2.5 text-xs font-semibold rounded-lg border text-center transition-all ${
                          classType === 'group'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-bold">{t('groupClass')}</div>
                        <div className="text-[10px] opacity-80 mt-0.5">Interactive peers</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setClassType('one_to_one')}
                        className={`p-2.5 text-xs font-semibold rounded-lg border text-center transition-all ${
                          classType === 'one_to_one'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-bold">{t('oneToOneClass')}</div>
                        <div className="text-[10px] opacity-80 mt-0.5">Personal teacher</div>
                      </button>
                    </div>
                  </div>

                  {/* Preferred Time */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('preferredTime')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 bg-white"
                    >
                      <option value="Morning (7:00 AM - 8:00 AM)">Morning (7:00 AM - 8:00 AM)</option>
                      <option value="Morning (9:00 AM - 10:00 AM)">Morning (9:00 AM - 10:00 AM)</option>
                      <option value="Afternoon (3:00 PM - 4:00 PM)">Afternoon (3:00 PM - 4:00 PM)</option>
                      <option value="Evening (5:00 PM - 6:00 PM)">Evening (5:00 PM - 6:00 PM)</option>
                      <option value="Evening (7:00 PM - 8:00 PM)">Evening (7:00 PM - 8:00 PM)</option>
                      <option value="Night (8:30 PM - 9:30 PM)">Night (8:30 PM - 9:30 PM)</option>
                    </select>
                  </div>

                  {/* Previous Knowledge */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('previousKnowledge')}
                    </label>
                    <select
                      value={previousKnowledge}
                      onChange={(e) => setPreviousKnowledge(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 bg-white"
                    >
                      <option value="Beginner (Cannot read Arabic)">{t('knowledgeNone')}</option>
                      <option value="Can read Arabic without Tajweed rules">{t('knowledgeBasic')}</option>
                      <option value="Familiar with basic Tajweed rules">{t('knowledgeIntermediate')}</option>
                      <option value="Advanced recitation / memorization in progress">{t('knowledgeAdvanced')}</option>
                    </select>
                  </div>

                  {/* Additional Note */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('additionalNote')}
                    </label>
                    <textarea
                      rows={2}
                      value={additionalNote}
                      onChange={(e) => setAdditionalNote(e.target.value)}
                      placeholder="Any specific goals, timing adjustments, or language preferences..."
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-sm"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Submitting Application...' : t('submitAdmission')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
