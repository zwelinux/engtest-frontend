// src/app/layout.js
import "./globals.css";
import Providers from "./providers";
import { LangProvider } from "./lang-context";
import LangSwitcher from "./LangSwitcher";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Waaneiza English Test",
  description: "Official Waaneiza English Placement Test",
  openGraph: {
    title: "Waaneiza English Test",
    description: "Official Waaneiza English Placement Test",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </head>

      <body className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white text-gray-900 antialiased">

        <LangProvider>
          {/* NAVBAR */}
          <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b border-gray-100">
            <nav className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/waaneizalogo.png"
                  alt="Waaneiza Logo"
                  width={50}
                  height={50}
                  className="rounded-sm"
                />
                <span className="font-semibold tracking-tight">
                  Waaneiza • <span className="text-gray-600">ENG</span>
                </span>
              </Link>

              {/* Language Switcher */}
              {/* <LangSwitcher /> */}
            </nav>
          </header>

          {/* MAIN */}
          <main className="flex-1 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
            <Providers>{children}</Providers>
          </main>
        </LangProvider>

        {/* FOOTER */}
        <footer className="border-t border-gray-100 mt-auto">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 text-xs text-gray-500">
            © {new Date().getFullYear()} Waaneiza. Made With Passion
          </div>
        </footer>

      </body>
    </html>
  );
}
