import { ScheduledClass } from '../types';

export interface ClassJoinStatus {
  isAvailable: boolean;
  statusText: string;
  statusTextUrdu: string;
  badgeType: 'active' | 'upcoming' | 'past';
  formattedTimeDisplay: string;
  minutesUntilStart?: number;
}

/**
 * Calculates whether a class is currently joinable (within 5 minutes before start time until the end time),
 * and provides clear bilingual status and timing text.
 * Always keeps the "Join Class" button accessible and informative as requested by the user.
 */
export function getClassJoinStatus(
  cls: ScheduledClass,
  overrideNow?: Date
): ClassJoinStatus {
  // Format start & end time display clearly: e.g. "19:00 - 19:45"
  const formattedTimeDisplay = cls.endTime
    ? `${cls.time || cls.startTime} - ${cls.endTime}`
    : `${cls.time || cls.startTime} (${cls.durationMinutes || 45} mins)`;

  if (cls.status === 'completed') {
    return {
      isAvailable: false,
      statusText: 'Class Completed',
      statusTextUrdu: 'کلاس مکمل ہو چکی ہے',
      badgeType: 'past',
      formattedTimeDisplay,
    };
  }

  if (cls.status === 'live') {
    return {
      isAvailable: true,
      statusText: 'Live Now — Join Class',
      statusTextUrdu: 'کلاس جاری ہے — ابھی شامل ہوں',
      badgeType: 'active',
      formattedTimeDisplay,
    };
  }

  // Parse class date and start time
  const classTime = cls.time || cls.startTime || '19:00';
  const [startHours, startMins] = classTime.split(':').map((num) => parseInt(num, 10) || 0);

  const duration = cls.durationMinutes || 45;
  const now = overrideNow || new Date();

  // Create date object for class start
  // Support both YYYY-MM-DD and today's date
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
      };
    } else if (nowMs < joinWindowOpenMs) {
      const minsDiff = Math.ceil((classStartTimeMs - nowMs) / (1000 * 60));
      return {
        isAvailable: false,
        statusText: `Starts at ${classTime} (Join opens 5m prior)`,
        statusTextUrdu: `کلاس کا وقت: ${classTime} (5 منٹ قبل لنک فعال ہوگا)`,
        badgeType: 'upcoming',
        formattedTimeDisplay,
        minutesUntilStart: minsDiff,
      };
    } else {
      return {
        isAvailable: false,
        statusText: `Session ended at ${cls.endTime || 'end time'}`,
        statusTextUrdu: `آج کی کلاس کا وقت ختم ہو چکا ہے`,
        badgeType: 'past',
        formattedTimeDisplay,
      };
    }
  }

  // Future scheduled class:
  return {
    isAvailable: false,
    statusText: `Scheduled: ${cls.date} at ${classTime}`,
    statusTextUrdu: `مقررہ تاریخ: ${cls.date} بوقت ${classTime}`,
    badgeType: 'upcoming',
    formattedTimeDisplay,
  };
}
