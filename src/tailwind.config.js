/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
        accent: "hsl(var(--accent))",
        muted: "hsl(var(--muted))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        card: "hsl(var(--card))",
        /* Tokens officiels (valeurs exactes mobile via CSS vars) */
        paipers: {
          navy: "var(--paipers-navy)",
          primary: "var(--paipers-primary)",
          secondary: "var(--paipers-secondary)",
          accent: "var(--paipers-accent)",
          muted: "var(--paipers-muted)",
          border: "var(--paipers-border)",
          card: "var(--paipers-card)",
          foreground: "var(--paipers-foreground)",
          success: "var(--paipers-success)",
          error: "var(--paipers-error)",
          warning: "var(--paipers-warning)",
          "gradient-start": "var(--paipers-gradient-start)",
          "gradient-middle": "var(--paipers-gradient-middle)",
          "gradient-end": "var(--paipers-gradient-end)",
          "soft-start": "var(--paipers-gradient-soft-start)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "paipers-card": "var(--paipers-radius-card)",
        "paipers-button": "var(--paipers-radius-button)",
        "paipers-input": "var(--paipers-radius-input)",
      },
      boxShadow: {
        "paipers-card": "var(--paipers-shadow-card)",
        "paipers-button": "var(--paipers-shadow-button)",
      },
      spacing: {
        "paipers-screen": "var(--paipers-space-screen)",
        "paipers-card": "var(--paipers-space-card)",
        "paipers-grid": "var(--paipers-space-grid)",
      },
      fontSize: {
        "paipers-title": [
          "var(--paipers-title-size)",
          { lineHeight: "1.2", fontWeight: "800" },
        ],
      },
    },
  },
};
