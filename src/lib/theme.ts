/**
 * Theme helpers — stored in localStorage, applied via data-theme on <html>.
 * Works with SSR: we apply it in a blocking script in layout.tsx.
 */

export type Theme = "dark" | "light";

export function getTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem("theme") as Theme | null;
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function setTheme(theme: Theme) {
  localStorage.setItem("theme", theme);
  document.documentElement.setAttribute("data-theme", theme);
}

/** Inline script string to inject into <head> to avoid flash */
export const themeScript = `
  (function() {
    try {
      var t = localStorage.getItem('theme');
      if (t !== 'dark' && t !== 'light') {
        t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', t);
    } catch(e) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  })();
`;
