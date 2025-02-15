// src/styles/GlobalStyles.js
import { createGlobalStyle } from "styled-components";

export const lightTheme = {
  colors: {
    primary: "#FF4081", // vibrant accent
    secondary: "#B0BEC5",
    text: "#333333",
    accent: "#64FFDA",
    background: "#FFFFFF",
    textLight: "#757575",
    border: "#E0E0E0",
    sidebar: "#F7F7F7",
    sidebarHover: "#E0E0E0",
    activeLink: "rgba(255, 64, 129, 0.15)",
    primaryHover: "#FF79A8",
    imageBorder: "#DDD",
    code: "#FF4081",
    codeBg: "#FAFAFA",
    codeBorder: "#E0E0E0",
  },
  fonts: {
    body: '"Inter", sans-serif',
    code: '"JetBrains Mono", monospace',
    heading: '"Inter", sans-serif',
  },
  fontSizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    xxl: "3rem",
  },
  shadows: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.1)",
    md: "0 4px 6px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px rgba(0, 0, 0, 0.15)",
  },
  transitions: {
    default: "0.3s ease",
    fast: "0.2s ease",
    slow: "0.4s ease",
  },
  borderRadius: {
    sm: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    "3xl": "1.5rem",
  },
};

export const darkTheme = {
  colors: {
    primary: "#FF4081",
    secondary: "#B0BEC5",
    text: "#E0E0E0",
    accent: "#64FFDA",
    background: "#121212",
    textLight: "#B0BEC5",
    border: "#333333",
    sidebar: "#1E1E1E",
    sidebarHover: "#272727",
    activeLink: "rgba(255, 64, 129, 0.15)",
    primaryHover: "#FF79A8",
    imageBorder: "#444",
    code: "#FF4081",
    codeBg: "#1E1E1E",
    codeBorder: "#333333",
  },
  fonts: {
    body: '"Inter", sans-serif',
    code: '"JetBrains Mono", monospace',
    heading: '"Inter", sans-serif',
  },
  fontSizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    xxl: "3rem",
  },
  shadows: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.2)",
    md: "0 4px 6px rgba(0, 0, 0, 0.2)",
    lg: "0 10px 15px rgba(0, 0, 0, 0.25)",
    xl: "0 20px 25px rgba(0, 0, 0, 0.3)",
  },
  transitions: {
    default: "0.3s ease",
    fast: "0.2s ease",
    slow: "0.4s ease",
  },
  borderRadius: {
    sm: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    "3xl": "1.5rem",
  },
};

export const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  /* Reset & Base Styles */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: ${({ theme }) => theme.fonts.body};
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) => theme.colors.background};
    line-height: 1.6;
  }

  /* Headings */
  h1, h2, h3, h4, h5, h6 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 1.2;
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.colors.text};
  }

  /* Links */
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    transition: color ${({ theme }) => theme.transitions.fast};

    &:hover {
      color: ${({ theme }) => theme.colors.primaryHover};
    }
  }

  /* Code blocks */
  pre, code {
    font-family: ${({ theme }) => theme.fonts.code};
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }

  pre {
    background: ${({ theme }) => theme.colors.codeBg};
    border: 1px solid ${({ theme }) => theme.colors.codeBorder};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    padding: ${({ theme }) => theme.spacing.lg};
    margin: ${({ theme }) => theme.spacing.xl} 0;
    overflow-x: auto;
    line-height: 1.6;
    color: ${({ theme }) => theme.colors.code};
  }

  code {
    background: ${({ theme }) => theme.colors.codeBg};
    padding: 0.2em 0.4em;
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    color: ${({ theme }) => theme.colors.code};
  }

  /* Scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  /* Focus outline */
  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;
