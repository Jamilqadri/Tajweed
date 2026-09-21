import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ScheduledClass } from '../../types';
import { getClassJoinStatus } from '../../utils/classTimeHelper';
import {
  GraduationCap,
  Users,
  Layers,
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  BookOpen,
  Award,
  Sparkles,
  User,
  ArrowRight,
  ExternalLink,
  KeyRound,
} from 'lucide-react';
import { GoogleMeetLauncherModal } from '../classroom/GoogleMeetLauncherModal';
import { ChangePasswordModal } from '../auth/ChangePasswordModal';
import { TeacherGenderIcon } from '../common/TeacherGenderIcon';

interface TeacherDashboardProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const {
    currentTeacher,
    students,
    groups,
    courses,
    classes,
    updateClassStatus,
    joinLiveClass,
    language,
    t,
  } = useApp();

  const [activeMeetClass, setActiveMeetClass] = useState<ScheduledClass | null>(null);

  // Opens Google Meet summary & launcher modal
  const handleTeacherJoinClass = (cls: ScheduledClass) => {
    setActiveMeetClass(cls);
  };
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [scheduleFilter, setScheduleFilter] = useState<'all' | 'group' | 'one_to_one'>('all');
  const [scheduleScope, setScheduleScope] = useState<'today' | 'all'>('today');

  if (!currentTeacher) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <GraduationCap className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="font-bold text-slate-800">Teacher Profile Not Linked</h3>
        <p className="text-xs text-slate-500 mt-1">Please switch to a teacher demo account.</p>
      </div>
    );
  }

  // Teacher specific data
  const myStudents = students.filter(
    (s) =>
      s.assignedTeacherId === currentTeacher.id ||
      currentTeacher.assignedStudentIds?.includes(s.id) ||
      currentTeacher.assignedStudentIds?.includes(s.studentId)
  );
  const myGroups = groups.filter((g) => g.teacherId === currentTeacher.id);
  const myClasses = classes.filter(
    (c) => c.teacherId === currentTeacher.id || (c.groupId && myGroups.some((g) => g.id === c.groupId))
  );

  const groupClasses = myClasses.filter((c) => c.classType === 'group');
  const oneToOneClasses = myClasses.filter((c) => c.classType === 'one_to_one');

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysClasses = myClasses.filter((c) => c.date === todayStr || c.date === '2026-09-18' || c.status === 'live');
  const upcomingClasses = myClasses.filter((c) => c.status === 'scheduled' && !todaysClasses.some((tc) => tc.id === c.id));
  const completedClasses = myClasses.filter((c) => c.status === 'completed');

  const displayedClasses = myClasses.filter((c) => {
    if (scheduleScope === 'today' && c.date !== todayStr && c.date !== '2026-09-18' && c.status !== 'live') return false;
    if (scheduleFilter === 'group' && c.classType !== 'group') return false;
    if (scheduleFilter === 'one_to_one' && c.classType !== 'one_to_one') return false;
    return true;
  });

  // SUB-VIEW: My Profile
  if (currentTab === 'my_profile') {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={currentTeacher.profilePhoto}
              alt={currentTeacher.fullName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-600 shadow-md"
            />
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Tajweed Instructor</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{currentTeacher.fullName}</h3>
              <p className="text-xs text-blue-600 font-medium">{currentTeacher.specialization}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
            <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              Professional Credentials
            </h4>
            <div>
              <span className="text-slate-400 block font-medium">Tajweed Sanad / Ijazah</span>
              <span className="font-bold text-slate-900 text-sm">{currentTeacher.tajweedQualification}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Academic Qualification</span>
              <span className="font-bold text-slate-900">{currentTeacher.qualification}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Teaching Experience</span>
              <span className="font-bold text-slate-900">{currentTeacher.experience}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Languages of Instruction</span>
              <span className="font-bold text-slate-900">{currentTeacher.languages.join(', ')}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
            <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              Contact & Location
            </h4>
            <div>
              <span className="text-slate-400 block font-medium">Email Address</span>
              <span className="font-bold text-slate-900">{currentTeacher.email}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Mobile Phone</span>
              <span className="font-bold text-slate-900">{currentTeacher.mobile}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">WhatsApp</span>
              <span className="font-bold text-slate-900">{currentTeacher.whatsapp}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">City & State</span>
              <span className="font-bold text-slate-900">{currentTeacher.city}, {currentTeacher.state}</span>
            </div>
          </div>
        </div>

        {/* Security & Password Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-600" />
              <span>{language === 'ur' ? 'اکاؤنٹ سیکیورٹی اور پاس ورڈ' : 'Account Security & Password'}</span>
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'ur'
                ? 'آپ کسی بھی وقت اپنا پاس ورڈ تبدیل کر سکتے ہیں۔ ابتدائی پاس ورڈ سپر ایڈمن نے فراہم کیا تھا۔'
                : 'You can change your password anytime. Initial password was provided by the Super Admin.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowPasswordModal(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto"
          >
            <KeyRound className="w-4 h-4" />
            <span>{language === 'ur' ? 'پاس ورڈ تبدیل کریں' : 'Change Password'}</span>
          </button>
        </div>

        <ChangePasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
        />
      </div>
    );
  }

  // SUB-VIEW: My Students
  if (currentTab === 'my_students') {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-bold text-slate-900">My Assigned Students</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            List of all students assigned to you across One-to-One classes and Cohorts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myStudents.map((student) => {
            const course = courses.find((c) => c.id === student.courseId);
            const group = student.groupId ? groups.find((g) => g.id === student.groupId) : null;

            return (
              <div
                key={student.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-700">{student.studentId}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                    {student.classType === 'group' ? 'Group Class' : '1-on-1'}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{student.fullName}</h4>
                  <div className="text-xs text-slate-500">{course?.name}</div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-xs space-y-1 text-slate-600">
                  {student.classType === 'group' ? (
                    <div><strong>Cohort:</strong> {group?.name}</div>
                  ) : (
                    <div><strong>Slot:</strong> {student.oneToOneSlot}</div>
                  )}
                  <div><strong>Preferred Time:</strong> {student.preferredTime}</div>
                  <div><strong>City:</strong> {student.city}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // SUB-VIEW: My Groups
  if (currentTab === 'my_groups') {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-bold text-slate-900">My Group Cohorts</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Group classes assigned to your weekly schedule with dedicated Google Meet room & Google Calendar synchronization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myGroups.map((group) => {
            const course = courses.find((c) => c.id === group.courseId);
            return (
              <div
                key={group.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-base">{group.name}</h4>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                    {group.studentIds?.length ?? students.filter(s => s.assignedGroupId === group.id).length}/{group.maxCapacity || group.capacity || 10} Students
                  </span>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl space-y-1">
                  <div><strong>Course:</strong> {course?.name}</div>
                  <div><strong>Days:</strong> {group.scheduleDays?.join(', ') || group.days?.join(', ') || 'Mon, Wed, Fri'}</div>
                  <div><strong>Start Time:</strong> {group.scheduleTime || group.startTime || '19:00'}</div>
                  {group.calendarEventId && (
                    <div className="text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                      <span>✓ Google Calendar Synced (Co-host access)</span>
                      {group.calendarHtmlLink && (
                        <a
                          href={group.calendarHtmlLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center"
                        >
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {group.meetLink && (
                  <div className="flex items-center justify-between p-2.5 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="text-xs font-bold text-blue-900">Google Meet Room</span>
                    </div>
                    <a
                      href={group.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                    >
                      <span>Join Room</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                <div>
                  <div className="text-xs font-bold text-slate-800 mb-2">Enrolled Students:</div>
                  <div className="space-y-1.5">
                    {((group.studentIds && group.studentIds.length > 0)
                      ? group.studentIds
                      : students.filter(s => s.assignedGroupId === group.id).map(s => s.id)
                    ).map((sid) => {
                      const student = students.find((s) => s.id === sid);
                      return (
                        <div key={sid} className="flex justify-between text-xs p-2 rounded-lg bg-blue-50/50">
                          <span className="font-semibold text-slate-800">{student?.fullName || sid}</span>
                          <span className="font-mono text-blue-700">{student?.studentId}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // SUB-VIEW: My Schedule (Group & One-to-One Classes with unrestricted access)
  if (currentTab === 'my_schedule') {
    return (
      <div className="space-y-6">
        {/* Header & Access Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-emerald-400" />
                <h3 className="text-2xl font-bold">
                  {language === 'ur' ? 'میرے کلاس شیڈول (گروپ اور ون ٹو ون)' : 'My Class Schedule (Group & One-to-One)'}
                </h3>
              </div>
              <p className="text-emerald-200 text-xs mt-1">
                {language === 'ur'
                  ? 'گروپ اور ون ٹو ون کلاسز ہمیشہ دستیاب ہیں۔ استاد کسی بھی وقت کلاس شروع کر سکتے ہیں۔'
                  : 'Group Classes and One-to-One Classes are always visible. You can start or join sessions anytime without time restrictions.'}
              </p>
            </div>

            <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold self-start sm:self-center">
              ✓ Unrestricted Join Access
            </div>
          </div>

          {/* Student Notification Guarantee Banner */}
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/15 text-xs text-blue-100 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">
                {language === 'ur' ? 'طلباء کے لیے فوری رسائی:' : 'Student Instant Access Guarantee:'}
              </span>
              <span className="block mt-0.5 text-blue-200">
                {language === 'ur'
                  ? 'اگر آپ مقررہ وقت سے پہلے کلاس میں شامل ہوتے ہیں، تو متعلقہ طالب علم کا "Join Class" بٹن فوری طور پر فعال ہو جاتا ہے۔'
                  : 'When you start or join any class before the scheduled time, the relevant student’s Join Class button becomes immediately active and clickable.'}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Scope Toggle: Today vs All */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setScheduleScope('today')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  scheduleScope === 'today' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {language === 'ur' ? `آج کے سیشنز (${todaysClasses.length})` : `Today's Sessions (${todaysClasses.length})`}
              </button>
              <button
                type="button"
                onClick={() => setScheduleScope('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  scheduleScope === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {language === 'ur' ? `تمام شیڈول (${myClasses.length})` : `All Scheduled (${myClasses.length})`}
              </button>
            </div>

            {/* Type Filter */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setScheduleFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  scheduleFilter === 'all' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({myClasses.length})
              </button>
              <button
                type="button"
                onClick={() => setScheduleFilter('group')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  scheduleFilter === 'group' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Group ({groupClasses.length})
              </button>
              <button
                type="button"
                onClick={() => setScheduleFilter('one_to_one')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  scheduleFilter === 'one_to_one' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                One-to-One ({oneToOneClasses.length})
              </button>
            </div>
          </div>
        </div>

        {/* Schedule List */}
        <div className="space-y-3">
          {displayedClasses.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
              No classes found for the selected schedule filters.
            </div>
          ) : (
            displayedClasses.map((cls) => {
              const course = courses.find((c) => c.id === cls.courseId);
              const group = cls.groupId ? groups.find((g) => g.id === cls.groupId) : null;
              const student = cls.studentId ? students.find((s) => s.id === cls.studentId) : null;
              const joinStatus = getClassJoinStatus(cls);

              return (
                <div
                  key={cls.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {cls.classType === 'group' ? 'Group Class' : 'One-to-One'}
                      </span>
                      <h4 className="font-bold text-base text-slate-900">
                        {cls.classType === 'group' ? group?.name : student?.fullName}
                      </h4>
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                      <span><strong>Course:</strong> {course?.name}</span>
                      <span>•</span>
                      <span className="font-medium text-slate-700"><strong>Date:</strong> {cls.date}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5 font-extrabold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        {joinStatus.formattedTimeDisplay}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs">
                      <span className={`w-2 h-2 rounded-full ${cls.status === 'live' || cls.teacherJoined ? 'bg-emerald-500 animate-ping' : 'bg-emerald-500'}`} />
                      <span className="font-semibold text-[11px] text-emerald-800">
                        {cls.status === 'live' || cls.teacherJoined
                          ? 'Class Active • Live in Session'
                          : 'Teacher Access: Join anytime (No time restriction)'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTeacherJoinClass(cls)}
                      className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 ${
                        cls.status === 'live' || cls.teacherJoined
                          ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30 ring-2 ring-emerald-200 animate-pulse'
                          : 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-600/30 ring-2 ring-emerald-300'
                      }`}
                      title="Teachers can join and start the live class anytime without any time restriction."
                    >
                      <Video className="w-4 h-4" />
                      <span>
                        {cls.status === 'live' || cls.teacherJoined
                          ? language === 'ur'
                            ? 'جاری کلاس میں شامل رہیں'
                            : 'Rejoin Live Class'
                          : language === 'ur'
                          ? 'لائیو ویڈیو کلاس شروع کریں (کسی بھی وقت)'
                          : 'Start Live Video Class (Anytime)'}
                      </span>
                    </button>

                    {cls.status === 'live' && (
                      <button
                        type="button"
                        onClick={() => updateClassStatus(cls.id, 'completed')}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                      >
                        Finish Class
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {activeMeetClass && (
          <GoogleMeetLauncherModal
            classItem={activeMeetClass}
            onClose={() => setActiveMeetClass(null)}
          />
        )}
      </div>
    );
  }

  // DEFAULT VIEW: Overview Dashboard & Today's Classes
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <img
              src={currentTeacher.profilePhoto}
              alt={currentTeacher.fullName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400 shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs">
              <TeacherGenderIcon
                gender={currentTeacher.gender}
                teacherName={currentTeacher.fullName}
                size={18}
              />
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-semibold mb-1 border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>TEACHER CLASSROOM DESK</span>
            </div>
            <div className="space-y-0.5">
              <span className="block text-sm sm:text-base font-medium text-emerald-200 tracking-wide">
                Assalamu Alaikum
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {currentTeacher.fullName}
                </h2>
                <TeacherGenderIcon
                  gender={currentTeacher.gender}
                  teacherName={currentTeacher.fullName}
                  variant="badge"
                  size={15}
                />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-emerald-100">
              {currentTeacher.specialization} • Sanad Muttasil Certified
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="px-4 py-2 rounded-xl bg-emerald-600/60 text-white text-xs font-bold border border-emerald-500/40">
            {myStudents.length} {language === 'ur' ? 'طلباء تفویض ہیں' : 'Active Students Assigned'}
          </span>
          <button
            type="button"
            onClick={() => setShowPasswordModal(true)}
            className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold border border-white/20 flex items-center gap-1.5 transition-colors"
            title={language === 'ur' ? 'پاس ورڈ تبدیل کریں' : 'Change Password'}
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-300" />
            <span>{language === 'ur' ? 'پاس ورڈ تبدیل کریں' : 'Change Password'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => onSelectTab('my_students')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-blue-400 transition-all"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">My Students</span>
          <div className="text-3xl font-black text-slate-900 mt-1">{myStudents.length}</div>
          <div className="text-[11px] text-blue-600 font-semibold mt-0.5">Assigned to you</div>
        </div>

        <div
          onClick={() => onSelectTab('my_groups')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-blue-400 transition-all"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">My Groups</span>
          <div className="text-3xl font-black text-slate-900 mt-1">{myGroups.length}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Active Cohorts</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Today's Classes</span>
          <div className="text-3xl font-black text-slate-900 mt-1">{todaysClasses.length}</div>
          <div className="text-[11px] text-purple-600 font-semibold mt-0.5">Live Video Class</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Completed Sessions</span>
          <div className="text-3xl font-black text-slate-900 mt-1">{completedClasses.length}</div>
          <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Past records</div>
        </div>
      </div>

      {/* Today's & All Scheduled Classes List with Video Class Button */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">
                {language === 'ur' ? 'کلاس سیشنز اور لائیو روم' : 'Class Sessions & Live Desk'}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Join Anytime (No Time Restrictions)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'ur'
                ? 'گروپ اور ون ٹو ون کلاسز ہمیشہ نظر آتی ہیں۔ استاد کسی بھی وقت لائیو روم شروع کر سکتے ہیں۔'
                : 'Both Group Classes and One-to-One Classes are always visible. Joining early immediately unlocks the session for students.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Scope Toggle: Today vs All */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setScheduleScope('today')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  scheduleScope === 'today' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Today ({todaysClasses.length})
              </button>
              <button
                type="button"
                onClick={() => setScheduleScope('all')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  scheduleScope === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All Classes ({myClasses.length})
              </button>
            </div>

            {/* Type Filter */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setScheduleFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  scheduleFilter === 'all' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setScheduleFilter('group')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  scheduleFilter === 'group' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Group
              </button>
              <button
                type="button"
                onClick={() => setScheduleFilter('one_to_one')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  scheduleFilter === 'one_to_one' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1-on-1
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {displayedClasses.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl">
              No classes scheduled for the selected view.
            </div>
          ) : (
            displayedClasses.map((cls) => {
              const course = courses.find((c) => c.id === cls.courseId);
              const group = cls.groupId ? groups.find((g) => g.id === cls.groupId) : null;
              const student = cls.studentId ? students.find((s) => s.id === cls.studentId) : null;
              const joinStatus = getClassJoinStatus(cls);

              return (
                <div
                  key={cls.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {cls.classType === 'group' ? 'Group Class' : 'One-to-One'}
                      </span>
                      <h4 className="font-bold text-base text-slate-900">
                        {cls.classType === 'group' ? group?.name : student?.fullName}
                      </h4>
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                      <span><strong>Course:</strong> {course?.name}</span>
                      <span>•</span>
                      <span className="text-slate-700 font-medium"><strong>Date:</strong> {cls.date}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5 font-extrabold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        {joinStatus.formattedTimeDisplay}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs">
                      <span className={`w-2 h-2 rounded-full ${cls.status === 'live' || cls.teacherJoined ? 'bg-emerald-500 animate-ping' : 'bg-emerald-500'}`} />
                      <span className="font-semibold text-[11px] text-slate-700">
                        {cls.status === 'live' || cls.teacherJoined ? (
                          <span className="text-emerald-700 font-bold">
                            {language === 'ur' ? 'کلاس جاری ہے • لائیو روم فعال' : 'Class Active • Teacher Joined Early'}
                          </span>
                        ) : (
                          <span className="text-emerald-800 font-medium">
                            {language === 'ur' ? 'استاد کے لیے کوئی وقت کی پابندی نہیں (کسی بھی وقت شروع کریں)' : 'Teacher Access: Join anytime (Student access unlocks immediately when you join)'}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTeacherJoinClass(cls)}
                      className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 ${
                        cls.status === 'live' || cls.teacherJoined
                          ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30 ring-2 ring-emerald-200 animate-pulse'
                          : 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-600/30 ring-2 ring-emerald-300'
                      }`}
                      title="Teachers can join and start the live class anytime without any time restriction."
                    >
                      <Video className="w-4 h-4" />
                      <span>
                        {cls.status === 'live' || cls.teacherJoined
                          ? language === 'ur'
                            ? 'جاری کلاس میں شامل رہیں'
                            : 'Rejoin Live Class'
                          : language === 'ur'
                          ? 'لائیو ویڈیو کلاس شروع کریں (کسی بھی وقت)'
                          : 'Start Live Video Class (Anytime)'}
                      </span>
                    </button>

                    {cls.status === 'live' && (
                      <button
                        type="button"
                        onClick={() => updateClassStatus(cls.id, 'completed')}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                      >
                        Finish Class
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Google Meet Classroom Modal */}
      {activeMeetClass && (
        <GoogleMeetLauncherModal
          classItem={activeMeetClass}
          onClose={() => setActiveMeetClass(null)}
        />
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
};
