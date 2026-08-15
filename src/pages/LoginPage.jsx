import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Wine, Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();

  const [mode, setMode]         = useState('login'); // 'login' | 'register' | 'reset'
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [message, setMessage]   = useState(null); // { type: 'error' | 'success', text }

  const clearMsg = () => setMessage(null);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage({ type: 'error', text: 'Preencha e-mail e senha.' });
      return;
    }

    setLoading(true);
    clearMsg();

    if (mode === 'login') {
      const { error } = await signInWithEmail(email, password);
      if (error) setMessage({ type: 'error', text: getErrorMsg(error.message) });
    } else {
      if (password.length < 6) {
        setMessage({ type: 'error', text: 'A senha deve ter ao menos 6 caracteres.' });
        setLoading(false);
        return;
      }
      const { error } = await signUpWithEmail(email, password);
      if (error) {
        setMessage({ type: 'error', text: getErrorMsg(error.message) });
      } else {
        setMessage({ type: 'success', text: 'Conta criada! Verifique seu e-mail para confirmar o cadastro.' });
        setMode('login');
      }
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    clearMsg();
    const { error } = await signInWithGoogle();
    if (error) {
      setMessage({ type: 'error', text: getErrorMsg(error.message) });
      setLoading(false);
    }
  };

  // Traduz erros comuns do Supabase para PT-BR
  const getErrorMsg = (msg) => {
    if (msg.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.';
    if (msg.includes('Email not confirmed'))        return 'Confirme seu e-mail antes de entrar.';
    if (msg.includes('User already registered'))    return 'Este e-mail já está cadastrado.';
    if (msg.includes('Password should be'))         return 'A senha deve ter ao menos 6 caracteres.';
    if (msg.includes('Unable to validate'))         return 'E-mail inválido.';
    return 'Ocorreu um erro. Tente novamente.';
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-5)', background: 'var(--bg-canvas)' }}>

      {/* Gradiente sutil de fundo */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 15%, rgba(184,141,34,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 85%, rgba(114,27,41,0.06) 0%, transparent 50%)', pointerEvents: 'none' }} />

      <div className="glass-card animate-fadeIn" style={{ maxWidth: '28rem', width: '100%', padding: 'var(--space-10)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', position: 'relative', background: '#FFFFFF', border: '1px solid rgba(184,141,34,0.25)', boxShadow: '0 25px 50px -12px rgba(35,20,25,0.12)' }}>

        {/* ── LOGO ── */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{ width: 'clamp(3.5rem,5vw,4rem)', height: 'clamp(3.5rem,5vw,4rem)', borderRadius: 'var(--radius-xl)', background: 'linear-gradient(135deg, #721B29, #4A0E1A)', border: '1px solid rgba(184,141,34,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(114,27,41,0.25)' }}>
            <Wine style={{ width: 'var(--text-2xl)', height: 'var(--text-2xl)', color: '#FDF8EB' }} />
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', color: 'var(--text-main)', lineHeight: 1.2, fontWeight: 700 }}>VinoVision AI</h1>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
              {mode === 'login'    ? 'Acesse seu Sommelier Exclusivo' :
               mode === 'register' ? 'Crie sua conta pessoal'         :
                                     'Redefinir senha de acesso'}
            </p>
          </div>
        </div>

        {/* ── TABS LOGIN / CADASTRO ── */}
        {mode !== 'reset' && (
          <div style={{ display: 'flex', background: '#F2EDE4', borderRadius: '99px', padding: '4px', gap: '4px' }}>
            {[['login', 'Entrar'], ['register', 'Criar Conta']].map(([m, label]) => {
              const isActive = mode === m;
              return (
                <button key={m} onClick={() => { setMode(m); clearMsg(); }}
                  style={{ flex: 1, padding: `var(--space-2) var(--space-4)`, borderRadius: '99px', fontSize: 'var(--text-sm)', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: isActive ? 'var(--wine-primary)' : 'transparent', color: isActive ? '#FFFFFF' : 'var(--text-secondary)', boxShadow: isActive ? '0 2px 8px rgba(114,27,41,0.2)' : 'none' }}>
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {/* ── FORMULÁRIO ── */}
        <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          {/* E-mail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <label style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'var(--gold-accent)' }}>
              E-mail
            </label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: 'var(--space-4)', top: '50%', transform: 'translateY(-50%)', width: 'var(--text-base)', height: 'var(--text-base)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com" required
                style={{ width: '100%', background: '#FAF8F5', border: '1px solid var(--border-clean)', borderRadius: 'var(--radius-md)', paddingLeft: 'calc(var(--space-4) + var(--text-base) + var(--space-2))', paddingRight: 'var(--space-4)', paddingTop: 'var(--space-3)', paddingBottom: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--text-main)', outline: 'none', transition: 'border-color 0.2s', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)' }}
                onFocus={e => e.target.style.borderColor = 'rgba(184,141,34,0.6)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-clean)'}
              />
            </div>
          </div>

          {/* Senha */}
          {mode !== 'reset' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'var(--gold-accent)' }}>Senha</label>
                {mode === 'login' && (
                  <button type="button" onClick={() => setMode('reset')}
                    style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                    Esqueci a senha
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: 'var(--space-4)', top: '50%', transform: 'translateY(-50%)', width: 'var(--text-base)', height: 'var(--text-base)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'} required
                  style={{ width: '100%', background: '#FAF8F5', border: '1px solid var(--border-clean)', borderRadius: 'var(--radius-md)', paddingLeft: 'calc(var(--space-4) + var(--text-base) + var(--space-2))', paddingRight: 'calc(var(--space-4) + var(--text-xl))', paddingTop: 'var(--space-3)', paddingBottom: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--text-main)', outline: 'none', transition: 'border-color 0.2s', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(184,141,34,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-clean)'}
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: 'var(--space-4)', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                  {showPass ? <EyeOff style={{ width: 'var(--text-base)', height: 'var(--text-base)' }} /> : <Eye style={{ width: 'var(--text-base)', height: 'var(--text-base)' }} />}
                </button>
              </div>
            </div>
          )}

          {/* Mensagem de erro/sucesso */}
          {message && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: message.type === 'error' ? '#FEF2F2' : '#ECFDF5', border: `1px solid ${message.type === 'error' ? '#FECACA' : '#A7F3D0'}` }}>
              {message.type === 'error'
                ? <AlertCircle style={{ width: 'var(--text-base)', height: 'var(--text-base)', color: '#DC2626', flexShrink: 0, marginTop: '2px' }} />
                : <CheckCircle style={{ width: 'var(--text-base)', height: 'var(--text-base)', color: '#059669', flexShrink: 0, marginTop: '2px' }} />}
              <p style={{ fontSize: 'var(--text-sm)', color: message.type === 'error' ? '#B91C1C' : '#047857', lineHeight: 1.6, fontWeight: 500 }}>
                {message.text}
              </p>
            </div>
          )}

          {/* Botão Principal */}
          <button type="submit" disabled={loading} className="btn-wine" style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1, marginTop: 'var(--space-2)' }}>
            {loading ? 'Aguarde…' :
             mode === 'login'    ? 'Entrar na Conta'      :
             mode === 'register' ? 'Criar Conta Gratuita' :
                                   'Enviar Link de Redefinição'}
          </button>
        </form>

        {/* ── DIVIDER ── */}
        {mode !== 'reset' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-clean)' }} />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>ou continue com</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-clean)' }} />
            </div>

            {/* ── BOTÃO GOOGLE ── */}
            <button onClick={handleGoogle} disabled={loading} className="btn-ghost" style={{ width: '100%', justifyContent: 'center', gap: 'var(--space-3)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar com Google
            </button>
          </>
        )}

        {/* Voltar ao login */}
        {mode === 'reset' && (
          <button type="button" onClick={() => { setMode('login'); clearMsg(); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', textDecoration: 'underline', textAlign: 'center' }}>
            ← Voltar ao login
          </button>
        )}

      </div>
    </div>
  );
}
