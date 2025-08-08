import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import { default as flattenColorPalette } from "tailwindcss/lib/util/flattenColorPalette";

export default {
  content: [
    "./src/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  darkMode: ["class", "class"],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: [
  				'var(--font-geist-sans)',
                    ...fontFamily.sans
                ]
  		},
  		animation: {
  			aurora: 'aurora 60s linear infinite',
  			"fade-in-up": "fade-in-up 0.5s ease-out forwards",
  			"fade-in": "fade-in 0.5s ease-out forwards",
  			"scale-in": "scale-in 0.5s ease-out forwards",
  			"slide-right": "slideRightIn 0.5s ease-out forwards",
  			"testimonial-in": "testimonialIn 0.5s ease-out forwards",
  			"element": "fadeSlideIn 0.5s ease-out forwards"
  		},
  		keyframes: {
  			aurora: {
  				from: {
  					backgroundPosition: '50% 50%, 50% 50%'
  				},
  				to: {
  					backgroundPosition: '350% 50%, 350% 50%'
  				}
  			},
  			"fade-in-up": {
  				"0%": { 
  					opacity: "0",
  					transform: "translateY(10px)"
  				},
  				"100%": {
  					opacity: "1",
  					transform: "translateY(0)"
  				}
  			},
  			"fade-in": {
  				"0%": {
  					opacity: "0"
  				},
  				"100%": {
  					opacity: "1"
  				}
  			},
  			"fadeSlideIn": {
  				"0%": {
  					opacity: "0",
  					filter: "blur(4px)",
  					transform: "translateY(10px)"
  				},
  				"100%": {
  					opacity: "1",
  					filter: "blur(0)",
  					transform: "translateY(0)"
  				}
  			},
  			"slideRightIn": {
  				"0%": {
  					opacity: "0",
  					filter: "blur(4px)",
  					transform: "translateX(20px)"
  				},
  				"100%": {
  					opacity: "1",
  					filter: "blur(0)",
  					transform: "translateX(0)"
  				}
  			},
  			"testimonialIn": {
  				"0%": {
  					opacity: "0",
  					filter: "blur(4px)",
  					transform: "translateY(20px) scale(0.95)"
  				},
  				"100%": {
  					opacity: "1",
  					filter: "blur(0)",
  					transform: "translateY(0) scale(1)"
  				}
  			},
  			"scale-in": {
  				"0%": {
  					opacity: "0",
  					transform: "scale(0.95)"
  				},
  				"100%": {
  					opacity: "1",
  					transform: "scale(1)"
  				}
  			}
  		},
  		backgroundSize: {
  			'200': '200%'
  		},
  		backgroundPosition: {
  			'pos-0': '0% 50%',
  			'pos-100': '100% 50%'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			brand: "hsl(var(--brand))",
  			"brand-foreground": "hsl(var(--brand-foreground))",
  		},
  		maxWidth: {
  			container: "80rem",
  		},
  		boxShadow: {
  			glow: "0 -16px 128px 0 hsla(var(--brand-foreground) / 0.5) inset, 0 -16px 32px 0 hsla(var(--brand) / 0.5) inset",
  		},
  	}
  },
  plugins: [addVariablesForColors, require("tailwindcss-animate")
  ],
} satisfies Config;

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }: { addBase: any; theme: any }) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}
