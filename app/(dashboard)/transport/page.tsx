'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bus, Clock, AlertTriangle, RefreshCw } from 'lucide-react';

export default function TransportationPage() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  };

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Logistics & Transportation</h2>
          <p className="text-xs text-slate-400">Metro line status, parking shuttle intervals, and road congestion monitoring.</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
          className="text-xs flex gap-1.5 items-center border-slate-800 bg-[#0c101d] text-slate-300 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Transit</span>
        </Button>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {/* Left Side: Road Congestion & Alerts */}
        <div className="space-y-5">
          <Card className="bg-[#080d19]/45 border-slate-900/60 border-amber-950/30">
            <CardHeader className="py-3 px-4 border-b border-slate-900/40">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                Road Congestion Alerts
              </CardTitle>
              <CardDescription className="text-[10px]">Real-time inbound highway conditions</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5 text-xs">
              <div className="p-3 rounded bg-amber-500/10 border border-amber-500/20 text-slate-300 space-y-1">
                <h4 className="font-bold text-white text-xs">Avenue 4 Exit Congestion</h4>
                <p className="text-[10px] text-slate-400 leading-tight">Perimeter security checks causing 8 min delay. Shuttle Route B redirected.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Live Transit Board (Metro & Shuttles) */}
        <Card className="md:col-span-2 bg-[#080d19]/45 border-slate-900/60">
          <CardHeader className="py-3 px-4 border-b border-slate-900/40">
            <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-white">
              <Clock className="h-4 w-4 text-cyan-400" />
              Live Metro & Shuttle Status Board
            </CardTitle>
            <CardDescription className="text-[10px]">Incoming and departing spectator transit telemetry</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {[
              { id: '1', route: 'Stadium Express (Metro Line 1)', mode: 'Metro Train', status: 'On Time', eta: '4 min', load: 'High' },
              { id: '2', route: 'Downtown Shuttle (Route A)', mode: 'Shuttle Bus', status: 'Delayed (12m)', eta: '12 min', load: 'Medium' },
              { id: '3', route: 'West Parking Transfer', mode: 'Electric Shuttle', status: 'On Time', eta: '3 min', load: 'Low' },
              { id: '4', route: 'Regional Commuter Rail', mode: 'Commuter Train', status: 'On Time', eta: '18 min', load: 'High' },
            ].map((transit) => (
              <div key={transit.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-[#080d19]/35 text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-cyan-400">
                    <Bus className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">{transit.route}</h4>
                    <p className="text-[10px] text-slate-500">{transit.mode} • Occupancy: {transit.load}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white block text-xs">{transit.eta}</span>
                  <Badge variant={transit.status.includes('Delay') ? 'warning' : 'success'} className="text-[9px]">
                    {transit.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
