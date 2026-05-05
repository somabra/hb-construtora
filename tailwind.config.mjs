/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Marca HB
        primary:                  '#020037',
        'primary-container':      '#1a1a4e',
        'primary-deep':           '#020015',
        'on-primary':             '#ffffff',
        'on-primary-container':   '#8383bd',

        // Tokens laranja (consolidação dos 4 hex espalhados)
        brand: {
          orange:        '#e85d26',  // base
          'orange-light':'#f0884a',  // gradiente claro
          'orange-dark': '#d94e18',  // gradiente escuro
        },
        secondary:                '#e85d26',  // alias do brand-orange (compat)
        'secondary-container':    '#fc6b34',
        'secondary-fixed':        '#ffdbcf',
        'on-secondary':           '#ffffff',

        // Surfaces
        surface:                  '#fbf9f8',
        'surface-container-high': '#eae8e7',
        'surface-container':      '#f0eded',
        'surface-container-low':  '#f6f3f2',
        'surface-container-lowest':'#ffffff',
        'surface-dim':            '#dcd9d9',
        'surface-variant':        '#e4e2e1',
        'surface-bright':         '#fbf9f8',
        'on-surface':             '#1b1c1c',
        'on-surface-variant':     '#47464f',
        'on-background':          '#1b1c1c',
        outline:                  '#777680',
        'outline-variant':        '#c8c5d0',
        background:               '#fbf9f8',

        // Estados
        error:                    '#ba1a1a',
        'error-container':        '#ffdad6',
        'on-error':               '#ffffff',
        'on-error-container':     '#93000a',
        success:                  '#0e8a4f',
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg:      '0.25rem',
        xl:      '0.5rem',
      },
      fontFamily: {
        headline: ['"Work Sans"', 'sans-serif'],
        body:     ['"Public Sans"', 'sans-serif'],
        label:    ['"Public Sans"', 'sans-serif'],
      },
      backgroundImage: {
        'orange-gradient': 'linear-gradient(to right, #f0884a, #d94e18)',
        'whatsapp-gradient': 'linear-gradient(to right, #25D366, #0e8a4f)',
      },
    },
  },
};
