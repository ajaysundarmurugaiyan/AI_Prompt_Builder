import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header, MainContainer } from "@/components/layout";
import { Providers } from "@/components/providers/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem('theme') || 'system';
    var dark;
    if (t === 'light') dark = false;
    else if (t === 'dark') dark = true;
    else dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {}
})();`;

export const metadata: Metadata = {
  title: "AI Prompt Builder System",
  description: "Turn your idea into structured AI prompts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="flex min-h-full flex-col bg-background font-sans text-foreground transition-colors duration-200"
      >
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        <Providers>
          <Header />
          <MainContainer>{children}</MainContainer>
        </Providers>
      </body>
    </html>
  );
}
