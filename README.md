<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=06B6D4&height=200&section=header&text=Arun%20Pandian&fontSize=60&fontAlignY=35&desc=Professional%20Portfolio&descAlignY=55&descSize=20&fontColor=ffffff" width="100%" />

  **A highly interactive, 3D web experience built for the modern web.**
  <br />

  [![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/arunpandianp-dataanalyst)
  [![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-8.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
  [![Three.js](https://img.shields.io/badge/Three.js-3D-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
  [![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

  <br />
  <a href="#-key-features">Features</a> · <a href="#-project-architecture">Architecture</a> · <a href="#-local-development">Development</a>
</div>

<br />

> **Overview**: This project has been fully migrated from its original Next.js/MERN architecture to a highly optimized, strictly typed single-page application (SPA). It features an Awwwards-style 3D interactive hero section powered by Three.js & Framer Motion, smooth scrolling courtesy of Lenis, and a centralized data architecture for effortless resume updates.

---

## ✨ Key Features

- ⚡ **Lightning Fast:** Powered by Vite & React 19 for instantaneous HMR and optimized builds.
- 🎨 **Awwwards-style UI:** Fluid animations (GSAP & Framer Motion), parallax scrolling, and a dark/light minimalist aesthetic.
- 🧊 **3D Integration:** Custom Three.js scenes rendered declaratively via `@react-three/fiber` and `@react-three/drei`.
- 🧩 **Centralized Content:** A strict data model (`src/data/resumeData.ts`) controls the entire site, making updates completely frictionless.

---

## 📂 Project Architecture

The codebase is organized in a scalable, modular pattern designed for maintainability:

```text
/
├── public/                 # Static assets (favicons, PDFs, legacy media)
│   ├── legacy/             # Archived media files from prior builds
│   └── resume.pdf          # Linked résumé file
│
├── src/
│   ├── App.tsx             # Root router and global Lenis scroll wrapper
│   ├── main.tsx            # React DOM rendering entry point
│   │
│   ├── assets/             # Bundled media files (images, vectors)
│   │
│   ├── components/         # Modular UI Architecture
│   │   ├── common/         # Global utilities (e.g., Welcome intro screen)
│   │   ├── layout/         # Structural wrappers (Navbar)
│   │   ├── sections/       # Core page segments (Hero, About, Contact)
│   │   └── ui/             # Reusable interactive micro-components
│   │
│   ├── data/               # Centralized content store
│   │   └── resumeData.ts   # ALL portfolio text, links, and experience data
│   │
│   ├── pages/              # Route views
│   │   └── HomePage.tsx    # Assembles the section components
│   │
│   ├── styles/             # Global CSS and Tailwind tokens
│   │
│   └── types/              # TypeScript interface contracts
│
├── vite.config.ts          # Vite build and plugin configuration
└── package.json            # Dependencies and npm scripts
```

---

## 🛠️ Data Management & Customization

The site operates as a statically built portfolio without the need for an external CMS or database. 

**To update the site's content, simply modify the TypeScript object:**
```ts
// src/data/resumeData.ts
export const resumeData = {
  personalInfo: { ... },
  skills: { ... },
  experience: [ ... ],
  projects: [ ... ]
}
```
All UI components strictly adhere to the interfaces defined in **`src/types/index.ts`** and will instantly reflect changes from this data source safely.

---

## 💻 Local Development

Get started locally in 3 steps:

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the development server:**
   ```bash
   npm run dev
   ```
   *The site will be available at `http://localhost:5173`.*
3. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🌍 Deployment

This project is configured out-of-the-box for **Vercel** with the `vercel` CLI tool dependency tracked.

1. Ensure Vercel is linked to the repository.
2. Run standard deployment commands, Vercel will automatically detect Vite and serve the `dist/` folder via standard Node.js pipelines.

<br />

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=06B6D4&height=100&section=footer" width="100%"/>
  <p>Built with ❤️ by <a href="https://linkedin.com/in/arunpandianp-dataanalyst"><b>Arun Pandian</b></a></p>
</div>
