import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  Camera,
  Video as VideoIcon,
  Copy,
  Check,
  RefreshCw,
  Heart,
} from 'lucide-react';
import { AudioVisualizer } from './AudioVisualizer';
import { CONVERSATION_STARTERS, MERCAN_PERSONA } from '../noot.js';

export interface ChatMessage {
  id: string;
  role: 'user' | 'mercan';
  text: string;
  timestamp: string;
}

interface VoiceChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isGenerating: boolean;
  isListening: boolean;
  toggleListening: () => void;
  interimTranscript: string;
  micVolume: number;
  isSpeaking: boolean;
  onSpeakText: (text: string) => void;
  onStopSpeaking: () => void;
  onNavigateToPhotoWithPrompt: (prompt: string) => void;
  onNavigateToVideoWithPrompt: (prompt: string) => void;
}

export const VoiceChat: React.FC<VoiceChatProps> = ({
  messages,
  onSendMessage,
  isGenerating,
  isListening,
  toggleListening,
  interimTranscript,
  micVolume,
  isSpeaking,
  onSpeakText,
  onStopSpeaking,
  onNavigateToPhotoWithPrompt,
  onNavigateToVideoWithPrompt,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating, interimTranscript]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isGenerating) return;
    const msg = inputText.trim();
    setInputText('');
    onSendMessage(msg);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] max-w-5xl mx-auto px-4 py-4 md:py-6">
      {/* Top Mercan Hero Presence */}
      <div className="flex flex-col sm:flex-row items-center gap-5 p-5 mb-4 rounded-2xl bg-stone-900/60 border border-stone-800/80 backdrop-blur-sm">
        <div className="relative group shrink-0">
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 transition-all duration-300 ${
              isSpeaking
                ? 'border-emerald-400 shadow-[0_0_24px_rgba(52,211,153,0.4)] scale-105'
                : isListening
                ? 'border-amber-400 shadow-[0_0_24px_rgba(245,158,11,0.4)] scale-105'
                : 'border-stone-700 hover:border-amber-500/60'
            }`}
          >
            <img
              src="/src/assets/images/mercan_avatar_portrait_1791617395646.jpg"
              alt="Mercan Avatar"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          {/* Status badge */}
          <div
            className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border border-stone-900 flex items-center gap-1 ${
              isSpeaking
                ? 'bg-emerald-500 text-stone-950'
                : isListening
                ? 'bg-amber-400 text-stone-950'
                : 'bg-stone-800 text-stone-300'
            }`}
          >
            {isSpeaking ? 'Speaking' : isListening ? 'Listening' : 'Ready'}
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-100">
              Mercan
            </h1>
            <span className="text-xs text-amber-400/90 font-medium px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
              Kind & Creative Companion
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-400 max-w-xl">
            Talk nicely with Mercan via your microphone or text. Mercan loves to chat, exchange kind thoughts, and bring your ideas to life as stunning photos and videos!
          </p>

          {/* Quick Voice Bar */}
          <div className="flex items-center justify-center sm:justify-start gap-4 mt-3">
            <AudioVisualizer
              isListening={isListening}
              isSpeaking={isSpeaking}
              volumeLevel={micVolume}
            />
            {isSpeaking && (
              <button
                onClick={onStopSpeaking}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 underline underline-offset-2"
              >
                <VolumeX className="w-3.5 h-3.5" /> Stop Voice
              </button>
            )}
          </div>
        </div>

        {/* Big Interactive Mic Button */}
        <div className="shrink-0 flex flex-col items-center">
          <button
            onClick={toggleListening}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
              isListening
                ? 'bg-rose-500 hover:bg-rose-600 text-white mic-active-glow scale-105'
                : 'bg-amber-500 hover:bg-amber-400 text-stone-950 hover:shadow-amber-500/25'
            }`}
            title={isListening ? 'Click to stop microphone' : 'Click to speak to Mercan'}
          >
            {isListening ? (
              <MicOff className="w-6 h-6 animate-pulse" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </button>
          <span className="text-[11px] font-medium text-stone-400 mt-1.5">
            {isListening ? 'Tap to finish' : 'Tap to speak'}
          </span>
        </div>
      </div>

      {/* Conversation Area */}
      <div className="flex-1 overflow-y-auto px-1 space-y-4 pr-2">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-amber-500/40">
                  <img
                    src="/src/assets/images/mercan_avatar_portrait_1791617395646.jpg"
                    alt="Mercan"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div
                className={`flex flex-col group rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-amber-500/15 border border-amber-500/30 text-stone-100 rounded-tr-none'
                    : 'bg-stone-900 border border-stone-800 text-stone-200 rounded-tl-none shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1 text-[11px] text-stone-500">
                  <span className="font-semibold text-stone-400">
                    {isUser ? 'You' : 'Mercan'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* Message Actions */}
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-stone-800/60 opacity-80 group-hover:opacity-100 transition-opacity">
                  {!isUser && (
                    <button
                      onClick={() => onSpeakText(msg.text)}
                      className="p-1 rounded text-stone-400 hover:text-amber-400 hover:bg-stone-800 transition-colors"
                      title="Listen with voice"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleCopy(msg.id, msg.text)}
                    className="p-1 rounded text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
                    title="Copy message"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {!isUser && (
                    <>
                      <button
                        onClick={() => onNavigateToPhotoWithPrompt(msg.text)}
                        className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-amber-300 px-1.5 py-0.5 rounded hover:bg-stone-800 transition-colors ml-auto"
                        title="Create photo inspired by this reply"
                      >
                        <Camera className="w-3 h-3 text-amber-400" />
                        <span>Make Photo</span>
                      </button>
                      <button
                        onClick={() => onNavigateToVideoWithPrompt(msg.text)}
                        className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-amber-300 px-1.5 py-0.5 rounded hover:bg-stone-800 transition-colors"
                        title="Create video inspired by this reply"
                      >
                        <VideoIcon className="w-3 h-3 text-amber-400" />
                        <span>Make Video</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Interim voice recognition feedback */}
        {isListening && interimTranscript && (
          <div className="flex gap-3 max-w-3xl ml-auto flex-row-reverse">
            <div className="bg-amber-500/10 border border-amber-500/30 border-dashed rounded-2xl px-4 py-3 text-sm text-amber-200">
              <div className="flex items-center gap-1.5 text-xs text-amber-400 mb-1">
                <Mic className="w-3.5 h-3.5 animate-pulse" />
                <span>Listening live...</span>
              </div>
              <p className="italic">{interimTranscript}</p>
            </div>
          </div>
        )}

        {/* Generating Indicator */}
        {isGenerating && (
          <div className="flex items-center gap-2.5 text-xs text-amber-400/90 py-2">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
            <span>Mercan is thinking with a warm smile...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starters */}
      {messages.length <= 2 && (
        <div className="py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] text-stone-500 font-medium uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Try:
          </span>
          {CONVERSATION_STARTERS.slice(0, 4).map((starter, i) => (
            <button
              key={i}
              onClick={() => onSendMessage(starter)}
              className="text-xs text-stone-400 hover:text-amber-300 bg-stone-900/80 hover:bg-stone-800 border border-stone-800 rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              {starter}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Message Input Bar */}
      <form
        onSubmit={handleSubmit}
        className="mt-2 pt-2 border-t border-stone-800/80 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={toggleListening}
          className={`p-3 rounded-xl border transition-all ${
            isListening
              ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
              : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-amber-400 hover:border-amber-500/40'
          }`}
          title={isListening ? 'Stop listening' : 'Start microphone voice input'}
        >
          <Mic className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            isListening
              ? 'Listening to your voice... Speak now'
              : 'Talk nicely with Mercan or ask to make a photo/video...'
          }
          className="flex-1 bg-stone-900/90 border border-stone-800 focus:border-amber-500/60 rounded-xl px-4 py-3 text-sm text-stone-100 placeholder-stone-500 focus:outline-none transition-colors"
          disabled={isGenerating}
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isGenerating}
          className="px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 disabled:text-stone-600 text-stone-950 font-semibold text-sm transition-all flex items-center gap-1.5 shadow-sm"
        >
          <span>Send</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
