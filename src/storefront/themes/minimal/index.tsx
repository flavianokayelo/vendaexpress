import { CartAdapter } from "../shared/CartAdapter";
import { MinimalPageHeader } from "./components/MinimalPageHeader";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ProductCard } from "./components/ProductCard";
import { ProductGrid } from "./components/ProductGrid";
import { createOpenPages, type OpenPagesSkin } from "../shared/createOpenPages";
import { HomePage } from "./HomePage";
import type { ThemeContract } from "../../contract";
import manifest from "./theme.json";
import { config } from "./config";

const SKIN: OpenPagesSkin = {
  breadcrumb: "plain",
  titleAccent: "plain",
  controls: "sharp",
  promoBadge: "tag",
  sectionTitle: "plain",
};

const openPages = createOpenPages({ pageHeader: MinimalPageHeader, grid: ProductGrid, skin: SKIN });

export const minimalTheme: ThemeContract = {
  id: "minimal",
  manifest,
  config,
  components: {
    Header,
    Footer,
    ProductCard,
    ProductGrid,
    Cart: CartAdapter,
  },
  pages: {
    Home: HomePage,
    ...openPages,
  },
};

export default minimalTheme;