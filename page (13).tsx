import { CatalogueView } from "@/components/shop/CatalogueView";
import { getProductsByCategory } from "@/lib/data/products";

export const metadata = { title: "Kids" };

export default function KidsPage() {
  return (
    <CatalogueView
      title="Kids"
      description="Durable, comfortable pieces for everyday play, plus special-occasion wear that matches the family set."
      products={getProductsByCategory("kids")}
    />
  );
}
