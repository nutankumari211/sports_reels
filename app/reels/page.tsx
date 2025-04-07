'use client';

import { useEffect, useState } from 'react';

export default function ReelPage() {
  const [reels, setReels] = useState<
    { id: string; playerName: string; reelUrl: string }[]
  >([]);

  useEffect(() => {
    fetch('/api/reels')
      .then((res) => res.json())
      .then((data) => {
        console.log('Reels data:', data);
        const formatted = (data || []).map((reel: any) => ({
          id: reel.s3Key, // or generate a unique ID
          playerName: reel.playerName,
          reelUrl: reel.videoUrl,
        }));
        setReels(formatted);
        console.log('Reels loaded:', formatted);
      })
      .catch((err) => console.error('Failed to load reels:', err));
  }, []);

  return (
    <div className="h-screen w-screen snap-y snap-mandatory overflow-y-scroll bg-black flex flex-col items-center">
  {reels.map((reel) => (
    <div
      key={reel.id}
      className="relative h-screen snap-start flex items-center justify-center"
    >
      <video
        src={reel.reelUrl}
        controls
        autoPlay
        loop
        muted
        playsInline
        className="h-full max-h-screen w-auto max-w-[100vw] object-cover aspect-[9/16] mx-auto"
      />
      <div className="absolute bottom-8 left-4 text-white text-xl font-semibold drop-shadow-md">
        {reel.playerName}
      </div>
    </div>
  ))}
</div>

  );
}
