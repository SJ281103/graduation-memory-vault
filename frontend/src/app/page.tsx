'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { differenceInDays, format } from 'date-fns';
import { Volume2, VolumeX, BookOpen, Camera, ChevronDown, Star, Clock, Users, GraduationCap } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import FloatingParticles from '@/components/animations/FloatingParticles';
import StatsBar from '@/components/ui/StatsBar';

const GRADUATION_DATE = new Date('2024-05-15'); // Change to actual date
const QUOTES = [
  "Not the end of a chapter — the beginning of the greatest story.",
  "Four years of dreams, friendship, and late nights — forever ours.",
  "We didn't just earn a degree. We earned each other.",
  "The tassel was worth the hassle.",
  "Here's to the ones who became family.",
];

export default function HomePage() {
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [daysSince, setDaysSince] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale   = useTransform(scrollY, [0, 400], [1, 1.08]);
  const textY       = useTransform(scrollY, [0, 400], [0, -80]);

  useEffect(() => {
    setDaysSince(differenceInDays(new Date(), GRADUATION_DATE));
    const timer = setInterval(() => {
      setQuoteIdx(i => (i + 1) % QUOTES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (musicPlaying) { audioRef.current.pause(); setMusicPlaying(false); }
    else { audioRef.current.play().catch(() => {}); setMusicPlaying(true); }
  };

  return (
    <main className="relative min-h-screen">
      <Navbar />
      <FloatingParticles />

      {/* Audio (royalty-free piano) */}
      <audio ref={audioRef} loop>
        <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mp3" />
      </audio>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <motion.div
          style={{ scale: heroScale, opacity: heroOpacity }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/40 to-ink/80 z-10" />
          <div
            className="w-full h-full bg-center bg-cover"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&q=80')" }}
          />
        </motion.div>

        {/* Vintage vignette */}
        <div className="absolute inset-0 z-10 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(44,24,16,0.6) 100%)' }} />

        {/* Hero content */}
        <motion.div style={{ y: textY }} className="relative z-20 text-center px-4 max-w-5xl mx-auto">
          {/* Graduation cap icon */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3 }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-2 border-gold/60 flex items-center justify-center animate-glow-pulse">
                <GraduationCap className="w-10 h-10 text-gold" />
              </div>
              <div className="absolute inset-0 rounded-full border border-gold/30 scale-125 animate-ping" />
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}
            className="font-script text-gold text-xl mb-4 tracking-wide"
          >
            Class of 2024 · Computer Science Engineering
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.6 }}
            className="font-display text-cream text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6 glow-gold"
          >
            Graduation<br />
            <span className="italic text-gold">Memory Vault</span>
          </motion.h1>

          {/* Animated quote */}
          <div className="h-16 flex items-center justify-center mb-10">
            <AnimatePresence mode="wait">
              <motion.p
                key={quoteIdx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="font-serif text-cream/80 text-lg md:text-xl italic max-w-2xl"
              >
                "{QUOTES[quoteIdx]}"
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Days counter */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
            className="inline-flex items-center gap-2 bg-ink/50 border border-gold/30 px-6 py-3 rounded-full mb-10 backdrop-blur-sm"
          >
            <Clock className="w-4 h-4 text-gold" />
            <span className="font-serif text-cream/90 text-sm">
              <span className="text-gold font-semibold text-lg">{daysSince}</span> days since we graduated
            </span>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/submit"
              className="btn-vintage bg-gold text-ink px-10 py-4 font-serif font-medium text-sm tracking-widest hover:bg-gold-light hover:shadow-gold transition-all duration-300 rounded-sm"
            >
              ✦ Leave a Memory
            </Link>
            <Link href="/memories"
              className="btn-vintage border-cream/60 text-cream px-10 py-4 hover:border-gold hover:text-gold transition-all duration-300 rounded-sm"
            >
              View All Memories
            </Link>
          </motion.div>
        </motion.div>

        {/* Music toggle */}
        <button
          onClick={toggleMusic}
          className="absolute bottom-8 right-8 z-30 flex items-center gap-2 bg-ink/50 border border-gold/30 text-cream px-4 py-2 rounded-full text-xs font-serif backdrop-blur-sm hover:border-gold/60 transition-all"
        >
          {musicPlaying ? <Volume2 className="w-3.5 h-3.5 text-gold" /> : <VolumeX className="w-3.5 h-3.5" />}
          {musicPlaying ? 'Music On' : 'Music Off'}
        </button>

        {/* Scroll cue */}
        <motion.div
          animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30"
        >
          <ChevronDown className="w-6 h-6 text-cream/50" />
        </motion.div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────── */}
      <StatsBar />

      {/* ── Feature Cards ─────────────────────────────────────── */}
      <section className="py-24 px-4 bg-parchment relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <p className="font-script text-gold text-2xl mb-3">A Forever Home For</p>
            <h2 className="font-display text-ink text-4xl md:text-5xl font-bold">Our Shared Journey</h2>
            <hr className="gold-divider max-w-xs mx-auto mt-6" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, title: 'Friend Memories', desc: 'Share your favorite moments, secrets, and messages for the future', href: '/submit', color: 'text-gold' },
              { icon: Users,    title: 'Teacher Blessings', desc: 'A special space for professors to leave their wisdom and pride', href: '/submit/teacher', color: 'text-forest' },
              { icon: Camera,   title: 'Memory Wall',  desc: 'A beautiful gallery of all our shared photos and stories', href: '/memories', color: 'text-burgundy' },
              { icon: Clock,    title: 'Time Capsule', desc: 'Seal messages to be opened years from now — your future self awaits', href: '/memories#capsule', color: 'text-sage' },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
              >
                <Link href={card.href}
                  className="group block bg-cream border border-sepia-200/40 p-8 hover:border-gold/50 hover:shadow-elegant transition-all duration-400 rounded-sm relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <card.icon className={`w-8 h-8 ${card.color} mb-4`} />
                  <h3 className="font-display text-ink text-lg font-semibold mb-2">{card.title}</h3>
                  <p className="font-body text-ink-muted text-sm leading-relaxed">{card.desc}</p>
                  <div className="mt-4 font-serif text-xs text-gold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore →
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Hall of Legends preview ──────────────────────────── */}
      <section className="py-24 px-4 bg-ink text-cream relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1920&q=30')", backgroundSize: 'cover' }} />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          >
            <p className="font-script text-gold text-2xl mb-3">Featured</p>
            <h2 className="font-display text-5xl font-bold mb-4">
              Hall of <span className="italic text-gold">Legends</span>
            </h2>
            <p className="font-serif text-cream/70 text-lg mb-10">The most cherished memories, forever spotlighted.</p>
            <Link href="/memories?featured=true"
              className="btn-vintage border-gold text-gold px-10 py-4 hover:bg-gold hover:text-ink transition-all duration-300 rounded-sm inline-block"
            >
              ✦ See Featured Memories
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Guestbook CTA ────────────────────────────────────── */}
      <section className="py-20 px-4 bg-cream-100 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8 }}
        >
          <p className="font-script text-sepia text-xl mb-2">Before you leave</p>
          <h2 className="font-display text-ink text-4xl font-bold mb-4">Sign the Guestbook</h2>
          <p className="font-body text-ink-muted max-w-md mx-auto mb-8">Leave your mark — a quick note in our shared memory.</p>
          <Link href="/memories#guestbook"
            className="btn-vintage bg-ink text-cream px-10 py-4 hover:bg-ink-light transition-all duration-300 rounded-sm inline-block font-serif text-sm tracking-widest"
          >
            ✍️ Sign the Book
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="bg-ink text-cream py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <GraduationCap className="w-8 h-8 text-gold mx-auto mb-4" />
          <p className="font-script text-gold text-2xl mb-2">Graduation Memory Vault</p>
          <p className="font-serif text-cream/50 text-sm">Class of 2024 · Computer Science Engineering</p>
          <hr className="gold-divider max-w-xs mx-auto my-6" />
          <p className="font-body text-cream/40 text-xs">Made with ❤️ to preserve memories forever</p>
        </div>
      </footer>
    </main>
  );
}
