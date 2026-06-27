'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Users, BookOpen, MessageSquare, Clock,
  Trash2, CheckCircle, Star, StarOff, LogOut, RefreshCw,
  Download, TrendingUp, Shield, Eye
} from 'lucide-react';
import {
  verifyToken, getAnalytics,
  adminGetMemories, adminUpdateMemory, adminDeleteMemory,
  adminGetTeachers, adminUpdateTeacher, adminDeleteTeacher,
  adminGetCapsules, adminUpdateCapsule,
  exportData,
} from '@/lib/api';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

type AdminTab = 'overview' | 'friends' | 'teachers' | 'capsules';

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [analytics, setAnalytics] = useState<any>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [capsules, setCapsules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { router.push('/admin/login'); return; }
    verifyToken()
      .then(() => setAuthChecked(true))
      .catch(() => { localStorage.removeItem('admin_token'); router.push('/admin/login'); });
  }, [router]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [analyticsRes, friendsRes, teachersRes, capsulesRes] = await Promise.all([
        getAnalytics(),
        adminGetMemories(),
        adminGetTeachers(),
        adminGetCapsules(),
      ]);
      setAnalytics(analyticsRes.data);
      setFriends(friendsRes.data);
      setTeachers(teachersRes.data);
      setCapsules(capsulesRes.data);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (authChecked) loadData(); }, [authChecked, loadData]);

  const logout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
    toast.success('Logged out');
  };

  const updateFriend = async (id: string, data: any) => {
    await adminUpdateMemory(id, data);
    setFriends(fs => fs.map(f => f._id === id ? { ...f, ...data } : f));
    toast.success('Updated!');
  };

  const deleteFriend = async (id: string) => {
    if (!confirm('Delete this memory permanently?')) return;
    await adminDeleteMemory(id);
    setFriends(fs => fs.filter(f => f._id !== id));
    toast.success('Deleted');
  };

  const updateTeacher = async (id: string, data: any) => {
    await adminUpdateTeacher(id, data);
    setTeachers(ts => ts.map(t => t._id === id ? { ...t, ...data } : t));
    toast.success('Updated!');
  };

  const deleteTeacher = async (id: string) => {
    if (!confirm('Delete this teacher memory?')) return;
    await adminDeleteTeacher(id);
    setTeachers(ts => ts.filter(t => t._id !== id));
    toast.success('Deleted');
  };

  const approveCapsule = async (id: string, status: string) => {
    await adminUpdateCapsule(id, { status });
    setCapsules(cs => cs.map(c => c._id === id ? { ...c, status } : c));
    toast.success('Updated!');
  };

  const handleExport = async () => {
    try {
      const r = await exportData();
      const blob = new Blob([JSON.stringify(r.data, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = 'graduation-memories-export.json'; a.click();
      toast.success('Export downloaded!');
    } catch {
      toast.error('Export failed');
    }
  };

  if (!authChecked) return <LoadingScreen />;

  const TABS = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'friends',  label: `Friends (${friends.length})`, icon: Users },
    { key: 'teachers', label: `Teachers (${teachers.length})`, icon: BookOpen },
    { key: 'capsules', label: `Capsules (${capsules.length})`, icon: Clock },
  ];

  const pendingFriends  = friends.filter(f => f.status === 'pending').length;
  const pendingTeachers = teachers.filter(t => t.status === 'pending').length;

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar */}
      <aside className="w-64 bg-ink text-cream flex flex-col fixed inset-y-0 left-0 z-40 shadow-2xl hidden md:flex">
        <div className="p-6 border-b border-gold/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-gold/50 flex items-center justify-center">
              <Shield className="w-4 h-4 text-gold" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-cream">Admin Panel</p>
              <p className="font-serif text-xs text-cream/40">Memory Vault</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key as AdminTab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-serif text-left transition-all ${
                tab === t.key ? 'bg-gold text-ink' : 'text-cream/60 hover:text-cream hover:bg-cream/5'
              }`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
              {t.key === 'friends' && pendingFriends > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingFriends}
                </span>
              )}
              {t.key === 'teachers' && pendingTeachers > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingTeachers}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gold/20 space-y-2">
          <button onClick={handleExport}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-serif text-cream/60 hover:text-cream transition-colors">
            <Download className="w-4 h-4" /> Export All Data
          </button>
          <button onClick={loadData}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-serif text-cream/60 hover:text-cream transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-serif text-red-400 hover:text-red-300 transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-64 min-h-screen">
        {/* Top bar */}
        <div className="bg-white border-b border-sepia/20 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <h1 className="font-display text-xl font-semibold text-ink capitalize">{tab === 'overview' ? 'Dashboard Overview' : tab}</h1>
          <div className="flex items-center gap-3">
            <a href="/" target="_blank" className="flex items-center gap-1.5 text-xs font-serif text-ink-muted hover:text-gold transition-colors border border-sepia/20 px-3 py-1.5 rounded-full">
              <Eye className="w-3.5 h-3.5" /> View Site
            </a>
            <button onClick={logout} className="md:hidden text-red-400"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="p-6">
          {/* ── Overview ── */}
          {tab === 'overview' && analytics && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Memories', value: analytics.friends.total, sub: `${analytics.friends.pending} pending`, color: 'bg-gold/10 border-gold/30', icon: Users },
                  { label: 'Teachers', value: analytics.teachers.total, sub: `${analytics.teachers.pending} pending`, color: 'bg-forest/10 border-forest/30', icon: BookOpen },
                  { label: 'Guestbook', value: analytics.guestbook.total, sub: `${analytics.guestbook.pending} pending`, color: 'bg-burgundy/10 border-burgundy/20', icon: MessageSquare },
                  { label: 'Avg Rating', value: `${analytics.avgFriendshipRating}/10`, sub: 'friendship score', color: 'bg-sage/20 border-sage/30', icon: Star },
                ].map(card => (
                  <motion.div key={card.label}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className={`border rounded-sm p-5 ${card.color}`}
                  >
                    <card.icon className="w-5 h-5 text-ink-muted/60 mb-3" />
                    <p className="font-display text-3xl font-bold text-ink">{card.value}</p>
                    <p className="font-display text-sm font-medium text-ink mt-0.5">{card.label}</p>
                    <p className="font-serif text-xs text-ink-muted mt-1">{card.sub}</p>
                  </motion.div>
                ))}
              </div>

              {/* Recent submissions */}
              <div className="bg-white border border-sepia/20 rounded-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-ink font-semibold">Recent Submissions (7 days)</h3>
                  <TrendingUp className="w-4 h-4 text-gold" />
                </div>
                {analytics.recentSubmissions.length === 0 ? (
                  <p className="font-serif text-ink-muted/50 text-sm">No submissions in the last 7 days.</p>
                ) : (
                  <div className="space-y-2">
                    {analytics.recentSubmissions.map((d: any) => (
                      <div key={d._id} className="flex items-center gap-3">
                        <span className="font-mono text-xs text-ink-muted/50 w-24">{d._id}</span>
                        <div className="flex-1 bg-sepia/10 rounded-full h-2">
                          <div
                            className="bg-gold rounded-full h-2 transition-all duration-500"
                            style={{ width: `${Math.min(100, (d.count / 10) * 100)}%` }}
                          />
                        </div>
                        <span className="font-serif text-sm text-ink w-8 text-right">{d.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick actions */}
              <div className="bg-ink rounded-sm p-6 text-cream">
                <h3 className="font-display font-semibold mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => setTab('friends')} className="btn-vintage border-gold/40 text-gold px-4 py-2 text-xs rounded-sm hover:bg-gold/10 transition-colors">
                    Review Pending ({analytics.friends.pending})
                  </button>
                  <button onClick={handleExport} className="btn-vintage border-cream/20 text-cream/70 px-4 py-2 text-xs rounded-sm hover:border-cream/40 transition-colors">
                    Export JSON
                  </button>
                  <a href="/memories" target="_blank" className="btn-vintage border-cream/20 text-cream/70 px-4 py-2 text-xs rounded-sm hover:border-cream/40 transition-colors">
                    View Public Site
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ── Friends ── */}
          {tab === 'friends' && (
            <div>
              <div className="flex items-center gap-2 mb-4 text-sm font-serif text-ink-muted">
                <span className="bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs">
                  {pendingFriends} pending approval
                </span>
              </div>
              <div className="space-y-3">
                {loading ? Array(5).fill(0).map((_, i) => <div key={i} className="h-20 shimmer rounded-sm" />) :
                friends.map(f => (
                  <div key={f._id} className={`bg-white border rounded-sm p-4 flex items-center gap-4 ${f.status === 'pending' ? 'border-amber-200 bg-amber-50/30' : 'border-sepia/20'}`}>
                    {f.bestPhotoUrl ? (
                      <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-sepia/20">
                        <Image src={f.bestPhotoUrl} alt={f.fullName} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                        <span className="font-display text-gold text-lg">{f.fullName?.[0]}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-display text-ink font-semibold text-sm">{f.fullName}</p>
                        <StatusBadge status={f.status} />
                        {f.featured && <span className="text-gold text-xs">⭐ Featured</span>}
                      </div>
                      <p className="font-serif text-xs text-ink-muted/60 mt-0.5 truncate">{f.favoriteMemory}</p>
                      <p className="font-mono text-xs text-ink-muted/30 mt-0.5">{formatDistanceToNow(new Date(f.submittedAt), { addSuffix: true })}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
                      {f.status === 'pending' && (
                        <AdminBtn icon={CheckCircle} label="Approve" color="text-green-600" onClick={() => updateFriend(f._id, { status: 'approved' })} />
                      )}
                      {f.status === 'approved' && (
                        <AdminBtn icon={f.featured ? StarOff : Star} label={f.featured ? 'Unfeature' : 'Feature'} color="text-gold" onClick={() => updateFriend(f._id, { featured: !f.featured, status: 'featured' })} />
                      )}
                      <AdminBtn icon={Trash2} label="Delete" color="text-red-500" onClick={() => deleteFriend(f._id)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Teachers ── */}
          {tab === 'teachers' && (
            <div className="space-y-3">
              {loading ? Array(4).fill(0).map((_, i) => <div key={i} className="h-20 shimmer rounded-sm" />) :
              teachers.map(t => (
                <div key={t._id} className={`bg-white border rounded-sm p-4 flex items-center gap-4 ${t.status === 'pending' ? 'border-amber-200 bg-amber-50/30' : 'border-sepia/20'}`}>
                  {t.photoUrl ? (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-sepia/20">
                      <Image src={t.photoUrl} alt={t.teacherName} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-forest/10 border border-forest/20 flex items-center justify-center flex-shrink-0">
                      <span className="font-display text-forest text-lg">{t.teacherName?.[0]}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-display text-ink font-semibold text-sm">{t.teacherName}</p>
                      <StatusBadge status={t.status} />
                    </div>
                    {t.subjectTaught && <p className="font-serif text-xs text-gold/70">{t.subjectTaught}</p>}
                    <p className="font-serif text-xs text-ink-muted/60 truncate mt-0.5">{t.messageBlesssing}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {t.status === 'pending' && (
                      <AdminBtn icon={CheckCircle} label="Approve" color="text-green-600" onClick={() => updateTeacher(t._id, { status: 'approved' })} />
                    )}
                    <AdminBtn icon={Trash2} label="Delete" color="text-red-500" onClick={() => deleteTeacher(t._id)} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Capsules ── */}
          {tab === 'capsules' && (
            <div className="space-y-3">
              {loading ? Array(4).fill(0).map((_, i) => <div key={i} className="h-20 shimmer rounded-sm" />) :
              capsules.map(c => (
                <div key={c._id} className={`bg-white border rounded-sm p-4 ${c.status === 'pending' ? 'border-amber-200 bg-amber-50/30' : 'border-sepia/20'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-display text-ink font-semibold text-sm">{c.authorName}</p>
                        <StatusBadge status={c.status} />
                      </div>
                      <p className="font-serif text-xs text-ink-muted/60 mt-1 line-clamp-2">{c.message}</p>
                      <p className="font-mono text-xs text-ink-muted/40 mt-1">
                        Unlock: {new Date(c.unlockDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      {c.status === 'pending' && (
                        <AdminBtn icon={CheckCircle} label="Approve" color="text-green-600" onClick={() => approveCapsule(c._id, 'approved')} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:  'bg-amber-100 text-amber-700 border-amber-200',
    approved: 'bg-green-100 text-green-700 border-green-200',
    featured: 'bg-gold/10 text-yellow-700 border-gold/30',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-serif ${map[status] || ''}`}>
      {status}
    </span>
  );
}

function AdminBtn({ icon: Icon, label, color, onClick }: any) {
  return (
    <button onClick={onClick} title={label}
      className={`p-1.5 rounded-sm border border-transparent hover:border-sepia/20 transition-all ${color}`}>
      <Icon className="w-4 h-4" />
    </button>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-ink flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-gold border-t-transparent animate-spin mx-auto mb-4" />
        <p className="font-serif text-cream/50 text-sm">Verifying access…</p>
      </div>
    </div>
  );
}
