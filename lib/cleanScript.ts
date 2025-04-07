export function cleanScript(rawScript: string): string {
    return rawScript
    .replace(/\[.*?\]/g, '') 
    .replace(/\[(\d{1,2}[-–]\d{1,2}\s*seconds?)\]/gi, '') // ⏱ Remove [0-5 seconds]
      .replace(/^Here is .*?:\s*/i, '') // remove intro line like "Here is a 60-second reel script..."
      .replace(/This script aims.*$/gi, '') // remove outro lines like "This script aims..."
      .replace(/^\s*\(.*?\)\s*$/gm, '') // remove full-line stage directions like (Ominous music)
      .replace(/\(.*?\)/g, '') // remove inline stage directions
      .replace(/Narrator\s*[:：-]\s*/gi, '') // remove narrator tags
      .replace(/\n{2,}/g, '\n') // condense line breaks
      .replace(/^\s*[\r\n]/gm, '') // remove empty lines
      .trim();
  }
  