"use client";

import * as React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const SIZE = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

export function Dialog({
  open, onClose, title, description, children, className, size = "md",
}: DialogProps) {
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        // Outer container — centers the panel
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          {/* Backdrop — fully opaque enough to block page content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/75 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              // Solid background — no transparency
              "relative z-10 flex w-full flex-col rounded-xl border border-[--border]",
              "bg-[#0f0f12] shadow-[0_24px_80px_rgba(0,0,0,0.6)]",
              // Max height so tall content scrolls inside the dialog
              "max-h-[calc(100vh-2rem)] overflow-hidden",
              SIZE[size],
              className
            )}
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            {(title || description) && (
              <div className="flex shrink-0 items-start justify-between border-b border-[--border] px-5 py-4">
                <div>
                  {title && (
                    <h2 className="text-sm font-semibold text-foreground">{title}</h2>
                  )}
                  {description && (
                    <p className="mt-0.5 text-xs text-[--muted-fg]">{description}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="ml-4 rounded-md p-1 text-[--muted-fg] transition-colors hover:bg-[--muted] hover:text-foreground"
                  aria-label="Close"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* No-header close button */}
            {!title && !description && (
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-md p-1 text-[--muted-fg] transition-colors hover:bg-[--muted] hover:text-foreground"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            )}

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-5">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
