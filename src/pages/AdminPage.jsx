import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  ShieldCheck, 
  Crown, 
  UserCheck, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Filter
} from 'lucide-react';

export default function AdminPage() {
  const { user: currentUser } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState(null);

  // Busca todos os perfis do Supabase
  const loadProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[AdminPage] Erro ao carregar perfis:', error.message);
        showToast('error', `Erro ao carregar lista: ${error.message}`);
      } else {
        setProfiles(data || []);
      }
    } catch (err) {
      console.error('[AdminPage] Erro inesperado:', err);
      showToast('error', 'Erro ao conectar ao banco de dados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // Altera a role de um usuário no Supabase
  const handleRoleChange = async (targetId, newRole) => {
    setUpdatingId(targetId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', targetId);

      if (error) {
        showToast('error', `Falha ao atualizar papel: ${error.message}`);
      } else {
        setProfiles(prev =>
          prev.map(p => (p.id === targetId ? { ...p, role: newRole } : p))
        );
        showToast('success', `Nível de acesso alterado para ${newRole} com sucesso!`);
      }
    } catch (err) {
      showToast('error', 'Erro ao realizar atualização.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtros
  const filteredProfiles = profiles.filter(p => {
    const matchesRole = roleFilter === 'ALL' || p.role === roleFilter;
    const nameStr = (p.display_name || '').toLowerCase();
    const emailStr = (p.email || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = nameStr.includes(q) || emailStr.includes(q);
    return matchesRole && matchesSearch;
  });

  // Estatísticas
  const totalUsers = profiles.length;
  const adminCount = profiles.filter(p => p.role === 'ADMIN').length;
  const premiumCount = profiles.filter(p => p.role === 'USER_PREMIUM').length;
  const commonCount = profiles.filter(p => p.role === 'USER_COMMON').length;

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'ADMIN':
        return {
          background: 'rgba(212, 175, 55, 0.15)',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          color: '#f3e5ab',
          icon: ShieldCheck,
          label: 'ADMIN'
        };
      case 'USER_PREMIUM':
        return {
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: '#6ee7b7',
          icon: Crown,
          label: 'USER PREMIUM'
        };
      default:
        return {
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid var(--border-clean)',
          color: 'var(--text-muted)',
          icon: UserCheck,
          label: 'USER COMMUM'
        };
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>

      {/* TOAST FLUTUANTE DE NOTIFICAÇÃO */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 'var(--space-6)', right: 'var(--space-6)', zIndex: 1000 }}>
          <div className="glass-card animate-fadeIn flex items-center" style={{ gap: 'var(--space-3)', padding: 'var(--space-4) var(--space-6)', background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(16, 185, 129, 0.9)', color: 'white', fontWeight: 600, fontSize: 'var(--text-sm)' }}>
            {toast.type === 'error' ? <AlertCircle style={{ width: 'var(--text-lg)', height: 'var(--text-lg)' }} /> : <CheckCircle2 style={{ width: 'var(--text-lg)', height: 'var(--text-lg)' }} />}
            <span>{toast.text}</span>
          </div>
        </div>
      )}

      {/* ── CABEÇALHO DO PAINEL ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between" style={{ gap: 'var(--space-4)', paddingBottom: 'var(--space-5)', borderBottom: '1px solid var(--border-clean)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <span className="inline-flex items-center" style={{ gap: 'var(--space-2)', padding: `var(--space-1) var(--space-3)`, borderRadius: '99px', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.3)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--gold-light)', alignSelf: 'flex-start' }}>
            <ShieldCheck style={{ width: 'var(--text-sm)', height: 'var(--text-sm)', color: 'var(--gold-accent)' }} />
            Painel Administrativo
          </span>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-4xl)', color: 'white', lineHeight: 1.2 }}>
            Gerenciamento de Usuários
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            Administre os papéis e permissões de todos os usuários do VinoVision AI
          </p>
        </div>

        <button onClick={loadProfiles} className="btn-ghost" style={{ alignSelf: 'flex-start' }}>
          <RefreshCw style={{ width: 'var(--text-base)', height: 'var(--text-base)', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Atualizar Lista
        </button>
      </div>

      {/* ── CARDS DE ESTATÍSTICAS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-4" style={{ gap: 'var(--space-4)' }}>
        <div className="glass-card flex items-center" style={{ padding: 'var(--space-5)', gap: 'var(--space-4)' }}>
          <div style={{ width: 'clamp(2.5rem,4vw,3rem)', height: 'clamp(2.5rem,4vw,3rem)', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-clean)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Users style={{ width: 'var(--text-xl)', height: 'var(--text-xl)', color: 'white' }} />
          </div>
          <div>
            <p style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--text-muted)' }}>Total Usuários</p>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'white', marginTop: 'var(--space-1)' }}>{totalUsers}</h3>
          </div>
        </div>

        <div className="glass-card flex items-center" style={{ padding: 'var(--space-5)', gap: 'var(--space-4)' }}>
          <div style={{ width: 'clamp(2.5rem,4vw,3rem)', height: 'clamp(2.5rem,4vw,3rem)', borderRadius: 'var(--radius-lg)', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ShieldCheck style={{ width: 'var(--text-xl)', height: 'var(--text-xl)', color: 'var(--gold-accent)' }} />
          </div>
          <div>
            <p style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--gold-accent)' }}>Admins</p>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'white', marginTop: 'var(--space-1)' }}>{adminCount}</h3>
          </div>
        </div>

        <div className="glass-card flex items-center" style={{ padding: 'var(--space-5)', gap: 'var(--space-4)' }}>
          <div style={{ width: 'clamp(2.5rem,4vw,3rem)', height: 'clamp(2.5rem,4vw,3rem)', borderRadius: 'var(--radius-lg)', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Crown style={{ width: 'var(--text-xl)', height: 'var(--text-xl)', color: '#6ee7b7' }} />
          </div>
          <div>
            <p style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: '#6ee7b7' }}>User Premium</p>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'white', marginTop: 'var(--space-1)' }}>{premiumCount}</h3>
          </div>
        </div>

        <div className="glass-card flex items-center" style={{ padding: 'var(--space-5)', gap: 'var(--space-4)' }}>
          <div style={{ width: 'clamp(2.5rem,4vw,3rem)', height: 'clamp(2.5rem,4vw,3rem)', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-clean)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <UserCheck style={{ width: 'var(--text-xl)', height: 'var(--text-xl)', color: 'var(--text-muted)' }} />
          </div>
          <div>
            <p style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--text-muted)' }}>User Commum</p>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'white', marginTop: 'var(--space-1)' }}>{commonCount}</h3>
          </div>
        </div>
      </div>

      {/* ── BARRA DE PESQUISA E FILTROS ── */}
      <div className="glass-card flex flex-col sm:flex-row items-center justify-between" style={{ padding: 'var(--space-5)', gap: 'var(--space-4)' }}>
        {/* Campo de Busca */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '24rem' }}>
          <Search style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', width: 'var(--text-base)', height: 'var(--text-base)', color: 'var(--gold-accent)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Buscar por e-mail ou nome…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', background: 'rgba(11,5,8,0.8)', border: '1px solid var(--border-clean)', borderRadius: 'var(--radius-lg)', paddingLeft: 'calc(var(--space-3) + var(--text-base) + var(--space-2))', paddingRight: 'var(--space-4)', paddingTop: 'var(--space-2)', paddingBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'white', outline: 'none', transition: 'border-color 0.2s' }}
            onFocus={e => e.target.style.borderColor = 'rgba(212,175,55,0.6)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-clean)'}
          />
        </div>

        {/* Filtros por Papel */}
        <div className="flex flex-wrap items-center" style={{ gap: 'var(--space-2)' }}>
          <Filter style={{ width: 'var(--text-sm)', height: 'var(--text-sm)', color: 'var(--text-muted)' }} />
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'ADMIN', label: 'ADMIN' },
            { id: 'USER_PREMIUM', label: 'USER PREMIUM' },
            { id: 'USER_COMMON', label: 'USER COMMUM' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setRoleFilter(f.id)}
              style={{
                padding: `var(--space-2) var(--space-4)`,
                borderRadius: '99px',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: roleFilter === f.id ? 'var(--wine-primary)' : 'rgba(255,255,255,0.05)',
                color: roleFilter === f.id ? 'var(--gold-light)' : 'var(--text-muted)'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TABELA / LISTA DE USUÁRIOS ── */}
      <div className="glass-card overflow-hidden" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        
        {loading ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ width: 'var(--text-3xl)', height: 'var(--text-3xl)', border: '2px solid var(--border-clean)', borderTopColor: 'var(--gold-accent)', borderRadius: '99px', animation: 'spin 0.8s linear infinite', margin: '0 auto var(--space-4)' }} />
            Carregando usuários…
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--text-muted)' }}>
            Nenhum usuário encontrado.
          </div>
        ) : (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-clean)', color: 'var(--gold-accent)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Usuário</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>E-mail</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Role Atual</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Alterar Role</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Criado em</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.map(p => {
                  const badgeStyle = getRoleBadgeStyle(p.role);
                  const BadgeIcon = badgeStyle.icon;
                  const isCurrent = p.id === currentUser?.id;
                  const isUpdating = updatingId === p.id;

                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Nome + Avatar */}
                      <td style={{ padding: 'var(--space-4)' }}>
                        <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
                          <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '99px', background: 'linear-gradient(135deg, #800e26, #d4af37)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 'var(--text-xs)', color: 'white', flexShrink: 0 }}>
                            {(p.email || 'U').substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'white' }}>
                              {p.display_name || p.email?.split('@')[0] || 'Usuário'}
                              {isCurrent && <span style={{ marginLeft: 'var(--space-2)', fontSize: 'calc(var(--text-xs) * 0.85)', background: 'rgba(212,175,55,0.2)', color: 'var(--gold-light)', padding: '2px 8px', borderRadius: '99px' }}>Você</span>}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* E-mail */}
                      <td style={{ padding: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                        {p.email}
                      </td>

                      {/* Role Atual */}
                      <td style={{ padding: 'var(--space-4)' }}>
                        <span className="inline-flex items-center" style={{ gap: 'var(--space-1)', padding: `var(--space-1) var(--space-3)`, borderRadius: '99px', fontSize: 'var(--text-xs)', fontWeight: 700, background: badgeStyle.background, border: badgeStyle.border, color: badgeStyle.color }}>
                          <BadgeIcon style={{ width: 'var(--text-xs)', height: 'var(--text-xs)' }} />
                          {badgeStyle.label}
                        </span>
                      </td>

                      {/* Alterar Role Dropdown */}
                      <td style={{ padding: 'var(--space-4)' }}>
                        <select
                          value={p.role}
                          disabled={isUpdating}
                          onChange={e => handleRoleChange(p.id, e.target.value)}
                          style={{
                            background: 'rgba(11,5,8,0.9)',
                            border: '1px solid var(--border-clean)',
                            borderRadius: 'var(--radius-md)',
                            padding: `var(--space-2) var(--space-3)`,
                            fontSize: 'var(--text-xs)',
                            fontWeight: 600,
                            color: 'var(--gold-light)',
                            outline: 'none',
                            cursor: isUpdating ? 'wait' : 'pointer'
                          }}
                        >
                          <option value="USER_COMMON" style={{ background: '#0b0508', color: 'white' }}>USER COMMUM</option>
                          <option value="USER_PREMIUM" style={{ background: '#0b0508', color: '#6ee7b7' }}>USER PREMIUM</option>
                          <option value="ADMIN" style={{ background: '#0b0508', color: '#f3e5ab' }}>ADMIN</option>
                        </select>
                      </td>

                      {/* Data de Criação */}
                      <td style={{ padding: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        {p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR') : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
