export type Role = 'super_admin' | 'admin' | 'teacher' | 'student';

export type Language = 'en' | 'ur';

export type ClassType = 'group' | 'one_to_one';

export type AdmissionStatus = 'pending' | 'verified' | 'rejected';

export type ClassStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';

export type PaymentStatus = 'pending' | 'verified' | 'rejected';

export interface AdminPermissions {
  students: boolean;
  teachers: boolean;
  courses: boolean;
  groups: boolean;
  classes: boolean;
  fees: boolean;
  admissions: boolean;
  reports: boolean;
  settings: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  username?: string;
  password?: string;
  role: Role;
  status: 'active' | 'inactive';
  avatar?: string;
  createdAt: string;
}

export interface Student {
  id: string;
  studentId: string; // e.g. KT26090001
  userId: string;
  fullName: string;
  fatherName: string;
  mobile: string;
  whatsapp: string;
  dob: string;
  gender: 'male' | 'female';
  city: string;
  state: string;
  address: string;
  courseId: string;
  classType: ClassType;
  preferredTime: string;
  previousKnowledge: string;
  additionalNote?: string;
  admissionStatus: AdmissionStatus;
  rejectionReason?: string;
  assignedCourseId?: string;
  assignedTeacherId?: string;
  assignedGroupId?: string;
  groupId?: string;
  oneToOneSchedule?: {
    days: string[];
    time: string;
  };
  oneToOneSlot?: string;
  status?: 'active' | 'inactive';
  admissionDate?: string;
  feeStatus?: 'paid' | 'pending';
  initialPassword: string;
  createdAt: string;
  verifiedAt?: string;
}

export interface TeacherSlotItem {
  day: string;
  startTime: string;
  endTime: string;
  isBooked?: boolean;
}

export interface Teacher {
  id: string;
  teacherId: string;
  userId: string;
  fullName: string;
  fatherName?: string;
  profilePhoto: string;
  mobile: string;
  whatsapp?: string;
  email: string;
  gender?: 'male' | 'female';
  qualification: string;
  tajweedQualification: string;
  experience: string;
  languages: string[];
  specialization: string;
  city?: string;
  state?: string;
  address?: string;
  availableSlots?: (TeacherSlotItem | string)[];
  joiningDate: string;
  status: 'active' | 'inactive';
  bio?: string;
  assignedStudentIds?: string[];
  assignedGroupIds?: string[];
}

export interface AdminUser {
  id: string;
  userId: string;
  name: string;
  fullName?: string;
  email: string;
  phone: string;
  mobile?: string;
  status: 'active' | 'inactive';
  permissions: AdminPermissions;
  createdAt: string;
}

export type Admin = AdminUser;
export type Admission = Student;

export interface Course {
  id: string;
  name: string;
  urduName?: string;
  description: string;
  urduDescription?: string;
  fee: number; // in INR/USD e.g. 500
  currency?: string;
  duration: string; // e.g. "3 Months"
  status: 'active' | 'inactive';
  classType: 'both' | 'group' | 'one_to_one';
  notes?: string;
  category?: string;
}

export interface Group {
  id: string;
  name: string;
  courseId: string;
  teacherId: string;
  days: string[]; // e.g. ['Monday', 'Wednesday', 'Friday']
  scheduleDays?: string[];
  startTime: string; // e.g. "19:00"
  endTime: string; // e.g. "19:45"
  scheduleTime?: string;
  capacity: number; // e.g. 10
  maxCapacity?: number;
  currentStudents: number; // e.g. 7
  studentIds?: string[];
  status: 'active' | 'inactive';
  meetLink: string;
}

export interface ScheduledClass {
  id: string;
  courseId: string;
  teacherId: string;
  studentId?: string; // for one-to-one
  groupId?: string; // for group
  classType: ClassType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM (24h or 12h display)
  endTime: string;
  time?: string;
  durationMinutes?: number;
  meetLink: string;
  status: ClassStatus;
  topic?: string;
  notes?: string;
}

export interface TeacherSlot {
  time: string; // e.g. "17:00" or "5:00 PM"
  status: 'available' | 'booked';
  classType?: ClassType;
  studentOrGroupName?: string;
}

export interface Payment {
  id: string;
  studentId: string;
  courseId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceId?: string;
  transactionId?: string;
  screenshot?: string; // base64 or url
  screenshotUrl?: string;
  status: PaymentStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  note?: string;
  rejectionReason?: string;
}

export type PaymentRecord = Payment;

export interface GoogleSheetRow {
  id: string;
  studentId: string;
  name: string;
  fullName?: string;
  fatherName?: string;
  mobile: string;
  whatsapp?: string;
  course: string;
  courseId?: string;
  classType: string;
  preferredTime?: string;
  city?: string;
  state?: string;
  timestamp?: string;
  admissionDate: string;
  status: string;
  assignedTeacher: string;
  assignedGroup: string;
  classTime: string;
  lastSyncedAt: string;
}

export interface AppNotification {
  id: string;
  userId: string; // 'all' | role | specific id
  title: string;
  urduTitle?: string;
  message: string;
  urduMessage?: string;
  readStatus: boolean;
  createdAt: string;
  type: 'info' | 'success' | 'warning';
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: string;
  details: string;
  timestamp: string;
}
