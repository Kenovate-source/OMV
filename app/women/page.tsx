import { CatalogueView } from "@/components/shop/CatalogueView";
import { getProductsByCategory } from "@/lib/data/products";

export const metadata = { title: "Women" };

export default function WomenPage() {
  return (
    <CatalogueView
      title="Women"
      description="Elegant, considered pieces for every occasion — from everyday essentials to statement wear."
      products={getProductsByCategory("women")}
    />
  );
}
