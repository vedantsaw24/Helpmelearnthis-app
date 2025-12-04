import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
    title: "helpmelearnthis",
    description:
        "A customized testing webapp with adaptive difficulty and gamified elements.",
    icons: {
        icon: [
            {
                url: "/favicon.png",
                sizes: "any",
            },
        ],
        apple: [
            {
                url: "/favicon.png",
                sizes: "any",
            },
        ],
        shortcut: "/favicon.png",
    },
    manifest: "/site.webmanifest",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                ></link>
            </head>
            <body className="font-body antialiased">
                <AuthProvider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                    >
                        <div className="flex min-h-screen w-full flex-col">
                            <Header />
                            <main className="flex-1">{children}</main>
                        </div>
                        <Toaster />
                    </ThemeProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
