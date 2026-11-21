import type { Metadata } from "next";
import "./globals.css";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

const spaceGroteskHeading = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Sqrock Academy — Learn skills that get you hired",
    template: "%s · Sqrock Academy",
  },
  description:
    "Industry-focused courses in development, data, AI, game development, cloud and business. Learn from working professionals, earn certificates and find jobs.",
  icons: {
    icon: "/logo-dark.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn(
        "font-sans",
        ibmPlexSans.variable,
        spaceGroteskHeading.variable,
      )}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground antialiased">
        {children}
        <Toaster
          position="top-center"
          theme="light"
          toastOptions={{
            style: { fontSize: "13px" },
          }}
        />
      </body>
    </html>
  );
}
