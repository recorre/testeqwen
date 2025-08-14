import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme/ThemeProviders'

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
    <Toaster />
  </ThemeProvider>
);
