import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class", "[data-theme='dark']"],
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        border: "var(--border)",
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
      },
      borderRadius: {
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 4px)",
      },
    },
  },
  plugins: [animate],
};

export default config;
