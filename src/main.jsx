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
          backgroundColor: '#0d0609',
          color: '#f8f9fa',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: 'sans-serif',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'rgba(128, 14, 38, 0.4)',
            border: '1px solid #d4af37',
            borderRadius: '20px',
            padding: '2.5rem',
            maxWidth: '500px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{ fontSize: '1.5rem', color: '#f3e5ab', marginBottom: '1rem', fontFamily: 'serif' }}>
              🍷 VinoVision AI - Ocorreu um Erro
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#b0a3ab', marginBottom: '1.5rem' }}>
              {this.state.error?.toString() || 'Erro desconhecido ao carregar a interface.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'linear-gradient(135deg, #d4af37, #aa7c11)',
                color: '#0d0609',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '30px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
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
