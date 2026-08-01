import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function RoleGuard({ allowedRoles, children, onFallback }) {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 'var(--text-3xl)', height: 'var(--text-3xl)', border: '2px solid var(--border-clean)', borderTopColor: 'var(--gold-accent)', borderRadius: '99px', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (!allowedRoles.includes(role)) {
    return (
      <div className="w-full max-w-xl mx-auto animate-fadeIn" style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-16)' }}>
        <div className="glass-card text-center overflow-hidden" style={{ padding: 'var(--space-10)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-6)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div style={{ width: 'clamp(3.5rem,6vw,4.5rem)', height: 'clamp(3.5rem,6vw,4.5rem)', borderRadius: '99px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert style={{ width: 'var(--text-4xl)', height: 'var(--text-4xl)', color: '#f87171' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', color: 'white' }}>Acesso Restrito</h2>
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              Esta página é exclusiva para administradores do sistema. Seu nível atual é <strong style={{ color: 'var(--gold-light)' }}>{role}</strong>.
            </p>
          </div>
          {onFallback && (
            <button onClick={onFallback} className="btn-gold">
              <ArrowLeft style={{ width: 'var(--text-base)', height: 'var(--text-base)' }} />
              Voltar ao Escâner
            </button>
          )}
        </div>
      </div>
    );
  }

  return children;
}
