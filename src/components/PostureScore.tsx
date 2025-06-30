import { useEffect, useState } from 'react';
import { PostureScore as PostureScoreType, PostureStatus, SCORE_THRESHOLDS } from '../types';

interface PostureScoreProps {
  score: PostureScoreType | null;
}

const PostureScore: React.FC<PostureScoreProps> = ({ score }) => {
  const [displayScore, setDisplayScore] = useState<number | null>(null);
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  
  useEffect(() => {
    if (score?.overall !== undefined) {
      setPreviousScore(displayScore);
      setDisplayScore(score.overall);
    }
  }, [score?.overall]);
  const getStatus = (scoreValue: number | null): PostureStatus => {
    if (scoreValue === null) return 'good'; // Default status when no score
    if (scoreValue >= SCORE_THRESHOLDS.good) return 'good';
    if (scoreValue >= SCORE_THRESHOLDS.warning) return 'warning';
    return 'bad';
  };

  const getStatusColor = (status: PostureStatus) => {
    switch (status) {
      case 'good':
        return 'text-success border-success';
      case 'warning':
        return 'text-warning border-warning';
      case 'bad':
        return 'text-danger border-danger';
    }
  };
  
  const getGradientColor = (status: PostureStatus) => {
    switch (status) {
      case 'good':
        return 'from-success/20 to-success/5';
      case 'warning':
        return 'from-warning/20 to-warning/5';
      case 'bad':
        return 'from-danger/20 to-danger/5';
    }
  };

  const getStatusMessage = (status: PostureStatus) => {
    switch (status) {
      case 'good':
        return 'Good posture! Keep it up!';
      case 'warning':
        return 'Posture needs adjustment';
      case 'bad':
        return 'Sit up straight!';
    }
  };

  const scoreValue = score?.overall ?? null;
  const status = scoreValue !== null ? getStatus(scoreValue) : 'good';
  const statusColor = getStatusColor(status);
  const gradientColor = getGradientColor(status);
  const circumference = 2 * Math.PI * 60; // radius = 60
  const strokeDashoffset = scoreValue !== null ? circumference - (scoreValue / 100) * circumference : circumference;

  return (
    <div className="glass rounded-2xl p-6 shadow-xl">
      <h2 className="text-lg font-semibold mb-6 text-foreground flex items-center gap-2">
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Posture Score
      </h2>
      
      <div className="text-center mb-6">
        <div className="relative inline-flex items-center justify-center">
          {/* Background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${gradientColor} rounded-full blur-xl animate-pulse-slow`} />
          
          {/* SVG Progress Ring */}
          <svg className="w-40 h-40 transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="80"
              cy="80"
              r="60"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="text-muted/30"
            />
            {/* Progress ring */}
            <circle
              cx="80"
              cy="80"
              r="60"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className={`${statusColor} transition-all duration-700 ease-out`}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
                strokeLinecap: 'round',
              }}
            />
          </svg>
          
          {/* Score display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-5xl font-bold font-mono ${statusColor} transition-colors duration-300`}>
              {scoreValue !== null ? Math.round(scoreValue) : '--'}
            </span>
            {previousScore !== null && scoreValue !== null && (
              <span className={`text-xs font-medium mt-1 ${
                scoreValue > previousScore ? 'text-success' : scoreValue < previousScore ? 'text-danger' : 'text-muted-foreground'
              }`}>
                {scoreValue > previousScore ? '↑' : scoreValue < previousScore ? '↓' : '→'} {Math.abs(scoreValue - previousScore).toFixed(0)}
              </span>
            )}
          </div>
        </div>
        
        <p className={`mt-4 font-medium text-lg ${scoreValue !== null ? statusColor : 'text-muted-foreground'} transition-colors duration-300`}>
          {scoreValue !== null ? getStatusMessage(status) : 'Waiting for data...'}
        </p>
      </div>

      {score && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">
              Body Alignment
            </h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-success rounded-full" />
              <span>Good</span>
              <div className="w-2 h-2 bg-warning rounded-full ml-2" />
              <span>Fair</span>
              <div className="w-2 h-2 bg-danger rounded-full ml-2" />
              <span>Poor</span>
            </div>
          </div>
          
          <div className="space-y-3 p-3 rounded-lg bg-muted/30">
            <div className="flex justify-between items-center group">
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Neck</span>
              <div className="flex items-center gap-2">
                <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${
                  score.deviations.neck < 10 ? 'from-success/20 to-success' : 
                  score.deviations.neck < 20 ? 'from-warning/20 to-warning' : 'from-danger/20 to-danger'
                }`} />
                <span className={`text-sm font-mono font-medium ${
                  score.deviations.neck < 10 ? 'text-success' : 
                  score.deviations.neck < 20 ? 'text-warning' : 'text-danger'
                }`}>
                  {score.angles.neckAngle.toFixed(0)}°
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center group">
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Shoulders</span>
              <div className="flex items-center gap-2">
                <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${
                  score.deviations.shoulder < 5 ? 'from-success/20 to-success' : 
                  score.deviations.shoulder < 10 ? 'from-warning/20 to-warning' : 'from-danger/20 to-danger'
                }`} />
                <span className={`text-sm font-mono font-medium ${
                  score.deviations.shoulder < 5 ? 'text-success' : 
                  score.deviations.shoulder < 10 ? 'text-warning' : 'text-danger'
                }`}>
                  {Math.abs(score.angles.shoulderAngle).toFixed(1)}°
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center group">
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Spine</span>
              <div className="flex items-center gap-2">
                <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${
                  score.deviations.spine < 10 ? 'from-success/20 to-success' : 
                  score.deviations.spine < 20 ? 'from-warning/20 to-warning' : 'from-danger/20 to-danger'
                }`} />
                <span className={`text-sm font-mono font-medium ${
                  score.deviations.spine < 10 ? 'text-success' : 
                  score.deviations.spine < 20 ? 'text-warning' : 'text-danger'
                }`}>
                  {score.angles.spineAngle.toFixed(0)}°
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center group">
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Head Position</span>
              <div className="flex items-center gap-2">
                <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${
                  score.angles.headForwardDistance < 2 ? 'from-success/20 to-success' : 
                  score.angles.headForwardDistance < 3 ? 'from-warning/20 to-warning' : 'from-danger/20 to-danger'
                }`} />
                <span className={`text-sm font-mono font-medium ${
                  score.angles.headForwardDistance < 2 ? 'text-success' : 
                  score.angles.headForwardDistance < 3 ? 'text-warning' : 'text-danger'
                }`}>
                  {score.angles.headForwardDistance.toFixed(1)}"
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostureScore;