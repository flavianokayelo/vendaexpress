import { CartAdapter } from "../shared/CartAdapter";
import { LuxuryPageHeader } from "./components/LuxuryPageHeader";
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
  titleAccent: "underline",
  controls: "underline",
  promoBadge: "ribbon",
  sectionTitle: "underline",
};

const openPages = createOpenPages({ pageHeader: LuxuryPageHeader, grid: ProductGrid, skin: SKIN });

export const luxuryTheme: ThemeContract = {
  id: "luxury",
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

export default luxuryTheme;