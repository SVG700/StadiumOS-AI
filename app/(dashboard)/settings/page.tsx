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
  Settings, Shield, Save, CheckCircle, Volume2, 
  Accessibility, Languages, Eye, Layout, Type
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  
  // Settings Form States
  const [profileName, setProfileName] = useState(user?.name || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

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

    // Save preferences to localStorage
    localStorage.setItem('stadium_sound_enabled', String(soundEnabled));
    localStorage.setItem('stadium_animations_enabled', String(animationsEnabled));
    localStorage.setItem('stadium_theme', theme);
    localStorage.setItem('stadium_language', language);
    localStorage.setItem('stadium_high_contrast', String(highContrast));
    localStorage.setItem('stadium_font_size', fontSize);

    if (soundEnabled) {
      setTimeout(() => playSynthTone('notification'), 100);
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-white">System Settings</h2>
          <p className="text-xs text-slate-400">Manage control console configurations, audio feedback, and profile preferences.</p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {/* Left Side: Profile Card & Cache */}
        <div className="space-y-4">
          <Card className="bg-[#080d19]/45 border-slate-900/60">
            <CardHeader className="py-3 px-4 border-b border-slate-900/40">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-cyan-400">
                <Shield className="h-4 w-4" />
                Staff Clearance Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div>
                <span className="text-slate-500 uppercase tracking-wider font-bold text-[9px] block mb-0.5">Role Tier</span>
                <Badge variant="cyan" className="uppercase tracking-widest text-[9px]">{user?.role || 'Operator'}</Badge>
              </div>
              <div>
                <span className="text-slate-500 uppercase tracking-wider font-bold text-[9px] block mb-0.5">Account Email</span>
                <span className="text-slate-200 font-mono text-[11px] block truncate">{user?.email}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase tracking-wider font-bold text-[9px] block mb-0.5">Session Initialized</span>
                <span className="text-slate-400 text-[11px]">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#080d19]/45 border-slate-900/60">
            <CardHeader className="py-3 px-4 border-b border-slate-900/40">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-blue-400">
                Console Cache
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="w-full text-xs border-slate-800 bg-[#0c101d] text-slate-300 cursor-pointer"
              >
                Clear Local Console Cache
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Preferences Form */}
        <div className="md:col-span-2">
          <Card className="bg-[#080d19]/30 border-slate-900/60">
            <CardHeader className="py-3 px-4 border-b border-slate-900/40">
              <CardTitle className="text-xs font-semibold">Console Preferences</CardTitle>
              <CardDescription className="text-[10px]">Configure audio cues, UI themes, and display settings.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveSettings}>
              <CardContent className="p-4 space-y-4">
                {/* Profile Name */}
                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Staff Display Name</label>
                  <Input 
                    value={profileName} 
                    onChange={e => setProfileName(e.target.value)} 
                    className="mt-1 text-xs bg-slate-950/60 border-slate-800 text-white"
                    required 
                  />
                </div>

                {/* Audio Synth */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/20">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Volume2 className="h-4 w-4 text-cyan-400" />
                      Operations Audio Cues
                    </span>
                    <span className="text-[10px] text-slate-400 block">Enables synthesizer audio feedback on task actions.</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant={soundEnabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSoundEnabled(true)}
                      className="text-xs h-7 px-2.5 cursor-pointer"
                    >
                      On
                    </Button>
                    <Button
                      type="button"
                      variant={!soundEnabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSoundEnabled(false)}
                      className="text-xs h-7 px-2.5 cursor-pointer"
                    >
                      Mute
                    </Button>
                  </div>
                </div>

                {/* UI Transitions */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/20">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Layout className="h-4 w-4 text-cyan-400" />
                      UI Animations
                    </span>
                    <span className="text-[10px] text-slate-400 block">Dashboard transitions and counters.</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant={animationsEnabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAnimationsEnabled(true)}
                      className="text-xs h-7 px-2.5 cursor-pointer"
                    >
                      Enable
                    </Button>
                    <Button
                      type="button"
                      variant={!animationsEnabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAnimationsEnabled(false)}
                      className="text-xs h-7 px-2.5 cursor-pointer"
                    >
                      Disable
                    </Button>
                  </div>
                </div>

                {/* Language & Contrast */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1 mb-1">
                      <Languages className="h-3.5 w-3.5 text-cyan-400" />
                      System Language
                    </label>
                    <Select
                      options={[
                        { value: 'en', label: 'English (US/UK)' },
                        { value: 'es', label: 'Español' },
                        { value: 'fr', label: 'Français' },
                        { value: 'de', label: 'Deutsch' }
                      ]}
                      value={language}
                      onChange={e => setLanguage(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1 mb-1">
                      <Accessibility className="h-3.5 w-3.5 text-cyan-400" />
                      High Contrast Mode
                    </label>
                    <Select
                      options={[
                        { value: 'false', label: 'Normal Contrast' },
                        { value: 'true', label: 'High Contrast' }
                      ]}
                      value={highContrast ? 'true' : 'false'}
                      onChange={e => setHighContrast(e.target.value === 'true')}
                    />
                  </div>
                </div>

                {/* Font Size & Theme */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1 mb-1">
                      <Type className="h-3.5 w-3.5 text-cyan-400" />
                      Display Font Size
                    </label>
                    <Select
                      options={[
                        { value: 'small', label: 'Small' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'large', label: 'Large' }
                      ]}
                      value={fontSize}
                      onChange={e => setFontSize(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1 mb-1">
                      <Eye className="h-3.5 w-3.5 text-cyan-400" />
                      Aesthetic Theme
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

              <CardFooter className="flex justify-between items-center border-t border-slate-900/60 p-4 bg-slate-950/15">
                {saveSuccess ? (
                  <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-bold">
                    <CheckCircle className="h-4 w-4" /> Preferences Saved!
                  </span>
                ) : (
                  <span />
                )}
                <Button type="submit" size="sm" className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white cursor-pointer font-bold h-8 px-4 rounded-lg">
                  <Save className="h-3.5 w-3.5" /> Save Settings
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
