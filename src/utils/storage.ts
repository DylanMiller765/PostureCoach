import { CalibrationData, UserSettings, SessionData } from '../types';

const STORAGE_KEYS = {
  CALIBRATION: 'postureCoachCalibration',
  SETTINGS: 'postureCoachSettings',
  SESSIONS: 'postureCoachSessions',
} as const;

export const storage = {
  // Calibration
  getCalibration(): CalibrationData | null {
    const data = localStorage.getItem(STORAGE_KEYS.CALIBRATION);
    return data ? JSON.parse(data) : null;
  },

  setCalibration(calibration: CalibrationData): void {
    localStorage.setItem(STORAGE_KEYS.CALIBRATION, JSON.stringify(calibration));
  },

  clearCalibration(): void {
    localStorage.removeItem(STORAGE_KEYS.CALIBRATION);
  },

  // Settings
  getSettings(): UserSettings | null {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : null;
  },

  setSettings(settings: UserSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // Sessions
  getSessions(): SessionData[] {
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return data ? JSON.parse(data) : [];
  },

  addSession(session: SessionData): void {
    const sessions = this.getSessions();
    sessions.push(session);
    
    // Keep only last 30 days of sessions
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const filteredSessions = sessions.filter(s => s.startTime > thirtyDaysAgo);
    
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(filteredSessions));
  },

  // Clear all data
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },
};