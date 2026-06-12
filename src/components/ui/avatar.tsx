import Image from "next/image";
import { cn } from "@/lib/utils";

const SIZES = { sm: "h-6 w-6 text-[10px]", md: "h-8 w-8 text-xs", lg: "h-10 w-10 text-sm" };
const PX    = { sm: 24,  md: 32,  lg: 40  };

function initials(name?: string | null) {
  if (!name) return "?";
  return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join("");
}

export function Avatar({ src, name, size = "md", className }: {
  src?: string | null; name?: string | null; size?: "sm" | "md" | "lg"; className?: string;
}) {
  if (src) {
    // Use next/image for Cloudinary URLs; fall back for arbitrary external URLs
    const isCloudinary = src.startsWith("https://res.cloudinary.com");
    if (isCloudinary) {
      return (
        <Image
          src={src}
          alt={name ?? ""}
          width={PX[size]}
          height={PX[size]}
          className={cn("rounded-full object-cover", SIZES[size], className)}
        />
      );
    }
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name ?? ""} className={cn("rounded-full object-cover", SIZES[size], className)} />;
  }
  return (
    <div className={cn("flex items-center justify-center rounded-full bg-[--muted] font-semibold text-foreground", SIZES[size], className)}>
      {initials(name)}
    </div>
  );
}
