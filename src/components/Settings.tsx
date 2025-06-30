import { UserSettings } from '../types';

interface SettingsProps {
  settings: UserSettings;
  onUpdate: (settings: UserSettings) => void;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdate, onClose }) => {
  const handleChange = (key: keyof UserSettings, value: any) => {
    onUpdate({ ...settings, [key]: value });
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in">
      <div className="glass rounded-3xl shadow-2xl p-8 max-w-md w-full max-h-[80vh] overflow-y-auto animate-scale-in">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl neu-button flex items-center justify-center group"
          >
            <svg className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-muted/30">
            <label className="block text-sm font-medium mb-3 text-foreground flex items-center justify-between">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Alert Threshold
              </span>
              <span className="text-primary font-mono font-bold">{settings.alertThreshold}</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.alertThreshold}
              onChange={(e) => handleChange('alertThreshold', parseInt(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, rgb(var(--primary)) 0%, rgb(var(--primary)) ${settings.alertThreshold}%, rgb(var(--muted)) ${settings.alertThreshold}%, rgb(var(--muted)) 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Strict</span>
              <span>Relaxed</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-muted/30">
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="flex items-center gap-3">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                <span className="text-sm font-medium text-foreground">Sound Alerts</span>
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => handleChange('soundEnabled', e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                  settings.soundEnabled ? 'bg-primary' : 'bg-muted'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform duration-200 ${
                    settings.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  } mt-0.5`} />
                </div>
              </div>
            </label>
          </div>

          {settings.soundEnabled && (
            <div className="p-4 rounded-xl bg-muted/30 animate-fade-in">
              <label className="block text-sm font-medium mb-3 text-foreground flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                  Volume
                </span>
                <span className="text-primary font-mono font-bold">{Math.round(settings.soundVolume * 100)}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.soundVolume}
                onChange={(e) => handleChange('soundVolume', parseFloat(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, rgb(var(--primary)) 0%, rgb(var(--primary)) ${settings.soundVolume * 100}%, rgb(var(--muted)) ${settings.soundVolume * 100}%, rgb(var(--muted)) 100%)`
                }}
              />
            </div>
          )}

          <div className="p-4 rounded-xl bg-muted/30">
            <label className="block text-sm font-medium mb-3 text-foreground flex items-center justify-between">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Alert Frequency
              </span>
              <span className="text-primary font-mono font-bold">{settings.alertFrequency}s</span>
            </label>
            <input
              type="range"
              min="10"
              max="120"
              step="10"
              value={settings.alertFrequency}
              onChange={(e) => handleChange('alertFrequency', parseInt(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, rgb(var(--primary)) 0%, rgb(var(--primary)) ${(settings.alertFrequency - 10) / 110 * 100}%, rgb(var(--muted)) ${(settings.alertFrequency - 10) / 110 * 100}%, rgb(var(--muted)) 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>10s</span>
              <span>2 min</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-muted/30">
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="flex items-center gap-3">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <span className="text-sm font-medium text-foreground">Dark Mode</span>
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={(e) => handleChange('darkMode', e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                  settings.darkMode ? 'bg-primary' : 'bg-muted'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform duration-200 ${
                    settings.darkMode ? 'translate-x-6' : 'translate-x-0.5'
                  } mt-0.5`} />
                </div>
              </div>
            </label>
          </div>

          <div className="pt-4 mt-4 border-t border-border/50">
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear all data? This will reset your calibration and settings.')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="w-full py-3 px-4 bg-danger/10 text-danger rounded-xl hover:bg-danger/20 transition-all duration-200 font-medium flex items-center justify-center gap-2 group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;