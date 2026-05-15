/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          0: "#FFFFFF",
          50: "#F4F4F8",
          400: "#9CA3AF",
          500: "#71717A",
          600: "#52525B",
          700: "#3F3F46",
          800: "#27272A",
          900: "#18181B",
          950: "#0A0A0F",
        },
        // Brand
        electric: {
          DEFAULT: "#00D9FF",
          400: "#33E1FF",
          500: "#00D9FF",
          600: "#00AECC",
        },
        neon: {
          DEFAULT: "#00FF94",
          400: "#33FFAA",
          500: "#00FF94",
          600: "#00CC76",
        },
        hot: {
          DEFAULT: "#FF3D71",
          500: "#FF3D71",
          600: "#E62D5F",
        },
        graphite: {
          DEFAULT: "#0A0A0F",
          900: "#0A0A0F",
          800: "#14141C",
          700: "#1C1C28",
          600: "#262633",
          500: "#3A3A4A",
        },
      },
      fontFamily: {
        sans: [
          "InterVariable",
          "Inter",
          "SF Pro Display",
          "-apple-system",
          "BlinkMacSystemFont",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        display: [
          "InterVariable",
          "Inter",
          "SF Pro Display",
          "-apple-system",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        glow: "0 0 24px rgba(0, 217, 255, 0.35)",
        "glow-neon": "0 0 24px rgba(0, 255, 148, 0.4)",
        "glow-hot": "0 0 24px rgba(255, 61, 113, 0.4)",
        "glow-soft": "0 0 60px rgba(0, 217, 255, 0.15)",
        card: "0 8px 32px rgba(0, 0, 0, 0.5)",
      },
      backgroundImage: {
        "gradient-radial":
          "radial-gradient(circle at 50% 0%, var(--tw-gradient-stops))",
        "gradient-cosmic":
          "linear-gradient(135deg, #0A0A0F 0%, #14141C 40%, #0A0A0F 100%)",
        "gradient-electric":
          "linear-gradient(135deg, #00D9FF 0%, #0066FF 100%)",
        "gradient-neon":
          "linear-gradient(135deg, #00FF94 0%, #00D9FF 100%)",
        "gradient-hot":
          "linear-gradient(135deg, #FF3D71 0%, #FF8A00 100%)",
        "gradient-tier-legend":
          "linear-gradient(135deg, #FF3D71 0%, #FF8A00 50%, #FFD300 100%)",
        "gradient-tier-elite":
          "linear-gradient(135deg, #00D9FF 0%, #6F00FF 100%)",
        "gradient-tier-pro":
          "linear-gradient(135deg, #FFD300 0%, #FF8A00 100%)",
        "gradient-tier-freestyle":
          "linear-gradient(135deg, #00FF94 0%, #00D9FF 100%)",
        "gradient-tier-street":
          "linear-gradient(135deg, #6F8DFF 0%, #00D9FF 100%)",
        "gradient-tier-beginner":
          "linear-gradient(135deg, #71717A 0%, #3F3F46 100%)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "pop-heart": {
          "0%": { transform: "scale(1)" },
          "30%": { transform: "scale(1.35)" },
          "60%": { transform: "scale(0.92)" },
          "100%": { transform: "scale(1)" },
        },
        "burst-heart": {
          "0%": { opacity: "0.95", transform: "translate(-50%, -50%) scale(0.4)" },
          "40%": { opacity: "1", transform: "translate(-50%, -50%) scale(1.1)" },
          "100%": { opacity: "0", transform: "translate(-50%, -50%) scale(1.8)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out forwards",
        "fade-up": "fade-up 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
        "scale-in": "scale-in 0.25s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
        "pop-heart": "pop-heart 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)",
        "burst-heart": "burst-heart 0.7s ease-out forwards",
        shimmer: "shimmer 1.6s linear infinite",
        "spin-slow": "spin-slow 14s linear infinite",
        "pulse-soft": "pulse-soft 2.2s ease-in-out infinite",
        "slide-up": "slide-up 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
