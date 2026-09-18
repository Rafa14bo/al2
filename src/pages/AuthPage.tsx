import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Phone, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase';

type Mode = 'login' | 'signup' | 'reset' | 'newPassword';

export function AuthPage() {
  const { signIn, signUp, signInWithGoogle, resetPassword, updatePassword, user, isRecovery } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<Mode>(searchParams.get('mode') === 'signup' ? 'signup' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isRecovery) {
      setMode('newPassword');
    }
  }, [isRecovery]);

  useEffect(() => {
    if (user && !isRecovery) navigate('/');
  }, [user, isRecovery, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.includes('Invalid credentials') ? 'E-mail ou senha incorretos.' : error);
        } else {
          // Check if user is admin — redirect to admin panel, otherwise home
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .maybeSingle();
            if (profile?.role === 'admin') {
              showToast('Bem-vindo ao painel administrativo!', 'success');
              navigate('/admin');
            } else {
              showToast('Bem-vindo de volta!', 'success');
              navigate('/');
            }
          } else {
            showToast('Bem-vindo de volta!', 'success');
            navigate('/');
          }
        }
      } else if (mode === 'signup') {
        if (password.length < 6) {
          setError('A senha deve ter pelo menos 6 caracteres.');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, name, phone);
        if (error) {
          setError(error.includes('already') ? 'Este e-mail já está cadastrado.' : error);
        } else {
          showToast('Conta criada com sucesso!', 'success');
          navigate('/');
        }
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email);
        if (error) {
          setError(error);
        } else {
          showToast('Instruções enviadas para seu e-mail.', 'success');
          setMode('login');
        }
      } else if (mode === 'newPassword') {
        if (password.length < 6) {
          setError('A senha deve ter pelo menos 6 caracteres.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('As senhas não coincidem.');
          setLoading(false);
          return;
        }
        const { error } = await updatePassword(password);
        if (error) {
          setError(error);
        } else {
          showToast('Senha alterada com sucesso!', 'success');
          navigate('/');
        }
      }
    } catch {
      setError('Algo deu errado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    const { error } = await signInWithGoogle();
    if (error) setError(error);
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <img src="/alisson1.png" alt="Alisson Lanches" className="h-20 w-auto rounded-xl mx-auto mb-3 transition-transform duration-300 hover:scale-105" />
          <h1 className="font-display text-2xl font-bold text-black transition-all">
            {mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar conta' : mode === 'newPassword' ? 'Nova senha' : 'Recuperar senha'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {mode === 'login' ? 'Acesse sua conta para acompanhar pedidos' : mode === 'signup' ? 'Crie sua conta e peça com facilidade' : mode === 'newPassword' ? 'Escolha uma nova senha para sua conta' : 'Enviaremos instruções para seu e-mail'}
          </p>
        </div>

        <div className="card p-6 space-y-4 shadow-md">
          {mode !== 'reset' && mode !== 'newPassword' && (
            <div className="flex bg-gray-100 rounded-xl p-1 mb-2">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${mode === 'login' ? 'bg-white text-brand-red shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${mode === 'signup' ? 'bg-white text-brand-red shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Criar conta
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700">Nome</label>
                  <div className="relative mt-1">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Seu nome" className="input-field pl-10" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Telefone</label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="(00) 00000-0000" className="input-field pl-10" />
                  </div>
                </div>
              </>
            )}

            {mode !== 'newPassword' && (
              <div>
                <label className="text-sm font-medium text-gray-700">E-mail</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="seu@email.com" className="input-field pl-10" />
                </div>
              </div>
            )}

            {mode !== 'reset' && (
              <div>
                <label className="text-sm font-medium text-gray-700">{mode === 'newPassword' ? 'Nova senha' : 'Senha'}</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••" className="input-field pl-10 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'newPassword' && (
              <div>
                <label className="text-sm font-medium text-gray-700">Confirmar nova senha</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="••••••" className="input-field pl-10" />
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl p-3 border border-red-100 animate-fade-in">{error}</p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Aguarde...
                </span>
              ) : (
                <>
                  {mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar conta' : mode === 'newPassword' ? 'Salvar nova senha' : 'Enviar instruções'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {mode === 'login' && (
              <button type="button" onClick={() => switchMode('reset')} className="w-full text-sm text-gray-500 hover:text-brand-red text-center transition-colors">
                Esqueceu a senha?
              </button>
            )}
          </form>

          {(mode === 'login' || mode === 'signup') && (
            <div className="mt-4">
              <div className="flex items-center gap-3">
                <div className="h-px bg-gray-200 flex-1" />
                <span className="text-xs text-gray-400">ou</span>
                <div className="h-px bg-gray-200 flex-1" />
              </div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                  <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3.02h3.88c2.27-2.09 3.57-5.17 3.57-8.84z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.88-3.02c-1.08.72-2.46 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.12A12 12 0 0 0 12 24z"/>
                  <path fill="#FBBC05" d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.61H1.26a12 12 0 0 0 0 10.78l4.01-3.12z"/>
                  <path fill="#EA4335" d="M12 4.75c1.76 0 3.35.61 4.6 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.26 6.61l4.01 3.12C6.22 6.87 8.87 4.75 12 4.75z"/>
                </svg>
                Continuar com Google
              </button>
            </div>
          )}

          {mode === 'reset' && (
            <div className="text-center text-sm text-gray-500">
              <button onClick={() => switchMode('login')} className="font-semibold text-brand-red hover:underline">Voltar para login</button>
            </div>
          )}
        </div>

        <p className="text-center mt-4">
          <Link to="/cardapio" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Continuar sem conta →</Link>
        </p>
      </div>
    </div>
  );
}
