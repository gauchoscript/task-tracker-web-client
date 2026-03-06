import { queryClient } from '@/lib/queryClient'
import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'
import './index.css'

// Register service worker
registerSW({ 
  immediate: true,
  onRegistered(r) {
    console.log('PWA - Service Worker registered:', r?.scope);
  },
  onRegisterError(error) {
    console.error('PWA - Service Worker registration error:', error);
  }
})

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
