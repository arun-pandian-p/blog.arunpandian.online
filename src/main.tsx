import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import { ContentProvider } from './context/ContentProvider.jsx'
import App from './App.tsx'
import { ThemeProvider } from './theme/ThemeProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ContentProvider>
        <ThemeProvider>
          <App />
          <Analytics />
        </ThemeProvider>
      </ContentProvider>
    </HelmetProvider>
  </StrictMode>,
)
