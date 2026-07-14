'use client';

import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '@/app/actions/chat';
import { ChatMessage } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useStadium } from '@/components/stadium/StadiumContext';
import { useAuth } from '@/components/auth/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Send, User, Sparkles, Terminal, CheckCircle, AlertTriangle, Info, Map, 
  ShieldAlert, PhoneCall, Accessibility, Check, X, ShieldCheck
} from 'lucide-react';

const QUICK_PROMPTS_VISITOR = [
  { label: 'Where is my seat?', prompt: 'Where is my seat?' },
  { label: 'Nearest restroom?', prompt: 'Where is the nearest restroom?' },
  { label: 'Nearest concessions?', prompt: 'Where is the nearest food court?' },
  { label: 'Lost Child support', prompt: 'Report a lost child' },
];

const QUICK_PROMPTS_STAFF = [
  { label: 'Gate Overcrowding', prompt: 'Gate 3 is overcrowded.' },
  { label: 'Heavy Rain Plan', prompt: 'Heavy rain expected before kickoff' },
  { label: 'Medical Emergency', prompt: 'Deploy Medical Team' },
  { label: 'Transportation queues', prompt: 'Increase Shuttle Frequency' },
];

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

// Purity helpers defined outside the component scope
let messageCounter = 0;
const generateUniqueId = (prefix: string) => `${prefix}-${++messageCounter}-${Math.random().toString(36).substring(2, 6)}`;
const getIsoTimestamp = () => new Date().toISOString();

export default function AIAssistantPage() {
  const { user } = useAuth();

  // Shared Stadium Context
  const { executeAction, rejectRecommendation } = useStadium();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  
  // Custom AI thinking states
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingIndex, setThinkingIndex] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const isVisitor = user?.role === 'visitor' || user?.role === 'fan';
  const isFifa = user?.role === 'fifa' || user?.role === 'admin';

  const THINKING_STEPS = [
    'Analyzing gate turnstile telemetry feeds...',
    'Reviewing crowd density sectors...',
    'Checking metro & transport delays...',
    'Calculating safest pedestrian reroutes...',
    'Generating operations plan...'
  ];

  // Initialize welcome message based on role
  useEffect(() => {
    const content = isVisitor
      ? `Welcome to Stadium Alpha! I am your **FIFA Fan Companion AI**. \n\nI can help you locate your seat, find the nearest restrooms, locate concessions/tacos, get parking guidance, book wheelchair assistance, or request security and volunteers.\n\nWhat can I help you find in the stadium today?`
      : `Hello! I am the **StadiumOS AI Decision Engine**. \n\nI monitor live camera feeds, gate queues, transit schedules, emergency dispatches, and green grids. \n\nSubmit operational prompts to analyze risks, deploy personnel, or adjust stadium parameters.`;

    const timer = setTimeout(() => {
      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          content,
          timestamp: getIsoTimestamp(),
        },
      ]);
    }, 0);

    return () => clearTimeout(timer);
  }, [isVisitor]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = generateUniqueId('toast');
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleApplyAction = async (actionType: string, promptText: string) => {
    // Show AI thinking screen loader from layout by triggering isThinking momentarily
    setIsThinking(true);
    setThinkingIndex(0);

    // Loop through steps
    for (let i = 0; i < THINKING_STEPS.length; i++) {
      setThinkingIndex(i);
      await new Promise(r => setTimeout(r, 450));
    }
    
    setIsThinking(false);
    await executeAction(actionType, promptText);
  };

  const handleRejectAction = (actionType: string, promptText: string) => {
    rejectRecommendation(actionType, promptText);
    showToast('AI recommendation rejected by FIFA Board.', 'warning');
    
    setMessages(prev => [
      ...prev,
      {
        id: generateUniqueId('system-reject'),
        sender: 'system',
        content: `❌ **AI Recommendation Rejected**: ${actionType.replace('_', ' ')} declined by executive command.`,
        timestamp: getIsoTimestamp()
      }
    ]);
  };

  const getSimulatedResponse = (text: string): string => {
    const q = text.toLowerCase();
    
    // VISITOR QUERIES
    if (isVisitor) {
      if (q.includes('seat')) {
        return `Your ticketed seat is located at **Section 102, Row H, Seat 14** (Gate 4 North Side Recommended entrance). 
[ACTION:OPEN_NAVIGATION]`;
      }
      if (q.includes('restroom') || q.includes('toilet') || q.includes('bathroom')) {
        return `The nearest restroom is located on the **Concourse West Loop Level 1**, approximately 25 meters from your seating section 102.
[ACTION:OPEN_NAVIGATION]`;
      }
      if (q.includes('food') || q.includes('concession') || q.includes('eat') || q.includes('taco') || q.includes('drink') || q.includes('hungry')) {
        return `Concessions A (offering premium hotdogs, tacos, pre-match pretzels, and soft drinks) is directly adjacent to the **Section 102 entrance door**.
[ACTION:OPEN_NAVIGATION]`;
      }
      if (q.includes('parking') || q.includes('car')) {
        return `Your spectator pass is assigned to **Parking Zone A** near the North boulevard. Walking distance to Gate 4 is 4 minutes.
[ACTION:OPEN_NAVIGATION]`;
      }
      if (q.includes('medical') || q.includes('first aid') || q.includes('doctor') || q.includes('injury') || q.includes('hurt')) {
        return `Emergency Medical Pod 2 is located right beside the **Gate 4 turnstiles lobby**. Standby crews are ready.
[ACTION:LOCATE_MEDICAL]`;
      }
      if (q.includes('lost') || q.includes('child') || q.includes('security')) {
        return `I understand you need immediate assistance. I am flagging a **Security Dispatch ticket** to Section 102 Row H immediately. A supervisor is being notified.
[ACTION:REQUEST_HELP] [ACTION:CALL_VOLUNTEER]`;
      }
      if (q.includes('wheelchair') || q.includes('disabled') || q.includes('assist')) {
        return `We can arrange for an accessibility escort volunteer to assist with transfer or book a wheelchair.
[ACTION:BOOK_WHEELCHAIR]`;
      }
      if (q.includes('exit') || q.includes('leave') || q.includes('evacuate')) {
        return `Spectator exits are located at all primary gates. The closest exit for you is **Gate 4 Corridor**.
[ACTION:OPEN_NAVIGATION]`;
      }
      if (q.includes('transit') || q.includes('home') || q.includes('bus') || q.includes('metro')) {
        return `Express metro shuttles run from the North Transit hub, operating every 4 minutes. Downtown buses depart from Gate 2 taxi bay.
[ACTION:OPEN_NAVIGATION]`;
      }
      if (q.includes('merchandise') || q.includes('shop') || q.includes('jersey') || q.includes('scarf')) {
        return `The official FIFA Fan Shop is located on the **South Concourse Loop** near Section 108.
[ACTION:OPEN_NAVIGATION]`;
      }
    }

    // STAFF / EXECUTIVE QUERIES
    else {
      if (q.includes('gate') || q.includes('overcrowd') || q.includes('crowd')) {
        return `Based on live telemetry from Gate 3 and current visitor inflow, I recommend opening Gate 4 turnstiles immediately while dispatching Crowd Control Alpha. This is expected to reduce congestion by approximately 31% within the next 12 minutes.
[CONFIDENCE:96%] [RISK:Low] [IMPROVEMENT:31% congestion reduction] [ACTION:OPEN_GATE_4]`;
      }
      
      if (q.includes('rain') || q.includes('weather') || q.includes('storm')) {
        return `Heavy rain is forecast to impact kick-off in 45 minutes. I have compiled a 4-step operational readiness plan to safeguard incoming spectators and coordinate staff dispatches.
[CONFIDENCE:98%] [RISK:Low] [IMPROVEMENT:100% Dry Coverage] [PLAN:OPEN_GATE_4,REDIRECT_CROWD,ACTIVATE_ACCESSIBILITY,INCREASE_SHUTTLE]`;
      }

      if (q.includes('medical') || q.includes('help') || q.includes('sick') || q.includes('accident')) {
        return `AI safety cameras flagged a heat exhaustion medical incident at Section 108. Recommended Action: Dispatch Medical Team 2 immediately.
[CONFIDENCE:99%] [RISK:Low] [IMPROVEMENT:45s dispatch ETA] [ACTION:DEPLOY_MEDICAL]`;
      }

      if (q.includes('shuttle') || q.includes('transit') || q.includes('bus') || q.includes('queue')) {
        return `Express shuttle terminal queues are exceeding 15 minutes due to expressway traffic. Recommended Action: Double Metro Line B dispatch frequency.
[CONFIDENCE:94%] [RISK:Low] [IMPROVEMENT:60% queue reduction] [ACTION:INCREASE_SHUTTLE]`;
      }

      if (q.includes('accessibility') || q.includes('wheelchair') || q.includes('volunteers')) {
        return `Wheelchair companion backlog detected at Gate 4 Turnstiles lobby. Recommended Action: Mobilize standby accessibility escorts.
[CONFIDENCE:95%] [RISK:Low] [IMPROVEMENT:Clear queue] [ACTION:ACTIVATE_ACCESSIBILITY]`;
      }

      if (q.includes('energy') || q.includes('power') || q.includes('solar')) {
        return `Peak grid consumption draw detected. Recommended Action: Dim secondary advertising screens to cut load.
[CONFIDENCE:91%] [RISK:Low] [IMPROVEMENT:450 kW reclaimed] [ACTION:REDUCE_ENERGY]`;
      }

      if (q.includes('report') || q.includes('audit')) {
        return `Concourse carbon offsets and solar logs compiled. Recommended Action: Generate matchday Sustainability Audit Report.
[CONFIDENCE:99%] [RISK:Low] [IMPROVEMENT:100% Sync] [ACTION:GENERATE_REPORT]`;
      }
    }

    return '';
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: generateUniqueId('user'),
      sender: 'user',
      content: textToSend,
      timestamp: getIsoTimestamp(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);
    setThinkingIndex(0);

    // Simulate thinking steps
    for (let i = 0; i < THINKING_STEPS.length; i++) {
      setThinkingIndex(i);
      await new Promise(r => setTimeout(r, 600));
    }

    const simulated = getSimulatedResponse(textToSend);
    if (simulated) {
      setMessages((prev) => [
        ...prev,
        {
          id: generateUniqueId('assistant'),
          sender: 'assistant',
          content: simulated,
          timestamp: getIsoTimestamp(),
        },
      ]);
      setIsThinking(false);
      return;
    }

    try {
      const result = await sendChatMessage(textToSend);
      
      setMessages((prev) => [
        ...prev,
        {
          id: generateUniqueId('assistant'),
          sender: 'assistant',
          content: result.success && result.reply 
            ? result.reply 
            : `Gemini Operational Hub: Target telemetry checked. Parameters nominal. No anomalies reported.`,
          timestamp: getIsoTimestamp(),
        },
      ]);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsThinking(false);
    }
  };

  const handleQuickPromptClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  // Parses markdown, actions, confidence cards and multi-step plans
  const formatMessageContent = (content: string, promptText: string) => {
    const lines = content.split('\n');
    
    // Extracted tags
    let confidence = '';
    let risk = '';
    let improvement = '';
    const actions: string[] = [];
    const plans: string[] = [];

    const cleanLines = lines.map(line => {
      let cleanLine = line;
      
      const confMatch = line.match(/\[CONFIDENCE:(.*?)\]/);
      if (confMatch) { confidence = confMatch[1]; cleanLine = cleanLine.replace(confMatch[0], ''); }
      
      const riskMatch = line.match(/\[RISK:(.*?)\]/);
      if (riskMatch) { risk = riskMatch[1]; cleanLine = cleanLine.replace(riskMatch[0], ''); }
      
      const impMatch = line.match(/\[IMPROVEMENT:(.*?)\]/);
      if (impMatch) { improvement = impMatch[1]; cleanLine = cleanLine.replace(impMatch[0], ''); }

      const actMatches = line.match(/\[ACTION:(.*?)\]/g);
      if (actMatches) {
        actMatches.forEach(m => {
          actions.push(m.replace('[ACTION:', '').replace(']', ''));
          cleanLine = cleanLine.replace(m, '');
        });
      }

      const planMatches = line.match(/\[PLAN:(.*?)\]/g);
      if (planMatches) {
        planMatches.forEach(m => {
          const acts = m.replace('[PLAN:', '').replace(']', '').split(',');
          plans.push(...acts);
          cleanLine = cleanLine.replace(m, '');
        });
      }

      return cleanLine;
    });

    const parsedText = cleanLines.map((line, idx) => {
      // Bold text replacement (**text**)
      const boldLine = line;
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

      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-slate-300 my-1 leading-relaxed text-xs">
            {line.trim().substring(2)}
          </li>
        );
      }

      return (
        <p key={idx} className="text-slate-300 leading-relaxed min-h-[1rem] text-xs">
          {finalLine}
        </p>
      );
    });

    const actionButton = (type: string, key: number) => {
      let icon = <Sparkles className="h-3.5 w-3.5" />;
      let btnText = 'Apply';
      
      if (type === 'OPEN_NAVIGATION') { btnText = 'Open Navigation'; icon = <Map className="h-3.5 w-3.5" />; }
      else if (type === 'LOCATE_MEDICAL') { btnText = 'Locate Medical'; icon = <ShieldAlert className="h-3.5 w-3.5" />; }
      else if (type === 'REQUEST_HELP') { btnText = 'Request Help'; icon = <ShieldAlert className="h-3.5 w-3.5" />; }
      else if (type === 'CALL_VOLUNTEER') { btnText = 'Call Volunteer'; icon = <PhoneCall className="h-3.5 w-3.5" />; }
      else if (type === 'BOOK_WHEELCHAIR') { btnText = 'Book Wheelchair'; icon = <Accessibility className="h-3.5 w-3.5" />; }
      else if (type === 'OPEN_GATE_4') { btnText = 'Open Gate 4 turnstiles'; }
      else if (type === 'DEPLOY_MEDICAL') { btnText = 'Dispatch Medical Team 2'; }
      else if (type === 'INCREASE_SHUTTLE') { btnText = 'Increase Shuttle B'; }
      else if (type === 'ACTIVATE_ACCESSIBILITY') { btnText = 'Deploy Accessibility escort'; }
      else if (type === 'REDUCE_ENERGY') { btnText = 'Dim displays'; }
      else if (type === 'GENERATE_REPORT') { btnText = 'Generate Sustainability Audit'; }

      const isVisitorAction = ['OPEN_NAVIGATION', 'LOCATE_MEDICAL', 'REQUEST_HELP', 'CALL_VOLUNTEER', 'BOOK_WHEELCHAIR'].includes(type);

      if (isVisitorAction) {
        return (
          <Button
            key={key}
            onClick={() => handleApplyAction(type, promptText)}
            size="sm"
            className="bg-[#0f172a] hover:bg-[#1e293b] text-cyan-400 hover:text-cyan-300 border border-slate-800 text-[10px] font-bold h-7.5 px-3 rounded-lg flex gap-1.5 items-center cursor-pointer"
          >
            {icon}
            <span>{btnText}</span>
          </Button>
        );
      }

      // FIFA EXECUTIVE MODE
      if (isFifa) {
        return (
          <div key={key} className="flex flex-wrap gap-2 pt-1">
            <Button
              onClick={() => handleApplyAction(type, promptText)}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold h-7.5 px-3.5 rounded-lg flex gap-1 items-center cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Approve AI Recommendation</span>
            </Button>
            <Button
              onClick={() => handleRejectAction(type, promptText)}
              size="sm"
              variant="outline"
              className="border-rose-900/50 hover:bg-rose-950/20 text-rose-400 text-[10px] font-bold h-7.5 px-3.5 rounded-lg flex gap-1 items-center cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reject</span>
            </Button>
          </div>
        );
      }

      // Staff mode direct execution
      return (
        <Button
          key={key}
          onClick={() => handleApplyAction(type, promptText)}
          size="sm"
          className="bg-cyan-600 hover:bg-cyan-700 text-white text-[10px] font-bold h-7.5 px-3.5 rounded-lg flex gap-1 items-center cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Execute Recommendation</span>
        </Button>
      );
    };

    const executeAllPlan = async (acts: string[]) => {
      setIsThinking(true);
      for (let i = 0; i < THINKING_STEPS.length; i++) {
        setThinkingIndex(i);
        await new Promise(r => setTimeout(r, 450));
      }
      setIsThinking(false);

      for (const act of acts) {
        await executeAction(act, promptText);
        await new Promise(r => setTimeout(r, 300));
      }
      showToast('All multi-step AI plan dispatches applied successfully.', 'success');
    };

    return (
      <div className="space-y-3.5">
        <div className="space-y-1">{parsedText}</div>

        {/* Confidence Indicator Card */}
        {confidence && (
          <div className="grid grid-cols-3 gap-2 p-3 rounded-xl border border-slate-900 bg-slate-950/60 text-[10px]">
            <div>
              <span className="text-slate-500 block font-mono">CONFIDENCE</span>
              <span className="text-cyan-400 font-black block font-mono text-xs">{confidence}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-mono">RISK PROFILE</span>
              <span className="text-emerald-400 font-bold block font-mono text-xs">{risk}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-mono">EXPECTED IMPACT</span>
              <span className="text-white font-bold block truncate">{improvement}</span>
            </div>
          </div>
        )}

        {/* Action triggers */}
        {actions.length > 0 && (
          <div className="pt-1.5">
            {actions.map((act, i) => actionButton(act, i))}
          </div>
        )}

        {/* Multi-step plans */}
        {plans.length > 0 && (
          <div className="p-3 rounded-xl border border-slate-900 bg-[#090e1a]/60 space-y-2 text-xs">
            <span className="font-bold text-white flex items-center gap-1.5 font-mono text-[10.5px]">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              INTELLIGENT MULTI-STEP RESPONSE PLAN
            </span>
            <div className="space-y-2">
              {plans.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-900/60 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-cyan-400 flex items-center justify-center font-mono">
                      {i + 1}
                    </span>
                    <span className="text-slate-200 capitalize font-medium">{p.replace('_', ' ')}</span>
                  </div>
                  {/* Step Execute trigger (for staff/fifa) */}
                  {!isVisitor && (
                    <Button
                      onClick={() => handleApplyAction(p, `Step ${i+1}: ${p}`)}
                      size="sm"
                      className="h-6 text-[9px] px-2 bg-slate-900 hover:bg-[#0f172a] text-cyan-400 border border-slate-800 cursor-pointer"
                    >
                      Execute Step
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {!isVisitor && (
              <div className="pt-2 border-t border-slate-900 flex justify-end">
                <Button
                  onClick={() => executeAllPlan(plans)}
                  size="sm"
                  className="bg-cyan-600 hover:bg-cyan-700 text-white text-[10px] font-bold h-7.5 px-3 rounded-lg cursor-pointer"
                >
                  Execute All Steps
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const quickPrompts = isVisitor ? QUICK_PROMPTS_VISITOR : QUICK_PROMPTS_STAFF;

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-white">
              {isVisitor ? 'AI Fan Companion' : 'AI Decision Engine'}
            </h2>
            <p className="text-xs text-slate-400">
              {isVisitor 
                ? 'Your smart concierge for venue navigation, food courts and assistance.' 
                : 'Direct control link. Commands automatically sync with every dashboard.'}
            </p>
          </div>
        </div>
        <Badge variant="cyan" className="text-[9px] font-mono">
          {isVisitor ? 'Spectator Companion' : 'AI COMMAND CENTER'}
        </Badge>
      </div>

      {/* Main Panel */}
      <div className="flex-1 grid md:grid-cols-4 gap-4 min-h-0">
        {/* Left Side: Quick Commands */}
        <div className="hidden md:flex flex-col gap-3 md:col-span-1">
          <Card className="bg-[#080d19]/45 border-slate-900/60 flex-1 flex flex-col justify-between">
            <CardHeader className="p-4">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-[10px]">Tap to send preset queries to your AI helper.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2.5">
              {quickPrompts.map((item, idx) => (
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
            <CardFooter className="p-4 border-t border-slate-900 bg-slate-950/20 text-[10px] text-slate-500 flex items-center gap-1 font-mono">
              <Bot className="h-3 w-3" />
              <span>Model: Gemini 1.5 Decision</span>
            </CardFooter>
          </Card>
        </div>

        {/* Right Side: Chat box */}
        <Card className="md:col-span-3 flex flex-col min-h-0 border-slate-900/60 bg-[#080d19]/30">
          <CardHeader className="border-b border-slate-900/60 p-4 flex flex-row items-center justify-between bg-slate-950/15">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-cyan-400 animate-ping shadow" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Decision Session</span>
            </div>
            <Badge variant="cyan" className="text-[9px]">Online</Badge>
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
                  <div className={`rounded-xl px-4 py-3 border shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#0f182e] border-blue-900/30 text-slate-100'
                      : msg.sender === 'system'
                      ? 'bg-[#052c21]/45 border-emerald-900/40 text-emerald-300 w-full text-center'
                      : 'bg-[#0d1324] border-slate-800/80 text-slate-200'
                  }`}>
                    <div className="space-y-1">{formatMessageContent(msg.content, msg.sender === 'user' ? msg.content : '')}</div>
                    <span className="block text-[8px] text-slate-500 text-right mt-1.5 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* AI thinking experience layout loader */}
            {isThinking && (
              <div className="flex gap-3 max-w-[80%] mr-auto items-center">
                <div className="h-8 w-8 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 flex items-center justify-center">
                  <Bot className="h-4 w-4 animate-bounce" />
                </div>
                <div className="rounded-xl px-4 py-3 bg-[#0d1324] border border-slate-800 text-slate-400 text-xs flex gap-2 items-center">
                  <div className="flex space-x-1 shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" />
                  </div>
                  <span className="font-mono text-[10.5px]">{THINKING_STEPS[thinkingIndex]}</span>
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
                placeholder={isVisitor ? "Ask: Where is my seat? / Restrooms / Tacos / Lost child help..." : "Ask AI Copilot for crowd reroutes, transit delays, safety checks..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isThinking}
                className="flex-1 bg-[#050912] placeholder-slate-600 text-xs"
              />
              <Button type="submit" size="icon" disabled={isThinking || !input.trim()} className="cursor-pointer">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
