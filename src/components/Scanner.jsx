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
    { Icon: Sparkles,     title: 'OCR & Visão IA',    desc: 'Leitura instantânea de vinícola e safra' },
    { Icon: Wine,         title: 'Perfil Sensorial',  desc: 'Corpo, taninos, acidez e notas olfativas' },
    { Icon: CheckCircle,  title: 'Harmonização',      desc: 'Sugestões gastronômicas de alta cozinha' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-10)', paddingBottom: 'var(--space-16)' }}>

      {/* ── HERO EDITORIAL ── */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)', maxWidth: '42rem', width: '100%' }}>
        <span className="inline-flex items-center" style={{ gap: 'var(--space-2)', padding: `6px 18px`, borderRadius: '99px', background: '#FDF8EB', border: '1px solid rgba(184, 141, 34, 0.3)', fontSize: 'var(--text-xs)', fontWeight: 700, color: '#8C6810', letterSpacing: '0.08em', textTransform: 'uppercase', boxShadow: '0 2px 8px rgba(184,141,34,0.1)' }}>
          <Sparkles style={{ width: 'var(--text-sm)', height: 'var(--text-sm)', color: '#B88D22' }} />
          Sommelier de Precisão IA
        </span>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-5xl)', color: 'var(--text-main)', lineHeight: 1.15 }}>
          Identifique Qualquer Vinho <br />
          <span style={{ color: 'var(--wine-primary)' }}>Pela Foto do Rótulo</span>
        </h1>
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: '34rem' }}>
          Fotografe ou envie a imagem da garrafa para obter ficha técnica completa, safra, notas de degustação e harmonizações exclusivas.
        </p>
      </div>

      {/* ── SELETOR DE MODO ── */}
      <div className="flex items-center" style={{ background: '#F2EDE4', padding: '5px', borderRadius: '99px', border: '1px solid rgba(0,0,0,0.06)', gap: '4px', flexWrap: 'wrap', justifyContent: 'center', boxShadow: '0 2px 8px rgba(35,20,25,0.04)' }}>
        {MODES.map(({ id, Icon, label }) => {
          const isActive = activeMode === id;
          return (
            <button
              key={id}
              onClick={() => { setActiveMode(id); if (id === 'camera') startCamera(); else stopCamera(); }}
              className="flex items-center font-semibold transition-all"
              style={{
                gap: 'var(--space-2)',
                padding: `var(--space-2) var(--space-6)`,
                borderRadius: '99px',
                fontSize: 'var(--text-sm)',
                border: 'none',
                cursor: 'pointer',
                background: isActive ? 'var(--wine-primary)' : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                boxShadow: isActive ? '0 4px 12px rgba(114,27,41,0.22)' : 'none',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <Icon style={{ width: 'var(--text-base)', height: 'var(--text-base)', color: isActive ? '#FDF8EB' : 'inherit' }} />
              {label}
            </button>
          );
        })}
      </div>

      {/* ── CARD DO ESCÂNER ── */}
      <div className="glass-card w-full relative overflow-hidden" style={{ padding: 'var(--space-10)', background: 'rgba(255, 255, 255, 0.92)' }}>

        {/* OVERLAY DE PROCESSAMENTO */}
        {isScanning && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(248, 245, 240, 0.96)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', zIndex: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-6)', padding: 'var(--space-8)' }}>
            <div style={{ position: 'relative', width: 'min(220px, 80%)', aspectRatio: '3/4', borderRadius: 'var(--radius-2xl)', overflow: 'hidden', border: '2px solid rgba(184, 141, 34, 0.5)', boxShadow: '0 12px 30px rgba(184,141,34,0.2)' }}>
              {previewUrl
                ? <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                : <div style={{ width: '100%', height: '100%', background: '#F8F5F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Wine style={{ width: 'var(--text-5xl)', height: 'var(--text-5xl)', color: 'var(--wine-primary)' }} /></div>
              }
              <div className="scan-laser-line" />
            </div>
            <div style={{ width: '100%', maxWidth: '22rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)', textAlign: 'center' }}>
              <p className="flex items-center" style={{ gap: 'var(--space-2)', color: 'var(--wine-primary)', fontSize: 'var(--text-base)', fontWeight: 600 }}>
                <RefreshCw style={{ width: 'var(--text-base)', height: 'var(--text-base)', color: 'var(--gold-accent)', animation: 'spin 1s linear infinite' }} />
                {scanProgress.text || 'Analisando o rótulo…'}
              </p>
              <div className="progress-bar-bg" style={{ width: '100%' }}>
                <div className="progress-bar-fill" style={{ width: `${scanProgress.percent || 10}%` }} />
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>
                {scanProgress.percent || 10}% processado pela Inteligência Artificial
              </p>
            </div>
          </div>
        )}

        {/* MODO UPLOAD */}
        {activeMode === 'upload' && !previewUrl && (
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            style={{ border: '2px dashed rgba(184, 141, 34, 0.35)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-12)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-5)', textAlign: 'center', cursor: 'pointer', transition: 'all 0.25s ease', background: '#FAF8F5' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(114, 27, 41, 0.6)'; e.currentTarget.style.background = '#FBF9F6'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(184, 141, 34, 0.35)'; e.currentTarget.style.background = '#FAF8F5'; }}
          >
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="label-upload-input" />
            <label htmlFor="label-upload-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)', width: '100%' }}>
              <div style={{ width: 'clamp(3.5rem,6vw,4.5rem)', height: 'clamp(3.5rem,6vw,4.5rem)', borderRadius: '99px', background: '#FDF2F4', border: '1px solid rgba(114,27,41,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(114,27,41,0.12)' }}>
                <Upload style={{ width: 'clamp(1.5rem,2.5vw,2rem)', height: 'clamp(1.5rem,2.5vw,2rem)', color: 'var(--wine-primary)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>Arraste a foto do rótulo aqui</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>ou clique para selecionar do seu dispositivo</p>
              </div>
              <span style={{ fontSize: 'var(--text-xs)', padding: `4px 14px`, borderRadius: '99px', background: '#FFFFFF', color: 'var(--text-muted)', border: '1px solid rgba(0,0,0,0.08)', fontWeight: 600 }}>
                JPG, PNG, WEBP, HEIC
              </span>
            </label>
          </div>
        )}

        {activeMode === 'upload' && previewUrl && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-6)' }}>
            <div style={{ position: 'relative', width: 'min(260px, 70%)', aspectRatio: '3/4', borderRadius: 'var(--radius-2xl)', overflow: 'hidden', border: '1px solid rgba(184, 141, 34, 0.3)', boxShadow: '0 10px 30px rgba(35,20,25,0.12)' }}>
              <img src={previewUrl} alt="Rótulo do Vinho" className="w-full h-full object-cover" />
              <button onClick={() => { setPreviewUrl(null); setSelectedFile(null); }}
                style={{ position: 'absolute', top: 'var(--space-2)', right: 'var(--space-2)', background: 'rgba(26,20,22,0.75)', color: '#FFFFFF', border: 'none', borderRadius: '99px', width: '2rem', height: '2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-sm)', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(114,27,41,0.9)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(26,20,22,0.75)'}
                title="Remover foto">✕</button>
            </div>
            <button onClick={() => triggerScan()} className="btn-wine">
              <Sparkles style={{ width: 'var(--text-base)', height: 'var(--text-base)' }} />
              Analisar Rótulo Agora
            </button>
          </div>
        )}

        {/* MODO CÂMERA */}
        {activeMode === 'camera' && (
          cameraError
            ? <div style={{ padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)', background: '#FDF2F4', border: '1px solid rgba(114,27,41,0.2)', textAlign: 'center', maxWidth: '24rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', alignItems: 'center' }}>
                <ShieldAlert style={{ width: 'var(--text-3xl)', height: 'var(--text-3xl)', color: 'var(--wine-primary)' }} />
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--wine-primary)', lineHeight: 1.7, fontWeight: 500 }}>{cameraError}</p>
                <button onClick={startCamera} className="btn-ghost">Tentar Novamente</button>
              </div>
            : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-6)' }}>
                <div style={{ position: 'relative', width: 'min(340px, 100%)', aspectRatio: '3/4', borderRadius: 'var(--radius-2xl)', overflow: 'hidden', border: '2px solid rgba(184,141,34,0.35)', background: '#1A1416', boxShadow: '0 12px 35px rgba(35,20,25,0.15)' }}>
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div style={{ position: 'absolute', inset: 'var(--space-4)', border: '2px dashed rgba(212,175,55,0.8)', borderRadius: 'var(--radius-xl)', pointerEvents: 'none', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 'var(--space-3)' }}>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: '#1A1416', background: 'rgba(255,255,255,0.92)', padding: `4px 14px`, borderRadius: '99px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>Enquadre o Rótulo</span>
                  </div>
                </div>
                <button onClick={capturePhoto} className="btn-wine">
                  <Camera style={{ width: 'var(--text-base)', height: 'var(--text-base)' }} />
                  Capturar & Analisar
                </button>
              </div>
        )}

        {/* MODO AMOSTRAS */}
        {activeMode === 'samples' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'var(--text-main)' }}>Rótulos de Referência</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>Selecione um rótulo consagrado para experimentar a análise enológica instantânea</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6" style={{ gap: 'var(--space-3)' }}>
              {SAMPLE_WINES.map(s => (
                <div key={s.id} onClick={() => triggerScan(s.id)} style={{ cursor: 'pointer', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-clean)', padding: 'var(--space-2)', overflow: 'hidden', transition: 'all 0.25s ease', boxShadow: '0 2px 8px rgba(35,20,25,0.03)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(184,141,34,0.6)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(184,141,34,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-clean)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(35,20,25,0.03)'; }}
                >
                  <div style={{ aspectRatio: '3/4', borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative', border: '1px solid rgba(0,0,0,0.05)' }}>
                    <img src={s.image} alt={s.name} className="w-full h-full object-cover" style={{ transition: 'transform 0.4s' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                    <span style={{ position: 'absolute', top: 'var(--space-1)', right: 'var(--space-1)', fontSize: 'var(--text-xs)', background: 'rgba(255,255,255,0.85)', padding: '2px 4px', borderRadius: '4px' }}>{s.flagEmoji}</span>
                  </div>
                  <div style={{ padding: `var(--space-2) var(--space-1) var(--space-1)`, overflow: 'hidden' }}>
                    <p style={{ fontSize: 'calc(var(--text-xs) * 0.88)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--gold-accent)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.winery}</p>
                    <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── FEATURE TILES DE LUXO ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 w-full" style={{ gap: 'var(--space-4)' }}>
        {FEATURES.map(({ Icon, title, desc }) => (
          <div key={title} className="glass-card flex items-center" style={{ padding: 'var(--space-5)', gap: 'var(--space-4)', background: '#FFFFFF' }}>
            <div style={{ width: 'clamp(2.5rem,4vw,3rem)', height: 'clamp(2.5rem,4vw,3rem)', borderRadius: 'var(--radius-lg)', background: '#FDF2F4', border: '1px solid rgba(114,27,41,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(114,27,41,0.08)' }}>
              <Icon style={{ width: 'var(--text-lg)', height: 'var(--text-lg)', color: 'var(--wine-primary)' }} />
            </div>
            <div>
              <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-main)' }}>{title}</h4>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
