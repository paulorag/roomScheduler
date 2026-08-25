import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "RoomScheduler — Gestão Inteligente de Espaços",
    description: "Sistema corporativo para gestão e agendamento de salas de reunião sem conflitos.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} bg-slate-50 text-slate-800 antialiased min-h-screen`}
            >
                <Navbar />
                {children}
            </body>
        </html>
    );
}
