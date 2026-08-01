import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Scanner from './components/Scanner';
import WineDetails from './components/WineDetails';
import SampleGallery from './components/SampleGallery';
import Cellar from './components/Cellar';
import LoginPage from './pages/LoginPage';
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

  // Enquanto carrega a sessão, mostra um loader mínimo
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div style={{ width: 'var(--text-3xl)', height: 'var(--text-3xl)', border: '2px solid var(--border-clean)', borderTopColor: 'var(--gold-accent)', borderRadius: '99px', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Carregando…</p>
        </div>
      </div>
    );
  }

  // Sem sessão → página de login
  if (!user) return <LoginPage />;

  const handleStartScan = async (inputData) => {
    setIsScanning(true);
    setScanProgress({ stage: 'init', percent: 5, text: 'Carregando rótulo…' });
    try {
      const wine = await scanWineLabel(inputData, setScanProgress);
      setScannedWine(wine);
      setActiveTab('details');
    } catch (err) {
      console.error(err);
      alert('Erro ao processar a imagem. Tente outro ângulo.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectWine = (wine) => {
    setScannedWine(wine);
    setActiveTab('details');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)', color: 'var(--text-main)', overflowX: 'hidden' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} cellarCount={cellarWines.length} />

      <main style={{ flex: 1, width: '100%', maxWidth: '1280px', margin: '0 auto', padding: `var(--space-8) var(--space-5) var(--space-16)` }}>
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
        {activeTab === 'samples' && (
          <SampleGallery onSelectWine={handleSelectWine} />
        )}
        {activeTab === 'cellar' && (
          <Cellar
            cellarWines={cellarWines}
            onSelectWine={handleSelectWine}
            onRemoveWine={removeWine}
            onScanNew={() => setActiveTab('scanner')}
          />
        )}
      </main>

      <footer style={{ width: '100%', borderTop: '1px solid var(--border-clean)', padding: `var(--space-8) var(--space-6)`, background: 'rgba(7,3,5,0.8)', textAlign: 'center' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'white' }}>VinoVision AI</span>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>© 2026 VinoVision. Todos os direitos reservados.</p>
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
