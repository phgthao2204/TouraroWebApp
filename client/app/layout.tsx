/*
 * This file is part of TouraroWebApp.
 * Licensed under the GPL-3.0-only License.
 * Copyright (c) 2025 CTU-TouraroInsightCrew
 */

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

import type { Metadata } from "next";
import { Poppins, Volkhov } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import { AuthProvider } from "@/components/auth/auth-provider"; // 👈 THÊM

const volkhov = Volkhov({
  variable: "--font-volkhov",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: [
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
  ],
});

export const metadata: Metadata = {
  title: "Touraro — Khám phá Cần Thơ",
  description: "Khám phá Cần Thơ, kết nối hướng dẫn viên và quản lý hành trình trong một nền tảng.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={`${volkhov.variable} ${poppins.variable} antialiased font-poppins`}>
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
