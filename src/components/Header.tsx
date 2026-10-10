import React from 'react';
import { Sparkles, Mic, Volume2, VolumeX } from 'lucide-react';

interface HeaderProps {
  activeTab: 'chat' | 'photo' | 'video' | 'gallery';
  setActiveTab: (tab: 'chat' | 'photo' | 'video' | 'gallery') => void;
  voiceAutoPlay: boolean;
  setVoiceAutoPlay: (val: boolean) => void;
  onQuickMic: () => void;
  isListening: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  voiceAutoPlay,
  setVoiceAutoPlay,
  onQuickMic,
  isListening,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-stone-950/80 backdrop-blur-md border-b border-stone-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-8">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-stone-950 font-bold shadow-md shadow-amber-500/20">
          <Sparkles className="w-4 h-4" />
        </div>
        <button
          onClick={() => setActiveTab('chat')}
          className="text-lg font-bold tracking-tight text-stone-100 hover:text-amber-400 transition-colors"
        >
          Mercan
        </button>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-400">
        <button
          onClick={() => setActiveTab('chat')}
          className={`transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'chat'
              ? 'text-amber-400 font-semibold'
              : 'hover:text-stone-200'
          }`}
        >
          Talk with Mercan
        </button>
        <button
          onClick={() => setActiveTab('photo')}
          className={`transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'photo'
              ? 'text-amber-400 font-semibold'
              : 'hover:text-stone-200'
          }`}
        >
          Photo Studio
        </button>
        <button
          onClick={() => setActiveTab('video')}
          className={`transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'video'
              ? 'text-amber-400 font-semibold'
              : 'hover:text-stone-200'
          }`}
        >
          Video Studio
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'gallery'
              ? 'text-amber-400 font-semibold'
              : 'hover:text-stone-200'
          }`}
        >
          Gallery
        </button>
      </nav>

      {/* Zone 3: 1 Primary Action Area */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => setVoiceAutoPlay(!voiceAutoPlay)}
          title={voiceAutoPlay ? 'Auto Voice Speech is On' : 'Auto Voice Speech is Muted'}
          className={`p-2 rounded-lg border transition-colors ${
            voiceAutoPlay
              ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
              : 'border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          {voiceAutoPlay ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <button
          onClick={onQuickMic}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 shadow-sm ${
            isListening
              ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
              : 'bg-amber-500 hover:bg-amber-400 text-stone-950 hover:shadow-amber-500/20'
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          <span>{isListening ? 'Listening...' : 'Talk with Mercan'}</span>
        </button>
      </div>
    </header>
  );
};
