/**
 * Mercan AI Note & Memory System ("noot.js")
 * Manages Mercan's friendly conversation memories, notes, and creative prompt inspirations.
 */

export const MERCAN_PERSONA = {
  name: 'Mercan',
  title: 'Your Kind & Creative AI Companion',
  description: 'A warm, polite, and caring companion who loves to talk nicely with you and create wonderful photos and videos.',
  greeting: "Hello my dear friend! I'm Mercan. I'm so very happy to meet you today! How are you feeling? We can talk about anything, or I can create beautiful photos and videos for you whenever you'd like. What would you love to do?",
  voiceName: 'Kore',
  speechPitch: 1.05,
  speechRate: 0.95,
};

export const CONVERSATION_STARTERS = [
  "How are you doing today? Tell me what made you smile!",
  "Can you create a photo of a cozy treehouse cafe at sunset?",
  "Let's make a cinematic video together of a tranquil mountain journey.",
  "Tell me about something you're grateful for today.",
  "What is your favorite dream destination in the world?",
  "I'd love to hear your voice! Click the microphone and talk with me.",
];

export const PHOTO_STYLE_PRESETS = [
  { id: 'photographic', label: 'Photographic 8K', promptSuffix: ', crisp professional photography, 8k resolution, authentic lighting, award-winning' },
  { id: 'cinematic', label: 'Cinematic 35mm', promptSuffix: ', cinematic film still, 35mm anamorphic lens, warm golden hour illumination, shallow depth of field' },
  { id: 'portrait', label: 'Studio Portrait', promptSuffix: ', high-end editorial studio portrait, soft key lighting, expressive details, creamy bokeh' },
  { id: 'dreamy', label: 'Dreamy & Ethereal', promptSuffix: ', whimsical ethereal atmosphere, gentle pastel tones, magical soft glowing particles, fairy-tale mood' },
  { id: 'nature', label: 'Vibrant Landscape', promptSuffix: ', national geographic landscape style, breathtaking panoramic clarity, vivid natural colors' },
  { id: 'retro', label: 'Vintage Nostalgia', promptSuffix: ', retro film grain, nostalgic warm hues, vintage polaroid texture, gentle vignette' },
];

export const VIDEO_PRESETS = [
  {
    title: 'Serene Alpine Lake Sunrise',
    prompt: 'Gentle drone flyover across a glassy alpine mountain lake at sunrise with golden mist rising from the water',
    aspectRatio: '16:9',
    motion: 'Slow cinematic forward drone sweep',
  },
  {
    title: 'Cozy Rain on Coffee Shop Window',
    prompt: 'Slow motion raindrops trickling down a warm cafe window with blurred evening city lights glowing in the background',
    aspectRatio: '16:9',
    motion: 'Gentle focus rack and subtle pan',
  },
  {
    title: 'Enchanted Forest Fireflies',
    prompt: 'Gentle tracking shot through a mossy emerald forest as glowing golden fireflies drift gracefully between tall ancient trees',
    aspectRatio: '16:9',
    motion: 'Slow eye-level glide through forest',
  },
  {
    title: 'Futuristic Greenhouse Observatory',
    prompt: 'Cinematic pan across a sun-drenched botanical greenhouse studio with lush ferns, an easel, and rolling green hills beyond',
    aspectRatio: '16:9',
    motion: 'Cinematic horizontal sweep and tilt up',
  },
];

export const INITIAL_GALLERY = [
  {
    id: 'sample-avatar',
    type: 'photo',
    title: 'Mercan - Warm Companion Portrait',
    prompt: 'Warm, kind, and friendly digital portrait of Mercan, a radiant and gentle AI companion with expressive empathetic amber eyes',
    url: '/src/assets/images/mercan_avatar_portrait_1791617395646.jpg',
    createdAt: new Date().toISOString(),
    aspectRatio: '1:1',
    author: 'Mercan',
  },
  {
    id: 'sample-lake',
    type: 'photo',
    title: 'Alpine Sanctuary at Golden Hour',
    prompt: 'Breathtaking landscape photo of a serene alpine lake nestled between misty mountain peaks at golden hour sunset',
    url: '/src/assets/images/mercan_photo_showcase_1791617408249.jpg',
    createdAt: new Date().toISOString(),
    aspectRatio: '4:3',
    author: 'Mercan & You',
  },
  {
    id: 'sample-video',
    type: 'video',
    title: 'Hills from the Artist Studio',
    prompt: 'Cinematic wide angle film still of a cozy sunlit artist greenhouse studio overlooking rolling green hills',
    url: '/src/assets/images/mercan_video_frame_1791617420442.jpg',
    createdAt: new Date().toISOString(),
    aspectRatio: '16:9',
    author: 'Mercan & You',
  },
];

/**
 * Local storage memory helper
 */
export function saveMercanNote(key, value) {
  try {
    localStorage.setItem(`mercan_${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn('LocalStorage save failed', e);
  }
}

export function getMercanNote(key, defaultValue) {
  try {
    const item = localStorage.getItem(`mercan_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}
