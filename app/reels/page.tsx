'use client';

import { useEffect, useRef, useState } from 'react';

export default function ReelPage() {
  const [reels, setReels] = useState<
    { id: string; playerName: string; reelUrl: string }[]
  >([]);
  const videoRefs = useRef<HTMLVideoElement[]>([]);

  useEffect(() => {
    fetch('/api/reels')
      .then((res) => res.json())
      .then((data) => {
        const formatted = (data || []).map((reel: any) => ({
          id: reel.s3Key,
          playerName: reel.playerName,
          reelUrl: reel.videoUrl,
        }));
        setReels(formatted);
      })
      .catch((err) => console.error('Failed to load reels:', err));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute('data-index'));
          const video = videoRefs.current[index];

          if (!video) return;

          if (entry.isIntersecting) {
            const src = video.getAttribute('data-src');
            if (!video.src && src) {
              video.src = src;
            }

            video.muted = false;
            video.play().catch(() => {});
          } else {
            video.pause();
            video.muted = true;
          }
        });
      },
      {
        threshold: 0.8,
      }
    );

    videoRefs.current.forEach((video, index) => {
      if (video) observer.observe(video);
    });

    return () => {
      videoRefs.current.forEach((video) => {
        if (video) observer.unobserve(video);
      });
    };
  }, [reels]);

  return (
    <div className="h-screen w-screen snap-y snap-mandatory overflow-y-scroll bg-black flex flex-col items-center">
      {reels.map((reel, index) => (
        <div
          key={reel.id}
          className="relative h-screen snap-start flex items-center justify-center"
        >
          <video
            loading="lazy"
            data-src={reel.reelUrl}
            controls
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            data-index={index}
            ref={(el) => {
              if (el) {
                videoRefs.current[index] = el;
              }
            }}
            className="h-full max-h-screen w-auto max-w-[100vw] object-cover aspect-[9/16] mx-auto"
          />
        </div>
      ))}
    </div>
  );
}
