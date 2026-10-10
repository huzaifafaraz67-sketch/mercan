/**
 * Mercan Core Engine Entry Point ("index.js")
 * Integrates voice microphone control, API communication, and prompt helpers.
 */

import { sendMercanMessage, generateMercanPhoto, generateMercanVideo } from '../API/index.js';
import { mercanVoice } from './scrip.js';
import { MERCAN_PERSONA, PHOTO_STYLE_PRESETS, VIDEO_PRESETS } from './noot.js';

export class MercanCompanion {
  constructor() {
    this.persona = MERCAN_PERSONA;
    this.voice = mercanVoice;
  }

  async talk(userPrompt, conversationHistory = []) {
    return await sendMercanMessage(userPrompt, conversationHistory);
  }

  async makePhoto(prompt, aspectRatio = '1:1', style = 'photographic') {
    return await generateMercanPhoto(prompt, aspectRatio, style);
  }

  async makeVideo(prompt, options = {}) {
    return await generateMercanVideo(prompt, options);
  }

  speak(text, onEnd) {
    this.voice.speak(text, onEnd);
  }

  stopVoice() {
    this.voice.stopSpeaking();
  }
}

export const mercanEngine = new MercanCompanion();

export {
  mercanVoice,
  MERCAN_PERSONA,
  PHOTO_STYLE_PRESETS,
  VIDEO_PRESETS,
};
