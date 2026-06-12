"use client";

import { motion } from "framer-motion";

const PILLARS = [
  { num: "10+",   desc: "Years of domain expertise"      },
  { num: "5M+",   desc: "Asset transactions processed"   },
  { num: "99.9%", desc: "Platform uptime SLA"            },
  { num: "SOC 2", desc: "Type II certified"              },
];

export function LegacyBand() {
  return (
    <section
      id="about"
      className="relative flex min-h-[55vh] items-center overflow-hidden border-t border-[--border] bg-[--bg-subtle]"
    >
      {/* Decorative glow — neutral so it works in both themes */}
      <div className="pointer-events-none absolute right-[15%] top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-[--primary]/8 blur-[80px]" />

      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle, var(--fg) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 md:px-10">
        <div className="max-w-xl">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-4 text-xs uppercase tracking-[0.3em] text-[--primary]"
          >
            Why AssetSphere
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-semibold leading-tight text-[--fg] md:text-5xl"
          >
            Built for
            <br />
            serious operations.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-base leading-relaxed text-[--fg-muted]"
          >
            From single-site teams to global enterprises, AssetSphere adapts to
            your scale. Every workflow, every approval, every audit trail is
            designed to give you control — without the complexity.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-10 grid grid-cols-2 gap-6"
          >
            {PILLARS.map((item) => (
              <div key={item.desc} className="flex flex-col gap-1">
                <span className="text-2xl font-semibold text-[--fg]">{item.num}</span>
                <span className="text-xs text-[--fg-muted]">{item.desc}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
