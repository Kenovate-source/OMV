// Phase 2 introduced static mock data so the storefront UI, filtering, cart
// and checkout flows could be built and reviewed before Phase 5 wires the
// real PostgreSQL/Prisma/NestJS catalogue API. Phase 4's refinement adds a
// proper variant structure (colour + size + stock) as the single source of
// truth for availability — this shape is designed to map directly onto the
// real backend's product/variant tables in Phase 5, right down to the
// field names.

export type Category = "women" | "men" | "kids";
export type Badge = "New" | "Family Set" | "Premium";
export type ProductStatus = "Active" | "Draft" | "Archived";

// A single purchasable SKU: one colour, one size, one stock count. This is
// the ONLY place stock lives — Admin Inventory, Admin Products, the PDP,
// cart, checkout, and orders all read/write through this same structure
// (via lib/inventory/inventory-context.tsx) rather than each keeping their
// own stock number.
export interface ProductVariant {
  color: string;
  size: string;
  stock: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: Category;
  subcategory?: string;
  price: number; // NGN
  salePrice?: number;
  status: ProductStatus;
  badge?: Badge;
  variants: ProductVariant[];
  swatch: [string, string]; // gradient placeholder in lieu of real photography
  description: string;
  completeTheLook?: string[]; // related product ids
}

// Deterministic mock stock generator for products where exact numbers
// don't need to be hand-authored — keeps the catalogue readable while
// still giving every variant a real (sometimes zero) stock count.
function makeVariants(colors: string[], sizes: string[], seed: number): ProductVariant[] {
  const variants: ProductVariant[] = [];
  colors.forEach((color, ci) => {
    sizes.forEach((size, si) => {
      const n = ci * sizes.length + si + seed;
      const stock = n % 9 === 0 ? 0 : 3 + ((n * 5) % 22);
      variants.push({ color, size, stock });
    });
  });
  return variants;
}

export const PRODUCTS: Product[] = [
  {
    id: "w-emerald-wrap-dress",
    slug: "emerald-wrap-dress",
    name: "Emerald Wrap Dress",
    category: "women",
    subcategory: "Dresses",
    price: 68000,
    status: "Active",
    badge: "New",
    // Hand-set to demonstrate the "some variants out of stock, product
    // still visible" requirement: Emerald/M and Midnight/L are 0.
    variants: [
      { color: "Emerald", size: "XS", stock: 6 },
      { color: "Emerald", size: "S", stock: 5 },
      { color: "Emerald", size: "M", stock: 0 },
      { color: "Emerald", size: "L", stock: 3 },
      { color: "Emerald", size: "XL", stock: 4 },
      { color: "Midnight", size: "XS", stock: 4 },
      { color: "Midnight", size: "S", stock: 6 },
      { color: "Midnight", size: "M", stock: 5 },
      { color: "Midnight", size: "L", stock: 0 },
      { color: "Midnight", size: "XL", stock: 2 },
    ],
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
    subcategory: "Tops",
    price: 42000,
    status: "Active",
    variants: makeVariants(["Ivory", "Blush"], ["XS", "S", "M", "L"], 1),
    swatch: ["#3d4a44", "#556b5f"],
    description: "Fluid silk-blend blouse with a soft draped neckline — a quiet everyday luxury.",
    completeTheLook: ["w-tailored-trouser"],
  },
  {
    id: "w-tailored-trouser",
    slug: "tailored-wide-trouser",
    name: "Tailored Wide Trouser",
    category: "women",
    subcategory: "Bottoms",
    price: 51000,
    status: "Active",
    variants: makeVariants(["Midnight", "Sand"], ["XS", "S", "M", "L", "XL"], 2),
    swatch: ["#0f2c22", "#1b4332"],
    description: "High-waisted wide-leg trouser cut for movement and a clean, elongated line.",
  },
  {
    id: "w-heritage-headwrap",
    slug: "heritage-gold-headwrap",
    name: "Heritage Gold Headwrap",
    category: "women",
    subcategory: "Accessories",
    price: 18500,
    status: "Active",
    badge: "Premium",
    variants: makeVariants(["Gold", "Emerald"], ["One Size"], 3),
    swatch: ["#8a6d1c", "#C9A227"],
    description: "Hand-finished headwrap in a heritage gold weave, a signature OMV occasion piece.",
  },
  {
    id: "m-linen-shirt",
    slug: "forest-linen-shirt",
    name: "Forest Linen Shirt",
    category: "men",
    subcategory: "Shirts",
    price: 39000,
    status: "Active",
    badge: "New",
    variants: makeVariants(["Forest", "Ivory"], ["S", "M", "L", "XL", "XXL"], 4),
    swatch: ["#12372A", "#2D6A4F"],
    description: "Breathable linen shirt with a relaxed collar — dresses up or down with ease.",
    completeTheLook: ["m-tailored-chino", "m-leather-belt"],
  },
  {
    id: "m-tailored-chino",
    slug: "tailored-chino",
    name: "Tailored Chino",
    category: "men",
    subcategory: "Bottoms",
    price: 45000,
    status: "Active",
    variants: makeVariants(["Midnight", "Sand"], ["30", "32", "34", "36", "38"], 5),
    swatch: ["#1b2e26", "#2f4a3d"],
    description: "Slim, tapered chino in a durable brushed cotton twill.",
  },
  {
    id: "m-leather-belt",
    slug: "heritage-leather-belt",
    name: "Heritage Leather Belt",
    category: "men",
    subcategory: "Accessories",
    price: 22000,
    status: "Active",
    badge: "Premium",
    variants: makeVariants(["Cognac", "Black"], ["S", "M", "L"], 6),
    swatch: ["#6b4423", "#C9A227"],
    description: "Full-grain leather belt with a brushed gold-tone buckle.",
  },
  {
    id: "m-family-suit-jacket",
    slug: "occasion-blazer",
    name: "Occasion Blazer",
    category: "men",
    subcategory: "Outerwear",
    price: 89000,
    status: "Active",
    badge: "Family Set",
    variants: makeVariants(["Midnight"], ["S", "M", "L", "XL"], 7),
    swatch: ["#081C15", "#12372A"],
    description: "Structured single-breasted blazer, part of the OMV family occasion set.",
  },
  {
    id: "k-family-suit-mini",
    slug: "mini-occasion-blazer",
    name: "Mini Occasion Blazer",
    category: "kids",
    subcategory: "Outerwear",
    price: 34000,
    status: "Active",
    badge: "Family Set",
    variants: makeVariants(["Midnight"], ["2-3Y", "4-5Y", "6-7Y", "8-9Y"], 8),
    swatch: ["#081C15", "#1B4332"],
    description: "A scaled-down version of our Occasion Blazer, cut for growing families to match.",
  },
  {
    id: "k-play-dungaree",
    slug: "everyday-play-dungaree",
    name: "Everyday Play Dungaree",
    category: "kids",
    subcategory: "Everyday",
    price: 21000,
    status: "Active",
    badge: "New",
    variants: makeVariants(["Sand", "Emerald"], ["1-2Y", "2-3Y", "4-5Y", "6-7Y"], 9),
    swatch: ["#4B5A52", "#7a8f83"],
    description: "Durable cotton dungaree built for play, with reinforced knees and easy-clip straps.",
  },
  {
    id: "k-gold-trim-dress",
    slug: "gold-trim-party-dress",
    name: "Gold-Trim Party Dress",
    category: "kids",
    subcategory: "Dresses",
    price: 27500,
    status: "Active",
    badge: "Premium",
    variants: makeVariants(["Ivory", "Emerald"], ["2-3Y", "4-5Y", "6-7Y", "8-9Y"], 10),
    swatch: ["#2f4a3d", "#C9A227"],
    description: "A special-occasion dress with hand-finished gold trim detailing.",
  },
  {
    id: "a-gold-clutch",
    slug: "heritage-gold-clutch",
    name: "Heritage Gold Clutch",
    category: "women",
    subcategory: "Accessories",
    price: 31000,
    status: "Active",
    badge: "Premium",
    variants: makeVariants(["Gold"], ["One Size"], 11),
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

// --- Variant helpers (used by PDP, cart, checkout, and the admin portal) ---

export function getColors(product: Product): string[] {
  return Array.from(new Set(product.variants.map((v) => v.color)));
}

export function getSizes(product: Product): string[] {
  return Array.from(new Set(product.variants.map((v) => v.size)));
}

export function getVariant(
  product: Product,
  color: string,
  size: string
): ProductVariant | undefined {
  return product.variants.find((v) => v.color === color && v.size === size);
}

export function getTotalStock(product: Product): number {
  return product.variants.reduce((sum, v) => sum + v.stock, 0);
}

export function isProductInStock(product: Product): boolean {
  return getTotalStock(product) > 0;
}

// --- Outfit-slot mapping (Outfit Builder / Complete the Look) ---
// The catalogue doesn't carry a dedicated "garment slot" field, so this
// derives one from subcategory (and a couple of name-based overrides for
// bag/accessory items) rather than inventing a second, possibly
// conflicting classification system. Phase 5's real schema should add a
// first-class `slot` field on Product instead of deriving it.
export type OutfitSlot = "top" | "bottom" | "dress" | "outerwear" | "shoes" | "bag" | "accessory";

export function getOutfitSlot(product: Product): OutfitSlot {
  const n = product.name.toLowerCase();
  if (n.includes("clutch") || n.includes("bag")) return "bag";
  if (n.includes("belt") || n.includes("headwrap")) return "accessory";
  switch (product.subcategory) {
    case "Dresses":
      return "dress";
    case "Tops":
    case "Shirts":
      return "top";
    case "Bottoms":
      return "bottom";
    case "Outerwear":
      return "outerwear";
    case "Everyday":
      return "top";
    default:
      return "accessory";
  }
}

export const SLOT_LABELS: Record<OutfitSlot, string> = {
  top: "Top",
  bottom: "Bottom",
  dress: "Dress",
  outerwear: "Outerwear",
  shoes: "Shoes",
  bag: "Bag",
  accessory: "Accessory",
};
