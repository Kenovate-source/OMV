import { CatalogueView } from "@/components/shop/CatalogueView";
import { getProductsByCategory } from "@/lib/data/products";

export const metadata = { title: "Men" };

export default function MenPage() {
  return (
    <CatalogueView
      title="Men"
      description="Tailored fundamentals and occasion pieces built to last, with a calm, confident finish."
      products={getProductsByCategory("men")}
    />
  );
}
