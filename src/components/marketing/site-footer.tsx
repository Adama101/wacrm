import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { brand } from "@/lib/brand";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#050b14]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-3">
          <Logo size={28} />
          <p className="text-sm leading-relaxed text-slate-400">
            {brand.description}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
          <div className="space-y-2">
            <p className="font-medium text-white">Product</p>
            <a href="/#product" className="block text-slate-400 hover:text-white">
              Platform
            </a>
            <a href="/#agents" className="block text-slate-400 hover:text-white">
              AI Agents
            </a>
            <Link href="/pricing" className="block text-slate-400 hover:text-white">
              Pricing
            </Link>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-white">Company</p>
            <Link href="/signup" className="block text-slate-400 hover:text-white">
              Start free
            </Link>
            <Link href="/login" className="block text-slate-400 hover:text-white">
              Sign in
            </Link>
            <a
              href={`mailto:${brand.supportEmail}`}
              className="block text-slate-400 hover:text-white"
            >
              Contact
            </a>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-white">Legal</p>
            <span className="block text-slate-500">Privacy (soon)</span>
            <span className="block text-slate-500">Terms (soon)</span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {brand.legalName}. All rights reserved.
      </div>
    </footer>
  );
}
