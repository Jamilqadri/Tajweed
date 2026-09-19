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
import {
  saveDoc,
  deleteDocFromDb,
  subscribeCollection,
  seedCollectionIfEmpty,
} from '../lib/firestoreRepository';

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
  deleteStudent: (studentId: string) => boolean;
  transferStudentTeacher: (studentId: string, newTeacherId: string) => boolean;
  transferStudentAdmin: (studentId: string, newAdminId: string) => boolean;
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
  createTeacher: (
    teacherData: Omit<Teacher, 'id' | 'teacherId' | 'userId'>,
    password?: string,
    customUserId?: string
  ) => Teacher;
  addTeacher: (
    teacherData: Omit<Teacher, 'id' | 'teacherId' | 'userId'>,
    password?: string,
    customUserId?: string
  ) => Teacher;
  updateTeacher: (id: string, data: Partial<Teacher>) => boolean;
  toggleTeacherStatus: (id: string) => boolean;
  deleteTeacher: (id: string) => boolean;

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
  createAdmin: (
    name: string,
    email: string,
    phone: string,
    permissions: AdminPermissions,
    password?: string,
    customUserId?: string
  ) => AdminUser;
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

  // Centralized State Stores - Real-time Single Source of Truth via Firestore
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [teachers, setTeachers] = useState<Teacher[]>(INITIAL_TEACHERS);
  const [admins, setAdmins] = useState<AdminUser[]>(INITIAL_ADMINS);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [groups, setGroups] = useState<Group[]>(INITIAL_GROUPS);
  const [classes, setClasses] = useState<ScheduledClass[]>(INITIAL_CLASSES);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [googleSheets, setGoogleSheets] = useState<GoogleSheetRow[]>(INITIAL_GOOGLE_SHEETS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);

  // Current session (kept in memory / sessionStorage per browser tab session - no student/teacher data in localStorage)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = sessionStorage.getItem('kzt_session_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (currentUser) {
        sessionStorage.setItem('kzt_session_user', JSON.stringify(currentUser));
      } else {
        sessionStorage.removeItem('kzt_session_user');
      }
    } catch {}
  }, [currentUser]);

  // Purge any stale database cache from localStorage so client strictly relies on centralized database
  useEffect(() => {
    try {
      const legacyDbKeys = [
        'kzt_users',
        'kzt_students',
        'kzt_teachers',
        'kzt_admins',
        'kzt_courses',
        'kzt_groups',
        'kzt_classes',
        'kzt_payments',
        'kzt_gsheets',
        'kzt_notifications',
        'kzt_logs',
        'kzt_current_user',
      ];
      legacyDbKeys.forEach((key) => localStorage.removeItem(key));
    } catch {}
  }, []);

  // Centralized Cloud Database Synchronization (Firestore Single Source of Truth)
  useEffect(() => {
    let isMounted = true;

    // 1. Ensure initial cloud database collections are seeded if Firestore is fresh
    const bootstrapCloudDb = async () => {
      try {
        await Promise.allSettled([
          seedCollectionIfEmpty('students', INITIAL_STUDENTS),
          seedCollectionIfEmpty('teachers', INITIAL_TEACHERS),
          seedCollectionIfEmpty('users', INITIAL_USERS),
          seedCollectionIfEmpty('admins', INITIAL_ADMINS),
          seedCollectionIfEmpty('courses', INITIAL_COURSES),
          seedCollectionIfEmpty('groups', INITIAL_GROUPS),
          seedCollectionIfEmpty('classes', INITIAL_CLASSES),
          seedCollectionIfEmpty('payments', INITIAL_PAYMENTS),
          seedCollectionIfEmpty('googleSheets', INITIAL_GOOGLE_SHEETS),
          seedCollectionIfEmpty('notifications', INITIAL_NOTIFICATIONS),
          seedCollectionIfEmpty('activityLogs', INITIAL_ACTIVITY_LOGS),
        ]);
      } catch (err) {
        console.error('Firestore bootstrap error:', err);
      }
    };
    bootstrapCloudDb();

    // 2. Real-time subscriptions across all collections
    const unsubs: Array<() => void> = [];

    unsubs.push(
      subscribeCollection<Student>('students', (remote) => {
        if (!isMounted) return;
        if (remote && remote.length > 0) {
          setStudents(remote);
        }
      })
    );

    unsubs.push(
      subscribeCollection<Teacher>('teachers', (remote) => {
        if (!isMounted) return;
        if (remote && remote.length > 0) {
          setTeachers(remote);
        }
      })
    );

    unsubs.push(
      subscribeCollection<User>('users', (remote) => {
        if (!isMounted) return;
        if (remote && remote.length > 0) {
          setUsers(remote);
        }
      })
    );

    unsubs.push(
      subscribeCollection<AdminUser>('admins', (remote) => {
        if (!isMounted) return;
        if (remote && remote.length > 0) {
          setAdmins(remote);
        }
      })
    );

    unsubs.push(
      subscribeCollection<Course>('courses', (remote) => {
        if (!isMounted) return;
        if (remote && remote.length > 0) {
          setCourses(remote);
        }
      })
    );

    unsubs.push(
      subscribeCollection<Group>('groups', (remote) => {
        if (!isMounted) return;
        if (remote && remote.length > 0) {
          setGroups(remote);
        }
      })
    );

    unsubs.push(
      subscribeCollection<ScheduledClass>('classes', (remote) => {
        if (!isMounted) return;
        if (remote && remote.length > 0) {
          setClasses(remote);
        }
      })
    );

    unsubs.push(
      subscribeCollection<Payment>('payments', (remote) => {
        if (!isMounted) return;
        if (remote && remote.length > 0) {
          setPayments(remote);
        }
      })
    );

    unsubs.push(
      subscribeCollection<GoogleSheetRow>('googleSheets', (remote) => {
        if (!isMounted) return;
        if (remote && remote.length > 0) {
          setGoogleSheets(remote);
        }
      })
    );

    unsubs.push(
      subscribeCollection<AppNotification>('notifications', (remote) => {
        if (!isMounted) return;
        if (remote && remote.length > 0) {
          setNotifications(remote);
        }
      })
    );

    unsubs.push(
      subscribeCollection<ActivityLog>('activityLogs', (remote) => {
        if (!isMounted) return;
        if (remote && remote.length > 0) {
          setActivityLogs(remote);
        }
      })
    );

    return () => {
      isMounted = false;
      unsubs.forEach((unsub) => unsub());
    };
  }, []);

  // Navigation & Meeting
  const [currentView, setCurrentView] = useState<string>('landing');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [activeMeetingClass, setActiveMeetingClass] = useState<ScheduledClass | null>(null);
  const [isSimulatedTimeLive, setIsSimulatedTimeLive] = useState<boolean>(false);

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
    saveDoc('activityLogs', newLog.id, newLog).catch((e) => console.error('Error saving log to Firestore:', e));
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
    saveDoc('notifications', newN.id, newN).catch((e) => console.error('Error saving notification to Firestore:', e));
  };

  // Helper to auto-detect role from any identifier (Student ID, email, phone, custom User ID, keyword)
  const identifyRole = (identifier: string): { role: Role | null; name?: string; label?: string } => {
    if (!identifier || identifier.trim().length === 0) {
      return { role: null };
    }
    const trimmed = identifier.trim().toLowerCase();

    // 1. Check Super Admin
    if (
      trimmed === 'tajweed25' ||
      trimmed === 'superadmin' ||
      trimmed.includes('superadmin') ||
      trimmed === 'founder@kanzutajweed.com'
    ) {
      return { role: 'super_admin', name: 'Super Admin (Head of Academy)', label: 'سپر ایڈمن (Super Admin)' };
    }

    // 2. Check Teacher records (by Email, Mobile, Teacher ID, User ID, or Database ID)
    const teacherMatch = teachers.find(
      (t) =>
        (t.email && t.email.toLowerCase() === trimmed) ||
        (t.mobile && t.mobile === trimmed) ||
        (t.id && t.id.toLowerCase() === trimmed) ||
        (t.teacherId && t.teacherId.toLowerCase() === trimmed) ||
        (t.userId && t.userId.toLowerCase() === trimmed)
    );
    if (teacherMatch || trimmed.includes('teacher') || trimmed.includes('qari')) {
      const name = teacherMatch ? teacherMatch.fullName : 'Teacher Account';
      return { role: 'teacher', name, label: 'استاد محترم (Teacher)' };
    }

    // 3. Check Admin records (by Email, Mobile, Phone, Admin ID, or User ID)
    if (trimmed === 'ahmadraza@gmail.com') {
      return { role: 'admin', name: 'Ahmad Raza', label: 'ایڈمن (Admin)' };
    }
    const adminMatch = admins.find(
      (a) =>
        (a.email && a.email.toLowerCase() === trimmed) ||
        (a.id && a.id.toLowerCase() === trimmed) ||
        (a.userId && a.userId.toLowerCase() === trimmed) ||
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

    // 4. Check Student ID or Student records (6-digit ID like 260901, mobile number, or legacy KT ID)
    const cleanDigits = trimmed.replace(/\D/g, '');
    const studentMatch = students.find(
      (s) =>
        (s.studentId && s.studentId.toLowerCase() === trimmed) ||
        (s.studentId && s.studentId.replace(/^KT/i, '') === trimmed.replace(/^KT/i, '')) ||
        (s.mobile && s.mobile.replace(/\D/g, '') === cleanDigits && cleanDigits.length >= 6) ||
        ((s as any).email && (s as any).email.toLowerCase() === trimmed)
    );
    const is6DigitStudentId = /^\d{6}$/.test(trimmed) || /^(kt)?\d{6,8}$/i.test(trimmed);
    if (studentMatch || is6DigitStudentId || trimmed.includes('student')) {
      const name = studentMatch ? studentMatch.fullName : 'Student Account';
      return { role: 'student', name, label: 'طالب علم (Student)' };
    }

    // 5. Fallback check on User list
    const userMatch = users.find(
      (u) =>
        (u.email && u.email.toLowerCase() === trimmed) ||
        (u.username && u.username.toLowerCase() === trimmed) ||
        (u.phone && u.phone === trimmed) ||
        (u.id && u.id.toLowerCase() === trimmed) ||
        (u.name && u.name.toLowerCase().includes(trimmed))
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
      return { success: false, message: 'Please enter your Email, Student ID, or Mobile number.' };
    }

    let targetUser: User | undefined;

    // Special check for Admin Ahmad Raza
    if (trimmed === 'ahmadraza@gmail.com') {
      targetUser = users.find((u) => u.email?.toLowerCase() === 'ahmadraza@gmail.com');
      if (!targetUser) {
        targetUser = {
          id: 'user_admin_3',
          name: 'Ahmad Raza',
          email: 'ahmadraza@gmail.com',
          username: 'ahmadraza@gmail.com',
          phone: '9876500004',
          password: 'Ahmad123',
          role: 'admin',
          status: 'active',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          createdAt: new Date().toISOString(),
        };
        setUsers((prev) => [...prev, targetUser!]);
      }
      if (!admins.some((a) => a.email.toLowerCase() === 'ahmadraza@gmail.com')) {
        setAdmins((prev) => [
          ...prev,
          {
            id: 'adm_3',
            userId: 'user_admin_3',
            name: 'Ahmad Raza',
            fullName: 'Ahmad Raza',
            email: 'ahmadraza@gmail.com',
            phone: '9876500004',
            status: 'active',
            initialPassword: 'Ahmad123',
            permissions: {
              students: true,
              teachers: true,
              courses: true,
              groups: true,
              classes: true,
              fees: true,
              admissions: true,
              reports: true,
              settings: true,
              downloadRecordings: true,
            },
            createdAt: '2026-03-01T00:00:00.000Z',
          },
        ]);
      }
    }

    // 1. Check Super Admin keywords or founder email
    if (!targetUser && (trimmed === 'tajweed25' || trimmed === 'superadmin' || trimmed === 'super_admin' || trimmed === 'founder@kanzutajweed.com')) {
      targetUser = users.find((u) => u.role === 'super_admin');
    }

    // 2. Try matching teacher by email, mobile, teacherId, userId, or id
    if (!targetUser) {
      const teacherMatch = teachers.find(
        (t) =>
          (t.email && t.email.toLowerCase() === trimmed) ||
          (t.mobile && t.mobile === trimmed) ||
          (t.id && t.id.toLowerCase() === trimmed) ||
          (t.teacherId && t.teacherId.toLowerCase() === trimmed) ||
          (t.userId && t.userId.toLowerCase() === trimmed)
      );
      if (teacherMatch) {
        targetUser = users.find(
          (u) =>
            u.id === teacherMatch.userId ||
            (u.email && u.email.toLowerCase() === teacherMatch.email.toLowerCase()) ||
            (u.username && u.username.toLowerCase() === teacherMatch.email.toLowerCase())
        );

        // Self-heal/synthesize user record if not pre-seeded
        if (!targetUser) {
          targetUser = {
            id: teacherMatch.userId || 'user_tea_' + teacherMatch.id,
            name: teacherMatch.fullName,
            email: teacherMatch.email,
            username: teacherMatch.email,
            phone: teacherMatch.mobile,
            password: teacherMatch.initialPassword || 'teacher123',
            role: 'teacher',
            status: teacherMatch.status || 'active',
            avatar: teacherMatch.profilePhoto || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
            createdAt: new Date().toISOString(),
          };
          setUsers((prev) => [...prev, targetUser!]);
        }
      }
    }

    // 3. Try matching admin by email, mobile, phone, id, or userId
    if (!targetUser) {
      const adminMatch = admins.find(
        (a) =>
          (a.email && a.email.toLowerCase() === trimmed) ||
          (a.id && a.id.toLowerCase() === trimmed) ||
          (a.userId && a.userId.toLowerCase() === trimmed) ||
          (a.mobile && a.mobile === trimmed) ||
          (a.phone && a.phone === trimmed)
      );
      if (adminMatch) {
        targetUser = users.find(
          (u) =>
            u.id === adminMatch.userId ||
            (u.email && u.email.toLowerCase() === adminMatch.email.toLowerCase()) ||
            (u.username && u.username.toLowerCase() === adminMatch.email.toLowerCase())
        );

        // Self-heal/synthesize user record if not pre-seeded
        if (!targetUser) {
          const isSuper = (adminMatch as any).role === 'super_admin';
          targetUser = {
            id: adminMatch.userId || 'user_adm_' + adminMatch.id,
            name: adminMatch.fullName || adminMatch.name,
            email: adminMatch.email,
            username: adminMatch.email,
            phone: adminMatch.mobile || adminMatch.phone || '9876543210',
            password: (adminMatch as any).initialPassword || 'admin123',
            role: isSuper ? 'super_admin' : 'admin',
            status: adminMatch.status || 'active',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
            createdAt: new Date().toISOString(),
          };
          setUsers((prev) => [...prev, targetUser!]);
        }
      }
    }

    // 4. Try matching student by Student ID (6-digit format or legacy KT), mobile, or email
    if (!targetUser) {
      const cleanDigits = trimmed.replace(/\D/g, '');
      const studentMatch = students.find(
        (s) =>
          (s.studentId && s.studentId.toLowerCase() === trimmed) ||
          (s.studentId && s.studentId.replace(/^KT/i, '') === trimmed.replace(/^KT/i, '')) ||
          (s.mobile && s.mobile.replace(/\D/g, '') === cleanDigits && cleanDigits.length >= 6) ||
          ((s as any).email && (s as any).email.toLowerCase() === trimmed)
      );

      if (studentMatch) {
        targetUser = users.find(
          (u) =>
            u.id === studentMatch.userId ||
            (u.username && u.username.toLowerCase() === studentMatch.studentId.toLowerCase()) ||
            (u.username && u.username.replace(/^KT/i, '') === studentMatch.studentId.replace(/^KT/i, '')) ||
            (u.phone && cleanDigits.length >= 6 && u.phone.replace(/\D/g, '') === cleanDigits)
        );

        // Crucial self-healing: synthesize student user record if missing in users array
        if (!targetUser) {
          const mobileDigits = (studentMatch.mobile || '').replace(/\D/g, '');
          const initialMobilePass = mobileDigits.slice(-6) || '543210';
          targetUser = {
            id: studentMatch.userId || 'user_std_' + studentMatch.id,
            name: studentMatch.fullName,
            email: (studentMatch as any).email || `${studentMatch.studentId.toLowerCase()}@kanzutajweed.com`,
            username: studentMatch.studentId,
            phone: studentMatch.mobile,
            password: studentMatch.initialPassword || initialMobilePass,
            hasChangedPassword: studentMatch.hasChangedPassword || false,
            role: 'student',
            status: studentMatch.admissionStatus === 'rejected' ? 'inactive' : 'active',
            avatar: studentMatch.gender === 'female'
              ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
              : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            createdAt: studentMatch.createdAt || new Date().toISOString(),
          };
          setUsers((prev) => [...prev, targetUser!]);
        }
      }
    }

    // 5. Try matching direct users list by email, username, phone, or ID
    if (!targetUser) {
      targetUser = users.find(
        (u) =>
          (u.email && u.email.toLowerCase() === trimmed) ||
          (u.username && u.username.toLowerCase() === trimmed) ||
          (u.phone && u.phone === trimmed) ||
          (u.id && u.id.toLowerCase() === trimmed)
      );
    }

    // 6. Role aliases for quick testing
    if (!targetUser) {
      if (trimmed === 'admin') {
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
        message: 'Account not found. Please verify your Email, Student ID, or Mobile number.',
      };
    }

    // Validate password if supplied
    if (password && password.trim().length > 0) {
      const cleanPass = password.trim();
      const isSuperMatch =
        targetUser.role === 'super_admin' &&
        (cleanPass === 'Tajweed26' || cleanPass.toLowerCase() === 'tajweed26' || cleanPass === targetUser.password);

      // Student Rule:
      // Initial password = last 6 digits of registered mobile number.
      // This password remains active until the student changes it.
      // After changing, only the new password works.
      if (targetUser.role === 'student') {
        const studentObj = students.find(
          (s) =>
            s.userId === targetUser?.id ||
            (s.studentId && s.studentId.toLowerCase() === (targetUser?.username || '').toLowerCase()) ||
            (s.studentId && s.studentId.replace(/^KT/i, '') === (targetUser?.username || '').replace(/^KT/i, '')) ||
            (s.mobile && s.mobile === targetUser?.phone)
        );
        const hasChanged = targetUser.hasChangedPassword || studentObj?.hasChangedPassword;
        if (hasChanged) {
          // After changing, only the new password works
          const isMatch = targetUser.password === cleanPass || studentObj?.initialPassword === cleanPass;
          if (!isMatch) {
            return {
              success: false,
              message:
                language === 'ur'
                  ? 'غلط پاس ورڈ۔ چونکہ آپ نے پاس ورڈ تبدیل کر لیا ہے، اس لیے صرف نیا پاس ورڈ قابل قبول ہے۔'
                  : 'Invalid password. You have changed your password; only your new password works.',
            };
          }
        } else {
          // Initial password active (last 6 digits of registered mobile)
          const mobileDigits = (studentObj?.mobile || targetUser.phone || '').replace(/\D/g, '');
          const initialMobilePass = mobileDigits.slice(-6);
          const isInitialMatch =
            cleanPass === initialMobilePass ||
            cleanPass === studentObj?.initialPassword ||
            cleanPass === targetUser.password;

          if (!isInitialMatch) {
            return {
              success: false,
              message:
                language === 'ur'
                  ? 'غلط پاس ورڈ۔ طالب علم کا ابتدائی پاس ورڈ رجسٹرڈ موبائل نمبر کے آخری 6 ہندسے ہیں۔'
                  : 'Invalid password. Initial password is the last 6 digits of your registered mobile number.',
            };
          }
        }
      } else if (targetUser.role === 'teacher' || targetUser.role === 'admin' || targetUser.role === 'super_admin') {
        // Admin & Teacher Rule:
        // Login: Email + Password
        // Admin sets initial password. Password can be changed later.
        // After changing, only the new password works.
        const teacherObj = teachers.find(
          (t) => t.userId === targetUser?.id || (t.email && t.email.toLowerCase() === targetUser?.email.toLowerCase())
        );
        const adminObj = admins.find(
          (a) => a.userId === targetUser?.id || (a.email && a.email.toLowerCase() === targetUser?.email.toLowerCase())
        );
        const hasChanged = targetUser.hasChangedPassword || teacherObj?.hasChangedPassword || adminObj?.hasChangedPassword;
        if (hasChanged) {
          const isMatch =
            isSuperMatch ||
            targetUser.password === cleanPass ||
            teacherObj?.initialPassword === cleanPass ||
            (adminObj as any)?.initialPassword === cleanPass;
          if (!isMatch) {
            return {
              success: false,
              message:
                language === 'ur'
                  ? 'غلط پاس ورڈ۔ براہ کرم اپنا نیا تبدیل شدہ پاس ورڈ استعمال کریں۔'
                  : 'Invalid password. Please use your new password.',
            };
          }
        } else {
          const fallbackPassword = teacherObj?.initialPassword || (adminObj as any)?.initialPassword;
          const isValidPassword =
            isSuperMatch ||
            targetUser.password === cleanPass ||
            (fallbackPassword && fallbackPassword === cleanPass) ||
            (targetUser.email?.toLowerCase() === 'ahmadraza@gmail.com' && cleanPass === 'Ahmad123');
          if (!isValidPassword) {
            return {
              success: false,
              message:
                language === 'ur'
                  ? 'غلط پاس ورڈ۔ برائے مہربانی ایڈمن کا مقرر کردہ ابتدائی پاس ورڈ درج کریں۔'
                  : 'Invalid password. Please enter the initial password set by the Administrator.',
            };
          }
        }
      } else {
        if (targetUser.password !== cleanPass) {
          return { success: false, message: 'Invalid password. Please check your credentials.' };
        }
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
    const cleanPass = newPass.trim();
    // 1. Update in users state & Firestore
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, password: cleanPass, hasChangedPassword: true };
          saveDoc('users', u.id, updated).catch((e) => console.error(e));
          return updated;
        }
        return u;
      })
    );
    // 2. Update current session
    if (currentUser && currentUser.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, password: cleanPass, hasChangedPassword: true } : null));
    }
    // 3. Sync to teacher initialPassword if teacher
    setTeachers((prev) =>
      prev.map((t) => {
        if (t.userId === userId || (currentUser?.email && t.email.toLowerCase() === currentUser.email.toLowerCase())) {
          const updated = { ...t, initialPassword: cleanPass, hasChangedPassword: true };
          saveDoc('teachers', t.id, updated).catch((e) => console.error(e));
          return updated;
        }
        return t;
      })
    );
    // 4. Sync to admin initialPassword if admin
    setAdmins((prev) =>
      prev.map((a) => {
        if (a.userId === userId || (currentUser?.email && a.email.toLowerCase() === currentUser.email.toLowerCase())) {
          const updated = { ...a, initialPassword: cleanPass, hasChangedPassword: true };
          saveDoc('admins', a.id, updated).catch((e) => console.error(e));
          return updated;
        }
        return a;
      })
    );
    // 5. Sync to student initialPassword if student
    setStudents((prev) =>
      prev.map((s) => {
        if (
          s.userId === userId ||
          (currentUser?.username && s.studentId && currentUser.username.toLowerCase() === s.studentId.toLowerCase()) ||
          (s.mobile && currentUser?.phone && s.mobile === currentUser.phone)
        ) {
          const updated = { ...s, initialPassword: cleanPass, hasChangedPassword: true };
          saveDoc('students', s.id, updated).catch((e) => console.error(e));
          return updated;
        }
        return s;
      })
    );
    addLog('PASSWORD_CHANGED', `User ${userId} updated their password successfully.`);
    return true;
  };

  // Automatic Student ID Generation
  // 6-digit Format: YY (2 digits) + MM (2 digits) + Serial (2 digits minimum, 01, 02...)
  // Example: 260901, 260902, 260903...
  // October 2026: 261001, 261002, 261003...
  const generateStudentId = (): string => {
    const now = new Date();
    const yearStr = now.getFullYear().toString().slice(-2); // "26"
    const monthStr = String(now.getMonth() + 1).padStart(2, '0'); // "09"
    const prefix = `${yearStr}${monthStr}`; // "2609"

    let maxSerial = 0;
    students.forEach((s) => {
      if (!s.studentId) return;
      const cleanId = s.studentId.replace(/^KT/i, '').trim();
      if (cleanId.startsWith(prefix)) {
        const serialPart = parseInt(cleanId.slice(prefix.length), 10);
        if (!isNaN(serialPart) && serialPart > maxSerial) {
          maxSerial = serialPart;
        }
      }
    });

    const nextSerial = String(maxSerial + 1).padStart(2, '0');
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
      username: studentId,
      phone: formData.mobile,
      password: initialPassword,
      hasChangedPassword: false,
      role: 'student',
      status: 'active',
      avatar: formData.gender === 'female'
        ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
    };

    const courseObj = courses.find((c) => c.id === formData.courseId);
    const applicableFee =
      formData.classType === 'group'
        ? (courseObj?.groupFee ?? courseObj?.fee ?? 500)
        : (courseObj?.oneToOneFee ?? (courseObj?.fee ? courseObj.fee * 2 : 1000));

    const newStudent: Student = {
      ...formData,
      id: 'student_' + Date.now(),
      studentId,
      userId,
      admissionStatus: 'pending',
      status: 'pending',
      assignedTeacher: 'Not Assigned',
      assignedTeacherId: undefined,
      fee: applicableFee,
      monthlyFee: applicableFee,
      feeStatus: 'pending',
      initialPassword,
      hasChangedPassword: false,
      admissionDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    // Synchronize to Google Sheets
    const newSheetRow: GoogleSheetRow = {
      id: 'gs_' + Date.now(),
      studentId,
      name: formData.fullName,
      fullName: formData.fullName,
      fatherName: formData.fatherName,
      gender: formData.gender,
      mobile: formData.mobile,
      whatsapp: formData.whatsapp,
      age: formData.age,
      course: courseObj?.name || 'General Tajweed',
      courseId: formData.courseId,
      classType: formData.classType === 'group' ? 'Group Class' : 'One-to-One Class',
      preferredTime: formData.preferredTime,
      state: formData.state,
      district: formData.district,
      city: formData.city,
      address: formData.address,
      admissionDate: new Date().toISOString().split('T')[0],
      status: 'Pending Verification',
      assignedTeacher: 'Teacher: Not Assigned',
      assignedGroup: 'Unassigned',
      classTime: formData.preferredTime,
      lastSyncedAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    setStudents((prev) => [newStudent, ...prev]);
    setGoogleSheets((prev) => [newSheetRow, ...prev]);

    saveDoc('users', newUser.id, newUser).catch((e) => console.error('Error saving user to Firestore:', e));
    saveDoc('students', newStudent.id, newStudent).catch((e) => console.error('Error saving student to Firestore:', e));
    saveDoc('googleSheets', newSheetRow.id, newSheetRow).catch((e) => console.error('Error saving sheet row to Firestore:', e));

    // Notifications for both Academic Admins and Super Admin
    addNotification({
      userId: 'admin',
      title: 'New Admission Application',
      urduTitle: 'نئی داخلہ درخواست',
      message: `${formData.fullName} applied for ${courseObj?.name || 'Tajweed'} (${formData.classType}). Student ID: ${studentId}`,
      urduMessage: `${formData.fullName} نے داخلہ درخواست جمع کروائی۔ اسٹوڈنٹ آئی ڈی: ${studentId}`,
      type: 'info',
    });

    addNotification({
      userId: 'super_admin',
      title: 'New Admission Application Received',
      urduTitle: 'نیا داخلہ فارم موصول ہوا',
      message: `${formData.fullName} (${studentId}) submitted an admission application for ${courseObj?.name || 'Tajweed'}. Pending verification.`,
      urduMessage: `${formData.fullName} (${studentId}) کا نیا داخلہ فارم موصول ہوا ہے۔ برائے مہربانی ایڈمشن سیکشن سے تصدیق کریں۔`,
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

    const group = groupId ? groups.find((g) => g.id === groupId) : null;
    const effectiveTeacherId = teacherId || (group ? group.teacherId : undefined);
    const teacher = effectiveTeacherId ? teachers.find((t) => t.id === effectiveTeacherId) : null;
    const course = courses.find((c) => c.id === courseId);

    const applicableFee =
      classType === 'group'
        ? (course?.groupFee ?? course?.fee ?? 500)
        : (course?.oneToOneFee ?? (course?.fee ? course.fee * 2 : 1000));

    const updatedStudent: Student = {
      ...student,
      courseId: courseId || student.courseId,
      assignedCourseId: courseId,
      admissionStatus: 'verified',
      status: 'active',
      classType,
      assignedTeacher: teacher ? teacher.fullName : 'Not Assigned',
      assignedTeacherId: effectiveTeacherId,
      assignedGroupId: classType === 'group' ? groupId : undefined,
      groupId: classType === 'group' ? groupId : undefined,
      fee: student.fee || applicableFee,
      monthlyFee: student.monthlyFee || applicableFee,
      oneToOneSchedule: classType === 'one_to_one' && oneToOneDays && oneToOneTime ? {
        days: oneToOneDays,
        time: oneToOneTime,
      } : undefined,
      verifiedAt: new Date().toISOString(),
    };

    setStudents((prev) => prev.map((s) => (s.id === student.id ? updatedStudent : s)));
    saveDoc('students', updatedStudent.id, updatedStudent).catch((e) => console.error('Error saving student to Firestore:', e));

    // If assigned to a group, update group studentIds and currentStudents
    if (groupId) {
      setGroups((prev) =>
        prev.map((g) => {
          if (g.id === groupId) {
            const currentIds = g.studentIds || [];
            const hasStudent = currentIds.includes(student.id) || currentIds.includes(student.studentId);
            const nextIds = hasStudent ? currentIds : [...currentIds, student.id];
            const updated = {
              ...g,
              studentIds: nextIds,
              currentStudents: nextIds.length,
            };
            saveDoc('groups', g.id, updated).catch((e) => console.error(e));
            return updated;
          }
          return g;
        })
      );
    }

    // Update teacher assignedStudentIds
    if (effectiveTeacherId) {
      setTeachers((prev) =>
        prev.map((t) => {
          if (t.id === effectiveTeacherId) {
            const currentStdIds = t.assignedStudentIds || [];
            const hasStudent = currentStdIds.includes(student.id);
            const updated = {
              ...t,
              assignedStudentIds: hasStudent ? currentStdIds : [...currentStdIds, student.id],
            };
            saveDoc('teachers', t.id, updated).catch((e) => console.error(e));
            return updated;
          }
          return t;
        })
      );
    }

    // Schedule a class or link to existing group schedule
    const today = new Date().toISOString().split('T')[0];
    const meetCode = Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 6);
    const newClass: ScheduledClass = {
      id: 'class_' + Date.now(),
      courseId,
      teacherId: effectiveTeacherId,
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
    saveDoc('classes', newClass.id, newClass).catch((e) => console.error(e));

    // Update Google Sheet sync row
    setGoogleSheets((prev) =>
      prev.map((r) => {
        if (r.studentId === studentId) {
          const updated = {
            ...r,
            status: 'Active / Verified',
            assignedTeacher: teacher?.fullName || 'Assigned',
            assignedGroup: group?.name || 'N/A (1-on-1)',
            classTime: classType === 'group' ? `${group?.days.join('/')} ${group?.startTime}` : `${oneToOneDays?.join('/')} ${oneToOneTime}`,
            lastSyncedAt: new Date().toISOString(),
          };
          saveDoc('googleSheets', updated.id, updated).catch((e) => console.error(e));
          return updated;
        }
        return r;
      })
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
    const student = students.find((s) => s.studentId === studentId || s.id === studentId);
    if (!student) return false;

    const updatedStudent: Student = { ...student, admissionStatus: 'rejected', rejectionReason: reason };
    setStudents((prev) =>
      prev.map((s) => (s.id === student.id ? updatedStudent : s))
    );
    saveDoc('students', student.id, updatedStudent).catch((e) => console.error(e));

    setGoogleSheets((prev) =>
      prev.map((r) => {
        if (r.studentId === studentId) {
          const updated = { ...r, status: 'Rejected', lastSyncedAt: new Date().toISOString() };
          saveDoc('googleSheets', updated.id, updated).catch((e) => console.error(e));
          return updated;
        }
        return r;
      })
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
    saveDoc('courses', newCourse.id, newCourse).catch((e) => console.error(e));
    addLog('CREATE_COURSE', `Created course ${newCourse.name}`);
    return newCourse;
  };

  const updateCourse = (id: string, data: Partial<Course>): boolean => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, ...data };
          saveDoc('courses', id, updated).catch((e) => console.error(e));
          return updated;
        }
        return c;
      })
    );
    addLog('UPDATE_COURSE', `Updated course ${id}`);
    return true;
  };

  const deleteCourse = (id: string): boolean => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    deleteDocFromDb('courses', id).catch((e) => console.error(e));
    addLog('DELETE_COURSE', `Deleted course ${id}`);
    return true;
  };

  // Teacher Management
  const createTeacher = (
    teacherData: Omit<Teacher, 'id' | 'teacherId' | 'userId'>,
    password = 'teacher123',
    _customUserId?: string
  ): Teacher => {
    const cleanEmail = teacherData.email.trim().toLowerCase();
    const effectiveUserId = 'user_tea_' + Date.now();
    const teacherId = `KT-TEA-${String(teachers.length + 1).padStart(3, '0')}`;
    const effectivePassword = password || teacherData.initialPassword || 'teacher123';

    const newUser: User = {
      id: effectiveUserId,
      name: teacherData.fullName,
      email: cleanEmail,
      username: cleanEmail, // Email = Login ID
      phone: teacherData.mobile.trim(),
      password: effectivePassword,
      hasChangedPassword: false,
      role: 'teacher',
      status: 'active',
      avatar: teacherData.profilePhoto || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
    };

    const newTeacher: Teacher = {
      ...teacherData,
      id: 'teacher_' + Date.now(),
      teacherId,
      userId: effectiveUserId,
      email: cleanEmail,
      initialPassword: effectivePassword,
      hasChangedPassword: false,
    };

    setUsers((prev) => [...prev, newUser]);
    setTeachers((prev) => [...prev, newTeacher]);
    saveDoc('users', newUser.id, newUser).catch((e) => console.error(e));
    saveDoc('teachers', newTeacher.id, newTeacher).catch((e) => console.error(e));
    addLog('CREATE_TEACHER', `Added teacher ${newTeacher.fullName} (${cleanEmail}) with initial password`);
    return newTeacher;
  };

  const updateTeacher = (id: string, data: Partial<Teacher>): boolean => {
    setTeachers((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, ...data };
          saveDoc('teachers', id, updated).catch((e) => console.error(e));
          if (data.initialPassword || data.fullName || data.mobile || data.email) {
            setUsers((uPrev) =>
              uPrev.map((u) => {
                if (u.id === t.userId) {
                  const updatedU = {
                    ...u,
                    password: data.initialPassword || u.password,
                    name: data.fullName || u.name,
                    email: data.email || u.email,
                    phone: data.mobile || u.phone,
                  };
                  saveDoc('users', u.id, updatedU).catch((e) => console.error(e));
                  return updatedU;
                }
                return u;
              })
            );
          }
          return updated;
        }
        return t;
      })
    );
    addLog('UPDATE_TEACHER', `Updated teacher profile ${id}`);
    return true;
  };

  const toggleTeacherStatus = (id: string): boolean => {
    setTeachers((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const next: 'active' | 'inactive' = t.status === 'active' ? 'inactive' : 'active';
          const updated = { ...t, status: next };
          saveDoc('teachers', id, updated).catch((e) => console.error(e));
          setUsers((uPrev) =>
            uPrev.map((u) => {
              if (u.id === t.userId) {
                const uUpdated = { ...u, status: next };
                saveDoc('users', u.id, uUpdated).catch((e) => console.error(e));
                return uUpdated;
              }
              return u;
            })
          );
          return updated;
        }
        return t;
      })
    );
    addLog('TOGGLE_TEACHER_STATUS', `Toggled teacher status for ${id}`);
    return true;
  };

  const deleteTeacher = (teacherId: string): boolean => {
    const teacher = teachers.find((t) => t.id === teacherId || t.teacherId === teacherId);
    if (!teacher) return false;

    // Remove teacher from state
    setTeachers((prev) => prev.filter((t) => t.id !== teacher.id));
    // Remove linked user account
    setUsers((prev) => prev.filter((u) => u.id !== teacher.userId && u.email.toLowerCase() !== teacher.email.toLowerCase()));

    // Clear teacher from any groups
    setGroups((prev) =>
      prev.map((g) => {
        if (g.teacherId === teacher.id) {
          const updated = { ...g, teacherId: '' };
          saveDoc('groups', g.id, updated).catch((e) => console.error(e));
          return updated;
        }
        return g;
      })
    );

    // Cancel or unassign any upcoming scheduled classes for this teacher
    setClasses((prev) =>
      prev.map((c) => {
        if (c.teacherId === teacher.id) {
          const updated = { ...c, status: 'cancelled' as ScheduledClass['status'] };
          saveDoc('classes', c.id, updated).catch((e) => console.error(e));
          return updated;
        }
        return c;
      })
    );

    // Delete documents from Firestore
    deleteDocFromDb('teachers', teacher.id).catch((e) => console.error(e));
    if (teacher.userId) {
      deleteDocFromDb('users', teacher.userId).catch((e) => console.error(e));
    }

    addLog('DELETE_TEACHER', `Permanently deleted teacher ${teacher.fullName} (${teacher.id})`);
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
    saveDoc('groups', newGroup.id, newGroup).catch((e) => console.error(e));
    addLog('CREATE_GROUP', `Created group ${newGroup.name}`);
    return newGroup;
  };

  const updateGroup = (id: string, data: Partial<Group>): boolean => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const updated = { ...g, ...data };
          saveDoc('groups', id, updated).catch((e) => console.error(e));
          return updated;
        }
        return g;
      })
    );
    addLog('UPDATE_GROUP', `Updated group ${id}`);
    return true;
  };

  const deleteGroup = (id: string): boolean => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
    deleteDocFromDb('groups', id).catch((e) => console.error(e));
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
    password?: string,
    customUserId?: string
  ): Teacher => createTeacher(teacherData, password, customUserId);

  const updateStudentStatus = (studentId: string, status: 'active' | 'inactive'): boolean => {
    const student = students.find((s) => s.id === studentId || s.studentId === studentId);
    if (student) {
      const updated = { ...student, status };
      setStudents((prev) => prev.map((s) => (s.id === student.id ? updated : s)));
      saveDoc('students', student.id, updated).catch((e) => console.error(e));
    }
    addLog('UPDATE_STUDENT_STATUS', `Updated student ${studentId} status to ${status}`);
    return true;
  };

  const deleteStudent = (studentId: string): boolean => {
    const student = students.find((s) => s.id === studentId || s.studentId === studentId);
    if (!student) return false;

    // Remove from students state
    setStudents((prev) => prev.filter((s) => s.id !== student.id));
    // Remove from users state
    setUsers((prev) => prev.filter((u) => u.id !== student.userId && u.username?.toLowerCase() !== student.studentId.toLowerCase()));

    // Remove from any groups
    setGroups((prev) =>
      prev.map((g) => {
        const studentIds = g.studentIds || [];
        const hasStd = studentIds.includes(student.id) || studentIds.includes(student.studentId);
        if (hasStd) {
          const nextIds = studentIds.filter((sid) => sid !== student.id && sid !== student.studentId);
          const updated = { ...g, studentIds: nextIds, currentStudents: nextIds.length };
          saveDoc('groups', g.id, updated).catch((e) => console.error(e));
          return updated;
        }
        return g;
      })
    );

    // Remove from teacher assignedStudentIds
    setTeachers((prev) =>
      prev.map((t) => {
        const assignedIds = t.assignedStudentIds || [];
        const hasStd = assignedIds.includes(student.id) || assignedIds.includes(student.studentId);
        if (hasStd) {
          const nextIds = assignedIds.filter((sid) => sid !== student.id && sid !== student.studentId);
          const updated = { ...t, assignedStudentIds: nextIds };
          saveDoc('teachers', t.id, updated).catch((e) => console.error(e));
          return updated;
        }
        return t;
      })
    );

    // Cancel / delete classes for this student
    setClasses((prev) =>
      prev.filter((c) => {
        if (c.studentId === student.id || c.studentId === student.studentId) {
          deleteDocFromDb('classes', c.id).catch((e) => console.error(e));
          return false;
        }
        return true;
      })
    );

    // Delete student doc and user doc from Firestore
    deleteDocFromDb('students', student.id).catch((e) => console.error(e));
    if (student.userId) {
      deleteDocFromDb('users', student.userId).catch((e) => console.error(e));
    }

    addLog('DELETE_STUDENT', `Permanently deleted student ${student.fullName} (ID: ${student.studentId})`);
    return true;
  };

  const transferStudentTeacher = (studentId: string, newTeacherId: string): boolean => {
    const student = students.find((s) => s.id === studentId || s.studentId === studentId);
    const newTeacher = teachers.find((t) => t.id === newTeacherId || t.teacherId === newTeacherId);
    if (!student || !newTeacher) return false;

    const oldTeacherId = student.assignedTeacherId;

    // Update student
    const updatedStudent: Student = {
      ...student,
      assignedTeacherId: newTeacher.id,
      assignedTeacher: newTeacher.fullName,
    };
    setStudents((prev) => prev.map((s) => (s.id === student.id ? updatedStudent : s)));
    saveDoc('students', student.id, updatedStudent).catch((e) => console.error(e));

    // Update old teacher (remove from assignedStudentIds)
    if (oldTeacherId) {
      setTeachers((prev) =>
        prev.map((t) => {
          if (t.id === oldTeacherId || t.teacherId === oldTeacherId) {
            const current = t.assignedStudentIds || [];
            const next = current.filter((id) => id !== student.id && id !== student.studentId);
            const updated = { ...t, assignedStudentIds: next };
            saveDoc('teachers', t.id, updated).catch((e) => console.error(e));
            return updated;
          }
          return t;
        })
      );
    }

    // Update new teacher (add to assignedStudentIds)
    setTeachers((prev) =>
      prev.map((t) => {
        if (t.id === newTeacher.id) {
          const current = t.assignedStudentIds || [];
          const has = current.includes(student.id) || current.includes(student.studentId);
          const next = has ? current : [...current, student.id];
          const updated = { ...t, assignedStudentIds: next };
          saveDoc('teachers', t.id, updated).catch((e) => console.error(e));
          return updated;
        }
        return t;
      })
    );

    // Update any scheduled 1-on-1 classes to point to the new teacher
    setClasses((prev) =>
      prev.map((c) => {
        if (c.studentId === student.id || c.studentId === student.studentId) {
          const updated = { ...c, teacherId: newTeacher.id, teacherName: newTeacher.fullName };
          saveDoc('classes', c.id, updated).catch((e) => console.error(e));
          return updated;
        }
        return c;
      })
    );

    // Update Google Sheet row if present
    setGoogleSheets((prev) =>
      prev.map((r) => {
        if (r.studentId === student.studentId || r.studentId === student.id) {
          const updated = {
            ...r,
            assignedTeacher: newTeacher.fullName,
            lastSyncedAt: new Date().toISOString(),
          };
          saveDoc('googleSheets', updated.id, updated).catch((e) => console.error(e));
          return updated;
        }
        return r;
      })
    );

    addNotification({
      userId: student.userId,
      title: 'Teacher Reassigned',
      urduTitle: 'استاد کی تبدیلی',
      message: `Your assigned teacher has been updated to ${newTeacher.fullName}.`,
      urduMessage: `آپ کا استاد تبدیل کر کے ${newTeacher.fullName} مقرر کیا گیا ہے۔`,
      type: 'info',
    });

    addLog('TRANSFER_STUDENT', `Transferred student ${student.fullName} (${student.studentId}) to teacher ${newTeacher.fullName}`);
    return true;
  };

  const transferStudentAdmin = (studentId: string, newAdminId: string): boolean => {
    const student = students.find((s) => s.id === studentId || s.studentId === studentId);
    const newAdmin = admins.find((a) => a.id === newAdminId || a.userId === newAdminId);
    if (!student || !newAdmin) return false;

    const oldAdminId = student.assignedAdminId;

    const updatedStudent: Student = {
      ...student,
      assignedAdminId: newAdmin.id,
      assignedAdmin: newAdmin.fullName || newAdmin.name,
    };
    setStudents((prev) => prev.map((s) => (s.id === student.id ? updatedStudent : s)));
    saveDoc('students', student.id, updatedStudent).catch((e) => console.error(e));

    if (oldAdminId) {
      setAdmins((prev) =>
        prev.map((a) => {
          if (a.id === oldAdminId) {
            const cur = a.assignedStudentIds || [];
            const next = cur.filter((id) => id !== student.id && id !== student.studentId);
            const updated = { ...a, assignedStudentIds: next };
            saveDoc('admins', a.id, updated).catch((e) => console.error(e));
            return updated;
          }
          return a;
        })
      );
    }

    setAdmins((prev) =>
      prev.map((a) => {
        if (a.id === newAdmin.id) {
          const cur = a.assignedStudentIds || [];
          const has = cur.includes(student.id) || cur.includes(student.studentId);
          const next = has ? cur : [...cur, student.id];
          const updated = { ...a, assignedStudentIds: next };
          saveDoc('admins', a.id, updated).catch((e) => console.error(e));
          return updated;
        }
        return a;
      })
    );

    addLog('TRANSFER_STUDENT_ADMIN', `Transferred student ${student.fullName} (${student.studentId}) to admin ${newAdmin.fullName || newAdmin.name}`);
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
    saveDoc('classes', newClass.id, newClass).catch((e) => console.error('Error saving class to Firestore:', e));

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
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id === classId) {
          const updated = { ...c, status };
          saveDoc('classes', classId, updated).catch((e) => console.error(e));
          return updated;
        }
        return c;
      })
    );
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
    saveDoc('payments', newPayment.id, newPayment).catch((e) => console.error('Error saving payment to Firestore:', e));

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

    const updatedPayment: Payment = {
      ...payment,
      status: 'verified',
      verifiedBy: adminName,
      verifiedAt: new Date().toISOString(),
    };

    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? updatedPayment : p))
    );
    saveDoc('payments', paymentId, updatedPayment).catch((e) => console.error(e));

    const student = students.find((s) => s.studentId === payment.studentId || s.id === payment.studentId);
    if (student) {
      // Also update student feeStatus
      const updatedStudent: Student = { ...student, feeStatus: 'paid' };
      setStudents((prev) =>
        prev.map((s) => (s.id === student.id ? updatedStudent : s))
      );
      saveDoc('students', student.id, updatedStudent).catch((e) => console.error(e));

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
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) return false;

    const updatedPayment: Payment = { ...payment, status: 'rejected', rejectionReason: reason };
    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? updatedPayment : p))
    );
    saveDoc('payments', paymentId, updatedPayment).catch((e) => console.error(e));

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

    addLog('REJECT_PAYMENT', `Rejected payment ${paymentId}. Reason: ${reason}`);
    return true;
  };

  // Super Admin Management
  const createAdmin = (
    name: string,
    email: string,
    phone: string,
    permissions: AdminPermissions,
    password = 'admin123',
    _customUserId?: string
  ): AdminUser => {
    const cleanEmail = email.trim().toLowerCase();
    const effectiveUserId = 'user_adm_' + Date.now();
    const adminId = 'adm_' + Date.now();
    const effectivePassword = password || 'admin123';

    const newUser: User = {
      id: effectiveUserId,
      name,
      email: cleanEmail,
      username: cleanEmail, // Email = Login ID
      phone: phone.trim(),
      password: effectivePassword,
      hasChangedPassword: false,
      role: 'admin',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
    };

    const newAdmin: AdminUser = {
      id: adminId,
      userId: effectiveUserId,
      name,
      email: cleanEmail,
      phone: phone.trim(),
      status: 'active',
      initialPassword: effectivePassword,
      hasChangedPassword: false,
      permissions,
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    setAdmins((prev) => [...prev, newAdmin]);
    saveDoc('users', newUser.id, newUser).catch((e) => console.error(e));
    saveDoc('admins', newAdmin.id, newAdmin).catch((e) => console.error(e));
    addLog('CREATE_ADMIN', `Super Admin created new admin ${name} (${cleanEmail}) with initial password`);
    return newAdmin;
  };

  const updateAdminPermissions = (adminId: string, permissions: AdminPermissions): boolean => {
    setAdmins((prev) =>
      prev.map((a) => {
        if (a.id === adminId) {
          const updated = { ...a, permissions };
          saveDoc('admins', adminId, updated).catch((e) => console.error(e));
          return updated;
        }
        return a;
      })
    );
    addLog('UPDATE_ADMIN_PERMISSIONS', `Updated granular permissions for admin ${adminId}`);
    return true;
  };

  const toggleAdminStatus = (adminId: string): boolean => {
    setAdmins((prev) =>
      prev.map((a) => {
        if (a.id === adminId) {
          const next: 'active' | 'inactive' = a.status === 'active' ? 'inactive' : 'active';
          const updated = { ...a, status: next };
          saveDoc('admins', adminId, updated).catch((e) => console.error(e));
          setUsers((uPrev) =>
            uPrev.map((u) => {
              if (u.id === a.userId) {
                const uUpdated = { ...u, status: next };
                saveDoc('users', u.id, uUpdated).catch((e) => console.error(e));
                return uUpdated;
              }
              return u;
            })
          );
          return updated;
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
    deleteDocFromDb('admins', adminId).catch((e) => console.error(e));
    deleteDocFromDb('users', admin.userId).catch((e) => console.error(e));
    addLog('DELETE_ADMIN', `Deleted admin ${admin.name} (${adminId})`);
    return true;
  };

  const addAdmin = (data: any): AdminUser => {
    return createAdmin(
      data.fullName || data.name,
      data.email,
      data.mobile || data.phone || '9876543210',
      data.permissions,
      data.password || data.initialPassword,
      data.userId || data.customUserId
    );
  };

  const updateAdmin = (id: string, data: any): boolean => {
    setAdmins((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const updated = {
            ...a,
            ...data,
            name: data.fullName || data.name || a.name,
            fullName: data.fullName || data.name || a.fullName,
            phone: data.mobile || data.phone || a.phone,
            mobile: data.mobile || data.phone || a.mobile,
            permissions: data.permissions || a.permissions,
            initialPassword: data.initialPassword || a.initialPassword,
          };
          saveDoc('admins', id, updated).catch((e) => console.error(e));
          if (data.initialPassword) {
            setUsers((uPrev) =>
              uPrev.map((u) => {
                if (u.id === a.userId) {
                  const uUpdated = { ...u, password: data.initialPassword };
                  saveDoc('users', u.id, uUpdated).catch((e) => console.error(e));
                  return uUpdated;
                }
                return u;
              })
            );
          }
          return updated;
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
    updatedRows.forEach((r) => {
      saveDoc('googleSheets', r.id, r).catch((e) => console.error(e));
    });
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
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const updated = { ...n, readStatus: true };
          saveDoc('notifications', id, updated).catch((e) => console.error(e));
          return updated;
        }
        return n;
      })
    );
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
        deleteStudent,
        transferStudentTeacher,
        transferStudentAdmin,
        admissions: students,
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
        deleteTeacher,

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
