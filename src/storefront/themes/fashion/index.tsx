import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ProductCard } from "./components/ProductCard";
import { ProductGrid } from "./components/ProductGrid";
import { FashionPageHeader } from "./components/FashionPageHeader";
import { CartAdapter } from "../shared/CartAdapter";
import { createOpenPages } from "../shared/createOpenPages";
import { HomePage } from "./HomePage";
import type { ThemeContract } from "../../contract";
import manifest from "./theme.json";
import { config } from "./config";

const openPages = createOpenPages({ pageHeader: FashionPageHeader, grid: ProductGrid });

export const fashionTheme: ThemeContract = {
  id: "fashion",
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

export default fashionTheme;