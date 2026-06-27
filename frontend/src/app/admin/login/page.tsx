'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Lock, GraduationCap, Eye, EyeOff } from 'lucide-react';
import { adminLogin, verifyToken } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<{ username: string; password: string }>();

  useEffect(() => {
    // If already logged in, redirect
    const token = localStorage.getItem('admin_token');
    if (token) {
      verifyToken().then(() => router.push('/admin')).catch(() => localStorage.removeItem('admin_token'));
    }
  }, [router]);

  const onSubmit = async (data: { username: string; password: string }) => {
    setLoading(true);
    try {
      const r = await adminLogin(data);
      localStorage.setItem('admin_token', r.data.token);
      toast.success(`Welcome back, ${r.data.admin.name}!`);
      router.push('/admin');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&q=20')", backgroundSize: 'cover' }} />
      <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink/90 to-forest/20" />

      {/* Floating ornaments */}
      {['✦','✧','◦'].map((c, i) => (
        <div key={i} className="absolute text-gold/10 text-6xl font-serif animate-float-slow"
          style={{ top: `${20 + i * 30}%`, left: `${10 + i * 40}%`, animationDelay: `${i * 2}s` }}>
          {c}
        </div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full border-2 border-gold/50 flex items-center justify-center mx-auto mb-4 animate-glow-pulse">
            <GraduationCap className="w-8 h-8 text-gold" />
          </div>
          <h1 className="font-display text-cream text-3xl font-bold">Admin Access</h1>
          <p className="font-serif text-cream/40 text-sm mt-1">Memory Vault · Owner Only</p>
        </div>

        <div className="bg-cream/5 backdrop-blur-sm border border-gold/20 rounded-sm p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block font-serif text-sm text-cream/60 mb-1.5 tracking-wide">Username</label>
              <input
                {...register('username', { required: 'Username required' })}
                className="w-full px-4 py-3 bg-cream/10 border border-cream/20 rounded-sm text-cream placeholder:text-cream/20 focus:outline-none focus:border-gold/60 font-serif text-sm"
                placeholder="admin"
                autoComplete="username"
              />
              {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block font-serif text-sm text-cream/60 mb-1.5 tracking-wide">Password</label>
              <div className="relative">
                <input
                  {...register('password', { required: 'Password required' })}
                  type={showPwd ? 'text' : 'password'}
                  className="w-full px-4 py-3 bg-cream/10 border border-cream/20 rounded-sm text-cream placeholder:text-cream/20 focus:outline-none focus:border-gold/60 font-serif text-sm pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPwd(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/30 hover:text-cream/60 transition-colors">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full btn-vintage bg-gold text-ink py-3.5 rounded-sm font-serif text-sm tracking-widest flex items-center justify-center gap-2 hover:bg-gold-light disabled:opacity-50 transition-all duration-300"
            >
              <Lock className="w-4 h-4" />
              {loading ? 'Verifying…' : 'Enter the Vault'}
            </button>
          </form>
        </div>

        <p className="text-center font-serif text-cream/20 text-xs mt-6">
          Secured with JWT authentication
        </p>
      </motion.div>
    </div>
  );
}
