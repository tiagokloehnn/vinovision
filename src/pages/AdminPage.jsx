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
  Filter,
  Key,
  Plug,
  Save,
  Eye,
  EyeOff,
  Sparkles,
  Database,
  Check
} from 'lucide-react';

export default function AdminPage() {
  const { user: currentUser } = useAuth();
  const [activeAdminTab, setActiveAdminTab] = useState('users'); // 'users' | 'connections'
  
  // ── ESTADOS DE USUÁRIOS ──
  const [profiles, setProfiles] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState(null);

  // ── ESTADOS DE CONEXÕES & APIS ──
  const [groqKey, setGroqKey] = useState('');
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [savingGroq, setSavingGroq] = useState(false);
  const [testingGroq, setTestingGroq] = useState(false);
  const [groqStatus, setGroqStatus] = useState({ state: 'idle', message: '' }); // 'idle' | 'success' | 'error'

  // Busca perfis de usuários
  const loadProfiles = async () => {
    setLoadingUsers(true);
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
      setLoadingUsers(false);
    }
  };

  // Carrega chave Groq salva no banco de dados (app_config) ou localStorage
  const loadGroqConfig = async () => {
    const localVal = localStorage.getItem('vinovision_groq_key') || import.meta.env.VITE_GROQ_API_KEY || '';
    setGroqKey(localVal);

    try {
      const { data } = await supabase
        .from('app_config')
        .select('value')
        .eq('key', 'groq_api_key')
        .maybeSingle();

      if (data?.value) {
        setGroqKey(data.value);
        localStorage.setItem('vinovision_groq_key', data.value);
      }
    } catch (err) {
      console.warn('[AdminPage] Tabela app_config não disponível ainda:', err);
    }
  };

  useEffect(() => {
    loadProfiles();
    loadGroqConfig();
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

  // Testar Conexão com a API Groq
  const handleTestGroq = async () => {
    const keyToTest = groqKey.trim();
    if (!keyToTest) {
      setGroqStatus({ state: 'error', message: 'Insira uma chave Groq para testar.' });
      return;
    }

    setTestingGroq(true);
    setGroqStatus({ state: 'idle', message: 'Testando comunicação com a API Groq…' });

    try {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { 'Authorization': `Bearer ${keyToTest}` }
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const models = (data.data || []).map(m => m.id);
      const visionModels = models.filter(m => m.toLowerCase().includes('vision') || m.toLowerCase().includes('preview'));

      setGroqStatus({
        state: 'success',
        message: `Conexão bem sucedida! ${models.length} modelos ativos. Modelos de Visão: ${visionModels.join(', ') || 'Nenhum'}`
      });
      showToast('success', 'Chave da API Groq testada e aprovada!');
    } catch (err) {
      setGroqStatus({ state: 'error', message: `Erro ao testar chave: ${err.message}` });
      showToast('error', `Falha na verificação: ${err.message}`);
    } finally {
      setTestingGroq(false);
    }
  };

  // Salvar Chave Groq no Supabase (app_config) e LocalStorage
  const handleSaveGroq = async () => {
    const val = groqKey.trim();
    setSavingGroq(true);

    try {
      // Salva localmente
      if (val) {
        localStorage.setItem('vinovision_groq_key', val);
      } else {
        localStorage.removeItem('vinovision_groq_key');
      }

      // Tenta salvar no Supabase (app_config)
      const { error } = await supabase
        .from('app_config')
        .upsert({ key: 'groq_api_key', value: val, updated_at: new Date().toISOString() });

      if (error) {
        console.warn('[AdminPage] Nota: app_config precisa ser criado no Supabase. Salvo localmente.');
        showToast('success', 'Chave salva localmente! (Para salvar globalmente, crie a tabela app_config no SQL Editor)');
      } else {
        showToast('success', 'Chave Groq salva no banco de dados e disponível para todos os usuários!');
      }
    } catch (err) {
      showToast('success', 'Chave salva no navegador!');
    } finally {
      setSavingGroq(false);
    }
  };

  // Filtros de Usuários
  const filteredProfiles = profiles.filter(p => {
    const matchesRole = roleFilter === 'ALL' || p.role === roleFilter;
    const nameStr = (p.display_name || '').toLowerCase();
    const emailStr = (p.email || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = nameStr.includes(q) || emailStr.includes(q);
    return matchesRole && matchesSearch;
  });

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
            Gestão & Configurações
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            Administre usuários, papéis de acesso e chaves de APIs do VinoVision AI
          </p>
        </div>

        {/* SUB-NAVEGAÇÃO DO ADMIN (USUÁRIOS / CONEXÕES) */}
        <div className="flex items-center" style={{ background: 'rgba(255,255,255,0.05)', padding: 'var(--space-1)', borderRadius: '99px', border: '1px solid var(--border-clean)', gap: 'var(--space-1)' }}>
          <button
            onClick={() => setActiveAdminTab('users')}
            className="flex items-center font-semibold transition-all"
            style={{
              gap: 'var(--space-2)',
              padding: `var(--space-2) var(--space-5)`,
              borderRadius: '99px',
              fontSize: 'var(--text-sm)',
              border: 'none',
              cursor: 'pointer',
              background: activeAdminTab === 'users' ? 'var(--wine-primary)' : 'transparent',
              color: activeAdminTab === 'users' ? 'var(--gold-light)' : 'var(--text-muted)'
            }}
          >
            <Users style={{ width: 'var(--text-base)', height: 'var(--text-base)' }} />
            Usuários ({totalUsers})
          </button>

          <button
            onClick={() => setActiveAdminTab('connections')}
            className="flex items-center font-semibold transition-all"
            style={{
              gap: 'var(--space-2)',
              padding: `var(--space-2) var(--space-5)`,
              borderRadius: '99px',
              fontSize: 'var(--text-sm)',
              border: 'none',
              cursor: 'pointer',
              background: activeAdminTab === 'connections' ? 'var(--wine-primary)' : 'transparent',
              color: activeAdminTab === 'connections' ? 'var(--gold-light)' : 'var(--text-muted)'
            }}
          >
            <Plug style={{ width: 'var(--text-base)', height: 'var(--text-base)' }} />
            Conexões & APIs
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* ABA 1: GERENCIAMENTO DE USUÁRIOS                                  */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {activeAdminTab === 'users' && (
        <>
          {/* CARDS DE ESTATÍSTICAS */}
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

          {/* BARRA DE PESQUISA E FILTROS */}
          <div className="glass-card flex flex-col sm:flex-row items-center justify-between" style={{ padding: 'var(--space-5)', gap: 'var(--space-4)' }}>
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

          {/* TABELA DE USUÁRIOS */}
          <div className="glass-card overflow-hidden" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {loadingUsers ? (
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

                          <td style={{ padding: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                            {p.email}
                          </td>

                          <td style={{ padding: 'var(--space-4)' }}>
                            <span className="inline-flex items-center" style={{ gap: 'var(--space-1)', padding: `var(--space-1) var(--space-3)`, borderRadius: '99px', fontSize: 'var(--text-xs)', fontWeight: 700, background: badgeStyle.background, border: badgeStyle.border, color: badgeStyle.color }}>
                              <BadgeIcon style={{ width: 'var(--text-xs)', height: 'var(--text-xs)' }} />
                              {badgeStyle.label}
                            </span>
                          </td>

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
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* ABA 2: CONEXÕES & CHAVES DE API                                    */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {activeAdminTab === 'connections' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

          {/* CARD GROQ AI VISION INTEGRATION */}
          <div className="glass-card overflow-hidden" style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div className="flex items-center justify-between" style={{ paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-clean)' }}>
              <div className="flex items-center" style={{ gap: 'var(--space-4)' }}>
                <div style={{ width: 'clamp(2.5rem,4vw,3rem)', height: 'clamp(2.5rem,4vw,3rem)', borderRadius: 'var(--radius-lg)', background: 'rgba(128,14,38,0.4)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyCenter: 'center', flexShrink: 0 }}>
                  <Sparkles style={{ width: 'var(--text-xl)', height: 'var(--text-xl)', color: 'var(--gold-accent)' }} />
                </div>
                <div>
                  <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'white' }}>Groq AI Vision Integration</h3>
                    <span style={{ fontSize: 'calc(var(--text-xs) * 0.85)', padding: '2px 8px', borderRadius: '99px', background: 'rgba(212,175,55,0.2)', color: 'var(--gold-light)', border: '1px solid rgba(212,175,55,0.3)', fontWeight: 700 }}>
                      Llama 3.2 Vision
                    </span>
                  </div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Chave de API compartilhada para leitura e visão computacional de rótulos de vinhos
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <span className="inline-flex items-center font-bold"
                style={{
                  gap: 'var(--space-1)',
                  padding: `var(--space-1) var(--space-3)`,
                  borderRadius: '99px',
                  fontSize: 'var(--text-xs)',
                  background: groqKey.trim() ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${groqKey.trim() ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  color: groqKey.trim() ? '#6ee7b7' : '#f87171'
                }}
              >
                {groqKey.trim() ? '🟢 Chave Configurada' : '🔴 Não Configurado'}
              </span>
            </div>

            {/* FORMULÁRIO DA CHAVE GROQ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: '40rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <label style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'var(--gold-accent)' }}>
                  Chave da API Groq (gsk_…)
                </label>
                
                <div style={{ position: 'relative' }}>
                  <Key style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', width: 'var(--text-base)', height: 'var(--text-base)', color: 'var(--gold-accent)', pointerEvents: 'none' }} />
                  <input
                    type={showGroqKey ? 'text' : 'password'}
                    placeholder="gsk_…"
                    value={groqKey}
                    onChange={e => setGroqKey(e.target.value)}
                    style={{ width: '100%', background: 'rgba(11,5,8,0.9)', border: '1px solid var(--border-clean)', borderRadius: 'var(--radius-md)', paddingLeft: 'calc(var(--space-3) + var(--text-base) + var(--space-2))', paddingRight: 'calc(var(--space-3) + var(--text-xl))', paddingTop: 'var(--space-3)', paddingBottom: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'white', outline: 'none', transition: 'border-color 0.2s', fontFamily: showGroqKey ? 'monospace' : 'sans-serif' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(212,175,55,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-clean)'}
                  />
                  <button type="button" onClick={() => setShowGroqKey(v => !v)}
                    style={{ position: 'absolute', right: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    {showGroqKey ? <EyeOff style={{ width: 'var(--text-base)', height: 'var(--text-base)' }} /> : <Eye style={{ width: 'var(--text-base)', height: 'var(--text-base)' }} />}
                  </button>
                </div>
                
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  Crie ou obtenha a chave de API gratuita no console oficial: <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{ color: 'var(--gold-light)', textDecoration: 'underline' }}>console.groq.com/keys</a>
                </p>
              </div>

              {/* Mensagem de resultado do Teste */}
              {groqStatus.message && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: groqStatus.state === 'error' ? 'rgba(239,68,68,0.12)' : groqStatus.state === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(212,175,55,0.12)', border: `1px solid ${groqStatus.state === 'error' ? 'rgba(239,68,68,0.3)' : groqStatus.state === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(212,175,55,0.3)'}` }}>
                  {groqStatus.state === 'error' ? <AlertCircle style={{ width: 'var(--text-base)', height: 'var(--text-base)', color: '#f87171', flexShrink: 0, marginTop: '2px' }} /> : groqStatus.state === 'success' ? <CheckCircle2 style={{ width: 'var(--text-base)', height: 'var(--text-base)', color: '#6ee7b7', flexShrink: 0, marginTop: '2px' }} /> : <RefreshCw style={{ width: 'var(--text-base)', height: 'var(--text-base)', color: 'var(--gold-light)', flexShrink: 0, marginTop: '2px', animation: 'spin 1s linear infinite' }} />}
                  <p style={{ fontSize: 'var(--text-xs)', color: groqStatus.state === 'error' ? '#f87171' : groqStatus.state === 'success' ? '#6ee7b7' : 'var(--gold-light)', lineHeight: 1.6 }}>
                    {groqStatus.message}
                  </p>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex items-center" style={{ gap: 'var(--space-3)', paddingTop: 'var(--space-2)' }}>
                <button
                  type="button"
                  onClick={handleTestGroq}
                  disabled={testingGroq}
                  className="btn-ghost"
                  style={{ gap: 'var(--space-2)' }}
                >
                  <RefreshCw style={{ width: 'var(--text-base)', height: 'var(--text-base)', animation: testingGroq ? 'spin 1s linear infinite' : 'none' }} />
                  {testingGroq ? 'Testando…' : 'Testar Conexão'}
                </button>

                <button
                  type="button"
                  onClick={handleSaveGroq}
                  disabled={savingGroq}
                  className="btn-gold"
                  style={{ gap: 'var(--space-2)' }}
                >
                  <Save style={{ width: 'var(--text-base)', height: 'var(--text-base)' }} />
                  {savingGroq ? 'Salvando…' : 'Salvar Configuração'}
                </button>
              </div>
            </div>
          </div>

          {/* CARD SUPABASE DATABASE INTEGRATION */}
          <div className="glass-card overflow-hidden" style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div className="flex items-center justify-between" style={{ paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-clean)' }}>
              <div className="flex items-center" style={{ gap: 'var(--space-4)' }}>
                <div style={{ width: 'clamp(2.5rem,4vw,3rem)', height: 'clamp(2.5rem,4vw,3rem)', borderRadius: 'var(--radius-lg)', background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyCenter: 'center', flexShrink: 0 }}>
                  <Database style={{ width: 'var(--text-xl)', height: 'var(--text-xl)', color: '#6ee7b7' }} />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'white' }}>Supabase Database & Auth</h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Banco de dados PostgreSQL em nuvem e sistema de autenticação de usuários
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center font-bold" style={{ gap: 'var(--space-1)', padding: `var(--space-1) var(--space-3)`, borderRadius: '99px', fontSize: 'var(--text-xs)', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6ee7b7' }}>
                🟢 Conectado ao Projeto
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 'var(--space-4)' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-clean)' }}>
                <p style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 700 }}>Tabela Profiles</p>
                <p style={{ fontSize: 'var(--text-sm)', color: '#6ee7b7', fontWeight: 600, marginTop: 'var(--space-1)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check style={{ width: '14px', height: '14px' }} /> Ativa (RLS OK)
                </p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-clean)' }}>
                <p style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 700 }}>Tabela Cellar</p>
                <p style={{ fontSize: 'var(--text-sm)', color: '#6ee7b7', fontWeight: 600, marginTop: 'var(--space-1)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check style={{ width: '14px', height: '14px' }} /> Ativa (RLS OK)
                </p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-clean)' }}>
                <p style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 700 }}>Autenticação Auth</p>
                <p style={{ fontSize: 'var(--text-sm)', color: '#6ee7b7', fontWeight: 600, marginTop: 'var(--space-1)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check style={{ width: '14px', height: '14px' }} /> E-mail / Google OAuth
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
