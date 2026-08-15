import React, { useState } from 'react';
import {
  Users, Plus, Key, Copy, Check, Share2, LogOut, Trash2,
  Wine, ShieldCheck, User, X, Sparkles, MessageCircle
} from 'lucide-react';

export default function SharedCellarModal({
  isOpen,
  onClose,
  cellarsList,
  activeCellar,
  activeCellarId,
  onSelectCellar,
  onCreateCellar,
  onJoinCellar,
  onLeaveCellar,
  onDeleteCellar,
  cellarMembers,
  loadingMembers,
  currentUserId
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState(activeCellar.isPersonal ? 'list' : 'manage');
  const [newCellarName, setNewCellarName] = useState('');
  const [newCellarDesc, setNewCellarDesc] = useState('');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCellarName.trim()) return;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      await onCreateCellar(newCellarName.trim(), newCellarDesc.trim());
      setNewCellarName('');
      setNewCellarDesc('');
      setFeedback({ type: 'success', message: 'Adega compartilhada criada com sucesso!' });
      setActiveTab('manage');
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao criar adega.' });
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
      const joined = await onJoinCellar(inviteCodeInput.trim());
      setInviteCodeInput('');
      setFeedback({ type: 'success', message: `Você entrou na adega "${joined.name}"!` });
      setActiveTab('manage');
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Código inválido ou não encontrado.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (!activeCellar.invite_code) return;
    navigator.clipboard.writeText(activeCellar.invite_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleShareWhatsApp = () => {
    if (!activeCellar.invite_code) return;
    const text = encodeURIComponent(
      `🍷 Olá! Convido você para participar da nossa adega compartilhada "${activeCellar.name}" no VinoVision AI!\n\n` +
      `🔑 Código de Convite: ${activeCellar.invite_code}\n\n` +
      `Acesse o app e digite o código para gerenciar garrafas e avaliar vinhos conosco!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(26, 20, 22, 0.75)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="glass-card w-full max-w-2xl overflow-hidden animate-fadeIn"
        style={{
          background: '#FFFFFF',
          borderRadius: 'var(--radius-2xl)',
          boxShadow: '0 25px 60px -15px rgba(35, 20, 25, 0.3)',
          border: '1.5px solid rgba(184, 141, 34, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── HEADER ── */}
        <div
          className="flex items-center justify-between p-6"
          style={{
            borderBottom: '1px solid var(--border-clean)',
            background: 'linear-gradient(135deg, #FAF8F5 0%, #FFFFFF 100%)'
          }}
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#FDF2F4',
                border: '1px solid rgba(114,27,41,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Users style={{ width: '22px', height: '22px', color: 'var(--wine-primary)' }} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', color: 'var(--text-main)', fontWeight: 700 }}>
                Adegas & Confrarias
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Gerencie suas adegas pessoais e coleções compartilhadas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '99px',
              background: '#FAF8F5',
              border: '1px solid var(--border-clean)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)'
            }}
          >
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* ── TABS ── */}
        <div className="flex border-b border-black/5 bg-[#FAF8F5] px-6 gap-2 overflow-x-auto">
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
                onClick={() => { setActiveTab(id); setFeedback(null); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 14px',
                  fontSize: '0.825rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--wine-primary)' : 'var(--text-secondary)',
                  borderBottom: isActive ? '2px solid var(--wine-primary)' : '2px solid transparent',
                  background: 'transparent',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon style={{ width: '15px', height: '15px' }} />
                {label}
              </button>
            );
          })}
        </div>

        {/* ── FEEDBACK ALERTS ── */}
        {feedback && (
          <div
            className="mx-6 mt-4 p-3 rounded-lg text-xs font-semibold animate-fadeIn"
            style={{
              background: feedback.type === 'success' ? '#ECFDF5' : '#FEF2F2',
              color: feedback.type === 'success' ? '#065F46' : '#991B1B',
              border: feedback.type === 'success' ? '1px solid #A7F3D0' : '1px solid #FECACA'
            }}
          >
            {feedback.message}
          </div>
        )}

        {/* ── CORPO DO MODAL ── */}
        <div className="p-6 overflow-y-auto" style={{ flex: 1 }}>

          {/* ABA 1: LISTA DE ADEGAS */}
          {activeTab === 'list' && (
            <div className="flex flex-col gap-3">
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--text-muted)' }}>
                Selecione a adega que deseja visualizar:
              </span>

              <div className="flex flex-col gap-2">
                {cellarsList.map(cellar => {
                  const isCurrent = cellar.id === activeCellarId;
                  return (
                    <div
                      key={cellar.id}
                      onClick={() => { onSelectCellar(cellar.id); onClose(); }}
                      className="p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-200"
                      style={{
                        background: isCurrent ? '#FDF8EB' : '#FAF8F5',
                        borderColor: isCurrent ? 'var(--gold-accent)' : 'var(--border-clean)',
                        boxShadow: isCurrent ? '0 4px 12px rgba(184, 141, 34, 0.12)' : 'none'
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: isCurrent ? 'var(--wine-primary)' : '#FFFFFF',
                            color: isCurrent ? '#FFFFFF' : 'var(--wine-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid var(--border-clean)'
                          }}
                        >
                          {cellar.isPersonal ? <Wine style={{ width: '18px', height: '18px' }} /> : <Users style={{ width: '18px', height: '18px' }} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                              {cellar.name}
                            </h4>
                            {cellar.isPersonal && (
                              <span style={{ fontSize: '0.65rem', background: '#FFFFFF', padding: '2px 8px', borderRadius: '99px', border: '1px solid var(--border-clean)', color: 'var(--text-muted)', fontWeight: 600 }}>
                                Privada
                              </span>
                            )}
                            {!cellar.isPersonal && (
                              <span style={{ fontSize: '0.65rem', background: '#ECFDF5', padding: '2px 8px', borderRadius: '99px', border: '1px solid #A7F3D0', color: '#065F46', fontWeight: 600 }}>
                                Compartilhada {cellar.role === 'OWNER' ? '(Criador)' : ''}
                              </span>
                            )}
                          </div>
                          {cellar.description && (
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              {cellar.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {isCurrent ? (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold-accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Check style={{ width: '14px', height: '14px' }} /> Ativa
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Selecionar →
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-black/5">
                <button
                  onClick={() => setActiveTab('create')}
                  className="btn-gold"
                  style={{ justifyContent: 'center', fontSize: '0.8rem', padding: '10px' }}
                >
                  <Plus style={{ width: '15px', height: '15px' }} />
                  Criar Nova Adega
                </button>
                <button
                  onClick={() => setActiveTab('join')}
                  className="btn-ghost"
                  style={{ justifyContent: 'center', fontSize: '0.8rem', padding: '10px', background: '#FFFFFF', border: '1px solid var(--border-clean)' }}
                >
                  <Key style={{ width: '15px', height: '15px' }} />
                  Entrar com Código
                </button>
              </div>
            </div>
          )}

          {/* ABA 2: CRIAR NOVA ADEGA */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--text-main)' }}>
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
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-clean)',
                    outline: 'none',
                    fontSize: '0.9rem',
                    background: '#FAF8F5'
                  }}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--text-main)' }}>
                  Descrição (Opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ex: Vinhos guardados para encontros de fim de semana"
                  value={newCellarDesc}
                  onChange={e => setNewCellarDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-clean)',
                    outline: 'none',
                    fontSize: '0.9rem',
                    background: '#FAF8F5'
                  }}
                />
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-black/5 flex items-start gap-3">
                <Sparkles style={{ width: '20px', height: '20px', color: 'var(--gold-accent)', flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Ao criar a adega, um <strong>Código de Convite Único</strong> será gerado automaticamente para que você convide outros membros via WhatsApp ou link.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !newCellarName.trim()}
                className="btn-wine"
                style={{ justifyContent: 'center', marginTop: '8px' }}
              >
                {isSubmitting ? 'Criando Adega…' : 'Criar Adega Compartilhada'}
              </button>
            </form>
          )}

          {/* ABA 3: ENTRAR COM CÓDIGO */}
          {activeTab === 'join' && (
            <form onSubmit={handleJoin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--text-main)' }}>
                  Código de Convite da Adega:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: VINO-7821"
                  value={inviteCodeInput}
                  onChange={e => setInviteCodeInput(e.target.value.toUpperCase())}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-clean)',
                    outline: 'none',
                    fontSize: '1.25rem',
                    letterSpacing: '0.15em',
                    fontWeight: 800,
                    textAlign: 'center',
                    fontFamily: 'monospace',
                    background: '#FAF8F5',
                    color: 'var(--wine-primary)'
                  }}
                />
              </div>

              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                Peça o código de convite de 6 dígitos para o administrador ou criador da adega.
              </p>

              <button
                type="submit"
                disabled={isSubmitting || !inviteCodeInput.trim()}
                className="btn-gold"
                style={{ justifyContent: 'center', marginTop: '8px' }}
              >
                {isSubmitting ? 'Verificando Código…' : 'Entrar na Adega'}
              </button>
            </form>
          )}

          {/* ABA 4: GERENCIAR MEMBROS & CÓDIGO (ADEGA COMPARTILHADA ATIVA) */}
          {activeTab === 'manage' && !activeCellar.isPersonal && (
            <div className="flex flex-col gap-5">
              {/* Card do Código de Convite */}
              <div
                className="p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4"
                style={{
                  background: 'linear-gradient(135deg, #FDF8EB 0%, #FFFFFF 100%)',
                  borderColor: 'rgba(184, 141, 34, 0.4)'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: '#8C6810' }}>
                    Código de Convite Desta Adega
                  </span>
                  <h3 style={{ fontFamily: 'monospace', fontSize: '1.75rem', fontWeight: 800, color: 'var(--wine-primary)', letterSpacing: '0.1em', marginTop: '2px' }}>
                    {activeCellar.invite_code || 'VINO-XXXX'}
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Envie este código para amigos ou familiares entrarem nesta adega.
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="btn-ghost flex-1 sm:flex-initial"
                    style={{ padding: '8px 14px', fontSize: '0.8rem', background: '#FFFFFF', border: '1px solid var(--border-clean)' }}
                  >
                    {copiedCode ? <Check style={{ width: '15px', height: '15px', color: '#065F46' }} /> : <Copy style={{ width: '15px', height: '15px' }} />}
                    {copiedCode ? 'Copiado!' : 'Copiar'}
                  </button>

                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="btn-gold flex-1 sm:flex-initial"
                    style={{ padding: '8px 14px', fontSize: '0.8rem', background: '#25D366', color: '#FFFFFF', borderColor: '#25D366' }}
                  >
                    <MessageCircle style={{ width: '15px', height: '15px' }} />
                    WhatsApp
                  </button>
                </div>
              </div>

              {/* Lista de Membros */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--text-muted)' }}>
                    Membros da Adega ({cellarMembers.length})
                  </span>
                  {loadingMembers && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Carregando…</span>}
                </div>

                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                  {cellarMembers.length === 0 && !loadingMembers ? (
                    <div className="p-4 text-center text-xs text-secondary bg-[#FAF8F5] rounded-xl border border-black/5">
                      Nenhum membro cadastrado nesta adega ainda.
                    </div>
                  ) : (
                    cellarMembers.map(member => (
                      <div
                        key={member.id}
                        className="p-3 rounded-xl bg-[#FAF8F5] border border-black/5 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '99px',
                              background: '#FFFFFF',
                              border: '1px solid var(--border-clean)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              color: 'var(--wine-primary)'
                            }}
                          >
                            {member.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                {member.fullName}
                              </span>
                              {member.userId === currentUserId && (
                                <span style={{ fontSize: '0.65rem', background: '#FDF2F4', padding: '1px 6px', borderRadius: '4px', color: 'var(--wine-primary)', fontWeight: 600 }}>
                                  Você
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              {member.email}
                            </span>
                          </div>
                        </div>

                        <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: '99px', background: member.role === 'OWNER' ? '#FDF8EB' : '#FFFFFF', color: member.role === 'OWNER' ? '#8C6810' : 'var(--text-secondary)', border: '1px solid var(--border-clean)' }}>
                          {member.role === 'OWNER' ? '👑 Criador' : 'Membro'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Ações de Sair / Excluir */}
              <div className="pt-4 border-t border-black/5 flex justify-end gap-3">
                {activeCellar.role === 'OWNER' ? (
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm(`Tem certeza que deseja excluir permanentemente a adega "${activeCellar.name}"?`)) {
                        await onDeleteCellar(activeCellar.id);
                        onClose();
                      }
                    }}
                    className="btn-ghost"
                    style={{ color: '#DC2626', fontSize: '0.8rem' }}
                  >
                    <Trash2 style={{ width: '15px', height: '15px' }} />
                    Excluir Adega
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm(`Deseja sair da adega "${activeCellar.name}"?`)) {
                        await onLeaveCellar(activeCellar.id);
                        onClose();
                      }
                    }}
                    className="btn-ghost"
                    style={{ color: '#DC2626', fontSize: '0.8rem' }}
                  >
                    <LogOut style={{ width: '15px', height: '15px' }} />
                    Sair Desta Adega
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
