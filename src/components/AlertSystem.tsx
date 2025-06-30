import { useEffect, useRef, useState } from 'react';
import { AlertConfig } from '../types';

interface AlertSystemProps {
  config: AlertConfig;
  onDismiss: () => void;
}

const POSTURE_TIPS = [
  "Try adjusting your chair height so your feet are flat on the floor",
  "Position your screen at eye level to reduce neck strain",
  "Keep your shoulders relaxed and pulled back",
  "Take a short break and stretch your neck and shoulders",
  "Ensure your lower back is supported by your chair",
  "Keep your keyboard and mouse at elbow height",
  "Try the 20-20-20 rule: Every 20 minutes, look at something 20 feet away for 20 seconds",
  "Stand up and walk around for a minute",
  "Check if your chair's armrests are at the right height",
  "Consider using a lumbar support cushion"
];

const AlertSystem: React.FC<AlertSystemProps> = ({ config, onDismiss }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [tip] = useState(() => POSTURE_TIPS[Math.floor(Math.random() * POSTURE_TIPS.length)]);

  useEffect(() => {
    // Play sound if enabled
    if (config.type === 'audio' || config.type === 'both') {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = config.severity === 'high' ? 800 : config.severity === 'medium' ? 600 : 400;
      gainNode.gain.value = 0.3;

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
    }

    // Auto dismiss after duration
    if (config.duration) {
      const timer = setTimeout(onDismiss, config.duration);
      return () => clearTimeout(timer);
    }
  }, [config, onDismiss]);

  if (config.type === 'audio') {
    return null; // Audio only, no visual
  }

  const getBorderColor = () => {
    switch (config.severity) {
      case 'high':
        return 'border-red-500';
      case 'medium':
        return 'border-yellow-500';
      case 'low':
        return 'border-blue-500';
    }
  };

  const getBackgroundColor = () => {
    switch (config.severity) {
      case 'high':
        return 'bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const getTextColor = () => {
    switch (config.severity) {
      case 'high':
        return 'text-red-800 dark:text-red-200';
      case 'medium':
        return 'text-yellow-800 dark:text-yellow-200';
      case 'low':
        return 'text-blue-800 dark:text-blue-200';
    }
  };

  return (
    <>
      {/* Screen border pulse */}
      <div className={`fixed inset-0 pointer-events-none`}>
        <div className={`absolute inset-0 border-4 ${getBorderColor()} animate-pulse opacity-50 rounded-2xl m-2`} />
      </div>
      
      {/* Modern toast notification */}
      <div className="fixed top-24 right-4 z-50 max-w-md animate-slide-in">
        <div className="glass rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className={`px-6 py-4 bg-gradient-to-r ${
            config.severity === 'high' ? 'from-danger/20 to-danger/10' :
            config.severity === 'medium' ? 'from-warning/20 to-warning/10' :
            'from-primary/20 to-primary/10'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  config.severity === 'high' ? 'bg-danger/20' :
                  config.severity === 'medium' ? 'bg-warning/20' :
                  'bg-primary/20'
                }`}>
                  <svg className={`w-6 h-6 ${
                    config.severity === 'high' ? 'text-danger' :
                    config.severity === 'medium' ? 'text-warning' :
                    'text-primary'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d={config.severity === 'high' 
                        ? "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        : "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      }
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{config.message}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Posture Alert</p>
                </div>
              </div>
              <button
                onClick={onDismiss}
                className="w-8 h-8 rounded-lg hover:bg-muted/50 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Tip section */}
          <div className="px-6 py-4 border-t border-border/50">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground mb-1">Quick Tip:</p>
                <p className="text-sm text-muted-foreground">{tip}</p>
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          {config.duration && (
            <div className="h-1 bg-muted overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${
                  config.severity === 'high' ? 'from-danger to-danger/50' :
                  config.severity === 'medium' ? 'from-warning to-warning/50' :
                  'from-primary to-primary/50'
                } animate-shrink`}
                style={{
                  animation: `shrink ${config.duration}ms linear forwards`
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AlertSystem;