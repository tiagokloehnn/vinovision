import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Scanner from './components/Scanner';
import WineDetails from './components/WineDetails';
import Cellar from './components/Cellar';
import SharedCellarModal from './components/SharedCellarModal';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import RoleGuard from './components/RoleGuard';
import PwaInstallPrompt from './components/PwaInstallPrompt';
import { useSharedCellar } from './hooks/useSharedCellar';
import { scanWineLabel } from './utils/aiScanner';

// ── App interno (usa os hooks de auth e adega) ─────────────────────────
function AppInner() {
  const { user, profile, loading: authLoading } = useAuth();
  const {
    cellarsList,
    activeCellar,
    activeCellarId,
    setActiveCellarId,
    cellarWines,
    cellarMembers,
    loadingMembers,
    createSharedCellar,
    joinSharedCellar,
    leaveSharedCellar,
    deleteSharedCellar,
    toggleWine,
    removeWine,
    isInCellar,
    updateWineReview,
    getWineCellars,
    toggleWineInCellar,
    saveWineToCellars
  } = useSharedCellar();

  const [activeTab, setActiveTab]             = useState('scanner');
  const [scannedWine, setScannedWine]         = useState(null);
  const [isScanning, setIsScanning]           = useState(false);
  const [scanProgress, setScanProgress]       = useState({ stage: 'init', percent: 0, text: '' });
  const [scanError, setScanError]             = useState(null);
  const [isSharedModalOpen, setIsSharedModalOpen] = useState(false);

  // Lê atalhos rápidos do PWA (ex: ?tab=cellar ou ?tab=scanner)
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['scanner', 'cellar', 'admin'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

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
    setScanError(null);
    setScanProgress({ stage: 'init', percent: 5, text: 'Otimizando rótulo…' });
    try {
      const wine = await scanWineLabel(inputData, setScanProgress);
      setScannedWine(wine);
      setActiveTab('details');
    } catch (err) {
      console.error('[VinoVision Scan Error]:', err);
      setScanError(err.message || 'Erro ao processar a imagem do rótulo.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectWine = (wine) => {
    setScannedWine(wine);
    setActiveTab('details');
  };

  const activeWine = scannedWine
    ? (cellarWines.find(w => w.id === scannedWine.id) || scannedWine)
    : null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-canvas)', color: 'var(--text-main)', overflowX: 'hidden' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} cellarCount={cellarWines.length} />

      <main style={{ flex: 1, width: '100%', maxWidth: '1280px', margin: '0 auto', padding: `var(--space-6) var(--space-4) var(--space-16)`, boxSizing: 'border-box' }}>
        {activeTab === 'scanner' && (
          <Scanner onScanStart={handleStartScan} isScanning={isScanning} scanProgress={scanProgress} />
        )}
        {activeTab === 'details' && activeWine && (
          <WineDetails
            wine={activeWine}
            onBack={() => setActiveTab('scanner')}
            onSaveCellar={toggleWine}
            onUpdateReview={async (targetWine, reviewData) => {
              const updated = await updateWineReview(targetWine, reviewData);
              if (updated) setScannedWine(updated);
            }}
            isSaved={isInCellar(activeWine.id)}
            currentUserId={user.id}
            activeCellar={activeCellar}
            cellarsList={cellarsList}
            getWineCellars={getWineCellars}
            onToggleCellar={toggleWineInCellar}
            onSaveToCellars={saveWineToCellars}
          />
        )}
        {activeTab === 'cellar' && (
          <Cellar
            cellarWines={cellarWines}
            onSelectWine={handleSelectWine}
            onRemoveWine={removeWine}
            onScanNew={() => setActiveTab('scanner')}
            activeCellar={activeCellar}
            cellarsList={cellarsList}
            onOpenSharedModal={() => setIsSharedModalOpen(true)}
            onSelectCellar={(id) => setActiveCellarId(id)}
          />
        )}
        {activeTab === 'admin' && (
          <RoleGuard allowedRoles={['ADMIN']} onFallback={() => setActiveTab('scanner')}>
            <AdminPage />
          </RoleGuard>
        )}
      </main>

      {/* ── MODAL DE GERENCIAMENTO DE ADEGAS COMPARTILHADAS ── */}
      <SharedCellarModal
        isOpen={isSharedModalOpen}
        onClose={() => setIsSharedModalOpen(false)}
        cellarsList={cellarsList}
        activeCellar={activeCellar}
        activeCellarId={activeCellarId}
        onSelectCellar={(id) => setActiveCellarId(id)}
        onCreateCellar={createSharedCellar}
        onJoinCellar={joinSharedCellar}
        onLeaveCellar={leaveSharedCellar}
        onDeleteCellar={deleteSharedCellar}
        cellarMembers={cellarMembers}
        loadingMembers={loadingMembers}
        currentUserId={user?.id}
      />

      {/* ── MODAL DE AVISO / ERRO DE ESCANEAMENTO ── */}
      {scanError && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(26,20,22,0.65)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card animate-scaleUp" style={{ maxWidth: '28rem', width: '100%', padding: 'clamp(1.5rem, 4vw, 2rem)', background: '#FFFFFF', borderRadius: 'var(--radius-2xl)', boxShadow: '0 20px 50px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
            <button
              onClick={() => setScanError(null)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.25rem', lineHeight: 1 }}
              title="Fechar"
            >
              ✕
            </button>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FDF2F4', border: '1px solid rgba(114,27,41,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.5rem' }}>🍷</span>
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 700 }}>
                Aviso da IA Sommelier
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.6 }}>
                {scanError}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
              {profile?.role === 'ADMIN' && (
                <button
                  onClick={() => { setScanError(null); setActiveTab('admin'); }}
                  className="btn-wine"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Ir para Conexões no Painel Admin
                </button>
              )}
              <button
                onClick={() => setScanError(null)}
                className="btn-ghost"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <footer style={{ width: '100%', borderTop: '1px solid var(--border-clean)', padding: `var(--space-8) var(--space-6)`, background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(16px)', textAlign: 'center' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--wine-primary)', letterSpacing: '-0.01em' }}>VinoVision AI</span>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>© 2026 VinoVision AI. Sommelier de Alta Precisão & Inteligência Enológica.</p>
        </div>
      </footer>

      {/* ── BANNER / PROMPT DE INSTALAÇÃO PWA ── */}
      <PwaInstallPrompt />
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
