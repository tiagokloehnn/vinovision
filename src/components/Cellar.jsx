import React, { useState } from 'react';
import {
  Bookmark, Trash2, Star, Wine, Calendar, MapPin, Sparkles, Plus,
  Heart, Edit3, Users, ChevronDown, Key, Share2
} from 'lucide-react';

export default function Cellar({
  cellarWines,
  onSelectWine,
  onRemoveWine,
  onScanNew,
  activeCellar = { id: 'personal', name: 'Minha Adega Pessoal', isPersonal: true },
  cellarsList = [],
  onOpenSharedModal,
  onSelectCellar
}) {
  const [filterType, setFilterType] = useState('All');
  const [showCellarDropdown, setShowCellarDropdown] = useState(false);

  const filtered = cellarWines.filter(w => {
    if (filterType === 'All') return true;
    if (filterType === 'Evaluated') return (w.userRating > 0 || !!w.userReview);
    return w.type === filterType;
  });

  const evaluatedWines = cellarWines.filter(w => w.userRating > 0);
  const myAvgRating = evaluatedWines.length > 0
    ? (evaluatedWines.reduce((acc, w) => acc + w.userRating, 0) / evaluatedWines.length).toFixed(1)
    : '—';

  const FILTERS = [
    { id: 'All',       label: 'Todos' },
    { id: 'Evaluated', label: `Avaliados por Mim (${evaluatedWines.length})` },
    { id: 'Red',       label: 'Tintos' },
    { id: 'White',     label: 'Brancos' },
    { id: 'Sparkling', label: 'Espumantes' },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>

      {/* ── SELETOR MULTI-ADEGA NO TOPO ── */}
      <div
        className="glass-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 gap-4"
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF8F5 100%)',
          borderColor: activeCellar.isPersonal ? 'var(--border-clean)' : 'rgba(184, 141, 34, 0.4)',
          borderRadius: 'var(--radius-xl)'
        }}
      >
        {/* Dropdown de Adegas */}
        <div className="relative">
          <button
            onClick={() => setShowCellarDropdown(!showCellarDropdown)}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-black/5 transition-all text-left"
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: activeCellar.isPersonal ? '#FDF2F4' : '#FDF8EB',
                border: activeCellar.isPersonal ? '1px solid rgba(114,27,41,0.2)' : '1px solid rgba(184,141,34,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {activeCellar.isPersonal ? (
                <Wine style={{ width: '20px', height: '20px', color: 'var(--wine-primary)' }} />
              ) : (
                <Users style={{ width: '20px', height: '20px', color: 'var(--gold-accent)' }} />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--gold-accent)' }}>
                  {activeCellar.isPersonal ? 'Adega Pessoal' : 'Adega Compartilhada'}
                </span>
                <ChevronDown style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--text-main)', fontWeight: 700 }}>
                {activeCellar.name}
              </h3>
            </div>
          </button>

          {/* Menu Dropdown Flutuante */}
          {showCellarDropdown && (
            <div
              className="absolute left-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-black/10 z-40 p-2 animate-fadeIn flex flex-col gap-1"
              onMouseLeave={() => setShowCellarDropdown(false)}
            >
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--text-muted)', padding: '6px 10px' }}>
                Suas Adegas Cadastradas
              </span>

              {cellarsList.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    if (onSelectCellar) onSelectCellar(c.id);
                    setShowCellarDropdown(false);
                  }}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-[#FAF8F5] transition-colors text-left"
                  style={{
                    background: c.id === activeCellar.id ? '#FDF8EB' : 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <div className="flex items-center gap-2">
                    {c.isPersonal ? <Wine style={{ width: '14px', height: '14px', color: 'var(--wine-primary)' }} /> : <Users style={{ width: '14px', height: '14px', color: 'var(--gold-accent)' }} />}
                    <span style={{ fontSize: '0.85rem', fontWeight: c.id === activeCellar.id ? 700 : 500, color: 'var(--text-main)' }}>
                      {c.name}
                    </span>
                  </div>
                  {c.id === activeCellar.id && <span style={{ fontSize: '0.7rem', color: 'var(--gold-accent)', fontWeight: 700 }}>✓</span>}
                </button>
              ))}

              <div className="pt-2 border-t border-black/5 mt-1">
                <button
                  onClick={() => {
                    setShowCellarDropdown(false);
                    if (onOpenSharedModal) onOpenSharedModal();
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-[#FAF8F5] text-xs font-bold text-wine-primary flex items-center gap-2"
                  style={{ border: 'none', cursor: 'pointer', color: 'var(--wine-primary)' }}
                >
                  <Plus style={{ width: '14px', height: '14px' }} />
                  Gerenciar / Criar / Entrar em Adega…
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Botões de Ação do Header */}
        <div className="flex items-center gap-2">
          {!activeCellar.isPersonal && (
            <button
              onClick={onOpenSharedModal}
              className="btn-ghost"
              style={{ fontSize: '0.8rem', padding: '8px 14px', background: '#FFFFFF', border: '1px solid var(--border-clean)', gap: '6px' }}
            >
              <Key style={{ width: '14px', height: '14px', color: 'var(--gold-accent)' }} />
              Código: <strong>{activeCellar.invite_code || 'VINO-XXXX'}</strong>
            </button>
          )}

          <button
            onClick={onOpenSharedModal}
            className="btn-ghost"
            style={{ fontSize: '0.8rem', padding: '8px 14px', gap: '6px' }}
          >
            <Users style={{ width: '15px', height: '15px' }} />
            {activeCellar.isPersonal ? 'Confrarias & Grupos' : 'Gerenciar Membros'}
          </button>

          <button onClick={onScanNew} className="btn-gold" style={{ fontSize: '0.85rem', padding: '8px 16px', gap: '6px' }}>
            <Plus style={{ width: '16px', height: '16px' }} />
            Adicionar Vinho
          </button>
        </div>
      </div>

      {/* ── ESTATÍSTICAS DA ADEGA ── */}
      {cellarWines.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 'var(--space-4)' }}>
          {[
            { Icon: Wine,     label: 'Garrafas na Adega', value: cellarWines.length },
            {
              Icon: Heart,
              label: 'Minhas Avaliações',
              value: evaluatedWines.length > 0 ? `${evaluatedWines.length} vinhos (Média ${myAvgRating}★)` : 'Nenhuma avaliação'
            },
            { Icon: Sparkles, label: 'Países na Coleção', value: `${new Set(cellarWines.map(w => w.country)).size} países` },
          ].map(({ Icon, label, value }) => (
            <div key={label} className="glass-card flex items-center" style={{ padding: 'var(--space-4) var(--space-5)', gap: 'var(--space-4)', background: '#FFFFFF' }}>
              <div style={{ width: 'clamp(2.5rem,4vw,3.25rem)', height: 'clamp(2.5rem,4vw,3.25rem)', borderRadius: 'var(--radius-lg)', background: '#FDF2F4', border: '1px solid rgba(114,27,41,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(114,27,41,0.08)' }}>
                <Icon style={{ width: 'var(--text-xl)', height: 'var(--text-xl)', color: 'var(--wine-primary)' }} />
              </div>
              <div>
                <p style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--text-muted)' }}>{label}</p>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'var(--text-main)', marginTop: '2px', fontWeight: 700 }}>{value}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ESTADO VAZIO ── */}
      {cellarWines.length === 0 && (
        <div className="glass-card" style={{ padding: 'clamp(2rem, 5vw, 3rem)', textAlign: 'center', maxWidth: '32rem', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)', background: '#FFFFFF' }}>
          <div style={{ width: 'clamp(3.5rem,6vw,4.5rem)', height: 'clamp(3.5rem,6vw,4.5rem)', borderRadius: '99px', background: '#FDF2F4', border: '1px solid rgba(114,27,41,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(114,27,41,0.1)' }}>
            <Wine style={{ width: 'var(--text-2xl)', height: 'var(--text-2xl)', color: 'var(--wine-primary)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'var(--text-main)', fontWeight: 700 }}>
              {activeCellar.isPersonal ? 'Sua adega pessoal está vazia' : `A adega "${activeCellar.name}" está vazia`}
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {activeCellar.isPersonal
                ? 'Escaneie um rótulo por foto para guardar aqui, avaliar pessoalmente e criar seu diário enológico exclusivo.'
                : 'Escaneie e adicione os primeiros vinhos para compartilhar com os outros membros do grupo!'}
            </p>
          </div>
          <button onClick={onScanNew} className="btn-wine">Escanear e Adicionar Garrafa</button>
        </div>
      )}

      {/* ── LISTA DE VINHOS ── */}
      {cellarWines.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          {/* Filtros */}
          <div className="flex flex-wrap" style={{ gap: 'var(--space-2)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--border-clean)' }}>
            {FILTERS.map(f => {
              const isActive = filterType === f.id;
              return (
                <button key={f.id} onClick={() => setFilterType(f.id)} style={{ padding: `var(--space-2) var(--space-4)`, borderRadius: '99px', fontSize: 'var(--text-xs)', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: isActive ? 'var(--wine-primary)' : '#FFFFFF', color: isActive ? '#FFFFFF' : 'var(--text-secondary)', boxShadow: isActive ? '0 4px 12px rgba(114,27,41,0.2)' : '0 2px 6px rgba(0,0,0,0.04)' }}>
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Grid de Garrafas */}
          <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 'var(--space-4)' }}>
            {filtered.map(wine => {
              const hasPersonalRating = (wine.userRating > 0);
              const hasPersonalReview = !!wine.userReview;
              const hasGroupRating = (wine.groupAverageRating > 0);
              const reviewsCount = Object.keys(wine.reviews || {}).length;

              return (
                <div key={wine.id} className="glass-card flex flex-col sm:flex-row items-stretch overflow-hidden" style={{ padding: 'clamp(0.875rem, 2vw, 1.25rem)', gap: 'clamp(0.75rem, 2vw, 1.25rem)', background: '#FFFFFF', transition: 'all 0.25s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(184,141,34,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(35,20,25,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-card)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                >
                  {/* Foto */}
                  <div onClick={() => onSelectWine(wine)} style={{ width: 'clamp(4.5rem, 18vw, 6rem)', aspectRatio: '3/4', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)', position: 'relative', flexShrink: 0, cursor: 'pointer', background: '#FAF8F5' }}>
                    <img src={wine.image} alt={wine.name} className="w-full h-full object-cover" />
                    <span style={{ position: 'absolute', top: 'var(--space-1)', left: 'var(--space-1)', fontSize: 'var(--text-xs)', background: 'rgba(255,255,255,0.92)', padding: '2px 6px', borderRadius: '4px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>{wine.flagEmoji}</span>
                  </div>

                  {/* Info e Avaliação */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
                    <div>
                      <div className="flex items-center justify-between" style={{ gap: 'var(--space-2)' }}>
                        <span style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, color: 'var(--gold-accent)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {wine.winery}
                        </span>

                        <button onClick={() => onRemoveWine(wine.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px', display: 'flex', alignItems: 'center' }}
                          title="Remover da Adega"
                        >
                          <Trash2 style={{ width: '15px', height: '15px' }} />
                        </button>
                      </div>

                      <h3 onClick={() => onSelectWine(wine)} style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-base)', color: 'var(--text-main)', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3, fontWeight: 700, margin: '2px 0' }}>
                        {wine.name}
                      </h3>

                      <div className="flex flex-wrap items-center" style={{ gap: 'var(--space-2)', marginTop: '2px' }}>
                        <span className="flex items-center" style={{ gap: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                          <Calendar style={{ width: 'var(--text-sm)', height: 'var(--text-sm)', color: 'var(--gold-accent)', flexShrink: 0 }} />
                          {wine.vintage}
                        </span>
                        <span className="flex items-center" style={{ gap: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                          <MapPin style={{ width: 'var(--text-sm)', height: 'var(--text-sm)', color: 'var(--gold-accent)', flexShrink: 0 }} />
                          {wine.region}
                        </span>
                        {wine.addedBy?.name && !activeCellar.isPersonal && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: '#FAF8F5', padding: '1px 6px', borderRadius: '4px' }}>
                            Por: {wine.addedBy.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bloco de Avaliação Pessoal vs Grupo */}
                    <div style={{ paddingTop: '6px', borderTop: '1px solid var(--border-clean)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div className="flex items-center justify-between flex-wrap" style={{ gap: '4px' }}>
                        {hasPersonalRating ? (
                          <div className="flex items-center" style={{ gap: '4px', background: '#FDF8EB', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(184,141,34,0.3)' }}>
                            <Star style={{ width: '14px', height: '14px', fill: '#D4AF37', color: '#D4AF37' }} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8C6810' }}>
                              Minha Nota: {wine.userRating.toFixed(1)}
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => onSelectWine(wine)}
                            style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--wine-primary)', fontSize: '0.75rem', fontWeight: 700 }}
                          >
                            <Edit3 style={{ width: '13px', height: '13px' }} />
                            + Avaliar garrafa
                          </button>
                        )}

                        {!activeCellar.isPersonal && hasGroupRating && (
                          <span style={{ fontSize: '0.7rem', color: '#065F46', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                            👥 Grupo: {wine.groupAverageRating}★ ({reviewsCount})
                          </span>
                        )}
                      </div>

                      {hasPersonalReview && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4 }}>
                          "{wine.userReview}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
