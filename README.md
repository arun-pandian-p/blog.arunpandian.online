# Apstories — Personal Engineering Journal & Technical Blogging Platform

**Apstories** is a modern, responsive, developer blogging platform crafted for engineers to document daily developer journeys, technical learnings, architectural blueprints, project updates, feature developments, and production postmortems.

---

## 🚀 Key Highlights & Architecture

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: Java 21, Spring Boot 3, Spring Security with stateless JWT tokens.
- **Database & Auth**: Supabase PostgreSQL with PostgREST gateway, role-based access control (`ROLE_ADMIN`, `ROLE_USER`).
- **Rich Text Editor**: Advanced **Tiptap 2** suite featuring comprehensive typography and real-time editing tools.

---

## ✍️ Advanced Rich Text Editor (Tiptap)

- **20+ Selectable Font Families**:
  - *Modern Sans*: Inter, Plus Jakarta Sans, Roboto, Poppins, Open Sans, Lato, Montserrat, Nunito, Raleway
  - *Editorial Serif*: Merriweather, Playfair Display, Lora, PT Serif, Georgia, Garamond, Cinzel
  - *Developer Monospace*: JetBrains Mono, Fira Code, Source Code Pro, Space Mono, IBM Plex Mono, Inconsolata
- **Font Sizes**: 12px, 14px, 16px (Normal), 18px, 20px, 24px, 28px, 32px, 36px, 48px
- **Formatting Tools**: Bold, Italic, Underline, Strikethrough, Text Colors, Multi-color Highlighting.
- **Headings & Structure**: H1 to H6, Left/Center/Right/Justify text alignment, blockquotes, horizontal dividers.
- **Lists & Checklists**: Bulleted lists, numbered lists, and interactive task checklists with clickable checkboxes.
- **Syntax-Highlighted Code Blocks**: Built on `lowlight` with 20+ language presets (Java, TypeScript, Python, Rust, Go, SQL, Bash, YAML, etc.).
- **Media & Images**:
  - Insert by URL, file upload, or drag-and-drop.
  - Scale width: 25%, 50%, 75%, 100%.
  - Alignment: Left, Center, Right.
  - SVG vector code preservation without destructive raster conversion.
  - Article cover image / banner selector with presets and custom upload.
- **Interactive Tables**:
  - Add / delete rows above and below.
  - Add / delete columns before and after.
  - Merge and split cells.
  - Toggle header row and header column.
  - Direct cell editing.
- **Floating Bubble Menu**: Pops up automatically on text selection for quick styling.
- **Distraction-Free Zen Mode**: Fullscreen mode for uninterrupted technical writing.
- **Live Reader Preview**: Split/tabbed live preview matching the story detail layout.
- **Debounced Local Autosave**: Guarantees zero loss of content on accidental tab close or reload.

---

## 🛠️ Running the Application

### 1. Spring Boot Backend (Port 8080)
```powershell
cd backend
mvn clean package -DskipTests
java -jar target/apstories-backend-1.0.0.jar
```

### 2. React + Vite Frontend (Port 5173)
```powershell
cd frontend
npm install
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔐 Credentials for Testing

- **Created Engineer Account**:
  - Username: `apengineer`
  - Password: `Password123!`
- **Moderator Quick Fill**:
  - Click **Sign In** -> **Fill Admin Credentials** in the modal.

