"use client";

import { motion } from "framer-motion";
import {
  QrCode,
  BarChart3,
  ShieldCheck,
  ClipboardList,
  Bell,
  Layers,
} from "lucide-react";

const FEATURES = [
  {
    icon: Layers,
    title: "Inventory Intelligence",
    description:
      "Live availability, condition scoring, and asset health tracking across every location and site.",
    accent: "from-cyan-400/20 to-sky-400/5",
    iconColor: "text-cyan-400",
  },
  {
    icon: ClipboardList,
    title: "Approval Workflows",
    description:
      "Route asset requests through multi-step approvals with clear accountability at every stage.",
    accent: "from-sky-400/20 to-indigo-400/5",
    iconColor: "text-sky-400",
  },
  {
    icon: QrCode,
    title: "QR-Driven Operations",
    description:
      "Instantly issue, return, and reconcile assets through QR scans -- no manual entry needed.",
    accent: "from-indigo-400/20 to-violet-400/5",
    iconColor: "text-indigo-400",
  },
  {
    icon: ShieldCheck,
    title: "Audit-Ready Logs",
    description:
      "Every critical event is immutably logged and fully searchable for compliance and legal teams.",
    accent: "from-violet-400/20 to-purple-400/5",
    iconColor: "text-violet-400",
  },
  {
    icon: BarChart3,
    title: "Predictive Analytics",
    description:
      "Spot upcoming shortages with utilization trends, booking forecasts, and demand signals.",
    accent: "from-cyan-400/20 to-sky-400/5",
    iconColor: "text-cyan-400",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "Proactive alerts for overdue returns, low availability, and approval bottlenecks.",
    accent: "from-sky-400/20 to-indigo-400/5",
    iconColor: "text-sky-400",
  },
];

export function FeatureShowcase() {
  return (
    <section id="features" className="bg-[#0a0d12] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        {/* Section header */}
        <div className="mb-16 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-3 text-xs uppercase tracking-[0.3em] text-cyan-400/70"
            >
              Platform capabilities
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="max-w-lg text-4xl font-semibold leading-tight text-white md:text-5xl"
            >
              Everything your team needs in one place.
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-xs text-sm text-white/40 md:text-right"
          >
            Automated allocation, real-time visibility, and predictive analytics
            in a single, security-first platform.
          </motion.p>
        </div>

        {/* Feature grid */}
        <div className="grid gap-px bg-white/5 md:grid-cols-3">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="group relative overflow-hidden bg-[#0a0d12] p-8 transition-colors hover:bg-[#0d1117]"
              >
                {/* Hover glow */}
                <div
                  className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-linear-to-br ${feature.accent} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`}
                />
                <div
                  className={`mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 ${feature.iconColor}`}
                >
                  <Icon size={18} />
                </div>
                <h3 className="mb-2 text-base font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/45">
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
