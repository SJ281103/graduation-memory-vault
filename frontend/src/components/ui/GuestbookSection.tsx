'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { signGuestbook, getGuestbook } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { PenLine } from 'lucide-react';

const EMOJIS = ['🎓','❤️','🌟','✨','🎉','🙏','🔥','💯'];
const ROLES  = ['friend','classmate','teacher','family','other'];

export default function GuestbookSection() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState('🎓');
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    getGuestbook().then(r => setEntries(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      await signGuestbook({ ...data, emoji: selectedEmoji });
      toast.success('You signed the guestbook! ✍️');
      reset();
      // Reload
      const r = await getGuestbook();
      setEntries(r.data);
    } catch {
      toast.error('Failed to sign. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <p className="font-script text-gold text-xl mb-2">✍️ Sign Here</p>
        <h2 className="font-display text-4xl font-bold text-ink">The Guestbook</h2>
        <p className="font-serif text-ink-muted mt-2">Leave your mark — a quick note that'll last forever.</p>
      </div>

      {/* Sign form */}
      <div className="bg-cream vintage-border rounded-sm p-6 mb-10 shadow-card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-serif text-sm text-ink-muted mb-1.5">Your Name *</label>
              <input {...register('signerName', { required: true })}
                className="vintage-input" placeholder="Full name" />
            </div>
            <div>
              <label className="block font-serif text-sm text-ink-muted mb-1.5">Role</label>
              <select {...register('role')} className="vintage-input">
                {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block font-serif text-sm text-ink-muted mb-1.5">Your Message *</label>
            <textarea {...register('message', { required: true, maxLength: 500 })} rows={3}
              className="vintage-input resize-none" placeholder="Leave a heartfelt note…" />
          </div>
          <div>
            <label className="block font-serif text-sm text-ink-muted mb-2">Pick an Emoji</label>
            <div className="flex gap-2 flex-wrap">
              {EMOJIS.map(e => (
                <button type="button" key={e} onClick={() => setSelectedEmoji(e)}
                  className={`text-xl p-2 rounded-sm border transition-all ${selectedEmoji === e ? 'border-gold bg-gold/10' : 'border-sepia/20 hover:border-gold/40'}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={submitting}
            className="btn-vintage bg-ink text-cream px-8 py-3 rounded-sm font-serif text-sm flex items-center gap-2 disabled:opacity-60">
            <PenLine className="w-4 h-4" /> {submitting ? 'Signing…' : 'Sign the Guestbook'}
          </button>
        </form>
      </div>

      {/* Entries */}
      {loading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="h-24 shimmer rounded-sm" />)}</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 text-ink-muted font-serif">No signatures yet — be the first!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entries.map((e, i) => (
            <motion.div key={e._id}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="bg-cream border border-sepia/20 p-4 rounded-sm hover:border-gold/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-display text-ink text-sm font-semibold">{e.signerName}</span>
                  <span className="font-serif text-gold text-xs ml-2 capitalize">{e.role}</span>
                </div>
                <span className="text-xl">{e.emoji}</span>
              </div>
              <p className="font-serif text-ink-muted text-sm leading-relaxed">"{e.message}"</p>
              <p className="font-mono text-ink-muted/40 text-xs mt-2">
                {formatDistanceToNow(new Date(e.createdAt), { addSuffix: true })}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
