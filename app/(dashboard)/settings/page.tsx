'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useAuth } from '@/components/auth/AuthProvider';
import { playSynthTone } from '@/lib/audio';
import { 
  Settings, Shield, Server, Bot, Save, CheckCircle, Info, Volume2, 
  Accessibility, Languages, Eye, Layout, Type, AlertTriangle
} from 'lucide-react';

export default function SettingsPage() {
  const { user, isDemoMode } = useAuth();
  
  // Settings Form States
  const [profileName, setProfileName] = useState(user?.name || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preference States
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [theme, setTheme] = useState('glassmorphism');
  const [language, setLanguage] = useState('en');
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState('medium');

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        setSoundEnabled(localStorage.getItem('stadium_sound_enabled') === 'true');
        setAnimationsEnabled(localStorage.getItem('stadium_animations_enabled') !== 'false');
        setTheme(localStorage.getItem('stadium_theme') || 'glassmorphism');
        setLanguage(localStorage.getItem('stadium_language') || 'en');
        setHighContrast(localStorage.getItem('stadium_high_contrast') === 'true');
        setFontSize(localStorage.getItem('stadium_font_size') || 'medium');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if demo user is attempting to edit protected attributes
    const isDemoUser = !!(user?.email && [
      'visitor.demo@stadiumos.ai',
      'staff.demo@stadiumos.ai',
      'fifa.demo@stadiumos.ai'
    ].includes(user.email));

    if (isDemoUser && profileName !== user?.name) {
      setError('This is a protected demonstration account.');
      setTimeout(() => setError(null), 4000);
      return;
    }

    // Save to localStorage
    localStorage.setItem('stadium_sound_enabled', String(soundEnabled));
    localStorage.setItem('stadium_animations_enabled', String(animationsEnabled));
    localStorage.setItem('stadium_theme', theme);
    localStorage.setItem('stadium_language', language);
    localStorage.setItem('stadium_high_contrast', String(highContrast));
    localStorage.setItem('stadium_font_size', fontSize);

    // Play chirp feedback if enabled
    if (soundEnabled) {
      setTimeout(() => playSynthTone('notification'), 100);
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-white">System Settings</h2>
          <p className="text-sm text-slate-400">Manage control console configurations, server variables, and profile information.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Side: Profile Card */}
        <div className="md:col-span-1 space-y-4">
          <Card className="bg-[#080d19]/45 border-slate-900/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-cyan-400">
                <Shield className="h-4 w-4" />
                Profile Clearance
              </CardTitle>
              <CardDescription className="text-xs">Security clearance profiles details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <span className="text-slate-500 uppercase tracking-wider font-bold text-[10px] block mb-1">Clearance Tier</span>
                <Badge variant="cyan" className="uppercase tracking-widest">{user?.role || 'Operator'}</Badge>
              </div>
              <div>
                <span className="text-slate-500 uppercase tracking-wider font-bold text-[10px] block mb-1">Authorized Email</span>
                <span className="text-slate-200 font-mono text-[11px]">{user?.email}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase tracking-wider font-bold text-[10px] block mb-1">Session Enrolled</span>
                <span className="text-slate-400">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#080d19]/45 border-slate-900/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-blue-400">
                PWA Local Cache
              </CardTitle>
              <CardDescription className="text-xs">Manage device caches and logs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="w-full text-xs border-slate-800 bg-[#0c101d] text-slate-300 cursor-pointer"
              >
                Purge Offline Storage
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Configuration Forms */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-[#080d19]/30 border-slate-900/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Console Preferences</CardTitle>
              <CardDescription className="text-xs">Configure audio, UI feedback, and theme variables.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveSettings}>
              <CardContent className="space-y-5">
                {user?.email && [
                  'visitor.demo@stadiumos.ai',
                  'staff.demo@stadiumos.ai',
                  'fifa.demo@stadiumos.ai'
                ].includes(user.email) && (
                  <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3.5 text-xs text-cyan-400 flex gap-2 items-start border-l-4 border-l-cyan-500">
                    <Shield className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-bold">Protected Demonstration Account</span>
                      <p className="text-[10px] text-slate-400 font-sans">This is a protected demonstration account. Credentials and clearance roles cannot be modified.</p>
                    </div>
                  </div>
                )}
                
                {/* Identifier Profile name */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Staff Identifier Name</label>
                  <Input 
                    value={profileName} 
                    onChange={e => setProfileName(e.target.value)} 
                    className="mt-1.5 text-xs bg-slate-950/60"
                    required 
                  />
                </div>

                {/* Sounds Synth config */}
                <div className="flex items-center justify-between p-3.5 rounded-lg border border-slate-800 bg-slate-950/20">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Volume2 className="h-4 w-4 text-cyan-400" />
                      Operations Audio Synth
                    </span>
                    <span className="text-[10px] text-slate-400 block">Enables high-fidelity synthesiser audio cues on task actions.</span>
                  </div>
                  <div className="flex gap-1.5">
                    <Button
                      type="button"
                      variant={soundEnabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSoundEnabled(true)}
                      className="text-xs h-7.5 px-3 cursor-pointer"
                    >
                      On
                    </Button>
                    <Button
                      type="button"
                      variant={!soundEnabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSoundEnabled(false)}
                      className="text-xs h-7.5 px-3 cursor-pointer"
                    >
                      Mute
                    </Button>
                  </div>
                </div>

                {/* UI Animations toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-lg border border-slate-800 bg-slate-950/20">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Layout className="h-4 w-4 text-cyan-400" />
                      Transitions & Stagger Animations
                    </span>
                    <span className="text-[10px] text-slate-400 block">Toggles dashboard fade transitions and slider counters.</span>
                  </div>
                  <div className="flex gap-1.5">
                    <Button
                      type="button"
                      variant={animationsEnabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAnimationsEnabled(true)}
                      className="text-xs h-7.5 px-3 cursor-pointer"
                    >
                      Enable
                    </Button>
                    <Button
                      type="button"
                      variant={!animationsEnabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAnimationsEnabled(false)}
                      className="text-xs h-7.5 px-3 cursor-pointer"
                    >
                      Disable
                    </Button>
                  </div>
                </div>

                {/* Grid Selectors */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                      <Languages className="h-3.5 w-3.5 text-cyan-400" />
                      System Language
                    </label>
                    <Select
                      options={[
                        { value: 'en', label: 'English (US/UK)' },
                        { value: 'es', label: 'Español (ES/MX)' },
                        { value: 'fr', label: 'Français (FR)' },
                        { value: 'de', label: 'Deutsch' }
                      ]}
                      value={language}
                      onChange={e => setLanguage(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                      <Accessibility className="h-3.5 w-3.5 text-cyan-400" />
                      High Contrast Mode
                    </label>
                    <Select
                      options={[
                        { value: 'false', label: 'Contrast: Normal' },
                        { value: 'true', label: 'Contrast: High Contrast' }
                      ]}
                      value={highContrast ? 'true' : 'false'}
                      onChange={e => setHighContrast(e.target.value === 'true')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                      <Type className="h-3.5 w-3.5 text-cyan-400" />
                      Display Font Size
                    </label>
                    <Select
                      options={[
                        { value: 'small', label: 'Text Size: Small' },
                        { value: 'medium', label: 'Text Size: Medium' },
                        { value: 'large', label: 'Text Size: Large' }
                      ]}
                      value={fontSize}
                      onChange={e => setFontSize(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                      <Eye className="h-3.5 w-3.5 text-cyan-400" />
                      UI Aesthetic Theme
                    </label>
                    <Select
                      options={[
                        { value: 'glassmorphism', label: 'Glassmorphic Dark' },
                        { value: 'flat-dark', label: 'Flat Charcoal Dark' }
                      ]}
                      value={theme}
                      onChange={e => setTheme(e.target.value)}
                    />
                  </div>
                </div>

              </CardContent>
              <CardFooter className="flex justify-between items-center border-t border-slate-900/60 pt-4 p-6 bg-slate-950/15">
                {error ? (
                  <span className="text-xs text-red-400 flex items-center gap-1.5 font-bold animate-shake">
                    <AlertTriangle className="h-4 w-4" /> {error}
                  </span>
                ) : saveSuccess ? (
                  <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-bold">
                    <CheckCircle className="h-4 w-4" /> Preferences applied successfully!
                  </span>
                ) : (
                  <span />
                )}
                <Button type="submit" size="sm" className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white cursor-pointer font-bold h-8.5 px-4 rounded-lg">
                  <Save className="h-3.5 w-3.5" /> Save Preferences
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Credentials Indicators */}
          <Card className="bg-[#080d19]/30 border-slate-900/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Global Server Integration Auditing</CardTitle>
              <CardDescription className="text-xs">Connection status audits for database endpoints and AI services.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 border-t border-slate-900/60 pt-4 text-xs">
              {/* Supabase Status */}
              <div className="p-3.5 rounded-lg border border-slate-800 bg-[#080d19]/35 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-cyan-400">
                    <Server className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Supabase Database Endpoint</h4>
                    <p className="text-[10px] text-slate-500">Row Level Security & email auth routing</p>
                  </div>
                </div>
                <div>
                  {isDemoMode ? (
                    <Badge variant="warning">Fallback Demo Active</Badge>
                  ) : (
                    <Badge variant="success">Active Connection</Badge>
                  )}
                </div>
              </div>

              {/* Gemini Status */}
              <div className="p-3.5 rounded-lg border border-slate-800 bg-[#080d19]/35 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-purple-400">
                    <Bot className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Gemini AI Model Wrapper</h4>
                    <p className="text-[10px] text-slate-500">Secure server-side API key routing</p>
                  </div>
                </div>
                <div>
                  {process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key' ? (
                    <Badge variant="success">Active Connection</Badge>
                  ) : (
                    <Badge variant="warning">Local Simulation Mode</Badge>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2 rounded border border-slate-800 bg-slate-950/60 p-3 text-[10px] text-slate-400 leading-relaxed">
                <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>To switch from mock demo mode to full Supabase/Gemini API pipelines, enter valid credentials in the `.env.local` file at the project root and restart the development server.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
