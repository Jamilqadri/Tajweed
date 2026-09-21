import { ScheduledClass } from '../types';

export interface ClassJoinStatus {
  isAvailable: boolean; // For students: clickable 5m before start OR immediately if teacher has joined
  statusText: string;
  statusTextUrdu: string;
  badgeType: 'active' | 'upcoming' | 'past';
  formattedTimeDisplay: string;
  minutesUntilStart?: number;
  teacherJoined: boolean;
  canTeacherJoinAlways: boolean; // Teacher has no time restriction and can join anytime
  canAdminJoinAlways: boolean; // Admin has no time restriction and can join anytime
}

/**
 * Calculates whether a class is currently joinable:
 * - Admin & Teacher: ALWAYS visible and can join ANYTIME without time restrictions (both Group and 1-on-1).
 * - Students: button becomes clickable only 5 minutes before scheduled class time.
 *             However, if the Teacher joins/starts before that time, the button becomes IMMEDIATELY clickable!
 */
export function getClassJoinStatus(
  cls: ScheduledClass,
  overrideNow?: Date
): ClassJoinStatus {
  // Format start & end time display clearly: e.g. "19:00 - 19:45"
  const formattedTimeDisplay = cls.endTime
    ? `${cls.time || cls.startTime} - ${cls.endTime}`
    : `${cls.time || cls.startTime} (${cls.durationMinutes || 45} mins)`;

  const teacherJoined = Boolean(cls.teacherJoined || cls.status === 'live');

  if (cls.status === 'completed') {
    return {
      isAvailable: false,
      statusText: 'Class Completed',
      statusTextUrdu: 'کلاس مکمل ہو چکی ہے',
      badgeType: 'past',
      formattedTimeDisplay,
      teacherJoined: false,
      canTeacherJoinAlways: true,
      canAdminJoinAlways: true,
    };
  }

  // CRITICAL RULE: If Teacher has joined the class, the Student's Join Class button
  // becomes IMMEDIATELY clickable regardless of scheduled time!
  if (teacherJoined) {
    return {
      isAvailable: true,
      statusText: 'Teacher Joined — Join Live Class Now',
      statusTextUrdu: 'استاد محترم کلاس میں تشریف لا چکے ہیں — ابھی شامل ہوں',
      badgeType: 'active',
      formattedTimeDisplay,
      teacherJoined: true,
      canTeacherJoinAlways: true,
      canAdminJoinAlways: true,
    };
  }

  // Parse class date and start time
  const classTime = cls.time || cls.startTime || '19:00';
  const [startHours, startMins] = classTime.split(':').map((num) => parseInt(num, 10) || 0);

  const duration = cls.durationMinutes || 45;
  const now = overrideNow || new Date();

  // Create date object for class start
  const classDate = new Date();
  if (cls.date) {
    const parts = cls.date.split('-');
    if (parts.length === 3) {
      classDate.setFullYear(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
  }
  classDate.setHours(startHours, startMins, 0, 0);

  const classStartTimeMs = classDate.getTime();
  const classEndTimeMs = classStartTimeMs + duration * 60 * 1000;
  const joinWindowOpenMs = classStartTimeMs - 5 * 60 * 1000; // 5 minutes before start
  const nowMs = now.getTime();

  const isSameDay =
    now.getFullYear() === classDate.getFullYear() &&
    now.getMonth() === classDate.getMonth() &&
    now.getDate() === classDate.getDate();

  // If class is today:
  if (isSameDay) {
    if (nowMs >= joinWindowOpenMs && nowMs <= classEndTimeMs) {
      return {
        isAvailable: true,
        statusText: 'Class Ready — Join Video Class',
        statusTextUrdu: 'کلاس کا وقت ہو گیا ہے — ویڈیو کلاس میں شامل ہوں',
        badgeType: 'active',
        formattedTimeDisplay,
        teacherJoined: false,
        canTeacherJoinAlways: true,
        canAdminJoinAlways: true,
      };
    } else if (nowMs < joinWindowOpenMs) {
      const minsDiff = Math.ceil((classStartTimeMs - nowMs) / (1000 * 60));
      return {
        isAvailable: false,
        statusText: `Starts at ${classTime} (Activates 5m prior or when teacher joins)`,
        statusTextUrdu: `بوقت ${classTime} (5 منٹ قبل یا استاد کے آنے پر فعال ہوگا)`,
        badgeType: 'upcoming',
        formattedTimeDisplay,
        minutesUntilStart: minsDiff,
        teacherJoined: false,
        canTeacherJoinAlways: true,
        canAdminJoinAlways: true,
      };
    } else {
      return {
        isAvailable: false,
        statusText: `Session ended at ${cls.endTime || 'end time'}`,
        statusTextUrdu: `آج کی کلاس کا وقت ختم ہو چکا ہے`,
        badgeType: 'past',
        formattedTimeDisplay,
        teacherJoined: false,
        canTeacherJoinAlways: true,
        canAdminJoinAlways: true,
      };
    }
  }

  // Future scheduled class:
  return {
    isAvailable: false,
    statusText: `Scheduled: ${cls.date} at ${classTime} (Opens 5m prior or when teacher joins)`,
    statusTextUrdu: `مقررہ تاریخ: ${cls.date} بوقت ${classTime} (5 منٹ قبل یا استاد کے آنے پر فعال ہوگا)`,
    badgeType: 'upcoming',
    formattedTimeDisplay,
    teacherJoined: false,
    canTeacherJoinAlways: true,
    canAdminJoinAlways: true,
  };
}
