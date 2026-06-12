"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Layers, ClipboardList, QrCode, BarChart2, Bell, ShieldCheck } from "lucide-react";
import Image from "next/image";

/* Per-feature visual: glow position + hue tint on image */
const FEATURE_VISUALS = [
  { hue: 220, glow: "75% 25%",  glowColor: "rgba(91,94,244,0.12)"  }, // inventory - top-right
  { hue: 190, glow: "80% 55%",  glowColor: "rgba(34,211,238,0.10)" }, // requests  - mid-right
  { hue: 160, glow: "65% 75%",  glowColor: "rgba(16,185,129,0.09)" }, // QR        - bottom-right
  { hue: 30,  glow: "50% 40%",  glowColor: "rgba(245,158,11,0.08)" }, // analytics - centre
  { hue: 250, glow: "25% 35%",  glowColor: "rgba(139,92,246,0.10)" }, // notifs    - left
  { hue: 200, glow: "40% 65%",  glowColor: "rgba(59,130,246,0.09)" }, // audit     - bottom-left
];

const FEATURES = [
  { icon: Layers,       num: "01", title: "Org-level inventory",       body: "Every asset your organisation owns lives in one place. Track quantity, condition, and real-time availability across your entire team.",      detail: "Add assets with images, set categories and conditions. Available quantity updates automatically as bookings are created and returned." },
  { icon: ClipboardList,num: "02", title: "Request and approval flow",  body: "Members submit booking requests with dates and purpose. Admins approve, issue, and record returns — all within the platform.",             detail: "No emails, no DMs. A clean queue of pending requests with one-click approve, reject, issue, and return actions." },
  { icon: QrCode,       num: "03", title: "QR-based issue and return",  body: "Generate a QR code for any asset. Scan it during handover to instantly issue or return — no manual entry, no mistakes.",                    detail: "Each asset gets a unique QR code. Admins scan on mobile to pre-fill the issuance form in seconds." },
  { icon: BarChart2,    num: "04", title: "Analytics and utilisation",  body: "See booking trends, category breakdowns, and overdue returns. Make data-driven decisions about your inventory.",                             detail: "Monthly utilisation charts, status distribution, and category analytics all available from the admin dashboard." },
  { icon: Bell,         num: "05", title: "Smart notifications",        body: "Members are notified when requests are approved, rejected, or due for return. Admins are alerted when items go overdue.",                   detail: "In-app notifications with email delivery via SendGrid. Mark individual or all notifications as read." },
  { icon: ShieldCheck,  num: "06", title: "Audit trail",                body: "Every action — create, issue, return, approve — is logged immutably. Full accountability for every asset in your inventory.",                detail: "Paginated audit log accessible to admins. Each entry records the actor, action, entity, and timestamp with millisecond precision." },
];

function FeatureBg({ progress, visual }: {
  progress: ReturnType<typeof useTransform<number, number>>;
  visual: typeof FEATURE_VISUALS[0];
}) {
  const opacity = useTransform<number, number>(progress, [0, 0.15, 0.85, 1], [0, 0.5, 0.5, 0]);
  const scale   = useTransform<number, number>(progress, [0, 0.15, 0.85, 1], [0.94, 1, 1, 0.97]);

  return (
    <motion.div
      aria-hidden
      style={{ position: "absolute", inset: 0, opacity, scale, pointerEvents: "none" }}
    >
      {/* Radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 50% 60% at ${visual.glow}, ${visual.glowColor}, transparent 75%)`,
        }}
      />

      {/* Gear image */}
      <div
        className="absolute right-0 top-1/2 hidden -translate-y-1/2 md:block"
        style={{
          maskImage:       "radial-gradient(ellipse 60% 70% at 68% 50%, black 20%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 70% at 68% 50%, black 20%, transparent 80%)",
        }}
      >
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [0, 1.2, 0, -1.2, 0] }}
          transition={{
            y:      { duration: 9,  repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 15, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <Image
            src="/hero-gear.png"
            alt=""
            width={400}
            height={400}
            className="h-[380px] w-[380px] object-contain mix-blend-luminosity"
            style={{ filter: `hue-rotate(${visual.hue}deg) saturate(0.5) brightness(0.8)` }}
          />
        </motion.div>
      </div>

      {/* Dot grid overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, var(--fg-subtle) 1px, transparent 1px)",
          backgroundSize:  "38px 38px",
          opacity:         0.12,
          maskImage:       "radial-gradient(ellipse 75% 65% at 72% 50%, black 15%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 75% 65% at 72% 50%, black 15%, transparent 75%)",
        }}
      />
    </motion.div>
  );
}

function FeaturePanel({ icon: Icon, num, title, body, detail }: {
  icon: React.ElementType; num: string; title: string; body: string; detail: string;
}) {
  return (
    <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16">
      <div className="mx-auto grid w-full max-w-5xl gap-12 md:grid-cols-2 md:items-center">
        {/* Left text */}
        <div>
          <p className="mb-4 font-mono text-xs tracking-widest text-[--fg-subtle]">{num} / 06</p>
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-[--border] bg-[--bg-subtle]">
            <Icon size={18} className="text-[--primary]" />
          </div>
          <h3 className="text-2xl font-medium leading-snug text-[--fg] md:text-3xl">{title}</h3>
          <p className="mt-4 text-base leading-relaxed text-[--fg-muted]">{body}</p>
        </div>

        {/* Right detail card */}
        <div className="rounded-2xl border border-[--border] bg-[--bg-subtle]/80 p-6 backdrop-blur-sm">
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-xl bg-[--surface]">
            <Icon size={14} className="text-[--primary]" />
          </div>
          <p className="text-sm leading-relaxed text-[--fg-muted]">{detail}</p>
          <div className="mt-5 flex gap-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full"
                style={{
                  background: i === parseInt(num) - 1
                    ? "var(--primary)"
                    : i < parseInt(num) - 1
                    ? "rgba(91,94,244,0.35)"
                    : "var(--border)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureSlide({
  feature,
  visual,
  scrollYProgress,
  range,
}: {
  feature: typeof FEATURES[0];
  visual: typeof FEATURE_VISUALS[0];
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
  range: [number, number];
}) {
  const [start, end] = range;
  const progress = useTransform<number, number>(scrollYProgress, [start, end], [0, 1]);
  const opacity  = useTransform<number, number>(progress, [0, 0.12, 0.88, 1], [0, 1, 1, 0]);
  const y        = useTransform<number, number>(progress, [0, 0.12, 0.88, 1], [28, 0, 0, -28]);

  return (
    <motion.div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <FeatureBg progress={progress} visual={visual} />
      <motion.div style={{ position: "absolute", inset: 0, opacity, y }}>
        <FeaturePanel {...feature} icon={feature.icon} />
      </motion.div>
    </motion.div>
  );
}

export function Features() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  const ranges = FEATURES.map((_, i) => [i / 6, (i + 1) / 6] as [number, number]);

  return (
    <section id="features" ref={sectionRef} style={{ height: "700vh" }} className="border-t border-[--border]">
      <div className="sticky top-0 flex h-screen flex-col bg-[--bg-subtle]">

        {/* Header bar */}
        <div className="shrink-0 border-b border-[--border] bg-[--bg-subtle]/90 px-8 py-5 backdrop-blur-sm md:px-16">
          <p className="text-[10px] uppercase tracking-widest text-[--fg-subtle]">Capabilities</p>
          <p className="mt-1 text-sm text-[--fg-muted]">Everything you need to run a tight operation.</p>
        </div>

        {/* Feature panels */}
        <div className="relative flex-1 overflow-hidden">
          {FEATURES.map((f, i) => (
            <FeatureSlide
              key={f.num}
              feature={f}
              visual={FEATURE_VISUALS[i]}
              scrollYProgress={scrollYProgress}
              range={ranges[i]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
