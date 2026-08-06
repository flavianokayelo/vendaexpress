import { CartAdapter } from "../shared/CartAdapter";
import { ElectronicsPageHeader } from "./components/ElectronicsPageHeader";
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
  breadcrumb: "slash",
  titleAccent: "bar",
  controls: "chip",
  promoBadge: "tag",
  sectionTitle: "bar",
};

const openPages = createOpenPages({ pageHeader: ElectronicsPageHeader, grid: ProductGrid, skin: SKIN });

export const electronicsTheme: ThemeContract = {
  id: "electronics",
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

export default electronicsTheme;