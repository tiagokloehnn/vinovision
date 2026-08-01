import React, { useState } from 'react';
import { Wine, Camera, Bookmark, Sparkles, Compass, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar({ activeTab, setActiveTab, cellarCount }) {
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const NAV = [
    { id: 'scanner', Icon: Camera,   label: 'Escanear'  },
    { id: 'samples', Icon: Compass,  label: 'Biblioteca' },
    { id: 'cellar',  Icon: Bookmark, label: 'Adega'      },
  ];

  // Pega as iniciais do e-mail para o avatar
  const initials = user?.email?.substring(0, 2).toUpperCase() || 'VV';
  const emailShort = user?.email?.length > 24
    ? user.email.substring(0, 22) + '…'
    : user?.email;

  return (
    <>
      <header style={{ position: 'sticky', top: 0, zIndex: 50, padding: `var(--space-3) var(--space-6)`, background: 'rgba(11,5,8,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-clean)' }}>
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
              <button key={id} onClick={() => setActiveTab(id)} className="flex items-center relative font-semibold transition-all"
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
          <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
            <button onClick={() => setActiveTab('scanner')} className="btn-gold hidden sm:inline-flex">
              <Sparkles style={{ width: 'var(--text-sm)', height: 'var(--text-sm)' }} />
              Escanear
            </button>

            {/* Avatar do usuário */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowUserMenu(v => !v)}
                style={{ width: 'clamp(2rem,3.5vw,2.5rem)', height: 'clamp(2rem,3.5vw,2.5rem)', borderRadius: '99px', background: 'linear-gradient(135deg, #800e26, #d4af37)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 700, fontSize: 'var(--text-xs)', color: 'white', flexShrink: 0 }}
                title={user?.email}
              >
                {initials}
              </button>

              {/* Dropdown do usuário */}
              {showUserMenu && (
                <div className="glass-card animate-fadeIn" style={{ position: 'absolute', top: 'calc(100% + var(--space-2))', right: 0, minWidth: '14rem', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', zIndex: 100 }}>
                  {/* Info usuário */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--border-clean)' }}>
                    <div style={{ width: 'var(--text-2xl)', height: 'var(--text-2xl)', borderRadius: '99px', background: 'linear-gradient(135deg, #800e26, #d4af37)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 'var(--text-xs)', color: 'white', flexShrink: 0 }}>
                      {initials}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emailShort}</p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Conta ativa</p>
                    </div>
                  </div>

                  {/* Adega count */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    <Bookmark style={{ width: 'var(--text-base)', height: 'var(--text-base)', color: 'var(--gold-accent)' }} />
                    {cellarCount} vinho{cellarCount !== 1 ? 's' : ''} na adega
                  </div>

                  {/* Sair */}
                  <button
                    onClick={() => { signOut(); setShowUserMenu(false); }}
                    className="flex items-center"
                    style={{ gap: 'var(--space-2)', padding: `var(--space-2) var(--space-3)`, borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: 600, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
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
        <div className="flex sm:hidden justify-around" style={{ marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-clean)' }}>
          {NAV.map(({ id, Icon, label }) => (
            <button key={id} onClick={() => setActiveTab(id)} className="flex items-center font-semibold"
              style={{ gap: 'var(--space-1)', padding: `var(--space-1) var(--space-3)`, borderRadius: '99px', fontSize: 'var(--text-xs)', border: 'none', cursor: 'pointer', background: activeTab === id ? 'var(--wine-primary)' : 'transparent', color: activeTab === id ? 'var(--gold-light)' : 'var(--text-muted)' }}
            >
              <Icon style={{ width: 'var(--text-base)', height: 'var(--text-base)' }} />
              {label}{id === 'cellar' && cellarCount > 0 ? ` (${cellarCount})` : ''}
            </button>
          ))}
        </div>
      </header>

      {/* Fecha o menu ao clicar fora */}
      {showUserMenu && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setShowUserMenu(false)} />
      )}
    </>
  );
}
