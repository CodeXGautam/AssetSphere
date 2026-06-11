"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TIERS = [
  {
    name: "Launch",
    price: "$299",
    period: "/month",
    description: "Essential asset tracking for growing teams.",
    highlights: [
      "Up to 5 locations",
      "500 assets",
      "Role-based approvals",
      "QR issue & return",
      "Core analytics",
      "Email support",
    ],
    featured: false,
  },
  {
    name: "Scale",
    price: "$799",
    period: "/month",
    description: "Enterprise workflows with full audit and automation.",
    highlights: [
      "Unlimited locations",
      "Unlimited assets",
      "Advanced audit logs",
      "Predictive analytics",
      "API access",
      "Priority support",
    ],
    featured: true,
  },
  {
    name: "Command",
    price: "Custom",
    period: "",
    description: "Tailored governance and integrations for global teams.",
    highlights: [
      "Custom SLAs",
      "Dedicated success manager",
      "Bespoke integrations",
      "SSO / SAML",
      "On-premise option",
      "24/7 support",
    ],
    featured: false,
  },
];

export function PricingSection() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
      {/* Header */}
      <div className="mb-14 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-3 text-xs uppercase tracking-[0.3em] text-cyan-400/70"
        >
          Pricing
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl font-semibold text-white md:text-5xl"
        >
          Simple, transparent pricing.
        </motion.h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {TIERS.map((tier, i) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={cn(
              "relative flex flex-col rounded-2xl border p-8",
              tier.featured
                ? "border-cyan-500/40 bg-linear-to-b from-cyan-500/10 to-[#07090d] shadow-[0_0_60px_rgba(34,211,238,0.15)]"
                : "border-white/10 bg-[#0d1117]"
            )}
          >
            {tier.featured && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-cyan-400 px-4 py-1 text-xs font-medium text-[#07090d]">
                  Most popular
                </span>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-semibold text-white">
                  {tier.price}
                </span>
                {tier.period && (
                  <span className="text-sm text-white/40">{tier.period}</span>
                )}
              </div>
              <p className="mt-2 text-sm text-white/45">{tier.description}</p>
            </div>

            <ul className="mb-8 flex-1 space-y-3">
              {tier.highlights.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm">
                  <Check
                    size={14}
                    className={
                      tier.featured ? "text-cyan-400" : "text-white/40"
                    }
                  />
                  <span className="text-white/60">{item}</span>
                </li>
              ))}
            </ul>

            <Button
              variant={tier.featured ? "default" : "outline"}
              className={cn(
                "w-full rounded-full",
                tier.featured
                  ? "bg-cyan-400 text-[#07090d] hover:bg-cyan-300"
                  : "border-white/20 text-white hover:bg-white/10"
              )}
            >
              {tier.price === "Custom" ? "Talk to sales" : "Get started"}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
