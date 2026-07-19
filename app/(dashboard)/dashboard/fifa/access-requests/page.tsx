/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DatabaseService } from '@/lib/db';
import { 
  ShieldCheck, ShieldAlert, Clock, ArrowLeft, Check, X,
  Building, User, Mail, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AccessRequestsAdminPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchRequests = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await DatabaseService.getAccessRequests();
      setRequests(data);
    } catch (err) {
      console.error('Failed to load access requests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRequests();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchRequests]);

  const handleUpdateStatus = async (id: string, newStatus: 'Approved' | 'Rejected') => {
    setActioningId(id);
    try {
      await DatabaseService.updateAccessRequestStatus(id, newStatus);
      await fetchRequests(); // reload list
    } catch (err) {
      console.error('Failed to update request status:', err);
    } finally {
      setActioningId(null);
    }
  };

  const filteredRequests = requests.filter(r => r.status === activeTab);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 rounded-2xl bg-gradient-to-r from-cyan-950/20 via-slate-900/60 to-slate-900/30 border border-slate-900/60 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent pointer-events-none" />
        <div className="flex items-center gap-3 relative z-10">
          <Link href="/dashboard/fifa">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl cursor-pointer">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <Badge variant="cyan" className="uppercase tracking-widest text-[9px] mb-1 font-mono">
              FIFA Headquarters Command Room
            </Badge>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              🛡️ Credentials Clearance Desk
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review and audit credential upgrades for volunteers, stadium coordinators, and operations staff.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
        {(['Pending', 'Approved', 'Rejected'] as const).map((tab) => {
          const count = requests.filter(r => r.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition select-none cursor-pointer flex items-center gap-2 ${
                activeTab === tab
                  ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-800/40'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span>{tab} Requests</span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                activeTab === tab
                  ? 'bg-cyan-900/40 text-cyan-400'
                  : 'bg-slate-900 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Request list */}
      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center space-y-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <span className="text-xs text-slate-500 font-mono">Loading request database...</span>
        </div>
      ) : filteredRequests.length === 0 ? (
        <Card className="bg-[#080d19]/45 border-slate-900/60 p-12 text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-slate-950 border border-slate-900 flex items-center justify-center text-slate-600 mb-4">
            <Clock className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-300">No {activeTab.toLowerCase()} requests</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
            There are currently no access requests under the {activeTab.toLowerCase()} classification.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <AnimatePresence>
            {filteredRequests.map((req) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                layout
              >
                <Card className="bg-[#080d19]/45 border-slate-900/60 overflow-hidden flex flex-col justify-between h-full">
                  <div className="p-5 space-y-4">
                    {/* User profile row */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-850 text-slate-400 shrink-0">
                          <User className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white leading-tight">{req.name}</h4>
                          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 font-mono">
                            <Building className="h-3 w-3 text-slate-500" />
                            <span>{req.organization}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Badge 
                        variant={req.requested_role === 'fifa' ? 'warning' : 'cyan'}
                        className="text-[8px] font-mono tracking-widest uppercase bg-slate-950/60"
                      >
                        {req.requested_role}
                      </Badge>
                    </div>

                    {/* Email and justification */}
                    <div className="space-y-2 border-t border-slate-900/60 pt-3">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                        <Mail className="h-3 w-3 text-slate-500" />
                        <span>{req.email}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-950/45 border border-slate-900/60">
                        <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block font-mono mb-1">Reason / Justification</span>
                        <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{req.reason}</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="px-5 py-3.5 border-t border-slate-900/60 bg-slate-950/15 flex items-center justify-between gap-3">
                    <span className="text-[9px] text-slate-500 font-mono">
                      Logged: {new Date(req.created_at).toLocaleString()}
                    </span>

                    {req.status === 'Pending' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(req.id, 'Rejected')}
                          disabled={actioningId === req.id}
                          className="bg-rose-950/30 hover:bg-rose-900/20 text-rose-400 border border-rose-900/20 hover:border-rose-500/30 cursor-pointer text-[10px] h-8 px-3 rounded-lg"
                        >
                          <X className="h-3 w-3 mr-1 inline" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(req.id, 'Approved')}
                          disabled={actioningId === req.id}
                          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black cursor-pointer text-[10px] h-8 px-3.5 rounded-lg shadow-lg shadow-emerald-500/10"
                        >
                          <Check className="h-3 w-3 mr-1 inline" />
                          Approve
                        </Button>
                      </div>
                    )}

                    {req.status === 'Approved' && (
                      <Badge variant="success" className="text-[9.5px] font-semibold bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 py-1 flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Approved clearance tier
                      </Badge>
                    )}

                    {req.status === 'Rejected' && (
                      <Badge variant="destructive" className="text-[9.5px] font-semibold bg-rose-950/30 border border-rose-500/30 text-rose-400 py-1 flex items-center gap-1">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        Clearance Denied
                      </Badge>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Security Brand Footer */}
      <div className="mt-8 flex items-center justify-center gap-1.5 text-slate-600 text-[10px] uppercase font-mono tracking-widest pt-4 border-t border-slate-900/35">
        <Shield className="h-3.5 w-3.5" />
        <span>StadiumOS Secure Credentials Registry</span>
      </div>
    </div>
  );
}
