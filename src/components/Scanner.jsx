import React, { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, Image as ImageIcon, RefreshCw, CheckCircle, ShieldAlert, Wine } from 'lucide-react';
import { SAMPLE_WINES } from '../data/sampleWines';

export default function Scanner({ onScanStart, isScanning, scanProgress }) {
  const [activeMode, setActiveMode] = useState('upload');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const videoRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);
  const streamRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); }
  };

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setCameraError('Não foi possível acessar a câmera. Use o upload de foto.');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      const file = new File([blob], 'rotulo.jpg', { type: 'image/jpeg' });
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      stopCamera();
      setActiveMode('upload');
    }, 'image/jpeg');
  };

  const triggerScan = (id) => onScanStart(id || selectedFile || previewUrl);

  const MODES = [
    { id: 'upload',  Icon: Upload,    label: 'Enviar Foto' },
    { id: 'camera',  Icon: Camera,    label: 'Câmera'      },
    { id: 'samples', Icon: ImageIcon, label: 'Amostras'    },
  ];

  const FEATURES = [
    { Icon: Sparkles,     title: 'OCR & Visão IA',    desc: 'Leitura do rótulo e safra' },
    { Icon: Wine,         title: 'Perfil Sensorial',  desc: 'Corpo, acidez e taninos'   },
    { Icon: CheckCircle,  title: 'Harmonização',      desc: 'Combinações de pratos'     },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-10)', paddingBottom: 'var(--space-16)' }}>

      {/* ── HERO ── */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-5)', maxWidth: '38rem', width: '100%' }}>
        <span className="inline-flex items-center" style={{ gap: 'var(--space-2)', padding: `var(--space-1) var(--space-4)`, borderRadius: '99px', background: 'rgba(128,14,38,0.4)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--gold-light)' }}>
          <Sparkles style={{ width: 'var(--text-sm)', height: 'var(--text-sm)', color: 'var(--gold-accent)' }} />
          Sommelier IA
        </span>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-5xl)', color: 'white', lineHeight: 1.15 }}>
          Identifique Qualquer Vinho <br />
          <span style={{ color: 'var(--gold-light)' }}>Pela Foto do Rótulo</span>
        </h1>
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', lineHeight: 1.8 }}>
          Envie a foto da garrafa para descobrir a vinícola, safra, aromas, harmonização e valor estimado.
        </p>
      </div>

      {/* ── SELETOR DE MODO ── */}
      <div className="flex items-center" style={{ background: 'rgba(255,255,255,0.05)', padding: 'var(--space-1)', borderRadius: '99px', border: '1px solid var(--border-clean)', gap: 'var(--space-1)', flexWrap: 'wrap', justifyContent: 'center' }}>
        {MODES.map(({ id, Icon, label }) => (
          <button
            key={id}
            onClick={() => { setActiveMode(id); if (id === 'camera') startCamera(); else stopCamera(); }}
            className="flex items-center font-semibold transition-all"
            style={{
              gap: 'var(--space-2)',
              padding: `var(--space-2) var(--space-5)`,
              borderRadius: '99px',
              fontSize: 'var(--text-sm)',
              border: 'none',
              cursor: 'pointer',
              background: activeMode === id ? 'var(--wine-primary)' : 'transparent',
              color: activeMode === id ? 'var(--gold-light)' : 'var(--text-muted)',
            }}
          >
            <Icon style={{ width: 'var(--text-base)', height: 'var(--text-base)' }} />
            {label}
          </button>
        ))}
      </div>

      {/* ── CARD DO ESCÂNER ── */}
      <div className="glass-card w-full relative overflow-hidden" style={{ padding: 'var(--space-10)' }}>

        {/* OVERLAY DE PROCESSAMENTO */}
        {isScanning && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(11,5,8,0.95)', backdropFilter: 'blur(12px)', zIndex: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-6)', padding: 'var(--space-8)' }}>
            <div style={{ position: 'relative', width: 'min(220px, 80%)', aspectRatio: '3/4', borderRadius: 'var(--radius-2xl)', overflow: 'hidden', border: '1px solid rgba(212,175,55,0.6)' }}>
              {previewUrl
                ? <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                : <div style={{ width: '100%', height: '100%', background: '#160a10', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Wine style={{ width: 'var(--text-5xl)', height: 'var(--text-5xl)', color: 'var(--gold-accent)' }} /></div>
              }
              <div className="scan-laser-line" />
            </div>
            <div style={{ width: '100%', maxWidth: '20rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)', textAlign: 'center' }}>
              <p className="flex items-center" style={{ gap: 'var(--space-2)', color: 'var(--gold-light)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                <RefreshCw style={{ width: 'var(--text-base)', height: 'var(--text-base)', color: 'var(--gold-accent)', animation: 'spin 1s linear infinite' }} />
                {scanProgress.text || 'Analisando o rótulo…'}
              </p>
              <div className="progress-bar-bg" style={{ width: '100%' }}>
                <div className="progress-bar-fill" style={{ width: `${scanProgress.percent || 10}%` }} />
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                {scanProgress.percent || 10}% concluído
              </p>
            </div>
          </div>
        )}

        {/* MODO UPLOAD */}
        {activeMode === 'upload' && !previewUrl && (
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            style={{ border: '2px dashed rgba(255,255,255,0.12)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-12)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-5)', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="label-upload-input" />
            <label htmlFor="label-upload-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
              <div style={{ width: 'clamp(3rem,6vw,4rem)', height: 'clamp(3rem,6vw,4rem)', borderRadius: '99px', background: 'rgba(128,14,38,0.3)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Upload style={{ width: 'clamp(1.25rem,2.5vw,1.75rem)', height: 'clamp(1.25rem,2.5vw,1.75rem)', color: 'var(--gold-light)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'white' }}>Arraste o rótulo aqui</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>ou clique para escolher um arquivo</p>
              </div>
              <span style={{ fontSize: 'var(--text-xs)', padding: `var(--space-1) var(--space-3)`, borderRadius: '99px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                JPG, PNG, WEBP, HEIC
              </span>
            </label>
          </div>
        )}

        {activeMode === 'upload' && previewUrl && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-6)' }}>
            <div style={{ position: 'relative', width: 'min(240px, 70%)', aspectRatio: '3/4', borderRadius: 'var(--radius-2xl)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)' }}>
              <img src={previewUrl} alt="Rótulo" className="w-full h-full object-cover" />
              <button onClick={() => { setPreviewUrl(null); setSelectedFile(null); }}
                style={{ position: 'absolute', top: 'var(--space-2)', right: 'var(--space-2)', background: 'rgba(11,5,8,0.8)', color: 'white', border: 'none', borderRadius: '99px', width: 'var(--text-2xl)', height: 'var(--text-2xl)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-sm)' }}>✕</button>
            </div>
            <button onClick={() => triggerScan()} className="btn-gold">
              <Sparkles style={{ width: 'var(--text-base)', height: 'var(--text-base)' }} />
              Analisar Rótulo Agora
            </button>
          </div>
        )}

        {/* MODO CÂMERA */}
        {activeMode === 'camera' && (
          cameraError
            ? <div style={{ padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)', background: 'rgba(128,14,38,0.2)', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', maxWidth: '24rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', alignItems: 'center' }}>
                <ShieldAlert style={{ width: 'var(--text-3xl)', height: 'var(--text-3xl)', color: 'var(--gold-light)' }} />
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gold-light)', lineHeight: 1.7 }}>{cameraError}</p>
                <button onClick={startCamera} className="btn-ghost">Tentar Novamente</button>
              </div>
            : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-6)' }}>
                <div style={{ position: 'relative', width: 'min(320px, 100%)', aspectRatio: '3/4', borderRadius: 'var(--radius-2xl)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', background: '#0b0508' }}>
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div style={{ position: 'absolute', inset: 'var(--space-4)', border: '2px dashed rgba(212,175,55,0.5)', borderRadius: 'var(--radius-xl)', pointerEvents: 'none', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 'var(--space-3)' }}>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--gold-light)', background: 'rgba(11,5,8,0.8)', padding: `var(--space-1) var(--space-3)`, borderRadius: '99px' }}>Enquadre o Rótulo</span>
                  </div>
                </div>
                <button onClick={capturePhoto} className="btn-gold">
                  <Camera style={{ width: 'var(--text-base)', height: 'var(--text-base)' }} />
                  Capturar & Analisar
                </button>
              </div>
        )}

        {/* MODO AMOSTRAS */}
        {activeMode === 'samples' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'var(--gold-light)' }}>Rótulos de Exemplo</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>Clique em um rótulo para simular o escaneamento</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6" style={{ gap: 'var(--space-3)' }}>
              {SAMPLE_WINES.map(s => (
                <div key={s.id} onClick={() => triggerScan(s.id)} style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-clean)', padding: 'var(--space-2)', overflow: 'hidden', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-clean)'}
                >
                  <div style={{ aspectRatio: '3/4', borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative', border: '1px solid var(--border-clean)' }}>
                    <img src={s.image} alt={s.name} className="w-full h-full object-cover" style={{ transition: 'transform 0.3s' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                    <span style={{ position: 'absolute', top: 'var(--space-1)', right: 'var(--space-1)', fontSize: 'var(--text-xs)' }}>{s.flagEmoji}</span>
                  </div>
                  <div style={{ padding: `var(--space-2) var(--space-1) var(--space-1)`, overflow: 'hidden' }}>
                    <p style={{ fontSize: 'calc(var(--text-xs) * 0.85)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--gold-accent)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.winery}</p>
                    <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── FEATURE TILES ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 w-full" style={{ gap: 'var(--space-4)' }}>
        {FEATURES.map(({ Icon, title, desc }) => (
          <div key={title} className="glass-card flex items-center" style={{ padding: 'var(--space-5)', gap: 'var(--space-4)' }}>
            <div style={{ width: 'clamp(2.25rem,4vw,2.75rem)', height: 'clamp(2.25rem,4vw,2.75rem)', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon style={{ width: 'var(--text-lg)', height: 'var(--text-lg)', color: 'var(--gold-accent)' }} />
            </div>
            <div>
              <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'white' }}>{title}</h4>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
