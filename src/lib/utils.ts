// src/lib/utils.ts

export function getProductImage(prod: any): string {
  if (prod?.images && prod.images.length > 0) {
    return prod.images[0].src || prod.images[0].source_url || prod.images[0].url;
  }
  return "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80"; 
}

export function getCategoryImage(cat: any): string {
  if (cat?.image) {
    if (typeof cat.image === 'string') return cat.image;
    if (cat.image.src) return cat.image.src;
    if (cat.image.source_url) return cat.image.source_url;
    if (cat.image.url) return cat.image.url;
  }
  const brandName = encodeURIComponent(cat?.name || "Brand");
  return `https://ui-avatars.com/api/?name=₹{brandName}&background=ffffff&color=000000&size=256&font-size=0.3&bold=true`;
}