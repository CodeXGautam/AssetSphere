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
          className="mb-3 text-xs uppercase tracking-[0.3em] text-[--primary]"
        >
          Pricing
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl font-semibold text-[--fg] md:text-5xl"
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
                ? "border-[--primary]/40 bg-[--primary]/5 shadow-[0_0_60px_rgba(91,94,244,0.12)]"
                : "border-[--border] bg-[--bg-subtle]"
            )}
          >
            {tier.featured && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-[--primary] px-4 py-1 text-xs font-medium text-white">
                  Most popular
                </span>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[--fg]">{tier.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-semibold text-[--fg]">
                  {tier.price}
                </span>
                {tier.period && (
                  <span className="text-sm text-[--fg-muted]">{tier.period}</span>
                )}
              </div>
              <p className="mt-2 text-sm text-[--fg-muted]">{tier.description}</p>
            </div>

            <ul className="mb-8 flex-1 space-y-3">
              {tier.highlights.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm">
                  <Check
                    size={14}
                    className={tier.featured ? "text-[--primary]" : "text-[--fg-muted]"}
                  />
                  <span className="text-[--fg-muted]">{item}</span>
                </li>
              ))}
            </ul>

            <Button
              variant={tier.featured ? "default" : "outline"}
              className="w-full rounded-full"
            >
              {tier.price === "Custom" ? "Talk to sales" : "Get started"}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
