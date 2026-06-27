'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Heart, Star, Award } from 'lucide-react';
import { getMemoryStats } from '@/lib/api';

export default function StatsBar() {
  const [stats, setStats] = useState({ total: 0, friends: 0, featured: 0, avgRating: 0 });

  useEffect(() => {
    getMemoryStats().then(r => setStats(r.data)).catch(() => {});
  }, []);

  const items = [
    { icon: Users, label: 'Memories Shared', value: stats.total },
    { icon: Heart, label: 'Friendships Captured', value: stats.friends },
    { icon: Star,  label: 'Featured Memories', value: stats.featured },
    { icon: Award, label: 'Avg Friendship Rating', value: stats.avgRating + '/10' },
  ];

  return (
    <div className="bg-ink border-y border-gold/20 py-6">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center"
          >
            <item.icon className="w-5 h-5 text-gold mx-auto mb-2 opacity-70" />
            <div className="font-display text-2xl font-bold text-gold">{item.value}</div>
            <div className="font-serif text-cream/50 text-xs mt-1 tracking-wide">{item.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
