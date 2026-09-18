import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  CheckCircle2,
  Copy,
  Clock,
  Phone,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Users,
  UserCheck,
} from 'lucide-react';
import { ClassType } from '../../types';
import { ALL_INDIAN_STATES, INDIAN_STATES_AND_DISTRICTS } from '../../data/indiaLocationData';
import {
  calculate20MinEndTime,
  GROUP_CLASS_TIME_SLOTS,
  POPULAR_ONE_TO_ONE_START_TIMES,
  isWithinOneToOneWindow,
} from '../../utils/timeSlotCalculator';

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
  const { courses, submitAdmission } = useApp();

  // 1. Student Name
  const [studentName, setStudentName] = useState('');

  // 2. Father / Guardian Name
  const [fatherName, setFatherName] = useState('');

  // 3. Gender
  const [gender, setGender] = useState<'female' | 'male'>('female');

  // 4. WhatsApp Contact Number
  const [whatsapp, setWhatsapp] = useState('');

  // 5. Age
  const [age, setAge] = useState('');

  // 6. Select State
  const [selectedState, setSelectedState] = useState('');

  // 7. Select District (Auto-loaded based on selected state)
  const [selectedDistrict, setSelectedDistrict] = useState('');

  // 8. Full Address
  const [fullAddress, setFullAddress] = useState('');

  // 9. Select Course
  const defaultCourse =
    courses.find((c) => c.name.toLowerCase().includes('madani'))?.id ||
    courses[0]?.id ||
    'course_madani';
  const [selectedCourseId, setSelectedCourseId] = useState(defaultCourse);

  // 10. Class Type (Interactive Card Selector - like previous layout)
  const [classType, setClassType] = useState<ClassType>('group');

  // 11. Preferred Time Slot
  // Group Class (1 hour): 02:00 PM - 03:00 PM, 03:00 PM - 04:00 PM, 08:00 PM - 09:00 PM, 09:00 PM - 10:00 PM
  const [groupSlot, setGroupSlot] = useState<string>(GROUP_CLASS_TIME_SLOTS[0]);

  // One To One (20 min between 02:00 PM and 11:00 PM)
  // Dedicated Hour, Minute, AM/PM selectors + Auto-calculated End Time (+20 mins)
  const [selectedHour, setSelectedHour] = useState('03');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('PM');
  const [oneToOneStartTime, setOneToOneStartTime] = useState('03:00 PM');
  const [oneToOneEndTime, setOneToOneEndTime] = useState('03:20 PM');

  // Optional background details
  const [previousKnowledge, setPreviousKnowledge] = useState(
    'Can read Arabic without Tajweed rules'
  );
  const [additionalNote, setAdditionalNote] = useState('');

  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedResult, setSubmittedResult] = useState<{
    studentId: string;
    initialPassword: string;
    fullName: string;
    slot: string;
  } | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Auto-update districts whenever state changes
  const availableDistricts = useMemo(() => {
    if (!selectedState) return [];
    return INDIAN_STATES_AND_DISTRICTS[selectedState] || [];
  }, [selectedState]);

  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    const districts = INDIAN_STATES_AND_DISTRICTS[stateName] || [];
    setSelectedDistrict(districts[0] || '');
  };

  // Sync formatted start time and 20-minute end time whenever Hour, Minute, or AM/PM change
  useEffect(() => {
    const formatted = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;
    setOneToOneStartTime(formatted);
    const calculated = calculate20MinEndTime(formatted);
    setOneToOneEndTime(calculated);
  }, [selectedHour, selectedMinute, selectedPeriod]);

  const handleSelectPreset = (preset: string) => {
    const match = preset.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match) {
      setSelectedHour(match[1].padStart(2, '0'));
      setSelectedMinute(match[2]);
      setSelectedPeriod(match[3].toUpperCase() as 'AM' | 'PM');
    }
  };

  if (!isOpen) return null;

  const resolvedTimeSlot =
    classType === 'group'
      ? groupSlot
      : `${oneToOneStartTime || '03:00 PM'} - ${
          oneToOneEndTime || calculate20MinEndTime(oneToOneStartTime || '03:00 PM')
        } (20 mins)`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!studentName.trim()) {
      setErrorMessage('Please enter the student’s full name.');
      return;
    }
    if (!fatherName.trim()) {
      setErrorMessage('Please enter father or guardian name.');
      return;
    }
    if (!whatsapp.trim() || whatsapp.replace(/\D/g, '').length < 10) {
      setErrorMessage('Please enter a valid 10-digit WhatsApp contact number.');
      return;
    }
    if (!selectedState) {
      setErrorMessage('Please select your state.');
      return;
    }
    if (!selectedDistrict) {
      setErrorMessage('Please select your district.');
      return;
    }
    if (!fullAddress.trim()) {
      setErrorMessage('Please enter complete residential address with PIN code.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      try {
        const finalPreferredTime =
          classType === 'group'
            ? groupSlot
            : `${oneToOneStartTime.trim()} - ${oneToOneEndTime.trim()}`;

        const res = submitAdmission({
          fullName: studentName.trim(),
          fatherName: fatherName.trim(),
          gender,
          mobile: whatsapp.trim(),
          whatsapp: whatsapp.trim(),
          age: age.trim() ? parseInt(age.trim(), 10) || age.trim() : undefined,
          state: selectedState,
          district: selectedDistrict,
          city: selectedDistrict || selectedState,
          address: fullAddress.trim(),
          courseId: selectedCourseId,
          classType,
          preferredTime: finalPreferredTime,
          previousKnowledge,
          additionalNote: additionalNote.trim() || undefined,
        });

        setSubmittedResult({
          studentId: res.studentId,
          initialPassword: res.initialPassword,
          fullName: studentName.trim(),
          slot: finalPreferredTime,
        });
      } catch (err: any) {
        setErrorMessage(err?.message || 'Error processing admission application.');
      } finally {
        setIsSubmitting(false);
      }
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
    setStudentName('');
    setFatherName('');
    setGender('female');
    setWhatsapp('');
    setAge('');
    setSelectedState('');
    setSelectedDistrict('');
    setFullAddress('');
    setClassType('group');
    setGroupSlot(GROUP_CLASS_TIME_SLOTS[0]);
    setSelectedHour('03');
    setSelectedMinute('00');
    setSelectedPeriod('PM');
    setOneToOneStartTime('03:00 PM');
    setOneToOneEndTime('03:20 PM');
    setAdditionalNote('');
    setErrorMessage(null);
    setSubmittedResult(null);
    onClose();
  };

  const isOneToOneWindowWarning =
    classType === 'one_to_one' &&
    oneToOneStartTime &&
    !isWithinOneToOneWindow(oneToOneStartTime);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-4 text-left">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 text-white p-6 sm:p-7 relative">
          <button
            type="button"
            onClick={resetForm}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold mb-2.5 border border-blue-400/30">
            <span>KANZ UT TAJWEED ACADEMY</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Student Admission Application
          </h2>
          <p className="mt-1 text-blue-100 text-xs sm:text-sm">
            Please fill out all required details below to enroll in online Qur’an & Tajweed classes.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 max-h-[82vh] overflow-y-auto">
          {submittedResult ? (
            /* Success State */
            <div className="text-center py-6 space-y-6 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Admission Form Submitted Successfully!
                </h3>
                <p className="text-slate-600 text-sm mt-1 max-w-md mx-auto">
                  Your registration has been received. Your generated Student ID and initial credentials are shown below.
                </p>
              </div>

              {/* Generated Credentials Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-md mx-auto text-left space-y-3.5 shadow-xs">
                <div>
                  <span className="text-xs text-slate-500 font-medium block">
                    Student Name
                  </span>
                  <span className="text-base font-bold text-slate-900">
                    {submittedResult.fullName}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">
                      Assigned Student ID
                    </span>
                    <span className="text-xl font-mono font-bold text-blue-700">
                      {submittedResult.studentId}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium text-xs transition-colors border border-blue-200"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedId ? 'Copied!' : 'Copy ID'}</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-xs text-slate-500 font-medium block">
                    Initial Portal Password
                  </span>
                  <span className="text-lg font-mono font-bold text-emerald-700 tracking-wider">
                    {submittedResult.initialPassword}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Keep this ID and password safe. You can log in to your student dashboard anytime.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-xs text-slate-500 font-medium block">
                    Assigned Time Slot
                  </span>
                  <span className="text-xs font-semibold text-slate-800 bg-white px-2.5 py-1 rounded border border-slate-200 inline-block mt-0.5">
                    {submittedResult.slot}
                  </span>
                </div>

                <div className="pt-2 flex items-center gap-2 text-xs text-blue-800 bg-blue-100/70 p-2.5 rounded-lg">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-blue-600" />
                  <span>Your application details have been safely stored and synced with administration.</span>
                </div>
              </div>

              {/* Next Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    onOpenLogin();
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-500/20 transition-all text-sm"
                >
                  <span>Student Login</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            /* Application Form in Clean Professional English */
            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Sequential Form Questions */}
              <div className="space-y-5">
                {/* 1. Student Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold mr-1.5">
                      1
                    </span>
                    Student Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Enter student's full name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 shadow-xs"
                  />
                </div>

                {/* 2. Father / Guardian Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold mr-1.5">
                      2
                    </span>
                    Father / Guardian Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder="Enter father or guardian full name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 shadow-xs"
                  />
                </div>

                {/* 3. Gender */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold mr-1.5">
                      3
                    </span>
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'female' | 'male')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 bg-white shadow-xs"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>

                {/* 4. WhatsApp Contact Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold mr-1.5">
                      4
                    </span>
                    WhatsApp Contact Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="10-digit WhatsApp number (e.g. 9876543210)"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 shadow-xs"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    The last 6 digits of this number will serve as your initial portal login password.
                  </span>
                </div>

                {/* 5. Age */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold mr-1.5">
                      5
                    </span>
                    Student Age (in years) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={4}
                    max={99}
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Enter age in years (e.g. 12)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 shadow-xs"
                  />
                </div>

                {/* 6. Select State */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold mr-1.5">
                      6
                    </span>
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={selectedState}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 bg-white shadow-xs"
                  >
                    <option value="">-- Select State / Union Territory of India --</option>
                    {ALL_INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 7. Select District */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold mr-1.5">
                      7
                    </span>
                    District <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    disabled={!selectedState}
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 bg-white shadow-xs disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    {!selectedState ? (
                      <option value="">-- Please select a State first --</option>
                    ) : (
                      <>
                        <option value="">-- Select District --</option>
                        {availableDistricts.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  {selectedState && availableDistricts.length > 0 && (
                    <span className="text-[11px] text-emerald-700 mt-1 block">
                      ✓ {availableDistricts.length} districts loaded for {selectedState}
                    </span>
                  )}
                </div>

                {/* 8. Full Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold mr-1.5">
                      8
                    </span>
                    Full Address (House No, Locality / Mohalla, Landmark & PIN Code) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    placeholder="House/Flat No., Street/Mohalla, Nearby Landmark, PIN Code"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 shadow-xs"
                  />
                </div>

                {/* 9. Select Course */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold mr-1.5">
                      9
                    </span>
                    Select Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 bg-white shadow-xs font-medium"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 10. Class Type - Matches user screenshot exactly (Always side-by-side on one line) */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold mr-1.5">
                      10
                    </span>
                    Class Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                    {/* Group Class Button */}
                    <button
                      type="button"
                      onClick={() => setClassType('group')}
                      className={`w-full text-center rounded-2xl py-2.5 px-3 sm:py-3.5 sm:px-4 transition-all cursor-pointer ${
                        classType === 'group'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-slate-800 border border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-sm sm:text-base font-bold">
                        Group Class
                      </div>
                      <div
                        className={`text-[11px] sm:text-xs mt-0.5 ${
                          classType === 'group' ? 'text-blue-100' : 'text-slate-500'
                        }`}
                      >
                        Interactive peers
                      </div>
                    </button>

                    {/* One-to-One Class Button */}
                    <button
                      type="button"
                      onClick={() => setClassType('one_to_one')}
                      className={`w-full text-center rounded-2xl py-2.5 px-3 sm:py-3.5 sm:px-4 transition-all cursor-pointer ${
                        classType === 'one_to_one'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-slate-800 border border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-sm sm:text-base font-bold">
                        One-to-One Class
                      </div>
                      <div
                        className={`text-[11px] sm:text-xs mt-0.5 ${
                          classType === 'one_to_one' ? 'text-blue-100' : 'text-slate-500'
                        }`}
                      >
                        Personal teacher
                      </div>
                    </button>
                  </div>
                </div>

                {/* 11. Preferred Time Slot */}
                <div className="bg-slate-50 border border-slate-200 p-4 sm:p-5 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-900">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold mr-1.5">
                        11
                      </span>
                      Preferred Time Slot <span className="text-red-500">*</span>
                    </label>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                      {classType === 'group' ? '1 Hour Duration' : '20 Mins Duration'}
                    </span>
                  </div>

                  {/* Condition A: Group Class (1 hour) */}
                  {classType === 'group' ? (
                    <div className="space-y-2 pt-1">
                      <p className="text-xs text-slate-600 font-medium">
                        Select one of the 4 scheduled daily time slots (1 Hour duration):
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {GROUP_CLASS_TIME_SLOTS.map((slot) => (
                          <label
                            key={slot}
                            className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                              groupSlot === slot
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-bold'
                                : 'bg-white text-slate-700 border-slate-300 hover:border-blue-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="groupSlot"
                              value={slot}
                              checked={groupSlot === slot}
                              onChange={() => setGroupSlot(slot)}
                              className="accent-blue-700"
                            />
                            <Clock className="w-4 h-4 shrink-0" />
                            <span>{slot}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Condition B: One To One (20 min duration between 02:00 PM and 11:00 PM) */
                    <div className="space-y-3 pt-1">
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                        <div className="font-bold mb-0.5">
                          One-to-One Class: 20 Minutes (Available between 02:00 PM and 11:00 PM)
                        </div>
                        <p className="text-amber-800/90 text-[11px]">
                          Select your start time below. The 20-minute class end time will calculate automatically.
                        </p>
                      </div>

                      {/* Clean Aligned Time Controls Card */}
                      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs space-y-3.5">
                        {/* Inline Time Row: Start Time Label + Inputs */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div>
                            <label className="block text-xs font-bold text-slate-800">
                              Start Time <span className="text-red-500">*</span>
                            </label>
                            <span className="text-[11px] text-slate-400">
                              Hour : Minute and AM/PM
                            </span>
                          </div>

                          {/* Time Picker Controls Bar - All strictly same height and aligned */}
                          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1.5 rounded-xl self-start sm:self-auto">
                            {/* Hour Dropdown */}
                            <select
                              value={selectedHour}
                              onChange={(e) => setSelectedHour(e.target.value)}
                              className="h-9 px-2.5 bg-white rounded-lg border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer shadow-2xs text-center"
                              aria-label="Select Hour"
                            >
                              {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((h) => (
                                <option key={h} value={h}>
                                  {h}
                                </option>
                              ))}
                            </select>

                            <span className="text-base font-bold text-slate-400 select-none">:</span>

                            {/* Minute Dropdown */}
                            <select
                              value={selectedMinute}
                              onChange={(e) => setSelectedMinute(e.target.value)}
                              className="h-9 px-2.5 bg-white rounded-lg border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer shadow-2xs text-center"
                              aria-label="Select Minute"
                            >
                              {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map((m) => (
                                <option key={m} value={m}>
                                  {m}
                                </option>
                              ))}
                            </select>

                            {/* AM / PM Segmented Buttons */}
                            <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg ml-1">
                              <button
                                type="button"
                                onClick={() => setSelectedPeriod('AM')}
                                className={`h-8 px-3 rounded-md text-xs font-bold transition-all cursor-pointer ${
                                  selectedPeriod === 'AM'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                AM
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedPeriod('PM')}
                                className={`h-8 px-3 rounded-md text-xs font-bold transition-all cursor-pointer ${
                                  selectedPeriod === 'PM'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                PM
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Calculated Duration Display Banner */}
                        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                            <span className="font-semibold text-emerald-950">
                              Calculated Slot: <strong className="font-bold text-emerald-800">{selectedHour}:{selectedMinute} {selectedPeriod}</strong> to <strong className="font-bold text-emerald-800">{oneToOneEndTime}</strong>
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 text-[10px] font-bold shrink-0">
                            20 Mins Fixed
                          </span>
                        </div>

                        {/* Quick 1-Click Popular Start Slots */}
                        <div className="pt-0.5">
                          <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                            Quick 1-Click Popular Start Times:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {POPULAR_ONE_TO_ONE_START_TIMES.map((st) => {
                              const isSelected = `${selectedHour}:${selectedMinute} ${selectedPeriod}` === st;
                              return (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => handleSelectPreset(st)}
                                  className={`px-2.5 py-1 text-xs rounded-lg border transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                  }`}
                                >
                                  {st}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {isOneToOneWindowWarning && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-100/60 p-2 rounded-lg">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                          <span>
                            Academy one-to-one class window operates between 02:00 PM and 11:00 PM.
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Summary badge */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Selected Slot:</span>
                    <span className="font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                      {resolvedTimeSlot}
                    </span>
                  </div>
                </div>

                {/* Optional: Additional Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Additional Message / Requirements (Optional)
                  </label>
                  <input
                    type="text"
                    value={additionalNote}
                    onChange={(e) => setAdditionalNote(e.target.value)}
                    placeholder="Any specific request, preferred teacher gender, or questions"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs text-slate-900"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Submitting Application...' : 'Submit Admission Application'}</span>
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
