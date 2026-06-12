"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Building2, Send, PackageCheck, ShieldCheck } from "lucide-react";
import Image from "next/image";

/* Per-step visual config: glow position + image tint */
const STEP_VISUALS = [
  { hue: 220, glow: "60% 30%",  glowColor: "rgba(91,94,244,0.12)"  }, // indigo - top-right
  { hue: 190, glow: "75% 60%",  glowColor: "rgba(34,211,238,0.10)"  }, // cyan   - mid-right
  { hue: 260, glow: "50% 70%",  glowColor: "rgba(139,92,246,0.11)" }, // violet - bottom-centre
  { hue: 210, glow: "25% 50%",  glowColor: "rgba(59,130,246,0.10)" }, // blue   - left
];

const STEPS = [
  { icon: Building2,   step: "01", title: "Create your organisation",  body: "Register your team or club. A platform admin reviews and approves your request. Once approved, you become the org admin with full control." },
  { icon: Send,        step: "02", title: "Invite your members",        body: "Send email invites to your team. They click the link, set a password, and join as members instantly — no spreadsheets, no manual setup." },
  { icon: PackageCheck,step: "03", title: "Add and manage assets",      body: "Add your inventory: cameras, laptops, projectors, vehicles. Set quantities, conditions, and categories. Everything tracked in one place." },
  { icon: ShieldCheck, step: "04", title: "Members request, you approve", body: "Team members browse and request assets. You approve, issue, and track returns. Every action is logged with a full audit trail." },
];

/* Shared floating image — opacity/hue driven by scroll */
function StepBg({ progress, visual }: {
  progress: ReturnType<typeof useTransform<number, number>>;
  visual: typeof STEP_VISUALS[0];
}) {
  const opacity = useTransform<number, number>(progress, [0, 0.18, 0.82, 1], [0, 0.45, 0.45, 0]);
  const scale   = useTransform<number, number>(progress, [0, 0.18, 0.82, 1], [0.92, 1, 1, 0.96]);

  return (
    <motion.div
      aria-hidden
      style={{ position: "absolute", inset: 0, opacity, scale, pointerEvents: "none" }}
    >
      {/* Radial glow — repositions per step */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 55% 55% at ${visual.glow}, ${visual.glowColor}, transparent 70%)`,
        }}
      />

      {/* Gear image — right side, filtered to match step hue */}
      <div
        className="absolute right-0 top-1/2 hidden -translate-y-1/2 md:block"
        style={{
          maskImage:       "radial-gradient(ellipse 65% 75% at 70% 50%, black 25%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 65% 75% at 70% 50%, black 25%, transparent 80%)",
        }}
      >
        <motion.div
          animate={{ y: [0, -14, 0], rotate: [0, 1, 0, -1, 0] }}
          transition={{ y: { duration: 8, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 14, repeat: Infinity, ease: "easeInOut" } }}
        >
          <Image
            src="/hero-gear.png"
            alt=""
            width={460}
            height={460}
            className="h-[420px] w-[420px] object-contain mix-blend-luminosity"
            style={{ filter: `hue-rotate(${visual.hue}deg) saturate(0.55) brightness(0.85)` }}
          />
        </motion.div>
      </div>

      {/* Dot grid overlay per step */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, var(--fg-subtle) 1px, transparent 1px)",
          backgroundSize:  "36px 36px",
          opacity:         0.15,
          maskImage:       "radial-gradient(ellipse 80% 70% at 70% 50%, black 20%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 70% 50%, black 20%, transparent 80%)",
        }}
      />
    </motion.div>
  );
}

function StepPanel({ icon: Icon, step, title, body }: {
  icon: React.ElementType; step: string; title: string; body: string;
}) {
  return (
    <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16">
      <div className="mx-auto w-full max-w-lg">
        <p className="mb-4 font-mono text-xs tracking-widest text-[--fg-subtle]">{step} / 04</p>
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-[--border] bg-[--bg-subtle]">
          <Icon size={20} className="text-[--primary]" />
        </div>
        <h3 className="text-2xl font-medium leading-snug text-[--fg] md:text-3xl">{title}</h3>
        <p className="mt-4 text-base leading-relaxed text-[--fg-muted]">{body}</p>
        <div className="mt-8 flex gap-1.5">
          {STEPS.map((_, i) => {
            const stepIndex = parseInt(step) - 1;
            return (
              <div
                key={i}
                className="h-0.5 flex-1 rounded-full"
                style={{
                  background: i === stepIndex
                    ? "var(--primary)"
                    : i < stepIndex
                    ? "rgba(91,94,244,0.4)"
                    : "var(--border)",
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StepSlide({
  step,
  visual,
  prog,
}: {
  step: typeof STEPS[0];
  visual: typeof STEP_VISUALS[0];
  prog: ReturnType<typeof useTransform<number, number>>;
}) {
  const opacity = useTransform<number, number>(prog, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);
  const y       = useTransform<number, number>(prog, [0, 0.15, 0.85, 1], [24, 0, 0, -24]);

  return (
    <motion.div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <StepBg progress={prog} visual={visual} />
      <motion.div style={{ position: "absolute", inset: 0, opacity, y }}>
        <StepPanel {...step} icon={step.icon} />
      </motion.div>
    </motion.div>
  );
}

export function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  const step1 = useTransform(scrollYProgress, [0, 0.25],  [0, 1]);
  const step2 = useTransform(scrollYProgress, [0.25, 0.5],[0, 1]);
  const step3 = useTransform(scrollYProgress, [0.5, 0.75],[0, 1]);
  const step4 = useTransform(scrollYProgress, [0.75, 1],  [0, 1]);
  const progValues = [step1, step2, step3, step4];

  return (
    <section id="how-it-works" ref={sectionRef} style={{ height: "500vh" }}>
      <div className="sticky top-0 flex h-screen flex-col bg-[--bg]">

        {/* Header */}
        <div className="shrink-0 border-b border-[--border] bg-[--bg]/90 px-8 py-5 backdrop-blur-sm md:px-16">
          <p className="text-[10px] uppercase tracking-widest text-[--fg-subtle]">How it works</p>
          <p className="mt-1 text-sm text-[--fg-muted]">From signup to full control in minutes.</p>
        </div>

        {/* Layered panels */}
        <div className="relative flex-1 overflow-hidden">
          {STEPS.map((s, i) => (
            <StepSlide
              key={s.step}
              step={s}
              visual={STEP_VISUALS[i]}
              prog={progValues[i]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
