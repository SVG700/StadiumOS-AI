'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { UserProfile } from '@/types';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isDemoMode: boolean;
  signUp: (email: string, password: string, name: string, role: UserProfile['role']) => Promise<{ success: boolean; error?: string; session?: Session | null; email?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: { name?: string; avatarUrl?: string; phoneNumber?: string; preferredLanguage?: string; email?: string }) => Promise<{ success: boolean; error?: string }>;
  showToast: (message: string, description?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
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
    let unsubscribeFn: (() => void) | null = null;
    let isMounted = true;

    async function initSession() {
      setIsLoading(true);

      // --- SUPABASE SESSION MANAGEMENT ---
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!isMounted) return;

          if (session?.user) {
            // Verify email confirmation
            if (!session.user.email_confirmed_at) {
              await supabase.auth.signOut();
              setUser(null);
              setIsLoading(false);
              return;
            }

            // Retrieve custom profile information (role, name) from the profiles table
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (!isMounted) return;

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
                avatarUrl: profile.avatar_url,
                phoneNumber: profile.phone_number,
                preferredLanguage: profile.preferred_language,
              });
            } else {
              // Fallback if profile row is missing
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata?.name || 'Staff Member',
                role: mappedRole,
                createdAt: session.user.created_at || new Date().toISOString(),
                avatarUrl: session.user.user_metadata?.avatarUrl,
              });
            }
          } else {
            setUser(null);
          }

          // Set up auth state change listener
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!isMounted) return;

            if (session?.user) {
              if (!session.user.email_confirmed_at) {
                await supabase.auth.signOut();
                setUser(null);
                return;
              }

              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (!isMounted) return;

              const rawRole = session.user.user_metadata?.role || profile?.role || 'organizer';
              const mappedRole = mapDbRoleToPortalRole(rawRole);

              setUser({
                id: session.user.id,
                email: session.user.email || '',
                name: profile?.name || session.user.user_metadata?.name || 'Staff Member',
                role: mappedRole,
                createdAt: profile?.created_at || session.user.created_at || new Date().toISOString(),
                avatarUrl: profile?.avatar_url || session.user.user_metadata?.avatarUrl,
                phoneNumber: profile?.phone_number,
                preferredLanguage: profile?.preferred_language,
              });
            } else {
              setUser(null);
            }
          });

          unsubscribeFn = () => {
            subscription.unsubscribe();
          };
        } catch (err) {
          console.error('Supabase Auth Initialization failed:', err);
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
        return; // Skip all local demo initialization when Supabase is configured
      }

      // --- LOCAL DEMO SESSION MANAGEMENT ---
      const demoUsersStr = localStorage.getItem('stadium_os_demo_users') || '[]';
      let demoUsers = [];
      try {
        demoUsers = JSON.parse(demoUsersStr);
      } catch {
        demoUsers = [];
      }
      
      const targetDemoUsers = [
        { email: 'visitor.demo@stadiumos.ai', password: 'Visitor@2026', name: 'Visitor Demo', role: 'visitor' as const },
        { email: 'staff.demo@stadiumos.ai', password: 'Staff@2026', name: 'Staff Demo', role: 'staff' as const },
        { email: 'fifa.demo@stadiumos.ai', password: 'FIFA@2026', name: 'FIFA Executive Demo', role: 'fifa' as const }
      ];

      let updatedLocal = false;
      targetDemoUsers.forEach(target => {
        if (!demoUsers.some((u: { email: string }) => u.email === target.email)) {
          demoUsers.push({
            id: `demo-${target.role}-id`,
            email: target.email,
            name: target.name,
            role: target.role,
            password: target.password,
            createdAt: new Date().toISOString()
          });
          updatedLocal = true;
        }
      });
      if (updatedLocal && isMounted) {
        localStorage.setItem('stadium_os_demo_users', JSON.stringify(demoUsers));
      }

      const demoUserStr = localStorage.getItem('stadium_os_demo_user');
      if (demoUserStr && isMounted) {
        try {
          const demoUser = JSON.parse(demoUserStr);
          setUser(demoUser);
        } catch {
          localStorage.removeItem('stadium_os_demo_user');
        }
      }
      
      if (isMounted) {
        setIsLoading(false);
      }
    }

    initSession();

    return () => {
      isMounted = false;
      if (unsubscribeFn) {
        unsubscribeFn();
      }
    };
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

  // Clean up localStorage on auth state changes (Wipe demo data)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const bannedKeys = ['visitor.demo', 'demouser', 'guest', 'anonymous', 'sample', 'default'];
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const lowerKey = key.toLowerCase();
        if (bannedKeys.some(banned => lowerKey.includes(banned))) {
          keysToRemove.push(key);
        }
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  }, [user]);

  // --- SIGN UP ---
  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: UserProfile['role']
  ): Promise<{ success: boolean; error?: string; session?: Session | null; email?: string }> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              name,
              role,
            },
          },
        });

        if (error) return { success: false, error: error.message };

        // Profile will be created via database trigger on auth.users in Supabase,
        // but we'll also insert it explicitly in case the trigger is not set up
        if (data.user) {
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: data.user.id,
            name,
            role,
            email,
            created_at: new Date().toISOString(),
          });
          
          if (profileError) {
            console.warn('Profile sync warning:', profileError.message);
          }
        }

        return {
          success: true,
          session: data.session,
          email: data.user?.email || email
        };

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

        if (data?.user) {
          if (!data.user.email_confirmed_at) {
            await supabase.auth.signOut();
            return { success: false, error: 'Please verify your email first.' };
          }

          // Automatically store the mapped role in metadata upon login
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

        return { success: true };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Supabase signin failed';
        return { success: false, error: errorMsg };
      }
    }

    // Intercept Demo Accounts for Judges (Bypasses email verification)
    const demoAccounts = [
      { email: 'visitor.demo@stadiumos.ai', password: 'Visitor@2026', name: 'Visitor Demo', role: 'visitor' as const },
      { email: 'staff.demo@stadiumos.ai', password: 'Staff@2026', name: 'Staff Demo', role: 'staff' as const },
      { email: 'fifa.demo@stadiumos.ai', password: 'FIFA@2026', name: 'FIFA Executive Demo', role: 'fifa' as const }
    ];

    const matchedDemo = demoAccounts.find(d => d.email === email);
    if (matchedDemo) {
      if (password === matchedDemo.password) {
        const demoUser: UserProfile = {
          id: `demo-${matchedDemo.role}-id`,
          email: matchedDemo.email,
          name: matchedDemo.name,
          role: matchedDemo.role,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('stadium_os_demo_user', JSON.stringify(demoUser));
        
        setUser(demoUser);
        router.push(getDashboardForRole(demoUser.role));
        return { success: true };
      } else {
        return { success: false, error: 'Invalid credentials for protected demo account.' };
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

  const updateProfile = async (updates: { 
    name?: string; 
    avatarUrl?: string; 
    phoneNumber?: string; 
    preferredLanguage?: string;
    email?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };

    if (isSupabaseConfigured && supabase) {
      try {
        if (updates.email && updates.email !== user.email) {
          const { error } = await supabase.auth.updateUser({ email: updates.email });
          if (error) return { success: false, error: error.message };
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            name: updates.name,
            avatar_url: updates.avatarUrl,
            phone_number: updates.phoneNumber,
            preferred_language: updates.preferredLanguage,
          })
          .eq('id', user.id);

        if (profileError) return { success: false, error: profileError.message };

        await supabase.auth.updateUser({
          data: { 
            name: updates.name,
            avatarUrl: updates.avatarUrl,
          }
        }).catch(() => {});

      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Supabase profile update failed' };
      }
    }

    const updatedUser = {
      ...user,
      name: updates.name ?? user.name,
      avatarUrl: updates.avatarUrl ?? user.avatarUrl,
      phoneNumber: updates.phoneNumber ?? user.phoneNumber,
      preferredLanguage: updates.preferredLanguage ?? user.preferredLanguage,
    };

    setUser(updatedUser);
    localStorage.setItem('stadium_os_demo_user', JSON.stringify(updatedUser));

    const usersStr = localStorage.getItem('stadium_os_demo_users') || '[]';
    try {
      const users = JSON.parse(usersStr);
      const updatedUsers = users.map((u: DemoUser) => u.id === user.id ? { ...u, ...updates } : u);
      localStorage.setItem('stadium_os_demo_users', JSON.stringify(updatedUsers));
    } catch (e) {
      console.error(e);
    }

    return { success: true };
  };

  const [toasts, setToasts] = useState<{ id: string; message: string; description?: string; type: 'success' | 'info' | 'warning' | 'error' }[]>([]);
  
  const showToast = useCallback((message: string, description?: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, description, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

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
        updateProfile,
        showToast,
      }}
    >
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-4 rounded-xl border shadow-xl flex gap-3 max-w-sm pointer-events-auto backdrop-blur-md transition-all duration-300 ${
              t.type === 'success' 
                ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-250 shadow-emerald-950/20'
                : t.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/30 text-amber-250 shadow-amber-950/20'
                : t.type === 'error'
                ? 'bg-red-950/90 border-red-500/30 text-red-250 shadow-red-950/20'
                : 'bg-cyan-950/90 border-cyan-500/30 text-cyan-250 shadow-cyan-950/20'
            }`}
            style={{
              animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
            <span className="text-base shrink-0 select-none">
              {t.type === 'success' ? '✓' : t.type === 'warning' ? '⚠' : t.type === 'error' ? '✗' : 'ℹ'}
            </span>
            <div className="space-y-0.5 text-left">
              <span className="font-bold text-xs block leading-tight text-white">{t.message}</span>
              {t.description && (
                <p className="text-[10px] text-slate-350 leading-relaxed font-normal mt-0.5">{t.description}</p>
              )}
            </div>
          </div>
        ))}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}} />
      </div>
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
