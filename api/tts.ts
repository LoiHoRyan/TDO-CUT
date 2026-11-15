import type { IncomingMessage, ServerResponse } from 'http';

function splitTextIntoChunks(text: string, maxLen = 180): string[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLen) return clean ? [clean] : [];
  const chunks: string[] = [];
  let remaining = clean;
  while (remaining.length > maxLen) {
    let splitIdx = -1;
    for (const sep of ['. ', '! ', '? ', '; ', ', ', ' ']) {
      const idx = remaining.lastIndexOf(sep, maxLen);
      if (idx > 20) {
        splitIdx = idx + sep.length;
        break;
      }
    }
    if (splitIdx <= 0) splitIdx = maxLen;
    chunks.push(remaining.slice(0, splitIdx).trim());
    remaining = remaining.slice(splitIdx).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    const urlObj = new URL(req.url || '/', 'http://localhost');
    let text = (urlObj.searchParams.get('text') || '').trim();
    let langRaw = (urlObj.searchParams.get('lang') || 'vi').trim();

    if (req.method === 'POST' && !text) {
      const bodyChunks: Buffer[] = [];
      for await (const chunk of req) {
        bodyChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      try {
        const parsed = JSON.parse(Buffer.concat(bodyChunks).toString('utf8'));
        if (typeof parsed.text === 'string') text = parsed.text.trim();
        if (typeof parsed.lang === 'string') langRaw = parsed.lang.trim();
      } catch {
        // Ignore invalid JSON body
      }
    }

    const tl = langRaw === 'auto' ? 'vi' : langRaw.split('-')[0].toLowerCase();
    if (!text) {
      res.statusCode = 400;
      res.end('Missing text');
      return;
    }

    const textChunks = splitTextIntoChunks(text.slice(0, 3000), 180);
    const audioBuffers: Buffer[] = [];

    for (const part of textChunks) {
      const ttsUrl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(
        tl
      )}&q=${encodeURIComponent(part)}`;

      const upstream = await fetch(ttsUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Referer: 'https://translate.google.com/',
        },
      });

      if (!upstream.ok) {
        res.statusCode = upstream.status;
        res.end('Upstream TTS error');
        return;
      }

      const arrayBuf = await upstream.arrayBuffer();
      audioBuffers.push(Buffer.from(arrayBuf));
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.statusCode = 200;
    res.end(Buffer.concat(audioBuffers));
  } catch (err) {
    res.statusCode = 500;
    res.end(err instanceof Error ? err.message : 'TTS server error');
  }
}
