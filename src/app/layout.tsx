import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AppProvider } from "@core/providers/app-provider"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: "App Name",
  description: "Professional App Name with multi-language support",
  keywords: ["app name", "next template", "administration", "system"],
  authors: [{ name: "App Name Team" }],
  creator: "App Name",
  publisher: "App Name",
  icons: {
    icon: [
      { url: "/app-logo.png", sizes: "32x32", type: "image/png" },
      { url: "/app-logo.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/app-logo.png",
    apple: "/app-logo.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "App Name",
    description: "Professional App Name with multi-language support",
    url: "https://app-name.com",
    siteName: "App Name",
    images: [
      {
        url: "/app-logo.png",
        width: 512,
        height: 512,
        alt: "App Name Logo",
      },
    ],
    locale: "ar_SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "App Name",
    description: "Professional App Name with multi-language support",
    images: ["/app-logo.png"],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  )
}
