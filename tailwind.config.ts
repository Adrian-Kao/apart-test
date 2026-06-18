import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        room: {
          wall: "#f7d7c5",
          floor: "#e8b78d",
          ink: "#2f3142",
          mint: "#8ac7ad",
          sky: "#b9e0ee"
        }
      }
    }
  },
  plugins: []
};

export default config;
