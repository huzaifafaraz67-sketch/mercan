/**
 * Mercan Voice & Microphone Controller Script ("scrip.js")
 * Manages live speech recognition, mic audio analysis, and voice synthesis.
 */

class VoiceController {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.audioContext = null;
    this.analyser = null;
    this.mediaStream = null;
    this.animationFrame = null;
    this.listeners = {
      result: [],
      error: [],
      status: [],
      volume: [],
    };

    this.initSpeechRecognition();
  }

  initSpeechRecognition() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('SpeechRecognition is not natively supported in this browser.');
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.emitStatus('listening');
      };

      this.recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        this.listeners.result.forEach((cb) =>
          cb({ finalTranscript, interimTranscript })
        );
      };

      this.recognition.onerror = (event) => {
        console.warn('Speech recognition event error:', event.error);
        this.listeners.error.forEach((cb) => cb(event.error));
        if (event.error === 'not-allowed') {
          this.stop();
        }
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          // If meant to keep listening, restart smoothly
          try {
            this.recognition.start();
          } catch (e) {
            this.isListening = false;
            this.emitStatus('idle');
          }
        } else {
          this.emitStatus('idle');
        }
      };
    } catch (e) {
      console.warn('SpeechRecognition initialization error:', e);
    }
  }

  async startListening() {
    if (this.isListening) return;

    try {
      // Connect to microphone stream for visualizer
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          this.mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
            },
          });

          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass) {
            this.audioContext = new AudioContextClass();
            const source = this.audioContext.createMediaStreamSource(this.mediaStream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 64;
            source.connect(this.analyser);
            this.startVolumePolling();
          }
        } catch (mediaErr) {
          console.warn('Microphone audio stream error (speech recognition might still work):', mediaErr);
        }
      }

      if (this.recognition) {
        this.isListening = true;
        this.recognition.start();
      } else {
        this.emitStatus('unsupported');
      }
    } catch (err) {
      console.error('Error starting voice recognition:', err);
      this.isListening = false;
      this.emitStatus('idle');
    }
  }

  stopListening() {
    this.isListening = false;

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (e) {
        // ignore
      }
      this.audioContext = null;
    }

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    this.emitStatus('idle');
  }

  startVolumePolling() {
    if (!this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const checkVolume = () => {
      if (!this.isListening || !this.analyser) return;

      this.analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      const normalized = Math.min(1, average / 128); // 0 to 1

      this.listeners.volume.forEach((cb) => cb(normalized));
      this.animationFrame = requestAnimationFrame(checkVolume);
    };

    checkVolume();
  }

  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
    return () => {
      if (this.listeners[event]) {
        this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
      }
    };
  }

  emitStatus(status) {
    this.listeners.status.forEach((cb) => cb(status));
  }

  /**
   * Speak nicely with text-to-speech
   */
  speak(text, onEnd) {
    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    window.speechSynthesis.cancel();

    // Clean text of markdown asterisks or special characters for voice
    const cleanText = text.replace(/[*#_~`]/g, '').trim();
    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.08; // slightly warmer, pleasant pitch

    // Choose the best natural female/warm voice available in browser
    const voices = window.speechSynthesis.getVoices();
    const friendlyVoice =
      voices.find((v) => v.lang.includes('en') && (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Google UK English Female') || v.name.includes('Google US English') || v.name.includes('Zira') || v.name.includes('Victoria'))) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0];

    if (friendlyVoice) {
      utterance.voice = friendlyVoice;
    }

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const mercanVoice = new VoiceController();
