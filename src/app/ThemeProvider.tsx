'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
    theme: Theme
    setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = useState<Theme>('dark')

    // Apply theme function
    const applyTheme = (selectedTheme: Theme) => {
        const isDark = selectedTheme === 'dark'
        document.documentElement.classList.toggle('dark', isDark)
        localStorage.setItem('theme', selectedTheme)
        setTheme(selectedTheme)
    }

    // Initialize theme
    useEffect(() => {
        // Check if theme is stored in localStorage
        const savedTheme = localStorage.getItem('theme') as Theme | null

        // If there's a saved theme, use it
        // Otherwise, check for system preference or fall back to dark
        if (savedTheme) {
            applyTheme(savedTheme)
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            applyTheme(prefersDark ? 'dark' : 'light')
        }
    }, [])

    return <ThemeContext.Provider value={{ theme, setTheme: applyTheme }}>{children}</ThemeContext.Provider>
}
