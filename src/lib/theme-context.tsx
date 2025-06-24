"use client"

import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  // Initialize theme from localStorage or user preferences
  useEffect(() => {
    // Check if we have a saved theme preference in auth
    const authSession = localStorage.getItem('auth_session')
    if (authSession) {
      try {
        const session = JSON.parse(authSession)
        const userTheme = session.user?.preferences?.theme
        if (userTheme === 'light' || userTheme === 'dark') {
          setTheme(userTheme)
        }
      } catch (error) {
        console.error('Error loading theme from auth session:', error)
      }
    }

    // Fallback to system preference if no user preference
    if (!authSession) {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      setTheme(systemTheme)
    }

    setMounted(true)
  }, [])

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement

    // Remove previous theme classes
    root.classList.remove('light', 'dark')

    // Add current theme class
    root.classList.add(theme)

    // Update CSS custom properties for smooth transitions
    if (theme === 'light') {
      root.style.setProperty('--background', '255 255 255')
      root.style.setProperty('--foreground', '9 9 11')
      root.style.setProperty('--card', '255 255 255')
      root.style.setProperty('--card-foreground', '9 9 11')
      root.style.setProperty('--popover', '255 255 255')
      root.style.setProperty('--popover-foreground', '9 9 11')
      root.style.setProperty('--primary', '24 24 27')
      root.style.setProperty('--primary-foreground', '250 250 250')
      root.style.setProperty('--secondary', '244 244 245')
      root.style.setProperty('--secondary-foreground', '24 24 27')
      root.style.setProperty('--muted', '244 244 245')
      root.style.setProperty('--muted-foreground', '113 113 122')
      root.style.setProperty('--accent', '244 244 245')
      root.style.setProperty('--accent-foreground', '24 24 27')
      root.style.setProperty('--destructive', '239 68 68')
      root.style.setProperty('--destructive-foreground', '250 250 250')
      root.style.setProperty('--border', '228 228 231')
      root.style.setProperty('--input', '228 228 231')
      root.style.setProperty('--ring', '24 24 27')
    } else {
      // Dark theme (default)
      root.style.setProperty('--background', '9 9 11')
      root.style.setProperty('--foreground', '250 250 250')
      root.style.setProperty('--card', '9 9 11')
      root.style.setProperty('--card-foreground', '250 250 250')
      root.style.setProperty('--popover', '9 9 11')
      root.style.setProperty('--popover-foreground', '250 250 250')
      root.style.setProperty('--primary', '250 250 250')
      root.style.setProperty('--primary-foreground', '9 9 11')
      root.style.setProperty('--secondary', '39 39 42')
      root.style.setProperty('--secondary-foreground', '250 250 250')
      root.style.setProperty('--muted', '39 39 42')
      root.style.setProperty('--muted-foreground', '161 161 170')
      root.style.setProperty('--accent', '39 39 42')
      root.style.setProperty('--accent-foreground', '250 250 250')
      root.style.setProperty('--destructive', '239 68 68')
      root.style.setProperty('--destructive-foreground', '250 250 250')
      root.style.setProperty('--border', '39 39 42')
      root.style.setProperty('--input', '39 39 42')
      root.style.setProperty('--ring', '212 212 216')
    }

    console.log(`🎨 Theme switched to: ${theme}`)
  }, [theme, mounted])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return <div className="min-h-screen bg-slate-950">{children}</div>
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
