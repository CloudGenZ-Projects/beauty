import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local manually
const envPath = path.join(__dirname, ".env.local");
let WC_URL = "";
let CONSUMER_KEY = "";
let CONSUMER_SECRET = "";

if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    if (line.startsWith("WC_URL=")) WC_URL = line.split("=")[1]?.trim();
    if (line.startsWith("WC_CONSUMER_KEY=")) CONSUMER_KEY = line.split("=")[1]?.trim();
    if (line.startsWith("WC_CONSUMER_SECRET=")) CONSUMER_SECRET = line.split("=")[1]?.trim();
  }
}

if (!WC_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
  console.error("❌ Missing WooCommerce credentials in .env.local");
  process.exit(1);
}

const authHeader = `Basic ${Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64")}`;

// Helper: Directly upload image buffer to WordPress Media Library
async function uploadOrGetMediaId(imageUrl, filename) {
  try {
    console.log(`   📥 Downloading image for ${filename}...`);
    const imgRes = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
    });
    if (!imgRes.ok) {
      console.warn(`   ⚠️ Could not download remote image (${imgRes.status}). Skipping media attachment.`);
      return null;
    }
    const buffer = await imgRes.arrayBuffer();

    console.log(`   📤 Uploading ${filename} directly to WordPress Media Library...`);
    const uploadRes = await fetch(`${WC_URL}/wp-json/wp/v2/media`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "image/jpeg",
      },
      body: Buffer.from(buffer),
    });

    if (uploadRes.ok) {
      const mediaData = await uploadRes.json();
      console.log(`   ✅ Media uploaded successfully! ID: ${mediaData.id}`);
      return mediaData.id;
    } else {
      const errText = await uploadRes.text();
      console.warn(`   ⚠️ WordPress media upload returned status ${uploadRes.status}: ${errText.slice(0, 150)}`);
      return null;
    }
  } catch (err) {
    console.warn(`   ⚠️ Error during media upload: ${err.message}`);
    return null;
  }
}

// 12 High-End Luxury Beauty & Perfume Products (Inspired by L'Oiseau Dé)
const PRODUCTS_TO_SEED = [
  {
    name: "FLUMAM AMBER EAU DE PARFUM",
    slug: "flumam-amber-parfum",
    type: "simple",
    regular_price: "14500",
    description: `<p><strong>Warm, Sensual Amber & Cedar Essence.</strong></p><p>Flumam Amber is an opulent olfactory composition designed for lasting presence. Opens with crisp Calabrian bergamot, settling into rich resinous amber and smoky Madagascar vanilla, anchored by dry Moroccan cedarwood.</p><h4>Fragrance Pyramid</h4><ul><li><strong>Top Notes:</strong> Calabrian Bergamot, Pink Pepper, Coriander</li><li><strong>Heart Notes:</strong> Golden Amber Resin, Labdanum, Orris Root</li><li><strong>Base Notes:</strong> Moroccan Cedarwood, Bourbon Vanilla, Benzoin</li></ul><h4>Formulation Science</h4><p>Distilled in Grasse using supercritical CO2 extraction for maximum botanical fidelity and 18-hour dermal longevity.</p>`,
    short_description: "Luxury Amber & Cedarwood Eau de Parfum distilled in Grasse.",
    categories: [{ name: "PERFUME" }],
    image_url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80",
    image_filename: "flumam-amber-parfum.jpg",
    status: "publish",
  },
  {
    name: "NOIR BOTANIQUE ELIXIR DE PARFUM",
    slug: "noir-botanique-elixir",
    type: "simple",
    regular_price: "16800",
    description: `<p><strong>Intense Nocturnal Floral & Vetiver.</strong></p><p>An intoxicating, velvety elixir centering around midnight tuberose and wild black orchid, deepened by earthy Haitian vetiver and dark patchouli. Created for evening rituals and refined intensity.</p><h4>Fragrance Pyramid</h4><ul><li><strong>Top Notes:</strong> Bitter Orange, Saffron, Cardamom</li><li><strong>Heart Notes:</strong> Midnight Tuberose, Black Orchid, Jasmine Sambac</li><li><strong>Base Notes:</strong> Haitian Vetiver, Dark Patchouli, Sandalwood</li></ul><h4>Formulation Science</h4><p>Extracted via enfleurage to preserve delicate nocturnal floral esters without thermal degradation.</p>`,
    short_description: "Intense nocturnal floral and Haitian vetiver perfume elixir.",
    categories: [{ name: "PERFUME" }],
    image_url: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&auto=format&fit=crop&q=80",
    image_filename: "noir-botanique.jpg",
    status: "publish",
  },
  {
    name: "SOLEIL D'OR CYPRESS EXTRAIT",
    slug: "soleil-dor-cypress",
    type: "simple",
    regular_price: "13200",
    description: `<p><strong>Solar Mediterranean Citrus & Cypress.</strong></p><p>Evoking sun-drenched coastal cliffs, Soleil d'Or balances sparkling Sicilian lemon and neroli petals with the crisp green aromatic bite of Italian cypress and sea salt.</p><h4>Fragrance Pyramid</h4><ul><li><strong>Top Notes:</strong> Sicilian Lemon, Mandarin, Neroli</li><li><strong>Heart Notes:</strong> Rosemary, Italian Cypress, Clary Sage</li><li><strong>Base Notes:</strong> Driftwood, Sea Salt, White Amber</li></ul><h4>Formulation Science</h4><p>Cold-pressed citrus rind oils blended with organic grain alcohol for ultra-clean diffusion.</p>`,
    short_description: "Sparkling Mediterranean citrus and Italian cypress aromatic extrait.",
    categories: [{ name: "PERFUME" }],
    image_url: "https://images.unsplash.com/photo-1588405748480-12d1d2a59f75?w=800&auto=format&fit=crop&q=80",
    image_filename: "soleil-dor-cypress.jpg",
    status: "publish",
  },
  {
    name: "CÉLESTE BIO-REPAIR BARRIER CREAM",
    slug: "celeste-bio-repair-cream",
    type: "simple",
    regular_price: "6800",
    description: `<p><strong>Intensive 5-Ceramide & Peptide Cellular Cream.</strong></p><p>A rich, restorative cushion cream engineered with biomimetic ceramides and bio-fermented peptides to repair compromised moisture barriers and soothe reactive redness within 24 hours.</p><h4>How to Use</h4><p>Warm a nickel-sized amount between fingertips and press gently onto clean face and neck morning and evening.</p><h4>Key Ingredients</h4><p>5-Ceramide Complex (NP, NS, AS, AP, EOP), Ectoin, Bifida Ferment Lysate, Centella Asiatica, Squalane.</p><h4>Clinical Benefits</h4><ul><li>Increases epidermal moisture retention by +160%</li><li>Calms chronic sensitivity and environmental stress</li><li>Non-comedogenic and hypoallergenic</li></ul>`,
    short_description: "Biomimetic 5-Ceramide cushion cream for cellular barrier recovery.",
    categories: [{ name: "CREAMS" }],
    image_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80",
    image_filename: "celeste-barrier-cream.jpg",
    status: "publish",
  },
  {
    name: "HYDRA VÉLOURS BLUE HYALURONIC GEL",
    slug: "hydra-velours-hyaluronic-gel",
    type: "simple",
    regular_price: "5400",
    description: `<p><strong>Multi-Molecular Weight Hyaluronic Infusion.</strong></p><p>A water-light, fast-absorbing hydro gel formulated with 7 molecular weights of micro-cleaved blue hyaluronic acid and mineral-rich marine algae for 100-hour continuous hydration.</p><h4>How to Use</h4><p>Apply 1–2 pumps onto slightly damp skin immediately after cleansing to bind moisture deep into the dermis.</p><h4>Key Ingredients</h4><p>7x Multi-Molecular Hyaluronic Acid, Marine Algae Extract, Panthenol (Vitamin B5), Polyglutamic Acid.</p><h4>Clinical Benefits</h4><ul><li>Instantly plumps fine dehydration lines</li><li>Delivers glass-skin radiance without stickiness</li><li>Safe for oily, dry, and combination skin profiles</li></ul>`,
    short_description: "Water-light 7-weight hyaluronic hydro gel for 100-hour moisture.",
    categories: [{ name: "CREAMS" }],
    image_url: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format&fit=crop&q=80",
    image_filename: "hydra-velours-gel.jpg",
    status: "publish",
  },
  {
    name: "LUMIÈRE NIACINAMIDE 10% DEW DROPS",
    slug: "lumiere-niacinamide-dew-drops",
    type: "simple",
    regular_price: "4200",
    description: `<p><strong>Brightening & Tone-Correcting Highlighting Serum.</strong></p><p>A multi-functional serum powered by 10% pure Niacinamide and Zinc PCA that visibly evens skin tone, refines enlarged pores, and imparts an instant reflective glass glow.</p><h4>How to Use</h4><p>Apply 2 drops before moisturizer daily, or mix a drop into foundation for a luminous, dewy finish.</p><h4>Key Ingredients</h4><p>10% Niacinamide, 1% Zinc PCA, Watermelon Fruit Extract, Hyaluronic Acid.</p><h4>Clinical Benefits</h4><ul><li>Reduces hyperpigmentation and post-acne dark marks</li><li>Balances sebum production and minimizes pores</li><li>Formulated without mica or artificial glitter</li></ul>`,
    short_description: "Multi-functional 10% Niacinamide brightening and highlighting serum.",
    categories: [{ name: "SERUM" }],
    image_url: "https://images.unsplash.com/photo-1608248597359-0e6d526a67e8?w=800&auto=format&fit=crop&q=80",
    image_filename: "lumiere-niacinamide-drops.jpg",
    status: "publish",
  },
  {
    name: "GINSENG REVITALIZING ACTIVE VI",
    slug: "ginseng-revitalizing-active-vi",
    type: "simple",
    regular_price: "8900",
    description: `<p><strong>Preparatory Anti-Aging Master Ginseng Serum.</strong></p><p>An iconic preparatory elixir utilizing supercritical Korean red ginseng root and fermented lotus flower to awaken skin vitality and amplify the performance of all subsequent skincare.</p><h4>How to Use</h4><p>Immediately after cleansing, rub palms together to warm, then gently press 3 pumps across face and neck.</p><h4>Key Ingredients</h4><p>Panax Ginseng Root Extract, Lotus Flower Ferment, Rehmannia, Peony Root, White Lily.</p><h4>Clinical Benefits</h4><ul><li>Accelerates natural epidermal turnover rate in 3 days</li><li>Restores firm, youthful bounce and elasticity</li><li>Micro-bubble texture absorbs in seconds</li></ul>`,
    short_description: "Korean red ginseng preparatory serum for youthful barrier bounce.",
    categories: [{ name: "SERUM" }],
    image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80",
    image_filename: "ginseng-revitalizing.jpg",
    status: "publish",
  },
  {
    name: "MUCIN ESSENCE REPAIR 96",
    slug: "mucin-essence-repair-96",
    type: "simple",
    regular_price: "3400",
    description: `<p><strong>96.3% Snail Secretion Filtrate Cellular Essence.</strong></p><p>A deeply hydrating preparatory essence containing 96.3% pure Snail Secretion Filtrate to soothe redness, repair damaged barriers, and improve natural elasticity.</p><h4>How to Use</h4><p>After cleansing and toning, tap a small amount evenly across face using fingertips to stimulate absorption.</p><h4>Key Ingredients</h4><p>96.3% Snail Secretion Filtrate, Sodium Hyaluronate, Panthenol, Allantoin, Arginine.</p><h4>Clinical Benefits</h4><ul><li>Soothes post-blemish redness and irritation</li><li>Deep multi-layer epidermal moisture replenishment</li><li>Cruelty-free ethical extraction process</li></ul>`,
    short_description: "96.3% pure snail mucin preparatory essence for deep barrier repair.",
    categories: [{ name: "SERUM" }],
    image_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80",
    image_filename: "mucin-essence-96.jpg",
    status: "publish",
  },
  {
    name: "VELVET ROSE SILK BODY NECTAR",
    slug: "velvet-rose-silk-body-nectar",
    type: "simple",
    regular_price: "4800",
    description: `<p><strong>Nourishing Botanical Body Oil with May Rose.</strong></p><p>A dry-finish botanical body oil infused with Grasse May Rose petals, cold-pressed jojoba, and marula oil. Leaves skin silky, radiant, and subtly scented without greasy residue.</p><h4>How to Use</h4><p>Massage onto clean, slightly damp skin after bathing to seal in moisture and impart subtle golden radiance.</p><h4>Key Ingredients</h4><p>May Rose Extract, Cold-Pressed Jojoba Oil, Marula Oil, Vitamin E, Squalane.</p><h4>Clinical Benefits</h4><ul><li>Instantly transforms dry, rough body skin</li><li>Delivers non-greasy satin sheen</li><li>Subtle therapeutic botanical scent</li></ul>`,
    short_description: "Nourishing dry-finish botanical body oil with Grasse May Rose.",
    categories: [{ name: "BODY CARE" }],
    image_url: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format&fit=crop&q=80",
    image_filename: "velvet-rose-body-nectar.jpg",
    status: "publish",
  },
  {
    name: "SANTAL DÉTOX EXFOLIATING SCRUB",
    slug: "santal-detox-exfoliating-scrub",
    type: "simple",
    regular_price: "3600",
    description: `<p><strong>Australian Sandalwood & Volcanic Ash Body Polish.</strong></p><p>An invigorating body scrub combining micro-fine volcanic ash with soothing Australian sandalwood and jojoba esters to sweep away dead skin cells and refine texture.</p><h4>How to Use</h4><p>Massage in circular motions onto wet skin twice weekly, focusing on elbows, knees, and shoulders, then rinse thoroughly.</p><h4>Key Ingredients</h4><p>Volcanic Ash Micro-Crystals, Australian Sandalwood Oil, Jojoba Esters, Sweet Almond Oil.</p><h4>Clinical Benefits</h4><ul><li>Smoothes keratosis pilaris and rough patches</li><li>Prepares skin for optimal body lotion absorption</li><li>Formulated with biodegradable natural exfoliants</li></ul>`,
    short_description: "Invigorating volcanic ash and Australian sandalwood body polish.",
    categories: [{ name: "BODY CARE" }],
    image_url: "https://images.unsplash.com/photo-1608248597359-0e6d526a67e8?w=800&auto=format&fit=crop&q=80",
    image_filename: "santal-detox-scrub.jpg",
    status: "publish",
  },
  {
    name: "ÉLASTICITÉ CICA RECOVERY MASK",
    slug: "elasticite-cica-recovery-mask",
    type: "simple",
    regular_price: "5200",
    description: `<p><strong>Overnight Centella & Madecassoside Sleep Treatment.</strong></p><p>An intensive overnight recovery mask that wraps compromised skin in a soothing matrix of Centella Asiatica (Cica), Madecassoside, and Shea Butter to repair extreme dryness while you sleep.</p><h4>How to Use</h4><p>Apply a generous layer as the final step of your evening skincare ritual twice weekly or whenever skin feels sensitized.</p><h4>Key Ingredients</h4><p>Centella Asiatica Extract, Madecassoside, Shea Butter, Ceramide NP, Squalane.</p><h4>Clinical Benefits</h4><ul><li>Reduces visible redness and inflammation overnight</li><li>Locks in vital hydration for 48+ hours</li><li>Dermatologist tested for acute barrier fatigue</li></ul>`,
    short_description: "Intensive overnight Centella Cica sleep treatment mask.",
    categories: [{ name: "FACE CARE" }],
    image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80",
    image_filename: "elasticite-cica-mask.jpg",
    status: "publish",
  },
  {
    name: "BIO-SHIELD INVISIBLE SUNSCREEN SPF 50+",
    slug: "bio-shield-invisible-sunscreen",
    type: "simple",
    regular_price: "3900",
    description: `<p><strong>Water-Gel Broad-Spectrum SPF 50+ / PA++++.</strong></p><p>An ultra-lightweight, invisible water-gel sunscreen infused with Jeju Green Tea and Ectoin that defends against UVA/UVB rays and blue light while leaving a dewy, zero-cast glow.</p><h4>How to Use</h4><p>Apply liberally across face, neck, and ears 15 minutes before sun exposure as the final step of your morning ritual.</p><h4>Key Ingredients</h4><p>Advanced UV Filters, Jeju Green Tea Extract, Ectoin, Hyaluronic Acid, Sunflower Seed Oil.</p><h4>Clinical Benefits</h4><ul><li>Zero white cast on all skin phototypes</li><li>Hydrates and cools sun-exposed skin</li><li>Reef-safe, non-comedogenic, and sweat resistant</li></ul>`,
    short_description: "Ultra-lightweight water-gel broad-spectrum SPF 50+ sunscreen.",
    categories: [{ name: "FACE CARE" }],
    image_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80",
    image_filename: "bio-shield-sunscreen.jpg",
    status: "publish",
  },
];

async function seedProducts() {
  console.log(`🔌 Connecting to WooCommerce at: ${WC_URL}`);

  // Step 1: Fetch existing categories or create required categories
  const categoriesMap = {};
  try {
    const catRes = await fetch(`${WC_URL}/wp-json/wc/v3/products/categories?per_page=100`, {
      headers: { Authorization: authHeader },
    });
    if (catRes.ok) {
      const existingCats = await catRes.json();
      existingCats.forEach((c) => {
        categoriesMap[c.name.toUpperCase()] = c.id;
      });
    }
  } catch (err) {
    console.warn("⚠️ Could not fetch existing categories.");
  }

  // Ensure all required categories exist
  const REQUIRED_CATEGORIES = ["PERFUME", "SERUM", "CREAMS", "BODY CARE", "FACE CARE"];
  for (const catName of REQUIRED_CATEGORIES) {
    if (!categoriesMap[catName]) {
      console.log(`   ➕ Creating new category: ${catName}...`);
      try {
        const createCatRes = await fetch(`${WC_URL}/wp-json/wc/v3/products/categories`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify({ name: catName }),
        });
        if (createCatRes.ok) {
          const newCat = await createCatRes.json();
          categoriesMap[catName] = newCat.id;
          console.log(`   ✅ Created category ${catName} (ID: ${newCat.id})`);
        }
      } catch (err) {
        console.warn(`   ⚠️ Failed to create category ${catName}`);
      }
    }
  }

  // Step 2: Fetch existing products
  let existingProducts = [];
  try {
    const res = await fetch(`${WC_URL}/wp-json/wc/v3/products?per_page=100`, {
      headers: { Authorization: authHeader },
    });
    if (res.ok) {
      existingProducts = await res.json();
    }
  } catch (err) {
    console.error("❌ Failed to fetch existing WooCommerce products:", err);
    process.exit(1);
  }

  console.log(`📦 Found ${existingProducts.length} existing products in WooCommerce.`);

  const batchPayload = {
    create: [],
    update: [],
  };

  for (const prod of PRODUCTS_TO_SEED) {
    const match = existingProducts.find(
      (ep) => ep.slug === prod.slug || ep.name.toUpperCase() === prod.name.toUpperCase()
    );

    const mappedCategories = prod.categories.map((c) => {
      if (categoriesMap[c.name.toUpperCase()]) return { id: categoriesMap[c.name.toUpperCase()] };
      return c;
    });

    let mediaAttachments = [];
    if (prod.image_url && prod.image_filename) {
      const mediaId = await uploadOrGetMediaId(prod.image_url, prod.image_filename);
      if (mediaId) {
        mediaAttachments = [{ id: mediaId }];
      }
    }

    const { image_url, image_filename, ...cleanProd } = prod;
    const itemPayload = {
      ...cleanProd,
      categories: mappedCategories,
      ...(mediaAttachments.length > 0 ? { images: mediaAttachments } : {}),
    };

    if (match) {
      batchPayload.update.push({ id: match.id, ...itemPayload });
    } else {
      batchPayload.create.push(itemPayload);
    }
  }

  console.log(`🚀 Sending batch payload: ${batchPayload.create.length} to create, ${batchPayload.update.length} to update...`);

  try {
    const batchRes = await fetch(`${WC_URL}/wp-json/wc/v3/products/batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(batchPayload),
    });

    const batchResult = await batchRes.json();
    console.log("\n✅ WOOCOMMERCE SEED FINISHED!");
    console.log(`✨ Created: ${batchResult.create?.length || 0} products`);
    console.log(`🔄 Updated: ${batchResult.update?.length || 0} products`);

    if (batchResult.create && batchResult.create.length > 0) {
      batchResult.create.forEach((p) => {
        if (p.id) {
          console.log(`   [NEW] #${p.id} • ${p.name} (RS. ${p.regular_price}) | Image ID: ${p.images?.[0]?.id || 'None'}`);
        } else if (p.error) {
          console.error(`   ❌ Failed: ${p.error.message}`);
        }
      });
    }
    if (batchResult.update && batchResult.update.length > 0) {
      batchResult.update.forEach((p) => {
        if (p.id) console.log(`   [UPDATED] #${p.id} • ${p.name} (RS. ${p.regular_price})`);
      });
    }
  } catch (error) {
    console.error("❌ Error running batch seed:", error);
  }
}

seedProducts();
