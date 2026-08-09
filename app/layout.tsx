import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AuthProvider } from "@/lib/auth/auth-context";
import { CartProvider } from "@/lib/cart/cart-context";
import { WishlistProvider } from "@/lib/wishlist/wishlist-context";
import { FamilyProvider } from "@/lib/family/family-context";
import { ProfileProvider } from "@/lib/profile/profile-context";
import { AddressProvider } from "@/lib/addresses/address-context";
import { OrderProvider } from "@/lib/orders/order-context";
import { NotificationProvider } from "@/lib/notifications/notification-context";
import { StyleProvider } from "@/lib/style/style-context";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

// Elegant Serif (headings) + Modern Sans (body) per Brand Book §14.
const heading = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700"],
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "OMV — Every Outfit. Every Occasion. Every Family.",
    template: "%s | OMV",
  },
  description:
    "Overcomers Multipurpose Ventures — premium, curated family fashion with a boutique shopping experience.",
  icons: {
    icon: "/brand/favicon.png", // App_Icon.png, per approved branding decision
    apple: "/brand/app-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevents a flash of the wrong theme before hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('omv-theme');
                document.documentElement.setAttribute('data-theme', t === 'light' ? 'light' : 'dark');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${heading.variable} ${body.variable} font-sans`}>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ThemeProvider>
          <AuthProvider>
            <ProfileProvider>
              <AddressProvider>
                <OrderProvider>
                  <NotificationProvider>
                    <StyleProvider>
                      <FamilyProvider>
                        <WishlistProvider>
                          <CartProvider>
                            <Navbar />
                            <main id="main-content">{children}</main>
                            <Footer />
                          </CartProvider>
                        </WishlistProvider>
                      </FamilyProvider>
                    </StyleProvider>
                  </NotificationProvider>
                </OrderProvider>
              </AddressProvider>
            </ProfileProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
