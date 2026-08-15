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
      style={{ padding: 'clamp(1.25rem, 3vw, 2rem)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', background: '#FFFFFF' }}>

      {/* Cabeçalho */}
      <div style={{ paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--border-clean)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        <span style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, color: 'var(--gold-accent)' }}>
          Análise Sensorial
        </span>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'var(--text-main)', fontWeight: 700 }}>
          Perfil Gustativo
        </h3>
      </div>

      {/* Métricas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {metrics.map((item) => (
          <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {/* Rótulo + Descrição */}
            <div className="flex justify-between items-center">
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-base)', color: 'var(--text-main)', fontWeight: 600 }}>
                {item.label}
              </span>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#8C6810', background: '#FDF8EB', padding: `2px 10px`, borderRadius: '99px', border: '1px solid rgba(184,141,34,0.3)', whiteSpace: 'nowrap' }}>
                {item.desc}
              </span>
            </div>

            {/* Barra de 5 segmentos */}
            <div className="flex" style={{ gap: 'var(--space-1)', alignItems: 'center', width: '100%' }}>
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} style={{
                  flex: 1,
                  height: 'clamp(7px, 1vw, 10px)',
                  borderRadius: '99px',
                  background: step <= item.value
                    ? 'linear-gradient(90deg, #721B29, #C5A059)'
                    : '#F2EDE4',
                  boxShadow: step <= item.value ? '0 2px 6px rgba(114,27,41,0.2)' : 'none',
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
