import React, { useState } from 'react';
import {
  Camera,
  Sparkles,
  Mic,
  MicOff,
  Download,
  Copy,
  Check,
  Video,
  RefreshCw,
  Sliders,
  Maximize2,
  ZoomIn,
} from 'lucide-react';
import { PHOTO_STYLE_PRESETS } from '../noot.js';

interface PhotoStudioProps {
  onGeneratePhoto: (prompt: string, aspectRatio: string, style: string) => Promise<any>;
  isGenerating: boolean;
  isListening: boolean;
  toggleListening: () => void;
  interimTranscript: string;
  initialPrompt?: string;
  onSendToVideoStudio: (imageUrl: string, prompt: string) => void;
  recentPhotos: Array<{
    id: string;
    url: string;
    prompt: string;
    aspectRatio: string;
    createdAt: string;
  }>;
}

export const PhotoStudio: React.FC<PhotoStudioProps> = ({
  onGeneratePhoto,
  isGenerating,
  isListening,
  toggleListening,
  interimTranscript,
  initialPrompt = '',
  onSendToVideoStudio,
  recentPhotos,
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [selectedStyle, setSelectedStyle] = useState('photographic');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activePhoto, setActivePhoto] = useState<string | null>(
    recentPhotos.length > 0 ? recentPhotos[0].url : '/src/assets/images/mercan_photo_showcase_1791617408249.jpg'
  );
  const [activePrompt, setActivePrompt] = useState<string>(
    recentPhotos.length > 0 ? recentPhotos[0].prompt : 'Alpine Sanctuary at Golden Hour'
  );

  // Sync initialPrompt when passed from chat
  React.useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  // Sync mic transcript to prompt if listening
  React.useEffect(() => {
    if (isListening && interimTranscript) {
      setPrompt(interimTranscript);
    }
  }, [isListening, interimTranscript]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    try {
      const res = await onGeneratePhoto(prompt.trim(), aspectRatio, selectedStyle);
      if (res && res.imageUrl) {
        setActivePhoto(res.imageUrl);
        setActivePrompt(res.prompt || prompt);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (imgUrl: string, name = 'mercan-photo') => {
    const a = document.createElement('a');
    a.href = imgUrl;
    a.download = `${name}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const sampleIdeas = [
    'A tranquil mountain cabin nestled among pine trees with smoke rising from chimney at twilight',
    'A soft and curious red fox resting in fresh snow with glistening golden sunlight',
    'An ethereal greenhouse conservatory filled with rare glowing flora and stained glass windows',
    'A cozy cup of latte with intricate leaf foam art on a rustic wooden table by the rain',
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Studio Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Camera className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold tracking-tight text-stone-100">
              Mercan Photo Studio
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-400">
            Describe what you envision or speak into the microphone. Mercan will craft a high-fidelity image for you.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400 font-mono">
            {recentPhotos.length} created
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Creator Controls */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleGenerate} className="space-y-5">
            {/* Prompt Input with Microphone Button */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
                  Photo Vision & Prompt
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

              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  placeholder="Describe the photo you want Mercan to make (e.g. A serene mountain lake at sunset with blooming wildflowers)..."
                  className="w-full bg-stone-900 border border-stone-800 focus:border-amber-500/60 rounded-xl p-3.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Ideas prompt chips */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] text-stone-500 uppercase tracking-wider font-semibold">
                  Mercan Ideas:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {sampleIdeas.map((idea, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPrompt(idea)}
                      className="text-[11px] text-stone-400 hover:text-amber-300 bg-stone-900/90 border border-stone-800 hover:border-stone-700 rounded-md px-2.5 py-1 transition-colors text-left"
                    >
                      {idea.slice(0, 42)}...
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Style Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Aesthetic Style</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PHOTO_STYLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedStyle(preset.id)}
                    className={`text-left p-2.5 rounded-lg border text-xs font-medium transition-all ${
                      selectedStyle === preset.id
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                        : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
                Aspect Ratio
              </label>
              <div className="flex items-center gap-2">
                {[
                  { id: '1:1', label: '1:1 Square' },
                  { id: '4:3', label: '4:3 Classic' },
                  { id: '16:9', label: '16:9 Landscape' },
                  { id: '9:16', label: '9:16 Story' },
                  { id: '3:4', label: '3:4 Portrait' },
                ].map((ratio) => (
                  <button
                    key={ratio.id}
                    type="button"
                    onClick={() => setAspectRatio(ratio.id)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg border text-center transition-all ${
                      aspectRatio === ratio.id
                        ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                        : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                    }`}
                  >
                    {ratio.id}
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
                  <span>Mercan is painting your photo...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Photo with Mercan</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Main Viewfinder & Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-stone-800 bg-stone-950 flex items-center justify-center group shadow-xl">
            {/* Viewfinder corners */}
            <div className="viewfinder-corner top-3 left-3 border-t-2 border-l-2" />
            <div className="viewfinder-corner top-3 right-3 border-t-2 border-r-2" />
            <div className="viewfinder-corner bottom-3 left-3 border-b-2 border-l-2" />
            <div className="viewfinder-corner bottom-3 right-3 border-b-2 border-r-2" />

            {activePhoto ? (
              <img
                src={activePhoto}
                alt="Mercan Created Photo"
                className="w-full max-h-[520px] object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="h-80 flex flex-col items-center justify-center text-stone-500 gap-3">
                <Camera className="w-12 h-12 stroke-[1.2]" />
                <p className="text-sm">No photo generated yet. Tell Mercan what to create!</p>
              </div>
            )}

            {/* Floating Quick Action Overlay */}
            {activePhoto && (
              <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-stone-950/80 backdrop-blur-md border border-stone-700/60 p-1.5 rounded-xl shadow-lg">
                <button
                  onClick={() => handleDownload(activePhoto)}
                  className="p-2 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
                  title="Download photo"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleCopy('active', activePrompt)}
                  className="p-2 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
                  title="Copy prompt"
                >
                  {copiedId === 'active' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => onSendToVideoStudio(activePhoto, activePrompt)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs transition-colors"
                  title="Animate into Video"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Animate into Video</span>
                </button>
              </div>
            )}
          </div>

          {/* Active Photo Caption & Prompt Info */}
          {activePhoto && (
            <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800/80 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                  Active Scene
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {activePrompt}
                </p>
              </div>
            </div>
          )}

          {/* Recent Creations Film Strip */}
          {recentPhotos.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                Recent Photo Creations
              </div>
              <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                {recentPhotos.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActivePhoto(item.url);
                      setActivePrompt(item.prompt);
                    }}
                    className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      activePhoto === item.url
                        ? 'border-amber-400 ring-2 ring-amber-400/20 scale-105'
                        : 'border-stone-800 hover:border-stone-700 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={item.url}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
