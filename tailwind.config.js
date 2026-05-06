/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem", screens: { "2xl": "1280px" } },
    extend: {
      fontFamily: {
        display: ["'Fraunces'", "Georgia", "serif"],
        sans: ["'Plus Jakarta Sans'", "ui-sans-serif", "system-ui"],
      },
      // HIG-derived type scale. Existing Tailwind size classes are
      // overridden so legacy `text-sm` / `text-base` usages line up with
      // the baseline (no per-component churn required).
      fontSize: {
        // Tailwind defaults — re-pinned to HIG.
        xs:   ["12px", { lineHeight: "16px" }],          // caption (absolute floor)
        sm:   ["14px", { lineHeight: "20px" }],          // dense rows / table cells
        base: ["16px", { lineHeight: "24px" }],          // body
        lg:   ["17px", { lineHeight: "24px" }],          // headline
        xl:   ["20px", { lineHeight: "26px" }],          // title 3
        "2xl":["22px", { lineHeight: "28px" }],          // title 2
        "3xl":["28px", { lineHeight: "34px", letterSpacing: "-0.01em" }], // title 1
        "4xl":["34px", { lineHeight: "41px", letterSpacing: "-0.02em" }], // large title
        "5xl":["48px", { lineHeight: "1.05",  letterSpacing: "-0.025em" }],
        "6xl":["64px", { lineHeight: "1.02",  letterSpacing: "-0.03em" }],
        "7xl":["80px", { lineHeight: "1.0",   letterSpacing: "-0.03em" }],
        // Named HIG tokens.
        caption:     ["12px", { lineHeight: "16px" }],
        footnote:    ["13px", { lineHeight: "18px" }],
        subheadline: ["15px", { lineHeight: "20px" }],
        body:        ["16px", { lineHeight: "24px" }],
        headline:    ["17px", { lineHeight: "22px", fontWeight: "600" }],
        title3:      ["20px", { lineHeight: "26px" }],
        title2:      ["22px", { lineHeight: "28px" }],
        title1:      ["28px", { lineHeight: "34px", letterSpacing: "-0.01em" }],
        largeTitle:  ["34px", { lineHeight: "41px", letterSpacing: "-0.02em" }],
        display:     ["64px", { lineHeight: "1.02", letterSpacing: "-0.03em" }],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      borderRadius: {
        lg: "1.5rem",
        md: "1.125rem",
        sm: "0.75rem",
      },
      keyframes: {
        "fade-in": { from: { opacity: 0 }, to: { opacity: 1 } },
        "slide-up": {
          from: { opacity: 0, transform: "translateY(8px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 240ms ease-out",
        "slide-up": "slide-up 280ms cubic-bezier(.2,.8,.2,1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
