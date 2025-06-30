# PostureCoach Project Reference

## Project Overview
PostureCoach is a real-time posture monitoring web application built with React, TypeScript, and TensorFlow.js. It uses the MoveNet pose detection model to analyze user posture through webcam input and provides real-time feedback.

## Key Features
- Real-time pose detection using MoveNet SinglePose Lightning (30+ FPS)
- Posture scoring based on key body angles (0-100 scale)
- Calibration system for personalized posture baselines
- Visual and audio alerts for poor posture
- Privacy-first design (all processing client-side)
- Session tracking and analytics
- Responsive, modern UI with Tailwind CSS

## Architecture

### Core Technologies
- **Frontend**: React 18+ with TypeScript
- **ML Model**: TensorFlow.js with MoveNet SinglePose Lightning
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **State Management**: React Context + useReducer
- **Storage**: localStorage for settings and calibration data

### Key Components
1. **WebcamView**: Displays webcam feed with pose skeleton overlay
2. **PostureScore**: Real-time posture score display (0-100)
3. **CalibrationModal**: Captures "good posture" baseline
4. **Settings**: User preferences and configuration
5. **AlertSystem**: Visual/audio notifications for poor posture

### Utilities
1. **PoseDetector**: TensorFlow.js integration, loads MoveNet model
2. **PostureAnalyzer**: Calculates angles and posture scores
3. **angleCalculations**: Helper functions for body angle math
4. **storage**: localStorage wrapper for persistence

## Posture Analysis Algorithm

### Key Angles Measured
1. **Neck Angle**: Ear → Shoulder → Hip angle
2. **Shoulder Alignment**: Horizontal alignment between shoulders
3. **Spine Curvature**: Shoulder → Hip → Knee angle
4. **Head Forward Position**: Distance from ear to shoulder line

### Scoring System
- Each angle deviation from ideal is calculated
- Weighted composite score (0-100)
- Smoothing over time window to reduce jitter
- Personalized thresholds based on calibration

### Ideal Angle References
- Neck: 160-170° (slight forward tilt)
- Shoulders: 0-5° deviation from horizontal
- Spine: 170-180° (nearly straight)
- Head position: < 2 inches forward

## MoveNet Keypoints
The model provides 17 keypoints:
- 0: nose
- 1-2: eyes
- 3-4: ears
- 5-6: shoulders
- 7-8: elbows
- 9-10: wrists
- 11-12: hips
- 13-14: knees
- 15-16: ankles

## Development Commands
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run typecheck  # Run TypeScript type checking
npm run lint       # Run linting
```

## File Structure
```
posture-coach/
├── src/
│   ├── components/
│   │   ├── WebcamView.tsx      # Webcam + skeleton overlay
│   │   ├── PostureScore.tsx    # Score display component
│   │   ├── CalibrationModal.tsx # Calibration UI
│   │   ├── Settings.tsx        # Settings panel
│   │   └── AlertSystem.tsx     # Alert notifications
│   ├── utils/
│   │   ├── PoseDetector.ts     # TensorFlow.js integration
│   │   ├── PostureAnalyzer.ts  # Posture scoring logic
│   │   ├── angleCalculations.ts # Angle math helpers
│   │   └── storage.ts          # localStorage wrapper
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   ├── styles/
│   │   └── index.css          # Global styles + Tailwind
│   ├── App.tsx                # Main app component
│   └── main.tsx               # App entry point
├── public/                    # Static assets
├── index.html                 # HTML template
└── [config files]            # Various config files
```

## LocalStorage Schema
```typescript
{
  calibration: {
    neckAngle: number,
    shoulderAngle: number,
    spineAngle: number,
    timestamp: number
  },
  settings: {
    alertThreshold: number,      // 0-100
    soundEnabled: boolean,
    soundVolume: number,        // 0-1
    alertFrequency: number,     // seconds
    selectedCamera: string
  },
  sessionHistory: {
    date: string,
    averageScore: number,
    duration: number,
    scores: number[]
  }[]
}
```

## Performance Targets
- 30+ FPS pose detection
- < 100ms latency for alerts
- Smooth UI updates (60 FPS)
- Minimal CPU usage when idle

## Privacy & Security
- No server uploads
- All ML processing client-side
- No user data leaves the browser
- Camera permissions required
- Clear data option in settings

## Future Enhancements
- Multiple pose support
- Detailed body part analytics
- Exercise recommendations
- Export session data
- Mobile app version
- Integration with fitness trackers