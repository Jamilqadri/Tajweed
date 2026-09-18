import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ScheduledClass } from '../../types';
import { getClassJoinStatus } from '../../utils/classTimeHelper';
import {
  User,
  BookOpen,
  Calendar,
  CreditCard,
  Video,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  Upload,
  ArrowRight,
  ShieldCheck,
  FileText,
  FileImage,
} from 'lucide-react';
import { ClassMeetModal } from '../classroom/ClassMeetModal';

interface StudentDashboardProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const {
    currentStudent,
    courses,
    teachers,
    groups,
    classes,
    payments,
    submitPayment,
    t,
    language,
  } = useApp();

  const [activeMeetClass, setActiveMeetClass] = useState<ScheduledClass | null>(null);

  // Fee submission form state
  const [showFeeForm, setShowFeeForm] = useState(false);
  const [payAmount, setPayAmount] = useState('600');
  const [payMethod, setPayMethod] = useState('UPI / GPay');
  const [payTrxId, setPayTrxId] = useState('');
  const [payDate, setPayDate] = useState('2026-09-20');
  const [payNote, setPayNote] = useState('');
  const [payScreenshot, setPayScreenshot] = useState(
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80'
  );
  const [feeSuccessMessage, setFeeSuccessMessage] = useState('');

  // Password change modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  if (!currentStudent) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <User className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="font-bold text-slate-800">Student Account Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">Please select a student demo account.</p>
      </div>
    );
  }

  // Student specific data
  const enrolledCourse = courses.find((c) => c.id === currentStudent.courseId);
  const assignedTeacher = teachers.find((t) => t.id === currentStudent.assignedTeacherId);
  const assignedGroup = currentStudent.groupId ? groups.find((g) => g.id === currentStudent.groupId) : null;

  // Student classes
  const myClasses = classes.filter(
    (c) =>
      c.studentId === currentStudent.id ||
      (currentStudent.groupId && c.groupId === currentStudent.groupId)
  );

  // Find next class (closest upcoming or scheduled)
  const nextClass = myClasses.find((c) => c.status === 'scheduled' || c.status === 'live') || myClasses[0];

  // Dynamic 5-minute join window rule and clear time display
  const nextClassJoinStatus = nextClass ? getClassJoinStatus(nextClass) : null;
  const isJoinAvailable = nextClassJoinStatus ? nextClassJoinStatus.isAvailable : false;

  const handleFeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount || !payTrxId) return;

    submitPayment({
      studentId: currentStudent.id,
      courseId: currentStudent.courseId,
      amount: Number(payAmount),
      paymentMethod: payMethod,
      transactionId: payTrxId,
      paymentDate: payDate,
      screenshotUrl: payScreenshot,
      note: payNote,
    });

    setFeeSuccessMessage('Payment submitted successfully! Admin will verify the receipt shortly.');
    setPayTrxId('');
    setTimeout(() => {
      setShowFeeForm(false);
      setFeeSuccessMessage('');
    }, 2000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setPasswordSuccess('Password successfully updated!');
    setTimeout(() => {
      setShowPasswordModal(false);
      setPasswordSuccess('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1500);
  };

  // SUB-VIEW: My Courses & Teacher Info
  if (currentTab === 'my_courses') {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-bold text-slate-900">My Enrolled Course & Faculty</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Program syllabus, lesson objectives, and assigned Tajweed instructor.
          </p>
        </div>

        {/* Course Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Running Course
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">{enrolledCourse?.name}</h3>
              {enrolledCourse?.urduName && (
                <div className="text-sm font-bold text-blue-600 font-urdu">{enrolledCourse?.urduName}</div>
              )}
            </div>

            <div className="text-end">
              <span className="text-xs text-slate-400 block">Monthly Tuition</span>
              <span className="text-2xl font-black text-blue-950">₹{enrolledCourse?.fee}</span>
              <span className="text-xs text-slate-500"> / month</span>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            {language === 'ur' && enrolledCourse?.urduDescription
              ? enrolledCourse.urduDescription
              : enrolledCourse?.description}
          </p>

          {/* Assigned Teacher Card */}
          {assignedTeacher && (
            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={assignedTeacher.profilePhoto}
                  alt={assignedTeacher.fullName}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-600 shadow-xs"
                />
                <div>
                  <span className="text-[11px] font-bold text-blue-700 uppercase">Assigned Master Teacher</span>
                  <h4 className="font-bold text-slate-900 text-base">{assignedTeacher.fullName}</h4>
                  <div className="text-xs text-slate-600">{assignedTeacher.specialization}</div>
                </div>
              </div>

              <div className="text-xs space-y-1 text-slate-600">
                <div><strong>Sanad:</strong> {assignedTeacher.tajweedQualification}</div>
                <div><strong>Experience:</strong> {assignedTeacher.experience}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // SUB-VIEW: My Classes
  if (currentTab === 'my_classes') {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="text-xl font-bold text-slate-900">My Class Schedule & History</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Complete calendar of live recitation sessions with Google Meet links.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 text-start">Date & Time</th>
                  <th className="py-3 px-4 text-start">Course</th>
                  <th className="py-3 px-4 text-start">Teacher</th>
                  <th className="py-3 px-4 text-start">Format</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-end">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myClasses.map((cls) => {
                  const course = courses.find((c) => c.id === cls.courseId);
                  const teacher = teachers.find((t) => t.id === cls.teacherId);

                  return (
                    <tr key={cls.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{cls.date}</div>
                        <div className="text-[11px] text-blue-700 font-semibold">{cls.time} ({cls.durationMinutes}m)</div>
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-800">
                        {course?.name}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {teacher?.fullName}
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                          {cls.classType === 'group' ? 'Group Class' : '1-on-1'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            cls.status === 'completed'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {cls.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-end">
                        {cls.status !== 'completed' ? (
                          <button
                            type="button"
                            onClick={() => setActiveMeetClass(cls)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Join Meet</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 font-medium">Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // SUB-VIEW: My Fees & Payment Submission
  if (currentTab === 'my_fees') {
    const myPayments = payments.filter((p) => p.studentId === currentStudent.id);

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <h3 className="text-xl font-bold text-slate-900">Tuition Fees & Payments</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Submit your monthly fee payment receipt for manual administrative verification.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowFeeForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-md shadow-blue-500/20"
          >
            <Upload className="w-4 h-4" />
            <span>Submit Fee Payment</span>
          </button>
        </div>

        {/* Current Fee Status Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Monthly Fee Status</span>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-sm font-bold px-3 py-1 rounded-full ${
                  currentStudent.feeStatus === 'paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {currentStudent.feeStatus === 'paid' ? '🟢 TUITION PAID' : '🟡 PAYMENT PENDING'}
              </span>
            </div>
          </div>

          <div className="text-end">
            <span className="text-xs text-slate-400 block">Course Fee</span>
            <span className="text-2xl font-black text-blue-900">₹{enrolledCourse?.fee}</span>
            <span className="text-xs text-slate-500"> / mo</span>
          </div>
        </div>

        {/* Payment Submission Modal / Form */}
        {showFeeForm && (
          <form
            onSubmit={handleFeeSubmit}
            className="bg-white p-6 rounded-2xl border-2 border-blue-200 shadow-xl space-y-4 animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-base">Submit Fee Payment Receipt</h4>
              <button
                type="button"
                onClick={() => setShowFeeForm(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            {feeSuccessMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
                {feeSuccessMessage}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Amount Paid (₹) *</label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Method *</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                >
                  <option value="UPI / GPay">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="Bank Transfer">Direct Bank Transfer / NEFT</option>
                  <option value="JazzCash / EasyPaisa">JazzCash / EasyPaisa</option>
                  <option value="Cash">Cash Deposit</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Transaction / UTR Reference ID *</label>
                <input
                  type="text"
                  required
                  value={payTrxId}
                  onChange={(e) => setPayTrxId(e.target.value)}
                  placeholder="e.g. UPI489201928391"
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Date *</label>
                <input
                  type="date"
                  required
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Optional Note</label>
                <input
                  type="text"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  placeholder="e.g. October 2026 tuition fee"
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Payment Screenshot / Receipt URL</label>
                <input
                  type="text"
                  value={payScreenshot}
                  onChange={(e) => setPayScreenshot(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 text-xs"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Sample receipt image attached automatically for quick testing.
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowFeeForm(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
              >
                Submit for Verification
              </button>
            </div>
          </form>
        )}

        {/* History Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 font-bold text-slate-900 text-xs">
            Payment Submission History
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 text-start">Date</th>
                  <th className="py-3 px-4 text-start">Amount</th>
                  <th className="py-3 px-4 text-start">Method</th>
                  <th className="py-3 px-4 text-start">Transaction ID</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myPayments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 px-4 font-medium text-slate-800">{p.paymentDate}</td>
                    <td className="py-3 px-4 font-bold text-blue-900">₹{p.amount}</td>
                    <td className="py-3 px-4 text-slate-600">{p.paymentMethod}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{p.transactionId}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // SUB-VIEW: Profile & Security
  if (currentTab === 'profile') {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">My Student Profile</h3>
            <p className="text-xs text-slate-500 mt-1">Official registration record and credentials.</p>
          </div>

          <button
            type="button"
            onClick={() => setShowPasswordModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Change Password</span>
          </button>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-blue-50/70 p-5 rounded-2xl border border-blue-200">
            <div>
              <span className="text-blue-600 block font-medium">Student ID</span>
              <span className="text-xl font-extrabold text-blue-950 font-mono">{currentStudent.studentId}</span>
            </div>
            <div>
              <span className="text-blue-600 block font-medium">Admission Date</span>
              <span className="font-bold text-slate-900">{currentStudent.admissionDate}</span>
            </div>
            <div>
              <span className="text-blue-600 block font-medium">Account Status</span>
              <span className="font-bold text-emerald-700 uppercase">{currentStudent.status}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h5 className="font-bold text-slate-900 text-sm">Personal Information</h5>
              <div><strong>Full Name:</strong> {currentStudent.fullName}</div>
              <div><strong>Father / Guardian:</strong> {currentStudent.fatherName}</div>
              <div><strong>Gender:</strong> {currentStudent.gender}</div>
              <div><strong>Date of Birth:</strong> {currentStudent.dob}</div>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h5 className="font-bold text-slate-900 text-sm">Contact & Address</h5>
              <div><strong>Mobile:</strong> {currentStudent.mobile}</div>
              <div><strong>WhatsApp:</strong> {currentStudent.whatsapp}</div>
              <div><strong>City & State:</strong> {currentStudent.city}, {currentStudent.state}</div>
              <div><strong>Full Address:</strong> {currentStudent.address}</div>
            </div>
          </div>
        </div>

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <form
              onSubmit={handlePasswordChange}
              className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 text-xs shadow-2xl border border-slate-100"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="font-bold text-slate-900 text-sm">Change Account Password</h4>
                <button type="button" onClick={() => setShowPasswordModal(false)}>✕</button>
              </div>

              {passwordSuccess && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg font-semibold">
                  {passwordSuccess}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-semibold"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  // DEFAULT VIEW: Student Main Dashboard
  return (
    <div className="space-y-8">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold mb-1 border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>KANZ UT TAJWEED STUDENT PORTAL</span>
          </div>
          <div className="space-y-0.5">
            <span className="block text-sm sm:text-base font-medium text-blue-200 tracking-wide">
              {language === 'ur' ? 'السلام علیکم' : 'Assalamu Alaikum'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {currentStudent.fullName}
            </h2>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-blue-100">
            <span>Student ID: <strong className="font-mono text-white text-sm">{currentStudent.studentId}</strong></span>
            <span>•</span>
            <span>{currentStudent.classType === 'group' ? 'Group Class' : 'One-to-One Class'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
              currentStudent.feeStatus === 'paid'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'bg-amber-500 text-slate-950 shadow-xs'
            }`}
          >
            {currentStudent.feeStatus === 'paid' ? 'Tuition Paid' : 'Fee Pending'}
          </span>
        </div>
      </div>

      {/* Next Upcoming Live Class Hero Box */}
      {nextClass ? (
        <div className="bg-white rounded-3xl border-2 border-blue-200 shadow-md p-6 sm:p-8 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span>Next Scheduled Recitation Session</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900">{enrolledCourse?.name}</h3>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                <span className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  {nextClass.date}
                </span>
                <span className="flex items-center gap-1.5 font-extrabold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                  <Clock className="w-4 h-4 text-blue-600" />
                  {nextClassJoinStatus?.formattedTimeDisplay || `${nextClass.time} (${nextClass.durationMinutes} Mins)`}
                </span>
                <span>Teacher: <strong>{assignedTeacher?.fullName}</strong></span>
                {assignedGroup && <span>Batch: <strong>{assignedGroup.name}</strong></span>}
              </div>
            </div>

            {/* Join Google Meet Button with 5-Minute Logic */}
            <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveMeetClass(nextClass)}
                className={`w-full sm:w-auto px-7 py-3.5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 shadow-lg ${
                  isJoinAvailable
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30 ring-4 ring-blue-100 animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-900 text-white shadow-slate-900/20'
                }`}
                title={isJoinAvailable ? 'Join live Google Meet class' : 'Preview classroom interface'}
              >
                <Video className="w-5 h-5 text-white" />
                <span>
                  {language === 'ur'
                    ? (isJoinAvailable ? 'گوگل میٹ کلاس میں شامل ہوں' : 'کلاس روم جوائن کریں (ٹیسٹ/پیش نظارہ)')
                    : (isJoinAvailable ? t('joinGoogleMeet') : 'Join Class (Preview / Test)')}
                </span>
              </button>

              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className={`w-2 h-2 rounded-full ${isJoinAvailable ? 'bg-emerald-500 animate-ping' : 'bg-amber-400'}`} />
                <span className="font-medium">
                  {language === 'ur' ? nextClassJoinStatus?.statusTextUrdu : nextClassJoinStatus?.statusText}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
          No live classes currently scheduled. Your teacher will post your next session time soon.
        </div>
      )}

      {/* 3 Quick Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Enrolled Program */}
        <div
          onClick={() => onSelectTab('my_courses')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 transition-all cursor-pointer"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Program</span>
          <div className="text-base font-bold text-slate-900 mt-1">{enrolledCourse?.name}</div>
          <div className="text-xs text-blue-600 mt-1">{enrolledCourse?.duration} duration</div>
        </div>

        {/* Assigned Teacher */}
        <div
          onClick={() => onSelectTab('my_courses')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 transition-all cursor-pointer"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Master Instructor</span>
          <div className="text-base font-bold text-slate-900 mt-1">{assignedTeacher?.fullName}</div>
          <div className="text-xs text-emerald-600 mt-1">{assignedTeacher?.specialization}</div>
        </div>

        {/* Fee Status */}
        <div
          onClick={() => onSelectTab('my_fees')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 transition-all cursor-pointer"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tuition Status</span>
          <div className="text-base font-bold text-slate-900 mt-1">
            {currentStudent.feeStatus === 'paid' ? 'Fully Paid' : 'Payment Due'}
          </div>
          <div className="text-xs text-blue-600 mt-1">Click to submit receipt</div>
        </div>
      </div>

      {/* Classroom Modal */}
      {activeMeetClass && (
        <ClassMeetModal
          classItem={activeMeetClass}
          onClose={() => setActiveMeetClass(null)}
        />
      )}
    </div>
  );
};
