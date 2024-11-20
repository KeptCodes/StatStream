import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import tailwindPlugin from "./plugins/tailwind-config.cjs";
// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "StatStream",
  tagline: "Self-Host website analytics",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://keptcodes.github.io",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/StatStream",
  trailingSlash: false,
  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "KeptCodes", // Usually your GitHub org/user name.
  projectName: "StatStream", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/KeptCodes/StatStream/tree/dev/packages/docs",
        },

        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],
  plugins: [tailwindPlugin],

  themeConfig: {
    // Replace with your project's social card
    image: "img/docusaurus-social-card.jpg",
    navbar: {
      title: "StatStrem Docs",
      logo: {
        alt: "StatStrem",
        src: "img/favicon.ico",
      },
      items: [
        {
          type: "docsVersionDropdown",
        },
        { to: "/docs/intro", label: "Docs", position: "left" },
        {
          href: "https://github.com/KeptCodes/StatStream",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Installation",
              to: "/docs/intro",
            },
          ],
        },
        {
          title: "Social",
          items: [
            {
              label: "X",
              href: "https://x.com/pvdev",
            },
            {
              label: "GitHub",
              href: "https://github.com/KeptCodes/StatStream",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} KeptCodes Organization. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
