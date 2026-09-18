/**
 * Helper to compute 20-minute end time for One-to-One classes
 * and format time slots cleanly.
 */

export function calculate20MinEndTime(startTimeInput: string): string {
  if (!startTimeInput || !startTimeInput.trim()) return '';

  const cleaned = startTimeInput.trim();

  // Match e.g. "03:00 PM", "3:00pm", "3:00 AM", "3:00am", "14:00", "3:15"
  const match12 = cleaned.match(/^(\d{1,2})[:.](\d{2})\s*(am|pm|AM|PM)?$/i);

  if (!match12) {
    // If just a number like "3" or "3pm"
    const simpleMatch = cleaned.match(/^(\d{1,2})\s*(am|pm|AM|PM)?$/i);
    if (simpleMatch) {
      const h = parseInt(simpleMatch[1], 10);
      const mer = simpleMatch[2] ? simpleMatch[2].toUpperCase() : (h >= 1 && h <= 11 && h !== 12 ? 'PM' : 'AM');
      const startMin = 0;
      const endTotalMin = startMin + 20;
      return `${String(h).padStart(2, '0')}:${String(endTotalMin).padStart(2, '0')} ${mer}`;
    }
    return '';
  }

  let hours = parseInt(match12[1], 10);
  let minutes = parseInt(match12[2], 10);
  let meridiem = match12[3] ? match12[3].toUpperCase() : '';

  if (isNaN(hours) || isNaN(minutes)) return '';

  // If meridiem was not explicitly typed, infer for 12h: if 1 <= hours <= 11 default to PM for afternoon/evening
  if (!meridiem) {
    if (hours >= 14 && hours <= 23) {
      hours = hours - 12;
      meridiem = 'PM';
    } else if (hours === 12) {
      meridiem = 'PM';
    } else if (hours === 0) {
      hours = 12;
      meridiem = 'AM';
    } else if (hours >= 1 && hours <= 11) {
      // Default to PM if unspecified, as classes are usually 2 PM - 11 PM
      meridiem = 'PM';
    }
  }

  let totalMinutes = minutes + 20;
  let endHours = hours;
  let endMeridiem = meridiem;

  if (totalMinutes >= 60) {
    totalMinutes = totalMinutes - 60;
    endHours = endHours + 1;
    if (endHours === 12) {
      if (meridiem === 'AM') endMeridiem = 'PM';
      else if (meridiem === 'PM') endMeridiem = 'AM';
    } else if (endHours > 12) {
      endHours = endHours - 12;
    }
  }

  const formattedHours = String(endHours).padStart(2, '0');
  const formattedMinutes = String(totalMinutes).padStart(2, '0');

  return endMeridiem ? `${formattedHours}:${formattedMinutes} ${endMeridiem}` : `${formattedHours}:${formattedMinutes}`;
}

export function isWithinOneToOneWindow(timeStr: string): boolean {
  if (!timeStr) return true;
  const match = timeStr.match(/^(\d{1,2})[:.](\d{2})\s*(am|pm|AM|PM)?$/i);
  if (!match) return true;

  let h = parseInt(match[1], 10);
  const mer = match[3] ? match[3].toUpperCase() : '';

  let h24 = h;
  if (mer === 'PM' && h < 12) h24 += 12;
  if (mer === 'AM' && h === 12) h24 = 0;

  // Window: 2:00 PM (14:00) to 11:00 PM (23:00)
  return h24 >= 14 && h24 <= 23;
}

export const GROUP_CLASS_TIME_SLOTS = [
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '08:00 PM - 09:00 PM',
  '09:00 PM - 10:00 PM',
] as const;

export const POPULAR_ONE_TO_ONE_START_TIMES = [
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '08:00 PM',
  '08:30 PM',
  '09:00 PM',
  '09:30 PM',
  '10:00 PM',
  '10:30 PM',
];
