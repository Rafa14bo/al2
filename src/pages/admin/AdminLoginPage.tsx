import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase';

export function AdminLoginPage() {
  const { signIn, user, isAdmin, loading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [justSignedIn, setJustSignedIn] = useState(false);

  useEffect(() => {
    if (!loading && user && isAdmin && justSignedIn) {
      showToast('Bem-vindo ao painel!', 'success');
      navigate('/admin');
    }
  }, [user, isAdmin, loading, justSignedIn, navigate, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const { error } = await signIn(email, password);
    if (error) {
      setError(error.includes('Invalid credentials') ? 'E-mail ou senha incorretos.' : error);
      setSubmitting(false);
      return;
    }

    // Fetch profile directly — signIn already loaded it but isAdmin in this closure is stale
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profile?.role === 'admin') {
        setJustSignedIn(true);
      } else {
        setError('Esta conta não tem permissão de administrador.');
        await supabase.auth.signOut();
        setSubmitting(false);
      }
    } else {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <img src="/alisson1.png" alt="Alisson Lanches" className="h-20 w-auto rounded-xl mx-auto mb-4" />
          <div className="inline-flex items-center gap-2 text-brand-yellow mb-2">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-semibold">Painel Administrativo</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Acesso Restrito</h1>
          <p className="text-sm text-gray-400 mt-1">Use suas credenciais de administrador</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur rounded-2xl p-6 space-y-4 border border-white/10">
          <div>
            <label className="text-sm font-medium text-gray-300">E-mail</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@alissonlanches.com"
                className="w-full bg-white/10 text-white placeholder-gray-500 rounded-xl pl-10 pr-4 py-3 border border-white/10 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300">Senha</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-white/10 text-white placeholder-gray-500 rounded-xl pl-10 pr-10 py-3 border border-white/10 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 rounded-xl p-2 border border-red-500/20">{error}</p>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Verificando...' : 'Entrar no painel'}
          </button>
        </form>

        <div className="text-center mt-4">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar ao site
          </Link>
        </div>
      </div>
    </div>
  );
}
