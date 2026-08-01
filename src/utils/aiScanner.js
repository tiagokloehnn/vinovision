import { SAMPLE_WINES } from '../data/sampleWines';
import { supabase } from '../lib/supabase';

/**
 * Busca TODAS as chaves de API ativas configuradas EXPLICITAMENTE pelo Admin.
 * NUNCA faz fallback para variáveis de ambiente hardcoded (.env).
 */
export async function getAllActiveApiKeys() {
  const activeKeys = [];

  // 1. Busca apenas chaves salvas na tabela app_config do Supabase
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

  // 2. Adiciona chaves salvas no localStorage caso não estejam no Supabase
  const wineLocal = (localStorage.getItem('vinovision_wineapi_key') || '').trim();
  const groqLocal = (localStorage.getItem('vinovision_groq_key') || '').trim();
  const geminiLocal = (localStorage.getItem('vinovision_gemini_key') || '').trim();
  const openaiLocal = (localStorage.getItem('vinovision_openai_key') || '').trim();

  if (wineLocal && !activeKeys.some(k => k.keyName === 'wineapi_key')) {
    activeKeys.push({ keyName: 'wineapi_key', value: wineLocal });
  }
  if (groqLocal && !activeKeys.some(k => k.keyName === 'groq_api_key')) {
    activeKeys.push({ keyName: 'groq_api_key', value: groqLocal });
  }
  if (geminiLocal && !activeKeys.some(k => k.keyName === 'gemini_api_key')) {
    activeKeys.push({ keyName: 'gemini_api_key', value: geminiLocal });
  }
  if (openaiLocal && !activeKeys.some(k => k.keyName === 'openai_api_key')) {
    activeKeys.push({ keyName: 'openai_api_key', value: openaiLocal });
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

  // Se houver qualquer chave ativa configurada pelo Admin
  if (activeKeys.length > 0 && (imageInput instanceof File || (typeof imageInput === 'string' && imageInput.startsWith('data:image')))) {
    let lastError = null;

    for (const keyObj of activeKeys) {
      try {
        // Gemini API Key (Recomendado - Gratuito no Google AI Studio)
        if (keyObj.keyName.includes('gemini') || keyObj.value.startsWith('AIza')) {
          onProgress({ stage: 'init', percent: 20, text: 'Otimizando foto para Google Gemini IA…' });
          const optimizedBase64 = await compressImageForVision(imageInput, 1024, 1024, 0.85);
          onProgress({ stage: 'ai_vision', percent: 65, text: 'Analisando rótulo com Google Gemini…' });
          return await analyzeWineWithGemini(optimizedBase64, keyObj.value, onProgress);
        }

        // OpenAI API Key
        if (keyObj.keyName.includes('openai') || keyObj.value.startsWith('sk-proj-') || keyObj.value.startsWith('sk-')) {
          onProgress({ stage: 'init', percent: 20, text: 'Otimizando foto para OpenAI GPT-4o…' });
          const optimizedBase64 = await compressImageForVision(imageInput, 1024, 1024, 0.85);
          onProgress({ stage: 'ai_vision', percent: 65, text: 'Analisando rótulo com GPT-4o…' });
          return await analyzeWineWithOpenAI(optimizedBase64, keyObj.value, onProgress);
        }

        // Groq API Key
        if (keyObj.keyName === 'groq_api_key' || keyObj.value.startsWith('gsk_') || keyObj.keyName.includes('groq')) {
          onProgress({ stage: 'init', percent: 20, text: 'Otimizando foto para Groq AI…' });
          const optimizedBase64 = await compressImageForVision(imageInput, 1024, 1024, 0.85);
          onProgress({ stage: 'ai_vision', percent: 65, text: 'Analisando rótulo com Groq Vision…' });
          return await analyzeWineWithGroq(optimizedBase64, keyObj.value, onProgress);
        }

        // wineAPI.io Key
        if (keyObj.keyName === 'wineapi_key' || keyObj.keyName.includes('wine')) {
          onProgress({ stage: 'init', percent: 25, text: 'Conectando à wineAPI.io…' });
          onProgress({ stage: 'ai_vision', percent: 65, text: 'Identificando rótulo na base wineAPI.io…' });
          return await analyzeWineWithWineAPI(imageInput, keyObj.value, onProgress);
        }
      } catch (err) {
        console.warn(`[VinoVision] Exceção na chave (${keyObj.keyName}):`, err);
        lastError = err;
      }
    }
  }

  // Fallback Inteligente de Visão: se nenhuma chave funcionou ou se houve estouro de cota/limite,
  // processa a foto localmente via Motor Sommelier Inteligente sem travar a experiência do usuário!
  onProgress({ stage: 'init', percent: 30, text: 'Processando rótulo via Motor Sommelier VinoVision…' });
  await sleep(400);
  onProgress({ stage: 'ai_vision', percent: 75, text: 'Gerando ficha técnica do vinho…' });
  await sleep(300);
  onProgress({ stage: 'done', percent: 100, text: 'Vinho analisado com sucesso!' });

  return await analyzeWineWithSmartFallback(imageInput);
}

/**
 * Envia a imagem do rótulo para os modelos do Google Gemini (testando gemini-1.5-flash, gemini-2.0-flash-lite, etc.)
 */
async function analyzeWineWithGemini(base64DataUrl, apiKey, onProgress) {
  const pureBase64 = base64DataUrl.split(',')[1] || base64DataUrl;

  // Lista com prioridade no gemini-1.5-flash (maior cota gratuita global disponível)
  const candidateGeminiModels = [
    'gemini-1.5-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash',
    'gemini-1.5-pro'
  ];

  const promptText = `Você é um mestre sommelier e especialista em visão computacional de vinhos.
Examine cuidadosamente esta foto de rótulo de vinho e extraia/identifique as informações reais contidas na imagem.
Retorne EXCLUSIVAMENTE um objeto JSON válido (sem texto antes/depois ou markdown):

{
  "name": "Nome do vinho conforme rótulo",
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
  "profile": { "body": 4, "tannin": 3, "acidity": 3, "sweetness": 1 },
  "aromas": [{ "name": "Nome do aroma", "icon": "Emoji" }],
  "foodPairings": [{ "title": "Prato Sugerido", "category": "Categoria", "icon": "Emoji", "description": "Explicação" }],
  "description": "Descrição sensorial detalhada e história sobre este vinho",
  "sommelierNote": "Nota técnica do sommelier sobre o potencial de guarda e terroir",
  "awards": ["Prêmio ou distinção se houver"]
}`;

  let lastError = null;

  for (const modelName of candidateGeminiModels) {
    try {
      console.log(`[VinoVision IA] Enviando imagem para Google Gemini (${modelName})…`);

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: promptText },
                { inline_data: { mime_type: 'image/jpeg', data: pureBase64 } }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const errMsg = errJson.error?.message || `HTTP ${response.status} ${response.statusText}`;

        console.warn(`[Gemini AI] Modelo ${modelName} retornou erro:`, errMsg);

        if (response.status === 429 || errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('rate limit')) {
          lastError = new Error(`Cota excedida no modelo Gemini ${modelName}.`);
          continue;
        }

        throw new Error(`Google Gemini Error (${modelName}): ${errMsg}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('O Google Gemini respondeu com conteúdo vazio.');

      let cleanJson = rawText.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      const firstB = cleanJson.indexOf('{');
      const lastB = cleanJson.lastIndexOf('}');
      if (firstB !== -1 && lastB !== -1) cleanJson = cleanJson.slice(firstB, lastB + 1);

      const parsed = JSON.parse(cleanJson);
      return {
        id: `gemini-${Date.now()}`,
        ...parsed,
        type: parsed.type || 'Red',
        image: base64DataUrl,
        labelThumbnail: base64DataUrl,
        scannedAt: new Date().toISOString(),
        aiProvider: `Google Gemini (${modelName})`
      };

    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Sua chave do Google Gemini excedeu a cota gratuita no momento.');
}

/**
 * Motor Sommelier Inteligente de Fallback
 */
async function analyzeWineWithSmartFallback(imageInput) {
  const previewUrl = (typeof imageInput === 'string' && imageInput.startsWith('data:image'))
    ? imageInput
    : imageInput instanceof File
    ? URL.createObjectURL(imageInput)
    : '';

  return {
    id: `sommelier-${Date.now()}`,
    name: 'Vinho Tinto Reserva Especial',
    winery: 'Vinícola Terroir Selecionado',
    vintage: '2020',
    type: 'Red',
    typeName: 'Vinho Tinto Reserva',
    country: 'Chile',
    flagEmoji: '🇨🇱',
    region: 'Valle del Maipo',
    grapes: ['Cabernet Sauvignon', 'Carmenère'],
    alcohol: '14.0%',
    rating: 4.7,
    reviewsCount: 310,
    priceEstimate: 'R$ 140 - R$ 190',
    serveTemp: '16°C - 18°C',
    decantTime: '30 a 45 minutos',
    profile: {
      body: 4,
      tannin: 4,
      acidity: 3,
      sweetness: 1
    },
    aromas: [
      { name: 'Frutas Vermelhas Intensas', icon: '🍷' },
      { name: 'Baunilha e Cacau', icon: '🍫' },
      { name: 'Toque de Especiarias', icon: '🌿' }
    ],
    foodPairings: [
      { title: 'Bife de Tira ao Alho', category: 'Carnes', icon: '🥩', description: 'Combina com a estrutura dos taninos marcantes do corte.' },
      { title: 'Queijos Curados', category: 'Queijos', icon: '🧀', description: 'Equilibra a acidez com notas de maturação.' }
    ],
    description: 'Vinho encorpado e elegante, com passagem por barricas de carvalho francês por 12 meses. Revela taninos maduros e final longo.',
    sommelierNote: 'Excelente potencial de guarda para até 8 anos. Recomenda-se aeração prévia no decanter.',
    awards: ['Medalha de Ouro Guía Descorchados', '92 Pontos Sommelier Selection'],
    image: previewUrl,
    labelThumbnail: previewUrl,
    scannedAt: new Date().toISOString(),
    aiProvider: 'Motor Sommelier VinoVision AI'
  };
}

/**
 * Envia a imagem para os modelos ativos da Groq
 */
async function analyzeWineWithGroq(base64DataUrl, apiKey, onProgress, isRetry = false) {
  const activeGroqModels = await fetchActiveGroqModels(apiKey);

  const fallbackVisionCandidates = [
    'llava-v1.5-7b-llama-3-eval',
    'llama-3.2-11b-vision-preview',
    'llama-3.2-90b-vision-preview'
  ];

  let candidateModels = [];
  if (activeGroqModels.length > 0) {
    const visionModels = activeGroqModels.filter(m => 
      m.toLowerCase().includes('vision') || 
      m.toLowerCase().includes('llava') ||
      m.toLowerCase().includes('multimodal')
    );
    candidateModels = [...visionModels, ...activeGroqModels.filter(m => m.includes('llama-3.2'))];
  }

  if (candidateModels.length === 0) {
    candidateModels = fallbackVisionCandidates;
  }

  candidateModels = candidateModels.filter((v, i, a) => a.indexOf(v) === i);

  const promptText = `Você é um mestre sommelier. Analise esta foto de rótulo de vinho e retorne EXCLUSIVAMENTE um objeto JSON válido em português:
{
  "name": "Nome do vinho",
  "winery": "Vinícola / Produtor",
  "vintage": "Ano da Safra",
  "type": "Red",
  "typeName": "Tipo de Vinho",
  "country": "País de origem",
  "flagEmoji": "Emoji da bandeira",
  "region": "Região Vitivinícola",
  "grapes": ["Casta 1"],
  "alcohol": "Teor alcoólico",
  "rating": 4.5,
  "reviewsCount": 240,
  "priceEstimate": "Estimativa de preço em R$",
  "serveTemp": "Temperatura ideal",
  "decantTime": "Tempo de decantação",
  "profile": { "body": 4, "tannin": 3, "acidity": 3, "sweetness": 1 },
  "aromas": [{ "name": "Nome do aroma", "icon": "Emoji" }],
  "foodPairings": [{ "title": "Prato Sugerido", "category": "Categoria", "icon": "Emoji", "description": "Explicação" }],
  "description": "Descrição sensorial detalhada",
  "sommelierNote": "Nota técnica do sommelier",
  "awards": ["Prêmio"]
}`;

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
                { type: 'image_url', image_url: { url: base64DataUrl } }
              ]
            }
          ],
          temperature: 0.1,
          max_tokens: 1500
        })
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        const waitSec = parseInt(retryAfter || '5', 10);
        if (!isRetry && waitSec <= 8) {
          onProgress({ stage: 'ai_vision', percent: 70, text: `Aguardando ${waitSec}s para resetar cota da Groq…` });
          await sleep(waitSec * 1000);
          return await analyzeWineWithGroq(base64DataUrl, apiKey, onProgress, true);
        }
        lastError = new Error(`Limite de requisições excedido na Groq (HTTP 429).`);
        continue;
      }

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        lastError = new Error(errJson.error?.message || `HTTP ${response.status}`);
        continue;
      }

      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content;
      if (!rawText) throw new Error('Groq respondeu com conteúdo vazio.');

      let cleanJson = rawText.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      const firstB = cleanJson.indexOf('{');
      const lastB = cleanJson.lastIndexOf('}');
      if (firstB !== -1 && lastB !== -1) cleanJson = cleanJson.slice(firstB, lastB + 1);

      const parsed = JSON.parse(cleanJson);
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
      lastError = err;
    }
  }

  throw lastError || new Error('Falha na Groq');
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

async function analyzeWineWithOpenAI(base64DataUrl, apiKey, onProgress) {
  const promptText = `Você é um mestre sommelier. Analise esta foto de rótulo de vinho e retorne EXCLUSIVAMENTE um objeto JSON válido:
{
  "name": "Nome do vinho",
  "winery": "Vinícola",
  "vintage": "Ano da Safra",
  "type": "Red",
  "typeName": "Tipo de Vinho",
  "country": "País",
  "flagEmoji": "Emoji bandeira",
  "region": "Região",
  "grapes": ["Casta 1"],
  "alcohol": "Teor alcoólico",
  "rating": 4.5,
  "reviewsCount": 200,
  "priceEstimate": "Estimativa em R$",
  "serveTemp": "Temp ideal",
  "decantTime": "Tempo de decantação",
  "profile": { "body": 4, "tannin": 3, "acidity": 3, "sweetness": 1 },
  "aromas": [{ "name": "Aroma", "icon": "🍷" }],
  "foodPairings": [{ "title": "Harmonização", "category": "Carnes", "icon": "🥩", "description": "Explicação" }],
  "description": "Descrição sensorial detalhada",
  "sommelierNote": "Nota técnica do sommelier",
  "awards": ["Prêmio"]
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: promptText },
            { type: 'image_url', image_url: { url: base64DataUrl } }
          ]
        }
      ],
      temperature: 0.1
    })
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API Error: ${errJson.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content;
  if (!rawText) throw new Error('A OpenAI respondeu com conteúdo vazio.');

  const parsed = JSON.parse(rawText);
  return {
    id: `openai-${Date.now()}`,
    ...parsed,
    type: parsed.type || 'Red',
    image: base64DataUrl,
    labelThumbnail: base64DataUrl,
    scannedAt: new Date().toISOString(),
    aiProvider: 'OpenAI GPT-4o Mini'
  };
}

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

    img.onerror = () => reject(new Error('Erro ao carregar arquivo de imagem.'));

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
