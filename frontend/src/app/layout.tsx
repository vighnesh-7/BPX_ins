import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Insurance Claims Processing",
  description: "Manage and process insurance claims efficiently",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50">
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
