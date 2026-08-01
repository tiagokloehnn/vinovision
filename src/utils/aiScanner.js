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

  // 2. Se houver chave Groq e a imagem for arquivo ou base64 → Executa IA REAL
  if (groqApiKey && (imageInput instanceof File || (typeof imageInput === 'string' && imageInput.startsWith('data:image')))) {
    try {
      onProgress({ stage: 'init', percent: 20, text: 'Conectando ao modelo Groq Llama 3.2 Vision…' });
      await sleep(300);
      
      onProgress({ stage: 'ai_vision', percent: 60, text: 'Analisando rótulo com Visão Computacional IA…' });
      const result = await analyzeWineWithGroq(imageInput, groqApiKey, onProgress);
      
      onProgress({ stage: 'done', percent: 100, text: 'Vinho analisado pela IA real com sucesso!' });
      return result;
    } catch (err) {
      console.error('[VinoVision IA] Erro na API Groq Vision:', err);
      // Notifica o erro real para não fingir que a IA funcionou quando falhar
      throw new Error(`Falha na análise de Visão IA: ${err.message}`);
    }
  }

  // 3. Se NÃO houver chave Groq configurada, avisa o usuário em vez de retornar dados falsos estáticos
  if (!groqApiKey) {
    throw new Error(
      'Chave da API Groq não encontrada.\n\n' +
      'Para ler e analisar rótulos reais por foto, insira sua chave da API Groq no botão "API Groq" no topo da página ou configure a variável VITE_GROQ_API_KEY na Vercel.\n\n' +
      'Obtenha uma chave gratuita em: console.groq.com/keys'
    );
  }

  throw new Error('Formato de imagem inválido para escaneamento.');
}

/**
 * Envia a imagem do rótulo para a API da Groq (Modelo Llama 3.2 Vision)
 */
async function analyzeWineWithGroq(imageFileOrBase64, apiKey, onProgress) {
  let base64Data = '';

  if (imageFileOrBase64 instanceof File) {
    base64Data = await fileToBase64(imageFileOrBase64);
  } else if (typeof imageFileOrBase64 === 'string') {
    base64Data = imageFileOrBase64;
  }

  const promptText = `Você é um mestre sommelier e especialista em visão computacional de vinhos.
Examine cuidadosamente esta foto de rótulo de vinho e extraia/identifique as informações reais contidas na imagem.
Retorne EXCLUSIVAMENTE um objeto JSON válido (sem texto adicional antes ou depois) com exatamente esta estrutura em português:

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
    { "name": "Nome do aroma", "icon": "Emoji representativo" }
  ],
  "foodPairings": [
    { "title": "Prato Sugerido", "category": "Categoria (Carnes, Queijos, Massas, etc)", "icon": "Emoji", "description": "Explicação da harmonização" }
  ],
  "description": "Descrição sensorial detalhada e história sobre este vinho específico",
  "sommelierNote": "Nota técnica do sommelier sobre o potencial de guarda e características do terroirs",
  "awards": ["Prêmio ou distinção se houver"]
}

Nota de perfil: body (1-5), tannin (1-5), acidity (1-5), sweetness (1-5).
Se alguma informação não for legível no rótulo, faça uma inferência sommelier precisa baseada na vinícola e no tipo de vinho identificado.`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.2-11b-vision-instruct',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: promptText },
            {
              type: 'image_url',
              image_url: { url: base64Data }
            }
          ]
        }
      ],
      temperature: 0.1
    })
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    const errMsg = errJson.error?.message || `HTTP ${response.status} ${response.statusText}`;
    if (response.status === 401) {
      throw new Error('Chave da API Groq inválida. Verifique sua chave em console.groq.com/keys.');
    }
    throw new Error(`Groq API: ${errMsg}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content;
  if (!rawContent) throw new Error('A resposta da IA Groq veio vazia.');

  let parsed = {};
  try {
    parsed = JSON.parse(rawContent);
  } catch (parseErr) {
    console.error('Erro ao converter JSON da Groq:', rawContent);
    throw new Error('A IA não retornou um formato JSON válido. Tente enviar uma foto mais nítida do rótulo.');
  }

  return {
    id: `groq-${Date.now()}`,
    ...parsed,
    type: parsed.type || 'Red',
    image: base64Data,
    labelThumbnail: base64Data,
    scannedAt: new Date().toISOString(),
    aiProvider: 'Groq Llama 3.2 Vision Real'
  };
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
