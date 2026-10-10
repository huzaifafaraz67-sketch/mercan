import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Play,
  Pause,
  RotateCcw,
  Download,
  Mic,
  MicOff,
  Sparkles,
  Layers,
  Sliders,
  Volume2,
  VolumeX,
  Maximize,
  Film,
  Camera,
  RefreshCw,
} from 'lucide-react';
import { VIDEO_PRESETS } from '../noot.js';

interface VideoStudioProps {
  onGenerateVideo: (prompt: string, options: any) => Promise<any>;
  isGenerating: boolean;
  isListening: boolean;
  toggleListening: () => void;
  interimTranscript: string;
  initialPrompt?: string;
  initialImage?: string | null;
  recentVideos: Array<{
    id: string;
    url: string;
    prompt: string;
    aspectRatio: string;
    createdAt: string;
  }>;
}

export const VideoStudio: React.FC<VideoStudioProps> = ({
  onGenerateVideo,
  isGenerating,
  isListening,
  toggleListening,
  interimTranscript,
  initialPrompt = '',
  initialImage = null,
  recentVideos,
}) => {
  const [prompt, setPrompt] = useState(
    initialPrompt || 'Cinematic wide angle film still of a cozy sunlit artist greenhouse studio overlooking rolling green hills'
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(
    initialImage || '/src/assets/images/mercan_video_frame_1791617420442.jpg'
  );
  const [motionStyle, setMotionStyle] = useState('drone');
  const [aspectRatio, setAspectRatio] = useState('16:9');

  // Video Player state
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0); // 0 to 1
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isRecordingExport, setIsRecordingExport] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Sync initial prompt or image if passed
  useEffect(() => {
    if (initialPrompt) setPrompt(initialPrompt);
  }, [initialPrompt]);

  useEffect(() => {
    if (initialImage) setSelectedImage(initialImage);
  }, [initialImage]);

  // Sync speech transcript
  useEffect(() => {
    if (isListening && interimTranscript) {
      setPrompt(interimTranscript);
    }
  }, [isListening, interimTranscript]);

  // Sound atmosphere (peaceful gentle binaural synth pad for the video)
  const toggleSound = () => {
    if (soundEnabled) {
      if (gainRef.current && audioCtxRef.current) {
        gainRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.1);
      }
      setSoundEnabled(false);
    } else {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioCtx();
        }
        if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }

        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, audioCtxRef.current.currentTime); // gentle warm A3 tone

        gain.gain.setValueAtTime(0.01, audioCtxRef.current.currentTime);
        gain.gain.setTargetAtTime(0.08, audioCtxRef.current.currentTime, 0.5);

        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();

        oscRef.current = osc;
        gainRef.current = gain;
        setSoundEnabled(true);
      } catch (e) {
        console.warn('Audio context init error', e);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (oscRef.current) {
        try {
          oscRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // Canvas animation engine simulating cinematic camera moves, particle dust, light flares
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = selectedImage || '/src/assets/images/mercan_video_frame_1791617420442.jpg';

    let startTime = Date.now();
    const duration = 12000; // 12 second loop

    // Particle dust
    const particles = Array.from({ length: 45 }).map(() => ({
      x: Math.random() * 800,
      y: Math.random() * 450,
      size: Math.random() * 2 + 0.8,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: -Math.random() * 0.4 - 0.1,
      opacity: Math.random() * 0.7 + 0.2,
    }));

    const render = () => {
      const now = Date.now();
      let elapsed = (now - startTime) % duration;
      const currentProg = elapsed / duration;
      setProgress(currentProg);

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      if (img.complete && img.naturalWidth > 0) {
        // Camera motion math based on selected motionStyle
        let scale = 1.0;
        let offsetX = 0;
        let offsetY = 0;

        if (motionStyle === 'drone') {
          // Slow cinematic zoom in & subtle upward crane
          scale = 1.05 + currentProg * 0.12;
          offsetY = -currentProg * 18;
        } else if (motionStyle === 'pan') {
          // Horizontal majestic pan
          scale = 1.1;
          offsetX = (currentProg - 0.5) * 40;
        } else if (motionStyle === 'orbit') {
          // Gentle floating orbit
          scale = 1.08 + Math.sin(currentProg * Math.PI) * 0.05;
          offsetX = Math.sin(currentProg * Math.PI * 2) * 15;
          offsetY = Math.cos(currentProg * Math.PI * 2) * 10;
        } else {
          // Static soft breath
          scale = 1.02 + Math.sin(currentProg * Math.PI) * 0.02;
        }

        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.scale(scale, scale);
        ctx.drawImage(img, -w / 2 + offsetX, -h / 2 + offsetY, w, h);
        ctx.restore();
      } else {
        // Fallback dark gradient
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#1c1917');
        grad.addColorStop(1, '#0c0a09');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      // Draw floating golden ambient light dust
      ctx.fillStyle = 'rgba(251, 191, 36, 0.8)';
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.y < 0) p.y = h;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.globalAlpha = p.opacity * (0.6 + Math.sin(now * 0.002 + p.x) * 0.3);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // Cinematic Vignette
      const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, h * 0.85);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.65)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      // Subtitle / Prompt Overlay
      if (prompt) {
        ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = 'rgba(245, 245, 244, 0.9)';
        ctx.textAlign = 'center';
        const displayPrompt = prompt.length > 70 ? prompt.slice(0, 70) + '...' : prompt;
        ctx.fillText(`“${displayPrompt}”`, w / 2, h - 22);
      }

      if (isPlaying) {
        animId = requestAnimationFrame(render);
      }
    };

    if (isPlaying) {
      animId = requestAnimationFrame(render);
    } else {
      render();
    }

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [selectedImage, motionStyle, isPlaying, prompt]);

  // Export video via MediaRecorder
  const handleExportVideo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setIsRecordingExport(true);
      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mercan-cinematic-video-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsRecordingExport(false);
      };

      recorder.start();
      // Record 4 seconds of smooth motion
      setTimeout(() => {
        recorder.stop();
      }, 4000);
    } catch (err) {
      console.warn('MediaRecorder export failed, downloading current frame instead', err);
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `mercan-video-frame-${Date.now()}.png`;
      a.click();
      setIsRecordingExport(false);
    }
  };

  const handleStartGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    try {
      await onGenerateVideo(prompt.trim(), {
        aspectRatio,
        motion: motionStyle,
        image: selectedImage,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Video className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold tracking-tight text-stone-100">
              Mercan Video Studio
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-400">
            Make cinematic moving videos with Mercan. Use your voice, pick an aesthetic motion, and export your animated story.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400 font-mono">
            {recentVideos.length} created
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Video Controls */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleStartGeneration} className="space-y-5">
            {/* Prompt with Mic */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
                  Video Story & Prompt
                </label>
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md transition-colors ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-stone-800 text-stone-300 hover:text-amber-300 hover:bg-stone-700'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" />
                      <span>Recording...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-amber-400" />
                      <span>Speak Prompt</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="Describe your video story (e.g. Cinematic drone flyover of an emerald forest at sunrise)..."
                className="w-full bg-stone-900 border border-stone-800 focus:border-amber-500/60 rounded-xl p-3.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-stone-500 uppercase tracking-wider font-semibold">
                Mercan Scenarios:
              </span>
              <div className="flex flex-col gap-1.5">
                {VIDEO_PRESETS.map((vp, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setPrompt(vp.prompt);
                      setAspectRatio(vp.aspectRatio);
                    }}
                    className="text-left p-2 rounded-lg bg-stone-900/60 hover:bg-stone-800/80 border border-stone-800/80 hover:border-stone-700 transition-colors"
                  >
                    <div className="text-xs font-semibold text-stone-200">
                      {vp.title}
                    </div>
                    <div className="text-[11px] text-stone-400 truncate">
                      {vp.prompt}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Camera Motion Style */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-amber-400" />
                <span>Camera Motion Direction</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'drone', label: 'Drone Crane & Push' },
                  { id: 'pan', label: 'Horizontal Pan' },
                  { id: 'orbit', label: 'Floating Orbit' },
                  { id: 'static', label: 'Subtle Cinematic Still' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMotionStyle(m.id)}
                    className={`text-left p-2.5 rounded-lg border text-xs font-medium transition-all ${
                      motionStyle === m.id
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                        : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Starting Image selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>Starting Scene Frame</span>
                </label>
                {selectedImage && (
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="text-[11px] text-stone-400 hover:text-stone-200 underline"
                  >
                    Clear Image
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {[
                  {
                    name: 'Artist Studio',
                    url: '/src/assets/images/mercan_video_frame_1791617420442.jpg',
                  },
                  {
                    name: 'Alpine Lake',
                    url: '/src/assets/images/mercan_photo_showcase_1791617408249.jpg',
                  },
                  {
                    name: 'Mercan Portrait',
                    url: '/src/assets/images/mercan_avatar_portrait_1791617395646.jpg',
                  },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(item.url)}
                    className={`relative flex-1 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === item.url
                        ? 'border-amber-400 scale-[1.02]'
                        : 'border-stone-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-stone-950/80 text-[10px] text-stone-300 text-center py-0.5">
                      {item.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={!prompt.trim() || isGenerating}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 disabled:text-stone-600 text-stone-950 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-500/10"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                  <span>Mercan is rendering your video...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Video with Mercan</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Cinematic Canvas & Player */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-stone-800 bg-stone-950 shadow-2xl">
            {/* Viewport Canvas */}
            <canvas
              ref={canvasRef}
              width={800}
              height={450}
              className="w-full aspect-video object-cover"
            />

            {/* Live Recording Export Overlay */}
            {isRecordingExport && (
              <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-amber-400 z-30">
                <RefreshCw className="w-8 h-8 animate-spin" />
                <span className="text-sm font-semibold">
                  Encoding & Exporting Video Clip...
                </span>
              </div>
            )}

            {/* Video Controls Bar */}
            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-stone-950 via-stone-950/80 to-transparent flex flex-col gap-2 z-20">
              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-stone-800/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-100"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 rounded-lg bg-stone-900/80 hover:bg-stone-800 text-stone-200 hover:text-white transition-colors"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={toggleSound}
                    className={`p-2 rounded-lg transition-colors ${
                      soundEnabled
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-stone-900/80 text-stone-400 hover:text-stone-200'
                    }`}
                    title={soundEnabled ? 'Mute ambient sound' : 'Enable ambient sound'}
                  >
                    {soundEnabled ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <VolumeX className="w-4 h-4" />
                    )}
                  </button>

                  <span className="text-xs font-mono text-stone-400 tabular-nums ml-2">
                    {Math.floor(progress * 12)}s / 12s
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportVideo}
                    disabled={isRecordingExport}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs transition-colors shadow-sm"
                    title="Export & Download Video (.webm)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Video</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Video Metadata Panel */}
          <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-stone-200">Resolution:</span>
              <span className="font-mono">1080p HD</span>
              <span>·</span>
              <span className="font-semibold text-stone-200">Motion:</span>
              <span>{motionStyle.toUpperCase()}</span>
              <span>·</span>
              <span className="font-semibold text-stone-200">Ratio:</span>
              <span>{aspectRatio}</span>
            </div>
            <div className="text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cinematic Canvas Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
