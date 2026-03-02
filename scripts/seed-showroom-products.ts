/**
 * Seed script for BM Wood products from the carrousel showroom folder.
 * Adds products with their photos organized by category.
 *
 * Run with: npx tsx scripts/seed-showroom-products.ts
 * Or: npm run seed:showroom
 *
 * Requires MONGODB_URI in .env.local
 * Requires categories to exist (run seed:categories first)
 */

import { config } from "dotenv";
import * as fs from "fs";
import * as path from "path";
import mongoose from "mongoose";
import Product from "@/lib/db/models/product.model";
import Category from "@/lib/db/models/category.model";

// Load .env.local (Next.js convention)
config({ path: ".env.local" });

const SHOWROOM_BASE = path.join(process.cwd(), "public", "carrousel showroom");

// Maps showroom folder names to category slugs (from seed-categories)
const FOLDER_TO_CATEGORY_SLUG: Record<string, string> = {
  cuisine: "cuisine",
  Dressings: "dressing",
  portes: "porte",
  "Revêtements murale": "habillage-mural",
  "Rev?tements murale": "habillage-mural",
  "salle à manger": "salon",
  "salle ? manger": "salon",
  Salon: "salon",
};

function getCategorySlug(folderName: string): string | undefined {
  const exact = FOLDER_TO_CATEGORY_SLUG[folderName];
  if (exact) return exact;
  // Fallback for encoding variations
  if (/murale|rev.*tements/i.test(folderName)) return "habillage-mural";
  if (/manger/i.test(folderName)) return "salon";
  return undefined;
}

function toWebPath(filePath: string): string {
  // Convert absolute path to web path (relative to public/)
  const normalized = path.normalize(filePath);
  const publicIndex = normalized.indexOf("public");
  if (publicIndex === -1) return filePath;
  const relative = normalized.substring(publicIndex + "public".length);
  return "/" + relative.replace(/\\/g, "/").replace(/^\/+/, "");
}

function getImageFiles(dir: string): string[] {
  const ext = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
  const files: string[] = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        files.push(...getImageFiles(full));
      } else if (ext.some((x) => e.name.toLowerCase().endsWith(x))) {
        files.push(full);
      }
    }
  } catch {
    // ignore
  }
  return files;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

interface ProductDef {
  name: string;
  description?: string;
  images: string[];
  categorySlug: string;
  isFeatured?: boolean;
}

function discoverProducts(): ProductDef[] {
  const products: ProductDef[] = [];

  if (!fs.existsSync(SHOWROOM_BASE)) {
    console.error(`❌ Showroom folder not found: ${SHOWROOM_BASE}`);
    return products;
  }

  const categoryFolders = fs.readdirSync(SHOWROOM_BASE, { withFileTypes: true });

  for (const catDir of categoryFolders) {
    if (!catDir.isDirectory()) continue;

    const categorySlug = getCategorySlug(catDir.name);
    if (!categorySlug) {
      console.warn(`⚠️  Unknown category folder: ${catDir.name}, skipping`);
      continue;
    }

    const catPath = path.join(SHOWROOM_BASE, catDir.name);
    const subDirs = fs.readdirSync(catPath, { withFileTypes: true });

    // Check if there are subfolders (e.g. cuisine 1, Cuisine 2) = multiple products
    const dirs = subDirs.filter((d) => d.isDirectory());
    const files = subDirs.filter((d) => d.isFile());

    if (dirs.length > 0) {
      // Multiple products (e.g. cuisine has cuisine 1, Cuisine 2, etc.)
      for (const sub of dirs) {
        const subPath = path.join(catPath, sub.name);
        const images = getImageFiles(subPath).map(toWebPath);
        if (images.length > 0) {
          products.push({
            name: sub.name,
            description: `Réalisation ${sub.name} - ${catDir.name} sur mesure par BM Wood.`,
            images,
            categorySlug,
            isFeatured: products.length < 4, // First 4 as featured
          });
        }
      }
    }

    // Also check for images directly in category folder (e.g. Dressings, portes)
    if (dirs.length === 0 || files.some((f) => /\.(jpg|jpeg|png|webp|gif)$/i.test(f.name))) {
      const directImages = getImageFiles(catPath).map(toWebPath);
      const alreadyAdded = new Set(products.map((p) => p.images).flat());
      const newImages = directImages.filter((img) => !alreadyAdded.has(img));

      if (newImages.length > 0) {
        const displayName = catDir.name.charAt(0).toUpperCase() + catDir.name.slice(1);
        products.push({
          name: displayName,
          description: `${displayName} sur mesure - Réalisation BM Wood.`,
          images: newImages,
          categorySlug,
          isFeatured: products.length < 4,
        });
      }
    }
  }

  return products;
}

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI is not set. Add it to .env.local");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB\n");

    const productDefs = discoverProducts();
    console.log(`📁 Discovered ${productDefs.length} products from showroom\n`);

    const categories = await Category.find({}).lean();
    const slugToId = new Map(categories.map((c) => [c.slug, c._id.toString()]));

    let created = 0;
    let skipped = 0;

    for (const def of productDefs) {
      const categoryId = slugToId.get(def.categorySlug);
      if (!categoryId) {
        console.warn(`⚠️  Category "${def.categorySlug}" not found, skipping "${def.name}"`);
        continue;
      }

      const slug = slugify(def.name);
      const existing = await Product.findOne({ slug });
      if (existing) {
        console.log(`⏭️  Skipped "${def.name}" (slug: ${slug}, already exists)`);
        skipped++;
        continue;
      }

      await Product.create({
        name: def.name,
        slug,
        description: def.description,
        categoryId: new mongoose.Types.ObjectId(categoryId),
        images: def.images,
        isFeatured: def.isFeatured ?? false,
        isActive: true,
      });

      console.log(`✅ Created "${def.name}" (${def.images.length} images)`);
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
