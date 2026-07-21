// ============================================================
// WooCommerce REST Client (Server-Side Only)
// All requests are routed through Next.js server actions or /api routes.
// ============================================================

const WC_URL = process.env.WC_URL;
const CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

export interface WooCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
  image?: {
    id: number;
    src: string;
    alt: string;
  } | null;
}

export interface WooProductImage {
  id: number;
  src: string;
  alt: string;
}

export interface WooProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  type: string;
  status: string;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  featured: boolean;
  stock_status: string;
  images: WooProductImage[];
  categories: WooCategory[];
  average_rating: string;
  rating_count: number;
}

// ─── In-Memory TTL Cache ─────────────────────────────────────
interface CacheEntry<T> {
  data: T;
  ts: number;
}
const cache = new Map<string, CacheEntry<any>>();

function getCached<T>(key: string, ttlMs: number): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < ttlMs) return entry.data as T;
  return null;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, ts: Date.now() });
}

// ─── Core Fetcher ────────────────────────────────────────────
async function wooFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (!WC_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
    throw new Error("Missing WooCommerce API credentials in .env.local");
  }

  const url = `${WC_URL}/wp-json/wc/v3${endpoint}`;
  const authHeader = `Basic ${Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64")}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: authHeader,
      ...options.headers,
    },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`WooCommerce API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

// ─── Products API ────────────────────────────────────────────
export interface FetchProductsParams {
  page?: number;
  perPage?: number;
  category?: string;
  search?: string;
  orderby?: string;
  order?: "asc" | "desc";
  onSale?: boolean;
  featured?: boolean;
  minPrice?: string;
  maxPrice?: string;
}

export async function fetchProducts({
  page = 1,
  perPage = 16,
  category = "",
  search = "",
  orderby = "date",
  order = "desc",
  onSale = false,
  featured = false,
  minPrice = "",
  maxPrice = "",
}: FetchProductsParams = {}): Promise<WooProduct[]> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    status: "publish",
    order,
  });

  if (orderby && orderby !== "relevance") params.set("orderby", orderby);
  if (category) params.set("category", category);
  if (search) params.set("search", search);
  if (onSale) params.set("on_sale", "true");
  if (featured) params.set("featured", "true");
  if (minPrice) params.set("min_price", minPrice);
  if (maxPrice) params.set("max_price", maxPrice);

  const cacheKey = `products:${params.toString()}`;
  if (!search) {
    const cached = getCached<WooProduct[]>(cacheKey, 3 * 60 * 1000);
    if (cached) return cached;
  }

  const data = await wooFetch<WooProduct[]>(`/products?${params}`);
  if (!search) setCache(cacheKey, data);
  return data;
}

export async function fetchProduct(idOrSlug: string | number): Promise<WooProduct | null> {
  if (!idOrSlug) return null;
  const isId = !isNaN(Number(idOrSlug));
  
  if (isId) {
    const cacheKey = `product:id:${idOrSlug}`;
    const cached = getCached<WooProduct>(cacheKey, 5 * 60 * 1000);
    if (cached) return cached;

    const data = await wooFetch<WooProduct>(`/products/${idOrSlug}`);
    setCache(cacheKey, data);
    return data;
  } else {
    const cacheKey = `product:slug:${idOrSlug}`;
    const cached = getCached<WooProduct>(cacheKey, 5 * 60 * 1000);
    if (cached) return cached;

    const results = await wooFetch<WooProduct[]>(`/products?slug=${idOrSlug}&status=publish`);
    if (results.length > 0) {
      setCache(cacheKey, results[0]);
      return results[0];
    }
    return null;
  }
}

export async function fetchRelatedProducts(categoryId: number, excludeId: number): Promise<WooProduct[]> {
  if (!categoryId) return [];
  const products = await wooFetch<WooProduct[]>(`/products?category=${categoryId}&per_page=6&status=publish`);
  return products.filter((p) => p.id !== excludeId).slice(0, 4);
}

export async function searchProducts(query: string): Promise<WooProduct[]> {
  if (!query || query.trim().length < 2) return [];
  const params = new URLSearchParams({
    search: query.trim(),
    per_page: "8",
    status: "publish",
  });
  return wooFetch<WooProduct[]>(`/products?${params}`);
}

// ─── Categories API ──────────────────────────────────────────
export async function fetchCategories(): Promise<WooCategory[]> {
  const cacheKey = "categories:all";
  const cached = getCached<WooCategory[]>(cacheKey, 10 * 60 * 1000);
  if (cached) return cached;

  const data = await wooFetch<WooCategory[]>("/products/categories?per_page=100&hide_empty=true");
  setCache(cacheKey, data);
  return data;
}
