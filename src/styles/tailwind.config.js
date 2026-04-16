/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            "code::before": { opacity: 0.2 },
            "code::after": { opacity: 0.2 },
          },
        },
      },
    },
  },
}