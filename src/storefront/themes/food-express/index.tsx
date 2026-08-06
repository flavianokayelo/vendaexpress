import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ProductCard } from "./components/ProductCard";
import { ProductGrid } from "./components/ProductGrid";
import { CartAdapter } from "../shared/CartAdapter";
import { FoodExpressPageHeader } from "./components/FoodExpressPageHeader";
import { createOpenPages, type OpenPagesSkin } from "../shared/createOpenPages";
import { HomePage } from "./HomePage";
import type { ThemeContract } from "../../contract";
import manifest from "./theme.json";
import { config } from "./config";

const SKIN: OpenPagesSkin = {
  breadcrumb: "slash",
  titleAccent: "bar",
  controls: "pill",
  promoBadge: "circle",
  sectionTitle: "underline",
};

const openPages = createOpenPages({ pageHeader: FoodExpressPageHeader, grid: ProductGrid, skin: SKIN });

export const foodExpressTheme: ThemeContract = {
  id: "food-express",
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

export default foodExpressTheme;