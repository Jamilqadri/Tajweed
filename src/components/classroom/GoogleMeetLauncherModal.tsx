import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ScheduledClass } from '../../types';
import { TeacherGenderIcon } from '../common/TeacherGenderIcon';
import {
  isRealGoogleMeetLink,
  getLaunchMeetUrl,
  extractMeetingCode,
  normalizeMeetLink,
} from '../../lib/googleMeetService';
import {
  ExternalLink,
  Copy,
  Check,
  Video,
  Clock,
  Calendar,
  X,
  ShieldCheck,
  Users,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCw,
  Sparkles,
} from 'lucide-react';

interface GoogleMeetLauncherModalProps {
  classItem: ScheduledClass;
  onClose: () => void;
}

export const GoogleMeetLauncherModal: React.FC<GoogleMeetLauncherModalProps> = ({
  classItem,
  onClose,
}) => {
  const {
    teachers,
    students,
    courses,
    groups,
    currentRole,
    currentUser,
    language,
    joinLiveClass,
    updateClassMeetLink,
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [hasLaunched, setHasLaunched] = useState(false);
  const [adminMeetInput, setAdminMeetInput] = useState('');
  const [adminSaveSuccess, setAdminSaveSuccess] = useState(false);
  const [teacherLinkInput, setTeacherLinkInput] = useState('');
  const [teacherSaveSuccess, setTeacherSaveSuccess] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const teacher = teachers.find((t) => t.id === classItem.teacherId);
  const course = courses.find((c) => c.id === classItem.courseId);
  const group = classItem.groupId ? groups.find((g) => g.id === classItem.groupId) : null;
  const student = classItem.studentId ? students.find((s) => s.id === classItem.studentId) : null;

  // Resolve current active Meet link
  const currentMeetLink = classItem.meetLink || group?.meetLink || student?.meetLink || '';
  const hasRealLink = isRealGoogleMeetLink(currentMeetLink);
  const meetingCode = hasRealLink ? extractMeetingCode(currentMeetLink) : '';

  useEffect(() => {
    if (currentMeetLink) {
      setAdminMeetInput(currentMeetLink);
    }
  }, [currentMeetLink]);

  const isSuperAdmin = currentRole === 'super_admin';
  const isTeacher = currentRole === 'teacher';
  const isStudent = currentRole === 'student';
  const isClassLive = classItem.status === 'live';

  // Handle Teacher or Admin Launch
  const handleTeacherLaunch = () => {
    // 1. Mark class as Live and record teacher join in Firestore
    try {
      joinLiveClass(classItem.id, {
        id: currentUser?.id || teacher?.id || 'teacher_session',
        name: currentUser?.name || teacher?.fullName || 'Teacher',
        role: 'teacher',
        audioOn: true,
        videoOn: true,
        joinedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('joinLiveClass error:', e);
    }

    // 2. Open genuine Google Meet
    // If a verified real link exists, open it. Otherwise open https://meet.google.com/new
    // where Google prompts for Google account and immediately spawns a live room!
    const targetUrl = hasRealLink ? normalizeMeetLink(currentMeetLink) : 'https://meet.google.com/new';
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    setHasLaunched(true);
  };

  // Handle Student Join
  const handleStudentJoin = () => {
    if (!hasRealLink) return;

    try {
      joinLiveClass(classItem.id, {
        id: currentUser?.id || student?.id || 'student_session',
        name: currentUser?.name || student?.fullName || 'Student',
        role: 'student',
        audioOn: true,
        videoOn: true,
        joinedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Student join error:', e);
    }

    const targetUrl = normalizeMeetLink(currentMeetLink);
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    setHasLaunched(true);
  };

  // Super Admin Save Link
  const handleAdminSaveLink = () => {
    if (!adminMeetInput.trim()) return;
    const clean = normalizeMeetLink(adminMeetInput.trim());
    if (updateClassMeetLink) {
      updateClassMeetLink(classItem.id, clean);
      setAdminSaveSuccess(true);
      setTimeout(() => setAdminSaveSuccess(false), 3000);
    }
  };

  // Teacher Save Link after creating room with meet.google.com/new
  const handleTeacherSaveLink = () => {
    if (!teacherLinkInput.trim()) return;
    const clean = normalizeMeetLink(teacherLinkInput.trim());
    if (updateClassMeetLink) {
      updateClassMeetLink(classItem.id, clean);
      setTeacherSaveSuccess(true);
      setTimeout(() => setTeacherSaveSuccess(false), 3000);
    }
  };

  const handleCopyLink = () => {
    if (!currentMeetLink) return;
    navigator.clipboard.writeText(currentMeetLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Header - Google Meet Deep Indigo & Blue Theme */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-xs font-semibold w-fit mb-3">
            <span className={`w-2 h-2 rounded-full ${isClassLive ? 'bg-emerald-400 animate-ping' : 'bg-blue-300'}`} />
            <span>
              {isClassLive
                ? (language === 'ur' ? 'کلاس روم لائیو جاری ہے' : 'GOOGLE MEET LIVE NOW')
                : (language === 'ur' ? 'گوگل میٹ کلاس روم' : 'GOOGLE MEET CLASSROOM')}
            </span>
          </div>

          <h3 className="text-xl font-extrabold tracking-tight">
            {course?.name || (language === 'ur' ? 'قرآن و تجوید کلاس' : 'Qur’an & Tajweed Recitation')}
          </h3>
          <p className="text-xs text-blue-100 mt-1 flex items-center gap-2">
            <span>
              {classItem.classType === 'group'
                ? `${language === 'ur' ? 'گروپ:' : 'Group:'} ${group?.name || 'Class Cohort'}`
                : `${language === 'ur' ? 'ون ٹو ون:' : '1-on-1:'} ${student?.fullName || 'Enrolled Student'}`}
            </span>
            <span>•</span>
            <span>
              {language === 'ur' ? 'ہوسٹ:' : 'Host:'} {teacher?.fullName || 'Assigned Instructor'}
            </span>
          </p>
        </div>

        {/* Content Body - Pure Class Details Only */}
        <div className="p-6 space-y-4 text-xs text-slate-700">
          {/* Class Details Summary Cards */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            {/* Instructor / Host */}
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 block font-medium">
                {language === 'ur' ? 'استاد محترم (ہوسٹ)' : 'Instructor (Host)'}
              </span>
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                <TeacherGenderIcon
                  gender={teacher?.gender}
                  teacherName={teacher?.fullName}
                  size={16}
                />
                <span className="truncate">{teacher?.fullName || 'Assigned Instructor'}</span>
              </div>
            </div>

            {/* Schedule & Duration */}
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 block font-medium">
                {language === 'ur' ? 'وقت اور دورانیہ' : 'Schedule & Duration'}
              </span>
              <div className="font-bold text-slate-900 flex items-center gap-1 text-sm">
                <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>
                  {classItem.time || classItem.startTime} ({classItem.durationMinutes || 45} {language === 'ur' ? 'منٹ' : 'min'})
                </span>
              </div>
            </div>

            {/* Cohort / Student */}
            <div className="space-y-1 pt-2 border-t border-slate-200/60">
              <span className="text-[11px] text-slate-400 block font-medium">
                {language === 'ur' ? 'شرکاء' : 'Participants'}
              </span>
              <div className="font-bold text-slate-800 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">
                  {classItem.classType === 'group'
                    ? (group?.name || 'Group Batch')
                    : (student?.fullName || 'One-to-One Student')}
                </span>
              </div>
            </div>

            {/* Class Live Status */}
            <div className="space-y-1 pt-2 border-t border-slate-200/60">
              <span className="text-[11px] text-slate-400 block font-medium">
                {language === 'ur' ? 'حالت' : 'Class Status'}
              </span>
              <div>
                {isClassLive ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{language === 'ur' ? 'لائیو جاری ہے' : 'Live Now'}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    <Calendar className="w-3 h-3 text-blue-600" />
                    <span>{language === 'ur' ? 'طے شدہ' : 'Scheduled'}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* SUPER ADMIN ONLY: Google Meet Link & ID Controls */}
          {isSuperAdmin && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border-2 border-amber-300 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>
                    {language === 'ur' ? 'سوپر ایڈمن کنٹرول: میٹنگ لنک' : 'Super Admin: Google Meet Room Control'}
                  </span>
                </span>
                {meetingCode && (
                  <span className="font-mono text-xs font-bold text-amber-900 bg-white px-2 py-0.5 rounded border border-amber-300">
                    ID: {meetingCode}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={adminMeetInput}
                  onChange={(e) => setAdminMeetInput(e.target.value)}
                  placeholder="https://meet.google.com/abc-defg-hij"
                  className="w-full p-2.5 rounded-xl border border-amber-300 bg-white text-slate-900 font-mono text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAdminSaveLink}
                  className="px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-xs cursor-pointer"
                  title="Save Meeting Link"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{language === 'ur' ? 'محفوظ کریں' : 'Save'}</span>
                </button>
                {hasRealLink && (
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="p-2.5 rounded-xl bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                    title="Copy Link"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>

              {adminSaveSuccess && (
                <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {language === 'ur'
                      ? 'گوگل میٹ لنک کامیابی سے محفوظ ہو گیا!'
                      : 'Google Meet link successfully updated and synced!'}
                  </span>
                </p>
              )}
            </div>
          )}

          {/* TEACHER LAUNCH & LINK PROMPT (If launched via new room) */}
          {isTeacher && hasLaunched && !hasRealLink && (
            <div className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-300 space-y-2.5 animate-in fade-in">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>
                  {language === 'ur'
                    ? 'استاد محترم! گوگل میٹ روم لنک یہاں محفوظ کریں'
                    : 'Teacher: Save your Google Meet room link for students'}
                </span>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                {language === 'ur'
                  ? 'اگر آپ نے نیا گوگل میٹ روم شروع کیا ہے، تو براؤزر سے میٹ لنک کاپی کر کے نیچے پیسٹ کریں تاکہ تمام طلبہ اسی روم میں شامل ہو سکیں:'
                  : 'If you created a new Google Meet room, copy its URL and paste below so all students enter your room:'}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={teacherLinkInput}
                  onChange={(e) => setTeacherLinkInput(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full p-2.5 rounded-xl border border-blue-300 bg-white text-slate-900 font-mono text-xs font-semibold"
                />
                <button
                  type="button"
                  onClick={handleTeacherSaveLink}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{language === 'ur' ? 'محفوظ کریں' : 'Save'}</span>
                </button>
              </div>
              {teacherSaveSuccess && (
                <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {language === 'ur'
                      ? 'میٹنگ لنک محفوظ ہو گیا! طلبہ اب براہ راست اسی روم میں داخل ہوں گے۔'
                      : 'Room link saved! Students will now directly enter this room.'}
                  </span>
                </p>
              )}
            </div>
          )}

          {/* STUDENT WAITING STATE (If teacher has not started yet or room link is being created) */}
          {isStudent && !hasRealLink && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2 text-amber-950">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>
                    {language === 'ur'
                      ? 'استاد محترم کلاس روم شروع کر رہے ہیں'
                      : 'Instructor is starting the Live Room'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="p-1 text-amber-700 hover:text-amber-900 transition-transform cursor-pointer"
                  title="Refresh"
                >
                  <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">
                {language === 'ur'
                  ? 'استاد محترم جیسے ہی کلاس شروع کر کے روم ایکٹیو کریں گے، جوائن بٹن فوری فعال ہو جائے گا۔ برائے مہربانی ایک لمحہ انتظار فرمائیں۔'
                  : 'As soon as the teacher launches the live session, the join button will be activated. Please wait a moment.'}
              </p>
            </div>
          )}

          {/* Simple Join Instructions */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-slate-700">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>
                {language === 'ur' ? 'شامل ہونے کی ہدایات' : 'Classroom Joining Instructions'}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600">
              {language === 'ur'
                ? 'نیچے دیے گئے نیلے بٹن پر کلک کریں۔ گوگل میٹ کھلنے پر اپنا گوگل اکاؤنٹ منتخب کریں یا بطور مہمان (Guest) اپنا نام درج کر کے کلاس میں شامل ہوں۔'
                : 'Click the button below to launch Google Meet. Select your Google account or simply enter your name as Guest to enter the class.'}
            </p>
          </div>

          {/* Primary Action Launch Buttons */}
          <div className="space-y-2 pt-1">
            {/* TEACHER BUTTON */}
            {(isTeacher || isSuperAdmin || currentRole === 'admin') && (
              <button
                type="button"
                onClick={handleTeacherLaunch}
                className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-blue-600/25 transition-all cursor-pointer ring-4 ring-blue-100"
              >
                <Video className="w-5 h-5" />
                <span>
                  {isClassLive
                    ? (language === 'ur' ? 'گوگل میٹ لائیو کلاس میں شامل ہوں' : 'Join Google Meet Live Room')
                    : (language === 'ur' ? 'گوگل میٹ پر کلاس شروع کریں' : 'Start Live Class on Google Meet')}
                </span>
                <ExternalLink className="w-4 h-4 opacity-80" />
              </button>
            )}

            {/* STUDENT BUTTON */}
            {isStudent && (
              <button
                type="button"
                onClick={handleStudentJoin}
                disabled={!hasRealLink}
                className={`w-full py-4 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                  hasRealLink
                    ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white shadow-lg shadow-emerald-600/25 ring-4 ring-emerald-100'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Video className="w-5 h-5" />
                <span>
                  {hasRealLink
                    ? (language === 'ur' ? 'گوگل میٹ کلاس روم میں شامل ہوں' : 'Join Google Meet Classroom')
                    : (language === 'ur' ? 'استاد کے لائیو ہونے کا انتظار...' : 'Waiting for Teacher to Start...')}
                </span>
                {hasRealLink && <ExternalLink className="w-4 h-4 opacity-80" />}
              </button>
            )}

            {hasLaunched && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center text-xs text-emerald-800 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {language === 'ur'
                    ? 'گوگل میٹ روم نئی ونڈو میں کھل چکا ہے۔'
                    : 'Google Meet window launched in new tab.'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-medium">Kanz Ut Tajweed Islamic & Qur’an Academy</span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            {language === 'ur' ? 'بند کریں' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
