'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { UserProfile } from '@/types';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isDemoMode: boolean;
  signUp: (email: string, password: string, name: string, role: UserProfile['role']) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

interface DemoUser extends UserProfile {
  password?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function mapDbRoleToPortalRole(dbRole: string): UserProfile['role'] {
  if (dbRole === 'fan' || dbRole === 'visitor') return 'visitor';
  if (dbRole === 'admin' || dbRole === 'fifa') return 'fifa';
  return 'staff';
}

export function getDashboardForRole(role: string): string {
  if (role === 'visitor' || role === 'fan') return '/dashboard/visitor';
  if (role === 'fifa' || role === 'admin') return '/dashboard/fifa';
  return '/dashboard/staff';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    async function initSession() {
      setIsLoading(true);

      // --- SUPABASE SESSION MANAGEMENT ---
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Retrieve custom profile information (role, name) from the profiles table
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            const rawRole = session.user.user_metadata?.role || profile?.role || 'organizer';
            const mappedRole = mapDbRoleToPortalRole(rawRole);

            // Update user metadata in Supabase if not set
            if (!session.user.user_metadata?.role) {
              await supabase.auth.updateUser({
                data: { role: mappedRole }
              }).catch(() => {});
            }

            if (!error && profile) {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                name: profile.name || 'Staff Member',
                role: mappedRole,
                createdAt: profile.created_at || new Date().toISOString(),
              });
            } else {
              // Fallback if profile row is missing
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata?.name || 'Staff Member',
                role: mappedRole,
                createdAt: session.user.created_at || new Date().toISOString(),
              });
            }
          } else {
            setUser(null);
          }

          // Set up auth state change listener
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              const rawRole = session.user.user_metadata?.role || profile?.role || 'organizer';
              const mappedRole = mapDbRoleToPortalRole(rawRole);

              setUser({
                id: session.user.id,
                email: session.user.email || '',
                name: profile?.name || session.user.user_metadata?.name || 'Staff Member',
                role: mappedRole,
                createdAt: profile?.created_at || session.user.created_at || new Date().toISOString(),
              });
            } else {
              setUser(null);
            }
          });

          return () => {
            subscription.unsubscribe();
          };
        } catch (err) {
          console.error('Supabase Auth Initialization failed, falling back to Demo Mode:', err);
        }
      }

      // --- LOCAL DEMO SESSION MANAGEMENT ---
      const demoUserStr = localStorage.getItem('stadium_os_demo_user');
      if (demoUserStr) {
        try {
          const demoUser = JSON.parse(demoUserStr);
          setUser(demoUser);
        } catch {
          localStorage.removeItem('stadium_os_demo_user');
        }
      }
      setIsLoading(false);
    }

    initSession().finally(() => {
      setIsLoading(false);
    });
  }, [supabase]);

  // Auth Guard / Redirects
  useEffect(() => {
    if (isLoading) return;

    const publicPaths = ['/login', '/signup', '/forgot-password', '/auth/callback'];
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

    if (!user && !isPublicPath && pathname !== '/') {
      router.push('/login');
    } else if (user && (isPublicPath || pathname === '/')) {
      router.push(getDashboardForRole(user.role));
    }
  }, [user, isLoading, pathname, router]);

  // --- SIGN UP ---
  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: UserProfile['role']
  ): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name, role },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) return { success: false, error: error.message };

        // Profile will be created via database trigger on auth.users in Supabase,
        // but we'll also insert it explicitly in case the trigger is not set up
        if (data.user) {
          // Map to standard schema roles to prevent database check constraint failure
          let dbRole: string = role;
          if (role === 'visitor') dbRole = 'fan';
          else if (role === 'staff') dbRole = 'organizer';
          else if (role === 'fifa') dbRole = 'admin';

          const { error: profileError } = await supabase.from('profiles').upsert({
            id: data.user.id,
            name,
            role: dbRole,
            email,
            created_at: new Date().toISOString(),
          });
          
          if (profileError) {
            console.warn('Profile sync warning:', profileError.message);
          }
        }

      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Supabase signup failed';
        return { success: false, error: errorMsg };
      }
    }

    // Demo Mode Sign Up
    const usersStr = localStorage.getItem('stadium_os_demo_users') || '[]';
    const users = JSON.parse(usersStr);

    if (users.some((u: DemoUser) => u.email === email)) {
      return { success: false, error: 'User with this email already exists' };
    }

    const newUser: UserProfile = {
      id: `user-${Math.random().toString(36).substr(2, 9)}`,
      email,
      name,
      role,
      createdAt: new Date().toISOString(),
    };

    users.push({ ...newUser, password }); // Storing password for demo purposes only
    localStorage.setItem('stadium_os_demo_users', JSON.stringify(users));
    
    // Auto sign in in demo mode
    localStorage.setItem('stadium_os_demo_user', JSON.stringify(newUser));
    setUser(newUser);
    router.push(getDashboardForRole(newUser.role));

    return { success: true };
  };

  // --- SIGN IN ---
  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error, data } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { success: false, error: error.message };

        // Automatically store the mapped role in metadata upon login
        if (data?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();
          
          const rawRole = data.user.user_metadata?.role || profile?.role || 'organizer';
          const mappedRole = mapDbRoleToPortalRole(rawRole);

          await supabase.auth.updateUser({
            data: { role: mappedRole }
          }).catch(() => {});
        }

      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Supabase signin failed';
        return { success: false, error: errorMsg };
      }
    }

    // Demo Mode Sign In
    if (password === 'stadiumos') {
      let mockUser: UserProfile | null = null;
      if (email === 'visitor@stadiumos.ai') {
        mockUser = {
          id: 'demo-visitor',
          email: 'visitor@stadiumos.ai',
          name: 'Alex Morgan (Fan)',
          role: 'visitor',
          createdAt: new Date().toISOString(),
        };
      } else if (email === 'staff@stadiumos.ai') {
        mockUser = {
          id: 'demo-staff',
          email: 'staff@stadiumos.ai',
          name: 'Marcus Vance (Venue Manager)',
          role: 'staff',
          createdAt: new Date().toISOString(),
        };
      } else if (email === 'fifa@stadiumos.ai' || email === 'admin@stadiumos.ai') {
        mockUser = {
          id: 'demo-fifa',
          email: email,
          name: 'Gianni Infantino (FIFA Board)',
          role: 'fifa',
          createdAt: new Date().toISOString(),
        };
      }

      if (mockUser) {
        localStorage.setItem('stadium_os_demo_user', JSON.stringify(mockUser));
        setUser(mockUser);
        router.push(getDashboardForRole(mockUser.role));
        return { success: true };
      }
    }

    // Fallback search custom users in Local Storage
    const usersStr = localStorage.getItem('stadium_os_demo_users') || '[]';
    const users = JSON.parse(usersStr);
    const foundUser = users.find((u: DemoUser) => u.email === email && u.password === password);

    if (!foundUser) {
      return { success: false, error: 'Invalid email or password. Use demo portal credentials (visitor@stadiumos.ai, staff@stadiumos.ai, or fifa@stadiumos.ai with password: stadiumos).' };
    }

    const userProfile: UserProfile = {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      role: foundUser.role,
      createdAt: foundUser.createdAt,
    };

    localStorage.setItem('stadium_os_demo_user', JSON.stringify(userProfile));
    setUser(userProfile);
    router.push(getDashboardForRole(userProfile.role));

    return { success: true };
  };

  // --- SIGN OUT ---
  const signOut = async (): Promise<{ success: boolean }> => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('stadium_os_demo_user');
    setUser(null);
    router.push('/');
    return { success: true };
  };

  // --- RESET PASSWORD ---
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login?reset=true`,
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Supabase password reset failed';
        return { success: false, error: errorMsg };
      }
    }

    // Demo Mode Password Reset
    const usersStr = localStorage.getItem('stadium_os_demo_users') || '[]';
    const users = JSON.parse(usersStr);
    const userExists = users.some((u: DemoUser) => u.email === email) || ['visitor@stadiumos.ai', 'staff@stadiumos.ai', 'fifa@stadiumos.ai', 'admin@stadiumos.ai'].includes(email);

    if (!userExists) {
      return { success: false, error: 'No user registered with this email address' };
    }

    // Simulate reset link email
    console.log(`Demo Mode: Password reset link generated for ${email}`);
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isDemoMode: !isSupabaseConfigured,
        signUp,
        signIn,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
