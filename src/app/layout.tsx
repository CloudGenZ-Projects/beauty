import type { Metadata } from "next";
import "./globals.css";
import SmoothScrolling from "@/components/layout/SmoothScrolling";
import Navbar from "@/components/layout/Navbar";
import { CartProvider } from "@/context/CartContext";
// 1. Import the new WishlistProvider
import { WishlistProvider } from "@/context/WishlistContext"; 
import Link from "next/link";

// Import the social icons from react-icons
import { FaFacebookF, FaInstagram, FaWhatsapp, FaYoutube } from "react-icons/fa";

export const metadata: Metadata = {
  title: "GLOBE TRADING",
  description: "Your ultimate destination for premium beauty products and cosmetics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
   <html lang="en" suppressHydrationWarning>
      <body className="bg-white text-[#333] antialiased" suppressHydrationWarning>
        <SmoothScrolling>
          <CartProvider>
            {/* 2. Wrap the app with WishlistProvider inside CartProvider */}
            <WishlistProvider>
              
              {/* Top Announcement Bar */}
              <div className="bg-[#cc4b37] text-white text-xs sm:text-sm py-2 px-4 text-center overflow-hidden whitespace-nowrap">
                 Enjoy Free Shipping + Express Delivery on all orders above ₹4999 ★ Enjoy Free Shipping + Express Delivery on all orders above ₹4999
              </div>

              <Navbar />
              
              <main className="min-h-screen">{children}</main>

              {/* GLOBE TRADING  Footer */}
              <footer className="bg-white pt-16 pb-8 border-t border-gray-200 mt-20">
                <div className="max-w-7xl mx-auto px-6 flex flex-col items-center space-y-8">
                  
                  {/* Logo Area */}
                  <Link href="/" className="flex flex-col items-center justify-center text-center group">
                     <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-[0.2em] uppercase leading-none group-hover:text-[#d81b60] transition-colors">
                        GLOBE TRADING
                     </h2>
                     <span className="text-xs text-gray-500 tracking-[0.3em] uppercase mt-2 font-medium">
                        
                     </span>
                  </Link>

                  {/* Links */}
                  <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 font-medium">
                    <Link href="#" className="hover:text-[#d81b60] transition-colors">Delivery & Return Policy</Link>
                    <Link href="#" className="hover:text-[#d81b60] transition-colors">Terms and Conditions</Link>
                    <Link href="#" className="hover:text-[#d81b60] transition-colors">Privacy Policy</Link>
                    <Link href="#" className="hover:text-[#d81b60] transition-colors">About Us</Link>
                  </div>
                </div>

                {/* Bottom Strip */}
                <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-4">
                  <div className="w-32">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" className="w-full h-auto cursor-pointer hover:opacity-80 transition-opacity" />
                  </div>
                  
                  <div className="text-xs text-gray-500 text-center">
                    © 2024 <span className="text-[#8e24aa] font-bold tracking-widest uppercase">GLOBE TRADING </span>. All Rights Reserved.
                  </div>

                  {/* Social Icons */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 mr-2 font-medium uppercase tracking-widest">Follow us:</span>
                    
                    <a href="#" className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center transition-transform hover:scale-110 shadow-sm hover:shadow-md">
                      <FaFacebookF size={14} />
                    </a>
                    
                    <a href="#" className="w-8 h-8 rounded-full bg-[#E4405F] text-white flex items-center justify-center transition-transform hover:scale-110 shadow-sm hover:shadow-md">
                      <FaInstagram size={16} />
                    </a>
                    
                    <a href="#" className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center transition-transform hover:scale-110 shadow-sm hover:shadow-md">
                      <FaWhatsapp size={16} />
                    </a>
                    
                    <a href="#" className="w-8 h-8 rounded-full bg-[#FF0000] text-white flex items-center justify-center transition-transform hover:scale-110 shadow-sm hover:shadow-md">
                      <FaYoutube size={16} />
                    </a>
                  </div>
                </div>
              </footer>

            </WishlistProvider>
          </CartProvider>
        </SmoothScrolling>
      </body>
    </html>
  );
}