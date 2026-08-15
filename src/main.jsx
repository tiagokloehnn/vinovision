import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("VinoVision AI Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#F8F5F0',
          color: '#1A1416',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: 'var(--font-sans)',
          textAlign: 'center'
        }}>
          <div style={{
            background: '#FFFFFF',
            border: '1px solid rgba(184, 141, 34, 0.3)',
            borderRadius: '24px',
            padding: '2.5rem',
            maxWidth: '520px',
            boxShadow: '0 20px 40px -10px rgba(35, 20, 25, 0.1)'
          }}>
            <h2 style={{ fontSize: '1.6rem', color: '#721B29', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
              🍷 VinoVision AI — Ocorreu um Erro
            </h2>
            <p style={{ fontSize: '0.925rem', color: '#73646B', marginBottom: '1.75rem', lineHeight: 1.7 }}>
              {this.state.error?.toString() || 'Erro inesperado ao renderizar os componentes.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-gold"
            >
              Recarregar Aplicação
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
