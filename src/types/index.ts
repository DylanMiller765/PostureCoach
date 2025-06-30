export interface Keypoint {
  x: number;
  y: number;
  score?: number;
  name?: string;
}

export interface Pose {
  keypoints: Keypoint[];
  score?: number;
}

export interface PostureAngles {
  neckAngle: number;
  shoulderAngle: number;
  spineAngle: number;
  headForwardDistance: number;
}

export interface PostureScore {
  overall: number;
  angles: PostureAngles;
  timestamp: number;
  deviations: {
    neck: number;
    shoulder: number;
    spine: number;
    headPosition: number;
  };
}

export interface CalibrationData {
  angles: PostureAngles;
  timestamp: number;
  isCalibrated: boolean;
}

export interface UserSettings {
  alertThreshold: number;
  soundEnabled: boolean;
  soundVolume: number;
  alertFrequency: number;
  selectedCamera?: string;
  darkMode: boolean;
}

export interface SessionData {
  date: string;
  startTime: number;
  endTime?: number;
  scores: PostureScore[];
  averageScore: number;
  duration: number;
}

export interface AlertConfig {
  type: 'visual' | 'audio' | 'both';
  severity: 'low' | 'medium' | 'high';
  message: string;
  duration?: number;
}

export type PostureStatus = 'good' | 'warning' | 'bad';

export const KEYPOINT_INDICES = {
  nose: 0,
  leftEye: 1,
  rightEye: 2,
  leftEar: 3,
  rightEar: 4,
  leftShoulder: 5,
  rightShoulder: 6,
  leftElbow: 7,
  rightElbow: 8,
  leftWrist: 9,
  rightWrist: 10,
  leftHip: 11,
  rightHip: 12,
  leftKnee: 13,
  rightKnee: 14,
  leftAnkle: 15,
  rightAnkle: 16,
} as const;

export const IDEAL_ANGLES = {
  neck: { min: 160, max: 170 },
  shoulder: { maxDeviation: 5 },
  spine: { min: 170, max: 180 },
  headPosition: { maxForward: 2 },
} as const;

export const SCORE_THRESHOLDS = {
  good: 80,
  warning: 60,
  bad: 0,
} as const;