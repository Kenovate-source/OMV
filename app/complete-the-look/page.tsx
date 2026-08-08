import { ProductTile } from "@/components/shop/ProductTile";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";

const LOOKS = [
  {
    title: "Occasion Emerald",
    description: "A polished, family-ready evening look built around our signature wrap dress.",
    anchorSlug: "emerald-wrap-dress",
  },
  {
    title: "Everyday Linen",
    description: "Relaxed layers for warm days — linen, chino and heritage leather.",
    anchorSlug: "forest-linen-shirt",
  },
];

export const metadata = { title: "Complete the Look" };

export default function CompleteTheLookPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-widest text-gold">Styling</p>
      <h1 className="mt-3 font-serif text-3xl text-foreground sm:text-4xl">Complete the Look</h1>
      <p className="mt-3 max-w-2xl text-sm text-foreground-muted">
        Curated pairings from our stylists — start with one piece, build a
        whole outfit.
      </p>

      <div className="mt-14 flex flex-col gap-16">
        {LOOKS.map((look) => {
          const anchor = getProductBySlug(look.anchorSlug);
          if (!anchor) return null;
          const pairing = getRelatedProducts(anchor.completeTheLook);
          const all = [anchor, ...pairing];
          return (
            <section key={look.anchorSlug}>
              <h2 className="font-serif text-2xl text-foreground">{look.title}</h2>
              <p className="mt-2 text-sm text-foreground-muted">{look.description}</p>
              <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3">
                {all.map((p) => (
                  <ProductTile key={p.id} product={p} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
