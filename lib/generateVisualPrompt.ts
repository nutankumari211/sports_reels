// lib/generateVisualPrompt.ts

interface PromptOptions {
    playerName: string;
    sport: string;
    team?: string;
    country?: string;
    vibe?: 'cinematic' | 'vintage' | 'action' | 'epic';
    traits?: string[];
  }
  
  const sportScenes: Record<string, string> = {
    football: 'dribbling past defenders in a packed stadium',
    tennis: 'smashing a serve with fierce intensity',
    cricket: 'hitting a six under floodlights',
    basketball: 'performing a slam dunk mid-air',
    boxing: 'landing a powerful punch in the ring',
    swimming: 'diving into the pool at full speed',
    running: 'sprinting on a track with determination',
    baseball: 'hitting a home run with explosive power',
    hockey: 'sliding across the ice, ready to strike the puck',
    golf: 'swinging a club with perfect form on a lush course',
    default: 'in action, showcasing elite athleticism',
  };
  
  export const generateVisualPrompt = ({
    playerName,
    sport,
    team,
    country,
    vibe = 'cinematic',
    traits = [],
  }: PromptOptions): string => {
    const scene = sportScenes[sport.toLowerCase()] || sportScenes.default;
    const traitString = traits.length ? `with ${traits.join(', ')}` : '';
    const teamOrCountry = team || country ? `wearing the jersey of ${team || country}` : '';
  
    return `A legendary ${sport} player ${traitString}, ${teamOrCountry}, ${scene}, ${vibe} lighting, ultra detailed, digital painting, dramatic atmosphere`;
  };
  