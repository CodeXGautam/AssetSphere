"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { ArrowRight, GraduationCap, Briefcase, Users } from "lucide-react";

const WHO = [
  {
    icon:  GraduationCap,
    title: "Campus clubs and societies",
    body:  "Manage cameras, projectors, and equipment shared between dozens of members across different projects and events.",
  },
  {
    icon:  Briefcase,
    title: "Small and mid-size teams",
    body:  "Keep track of company devices, tools, and resources across departments without the overhead of a full ITSM system.",
  },
  {
    icon:  Users,
    title: "Community organisations",
    body:  "Coordinate shared resources across volunteers and coordinators. Know who has what and when it is coming back.",
  },
];

function WhoCard({ w, index }: { w: typeof WHO[0]; index: number }) {
  const Icon   = w.icon;
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-4 rounded-xl border border-[--border] p-5"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[--surface]">
        <Icon size={16} className="text-[--fg-muted]" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-[--fg]">{w.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-[--fg-muted]">{w.body}</p>
      </div>
    </motion.div>
  );
}

export function ForWho() {
  const titleRef = useRef<HTMLDivElement>(null);
  const inView   = useInView(titleRef, { once: true, margin: "-80px" });

  return (
    <section id="about" className="mx-auto max-w-6xl px-5 py-24 md:px-8">
      <motion.div
        ref={titleRef}
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="mb-14 max-w-lg"
      >
        <p className="mb-3 text-xs uppercase tracking-widest text-[--fg-subtle]">Who it is for</p>
        <h2 className="text-2xl font-medium leading-snug text-[--fg] md:text-3xl">
          Built for any team that shares resources.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[--fg-muted]">
          Whether you have 5 members or 500, AssetSphere scales with your needs.
        </p>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-3">
        {WHO.map((w, i) => (
          <WhoCard key={w.title} w={w} index={i} />
        ))}
      </div>

      {/* Bottom CTA strip */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-16 flex flex-col items-center gap-4 rounded-2xl border border-[--border] bg-[--bg-subtle] px-6 py-10 text-center"
      >
        <h2 className="text-xl font-medium text-[--fg] md:text-2xl">
          Ready to bring order to your inventory?
        </h2>
        <p className="max-w-sm text-sm text-[--fg-muted]">
          Set up your organisation in minutes. Free to use.
        </p>
        <Link
          href="/onboard"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-[--primary] px-6 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Get started
          <ArrowRight size={14} />
        </Link>
      </motion.div>
    </section>
  );
}
