import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ProductCard } from "./components/ProductCard";
import { ProductGrid } from "./components/ProductGrid";
import { CartAdapter } from "../shared/CartAdapter";
import { HomePage } from "./HomePage";
import { ProductPage } from "./pages/ProductPage";
import { CategoryPage } from "./pages/CategoryPage";
import { SearchPage } from "./pages/SearchPage";
import type { ThemeContract } from "../../contract";
import manifest from "./theme.json";
import { config } from "./config";

export const modernTheme: ThemeContract = {
  id: "modern",
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
    Product: ProductPage,
    Category: CategoryPage,
    Search: SearchPage,
  },
};

export default modernTheme;
