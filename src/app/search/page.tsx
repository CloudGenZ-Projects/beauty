import React from "react";
import SearchClient from "./SearchClient";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const query = (params?.q as string) || "";

  let results: any[] = [];

  // Fetch directly from WooCommerce on the Server Side for maximum speed & security
  if (query) {
    try {
      const wpUrl = (process.env.WC_URL || "").replace(/\/₹/, "");
      const consumerKey = process.env.WC_CONSUMER_KEY || "";
      const consumerSecret = process.env.WC_CONSUMER_SECRET || "";

      const authHeader = 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
      
      const res = await fetch(
        `${wpUrl}/wp-json/wc/v3/products?search=${encodeURIComponent(query)}&status=publish&per_page=50`, 
        {
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          },
          cache: 'no-store' // Do not cache search results
        }
      );
      
      if (res.ok) {
        results = await res.json();
      }
    } catch (error) {
      console.error("Failed to fetch search results from WooCommerce:", error);
    }
  }

  return <SearchClient initialQuery={query} initialResults={results} />;
}