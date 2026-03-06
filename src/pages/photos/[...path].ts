import type { APIRoute } from 'astro';
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import sharp from 'sharp';

const PHOTOS_DIR = join(process.cwd(), 'data', 'photos');
const CACHE_DIR = join(PHOTOS_DIR, '.cache');

const FORMATS = ['webp', 'jpeg', 'png'] as const;
type Format = (typeof FORMATS)[number];

function parseParams(url: URL) {
  const w = url.searchParams.get('w');
  const f = url.searchParams.get('f');
  return {
    width: w ? Math.min(Math.max(Number(w), 10), 2000) : null,
    format: f && FORMATS.includes(f as Format) ? (f as Format) : null,
  };
}

const MIME: Record<string, string> = {
  webp: 'image/webp',
  jpeg: 'image/jpeg',
  png: 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.heic': 'image/jpeg',
};

async function fileExists(path: string) {
  try { await access(path); return true; } catch { return false; }
}

export const GET: APIRoute = async ({ params, url }) => {
  const filePath = params.path;
  if (!filePath || filePath.includes('..')) {
    return new Response('Not found', { status: 404 });
  }

  const fullPath = join(PHOTOS_DIR, filePath);
  const { width, format } = parseParams(url);

  // No transform requested — serve original
  if (!width && !format) {
    const ext = extname(fullPath).toLowerCase();
    // HEIC: always convert to jpeg even without params
    if (ext !== '.heic') {
      try {
        const data = await readFile(fullPath);
        return new Response(data, {
          headers: { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'public, max-age=86400' },
        });
      } catch {
        return new Response('Not found', { status: 404 });
      }
    }
  }

  // Build cache key
  const outFormat = format || 'webp';
  const cacheName = `${filePath.replace(/[/.]/g, '_')}_w${width || 'orig'}.${outFormat}`;
  const cachePath = join(CACHE_DIR, cacheName);

  // Serve from cache if available
  if (await fileExists(cachePath)) {
    const cached = await readFile(cachePath);
    return new Response(cached as unknown as BodyInit, {
      headers: { 'Content-Type': MIME[outFormat] || 'image/webp', 'Cache-Control': 'public, max-age=604800' },
    });
  }

  // Process with sharp
  try {
    let pipeline = sharp(fullPath);
    if (width) pipeline = pipeline.resize(width);
    pipeline = pipeline.toFormat(outFormat, { quality: 80 });

    const data = await pipeline.toBuffer();

    // Write to cache (fire and forget)
    await mkdir(dirname(cachePath), { recursive: true });
    writeFile(cachePath, data).catch(() => {});

    return new Response(data as unknown as BodyInit, {
      headers: { 'Content-Type': MIME[outFormat] || 'image/webp', 'Cache-Control': 'public, max-age=604800' },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
};
