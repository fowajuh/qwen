/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './index.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: 'hsl(0 0% 100%)',
        foreground: 'hsl(0 0% 3.9%)',
        surface: 'hsl(0 0% 96.1%)',
        'surface-2': 'hsl(0 0% 94%)',
        muted: 'hsl(0 0% 96.1%)',
        'muted-foreground': 'hsl(0 0% 45.1%)',
        primary: 'hsl(0 0% 9%)',
        'primary-foreground': 'hsl(0 0% 98%)',
        accent: 'hsl(0 0% 96.1%)',
        'accent-foreground': 'hsl(0 0% 9%)',
        border: 'hsl(0 0% 89.8%)',
        hairline: 'hsl(0 0% 92%)',
        ring: 'hsl(0 0% 3.9%)',
      },
      borderRadius: {
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
