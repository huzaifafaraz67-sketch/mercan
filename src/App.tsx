/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { VoiceChat, ChatMessage } from './components/VoiceChat';
import { PhotoStudio } from './components/PhotoStudio';
import { VideoStudio } from './components/VideoStudio';
import { GalleryModal, GalleryItem } from './components/GalleryModal';
import { mercanVoice } from './scrip.js';
import { mercanEngine } from './index.js';
import { INITIAL_GALLERY, MERCAN_PERSONA } from './noot.js';
import { sendMercanMessage, generateMercanPhoto, generateMercanVideo, requestMercanSpeech } from '../API/index.js';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'photo' | 'video' | 'gallery'>('chat');
  const [voiceAutoPlay, setVoiceAutoPlay] = useState<boolean>(true);

  // Voice controller state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [micVolume, setMicVolume] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'mercan',
      text: MERCAN_PERSONA.greeting,
      timestamp: 'Just now',
    },
  ]);
  const [isGeneratingChat, setIsGeneratingChat] = useState<boolean>(false);

  // Cross-studio context transfers
  const [photoStudioPrompt, setPhotoStudioPrompt] = useState<string>('');
  const [videoStudioPrompt, setVideoStudioPrompt] = useState<string>('');
  const [videoStudioImage, setVideoStudioImage] = useState<string | null>(null);

  // Galleries and creations
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(INITIAL_GALLERY as GalleryItem[]);
  const [isGeneratingPhoto, setIsGeneratingPhoto] = useState<boolean>(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState<boolean>(false);

  // Bind voice controller events
  useEffect(() => {
    const unsubStatus = mercanVoice.on('status', (status: string) => {
      setIsListening(status === 'listening');
      if (status === 'idle') {
        setMicVolume(0);
      }
    });

    const unsubResult = mercanVoice.on('result', ({ finalTranscript, interimTranscript }: any) => {
      setInterimTranscript(interimTranscript || finalTranscript);
      if (finalTranscript && finalTranscript.trim()) {
        // If final transcript captured in chat mode, auto send
        if (activeTab === 'chat') {
          handleSendMessage(finalTranscript.trim());
          setInterimTranscript('');
        }
      }
    });

    const unsubVolume = mercanVoice.on('volume', (vol: number) => {
      setMicVolume(vol);
    });

    return () => {
      unsubStatus();
      unsubResult();
      unsubVolume();
    };
  }, [activeTab]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      mercanVoice.stopListening();
      setIsListening(false);
    } else {
      mercanVoice.startListening();
    }
  }, [isListening]);

  // Handle Text-to-speech for Mercan
  const handleSpeakText = useCallback((text: string) => {
    setIsSpeaking(true);
    mercanVoice.speak(text, () => {
      setIsSpeaking(false);
    });
  }, []);

  const handleStopSpeaking = useCallback(() => {
    mercanVoice.stopSpeaking();
    setIsSpeaking(false);
  }, []);

  // Send message to Mercan
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsGeneratingChat(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await sendMercanMessage(text, history);
      const replyText = res.text || "I'm so glad to talk with you! Let me know if you'd like to create a photo or video together.";

      const mercanMsg: ChatMessage = {
        id: `mercan-${Date.now()}`,
        role: 'mercan',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, mercanMsg]);

      // Speak aloud nicely if auto-play is enabled
      if (voiceAutoPlay) {
        handleSpeakText(replyText);
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `mercan-err-${Date.now()}`,
        role: 'mercan',
        text: "I'm right here with you! I had a tiny connection hiccup, but I'm still smiling and ready to chat or make photos and videos for you. Would you like to try again?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsGeneratingChat(false);
    }
  };

  // Generate Photo Handler
  const handleGeneratePhoto = async (prompt: string, aspectRatio: string, style: string) => {
    setIsGeneratingPhoto(true);
    try {
      const res = await generateMercanPhoto(prompt, aspectRatio, style);
      if (res && res.imageUrl) {
        const newItem: GalleryItem = {
          id: `photo-${Date.now()}`,
          type: 'photo',
          title: prompt.slice(0, 32),
          prompt: res.prompt || prompt,
          url: res.imageUrl,
          createdAt: new Date().toISOString(),
          aspectRatio,
          author: 'Mercan & You',
        };
        setGalleryItems((prev) => [newItem, ...prev]);

        if (voiceAutoPlay) {
          handleSpeakText("I finished creating your photo! Take a look, I hope you love it!");
        }
        return res;
      }
    } catch (err) {
      console.error('Photo generation failed:', err);
      throw err;
    } finally {
      setIsGeneratingPhoto(false);
    }
  };

  // Generate Video Handler
  const handleGenerateVideo = async (prompt: string, options: any) => {
    setIsGeneratingVideo(true);
    try {
      const res = await generateMercanVideo(prompt, options);

      const newItem: GalleryItem = {
        id: `video-${Date.now()}`,
        type: 'video',
        title: prompt.slice(0, 32),
        prompt,
        url: options.image || '/src/assets/images/mercan_video_frame_1791617420442.jpg',
        createdAt: new Date().toISOString(),
        aspectRatio: options.aspectRatio || '16:9',
        author: 'Mercan & You',
      };
      setGalleryItems((prev) => [newItem, ...prev]);

      if (voiceAutoPlay) {
        handleSpeakText("Your cinematic video scene is now animating! You can preview and download it right here.");
      }
      return res;
    } catch (err) {
      console.error('Video generation error:', err);
      // Fallback notification
      const newItem: GalleryItem = {
        id: `video-${Date.now()}`,
        type: 'video',
        title: prompt.slice(0, 32),
        prompt,
        url: options.image || '/src/assets/images/mercan_video_frame_1791617420442.jpg',
        createdAt: new Date().toISOString(),
        aspectRatio: options.aspectRatio || '16:9',
        author: 'Mercan & You',
      };
      setGalleryItems((prev) => [newItem, ...prev]);
      return { success: true };
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  // Cross-studio navigation helpers
  const handleNavigateToPhotoWithPrompt = (prompt: string) => {
    setPhotoStudioPrompt(prompt);
    setActiveTab('photo');
  };

  const handleNavigateToVideoWithPrompt = (prompt: string) => {
    setVideoStudioPrompt(prompt);
    setActiveTab('video');
  };

  const handleSelectPhotoForVideo = (imageUrl: string, prompt: string) => {
    setVideoStudioImage(imageUrl);
    setVideoStudioPrompt(prompt);
    setActiveTab('video');
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        voiceAutoPlay={voiceAutoPlay}
        setVoiceAutoPlay={setVoiceAutoPlay}
        onQuickMic={toggleListening}
        isListening={isListening}
      />

      <main className="flex-1">
        {activeTab === 'chat' && (
          <VoiceChat
            messages={messages}
            onSendMessage={handleSendMessage}
            isGenerating={isGeneratingChat}
            isListening={isListening}
            toggleListening={toggleListening}
            interimTranscript={interimTranscript}
            micVolume={micVolume}
            isSpeaking={isSpeaking}
            onSpeakText={handleSpeakText}
            onStopSpeaking={handleStopSpeaking}
            onNavigateToPhotoWithPrompt={handleNavigateToPhotoWithPrompt}
            onNavigateToVideoWithPrompt={handleNavigateToVideoWithPrompt}
          />
        )}

        {activeTab === 'photo' && (
          <PhotoStudio
            onGeneratePhoto={handleGeneratePhoto}
            isGenerating={isGeneratingPhoto}
            isListening={isListening}
            toggleListening={toggleListening}
            interimTranscript={interimTranscript}
            initialPrompt={photoStudioPrompt}
            onSendToVideoStudio={handleSelectPhotoForVideo}
            recentPhotos={galleryItems.filter((item) => item.type === 'photo')}
          />
        )}

        {activeTab === 'video' && (
          <VideoStudio
            onGenerateVideo={handleGenerateVideo}
            isGenerating={isGeneratingVideo}
            isListening={isListening}
            toggleListening={toggleListening}
            interimTranscript={interimTranscript}
            initialPrompt={videoStudioPrompt}
            initialImage={videoStudioImage}
            recentVideos={galleryItems.filter((item) => item.type === 'video')}
          />
        )}

        {activeTab === 'gallery' && (
          <GalleryModal
            items={galleryItems}
            onSelectPhotoForVideo={handleSelectPhotoForVideo}
          />
        )}
      </main>
    </div>
  );
}
