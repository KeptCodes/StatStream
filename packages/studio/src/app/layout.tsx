import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/providers/theme-provider";
import "./globals.css";
import QueryProvider from "@/providers/query";
import StudioAuthBanner from "@/components/studio-auth-banner";
import Modals from "@/providers/modals";
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://statstream.pages.dev"),
  title: "Studio - StatStream",
  description: "Studio to access analytics data captured by StatStream.",
  openGraph: {
    images: ["/statstream-banner.png"],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <StudioAuthBanner />
            {children}
            <Modals />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
