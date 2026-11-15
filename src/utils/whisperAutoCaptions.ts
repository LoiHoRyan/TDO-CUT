import { TimelineClip } from './timelineEngine';

export interface TranscribedSubtitleSegment {
  text: string;
  startTime: number;
  duration: number;
}

export interface WhisperLanguageOption {
  code: string;
  label: string;
  whisperLang?: string;
}

// 99 core Whisper languages + 144 additional world/regional languages (243 total)
const CORE_WHISPER_LANGS: Array<[string, string, string]> = [
  ['vi', 'Tiếng Việt (Vietnamese)', 'vietnamese'],
  ['en', 'English (Tiếng Anh)', 'english'],
  ['zh', '中文 (Chinese / Mandarin)', 'chinese'],
  ['ja', '日本語 (Japanese)', 'japanese'],
  ['ko', '한국어 (Korean)', 'korean'],
  ['fr', 'Français (French)', 'french'],
  ['de', 'Deutsch (German)', 'german'],
  ['es', 'Español (Spanish)', 'spanish'],
  ['pt', 'Português (Portuguese)', 'portuguese'],
  ['ru', 'Русский (Russian)', 'russian'],
  ['th', 'ไทย (Thai)', 'thai'],
  ['id', 'Bahasa Indonesia (Indonesian)', 'indonesian'],
  ['ms', 'Bahasa Melayu (Malay)', 'malay'],
  ['hi', 'हिन्दी (Hindi)', 'hindi'],
  ['ar', 'العربية (Arabic)', 'arabic'],
  ['it', 'Italiano (Italian)', 'italian'],
  ['nl', 'Nederlands (Dutch)', 'dutch'],
  ['pl', 'Polski (Polish)', 'polish'],
  ['tr', 'Türkçe (Turkish)', 'turkish'],
  ['uk', 'Українська (Ukrainian)', 'ukrainian'],
  ['sv', 'Svenska (Swedish)', 'swedish'],
  ['no', 'Norsk (Norwegian)', 'norwegian'],
  ['da', 'Dansk (Danish)', 'danish'],
  ['fi', 'Suomi (Finnish)', 'finnish'],
  ['cs', 'Čeština (Czech)', 'czech'],
  ['el', 'Ελληνικά (Greek)', 'greek'],
  ['he', 'עברית (Hebrew)', 'hebrew'],
  ['hu', 'Magyar (Hungarian)', 'hungarian'],
  ['ro', 'Română (Romanian)', 'romanian'],
  ['sk', 'Slovenčina (Slovak)', 'slovak'],
  ['bg', 'Български (Bulgarian)', 'bulgarian'],
  ['hr', 'Hrvatski (Croatian)', 'croatian'],
  ['sr', 'Српски (Serbian)', 'serbian'],
  ['sl', 'Slovenščina (Slovenian)', 'slovenian'],
  ['lt', 'Lietuvių (Lithuanian)', 'lithuanian'],
  ['lv', 'Latviešu (Latvian)', 'latvian'],
  ['et', 'Eesti (Estonian)', 'estonian'],
  ['tl', 'Tagalog / Filipino', 'tagalog'],
  ['km', 'ភាសាខ្មែរ (Khmer)', 'khmer'],
  ['lo', 'ລາວ (Lao)', 'lao'],
  ['my', 'မြန်မာ (Myanmar / Burmese)', 'myanmar'],
  ['bn', 'বাংলা (Bengali)', 'bengali'],
  ['ta', 'தமிழ் (Tamil)', 'tamil'],
  ['te', 'తెలుగు (Telugu)', 'telugu'],
  ['mr', 'मराठी (Marathi)', 'marathi'],
  ['gu', 'ગુજરાતી (Gujarati)', 'gujarati'],
  ['kn', 'ಕನ್ನಡ (Kannada)', 'kannada'],
  ['ml', 'മലയാളം (Malayalam)', 'malayalam'],
  ['pa', 'ਪੰਜਾਬੀ (Punjabi)', 'punjabi'],
  ['ur', 'اردو (Urdu)', 'urdu'],
  ['fa', 'فارسی (Persian)', 'persian'],
  ['ne', 'नेपाली (Nepali)', 'nepali'],
  ['si', 'සිංහල (Sinhala)', 'sinhala'],
  ['sw', 'Kiswahili (Swahili)', 'swahili'],
  ['af', 'Afrikaans', 'afrikaans'],
  ['am', 'አማርኛ (Amharic)', 'amharic'],
  ['az', 'Azərbaycan (Azerbaijani)', 'azerbaijani'],
  ['be', 'Беларуская (Belarusian)', 'belarusian'],
  ['bs', 'Bosanski (Bosnian)', 'bosnian'],
  ['ca', 'Català (Catalan)', 'catalan'],
  ['cy', 'Cymraeg (Welsh)', 'welsh'],
  ['eu', 'Euskara (Basque)', 'basque'],
  ['gl', 'Galego (Galician)', 'galician'],
  ['ka', 'ქართული (Georgian)', 'georgian'],
  ['hy', 'Հայերեն (Armenian)', 'armenian'],
  ['is', 'Íslenska (Icelandic)', 'icelandic'],
  ['jw', 'Basa Jawa (Javanese)', 'javanese'],
  ['kk', 'Қазақша (Kazakh)', 'kazakh'],
  ['uz', "O'zbek (Uzbek)", 'uzbek'],
  ['tg', 'Тоҷикӣ (Tajik)', 'tajik'],
  ['tk', 'Türkmen (Turkmen)', 'turkmen'],
  ['mn', 'Монгол (Mongolian)', 'mongolian'],
  ['bo', 'བོད་ཡིག (Tibetan)', 'tibetan'],
  ['mk', 'Македонски (Macedonian)', 'macedonian'],
  ['sq', 'Shqip (Albanian)', 'albanian'],
  ['mt', 'Malti (Maltese)', 'maltese'],
  ['lb', 'Lëtzebuergesch (Luxembourgish)', 'luxembourgish'],
  ['ga', 'Gaeilge (Irish)', 'irish'],
  ['gd', 'Gàidhlig (Scottish Gaelic)', 'scottish gaelic'],
  ['br', 'Brezhoneg (Breton)', 'breton'],
  ['fo', 'Føroyskt (Faroese)', 'faroese'],
  ['oc', 'Occitan', 'occitan'],
  ['la', 'Latina (Latin)', 'latin'],
  ['sa', 'संस्कृतम् (Sanskrit)', 'sanskrit'],
  ['ps', 'پښتو (Pashto)', 'pashto'],
  ['sd', 'سنڌي (Sindhi)', 'sindhi'],
  ['as', 'অসমীয়া (Assamese)', 'assamese'],
  ['so', 'Soomaali (Somali)', 'somali'],
  ['ha', 'Hausa', 'hausa'],
  ['yo', 'Yorùbá', 'yoruba'],
  ['sn', 'chiShona (Shona)', 'shona'],
  ['mg', 'Malagasy', 'malagasy'],
  ['mi', 'Te Reo Māori (Maori)', 'maori'],
  ['haw', 'ʻŌlelo Hawaiʻi (Hawaiian)', 'hawaiian'],
  ['ht', 'Kreyòl Ayisyen (Haitian Creole)', 'haitian creole'],
  ['yi', 'ייִדיש (Yiddish)', 'yiddish'],
  ['ln', 'Lingála (Lingala)', 'lingala'],
  ['su', 'Basa Sunda (Sundanese)', 'sundanese'],
  ['ba', 'Башҡортса (Bashkir)', 'bashkir'],
  ['tt', 'Татарча (Tatar)', 'tatar'],
];

const EXTRA_WORLD_LANGS: Array<[string, string]> = [
  ['yue', '粵語 (Cantonese)'], ['wuu', '吳語 (Wu Chinese)'], ['nan', '閩南語 (Min Nan / Hokkien)'],
  ['hak', '客家話 (Hakka)'], ['zh-tw', '繁體中文 (Traditional Chinese)'], ['en-us', 'English (US)'],
  ['en-gb', 'English (UK)'], ['en-au', 'English (Australia)'], ['es-mx', 'Español (México)'],
  ['es-ar', 'Español (Argentina)'], ['pt-br', 'Português (Brasil)'], ['fr-ca', 'Français (Canada)'],
  ['de-at', 'Deutsch (Österreich)'], ['de-ch', 'Deutsch (Schweiz)'], ['ar-eg', 'العربية (Egypt)'],
  ['ar-sa', 'العربية (Saudi Arabia)'], ['ceb', 'Cebuano'], ['ilo', 'Ilokano'], ['hil', 'Hiligaynon'],
  ['war', 'Waray'], ['bik', 'Bikol'], ['pam', 'Kapampangan'], ['pag', 'Pangasinan'],
  ['ace', 'Acèh (Acehnese)'], ['ban', 'Basa Bali (Balinese)'], ['bjn', 'Banjar'], ['bug', 'Basa Ugi (Buginese)'],
  ['mad', 'Madhurâ (Madurese)'], ['min', 'Baso Minangkabau'], ['nia', 'Li Niha (Nias)'], ['sas', 'Base Sasak'],
  ['tet', 'Tetun (Tetum)'], ['tpi', 'Tok Pisin'], ['fj', 'Na Vosa Vakaviti (Fijian)'], ['sm', 'Gagana Samoa (Samoan)'],
  ['to', 'Lea Faka-Tonga (Tongan)'], ['ty', 'Reo Tahiti (Tahitian)'], ['ch', 'Chamoru (Chamorro)'],
  ['mh', 'Kajin M̧ajeļ (Marshallese)'], ['pau', 'a tekoi er a Belau (Palauan)'], ['na', 'Dorerin Naoero (Nauruan)'],
  ['tvl', 'Te Ggana Tuvalu (Tuvaluan)'], ['gil', 'Taetae ni Kiribati'], ['bi', 'Bislama'],
  ['hmn', 'Hmoob (Hmong)'], ['ium', 'Iu Mien'], ['mnw', 'ဘာသာမန် (Mon)'], ['shn', 'ၵႂၢမ်းတႆး (Shan)'],
  ['kar', 'Karen (Sgaw)'], ['kac', 'Jingpho (Kachin)'], ['lus', 'Mizo'], ['mni', 'Meitei (Manipuri)'],
  ['brx', 'Bodo'], ['sat', 'Santali'], ['mai', 'Maithili'], ['bho', 'Bhojpuri'], ['mag', 'Magahi'],
  ['awa', 'Awadhi'], ['hne', 'Chhattisgarhi'], ['raj', 'Rajasthani'], ['mar', 'Marwari'],
  ['bgc', 'Haryanvi'], ['ks', 'कॉशुर (Kashmiri)'], ['doi', 'डोगरी (Dogri)'], ['kok', 'कोंकणी (Konkani)'],
  ['tcy', 'ತುಳು (Tulu)'], ['dv', 'ދިވެހި (Dhivehi)'], ['dz', 'རྫོང་ཁ (Dzongkha)'], ['ug', 'ئۇيغۇرچە (Uyghur)'],
  ['ky', 'Кыргызча (Kyrgyz)'], ['crh', 'Qırımtatarca (Crimean Tatar)'], ['sah', 'Саха тыла (Sakha/Yakut)'],
  ['tyv', 'Тыва дыл (Tuvan)'], ['xal', 'Хальмг (Kalmyk)'], ['bua', 'Буряад (Buryat)'],
  ['cv', 'Чӑвашла (Chuvash)'], ['udm', 'Удмурт (Udmurt)'], ['kv', 'Коми (Komi)'], ['mhr', 'Марий (Mari)'],
  ['myv', 'Эрзянь (Erzya)'], ['mdf', 'Мокшень (Moksha)'], ['ce', 'Нохчийн (Chechen)'], ['av', 'Авар (Avar)'],
  ['lez', 'Лезги (Lezgian)'], ['os', 'Ирон (Ossetian)'], ['ab', 'Аҧсуа (Abkhaz)'], ['kbd', 'Къэбэрдей (Kabardian)'],
  ['ady', 'Адыгабзэ (Adyghe)'], ['ku', 'Kurdî (Kurmanji)'], ['ckb', 'کوردی (Sorani)'], ['zza', 'Zazaki'],
  ['bal', 'بلوچی (Balochi)'], ['prs', 'دری (Dari)'], ['ug-latn', 'Uyghur (Latin)'], ['arc', 'ܐܪܡܝܐ (Aramaic)'],
  ['syr', 'ܣܘܪܝܝܐ (Syriac)'], ['ti', 'ትግርኛ (Tigrinya)'], ['om', 'Afaan Oromoo (Oromo)'], ['aa', 'Qafar af (Afar)'],
  ['ss', 'siSwati (Swazi)'], ['st', 'Sesotho (Southern Sotho)'], ['tn', 'Setswana (Tswana)'], ['ts', 'Xitsonga'],
  ['ve', 'Tshivenda'], ['xh', 'isiXhosa'], ['zu', 'isiZulu'], ['nr', 'isiNdebele'], ['ny', 'Chichewa'],
  ['rw', 'Kinyarwanda'], ['rn', 'Kirundi'], ['lg', 'Luganda'], ['nyn', 'Runyankole'], ['ki', 'Gĩkũyũ (Kikuyu)'],
  ['kam', 'Kikamba'], ['luo', 'Dholuo'], ['mas', 'Maa (Maasai)'], ['bem', 'Chibemba'], ['loz', 'Silozi'],
  ['tum', 'Chitumbuka'], ['kg', 'Kikongo'], ['lua', 'Tshiluba'], ['wo', 'Wolof'], ['ff', 'Fulfulde (Fula)'],
  ['bm', 'Bamanankan (Bambara)'], ['dyu', 'Julakan (Dyula)'], ['ee', 'Eʋegbe (Ewe)'], ['tw', 'Twi'],
  ['ak', 'Akan'], ['ig', 'Asụsụ Igbo (Igbo)'], ['efi', 'Efik'], ['ibb', 'Ibibio'], ['fon', 'Fɔngbè (Fon)'],
  ['mos', 'Mooré'], ['sg', 'Sängö'], ['kmb', 'Kimbundu'], ['umb', 'Umbundu'], ['her', 'Otjiherero'],
  ['ng', 'Oshindonga'], ['kj', 'Oshikwanyama'], ['qu', 'Runasimi (Quechua)'], ['ay', 'Aymar aru (Aymara)'],
  ['gn', "Avañe'ẽ (Guarani)"], ['nah', 'Nāhuatl'], ['yua', 'Maaya t’aan (Yucatec Maya)'], ['pap', 'Papiamentu'],
  ['srn', 'Sranan Tongo'], ['jam', 'Patois (Jamaican)'], ['chr', 'ᏣᎳᎩ (Cherokee)'], ['nv', 'Diné bizaad (Navajo)'],
  ['iu', 'ᐃᓄᒃᑎᑐᑦ (Inuktitut)'], ['kl', 'Kalaallisut (Greenlandic)'], ['ik', 'Iñupiaq'], ['cr', 'ᓀᐦᐃᔭᐍᐏᐣ (Cree)'],
  ['oj', 'ᐊᓂᔑᓈᐯᒧᐎᓐ (Ojibwe)'], ['eo', 'Esperanto'], ['ia', 'Interlingua'], ['ie', 'Interlingue'],
  ['vo', 'Volapük'], ['io', 'Ido'], ['fy', 'Frysk (Western Frisian)'], ['li', 'Lèmburgs (Limburgish)'],
  ['nds', 'Plattdüütsch (Low German)'], ['gsw', 'Schwyzerdütsch (Swiss German)'], ['bar', 'Boarisch (Bavarian)'],
  ['ksh', 'Kölsch (Ripuarian)'], ['pdc', 'Pennsilfaanisch Deitsch'], ['sc', 'Sardu (Sardinian)'],
  ['co', 'Corsu (Corsican)'], ['scn', 'Sicilianu (Sicilian)'], ['nap', 'Nnapulitano (Neapolitan)'],
  ['vec', 'Vèneto (Venetian)'], ['lmo', 'Lombard'], ['pms', 'Piemontèis'], ['fur', 'Furlan (Friulian)'],
  ['rm', 'Rumantsch (Romansh)'], ['ast', 'Asturianu'], ['an', 'Aragonés'], ['ext', 'Estremeñu'],
  ['mwl', 'Mirandês'], ['gv', 'Gaelg (Manx)'], ['kw', 'Kernewek (Cornish)'], ['se', 'Davvisámegiella (Northern Sami)'],
  ['sma', 'Åarjelsaemien (Southern Sami)'], ['smj', 'Julevsámegiella'], ['smn', 'Anarâškielâ'],
  ['vep', 'Vepsän'], ['vro', 'Võro'], ['liv', 'Līvõ kēļ (Livonian)'], ['hsb', 'Hornjoserbšćina (Upper Sorbian)'],
  ['dsb', 'Dolnoserbšćina (Lower Sorbian)'], ['csb', 'Kaszëbsczi (Kashubian)'], ['szl', 'Ślōnski (Silesian)'],
  ['rue', 'Русиньскый (Rusyn)'], ['rup', 'Armãneashti (Aromanian)'], ['gag', 'Gagauz'], ['krc', 'Къарачай-Малкъар'],
  ['kum', 'Къумукъ (Kumyk)'], ['nog', 'Ногай (Nogai)'], ['kjh', 'Хакас (Khakas)'], ['alt', 'Алтай (Altai)'],
];

export const WHISPER_243_LANGUAGES: WhisperLanguageOption[] = [
  { code: 'auto', label: 'Tự động nhận diện (Auto Detect)' },
  ...CORE_WHISPER_LANGS.map(([code, label, whisperLang]) => ({ code, label, whisperLang })),
  ...EXTRA_WORLD_LANGS.map(([code, label]) => ({
    code,
    label,
    whisperLang: code.split('-')[0] === 'en' ? 'english' : code.split('-')[0] === 'zh' ? 'chinese' : code.split('-')[0] === 'es' ? 'spanish' : code.split('-')[0] === 'pt' ? 'portuguese' : code.split('-')[0] === 'fr' ? 'french' : code.split('-')[0] === 'de' ? 'german' : code.split('-')[0] === 'ar' ? 'arabic' : undefined,
  })),
].slice(0, 244); // Auto + 243 languages

export interface WhisperTranscribeOptions {
  language?: string;
  isMobile?: boolean;
  onProgress?: (pct: number, message: string) => void;
}

let cachedPipelinePromise: Promise<any> | null = null;
let cachedModelId: string | null = null;

export async function extractTimelineAudio16kHzMono(
  clips: TimelineClip[],
  onProgress?: (pct: number, message: string) => void
): Promise<{ audio: Float32Array; startTimeOffset: number; durationSec: number }> {
  const activeAudioClips = clips.filter(
    (c) =>
      !c.disabled &&
      !c.muted &&
      (c.volume ?? 100) > 0 &&
      Boolean(c.mediaUrl) &&
      (c.trackIndex === 0 || c.trackIndex === 1 || c.trackIndex === 3 || c.trackIndex >= 4) &&
      !c.subtitleText &&
      !c.stickerEmoji
  );

  if (activeAudioClips.length === 0) {
    throw new Error('Không tìm thấy clip có âm thanh trên Timeline.');
  }

  const minStart = Math.min(...activeAudioClips.map((c) => c.startTime));
  const maxEnd = Math.max(...activeAudioClips.map((c) => c.startTime + c.duration));
  const spanSec = Math.max(0.5, maxEnd - minStart);
  const sampleRate = 16000;
  const totalSamples = Math.max(sampleRate, Math.ceil(spanSec * sampleRate));

  const OfflineCtx =
    window.OfflineAudioContext ||
    (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext })
      .webkitOfflineAudioContext;

  if (!OfflineCtx) {
    throw new Error('Trình duyệt không hỗ trợ OfflineAudioContext.');
  }

  onProgress?.(10, 'Đang tách âm thanh 16kHz từ video...');

  const offlineCtx = new OfflineCtx(1, totalSamples, sampleRate);
  const decodedCache = new Map<string, AudioBuffer | null>();
  let scheduledCount = 0;

  for (let i = 0; i < activeAudioClips.length; i++) {
    const clip = activeAudioClips[i];
    if (!clip.mediaUrl) continue;

    let decoded = decodedCache.get(clip.mediaUrl);
    if (decoded === undefined) {
      try {
        const resp = await fetch(clip.mediaUrl);
        const ab = await resp.arrayBuffer();
        decoded = await offlineCtx.decodeAudioData(ab);
      } catch {
        decoded = null;
      }
      decodedCache.set(clip.mediaUrl, decoded);
    }

    if (!decoded) continue;

    const src = offlineCtx.createBufferSource();
    src.buffer = decoded;
    const spd = Math.max(0.25, Math.min(4.0, clip.speed || 1.0));
    src.playbackRate.value = spd;

    const gain = offlineCtx.createGain();
    gain.gain.value = Math.max(0, Math.min(2, (clip.volume ?? 100) / 100));
    src.connect(gain);
    gain.connect(offlineCtx.destination);

    const relStart = Math.max(0, clip.startTime - minStart);
    const sourceIn = Math.max(0, clip.sourceIn || 0);
    const playDur = Math.max(0.05, Math.min(clip.duration * spd, decoded.duration - sourceIn));

    try {
      src.start(relStart, sourceIn, playDur);
      scheduledCount++;
    } catch {
      // Ignore out-of-range sourceIn
    }
  }

  if (scheduledCount === 0) {
    throw new Error('Video không có luồng âm thanh hợp lệ để nhận diện.');
  }

  const rendered = await offlineCtx.startRendering();
  const channelData = rendered.getChannelData(0);

  let peak = 0;
  for (let i = 0; i < channelData.length; i += 64) {
    const v = Math.abs(channelData[i]);
    if (v > peak) peak = v;
  }
  if (peak < 0.0005) {
    throw new Error('Âm thanh quá nhỏ hoặc bị tắt tiếng, không thể nhận diện giọng nói.');
  }

  return {
    audio: channelData,
    startTimeOffset: minStart,
    durationSec: spanSec,
  };
}

async function createWhisperPipeline(
  modelId: string,
  forceWasm: boolean,
  onProgress?: (pct: number, message: string) => void
) {
  const { pipeline, env } = await import('@huggingface/transformers');
  env.allowLocalModels = false;

  const progressCallback = (info: any) => {
    if (info?.status === 'progress' && typeof info.progress === 'number') {
      const pct = Math.min(72, Math.max(25, Math.round(25 + info.progress * 0.45)));
      onProgress?.(pct, `Đang tải mô hình Whisper (${Math.round(info.progress)}%)...`);
    }
  };

  const hasWebGpu = !forceWasm && typeof navigator !== 'undefined' && 'gpu' in navigator;
  if (hasWebGpu) {
    try {
      return await pipeline('automatic-speech-recognition', modelId, {
        device: 'webgpu',
        dtype: 'q8',
        progress_callback: progressCallback,
      });
    } catch {
      // Fall back to WASM
    }
  }

  return await pipeline('automatic-speech-recognition', modelId, {
    device: 'wasm',
    dtype: 'q8',
    progress_callback: progressCallback,
  });
}

export async function transcribeAudioWithWhisper(
  audio16k: Float32Array,
  startTimeOffset: number,
  options: WhisperTranscribeOptions = {}
): Promise<TranscribedSubtitleSegment[]> {
  const { language = 'auto', isMobile = false, onProgress } = options;

  onProgress?.(22, 'Đang nạp thư viện Whisper AI...');
  const totalDur = audio16k.length / 16000;
  // Use whisper-tiny on mobile or longer videos (> 60s) for speed & stability
  const targetModelId =
    isMobile || totalDur > 60 ? 'onnx-community/whisper-tiny' : 'onnx-community/whisper-base';

  if (!cachedPipelinePromise || cachedModelId !== targetModelId) {
    cachedModelId = targetModelId;
    cachedPipelinePromise = createWhisperPipeline(targetModelId, false, onProgress).catch((err) => {
      cachedPipelinePromise = null;
      cachedModelId = null;
      throw err;
    });
  }

  let transcriber = await cachedPipelinePromise;
  const langEntry = WHISPER_243_LANGUAGES.find((l) => l.code === language);
  const whisperLang = langEntry?.whisperLang;

  // Process in 25-second chunks so progress smoothly advances from 75% -> 96% and never freezes at 78%
  const CHUNK_SEC = 25;
  const CHUNK_SAMPLES = CHUNK_SEC * 16000;
  const totalChunks = Math.max(1, Math.ceil(audio16k.length / CHUNK_SAMPLES));
  const segments: TranscribedSubtitleSegment[] = [];

  for (let cIdx = 0; cIdx < totalChunks; cIdx++) {
    const startSample = cIdx * CHUNK_SAMPLES;
    const endSample = Math.min(audio16k.length, startSample + CHUNK_SAMPLES);
    const slice = audio16k.subarray(startSample, endSample);
    const chunkOffsetSec = startSample / 16000;

    const pct = Math.min(96, 75 + Math.round((cIdx / totalChunks) * 21));
    onProgress?.(
      pct,
      `Đang nhận diện giọng nói (${cIdx + 1}/${totalChunks})...`
    );
    await new Promise((r) => setTimeout(r, 0));

    let result: any;
    try {
      result = await Promise.race([
        transcriber(slice, {
          return_timestamps: true,
          task: 'transcribe',
          ...(whisperLang ? { language: whisperLang } : {}),
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Chunk timeout')), 30000)
        ),
      ]);
    } catch {
      // If WebGPU stalled on a chunk, switch pipeline to WASM and retry once
      cachedPipelinePromise = createWhisperPipeline(targetModelId, true, onProgress);
      transcriber = await cachedPipelinePromise;
      result = await transcriber(slice, {
        return_timestamps: true,
        task: 'transcribe',
        ...(whisperLang ? { language: whisperLang } : {}),
      });
    }

    const rawChunks: Array<{ text?: string; timestamp?: [number | null, number | null] }> =
      Array.isArray(result?.chunks)
        ? result.chunks
        : result?.text
        ? [{ text: String(result.text), timestamp: [0, slice.length / 16000] }]
        : [];

    for (const ch of rawChunks) {
      const clean = (ch.text || '')
        .replace(/\[BLANK_AUDIO\]/gi, '')
        .replace(/\[Music\]/gi, '')
        .replace(/\(âm thanh trống\)/gi, '')
        .trim();
      if (!clean) continue;

      const tsStart = typeof ch.timestamp?.[0] === 'number' ? ch.timestamp[0] : 0;
      const tsEnd =
        typeof ch.timestamp?.[1] === 'number'
          ? ch.timestamp[1]
          : Math.min(slice.length / 16000, tsStart + Math.max(1.2, clean.split(/\s+/).length * 0.45));

      const dur = Math.max(0.6, tsEnd - tsStart);
      segments.push({
        text: clean,
        startTime: Number((startTimeOffset + chunkOffsetSec + tsStart).toFixed(2)),
        duration: Number(dur.toFixed(2)),
      });
    }
  }

  onProgress?.(98, 'Đang đồng bộ phụ đề lên Timeline...');
  return segments;
}

export async function translateSubtitleLine(
  text: string,
  targetLangCode: string = 'vi'
): Promise<string> {
  if (!text.trim()) return text;
  const tl = targetLangCode === 'auto' ? 'vi' : targetLangCode.split('-')[0];
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(
      tl
    )}&dt=t&q=${encodeURIComponent(text)}`;
    const resp = await fetch(url);
    if (!resp.ok) return text;
    const data = await resp.json();
    if (Array.isArray(data?.[0])) {
      const joined = data[0].map((part: any) => (Array.isArray(part) ? part[0] || '' : '')).join('').trim();
      if (joined) return joined;
    }
  } catch {
    // Offline or blocked fallback
  }
  return text;
}
