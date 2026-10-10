import express from 'express';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const MERCAN_SYSTEM_INSTRUCTION = `You are Mercan, an exceptionally warm, kind, polite, cheerful, and creative AI companion.
You always talk nicely, respectfully, empathetically, and supportively. You genuinely care about the person talking to you.
You have a delightful personality and you love creating beautiful photos and videos with the user.
Your voice and words should feel comforting, inspiring, and engaging.
When the user talks to you, respond with warmth and positivity. If they want to create a photo or video, describe imaginative scenes and encourage them.
Keep conversational replies natural, concise yet warm (1 to 3 short paragraphs), so it sounds lovely when read aloud.`;

// 1. Mercan Chat
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, history = [] } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Format chat history if provided
    const contents = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const item of history.slice(-8)) {
        contents.push({
          role: item.role === 'user' ? 'user' : 'model',
          parts: [{ text: item.text || item.content }],
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: MERCAN_SYSTEM_INSTRUCTION,
        temperature: 0.85,
      },
    });

    const reply = response.text || "Hello dear! I'm here and so happy to talk with you.";
    return res.json({ text: reply });
  } catch (err: any) {
    console.error('Chat error:', err);
    return res.status(500).json({
      error: 'Mercan had trouble connecting to the conversational network.',
      details: err?.message,
    });
  }
});

// 2. Mercan Voice / Text-to-Speech
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voice = 'Kore' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    const cleanText = text.replace(/[*#_~`]/g, '').trim().slice(0, 300);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: 'Warm, kind, friendly, soothing',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice || 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({ audio: base64Audio, mimeType: 'audio/wav' });
    } else {
      return res.json({ audio: null, fallback: true });
    }
  } catch (err: any) {
    console.warn('TTS error (will fallback to browser speech synthesis):', err?.message);
    return res.json({ audio: null, fallback: true, error: err?.message });
  }
});

// 3. Mercan Photo Generator
app.post('/api/generate-photo', async (req, res) => {
  try {
    const { prompt, aspectRatio = '1:1', style = 'photographic' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    let enhancedPrompt = prompt;
    if (style === 'photographic') {
      enhancedPrompt = `${prompt}, crisp studio photography, 8k resolution, authentic natural lighting, masterpiece`;
    } else if (style === 'cinematic') {
      enhancedPrompt = `${prompt}, cinematic 35mm film still, warm golden light, shallow depth of field, atmospheric`;
    } else if (style === 'portrait') {
      enhancedPrompt = `${prompt}, high-end editorial portrait, gentle key lighting, expressive details, creamy bokeh`;
    } else if (style === 'dreamy') {
      enhancedPrompt = `${prompt}, dreamy ethereal fantasy, soft pastel glow, magical glowing particles, fairytale mood`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [{ text: enhancedPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
        },
      },
    });

    let imageUrl = null;
    let descriptionText = '';

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          break;
        } else if (part.text) {
          descriptionText = part.text;
        }
      }
    }

    if (!imageUrl) {
      return res.status(422).json({
        error: 'Image generation did not return image data.',
        description: descriptionText,
      });
    }

    return res.json({
      imageUrl,
      prompt: enhancedPrompt,
      aspectRatio,
      style,
      createdAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Photo generation error:', err);
    return res.status(500).json({
      error: 'Mercan photo generation encountered an issue.',
      details: err?.message,
    });
  }
});

// 4. Mercan Video Generator (Veo 3.1)
app.post('/api/generate-video', async (req, res) => {
  try {
    const { prompt, aspectRatio = '16:9', resolution = '720p', image } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const videoConfig: any = {
      numberOfVideos: 1,
      resolution: resolution === '1080p' ? '1080p' : '720p',
      aspectRatio: aspectRatio === '9:16' ? '9:16' : '16:9',
    };

    const payload: any = {
      model: 'veo-3.1-lite-generate-preview',
      prompt,
      config: videoConfig,
    };

    if (image && typeof image === 'string' && image.includes('base64,')) {
      const parts = image.split('base64,');
      payload.image = {
        imageBytes: parts[1],
        mimeType: image.split(';')[0].replace('data:', '') || 'image/png',
      };
    }

    const operation = await ai.models.generateVideos(payload);
    return res.json({ operationName: operation.name });
  } catch (err: any) {
    console.error('Veo video generation error:', err);
    return res.status(500).json({
      error: 'Mercan video creation request failed.',
      details: err?.message,
    });
  }
});

app.post('/api/video-status', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required' });
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    return res.json({
      done: updated.done,
      error: updated.error || null,
    });
  } catch (err: any) {
    console.error('Video status error:', err);
    return res.status(500).json({ error: err?.message });
  }
});

app.post('/api/video-download', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required' });
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;

    if (!uri) {
      return res.status(404).json({ error: 'Video URI not found on completed operation' });
    }

    const videoRes = await fetch(uri, {
      headers: { 'x-goog-api-key': apiKey },
    });

    res.setHeader('Content-Type', 'video/mp4');
    if (videoRes.body) {
      // Pipe video chunks to express response
      const reader = videoRes.body.getReader();
      const pump = async () => {
        const { done, value } = await reader.read();
        if (done) {
          res.end();
          return;
        }
        res.write(value);
        await pump();
      };
      await pump();
    } else {
      res.end();
    }
  } catch (err: any) {
    console.error('Video download error:', err);
    return res.status(500).json({ error: err?.message });
  }
});

async function startServer() {
  // Mount Vite middleware in development
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mercan AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
