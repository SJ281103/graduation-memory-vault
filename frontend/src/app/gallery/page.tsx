'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, ZoomIn, Download, Play, Grid3X3, LayoutGrid } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { getMemories, getTeachers } from '@/lib/api';

interface MediaItem {
  url: string;
  type: 'photo' | 'video';
  caption: string;
  author: string;
}

export default function GalleryPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'photos' | 'videos'>('all');
  const [layout, setLayout] = useState<'masonry' | 'grid'>('masonry');
  const [slideshow, setSlideshow] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [friendsRes, teachersRes] = await Promise.all([
          getMemories({ limit: 100 }),
          getTeachers(),
        ]);
        const items: MediaItem[] = [];
        friendsRes.data.memories.forEach((m: any) => {
          if (m.bestPhotoUrl)    items.push({ url: m.bestPhotoUrl,    type: 'photo', caption: 'Best memory', author: m.fullName });
          if (m.currentPhotoUrl) items.push({ url: m.currentPhotoUrl, type: 'photo', caption: 'Current photo', author: m.fullName });
          if (m.videoUrl)        items.push({ url: m.videoUrl,        type: 'video', caption: 'Video memory', author: m.fullName });
        });
        teachersRes.data.forEach((t: any) => {
          if (t.photoUrl) items.push({ url: t.photoUrl, type: 'photo', caption: t.subjectTaught || 'Teacher', author: t.teacherName });
        });
        setMedia(items);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const filtered = media.filter(m => filter === 'all' || (filter === 'photos' && m.type === 'photo') || (filter === 'videos' && m.type === 'video'));

  useEffect(() => {
    if (!slideshow) return;
    const t = setInterval(() => setSlideIdx(i => (i + 1) % filtered.length), 3500);
    return () => clearInterval(t);
  }, [slideshow, filtered.length]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-ink pt-20">
        {/* Header */}
        <div className="py-16 px-4 text-center relative">
          <div className="absolute inset-0 opacity-5 bg-gradient-to-b from-gold to-transparent" />
          <p className="font-script text-gold text-2xl mb-2">Every Picture</p>
          <h1 className="font-display text-cream text-5xl font-bold">Memory Gallery</h1>
          <p className="font-serif text-cream/40 mt-2">A visual journey through our best moments.</p>
        </div>

        {/* Controls */}
        <div className="sticky top-16 z-30 bg-ink/90 backdrop-blur-md border-b border-gold/10 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="flex gap-2">
              {(['all','photos','videos'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`font-serif text-sm px-4 py-1.5 rounded-full border transition-all capitalize ${
                    filter === f ? 'bg-gold text-ink border-gold' : 'border-gold/20 text-cream/60 hover:border-gold/40'
                  }`}
                >{f} {f === 'all' ? `(${media.length})` : f === 'photos' ? `(${media.filter(m=>m.type==='photo').length})` : `(${media.filter(m=>m.type==='video').length})`}</button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { setSlideshow(true); setSlideIdx(0); }}
                className="flex items-center gap-2 font-serif text-xs text-cream/60 border border-gold/20 px-3 py-1.5 rounded-full hover:border-gold/50 transition-colors">
                <Play className="w-3 h-3" /> Slideshow
              </button>
              <button onClick={() => setLayout(l => l === 'masonry' ? 'grid' : 'masonry')}
                className="text-cream/60 border border-gold/20 p-1.5 rounded-full hover:border-gold/40 transition-colors">
                {layout === 'masonry' ? <Grid3X3 className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Gallery grid */}
        <div className="max-w-7xl mx-auto px-4 py-10">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array(12).fill(0).map((_, i) => (
                <div key={i} className={`shimmer rounded-sm ${i % 3 === 0 ? 'h-64' : 'h-48'}`} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-5xl mb-4">🖼️</p>
              <p className="font-display text-cream text-2xl">No media yet</p>
              <p className="font-serif text-cream/40 mt-2">Photos and videos will appear here once friends submit memories.</p>
            </div>
          ) : (
            <div className={layout === 'grid'
              ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'
              : 'columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3'
            }>
              {filtered.map((item, i) => (
                <motion.div
                  key={`${item.url}-${i}`}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 12) * 0.04 }}
                  className={`group relative overflow-hidden cursor-pointer rounded-sm ${layout === 'masonry' ? 'break-inside-avoid mb-3' : ''}`}
                  onClick={() => setSelected(item)}
                >
                  {item.type === 'video' ? (
                    <div className="relative bg-ink/50 aspect-video flex items-center justify-center">
                      <video src={item.url} className="w-full h-full object-cover opacity-70" muted />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-gold/80 flex items-center justify-center">
                          <Play className="w-5 h-5 text-ink ml-1" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={item.url}
                        alt={item.author}
                        className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        style={{ aspectRatio: i % 5 === 0 ? '1/1' : i % 4 === 0 ? '4/5' : '4/3' }}
                      />
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/50 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center">
                      <ZoomIn className="w-8 h-8 text-cream mx-auto mb-1" />
                      <p className="font-serif text-cream/90 text-xs">{item.author}</p>
                    </div>
                  </div>
                  {/* Gold border on hover */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-gold/40 transition-colors rounded-sm pointer-events-none" />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.85 }} animate={{ scale: 1 }} exit={{ scale: 0.85 }}
              className="relative max-w-4xl w-full"
              onClick={e => e.stopPropagation()}
            >
              {selected.type === 'video' ? (
                <video src={selected.url} controls autoPlay className="w-full rounded-sm max-h-[70vh]" />
              ) : (
                <img src={selected.url} alt={selected.author} className="w-full rounded-sm max-h-[80vh] object-contain" />
              )}
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="font-display text-cream font-semibold">{selected.author}</p>
                  <p className="font-serif text-cream/50 text-sm">{selected.caption}</p>
                </div>
                <div className="flex gap-2">
                  <a href={selected.url} download target="_blank"
                    className="flex items-center gap-2 font-serif text-sm text-cream/60 border border-cream/20 px-3 py-1.5 rounded-full hover:border-gold/50 hover:text-gold transition-colors">
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                  <button onClick={() => setSelected(null)}
                    className="text-cream/60 border border-cream/20 p-1.5 rounded-full hover:border-gold/40">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slideshow */}
      <AnimatePresence>
        {slideshow && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink flex items-center justify-center"
          >
            <button onClick={() => setSlideshow(false)}
              className="absolute top-4 right-4 z-10 text-cream/60 border border-cream/20 p-2 rounded-full hover:border-gold/50">
              <X className="w-5 h-5" />
            </button>
            <AnimatePresence mode="wait">
              <motion.div key={slideIdx}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.8 }}
                className="max-w-5xl w-full px-4 text-center"
              >
                <img src={filtered[slideIdx]?.url} alt="" className="max-h-[75vh] w-full object-contain mx-auto rounded-sm" />
                <p className="font-script text-gold text-xl mt-4">{filtered[slideIdx]?.author}</p>
                <div className="flex justify-center gap-1 mt-4">
                  {filtered.map((_, i) => (
                    <button key={i} onClick={() => setSlideIdx(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${i === slideIdx ? 'bg-gold w-4' : 'bg-cream/20'}`} />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
