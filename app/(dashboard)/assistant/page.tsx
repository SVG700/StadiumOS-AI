'use client';

import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '@/app/actions/chat';
import { ChatMessage } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, Sparkles, MessageSquare, Terminal } from 'lucide-react';

const QUICK_PROMPTS = [
  { label: 'Crowd Bottlenecks', prompt: 'Show current crowd density and recommend routing adjustments.' },
  { label: 'Incident Status', prompt: 'Audit active emergency dispatches and response times.' },
  { label: 'Transportation Delays', prompt: 'Get transit occupancy and eta metrics for the express metro.' },
  { label: 'Sustainability Audit', prompt: 'Audit renewable energy grid draw and carbon offset levels.' },
];

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
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

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

  // Helper to format messages with basic markdown (bold, list items)
  const formatMessageContent = (content: string) => {
    return content.split('\n').map((line, lineIdx) => {
      // Bold format replacement (**text**)
      let formattedLine = line;
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

      const finalLine = parts.length > 0 ? parts : formattedLine;

      // Unordered list formatting
      if (line.trim().startsWith('- ')) {
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
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-5xl mx-auto gap-4">
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
                  className="w-full text-left p-3 rounded-lg border border-slate-800 bg-[#070b13]/60 hover:bg-[#0c1322] hover:border-cyan-500/30 text-xs text-slate-300 hover:text-white transition-all duration-200"
                >
                  <span className="font-bold text-[11px] text-cyan-400 block mb-1">{item.label}</span>
                  <span className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{item.prompt}</span>
                </button>
              ))}
            </CardContent>
            <CardFooter className="p-4 border-t border-slate-900 bg-slate-950/20 text-[10px] text-slate-500 flex items-center gap-1">
              <Bot className="h-3 w-3" />
              <span>Model: Gemini 1.5 Flash</span>
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
                  className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  {/* Bubble Icon */}
                  <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center border ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 border-blue-500 text-white' 
                      : 'bg-slate-900 border-slate-800 text-cyan-400'
                  }`}>
                    {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>

                  {/* Bubble Content */}
                  <div className={`rounded-xl px-4 py-3 text-sm border shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#0f182e] border-blue-900/30 text-slate-100'
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
