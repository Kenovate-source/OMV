// prisma/seed.ts
//
// seedCore() — safe to run in ANY environment (dev, preview, production).
// Reproduces the real Phase 4.2 demo catalogue, the 5 admin accounts, one
// announcement, one business location, one promotion. No customers, no
// orders, no payments — production seeding must never fabricate those.
//
// seedDevOnly() — customer + order demo data for LOCAL DEV convenience
// only. Gated behind SEED_DEV_DATA=true, never set in Preview/Production.
//
// Run with: npx prisma db seed

import { PrismaClient, ProductCategory, GarmentSlot, AdminRole } from "@prisma/client";
import argon2 from "argon2";
import { PRODUCTS, type Product as CatalogueProduct } from "../lib/data/products";
import { ADMIN_SEED } from "../lib/admin/admin-auth-context";

const prisma = new PrismaClient();

function mapGarmentSlot(p: CatalogueProduct): GarmentSlot {
  const n = p.name.toLowerCase();
  if (n.includes("clutch") || n.includes("bag")) return GarmentSlot.BAG;
  if (n.includes("headwrap")) return GarmentSlot.HEADWEAR;
  if (n.includes("belt")) return GarmentSlot.ACCESSORY;
  switch (p.subcategory) {
    case "Dresses":
      return GarmentSlot.DRESS;
    case "Shirts":
      return GarmentSlot.SHIRT;
    case "Tops":
      return GarmentSlot.TOP;
    case "Bottoms":
      return GarmentSlot.TROUSERS;
    case "Outerwear":
      return GarmentSlot.JACKET;
    case "Everyday":
      return GarmentSlot.TOP;
    default:
      return GarmentSlot.ACCESSORY;
  }
}

function mapCategory(c: string): ProductCategory {
  if (c === "women") return ProductCategory.WOMEN;
  if (c === "men") return ProductCategory.MEN;
  return ProductCategory.KIDS;
}

function computeVariantKey(color?: string | null, size?: string | null, attributes: Record<string, unknown> = {}): string {
  const parts = [color, size].filter((v): v is string => Boolean(v));
  if (parts.length > 0) return parts.join("/");
  return Object.keys(attributes)
    .sort()
    .map((k) => `${k}:${attributes[k]}`)
    .join("|");
}

async function seedCore() {
  console.log("Seeding core data (safe for any environment)...");

  for (const admin of ADMIN_SEED) {
    const passwordHash = await argon2.hash(`Omv-${admin.id}-ChangeMe!`, { type: argon2.argon2id });
    await prisma.adminUser.upsert({
      where: { email: admin.email },
      update: {},
      create: {
        email: admin.email,
        fullName: admin.name,
        role: admin.role.toUpperCase() as AdminRole,
        passwordHash,
      },
    });
  }
  console.log(`  ${ADMIN_SEED.length} admin accounts seeded.`);

  for (const p of PRODUCTS) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        category: mapCategory(p.category),
        subcategory: p.subcategory,
        garmentSlot: mapGarmentSlot(p),
        price: p.price * 100,
        salePrice: p.salePrice ? p.salePrice * 100 : null,
        status: p.status === "Active" ? "ACTIVE" : p.status === "Draft" ? "DRAFT" : "ARCHIVED",
        badge: p.badge,
        swatchFrom: p.swatch[0],
        swatchTo: p.swatch[1],
        featured: false,
      },
    });

    for (const v of p.variants) {
      const variantKey = computeVariantKey(v.color, v.size);
      await prisma.productVariant.upsert({
        where: { productId_variantKey: { productId: product.id, variantKey } },
        update: { stock: v.stock },
        create: {
          productId: product.id,
          color: v.color,
          size: v.size,
          variantKey,
          stock: v.stock,
        },
      });
    }
  }
  console.log(`  ${PRODUCTS.length} products seeded (with variants).`);

  for (const p of PRODUCTS) {
    if (!p.completeTheLook?.length) continue;
    const source = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (!source) continue;
    for (const relatedId of p.completeTheLook) {
      const related = PRODUCTS.find((x) => x.id === relatedId);
      if (!related) continue;
      const relatedProduct = await prisma.product.findUnique({ where: { slug: related.slug } });
      if (!relatedProduct) continue;
      await prisma.completeTheLookLink.upsert({
        where: {
          sourceProductId_relatedProductId: {
            sourceProductId: source.id,
            relatedProductId: relatedProduct.id,
          },
        },
        update: {},
        create: { sourceProductId: source.id, relatedProductId: relatedProduct.id },
      });
    }
  }

  await prisma.announcement.upsert({
    where: { id: "seed-announcement-1" },
    update: {},
    create: {
      id: "seed-announcement-1",
      title: "New arrivals",
      message: "Our new seasonal collection is now available — every outfit, every occasion.",
      type: "LAUNCH",
      startDate: new Date(Date.now() - 86400000),
      endDate: new Date(Date.now() + 30 * 86400000),
      active: true,
      ctaLabel: "Shop now",
      ctaHref: "/women",
    },
  });

  await prisma.promotion.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: { code: "WELCOME10", discountPercent: 10, active: true },
  });

  const location = await prisma.businessLocation.upsert({
    where: { id: "seed-location-1" },
    update: {},
    create: {
      id: "seed-location-1",
      name: "OMV Flagship — Lagos",
      type: "STORE",
      addressLine: "12 Admiralty Way",
      city: "Lagos",
      state: "Lagos State",
      deliveryAvailable: true,
      pickupAvailable: true,
    },
  });
  await prisma.contactPoint.upsert({
    where: { id: "seed-contact-1" },
    update: {},
    create: {
      id: "seed-contact-1",
      locationId: location.id,
      type: "WHATSAPP",
      purpose: "CUSTOMER_SERVICE",
      value: "+234-000-000-0000",
      label: "Customer Service",
    },
  });

  await prisma.paymentProviderConfig.upsert({
    where: { provider: "paystack" },
    update: {},
    create: {
      provider: "paystack",
      isActive: false,
      isDefault: true,
      publicConfig: {},
      secretEnvKey: "PAYSTACK_SECRET_KEY",
    },
  });

  console.log("Core seed complete.");
}

async function seedDevOnly() {
  if (process.env.SEED_DEV_DATA !== "true") {
    console.log("SEED_DEV_DATA not set — skipping dev-only demo data (correct for preview/production).");
    return;
  }
  console.log("Seeding LOCAL DEV-ONLY demo data (SEED_DEV_DATA=true)...");

  const passwordHash = await argon2.hash("DevPassword123!", { type: argon2.argon2id });
  const devUser = await prisma.user.upsert({
    where: { email: "dev.customer@example.com" },
    update: {},
    create: {
      email: "dev.customer@example.com",
      fullName: "Dev Test Customer",
      passwordHash,
      emailVerified: true,
    },
  });

  await prisma.notificationPreference.upsert({
    where: { userId: devUser.id },
    update: {},
    create: { userId: devUser.id },
  });

  console.log("  1 dev-only demo customer seeded (no orders/payments fabricated).");
}

async function main() {
  await seedCore();
  await seedDevOnly();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
