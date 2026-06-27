'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { submitCapsule, getCapsules } from '@/lib/api';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { Lock, Unlock, Clock } from 'lucide-react';

export default function TimeCapsuleSection() {
  const [capsules, setCapsules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    getCapsules().then(r => setCapsules(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      await submitCapsule(data);
      toast.success('Time capsule sealed! ⏰');
      reset();
      const r = await getCapsules();
      setCapsules(r.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to seal capsule.');
    } finally {
      setSubmitting(false);
    }
  };

  // Min date = 1 month from now
  const minDate = new Date();
  minDate.setMonth(minDate.getMonth() + 1);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <Clock className="w-10 h-10 text-gold mx-auto mb-3 animate-float" />
        <p className="font-script text-gold text-xl mb-2">Write to Your Future</p>
        <h2 className="font-display text-4xl font-bold text-ink">Time Capsule</h2>
        <p className="font-serif text-ink-muted mt-2">Seal a message. It'll unlock on the date you choose.</p>
      </div>

      {/* Create capsule form */}
      <div className="bg-cream vintage-border rounded-sm p-6 mb-10 shadow-card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block font-serif text-sm text-ink-muted mb-1.5">Your Name *</label>
            <input {...register('authorName', { required: true })} className="vintage-input" placeholder="Sign your capsule" />
          </div>
          <div>
            <label className="block font-serif text-sm text-ink-muted mb-1.5">Your Message *</label>
            <textarea {...register('message', { required: true })} rows={5} className="vintage-input resize-none"
              placeholder="Dear future self / Dear friend reading this in 2025…" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-serif text-sm text-ink-muted mb-1.5">Unlock Date *</label>
              <input type="date" {...register('unlockDate', { required: true })}
                min={format(minDate, 'yyyy-MM-dd')}
                className="vintage-input" />
            </div>
            <div>
              <label className="block font-serif text-sm text-ink-muted mb-1.5">Hint (optional)</label>
              <input {...register('hint')} className="vintage-input" placeholder="A clue for the reader…" />
            </div>
          </div>
          <button type="submit" disabled={submitting}
            className="btn-vintage bg-ink text-cream px-8 py-3 rounded-sm font-serif text-sm flex items-center gap-2 disabled:opacity-60">
            <Lock className="w-4 h-4" /> {submitting ? 'Sealing…' : 'Seal the Capsule'}
          </button>
        </form>
      </div>

      {/* Capsules list */}
      {loading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="h-24 shimmer rounded-sm" />)}</div>
      ) : capsules.length === 0 ? (
        <div className="text-center py-12 text-ink-muted font-serif">No capsules yet. Be the first to seal a message!</div>
      ) : (
        <div className="space-y-4">
          {capsules.map((c, i) => (
            <motion.div key={c._id}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className={`rounded-sm border p-5 transition-all ${
                c.isUnlocked
                  ? 'bg-gold/10 border-gold/40 hover:border-gold/60'
                  : 'bg-ink/5 border-sepia/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {c.isUnlocked
                    ? <Unlock className="w-5 h-5 text-gold" />
                    : <Lock className="w-5 h-5 text-ink-muted/50" />
                  }
                  <div>
                    <p className="font-display text-ink font-semibold">{c.authorName}</p>
                    <p className={`font-serif text-xs ${c.isUnlocked ? 'text-gold' : 'text-ink-muted/50'}`}>
                      {c.isUnlocked
                        ? `Unlocked ${formatDistanceToNow(new Date(c.unlockDate), { addSuffix: true })}`
                        : `Unlocks ${format(new Date(c.unlockDate), 'MMMM d, yyyy')}`
                      }
                    </p>
                  </div>
                </div>
              </div>
              {c.isUnlocked && c.message ? (
                <div className="mt-4 font-serif text-ink-muted text-sm leading-relaxed italic border-l-2 border-gold/40 pl-3">
                  "{c.message}"
                </div>
              ) : c.hint ? (
                <p className="mt-3 font-serif text-ink-muted/50 text-xs italic">Hint: {c.hint}</p>
              ) : null}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
