// Registro do Service Worker para suporte PWA
export function registerServiceWorker() {
  if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[VinoVision PWA] Service Worker registrado com sucesso. Escopo:', registration.scope);

          // Escuta novas versões
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) return;

            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('[VinoVision PWA] Nova versão disponível. O cache será atualizado no próximo recarregamento.');
                } else {
                  console.log('[VinoVision PWA] Conteúdo em cache para uso offline.');
                }
              }
            };
          };
        })
        .catch((error) => {
          console.warn('[VinoVision PWA] Falha no registro do Service Worker:', error);
        });
    });
  }
}
