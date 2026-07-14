'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useAuth } from '@/components/auth/AuthProvider';
import { DatabaseService } from '@/lib/db';
import { TransportStatus, AccessibilityRequest } from '@/types';
import { 
  MapPin, Ticket, Bus, Bot, Accessibility, Leaf, Bell, User, QrCode, 
  Map, ArrowUpRight, Compass, FlameKindling, Navigation, Smile, Coffee, HelpCircle, Trophy, Info
} from 'lucide-react';
import Link from 'next/link';

export default function VisitorDashboard() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [transports, setTransports] = useState<TransportStatus[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessibilityRequest[]>([]);
  
  // Accessibility Form States
  const [accessType, setAccessType] = useState<AccessibilityRequest['requestType']>('wheelchair');
  const [accessLocation, setAccessLocation] = useState('');
  const [requestStatus, setRequestStatus] = useState<string | null>(null);

  // Chat/AI assistant preview state
  const [chatInput, setChatInput] = useState('');

  const fetchVisitorData = () => {
    DatabaseService.getTransportStatus().then(setTransports).catch(console.error);
    DatabaseService.getAccessibilityRequests().then((reqs) => {
      if (user?.email) {
        setAccessRequests(reqs.filter((r) => r.userEmail === user.email));
      }
    }).catch(console.error);
  };

  useEffect(() => {
    setMounted(true);
    fetchVisitorData();
  }, [user]);

  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      fetchVisitorData();
    }, 20000);
    return () => clearInterval(interval);
  }, [mounted, user]);

  const handleAccessRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessLocation || !user?.email) return;

    try {
      await DatabaseService.addAccessibilityRequest({
        userEmail: user.email,
        requestType: accessType,
        location: accessLocation,
      });
      setRequestStatus('Request submitted successfully! Staff has been notified.');
      setAccessLocation('');
      // Refresh requests list
      const reqs = await DatabaseService.getAccessibilityRequests();
      setAccessRequests(reqs.filter((r) => r.userEmail === user.email));
      setTimeout(() => setRequestStatus(null), 5000);
    } catch (err) {
      console.error(err);
      setRequestStatus('Failed to submit request. Please try again.');
    }
  };

  if (!mounted || !user) return null;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/20 to-slate-900/40 border border-cyan-950/40">
        <div>
          <h2 className="text-2xl font-black text-white">Welcome back, {user.name}!</h2>
          <p className="text-sm text-slate-400">Visitor Portal • StadiumOS Fan Companion</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="cyan" className="px-3 py-1 uppercase tracking-widest text-[10px]">
            Spectator Clearance
          </Badge>
          <Badge variant="secondary" className="px-3 py-1 font-mono text-[10px] text-slate-400 border-slate-800">
            Seat: SEC 102 | ROW H | SEAT 14
          </Badge>
        </div>
      </div>

      {/* Global Match Center & Live Weather Row */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Match Center Card (Fan View) */}
        <Card className="md:col-span-2 bg-[#080d19]/45 border-slate-900/60 overflow-hidden relative flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/5 to-transparent blur-3xl rounded-full" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-white">
                <Trophy className="h-4.5 w-4.5 text-amber-400" />
                Global Match Center
              </span>
              <Badge variant="warning" className="text-[9px] uppercase tracking-wider font-mono">Quarter Final</Badge>
            </CardTitle>
            <CardDescription className="text-xs">Stadium Alpha Matchday Telemetry</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 space-y-4 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between text-center bg-slate-950/40 border border-slate-900 rounded-xl p-4">
              <div className="flex-1">
                <span className="text-2xl font-black block text-white">ARG</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Argentina</span>
              </div>
              <div className="px-4">
                <span className="text-xs font-mono font-bold text-cyan-400 block mb-1">KICKOFF COUNTDOWN</span>
                <Badge variant="secondary" className="font-mono text-sm py-1 px-3 bg-blue-950/80 text-blue-300 border border-blue-800/40">1h 24m</Badge>
              </div>
              <div className="flex-1">
                <span className="text-2xl font-black block text-white">GER</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Germany</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5 text-xs">
              <div className="p-3 rounded-lg border border-slate-800 bg-[#070b13]/30">
                <span className="text-slate-400 block text-[10px] uppercase font-mono tracking-wider mb-0.5">Match Officials</span>
                <span className="text-slate-200 font-bold">Referee: Piero Maza (Chile)</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-800 bg-[#070b13]/30">
                <span className="text-slate-400 block text-[10px] uppercase font-mono tracking-wider mb-0.5">Stadium Seating</span>
                <span className="text-slate-200 font-bold">68,420 / 70,000 Attendance (97%)</span>
              </div>
            </div>

            {/* Fan Comfort Advisory */}
            <div className="flex items-start gap-2.5 p-3 rounded-lg border border-amber-900/30 bg-amber-950/10 text-xs">
              <Info className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-400 block mb-0.5">Spectator Hydration Advisory</span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Temperatures are currently peak at 31°C (Partly Cloudy). Free chilled water refill stations are active across all Gate 4 concourse loops.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Weather & Environment Widget */}
        <Card className="bg-[#080d19]/45 border-slate-900/60 overflow-hidden relative flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-slate-900/60">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span className="text-white">Live Weather Center</span>
              <Badge variant="destructive" className="text-[9px] uppercase tracking-wider font-mono animate-pulse">Heat Advisory</Badge>
            </CardTitle>
            <CardDescription className="text-xs">Environmental Sensor Matrix</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-center bg-slate-950/35 border border-slate-900 p-3.5 rounded-xl">
              <div>
                <span className="text-3xl font-black text-white">31°C</span>
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Partly Cloudy</span>
              </div>
              <span className="text-3xl">⛅</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 leading-normal">
              <div className="p-2 border border-slate-800 bg-[#070b13]/20 rounded">
                Humidity: <span className="text-white font-bold">65%</span>
              </div>
              <div className="p-2 border border-slate-800 bg-[#070b13]/20 rounded">
                Wind Speed: <span className="text-white font-bold">14 km/h</span>
              </div>
              <div className="p-2 border border-slate-800 bg-[#070b13]/20 rounded">
                Rain Probability: <span className="text-white font-bold">12%</span>
              </div>
              <div className="p-2 border border-slate-800 bg-[#070b13]/20 rounded">
                UV Index: <span className="text-amber-500 font-bold">8 (Very High)</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 p-2 border border-dashed border-slate-800 rounded text-center bg-slate-950/20">
              💡 <span className="font-semibold text-slate-200">Recommendation:</span> Sunscreens active. High heat index.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Ticket Information & QR */}
        <Card className="md:col-span-1 bg-[#080d19]/45 border-slate-900/60 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/10 to-transparent blur-2xl rounded-full" />
          <CardHeader className="pb-3 border-b border-slate-900/40">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-cyan-400">
              <Ticket className="h-4.5 w-4.5" />
              Digital Match Ticket
            </CardTitle>
            <CardDescription className="text-xs">Scan at the turnstile gate for entry</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
            {/* Holographic Entry Pass */}
            <div className="w-full max-w-[240px] p-4 rounded-xl bg-gradient-to-b from-[#0c1326] to-[#050811] border border-cyan-500/15 shadow-xl relative">
              <div className="absolute top-2 left-2 text-[8px] font-mono text-cyan-400/60 uppercase">FIFA 2026 PASS</div>
              <div className="absolute top-2 right-2 text-[8px] font-mono text-cyan-400/60 uppercase">GATE 4</div>
              
              <div className="my-3 flex justify-center p-3.5 bg-white rounded-lg shadow-inner">
                <QrCode className="h-28 w-28 text-slate-950" />
              </div>
              
              <div className="border-t border-dashed border-slate-800 my-3.5 pt-3.5 text-left text-xs font-mono space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span>Match:</span>
                  <span className="text-white font-bold">Argentina vs Germany</span>
                </div>
                <div className="flex justify-between">
                  <span>Venue:</span>
                  <span className="text-white font-bold">Stadium Alpha</span>
                </div>
                <div className="flex justify-between">
                  <span>Seat:</span>
                  <span className="text-cyan-400 font-extrabold">SEC 102, Row H, Seat 14</span>
                </div>
              </div>
            </div>
            
            <div className="w-full text-xs space-y-2 text-slate-400">
              <p>📍 Recommended Entrance: <strong className="text-white">Gate 4 (North Side)</strong></p>
              <p>⏰ Recommended Arrival Time: <strong className="text-white">18:30 (Kickoff at 20:00)</strong></p>
            </div>
          </CardContent>
        </Card>

        {/* Smart Navigation & Notifications */}
        <div className="md:col-span-2 space-y-6">
          {/* Smart Navigation Hub */}
          <Card className="bg-[#080d19]/45 border-slate-900/60">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
                  <Compass className="h-4.5 w-4.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
                  Indoor Smart Navigation
                </CardTitle>
                <CardDescription className="text-xs">Find amenities, seats, and exits inside the venue</CardDescription>
              </div>
              <Link href="/navigation">
                <Button variant="outline" size="sm" className="h-7 text-xs border-slate-800 bg-[#0c101d] text-cyan-400">
                  Open Map <ArrowUpRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3 pt-3">
              {[
                { label: 'Find My Seat', route: '/navigation?target=seat', icon: MapPin, desc: 'Direct route to SEC 102' },
                { label: 'Concessions & Food', route: '/navigation?target=food', icon: Coffee, desc: 'Hot dogs, tacos & drinks' },
                { label: 'Closest Restrooms', route: '/navigation?target=restroom', icon: Smile, desc: 'Estimated wait: 2 mins' },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Link key={idx} href={item.route} className="block group">
                    <div className="p-3.5 rounded-xl border border-slate-900 bg-slate-950/40 hover:bg-[#0c1326] hover:border-cyan-500/25 transition-all text-xs">
                      <div className="p-1.5 rounded-lg bg-cyan-950/30 text-cyan-400 border border-cyan-900/20 w-fit mb-2.5 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h4 className="font-bold text-white mb-0.5 group-hover:text-cyan-300 transition-colors">{item.label}</h4>
                      <p className="text-[10px] text-slate-500 leading-tight">{item.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          {/* Personal Notifications & Transit Status */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Personal Notifications */}
            <Card className="bg-[#080d19]/45 border-slate-900/60 flex flex-col h-[280px]">
              <CardHeader className="pb-3 border-b border-slate-900/30">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-blue-400">
                  <Bell className="h-4 w-4" />
                  Notifications Feed
                </CardTitle>
                <CardDescription className="text-xs">Live updates regarding matchday</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {[
                  { title: 'Gates Are Open!', desc: 'Pre-match festivities are underway. Please make your way to Gate 4.', time: '10m ago', urgent: true },
                  { title: 'Transit Advisory', desc: 'Metro Line B is experiencing high passenger volume. We recommend Shuttle Pods.', time: '30m ago', urgent: false },
                  { title: 'Weather Warning', desc: 'Clear skies forecast. Temperatures drop to 18°C after sunset. Dress accordingly.', time: '1h ago', urgent: false }
                ].map((note, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg border border-slate-900 bg-slate-950/30 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-bold ${note.urgent ? 'text-cyan-400' : 'text-slate-200'}`}>{note.title}</span>
                      <span className="text-[9px] text-slate-500">{note.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{note.desc}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Transit updates */}
            <Card className="bg-[#080d19]/45 border-slate-900/60 flex flex-col h-[280px]">
              <CardHeader className="pb-3 border-b border-slate-900/30">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-amber-400">
                  <Bus className="h-4 w-4" />
                  Transit & Shuttle Guidance
                </CardTitle>
                <CardDescription className="text-xs">Real-time local transport timings</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {transports.slice(0, 3).map((tr) => (
                  <div key={tr.id} className="flex justify-between items-center p-2.5 rounded-lg border border-slate-900 bg-slate-950/20 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-slate-900 text-slate-300">
                        <Bus className="h-3.5 w-3.5 text-amber-400" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-200">{tr.lineName}</h5>
                        <p className="text-[9px] text-slate-500 capitalize">{tr.mode}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={tr.status === 'on-time' ? 'success' : 'warning'} className="text-[9px] py-0">
                        {tr.status === 'on-time' ? `${tr.etaMinutes} mins` : tr.status}
                      </Badge>
                      <p className="text-[9px] text-slate-500 mt-0.5">{tr.occupancy} load</p>
                    </div>
                  </div>
                ))}
                <Link href="/transport">
                  <Button variant="ghost" size="sm" className="w-full text-xs text-slate-400 hover:text-white mt-1 border border-dashed border-slate-900">
                    See All Transit Lines
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Sustainability & Accessibility desks */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Sustainability Carbon Offset Widget */}
        <Card className="bg-[#080d19]/45 border-slate-900/60 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500/10 to-transparent blur-2xl rounded-full" />
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-emerald-400">
              <Leaf className="h-4.5 w-4.5" />
              Green Stadium Audit
            </CardTitle>
            <CardDescription className="text-xs">Your contribution to a carbon-neutral tournament</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="p-4 rounded-xl border border-slate-900 bg-slate-950/40 grid grid-cols-2 gap-4 text-center">
              <div>
                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Your Green Ratio</span>
                <span className="text-2xl font-black text-white">92%</span>
                <span className="block text-[8px] text-emerald-400 mt-1">Transit + Solar power</span>
              </div>
              <div className="border-l border-slate-900">
                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Carbon Offset</span>
                <span className="text-2xl font-black text-white">3.4 <span className="text-xs text-slate-400">kg</span></span>
                <span className="block text-[8px] text-slate-400 mt-1">CO2 saved today</span>
              </div>
            </div>
            
            <div className="text-xs text-slate-400 leading-relaxed space-y-2">
              <p>🌍 Over <strong>86%</strong> of Stadium Alpha matches are powered directly by the solar panels above the spectator roof structure.</p>
              <div className="flex justify-between items-center text-[10px] bg-slate-950/20 p-2 rounded border border-slate-900/80 text-slate-300">
                <span>Composting pod usage count:</span>
                <Badge variant="cyan">3 Items</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Assistance desk */}
        <Card className="bg-[#080d19]/45 border-slate-900/60">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-cyan-400">
              <Accessibility className="h-4.5 w-4.5" />
              Accessibility Assistance Desk
            </CardTitle>
            <CardDescription className="text-xs">Request special helper pods or companion volunteers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <form onSubmit={handleAccessRequestSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Required Service</label>
                  <Select
                    options={[
                      { value: 'wheelchair', label: 'Wheelchair pod escort' },
                      { value: 'guide', label: 'Audio navigation guide' },
                      { value: 'sensory', label: 'Sensory room request' },
                      { value: 'other', label: 'Other special support' }
                    ]}
                    value={accessType}
                    onChange={(e) => setAccessType(e.target.value as AccessibilityRequest['requestType'])}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Meeting Point / Gate</label>
                  <Input
                    placeholder="e.g. Turnstile Gate 4"
                    value={accessLocation}
                    onChange={(e) => setAccessLocation(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              {requestStatus && (
                <div className="text-[10px] text-cyan-400 bg-cyan-950/20 border border-cyan-800/30 p-2.5 rounded-lg">
                  {requestStatus}
                </div>
              )}

              <Button type="submit" size="sm" className="w-full bg-cyan-600 hover:bg-cyan-700 text-xs">
                Request Assistance Escort
              </Button>
            </form>

            {/* List active requests */}
            {accessRequests.length > 0 && (
              <div className="border-t border-slate-900 pt-3">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Your Active Assistance Requests:</span>
                <div className="space-y-2">
                  {accessRequests.map((req) => (
                    <div key={req.id} className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900 text-[10px]">
                      <div>
                        <span className="font-bold text-white capitalize">{req.requestType}</span> escort at {req.location}
                      </div>
                      <Badge variant={req.status === 'pending' ? 'warning' : 'success'} className="text-[8px] py-0 px-1.5 uppercase">
                        {req.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Assistant Quick Access */}
      <Card className="bg-[#080d19]/45 border-slate-900/60 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-cyan-500/5 to-transparent blur-3xl rounded-full" />
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
            <Bot className="h-4.5 w-4.5 text-cyan-400" />
            AI Fan Assistant
          </CardTitle>
          <CardDescription className="text-xs">Ask questions about routes, schedules, concessions, and food</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex gap-2">
            <Input
              placeholder="How do I get to Gate 4? / Where are the vegetarian concessions?"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="text-xs"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && chatInput) {
                  window.location.href = `/assistant?q=${encodeURIComponent(chatInput)}`;
                }
              }}
            />
            <Link href={chatInput ? `/assistant?q=${encodeURIComponent(chatInput)}` : '/assistant'}>
              <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-xs shrink-0 h-9">
                Ask Assistant
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
