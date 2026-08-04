import standardManifest from "./standard/theme.json";
import luxuryManifest from "./luxury/theme.json";
import minimalManifest from "./minimal/theme.json";
import fashionManifest from "./fashion/theme.json";
import electronicsManifest from "./electronics/theme.json";
import modernManifest from "./modern/theme.json";
import fashionLuxeManifest from "./fashion-luxe/theme.json";
import freshMarketManifest from "./fresh-market/theme.json";
import autoProManifest from "./auto-pro/theme.json";
import foodExpressManifest from "./food-express/theme.json";
import { config as standardConfig } from "./standard/config";
import { config as luxuryConfig } from "./luxury/config";
import { config as minimalConfig } from "./minimal/config";
import { config as fashionConfig } from "./fashion/config";
import { config as electronicsConfig } from "./electronics/config";
import { config as modernConfig } from "./modern/config";
import { config as fashionLuxeConfig } from "./fashion-luxe/config";
import { config as freshMarketConfig } from "./fresh-market/config";
import { config as autoProConfig } from "./auto-pro/config";
import { config as foodExpressConfig } from "./food-express/config";

export type ThemeCatalogItem = {
  id: string;
  name: string;
  label: string;
  description: string;
  tags: string[];
  version: string;
  author: string;
  accent: string;
  in_use: number;
};

type ManifestLike = {
  id: string;
  name: string;
  label: string;
  description?: string;
  version: string;
  author?: { name?: string; url?: string } | string;
  tags?: string[];
};

type ConfigLike = {
  tokens?: { colors?: { primary?: string; accent?: string } };
};

const frontendThemes: Array<{ manifest: ManifestLike; config: ConfigLike }> = [
  { manifest: standardManifest, config: standardConfig },
  { manifest: luxuryManifest, config: luxuryConfig },
  { manifest: minimalManifest, config: minimalConfig },
  { manifest: fashionManifest, config: fashionConfig },
  { manifest: electronicsManifest, config: electronicsConfig },
  { manifest: modernManifest, config: modernConfig },
  { manifest: fashionLuxeManifest, config: fashionLuxeConfig },
  { manifest: freshMarketManifest, config: freshMarketConfig },
  { manifest: autoProManifest, config: autoProConfig },
  { manifest: foodExpressManifest, config: foodExpressConfig },
];

function authorName(author: ManifestLike["author"]): string {
  if (typeof author === "string") return author;
  return author?.name ?? "Venda Express";
}

export const frontendThemeCatalog: ThemeCatalogItem[] = frontendThemes.map(
  ({ manifest, config }) => ({
    id: manifest.id,
    name: manifest.name,
    label: manifest.label,
    description: manifest.description ?? "",
    tags: manifest.tags ?? [],
    version: manifest.version,
    author: authorName(manifest.author),
    accent: config?.tokens?.colors?.primary ?? "#111827",
    in_use: 0,
  }),
);
