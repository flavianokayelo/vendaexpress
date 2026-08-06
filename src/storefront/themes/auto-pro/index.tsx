import { CartAdapter } from "../shared/CartAdapter";
import { AutoProPageHeader } from "./components/AutoProPageHeader";
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
  breadcrumb: "chevron",
  titleAccent: "bar",
  controls: "chip",
  promoBadge: "ribbon",
  sectionTitle: "bar",
};

const openPages = createOpenPages({ pageHeader: AutoProPageHeader, grid: ProductGrid, skin: SKIN });

export const autoProTheme: ThemeContract = {
  id: "auto-pro",
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

export default autoProTheme;