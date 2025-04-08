// export function cleanScript(rawScript: string): string {
//     return rawScript
//     .replace(/\[.*?\]/g, '') 
//     .replace(/\[(\d{1,2}[-–]\d{1,2}\s*seconds?)\]/gi, '') // ⏱ Remove [0-5 seconds]
//       .replace(/^Here is .*?:\s*/i, '') // remove intro line like "Here is a 60-second reel script..."
//       .replace(/This script aims.*$/gi, '') // remove outro lines like "This script aims..."
//       .replace(/^\s*\(.*?\)\s*$/gm, '') // remove full-line stage directions like (Ominous music)
//       .replace(/\(.*?\)/g, '') // remove inline stage directions
//       .replace(/Narrator\s*[:：-]\s*/gi, '') // remove narrator tags
//       .replace(/\n{2,}/g, '\n') // condense line breaks
//       .replace(/^\s*[\r\n]/gm, '') // remove empty lines
//       .trim();
//   }
  
export function cleanScript(rawScript: string): string {
  return rawScript
    .replace(/\[.*?\]/g, '') // remove anything in brackets
    .replace(/\[(\d{1,2}[-–]\d{1,2}\s*seconds?)\]/gi, '') // remove [0-5 seconds]
    .replace(/^here('|’)s.*?reel script.*?:/i, '') // remove lines like "Here's a 60-second reel script..."
    .replace(/^This is a.*?script.*?:/i, '') // alternate intro line
    .replace(/This script aims.*$/gi, '') // remove generic outros
    .replace(/^\s*\(.*?\)\s*$/gm, '') // remove full-line stage directions
    .replace(/\(.*?\)/g, '') // remove inline stage directions
    .replace(/Narrator\s*[:：-]\s*/gi, '') // remove "Narrator:" tags
    .replace(/\n{2,}/g, '\n') // replace multiple newlines with one
    .replace(/^\s*[\r\n]/gm, '') // trim each line
    .trim();
}
