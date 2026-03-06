/**
 * normalize-data.ts
 *
 * Reads the raw cocktails.json from the backup, cleans / normalizes every
 * field according to the documented rules, and writes two output files:
 *   - src/data/cocktails.json   (cleaned cocktail array)
 *   - src/data/image-map.json   (imageId -> webp filename)
 *
 * Run with:  npx tsx scripts/normalize-data.ts
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

// ── paths ──────────────────────────────────────────────────────────────
const PROJECT_ROOT = join(dirname(new URL(import.meta.url).pathname), "..");
const SRC_PATH = join(
  PROJECT_ROOT,
  "..",
  "bartenders-choice-backup",
  "cocktails.json",
);
const OUT_DIR = join(PROJECT_ROOT, "src", "data");
const OUT_COCKTAILS = join(OUT_DIR, "cocktails.json");
const OUT_IMAGE_MAP = join(OUT_DIR, "image-map.json");

// ── types ──────────────────────────────────────────────────────────────
interface RawCocktail {
  id: number;
  name: string;
  story: string;
  image: string;
  is_favorite: boolean;
  notes: string | null;
  bar: string;
  bartender: string;
  new: boolean;
  method: string;
  light_dark: string;
  alcohol: string[];
  sensation: string[];
  style: string[];
  extras: string[];
  rating: number;
  ingredients_text: string;
  qty1: string;
  qty1_metric: string;
  ingredient1: string;
  qty2: string;
  qty2_metric: string;
  ingredient2: string;
  qty3: string;
  qty3_metric: string;
  ingredient3: string;
  qty4: string;
  qty4_metric: string;
  ingredient4: string;
  qty5: string;
  qty5_metric: string;
  ingredient5: string;
  ingredient6: string;
}

interface Ingredient {
  qty: string;
  qtyMetric: string;
  name: string;
}

interface CleanCocktail {
  id: number;
  slug: string;
  name: string;
  story: string;
  image: string;
  imageId: string;
  isFavorite: boolean;
  notes: string | null;
  bar: string;
  bartender: string;
  new: boolean;
  method: string;
  lightDark: "dark" | "light" | "both";
  alcohol: string[];
  sensation: string[];
  style: string[];
  extras: string[];
  rating: number;
  ingredientsText: string;
  ingredients: Ingredient[];
}

// ── helpers ────────────────────────────────────────────────────────────

/** Normalize light_dark to "dark" | "light" | "both" */
function normalizeLightDark(raw: string): "dark" | "light" | "both" {
  const v = raw.trim().toLowerCase();
  if (v === "dark") return "dark";
  if (v === "light") return "light";
  if (
    v === "dark, light" ||
    v === "light, dark" ||
    v === "dark light" ||
    v === "both" ||
    v === ""
  ) {
    return "both";
  }
  console.warn(`  [warn] Unknown light_dark value: "${raw}" -> defaulting to "both"`);
  return "both";
}

/** Fix known sensation typos & split comma-joined values */
function normalizeSensation(raw: string[]): string[] {
  const typos: Record<string, string> = {
    refreshin: "refreshing",
    crewmy: "creamy",
  };
  const result: string[] = [];
  for (const s of raw) {
    // Split comma-joined values first (e.g. "dry,bittersweet")
    const parts = s.includes(",") ? s.split(",") : [s];
    for (let part of parts) {
      part = part.trim().toLowerCase();
      if (!part) continue;
      result.push(typos[part] ?? part);
    }
  }
  return result;
}

/** Fix style array: broken parens, trailing commas, rocky -> rocks */
function normalizeStyle(raw: string[]): string[] {
  const fixes: Record<string, string> = {
    "shaken (down": "shaken (down)",
    "stirred (down": "stirred (down)",
    "shaken (tall": "shaken (tall)",
    rocky: "rocks",
  };
  const result: string[] = [];
  for (const s of raw) {
    let v = s.trim().toLowerCase();
    // Remove trailing comma
    if (v.endsWith(",")) v = v.slice(0, -1).trim();
    if (!v) continue;
    result.push(fixes[v] ?? v);
  }
  return result;
}

/** Fix alcohol array: split "bourbon. amaro", remove empties */
function normalizeAlcohol(raw: string[]): string[] {
  const result: string[] = [];
  for (const a of raw) {
    // Split on ". " (period-space) pattern
    const parts = a.includes(". ") ? a.split(". ") : [a];
    for (let part of parts) {
      part = part.trim().toLowerCase();
      if (!part) continue;
      result.push(part);
    }
  }
  return result;
}

/** Title-case a string: "Brandon bramhall" -> "Brandon Bramhall" */
function titleCase(s: string): string {
  return s
    .trim()
    .split(/\s+/)
    .map((word) => {
      if (!word) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

/** Generate URL-safe slug: id + lowercased name, special chars removed */
function makeSlug(id: number, name: string): string {
  const clean = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars
    .trim()
    .replace(/\s+/g, "-") // spaces to hyphens
    .replace(/-+/g, "-"); // collapse multiple hyphens
  return `${id}-${clean}`;
}

/** "IMG_2084.jpg" -> "img_2084" */
function makeImageId(image: string): string {
  if (!image) return "";
  const dotIdx = image.lastIndexOf(".");
  const base = dotIdx >= 0 ? image.slice(0, dotIdx) : image;
  return base.toLowerCase();
}

/** Build the structured ingredients array from ingredient1-6 / qty1-5 */
function buildIngredients(raw: RawCocktail): Ingredient[] {
  const ingredients: Ingredient[] = [];
  for (let i = 1; i <= 6; i++) {
    const name = (
      (raw as unknown as Record<string, string>)[`ingredient${i}`]
    )?.trim();
    if (!name) continue;

    // ingredient6 has no qty/qtyMetric fields
    const qty =
      i <= 5
        ? ((raw as unknown as Record<string, string>)[`qty${i}`])
            ?.trim()
            .toLowerCase() ?? ""
        : "";
    const qtyMetric =
      i <= 5
        ? ((raw as unknown as Record<string, string>)[`qty${i}_metric`])
            ?.trim()
            .toLowerCase() ?? ""
        : "";

    ingredients.push({ qty, qtyMetric, name: name.toLowerCase().trim() });
  }
  return ingredients;
}

// ── main ───────────────────────────────────────────────────────────────
function main(): void {
  console.log(`Reading ${SRC_PATH}`);
  const raw: RawCocktail[] = JSON.parse(readFileSync(SRC_PATH, "utf-8"));
  console.log(`Loaded ${raw.length} cocktails\n`);

  const imageMap: Record<string, string> = {};
  const allAlcohol = new Set<string>();
  const allSensation = new Set<string>();
  const allStyle = new Set<string>();
  const allExtras = new Set<string>();
  const allBartenders = new Set<string>();
  const allBars = new Set<string>();
  const allImages = new Set<string>();

  const cleaned: CleanCocktail[] = raw.map((c) => {
    const lightDark = normalizeLightDark(c.light_dark);
    const alcohol = normalizeAlcohol(c.alcohol);
    const sensation = normalizeSensation(c.sensation);
    const style = normalizeStyle(c.style);
    const extras = (c.extras || [])
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const bartender = c.bartender ? titleCase(c.bartender) : "";
    const bar = c.bar ? c.bar.trim() : "";
    const imageId = makeImageId(c.image);
    const slug = makeSlug(c.id, c.name);
    const ingredients = buildIngredients(c);

    // Collect for summary
    alcohol.forEach((a) => allAlcohol.add(a));
    sensation.forEach((s) => allSensation.add(s));
    style.forEach((s) => allStyle.add(s));
    extras.forEach((e) => allExtras.add(e));
    if (bartender) allBartenders.add(bartender);
    if (bar) allBars.add(bar);
    if (imageId) {
      allImages.add(imageId);
      imageMap[imageId] = `${imageId}.webp`;
    }

    return {
      id: c.id,
      slug,
      name: c.name,
      story: c.story,
      image: c.image,
      imageId,
      isFavorite: c.is_favorite,
      notes: c.notes,
      bar,
      bartender,
      new: c.new,
      method: c.method,
      lightDark,
      alcohol,
      sensation,
      style,
      extras,
      rating: c.rating,
      ingredientsText: c.ingredients_text,
      ingredients,
    };
  });

  // ── write outputs ──────────────────────────────────────────────────
  mkdirSync(OUT_DIR, { recursive: true });

  writeFileSync(OUT_COCKTAILS, JSON.stringify(cleaned, null, 2), "utf-8");
  console.log(`Wrote ${OUT_COCKTAILS}`);

  writeFileSync(OUT_IMAGE_MAP, JSON.stringify(imageMap, null, 2), "utf-8");
  console.log(`Wrote ${OUT_IMAGE_MAP}\n`);

  // ── summary ────────────────────────────────────────────────────────
  console.log("=== Summary ===");
  console.log(`Total cocktails:      ${cleaned.length}`);
  console.log(`Unique alcohol types: ${allAlcohol.size}`);
  [...allAlcohol].sort().forEach((a) => console.log(`  - ${a}`));
  console.log(`Unique sensations:    ${allSensation.size}`);
  [...allSensation].sort().forEach((s) => console.log(`  - ${s}`));
  console.log(`Unique styles:        ${allStyle.size}`);
  [...allStyle].sort().forEach((s) => console.log(`  - ${s}`));
  console.log(`Unique extras:        ${allExtras.size}`);
  [...allExtras].sort().forEach((e) => console.log(`  - ${e}`));
  console.log(`Unique bartenders:    ${allBartenders.size}`);
  console.log(`Unique bars:          ${allBars.size}`);
  console.log(`Unique images:        ${allImages.size}`);

  // ── verify first 3 cocktails ───────────────────────────────────────
  console.log("\n=== First 3 Cocktails (verification) ===");
  for (const c of cleaned.slice(0, 3)) {
    console.log(JSON.stringify(c, null, 2));
    console.log("---");
  }
}

main();
