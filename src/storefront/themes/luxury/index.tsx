import { Header } from "../../../components/theme/Header";
import { Footer } from "../../../components/theme/Footer";
import { ProductCard } from "../../../components/theme/ProductCard";
import { ProductGrid } from "../../../components/theme/ProductGrid";
import { CartAdapter } from "../shared/CartAdapter";
import { HomePage } from "../standard/HomePage";
import type { ThemeContract } from "../../contract";
import manifest from "./theme.json";
import { config } from "./config";

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
  },
};

export default luxuryTheme;