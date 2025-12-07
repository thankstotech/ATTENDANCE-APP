import { AppData, CalendarConfig, AttendanceEntry } from '../types';

const STORAGE_KEY = 'sitelog_pro_db_v1';

const getInitialData = (): AppData => ({
  calendars: [
    { id: 'default-work', name: 'WORK', type: 'TEAM', created: Date.now() }
  ],
  entries: {}
});

export const loadData = (): AppData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialData();
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load data", e);
    return getInitialData();
  }
};

export const saveData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save data", e);
    alert("Storage full! Please backup and clear data.");
  }
};

export const exportDataToJSON = (data: AppData): string => {
  return JSON.stringify(data, null, 2);
};

export const importDataFromJSON = (jsonString: string): AppData | null => {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.calendars || !parsed.entries) {
      throw new Error("Invalid format");
    }
    return parsed;
  } catch (e) {
    return null;
  }
};