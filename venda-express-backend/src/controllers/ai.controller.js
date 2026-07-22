const crypto = require('crypto');
const pool = require('../db');

const PROMPT = `És um especialista em e-commerce angolano que vende qualquer tipo de produto (eletrónica, comida, roupa, casa, etc).
Analisa esta imagem de produto e gera:
- um nome de produto curto e apelativo (máx 8 palavras)
- uma descrição de venda persuasiva (2-3 frases, português de Angola)
- a cor predominante do produto (uma palavra, em português, ou "" se não aplicável — ex: comida)
- uma categoria sugerida (uma palavra ou expressão curta, ex: "Eletrónica", "Alimentação", "Moda", "Casa")

Responde APENAS em JSON válido, sem markdown, neste formato exato:
{"name": "...", "description": "...", "color": "...", "category": "..."}`;

function parseAiJson(rawText) {
  const cleaned = rawText.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  return {
    name: parsed.name || '',
    description: parsed.description || '',
    color: parsed.color || '',
    category: parsed.category || '',
  };
}

async function analyzeWithGemini(buffer, mimeType) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { ok: false, skipped: true };

  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const base64Image = buffer.toString('base64');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: PROMPT },
            { inline_data: { mime_type: mimeType, data: base64Image } },
          ],
        }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    console.error('Gemini falhou:', response.status, errText.slice(0, 300));
    return { ok: false, skipped: false, status: response.status };
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
  try {
    return { ok: true, result: parseAiJson(rawText) };
  } catch {
    console.error('Gemini devolveu JSON inválido:', rawText);
    return { ok: false, skipped: false };
  }
}

async function analyzeWithOpenAI(buffer, mimeType) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { ok: false, skipped: true };

  const base64Image = buffer.toString('base64');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: PROMPT },
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}` } },
        ],
      }],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('OpenAI (vision) falhou:', response.status, errText.slice(0, 300));
    return { ok: false, skipped: false, status: response.status };
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content ?? '{}';
  try {
    return { ok: true, result: parseAiJson(rawText) };
  } catch {
    console.error('OpenAI devolveu JSON inválido:', rawText);
    return { ok: false, skipped: false };
  }
}

async function imageAssist(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada' });

    const hash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');

    const [cached] = await pool.query('SELECT * FROM ai_image_cache WHERE hash = ?', [hash]);
    if (cached.length > 0) {
      const c = cached[0];
      return res.json({ name: c.name, description: c.description, color: c.color, category: c.category, from_cache: true });
    }

    const mimeType = req.file.mimetype || 'image/jpeg';

    // Tenta Gemini primeiro; se falhar por quota/erro, cai para OpenAI automaticamente
    let outcome = await analyzeWithGemini(req.file.buffer, mimeType);
    let usedProvider = 'gemini';
    if (!outcome.ok) {
      outcome = await analyzeWithOpenAI(req.file.buffer, mimeType);
      usedProvider = 'openai';
    }

    if (!outcome.ok) {
      return res.status(501).json({
        error: 'Não foi possível analisar a imagem. Verifica se GEMINI_API_KEY ou OPENAI_API_KEY estão configuradas e com quota disponível no .env do backend.',
      });
    }

    const { name, description, color, category } = outcome.result;

    await pool.query(
      'INSERT INTO ai_image_cache (hash, name, description, color, category) VALUES (?, ?, ?, ?, ?)',
      [hash, name, description, color, category]
    );

    return res.json({ name, description, color, category, from_cache: false, provider: usedProvider });
  } catch (err) {
    console.error('Erro em imageAssist:', err);
    return res.status(500).json({ error: `Erro interno: ${err.message}` });
  }
}

module.exports = { imageAssist };