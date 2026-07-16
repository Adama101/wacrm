import type { Metadata } from "next";
import type { ReactNode } from "react";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: {
    default: `${brand.name} — ${brand.tagline}`,
    template: `%s — ${brand.name}`,
  },
  description: brand.description,
  robots: {
    index: true,
    follow: true,
  },
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return children;
}
