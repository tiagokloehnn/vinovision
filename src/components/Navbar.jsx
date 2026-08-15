import React, { useState, useRef, useEffect } from 'react';
import { Wine, Camera, Bookmark, Sparkles, LogOut, ShieldCheck, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar({ activeTab, setActiveTab, cellarCount }) {
  const { user, role, isAdmin, isPremium, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

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
    { id: 'scanner', Icon: Camera,   label: 'Escanear' },
    { id: 'cellar',  Icon: Bookmark, label: 'Adega'    },
  ];

  if (isAdmin) {
    NAV.push({ id: 'admin', Icon: ShieldCheck, label: 'Admin' });
  }

  const initials = user?.email?.substring(0, 2).toUpperCase() || 'VV';
  const emailShort = user?.email?.length > 24
    ? user.email.substring(0, 22) + '…'
    : user?.email;

  const getRoleBadge = () => {
    switch (role) {
      case 'ADMIN':
        return { label: 'ADMIN', color: '#8C6810', bg: '#FDF8EB', border: 'rgba(184,141,34,0.3)', Icon: ShieldCheck };
      case 'USER_PREMIUM':
        return { label: 'PREMIUM', color: '#065F46', bg: '#ECFDF5', border: 'rgba(16,185,129,0.3)', Icon: Crown };
      default:
        return { label: 'COMUM', color: 'var(--text-muted)', bg: 'rgba(0,0,0,0.04)', border: 'var(--border-clean)', Icon: null };
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
    <header style={{ position: 'sticky', top: 0, zIndex: 100, padding: `var(--space-3) var(--space-4)`, background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-clean)', boxShadow: '0 4px 20px -5px rgba(35, 20, 25, 0.05)' }}>
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between" style={{ gap: 'var(--space-3)' }}>

        {/* ── LOGO ── */}
        <div onClick={() => setActiveTab('scanner')} className="flex items-center" style={{ gap: 'var(--space-3)', cursor: 'pointer' }}>
          <div style={{ width: 'clamp(2.25rem,3.5vw,2.75rem)', height: 'clamp(2.25rem,3.5vw,2.75rem)', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #721B29 0%, #4A0E1A 100%)', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(114,27,41,0.25)' }}>
            <Wine style={{ width: 'var(--text-lg)', height: 'var(--text-lg)', color: '#FDF8EB' }} />
          </div>
          <div>
            <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>VinoVision</span>
              <span style={{ fontSize: 'calc(var(--text-xs) * 0.9)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', padding: `2px 8px`, borderRadius: 'var(--radius-sm)', background: 'var(--wine-light)', color: 'var(--wine-primary)', border: '1px solid var(--wine-border)' }}>AI</span>
            </div>
            <p className="hidden sm:block" style={{ fontSize: 'calc(var(--text-xs) * 0.95)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              Sommelier Inteligente
            </p>
          </div>
        </div>

        {/* ── NAV DESKTOP ── */}
        <nav className="hidden sm:flex items-center" style={{ background: '#F2EDE4', padding: '4px', borderRadius: '99px', border: '1px solid rgba(0,0,0,0.06)', gap: '4px' }}>
          {NAV.map(({ id, Icon, label }) => {
            const isActive = activeTab === id;
            return (
              <button key={id} type="button" onClick={() => setActiveTab(id)} className="flex items-center relative font-semibold transition-all"
                style={{
                  gap: 'var(--space-2)',
                  padding: `var(--space-2) var(--space-5)`,
                  borderRadius: '99px',
                  fontSize: 'var(--text-sm)',
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? 'var(--wine-primary)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                  boxShadow: isActive ? '0 4px 12px rgba(114,27,41,0.25)' : 'none',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <Icon style={{ width: 'var(--text-base)', height: 'var(--text-base)', color: isActive ? '#FDF8EB' : 'inherit' }} />
                {label}
                {id === 'cellar' && cellarCount > 0 && (
                  <span style={{ minWidth: '1.25rem', height: '1.25rem', padding: '0 5px', borderRadius: '99px', background: isActive ? '#B88D22' : 'var(--wine-primary)', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cellarCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* ── BOTÕES DIREITA ── */}
        <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
          <button type="button" onClick={() => setActiveTab('scanner')} className="btn-gold hidden sm:inline-flex">
            <Sparkles style={{ width: 'var(--text-sm)', height: 'var(--text-sm)' }} />
            Escanear
          </button>

          {/* Avatar do usuário */}
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowUserMenu(v => !v)}
              style={{
                width: 'clamp(2.2rem,3.8vw,2.75rem)',
                height: 'clamp(2.2rem,3.8vw,2.75rem)',
                borderRadius: '99px',
                background: isAdmin
                  ? 'linear-gradient(135deg, #B88D22, #721B29)'
                  : isPremium
                  ? 'linear-gradient(135deg, #10B981, #065F46)'
                  : 'linear-gradient(135deg, #721B29, #4A0E1A)',
                border: `2px solid #FFFFFF`,
                boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 'var(--text-xs)',
                color: '#FFFFFF',
                flexShrink: 0
              }}
              title={user?.email}
            >
              {initials}
            </button>

            {/* Dropdown do usuário */}
            {showUserMenu && (
              <div className="glass-card animate-fadeIn" style={{ position: 'absolute', top: 'calc(100% + var(--space-2))', right: 0, width: 'min(18rem, calc(100vw - 2rem))', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', zIndex: 200, background: '#FFFFFF', boxShadow: '0 20px 45px -10px rgba(35,20,25,0.15)', border: '1px solid rgba(0,0,0,0.08)' }}>
                {/* Info usuário */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--border-clean)' }}>
                  <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '99px', background: 'linear-gradient(135deg, #721B29, #B88D22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 'var(--text-sm)', color: '#FFFFFF', flexShrink: 0, boxShadow: '0 2px 8px rgba(114,27,41,0.2)' }}>
                    {initials}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emailShort}</p>
                    
                    {/* Badge da Role no perfil */}
                    <span className="inline-flex items-center" style={{ gap: '4px', padding: '2px 8px', borderRadius: '99px', fontSize: 'calc(var(--text-xs) * 0.88)', fontWeight: 700, background: roleBadge.bg, border: `1px solid ${roleBadge.border}`, color: roleBadge.color, marginTop: '2px' }}>
                      {RoleBadgeIcon && <RoleBadgeIcon style={{ width: '11px', height: '11px' }} />}
                      {roleBadge.label}
                    </span>
                  </div>
                </div>

                {/* Adega count */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  <Bookmark style={{ width: 'var(--text-base)', height: 'var(--text-base)', color: 'var(--gold-accent)' }} />
                  {cellarCount} vinho{cellarCount !== 1 ? 's' : ''} guardado{cellarCount !== 1 ? 's' : ''} na adega
                </div>

                {/* Atalho Painel Admin para ADMIN */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => { setActiveTab('admin'); setShowUserMenu(false); }}
                    className="flex items-center"
                    style={{ gap: 'var(--space-2)', padding: `var(--space-2) var(--space-3)`, borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: 600, background: '#FDF8EB', border: '1px solid rgba(184, 141, 34, 0.3)', color: '#8C6810', cursor: 'pointer' }}
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
                  style={{ gap: 'var(--space-2)', padding: `var(--space-2) var(--space-3)`, borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: 600, background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                  onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}
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
      <div className="flex sm:hidden items-center justify-center w-full" style={{ marginTop: 'var(--space-2)', paddingTop: 'var(--space-1)' }}>
        <nav className="flex items-center justify-center w-full" style={{ background: '#F2EDE4', padding: '3px', borderRadius: '99px', border: '1px solid rgba(0,0,0,0.06)', gap: '4px', maxWidth: '24rem' }}>
          {NAV.map(({ id, Icon, label }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className="flex-1 flex items-center justify-center font-semibold transition-all"
                style={{
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '99px',
                  fontSize: 'var(--text-xs)',
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? 'var(--wine-primary)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                  boxShadow: isActive ? '0 3px 10px rgba(114,27,41,0.22)' : 'none'
                }}
              >
                <Icon style={{ width: 'var(--text-sm)', height: 'var(--text-sm)', color: isActive ? '#FDF8EB' : 'inherit' }} />
                {label}{id === 'cellar' && cellarCount > 0 ? ` (${cellarCount})` : ''}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
