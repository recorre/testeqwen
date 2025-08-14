import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  name: string;
  avatar_url: string | null;
  time_balance: number;
  zone: string | null;
  cpf: string | null;
  phone: string | null;
  user_role: 'standard' | 'organization' | 'admin';
  experience_hours: number;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string, userData: { name: string; cpf?: string; phone?: string }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  deleteAccount: () => Promise<{ error: any }>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      profile: null,
      isAuthenticated: false,
      isLoading: false,

      initialize: () => {
        // Set up auth state listener
        supabase.auth.onAuthStateChange((event, session) => {
          set({ 
            session, 
            user: session?.user ?? null, 
            isAuthenticated: !!session 
          });
          
          // Fetch profile when user signs in
          if (session?.user && event === 'SIGNED_IN') {
            setTimeout(() => {
              get().fetchProfile();
            }, 0);
          }
          
          // Clear profile when user signs out
          if (event === 'SIGNED_OUT') {
            set({ profile: null });
          }
        });

        // Check for existing session
        supabase.auth.getSession().then(({ data: { session } }) => {
          set({ 
            session, 
            user: session?.user ?? null, 
            isAuthenticated: !!session 
          });
          
          if (session?.user) {
            get().fetchProfile();
          }
        });
      },

      signUp: async (email: string, password: string, userData: { name: string; cpf?: string; phone?: string }) => {
        set({ isLoading: true });
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: userData
          }
        });
        
        set({ isLoading: false });
        return { error };
      },

      signIn: async (email: string, password: string) => {
        set({ isLoading: true });
        
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        set({ isLoading: false });
        return { error };
      },

      fetchProfile: async () => {
        const { user } = get();
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (!error && data) {
          set({ profile: data });
        }
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ 
          user: null, 
          session: null,
          profile: null,
          isAuthenticated: false 
        });
      },

      deleteAccount: async () => {
        const { user } = get();
        if (!user) return { error: new Error('No user logged in') };

        try {
          // Delete user profile first
          const { error: profileError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', user.id);

          if (profileError) {
            return { error: profileError };
          }

          // Note: User deletion from auth.users requires admin privileges
          // For now, we just delete the profile and log out
          // In production, implement an admin endpoint for complete user deletion
          
          await supabase.auth.signOut();
          set({ 
            user: null, 
            session: null,
            profile: null,
            isAuthenticated: false 
          });

          return { error: null };
        } catch (error) {
          return { error };
        }
      },
    }),
    {
      name: 'banco-tempo-auth',
      partialize: (state) => ({ 
        // Don't persist sensitive data, let Supabase handle persistence
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);