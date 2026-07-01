import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Resolve and read a prompt file. Tries two locations:
 *   - Dev (tsx): __dirname is apps/api/src/services, so ../prompts works.
 *   - Prod (node dist/): the Dockerfile copies prompts to dist/prompts, so
 *     ../prompts still works relative to __dirname. The cwd fallback covers
 *     Railway-style deployments where the process runs from src/.
 */
export function loadPrompt(filename: string): string {
  const localPath = join(__dirname, '../prompts', filename);
  if (existsSync(localPath)) return readFileSync(localPath, 'utf-8');

  const cwdPath = join(process.cwd(), 'src/prompts', filename);
  if (existsSync(cwdPath)) return readFileSync(cwdPath, 'utf-8');

  throw new Error(
    `[promptLoader] Cannot find prompt file "${filename}". Searched:\n  ${localPath}\n  ${cwdPath}`
  );
}
