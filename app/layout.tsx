import type { Metadata } from "next";
import "./globals.css";
import { WardrobeProvider } from "@/context/WardrobeContext";

export const metadata: Metadata = {
  title: "Clothes App",
  description: "Save clothes and build outfits locally"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <WardrobeProvider>{children}</WardrobeProvider>
      </body>
    </html>
  );
}
