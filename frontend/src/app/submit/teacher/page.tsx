'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Confetti from 'react-confetti';
import { useDropzone } from 'react-dropzone';
import { Upload, BookOpen } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { submitTeacherMemory } from '@/lib/api';

interface TeacherFormData {
  teacherName: string; subjectTaught: string; yearsKnown: string;
  favoriteMemory: string; adviceForFuture: string; messageBlesssing: string;
}

export default function TeacherSubmitPage() {
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<TeacherFormData>();

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] }, maxSize: 5 * 1024 * 1024, maxFiles: 1,
    onDrop: files => setPhoto(files[0]),
  });

  const onSubmit = async (data: TeacherFormData) => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.append(k, v));
      if (photo) fd.append('photo', photo);
      await submitTeacherMemory(fd);
      setSubmitted(true);
      toast.success('Your blessing has been received! 🙏');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div className="min-h-screen bg-parchment flex items-center justify-center">
      <Confetti recycle={false} numberOfPieces={150} colors={['#C9962C','#2D4A2D','#2C1810']} />
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center p-12">
        <div className="text-5xl mb-4">🙏</div>
        <h1 className="font-display text-4xl font-bold text-ink mb-3">Thank You</h1>
        <p className="font-script text-gold text-xl mb-6">Your words will be cherished forever.</p>
        <a href="/" className="btn-vintage bg-ink text-cream px-8 py-3 rounded-sm font-serif text-sm">Back to Home</a>
      </motion.div>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-ink pt-24 pb-16 px-4 relative overflow-hidden">
        {/* Elegant dark background */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1920&q=30')", backgroundSize: 'cover' }} />

        <div className="relative z-10 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 bg-gold/20 border border-gold/40 px-4 py-2 rounded-full mb-6">
              <BookOpen className="w-4 h-4 text-gold" />
              <span className="font-serif text-gold text-sm tracking-wider">Teacher's Corner</span>
            </div>
            <h1 className="font-display text-cream text-4xl md:text-5xl font-bold mb-3">
              Dear <span className="italic text-gold">Professor</span>
            </h1>
            <p className="font-serif text-cream/60 text-lg">
              Your words shaped who we became. Would you honour us with a few?
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            onSubmit={handleSubmit(onSubmit)}
            className="bg-cream/5 backdrop-blur-sm border border-gold/30 rounded-sm p-8 space-y-6"
          >
            <Field label="Your Name *" dark>
              <input {...register('teacherName', { required: 'Name required' })}
                className="w-full px-4 py-3 bg-cream/10 border border-cream/20 rounded-sm text-cream placeholder:text-cream/30 focus:outline-none focus:border-gold/50"
                placeholder="Prof. / Dr. Your Name" />
              {errors.teacherName && <p className="text-red-400 text-xs mt-1">{errors.teacherName.message}</p>}
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Subject Taught" dark>
                <input {...register('subjectTaught')}
                  className="w-full px-4 py-3 bg-cream/10 border border-cream/20 rounded-sm text-cream placeholder:text-cream/30 focus:outline-none focus:border-gold/50"
                  placeholder="e.g., Data Structures" />
              </Field>
              <Field label="Years Known" dark>
                <input {...register('yearsKnown')}
                  className="w-full px-4 py-3 bg-cream/10 border border-cream/20 rounded-sm text-cream placeholder:text-cream/30 focus:outline-none focus:border-gold/50"
                  placeholder="e.g., 4 years" />
              </Field>
            </div>

            <Field label="A memory of this student 📚" dark>
              <textarea {...register('favoriteMemory')} rows={3}
                className="w-full px-4 py-3 bg-cream/10 border border-cream/20 rounded-sm text-cream placeholder:text-cream/30 focus:outline-none focus:border-gold/50 resize-none"
                placeholder="Something that stood out, a moment you remember fondly…" />
            </Field>

            <Field label="Your advice for their future 🌟" dark>
              <textarea {...register('adviceForFuture')} rows={3}
                className="w-full px-4 py-3 bg-cream/10 border border-cream/20 rounded-sm text-cream placeholder:text-cream/30 focus:outline-none focus:border-gold/50 resize-none"
                placeholder="Wisdom you wish you had at their age…" />
            </Field>

            <Field label="Message & Blessing 🙏" dark>
              <textarea {...register('messageBlesssing')} rows={4}
                className="w-full px-4 py-3 bg-cream/10 border border-cream/20 rounded-sm text-cream placeholder:text-cream/30 focus:outline-none focus:border-gold/50 resize-none"
                placeholder="Your words of blessing for their journey ahead…" />
            </Field>

            <Field label="Your Photo (optional)" dark>
              <div {...getRootProps()}
                className="border-2 border-dashed border-gold/30 rounded-sm p-6 text-center cursor-pointer hover:border-gold/60 transition-colors"
              >
                <input {...getInputProps()} />
                {photo ? (
                  <p className="text-sm font-serif text-gold">✓ {photo.name}</p>
                ) : (
                  <><Upload className="w-6 h-6 text-gold/50 mx-auto mb-2" />
                  <p className="text-sm font-serif text-cream/40">Drop your photo here</p></>
                )}
              </div>
            </Field>

            <button type="submit" disabled={loading}
              className="w-full btn-vintage bg-gold text-ink py-4 rounded-sm font-serif tracking-widest text-sm hover:bg-gold-light transition-all disabled:opacity-60"
            >
              {loading ? 'Saving…' : '✦ Leave My Blessing'}
            </button>
          </motion.form>
        </div>
      </div>
    </>
  );
}

function Field({ label, children, dark }: { label: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <div>
      <label className={`block font-serif text-sm mb-1.5 tracking-wide ${dark ? 'text-cream/60' : 'text-ink-muted'}`}>{label}</label>
      {children}
    </div>
  );
}
