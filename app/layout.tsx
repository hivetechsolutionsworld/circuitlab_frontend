import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CircuitLab 3D — Interactive Circuit Designer & Simulator",
  description: "Browser-based 3D electronic circuit design and simulation environment.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground min-h-screen overflow-hidden antialiased">
        {children}
      </body>
    </html>
  );
}
