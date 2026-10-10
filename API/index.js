/**
 * Mercan AI API Service Layer
 * Bridges frontend requests to backend Gemini endpoints for chat, voice, photo, and video generation.
 */

export const MERCAN_API_CONFIG = {
  endpoints: {
    chat: '/api/chat',
    tts: '/api/tts',
    generatePhoto: '/api/generate-photo',
    generateVideo: '/api/generate-video',
    videoStatus: '/api/video-status',
    videoDownload: '/api/video-download',
  },
  defaultPersonality: 'nice, warm, polite, encouraging, empathetic, and joyful',
};

/**
 * Send message to Mercan AI
 */
export async function sendMercanMessage(prompt, conversationHistory = []) {
  try {
    const res = await fetch(MERCAN_API_CONFIG.endpoints.chat, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        history: conversationHistory,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with status ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error('API Error in sendMercanMessage:', error);
    throw error;
  }
}

/**
 * Request speech audio from Mercan
 */
export async function requestMercanSpeech(text, voice = 'Kore') {
  try {
    const res = await fetch(MERCAN_API_CONFIG.endpoints.tts, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice }),
    });

    if (!res.ok) {
      throw new Error(`TTS failed with status ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.warn('TTS request error, client fallback available:', error);
    return { audio: null, fallback: true };
  }
}

/**
 * Generate photo with Mercan
 */
export async function generateMercanPhoto(prompt, aspectRatio = '1:1', style = 'photographic') {
  try {
    const res = await fetch(MERCAN_API_CONFIG.endpoints.generatePhoto, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, aspectRatio, style }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Photo generation failed: status ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error('API Error in generateMercanPhoto:', error);
    throw error;
  }
}

/**
 * Generate video with Mercan
 */
export async function generateMercanVideo(prompt, options = {}) {
  try {
    const res = await fetch(MERCAN_API_CONFIG.endpoints.generateVideo, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        aspectRatio: options.aspectRatio || '16:9',
        resolution: options.resolution || '720p',
        image: options.image || null,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Video initiation failed: status ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error('API Error in generateMercanVideo:', error);
    throw error;
  }
}

/**
 * Poll video status
 */
export async function pollMercanVideoStatus(operationName) {
  const res = await fetch(MERCAN_API_CONFIG.endpoints.videoStatus, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operationName }),
  });
  if (!res.ok) throw new Error('Video status poll failed');
  return await res.json();
}
