import { SAMPLE_WINES } from '../data/sampleWines';

/**
 * Função principal para analisar o rótulo de um vinho.
 * Utiliza a API da Groq (Llama 3.2 Vision) para visão computacional real.
 */
export async function scanWineLabel(imageInput, onProgress = () => {}) {
  // 1. Verificar chave da API da Groq (localStorage ou .env)
  const groqApiKey = (localStorage.getItem('vinovision_groq_key') || import.meta.env.VITE_GROQ_API_KEY || '').trim();

  // Se o input for um ID de amostra cadastrada da biblioteca
  if (typeof imageInput === 'string' && !imageInput.startsWith('data:image')) {
    const matchedSample = SAMPLE_WINES.find(w => w.id === imageInput);
    if (matchedSample) {
      onProgress({ stage: 'init', percent: 30, text: 'Carregando rótulo da biblioteca…' });
      await sleep(400);
      onProgress({ stage: 'done', percent: 100, text: 'Vinho identificado com sucesso!' });
      return { ...matchedSample, scannedAt: new Date().toISOString() };
    }
  }

  // 2. Se houver chave Groq e a imagem for arquivo ou base64 → Executa IA REAL com compressão prévia
  if (groqApiKey && (imageInput instanceof File || (typeof imageInput === 'string' && imageInput.startsWith('data:image')))) {
    try {
      onProgress({ stage: 'init', percent: 25, text: 'Otimizando e comprimindo imagem da foto…' });
      const optimizedBase64 = await compressImageForVision(imageInput, 1024, 1024, 0.85);

      onProgress({ stage: 'ai_vision', percent: 65, text: 'Enviando rótulo à IA Groq Llama 3.2 Vision…' });
      const result = await analyzeWineWithGroq(optimizedBase64, groqApiKey, onProgress);
      
      onProgress({ stage: 'done', percent: 100, text: 'Vinho analisado pela IA com sucesso!' });
      return result;
    } catch (err) {
      console.error('[VinoVision IA] Erro na API Groq Vision:', err);
      throw err;
    }
  }

  // 3. Se NÃO houver chave Groq configurada, avisa o usuário claramente
  if (!groqApiKey) {
    throw new Error(
      'Chave da API Groq não encontrada!\n\n' +
      'Para ler rótulos reais por foto, clique no botão "Sem Chave Groq" no topo da página e insira sua chave (gsk_…).\n\n' +
      'Você pode obter uma chave gratuita em: console.groq.com/keys'
    );
  }

  throw new Error('Formato de imagem inválido para escaneamento.');
}

/**
 * Envia a imagem otimizada para a API da Groq (Modelo Llama 3.2 Vision)
 */
async function analyzeWineWithGroq(base64DataUrl, apiKey, onProgress) {
  const promptText = `Você é um mestre sommelier e especialista em visão computacional de vinhos.
Examine cuidadosamente esta foto de rótulo de vinho e extraia/identifique as informações reais contidas na imagem.
Retorne EXCLUSIVAMENTE um objeto JSON válido (sem qualquer texto adicional antes ou depois) com exatamente esta estrutura em português:

{
  "name": "Nome exato do vinho conforme o rótulo",
  "winery": "Nome da Vinícola / Produtor",
  "vintage": "Ano da Safra (ex: 2019 ou 'N.V.' se não houver)",
  "type": "Red",
  "typeName": "Tipo de Vinho (ex: Tinto Reserva, Branco Seco, Espumante Brut)",
  "country": "País de origem",
  "flagEmoji": "Emoji da bandeira do país",
  "region": "Região Vitivinícola",
  "grapes": ["Casta 1", "Casta 2"],
  "alcohol": "Teor alcoólico (ex: 13.5%)",
  "rating": 4.5,
  "reviewsCount": 240,
  "priceEstimate": "Estimativa de preço em R$",
  "serveTemp": "Temperatura ideal de serviço (ex: 16°C - 18°C)",
  "decantTime": "Tempo sugerido de decantação",
  "profile": {
    "body": 4,
    "tannin": 3,
    "acidity": 3,
    "sweetness": 1
  },
  "aromas": [
    { "name": "Nome do aroma", "icon": "Emoji" }
  ],
  "foodPairings": [
    { "title": "Prato Sugerido", "category": "Categoria", "icon": "Emoji", "description": "Explicação da harmonização" }
  ],
  "description": "Descrição sensorial detalhada e história sobre este vinho específico",
  "sommelierNote": "Nota técnica do sommelier sobre o potencial de guarda e características do terroir",
  "awards": ["Prêmio ou distinção se houver"]
}

Nota de perfil: body (1-5), tannin (1-5), acidity (1-5), sweetness (1-5).
Se alguma informação não estiver 100% visível, faça uma inferência de sommelier altamente precisa baseada na vinícola e no tipo de vinho identificado no rótulo.`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.2-11b-vision-instruct',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: promptText },
            {
              type: 'image_url',
              image_url: { url: base64DataUrl }
            }
          ]
        }
      ],
      temperature: 0.1,
      max_tokens: 1500
    })
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    const errMsg = errJson.error?.message || `HTTP ${response.status} ${response.statusText}`;
    if (response.status === 401) {
      throw new Error('Chave da API Groq inválida. Verifique sua chave no botão "API Groq" no topo da tela.');
    }
    if (response.status === 413) {
      throw new Error('Foto muito grande. Tente tirar uma foto de menor resolução.');
    }
    throw new Error(`Groq API Error: ${errMsg}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content;
  if (!rawContent) throw new Error('A IA Groq respondeu com conteúdo vazio.');

  let cleanJsonString = rawContent.trim();
  
  // Trata blocos de código Markdown ```json ... ``` se a IA incluir
  if (cleanJsonString.includes('```')) {
    cleanJsonString = cleanJsonString.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  }

  // Tenta extrair a primeira estrutura JSON válida { ... } da resposta
  const firstBrace = cleanJsonString.indexOf('{');
  const lastBrace = cleanJsonString.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleanJsonString = cleanJsonString.slice(firstBrace, lastBrace + 1);
  }

  let parsed = {};
  try {
    parsed = JSON.parse(cleanJsonString);
  } catch (parseErr) {
    console.error('Erro ao converter JSON da Groq. Resposta bruta:', rawContent);
    throw new Error('A IA não conseguiu interpretar o rótulo. Envie uma foto mais nítida e iluminada da garrafa.');
  }

  return {
    id: `groq-${Date.now()}`,
    ...parsed,
    type: parsed.type || 'Red',
    image: base64DataUrl,
    labelThumbnail: base64DataUrl,
    scannedAt: new Date().toISOString(),
    aiProvider: 'Groq Llama 3.2 Vision Real'
  };
}

/**
 * Redimensiona e comprime a foto via Canvas para no máximo 1024px.
 * Reduz a imagem de ~8MB para ~150KB, garantindo envio ultrarrápido sem estourar o limite da API.
 */
function compressImageForVision(fileOrBase64, maxWidth = 1024, maxHeight = 1024, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => reject(new Error('Erro ao carregar e processar arquivo de imagem.'));

    if (fileOrBase64 instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => { img.src = e.target.result; };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(fileOrBase64);
    } else if (typeof fileOrBase64 === 'string') {
      img.src = fileOrBase64;
    } else {
      reject(new Error('Formato de entrada de imagem inválido.'));
    }
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
