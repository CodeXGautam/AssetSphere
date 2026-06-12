"use client";

import { motion } from "framer-motion";
import { QrCode, BarChart3, ShieldCheck, ClipboardList, Bell, Layers } from "lucide-react";

const FEATURES = [
  {
    icon: Layers,
    title: "Inventory Intelligence",
    description: "Live availability, condition scoring, and asset health tracking across every location and site.",
    iconBg: "bg-sky-500/10",
    iconColor: "text-sky-600",
  },
  {
    icon: ClipboardList,
    title: "Approval Workflows",
    description: "Route asset requests through multi-step approvals with clear accountability at every stage.",
    iconBg: "bg-[--primary]/10",
    iconColor: "text-[--primary]",
  },
  {
    icon: QrCode,
    title: "QR-Driven Operations",
    description: "Instantly issue, return, and reconcile assets through QR scans — no manual entry needed.",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-600",
  },
  {
    icon: ShieldCheck,
    title: "Audit-Ready Logs",
    description: "Every critical event is immutably logged and fully searchable for compliance and legal teams.",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600",
  },
  {
    icon: BarChart3,
    title: "Predictive Analytics",
    description: "Spot upcoming shortages with utilization trends, booking forecasts, and demand signals.",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Proactive alerts for overdue returns, low availability, and approval bottlenecks.",
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-600",
  },
];

export function FeatureShowcase() {
  return (
    <section id="features" className="bg-[--bg-subtle] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        {/* Section header */}
        <div className="mb-16 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-3 text-xs uppercase tracking-[0.3em] text-[--primary]"
            >
              Platform capabilities
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="max-w-lg text-4xl font-semibold leading-tight text-[--fg] md:text-5xl"
            >
              Everything your team needs in one place.
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-xs text-sm text-[--fg-muted] md:text-right"
          >
            Automated allocation, real-time visibility, and predictive analytics in a single, security-first platform.
          </motion.p>
        </div>

        {/* Feature grid */}
        <div className="grid gap-px bg-[--border] md:grid-cols-3">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="group relative overflow-hidden bg-[--bg-subtle] p-8 transition-colors hover:bg-[--surface]"
              >
                <div className={`mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[--border] ${feature.iconBg} ${feature.iconColor}`}>
                  <Icon size={18} />
                </div>
                <h3 className="mb-2 text-base font-semibold text-[--fg]">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-[--fg-muted]">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
