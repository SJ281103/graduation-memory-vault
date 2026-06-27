'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Confetti from 'react-confetti';
import SignatureCanvas from 'react-signature-canvas';
import { useDropzone } from 'react-dropzone';
import { Star, Upload, Trash2, ChevronRight, ChevronLeft, Check, Camera, Video } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { submitMemory } from '@/lib/api';

interface FormData {
  fullName: string; whatTheyCallMe: string; nicknameForMe: string;
  phoneNumber: string; instagramId: string; linkedinProfile: string;
  favoriteMemory: string; oneWordDescription: string;
  messageForFuture: string; adviceForMe: string;
  funniestMoment: string; hiddenConfession: string;
  whereIn10Years: string; friendshipRating: number;
}

const STEPS = ['Identity', 'Contact', 'Memories', 'Future', 'Signature'];

export default function SubmitPage() {
  const [step, setStep] = useState(0);
  const [rating, setRating] = useState(8);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bestPhoto, setBestPhoto] = useState<File | null>(null);
  const [currentPhoto, setCurrentPhoto] = useState<File | null>(null);
  const [signatureData, setSignatureData] = useState<string>('');
  const sigRef = useRef<SignatureCanvas>(null);
  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>();

  const { getRootProps: getBestProps, getInputProps: getBestInput } = useDropzone({
    accept: { 'image/*': [] }, maxSize: 10 * 1024 * 1024, maxFiles: 1,
    onDrop: files => setBestPhoto(files[0]),
  });
  const { getRootProps: getCurrProps, getInputProps: getCurrInput } = useDropzone({
    accept: { 'image/*': [] }, maxSize: 10 * 1024 * 1024, maxFiles: 1,
    onDrop: files => setCurrentPhoto(files[0]),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.append(k, String(v)));
      fd.append('friendshipRating', String(rating));
      if (bestPhoto)    fd.append('bestPhoto',    bestPhoto);
      if (currentPhoto) fd.append('currentPhoto', currentPhoto);
      if (signatureData) fd.append('signatureDataUrl', signatureData);
      await submitMemory(fd);
      setSubmitted(true);
      toast.success('Your memory has been saved forever! 🎓');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const clearSignature = () => { sigRef.current?.clear(); setSignatureData(''); };
  const saveSignature  = () => {
    if (sigRef.current?.isEmpty()) { toast.error('Please draw your signature'); return; }
    setSignatureData(sigRef.current!.toDataURL());
    toast.success('Signature saved!');
  };

  if (submitted) return <SuccessScreen />;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-parchment pt-20 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <p className="font-script text-gold text-2xl mb-2">Leave Your Mark</p>
            <h1 className="font-display text-ink text-4xl md:text-5xl font-bold">Share a Memory</h1>
            <p className="font-serif text-ink-muted mt-3">This will be treasured forever.</p>
          </motion.div>

          {/* Progress */}
          <div className="flex items-center justify-between mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border text-xs font-serif transition-all ${
                    i < step ? 'bg-gold border-gold text-ink' :
                    i === step ? 'border-gold text-gold' :
                    'border-sepia/30 text-ink-muted/40'
                  }`}
                >
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`hidden sm:block text-xs font-serif ${i === step ? 'text-gold' : 'text-ink-muted/40'}`}>{s}</span>
                {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-2 ${i < step ? 'bg-gold' : 'bg-sepia/20'}`} />}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                className="bg-cream vintage-border rounded-sm p-8 shadow-card"
              >
                {/* ── Step 0: Identity ── */}
                {step === 0 && (
                  <div className="space-y-5">
                    <StepTitle>Who are you?</StepTitle>
                    <Field label="Full Name *" error={errors.fullName?.message}>
                      <input {...register('fullName', { required: 'Name is required' })}
                        className="vintage-input" placeholder="Your full name" />
                    </Field>
                    <Field label="What do you call me?">
                      <input {...register('whatTheyCallMe')} className="vintage-input" placeholder="e.g., bro, yaar, captain…" />
                    </Field>
                    <Field label="Your nickname for me">
                      <input {...register('nicknameForMe')} className="vintage-input" placeholder="e.g., Chaos King, The Overthinker…" />
                    </Field>
                    <Field label="One word that describes me">
                      <input {...register('oneWordDescription')} className="vintage-input" placeholder="Just one perfect word" />
                    </Field>
                    <Field label="Friendship Rating">
                      <div className="flex items-center gap-3 mt-1">
                        {[1,2,3,4,5,6,7,8,9,10].map(n => (
                          <button type="button" key={n} onClick={() => setRating(n)}
                            className={`w-8 h-8 rounded-full text-xs font-serif border transition-all ${
                              n <= rating ? 'bg-gold border-gold text-ink' : 'border-sepia/30 text-ink-muted'
                            }`}
                          >{n}</button>
                        ))}
                        <span className="font-script text-gold text-xl">{rating}/10</span>
                      </div>
                    </Field>
                  </div>
                )}

                {/* ── Step 1: Contact ── */}
                {step === 1 && (
                  <div className="space-y-5">
                    <StepTitle>Stay in Touch</StepTitle>
                    <Field label="Phone Number">
                      <input {...register('phoneNumber')} className="vintage-input" placeholder="+91 98765 43210" type="tel" />
                    </Field>
                    <Field label="Instagram">
                      <input {...register('instagramId')} className="vintage-input" placeholder="@yourhandle" />
                    </Field>
                    <Field label="LinkedIn">
                      <input {...register('linkedinProfile')} className="vintage-input" placeholder="linkedin.com/in/yourname" />
                    </Field>

                    {/* Photo uploads */}
                    <Field label="Best Photo Together">
                      <div {...getBestProps()}
                        className="border-2 border-dashed border-gold/30 rounded-sm p-6 text-center cursor-pointer hover:border-gold/60 transition-colors bg-cream-50"
                      >
                        <input {...getBestInput()} />
                        {bestPhoto ? (
                          <p className="text-sm font-serif text-gold">✓ {bestPhoto.name}</p>
                        ) : (
                          <><Camera className="w-6 h-6 text-gold/60 mx-auto mb-2" />
                          <p className="text-sm font-serif text-ink-muted">Drop your best photo together</p></>
                        )}
                      </div>
                    </Field>
                    <Field label="Your Current Photo">
                      <div {...getCurrProps()}
                        className="border-2 border-dashed border-gold/30 rounded-sm p-6 text-center cursor-pointer hover:border-gold/60 transition-colors bg-cream-50"
                      >
                        <input {...getCurrInput()} />
                        {currentPhoto ? (
                          <p className="text-sm font-serif text-gold">✓ {currentPhoto.name}</p>
                        ) : (
                          <><Upload className="w-6 h-6 text-gold/60 mx-auto mb-2" />
                          <p className="text-sm font-serif text-ink-muted">Upload your current photo</p></>
                        )}
                      </div>
                    </Field>
                  </div>
                )}

                {/* ── Step 2: Memories ── */}
                {step === 2 && (
                  <div className="space-y-5">
                    <StepTitle>The Memories</StepTitle>
                    <Field label="Our favorite memory together ✨">
                      <textarea {...register('favoriteMemory')} rows={4}
                        className="vintage-input resize-none"
                        placeholder="That one memory that always makes you smile when you think of it…" />
                    </Field>
                    <Field label="The funniest moment 😂">
                      <textarea {...register('funniestMoment')} rows={3}
                        className="vintage-input resize-none"
                        placeholder="The story you'd tell at a reunion party…" />
                    </Field>
                    <Field label="Hidden confession / funny secret 🤫">
                      <textarea {...register('hiddenConfession')} rows={2}
                        className="vintage-input resize-none"
                        placeholder="Totally optional — I dare you 😏" />
                    </Field>
                  </div>
                )}

                {/* ── Step 3: Future ── */}
                {step === 3 && (
                  <div className="space-y-5">
                    <StepTitle>Words for My Future</StepTitle>
                    <Field label="Message for my future 💌">
                      <textarea {...register('messageForFuture')} rows={4}
                        className="vintage-input resize-none"
                        placeholder="What do you want me to remember? What are your wishes for me?" />
                    </Field>
                    <Field label="Your advice for me 🌟">
                      <textarea {...register('adviceForMe')} rows={3}
                        className="vintage-input resize-none"
                        placeholder="What wisdom would you pass on?" />
                    </Field>
                    <Field label="Where do you think I'll be in 10 years? 🔮">
                      <input {...register('whereIn10Years')} className="vintage-input"
                        placeholder="CEO? Astronaut? Happy farmer? Be creative." />
                    </Field>
                  </div>
                )}

                {/* ── Step 4: Signature ── */}
                {step === 4 && (
                  <div className="space-y-5">
                    <StepTitle>Sign Your Name</StepTitle>
                    <p className="font-serif text-ink-muted text-sm">Draw your signature or a little doodle — make it yours.</p>
                    <div className="border border-sepia/30 rounded-sm overflow-hidden bg-white">
                      <SignatureCanvas
                        ref={sigRef}
                        penColor="#2C1810"
                        canvasProps={{ className: 'w-full', height: 180, style: { background: '#FDFCF9' } }}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={clearSignature}
                        className="flex items-center gap-2 text-xs font-serif text-ink-muted border border-sepia/30 px-4 py-2 hover:border-red-400 hover:text-red-500 transition-colors rounded-sm">
                        <Trash2 className="w-3.5 h-3.5" /> Clear
                      </button>
                      <button type="button" onClick={saveSignature}
                        className="flex items-center gap-2 text-xs font-serif text-gold border border-gold/40 px-4 py-2 hover:bg-gold/10 transition-colors rounded-sm">
                        <Check className="w-3.5 h-3.5" /> Save Signature
                      </button>
                    </div>
                    {signatureData && (
                      <p className="text-xs text-green-600 font-serif flex items-center gap-1">
                        <Check className="w-3 h-3" /> Signature saved
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <button type="button" onClick={() => setStep(s => s - 1)}
                disabled={step === 0}
                className="flex items-center gap-2 font-serif text-sm text-ink-muted disabled:opacity-30 hover:text-gold transition-colors px-4 py-2"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              {step < STEPS.length - 1 ? (
                <button type="button" onClick={() => setStep(s => s + 1)}
                  className="btn-vintage bg-ink text-cream px-8 py-3 hover:bg-ink-light transition-all duration-300 flex items-center gap-2 text-sm rounded-sm">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button type="submit" disabled={loading}
                  className="btn-vintage bg-gold text-ink px-8 py-3 hover:bg-gold-light transition-all duration-300 flex items-center gap-2 text-sm rounded-sm disabled:opacity-60">
                  {loading ? 'Saving…' : '✦ Save Memory Forever'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

function StepTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="font-display text-ink text-2xl font-semibold">{children}</h2>
      <div className="h-px bg-gradient-to-r from-gold/50 to-transparent mt-2" />
    </div>
  );
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <label className="block font-serif text-sm text-ink-muted mb-1.5 tracking-wide">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1 font-serif">{error}</p>}
    </div>
  );
}

function SuccessScreen() {
  return (
    <div className="min-h-screen bg-parchment flex flex-col items-center justify-center px-4">
      <Confetti recycle={false} numberOfPieces={200} colors={['#C9962C', '#E8B84B', '#2D4A2D', '#2C1810']} />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="text-center max-w-md"
      >
        <div className="text-6xl mb-6">🎓</div>
        <h1 className="font-display text-4xl font-bold text-ink mb-4">Memory Saved!</h1>
        <p className="font-script text-gold text-xl mb-3">Thank you for this gift.</p>
        <p className="font-serif text-ink-muted mb-8">Your memory will be reviewed and added to the vault forever.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/memories" className="btn-vintage bg-ink text-cream px-8 py-3 rounded-sm font-serif text-sm">View Memories</a>
          <a href="/" className="btn-vintage border-ink text-ink px-8 py-3 rounded-sm font-serif text-sm">Back to Home</a>
        </div>
      </motion.div>
    </div>
  );
}
