
#Video Link of my working project as it is not deployed yet -> [![Watch the demo](([https://youtu.be/Oh8GcNLtWQ8](https://youtu.be/Oh8GcNLtWQ8)))


# Project Overview
This project auto-generates short-form video reels (like TikTok/Instagram Reels) featuring famous sports players. It uses AI to generate scripts and voiceovers, then compiles everything into a vertical video with FFmpeg and serves it through a smooth-scrolling mobile-optimized UI in Next.js.

How to use -> 
1. npm install
2. npm run dev
3. localhost:3000/reels

# Technical Breakdown
1. Frontend (Next.js + Tailwind CSS)
Built with Next.js App Router.

Client-side rendering for the reel feed.

IntersectionObserver is used to:

Auto-play videos when they’re in view.

Pause videos when scrolled out of view.

Uses Tailwind CSS for responsive, mobile-first UI.

Video layout mimics TikTok with a vertical 9:16 aspect ratio.

2. Backend (Next.js API Routes)
/api/generate/script: Triggers the AI pipeline to:

# Generate a script using an AI model (e.g., Groq).

--- Convert script to voiceover using gTTS (Google Text-to-Speech).
--- Create a vertical reel video using FFmpeg.
--- Upload the final reel to Amazon S3.

/api/reels: Fetches .mp4 URLs from S3 and sends them to the frontend.

3. AI & Automation
Script Generation: Done via Groq (or OpenAI) using the player's name and sport as input.

Voiceover: Converts the script into speech using Google TTS (gTTS).

# Video Compilation:

FFmpeg creates a vertical 720x1280 .mp4 video.

The voiceover is used as the audio track.

The video matches the duration of the voiceover.

4. Storage & Hosting
Amazon S3 is used to store and serve the final reel videos.

The app uses @aws-sdk/client-s3 to fetch reel metadata securely.

5. Playback Optimization
Videos are lazy-loaded.

Auto-play begins when ~80% of the video enters the viewport.

All videos are muted, autoplay-enabled, and looped for mobile-friendly UX.

