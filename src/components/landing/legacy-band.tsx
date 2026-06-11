"use client";

import { motion } from "framer-motion";

export function LegacyBand() {
  return (
    <section
      id="about"
      className="relative flex min-h-[55vh] items-center overflow-hidden bg-[#07090d]"
    >
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-linear-to-r from-[#07090d] via-[#07090d]/80 to-transparent" />
        {/* Right side abstract grid/lines */}
        <div className="absolute right-0 top-0 h-full w-1/2 opacity-20">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px w-full bg-linear-to-r from-transparent via-cyan-400/60 to-transparent"
              style={{ top: `${12 + i * 12}%` }}
            />
          ))}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute top-0 h-full w-px bg-linear-to-b from-transparent via-sky-400/40 to-transparent"
              style={{ left: `${10 + i * 16}%` }}
            />
          ))}
        </div>
        {/* Glow */}
        <div className="absolute right-[20%] top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[80px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 md:px-10">
        <div className="max-w-xl">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-4 text-xs uppercase tracking-[0.3em] text-cyan-400/70"
          >
            Why AssetSphere
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-semibold leading-tight text-white md:text-5xl"
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
            className="mt-6 text-base leading-relaxed text-white/50"
          >
            From single-site teams to global enterprises, AssetSphere adapts to
            your scale. Every workflow, every approval, every audit trail is
            designed to give you control -- without the complexity.
          </motion.p>

          {/* Pillars */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-10 grid grid-cols-2 gap-6"
          >
            {[
              { num: "10+", desc: "Years of domain expertise" },
              { num: "5M+", desc: "Asset transactions processed" },
              { num: "99.9%", desc: "Platform uptime SLA" },
              { num: "SOC 2", desc: "Type II certified" },
            ].map((item) => (
              <div key={item.desc} className="flex flex-col gap-1">
                <span className="text-2xl font-semibold text-white">
                  {item.num}
                </span>
                <span className="text-xs text-white/40">{item.desc}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
