"use client";

import { motion } from "framer-motion";

const ORBS = [
  { size: 90, top: "10%", left: "8%", delay: 0 },
  { size: 140, top: "55%", left: "12%", delay: 0.3 },
  { size: 120, top: "20%", left: "75%", delay: 0.6 },
  { size: 80, top: "65%", left: "70%", delay: 0.9 },
];

export function FloatingOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {ORBS.map((orb) => (
        <motion.div
          key={`${orb.left}-${orb.top}`}
          className="absolute rounded-full bg-gradient-to-br from-cyan-300/30 via-sky-400/20 to-indigo-400/20 blur-xl"
          style={{
            width: orb.size,
            height: orb.size,
            top: orb.top,
            left: orb.left,
          }}
          animate={{ y: [0, -18, 0] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            delay: orb.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
