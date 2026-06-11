"use client";

import { motion } from "framer-motion";

const STATS = [
  { value: "28.4k+", label: "Assets under management" },
  { value: "93%", label: "Average utilization rate" },
  { value: "42 min", label: "Median approval time" },
  { value: "300+", label: "Enterprise clients" },
  { value: "1,280", label: "Audits processed monthly" },
];

export function TrustStrip() {
  return (
    <section
      id="analytics"
      className="border-y border-white/6 bg-[#0a0d12]"
    >
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex flex-col gap-1"
            >
              <span className="text-3xl font-semibold text-white md:text-4xl">
                {stat.value}
              </span>
              <span className="text-xs uppercase tracking-wider text-white/40">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
