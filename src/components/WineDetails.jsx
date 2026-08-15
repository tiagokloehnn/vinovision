import React, { useState, useEffect } from 'react';
import {
  Star, MapPin, Calendar, Wine, Thermometer, Clock,
  Award, Bookmark, Check, Share2, ArrowLeft, Sparkles,
  DollarSign, UtensilsCrossed, Quote, Percent, Edit3, MessageSquare, Tag, Heart
} from 'lucide-react';
import TastingRadar from './TastingRadar';

export default function WineDetails({
  wine,
  onBack,
  onSaveCellar,
  onUpdateReview,
  isSaved,
  currentUserId,
  activeCellar
}) {
  if (!wine) return null;

  const [personalRating, setPersonalRating] = useState(wine.userRating || 0);
  const [hoverRating, setHoverRating]       = useState(0);
  const [personalReview, setPersonalReview] = useState(wine.userReview || '');
  const [personalOccasion, setPersonalOccasion] = useState(wine.userOccasion || '');
  const [isEditing, setIsEditing]           = useState(!wine.userRating && !wine.userReview);
  const [saveStatus, setSaveStatus]         = useState('idle'); // 'idle' | 'saving' | 'saved'

  useEffect(() => {
    setPersonalRating(wine.userRating || 0);
    setPersonalReview(wine.userReview || '');
    setPersonalOccasion(wine.userOccasion || '');
    setIsEditing(!wine.userRating && !wine.userReview);
  }, [wine]);

  const RATING_LABELS = {
    1: '1.0 — Não agradou',
    2: '2.0 — Regular / Simples',
    3: '3.0 — Bom vinho',
    4: '4.0 — Muito bom / Recomendado',
    5: '5.0 — Excepcional / Memorável'
  };

  const OCCASIONS = [
    'Jantar Especial',
    'Com Amigos',
    'Comemoração',
    'Dia a Dia',
    'Churrasco',
    'Queijos & Vinhos',
    'Presente'
  ];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: wine.name, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado!');
    }
  };

  const handleSaveEvaluation = async () => {
    if (!onUpdateReview) return;
    setSaveStatus('saving');
    try {
      await onUpdateReview(wine, {
        userRating: personalRating,
        userReview: personalReview.trim(),
        userOccasion: personalOccasion
      });
      setSaveStatus('saved');
      setIsEditing(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus('idle');
      alert('Erro ao salvar avaliação na adega.');
    }
  };

  const activeDisplayRating = hoverRating || personalRating;

  return (
    <div className="w-full max-w-6xl mx-auto animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>

      {/* ── BARRA DE AÇÕES ── */}
      <div className="flex items-center justify-between flex-wrap" style={{ gap: 'var(--space-3)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--border-clean)' }}>
        <button onClick={onBack} className="btn-ghost">
          <ArrowLeft style={{ width: 'var(--text-base)', height: 'var(--text-base)', color: 'var(--wine-primary)' }} />
          Voltar
        </button>

        <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
          <button onClick={handleShare} className="btn-ghost" title="Compartilhar"
            style={{ padding: 'var(--space-2) var(--space-3)', borderRadius: '99px' }}>
            <Share2 style={{ width: 'var(--text-base)', height: 'var(--text-base)', color: 'var(--gold-accent)' }} />
          </button>

          <button
            onClick={() => onSaveCellar(wine)}
            className={isSaved ? "btn-gold" : "btn-wine"}
          >
            {isSaved ? (
              <><Check style={{ width: 'var(--text-base)', height: 'var(--text-base)' }} /> Salvo na Adega</>
            ) : (
              <><Bookmark style={{ width: 'var(--text-base)', height: 'var(--text-base)' }} /> Guardar na Adega</>
            )}
          </button>
        </div>
      </div>

      {/* ── BLOCO 1: HERO (FOTO + DETALHES) ── */}
      <div className="glass-card grid grid-cols-1 lg:grid-cols-12 items-start overflow-hidden"
        style={{ padding: 'clamp(1.25rem, 3vw, 2.25rem)', gap: 'clamp(1.5rem, 3vw, 2.5rem)', background: '#FFFFFF' }}>

        {/* COLUNA ESQUERDA — Foto + Specs */}
        <div className="lg:col-span-5 flex flex-col items-center w-full" style={{ gap: 'var(--space-5)' }}>

          {/* Imagem da Garrafa — Aspecto Fixo 3:4 */}
          <div className="relative group w-full overflow-hidden border border-black/10 shadow-lg bg-[#FAF8F5]"
            style={{ maxWidth: 'min(280px, 85vw)', aspectRatio: '3/4', borderRadius: 'var(--radius-2xl)', boxShadow: '0 15px 35px -5px rgba(35,20,25,0.12)', margin: '0 auto' }}>
            <img
              src={wine.image} alt={wine.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1416]/60 via-transparent to-transparent pointer-events-none" />

            {/* Badge tipo */}
            <div className="absolute flex items-center border border-black/10"
              style={{ top: 'var(--space-3)', left: 'var(--space-3)', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', padding: `4px 12px`, borderRadius: '99px', fontSize: 'var(--text-xs)', color: 'var(--text-main)', gap: 'var(--space-1)', fontWeight: 600, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <Wine style={{ width: 'var(--text-sm)', height: 'var(--text-sm)', color: 'var(--wine-primary)' }} />
              {wine.typeName || wine.type}
            </div>

            {/* Badge rating da Crítica / Geral */}
            <div className="absolute flex items-center font-bold"
              style={{ bottom: 'var(--space-3)', right: 'var(--space-3)', background: '#FFFFFF', backdropFilter: 'blur(8px)', padding: `4px 12px`, borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: '#8C6810', gap: 'var(--space-1)', border: '1px solid rgba(184,141,34,0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <Star style={{ width: 'var(--text-base)', height: 'var(--text-base)', fill: '#D4AF37', color: '#D4AF37' }} />
              <span>{wine.rating}</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>Global</span>
            </div>
          </div>

          {/* Specs Tiles — Grid 2×2 */}
          <div className="grid grid-cols-2 w-full" style={{ gap: 'var(--space-2)', maxWidth: 'min(320px, 100%)' }}>
            {[
              { Icon: DollarSign, label: 'Preço Médio',    value: wine.priceEstimate },
              { Icon: Thermometer,label: 'Temperatura',    value: wine.serveTemp     },
              { Icon: Clock,      label: 'Decantação',     value: wine.decantTime    },
              { Icon: Percent,    label: 'Teor Alcoólico', value: wine.alcohol       },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="spec-tile" style={{ padding: 'clamp(0.6rem, 1.5vw, 0.875rem)' }}>
                <Icon className="spec-icon" />
                <span className="spec-label">{label}</span>
                <span className="spec-value" style={{ wordBreak: 'break-word' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* COLUNA DIREITA — Informações Editoriais */}
        <div className="lg:col-span-7 text-left w-full" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

          {/* Badges */}
          <div className="flex flex-wrap" style={{ gap: 'var(--space-2)' }}>
            {wine.aiProvider && (
              <span className="flex items-center font-bold" style={{ gap: 'var(--space-1)', padding: `4px 12px`, borderRadius: '99px', background: '#ECFDF5', border: '1px solid #A7F3D0', fontSize: 'var(--text-xs)', color: '#065F46' }}>
                <Sparkles style={{ width: 'var(--text-sm)', height: 'var(--text-sm)' }} />
                {wine.aiProvider}
              </span>
            )}
            <span className="badge-wine">
              <span>{wine.flagEmoji}</span>
              {wine.country}
            </span>
            <span className="flex items-center" style={{ gap: 'var(--space-1)', padding: `4px 12px`, borderRadius: '99px', background: '#FAF8F5', border: '1px solid var(--border-clean)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 600 }}>
              <MapPin style={{ width: 'var(--text-sm)', height: 'var(--text-sm)', color: 'var(--gold-accent)', flexShrink: 0 }} />
              {wine.region}
            </span>
            <span className="flex items-center" style={{ gap: 'var(--space-1)', padding: `4px 12px`, borderRadius: '99px', background: '#FAF8F5', border: '1px solid var(--border-clean)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 600 }}>
              <Calendar style={{ width: 'var(--text-sm)', height: 'var(--text-sm)', color: 'var(--gold-accent)', flexShrink: 0 }} />
              Safra {wine.vintage}
            </span>
          </div>

          {/* Nome */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <p style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700, color: 'var(--gold-accent)' }}>
              {wine.winery}
            </p>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-4xl)', lineHeight: 1.15, color: 'var(--text-main)', wordBreak: 'break-word', fontWeight: 700 }}>
              {wine.name}
            </h1>
          </div>

          {/* Descrição Geral / O que falam sobre ele */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <p style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 700 }}>
              Sobre Este Vinho (Ficha & Opinião Técnica):
            </p>
            <p style={{ fontSize: 'var(--text-base)', lineHeight: 1.8, color: 'var(--text-secondary)', wordBreak: 'break-word' }}>
              {wine.description}
            </p>
          </div>

          {/* Castas */}
          <div style={{ paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-clean)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <p style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 700 }}>
              Castas / Variedades Nobres:
            </p>
            <div className="flex flex-wrap" style={{ gap: 'var(--space-2)' }}>
              {wine.grapes?.map((grape, idx) => (
                <span key={idx} style={{ padding: `4px 12px`, borderRadius: 'var(--radius-md)', background: '#FDF2F4', border: '1px solid rgba(114,27,41,0.2)', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--wine-primary)' }}>
                  {grape}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── BLOCO 2: MINHA DEGUSTAÇÃO & AVALIAÇÃO PESSOAL (DESTAQUE LUXUOSO) ── */}
      <div className="glass-card w-full overflow-hidden"
        style={{
          padding: 'clamp(1.25rem, 3vw, 2.25rem)',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF8F5 100%)',
          border: '1.5px solid rgba(184, 141, 34, 0.4)',
          boxShadow: '0 12px 30px rgba(184, 141, 34, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-5)'
        }}
      >
        {/* Cabeçalho da Minha Avaliação */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between" style={{ gap: 'var(--space-3)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid rgba(184, 141, 34, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{ width: 'clamp(2.5rem,4vw,3rem)', height: 'clamp(2.5rem,4vw,3rem)', borderRadius: 'var(--radius-lg)', background: '#FDF8EB', border: '1px solid rgba(184,141,34,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Heart style={{ width: 'var(--text-lg)', height: 'var(--text-lg)', color: 'var(--wine-primary)', fill: personalRating > 0 ? 'var(--wine-primary)' : 'none' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'var(--text-main)', fontWeight: 700 }}>
                  Minha Avaliação Pessoal
                </h2>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, padding: '2px 8px', borderRadius: '99px', background: '#FDF8EB', color: '#8C6810', border: '1px solid rgba(184,141,34,0.3)' }}>
                  Diário da Adega
                </span>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Sua nota e impressões exclusivas de prova ficam salvas para sempre na sua adega.
              </p>
            </div>
          </div>

          {!isEditing && (personalRating > 0 || personalReview) && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-ghost"
              style={{ padding: '6px 14px', fontSize: '0.8rem', gap: '6px' }}
            >
              <Edit3 style={{ width: '14px', height: '14px' }} />
              Editar Minha Nota
            </button>
          )}
        </div>

        {/* MODO EXIBIÇÃO (QUANDO JÁ AVALIADO E NÃO ESTÁ EDITANDO) */}
        {!isEditing && (personalRating > 0 || personalReview) ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between" style={{ gap: 'var(--space-3)', background: '#FFFFFF', padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-clean)' }}>
              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                  Sua Classificação Pessoal:
                </span>
                <div className="flex items-center" style={{ gap: 'var(--space-2)', marginTop: '4px' }}>
                  <div className="flex items-center" style={{ gap: '3px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        style={{
                          width: '22px',
                          height: '22px',
                          fill: star <= personalRating ? '#D4AF37' : '#E5E7EB',
                          color: star <= personalRating ? '#D4AF37' : '#D1D5DB'
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--wine-primary)', fontFamily: 'var(--font-heading)' }}>
                    {personalRating.toFixed(1)} / 5.0
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#8C6810', fontWeight: 600 }}>
                    ({RATING_LABELS[personalRating] || ''})
                  </span>
                </div>
              </div>

              {personalOccasion && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#FAF8F5', padding: '6px 14px', borderRadius: '99px', border: '1px solid var(--border-clean)', alignSelf: 'flex-start' }}>
                  <Tag style={{ width: '14px', height: '14px', color: 'var(--gold-accent)' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>{personalOccasion}</span>
                </div>
              )}
            </div>

            {personalReview && (
              <div style={{ background: '#FFFFFF', padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-clean)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                  Minhas Notas & Percepções de Prova:
                </span>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.8, fontStyle: 'italic', background: '#FAF8F5', padding: '1rem', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--wine-primary)' }}>
                  "{personalReview}"
                </p>
                {wine.userReviewedAt && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                    Avaliado em {new Date(wine.userReviewedAt).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          /* MODO FORMULÁRIO DE AVALIAÇÃO */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {/* 1. Seletor de Estrelas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'var(--text-main)' }}>
                1. Sua Nota para este Vinho:
              </label>
              <div className="flex items-center flex-wrap" style={{ gap: 'var(--space-3)' }}>
                <div className="flex items-center" style={{ gap: '6px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setPersonalRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', transition: 'transform 0.15s ease' }}
                      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                      onMouseUp={e => e.currentTarget.style.transform = 'scale(1.15)'}
                    >
                      <Star
                        style={{
                          width: '32px',
                          height: '32px',
                          fill: star <= activeDisplayRating ? '#D4AF37' : '#E5E7EB',
                          color: star <= activeDisplayRating ? '#D4AF37' : '#D1D5DB',
                          transition: 'all 0.2s ease'
                        }}
                      />
                    </button>
                  ))}
                </div>

                {activeDisplayRating > 0 && (
                  <span className="animate-fadeIn" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--wine-primary)', background: '#FDF8EB', padding: '4px 12px', borderRadius: '99px', border: '1px solid rgba(184,141,34,0.3)' }}>
                    {RATING_LABELS[activeDisplayRating]}
                  </span>
                )}
              </div>
            </div>

            {/* 2. Ocasião */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'var(--text-main)' }}>
                2. Ocasião / Momento da Degustação:
              </label>
              <div className="flex flex-wrap" style={{ gap: 'var(--space-2)' }}>
                {OCCASIONS.map(occ => {
                  const isSelected = personalOccasion === occ;
                  return (
                    <button
                      key={occ}
                      type="button"
                      onClick={() => setPersonalOccasion(isSelected ? '' : occ)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '99px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        border: isSelected ? '1px solid var(--wine-primary)' : '1px solid var(--border-clean)',
                        background: isSelected ? 'var(--wine-primary)' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : 'var(--text-secondary)'
                      }}
                    >
                      {occ}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Descrição Pessoal */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label htmlFor="personal-review-input" style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'var(--text-main)' }}>
                3. Minhas Impressões Pessoais (O que você achou desta garrafa?):
              </label>
              <textarea
                id="personal-review-input"
                rows={4}
                value={personalReview}
                onChange={e => setPersonalReview(e.target.value)}
                placeholder="Descreva o que sentiu na taça: aromas marcantes, equilíbrio, como acompanhou o prato, se compraria novamente..."
                style={{
                  width: '100%',
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-clean)',
                  background: '#FFFFFF',
                  fontSize: '0.925rem',
                  fontFamily: 'var(--font-sans)',
                  color: 'var(--text-main)',
                  lineHeight: 1.6,
                  resize: 'vertical',
                  outline: 'none',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)'
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--gold-accent)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border-clean)'}
              />
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center flex-wrap" style={{ gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
              <button
                type="button"
                onClick={handleSaveEvaluation}
                disabled={saveStatus === 'saving'}
                className="btn-wine"
                style={{ minWidth: '180px', justifyContent: 'center' }}
              >
                {saveStatus === 'saving' ? (
                  'Salvando na Adega…'
                ) : saveStatus === 'saved' ? (
                  <><Check style={{ width: '18px', height: '18px' }} /> Avaliação Salva!</>
                ) : (
                  <><Bookmark style={{ width: '18px', height: '18px' }} /> Salvar Minha Avaliação</>
                )}
              </button>

              {(wine.userRating || wine.userReview) && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-ghost"
                >
                  Cancelar
                </button>
              )}

              {saveStatus === 'saved' && (
                <span className="animate-fadeIn" style={{ fontSize: '0.85rem', color: '#065F46', fontWeight: 600 }}>
                  ✓ Salvo permanentemente na sua adega!
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── AVALIAÇÕES DOS DEMAIS MEMBROS DA ADEGA COMPARTILHADA ── */}
        {wine.reviews && Object.values(wine.reviews).filter(r => r.userId !== currentUserId && (r.rating > 0 || r.review)).length > 0 && (
          <div style={{ paddingTop: 'var(--space-4)', borderTop: '1px solid rgba(184, 141, 34, 0.2)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div className="flex items-center justify-between flex-wrap" style={{ gap: 'var(--space-2)' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--text-muted)' }}>
                Avaliações dos Membros da Adega:
              </span>
              {wine.groupAverageRating > 0 && (
                <span style={{ fontSize: '0.75rem', color: '#065F46', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '3px 10px', borderRadius: '99px', fontWeight: 700 }}>
                  👥 Média da Confraria: {wine.groupAverageRating}★
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 'var(--space-3)' }}>
              {Object.values(wine.reviews)
                .filter(r => r.userId !== currentUserId && (r.rating > 0 || r.review))
                .map((r, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#FFFFFF',
                      padding: 'var(--space-4)',
                      borderRadius: 'var(--radius-xl)',
                      border: '1px solid var(--border-clean)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-2)'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {r.userName || 'Membro do Grupo'}
                      </span>
                      {r.rating > 0 && (
                        <div className="flex items-center" style={{ gap: '3px', background: '#FDF8EB', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(184,141,34,0.3)' }}>
                          <Star style={{ width: '13px', height: '13px', fill: '#D4AF37', color: '#D4AF37' }} />
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8C6810' }}>{r.rating}★</span>
                        </div>
                      )}
                    </div>
                    {r.occasion && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--gold-accent)', fontWeight: 600 }}>
                        {r.occasion}
                      </span>
                    )}
                    {r.review && (
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.6 }}>
                        "{r.review}"
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* ── BLOCO 3: PERFIL GUSTATIVO + AROMAS (VISÃO TÉCNICA) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch" style={{ gap: 'var(--space-5)' }}>

        <div className="lg:col-span-7 w-full">
          <TastingRadar profile={wine.profile} />
        </div>

        <div className="lg:col-span-5 glass-card flex flex-col justify-between overflow-hidden w-full"
          style={{ padding: 'clamp(1.25rem, 3vw, 2rem)', gap: 'var(--space-5)', background: '#FFFFFF' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--border-clean)' }}>
              <p style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, color: 'var(--gold-accent)' }}>
                Olfato & Paladar
              </p>
              <h3 className="flex items-center" style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'var(--text-main)', marginTop: 'var(--space-1)', gap: 'var(--space-2)', fontWeight: 700 }}>
                <Sparkles style={{ width: 'var(--text-lg)', height: 'var(--text-lg)', color: 'var(--gold-accent)', flexShrink: 0 }} />
                Notas Aromáticas
              </h3>
            </div>

            <div className="flex flex-wrap" style={{ gap: 'var(--space-2)' }}>
              {wine.aromas?.map((aroma, idx) => (
                <div key={idx} className="flex items-center" style={{ gap: 'var(--space-2)', padding: `var(--space-2) var(--space-3)`, borderRadius: 'var(--radius-md)', background: '#FAF8F5', border: '1px solid var(--border-clean)', fontSize: 'var(--text-xs)', color: 'var(--text-main)', fontWeight: 600 }}>
                  <span style={{ fontSize: 'var(--text-base)', flexShrink: 0 }}>{aroma.icon}</span>
                  <span>{aroma.name}</span>
                </div>
              ))}
            </div>
          </div>

          {wine.awards?.length > 0 && (
            <div style={{ paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-clean)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <p className="flex items-center font-bold" style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold-accent)', gap: 'var(--space-2)' }}>
                <Award style={{ width: 'var(--text-sm)', height: 'var(--text-sm)' }} />
                Prêmios & Reconhecimento
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {wine.awards.map((award, i) => (
                  <div key={i} style={{ fontSize: 'var(--text-xs)', color: '#8C6810', background: '#FDF8EB', padding: `var(--space-2) var(--space-3)`, borderRadius: 'var(--radius-md)', border: '1px solid rgba(184,141,34,0.3)', fontWeight: 600 }}>
                    🏆 {award}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── BLOCO 4: HARMONIZAÇÃO ── */}
      <div className="glass-card overflow-hidden w-full" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', background: '#FFFFFF' }}>
        <div className="flex items-center" style={{ gap: 'var(--space-3)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-clean)' }}>
          <div className="flex items-center justify-center"
            style={{ width: 'clamp(2.25rem,3.5vw,2.75rem)', height: 'clamp(2.25rem,3.5vw,2.75rem)', borderRadius: 'var(--radius-lg)', background: '#FDF2F4', border: '1px solid rgba(114,27,41,0.18)', flexShrink: 0 }}>
            <UtensilsCrossed style={{ width: 'var(--text-base)', height: 'var(--text-base)', color: 'var(--wine-primary)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, color: 'var(--gold-accent)' }}>
              Sugestão Gastronômica
            </span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'var(--text-main)', fontWeight: 700 }}>
              Harmonização de Pratos
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--space-4)' }}>
          {wine.foodPairings?.map((pairing, idx) => (
            <div key={idx} className="text-left" style={{ background: '#FAF8F5', padding: 'var(--space-4) var(--space-5)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-clean)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', transition: 'all 0.25s ease' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(184,141,34,0.4)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(35,20,25,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-clean)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
                <span style={{ fontSize: 'clamp(1.5rem,3vw,1.875rem)', flexShrink: 0 }}>{pairing.icon}</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                  <span style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'var(--gold-accent)', display: 'block' }}>
                    {pairing.category}
                  </span>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-base)', color: 'var(--text-main)', fontWeight: 700 }}>
                    {pairing.title}
                  </h4>
                </div>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {pairing.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── BLOCO 5: PARECER DO SOMMELIER ── */}
      {wine.sommelierNote && (
        <div className="glass-card flex flex-col sm:flex-row items-start overflow-hidden w-full" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)', gap: 'var(--space-4)', background: '#FDF8EB', border: '1px solid rgba(184,141,34,0.3)' }}>
          <div className="flex items-center justify-center" style={{ width: 'clamp(2.25rem,3.5vw,2.75rem)', height: 'clamp(2.25rem,3.5vw,2.75rem)', borderRadius: 'var(--radius-lg)', background: '#FFFFFF', border: '1px solid rgba(184,141,34,0.3)', flexShrink: 0, boxShadow: '0 2px 8px rgba(184,141,34,0.15)' }}>
            <Quote style={{ width: 'var(--text-lg)', height: 'var(--text-lg)', color: 'var(--wine-primary)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', flex: 1 }}>
            <h4 style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, color: 'var(--gold-accent)' }}>
              Parecer Técnico do Master Sommelier
            </h4>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-base)', color: '#4A0E1A', fontStyle: 'italic', lineHeight: 1.8 }}>
              "{wine.sommelierNote}"
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
