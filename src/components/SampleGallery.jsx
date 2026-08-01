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
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxWidth: '36rem', margin: '0 auto' }}>
        <span style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, color: 'var(--gold-accent)' }}>
          Biblioteca Mundial
        </span>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-4xl)', color: 'white', lineHeight: 1.2 }}>
          Explorar Rótulos
        </h1>
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', lineHeight: 1.8 }}>
          Navegue por vinhos consagrados de diversas regiões vitivinícolas e acesse fichas técnicas de degustação.
        </p>
      </div>

      {/* ── BARRA DE FILTROS ── */}
      <div className="glass-card flex flex-col sm:flex-row items-center justify-between" style={{ padding: 'var(--space-5)', gap: 'var(--space-4)' }}>
        {/* Busca */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '22rem' }}>
          <Search style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', width: 'var(--text-base)', height: 'var(--text-base)', color: 'var(--gold-accent)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Nome, vinícola ou país…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', background: 'rgba(11,5,8,0.8)', border: '1px solid var(--border-clean)', borderRadius: 'var(--radius-lg)', paddingLeft: 'calc(var(--space-3) + var(--text-base) + var(--space-2))', paddingRight: 'var(--space-4)', paddingTop: 'var(--space-2)', paddingBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'white', outline: 'none', transition: 'border-color 0.2s' }}
            onFocus={e => e.target.style.borderColor = 'rgba(212,175,55,0.6)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-clean)'}
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap justify-center" style={{ gap: 'var(--space-2)' }}>
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              style={{ padding: `var(--space-2) var(--space-4)`, borderRadius: '99px', fontSize: 'var(--text-sm)', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: filterType === f.id ? 'var(--wine-primary)' : 'rgba(255,255,255,0.05)', color: filterType === f.id ? 'var(--gold-light)' : 'var(--text-muted)' }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── GRID DE CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--space-6)' }}>
        {filteredWines.map(wine => (
          <div
            key={wine.id}
            onClick={() => onSelectWine(wine)}
            className="glass-card flex flex-col justify-between group cursor-pointer overflow-hidden"
            style={{ padding: 'var(--space-5)', gap: 'var(--space-4)', transition: 'all 0.3s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border-clean)'; }}
          >
            {/* Imagem */}
            <div style={{ position: 'relative', aspectRatio: '3/4', width: '100%', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
              <img src={wine.image} alt={wine.name} className="w-full h-full object-cover" style={{ transition: 'transform 0.4s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />

              {/* Badge país */}
              <div className="flex items-center" style={{ position: 'absolute', top: 'var(--space-3)', left: 'var(--space-3)', background: 'rgba(11,5,8,0.8)', backdropFilter: 'blur(6px)', padding: `var(--space-1) var(--space-3)`, borderRadius: '99px', border: '1px solid var(--border-clean)', fontSize: 'var(--text-xs)', color: 'var(--gold-light)', gap: 'var(--space-1)' }}>
                <span>{wine.flagEmoji}</span>
                <span>{wine.country}</span>
              </div>

              {/* Badge rating */}
              <div className="flex items-center font-bold" style={{ position: 'absolute', bottom: 'var(--space-3)', right: 'var(--space-3)', background: 'rgba(128,14,38,0.9)', backdropFilter: 'blur(6px)', padding: `var(--space-1) var(--space-3)`, borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: 'var(--gold-light)', gap: 'var(--space-1)' }}>
                <Star style={{ width: 'var(--text-sm)', height: 'var(--text-sm)', fill: 'var(--gold-accent)', color: 'var(--gold-accent)' }} />
                {wine.rating}
              </div>
            </div>

            {/* Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'var(--gold-accent)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {wine.winery} • {wine.vintage}
              </span>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'white', lineHeight: 1.3 }}>
                {wine.name}
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.75, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {wine.description}
              </p>
            </div>

            {/* Rodapé do Card */}
            <div className="flex items-center justify-between" style={{ paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-clean)' }}>
              <div className="flex" style={{ gap: 'var(--space-2)' }}>
                {wine.grapes?.slice(0, 2).map((g, i) => (
                  <span key={i} style={{ fontSize: 'var(--text-xs)', padding: `var(--space-1) var(--space-2)`, borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                    {g.split(' ')[0]}
                  </span>
                ))}
              </div>
              <span className="flex items-center font-bold" style={{ fontSize: 'var(--text-sm)', color: 'var(--gold-accent)', gap: 'var(--space-1)', transition: 'transform 0.2s' }}>
                Ver Ficha <ArrowRight style={{ width: 'var(--text-base)', height: 'var(--text-base)' }} />
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
