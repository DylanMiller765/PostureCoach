import { useState, useEffect, useCallback, useRef } from 'react';
import WebcamView from './components/WebcamView';
import PostureScore from './components/PostureScore';
import CalibrationModal from './components/CalibrationModal';
import Settings from './components/Settings';
import AlertSystem from './components/AlertSystem';
import { CalibrationData, PostureScore as PostureScoreType, UserSettings, AlertConfig } from './types';

const DEFAULT_SETTINGS: UserSettings = {
  alertThreshold: 70,
  soundEnabled: true,
  soundVolume: 0.5,
  alertFrequency: 30,
  darkMode: false,
};

function App() {
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [calibrationData, setCalibrationData] = useState<CalibrationData | null>(null);
  const [currentScore, setCurrentScore] = useState<PostureScoreType | null>(null);
  const [showCalibration, setShowCalibration] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [alert, setAlert] = useState<AlertConfig | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const lastAlertTime = useRef<number>(0);
  const alertCooldown = 30000; // 30 seconds between alerts

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('postureCoachSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Load calibration data
    const savedCalibration = localStorage.getItem('postureCoachCalibration');
    if (savedCalibration) {
      const calibration = JSON.parse(savedCalibration);
      setCalibrationData(calibration);
      setIsCalibrated(true);
    }
  }, []);

  useEffect(() => {
    // Apply dark mode
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const handleCalibrationComplete = useCallback((data: CalibrationData) => {
    setCalibrationData(data);
    setIsCalibrated(true);
    setShowCalibration(false);
    localStorage.setItem('postureCoachCalibration', JSON.stringify(data));
  }, []);

  const handleScoreUpdate = useCallback((score: PostureScoreType) => {
    setCurrentScore(score);

    // Check if we need to show an alert
    if (score.overall < settings.alertThreshold && isMonitoring) {
      const now = Date.now();
      const timeSinceLastAlert = now - lastAlertTime.current;
      
      // Only show alert if cooldown period has passed
      if (timeSinceLastAlert >= alertCooldown) {
        const severity = score.overall < 40 ? 'high' : score.overall < 60 ? 'medium' : 'low';
        setAlert({
          type: settings.soundEnabled ? 'both' : 'visual',
          severity,
          message: 'Time to sit up straight!',
          duration: 5000,
        });
        lastAlertTime.current = now;
      }
    }
  }, [settings.alertThreshold, settings.soundEnabled, isMonitoring]);

  const handleSettingsUpdate = useCallback((newSettings: UserSettings) => {
    setSettings(newSettings);
    localStorage.setItem('postureCoachSettings', JSON.stringify(newSettings));
  }, []);

  const toggleMonitoring = useCallback(() => {
    setIsMonitoring(prev => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <header className="glass sticky top-0 z-40 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                PostureCoach
              </h1>
              {isMonitoring && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  <span>Monitoring Active</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCalibration(true)}
                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-medium"
              >
                Calibrate
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="px-5 py-2.5 neu-button rounded-xl text-foreground font-medium hover:scale-105 transition-transform"
              >
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <WebcamView
              isCalibrated={isCalibrated}
              calibrationData={calibrationData}
              onScoreUpdate={handleScoreUpdate}
              isMonitoring={isMonitoring}
            />
          </div>
          
          <div className="space-y-6">
            <PostureScore score={currentScore} />
            
            <div className="glass rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-semibold mb-4 text-foreground">Session Control</h2>
              <button
                onClick={toggleMonitoring}
                disabled={!isCalibrated}
                className={`w-full py-4 px-6 rounded-xl font-medium transition-all duration-300 transform ${
                  isMonitoring
                    ? 'bg-danger text-white shadow-lg hover:shadow-xl hover:scale-105'
                    : 'bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:shadow-xl hover:scale-105 disabled:from-muted disabled:to-muted disabled:text-muted-foreground disabled:hover:scale-100'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  {isMonitoring ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                      </svg>
                      Stop Monitoring
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Start Monitoring
                    </>
                  )}
                </span>
              </button>
              {!isCalibrated && (
                <p className="mt-3 text-sm text-muted-foreground flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Please calibrate your posture first
                </p>
              )}
              {isCalibrated && !isMonitoring && (
                <p className="mt-3 text-sm text-success flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Ready to start tracking
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {showCalibration && (
        <CalibrationModal
          onComplete={handleCalibrationComplete}
          onClose={() => setShowCalibration(false)}
        />
      )}

      {showSettings && (
        <Settings
          settings={settings}
          onUpdate={handleSettingsUpdate}
          onClose={() => setShowSettings(false)}
        />
      )}

      {alert && (
        <AlertSystem
          config={alert}
          onDismiss={() => setAlert(null)}
        />
      )}
    </div>
  );
}

export default App;