import React from 'react';
import {
  Star, MapPin, Calendar, Wine, Thermometer, Clock,
  Award, Bookmark, Check, Share2, ArrowLeft, Sparkles,
  DollarSign, UtensilsCrossed, Quote, Percent
} from 'lucide-react';
import TastingRadar from './TastingRadar';

export default function WineDetails({ wine, onBack, onSaveCellar, isSaved }) {
  if (!wine) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: wine.name, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado!');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto animate-fadeIn pb-16 pt-2" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-10)' }}>

      {/* ── BARRA DE AÇÕES ── */}
      <div className="flex items-center justify-between gap-4" style={{ paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-clean)' }}>
        <button onClick={onBack} className="btn-ghost">
          <ArrowLeft style={{ width: 'var(--text-lg)', height: 'var(--text-lg)', color: 'var(--wine-primary)' }} />
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
        style={{ padding: 'var(--space-8)', gap: 'var(--space-8)', background: '#FFFFFF' }}>

        {/* COLUNA ESQUERDA — Foto + Specs */}
        <div className="lg:col-span-5 flex flex-col items-center" style={{ gap: 'var(--space-6)' }}>

          {/* Imagem da Garrafa — Aspecto Fixo 3:4 */}
          <div className="relative group w-full overflow-hidden border border-black/10 shadow-lg bg-[#FAF8F5]"
            style={{ maxWidth: 'min(290px, 100%)', aspectRatio: '3/4', borderRadius: 'var(--radius-2xl)', boxShadow: '0 15px 35px -5px rgba(35,20,25,0.12)' }}>
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

            {/* Badge rating */}
            <div className="absolute flex items-center font-bold"
              style={{ bottom: 'var(--space-3)', right: 'var(--space-3)', background: '#FFFFFF', backdropFilter: 'blur(8px)', padding: `4px 12px`, borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: '#8C6810', gap: 'var(--space-1)', border: '1px solid rgba(184,141,34,0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <Star style={{ width: 'var(--text-base)', height: 'var(--text-base)', fill: '#D4AF37', color: '#D4AF37' }} />
              {wine.rating}
            </div>
          </div>

          {/* Specs Tiles — Grid 2×2 */}
          <div className="grid grid-cols-2 w-full" style={{ gap: 'var(--space-3)', maxWidth: 'min(320px, 100%)' }}>
            {[
              { Icon: DollarSign, label: 'Preço Médio',    value: wine.priceEstimate },
              { Icon: Thermometer,label: 'Temperatura',    value: wine.serveTemp     },
              { Icon: Clock,      label: 'Decantação',     value: wine.decantTime    },
              { Icon: Percent,    label: 'Teor Alcoólico', value: wine.alcohol       },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="spec-tile">
                <Icon className="spec-icon" />
                <span className="spec-label">{label}</span>
                <span className="spec-value">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* COLUNA DIREITA — Informações Editoriais */}
        <div className="lg:col-span-7 text-left" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

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

          {/* Descrição */}
          <p style={{ fontSize: 'var(--text-base)', lineHeight: 1.85, color: 'var(--text-secondary)', wordBreak: 'break-word' }}>
            {wine.description}
          </p>

          {/* Castas */}
          <div style={{ paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-clean)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <p style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 700 }}>
              Castas / Variedades Nobres:
            </p>
            <div className="flex flex-wrap" style={{ gap: 'var(--space-2)' }}>
              {wine.grapes?.map((grape, idx) => (
                <span key={idx} style={{ padding: `4px 14px`, borderRadius: 'var(--radius-md)', background: '#FDF2F4', border: '1px solid rgba(114,27,41,0.2)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--wine-primary)' }}>
                  {grape}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── BLOCO 2: PERFIL GUSTATIVO + AROMAS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch" style={{ gap: 'var(--space-6)' }}>

        <div className="lg:col-span-7">
          <TastingRadar profile={wine.profile} />
        </div>

        <div className="lg:col-span-5 glass-card flex flex-col justify-between overflow-hidden"
          style={{ padding: 'var(--space-8)', gap: 'var(--space-6)', background: '#FFFFFF' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div style={{ paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-clean)' }}>
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
                <div key={idx} className="flex items-center" style={{ gap: 'var(--space-2)', padding: `var(--space-2) var(--space-3)`, borderRadius: 'var(--radius-md)', background: '#FAF8F5', border: '1px solid var(--border-clean)', fontSize: 'var(--text-sm)', color: 'var(--text-main)', fontWeight: 600 }}>
                  <span style={{ fontSize: 'var(--text-lg)', flexShrink: 0 }}>{aroma.icon}</span>
                  <span>{aroma.name}</span>
                </div>
              ))}
            </div>
          </div>

          {wine.awards?.length > 0 && (
            <div style={{ paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-clean)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <p className="flex items-center font-bold" style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold-accent)', gap: 'var(--space-2)' }}>
                <Award style={{ width: 'var(--text-sm)', height: 'var(--text-sm)' }} />
                Prêmios & Reconhecimento
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {wine.awards.map((award, i) => (
                  <div key={i} style={{ fontSize: 'var(--text-sm)', color: '#8C6810', background: '#FDF8EB', padding: `var(--space-2) var(--space-4)`, borderRadius: 'var(--radius-md)', border: '1px solid rgba(184,141,34,0.3)', fontWeight: 600 }}>
                    🏆 {award}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── BLOCO 3: HARMONIZAÇÃO ── */}
      <div className="glass-card overflow-hidden" style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', background: '#FFFFFF' }}>
        <div className="flex items-center" style={{ gap: 'var(--space-4)', paddingBottom: 'var(--space-5)', borderBottom: '1px solid var(--border-clean)' }}>
          <div className="flex items-center justify-center"
            style={{ width: 'clamp(2.5rem,4vw,3.25rem)', height: 'clamp(2.5rem,4vw,3.25rem)', borderRadius: 'var(--radius-lg)', background: '#FDF2F4', border: '1px solid rgba(114,27,41,0.18)', flexShrink: 0 }}>
            <UtensilsCrossed style={{ width: 'var(--text-lg)', height: 'var(--text-lg)', color: 'var(--wine-primary)' }} />
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--space-5)' }}>
          {wine.foodPairings?.map((pairing, idx) => (
            <div key={idx} className="text-left" style={{ background: '#FAF8F5', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-clean)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', transition: 'all 0.25s ease' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(184,141,34,0.4)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(35,20,25,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-clean)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
                <span style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', flexShrink: 0 }}>{pairing.icon}</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                  <span style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'var(--gold-accent)', display: 'block' }}>
                    {pairing.category}
                  </span>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-base)', color: 'var(--text-main)', fontWeight: 700 }}>
                    {pairing.title}
                  </h4>
                </div>
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                {pairing.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── BLOCO 4: SOMMELIER ── */}
      {wine.sommelierNote && (
        <div className="glass-card flex flex-col sm:flex-row items-start overflow-hidden" style={{ padding: 'var(--space-8)', gap: 'var(--space-6)', background: '#FDF8EB', border: '1px solid rgba(184,141,34,0.3)' }}>
          <div className="flex items-center justify-center" style={{ width: 'clamp(2.5rem,4vw,3.25rem)', height: 'clamp(2.5rem,4vw,3.25rem)', borderRadius: 'var(--radius-lg)', background: '#FFFFFF', border: '1px solid rgba(184,141,34,0.3)', flexShrink: 0, boxShadow: '0 2px 8px rgba(184,141,34,0.15)' }}>
            <Quote style={{ width: 'var(--text-xl)', height: 'var(--text-xl)', color: 'var(--wine-primary)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', flex: 1 }}>
            <h4 style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, color: 'var(--gold-accent)' }}>
              Parecer do Master Sommelier
            </h4>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', color: '#4A0E1A', fontStyle: 'italic', lineHeight: 1.85 }}>
              "{wine.sommelierNote}"
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
