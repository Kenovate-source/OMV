// Phase 2 uses static mock data so the storefront UI, filtering, cart and
// checkout flows can be built and reviewed before Phase 5 wires the real
// PostgreSQL/Prisma/NestJS catalogue API. The shape here (Product) is meant
// to map cleanly onto that future API response.

export type Category = "women" | "men" | "kids";
export type Badge = "New" | "Family Set" | "Premium";

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: Category;
  price: number; // NGN
  badge?: Badge;
  colors: string[];
  sizes: string[];
  swatch: [string, string]; // gradient placeholder in lieu of real photography
  description: string;
  completeTheLook?: string[]; // related product ids
}

export const PRODUCTS: Product[] = [
  {
    id: "w-emerald-wrap-dress",
    slug: "emerald-wrap-dress",
    name: "Emerald Wrap Dress",
    category: "women",
    price: 68000,
    badge: "New",
    colors: ["Emerald", "Midnight"],
    sizes: ["XS", "S", "M", "L", "XL"],
    swatch: ["#12372A", "#1B4332"],
    description:
      "A tailored wrap silhouette in breathable crepe, finished with a self-tie belt and gold-tone hardware.",
    completeTheLook: ["a-gold-clutch", "w-heritage-headwrap"],
  },
  {
    id: "w-ivory-blouse",
    slug: "ivory-silk-blouse",
    name: "Ivory Silk Blouse",
    category: "women",
    price: 42000,
    colors: ["Ivory", "Blush"],
    sizes: ["XS", "S", "M", "L"],
    swatch: ["#3d4a44", "#556b5f"],
    description: "Fluid silk-blend blouse with a soft draped neckline — a quiet everyday luxury.",
    completeTheLook: ["w-tailored-trouser"],
  },
  {
    id: "w-tailored-trouser",
    slug: "tailored-wide-trouser",
    name: "Tailored Wide Trouser",
    category: "women",
    price: 51000,
    colors: ["Midnight", "Sand"],
    sizes: ["XS", "S", "M", "L", "XL"],
    swatch: ["#0f2c22", "#1b4332"],
    description: "High-waisted wide-leg trouser cut for movement and a clean, elongated line.",
  },
  {
    id: "w-heritage-headwrap",
    slug: "heritage-gold-headwrap",
    name: "Heritage Gold Headwrap",
    category: "women",
    price: 18500,
    badge: "Premium",
    colors: ["Gold", "Emerald"],
    sizes: ["One Size"],
    swatch: ["#8a6d1c", "#C9A227"],
    description: "Hand-finished headwrap in a heritage gold weave, a signature OMV occasion piece.",
  },
  {
    id: "m-linen-shirt",
    slug: "forest-linen-shirt",
    name: "Forest Linen Shirt",
    category: "men",
    price: 39000,
    badge: "New",
    colors: ["Forest", "Ivory"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    swatch: ["#12372A", "#2D6A4F"],
    description: "Breathable linen shirt with a relaxed collar — dresses up or down with ease.",
    completeTheLook: ["m-tailored-chino", "m-leather-belt"],
  },
  {
    id: "m-tailored-chino",
    slug: "tailored-chino",
    name: "Tailored Chino",
    category: "men",
    price: 45000,
    colors: ["Midnight", "Sand"],
    sizes: ["30", "32", "34", "36", "38"],
    swatch: ["#1b2e26", "#2f4a3d"],
    description: "Slim, tapered chino in a durable brushed cotton twill.",
  },
  {
    id: "m-leather-belt",
    slug: "heritage-leather-belt",
    name: "Heritage Leather Belt",
    category: "men",
    price: 22000,
    badge: "Premium",
    colors: ["Cognac", "Black"],
    sizes: ["S", "M", "L"],
    swatch: ["#6b4423", "#C9A227"],
    description: "Full-grain leather belt with a brushed gold-tone buckle.",
  },
  {
    id: "m-family-suit-jacket",
    slug: "occasion-blazer",
    name: "Occasion Blazer",
    category: "men",
    price: 89000,
    badge: "Family Set",
    colors: ["Midnight"],
    sizes: ["S", "M", "L", "XL"],
    swatch: ["#081C15", "#12372A"],
    description: "Structured single-breasted blazer, part of the OMV family occasion set.",
  },
  {
    id: "k-family-suit-mini",
    slug: "mini-occasion-blazer",
    name: "Mini Occasion Blazer",
    category: "kids",
    price: 34000,
    badge: "Family Set",
    colors: ["Midnight"],
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
    swatch: ["#081C15", "#1B4332"],
    description: "A scaled-down version of our Occasion Blazer, cut for growing families to match.",
  },
  {
    id: "k-play-dungaree",
    slug: "everyday-play-dungaree",
    name: "Everyday Play Dungaree",
    category: "kids",
    price: 21000,
    badge: "New",
    colors: ["Sand", "Emerald"],
    sizes: ["1-2Y", "2-3Y", "4-5Y", "6-7Y"],
    swatch: ["#4B5A52", "#7a8f83"],
    description: "Durable cotton dungaree built for play, with reinforced knees and easy-clip straps.",
  },
  {
    id: "k-gold-trim-dress",
    slug: "gold-trim-party-dress",
    name: "Gold-Trim Party Dress",
    category: "kids",
    price: 27500,
    badge: "Premium",
    colors: ["Ivory", "Emerald"],
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
    swatch: ["#2f4a3d", "#C9A227"],
    description: "A special-occasion dress with hand-finished gold trim detailing.",
  },
  {
    id: "a-gold-clutch",
    slug: "heritage-gold-clutch",
    name: "Heritage Gold Clutch",
    category: "women",
    price: 31000,
    badge: "Premium",
    colors: ["Gold"],
    sizes: ["One Size"],
    swatch: ["#8a6d1c", "#C9A227"],
    description: "A compact evening clutch finished in heritage gold hardware.",
  },
];

export function getProductBySlug(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: Category) {
  return PRODUCTS.filter((p) => p.category === category);
}

export function getRelatedProducts(ids: string[] = []) {
  return PRODUCTS.filter((p) => ids.includes(p.id));
}

export function searchProducts(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
  );
}

export function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`;
}
