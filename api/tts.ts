import type { IncomingMessage, ServerResponse } from 'http';

const EDGE_NEURAL_VOICES: Record<string, { female: string; male: string }> = {
  vi: { female: 'vi-VN-HoaiMyNeural', male: 'vi-VN-NamMinhNeural' },
  en: { female: 'en-US-AriaNeural', male: 'en-US-GuyNeural' },
  'en-gb': { female: 'en-GB-SoniaNeural', male: 'en-GB-RyanNeural' },
  zh: { female: 'zh-CN-XiaoxiaoNeural', male: 'zh-CN-YunxiNeural' },
  'zh-tw': { female: 'zh-TW-HsiaoChenNeural', male: 'zh-TW-YunJheNeural' },
  ja: { female: 'ja-JP-NanamiNeural', male: 'ja-JP-KeitaNeural' },
  ko: { female: 'ko-KR-SunHiNeural', male: 'ko-KR-InJoonNeural' },
  th: { female: 'th-TH-PremwadeeNeural', male: 'th-TH-NiwatNeural' },
  id: { female: 'id-ID-GadisNeural', male: 'id-ID-ArdiNeural' },
  ms: { female: 'ms-MY-YasminNeural', male: 'ms-MY-OsmanNeural' },
  fr: { female: 'fr-FR-DeniseNeural', male: 'fr-FR-HenriNeural' },
  de: { female: 'de-DE-KatjaNeural', male: 'de-DE-ConradNeural' },
  es: { female: 'es-ES-ElviraNeural', male: 'es-ES-AlvaroNeural' },
  pt: { female: 'pt-BR-FranciscaNeural', male: 'pt-BR-AntonioNeural' },
  ru: { female: 'ru-RU-SvetlanaNeural', male: 'ru-RU-DmitryNeural' },
  hi: { female: 'hi-IN-SwaraNeural', male: 'hi-IN-MadhurNeural' },
  ar: { female: 'ar-SA-ZariyahNeural', male: 'ar-SA-HamedNeural' },
  it: { female: 'it-IT-ElsaNeural', male: 'it-IT-DiegoNeural' },
  tr: { female: 'tr-TR-EmelNeural', male: 'tr-TR-AhmetNeural' },
  nl: { female: 'nl-NL-ColetteNeural', male: 'nl-NL-MaartenNeural' },
  pl: { female: 'pl-PL-ZofiaNeural', male: 'pl-PL-MarekNeural' },
  uk: { female: 'uk-UA-PolinaNeural', male: 'uk-UA-OstapNeural' },
  tl: { female: 'fil-PH-BlessicaNeural', male: 'fil-PH-AngeloNeural' },
  km: { female: 'km-KH-SreymomNeural', male: 'km-KH-PisethNeural' },
  lo: { female: 'lo-LA-KeomanyNeural', male: 'lo-LA-ChanthavongNeural' },
  my: { female: 'my-MM-NilarNeural', male: 'my-MM-ThihaNeural' },
};

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

async function synthesizeWithEdgeTts(text: string, voiceName: string): Promise<Buffer | null> {
  try {
    const { MsEdgeTTS, OUTPUT_FORMAT } = await import('msedge-tts');
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const { audioStream } = tts.toStream(text);
    const bufs: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      audioStream.on('data', (chunk: Buffer) => bufs.push(Buffer.from(chunk)));
      audioStream.on('end', () => resolve());
      audioStream.on('error', (e: Error) => reject(e));
    });
    const out = Buffer.concat(bufs);
    return out.length > 200 ? out : null;
  } catch {
    return null;
  }
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
    let gender = (urlObj.searchParams.get('gender') || 'female').trim().toLowerCase();

    if (req.method === 'POST' && !text) {
      const bodyChunks: Buffer[] = [];
      for await (const chunk of req) {
        bodyChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      try {
        const parsed = JSON.parse(Buffer.concat(bodyChunks).toString('utf8'));
        if (typeof parsed.text === 'string') text = parsed.text.trim();
        if (typeof parsed.lang === 'string') langRaw = parsed.lang.trim();
        if (typeof parsed.gender === 'string') gender = parsed.gender.trim().toLowerCase();
      } catch {
        // Ignore invalid JSON body
      }
    }

    if (!text) {
      res.statusCode = 400;
      res.end('Missing text');
      return;
    }

    const rawLower = langRaw === 'auto' ? 'vi' : langRaw.toLowerCase();
    const baseLang = rawLower.split('-')[0];
    const voicePair = EDGE_NEURAL_VOICES[rawLower] || EDGE_NEURAL_VOICES[baseLang];

    // 1. Try Microsoft Edge Neural TTS first (distinct Male/Female AI voices, unlimited length, free)
    if (voicePair) {
      const voiceName = gender === 'male' ? voicePair.male : voicePair.female;
      const edgeBuf = await synthesizeWithEdgeTts(text, voiceName);
      if (edgeBuf) {
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.statusCode = 200;
        res.end(edgeBuf);
        return;
      }
    }

    // 2. Fallback to chunked Google Translate TTS across all remaining 243 languages
    const LANG_MAP: Record<string, string> = {
      zh: 'zh-CN',
      'zh-tw': 'zh-TW',
      he: 'iw',
      jw: 'jv',
      fil: 'tl',
    };
    const tl = LANG_MAP[rawLower] || LANG_MAP[baseLang] || baseLang;
    const textChunks = splitTextIntoChunks(text, 180);
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
