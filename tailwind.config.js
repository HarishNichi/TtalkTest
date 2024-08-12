/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        "1sm": "700px",
        "2sm": "600px",
      },
      dropShadow: {
        sidebar: "0 0 4 rgba(0, 0, 0, 1)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        customBlue: "#19388B",
        danger: "#FF7555",
        warning: "#FEB558",
        success: "#29AB91",
        info: "#39A1EA",
        "header-blue": "#19388B",
        "app-gray": "#817E78",
        "border-breadcrumb": "#CFCECE",
        "input-gray": "#F2F2F2",
        "auth-button-text": "#326394",
        link: "#91B7DD",
        iconGray: "#EDF2F5",
        customGray: "#C2C2C2",
        customGreen: "#1AB517",
        redCustom: "red",
      },
      backgroundColor: {
        "auth-input": "#0C4278",
        input: "#F2FAFF",
      },
      borderRadius: {
        sidebar: "66px",
      },
      height: {
        sidebar: "91%",
        xlSidebar: "95%",
      },
    },
  },
  plugins: [],
};
