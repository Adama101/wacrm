import Link from "next/link";
import { Check } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { buttonVariants } from "@/components/ui/button";
import { brand, pricingPlans } from "@/lib/brand";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Pricing",
  description: `Simple plans for teams running WhatsApp on ${brand.name}.`,
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#07111f] text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-teal-500/15 blur-[110px]" />
      </div>
      <SiteHeader />
      <main className="relative mx-auto max-w-6xl px-4 pt-28 pb-24 sm:px-6">
        <p className="text-sm font-medium tracking-wide text-teal-300/90 uppercase">
          Pricing
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-white sm:text-6xl">
          Plans that scale with every shift.
        </h1>
        <p className="mt-4 max-w-xl text-slate-400">
          14-day trial on Growth. No seat surprises on Starter and Growth —
          Scale includes fair-use unlimited seating for multi-site teams.
        </p>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "flex flex-col rounded-2xl border p-6",
                plan.highlighted
                  ? "border-teal-400/40 bg-teal-500/10 shadow-lg shadow-teal-950/40"
                  : "border-white/10 bg-white/[0.03]",
              )}
            >
              {plan.highlighted ? (
                <span className="mb-3 w-fit rounded-full bg-teal-400/20 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-teal-200 uppercase">
                  Most popular
                </span>
              ) : (
                <span className="mb-3 h-5" />
              )}
              <h2 className="text-xl font-semibold text-white">{plan.name}</h2>
              <p className="mt-2 text-sm text-slate-400">{plan.description}</p>
              <p className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl text-white">
                  ${plan.price}
                </span>
                <span className="text-sm text-slate-500">/{plan.cadence}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-slate-300"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.id === "scale" ? "mailto:hello@meridian.ops" : "/signup"}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "mt-8 h-11 w-full",
                  plan.highlighted
                    ? "bg-teal-400 text-slate-950 hover:bg-teal-300"
                    : "bg-white/10 text-white hover:bg-white/15",
                )}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-slate-500">
          *Scale unlimited seats under fair-use for a single company workspace.
          Need multi-org? Contact sales.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
