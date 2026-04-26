/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts}",
  ],
  theme: {
    extend: {
      colors: {
        cream:     "#F7F5F0",
        charcoal:  "#1A1914",
        gold:      "#B8935A",
        teal:      "#3D6B65",
        linen:     "#EDE9E1",
        stone:     "#8A7A6A",
        warmWhite: "#FDFCFA",
        pool:      "#162635",  // deep ocean blue-black — Swimming Pool card

        // Kept for reference / Phase 2 tokens
        "gold-light":  "#D4B483",
        "gold-dark":   "#8A6A36",
        "teal-light":  "#5A9189",
        "teal-dark":   "#2A4D49",
        "stone-light": "#B0A49A",
        "stone-dark":  "#5A4E46",
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        sans:    ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "10xl": ["10rem",  { lineHeight: "1" }],
        "12xl": ["12rem",  { lineHeight: "1" }],
        "15xl": ["15rem",  { lineHeight: "1" }],
      },
      letterSpacing: {
        editorial: "0.25em",
        ticker:    "0.3em",
        wide2:     "0.15em",
      },
      transitionTimingFunction: {
        luxury: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      },
      transitionDuration: {
        400: "400ms",
        600: "600ms",
        800: "800ms",
      },
    },
  },
  plugins: [],
};
