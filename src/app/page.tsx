import { fetchProducts, fetchCategories } from "@/lib/woocommerce";
import HomePageClient from "@/components/HomePageClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let products: any[] = [];
  let categories: any[] = [];
  let heroSlides: any[] = [];
  let circularDeals: any[] = [];

  const wpUrl = process.env.NEXT_PUBLIC_API_URL || "https://globe-trading-dev-api.cloudgenz.com"; 

  try {
    // 1. Fetch Products & Categories
    const [fetchedProducts, fetchedCategories] = await Promise.all([
      fetchProducts({ page: 1, perPage: 100 }),
      fetchCategories()
    ]);
    products = fetchedProducts || [];
    categories = fetchedCategories || [];

    // 2. Fetch Dynamic Hero Slides
    try {
      let slidesRes = await fetch(`${wpUrl}/wp-json/wp/v2/hero_slide?_embed&per_page=10`, { cache: 'no-store' });
      
      if (!slidesRes.ok) {
        slidesRes = await fetch(`${wpUrl}/wp-json/wp/v2/hero_slides?_embed&per_page=10`, { cache: 'no-store' });
      }

      if (slidesRes.ok) {
        const slidesData = await slidesRes.json();
        heroSlides = slidesData.map((slide: any) => ({
          id: slide.id,
          title: slide.title?.rendered || "",
          subtitle: slide.acf?.subtitle || slide.acf?.Subtitle || "",
          buttonText: slide.acf?.button_text || slide.acf?.['Button Text'] || "Shop Now",
          link: slide.acf?.button_link || slide.acf?.['Button Link'] || "/shop",
          image: slide._embedded?.['wp:featuredmedia']?.[0]?.source_url || slide.acf?.image || "",
          align: "items-center text-center"
        }));
      }
    } catch (slideErr) {
      console.error("Error fetching hero slides:", slideErr);
    }

    // 3. Fetch Circular Deals (EXACT WORDPRESS ENDPOINT)
    try {
      const dealsRes = await fetch(`${wpUrl}/wp-json/wp/v2/circular-deal?per_page=20`, { cache: 'no-store' });
      
      if (dealsRes.ok) {
        circularDeals = await dealsRes.json();
        console.log("Total Circular Deals Found:", circularDeals.length);
      } else {
        console.error("Circular Deals Fetch Failed with status:", dealsRes.status);
      }
    } catch (dealErr) {
      console.error("Error fetching circular deals:", dealErr);
    }

  } catch (error) {
    console.error("Critical Error fetching homepage data:", error);
  }

  return (
    <HomePageClient 
      initialProducts={products} 
      initialCategories={categories} 
      initialHeroSlides={heroSlides}
      initialCircularDeals={circularDeals}
    />
  );
}