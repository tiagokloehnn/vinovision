import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Scanner from './components/Scanner';
import WineDetails from './components/WineDetails';
import Cellar from './components/Cellar';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import RoleGuard from './components/RoleGuard';
import { useCellar } from './hooks/useCellar';
import { scanWineLabel } from './utils/aiScanner';

// ── App interno (usa os hooks de auth e adega) ─────────────────────────
function AppInner() {
  const { user, loading: authLoading } = useAuth();
  const { cellarWines, toggleWine, removeWine, isInCellar } = useCellar();

  const [activeTab, setActiveTab]       = useState('scanner');
  const [scannedWine, setScannedWine]   = useState(null);
  const [isScanning, setIsScanning]     = useState(false);
  const [scanProgress, setScanProgress] = useState({ stage: 'init', percent: 0, text: '' });

  // Enquanto carrega a sessão, mostra um loader clean e elegante
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-canvas)', color: 'var(--text-main)' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '44px', height: '44px', border: '3px solid rgba(184, 141, 34, 0.2)', borderTopColor: 'var(--wine-primary)', borderRadius: '50%', animation: 'spin 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite' }} />
          <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontWeight: 500, letterSpacing: '0.02em' }}>Carregando VinoVision AI…</p>
        </div>
      </div>
    );
  }

  // Sem sessão → página de login
  if (!user) return <LoginPage />;

  const handleStartScan = async (inputData) => {
    setIsScanning(true);
    setScanProgress({ stage: 'init', percent: 5, text: 'Otimizando rótulo…' });
    try {
      const wine = await scanWineLabel(inputData, setScanProgress);
      setScannedWine(wine);
      setActiveTab('details');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Erro ao processar a imagem.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectWine = (wine) => {
    setScannedWine(wine);
    setActiveTab('details');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-canvas)', color: 'var(--text-main)', overflowX: 'hidden' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} cellarCount={cellarWines.length} />

      <main style={{ flex: 1, width: '100%', maxWidth: '1280px', margin: '0 auto', padding: `var(--space-6) var(--space-4) var(--space-16)`, boxSizing: 'border-box' }}>
        {activeTab === 'scanner' && (
          <Scanner onScanStart={handleStartScan} isScanning={isScanning} scanProgress={scanProgress} />
        )}
        {activeTab === 'details' && scannedWine && (
          <WineDetails
            wine={scannedWine}
            onBack={() => setActiveTab('scanner')}
            onSaveCellar={toggleWine}
            isSaved={isInCellar(scannedWine.id)}
          />
        )}
        {activeTab === 'cellar' && (
          <Cellar
            cellarWines={cellarWines}
            onSelectWine={handleSelectWine}
            onRemoveWine={removeWine}
            onScanNew={() => setActiveTab('scanner')}
          />
        )}
        {activeTab === 'admin' && (
          <RoleGuard allowedRoles={['ADMIN']} onFallback={() => setActiveTab('scanner')}>
            <AdminPage />
          </RoleGuard>
        )}
      </main>

      <footer style={{ width: '100%', borderTop: '1px solid var(--border-clean)', padding: `var(--space-8) var(--space-6)`, background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(16px)', textAlign: 'center' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--wine-primary)', letterSpacing: '-0.01em' }}>VinoVision AI</span>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>© 2026 VinoVision AI. Sommelier de Alta Precisão & Inteligência Enológica.</p>
        </div>
      </footer>
    </div>
  );
}

// ── Root com providers ─────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/*" element={<AppInner />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
