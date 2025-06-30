import { useState, useEffect, useRef } from 'react';
import { CalibrationData } from '../types';
import { PoseDetector } from '../utils/PoseDetector';
import { PostureAnalyzer } from '../utils/PostureAnalyzer';

interface CalibrationModalProps {
  onComplete: (data: CalibrationData) => void;
  onClose: () => void;
}

const CalibrationModal: React.FC<CalibrationModalProps> = ({ onComplete, onClose }) => {
  const [countdown, setCountdown] = useState(5);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPoses, setCapturedPoses] = useState<any[]>([]);
  const detectorRef = useRef<PoseDetector | null>(null);
  const analyzerRef = useRef<PostureAnalyzer>(new PostureAnalyzer());

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !isCapturing) {
      // Start capture
      setIsCapturing(true);
      captureCalibrationData();
    }
  }, [countdown, isCapturing]);

  const captureCalibrationData = async () => {
    try {
      // Get video element from the main view
      const videoElement = document.querySelector('video');
      if (!videoElement) {
        throw new Error('Video element not found');
      }

      // Initialize detector if not already done
      if (!detectorRef.current) {
        detectorRef.current = new PoseDetector();
        await detectorRef.current.initialize();
      }

      // Capture multiple poses over 2 seconds
      const poses: any[] = [];
      const captureInterval = setInterval(async () => {
        const pose = await detectorRef.current!.detectPose(videoElement as HTMLVideoElement);
        if (pose) {
          const score = analyzerRef.current.analyzePosture(pose);
          if (score) {
            poses.push(score.angles);
          }
        }
      }, 100);

      // After 2 seconds, average the captured poses
      setTimeout(() => {
        clearInterval(captureInterval);
        
        if (poses.length > 0) {
          // Average all captured angles
          const avgAngles = {
            neckAngle: poses.reduce((sum, p) => sum + p.neckAngle, 0) / poses.length,
            shoulderAngle: poses.reduce((sum, p) => sum + p.shoulderAngle, 0) / poses.length,
            spineAngle: poses.reduce((sum, p) => sum + p.spineAngle, 0) / poses.length,
            headForwardDistance: poses.reduce((sum, p) => sum + p.headForwardDistance, 0) / poses.length,
          };

          const calibrationData: CalibrationData = {
            angles: avgAngles,
            timestamp: Date.now(),
            isCalibrated: true,
          };

          // Calibration completed
          onComplete(calibrationData);
        } else {
          // Fallback to default values if no poses captured
          const mockCalibration: CalibrationData = {
            angles: {
              neckAngle: 165,
              shoulderAngle: 2,
              spineAngle: 175,
              headForwardDistance: 1.5,
            },
            timestamp: Date.now(),
            isCalibrated: true,
          };
          onComplete(mockCalibration);
        }
      }, 2000);
    } catch (error) {
      console.error('Calibration error:', error);
      // Fallback to default values
      const mockCalibration: CalibrationData = {
        angles: {
          neckAngle: 165,
          shoulderAngle: 2,
          spineAngle: 175,
          headForwardDistance: 1.5,
        },
        timestamp: Date.now(),
        isCalibrated: true,
      };
      onComplete(mockCalibration);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup
      detectorRef.current?.dispose();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in">
      <div className="glass rounded-3xl shadow-2xl p-8 max-w-md w-full animate-scale-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
            <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Calibrate Your Posture</h2>
        </div>
        
        <div className="mb-8">
          <p className="text-muted-foreground mb-6">
            Sit in your ideal posture position. We'll capture your baseline in <span className="font-mono font-bold text-primary">{countdown}</span> seconds.
          </p>
          
          <div className="glass-subtle rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground">Perfect Posture Checklist</h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-foreground">Sit up straight with shoulders relaxed and back</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-foreground">Keep your head level with chin slightly tucked</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-foreground">Place feet flat on the floor, hip-width apart</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-foreground">Adjust screen to eye level</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          {countdown > 0 ? (
            <div className="relative">
              <div className="w-32 h-32 mx-auto relative">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted/30"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-primary transition-all duration-1000"
                    style={{
                      strokeDasharray: `${2 * Math.PI * 56}`,
                      strokeDashoffset: `${2 * Math.PI * 56 * (1 - (5 - countdown) / 5)}`,
                      strokeLinecap: 'round',
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl font-bold text-primary font-mono">{countdown}</span>
                </div>
              </div>
              <p className="text-muted-foreground mt-4">Get ready...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-32 h-32 mx-auto relative">
                <div className="absolute inset-0 bg-success/20 rounded-full animate-ping" />
                <div className="relative w-32 h-32 bg-success/10 rounded-full flex items-center justify-center">
                  {isCapturing ? (
                    <div className="w-16 h-16 border-4 border-success border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-16 h-16 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <p className="text-lg font-medium text-foreground">
                {isCapturing ? 'Analyzing your posture...' : 'Calibration complete!'}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 px-4 neu-button rounded-xl text-foreground font-medium hover:scale-105 transition-all duration-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CalibrationModal;