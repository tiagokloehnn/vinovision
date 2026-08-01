import { SAMPLE_WINES } from '../data/sampleWines';
import { supabase } from '../lib/supabase';

/**
 * Busca TODAS as chaves de API ativas configuradas no banco de dados Supabase (app_config),
 * localStorage ou variáveis de ambiente.
 */
export async function getAllActiveApiKeys() {
  const activeKeys = [];

  // 1. Busca todas as configurações salvas na tabela app_config do Supabase
  try {
    const { data } = await supabase
      .from('app_config')
      .select('key, value');

    if (data && data.length > 0) {
      data.forEach(item => {
        if (item.value && item.value.trim()) {
          activeKeys.push({
            keyName: item.key,
            value: item.value.trim()
          });
        }
      });
    }
  } catch (e) {
    // ignora se a tabela ainda não existir
  }

  // 2. Adiciona chaves salvas localmente caso não tenham sido deletadas
  const wineDeleted = localStorage.getItem('vinovision_wineapi_key_deleted') === 'true';
  const groqDeleted = localStorage.getItem('vinovision_groq_key_deleted') === 'true';

  const wineLocal = (localStorage.getItem('vinovision_wineapi_key') || import.meta.env.VITE_WINEAPI_KEY || '').trim();
  const groqLocal = (localStorage.getItem('vinovision_groq_key') || import.meta.env.VITE_GROQ_API_KEY || '').trim();

  if (wineLocal && !wineDeleted && !activeKeys.some(k => k.keyName === 'wineapi_key')) {
    activeKeys.push({ keyName: 'wineapi_key', value: wineLocal });
  }

  if (groqLocal && !groqDeleted && !activeKeys.some(k => k.keyName === 'groq_api_key')) {
    activeKeys.push({ keyName: 'groq_api_key', value: groqLocal });
  }

  return activeKeys;
}

/**
 * Função principal para analisar o rótulo de um vinho.
 */
export async function scanWineLabel(imageInput, onProgress = () => {}) {
  const activeKeys = await getAllActiveApiKeys();

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

  // Se houver qualquer chave ativa configurada
  if (activeKeys.length > 0 && (imageInput instanceof File || (typeof imageInput === 'string' && imageInput.startsWith('data:image')))) {
    let lastError = null;

    // Procura primeiro por uma chave da wineAPI.io
    const wineApiKeyObj = activeKeys.find(k => k.keyName === 'wineapi_key' || k.keyName.includes('wine'));
    if (wineApiKeyObj) {
      try {
        onProgress({ stage: 'init', percent: 25, text: 'Conectando à wineAPI.io…' });
        await sleep(300);

        onProgress({ stage: 'ai_vision', percent: 65, text: 'Identificando rótulo na base wineAPI.io…' });
        const result = await analyzeWineWithWineAPI(imageInput, wineApiKeyObj.value, onProgress);

        onProgress({ stage: 'done', percent: 100, text: 'Vinho identificado pela wineAPI.io!' });
        return result;
      } catch (err) {
        console.warn('[VinoVision] Falha na wineAPI.io. Tentando próxima chave de IA:', err);
        lastError = err;
      }
    }

    // Procura por chaves da Groq (chaves que começam com gsk_ ou keyName groq)
    const groqKeyObj = activeKeys.find(k => k.keyName === 'groq_api_key' || k.value.startsWith('gsk_') || k.keyName.includes('groq'));
    if (groqKeyObj) {
      try {
        onProgress({ stage: 'init', percent: 20, text: 'Otimizando foto do rótulo…' });
        const optimizedBase64 = await compressImageForVision(imageInput, 1024, 1024, 0.85);

        onProgress({ stage: 'ai_vision', percent: 60, text: 'Analisando rótulo com Visão Computacional Groq…' });
        const result = await analyzeWineWithGroq(optimizedBase64, groqKeyObj.value, onProgress);
        
        onProgress({ stage: 'done', percent: 100, text: 'Vinho analisado pela IA com sucesso!' });
        return result;
      } catch (err) {
        console.error('[VinoVision IA] Erro na análise de visão Groq:', err);
        lastError = err;
      }
    }

    // Tenta qualquer outra chave genérica cadastrada
    for (const keyObj of activeKeys) {
      if (keyObj === wineApiKeyObj || keyObj === groqKeyObj) continue;

      try {
        if (keyObj.value.startsWith('gsk_')) {
          const optimizedBase64 = await compressImageForVision(imageInput, 1024, 1024, 0.85);
          return await analyzeWineWithGroq(optimizedBase64, keyObj.value, onProgress);
        } else {
          return await analyzeWineWithWineAPI(imageInput, keyObj.value, onProgress);
        }
      } catch (err) {
        lastError = err;
      }
    }

    if (lastError) throw lastError;
  }

  // Se nenhuma chave de API estiver cadastrada ou ativa
  throw new Error(
    'Nenhum serviço de análise de vinho configurado.\n\nConfigure uma chave de API no Painel Admin → Conexões.'
  );
}

/**
 * Envia a imagem do rótulo para a API do wineAPI.io
 */
async function analyzeWineWithWineAPI(imageInput, apiKey, onProgress) {
  let blob = null;

  if (imageInput instanceof File) {
    blob = imageInput;
  } else if (typeof imageInput === 'string' && imageInput.startsWith('data:image')) {
    blob = dataURItoBlob(imageInput);
  }

  const formData = new FormData();
  if (blob) {
    formData.append('image', blob, 'label.jpg');
    formData.append('file', blob, 'label.jpg');
  }

  const response = await fetch('https://api.wineapi.io/identify/image', {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey.trim()
    },
    body: formData
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    if (response.status === 401) {
      throw new Error('Chave da wineAPI.io inválida (X-API-Key). Verifique a chave no Painel Admin → Conexões.');
    }
    throw new Error(`wineAPI.io HTTP ${response.status}: ${errText || response.statusText}`);
  }

  const data = await response.json();
  return mapWineAPIResponseToApp(data, imageInput);
}

/**
 * Mapeia os dados retornados pela wineAPI.io para o objeto de exibição da UI
 */
function mapWineAPIResponseToApp(resData, originalInput) {
  const wine = resData.wine || resData.data || resData.results?.[0] || resData;

  const previewUrl = (typeof originalInput === 'string' && originalInput.startsWith('data:image'))
    ? originalInput
    : originalInput instanceof File
    ? URL.createObjectURL(originalInput)
    : wine.image_url || wine.image || wine.label_url || '';

  return {
    id: `wineapi-${wine.id || Date.now()}`,
    name: wine.name || wine.title || wine.wine_name || 'Vinho Selecionado',
    winery: wine.winery || wine.producer || wine.winery_name || 'Vinícola Reconhecida',
    vintage: String(wine.vintage || wine.year || 'N.V.'),
    type: (wine.type || wine.color || 'Red').toLowerCase().includes('white') ? 'White' : 'Red',
    typeName: wine.type_name || wine.category || (wine.type === 'White' ? 'Vinho Branco' : 'Vinho Tinto Reserva'),
    country: wine.country || wine.country_name || 'Internacional',
    flagEmoji: wine.flag || '🍷',
    region: wine.region || wine.appellation || wine.area || 'Região Vitivinícola',
    grapes: Array.isArray(wine.grapes) ? wine.grapes : (wine.varieties || wine.grape ? [wine.grape] : ['Casta Nobre']),
    alcohol: wine.alcohol || wine.abv || '13.5%',
    rating: parseFloat(wine.rating || wine.score || 4.6),
    reviewsCount: parseInt(wine.reviews_count || wine.ratings_count || 180, 10),
    priceEstimate: wine.price || wine.price_estimate || 'R$ 150 - R$ 220',
    serveTemp: wine.serve_temp || wine.temperature || '16°C - 18°C',
    decantTime: wine.decant_time || wine.decant || '30 minutos',
    profile: {
      body: wine.profile?.body || wine.body || 4,
      tannin: wine.profile?.tannin || wine.tannin || 3,
      acidity: wine.profile?.acidity || wine.acidity || 3,
      sweetness: wine.profile?.sweetness || wine.sweetness || 1
    },
    aromas: Array.isArray(wine.aromas) && wine.aromas.length > 0 ? wine.aromas : [
      { name: 'Frutas Maduras', icon: '🍷' },
      { name: 'Notas de Madeira', icon: '🪵' }
    ],
    foodPairings: Array.isArray(wine.food_pairings) && wine.food_pairings.length > 0 ? wine.food_pairings : [
      { title: 'Carnes Vermelhas', category: 'Carnes', icon: '🥩', description: 'Harmoniza perfeitamente com os taninos equilibrados.' }
    ],
    description: wine.description || wine.tasting_notes || 'Vinho identificado na base global da wineAPI.io.',
    sommelierNote: wine.sommelier_note || wine.notes || 'Identificado via reconhecimento de rótulo wineAPI.io.',
    awards: wine.awards || ['Certificado wineAPI.io'],
    image: previewUrl,
    labelThumbnail: previewUrl,
    scannedAt: new Date().toISOString(),
    aiProvider: 'wineAPI.io (Base Global)'
  };
}

function dataURItoBlob(dataURI) {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

/**
 * Envia a imagem para a API da Groq
 */
async function analyzeWineWithGroq(base64DataUrl, apiKey, onProgress) {
  const activeModels = await fetchActiveGroqModels(apiKey);

  const defaultVisionCandidates = [
    'llama-3.2-11b-vision-instruct',
    'llama-3.2-90b-vision-instruct',
    'llama-3.2-11b-vision-preview',
    'llama-3.2-90b-vision-preview',
    'llava-v1.5-7b-llama-3-eval'
  ];

  let candidateModels = [];
  if (activeModels.length > 0) {
    const accountVisionModels = activeModels.filter(m => 
      m.toLowerCase().includes('vision') || 
      m.toLowerCase().includes('llava') ||
      m.toLowerCase().includes('3.2')
    );
    candidateModels = [...accountVisionModels, ...defaultVisionCandidates];
  } else {
    candidateModels = defaultVisionCandidates;
  }

  candidateModels = candidateModels.filter((v, i, a) => a.indexOf(v) === i);

  const promptText = `Você é um mestre sommelier e especialista em visão computacional de vinhos.
Examine cuidadosamente esta foto de rótulo de vinho e extraia/identifique as informações reais contidas na imagem.
Retorne EXCLUSIVAMENTE um objeto JSON válido no seguinte formato em português:

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
Se alguma informação não estiver visível na foto, preencha com uma inferência de sommelier altamente precisa baseada na vinícola e no tipo de vinho identificado.`;

  let lastError = null;

  for (const modelName of candidateModels) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelName,
          response_format: { type: 'json_object' },
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
          throw new Error('Chave da API Groq inválida.');
        }

        const isModelUnavailable = 
          response.status === 404 || 
          response.status === 400 || 
          errMsg.toLowerCase().includes('does not exist') ||
          errMsg.toLowerCase().includes('decommissioned') ||
          errMsg.toLowerCase().includes('deprecated') ||
          errMsg.toLowerCase().includes('no longer supported') ||
          errMsg.toLowerCase().includes('access');

        if (isModelUnavailable) {
          lastError = new Error(`Modelo ${modelName}: ${errMsg}`);
          continue;
        }

        throw new Error(`Erro na API Groq (${modelName}): ${errMsg}`);
      }

      const data = await response.json();
      const rawContent = data.choices?.[0]?.message?.content;
      if (!rawContent) throw new Error('A IA respondeu com conteúdo vazio.');

      let cleanJsonString = rawContent.trim();
      
      if (cleanJsonString.includes('```')) {
        cleanJsonString = cleanJsonString.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      }

      const firstBrace = cleanJsonString.indexOf('{');
      const lastBrace = cleanJsonString.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanJsonString = cleanJsonString.slice(firstBrace, lastBrace + 1);
      }

      const parsed = JSON.parse(cleanJsonString);

      return {
        id: `groq-${Date.now()}`,
        ...parsed,
        type: parsed.type || 'Red',
        image: base64DataUrl,
        labelThumbnail: base64DataUrl,
        scannedAt: new Date().toISOString(),
        aiProvider: `Groq Vision (${modelName})`
      };

    } catch (err) {
      if (err.message.includes('Chave da API Groq inválida')) throw err;
      lastError = err;
    }
  }

  throw new Error(`Falha ao acessar modelos de Visão Groq: ${lastError?.message || 'Nenhum modelo de visão ativo foi encontrado.'}`);
}

async function fetchActiveGroqModels(apiKey) {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey.trim()}` }
    });
    if (res.ok) {
      const data = await res.json();
      return (data.data || []).map(m => m.id);
    }
  } catch (e) {}
  return [];
}

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
      reject(new Error('Formato de imagem inválido.'));
    }
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
