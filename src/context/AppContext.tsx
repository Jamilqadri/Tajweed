import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  Student,
  Teacher,
  AdminUser,
  Course,
  Group,
  ScheduledClass,
  Payment,
  GoogleSheetRow,
  AppNotification,
  ActivityLog,
  Role,
  Language,
  ClassType,
  AdminPermissions,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_ADMINS,
  INITIAL_TEACHERS,
  INITIAL_COURSES,
  INITIAL_GROUPS,
  INITIAL_STUDENTS,
  INITIAL_CLASSES,
  INITIAL_PAYMENTS,
  INITIAL_GOOGLE_SHEETS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ACTIVITY_LOGS,
} from '../data/initialData';
import { translations } from '../i18n/translations';

interface AppContextType {
  // Language & i18n
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations.en) => string;

  // Auth & Session
  currentUser: User | null;
  currentRole: Role | null;
  currentStudent: Student | null;
  currentTeacher: Teacher | null;
  currentAdmin: AdminUser | null;
  login: (identifier: string, password?: string) => { success: boolean; message?: string };
  identifyRole: (identifier: string) => { role: Role | null; name?: string; label?: string };
  logout: () => void;
  switchUserRole: (role: Role, specificUserId?: string) => void;
  changePassword: (userId: string, newPass: string) => boolean;

  // Navigation State
  currentView: string;
  setCurrentView: (view: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeMeetingClass: ScheduledClass | null;
  setActiveMeetingClass: (cls: ScheduledClass | null) => void;
  isSimulatedTimeLive: boolean;
  setIsSimulatedTimeLive: (val: boolean) => void;

  // Data Stores
  users: User[];
  students: Student[];
  teachers: Teacher[];
  admins: AdminUser[];
  courses: Course[];
  groups: Group[];
  classes: ScheduledClass[];
  payments: Payment[];
  googleSheets: GoogleSheetRow[];
  notifications: AppNotification[];
  activityLogs: ActivityLog[];

  // Student Admissions & Management
  admissions: Student[];
  generateStudentId: () => string;
  updateStudentStatus: (studentId: string, status: 'active' | 'inactive') => boolean;
  submitAdmission: (formData: Omit<Student, 'id' | 'studentId' | 'userId' | 'admissionStatus' | 'initialPassword' | 'createdAt'>) => {
    student: Student;
    studentId: string;
    initialPassword: string;
  };
  verifyAdmission: (
    studentId: string,
    courseIdOrPayload: any,
    teacherId?: string,
    classType?: ClassType,
    groupId?: string,
    oneToOneDays?: string[],
    oneToOneTime?: string
  ) => boolean;
  rejectAdmission: (studentId: string, reason?: string) => boolean;

  // Course Management
  createCourse: (course: Omit<Course, 'id'>) => Course;
  addCourse: (course: Omit<Course, 'id'>) => Course;
  updateCourse: (id: string, course: Partial<Course>) => boolean;
  deleteCourse: (id: string) => boolean;

  // Teacher Management
  createTeacher: (teacherData: Omit<Teacher, 'id' | 'teacherId' | 'userId'>, password?: string) => Teacher;
  addTeacher: (teacherData: Omit<Teacher, 'id' | 'teacherId' | 'userId'>, password?: string) => Teacher;
  updateTeacher: (id: string, data: Partial<Teacher>) => boolean;
  toggleTeacherStatus: (id: string) => boolean;

  // Group Management
  createGroup: (groupData: Omit<Group, 'id' | 'currentStudents'>) => Group;
  addGroup: (groupData: any) => Group;
  updateGroup: (id: string, data: Partial<Group>) => boolean;
  deleteGroup: (id: string) => boolean;

  // Class Scheduling & Conflict Detection
  checkTeacherConflict: (
    teacherId: string,
    date: string,
    startTime: string,
    endTime?: string,
    excludeClassId?: string
  ) => { hasConflict: boolean; reason?: string };
  scheduleClass: (classData: any) => { success: boolean; message?: string; classItem?: ScheduledClass };
  updateClassStatus: (classId: string, status: ScheduledClass['status']) => boolean;

  // Fee Management
  submitFeeProof: (data: {
    studentId: string;
    courseId: string;
    amount: number;
    paymentDate: string;
    paymentMethod: Payment['paymentMethod'];
    referenceId: string;
    screenshot: string;
    note?: string;
  }) => Payment;
  submitPayment: (data: any) => Payment;
  verifyPayment: (paymentId: string, adminName?: string) => boolean;
  rejectPayment: (paymentId: string, reason?: string) => boolean;

  // Super Admin
  createAdmin: (name: string, email: string, phone: string, permissions: AdminPermissions) => AdminUser;
  addAdmin: (data: any) => AdminUser;
  updateAdmin: (id: string, data: any) => boolean;
  updateAdminPermissions: (adminId: string, permissions: AdminPermissions) => boolean;
  toggleAdminStatus: (adminId: string) => boolean;
  deleteAdmin: (adminId: string) => boolean;

  // Google Sheets Sync
  syncGoogleSheets: () => void;
  exportGoogleSheetsCsv: () => void;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  unreadNotificationsCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Language
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('kzt_lang');
    return (saved === 'ur' || saved === 'en') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('kzt_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
  };

  const toggleLanguage = () => {
    const next = language === 'en' ? 'ur' : 'en';
    setLanguage(next);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
  }, [language]);

  const t = (key: keyof typeof translations.en): string => {
    const dict = translations[language] || translations.en;
    return dict[key] || translations.en[key] || String(key);
  };

  // State Stores with LocalStorage caching
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('kzt_users');
    if (!saved) return INITIAL_USERS;
    try {
      const parsed: User[] = JSON.parse(saved);
      return parsed.map((u) => {
        if (u.role === 'super_admin' || u.id === 'user_superadmin_1') {
          return {
            ...u,
            username: 'Tajweed25',
            password: 'Tajweed26',
          };
        }
        return u;
      });
    } catch {
      return INITIAL_USERS;
    }
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('kzt_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('kzt_teachers');
    return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
  });

  const [admins, setAdmins] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem('kzt_admins');
    return saved ? JSON.parse(saved) : INITIAL_ADMINS;
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('kzt_courses');
    return saved ? JSON.parse(saved) : INITIAL_COURSES;
  });

  const [groups, setGroups] = useState<Group[]>(() => {
    const saved = localStorage.getItem('kzt_groups');
    return saved ? JSON.parse(saved) : INITIAL_GROUPS;
  });

  const [classes, setClasses] = useState<ScheduledClass[]>(() => {
    const saved = localStorage.getItem('kzt_classes');
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('kzt_payments');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [googleSheets, setGoogleSheets] = useState<GoogleSheetRow[]>(() => {
    const saved = localStorage.getItem('kzt_gsheets');
    return saved ? JSON.parse(saved) : INITIAL_GOOGLE_SHEETS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('kzt_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('kzt_logs');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
  });

  // Current session
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('kzt_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Navigation & Meeting
  const [currentView, setCurrentView] = useState<string>('landing');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [activeMeetingClass, setActiveMeetingClass] = useState<ScheduledClass | null>(null);
  const [isSimulatedTimeLive, setIsSimulatedTimeLive] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('kzt_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('kzt_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('kzt_teachers', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('kzt_admins', JSON.stringify(admins));
  }, [admins]);

  useEffect(() => {
    localStorage.setItem('kzt_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('kzt_groups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('kzt_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('kzt_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('kzt_gsheets', JSON.stringify(googleSheets));
  }, [googleSheets]);

  useEffect(() => {
    localStorage.setItem('kzt_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('kzt_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('kzt_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('kzt_current_user');
    }
  }, [currentUser]);

  // Derived current role & entity
  const currentRole = currentUser?.role || null;
  const currentStudent = students.find((s) => s.userId === currentUser?.id) || null;
  const currentTeacher = teachers.find((t) => t.userId === currentUser?.id) || null;
  const currentAdmin = admins.find((a) => a.userId === currentUser?.id) || null;

  // Logging helper
  const addLog = (action: string, details: string) => {
    const newLog: ActivityLog = {
      id: 'log_' + Date.now(),
      userId: currentUser?.id || 'system',
      userName: currentUser?.name || 'Guest User',
      userRole: currentUser?.role || 'student',
      action,
      details,
      timestamp: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // Notification helper
  const addNotification = (notif: Omit<AppNotification, 'id' | 'readStatus' | 'createdAt'>) => {
    const newN: AppNotification = {
      ...notif,
      id: 'notif_' + Date.now(),
      readStatus: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newN, ...prev]);
  };

  // Helper to auto-detect role from any identifier (Student ID, email, phone, keyword)
  const identifyRole = (identifier: string): { role: Role | null; name?: string; label?: string } => {
    if (!identifier || identifier.trim().length === 0) {
      return { role: null };
    }
    const trimmed = identifier.trim().toLowerCase();

    // 1. Check Student ID or Student records
    const studentMatch = students.find(
      (s) =>
        s.studentId.toLowerCase() === trimmed ||
        s.studentId.toLowerCase().includes(trimmed) ||
        s.mobile === trimmed ||
        ((s as any).email && (s as any).email.toLowerCase() === trimmed)
    );
    if (studentMatch || trimmed.startsWith('kt') || trimmed.includes('student')) {
      const name = studentMatch ? studentMatch.fullName : 'Student Account';
      return { role: 'student', name, label: 'طالب علم (Student)' };
    }

    // 2. Check Teacher records
    const teacherMatch = teachers.find(
      (t) =>
        t.email.toLowerCase() === trimmed ||
        t.mobile === trimmed ||
        t.id.toLowerCase() === trimmed ||
        (t.teacherId && t.teacherId.toLowerCase() === trimmed)
    );
    if (teacherMatch || trimmed.includes('teacher') || trimmed.includes('qari')) {
      const name = teacherMatch ? teacherMatch.fullName : 'Teacher Account';
      return { role: 'teacher', name, label: 'استاد محترم (Teacher)' };
    }

    // 3. Check Super Admin
    if (
      trimmed === 'tajweed25' ||
      trimmed === 'superadmin' ||
      trimmed.includes('superadmin') ||
      trimmed === 'founder@kanzutajweed.com'
    ) {
      return { role: 'super_admin', name: 'Super Admin (Head of Academy)', label: 'سپر ایڈمن (Super Admin)' };
    }

    // 4. Check Admin records
    const adminMatch = admins.find(
      (a) =>
        a.email.toLowerCase() === trimmed ||
        (a.mobile && a.mobile === trimmed) ||
        (a.phone && a.phone === trimmed)
    );
    if (adminMatch || trimmed.includes('admin')) {
      const isSuper = (adminMatch as any)?.role === 'super_admin' || trimmed.includes('super');
      return {
        role: isSuper ? 'super_admin' : 'admin',
        name: adminMatch?.fullName || adminMatch?.name || 'Academic Administrator',
        label: isSuper ? 'سپر ایڈمن (Super Admin)' : 'ایڈمن (Academic Admin)',
      };
    }

    // 5. Fallback check on User list
    const userMatch = users.find(
      (u) =>
        u.email.toLowerCase() === trimmed ||
        u.phone === trimmed ||
        u.name.toLowerCase().includes(trimmed)
    );
    if (userMatch) {
      let roleLabel = 'صارف (User)';
      if (userMatch.role === 'super_admin') roleLabel = 'سپر ایڈمن (Super Admin)';
      else if (userMatch.role === 'admin') roleLabel = 'ایڈمن (Admin)';
      else if (userMatch.role === 'teacher') roleLabel = 'استاد (Teacher)';
      else if (userMatch.role === 'student') roleLabel = 'طالب علم (Student)';
      return { role: userMatch.role, name: userMatch.name, label: roleLabel };
    }

    return { role: null };
  };

  // Unified single login function - automatically detects account role
  const login = (identifier: string, password?: string): { success: boolean; message?: string } => {
    const trimmed = identifier.trim().toLowerCase();
    if (!trimmed) {
      return { success: false, message: 'Please enter your Student ID, Email, or Mobile number.' };
    }

    let targetUser: User | undefined;

    // 1. Try matching student by Student ID, mobile, or email
    const studentMatch = students.find(
      (s) =>
        s.studentId.toLowerCase() === trimmed ||
        s.mobile === trimmed ||
        ((s as any).email && (s as any).email.toLowerCase() === trimmed)
    );
    if (studentMatch) {
      targetUser = users.find((u) => u.id === studentMatch.userId || (u as any).studentId === studentMatch.studentId);
    }

    // 2. Try matching teacher by email, mobile, or ID
    if (!targetUser) {
      const teacherMatch = teachers.find(
        (t) =>
          t.email.toLowerCase() === trimmed ||
          t.mobile === trimmed ||
          t.id.toLowerCase() === trimmed ||
          (t.teacherId && t.teacherId.toLowerCase() === trimmed)
      );
      if (teacherMatch) {
        targetUser = users.find((u) => u.id === teacherMatch.userId || u.email.toLowerCase() === teacherMatch.email.toLowerCase());
      }
    }

    // 3. Try matching admin by email, mobile, or phone
    if (!targetUser) {
      const adminMatch = admins.find(
        (a) =>
          a.email.toLowerCase() === trimmed ||
          (a.mobile && a.mobile === trimmed) ||
          (a.phone && a.phone === trimmed)
      );
      if (adminMatch) {
        targetUser = users.find((u) => u.id === adminMatch.userId || u.email.toLowerCase() === adminMatch.email.toLowerCase());
      }
    }

    // 4. Try matching direct users list by username, email, phone, or ID
    if (!targetUser) {
      targetUser = users.find(
        (u) =>
          (u.username && u.username.toLowerCase() === trimmed) ||
          u.email.toLowerCase() === trimmed ||
          u.phone === trimmed ||
          u.id.toLowerCase() === trimmed
      );
    }

    // 5. Convenient keyword match for quick testing (e.g. user typed "superadmin", "teacher", etc.)
    if (!targetUser) {
      if (trimmed === 'tajweed25' || trimmed === 'superadmin' || trimmed === 'super_admin') {
        targetUser = users.find((u) => u.role === 'super_admin');
      } else if (trimmed === 'admin') {
        targetUser = users.find((u) => u.role === 'admin');
      } else if (trimmed === 'teacher' || trimmed === 'qari') {
        targetUser = users.find((u) => u.role === 'teacher');
      } else if (trimmed === 'student') {
        targetUser = users.find((u) => u.role === 'student');
      }
    }

    if (!targetUser) {
      return {
        success: false,
        message: 'Account not found. Please verify your Student ID, Email, or Mobile number.',
      };
    }

    // Validate password if user supplied one (allow bypass if demo click / blank password in testing)
    if (password && password.trim().length > 0) {
      const isSuperMatch =
        targetUser.role === 'super_admin' &&
        (password === 'Tajweed26' || password === targetUser.password || password.toLowerCase() === 'tajweed26');
      if (!isSuperMatch && targetUser.password && targetUser.password !== password) {
        return { success: false, message: 'Invalid password. Please check your credentials.' };
      }
    }

    if (targetUser.status !== 'active') {
      return { success: false, message: 'This account has been deactivated. Please contact academy administration.' };
    }

    setCurrentUser(targetUser);
    setCurrentView('dashboard');
    addLog('USER_LOGIN', `User ${targetUser.name} (${targetUser.role}) logged in successfully via unified portal.`);
    return { success: true };
  };

  const logout = () => {
    if (currentUser) {
      addLog('USER_LOGOUT', `User ${currentUser.name} logged out.`);
    }
    setCurrentUser(null);
    setCurrentView('landing');
  };

  const switchUserRole = (role: Role, specificUserId?: string) => {
    let targetUser: User | undefined;

    if (specificUserId) {
      targetUser = users.find((u) => u.id === specificUserId);
    }

    if (!targetUser) {
      targetUser = users.find((u) => u.role === role);
    }

    if (targetUser) {
      setCurrentUser(targetUser);
      setCurrentView('dashboard');
      addLog('SWITCH_ROLE', `Role switched to ${role} (${targetUser.name})`);
    }
  };

  const changePassword = (userId: string, newPass: string): boolean => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, password: newPass } : u))
    );
    if (currentUser && currentUser.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, password: newPass } : null));
    }
    addLog('PASSWORD_CHANGED', `User ${userId} updated their password.`);
    return true;
  };

  // Automatic Student ID Generation
  // Structure: KT + Year (2 digits) + Month (2 digits) + 4-digit Serial
  const generateStudentId = (): string => {
    const now = new Date();
    const yearStr = now.getFullYear().toString().slice(-2); // "26"
    const monthStr = String(now.getMonth() + 1).padStart(2, '0'); // "09"
    const prefix = `KT${yearStr}${monthStr}`;

    const matchingIds = students
      .map((s) => s.studentId)
      .filter((id) => id.startsWith(prefix));

    let maxSerial = 0;
    matchingIds.forEach((id) => {
      const serialPart = parseInt(id.slice(prefix.length), 10);
      if (!isNaN(serialPart) && serialPart > maxSerial) {
        maxSerial = serialPart;
      }
    });

    const nextSerial = String(maxSerial + 1).padStart(4, '0');
    return `${prefix}${nextSerial}`;
  };

  // Student Admission Form Submission
  const submitAdmission = (
    formData: Omit<Student, 'id' | 'studentId' | 'userId' | 'admissionStatus' | 'initialPassword' | 'createdAt'>
  ) => {
    const studentId = generateStudentId();
    const userId = 'user_std_' + Date.now();
    // Initial password = last 6 digits of mobile number
    const mobileDigits = formData.mobile.replace(/\D/g, '');
    const initialPassword = mobileDigits.slice(-6) || '123456';

    const newUser: User = {
      id: userId,
      name: formData.fullName,
      email: `${studentId.toLowerCase()}@kanzutajweed.com`,
      phone: formData.mobile,
      password: initialPassword,
      role: 'student',
      status: 'active',
      avatar: formData.gender === 'female'
        ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
    };

    const newStudent: Student = {
      ...formData,
      id: 'student_' + Date.now(),
      studentId,
      userId,
      admissionStatus: 'pending',
      initialPassword,
      createdAt: new Date().toISOString(),
    };

    const courseObj = courses.find((c) => c.id === formData.courseId);

    // Synchronize to Google Sheets
    const newSheetRow: GoogleSheetRow = {
      id: 'gs_' + Date.now(),
      studentId,
      name: formData.fullName,
      mobile: formData.mobile,
      course: courseObj?.name || 'General Tajweed',
      classType: formData.classType === 'group' ? 'Group Class' : 'One-to-One Class',
      admissionDate: new Date().toISOString().split('T')[0],
      status: 'Pending Verification',
      assignedTeacher: 'Unassigned',
      assignedGroup: 'Unassigned',
      classTime: formData.preferredTime,
      lastSyncedAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    setStudents((prev) => [newStudent, ...prev]);
    setGoogleSheets((prev) => [newSheetRow, ...prev]);

    // Admin Notification
    addNotification({
      userId: 'admin',
      title: 'New Admission Application',
      urduTitle: 'نئی داخلہ درخواست',
      message: `${formData.fullName} applied for ${courseObj?.name || 'Tajweed'} (${formData.classType}). Student ID: ${studentId}`,
      urduMessage: `${formData.fullName} نے داخلہ درخواست جمع کروائی۔ اسٹوڈنٹ آئی ڈی: ${studentId}`,
      type: 'info',
    });

    addLog('NEW_ADMISSION', `New admission submitted for ${formData.fullName} (${studentId}). Synced to Google Sheets.`);

    return { student: newStudent, studentId, initialPassword };
  };

  // Admin Admission Verification
  const verifyAdmission = (
    studentId: string,
    courseIdOrPayload: any,
    teacherIdArg?: string,
    classTypeArg?: ClassType,
    groupIdArg?: string,
    oneToOneDaysArg?: string[],
    oneToOneTimeArg?: string
  ): boolean => {
    const isPayloadObj = typeof courseIdOrPayload === 'object' && courseIdOrPayload !== null;
    const courseId = isPayloadObj ? courseIdOrPayload.courseId : courseIdOrPayload;
    const teacherId = isPayloadObj ? courseIdOrPayload.teacherId : teacherIdArg;
    const classType: ClassType = isPayloadObj ? (courseIdOrPayload.classType || 'group') : (classTypeArg || 'group');
    const groupId = isPayloadObj ? courseIdOrPayload.groupId : groupIdArg;
    const oneToOneDays = isPayloadObj
      ? (courseIdOrPayload.oneToOneDays || (courseIdOrPayload.oneToOneSlot ? [courseIdOrPayload.oneToOneSlot.split(' at ')[0]] : ['Monday', 'Wednesday', 'Friday']))
      : oneToOneDaysArg;
    const oneToOneTime = isPayloadObj
      ? (courseIdOrPayload.oneToOneTime || (courseIdOrPayload.oneToOneSlot ? courseIdOrPayload.oneToOneSlot.split(' at ')[1] : '18:00'))
      : oneToOneTimeArg;

    const student = students.find((s) => s.studentId === studentId || s.id === studentId);
    if (!student) return false;

    const teacher = teachers.find((t) => t.id === teacherId);
    const course = courses.find((c) => c.id === courseId);
    const group = groupId ? groups.find((g) => g.id === groupId) : null;

    const updatedStudent: Student = {
      ...student,
      admissionStatus: 'verified',
      assignedCourseId: courseId,
      assignedTeacherId: teacherId,
      assignedGroupId: groupId,
      oneToOneSchedule: classType === 'one_to_one' && oneToOneDays && oneToOneTime ? {
        days: oneToOneDays,
        time: oneToOneTime,
      } : undefined,
      verifiedAt: new Date().toISOString(),
    };

    setStudents((prev) => prev.map((s) => (s.id === student.id ? updatedStudent : s)));

    // If assigned to a group, increment group count
    if (groupId) {
      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, currentStudents: g.currentStudents + 1 } : g))
      );
    }

    // Schedule a class or link to existing group schedule
    const today = new Date().toISOString().split('T')[0];
    const meetCode = Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 6);
    const newClass: ScheduledClass = {
      id: 'class_' + Date.now(),
      courseId,
      teacherId,
      studentId: classType === 'one_to_one' ? student.id : undefined,
      groupId: classType === 'group' ? groupId : undefined,
      classType,
      date: today,
      startTime: classType === 'one_to_one' ? (oneToOneTime || '18:00') : (group?.startTime || '19:00'),
      endTime: classType === 'one_to_one' ? '18:45' : (group?.endTime || '19:45'),
      meetLink: group?.meetLink || `https://meet.google.com/kan-${meetCode}`,
      status: 'scheduled',
      topic: `${course?.name || 'Tajweed'} - Introductory Articulation & Orientation`,
      notes: `Assigned on admission verification.`,
    };

    setClasses((prev) => [newClass, ...prev]);

    // Update Google Sheet sync row
    setGoogleSheets((prev) =>
      prev.map((r) =>
        r.studentId === studentId
          ? {
              ...r,
              status: 'Active / Verified',
              assignedTeacher: teacher?.fullName || 'Assigned',
              assignedGroup: group?.name || 'N/A (1-on-1)',
              classTime: classType === 'group' ? `${group?.days.join('/')} ${group?.startTime}` : `${oneToOneDays?.join('/')} ${oneToOneTime}`,
              lastSyncedAt: new Date().toISOString(),
            }
          : r
      )
    );

    // Notify student
    addNotification({
      userId: student.userId,
      title: 'Admission Verified!',
      urduTitle: 'داخلہ تصدیق ہو گیا!',
      message: `Your admission is verified. Course: ${course?.name}. Teacher: ${teacher?.fullName}.`,
      urduMessage: `آپ کا داخلہ تصدیق ہو چکا ہے۔ کورس: ${course?.name}، استاد: ${teacher?.fullName}`,
      type: 'success',
    });

    // Notify teacher
    if (teacher) {
      addNotification({
        userId: teacher.userId,
        title: 'New Student Assigned',
        urduTitle: 'نیا طالب علم تفویض کیا گیا',
        message: `${student.fullName} (${student.studentId}) has been assigned to your ${classType === 'group' ? 'group class' : 'one-to-one class'}.`,
        urduMessage: `${student.fullName} کو آپ کی کلاس میں تفویض کیا گیا ہے۔`,
        type: 'info',
      });
    }

    addLog('VERIFIED_ADMISSION', `Verified student ${student.fullName} (${studentId}) with Teacher ${teacher?.fullName}`);
    return true;
  };

  const rejectAdmission = (studentId: string, reason?: string): boolean => {
    const student = students.find((s) => s.studentId === studentId);
    if (!student) return false;

    setStudents((prev) =>
      prev.map((s) => (s.id === student.id ? { ...s, admissionStatus: 'rejected', rejectionReason: reason } : s))
    );

    setGoogleSheets((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status: 'Rejected', lastSyncedAt: new Date().toISOString() } : r))
    );

    addNotification({
      userId: student.userId,
      title: 'Admission Status Update',
      urduTitle: 'داخلہ اسٹیٹس اپ ڈیٹ',
      message: `Your admission request was not approved. Reason: ${reason || 'Capacity limit reached'}.`,
      urduMessage: `آپ کی داخلہ درخواست مسترد کر دی گئی۔ وجہ: ${reason || 'سیٹیں پر ہوچکی ہیں'}۔`,
      type: 'warning',
    });

    addLog('REJECTED_ADMISSION', `Rejected admission for student ${studentId}. Reason: ${reason}`);
    return true;
  };

  // Course Management
  const createCourse = (courseData: Omit<Course, 'id'>): Course => {
    const newCourse: Course = {
      ...courseData,
      id: 'course_' + Date.now(),
    };
    setCourses((prev) => [...prev, newCourse]);
    addLog('CREATE_COURSE', `Created course ${newCourse.name}`);
    return newCourse;
  };

  const updateCourse = (id: string, data: Partial<Course>): boolean => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    addLog('UPDATE_COURSE', `Updated course ${id}`);
    return true;
  };

  const deleteCourse = (id: string): boolean => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    addLog('DELETE_COURSE', `Deleted course ${id}`);
    return true;
  };

  // Teacher Management
  const createTeacher = (teacherData: Omit<Teacher, 'id' | 'teacherId' | 'userId'>, password = 'teacher123'): Teacher => {
    const userId = 'user_tea_' + Date.now();
    const teacherId = `KT-TEA-0${teachers.length + 1}`;

    const newUser: User = {
      id: userId,
      name: teacherData.fullName,
      email: teacherData.email,
      phone: teacherData.mobile,
      password,
      role: 'teacher',
      status: 'active',
      avatar: teacherData.profilePhoto || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
    };

    const newTeacher: Teacher = {
      ...teacherData,
      id: 'teacher_' + Date.now(),
      teacherId,
      userId,
    };

    setUsers((prev) => [...prev, newUser]);
    setTeachers((prev) => [...prev, newTeacher]);
    addLog('CREATE_TEACHER', `Added teacher ${newTeacher.fullName} (${teacherId})`);
    return newTeacher;
  };

  const updateTeacher = (id: string, data: Partial<Teacher>): boolean => {
    setTeachers((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
    addLog('UPDATE_TEACHER', `Updated teacher profile ${id}`);
    return true;
  };

  const toggleTeacherStatus = (id: string): boolean => {
    setTeachers((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const next = t.status === 'active' ? 'inactive' : 'active';
          // also update user status
          setUsers((uPrev) => uPrev.map((u) => (u.id === t.userId ? { ...u, status: next } : u)));
          return { ...t, status: next };
        }
        return t;
      })
    );
    addLog('TOGGLE_TEACHER_STATUS', `Toggled teacher status for ${id}`);
    return true;
  };

  // Group Management
  const createGroup = (groupData: Omit<Group, 'id' | 'currentStudents'>): Group => {
    const newGroup: Group = {
      ...groupData,
      id: 'group_' + Date.now(),
      currentStudents: 0,
    };
    setGroups((prev) => [...prev, newGroup]);
    addLog('CREATE_GROUP', `Created group ${newGroup.name}`);
    return newGroup;
  };

  const updateGroup = (id: string, data: Partial<Group>): boolean => {
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, ...data } : g)));
    addLog('UPDATE_GROUP', `Updated group ${id}`);
    return true;
  };

  const deleteGroup = (id: string): boolean => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
    addLog('DELETE_GROUP', `Deleted group ${id}`);
    return true;
  };

  const addGroup = (groupData: any): Group => {
    const rawDays = groupData.scheduleDays || groupData.days || ['Monday', 'Wednesday', 'Friday'];
    const startTime = groupData.scheduleTime || groupData.startTime || '19:00';
    const [h, m] = startTime.split(':').map(Number);
    const total = (h || 0) * 60 + (m || 0) + 45;
    const nh = String(Math.floor(total / 60) % 24).padStart(2, '0');
    const nm = String(total % 60).padStart(2, '0');
    const endTime = `${nh}:${nm}`;

    return createGroup({
      name: groupData.name,
      courseId: groupData.courseId,
      teacherId: groupData.teacherId,
      days: rawDays,
      scheduleDays: rawDays,
      startTime,
      endTime,
      scheduleTime: startTime,
      capacity: groupData.maxCapacity || groupData.capacity || 10,
      maxCapacity: groupData.maxCapacity || groupData.capacity || 10,
      studentIds: groupData.studentIds || [],
      status: groupData.status || 'active',
      meetLink: groupData.meetLink || 'https://meet.google.com/knz-tjwd-grp',
    });
  };

  const addCourse = (course: Omit<Course, 'id'>): Course => createCourse(course);

  const addTeacher = (
    teacherData: Omit<Teacher, 'id' | 'teacherId' | 'userId'>,
    password?: string
  ): Teacher => createTeacher(teacherData, password);

  const updateStudentStatus = (studentId: string, status: 'active' | 'inactive'): boolean => {
    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, status } : s)));
    addLog('UPDATE_STUDENT_STATUS', `Updated student ${studentId} status to ${status}`);
    return true;
  };

  // PREVENT DOUBLE BOOKING & Class Scheduling
  const checkTeacherConflict = (
    teacherId: string,
    date: string,
    startTime: string,
    endTime?: string,
    excludeClassId?: string
  ): { hasConflict: boolean; reason?: string } => {
    const calcEndTime =
      endTime && endTime.includes(':')
        ? endTime
        : (() => {
            const [h, m] = startTime.split(':').map(Number);
            const total = (h || 0) * 60 + (m || 0) + 45;
            const nh = String(Math.floor(total / 60) % 24).padStart(2, '0');
            const nm = String(total % 60).padStart(2, '0');
            return `${nh}:${nm}`;
          })();

    // 1. Check existing scheduled classes for this teacher
    const conflicts = classes.filter((cls) => {
      if (cls.id === excludeClassId) return false;
      if (cls.teacherId !== teacherId) return false;
      if (cls.status === 'cancelled') return false;
      if (cls.date !== date) return false;

      const clsStart = cls.startTime || cls.time || '00:00';
      const clsEnd = cls.endTime || '23:59';
      // Check time overlap: (startA < endB) && (endA > startB)
      return startTime < clsEnd && calcEndTime > clsStart;
    });

    if (conflicts.length > 0) {
      const c = conflicts[0];
      return {
        hasConflict: true,
        reason: `Teacher already has a scheduled class from ${c.startTime || c.time} to ${c.endTime} on ${date}. Double booking is strictly prohibited.`,
      };
    }

    // 2. Check group classes that recur on this day
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    const teacherGroups = groups.filter(
      (g) => g.teacherId === teacherId && g.status === 'active' && (g.days?.includes(dayOfWeek) || g.scheduleDays?.includes(dayOfWeek))
    );

    for (const g of teacherGroups) {
      if (startTime < g.endTime && calcEndTime > g.startTime) {
        return {
          hasConflict: true,
          reason: `Teacher is already teaching "${g.name}" on ${dayOfWeek}s from ${g.startTime} to ${g.endTime}.`,
        };
      }
    }

    return { hasConflict: false };
  };

  const scheduleClass = (
    classData: any
  ): { success: boolean; message?: string; classItem?: ScheduledClass } => {
    const startTime = classData.startTime || classData.time || '19:00';
    const duration = classData.durationMinutes || 45;
    const calcEndTime =
      classData.endTime ||
      (() => {
        const [h, m] = startTime.split(':').map(Number);
        const total = (h || 0) * 60 + (m || 0) + duration;
        const nh = String(Math.floor(total / 60) % 24).padStart(2, '0');
        const nm = String(total % 60).padStart(2, '0');
        return `${nh}:${nm}`;
      })();

    const conflict = checkTeacherConflict(
      classData.teacherId,
      classData.date,
      startTime,
      calcEndTime
    );

    if (conflict.hasConflict) {
      return { success: false, message: conflict.reason };
    }

    const mappedStatus =
      classData.status === 'in_progress' ? 'live' : classData.status || 'scheduled';

    const newClass: ScheduledClass = {
      id: 'class_' + Date.now(),
      courseId: classData.courseId,
      teacherId: classData.teacherId,
      classType: classData.classType,
      groupId: classData.groupId,
      studentId: classData.studentId,
      date: classData.date,
      startTime,
      endTime: calcEndTime,
      time: startTime,
      durationMinutes: duration,
      meetLink: classData.meetLink || 'https://meet.google.com/knz-tjwd-sim',
      status: mappedStatus,
    };

    setClasses((prev) => [newClass, ...prev]);

    // Send notifications to teacher and student/group
    const teacher = teachers.find((t) => t.id === classData.teacherId);
    if (teacher) {
      addNotification({
        userId: teacher.userId,
        title: 'New Class Scheduled',
        urduTitle: 'نئی کلاس شیڈول کر دی گئی',
        message: `Class scheduled on ${classData.date} at ${startTime}.`,
        urduMessage: `آپ کی کلاس ${classData.date} کو ${startTime} پر شیڈول کی گئی ہے۔`,
        type: 'info',
      });
    }

    if (classData.studentId) {
      const std = students.find((s) => s.id === classData.studentId);
      if (std) {
        addNotification({
          userId: std.userId,
          title: 'New Class Scheduled',
          urduTitle: 'نئی کلاس شیڈول ہوئی ہے',
          message: `Your class with ${teacher?.fullName} is on ${classData.date} at ${startTime}.`,
          urduMessage: `${teacher?.fullName} کے ساتھ آپ کی کلاس ${classData.date} کو ${startTime} پر ہے۔`,
          type: 'info',
        });
      }
    }

    addLog('SCHEDULE_CLASS', `Scheduled class on ${classData.date} at ${startTime} for teacher ${teacher?.fullName}`);
    return { success: true, classItem: newClass };
  };

  const updateClassStatus = (classId: string, status: ScheduledClass['status']): boolean => {
    setClasses((prev) => prev.map((c) => (c.id === classId ? { ...c, status } : c)));
    addLog('UPDATE_CLASS_STATUS', `Updated class ${classId} status to ${status}`);
    return true;
  };

  // Fee Management (Manual Verification Only)
  const submitFeeProof = (data: {
    studentId: string;
    courseId: string;
    amount: number;
    paymentDate: string;
    paymentMethod: Payment['paymentMethod'];
    referenceId: string;
    screenshot: string;
    note?: string;
  }): Payment => {
    const newPayment: Payment = {
      id: 'pay_' + Date.now(),
      ...data,
      status: 'pending',
    };

    setPayments((prev) => [newPayment, ...prev]);

    const student = students.find((s) => s.studentId === data.studentId || s.id === data.studentId);

    // Notify Admin
    addNotification({
      userId: 'admin',
      title: 'New Fee Verification Request',
      urduTitle: 'فیس تصدیق کی نئی درخواست',
      message: `${student?.fullName || 'Student'} submitted payment proof of ₹${data.amount} (${data.paymentMethod}, Ref: ${data.referenceId}).`,
      urduMessage: `طالب علم ${student?.fullName || ''} نے ${data.amount} روپے کی فیس رسید تصدیق کے لیے بھیجی ہے۔`,
      type: 'warning',
    });

    addLog('SUBMIT_FEE', `Student ${student?.fullName} submitted fee proof of ₹${data.amount}`);
    return newPayment;
  };

  const submitPayment = (data: any): Payment => {
    return submitFeeProof({
      studentId: data.studentId,
      courseId: data.courseId,
      amount: Number(data.amount),
      paymentDate: data.paymentDate,
      paymentMethod: data.paymentMethod || 'UPI',
      referenceId: data.transactionId || data.referenceId || 'TXN' + Date.now(),
      screenshot: data.screenshotUrl || data.screenshot || '',
      note: data.note,
    });
  };

  const verifyPayment = (paymentId: string, adminName: string = 'Admin'): boolean => {
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) return false;

    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? {
              ...p,
              status: 'verified',
              verifiedBy: adminName,
              verifiedAt: new Date().toISOString(),
            }
          : p
      )
    );

    const student = students.find((s) => s.studentId === payment.studentId || s.id === payment.studentId);
    if (student) {
      // Also update student feeStatus
      setStudents((prev) =>
        prev.map((s) =>
          s.id === student.id ? { ...s, feeStatus: 'paid' } : s
        )
      );
      addNotification({
        userId: student.userId,
        title: 'Fee Payment Verified',
        urduTitle: 'فیس کی تصدیق ہو گئی',
        message: `Your payment of ₹${payment.amount} has been verified and marked as PAID!`,
        urduMessage: `آپ کی ادا کردہ فیس (${payment.amount} روپے) کی تصدیق ہو چکی ہے اور PAID نشان زد کر دی گئی ہے۔`,
        type: 'success',
      });
    }

    addLog('VERIFY_PAYMENT', `Admin ${adminName} verified payment ${paymentId} (₹${payment.amount}) as PAID.`);
    return true;
  };

  const rejectPayment = (paymentId: string, reason?: string): boolean => {
    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, status: 'rejected', rejectionReason: reason } : p))
    );

    const payment = payments.find((p) => p.id === paymentId);
    if (payment) {
      const student = students.find((s) => s.studentId === payment.studentId || s.id === payment.studentId);
      if (student) {
        addNotification({
          userId: student.userId,
          title: 'Payment Verification Issue',
          urduTitle: 'فیس تصدیق میں مسئلہ',
          message: `Your payment verification was rejected: ${reason || 'Invalid reference or illegible screenshot.'}`,
          urduMessage: `آپ کی فیس رسید مسترد کر دی گئی: ${reason || 'ریفرنس نمبر یا رسید واضح نہیں ہے'}۔`,
          type: 'warning',
        });
      }
    }

    addLog('REJECT_PAYMENT', `Rejected payment ${paymentId}. Reason: ${reason}`);
    return true;
  };

  // Super Admin Management
  const createAdmin = (
    name: string,
    email: string,
    phone: string,
    permissions: AdminPermissions
  ): AdminUser => {
    const userId = 'user_adm_' + Date.now();
    const newUser: User = {
      id: userId,
      name,
      email,
      phone,
      password: 'admin123',
      role: 'admin',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
    };

    const newAdmin: AdminUser = {
      id: 'adm_' + Date.now(),
      userId,
      name,
      email,
      phone,
      status: 'active',
      permissions,
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    setAdmins((prev) => [...prev, newAdmin]);
    addLog('CREATE_ADMIN', `Super Admin created new admin ${name} (${email})`);
    return newAdmin;
  };

  const updateAdminPermissions = (adminId: string, permissions: AdminPermissions): boolean => {
    setAdmins((prev) => prev.map((a) => (a.id === adminId ? { ...a, permissions } : a)));
    addLog('UPDATE_ADMIN_PERMISSIONS', `Updated granular permissions for admin ${adminId}`);
    return true;
  };

  const toggleAdminStatus = (adminId: string): boolean => {
    setAdmins((prev) =>
      prev.map((a) => {
        if (a.id === adminId) {
          const next = a.status === 'active' ? 'inactive' : 'active';
          setUsers((uPrev) => uPrev.map((u) => (u.id === a.userId ? { ...u, status: next } : u)));
          return { ...a, status: next };
        }
        return a;
      })
    );
    addLog('TOGGLE_ADMIN_STATUS', `Toggled account status for admin ${adminId}`);
    return true;
  };

  const deleteAdmin = (adminId: string): boolean => {
    const admin = admins.find((a) => a.id === adminId);
    if (!admin) return false;

    setAdmins((prev) => prev.filter((a) => a.id !== adminId));
    setUsers((prev) => prev.filter((u) => u.id !== admin.userId));
    addLog('DELETE_ADMIN', `Deleted admin ${admin.name} (${adminId})`);
    return true;
  };

  const addAdmin = (data: any): AdminUser => {
    return createAdmin(
      data.fullName || data.name,
      data.email,
      data.mobile || data.phone || '9876543210',
      data.permissions
    );
  };

  const updateAdmin = (id: string, data: any): boolean => {
    setAdmins((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          return {
            ...a,
            ...data,
            name: data.fullName || data.name || a.name,
            fullName: data.fullName || data.name || a.fullName,
            phone: data.mobile || data.phone || a.phone,
            mobile: data.mobile || data.phone || a.mobile,
            permissions: data.permissions || a.permissions,
          };
        }
        return a;
      })
    );
    addLog('UPDATE_ADMIN', `Updated admin ${id}`);
    return true;
  };

  // Google Sheets Sync
  const syncGoogleSheets = () => {
    const updatedRows = students.map((std) => {
      const course = courses.find((c) => c.id === (std.assignedCourseId || std.courseId));
      const teacher = teachers.find((t) => t.id === std.assignedTeacherId);
      const group = groups.find((g) => g.id === std.assignedGroupId);

      let classTime = std.preferredTime;
      if (std.assignedGroupId && group) {
        classTime = `${group.days.join('/')} ${group.startTime}`;
      } else if (std.oneToOneSchedule) {
        classTime = `${std.oneToOneSchedule.days.join('/')} ${std.oneToOneSchedule.time}`;
      }

      return {
        id: 'gs_' + std.id,
        studentId: std.studentId,
        name: std.fullName,
        mobile: std.mobile,
        course: course?.name || 'General Tajweed',
        classType: std.classType === 'group' ? 'Group Class' : 'One-to-One Class',
        admissionDate: std.createdAt.split('T')[0],
        status: std.admissionStatus === 'verified' ? 'Active / Verified' : std.admissionStatus === 'rejected' ? 'Rejected' : 'Pending Verification',
        assignedTeacher: teacher?.fullName || 'Unassigned',
        assignedGroup: group?.name || (std.classType === 'one_to_one' ? 'N/A (1-on-1)' : 'Unassigned'),
        classTime,
        lastSyncedAt: new Date().toISOString(),
      };
    });

    setGoogleSheets(updatedRows);
    addLog('GOOGLE_SHEETS_SYNC', `Synchronized ${updatedRows.length} rows with connected Google Sheet webhook.`);
  };

  const exportGoogleSheetsCsv = () => {
    const headers = [
      'Student ID',
      'Name',
      'Mobile',
      'Course',
      'Class Type',
      'Admission Date',
      'Status',
      'Assigned Teacher',
      'Assigned Group',
      'Class Time',
      'Last Synced At',
    ];

    const rows = googleSheets.map((r) => [
      `"${r.studentId}"`,
      `"${r.name}"`,
      `"${r.mobile}"`,
      `"${r.course}"`,
      `"${r.classType}"`,
      `"${r.admissionDate}"`,
      `"${r.status}"`,
      `"${r.assignedTeacher}"`,
      `"${r.assignedGroup}"`,
      `"${r.classTime}"`,
      `"${r.lastSyncedAt}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kanz_ut_tajweed_admissions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Notification read handler
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, readStatus: true } : n)));
  };

  const unreadNotificationsCount = notifications.filter((n) => {
    if (n.readStatus) return false;
    if (!currentUser) return false;
    if (n.userId === 'all') return true;
    if (n.userId === currentUser.id) return true;
    if (n.userId === currentUser.role) return true;
    return false;
  }).length;

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,

        currentUser,
        currentRole,
        currentStudent,
        currentTeacher,
        currentAdmin,
        login,
        identifyRole,
        logout,
        switchUserRole,
        changePassword,

        currentView,
        setCurrentView,
        activeTab,
        setActiveTab,
        isSidebarOpen,
        setSidebarOpen,
        activeMeetingClass,
        setActiveMeetingClass,
        isSimulatedTimeLive,
        setIsSimulatedTimeLive,

        users,
        students,
        teachers,
        admins,
        courses,
        groups,
        classes,
        payments,
        googleSheets,
        notifications,
        activityLogs,

        generateStudentId,
        updateStudentStatus,
        admissions: students.filter((s) => s.admissionStatus === 'pending'),
        submitAdmission,
        verifyAdmission,
        rejectAdmission,

        createCourse,
        addCourse,
        updateCourse,
        deleteCourse,

        createTeacher,
        addTeacher,
        updateTeacher,
        toggleTeacherStatus,

        createGroup,
        addGroup,
        updateGroup,
        deleteGroup,

        checkTeacherConflict,
        scheduleClass,
        updateClassStatus,

        submitFeeProof,
        submitPayment,
        verifyPayment,
        rejectPayment,

        createAdmin,
        addAdmin,
        updateAdmin,
        updateAdminPermissions,
        toggleAdminStatus,
        deleteAdmin,

        syncGoogleSheets,
        exportGoogleSheetsCsv,

        markNotificationAsRead,
        unreadNotificationsCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
