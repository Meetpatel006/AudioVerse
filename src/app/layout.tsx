import "~/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { AuthProvider } from "~/contexts/AuthContext";
import { getToken } from "~/lib/auth-server";

export const metadata: Metadata = {
  title: "AudioVerse",
  description: "AudioVerse",
  icons: [{ rel: "icon", url: "/logo.png" }],
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const token = await getToken();

  return (
    <html lang="en" className={`light ${inter.className}`}>
      <body>
        <ConvexClientProvider initialToken={token}>
          <AuthProvider>
            <Toaster />
            {children}
          </AuthProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
