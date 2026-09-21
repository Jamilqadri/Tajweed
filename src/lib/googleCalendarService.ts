import { getCachedAccessToken, ACADEMY_MEET_EMAIL, isRealGoogleMeetLink, normalizeMeetLink } from './googleMeetService';

export interface CalendarEventResult {
  success: boolean;
  eventId?: string;
  meetLink?: string;
  htmlLink?: string;
  organizerEmail?: string;
  attendeesCount?: number;
  error?: string;
}

const DAY_NAME_TO_RRULE: Record<string, string> = {
  monday: 'MO',
  mon: 'MO',
  tuesday: 'TU',
  tue: 'TU',
  wednesday: 'WE',
  wed: 'WE',
  thursday: 'TH',
  thu: 'TH',
  friday: 'FR',
  fri: 'FR',
  saturday: 'SA',
  sat: 'SA',
  sunday: 'SU',
  sun: 'SU',
};

const DAY_INDEX: Record<string, number> = {
  sunday: 0,
  sun: 0,
  monday: 1,
  mon: 1,
  tuesday: 2,
  tue: 2,
  wednesday: 3,
  wed: 3,
  thursday: 4,
  thu: 4,
  friday: 5,
  fri: 5,
  saturday: 6,
  sat: 6,
};

/**
 * Calculates next date matching given day names and time
 */
function getNextOccurrenceDateTime(days: string[], time: string): { startIso: string; endIso: string } {
  const [hoursStr, minsStr] = time.split(':');
  const hours = parseInt(hoursStr || '19', 10);
  const minutes = parseInt(minsStr || '0', 10);

  const now = new Date();
  const currentDay = now.getDay();

  // Find target day indices
  const targetDayIndices = days
    .map((d) => DAY_INDEX[d.trim().toLowerCase()])
    .filter((idx) => typeof idx === 'number');

  let daysUntil = 1;
  if (targetDayIndices.length > 0) {
    // Find closest upcoming day
    let minDiff = 7;
    for (const target of targetDayIndices) {
      let diff = (target - currentDay + 7) % 7;
      if (diff === 0) {
        // If today, check if time has passed
        const targetTime = new Date(now);
        targetTime.setHours(hours, minutes, 0, 0);
        if (targetTime > now) {
          diff = 0;
        } else {
          diff = 7;
        }
      }
      if (diff < minDiff) {
        minDiff = diff;
      }
    }
    daysUntil = minDiff;
  }

  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() + daysUntil);
  startDate.setHours(hours, minutes, 0, 0);

  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + 45);

  return {
    startIso: startDate.toISOString(),
    endIso: endDate.toISOString(),
  };
}

/**
 * Builds RRULE string from array of day strings
 */
function buildRRuleByDays(days: string[]): string {
  const codes = days
    .map((d) => DAY_NAME_TO_RRULE[d.trim().toLowerCase()])
    .filter(Boolean);

  if (codes.length === 0) {
    return 'RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR';
  }
  return `RRULE:FREQ=WEEKLY;BYDAY=${Array.from(new Set(codes)).join(',')}`;
}

/**
 * Automatically create or update a Google Calendar Event and REAL Google Meet link for a Group Cohort.
 *
 * Rules:
 * - Super Admin Google account as Organizer / Host
 * - Assigned Teacher as Co-host using their existing Teacher profile email ID
 * - Assigned Students using their registered email addresses
 * - Produces a verified, genuine Google Meet link
 */
export async function createOrUpdateGroupCalendarEvent(params: {
  groupName: string;
  teacher: { fullName: string; email: string };
  students: { fullName: string; email: string }[];
  days: string[];
  startTime: string;
  endTime: string;
  existingEventId?: string;
  token?: string;
}): Promise<CalendarEventResult> {
  const accessToken = params.token || getCachedAccessToken();

  if (!accessToken) {
    return {
      success: false,
      error: 'Google Account not connected. Please connect Super Admin Google account to sync Calendar & Meet.',
    };
  }

  try {
    const { startIso, endIso } = getNextOccurrenceDateTime(params.days, params.startTime);
    const rrule = buildRRuleByDays(params.days);

    // Host & Co-host specifications in Attendees
    // Teacher is added with existing profile email and designated as Co-host
    const attendees = [
      {
        email: params.teacher.email.trim(),
        displayName: `${params.teacher.fullName} (Teacher / Co-host)`,
        responseStatus: 'accepted',
        optional: false,
      },
      ...params.students
        .filter((s) => s.email && s.email.trim().includes('@'))
        .map((s) => ({
          email: s.email.trim(),
          displayName: s.fullName,
        })),
    ];

    const description = [
      `Kanz Ut Tajweed Qur’an & Tajweed Learning Academy - Live Group Session`,
      ``,
      `Group Cohort: ${params.groupName}`,
      `Host / Organizer: Super Admin (${ACADEMY_MEET_EMAIL})`,
      `Teacher (Co-host): ${params.teacher.fullName} (${params.teacher.email})`,
      `Days: ${params.days.join(', ')}`,
      `Schedule Time: ${params.startTime} - ${params.endTime}`,
      `Students Assigned: ${params.students.length}`,
      ``,
      `Join live class directly via the official Google Meet link attached to this event.`,
    ].join('\n');

    const eventPayload: any = {
      summary: `Kanz Ut Tajweed: Group - ${params.groupName}`,
      description,
      start: {
        dateTime: startIso,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Karachi',
      },
      end: {
        dateTime: endIso,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Karachi',
      },
      recurrence: [rrule],
      attendees,
      guestsCanInviteOthers: false,
      guestsCanModify: false,
      conferenceData: {
        createRequest: {
          requestId: `kzt-grp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
    };

    const isUpdate = Boolean(params.existingEventId);
    const url = isUpdate
      ? `https://www.googleapis.com/calendar/v3/calendars/primary/events/${params.existingEventId}?conferenceDataVersion=1&sendUpdates=all`
      : `https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all`;

    const response = await fetch(url, {
      method: isUpdate ? 'PATCH' : 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventPayload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Google Calendar API error response:', errText);
      throw new Error(`Google Calendar API returned status ${response.status}: ${errText}`);
    }

    const data = await response.json();

    // Extract genuine Google Meet link
    let realMeetLink =
      data.hangoutLink ||
      data.conferenceData?.entryPoints?.find((e: any) => e.entryPointType === 'video')?.uri;

    if (!realMeetLink || !isRealGoogleMeetLink(realMeetLink)) {
      // If conferenceData didn't populate immediately, fallback to creating space directly via Meet API
      realMeetLink = await createGoogleMeetSpaceFallback(accessToken);
    }

    return {
      success: true,
      eventId: data.id,
      meetLink: realMeetLink ? normalizeMeetLink(realMeetLink) : undefined,
      htmlLink: data.htmlLink,
      organizerEmail: data.organizer?.email || ACADEMY_MEET_EMAIL,
      attendeesCount: attendees.length,
    };
  } catch (error: any) {
    console.error('Failed to create/update Group Calendar event:', error);
    return {
      success: false,
      error: error.message || 'Failed to create Google Calendar event',
    };
  }
}

/**
 * Automatically create or update a separate Google Calendar Event for a One-to-One Class.
 *
 * Rules:
 * - Super Admin Google account as Organizer / Host
 * - Assigned Teacher as Co-host using their existing Teacher profile email ID
 * - Assigned Student using registered email address
 * - Produces a verified, genuine Google Meet link
 */
export async function createOrUpdateOneToOneCalendarEvent(params: {
  student: { fullName: string; email: string };
  teacher: { fullName: string; email: string };
  courseName?: string;
  days?: string[];
  date?: string; // YYYY-MM-DD
  startTime: string;
  endTime?: string;
  existingEventId?: string;
  token?: string;
}): Promise<CalendarEventResult> {
  const accessToken = params.token || getCachedAccessToken();

  if (!accessToken) {
    return {
      success: false,
      error: 'Google Account not connected. Please connect Super Admin Google account to sync Calendar & Meet.',
    };
  }

  try {
    let startIso: string;
    let endIso: string;
    let recurrence: string[] | undefined;

    const durationMinutes = 20; // One-to-one standard duration
    const [hoursStr, minsStr] = params.startTime.split(':');
    const hours = parseInt(hoursStr || '18', 10);
    const minutes = parseInt(minsStr || '0', 10);

    if (params.days && params.days.length > 0) {
      const nextOccur = getNextOccurrenceDateTime(params.days, params.startTime);
      startIso = nextOccur.startIso;
      const sDate = new Date(startIso);
      sDate.setMinutes(sDate.getMinutes() + durationMinutes);
      endIso = sDate.toISOString();
      recurrence = [buildRRuleByDays(params.days)];
    } else if (params.date) {
      const d = new Date(params.date);
      d.setHours(hours, minutes, 0, 0);
      startIso = d.toISOString();
      const endD = new Date(d);
      endD.setMinutes(endD.getMinutes() + durationMinutes);
      endIso = endD.toISOString();
    } else {
      const now = new Date();
      now.setDate(now.getDate() + 1);
      now.setHours(hours, minutes, 0, 0);
      startIso = now.toISOString();
      const endD = new Date(now);
      endD.setMinutes(endD.getMinutes() + durationMinutes);
      endIso = endD.toISOString();
    }

    const attendees = [
      {
        email: params.teacher.email.trim(),
        displayName: `${params.teacher.fullName} (Teacher / Co-host)`,
        responseStatus: 'accepted',
        optional: false,
      },
    ];

    if (params.student.email && params.student.email.trim().includes('@')) {
      attendees.push({
        email: params.student.email.trim(),
        displayName: `${params.student.fullName} (Student)`,
        responseStatus: 'needsAction',
        optional: false,
      });
    }

    const description = [
      `Kanz Ut Tajweed Qur’an & Tajweed Learning Academy - One-to-One Private Class`,
      ``,
      `Student: ${params.student.fullName} (${params.student.email})`,
      `Course: ${params.courseName || 'Qur’an Recitation with Tajweed'}`,
      `Teacher (Co-host): ${params.teacher.fullName} (${params.teacher.email})`,
      `Organizer/Host: Super Admin (${ACADEMY_MEET_EMAIL})`,
      `Time: ${params.startTime} - ${params.endTime || '20 mins'}`,
      ``,
      `Join live class directly via the official Google Meet link attached to this event.`,
    ].join('\n');

    const eventPayload: any = {
      summary: `Kanz Ut Tajweed: 1-on-1 - ${params.student.fullName} with ${params.teacher.fullName}`,
      description,
      start: {
        dateTime: startIso,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Karachi',
      },
      end: {
        dateTime: endIso,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Karachi',
      },
      attendees,
      guestsCanInviteOthers: false,
      guestsCanModify: false,
      conferenceData: {
        createRequest: {
          requestId: `kzt-1on1-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
    };

    if (recurrence) {
      eventPayload.recurrence = recurrence;
    }

    const isUpdate = Boolean(params.existingEventId);
    const url = isUpdate
      ? `https://www.googleapis.com/calendar/v3/calendars/primary/events/${params.existingEventId}?conferenceDataVersion=1&sendUpdates=all`
      : `https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all`;

    const response = await fetch(url, {
      method: isUpdate ? 'PATCH' : 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventPayload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Google Calendar API error response:', errText);
      throw new Error(`Google Calendar API returned status ${response.status}: ${errText}`);
    }

    const data = await response.json();

    let realMeetLink =
      data.hangoutLink ||
      data.conferenceData?.entryPoints?.find((e: any) => e.entryPointType === 'video')?.uri;

    if (!realMeetLink || !isRealGoogleMeetLink(realMeetLink)) {
      realMeetLink = await createGoogleMeetSpaceFallback(accessToken);
    }

    return {
      success: true,
      eventId: data.id,
      meetLink: realMeetLink ? normalizeMeetLink(realMeetLink) : undefined,
      htmlLink: data.htmlLink,
      organizerEmail: data.organizer?.email || ACADEMY_MEET_EMAIL,
      attendeesCount: attendees.length,
    };
  } catch (error: any) {
    console.error('Failed to create/update One-to-One Calendar event:', error);
    return {
      success: false,
      error: error.message || 'Failed to create Google Calendar event',
    };
  }
}

/**
 * Fallback to Google Meet Spaces API if Calendar conferenceData was pending or disabled
 */
async function createGoogleMeetSpaceFallback(token: string): Promise<string | null> {
  try {
    const res = await fetch('https://meet.googleapis.com/v2/spaces', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        config: {
          accessType: 'OPEN',
        },
      }),
    });

    if (res.ok) {
      const spaceData = await res.json();
      if (spaceData.meetingUri && isRealGoogleMeetLink(spaceData.meetingUri)) {
        return spaceData.meetingUri;
      }
    }
  } catch (err) {
    console.warn('Fallback Google Meet spaces call:', err);
  }
  return null;
}
