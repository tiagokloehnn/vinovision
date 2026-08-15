import React, { useState } from 'react';
import {
  Wine, Users, Plus, Key, Copy, Check, Share2, LogOut,
  Trash2, X, MessageCircle, AlertCircle, Sparkles, Shield
} from 'lucide-react';

export default function SharedCellarModal({
  isOpen,
  onClose,
  cellarsList = [],
  activeCellar = {},
  activeCellarId,
  onSelectCellar,
  onCreateCellar,
  onJoinCellar,
  onLeaveCellar,
  onDeleteCellar,
  cellarMembers = [],
  loadingMembers = false,
  currentUserId
}) {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create' | 'join' | 'manage'
  const [newCellarName, setNewCellarName] = useState('');
  const [newCellarDesc, setNewCellarDesc] = useState('');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCellarName.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);
    try {
      const created = await onCreateCellar(newCellarName, newCellarDesc);
      setFeedback({ type: 'success', message: `Adega "${created.name}" criada com sucesso!` });
      setNewCellarName('');
      setNewCellarDesc('');
      setTimeout(() => setActiveTab('list'), 1200);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao criar adega compartilhada.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);
    try {
      const joined = await onJoinCellar(inviteCodeInput);
      setFeedback({ type: 'success', message: `Você entrou na adega "${joined.name}"!` });
      setInviteCodeInput('');
      setTimeout(() => {
        setActiveTab('list');
        onClose();
      }, 1200);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Código inválido ou adega não encontrada.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (!activeCellar.invite_code) return;
    navigator.clipboard.writeText(activeCellar.invite_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShareWhatsApp = () => {
    if (!activeCellar.invite_code) return;
    const text = encodeURIComponent(
      `🍷 Olá! Convido você a participar da minha adega compartilhada "${activeCellar.name}" no VinoVision AI!\n\n` +
      `🔑 Use este Código de Convite no app: *${activeCellar.invite_code}*\n\n` +
      `Acesse: ${window.location.origin}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        background: 'rgba(20, 14, 17, 0.65)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
      onClick={onClose}
    >
      <div
        className="glass-card animate-fadeIn"
        style={{
          width: '100%',
          maxWidth: '38rem',
          background: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: '0 25px 60px -15px rgba(35, 20, 25, 0.35)',
          border: '1.5px solid rgba(184, 141, 34, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── HEADER DO MODAL ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.5rem 1.75rem',
            borderBottom: '1px solid var(--border-clean)',
            background: 'linear-gradient(135deg, #FAF8F5 0%, #FFFFFF 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: '#FDF2F4',
                border: '1.5px solid rgba(114,27,41,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Users style={{ width: '22px', height: '22px', color: 'var(--wine-primary)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', color: 'var(--text-main)', fontWeight: 800, lineHeight: 1.25, margin: 0 }}>
                Adegas & Confrarias
              </h2>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                Gerencie suas adegas pessoais e confrarias compartilhadas
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '99px',
              background: '#FAF8F5',
              border: '1px solid var(--border-clean)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              transition: 'all 0.2s',
              flexShrink: 0
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F3EFE8'}
            onMouseLeave={e => e.currentTarget.style.background = '#FAF8F5'}
          >
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* ── TABS DE NAVEGAÇÃO ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.75rem 0',
            background: '#FAF8F5',
            borderBottom: '1px solid var(--border-clean)',
            overflowX: 'auto'
          }}
        >
          {[
            { id: 'list',   label: 'Minhas Adegas', icon: Wine },
            { id: 'create', label: 'Criar Nova',    icon: Plus },
            { id: 'join',   label: 'Entrar com Código', icon: Key },
            ...(!activeCellar.isPersonal ? [{ id: 'manage', label: 'Membros & Convite', icon: Users }] : [])
          ].map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => { setActiveTab(id); setFeedback(null); }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? 'var(--wine-primary)' : 'var(--text-secondary)',
                  borderBottom: isActive ? '3px solid var(--wine-primary)' : '3px solid transparent',
                  background: 'transparent',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                <Icon style={{ width: '16px', height: '16px' }} />
                {label}
              </button>
            );
          })}
        </div>

        {/* ── FEEDBACK ALERTS ── */}
        {feedback && (
          <div
            style={{
              margin: '1.25rem 1.75rem 0',
              padding: '0.875rem 1.25rem',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: feedback.type === 'success' ? '#ECFDF5' : '#FEF2F2',
              color: feedback.type === 'success' ? '#065F46' : '#991B1B',
              border: feedback.type === 'success' ? '1px solid #A7F3D0' : '1px solid #FECACA'
            }}
          >
            {feedback.type === 'success' ? <Check style={{ width: '16px', height: '16px' }} /> : <AlertCircle style={{ width: '16px', height: '16px' }} />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* ── CORPO DO MODAL COM PADDING GENEROSO ── */}
        <div style={{ padding: '1.75rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* ── ABA 1: LISTA DE ADEGAS ── */}
          {activeTab === 'list' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.09em', fontWeight: 800, color: 'var(--gold-accent)', display: 'block' }}>
                Selecione a Adega que Deseja Visualizar:
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {cellarsList.map(cellar => {
                  const isCurrent = cellar.id === activeCellarId;
                  return (
                    <div
                      key={cellar.id}
                      onClick={() => { onSelectCellar(cellar.id); onClose(); }}
                      style={{
                        padding: '1.25rem 1.5rem',
                        borderRadius: '16px',
                        border: isCurrent ? '2px solid var(--gold-accent)' : '1px solid var(--border-clean)',
                        background: isCurrent ? '#FDF8EB' : '#FFFFFF',
                        boxShadow: isCurrent ? '0 6px 18px rgba(184, 141, 34, 0.12)' : '0 2px 8px rgba(0,0,0,0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        gap: '1rem'
                      }}
                      onMouseEnter={e => {
                        if (!isCurrent) {
                          e.currentTarget.style.borderColor = 'rgba(184, 141, 34, 0.4)';
                          e.currentTarget.style.background = '#FAF8F5';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isCurrent) {
                          e.currentTarget.style.borderColor = 'var(--border-clean)';
                          e.currentTarget.style.background = '#FFFFFF';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            background: isCurrent ? 'var(--wine-primary)' : '#FAF8F5',
                            color: isCurrent ? '#FFFFFF' : 'var(--wine-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid var(--border-clean)',
                            flexShrink: 0
                          }}
                        >
                          {cellar.isPersonal ? <Wine style={{ width: '20px', height: '20px' }} /> : <Users style={{ width: '20px', height: '20px' }} />}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <h4 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)', margin: 0 }}>
                              {cellar.name}
                            </h4>
                            {cellar.isPersonal && (
                              <span style={{ fontSize: '0.7rem', background: '#FFFFFF', padding: '2px 8px', borderRadius: '99px', border: '1px solid var(--border-clean)', color: 'var(--text-muted)', fontWeight: 700 }}>
                                Privada
                              </span>
                            )}
                            {!cellar.isPersonal && (
                              <span style={{ fontSize: '0.7rem', background: '#ECFDF5', padding: '2px 8px', borderRadius: '99px', border: '1px solid #A7F3D0', color: '#065F46', fontWeight: 700 }}>
                                Compartilhada {cellar.role === 'OWNER' ? '(Criador)' : ''}
                              </span>
                            )}
                          </div>
                          {cellar.description && (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                              {cellar.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {isCurrent ? (
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--gold-accent)', display: 'inline-flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                          <Check style={{ width: '16px', height: '16px' }} /> Ativa
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, flexShrink: 0 }}>
                          Selecionar →
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Botões de Ação na Base */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-clean)' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('create')}
                  className="btn-gold"
                  style={{ justifyContent: 'center', fontSize: '0.85rem', padding: '12px 16px' }}
                >
                  <Plus style={{ width: '16px', height: '16px' }} />
                  Criar Nova Adega
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('join')}
                  className="btn-ghost"
                  style={{ justifyContent: 'center', fontSize: '0.85rem', padding: '12px 16px', background: '#FFFFFF', border: '1px solid var(--border-clean)' }}
                >
                  <Key style={{ width: '16px', height: '16px' }} />
                  Entrar com Código
                </button>
              </div>
            </div>
          )}

          {/* ── ABA 2: CRIAR NOVA ADEGA ── */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.09em', fontWeight: 800, color: 'var(--text-main)', display: 'block' }}>
                  Nome da Adega Compartilhada: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Adega da Família, Confraria dos Amigos, Adega da Praia..."
                  value={newCellarName}
                  onChange={e => setNewCellarName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1.15rem',
                    borderRadius: '12px',
                    border: '1.5px solid var(--border-clean)',
                    outline: 'none',
                    fontSize: '0.95rem',
                    color: 'var(--text-main)',
                    background: '#FAF8F5',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--gold-accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-clean)'}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.09em', fontWeight: 800, color: 'var(--text-main)', display: 'block' }}>
                  Descrição (Opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ex: Vinhos guardados para encontros de fim de semana"
                  value={newCellarDesc}
                  onChange={e => setNewCellarDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1.15rem',
                    borderRadius: '12px',
                    border: '1.5px solid var(--border-clean)',
                    outline: 'none',
                    fontSize: '0.95rem',
                    color: 'var(--text-main)',
                    background: '#FAF8F5',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--gold-accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-clean)'}
                />
              </div>

              <div style={{ padding: '1rem 1.25rem', borderRadius: '14px', background: '#FDF8EB', border: '1px solid rgba(184,141,34,0.3)', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <Sparkles style={{ width: '20px', height: '20px', color: 'var(--gold-accent)', flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '0.825rem', color: '#8C6810', lineHeight: 1.6, margin: 0 }}>
                  Ao criar a adega, um <strong>Código de Convite Único</strong> será gerado automaticamente para que você convide outros membros via WhatsApp ou link.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !newCellarName.trim()}
                className="btn-wine"
                style={{ justifyContent: 'center', padding: '14px 20px', fontSize: '0.95rem', marginTop: '0.5rem' }}
              >
                {isSubmitting ? 'Criando Adega…' : 'Criar Adega Compartilhada'}
              </button>
            </form>
          )}

          {/* ── ABA 3: ENTRAR COM CÓDIGO ── */}
          {activeTab === 'join' && (
            <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.09em', fontWeight: 800, color: 'var(--text-main)', display: 'block' }}>
                  Digite o Código de Convite: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: VINO-7821"
                  value={inviteCodeInput}
                  onChange={e => setInviteCodeInput(e.target.value.toUpperCase())}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '14px',
                    border: '2px solid rgba(184, 141, 34, 0.4)',
                    outline: 'none',
                    fontSize: '1.5rem',
                    letterSpacing: '0.15em',
                    fontWeight: 800,
                    textAlign: 'center',
                    fontFamily: 'monospace',
                    background: '#FAF8F5',
                    color: 'var(--wine-primary)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.6, margin: 0 }}>
                Peça o código de convite de 6 dígitos para o criador da confraria ou adega.
              </p>

              <button
                type="submit"
                disabled={isSubmitting || !inviteCodeInput.trim()}
                className="btn-gold"
                style={{ justifyContent: 'center', padding: '14px 20px', fontSize: '0.95rem', marginTop: '0.5rem' }}
              >
                {isSubmitting ? 'Verificando Código…' : 'Entrar na Adega'}
              </button>
            </form>
          )}

          {/* ── ABA 4: GERENCIAR MEMBROS (ADEGA COMPARTILHADA ATIVA) ── */}
          {activeTab === 'manage' && !activeCellar.isPersonal && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Card do Código de Convite */}
              <div
                style={{
                  padding: '1.5rem',
                  borderRadius: '18px',
                  border: '1.5px solid rgba(184, 141, 34, 0.4)',
                  background: 'linear-gradient(135deg, #FDF8EB 0%, #FFFFFF 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.725rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, color: '#8C6810' }}>
                    Código de Convite Desta Adega
                  </span>
                  <h3 style={{ fontFamily: 'monospace', fontSize: '1.85rem', fontWeight: 800, color: 'var(--wine-primary)', letterSpacing: '0.1em', margin: '4px 0 0' }}>
                    {activeCellar.invite_code || 'VINO-XXXX'}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                    Envie este código para amigos ou familiares entrarem nesta adega.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="btn-ghost"
                    style={{ flex: 1, justifyContent: 'center', padding: '10px 16px', fontSize: '0.85rem', background: '#FFFFFF', border: '1px solid var(--border-clean)' }}
                  >
                    {copiedCode ? <Check style={{ width: '16px', height: '16px', color: '#065F46' }} /> : <Copy style={{ width: '16px', height: '16px' }} />}
                    {copiedCode ? 'Copiado!' : 'Copiar Código'}
                  </button>

                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="btn-gold"
                    style={{ flex: 1, justifyContent: 'center', padding: '10px 16px', fontSize: '0.85rem', background: '#25D366', color: '#FFFFFF', borderColor: '#25D366' }}
                  >
                    <MessageCircle style={{ width: '16px', height: '16px' }} />
                    Convidar no WhatsApp
                  </button>
                </div>
              </div>

              {/* Lista de Membros */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.09em', fontWeight: 800, color: 'var(--text-muted)' }}>
                    Membros da Adega ({cellarMembers.length})
                  </span>
                  {loadingMembers && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Carregando…</span>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '12rem', overflowY: 'auto' }}>
                  {cellarMembers.length === 0 && !loadingMembers ? (
                    <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', background: '#FAF8F5', borderRadius: '12px', border: '1px solid var(--border-clean)' }}>
                      Nenhum membro cadastrado nesta adega ainda.
                    </div>
                  ) : (
                    cellarMembers.map(member => (
                      <div
                        key={member.id}
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: '12px',
                          background: '#FAF8F5',
                          border: '1px solid var(--border-clean)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '99px',
                              background: member.role === 'OWNER' ? 'linear-gradient(135deg, #B88D22, #721B29)' : '#FFFFFF',
                              color: member.role === 'OWNER' ? '#FFFFFF' : 'var(--text-main)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '0.75rem',
                              border: '1px solid var(--border-clean)'
                            }}
                          >
                            {(member.email || 'U').substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                              {member.name || member.email?.split('@')[0]}
                              {member.user_id === currentUserId && ' (Você)'}
                            </span>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>{member.email}</p>
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            borderRadius: '99px',
                            fontWeight: 700,
                            background: member.role === 'OWNER' ? '#FDF8EB' : '#FFFFFF',
                            color: member.role === 'OWNER' ? '#8C6810' : 'var(--text-secondary)',
                            border: '1px solid var(--border-clean)'
                          }}
                        >
                          {member.role === 'OWNER' ? '👑 Criador' : 'Membro'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Botões de Ação de Perigo (Sair ou Excluir) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginTop: '1rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-clean)' }}>
                {activeCellar.role !== 'OWNER' ? (
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm(`Deseja realmente sair da adega "${activeCellar.name}"?`)) {
                        await onLeaveCellar(activeCellar.id);
                        onClose();
                      }
                    }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#DC2626',
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <LogOut style={{ width: '14px', height: '14px' }} />
                    Sair desta Adega
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm(`TEM CERTEZA? Excluir a adega "${activeCellar.name}" removerá o acesso de todos os membros permanentemente.`)) {
                        await onDeleteCellar(activeCellar.id);
                        onClose();
                      }
                    }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#DC2626',
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Trash2 style={{ width: '14px', height: '14px' }} />
                    Excluir Adega
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
