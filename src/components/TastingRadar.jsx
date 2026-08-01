import React from 'react';

export default function TastingRadar({ profile }) {
  if (!profile) return null;

  const metrics = [
    { label: 'Corpo',   value: profile.body,      desc: profile.body >= 4     ? 'Encorpado'    : profile.body === 3     ? 'Médio'        : 'Leve'      },
    { label: 'Taninos', value: profile.tannin,    desc: profile.tannin >= 4   ? 'Firmes'       : profile.tannin === 3   ? 'Equilibrados' : 'Macios'    },
    { label: 'Acidez',  value: profile.acidity,   desc: profile.acidity >= 4  ? 'Vibrante'     : profile.acidity === 3  ? 'Elegante'     : 'Média'     },
    { label: 'Doçura',  value: profile.sweetness, desc: profile.sweetness === 1 ? 'Seco (Dry)' : profile.sweetness === 2 ? 'Meio Seco'   : 'Doce'     },
  ];

  return (
    <div className="glass-card w-full overflow-hidden h-full"
      style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

      {/* Cabeçalho */}
      <div style={{ paddingBottom: 'var(--space-4)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <span style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, color: 'var(--gold-accent)' }}>
          Análise Sensorial
        </span>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'white' }}>
          Perfil Gustativo
        </h3>
      </div>

      {/* Métricas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {metrics.map((item) => (
          <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {/* Rótulo + Descrição */}
            <div className="flex justify-between items-center">
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', color: 'white', fontWeight: 600 }}>
                {item.label}
              </span>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--gold-light)', background: 'rgba(128,14,38,0.3)', padding: `var(--space-1) var(--space-3)`, borderRadius: '99px', border: '1px solid var(--border-clean)', whiteSpace: 'nowrap' }}>
                {item.desc}
              </span>
            </div>

            {/* Barra de 5 segmentos */}
            <div className="flex" style={{ gap: 'var(--space-2)', alignItems: 'center', width: '100%' }}>
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} style={{
                  flex: 1,
                  height: 'clamp(8px, 1vw, 12px)',
                  borderRadius: '99px',
                  background: step <= item.value
                    ? 'linear-gradient(90deg, #800e26, #d4af37)'
                    : 'rgba(255,255,255,0.05)',
                  transition: 'background 0.3s ease',
                }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
