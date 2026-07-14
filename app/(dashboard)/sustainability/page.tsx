'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Leaf, Sun, Wind, Trash2, Droplet, CheckCircle } from 'lucide-react';

export default function SustainabilityPage() {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-extrabold text-white">Sustainability Ledger</h2>
        <p className="text-sm text-slate-400">Solar canopy inputs, waste redirection, and water preservation auditing.</p>
      </div>

      {/* Grid of details */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Side: Energy Grid */}
        <div className="md:col-span-1 space-y-4">
          <Card className="bg-[#080d19]/45 border-slate-900/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-emerald-400">
                <Sun className="h-4 w-4" />
                Stadium Clean Grid
              </CardTitle>
              <CardDescription className="text-xs">Real-time solar & battery load</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold">Solar Canopy Output</span>
                <Badge variant="success">3,600 kW</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold">Wind Cell Storage</span>
                <Badge variant="success">600 kW</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold">Renewable energy ratio</span>
                <Badge variant="cyan">86%</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold">Grid Reserve Batteries</span>
                <Badge variant="success">98% Charged</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#080d19]/45 border-slate-900/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-blue-400">
                <Droplet className="h-4 w-4" />
                Water Conservation
              </CardTitle>
              <CardDescription className="text-xs">Rainwater harvesting and low-flow audits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-300">
              <div className="p-3 rounded border border-slate-800 bg-[#070b13]/40">
                <div className="flex justify-between items-center font-bold text-white mb-0.5">
                  <span>Rainwater Reservoirs</span>
                  <Badge variant="success">12,400 L saved</Badge>
                </div>
                <p className="text-[10px] text-slate-400">Supplying graywater systems across toilet pods in South/East stands.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Waste redirection audits */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row justify-between items-center pb-2">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Trash2 className="h-4 w-4 text-cyan-400" />
                Waste Recycling Quotas
              </CardTitle>
              <CardDescription className="text-xs">Live bin fill weights and composting metrics</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="text-xs border-slate-800 bg-[#0c101d] text-slate-300">
              Audit Materials
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 border-t border-slate-900/60 pt-4">
            {[
              { id: '1', bin: 'Organic Composting Pods (Concourse Level 1)', type: 'Compost Bin', weight: '840 kg', status: '75% Capacity' },
              { id: '2', bin: 'Plastic Bottle Reclamation Bays (Gate 2)', type: 'Recycling Bin', weight: '420 kg', status: '45% Capacity' },
              { id: '3', bin: 'Aluminum Can Redirection Unit (Gate 5)', type: 'Recycling Bin', weight: '220 kg', status: '30% Capacity' },
              { id: '4', bin: 'General Trash Redirection Pods', type: 'Incinerator Fuel', weight: '1,200 kg', status: '90% Capacity' }
            ].map((pod) => (
              <div key={pod.id} className="flex items-center justify-between p-3.5 rounded-lg border border-slate-800 bg-[#080d19]/35 text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-emerald-400">
                    <CheckCircle className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{pod.bin}</h4>
                    <p className="text-[10px] text-slate-500">{pod.type} • Weight: {pod.weight}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white block text-sm">{pod.status}</span>
                  <Badge variant={parseInt(pod.status) > 80 ? 'destructive' : parseInt(pod.status) > 60 ? 'warning' : 'success'}>
                    {parseInt(pod.status) > 80 ? 'requires service' : 'stable'}
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
