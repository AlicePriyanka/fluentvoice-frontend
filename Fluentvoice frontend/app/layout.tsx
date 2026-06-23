import type { Metadata, Viewport } from "next";
import { Inter, Libre_Baskerville } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SwRegister } from "@/components/sw-register";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

// Libre Baskerville: same warm serif authority as DM Serif Display,
// but ships 400 + 700 — so font-bold/font-black headings actually render bold.
const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-display",
  display: "swap",
});

const basePath = process.env.NODE_ENV === "production" ? "/fluentvoice" : "";

export const metadata: Metadata = {
  title: "FluentVoice — AI Fluency Analysis",
  description:
    "AI-powered stuttering and fluency analysis for patients and speech therapists.",
  manifest: `${basePath}/manifest.json`,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FluentVoice",
  },
  icons: {
    icon: [
      { url: `${basePath}/favicon.ico`, sizes: "32x32" },
      { url: `${basePath}/icons/icon-192.png`, sizes: "192x192", type: "image/png" },
      { url: `${basePath}/icons/icon-512.png`, sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: `${basePath}/icons/apple-touch-icon.png`, sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#1B2B4B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${libreBaskerville.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
          (function() {
            var originalFetch = window.fetch;
            window.fetch = function(input, init) {
              if (typeof input === 'string' && input.startsWith('/api/')) {
                var hostname = window.location.hostname;
                var isLocal = hostname === 'localhost' || 
                              hostname === '127.0.0.1' || 
                              hostname.startsWith('127.') || 
                              hostname.startsWith('192.168.') || 
                              hostname.startsWith('10.') || 
                              hostname.endsWith('.local');
                var backendUrl = isLocal ? 'http://localhost:5001' : '${process.env.NEXT_PUBLIC_BACKEND_URL || "https://fluentvoice-backend-1.onrender.com"}';
                input = backendUrl + input;
                if (!init) init = {};
                init.credentials = 'include';
              }
              return originalFetch(input, init);
            };
          })();
        ` }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-right" />
        <SwRegister />
      </body>
    </html>
  );
}
