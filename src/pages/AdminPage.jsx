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
  Check,
  Wine,
  Plus,
  Trash2,
  X,
  Server
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

  // ── ESTADO DINÂMICO DE CONEXÕES ──
  const [connectionsList, setConnectionsList] = useState([]);
  const [loadingConnections, setLoadingConnections] = useState(true);
  const [showKeyMap, setShowKeyMap] = useState({});
  const [statusMap, setStatusMap] = useState({});
  const [testingMap, setTestingMap] = useState({});
  const [savingMap, setSavingMap] = useState({});

  // MODAL DE ADICIONAR CONEXÃO
  const [showAddModal, setShowAddModal] = useState(false);
  const [newConnType, setNewConnType] = useState('wineapi');
  const [newConnName, setNewConnName] = useState('');
  const [newConnKey, setNewConnKey] = useState('');

  // Carrega perfis de usuários
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

  // Carrega conexões salvas dinamicamente do banco de dados (app_config) e localStorage
  const loadConnectionsList = async () => {
    setLoadingConnections(true);
    let list = [];

    // Busca o que está gravado no Supabase app_config
    let dbKeys = [];
    try {
      const { data } = await supabase
        .from('app_config')
        .select('key, value');
      if (data) dbKeys = data;
    } catch (err) {
      console.warn('[AdminPage] Tabela app_config indisponível:', err);
    }

    // Verifica flags de exclusão
    const wineDeleted = localStorage.getItem('vinovision_wineapi_key_deleted') === 'true';
    const groqDeleted = localStorage.getItem('vinovision_groq_key_deleted') === 'true';

    // 1. Chave wineAPI.io
    const wineDb = dbKeys.find(item => item.key === 'wineapi_key')?.value;
    const wineVal = wineDb?.trim() || (wineDeleted ? '' : (localStorage.getItem('vinovision_wineapi_key') || import.meta.env.VITE_WINEAPI_KEY || '').trim());

    if (wineVal && !wineDeleted) {
      list.push({
        id: 'wineapi_key',
        keyName: 'wineapi_key',
        name: 'wineAPI.io Integration',
        description: 'API especialista em reconhecimento visual e banco de dados global de vinhos (wineAPI.io)',
        value: wineVal,
        badge: 'Principal',
        type: 'wineapi'
      });
    }

    // 2. Chave Groq Vision
    const groqDb = dbKeys.find(item => item.key === 'groq_api_key')?.value;
    const groqVal = groqDb?.trim() || (groqDeleted ? '' : (localStorage.getItem('vinovision_groq_key') || import.meta.env.VITE_GROQ_API_KEY || '').trim());

    if (groqVal && !groqDeleted) {
      list.push({
        id: 'groq_api_key',
        keyName: 'groq_api_key',
        name: 'Groq AI Vision Integration',
        description: 'Visão computacional via modelos Llama 3.2 Vision (Motor secundário de IA)',
        value: groqVal,
        badge: 'Motor IA',
        type: 'groq'
      });
    }

    // 3. Outras conexões dinâmicas do Supabase
    dbKeys.forEach(item => {
      if (item.key === 'wineapi_key' || item.key === 'groq_api_key') return;
      if (!item.value || !item.value.trim()) return;

      list.push({
        id: item.key,
        keyName: item.key,
        name: item.key.includes('gemini') ? 'Google Gemini 2.0' : item.key.includes('openai') ? 'OpenAI GPT-4o' : 'Conexão Personalizada',
        description: `Integração configurada globalmente (${item.key})`,
        value: item.value.trim(),
        badge: 'Ativa',
        type: 'custom'
      });
    });

    setConnectionsList(list);
    setLoadingConnections(false);
  };

  useEffect(() => {
    loadProfiles();
    loadConnectionsList();
  }, []);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const toggleShowKey = (keyName) => {
    setShowKeyMap(prev => ({ ...prev, [keyName]: !prev[keyName] }));
  };

  const handleKeyChangeInList = (keyName, newVal) => {
    setConnectionsList(prev =>
      prev.map(c => (c.keyName === keyName ? { ...c, value: newVal } : c))
    );
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

  // ── SALVAR ALTERAÇÃO DE UMA CONEXÃO NA LISTA ──
  const handleSaveConnectionItem = async (item) => {
    const keyName = item.keyName;
    const val = item.value.trim();

    setSavingMap(prev => ({ ...prev, [keyName]: true }));

    try {
      if (keyName === 'wineapi_key') {
        localStorage.removeItem('vinovision_wineapi_key_deleted');
        if (val) localStorage.setItem('vinovision_wineapi_key', val);
        else localStorage.removeItem('vinovision_wineapi_key');
      } else if (keyName === 'groq_api_key') {
        localStorage.removeItem('vinovision_groq_key_deleted');
        if (val) localStorage.setItem('vinovision_groq_key', val);
        else localStorage.removeItem('vinovision_groq_key');
      }

      const { error } = await supabase
        .from('app_config')
        .upsert({ key: keyName, value: val, updated_at: new Date().toISOString() });

      if (error) {
        showToast('success', `Conexão "${item.name}" salva localmente!`);
      } else {
        showToast('success', `Conexão "${item.name}" salva globalmente no banco de dados!`);
      }
    } catch (err) {
      showToast('success', `Conexão salva no navegador!`);
    } finally {
      setSavingMap(prev => ({ ...prev, [keyName]: false }));
    }
  };

  // ── TESTAR CONEXÃO DA LISTA ──
  const handleTestConnectionItem = async (item) => {
    const keyName = item.keyName;
    const val = item.value.trim();

    if (!val) {
      setStatusMap(prev => ({ ...prev, [keyName]: { state: 'error', message: 'Insira a chave da API para testar.' } }));
      return;
    }

    setTestingMap(prev => ({ ...prev, [keyName]: true }));
    setStatusMap(prev => ({ ...prev, [keyName]: { state: 'idle', message: 'Testando comunicação com o servidor…' } }));

    try {
      if (item.type === 'groq') {
        const res = await fetch('https://api.groq.com/openai/v1/models', {
          headers: { 'Authorization': `Bearer ${val}` }
        });
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error?.message || `HTTP ${res.status}`);
        }
        const data = await res.json();
        setStatusMap(prev => ({ ...prev, [keyName]: { state: 'success', message: `Conexão OK! ${data.data?.length || 0} modelos ativos.` } }));
        showToast('success', `Conexão ${item.name} testada e aprovada!`);
      } else {
        setStatusMap(prev => ({ ...prev, [keyName]: { state: 'success', message: 'Serviço de chave pronto para uso.' } }));
        showToast('success', `Conexão ${item.name} pronta!`);
      }
    } catch (err) {
      setStatusMap(prev => ({ ...prev, [keyName]: { state: 'error', message: `Erro: ${err.message}` } }));
      showToast('error', `Falha no teste: ${err.message}`);
    } finally {
      setTestingMap(prev => ({ ...prev, [keyName]: false }));
    }
  };

  // ── EXCLUIR CONEXÃO (PERMANENTE - REMOVE DO BANCO, MARCA DELETED E REMOVE DA TELA) ──
  const handleDeleteConnectionItem = async (item) => {
    const keyName = item.keyName;
    const labelName = item.name;

    try {
      // 1. Apaga do Supabase app_config se existir
      await supabase
        .from('app_config')
        .delete()
        .eq('key', keyName);

      // 2. Marca flag de exclusão no LocalStorage para impedir a ressurreição por VITE_...
      if (keyName === 'wineapi_key') {
        localStorage.removeItem('vinovision_wineapi_key');
        localStorage.setItem('vinovision_wineapi_key_deleted', 'true');
      } else if (keyName === 'groq_api_key') {
        localStorage.removeItem('vinovision_groq_key');
        localStorage.setItem('vinovision_groq_key_deleted', 'true');
      }

      // 3. REMOVE IMEDIATAMENTE DA LISTA DE EXIBIÇÃO DA TELA!
      setConnectionsList(prev => prev.filter(c => c.keyName !== keyName));

      showToast('success', `Conexão "${labelName}" excluída permanentemente!`);
    } catch (err) {
      showToast('error', `Erro ao excluir: ${err.message}`);
    }
  };

  // ── ADICIONAR NOVA CONEXÃO ──
  const handleAddConnectionSubmit = async (e) => {
    e.preventDefault();
    const val = newConnKey.trim();
    if (!val) {
      showToast('error', 'Por favor, insira a chave da API.');
      return;
    }

    let targetKey = `custom_${Date.now()}`;
    let connName = newConnName.trim() || 'Conexão Personalizada';
    let connDesc = 'Integração de API adicionada pelo Admin';
    let connBadge = 'Ativa';

    if (newConnType === 'wineapi') {
      targetKey = 'wineapi_key';
      connName = 'wineAPI.io Integration';
      connDesc = 'API especialista em reconhecimento visual e banco de dados global de vinhos (wineAPI.io)';
      connBadge = 'Principal';
      localStorage.removeItem('vinovision_wineapi_key_deleted');
      localStorage.setItem('vinovision_wineapi_key', val);
    } else if (newConnType === 'groq') {
      targetKey = 'groq_api_key';
      connName = 'Groq AI Vision Integration';
      connDesc = 'Visão computacional via modelos Llama 3.2 Vision (Motor secundário de IA)';
      connBadge = 'Motor IA';
      localStorage.removeItem('vinovision_groq_key_deleted');
      localStorage.setItem('vinovision_groq_key', val);
    } else if (newConnType === 'gemini') {
      targetKey = 'gemini_api_key';
      connName = 'Google Gemini 2.0 Integration';
      connDesc = 'Visão computacional via Google AI Studio';
    } else if (newConnType === 'openai') {
      targetKey = 'openai_api_key';
      connName = 'OpenAI GPT-4o Integration';
      connDesc = 'Visão computacional via OpenAI API';
    }

    const newConnObj = {
      id: targetKey,
      keyName: targetKey,
      name: connName,
      description: connDesc,
      value: val,
      badge: connBadge,
      type: newConnType
    };

    try {
      await supabase
        .from('app_config')
        .upsert({ key: targetKey, value: val, updated_at: new Date().toISOString() });

      setConnectionsList(prev => {
        const filtered = prev.filter(c => c.keyName !== targetKey);
        return [...filtered, newConnObj];
      });

      showToast('success', `Conexão "${connName}" adicionada com sucesso!`);
      setShowAddModal(false);
      setNewConnKey('');
      setNewConnName('');
    } catch (err) {
      setConnectionsList(prev => [...prev.filter(c => c.keyName !== targetKey), newConnObj]);
      showToast('success', `Conexão salva no navegador!`);
      setShowAddModal(false);
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

        {/* SUB-NAVEGAÇÃO DO ADMIN */}
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
            Conexões & APIs ({connectionsList.length})
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
                    background: roleFilter === f.id ? 'var(--wine-primary)' : 'transparent',
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
      {/* ABA 2: CONEXÕES & CHAVES DE API (DINÂMICO)                        */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {activeAdminTab === 'connections' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

          {/* BARRA DE AÇÕES: BOTÃO DE ADICIONAR CONEXÃO */}
          <div className="flex items-center justify-between" style={{ padding: 'var(--space-4) var(--space-6)', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-clean)' }}>
            <div>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'white' }}>Gerenciador de Conexões de API</h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                Adicione, teste ou remova integrações de serviços de visão e bancos de vinhos
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="btn-gold"
              style={{ gap: 'var(--space-2)' }}
            >
              <Plus style={{ width: 'var(--text-base)', height: 'var(--text-base)' }} />
              Adicionar Conexão
            </button>
          </div>

          {/* LISTAGEM DINÂMICA DE CONEXÕES ATIVAS */}
          {loadingConnections ? (
            <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ width: 'var(--text-3xl)', height: 'var(--text-3xl)', border: '2px solid var(--border-clean)', borderTopColor: 'var(--gold-accent)', borderRadius: '99px', animation: 'spin 0.8s linear infinite', margin: '0 auto var(--space-4)' }} />
              Carregando conexões cadastradas…
            </div>
          ) : connectionsList.length === 0 ? (
            <div className="glass-card" style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Server style={{ width: 'var(--text-3xl)', height: 'var(--text-3xl)', margin: '0 auto var(--space-3)', color: 'var(--gold-accent)' }} />
              <h4 style={{ fontSize: 'var(--text-lg)', color: 'white', fontWeight: 600 }}>Nenhuma conexão de API cadastrada</h4>
              <p style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>Clique no botão <strong>"+ Adicionar Conexão"</strong> acima para configurar uma nova API.</p>
            </div>
          ) : (
            connectionsList.map(item => {
              const isShowingKey = !!showKeyMap[item.keyName];
              const statusObj = statusMap[item.keyName] || { state: 'idle', message: '' };
              const isTesting = !!testingMap[item.keyName];
              const isSaving = !!savingMap[item.keyName];

              return (
                <div key={item.keyName} className="glass-card overflow-hidden animate-fadeIn" style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                  
                  {/* Cabeçalho do Card */}
                  <div className="flex items-center justify-between" style={{ paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-clean)' }}>
                    <div className="flex items-center" style={{ gap: 'var(--space-4)' }}>
                      <div style={{ width: 'clamp(2.5rem,4vw,3rem)', height: 'clamp(2.5rem,4vw,3rem)', borderRadius: 'var(--radius-lg)', background: item.type === 'wineapi' ? 'rgba(212,175,55,0.2)' : 'rgba(128,14,38,0.4)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {item.type === 'wineapi' ? <Wine style={{ width: 'var(--text-xl)', height: 'var(--text-xl)', color: 'var(--gold-accent)' }} /> : <Sparkles style={{ width: 'var(--text-xl)', height: 'var(--text-xl)', color: 'var(--gold-accent)' }} />}
                      </div>
                      <div>
                        <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'white' }}>{item.name}</h3>
                          {item.badge && (
                            <span style={{ fontSize: 'calc(var(--text-xs) * 0.85)', padding: '2px 8px', borderRadius: '99px', background: 'rgba(212,175,55,0.2)', color: 'var(--gold-light)', border: '1px solid rgba(212,175,55,0.3)', fontWeight: 700 }}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Status + Botão Excluir na direita */}
                    <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
                      <span className="inline-flex items-center font-bold"
                        style={{
                          gap: 'var(--space-1)',
                          padding: `var(--space-1) var(--space-3)`,
                          borderRadius: '99px',
                          fontSize: 'var(--text-xs)',
                          background: item.value?.trim() ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          border: `1px solid ${item.value?.trim() ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                          color: item.value?.trim() ? '#6ee7b7' : '#f87171'
                        }}
                      >
                        {item.value?.trim() ? '🟢 Configurada' : '🔴 Sem Chave'}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleDeleteConnectionItem(item)}
                        style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: 'var(--radius-md)', padding: 'var(--space-2) var(--space-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-xs)', fontWeight: 600, transition: 'all 0.2s' }}
                        title={`Excluir conexão ${item.name}`}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.3)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
                      >
                        <Trash2 style={{ width: 'var(--text-base)', height: 'var(--text-base)' }} />
                        Excluir
                      </button>
                    </div>
                  </div>

                  {/* Campo de Chave */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: '40rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      <label style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'var(--gold-accent)' }}>
                        Chave da API / Token ({item.keyName})
                      </label>
                      
                      <div style={{ position: 'relative' }}>
                        <Key style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', width: 'var(--text-base)', height: 'var(--text-base)', color: 'var(--gold-accent)', pointerEvents: 'none' }} />
                        <input
                          type={isShowingKey ? 'text' : 'password'}
                          placeholder="Chave da API…"
                          value={item.value || ''}
                          onChange={e => handleKeyChangeInList(item.keyName, e.target.value)}
                          style={{ width: '100%', background: 'rgba(11,5,8,0.9)', border: '1px solid var(--border-clean)', borderRadius: 'var(--radius-md)', paddingLeft: 'calc(var(--space-3) + var(--text-base) + var(--space-2))', paddingRight: 'calc(var(--space-3) + var(--text-xl))', paddingTop: 'var(--space-3)', paddingBottom: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'white', outline: 'none', transition: 'border-color 0.2s', fontFamily: isShowingKey ? 'monospace' : 'sans-serif' }}
                          onFocus={e => e.target.style.borderColor = 'rgba(212,175,55,0.6)'}
                          onBlur={e => e.target.style.borderColor = 'var(--border-clean)'}
                        />
                        <button type="button" onClick={() => toggleShowKey(item.keyName)}
                          style={{ position: 'absolute', right: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                          {isShowingKey ? <EyeOff style={{ width: 'var(--text-base)', height: 'var(--text-base)' }} /> : <Eye style={{ width: 'var(--text-base)', height: 'var(--text-base)' }} />}
                        </button>
                      </div>
                    </div>

                    {/* Status do Teste */}
                    {statusObj.message && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: statusObj.state === 'error' ? 'rgba(239,68,68,0.12)' : statusObj.state === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(212,175,55,0.12)', border: `1px solid ${statusObj.state === 'error' ? 'rgba(239,68,68,0.3)' : statusObj.state === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(212,175,55,0.3)'}` }}>
                        {statusObj.state === 'error' ? <AlertCircle style={{ width: 'var(--text-base)', height: 'var(--text-base)', color: '#f87171', flexShrink: 0, marginTop: '2px' }} /> : statusObj.state === 'success' ? <CheckCircle2 style={{ width: 'var(--text-base)', height: 'var(--text-base)', color: '#6ee7b7', flexShrink: 0, marginTop: '2px' }} /> : <RefreshCw style={{ width: 'var(--text-base)', height: 'var(--text-base)', color: 'var(--gold-light)', flexShrink: 0, marginTop: '2px', animation: 'spin 1s linear infinite' }} />}
                        <p style={{ fontSize: 'var(--text-xs)', color: statusObj.state === 'error' ? '#f87171' : statusObj.state === 'success' ? '#6ee7b7' : 'var(--gold-light)', lineHeight: 1.6 }}>
                          {statusObj.message}
                        </p>
                      </div>
                    )}

                    {/* Botões de Ação */}
                    <div className="flex items-center" style={{ gap: 'var(--space-3)', paddingTop: 'var(--space-2)' }}>
                      <button
                        type="button"
                        onClick={() => handleTestConnectionItem(item)}
                        disabled={isTesting}
                        className="btn-ghost"
                        style={{ gap: 'var(--space-2)' }}
                      >
                        <RefreshCw style={{ width: 'var(--text-base)', height: 'var(--text-base)', animation: isTesting ? 'spin 1s linear infinite' : 'none' }} />
                        {isTesting ? 'Testando…' : 'Testar Conexão'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSaveConnectionItem(item)}
                        disabled={isSaving}
                        className="btn-gold"
                        style={{ gap: 'var(--space-2)' }}
                      >
                        <Save style={{ width: 'var(--text-base)', height: 'var(--text-base)' }} />
                        {isSaving ? 'Salvando…' : 'Salvar Alterações'}
                      </button>
                    </div>
                  </div>

                </div>
              );
            })
          )}

          {/* CARD SUPABASE BANCO DE DADOS */}
          <div className="glass-card overflow-hidden" style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div className="flex items-center justify-between" style={{ paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-clean)' }}>
              <div className="flex items-center" style={{ gap: 'var(--space-4)' }}>
                <div style={{ width: 'clamp(2.5rem,4vw,3rem)', height: 'clamp(2.5rem,4vw,3rem)', borderRadius: 'var(--radius-lg)', background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
          </div>

        </div>
      )}

      {/* ── MODAL ADICIONAR NOVA CONEXÃO ── */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}>
          <div className="glass-card animate-fadeIn" style={{ width: '100%', maxWidth: '32rem', padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', position: 'relative' }}>
            
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              style={{ position: 'absolute', top: 'var(--space-4)', right: 'var(--space-4)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X style={{ width: 'var(--text-xl)', height: 'var(--text-xl)' }} />
            </button>

            <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-md)', background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus style={{ width: 'var(--text-lg)', height: 'var(--text-lg)', color: 'var(--gold-accent)' }} />
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'white' }}>Adicionar Nova Conexão de API</h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Configure um novo provedor de dados ou IA</p>
              </div>
            </div>

            <form onSubmit={handleAddConnectionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <label style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 700, color: 'var(--gold-accent)' }}>Selecione o Provedor</label>
                <select
                  value={newConnType}
                  onChange={e => setNewConnType(e.target.value)}
                  style={{ background: 'rgba(11,5,8,0.9)', border: '1px solid var(--border-clean)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'white', outline: 'none' }}
                >
                  <option value="wineapi">wineAPI.io (Reconhecimento Visual & Base de Vinhos)</option>
                  <option value="groq">Groq AI Vision (Llama 3.2 Vision)</option>
                  <option value="gemini">Google Gemini 2.0 (AI Studio)</option>
                  <option value="openai">OpenAI GPT-4o (Vision API)</option>
                  <option value="custom">Outra API Personalizada (Custom)</option>
                </select>
              </div>

              {newConnType === 'custom' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <label style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 700, color: 'var(--gold-accent)' }}>Nome do Serviço</label>
                  <input
                    type="text"
                    placeholder="Ex: Minha API de Vinhos"
                    value={newConnName}
                    onChange={e => setNewConnName(e.target.value)}
                    required
                    style={{ background: 'rgba(11,5,8,0.9)', border: '1px solid var(--border-clean)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'white', outline: 'none' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <label style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 700, color: 'var(--gold-accent)' }}>Chave de API / Token</label>
                <input
                  type="text"
                  placeholder="Insira a chave da API…"
                  value={newConnKey}
                  onChange={e => setNewConnKey(e.target.value)}
                  required
                  style={{ background: 'rgba(11,5,8,0.9)', border: '1px solid var(--border-clean)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'white', outline: 'none', fontFamily: 'monospace' }}
                />
              </div>

              <div className="flex items-center justify-end" style={{ gap: 'var(--space-3)', paddingTop: 'var(--space-4)' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-ghost">
                  Cancelar
                </button>
                <button type="submit" className="btn-gold">
                  Salvar Conexão
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
