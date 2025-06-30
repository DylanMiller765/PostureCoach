# PostureCoach

Real-time posture monitoring web app using TensorFlow.js and React.

## Features
- Real-time pose detection using MoveNet SinglePose Lightning
- Posture scoring based on key body angles (0-100 scale)
- Personalized calibration system
- Visual and audio alerts for poor posture
- Privacy-first design (all processing client-side)
- Session tracking and analytics

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open http://localhost:5173 in your browser

4. Allow camera permissions when prompted

5. Click "Calibrate" to set your good posture baseline

6. Click "Start Monitoring" to begin posture tracking

## How It Works

The app uses your webcam to detect body keypoints using TensorFlow.js and the MoveNet pose detection model. It calculates angles between key body parts (neck, shoulders, spine) and compares them to your calibrated "good posture" baseline. When your posture drops below the threshold, you'll receive visual and optional audio alerts.

## Privacy

All processing happens in your browser. No video or pose data is sent to any server.

## Browser Requirements

- Modern browser with WebGL support
- Webcam access
- Chrome, Firefox, Safari, or Edge (latest versions)

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run typecheck` - Run TypeScript type checking