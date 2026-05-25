# VibeType 🎙️✨

VibeType is a production-quality browser-based AI platform that automatically inserts emojis into live speech transcription using webcam video, hand gestures, facial expressions, and speech recognition. 

All AI models run 100% on the client side, ensuring privacy, low latency, and zero server costs.

## Features

- **Live Speech-to-Text**: Uses the browser's native Web Speech API for continuous dictation.
- **Gesture Detection**: Detects thumbs up, peace signs, open palms, and more using MediaPipe Hands.
- **Expression Analysis**: Detects smiles, laughs, and surprise using MediaPipe Face Mesh.
- **Live Emoji Insertion**: Automatically appends the perfect emoji to your transcript based on your physical vibe.
- **Privacy First**: No video or audio is ever sent to a server for processing.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (Futuristic Dark UI, Glassmorphism)
- **AI Models**: Google MediaPipe (Tasks Vision)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

**Note on Browser Support**: The Web Speech API is best supported in Google Chrome. You must grant Camera and Microphone permissions when prompted.

## Deployment on Vercel

The easiest way to deploy this Next.js app is to use the [Vercel Platform](https://vercel.com/new).

Since VibeType uses entirely client-side processing, it operates perfectly on Vercel's free tier. 

1. Push your code to a GitHub repository.
2. Import the project in Vercel.
3. Keep the default Build Command (`next build`) and Install Command (`npm install`).
4. Deploy!

No Environment Variables are required to run the core features of the app.

## Architecture

- `src/components/CameraFeed.tsx`: Manages the webcam overlay, MediaPipe canvases, and AI initializations.
- `src/hooks/useMediaPipeHands.ts`: Client-side worker loading for the hand landmarker.
- `src/hooks/useMediaPipeFace.ts`: Client-side worker loading for the face landmarker.
- `src/hooks/useSpeechRecognition.ts`: Wraps the native Web Speech API.
- `src/hooks/useEmojiEngine.ts`: Maps detected expressions/gestures to emojis and handles appending them to the transcript.
