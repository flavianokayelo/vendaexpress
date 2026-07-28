const fs = require('fs');
const path = require('path');
const pool = require('../db');

const THEMES_DIR = path.resolve(__dirname, '../../themes');

function loadThemeManifests() {
  const manifests = [];
  if (!fs.existsSync(THEMES_DIR)) return manifests;

  const files = fs.readdirSync(THEMES_DIR).filter((f) => f.endsWith('.json'));
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(THEMES_DIR, file), 'utf8');
      const manifest = JSON.parse(content);

      if (!manifest.id || !manifest.name) {
        console.warn(`[ThemesController] theme.json ignorado: "${file}" — faltam campos obrigatórios`);
        continue;
      }

      manifests.push({
        id: manifest.id,
        name: manifest.name,
        label: manifest.label || manifest.name,
        description: manifest.description || '',
        tags: manifest.tags || [],
        version: manifest.version || '1.0.0',
        author: manifest.author?.name || 'Desconhecido',
        supportsDarkMode: !!manifest.supportsDarkMode,
        premium: !!manifest.premium,
        minimumStorefrontVersion: manifest.minimumStorefrontVersion || '1.0.0',
      });
    } catch (err) {
      console.error(`[ThemesController] Erro ao ler "${file}":`, err.message);
    }
  }

  return manifests;
}

async function listThemes(req, res) {
  try {
    const AVAILABLE_THEMES = loadThemeManifests();
    const [countRows] = await pool.query(
      'SELECT theme_id, COUNT(*) AS count FROM stores GROUP BY theme_id'
    );
    const usage = {};
    for (const row of countRows) {
      usage[row.theme_id] = row.count;
    }
    const list = AVAILABLE_THEMES.map((t) => ({
      ...t,
      in_use: usage[t.id] || 0,
    }));
    return res.json(list);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

module.exports = { listThemes };
