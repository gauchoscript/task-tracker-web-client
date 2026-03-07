import { queryClient } from '@/lib/queryClient'
import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'
import './index.css'

// Register service worker
try {
  alert('MAIN: Starting registerSW');
  registerSW({ 
    immediate: true,
    onRegisteredSW: (url, registration) => {
      alert(`MAIN: Service Worker registered! URL: ${url}`);
    },
    onRegisterError: (error) => {
      alert(`MAIN: Service Worker registration failed: ${error}`);
    }
  })
} catch (e) {
  alert(`MAIN: Exception during registerSW: ${e}`);
}

async function enableMocking() {
  if (import.meta.env.VITE_USE_MOCKS !== 'true') {
    return
  }

  const { worker } = await import('./mocks/browser')

  // `worker.start()` returns a Promise that resolves
  // when the Service Worker is up and ready to intercept requests.
  return worker.start()
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>,
  )
})
