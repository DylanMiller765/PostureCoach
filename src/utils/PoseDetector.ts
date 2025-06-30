import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import { Pose, Keypoint } from '../types';

export class PoseDetector {
  private detector: poseDetection.PoseDetector | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Wait for TensorFlow.js to be ready
      await tf.ready();
      // TensorFlow.js is ready
      
      // Create detector with MoveNet SinglePose Lightning model
      const model = poseDetection.SupportedModels.MoveNet;
      
      this.detector = await poseDetection.createDetector(model, {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        enableSmoothing: true,
        minPoseScore: 0.1,
      });

      this.isInitialized = true;
      // Pose detector initialized
    } catch (error) {
      console.error('Failed to initialize pose detector:', error);
      throw new Error('Failed to load pose detection model: ' + (error as Error).message);
    }
  }

  async detectPose(videoElement: HTMLVideoElement): Promise<Pose | null> {
    if (!this.detector || !this.isInitialized) {
      throw new Error('Detector not initialized');
    }

    try {
      const poses = await this.detector.estimatePoses(videoElement, {
        maxPoses: 1,
        flipHorizontal: false,
      });

      if (poses.length === 0) {
        return null;
      }

      // Convert to our Pose format
      const pose = poses[0];
      const keypoints: Keypoint[] = pose.keypoints.map((kp) => ({
        x: kp.x,
        y: kp.y,
        score: kp.score,
        name: kp.name,
      }));

      return {
        keypoints,
        score: pose.score,
      };
    } catch (error) {
      console.error('Error detecting pose:', error);
      return null;
    }
  }

  drawSkeleton(
    ctx: CanvasRenderingContext2D,
    pose: Pose,
    videoWidth: number,
    videoHeight: number
  ): void {
    const minConfidence = 0.2;

    // Define skeleton connections
    const skeleton = [
      [5, 6], // shoulders
      [5, 7], // left shoulder to elbow
      [7, 9], // left elbow to wrist
      [6, 8], // right shoulder to elbow
      [8, 10], // right elbow to wrist
      [5, 11], // left shoulder to hip
      [6, 12], // right shoulder to hip
      [11, 12], // hips
      [11, 13], // left hip to knee
      [13, 15], // left knee to ankle
      [12, 14], // right hip to knee
      [14, 16], // right knee to ankle
    ];

    // Draw skeleton lines with gradient effect
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(20, 184, 166, 0.5)';

    skeleton.forEach(([i, j]) => {
      const kp1 = pose.keypoints[i];
      const kp2 = pose.keypoints[j];

      if (kp1.score! >= minConfidence && kp2.score! >= minConfidence) {
        const gradient = ctx.createLinearGradient(kp1.x, kp1.y, kp2.x, kp2.y);
        gradient.addColorStop(0, this.getKeypointColor(kp1.score!));
        gradient.addColorStop(1, this.getKeypointColor(kp2.score!));
        ctx.strokeStyle = gradient;
        
        ctx.beginPath();
        ctx.moveTo(kp1.x, kp1.y);
        ctx.lineTo(kp2.x, kp2.y);
        ctx.stroke();
      }
    });

    // Reset shadow for keypoints
    ctx.shadowBlur = 0;
    
    // Draw keypoints with glow effect
    pose.keypoints.forEach((keypoint) => {
      if (keypoint.score! >= minConfidence) {
        const color = this.getKeypointColor(keypoint.score!);
        
        // Outer glow
        ctx.fillStyle = color + '33'; // 20% opacity
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        // Inner dot
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // White center
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  }

  private getKeypointColor(score: number): string {
    if (score >= 0.8) return '#10B981'; // success color
    if (score >= 0.5) return '#F59E0B'; // warning color
    return '#F43F5E'; // danger color
  }

  dispose(): void {
    if (this.detector) {
      this.detector.dispose();
      this.detector = null;
      this.isInitialized = false;
    }
  }
}