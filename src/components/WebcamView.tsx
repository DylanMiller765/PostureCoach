import { useRef, useEffect, useState, useCallback } from 'react';
import { CalibrationData, PostureScore, Pose } from '../types';
import { PoseDetector } from '../utils/PoseDetector';
import { PostureAnalyzer } from '../utils/PostureAnalyzer';

interface WebcamViewProps {
  isCalibrated: boolean;
  calibrationData: CalibrationData | null;
  onScoreUpdate: (score: PostureScore) => void;
  isMonitoring: boolean;
}

const WebcamView: React.FC<WebcamViewProps> = ({
  isCalibrated,
  calibrationData,
  onScoreUpdate,
  isMonitoring,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detector, setDetector] = useState<PoseDetector | null>(null);
  const analyzerRef = useRef<PostureAnalyzer>(new PostureAnalyzer());
  const animationFrameRef = useRef<number>();
  const lastDetectionTime = useRef<number>(0);
  const lastScoreUpdate = useRef<number>(0);
  const lastScore = useRef<number | null>(null);
  const frameInterval = 100; // Run detection every 100ms (10 FPS)
  const scoreUpdateInterval = 500; // Update score every 500ms

  // Initialize webcam
  useEffect(() => {
    const initWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }

        setIsLoading(false);
      } catch (err) {
        setError('Unable to access webcam. Please check permissions.');
        setIsLoading(false);
      }
    };

    initWebcam();

    return () => {
      // Cleanup webcam stream
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Initialize TensorFlow.js and MoveNet
  useEffect(() => {
    const loadModel = async () => {
      try {
        const poseDetector = new PoseDetector();
        await poseDetector.initialize();
        setDetector(poseDetector);
      } catch (err) {
        console.error('Model loading error:', err);
        setError('Failed to load pose detection model: ' + (err as Error).message);
      }
    };

    loadModel();

    return () => {
      detector?.dispose();
    };
  }, []);

  // Update analyzer with calibration data
  useEffect(() => {
    if (calibrationData) {
      // Set calibration data
      analyzerRef.current.setCalibration(calibrationData);
    }
  }, [calibrationData]);

  // Main detection loop
  const detectPose = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !detector || !isMonitoring) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.readyState !== 4) {
      animationFrameRef.current = requestAnimationFrame(detectPose);
      return;
    }
    
    // Throttle detection to target frame rate
    const now = Date.now();
    const timeSinceLastDetection = now - lastDetectionTime.current;
    
    if (timeSinceLastDetection < frameInterval) {
      // Skip this frame if we're running too fast
      animationFrameRef.current = requestAnimationFrame(detectPose);
      return;
    }
    
    lastDetectionTime.current = now;

    // Set canvas size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      // Detect pose
      const pose = await detector.detectPose(video);
      
      if (pose) {
        // Draw skeleton
        detector.drawSkeleton(ctx, pose, canvas.width, canvas.height);
        
        // Analyze posture only if calibrated and monitoring
        if (isCalibrated && isMonitoring) {
          const score = analyzerRef.current.analyzePosture(pose);
          if (score) {
            const now = Date.now();
            const timeSinceLastUpdate = now - lastScoreUpdate.current;
            const scoreDifference = lastScore.current ? Math.abs(score.overall - lastScore.current) : 100;
            
            // Only update if enough time has passed OR score changed significantly
            if (timeSinceLastUpdate >= scoreUpdateInterval || scoreDifference > 5) {
              onScoreUpdate(score);
              lastScoreUpdate.current = now;
              lastScore.current = score.overall;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in pose detection:', error);
    }

    animationFrameRef.current = requestAnimationFrame(detectPose);
  }, [detector, isMonitoring, isCalibrated, onScoreUpdate]);

  // Start/stop detection based on monitoring state
  useEffect(() => {
    if (isMonitoring && detector) {
      detectPose();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isMonitoring, detector, detectPose]);

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-2xl glass">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-lg">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
            <p className="text-foreground font-medium">Initializing camera...</p>
            <p className="text-muted-foreground text-sm mt-1">Please allow camera access</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-danger/10 backdrop-blur-lg">
          <div className="text-center max-w-md glass rounded-2xl p-8">
            <div className="w-16 h-16 bg-danger/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-foreground font-semibold mb-2">{error}</p>
            <p className="text-muted-foreground text-sm mb-6">Check the browser console for more details</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-danger text-white rounded-xl hover:bg-danger/90 transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:scale-105"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
      />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Status Overlays */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto">
          {!isCalibrated && (
            <div className="glass-subtle rounded-full px-4 py-2 flex items-center gap-2 animate-fade-in">
              <div className="w-2 h-2 bg-warning rounded-full animate-pulse" />
              <span className="text-sm font-medium text-foreground">Calibration needed</span>
            </div>
          )}
          {isCalibrated && !isMonitoring && (
            <div className="glass-subtle rounded-full px-4 py-2 flex items-center gap-2 animate-fade-in">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span className="text-sm font-medium text-foreground">Ready to monitor</span>
            </div>
          )}
        </div>
        
        {isMonitoring && (
          <div className="glass-subtle rounded-full px-4 py-2 flex items-center gap-2 animate-scale-in pointer-events-auto">
            <div className="relative">
              <div className="w-3 h-3 bg-success rounded-full animate-ping absolute" />
              <div className="w-3 h-3 bg-success rounded-full" />
            </div>
            <span className="text-sm font-bold text-foreground">LIVE</span>
          </div>
        )}
      </div>
      
      {/* Pose Detection Quality Indicator */}
      {isMonitoring && detector && (
        <div className="absolute bottom-4 left-4 glass-subtle rounded-xl px-3 py-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs font-medium text-foreground">Detection: High</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebcamView;