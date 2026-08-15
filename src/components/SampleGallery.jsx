import React, { useState } from 'react';
import { SAMPLE_WINES } from '../data/sampleWines';
import { Search, Star, ArrowRight } from 'lucide-react';

export default function SampleGallery({ onSelectWine }) {
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWines = SAMPLE_WINES.filter(wine => {
    const matchesType = filterType === 'All' || wine.type === filterType;
    const matchesSearch =
      wine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wine.winery.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wine.country.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const FILTERS = [
    { id: 'All',       label: 'Todos'       },
    { id: 'Red',       label: 'Tintos'      },
    { id: 'White',     label: 'Brancos'     },
    { id: 'Sparkling', label: 'Espumantes'  },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>

      {/* ── CABEÇALHO ── */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxWidth: '38rem', margin: '0 auto' }}>
        <span style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700, color: 'var(--gold-accent)' }}>
          Biblioteca Mundial de Rótulos
        </span>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-4xl)', color: 'var(--text-main)', lineHeight: 1.2, fontWeight: 700 }}>
          Explorar Rótulos
        </h1>
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          Navegue por vinhos consagrados de prestigiadas regiões vitivinícolas globais e consulte fichas técnicas completas.
        </p>
      </div>

      {/* ── BARRA DE FILTROS & BUSCA ── */}
      <div className="glass-card flex flex-col sm:flex-row items-center justify-between" style={{ padding: 'var(--space-5)', gap: 'var(--space-4)', background: '#FFFFFF' }}>
        {/* Busca */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '24rem' }}>
          <Search style={{ position: 'absolute', left: 'var(--space-4)', top: '50%', transform: 'translateY(-50%)', width: 'var(--text-base)', height: 'var(--text-base)', color: 'var(--gold-accent)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Buscar por nome, vinícola ou país…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', background: '#FAF8F5', border: '1px solid var(--border-clean)', borderRadius: 'var(--radius-lg)', paddingLeft: 'calc(var(--space-4) + var(--text-base) + var(--space-2))', paddingRight: 'var(--space-4)', paddingTop: 'var(--space-3)', paddingBottom: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--text-main)', outline: 'none', transition: 'border-color 0.2s', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)' }}
            onFocus={e => e.target.style.borderColor = 'rgba(184,141,34,0.6)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-clean)'}
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap justify-center" style={{ gap: 'var(--space-2)' }}>
          {FILTERS.map(f => {
            const isActive = filterType === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                style={{ padding: `var(--space-2) var(--space-4)`, borderRadius: '99px', fontSize: 'var(--text-sm)', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: isActive ? 'var(--wine-primary)' : '#FAF8F5', color: isActive ? '#FFFFFF' : 'var(--text-secondary)', boxShadow: isActive ? '0 4px 12px rgba(114,27,41,0.2)' : 'none' }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── GRID DE CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--space-6)' }}>
        {filteredWines.map(wine => (
          <div
            key={wine.id}
            onClick={() => onSelectWine(wine)}
            className="glass-card flex flex-col justify-between group cursor-pointer overflow-hidden"
            style={{ padding: 'var(--space-5)', gap: 'var(--space-4)', background: '#FFFFFF', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(184,141,34,0.45)'; e.currentTarget.style.boxShadow = '0 16px 36px -8px rgba(35,20,25,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border-card)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
          >
            {/* Imagem */}
            <div style={{ position: 'relative', aspectRatio: '3/4', width: '100%', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)', background: '#FAF8F5' }}>
              <img src={wine.image} alt={wine.name} className="w-full h-full object-cover" style={{ transition: 'transform 0.4s ease' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />

              {/* Badge país */}
              <div className="flex items-center" style={{ position: 'absolute', top: 'var(--space-3)', left: 'var(--space-3)', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(6px)', padding: `3px 10px`, borderRadius: '99px', border: '1px solid var(--border-clean)', fontSize: 'var(--text-xs)', color: 'var(--text-main)', gap: 'var(--space-1)', fontWeight: 600, boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
                <span>{wine.flagEmoji}</span>
                <span>{wine.country}</span>
              </div>

              {/* Badge rating */}
              <div className="flex items-center font-bold" style={{ position: 'absolute', bottom: 'var(--space-3)', right: 'var(--space-3)', background: '#FFFFFF', backdropFilter: 'blur(6px)', padding: `3px 10px`, borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: '#8C6810', gap: 'var(--space-1)', border: '1px solid rgba(184,141,34,0.3)', boxShadow: '0 4px 10px rgba(0,0,0,0.08)' }}>
                <Star style={{ width: 'var(--text-sm)', height: 'var(--text-sm)', fill: '#D4AF37', color: '#D4AF37' }} />
                {wine.rating}
              </div>
            </div>

            {/* Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, color: 'var(--gold-accent)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {wine.winery} • {wine.vintage}
              </span>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'var(--text-main)', lineHeight: 1.3, fontWeight: 700 }}>
                {wine.name}
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.75, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {wine.description}
              </p>
            </div>

            {/* Rodapé do Card */}
            <div className="flex items-center justify-between" style={{ paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-clean)' }}>
              <div className="flex" style={{ gap: 'var(--space-2)' }}>
                {wine.grapes?.slice(0, 2).map((g, i) => (
                  <span key={i} style={{ fontSize: 'var(--text-xs)', padding: `3px 8px`, borderRadius: 'var(--radius-sm)', background: '#FDF2F4', color: 'var(--wine-primary)', fontWeight: 600 }}>
                    {g.split(' ')[0]}
                  </span>
                ))}
              </div>
              <span className="flex items-center font-bold" style={{ fontSize: 'var(--text-sm)', color: 'var(--wine-primary)', gap: 'var(--space-1)', transition: 'transform 0.2s' }}>
                Ver Ficha <ArrowRight style={{ width: 'var(--text-base)', height: 'var(--text-base)' }} />
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
