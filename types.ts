export interface AttendanceEntry {
  id: string;
  calendarId: string;
  date: string; // ISO YYYY-MM-DD
  siteName: string;
  otHours: string;
  isAbsent: boolean;
  timestamp: number;
}

export interface CalendarConfig {
  id: string;
  name: string;
  type: 'TEAM' | 'SUB_CONTRACTOR';
  created: number;
}

export interface AppData {
  calendars: CalendarConfig[];
  entries: Record<string, AttendanceEntry>; // Keyed by `${calendarId}_${date}`
}
