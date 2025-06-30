import { Keypoint } from '../types';

export function calculateAngle(
  point1: Keypoint,
  point2: Keypoint,
  point3: Keypoint
): number {
  // Calculate angle between three points (point2 is the vertex)
  const radians = Math.atan2(point3.y - point2.y, point3.x - point2.x) -
                  Math.atan2(point1.y - point2.y, point1.x - point2.x);
  
  let angle = Math.abs(radians * (180 / Math.PI));
  
  if (angle > 180) {
    angle = 360 - angle;
  }
  
  return angle;
}

export function calculateDistance(point1: Keypoint, point2: Keypoint): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function calculateHorizontalDeviation(
  leftPoint: Keypoint,
  rightPoint: Keypoint
): number {
  // Calculate the angle deviation from horizontal (0 degrees)
  const dy = rightPoint.y - leftPoint.y;
  const dx = rightPoint.x - leftPoint.x;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  return Math.abs(angle);
}

export function calculateHeadForwardDistance(
  ear: Keypoint,
  shoulder: Keypoint
): number {
  // Calculate horizontal distance between ear and shoulder
  // Convert pixels to approximate inches (assuming average shoulder width)
  const pixelDistance = Math.abs(ear.x - shoulder.x);
  const shoulderWidthPixels = 100; // Approximate shoulder width in pixels
  const shoulderWidthInches = 16; // Average shoulder width in inches
  const inchesPerPixel = shoulderWidthInches / shoulderWidthPixels;
  
  return pixelDistance * inchesPerPixel;
}

export function normalizeScore(value: number, min: number, max: number): number {
  // Normalize a value to 0-100 scale
  if (value <= min) return 100;
  if (value >= max) return 0;
  
  const normalized = 100 - ((value - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, normalized));
}

export function smoothValue(
  currentValue: number,
  previousValue: number,
  smoothingFactor: number = 0.7
): number {
  // Apply exponential smoothing to reduce jitter
  return previousValue * smoothingFactor + currentValue * (1 - smoothingFactor);
}

export function isKeypointValid(keypoint: Keypoint, minConfidence: number = 0.2): boolean {
  return keypoint.score !== undefined && keypoint.score >= minConfidence;
}

export function areKeypointsValid(keypoints: Keypoint[], minConfidence: number = 0.2): boolean {
  return keypoints.every(kp => isKeypointValid(kp, minConfidence));
}