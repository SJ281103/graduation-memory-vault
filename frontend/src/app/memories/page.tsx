'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Masonry from 'react-masonry-css';
import { Search, Heart, MessageCircle, Star, Filter, Clock, Users, BookOpen } from 'lucide-react';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import { getMemories, getTeachers, likeMemory } from '@/lib/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import GuestbookSection from '@/components/ui/GuestbookSection';
import TimeCapsuleSection from '@/components/ui/TimeCapsuleSection';

type Tab = 'friends' | 'teachers' | 'featured' | 'guestbook' | 'capsule';

export default function MemoriesPage() {
  const [tab, setTab] = useState<Tab>('friends');
  const [memories, setMemories] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  const loadMemories = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'friends' || tab === 'featured') {
        const r = await getMemories({ featured: tab === 'featured' || undefined, search: search || undefined });
        setMemories(r.data.memories);
      } else if (tab === 'teachers') {
        const r = await getTeachers();
        setTeachers(r.data);
      }
    } catch { toast.error('Failed to load memories'); }
    finally { setLoading(false); }
  }, [tab, search]);

  useEffect(() => { loadMemories(); }, [loadMemories]);

  const handleLike = async (id: string) => {
    try {
      const r = await likeMemory(id);
      setMemories(ms => ms.map(m => m._id === id ? { ...m, likes: r.data.likes } : m));
    } catch { toast.error('Failed to like'); }
  };

  const TABS = [
    { key: 'friends',  label: 'Friends', icon: Users },
    { key: 'teachers', label: 'Teachers', icon: BookOpen },
    { key: 'featured', label: 'Hall of Legends', icon: Star },
    { key: 'guestbook', label: 'Guestbook', icon: MessageCircle },
    { key: 'capsule',   label: 'Time Capsule', icon: Clock },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-parchment pt-20">
        {/* Header */}
        <div className="bg-ink py-16 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1920&q=30')", backgroundSize: 'cover' }} />
          <div className="relative z-10">
            <p className="font-script text-gold text-2xl mb-2">Our Shared Story</p>
            <h1 className="font-display text-cream text-5xl font-bold">Memory Wall</h1>
            <p className="font-serif text-cream/50 mt-3 max-w-md mx-auto">Every friendship, every moment, forever preserved.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-cream border-b border-gold/20 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto py-1">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key as Tab)}
                className={`flex items-center gap-2 px-5 py-3 font-serif text-sm whitespace-nowrap border-b-2 transition-all ${
                  tab === t.key ? 'border-gold text-gold' : 'border-transparent text-ink-muted hover:text-gold'
                }`}
              >
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-10">
          {/* Special sections */}
          {tab === 'guestbook' && <GuestbookSection />}
          {tab === 'capsule'   && <TimeCapsuleSection />}

          {/* Search (only for friends/featured/teachers) */}
          {(tab === 'friends' || tab === 'teachers' || tab === 'featured') && (
            <div className="flex items-center gap-3 mb-8 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted/40" />
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="vintage-input pl-9"
                  placeholder="Search by name…"
                />
              </div>
            </div>
          )}

          {/* Friends / Featured grid */}
          {(tab === 'friends' || tab === 'featured') && (
            loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} className="h-64 shimmer rounded-sm" />
                ))}
              </div>
            ) : memories.length === 0 ? (
              <EmptyState tab={tab} />
            ) : (
              <Masonry
                breakpointCols={{ default: 4, 1100: 3, 700: 2, 500: 1 }}
                className="masonry-grid"
                columnClassName="masonry-col"
              >
                {memories.map((m, i) => (
                  <MemoryCard key={m._id} memory={m} index={i} onLike={handleLike} onClick={() => setSelected(m)} />
                ))}
              </Masonry>
            )
          )}

          {/* Teachers grid */}
          {tab === 'teachers' && (
            loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => <div key={i} className="h-48 shimmer rounded-sm" />)}
              </div>
            ) : teachers.length === 0 ? (
              <EmptyState tab={tab} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teachers.map((t, i) => <TeacherCard key={t._id} teacher={t} index={i} />)}
              </div>
            )
          )}
        </div>
      </div>

      {/* Memory Modal */}
      <AnimatePresence>
        {selected && (
          <MemoryModal memory={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </>
  );
}

function MemoryCard({ memory: m, index, onLike, onClick }: any) {
  const rotate = (index % 3 === 0) ? -1.5 : (index % 3 === 1) ? 0.5 : -0.5;
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index % 8) * 0.06 }}
      className="mb-5 cursor-pointer"
      onClick={onClick}
    >
      <div className="polaroid" style={{ transform: `rotate(${rotate}deg)` }}>
        {m.bestPhotoUrl ? (
          <div className="relative w-full h-48 bg-cream-200 overflow-hidden">
            <Image src={m.bestPhotoUrl} alt={m.fullName} fill className="object-cover" />
          </div>
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-cream-200 to-sepia-100 flex items-center justify-center">
            <span className="text-4xl font-display text-sepia-300">{m.fullName?.[0]?.toUpperCase()}</span>
          </div>
        )}
        <div className="pt-3">
          {m.featured && (
            <span className="inline-flex items-center gap-1 text-gold text-xs font-serif mb-1">
              <Star className="w-3 h-3" /> Featured
            </span>
          )}
          <p className="font-display text-ink text-sm font-semibold">{m.fullName}</p>
          {m.oneWordDescription && (
            <p className="font-script text-sepia text-sm mt-0.5">"{m.oneWordDescription}"</p>
          )}
          {m.favoriteMemory && (
            <p className="font-serif text-ink-muted text-xs mt-1.5 line-clamp-2">{m.favoriteMemory}</p>
          )}
          <div className="flex items-center justify-between mt-3">
            <button onClick={e => { e.stopPropagation(); onLike(m._id); }}
              className="flex items-center gap-1 text-xs text-ink-muted hover:text-burgundy transition-colors">
              <Heart className="w-3.5 h-3.5" /> {m.likes}
            </button>
            {m.friendshipRating && (
              <span className="font-script text-gold text-sm">{m.friendshipRating}/10</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TeacherCard({ teacher: t, index }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay: index * 0.1 }}
      className="bg-cream border border-gold/20 p-6 rounded-sm hover:border-gold/50 hover:shadow-elegant transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        {t.photoUrl ? (
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gold/30 flex-shrink-0">
            <Image src={t.photoUrl} alt={t.teacherName} fill className="object-cover" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-forest/10 border-2 border-forest/30 flex items-center justify-center flex-shrink-0">
            <span className="font-display text-forest text-xl">{t.teacherName?.[0]}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-ink font-semibold">{t.teacherName}</h3>
          {t.subjectTaught && <p className="font-serif text-gold text-xs tracking-wide mt-0.5">{t.subjectTaught}</p>}
        </div>
      </div>
      {t.messageBlesssing && (
        <blockquote className="mt-4 font-serif text-ink-muted text-sm italic border-l-2 border-gold/40 pl-3 line-clamp-3">
          "{t.messageBlesssing}"
        </blockquote>
      )}
      {t.adviceForFuture && (
        <p className="mt-3 font-serif text-ink-muted/70 text-xs line-clamp-2">{t.adviceForFuture}</p>
      )}
    </motion.div>
  );
}

function MemoryModal({ memory: m, onClose }: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="bg-cream max-w-lg w-full rounded-sm max-h-[90vh] overflow-y-auto shadow-elegant"
        onClick={e => e.stopPropagation()}
      >
        {m.bestPhotoUrl && (
          <div className="relative h-56 bg-cream-200">
            <Image src={m.bestPhotoUrl} alt={m.fullName} fill className="object-cover" />
          </div>
        )}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-ink">{m.fullName}</h2>
              {m.nicknameForMe && <p className="font-script text-gold">"{m.nicknameForMe}"</p>}
            </div>
            {m.friendshipRating && (
              <span className="font-display text-2xl text-gold">{m.friendshipRating}<span className="text-sm text-ink-muted">/10</span></span>
            )}
          </div>
          {m.favoriteMemory && <MemorySection title="Our Best Memory" text={m.favoriteMemory} />}
          {m.messageForFuture && <MemorySection title="Message for My Future" text={m.messageForFuture} />}
          {m.adviceForMe && <MemorySection title="Their Advice" text={m.adviceForMe} />}
          {m.funniestMoment && <MemorySection title="Funniest Moment" text={m.funniestMoment} />}
          {m.whereIn10Years && <MemorySection title="Where I'll Be in 10 Years" text={m.whereIn10Years} />}
          {m.signatureDataUrl && (
            <div>
              <p className="font-serif text-xs text-ink-muted mb-2 uppercase tracking-widest">Signature</p>
              <img src={m.signatureDataUrl} alt="Signature" className="max-h-20 border border-sepia/20 p-2 bg-white" />
            </div>
          )}
          <div className="flex gap-4 text-sm font-serif text-ink-muted pt-2 border-t border-sepia/20">
            {m.instagramId && <span>📸 {m.instagramId}</span>}
            {m.phoneNumber  && <span>📱 {m.phoneNumber}</span>}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MemorySection({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <p className="font-serif text-xs text-gold uppercase tracking-widest mb-1">{title}</p>
      <p className="font-body text-ink-muted text-sm leading-relaxed">{text}</p>
    </div>
  );
}

function EmptyState({ tab }: { tab: string }) {
  return (
    <div className="text-center py-24">
      <div className="text-5xl mb-4">📭</div>
      <h3 className="font-display text-2xl text-ink mb-2">No memories yet</h3>
      <p className="font-serif text-ink-muted mb-6">Be the first to leave a memory!</p>
      <a href={tab === 'teachers' ? '/submit/teacher' : '/submit'}
        className="btn-vintage bg-ink text-cream px-8 py-3 rounded-sm font-serif text-sm inline-block">
        Add the First Memory →
      </a>
    </div>
  );
}
