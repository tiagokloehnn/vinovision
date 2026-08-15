import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, Sparkles, RefreshCw, CheckCircle, ShieldAlert, Wine, KeyRound, ArrowRight, Info } from 'lucide-react';
import { SAMPLE_WINES } from '../data/sampleWines';
import { hasActiveVisionKeys } from '../utils/aiScanner';

export default function Scanner({ onScanStart, isScanning, scanProgress }) {
  const [activeMode, setActiveMode] = useState('upload');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [hasAiKey, setHasAiKey] = useState(false);
  const [checkingKey, setCheckingKey] = useState(true);
  const videoRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);
  const streamRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    hasActiveVisionKeys().then(active => {
      if (isMounted) {
        setHasAiKey(active);
        setCheckingKey(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

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
    { id: 'upload', Icon: Upload, label: 'Enviar Foto' },
    { id: 'camera', Icon: Camera, label: 'Câmera'      },
  ];

  const FEATURES = [
    { Icon: Sparkles,     title: 'OCR & Visão IA',    desc: 'Leitura instantânea de vinícola, safra e terroir' },
    { Icon: Wine,         title: 'Perfil Sensorial',  desc: 'Radar de corpo, taninos, acidez e doçura' },
    { Icon: CheckCircle,  title: 'Harmonização',      desc: 'Sugestões gastronômicas e temperatura ideal' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>

      {/* ── HERO EDITORIAL ── */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)', maxWidth: '42rem', width: '100%' }}>
        <span className="inline-flex items-center" style={{ gap: 'var(--space-2)', padding: `5px 16px`, borderRadius: '99px', background: '#FDF8EB', border: '1px solid rgba(184, 141, 34, 0.3)', fontSize: 'var(--text-xs)', fontWeight: 700, color: '#8C6810', letterSpacing: '0.08em', textTransform: 'uppercase', boxShadow: '0 2px 8px rgba(184,141,34,0.1)' }}>
          <Sparkles style={{ width: 'var(--text-sm)', height: 'var(--text-sm)', color: '#B88D22' }} />
          Sommelier de Precisão IA
        </span>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-5xl)', color: 'var(--text-main)', lineHeight: 1.15, wordBreak: 'break-word' }}>
          Identifique Qualquer Vinho <br />
          <span style={{ color: 'var(--wine-primary)' }}>Pela Foto do Rótulo</span>
        </h1>
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '34rem' }}>
          Fotografe ou envie a imagem da garrafa para obter ficha técnica completa, safra, notas de degustação e harmonizações exclusivas.
        </p>

        {/* ── BADGE DE STATUS DA IA ── */}
        {!checkingKey && (
          <div style={{ marginTop: 'var(--space-1)', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', padding: '6px 14px', borderRadius: '99px', background: hasAiKey ? '#ECFDF5' : '#FFFBEB', border: `1px solid ${hasAiKey ? '#A7F3D0' : '#FDE68A'}`, fontSize: '0.8rem', fontWeight: 600, color: hasAiKey ? '#065F46' : '#92400E' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: hasAiKey ? '#10B981' : '#F59E0B', display: 'inline-block' }} />
            {hasAiKey
              ? 'IA de Visão Computacional Ativa (Gemini / OpenAI)'
              : 'Modo Demonstração Ativo — Você pode testar amostras ou adicionar chave no Painel Admin'
            }
          </div>
        )}
      </div>

      {/* ── SELETOR DE MODO ── */}
      <div className="flex items-center justify-center w-full" style={{ maxWidth: '22rem' }}>
        <div className="flex items-center w-full" style={{ background: '#F2EDE4', padding: '4px', borderRadius: '99px', border: '1px solid rgba(0,0,0,0.06)', gap: '4px', boxShadow: '0 2px 8px rgba(35,20,25,0.04)' }}>
          {MODES.map(({ id, Icon, label }) => {
            const isActive = activeMode === id;
            return (
              <button
                key={id}
                onClick={() => { setActiveMode(id); if (id === 'camera') startCamera(); else stopCamera(); }}
                className="flex-1 flex items-center justify-center font-semibold transition-all"
                style={{
                  gap: 'var(--space-2)',
                  padding: `var(--space-2) var(--space-4)`,
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
      </div>

      {/* ── CARD DO ESCÂNER ── */}
      <div className="glass-card w-full relative overflow-hidden" style={{ padding: 'clamp(1rem, 3vw, 2.5rem)', background: 'rgba(255, 255, 255, 0.92)' }}>

        {/* OVERLAY DE PROCESSAMENTO */}
        {isScanning && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(248, 245, 240, 0.97)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', zIndex: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-5)', padding: 'var(--space-4)' }}>
            <div style={{ position: 'relative', width: 'min(200px, 70vw)', aspectRatio: '3/4', borderRadius: 'var(--radius-2xl)', overflow: 'hidden', border: '2px solid rgba(184, 141, 34, 0.5)', boxShadow: '0 12px 30px rgba(184,141,34,0.2)' }}>
              {previewUrl
                ? <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                : <div style={{ width: '100%', height: '100%', background: '#F8F5F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Wine style={{ width: 'var(--text-5xl)', height: 'var(--text-5xl)', color: 'var(--wine-primary)' }} /></div>
              }
              <div className="scan-laser-line" />
            </div>
            <div style={{ width: '100%', maxWidth: '20rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)', textAlign: 'center' }}>
              <p className="flex items-center" style={{ gap: 'var(--space-2)', color: 'var(--wine-primary)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
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
            style={{ border: '2px dashed rgba(184, 141, 34, 0.35)', borderRadius: 'var(--radius-xl)', padding: 'clamp(1.5rem, 4vw, 3rem)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-4)', textAlign: 'center', cursor: 'pointer', transition: 'all 0.25s ease', background: '#FAF8F5', width: '100%' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(114, 27, 41, 0.6)'; e.currentTarget.style.background = '#FBF9F6'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(184, 141, 34, 0.35)'; e.currentTarget.style.background = '#FAF8F5'; }}
          >
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="label-upload-input" />
            <label htmlFor="label-upload-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)', width: '100%' }}>
              <div style={{ width: 'clamp(3rem,5vw,4.25rem)', height: 'clamp(3rem,5vw,4.25rem)', borderRadius: '99px', background: '#FDF2F4', border: '1px solid rgba(114,27,41,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(114,27,41,0.12)' }}>
                <Upload style={{ width: 'clamp(1.25rem,2vw,1.75rem)', height: 'clamp(1.25rem,2vw,1.75rem)', color: 'var(--wine-primary)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>Arraste a foto do rótulo aqui</h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>ou toque para selecionar do seu dispositivo</p>
              </div>
              <span style={{ fontSize: 'var(--text-xs)', padding: `4px 12px`, borderRadius: '99px', background: '#FFFFFF', color: 'var(--text-muted)', border: '1px solid rgba(0,0,0,0.08)', fontWeight: 600 }}>
                JPG, PNG, WEBP, HEIC
              </span>
            </label>
          </div>
        )}

        {activeMode === 'upload' && previewUrl && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-5)', width: '100%' }}>
            <div style={{ position: 'relative', width: 'min(240px, 75vw)', aspectRatio: '3/4', borderRadius: 'var(--radius-2xl)', overflow: 'hidden', border: '1px solid rgba(184, 141, 34, 0.3)', boxShadow: '0 10px 30px rgba(35,20,25,0.12)' }}>
              <img src={previewUrl} alt="Rótulo do Vinho" className="w-full h-full object-cover" />
              <button onClick={() => { setPreviewUrl(null); setSelectedFile(null); }}
                style={{ position: 'absolute', top: 'var(--space-2)', right: 'var(--space-2)', background: 'rgba(26,20,22,0.75)', color: '#FFFFFF', border: 'none', borderRadius: '99px', width: '2rem', height: '2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-sm)', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(114,27,41,0.9)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(26,20,22,0.75)'}
                title="Remover foto">✕</button>
            </div>
            <button onClick={() => triggerScan()} className="btn-wine" style={{ width: 'min(240px, 100%)' }}>
              <Sparkles style={{ width: 'var(--text-base)', height: 'var(--text-base)' }} />
              Analisar Rótulo Agora
            </button>
          </div>
        )}

        {/* MODO CÂMERA */}
        {activeMode === 'camera' && (
          cameraError
            ? <div style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', background: '#FDF2F4', border: '1px solid rgba(114,27,41,0.2)', textAlign: 'center', maxWidth: '24rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', alignItems: 'center' }}>
                <ShieldAlert style={{ width: 'var(--text-3xl)', height: 'var(--text-3xl)', color: 'var(--wine-primary)' }} />
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--wine-primary)', lineHeight: 1.7, fontWeight: 500 }}>{cameraError}</p>
                <button onClick={startCamera} className="btn-ghost">Tentar Novamente</button>
              </div>
            : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-5)', width: '100%' }}>
                <div style={{ position: 'relative', width: 'min(300px, 85vw)', aspectRatio: '3/4', borderRadius: 'var(--radius-2xl)', overflow: 'hidden', border: '2px solid rgba(184,141,34,0.35)', background: '#1A1416', boxShadow: '0 12px 35px rgba(35,20,25,0.15)' }}>
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div style={{ position: 'absolute', inset: 'var(--space-3)', border: '2px dashed rgba(212,175,55,0.8)', borderRadius: 'var(--radius-xl)', pointerEvents: 'none', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 'var(--space-2)' }}>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: '#1A1416', background: 'rgba(255,255,255,0.92)', padding: `3px 12px`, borderRadius: '99px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>Enquadre o Rótulo</span>
                  </div>
                </div>
                <button onClick={capturePhoto} className="btn-wine" style={{ width: 'min(240px, 100%)' }}>
                  <Camera style={{ width: 'var(--text-base)', height: 'var(--text-base)' }} />
                  Capturar & Analisar
                </button>
              </div>
        )}

      </div>

      {/* ── GALERIA DE DEMONSTRAÇÃO / TESTE RÁPIDO ── */}
      <div className="w-full" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'var(--text-main)', fontWeight: 700 }}>
              Rótulos de Demonstração
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              Toque em qualquer rótulo abaixo para testar instantaneamente a análise enológica
            </p>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--wine-primary)', background: '#FDF2F4', padding: '4px 10px', borderRadius: '99px' }}>
            {SAMPLE_WINES.length} Rótulos Disponíveis
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SAMPLE_WINES.slice(0, 3).map((sample) => (
            <div
              key={sample.id}
              onClick={() => triggerScan(sample.id)}
              className="glass-card"
              style={{
                padding: 'var(--space-3)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                border: '1px solid rgba(0,0,0,0.06)'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold-accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ width: '48px', height: '64px', borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(0,0,0,0.08)' }}>
                <img src={sample.labelThumbnail || sample.image} alt={sample.name} className="w-full h-full object-cover" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>{sample.flagEmoji}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{sample.vintage}</span>
                </div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '2px 0' }}>
                  {sample.name}
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--wine-primary)', fontWeight: 600 }}>
                  {sample.winery}
                </p>
              </div>
              <ArrowRight style={{ width: '16px', height: '16px', color: 'var(--text-muted)', flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURE TILES DE LUXO ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 w-full" style={{ gap: 'var(--space-3)' }}>
        {FEATURES.map(({ Icon, title, desc }) => (
          <div key={title} className="glass-card flex items-center" style={{ padding: 'var(--space-4) var(--space-5)', gap: 'var(--space-4)', background: '#FFFFFF' }}>
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
