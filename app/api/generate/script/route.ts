import { NextRequest, NextResponse } from 'next/server';
import { generateScript } from '@/lib/generateScript';
import { generateVoiceover } from '@/lib/generateVoiceover';
import { fetchVisuals } from '@/lib/fetchVisuals';
import { estimateDuration } from '@/lib/generateScript';
import { createReel } from '@/lib/createReels';

export async function POST(req: NextRequest) {
  try {
    const { playerName, sport } = await req.json();

    // Generate all assets
    const script = await generateScript(playerName, sport || 'football');
    const fileName = playerName.toLowerCase().replace(/\s+/g, '-');
    const voiceoverPath = await generateVoiceover(script, fileName);
    const visuals = await fetchVisuals({ playerName });


    // Calculate duration and generate reel
    const duration = estimateDuration(script);
    const reelPath = await createReel({
      playerName,
      audioPath: voiceoverPath,
      imagePaths: visuals.allImages,
    });

    return NextResponse.json({
      script,
      voiceoverPath,
      visuals,
      reelPath,
    });
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
  }
}