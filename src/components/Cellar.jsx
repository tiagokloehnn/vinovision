import React, { useState } from 'react';
import { Bookmark, Trash2, Star, Wine, Calendar, MapPin, Sparkles, Plus } from 'lucide-react';

export default function Cellar({ cellarWines, onSelectWine, onRemoveWine, onScanNew }) {
  const [filterType, setFilterType] = useState('All');

  const filtered = cellarWines.filter(w => filterType === 'All' || w.type === filterType);

  const FILTERS = [
    { id: 'All',       label: 'Todos'      },
    { id: 'Red',       label: 'Tintos'     },
    { id: 'White',     label: 'Brancos'    },
    { id: 'Sparkling', label: 'Espumantes' },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>

      {/* ── CABEÇALHO ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between" style={{ gap: 'var(--space-4)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-clean)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <span className="inline-flex items-center" style={{ gap: 'var(--space-2)', padding: `4px 14px`, borderRadius: '99px', background: '#FDF8EB', border: '1px solid rgba(184,141,34,0.3)', fontSize: 'var(--text-xs)', fontWeight: 700, color: '#8C6810', alignSelf: 'flex-start', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <Bookmark style={{ width: 'var(--text-sm)', height: 'var(--text-sm)', color: '#B88D22' }} />
            Coleção Pessoal
          </span>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-4xl)', color: 'var(--text-main)', lineHeight: 1.2, fontWeight: 700 }}>Minha Adega</h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Vinhos salvos e histórico de garrafas consultadas</p>
        </div>

        <button onClick={onScanNew} className="btn-gold" style={{ alignSelf: 'flex-start' }}>
          <Plus style={{ width: 'var(--text-base)', height: 'var(--text-base)' }} />
          Escanear Novo Vinho
        </button>
      </div>

      {/* ── ESTATÍSTICAS ── */}
      {cellarWines.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 'var(--space-4)' }}>
          {[
            { Icon: Wine,     label: 'Garrafas Guardadas', value: cellarWines.length },
            { Icon: Star,     label: 'Avaliação Média',    value: `${(cellarWines.reduce((a, w) => a + (w.rating || 4.5), 0) / cellarWines.length).toFixed(1)} / 5` },
            { Icon: Sparkles, label: 'Países Representados', value: `${new Set(cellarWines.map(w => w.country)).size} países` },
          ].map(({ Icon, label, value }) => (
            <div key={label} className="glass-card flex items-center" style={{ padding: 'var(--space-4) var(--space-5)', gap: 'var(--space-4)', background: '#FFFFFF' }}>
              <div style={{ width: 'clamp(2.5rem,4vw,3.25rem)', height: 'clamp(2.5rem,4vw,3.25rem)', borderRadius: 'var(--radius-lg)', background: '#FDF2F4', border: '1px solid rgba(114,27,41,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(114,27,41,0.08)' }}>
                <Icon style={{ width: 'var(--text-xl)', height: 'var(--text-xl)', color: 'var(--wine-primary)' }} />
              </div>
              <div>
                <p style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--text-muted)' }}>{label}</p>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'var(--text-main)', marginTop: '2px', fontWeight: 700 }}>{value}</h3>
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
              Escaneie um rótulo por foto para guardar aqui e começar sua coleção enológica personalizada.
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
            {filtered.map(wine => (
              <div key={wine.id} className="glass-card flex items-center overflow-hidden" style={{ padding: 'clamp(0.875rem, 2vw, 1.25rem)', gap: 'clamp(0.75rem, 2vw, 1.25rem)', background: '#FFFFFF', transition: 'all 0.25s ease' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(184,141,34,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(35,20,25,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-card)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              >
                {/* Foto */}
                <div onClick={() => onSelectWine(wine)} style={{ width: 'clamp(3.75rem, 16vw, 5.5rem)', aspectRatio: '3/4', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)', position: 'relative', flexShrink: 0, cursor: 'pointer', background: '#FAF8F5' }}>
                  <img src={wine.image} alt={wine.name} className="w-full h-full object-cover" />
                  <span style={{ position: 'absolute', top: 'var(--space-1)', left: 'var(--space-1)', fontSize: 'var(--text-xs)', background: 'rgba(255,255,255,0.9)', padding: '2px 4px', borderRadius: '4px' }}>{wine.flagEmoji}</span>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, color: 'var(--gold-accent)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {wine.winery}
                  </span>
                  <h3 onClick={() => onSelectWine(wine)} style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-base)', color: 'var(--text-main)', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3, fontWeight: 700 }}>
                    {wine.name}
                  </h3>
                  <div className="flex flex-wrap" style={{ gap: 'var(--space-2)' }}>
                    <span className="flex items-center" style={{ gap: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      <Calendar style={{ width: 'var(--text-sm)', height: 'var(--text-sm)', color: 'var(--gold-accent)', flexShrink: 0 }} />
                      {wine.vintage}
                    </span>
                    <span className="flex items-center" style={{ gap: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                      <MapPin style={{ width: 'var(--text-sm)', height: 'var(--text-sm)', color: 'var(--gold-accent)', flexShrink: 0 }} />
                      {wine.region}
                    </span>
                  </div>
                  <div className="flex items-center" style={{ gap: 'var(--space-1)', marginTop: '2px' }}>
                    <Star style={{ width: 'var(--text-sm)', height: 'var(--text-sm)', fill: '#D4AF37', color: '#D4AF37' }} />
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#8C6810' }}>{wine.rating}</span>
                  </div>
                </div>

                {/* Remover */}
                <button onClick={() => onRemoveWine(wine.id)} style={{ width: '2.25rem', height: '2.25rem', borderRadius: 'var(--radius-md)', background: '#FAF8F5', border: '1px solid var(--border-clean)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s', color: 'var(--text-muted)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.borderColor = '#FECACA'; e.currentTarget.style.color = '#DC2626'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#FAF8F5'; e.currentTarget.style.borderColor = 'var(--border-clean)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                  title="Remover da Adega"
                >
                  <Trash2 style={{ width: 'var(--text-sm)', height: 'var(--text-sm)' }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
