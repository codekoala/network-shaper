/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./view/**/*.templ"],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#65a30d",
          "secondary": "#3b82f6",
          "accent": "#facc15",
          "neutral": "#e5e7eb",
          "base-100": "#f3f4f6",
          "info": "#fde68a",
          "success": "#93c5fd",
          "warning": "#f97316",
          "error": "#dc2626",
        },
      },
    ],
  },
  plugins: [
    // require("daisyui"),
  ],
};
