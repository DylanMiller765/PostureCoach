import { 
  Pose, 
  PostureAngles, 
  PostureScore, 
  CalibrationData,
  Keypoint, 
  KEYPOINT_INDICES, 
  IDEAL_ANGLES 
} from '../types';
import { 
  calculateAngle, 
  calculateHorizontalDeviation, 
  calculateHeadForwardDistance,
  normalizeScore,
  smoothValue,
  areKeypointsValid,
  isKeypointValid
} from './angleCalculations';

export class PostureAnalyzer {
  private previousScore: PostureScore | null = null;
  private calibrationData: CalibrationData | null = null;

  setCalibration(calibration: CalibrationData): void {
    this.calibrationData = calibration;
  }

  analyzePosture(pose: Pose): PostureScore | null {
    if (!pose || pose.keypoints.length < 17) {
      return null;
    }

    // Calibration data check - no logging needed

    const keypoints = pose.keypoints;

    // Get required keypoints
    const leftEar = keypoints[KEYPOINT_INDICES.leftEar];
    const rightEar = keypoints[KEYPOINT_INDICES.rightEar];
    const leftShoulder = keypoints[KEYPOINT_INDICES.leftShoulder];
    const rightShoulder = keypoints[KEYPOINT_INDICES.rightShoulder];
    const leftHip = keypoints[KEYPOINT_INDICES.leftHip];
    const rightHip = keypoints[KEYPOINT_INDICES.rightHip];
    const leftKnee = keypoints[KEYPOINT_INDICES.leftKnee];
    const rightKnee = keypoints[KEYPOINT_INDICES.rightKnee];

    // Check if all required keypoints are valid
    const requiredKeypoints = [
      { name: 'leftEar', kp: leftEar },
      { name: 'rightEar', kp: rightEar },
      { name: 'leftShoulder', kp: leftShoulder },
      { name: 'rightShoulder', kp: rightShoulder },
      { name: 'leftHip', kp: leftHip },
      { name: 'rightHip', kp: rightHip },
      { name: 'leftKnee', kp: leftKnee },
      { name: 'rightKnee', kp: rightKnee }
    ];
    
    const invalidKeypoints = requiredKeypoints.filter(({ kp }) => !isKeypointValid(kp, 0.2));
    
    if (invalidKeypoints.length > 0) {
      // Only log if debugging is needed
      // console.log('Invalid keypoints detected:', invalidKeypoints.map(k => `${k.name}: ${k.kp.score?.toFixed(2)}`));
      
      // If only a few keypoints are invalid, try to continue with what we have
      if (invalidKeypoints.length > 4) {
        // Too many invalid keypoints
        return null;
      }
    }

    // Calculate angles
    const angles = this.calculatePostureAngles(keypoints);
    
    // Calculate deviations from ideal or calibrated values
    const deviations = this.calculateDeviations(angles);
    
    // Calculate overall score
    const overallScore = this.calculateOverallScore(deviations);
    
    // Create posture score object
    const score: PostureScore = {
      overall: overallScore,
      angles,
      timestamp: Date.now(),
      deviations,
    };

    // Analysis complete

    // Apply smoothing if we have a previous score
    if (this.previousScore) {
      score.overall = smoothValue(score.overall, this.previousScore.overall, 0.8);
    }

    this.previousScore = score;
    return score;
  }

  private calculatePostureAngles(keypoints: Keypoint[]): PostureAngles {
    let neckAngle = 165; // Default values
    let validNeckAngles = 0;
    
    // Calculate left neck angle if keypoints are valid
    if (isKeypointValid(keypoints[KEYPOINT_INDICES.leftEar], 0.2) &&
        isKeypointValid(keypoints[KEYPOINT_INDICES.leftShoulder], 0.2) &&
        isKeypointValid(keypoints[KEYPOINT_INDICES.leftHip], 0.2)) {
      const leftNeckAngle = calculateAngle(
        keypoints[KEYPOINT_INDICES.leftEar],
        keypoints[KEYPOINT_INDICES.leftShoulder],
        keypoints[KEYPOINT_INDICES.leftHip]
      );
      neckAngle = leftNeckAngle;
      validNeckAngles++;
    }
    
    // Calculate right neck angle if keypoints are valid
    if (isKeypointValid(keypoints[KEYPOINT_INDICES.rightEar], 0.2) &&
        isKeypointValid(keypoints[KEYPOINT_INDICES.rightShoulder], 0.2) &&
        isKeypointValid(keypoints[KEYPOINT_INDICES.rightHip], 0.2)) {
      const rightNeckAngle = calculateAngle(
        keypoints[KEYPOINT_INDICES.rightEar],
        keypoints[KEYPOINT_INDICES.rightShoulder],
        keypoints[KEYPOINT_INDICES.rightHip]
      );
      if (validNeckAngles > 0) {
        neckAngle = (neckAngle + rightNeckAngle) / 2;
      } else {
        neckAngle = rightNeckAngle;
      }
      validNeckAngles++;
    }

    // Calculate shoulder alignment
    let shoulderAngle = 0;
    if (isKeypointValid(keypoints[KEYPOINT_INDICES.leftShoulder], 0.2) &&
        isKeypointValid(keypoints[KEYPOINT_INDICES.rightShoulder], 0.2)) {
      shoulderAngle = calculateHorizontalDeviation(
        keypoints[KEYPOINT_INDICES.leftShoulder],
        keypoints[KEYPOINT_INDICES.rightShoulder]
      );
    }

    // Calculate spine angle (shoulder-hip-knee)
    let spineAngle = 175;
    let validSpineAngles = 0;
    
    if (isKeypointValid(keypoints[KEYPOINT_INDICES.leftShoulder], 0.2) &&
        isKeypointValid(keypoints[KEYPOINT_INDICES.leftHip], 0.2) &&
        isKeypointValid(keypoints[KEYPOINT_INDICES.leftKnee], 0.2)) {
      const leftSpineAngle = calculateAngle(
        keypoints[KEYPOINT_INDICES.leftShoulder],
        keypoints[KEYPOINT_INDICES.leftHip],
        keypoints[KEYPOINT_INDICES.leftKnee]
      );
      spineAngle = leftSpineAngle;
      validSpineAngles++;
    }
    
    if (isKeypointValid(keypoints[KEYPOINT_INDICES.rightShoulder], 0.2) &&
        isKeypointValid(keypoints[KEYPOINT_INDICES.rightHip], 0.2) &&
        isKeypointValid(keypoints[KEYPOINT_INDICES.rightKnee], 0.2)) {
      const rightSpineAngle = calculateAngle(
        keypoints[KEYPOINT_INDICES.rightShoulder],
        keypoints[KEYPOINT_INDICES.rightHip],
        keypoints[KEYPOINT_INDICES.rightKnee]
      );
      if (validSpineAngles > 0) {
        spineAngle = (spineAngle + rightSpineAngle) / 2;
      } else {
        spineAngle = rightSpineAngle;
      }
      validSpineAngles++;
    }

    // Calculate head forward distance
    let headForwardDistance = 1.5;
    let validHeadDistances = 0;
    
    if (isKeypointValid(keypoints[KEYPOINT_INDICES.leftEar], 0.2) &&
        isKeypointValid(keypoints[KEYPOINT_INDICES.leftShoulder], 0.2)) {
      const leftHeadForward = calculateHeadForwardDistance(
        keypoints[KEYPOINT_INDICES.leftEar],
        keypoints[KEYPOINT_INDICES.leftShoulder]
      );
      headForwardDistance = leftHeadForward;
      validHeadDistances++;
    }
    
    if (isKeypointValid(keypoints[KEYPOINT_INDICES.rightEar], 0.2) &&
        isKeypointValid(keypoints[KEYPOINT_INDICES.rightShoulder], 0.2)) {
      const rightHeadForward = calculateHeadForwardDistance(
        keypoints[KEYPOINT_INDICES.rightEar],
        keypoints[KEYPOINT_INDICES.rightShoulder]
      );
      if (validHeadDistances > 0) {
        headForwardDistance = (headForwardDistance + rightHeadForward) / 2;
      } else {
        headForwardDistance = rightHeadForward;
      }
      validHeadDistances++;
    }

    return {
      neckAngle,
      shoulderAngle,
      spineAngle,
      headForwardDistance,
    };
  }

  private calculateDeviations(angles: PostureAngles): PostureScore['deviations'] {
    // Use calibration data if available, otherwise use default ideal values
    const reference = this.calibrationData?.angles || {
      neckAngle: 165,
      shoulderAngle: 0,
      spineAngle: 175,
      headForwardDistance: 1,
    };

    return {
      neck: Math.abs(angles.neckAngle - reference.neckAngle),
      shoulder: Math.abs(angles.shoulderAngle - reference.shoulderAngle),
      spine: Math.abs(angles.spineAngle - reference.spineAngle),
      headPosition: Math.abs(angles.headForwardDistance - reference.headForwardDistance),
    };
  }

  private calculateOverallScore(deviations: PostureScore['deviations']): number {
    // Weight each component differently
    const weights = {
      neck: 0.3,
      shoulder: 0.2,
      spine: 0.3,
      headPosition: 0.2,
    };

    // Score each component
    const scores = {
      neck: normalizeScore(deviations.neck, 0, 30),
      shoulder: normalizeScore(deviations.shoulder, 0, 15),
      spine: normalizeScore(deviations.spine, 0, 30),
      headPosition: normalizeScore(deviations.headPosition, 0, 3),
    };

    // Calculate weighted average
    const overallScore = 
      scores.neck * weights.neck +
      scores.shoulder * weights.shoulder +
      scores.spine * weights.spine +
      scores.headPosition * weights.headPosition;

    return Math.round(overallScore);
  }

  reset(): void {
    this.previousScore = null;
  }
}