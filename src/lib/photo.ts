import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const PHOTOS_DIR = join(process.cwd(), 'data', 'photos');

/** Download a photo from a URL and save it with the given slug. Returns filename or null. */
export async function downloadPhoto(url: string, slug: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
    const filename = `${slug}.${ext}`;
    await mkdir(PHOTOS_DIR, { recursive: true });
    const buffer = Buffer.from(await res.arrayBuffer());
    await writeFile(join(PHOTOS_DIR, filename), buffer);
    return filename;
  } catch {
    return null;
  }
}
