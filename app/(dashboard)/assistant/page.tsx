'use client';

import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '@/app/actions/chat';
import { ChatMessage } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DatabaseService } from '@/lib/db';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, Sparkles, Terminal, Shield, CheckCircle, AlertTriangle, Info, Download } from 'lucide-react';

const QUICK_PROMPTS = [
  { label: 'Gate Overcrowding', prompt: 'Gate 3 is overcrowded.' },
  { label: 'Medical Emergency', prompt: 'Deploy Medical Team' },
  { label: 'Transportation queues', prompt: 'Increase Shuttle Frequency' },
  { label: 'Accessibility backlog', prompt: 'Activate Accessibility Volunteers' },
];

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content: `Hello! I am **StadiumOS AI**, your operations co-pilot for the FIFA World Cup 2026. 

I have access to live camera feeds, gate sensors, transit metrics, emergency dispatch channels, and green grids. 

How can I help you coordinate teams, manage traffic bottlenecks, or respond to stadium incidents today?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleApplyAction = async (actionType: string) => {
    showToast(`Initiating operations payload for: ${actionType.replace('_', ' ')}...`, 'info');
    
    try {
      let successMsg = '';
      if (actionType === 'OPEN_GATE_4') {
        await DatabaseService.updateCrowdDensity('Zone B (Gate 4-6)', 62);
        await DatabaseService.updateCrowdDensity('Zone A (Gate 1-3)', 48); // disperse Gate 3 overcrowding
        await DatabaseService.addEmergencyAlert({
          title: 'Gate 4 Opened',
          description: 'Operations opened Gate 4 turnstiles to disperse Gate 3 crowd bottleneck.',
          severity: 'low',
          location: 'Gate 4 Turnstiles',
          assignedTeam: 'Crowd Control Alpha'
        });
        successMsg = 'Crowd redirected successfully. Gate 4 opened and sensors updated.';
      } else if (actionType === 'DEPLOY_MEDICAL') {
        await DatabaseService.addEmergencyAlert({
          title: 'Medical Call: Section 108',
          description: 'AI Dispatch: Spectator heat exhaustion. Unit deployed.',
          severity: 'high',
          location: 'Section 108, Row E',
          assignedTeam: 'Medical Response 2'
        });
        successMsg = 'Medical Team Alpha deployed to Section 108. Dispatch log created.';
      } else if (actionType === 'REDIRECT_CROWD') {
        await DatabaseService.updateCrowdDensity('Zone C (Concourse North)', 65);
        await DatabaseService.updateCrowdDensity('Zone D (Concourse South)', 40);
        successMsg = 'Arriving spectators rerouted via North Corridor route profile.';
      } else if (actionType === 'INCREASE_SHUTTLE') {
        await DatabaseService.updateTransportStatus('t-2', 'on-time', 4);
        successMsg = 'Shuttle frequency doubled. Shuttle terminal ETA reduced to 4 minutes.';
      } else if (actionType === 'ACTIVATE_ACCESSIBILITY') {
        await DatabaseService.updateVolunteerStatus('v-3', 'on-duty', 'Accessibility Escort', 'Gate 4');
        successMsg = 'Additional accessibility escort volunteers activated at Gate 4.';
      } else if (actionType === 'REDUCE_ENERGY') {
        await DatabaseService.updateSustainabilityMetrics({ energyUsageKw: 3750 });
        successMsg = 'Concourse advertising grids dimmed. Saved 450 kW of energy draw.';
      } else if (actionType === 'GENERATE_REPORT') {
        successMsg = 'Sustainability audit report generated. Download link ready.';
      }

      if (successMsg) {
        showToast(successMsg, 'success');
        
        // Append a system reply acknowledging completion
        setMessages(prev => [
          ...prev,
          {
            id: `system-ack-${Date.now()}`,
            sender: 'system',
            content: `✔️ **Operations Action Applied**: ${successMsg}`,
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Failed to apply operations payload.', 'warning');
    }
  };

  const getSimulatedResponse = (text: string): string => {
    const promptLower = text.toLowerCase();
    
    if (promptLower.includes('gate') || promptLower.includes('overcrowd') || promptLower.includes('crowd')) {
      return `Gemini Operations Scan:
* Crowd sensor detects **92% density** bottleneck near the Gate 3 concourse entrance.
* Recommendation: Open **Gate 4 turnstiles** immediately and route volunteers to redirect spectators.
[ACTION:OPEN_GATE_4]`;
    }
    
    if (promptLower.includes('medical') || promptLower.includes('help') || promptLower.includes('sick') || promptLower.includes('accident')) {
      return `Gemini Safety Scan:
* Heat exhaustion alert flagged for spectator at **Section 108**.
* Recommendation: Deploy standby **Medical Response Team 2** to Gate 4 North access pod.
[ACTION:DEPLOY_MEDICAL]`;
    }

    if (promptLower.includes('shuttle') || promptLower.includes('transit') || promptLower.includes('bus') || promptLower.includes('queue')) {
      return `Gemini Transport Scan:
* Downtown shuttle queues are experiencing a **15-minute load delay**.
* Recommendation: **Increase Shuttle Line B frequency** to clear regional terminal delays.
[ACTION:INCREASE_SHUTTLE]`;
    }

    if (promptLower.includes('accessibility') || promptLower.includes('wheelchair') || promptLower.includes('volunteers')) {
      return `Gemini Accessibility Scan:
* Pending wheelchair escort requests detected at Gate 4.
* Recommendation: **Activate accessibility volunteers** on stand-by to assist transfer.
[ACTION:ACTIVATE_ACCESSIBILITY]`;
    }

    if (promptLower.includes('energy') || promptLower.includes('power') || promptLower.includes('solar')) {
      return `Gemini Sustainability Scan:
* Matchday grid consumption peak detected.
* Recommendation: **Reduce concourse advertising energy consumption** to reclaim 450 kW.
[ACTION:REDUCE_ENERGY]`;
    }

    if (promptLower.includes('report') || promptLower.includes('audit')) {
      return `Gemini Sustainability Audit:
* Waste metrics and solar output logs are ready for compilation.
* Recommendation: **Generate matchday Sustainability Report** to sync metrics.
[ACTION:GENERATE_REPORT]`;
    }

    return '';
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Look for simulated mock responses in demo mode first (guarantees functional buttons)
    const simulated = getSimulatedResponse(textToSend);
    if (simulated) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            sender: 'assistant',
            content: simulated,
            timestamp: new Date().toISOString(),
          },
        ]);
        setIsLoading(false);
      }, 1000);
      return;
    }

    try {
      const result = await sendChatMessage(textToSend);
      
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        content: result.success && result.reply 
          ? result.reply 
          : `System Error: ${result.error || 'Failed to establish server link.'}`,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: 'system',
          content: 'An unexpected connection error occurred. Please try again.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPromptClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  // Parses markdown AND custom action codes [ACTION:...]
  const formatMessageContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, lineIdx) => {
      // 1. Check for Action Tags
      if (line.includes('[ACTION:')) {
        const actionMatch = line.match(/\[ACTION:(.*?)\]/);
        if (actionMatch) {
          const actionType = actionMatch[1];
          let btnText = 'Apply Recommendation';
          if (actionType === 'OPEN_GATE_4') btnText = 'Apply: Open Gate 4 turnstiles';
          if (actionType === 'DEPLOY_MEDICAL') btnText = 'Apply: Dispatch Medical Team 2';
          if (actionType === 'INCREASE_SHUTTLE') btnText = 'Apply: Increase Shuttle Line B';
          if (actionType === 'ACTIVATE_ACCESSIBILITY') btnText = 'Apply: Deploy Accessibility volunteers';
          if (actionType === 'REDUCE_ENERGY') btnText = 'Apply: Dim advertising displays';
          if (actionType === 'GENERATE_REPORT') btnText = 'Apply: Generate Sustainability audit';

          return (
            <div key={lineIdx} className="mt-3">
              <Button
                onClick={() => handleApplyAction(actionType)}
                size="sm"
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-xs font-bold shadow-lg shadow-blue-500/20 flex gap-1.5 items-center cursor-pointer border border-cyan-400/20"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{btnText}</span>
              </Button>
            </div>
          );
        }
      }

      // 2. Bold text replacement (**text**)
      let boldLine = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(
          <strong key={match.index} className="text-cyan-400 font-bold">
            {match[1]}
          </strong>
        );
        lastIndex = boldRegex.lastIndex;
      }

      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      const finalLine = parts.length > 0 ? parts : boldLine;

      // 3. Bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <li key={lineIdx} className="ml-4 list-disc text-slate-300 my-1 leading-relaxed">
            {line.trim().substring(2)}
          </li>
        );
      }

      return (
        <p key={lineIdx} className="text-slate-300 leading-relaxed min-h-[1rem]">
          {finalLine}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-5xl mx-auto gap-4 relative">
      
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`p-4 rounded-xl border shadow-2xl backdrop-blur-xl pointer-events-auto flex gap-2.5 items-start ${
                toast.type === 'success'
                  ? 'bg-emerald-950/75 border-emerald-500/30 text-emerald-200'
                  : toast.type === 'warning'
                  ? 'bg-rose-950/75 border-rose-500/30 text-rose-200'
                  : 'bg-blue-950/75 border-blue-500/30 text-blue-200'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : toast.type === 'warning' ? (
                <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
              )}
              <span className="text-xs font-semibold leading-normal">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Overview Head */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
          <Terminal className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-white">AI Operations Copilot</h2>
          <p className="text-xs text-slate-400">Direct link to Gemini AI model. Secured Server-Side execution.</p>
        </div>
      </div>

      {/* Main Panel */}
      <div className="flex-1 grid md:grid-cols-4 gap-4 min-h-0">
        {/* Left Side: Quick Commands */}
        <div className="hidden md:flex flex-col gap-3 md:col-span-1">
          <Card className="bg-[#080d19]/45 border-slate-900/60 flex-1 flex flex-col justify-between">
            <CardHeader className="p-4">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                Quick Commands
              </CardTitle>
              <CardDescription className="text-[10px]">Deploy common operational queries to the AI.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2.5">
              {QUICK_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickPromptClick(item.prompt)}
                  className="w-full text-left p-3 rounded-lg border border-slate-800 bg-[#070b13]/60 hover:bg-[#0c1322] hover:border-cyan-500/30 text-xs text-slate-300 hover:text-white transition-all duration-200 cursor-pointer"
                >
                  <span className="font-bold text-[11px] text-cyan-400 block mb-1">{item.label}</span>
                  <span className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{item.prompt}</span>
                </button>
              ))}
            </CardContent>
            <CardFooter className="p-4 border-t border-slate-900 bg-slate-950/20 text-[10px] text-slate-500 flex items-center gap-1">
              <Bot className="h-3 w-3" />
              <span>Model: Gemini 3.5 Flash</span>
            </CardFooter>
          </Card>
        </div>

        {/* Right Side: Chat box */}
        <Card className="md:col-span-3 flex flex-col min-h-0 border-slate-900/60 bg-[#080d19]/30">
          <CardHeader className="border-b border-slate-900/60 p-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-cyan-400 animate-ping shadow" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Copilot Session</span>
            </div>
            <Badge variant="cyan" className="text-[9px]">Operational</Badge>
          </CardHeader>

          {/* Messages Box */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-3 max-w-[85%] ${
                    msg.sender === 'user' 
                      ? 'ml-auto flex-row-reverse' 
                      : msg.sender === 'system'
                      ? 'mx-auto max-w-[95%]'
                      : 'mr-auto'
                  }`}
                >
                  {/* Bubble Icon */}
                  {msg.sender !== 'system' && (
                    <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center border ${
                      msg.sender === 'user' 
                        ? 'bg-blue-600 border-blue-500 text-white' 
                        : 'bg-slate-900 border-slate-800 text-cyan-400'
                    }`}>
                      {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                  )}

                  {/* Bubble Content */}
                  <div className={`rounded-xl px-4 py-3 text-sm border shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#0f182e] border-blue-900/30 text-slate-100'
                      : msg.sender === 'system'
                      ? 'bg-[#052c21]/40 border-emerald-900/40 text-emerald-300 w-full text-center'
                      : 'bg-[#0d1324] border-slate-800/80 text-slate-200'
                  }`}>
                    <div className="space-y-1">{formatMessageContent(msg.content)}</div>
                    <span className="block text-[8px] text-slate-500 text-right mt-1.5">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <div className="flex gap-3 max-w-[80%] mr-auto items-center">
                <div className="h-8 w-8 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 flex items-center justify-center">
                  <Bot className="h-4 w-4 animate-bounce" />
                </div>
                <div className="rounded-xl px-4 py-3 bg-[#0d1324] border border-slate-800 text-slate-400 text-xs flex gap-2 items-center">
                  <div className="flex space-x-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" />
                  </div>
                  <span>AI is auditing telemetry feeds...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form input */}
          <div className="p-4 border-t border-slate-900/60 bg-slate-950/20">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(input);
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Ask AI Copilot for crowd reroutes, transit delays, safety checks..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-[#050912]"
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
