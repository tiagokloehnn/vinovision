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
    <div className="w-full max-w-6xl mx-auto animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>

      {/* ── CABEÇALHO ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between" style={{ gap: 'var(--space-4)', paddingBottom: 'var(--space-5)', borderBottom: '1px solid var(--border-clean)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <span className="inline-flex items-center" style={{ gap: 'var(--space-2)', padding: `var(--space-1) var(--space-3)`, borderRadius: '99px', background: 'rgba(128,14,38,0.3)', border: '1px solid var(--border-clean)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--gold-light)', alignSelf: 'flex-start' }}>
            <Bookmark style={{ width: 'var(--text-sm)', height: 'var(--text-sm)', color: 'var(--gold-accent)' }} />
            Coleção Pessoal
          </span>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-4xl)', color: 'white', lineHeight: 1.2 }}>Minha Adega</h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Vinhos salvos e histórico de garrafas consultadas</p>
        </div>

        <button onClick={onScanNew} className="btn-gold" style={{ alignSelf: 'flex-start' }}>
          <Plus style={{ width: 'var(--text-base)', height: 'var(--text-base)' }} />
          Escanear Novo Vinho
        </button>
      </div>

      {/* ── ESTATÍSTICAS ── */}
      {cellarWines.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 'var(--space-5)' }}>
          {[
            { Icon: Wine,     label: 'Garrafas',           value: cellarWines.length },
            { Icon: Star,     label: 'Avaliação Média',    value: `${(cellarWines.reduce((a, w) => a + (w.rating || 4.5), 0) / cellarWines.length).toFixed(1)} / 5` },
            { Icon: Sparkles, label: 'Países Repr.',       value: `${new Set(cellarWines.map(w => w.country)).size} países` },
          ].map(({ Icon, label, value }) => (
            <div key={label} className="glass-card flex items-center" style={{ padding: 'var(--space-5)', gap: 'var(--space-4)' }}>
              <div style={{ width: 'clamp(2.5rem,4vw,3rem)', height: 'clamp(2.5rem,4vw,3rem)', borderRadius: 'var(--radius-lg)', background: 'rgba(128,14,38,0.3)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon style={{ width: 'var(--text-xl)', height: 'var(--text-xl)', color: 'var(--gold-accent)' }} />
              </div>
              <div>
                <p style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--text-muted)' }}>{label}</p>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'white', marginTop: 'var(--space-1)' }}>{value}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ESTADO VAZIO ── */}
      {cellarWines.length === 0 && (
        <div className="glass-card" style={{ padding: 'var(--space-12)', textAlign: 'center', maxWidth: '28rem', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-5)' }}>
          <div style={{ width: 'clamp(3rem,6vw,4rem)', height: 'clamp(3rem,6vw,4rem)', borderRadius: '99px', background: 'rgba(128,14,38,0.3)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wine style={{ width: 'var(--text-2xl)', height: 'var(--text-2xl)', color: 'var(--gold-accent)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'white' }}>Sua adega está vazia</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              Escaneie um rótulo por foto para guardar aqui e começar sua coleção.
            </p>
          </div>
          <button onClick={onScanNew} className="btn-gold">Escanear Meu Primeiro Vinho</button>
        </div>
      )}

      {/* ── LISTA DE VINHOS ── */}
      {cellarWines.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

          {/* Filtros */}
          <div className="flex flex-wrap" style={{ gap: 'var(--space-2)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--border-clean)' }}>
            {FILTERS.map(f => (
              <button key={f.id} onClick={() => setFilterType(f.id)} style={{ padding: `var(--space-2) var(--space-4)`, borderRadius: '99px', fontSize: 'var(--text-sm)', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: filterType === f.id ? 'var(--wine-primary)' : 'rgba(255,255,255,0.05)', color: filterType === f.id ? 'var(--gold-light)' : 'var(--text-muted)' }}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Grid de Garrafas */}
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-4)' }}>
            {filtered.map(wine => (
              <div key={wine.id} className="glass-card flex items-center overflow-hidden" style={{ padding: 'var(--space-5)', gap: 'var(--space-5)', transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-clean)'}
              >
                {/* Foto */}
                <div onClick={() => onSelectWine(wine)} style={{ width: 'clamp(4rem,8vw,6rem)', aspectRatio: '3/4', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', flexShrink: 0, cursor: 'pointer' }}>
                  <img src={wine.image} alt={wine.name} className="w-full h-full object-cover" />
                  <span style={{ position: 'absolute', top: 'var(--space-1)', left: 'var(--space-1)', fontSize: 'var(--text-xs)' }}>{wine.flagEmoji}</span>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'var(--gold-accent)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {wine.winery}
                  </span>
                  <h3 onClick={() => onSelectWine(wine)} style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', color: 'white', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>
                    {wine.name}
                  </h3>
                  <div className="flex flex-wrap" style={{ gap: 'var(--space-3)' }}>
                    <span className="flex items-center" style={{ gap: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      <Calendar style={{ width: 'var(--text-sm)', height: 'var(--text-sm)', color: 'var(--gold-accent)', flexShrink: 0 }} />
                      {wine.vintage}
                    </span>
                    <span className="flex items-center" style={{ gap: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <MapPin style={{ width: 'var(--text-sm)', height: 'var(--text-sm)', color: 'var(--gold-accent)', flexShrink: 0 }} />
                      {wine.region}
                    </span>
                  </div>
                  <div className="flex items-center" style={{ gap: 'var(--space-1)' }}>
                    <Star style={{ width: 'var(--text-sm)', height: 'var(--text-sm)', fill: 'var(--gold-accent)', color: 'var(--gold-accent)' }} />
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--gold-light)' }}>{wine.rating}</span>
                  </div>
                </div>

                {/* Remover */}
                <button onClick={() => onRemoveWine(wine.id)} style={{ width: 'clamp(2rem,3.5vw,2.5rem)', height: 'clamp(2rem,3.5vw,2.5rem)', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-clean)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s', color: 'var(--text-muted)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--wine-primary)'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                  title="Remover"
                >
                  <Trash2 style={{ width: 'var(--text-base)', height: 'var(--text-base)' }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
