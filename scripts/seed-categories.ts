/**
 * Seed script for BM Wood categories.
 * Adds the same categories that were previously static in the Projects component.
 *
 * Run with: npx tsx scripts/seed-categories.ts
 * Or: npm run seed:categories
 *
 * Requires MONGODB_URI in .env.local
 */

import { config } from "dotenv";
import mongoose from "mongoose";
import Category from "@/lib/db/models/category.model";

// Load .env.local (Next.js convention)
config({ path: ".env.local" });

const CATEGORIES = [
  {
    name: "Cuisine",
    slug: "cuisine",
    description: "Cuisines sur mesure",
    image: "/images/KitchenCategory.png",
    isActive: true,
    order: 0,
  },
  {
    name: "Habillage Mural",
    slug: "habillage-mural",
    description: "Revêtements muraux en bois",
    image: "/images/HabillageMuralCategory.png",
    isActive: true,
    order: 1,
  },
  {
    name: "Porte",
    slug: "porte",
    description: "Portes intérieures et extérieures",
    image: "/images/DoorCategory.png",
    isActive: true,
    order: 2,
  },
  {
    name: "Salon",
    slug: "salon",
    description: "Agencement de salon sur mesure",
    image: "/images/SalonCategory.png",
    isActive: true,
    order: 3,
  },
  {
    name: "Cache Radiateur",
    slug: "cache-radiateur",
    description: "Habillages de radiateurs",
    image: "/images/CacheCategory.png",
    isActive: true,
    order: 4,
  },
  {
    name: "Dressing",
    slug: "dressing",
    description: "Dressings et rangements sur mesure",
    image: "/images/dressingCategory.png",
    isActive: true,
    order: 5,
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI is not set. Add it to .env.local or run with MONGODB_URI=...");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");

    let created = 0;
    let skipped = 0;

    for (const cat of CATEGORIES) {
      const existing = await Category.findOne({ slug: cat.slug });
      if (existing) {
        console.log(`⏭️  Skipped "${cat.name}" (already exists)`);
        skipped++;
        continue;
      }

      await Category.create(cat);
      console.log(`✅ Created "${cat.name}"`);
      created++;
    }

    console.log(`\n📊 Done: ${created} created, ${skipped} skipped`);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seed();
