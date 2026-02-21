import { create } from 'zustand'
import type { Session, User, UserProfile } from '@/types/auth'
import type { UnitSystem } from '@/types'
import { getSession, signOut, onAuthStateChange, getUserProfile } from '@/lib/auth'

interface AuthState {
  user: User | null
  session: Session | null
  userProfile: UserProfile | null
  preferredUnits: UnitSystem
  isLoading: boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setPreferredUnits: (units: UnitSystem) => void
  logout: () => Promise<void>
  initialize: () => () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  session: null,
  userProfile: null,
  preferredUnits: 'imperial',
  isLoading: true,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setPreferredUnits: (preferredUnits) => set({ preferredUnits }),

  logout: async () => {
    await signOut()
    set({ user: null, session: null, userProfile: null, preferredUnits: 'imperial' })
  },

  initialize: () => {
    // Fetch current session on mount
    getSession().then(({ data }) => {
      set({
        session: data,
        user: data?.user ?? null,
        isLoading: false,
      })
      // Fetch user profile for preferred_units
      if (data?.user) {
        getUserProfile().then(({ data: profile }) => {
          if (profile) {
            set({ userProfile: profile, preferredUnits: profile.preferred_units })
          }
        })
      }
    })

    // Listen for auth state changes
    const subscription = onAuthStateChange((session) => {
      set({
        session,
        user: session?.user ?? null,
        isLoading: false,
      })
      if (session?.user) {
        getUserProfile().then(({ data: profile }) => {
          if (profile) {
            set({ userProfile: profile, preferredUnits: profile.preferred_units })
          }
        })
      } else {
        set({ userProfile: null, preferredUnits: 'imperial' })
      }
    })

    // Return cleanup function
    return () => subscription.unsubscribe()
  },
}))
