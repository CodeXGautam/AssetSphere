"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // Text parallax on scroll
  const textY    = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const textFade = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  // Image parallax — moves at a different rate for depth
  const imgY    = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const imgFade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-5 pt-20 pb-20 text-center md:px-8"
    >
      {/* ── Dot-grid background ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, var(--fg-subtle) 1px, transparent 1px)",
          backgroundSize:  "34px 34px",
          opacity:         0.22,
          maskImage:       "radial-gradient(ellipse 85% 70% at 50% 45%, black 35%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 85% 70% at 50% 45%, black 35%, transparent 100%)",
        }}
      />

      {/* ── Soft indigo glow top-centre ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/4 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(91,94,244,0.10) 0%, transparent 65%)" }}
      />

      {/* ── Animated background image ── */}
      <motion.div
        aria-hidden
        style={{ y: imgY, opacity: imgFade }}
        className="pointer-events-none absolute right-0 top-1/2 hidden -translate-y-1/2 md:block"
      >
        {/* Slow float loop */}
        <motion.div
          animate={{
            y:      [0, -18, 0],
            rotate: [0, 1.5, 0, -1.5, 0],
          }}
          transition={{
            y:      { duration: 7,  repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 12, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          {/* Fade mask so image blends into background */}
          <div
            style={{
              maskImage:       "radial-gradient(ellipse 70% 80% at 65% 50%, black 30%, transparent 85%)",
              WebkitMaskImage: "radial-gradient(ellipse 70% 80% at 65% 50%, black 30%, transparent 85%)",
            }}
          >
            <Image
              src="/hero-gear.png"
              alt="Asset management illustration"
              width={600}
              height={600}
              priority
              className="h-[520px] w-[520px] object-contain opacity-60 mix-blend-luminosity"
              style={{ filter: "hue-rotate(200deg) saturate(0.6) brightness(0.9)" }}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* ── Mobile image (smaller, centred behind text) ── */}
      <motion.div
        aria-hidden
        style={{ opacity: imgFade }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center md:hidden"
      >
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="/hero-gear.png"
            alt=""
            width={340}
            height={340}
            className="h-[340px] w-[340px] object-contain opacity-15 mix-blend-luminosity"
            style={{ filter: "hue-rotate(200deg) saturate(0.5) brightness(0.8)" }}
          />
        </motion.div>
      </motion.div>

      {/* ── Hero text ── */}
      <motion.div
        style={{ y: textY, opacity: textFade }}
        className="relative z-10 w-full max-w-2xl"
      >
        <FadeUp delay={0}>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[--border] bg-[--bg-subtle] px-3.5 py-1.5 text-xs text-[--fg-muted]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[--primary]" />
            Asset management built for modern teams
          </div>
        </FadeUp>

        <FadeUp delay={0.08}>
          <h1 className="text-4xl font-medium leading-[1.15] tracking-tight text-[--fg] md:text-[3.5rem]">
            Your organisation&apos;s assets,
            <br />
            <span className="text-[--primary]">all in one place.</span>
          </h1>
        </FadeUp>

        <FadeUp delay={0.16}>
          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-[--fg-muted]">
            AssetSphere lets your team request, track, and return shared equipment
            without the back-and-forth. Admins stay in control, members stay productive.
          </p>
        </FadeUp>

        <FadeUp delay={0.24}>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/onboard"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[--primary] px-6 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Create your organisation
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-11 items-center rounded-xl border border-[--border] bg-[--surface] px-5 text-sm font-medium text-[--fg] transition-colors hover:bg-[--muted]"
            >
              Sign in
            </Link>
          </div>

          <p className="mt-4 text-xs text-[--fg-subtle]">
            Already invited?{" "}
            <Link href="/register" className="text-[--fg-muted] underline underline-offset-2 hover:text-[--fg]">
              Create a personal account
            </Link>
          </p>
        </FadeUp>

        <FadeUp delay={0.42}>
          <motion.div
            className="mt-12 flex flex-col items-center gap-1"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-[10px] uppercase tracking-widest text-[--fg-subtle]">scroll</span>
            <div className="h-6 w-px bg-linear-to-b from-[--fg-subtle] to-transparent" />
          </motion.div>
        </FadeUp>
      </motion.div>
    </section>
  );
}
