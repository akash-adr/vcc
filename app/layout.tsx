import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Catamaran, Instrument_Serif, Manrope } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { TransitionProvider } from "@/components/layout/PageTransition";
import { Loader } from "@/components/layout/Loader";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Newsletter } from "@/components/sections/Newsletter";
import { Cursor } from "@/components/layout/Cursor";
import { Grain } from "@/components/ui/Grain";
import { StampFilterDefs } from "@/components/ui/Stamp";
import { site } from "@/data/site";
import { SEEN_KEY } from "@/lib/constants";
import { siteUrl } from "@/lib/site-url";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], axes: ["opsz"], variable: "--font-bricolage", display: "swap" });
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const catamaran = Catamaran({ subsets: ["tamil", "latin"], weight: ["600", "700", "800"], variable: "--font-catamaran", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: site.titleSuffix, template: `%s · ${site.titleSuffix}` },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: site.titleSuffix, title: site.titleSuffix, description: site.description, locale: "en_IN" },
  twitter: { card: "summary_large_image", title: site.titleSuffix, description: site.description },
};

export const viewport: Viewport = { themeColor: "#FBFDF7" };

// Runs before paint: marks JS on, and decides whether this session has already seen the loader.
// The loader only plays when a visit lands on the home page; inner pages show straight away.
// Failsafe: if scripts ever fail, the page unlocks itself after 10 s instead of staying overflow:hidden.
const bootScript = `(function(){var d=document.documentElement;d.classList.add('js');if(location.pathname!=='/'){d.dataset.seen='true';return}try{if(sessionStorage.getItem('${SEEN_KEY}')==='1'){d.dataset.seen='true';return}}catch(e){}d.dataset.loading='true';setTimeout(function(){if(d.dataset.loading==='true')d.dataset.loading='false'},10000)})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bricolage.variable} ${instrument.variable} ${manrope.variable} ${catamaran.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only z-[120] rounded-full bg-leaf-900 px-5 py-3 text-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <SmoothScroll>
          <TransitionProvider>
            <Nav />
            <main id="main">{children}</main>
            <Newsletter />
            <Footer />
          </TransitionProvider>
          <Loader />
        </SmoothScroll>
        <Cursor />
        <Grain />
        {/* shared SVG filter for every ink stamp; defined once so hidden (cached) pages can't break it */}
        <StampFilterDefs />
      </body>
    </html>
  );
}
