/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cream:   { DEFAULT: '#F5F0E8', 50: '#FDFCF9', 100: '#F9F6F0', 200: '#F5F0E8', 300: '#EDE4D3', 400: '#DDD0B8', 500: '#C9B99A' },
        sepia:   { DEFAULT: '#8B6914', 100: '#F4ECD8', 200: '#D4A96A', 300: '#B8853D', 400: '#8B6914', 500: '#6B4F10' },
        parchment: '#F2E8D5',
        ink:     { DEFAULT: '#2C1810', light: '#4A2E1E', muted: '#7A5C4A' },
        gold:    { DEFAULT: '#C9962C', light: '#E8B84B', dark: '#A07820', pale: '#F0E0A0' },
        forest:  { DEFAULT: '#2D4A2D', light: '#3D6B3D', muted: '#5A7A5A' },
        burgundy: { DEFAULT: '#6B2737', light: '#8B3547', muted: '#A06070' },
        sage:    { DEFAULT: '#8A9E7B', light: '#B0C4A0', dark: '#6A7E5B' },
      },
      fontFamily: {
        display:   ['"Playfair Display"', 'Georgia', 'serif'],
        serif:     ['"Cormorant Garamond"', 'Georgia', 'serif'],
        script:    ['"Dancing Script"', 'cursive'],
        body:      ['"Lora"', 'Georgia', 'serif'],
        mono:      ['"Courier Prime"', 'monospace'],
      },
      backgroundImage: {
        'paper': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
        'vintage-gradient': 'linear-gradient(135deg, #F5F0E8 0%, #EDE4D3 50%, #DDD0B8 100%)',
        'hero-gradient':    'linear-gradient(180deg, rgba(44,24,16,0.7) 0%, rgba(44,24,16,0.3) 60%, rgba(44,24,16,0.8) 100%)',
      },
      boxShadow: {
        'polaroid': '0 4px 6px -1px rgba(44,24,16,0.15), 0 12px 40px rgba(44,24,16,0.12), inset 0 0 0 1px rgba(201,150,44,0.15)',
        'card':     '0 2px 20px rgba(44,24,16,0.08), 0 1px 4px rgba(44,24,16,0.06)',
        'elegant':  '0 8px 60px rgba(44,24,16,0.12), 0 2px 8px rgba(44,24,16,0.08)',
        'gold':     '0 0 20px rgba(201,150,44,0.3), 0 4px 15px rgba(201,150,44,0.2)',
      },
      animation: {
        'float':        'float 6s ease-in-out infinite',
        'float-slow':   'float 9s ease-in-out infinite',
        'shimmer':      'shimmer 2s linear infinite',
        'fade-up':      'fadeUp 0.8s ease-out forwards',
        'fade-in':      'fadeIn 0.6s ease-out forwards',
        'reveal':       'reveal 1s ease-out forwards',
        'particle':     'particle 8s ease-in-out infinite',
        'typewriter':   'typewriter 3s steps(40) forwards',
        'glow-pulse':   'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        float:      { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        shimmer:    { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        fadeUp:     { '0%': { opacity: 0, transform: 'translateY(30px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:     { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        reveal:     { '0%': { clipPath: 'inset(0 100% 0 0)' }, '100%': { clipPath: 'inset(0 0% 0 0)' } },
        particle:   { '0%,100%': { transform: 'translate(0,0) scale(1)', opacity: 0.6 }, '33%': { transform: 'translate(30px,-20px) scale(1.2)', opacity: 1 }, '66%': { transform: 'translate(-20px,-40px) scale(0.8)', opacity: 0.4 } },
        glowPulse:  { '0%,100%': { boxShadow: '0 0 10px rgba(201,150,44,0.2)' }, '50%': { boxShadow: '0 0 30px rgba(201,150,44,0.5)' } },
      },
    },
  },
  plugins: [],
};
