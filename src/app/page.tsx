// src/app/page.tsx
import { fetchProducts, fetchCategories } from "@/lib/woocommerce";
import HomePageClient from "@/components/HomePageClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let products = [];
  let categories = [];
  let heroSlides = [];

  try {
    // 1. Fetch Products & Categories
    const [fetchedProducts, fetchedCategories] = await Promise.all([
      fetchProducts({ page: 1, perPage: 100 }),
      fetchCategories()
    ]);
    products = fetchedProducts || [];
    categories = fetchedCategories || [];

    // 2. Fetch Dynamic Hero Slides
    const wpUrl = process.env.NEXT_PUBLIC_API_URL || "https://globe-trading-dev-api.cloudgenz.com"; 
    
    console.log("Fetching slides from:", wpUrl);

    // Pehle try karte hain 'hero_slide'
    let slidesRes = await fetch(`${wpUrl}/wp-json/wp/v2/hero_slide?_embed&per_page=5`, { cache: 'no-store' });
    
    // Agar route nahi mila, toh plural 'hero_slides' try karte hain (WordPress kabhi-kabhi 's' laga deta hai)
    if (!slidesRes.ok) {
      console.log("hero_slide failed, trying hero_slides...");
      slidesRes = await fetch(`${wpUrl}/wp-json/wp/v2/hero_slides?_embed&per_page=5`, { cache: 'no-store' });
    }
    
    console.log("WP API Status:", slidesRes.status);

    if (slidesRes.ok) {
      const slidesData = await slidesRes.json();
      console.log("Total Slides Found in WP:", slidesData.length);
      
      heroSlides = slidesData.map((slide: any) => ({
        id: slide.id,
        title: slide.title?.rendered || "",
        subtitle: slide.acf?.subtitle || slide.acf?.Subtitle || "",
        buttonText: slide.acf?.button_text || slide.acf?.['Button Text'] || "Shop Now",
        link: slide.acf?.button_link || slide.acf?.['Button Link'] || "/shop",
        image: slide._embedded?.['wp:featuredmedia']?.[0]?.source_url || "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600&q=80",
        align: "items-center text-center"
      }));
    } else {
      console.error("WordPress API Error:", await slidesRes.text());
    }
  } catch (error) {
    console.error("Critical Error fetching homepage data:", error);
  }

  return (
    <HomePageClient 
      initialProducts={products} 
      initialCategories={categories} 
      initialHeroSlides={heroSlides}
    />
  );
}