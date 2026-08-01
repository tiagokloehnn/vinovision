import { SAMPLE_WINES } from '../data/sampleWines';
import { supabase } from '../lib/supabase';

/**
 * Busca a chave de API da Groq na seguinte prioridade:
 * 1. localStorage local (chave salva pelo usuário)
 * 2. Tabela public.app_config do Supabase (configurada globalmente pelo Admin)
 * 3. Variável de ambiente VITE_GROQ_API_KEY
 */
export async function getGroqApiKey() {
  // 1. Tenta do localStorage
  const localKey = (localStorage.getItem('vinovision_groq_key') || '').trim();
  if (localKey) return localKey;

  // 2. Tenta buscar a chave global configurada pelo Admin no Supabase
  try {
    const { data } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', 'groq_api_key')
      .maybeSingle();

    if (data?.value) {
      const keyVal = data.value.trim();
      localStorage.setItem('vinovision_groq_key', keyVal);
      return keyVal;
    }
  } catch (e) {
    // Se a tabela app_config ainda não existir, segue para o env
  }

  // 3. Fallback para variável de ambiente
  return (import.meta.env.VITE_GROQ_API_KEY || '').trim();
}

/**
 * Função principal para analisar o rótulo de um vinho.
 */
export async function scanWineLabel(imageInput, onProgress = () => {}) {
  // Obter a chave Groq ativa (local, banco de dados ou env)
  const groqApiKey = await getGroqApiKey();

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

  // Se houver chave Groq e a imagem for arquivo ou base64 → Executa IA REAL
  if (groqApiKey && (imageInput instanceof File || (typeof imageInput === 'string' && imageInput.startsWith('data:image')))) {
    try {
      onProgress({ stage: 'init', percent: 20, text: 'Otimizando e comprimindo imagem da foto…' });
      const optimizedBase64 = await compressImageForVision(imageInput, 1024, 1024, 0.85);

      onProgress({ stage: 'ai_vision', percent: 50, text: 'Verificando modelos de Visão ativos na sua chave Groq…' });
      const selectedModel = await getAvailableGroqVisionModel(groqApiKey);

      onProgress({ stage: 'ai_vision', percent: 75, text: `Analisando rótulo com ${selectedModel}…` });
      const result = await analyzeWineWithGroq(optimizedBase64, groqApiKey, selectedModel, onProgress);
      
      onProgress({ stage: 'done', percent: 100, text: 'Vinho analisado pela IA com sucesso!' });
      return result;
    } catch (err) {
      console.error('[VinoVision IA] Erro na API Groq Vision:', err);
      throw err;
    }
  }

  // Se NÃO houver chave Groq configurada, avisa o usuário claramente
  if (!groqApiKey) {
    throw new Error(
      'Chave da API Groq não encontrada!\n\n' +
      'Para ler rótulos reais por foto, solicite ao Administrador para configurar a chave no Painel Admin → Conexões, ou insira sua chave no botão "API Groq" no topo da tela.\n\n' +
      'Você pode obter uma chave gratuita em: console.groq.com/keys'
    );
  }

  throw new Error('Formato de imagem inválido para escaneamento.');
}

/**
 * Consulta a API da Groq para descobrir os modelos disponíveis na conta do usuário
 */
async function getAvailableGroqVisionModel(apiKey) {
  let availableList = [];
  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey.trim()}` }
    });

    if (res.ok) {
      const data = await res.json();
      availableList = (data.data || []).map(m => m.id);
      console.log('[VinoVision IA] Modelos na sua chave Groq:', availableList);

      const visionModel = availableList.find(m => 
        m.toLowerCase().includes('vision') || 
        m.toLowerCase().includes('multimodal') || 
        m.toLowerCase().includes('llava')
      );

      if (visionModel) return visionModel;
    }
  } catch (e) {
    console.warn('[VinoVision IA] Erro ao listar modelos do endpoint /models:', e);
  }

  return 'llama-3.2-11b-vision-preview';
}

/**
 * Envia a imagem otimizada para a API da Groq com o modelo selecionado
 */
async function analyzeWineWithGroq(base64DataUrl, apiKey, initialModelName, onProgress) {
  const candidateModels = [
    initialModelName,
    'llama-3.2-11b-vision-preview',
    'llama-3.2-90b-vision-preview'
  ].filter((v, i, a) => a.indexOf(v) === i);

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
          throw new Error('Chave da API Groq inválida. Verifique a chave configurada em Conexões.');
        }

        if (response.status === 404 || response.status === 400 || errMsg.toLowerCase().includes('does not exist')) {
          console.warn(`[VinoVision IA] Modelo ${modelName} retornou erro (${errMsg}). Tentando próximo...`);
          lastError = new Error(errMsg);
          continue;
        }

        throw new Error(`Groq API Error (${modelName}): ${errMsg}`);
      }

      const data = await response.json();
      const rawContent = data.choices?.[0]?.message?.content;
      if (!rawContent) throw new Error('A IA Groq respondeu com conteúdo vazio.');

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
        aiProvider: `Groq AI (${modelName})`
      };

    } catch (err) {
      if (err.message.includes('Chave da API Groq inválida')) throw err;
      lastError = err;
    }
  }

  throw new Error(
    `Sua chave de API da Groq não possui permissão para modelos de Visão (Llama 3.2 Vision).\n\n` +
    `Crie uma nova chave em console.groq.com/keys e configure em Painel Admin → Conexões.`
  );
}

/**
 * Redimensiona e comprime a foto via Canvas para no máximo 1024px.
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
