import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  isDark: boolean
  toggleTheme: () => void
  setDark: (value: boolean) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDark: false,
      toggleTheme: () => {
        const newValue = !get().isDark
        set({ isDark: newValue })
        // Aplicar clase al documento
        if (typeof window !== 'undefined') {
          if (newValue) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }
      },
      setDark: (value: boolean) => {
        set({ isDark: value })
        if (typeof window !== 'undefined') {
          if (value) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }
      }
    }),
    {
      name: 'kardex-theme',
      onRehydrateStorage: () => (state) => {
        // Aplicar tema al cargar
        if (typeof window !== 'undefined' && state?.isDark) {
          document.documentElement.classList.add('dark')
        }
      }
    }
  )
)

