import React, { useState } from 'react';
import { Bookmark, Trash2, Star, Wine, Calendar, MapPin, Sparkles, Plus, Heart, Edit3, MessageSquare, Tag } from 'lucide-react';

export default function Cellar({ cellarWines, onSelectWine, onRemoveWine, onScanNew }) {
  const [filterType, setFilterType] = useState('All');

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

      {/* ── CABEÇALHO ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between" style={{ gap: 'var(--space-4)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-clean)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <span className="inline-flex items-center" style={{ gap: 'var(--space-2)', padding: `4px 14px`, borderRadius: '99px', background: '#FDF8EB', border: '1px solid rgba(184,141,34,0.3)', fontSize: 'var(--text-xs)', fontWeight: 700, color: '#8C6810', alignSelf: 'flex-start', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <Bookmark style={{ width: 'var(--text-sm)', height: 'var(--text-sm)', color: '#B88D22' }} />
            Coleção & Diário Pessoal
          </span>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-4xl)', color: 'var(--text-main)', lineHeight: 1.2, fontWeight: 700 }}>Minha Adega</h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Vinhos guardados, notas de degustação pessoais e parecer técnico</p>
        </div>

        <button onClick={onScanNew} className="btn-gold" style={{ alignSelf: 'flex-start' }}>
          <Plus style={{ width: 'var(--text-base)', height: 'var(--text-base)' }} />
          Escanear Novo Vinho
        </button>
      </div>

      {/* ── ESTATÍSTICAS DA ADEGA ── */}
      {cellarWines.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 'var(--space-4)' }}>
          {[
            { Icon: Wine,     label: 'Garrafas Guardadas', value: cellarWines.length },
            {
              Icon: Heart,
              label: 'Minhas Avaliações',
              value: evaluatedWines.length > 0 ? `${evaluatedWines.length} vinhos (Média ${myAvgRating}★)` : 'Nenhuma avaliação'
            },
            { Icon: Sparkles, label: 'Países na Adega', value: `${new Set(cellarWines.map(w => w.country)).size} países` },
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
        <div className="glass-card" style={{ padding: 'clamp(2rem, 5vw, 3rem)', textAlign: 'center', maxWidth: '30rem', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)', background: '#FFFFFF' }}>
          <div style={{ width: 'clamp(3.5rem,6vw,4.5rem)', height: 'clamp(3.5rem,6vw,4.5rem)', borderRadius: '99px', background: '#FDF2F4', border: '1px solid rgba(114,27,41,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(114,27,41,0.1)' }}>
            <Wine style={{ width: 'var(--text-2xl)', height: 'var(--text-2xl)', color: 'var(--wine-primary)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'var(--text-main)', fontWeight: 700 }}>Sua adega está vazia</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Escaneie um rótulo por foto para guardar aqui, avaliar pessoalmente e criar seu diário enológico exclusivo.
            </p>
          </div>
          <button onClick={onScanNew} className="btn-wine">Escanear Meu Primeiro Vinho</button>
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

                      <div className="flex flex-wrap" style={{ gap: 'var(--space-2)', marginTop: '2px' }}>
                        <span className="flex items-center" style={{ gap: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                          <Calendar style={{ width: 'var(--text-sm)', height: 'var(--text-sm)', color: 'var(--gold-accent)', flexShrink: 0 }} />
                          {wine.vintage}
                        </span>
                        <span className="flex items-center" style={{ gap: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                          <MapPin style={{ width: 'var(--text-sm)', height: 'var(--text-sm)', color: 'var(--gold-accent)', flexShrink: 0 }} />
                          {wine.region}
                        </span>
                      </div>
                    </div>

                    {/* Bloco de Avaliação Pessoal vs Global */}
                    <div style={{ paddingTop: '6px', borderTop: '1px solid var(--border-clean)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {hasPersonalRating ? (
                        <div className="flex items-center justify-between flex-wrap" style={{ gap: '4px' }}>
                          <div className="flex items-center" style={{ gap: '4px', background: '#FDF8EB', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(184,141,34,0.3)' }}>
                            <Star style={{ width: '14px', height: '14px', fill: '#D4AF37', color: '#D4AF37' }} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8C6810' }}>
                              Minha Nota: {wine.userRating.toFixed(1)}
                            </span>
                          </div>
                          {wine.userOccasion && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: '#FAF8F5', padding: '2px 6px', borderRadius: '4px' }}>
                              {wine.userOccasion}
                            </span>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => onSelectWine(wine)}
                          style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--wine-primary)', fontSize: '0.75rem', fontWeight: 700 }}
                        >
                          <Edit3 style={{ width: '13px', height: '13px' }} />
                          + Avaliar esta garrafa pessoalmente
                        </button>
                      )}

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
