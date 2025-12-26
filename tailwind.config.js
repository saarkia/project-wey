/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        brand: {
          primary: 'var(--brand-primary)',
          accent: 'var(--brand-accent)',
        },
        surface: {
          base: 'var(--surface-base)',
          card: 'var(--surface-card)',
          muted: 'var(--surface-muted)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          inverse: 'var(--text-inverse)',
        },
        border: {
          subtle: 'var(--border-subtle)',
          strong: 'var(--border-strong)',
        },
        focus: {
          ring: 'var(--focus-ring)',
        },
        category: {
          coffee: 'var(--category-coffee)',
          pubs: 'var(--category-pubs)',
          kids: 'var(--category-kids)',
          culture: 'var(--category-culture)',
          shopping: 'var(--category-shopping)',
        },
      },
    },
  },
  plugins: [],
}
