import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "DevFlow - Developer Collaboration Platform",
  description: "Real-time collaboration suite for developer teams",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-archivo">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

