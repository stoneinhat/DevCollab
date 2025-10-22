import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'hunter-green': '#386641',
        'asparagus': '#6a994e',
        'yellow-green': '#a7c957',
        'parchment': '#f2e8cf',
        'bittersweet': '#bc4749',
      },
      fontFamily: {
        'archivo': ['ArchivoNarrowRegular', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;

