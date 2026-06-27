'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/',         label: 'Home' },
  { href: '/memories', label: 'Memory Wall' },
  { href: '/gallery',  label: 'Gallery' },
  { href: '/submit',   label: 'Leave Memory', cta: true },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const path = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isHome = path === '/';

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || !isHome
          ? 'bg-ink/95 backdrop-blur-md border-b border-gold/20 shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 border border-gold/60 rounded-full flex items-center justify-center group-hover:border-gold transition-colors">
            <GraduationCap className="w-4 h-4 text-gold" />
          </div>
          <span className="font-display text-cream text-base font-semibold hidden sm:block">Memory Vault</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {LINKS.map(l => (
            <Link key={l.href} href={l.href}
              className={`font-serif text-sm tracking-wider transition-colors duration-200 ${
                l.cta
                  ? 'bg-gold/90 text-ink px-5 py-2 hover:bg-gold-light rounded-sm'
                  : `${path === l.href ? 'text-gold' : 'text-cream/70 hover:text-gold'}`
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Hamburger */}
        <button onClick={() => setOpen(o => !o)} className="md:hidden text-cream p-2">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-ink border-t border-gold/20"
          >
            <div className="px-4 py-4 space-y-1">
              {LINKS.map(l => (
                <Link key={l.href} href={l.href}
                  onClick={() => setOpen(false)}
                  className={`block py-3 font-serif text-sm tracking-wide border-b border-gold/10 ${
                    path === l.href ? 'text-gold' : 'text-cream/70'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
