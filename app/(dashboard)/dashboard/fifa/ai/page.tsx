'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessage } from '@/types';
import { sendExecutiveChatMessage, checkGeminiStatus } from '@/app/actions/chat';
import { useStadium } from '@/components/stadium/StadiumContext';
import { AnimatedNumber } from '@/components/stadium/AnimatedNumber';
import { 
  Bot, Send, Activity, AlertTriangle
} from 'lucide-react';

let messageCounter = 0;
const generateUniqueId = (prefix: string) => `${prefix}-${++messageCounter}-${Math.random().toString(36).substring(2, 6)}`;
const getIsoTimestamp = () => new Date().toISOString();

export default function FifaAiCopilotPage() {
  const {
    stadiums,
    selectedStadium,
    selectStadium
  } = useStadium();

  // AI Assistant states
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Compute stats for Context Panel
  const totalCrowd = stadiums.reduce((sum, s) => sum + s.visitors.total, 0);
  const totalAlerts = stadiums.reduce((sum, s) => sum + s.alerts.filter(a => a.status !== 'resolved').length, 0);
  
  const metrics = {
    totalAttendance: totalCrowd,
    avgWaitTime: selectedStadium.id === 'vancouver' ? 4.2 : 6.8,
    medicalIncidents: totalAlerts,
    transitDelayPercent: Math.round((stadiums.filter(s => s.transport.some(t => t.status === 'delayed')).length / stadiums.length) * 100),
    renewablePercent: Math.round(stadiums.reduce((sum, s) => sum + s.sustainability.renewablePercentage, 0) / stadiums.length),
  };

  // Check Gemini Status
  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await checkGeminiStatus();
        setIsOnline(res.online);
      } catch {
        setIsOnline(false);
      }
    }
    checkStatus();
  }, []);

  // Auto-scroll to newest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const starterQuestions = [
    "Show today's highest risk stadium",
    "Summarize all incidents",
    "How can we reduce crowd congestion?",
    "Generate an executive match report",
    "Energy optimization suggestions",
    "Medical readiness status",
    "Transport delay summary",
    "Security recommendations"
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: generateUniqueId('msg-user'),
      sender: 'user',
      content: textToSend.trim(),
      timestamp: getIsoTimestamp()
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsThinking(true);

    const dashboardContext = `
Active Selected Venue: ${selectedStadium.name} (${selectedStadium.city})
Live Match Phase: ${selectedStadium.matchPhase}
Total Tournament Attendance: ${metrics.totalAttendance}
Average Turnstile Wait Time: ${metrics.avgWaitTime} minutes
Active Incidents/Medical Calls: ${metrics.medicalIncidents}
Transit Delay: ${metrics.transitDelayPercent}% of systems delayed
Renewable Power Share: ${metrics.renewablePercent}%
Global Viewers: ${parseFloat(stadiums.reduce((sum, s) => sum + s.match.broadcastViewers, 0).toFixed(1))}M
Highest Risk Alert: Los Angeles Gate 5 approaching congestion.
`;

    try {
      const response = await sendExecutiveChatMessage(textToSend.trim(), dashboardContext);
      
      if (response.success && response.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: generateUniqueId('msg-ai'),
            sender: 'assistant',
            content: response.reply,
            timestamp: getIsoTimestamp()
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: generateUniqueId('msg-sys'),
            sender: 'system',
            content: response.error || 'Gemini AI is temporarily unavailable.',
            timestamp: getIsoTimestamp()
          }
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: generateUniqueId('msg-sys-err'),
          sender: 'system',
          content: 'Gemini AI is temporarily unavailable.',
          timestamp: getIsoTimestamp()
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const formatMessageContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      let isBullet = false;
      let textToParse = line;
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        isBullet = true;
        textToParse = line.trim().substring(2);
      }

      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(textToParse)) !== null) {
        if (match.index > lastIndex) {
          parts.push(textToParse.substring(lastIndex, match.index));
        }
        parts.push(
          <strong key={match.index} className="text-cyan-400 font-bold">
            {match[1]}
          </strong>
        );
        lastIndex = boldRegex.lastIndex;
      }

      if (lastIndex < textToParse.length) {
        parts.push(textToParse.substring(lastIndex));
      }

      const finalLine = parts.length > 0 ? parts : textToParse;

      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc text-slate-300 my-1 leading-relaxed text-xs">
            {finalLine}
          </li>
        );
      }

      return (
        <p key={idx} className="text-slate-300 leading-relaxed min-h-[1rem] text-xs">
          {finalLine}
        </p>
      );
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
      {/* Large Chat Column */}
      <div className="xl:col-span-3 w-full">
        <Card className="bg-[#080d19]/45 border-slate-900/60 overflow-hidden flex flex-col h-[700px] xl:h-[calc(100vh-140px)] w-full">
          <CardHeader className="pb-3 border-b border-slate-900/30 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-1.5 text-white">
                  <Bot className="h-5 w-5 text-cyan-400" />
                  FIFA Executive AI Copilot
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-400 font-mono mt-0.5">Powered by Gemini AI</CardDescription>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-900 px-2.5 py-0.5 rounded-full">
                <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">{isOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col min-h-0">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6 my-auto min-h-0">
                <div className="h-12 w-12 rounded-full bg-cyan-950/20 border border-cyan-900/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg shadow-cyan-950/45">
                  <Bot className="h-6 w-6 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-slate-300 font-medium leading-relaxed max-w-[320px] mx-auto whitespace-pre-line">
                    Welcome Commissioner.
                    {"\n\n"}
                    I am your FIFA Executive AI Copilot.
                    {"\n\n"}
                    I can analyse global operations, incidents, sustainability, transportation, security and executive reports.
                    {"\n\n"}
                    How may I assist you today?
                  </p>
                </div>
                
                <div className="w-full pt-6 border-t border-slate-900/40 max-w-lg">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2 font-mono text-left">
                    Suggested Queries
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left max-h-52 overflow-y-auto pr-1">
                    {starterQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(q)}
                        className="text-[10px] text-cyan-300 bg-cyan-950/15 hover:bg-cyan-950/40 border border-slate-900 hover:border-cyan-800/40 px-2.5 py-1.5 rounded-lg text-left transition select-none cursor-pointer hover:text-white"
                      >
                        ✦ {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 min-h-0 flex-1">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender !== 'user' && (
                      <div className="h-7 w-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4 text-cyan-400" />
                      </div>
                    )}
                    <div className={`flex flex-col gap-1 max-w-[80%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-cyan-600 text-white rounded-tr-none font-medium'
                            : msg.sender === 'system'
                            ? 'bg-rose-950/20 border border-rose-900/40 text-rose-300 rounded-tl-none font-medium'
                            : 'bg-slate-900/70 border border-slate-800 text-slate-100 rounded-tl-none font-normal'
                        }`}
                      >
                        <div className="space-y-1">
                          {formatMessageContent(msg.content)}
                        </div>
                      </div>
                      <span className="text-[8px] text-slate-500 font-mono px-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                {isThinking && (
                  <div className="flex items-start gap-3">
                    <div className="h-7 w-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-cyan-400 animate-pulse" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="p-3 rounded-2xl rounded-tl-none border border-slate-900/60 bg-slate-950/40 text-xs text-slate-400 flex items-center gap-2">
                        <span className="flex gap-1 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                        <span className="font-mono text-[9px] text-slate-500">Gemini is formulating response...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </CardContent>
          
          <CardFooter className="p-4 border-t border-slate-900/30 shrink-0 bg-slate-950/20">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(chatInput);
              }}
              className="flex w-full items-center gap-1.5"
            >
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask the AI Copilot..."
                className="flex-1 h-10 bg-slate-950/60 border-slate-900 focus-visible:ring-cyan-500/50 text-xs placeholder:text-slate-500 text-white rounded-lg"
                disabled={isThinking}
                autoComplete="off"
              />
              <Button
                type="submit"
                size="icon"
                className="h-10 w-10 bg-cyan-600 hover:bg-cyan-700 text-white shrink-0 cursor-pointer rounded-lg flex items-center justify-center"
                disabled={isThinking || !chatInput.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>

      {/* Right Executive Context panel */}
      <div className="xl:col-span-1 xl:sticky xl:top-6 w-full">
        <Card className="bg-[#080d19]/45 border-slate-900/60 overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-900/30">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
              <Activity className="h-4.5 w-4.5 text-cyan-400" />
              Executive Context Panel
            </CardTitle>
            <CardDescription className="text-[10px] text-slate-400 font-mono">Real-time parameters parsed to Gemini</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-xs">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2.5 rounded-lg border border-slate-900 bg-slate-950/30">
                <span className="text-slate-400 font-mono text-[9px] uppercase font-semibold">Active Venue</span>
                <span className="text-cyan-400 font-bold font-mono text-[10px]">{selectedStadium.name} ({selectedStadium.city})</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg border border-slate-900 bg-slate-950/30 text-center">
                  <span className="text-slate-500 block text-[8px] uppercase font-mono tracking-wider mb-1">Total Attendance</span>
                  <span className="text-white font-black text-xs"><AnimatedNumber value={metrics.totalAttendance} /></span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-900 bg-slate-950/30 text-center">
                  <span className="text-slate-500 block text-[8px] uppercase font-mono tracking-wider mb-1">Medical Calls</span>
                  <span className="text-white font-black text-xs"><AnimatedNumber value={metrics.medicalIncidents} /></span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg border border-slate-900 bg-slate-950/30 text-center">
                  <span className="text-slate-500 block text-[8px] uppercase font-mono tracking-wider mb-1">Transit Delays</span>
                  <span className="text-white font-black text-xs"><AnimatedNumber value={metrics.transitDelayPercent} />%</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-900 bg-slate-950/30 text-center">
                  <span className="text-slate-500 block text-[8px] uppercase font-mono tracking-wider mb-1">Renewable Power</span>
                  <span className="text-white font-black text-xs"><AnimatedNumber value={metrics.renewablePercent} />%</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-dashed border-rose-950/40 bg-rose-950/10 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-rose-400 block font-mono">Highest Risk Alert</span>
                  <p className="text-[10px] text-slate-300 leading-normal">Los Angeles Gate 5 approaching congestion.</p>
                </div>
              </div>
            </div>

            {/* Venue Selector */}
            <div className="border-t border-slate-900/60 pt-3 space-y-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
                Venue Focus Context
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {stadiums.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => selectStadium(s.id)}
                    className={`text-[9px] font-bold py-1 px-1.5 rounded transition capitalize select-none cursor-pointer ${
                      selectedStadium.id === s.id 
                        ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/30' 
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {s.city}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
