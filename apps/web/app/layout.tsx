import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { PwaInstallBanner } from "@/components/shared/pwa-install-banner";
import { ServiceWorkerRegister } from "@/components/shared/service-worker-register";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const APP_NAME = "CONSTRUCTA";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: "CONSTRUCTA — Gestión de construcción",
    template: "%s — CONSTRUCTA",
  },
  description:
    "Plataforma SaaS de gestión integral para constructores guatemaltecos.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-GT">
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <ServiceWorkerRegister />
        {children}
        <PwaInstallBanner />
      </body>
    </html>
  );
}
