import React, { useState } from 'react';
import {
  Camera,
  Video,
  Download,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Layers,
} from 'lucide-react';

export interface GalleryItem {
  id: string;
  type: 'photo' | 'video';
  title: string;
  prompt: string;
  url: string;
  createdAt: string;
  aspectRatio: string;
  author: string;
}

interface GalleryModalProps {
  items: GalleryItem[];
  onSelectPhotoForVideo: (imageUrl: string, prompt: string) => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  items,
  onSelectPhotoForVideo,
}) => {
  const [filter, setFilter] = useState<'all' | 'photo' | 'video'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (url: string, title: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Top filter and header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold tracking-tight text-stone-100">
              Mercan Creative Gallery
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-400">
            Browse and download all photos and videos created during your conversations with Mercan.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 p-1 bg-stone-900 border border-stone-800 rounded-lg">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filter === 'all'
                ? 'bg-stone-800 text-stone-100 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            All Works ({items.length})
          </button>
          <button
            onClick={() => setFilter('photo')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filter === 'photo'
                ? 'bg-stone-800 text-stone-100 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Photos ({items.filter((i) => i.type === 'photo').length})
          </button>
          <button
            onClick={() => setFilter('video')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filter === 'video'
                ? 'bg-stone-800 text-stone-100 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Videos ({items.filter((i) => i.type === 'video').length})
          </button>
        </div>
      </div>

      {/* Grid of gallery creations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group rounded-2xl overflow-hidden border border-stone-800 bg-stone-900/60 hover:border-stone-700 transition-all flex flex-col shadow-md"
          >
            <div className="relative aspect-4/3 overflow-hidden bg-stone-950">
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />

              {/* Type tag */}
              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-950/80 text-amber-400 backdrop-blur-sm border border-stone-800 flex items-center gap-1">
                {item.type === 'photo' ? (
                  <Camera className="w-3 h-3" />
                ) : (
                  <Video className="w-3 h-3" />
                )}
                <span>{item.type}</span>
              </div>

              {/* Quick download hover */}
              <button
                onClick={() => handleDownload(item.url, item.title)}
                className="absolute top-2.5 right-2.5 p-2 rounded-lg bg-stone-950/80 text-stone-200 hover:text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                title="Download"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-stone-100 mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                  {item.prompt}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-500">
                <span className="font-mono">{item.aspectRatio}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(item.id, item.prompt)}
                    className="p-1 rounded text-stone-400 hover:text-stone-200 transition-colors"
                    title="Copy Prompt"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {item.type === 'photo' && (
                    <button
                      onClick={() => onSelectPhotoForVideo(item.url, item.prompt)}
                      className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                      title="Send to Video Studio"
                    >
                      Animate
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
