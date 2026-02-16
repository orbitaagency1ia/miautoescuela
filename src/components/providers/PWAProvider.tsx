import { startTransition, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { setupInstallPrompt } from '@/lib/pwa/register-sw'
import { InstallPrompt } from '@/components/prompt/InstallPrompt'

interface RootLayoutProps {
  children: ReactNode
}

export default function PWAProvider({ children }: RootLayoutProps) {
  const [isReady, setIsReady] = useState(false)
  const [showInstallButton, setShowInstallButton] = useState(false)

  useEffect(() => {
    // Only setup PWA in production/browser
    if (typeof window === 'undefined') return
    if (process.env.NODE_ENV === 'development') return

    setupInstallPrompt()

    // Check if we should show install button
    if (!window.matchMedia('(display-mode: standalone)').matches) {
      const hasPrompted = localStorage.getItem('pwa-install-prompted')
      setShowInstallButton(!hasPrompted && !isReady)

      const timer = setTimeout(() => {
        setShowInstallButton(true)
      }, 5000) // Show after 5 seconds

      return () => clearTimeout(timer)
    }
  }, [])

  const handleInstallSeen = () => {
    localStorage.setItem('pwa-install-prompted', 'true')
    setIsReady(true)
    setShowInstallButton(false)
  }

  return (
    <>
      {children}
      {showInstallButton && (
        <InstallPrompt
          primaryColor="#3B82F6"
          secondaryColor="#1E40AF"
        />
      )}
    </>
  )
}
