import React, { useState, useRef, useEffect } from 'react';
import { Wine, Camera, Bookmark, Sparkles, Compass, LogOut, ShieldCheck, Crown, Key, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar({ activeTab, setActiveTab, cellarCount }) {
  const { user, role, isAdmin, isPremium, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showGroqModal, setShowGroqModal] = useState(false);
  const [groqKey, setGroqKey] = useState('');
  const [hasGroqKey, setHasGroqKey] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('vinovision_groq_key') || import.meta.env.VITE_GROQ_API_KEY || '';
    setGroqKey(savedKey);
    setHasGroqKey(!!savedKey.trim());
  }, []);

  const handleSaveKey = () => {
    if (groqKey.trim()) {
      localStorage.setItem('vinovision_groq_key', groqKey.trim());
      setHasGroqKey(true);
    } else {
      localStorage.removeItem('vinovision_groq_key');
      setHasGroqKey(false);
    }
    setShowGroqModal(false);
  };

  // Fecha o menu ao clicar fora usando ref
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showUserMenu]);

  const NAV = [
    { id: 'scanner', Icon: Camera,   label: 'Escanear'  },
    { id: 'samples', Icon: Compass,  label: 'Biblioteca' },
    { id: 'cellar',  Icon: Bookmark, label: 'Adega'      },
  ];

  if (isAdmin) {
    NAV.push({ id: 'admin', Icon: ShieldCheck, label: 'Painel Admin' });
  }

  const initials = user?.email?.substring(0, 2).toUpperCase() || 'VV';
  const emailShort = user?.email?.length > 24
    ? user.email.substring(0, 22) + '…'
    : user?.email;

  const getRoleBadge = () => {
    switch (role) {
      case 'ADMIN':
        return { label: 'ADMIN', color: '#f3e5ab', bg: 'rgba(212,175,55,0.2)', border: 'rgba(212,175,55,0.4)', Icon: ShieldCheck };
      case 'USER_PREMIUM':
        return { label: 'PREMIUM', color: '#6ee7b7', bg: 'rgba(16,185,129,0.2)', border: 'rgba(16,185,129,0.4)', Icon: Crown };
      default:
        return { label: 'COMMUM', color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.06)', border: 'var(--border-clean)', Icon: null };
    }
  };

  const roleBadge = getRoleBadge();
  const RoleBadgeIcon = roleBadge.Icon;

  const handleLogout = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowUserMenu(false);
    await signOut();
  };

  return (
    <>
      <header style={{ position: 'sticky', top: 0, zIndex: 100, padding: `var(--space-3) var(--space-6)`, background: 'rgba(11,5,8,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-clean)' }}>
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between" style={{ gap: 'var(--space-4)' }}>

          {/* ── LOGO ── */}
          <div onClick={() => setActiveTab('scanner')} className="flex items-center" style={{ gap: 'var(--space-3)', cursor: 'pointer' }}>
            <div style={{ width: 'clamp(2rem,3.5vw,2.5rem)', height: 'clamp(2rem,3.5vw,2.5rem)', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #800e26, #3b0911)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Wine style={{ width: 'var(--text-lg)', height: 'var(--text-lg)', color: 'var(--gold-light)' }} />
            </div>
            <div>
              <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'white', letterSpacing: '-0.01em' }}>VinoVision</span>
                <span style={{ fontSize: 'calc(var(--text-xs) * 0.9)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', padding: `var(--space-1) var(--space-2)`, borderRadius: 'var(--radius-sm)', background: 'rgba(128,14,38,0.6)', color: 'var(--gold-light)', border: '1px solid rgba(255,255,255,0.1)' }}>AI</span>
              </div>
              <p className="hidden sm:block" style={{ fontSize: 'calc(var(--text-xs) * 0.9)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Sommelier Inteligente
              </p>
            </div>
          </div>

          {/* ── NAV DESKTOP ── */}
          <nav className="hidden sm:flex items-center" style={{ background: 'rgba(255,255,255,0.05)', padding: 'var(--space-1)', borderRadius: '99px', border: '1px solid var(--border-clean)', gap: 'var(--space-1)' }}>
            {NAV.map(({ id, Icon, label }) => (
              <button key={id} type="button" onClick={() => setActiveTab(id)} className="flex items-center relative font-semibold transition-all"
                style={{ gap: 'var(--space-2)', padding: `var(--space-2) var(--space-4)`, borderRadius: '99px', fontSize: 'var(--text-sm)', border: 'none', cursor: 'pointer', background: activeTab === id ? 'var(--wine-primary)' : 'transparent', color: activeTab === id ? 'var(--gold-light)' : 'var(--text-muted)' }}
              >
                <Icon style={{ width: 'var(--text-base)', height: 'var(--text-base)' }} />
                {label}
                {id === 'cellar' && cellarCount > 0 && (
                  <span style={{ width: 'var(--text-lg)', height: 'var(--text-lg)', borderRadius: '99px', background: 'var(--gold-accent)', color: '#0b0508', fontSize: 'calc(var(--text-xs) * 0.9)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cellarCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* ── BOTÕES DIREITA ── */}
          <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
            
            {/* Configurar Chave Groq */}
            <button
              type="button"
              onClick={() => setShowGroqModal(true)}
              className="flex items-center font-medium"
              style={{
                gap: 'var(--space-1)',
                padding: `var(--space-2) var(--space-3)`,
                borderRadius: '99px',
                fontSize: 'var(--text-xs)',
                border: `1px solid ${hasGroqKey ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
                background: hasGroqKey ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                color: hasGroqKey ? '#6ee7b7' : '#f87171',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title={hasGroqKey ? 'API Groq Conectada' : 'Chave Groq Ausente'}
            >
              <Key style={{ width: 'var(--text-sm)', height: 'var(--text-sm)', color: hasGroqKey ? '#6ee7b7' : 'var(--gold-accent)' }} />
              <span className="hidden md:inline">{hasGroqKey ? 'Groq Ativo' : 'Sem Chave Groq'}</span>
            </button>

            <button type="button" onClick={() => setActiveTab('scanner')} className="btn-gold hidden sm:inline-flex">
              <Sparkles style={{ width: 'var(--text-sm)', height: 'var(--text-sm)' }} />
              Escanear
            </button>

            {/* Avatar do usuário com ref */}
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowUserMenu(v => !v)}
                style={{
                  width: 'clamp(2.2rem,3.8vw,2.6rem)',
                  height: 'clamp(2.2rem,3.8vw,2.6rem)',
                  borderRadius: '99px',
                  background: isAdmin
                    ? 'linear-gradient(135deg, #d4af37, #800e26)'
                    : isPremium
                    ? 'linear-gradient(135deg, #10b981, #065f46)'
                    : 'linear-gradient(135deg, #3b0911, #800e26)',
                  border: `2px solid ${roleBadge.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 'var(--text-xs)',
                  color: 'white',
                  flexShrink: 0
                }}
                title={user?.email}
              >
                {initials}
              </button>

              {/* Dropdown do usuário */}
              {showUserMenu && (
                <div className="glass-card animate-fadeIn" style={{ position: 'absolute', top: 'calc(100% + var(--space-2))', right: 0, minWidth: '15rem', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', zIndex: 200, boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
                  {/* Info usuário */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--border-clean)' }}>
                    <div style={{ width: 'var(--text-2xl)', height: 'var(--text-2xl)', borderRadius: '99px', background: 'linear-gradient(135deg, #800e26, #d4af37)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 'var(--text-xs)', color: 'white', flexShrink: 0 }}>
                      {initials}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emailShort}</p>
                      
                      {/* Badge da Role no perfil */}
                      <span className="inline-flex items-center" style={{ gap: '4px', padding: '2px 8px', borderRadius: '99px', fontSize: 'calc(var(--text-xs) * 0.85)', fontWeight: 700, background: roleBadge.bg, border: `1px solid ${roleBadge.border}`, color: roleBadge.color, marginTop: '2px' }}>
                        {RoleBadgeIcon && <RoleBadgeIcon style={{ width: '10px', height: '10px' }} />}
                        {roleBadge.label}
                      </span>
                    </div>
                  </div>

                  {/* Adega count */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    <Bookmark style={{ width: 'var(--text-base)', height: 'var(--text-base)', color: 'var(--gold-accent)' }} />
                    {cellarCount} vinho{cellarCount !== 1 ? 's' : ''} na adega
                  </div>

                  {/* Atalho Painel Admin para ADMIN */}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => { setActiveTab('admin'); setShowUserMenu(false); }}
                      className="flex items-center"
                      style={{ gap: 'var(--space-2)', padding: `var(--space-2) var(--space-3)`, borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: 600, background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.3)', color: 'var(--gold-light)', cursor: 'pointer' }}
                    >
                      <ShieldCheck style={{ width: 'var(--text-base)', height: 'var(--text-base)', color: 'var(--gold-accent)' }} />
                      Painel Administrativo
                    </button>
                  )}

                  {/* Sair */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center"
                    style={{ gap: 'var(--space-2)', padding: `var(--space-2) var(--space-3)`, borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: 600, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
                  >
                    <LogOut style={{ width: 'var(--text-base)', height: 'var(--text-base)' }} />
                    Sair da conta
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── NAV MOBILE ── */}
        <div className="flex sm:hidden justify-around flex-wrap" style={{ marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-clean)', gap: 'var(--space-1)' }}>
          {NAV.map(({ id, Icon, label }) => (
            <button key={id} type="button" onClick={() => setActiveTab(id)} className="flex items-center font-semibold"
              style={{ gap: 'var(--space-1)', padding: `var(--space-1) var(--space-3)`, borderRadius: '99px', fontSize: 'var(--text-xs)', border: 'none', cursor: 'pointer', background: activeTab === id ? 'var(--wine-primary)' : 'transparent', color: activeTab === id ? 'var(--gold-light)' : 'var(--text-muted)' }}
            >
              <Icon style={{ width: 'var(--text-base)', height: 'var(--text-base)' }} />
              {label}{id === 'cellar' && cellarCount > 0 ? ` (${cellarCount})` : ''}
            </button>
          ))}
        </div>
      </header>

      {/* ── MODAL GROQ API KEY ── */}
      {showGroqModal && (
        <div className="modal-overlay">
          <div className="glass-card relative animate-fadeIn" style={{ maxWidth: '26rem', width: '100%', padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button type="button" onClick={() => setShowGroqModal(false)} style={{ position: 'absolute', top: 'var(--space-4)', right: 'var(--space-4)', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '99px', width: 'var(--text-2xl)', height: 'var(--text-2xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X style={{ width: 'var(--text-base)', height: 'var(--text-base)' }} />
            </button>

            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{ width: 'clamp(2.5rem,4vw,3rem)', height: 'clamp(2.5rem,4vw,3rem)', borderRadius: 'var(--radius-md)', background: 'var(--wine-primary)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Key style={{ width: 'var(--text-xl)', height: 'var(--text-xl)', color: 'var(--gold-accent)' }} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'white' }}>IA Groq Vision Real</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                Insira sua chave de API da Groq (<code>gsk_…</code>) para habilitar o reconhecimento visual inteligente de qualquer foto de rótulo em tempo real.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'var(--gold-accent)' }}>
                Chave da API Groq
              </label>
              <input
                type="password" placeholder="gsk_…"
                value={groqKey} onChange={e => setGroqKey(e.target.value)}
                style={{ width: '100%', background: 'rgba(11,5,8,0.8)', border: '1px solid var(--border-clean)', borderRadius: 'var(--radius-md)', padding: `var(--space-3) var(--space-4)`, fontSize: 'var(--text-sm)', color: 'white', outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = 'rgba(212,175,55,0.6)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-clean)'}
              />
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                Crie uma chave grátis em <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{ color: 'var(--gold-light)', textDecoration: 'underline' }}>console.groq.com/keys</a>
              </p>
            </div>

            <div className="flex justify-end" style={{ gap: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-clean)' }}>
              <button type="button" onClick={() => setShowGroqModal(false)} className="btn-ghost">Cancelar</button>
              <button type="button" onClick={handleSaveKey} className="btn-gold">
                <CheckCircle2 style={{ width: 'var(--text-base)', height: 'var(--text-base)' }} />
                Salvar Chave
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
