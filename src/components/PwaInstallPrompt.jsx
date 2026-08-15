import React, { useState, useEffect } from 'react';
import { Download, Share2, PlusSquare, X, Smartphone, Sparkles, Wine } from 'lucide-react';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Verifica se já está rodando como PWA standalone
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                             window.navigator.standalone || 
                             document.referrer.includes('android-app://');

    if (isStandaloneMode) {
      setIsStandalone(true);
      return;
    }

    // Detecta se é dispositivo iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Se já dispensou nesta sessão, não exibe
    const dismissed = sessionStorage.getItem('vv_pwa_dismissed');
    if (dismissed) return;

    // Listener para o evento nativo do Chrome/Android/Edge
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Exibe após 3 segundos de navegação
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // No iOS, se não for standalone e nunca foi dispensado, exibe após 4 segundos
    if (isIosDevice && !isStandaloneMode) {
      const timer = setTimeout(() => setShowPrompt(true), 4000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosModal(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('[VinoVision PWA] Usuário aceitou a instalação.');
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('vv_pwa_dismissed', 'true');
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <>
      {/* ── BANNER FLUTUANTE DE INSTALAÇÃO (CLEAN LUXURY) ── */}
      <div style={{ position: 'fixed', bottom: 'var(--space-4)', left: '50%', transform: 'translateX(-50%)', width: 'min(32rem, calc(100vw - 1.5rem))', zIndex: 90 }} className="animate-fadeIn">
        <div className="glass-card flex items-center justify-between" style={{ padding: 'var(--space-3) var(--space-4)', background: '#FFFFFF', border: '1px solid rgba(184, 141, 34, 0.35)', boxShadow: '0 15px 35px -5px rgba(35, 20, 25, 0.15)', gap: 'var(--space-3)' }}>
          
          <div className="flex items-center" style={{ gap: 'var(--space-3)', minWidth: 0 }}>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #721B29, #4A0E1A)', border: '1px solid rgba(184, 141, 34, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(114,27,41,0.2)' }}>
              <Wine style={{ width: 'var(--text-base)', height: 'var(--text-base)', color: '#FDF8EB' }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="flex items-center" style={{ gap: 'var(--space-1)' }}>
                <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Instalar VinoVision AI</h4>
                <Sparkles style={{ width: '12px', height: '12px', color: 'var(--gold-accent)', flexShrink: 0 }} />
              </div>
              <p style={{ fontSize: 'calc(var(--text-xs) * 0.9)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {isIos ? 'Adicione à tela de início do seu iPhone' : 'Acesse como um app nativo no celular'}
              </p>
            </div>
          </div>

          <div className="flex items-center" style={{ gap: 'var(--space-2)', flexShrink: 0 }}>
            <button
              onClick={handleInstallClick}
              className="btn-wine"
              style={{ padding: '6px 14px', fontSize: 'var(--text-xs)', gap: 'var(--space-1)' }}
            >
              <Download style={{ width: 'var(--text-sm)', height: 'var(--text-sm)' }} />
              Instalar
            </button>

            <button
              onClick={handleDismiss}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
              title="Dispensar"
            >
              <X style={{ width: 'var(--text-base)', height: 'var(--text-base)' }} />
            </button>
          </div>

        </div>
      </div>

      {/* ── MODAL DE GUIA PARA IOS (IPHONE/IPAD) ── */}
      {showIosModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(20, 14, 17, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}>
          <div className="glass-card animate-fadeIn" style={{ width: '100%', maxWidth: '26rem', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', position: 'relative', background: '#FFFFFF', border: '1px solid rgba(184,141,34,0.3)', boxShadow: '0 25px 50px -12px rgba(35,20,25,0.2)' }}>
            
            <button
              onClick={() => setShowIosModal(false)}
              style={{ position: 'absolute', top: 'var(--space-3)', right: 'var(--space-3)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X style={{ width: 'var(--text-lg)', height: 'var(--text-lg)' }} />
            </button>

            <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
              <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: 'var(--radius-md)', background: '#FDF8EB', border: '1px solid rgba(184,141,34,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Smartphone style={{ width: 'var(--text-lg)', height: 'var(--text-lg)', color: 'var(--gold-accent)' }} />
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', color: 'var(--text-main)', fontWeight: 700 }}>Instalar no iPhone / iPad</h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Siga os passos abaixo no Safari:</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div className="flex items-center" style={{ gap: 'var(--space-3)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: '#FAF8F5', border: '1px solid var(--border-clean)' }}>
                <div style={{ width: '2rem', height: '2rem', borderRadius: '99px', background: 'var(--wine-light)', border: '1px solid var(--wine-border)', color: 'var(--wine-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 'var(--text-xs)' }}>1</div>
                <div style={{ flex: 1, fontSize: 'var(--text-xs)', color: 'var(--text-main)', lineHeight: 1.5 }}>
                  Toque no botão <strong>Compartilhar</strong> <Share2 style={{ display: 'inline', width: '13px', height: '13px', verticalAlign: 'middle', margin: '0 2px' }} /> na barra inferior do Safari.
                </div>
              </div>

              <div className="flex items-center" style={{ gap: 'var(--space-3)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: '#FAF8F5', border: '1px solid var(--border-clean)' }}>
                <div style={{ width: '2rem', height: '2rem', borderRadius: '99px', background: 'var(--wine-light)', border: '1px solid var(--wine-border)', color: 'var(--wine-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 'var(--text-xs)' }}>2</div>
                <div style={{ flex: 1, fontSize: 'var(--text-xs)', color: 'var(--text-main)', lineHeight: 1.5 }}>
                  Role para baixo e selecione <strong>Adicionar à Tela de Início</strong> <PlusSquare style={{ display: 'inline', width: '13px', height: '13px', verticalAlign: 'middle', margin: '0 2px' }} />.
                </div>
              </div>

              <div className="flex items-center" style={{ gap: 'var(--space-3)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: '#FAF8F5', border: '1px solid var(--border-clean)' }}>
                <div style={{ width: '2rem', height: '2rem', borderRadius: '99px', background: 'var(--wine-light)', border: '1px solid var(--wine-border)', color: 'var(--wine-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 'var(--text-xs)' }}>3</div>
                <div style={{ flex: 1, fontSize: 'var(--text-xs)', color: 'var(--text-main)', lineHeight: 1.5 }}>
                  Toque em <strong>Adicionar</strong> no canto superior direito. Pronto!
                </div>
              </div>
            </div>

            <button
              onClick={() => { setShowIosModal(false); setShowPrompt(false); }}
              className="btn-wine"
              style={{ width: '100%', justifyContent: 'center', fontSize: 'var(--text-xs)' }}
            >
              Entendido
            </button>

          </div>
        </div>
      )}
    </>
  );
}
