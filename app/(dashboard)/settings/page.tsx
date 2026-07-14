'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/auth/AuthProvider';
import { Settings, Shield, Server, Bot, EyeOff, Save, CheckCircle, Info } from 'lucide-react';

export default function SettingsPage() {
  const { user, isDemoMode } = useAuth();
  
  // Settings Form States
  const [profileName, setProfileName] = useState(user?.name || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
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
              <Button variant="outline" size="sm" className="w-full text-xs border-slate-800 bg-[#0c101d] text-slate-300">
                Purge Offline Storage
              </Button>
              <Button variant="outline" size="sm" className="w-full text-xs border-slate-800 bg-[#0c101d] text-slate-300">
                Download Audit Log
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Environment Keys Status */}
        <div className="md:col-span-2 space-y-6">
          {/* Config Forms */}
          <Card className="bg-[#080d19]/30 border-slate-900/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Clearance Profile Details</CardTitle>
              <CardDescription className="text-xs">Update your local profile name identifier.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveSettings}>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Staff Identifier Name</label>
                  <Input 
                    value={profileName} 
                    onChange={e => setProfileName(e.target.value)} 
                    className="mt-1.5"
                    required 
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center border-t border-slate-900/60 pt-4 p-6">
                {saveSuccess ? (
                  <span className="text-xs text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4" /> Changes applied locally!
                  </span>
                ) : (
                  <span />
                )}
                <Button type="submit" size="sm" className="flex items-center gap-1.5">
                  <Save className="h-3.5 w-3.5" /> Save Changes
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
