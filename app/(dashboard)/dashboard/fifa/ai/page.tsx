/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStadium } from '@/components/stadium/StadiumContext';
import { useAuth } from '@/components/auth/AuthProvider';
import { DatabaseService } from '@/lib/db';
import { sendExecutiveChatMessage, checkGeminiStatus } from '@/app/actions/chat';
import { jsPDF } from 'jspdf';
import { ChatMessage } from '@/types';

interface Conversation {
  id: string;
  user_id: string;
  role: 'visitor' | 'staff' | 'fifa';
  title: string;
  created_at: string;
  updated_at: string;
  metadata?: string;
}
import { 
  Bot, Send, Activity, AlertTriangle, Pin, Trash2, Edit2, Check, X,
  Search, Plus, Download, FileText, Calendar, CheckSquare, Sparkles, Loader2, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FifaAiCopilotPage() {
  const { user } = useAuth();
  const {
    stadiums,
    selectedStadium,
    selectStadium
  } = useStadium();

  // Conversations List & Active Selection
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  
  // Inline Renaming State
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState('');

  // AI Assistant input states
  const [chatInput, setChatInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [contextAlert, setContextAlert] = useState<string | null>(null);
  
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

  // 2. Select conversation & restore context
  const handleSelectConversation = React.useCallback(async (conv: Conversation) => {
    setActiveConv(conv);
    setContextAlert(null);
    
    // Fetch conversation messages
    const msgs = await DatabaseService.getMessages(conv.id);
    setMessages(msgs);

    // Restore Stadium context if metadata is present
    if (conv.metadata) {
      try {
        const metadata = JSON.parse(conv.metadata);
        if (metadata.stadiumId) {
          selectStadium(metadata.stadiumId);
          setContextAlert(`Restored context: Analysing ${metadata.stadiumName} during Matchday ${metadata.matchday || 12}.`);
          setTimeout(() => setContextAlert(null), 5000);
        }
      } catch (e) {
        console.warn('Failed to parse metadata context:', e);
      }
    }
  }, [selectStadium]);

  // 1. Initial Load: Fetch Pinned Chats & Conversations
  useEffect(() => {
    if (!user) return;
    
    // Load pins from localStorage
    const savedPins = localStorage.getItem(`stadium_pinned_${user.role}_chats`);
    if (savedPins) {
      setTimeout(() => {
        setPinnedIds(JSON.parse(savedPins));
      }, 0);
    }

    async function loadConversations() {
      const data = await DatabaseService.getConversations(user!.id, user!.role);
      setConversations(data);
      
      // Auto-open most recent conversation
      if (data.length > 0) {
        handleSelectConversation(data[0]);
      }
    }
    loadConversations();
  }, [user, handleSelectConversation]);

  // Auto-scroll to newest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Starter Questions
  const starterQuestions = [
    "Show today's highest risk stadium",
    "Summarize all active incidents",
    "How can we reduce crowd congestion?",
    "Generate an executive match report",
    "Energy optimization suggestions",
    "Medical readiness status",
  ];

  // 3. New Chat Creation
  const handleNewChat = async (initialQuery?: string) => {
    if (!user) return;

    // Build context metadata for recovery
    const metadata = {
      stadiumId: selectedStadium.id,
      stadiumName: selectedStadium.name,
      matchday: '12',
      stage: selectedStadium.match?.stage || 'Quarter Final',
      dashboard: user.role,
      timestamp: new Date().toISOString()
    };

    const defaultTitle = initialQuery 
      ? (initialQuery.length > 30 ? `${initialQuery.substring(0, 30)}...` : initialQuery)
      : `Audit - ${selectedStadium.city} M12`;

    const newConv = await DatabaseService.createConversation(
      user.id,
      user.role as 'visitor' | 'staff' | 'fifa',
      defaultTitle,
      metadata
    );

    // Add initial welcome system message if no starter query
    if (!initialQuery) {
      const welcomeText = `Welcome Commissioner. I am your FIFA Executive AI Copilot. I have restored context for **${selectedStadium.name} (${selectedStadium.city})** during Matchday 12. How can I assist with stadium analytics today?`;
      await DatabaseService.addMessage(newConv.id, 'assistant', welcomeText);
    }

    // Refresh list
    const updatedList = await DatabaseService.getConversations(user.id, user.role);
    setConversations(updatedList);
    
    // Select newly created chat
    const match = updatedList.find(c => c.id === newConv.id);
    if (match) {
      await handleSelectConversation(match);
      if (initialQuery) {
        await handleSendMessage(initialQuery, match);
      }
    }
  };

  // 4. Send Message
  const handleSendMessage = async (textToSend: string, targetConv = activeConv) => {
    if (!textToSend.trim() || isThinking || !user) return;

    const conv = targetConv;
    
    // Create new chat automatically if none is selected
    if (!conv) {
      await handleNewChat(textToSend);
      return;
    }

    // Add user message to db & state
    const userMsg = await DatabaseService.addMessage(conv.id, 'user', textToSend.trim());
    setMessages((prev: ChatMessage[]) => [...prev, userMsg]);
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
      
      const replySender = response.success ? 'assistant' : 'system';
      const replyContent = response.success && response.reply 
        ? response.reply 
        : (response.error || 'Gemini AI is temporarily offline.');
      
      const aiMsg = await DatabaseService.addMessage(conv.id, replySender, replyContent);
      setMessages((prev: ChatMessage[]) => [...prev, aiMsg]);
      
      // Auto-rename chat from first user message if it has default title
      if (conv.title.startsWith('Audit -') && messages.length <= 2) {
        const autoTitle = textToSend.length > 25 ? `${textToSend.substring(0, 25)}...` : textToSend;
        await DatabaseService.updateConversationTitle(conv.id, autoTitle);
        // refresh list
        const updatedList = await DatabaseService.getConversations(user.id, user.role);
        setConversations(updatedList);
        setActiveConv((prev: Conversation | null) => prev ? { ...prev, title: autoTitle } : null);
      } else {
        // Just refresh list to update timestamps
        const updatedList = await DatabaseService.getConversations(user.id, user.role);
        setConversations(updatedList);
      }
    } catch (e) {
      const errMsg = await DatabaseService.addMessage(conv.id, 'system', 'Gemini AI is temporarily offline.');
      setMessages((prev: ChatMessage[]) => [...prev, errMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  // 5. Pin / Unpin Chats
  const togglePinChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updatedPins = [];
    if (pinnedIds.includes(id)) {
      updatedPins = pinnedIds.filter(pid => pid !== id);
    } else {
      updatedPins = [...pinnedIds, id];
    }
    setPinnedIds(updatedPins);
    localStorage.setItem(`stadium_pinned_${user!.role}_chats`, JSON.stringify(updatedPins));
  };

  // 6. Delete Chat
  const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await DatabaseService.deleteConversation(id);
    const updatedList = await DatabaseService.getConversations(user!.id, user!.role);
    setConversations(updatedList);
    
    // Clear active conversation if deleted
    if (activeConv?.id === id) {
      if (updatedList.length > 0) {
        handleSelectConversation(updatedList[0]);
      } else {
        setActiveConv(null);
        setMessages([]);
      }
    }
  };

  // 7. Rename Chat
  const handleStartRename = (conv: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingConvId(conv.id);
    setRenameTitle(conv.title);
  };

  const handleSaveRename = async (id: string) => {
    if (!renameTitle.trim()) return;
    await DatabaseService.updateConversationTitle(id, renameTitle.trim());
    setEditingConvId(null);
    const updatedList = await DatabaseService.getConversations(user!.id, user!.role);
    setConversations(updatedList);
    if (activeConv?.id === id) {
      setActiveConv(prev => prev ? { ...prev, title: renameTitle.trim() } : null);
    }
  };

  // 8. Export Chat
  const handleExport = (format: 'txt' | 'md' | 'pdf') => {
    if (!activeConv || messages.length === 0) return;
    const title = activeConv.title;
    const dateStr = new Date(activeConv.created_at).toLocaleString();

    let meta = '';
    if (activeConv.metadata) {
      try {
        const m = JSON.parse(activeConv.metadata);
        meta = `Stadium: ${m.stadiumName} | Matchday: ${m.matchday || 12} | Stage: ${m.stage}`;
      } catch {}
    }

    if (format === 'txt') {
      let content = `FIFA STADIUMOS AI COPILOT CONVERSATION EXPORT\n`;
      content += `Title: ${title}\nDate: ${dateStr}\nContext: ${meta}\n`;
      content += `==========================================\n\n`;

      messages.forEach(m => {
        const senderLabel = m.sender === 'user' ? 'USER' : m.sender === 'assistant' ? 'COPILOT' : 'SYSTEM';
        content += `[${new Date(m.timestamp).toLocaleTimeString()}] ${senderLabel}:\n${m.content}\n\n`;
      });

      const element = document.createElement("a");
      const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
      element.href = URL.createObjectURL(file);
      element.download = `${title.replace(/[\s\W]+/g, "_")}_export.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

    } else if (format === 'md') {
      let content = `# FIFA StadiumOS AI Copilot Chat Export\n\n`;
      content += `* **Title**: ${title}\n* **Date**: ${dateStr}\n* **Context**: ${meta}\n\n`;
      content += `---\n\n`;

      messages.forEach(m => {
        const senderLabel = m.sender === 'user' ? 'User' : m.sender === 'assistant' ? 'Copilot' : 'System';
        content += `### [${new Date(m.timestamp).toLocaleTimeString()}] ${senderLabel}\n\n${m.content}\n\n`;
      });

      const element = document.createElement("a");
      const file = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      element.href = URL.createObjectURL(file);
      element.download = `${title.replace(/[\s\W]+/g, "_")}_export.md`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

    } else if (format === 'pdf') {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      doc.setFillColor(12, 18, 32);
      doc.rect(0, 0, 210, 297, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(16, 185, 129); // Emerald accent
      doc.text('FIFA WORLD CUP 2026™ EXECUTIVE BRIEFING', 15, 20);

      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(`Title: ${title}`, 15, 28);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`Export Date: ${dateStr}`, 15, 34);
      if (meta) {
        doc.text(`Context: ${meta}`, 15, 39);
      }

      doc.setDrawColor(30, 41, 59);
      doc.line(15, 43, 195, 43);

      let currentY = 50;
      doc.setFontSize(9);

      messages.forEach(m => {
        if (currentY > 270) {
          doc.addPage();
          doc.setFillColor(12, 18, 32);
          doc.rect(0, 0, 210, 297, 'F');
          currentY = 20;
        }

        const senderLabel = m.sender === 'user' ? 'USER' : m.sender === 'assistant' ? 'COPILOT' : 'SYSTEM';
        const labelColor = m.sender === 'user' ? [14, 165, 233] : m.sender === 'assistant' ? [16, 185, 129] : [244, 63, 94];

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
        doc.text(`[${new Date(m.timestamp).toLocaleTimeString()}] ${senderLabel}:`, 15, currentY);

        currentY += 4.5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(226, 232, 240);

        const splitText = doc.splitTextToSize(m.content, 175);
        splitText.forEach((line: string) => {
          if (currentY > 275) {
            doc.addPage();
            doc.setFillColor(12, 18, 32);
            doc.rect(0, 0, 210, 297, 'F');
            currentY = 20;
          }
          doc.text(line, 15, currentY);
          currentY += 5;
        });

        currentY += 4; // block gap
      });

      doc.save(`${title.replace(/[\s\W]+/g, "_")}_export.pdf`);
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

  // Filter conversations
  const filteredConvs = conversations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedChats = filteredConvs.filter(c => pinnedIds.includes(c.id));
  const recentChats = filteredConvs.filter(c => !pinnedIds.includes(c.id));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
      {/* 1. CONVERSATIONS SIDEBAR */}
      <div className="xl:col-span-1 w-full bg-[#080d19]/45 border border-slate-900/60 rounded-xl p-4 space-y-4 flex flex-col h-[700px] xl:h-[calc(100vh-140px)]">
        <div className="flex items-center justify-between pb-2 border-b border-slate-900/50">
          <div className="flex items-center gap-1.5 text-white font-bold text-xs uppercase tracking-wider font-mono">
            <Bot className="h-4.5 w-4.5 text-cyan-400" />
            <span>Chat Sessions</span>
          </div>
          <Button
            size="sm"
            onClick={() => handleNewChat()}
            className="bg-cyan-950/40 hover:bg-cyan-900/30 text-cyan-400 hover:text-white border border-cyan-800/40 hover:border-cyan-500/50 h-7 px-2.5 rounded-lg flex items-center gap-1 cursor-pointer text-[10px]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Chat</span>
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sessions..."
            className="pl-8 bg-slate-950/60 border-slate-900 focus-visible:ring-cyan-500/50 text-[11px] placeholder:text-slate-600 text-white rounded-lg h-9"
          />
        </div>

        {/* Sessions list container */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Pinned Chats */}
          {pinnedChats.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono px-1">
                📌 Pinned Chats
              </span>
              {pinnedChats.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleSelectConversation(c)}
                  className={`group relative flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                    activeConv?.id === c.id
                      ? 'bg-cyan-950/20 border-cyan-500/30 text-white'
                      : 'bg-slate-950/20 border-transparent hover:bg-slate-900/30 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {editingConvId === c.id ? (
                    <div className="flex items-center gap-1 w-full" onClick={e => e.stopPropagation()}>
                      <Input
                        value={renameTitle}
                        onChange={(e) => setRenameTitle(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-[11px] h-6 px-1.5 text-white"
                        autoFocus
                      />
                      <button onClick={() => handleSaveRename(c.id)} className="text-emerald-400 p-0.5 hover:bg-slate-900 rounded"><Check className="h-3 w-3" /></button>
                      <button onClick={() => setEditingConvId(null)} className="text-rose-400 p-0.5 hover:bg-slate-900 rounded"><X className="h-3 w-3" /></button>
                    </div>
                  ) : (
                    <>
                      <div className="truncate pr-8 flex-1">
                        <span className="text-xs font-semibold truncate block">{c.title}</span>
                        <span className="text-[8px] text-slate-500 font-mono block mt-0.5">
                          {new Date(c.updated_at).toLocaleDateString()} {new Date(c.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="absolute right-2 top-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => togglePinChat(c.id, e)} className="text-cyan-400 hover:text-cyan-300 p-0.5"><Pin className="h-3 w-3 fill-cyan-400" /></button>
                        <button onClick={(e) => handleStartRename(c, e)} className="text-slate-400 hover:text-white p-0.5"><Edit2 className="h-3 w-3" /></button>
                        <button onClick={(e) => handleDeleteChat(c.id, e)} className="text-rose-400 hover:text-rose-300 p-0.5"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Recent Chats */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono px-1">
              💬 Recent Chats
            </span>
            {recentChats.length === 0 && pinnedChats.length === 0 ? (
              <span className="text-[10px] text-slate-600 block text-center py-6 font-mono">No sessions found.</span>
            ) : (
              recentChats.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleSelectConversation(c)}
                  className={`group relative flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                    activeConv?.id === c.id
                      ? 'bg-cyan-950/20 border-cyan-500/30 text-white'
                      : 'bg-slate-950/20 border-transparent hover:bg-slate-900/30 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {editingConvId === c.id ? (
                    <div className="flex items-center gap-1 w-full" onClick={e => e.stopPropagation()}>
                      <Input
                        value={renameTitle}
                        onChange={(e) => setRenameTitle(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-[11px] h-6 px-1.5 text-white"
                        autoFocus
                      />
                      <button onClick={() => handleSaveRename(c.id)} className="text-emerald-400 p-0.5 hover:bg-slate-900 rounded"><Check className="h-3 w-3" /></button>
                      <button onClick={() => setEditingConvId(null)} className="text-rose-400 p-0.5 hover:bg-slate-900 rounded"><X className="h-3 w-3" /></button>
                    </div>
                  ) : (
                    <>
                      <div className="truncate pr-8 flex-1">
                        <span className="text-xs font-semibold truncate block">{c.title}</span>
                        <span className="text-[8px] text-slate-500 font-mono block mt-0.5">
                          {new Date(c.updated_at).toLocaleDateString()} {new Date(c.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="absolute right-2 top-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => togglePinChat(c.id, e)} className="text-slate-500 hover:text-slate-300 p-0.5"><Pin className="h-3 w-3" /></button>
                        <button onClick={(e) => handleStartRename(c, e)} className="text-slate-400 hover:text-white p-0.5"><Edit2 className="h-3 w-3" /></button>
                        <button onClick={(e) => handleDeleteChat(c.id, e)} className="text-rose-400 hover:text-rose-300 p-0.5"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 2. CHAT PANEL */}
      <div className="xl:col-span-2 w-full">
        <Card className="bg-[#080d19]/45 border-slate-900/60 overflow-hidden flex flex-col h-[700px] xl:h-[calc(100vh-140px)] w-full">
          <CardHeader className="pb-3 border-b border-slate-900/30 shrink-0 bg-slate-950/30">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-white">
                  <Bot className="h-4.5 w-4.5 text-cyan-400" />
                  <span>{activeConv ? activeConv.title : 'FIFA Executive AI Copilot'}</span>
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {activeConv ? `Audited Session (${new Date(activeConv.created_at).toLocaleDateString()})` : 'Select or create a chat session'}
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                {activeConv && messages.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleExport('txt')}
                      className="h-7 text-[10px] text-slate-400 hover:text-white px-2 hover:bg-slate-900 rounded-lg cursor-pointer"
                      title="Export TXT"
                    >
                      TXT
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleExport('md')}
                      className="h-7 text-[10px] text-slate-400 hover:text-white px-2 hover:bg-slate-900 rounded-lg cursor-pointer"
                      title="Export Markdown"
                    >
                      MD
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleExport('pdf')}
                      className="h-7 text-[10px] text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/15 border border-emerald-900/20 hover:border-emerald-500/20 px-2.5 rounded-lg flex items-center gap-1 cursor-pointer"
                      title="Export PDF"
                    >
                      <Download className="h-3 w-3" />
                      <span>PDF</span>
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-1 bg-slate-950/60 border border-slate-900 px-2.5 py-0.5 rounded-full">
                  <span className={`h-1 w-1 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  <span className="text-[8px] font-mono font-bold text-slate-400 uppercase">{isOnline ? 'Online' : 'Offline'}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col min-h-0 relative">
            {/* Context recovered toast notification banner inside chat window */}
            <AnimatePresence>
              {contextAlert && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="sticky top-0 z-10 w-full p-2.5 rounded-lg bg-cyan-950/80 border border-cyan-500/20 text-cyan-400 text-[10px] font-semibold flex items-center gap-1.5 backdrop-blur shadow-lg shadow-cyan-950/40"
                >
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400 shrink-0 animate-pulse" />
                  <span>{contextAlert}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {!activeConv ? (
              <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6 my-auto min-h-0">
                <div className="h-12 w-12 rounded-full bg-cyan-950/20 border border-cyan-900/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg shadow-cyan-950/45">
                  <Bot className="h-6 w-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-300 font-bold tracking-wide uppercase font-mono">FIFA Executive AI Portal</p>
                  <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                    Create a new chat session to analyze stadium operations, workforce tasks, and green metrics.
                  </p>
                </div>
                <Button
                  onClick={() => handleNewChat()}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold h-9 px-6 rounded-lg text-xs"
                >
                  Initialize Command Session
                </Button>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6 my-auto min-h-0">
                <div className="h-10 w-10 rounded-full bg-cyan-950/15 border border-cyan-900/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <Bot className="h-5 w-5 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-slate-300 font-semibold leading-relaxed max-w-[280px] mx-auto">
                    New session started. Restored stadium focus: {selectedStadium.name}.
                  </p>
                </div>
                
                <div className="w-full pt-4 border-t border-slate-900/40 max-w-md">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-2 font-mono text-left px-1">
                    Suggested Queries
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-left max-h-48 overflow-y-auto pr-1">
                    {starterQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(q)}
                        className="text-[9px] text-cyan-300 bg-cyan-950/15 hover:bg-cyan-950/40 border border-slate-900 hover:border-cyan-800/40 px-2.5 py-1.5 rounded-lg text-left transition select-none cursor-pointer hover:text-white"
                      >
                        ✦ {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 min-h-0 flex-1">
                {messages.map((msg: any) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender !== 'user' && (
                      <div className="h-6.5 w-6.5 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center shrink-0">
                        <Bot className="h-3.5 w-3.5 text-cyan-400" />
                      </div>
                    )}
                    <div className={`flex flex-col gap-1 max-w-[85%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`p-3 rounded-2xl text-[11px] leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-cyan-600 text-white rounded-tr-none font-medium'
                            : msg.sender === 'system'
                            ? 'bg-rose-950/20 border border-rose-900/40 text-rose-300 rounded-tl-none font-medium'
                            : 'bg-slate-900/70 border border-slate-850 text-slate-200 rounded-tl-none font-normal'
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
                  <div className="flex items-start gap-2.5">
                    <div className="h-6.5 w-6.5 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center shrink-0">
                      <Bot className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="p-2.5 rounded-2xl rounded-tl-none border border-slate-900/60 bg-slate-950/40 text-xs text-slate-400 flex items-center gap-2">
                        <span className="flex gap-1 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                        <span className="font-mono text-[8.5px] text-slate-500">Gemini is formulating response...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </CardContent>
          
          <CardFooter className="p-3.5 border-t border-slate-900/30 shrink-0 bg-slate-950/20">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(chatInput);
              }}
              className="flex w-full items-center gap-2"
            >
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={activeConv ? "Ask the AI Copilot..." : "Select or create a chat to begin..."}
                className="flex-1 h-10 bg-slate-950/60 border-slate-900 focus-visible:ring-cyan-500/50 text-xs placeholder:text-slate-600 text-white rounded-lg"
                disabled={isThinking || !activeConv}
                autoComplete="off"
              />
              <Button
                type="submit"
                size="icon"
                className="h-10 w-10 bg-cyan-600 hover:bg-cyan-700 text-white shrink-0 cursor-pointer rounded-lg flex items-center justify-center"
                disabled={isThinking || !chatInput.trim() || !activeConv}
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>

      {/* 3. RIGHT EXECUTIVE CONTEXT PANEL */}
      <div className="xl:col-span-1 xl:sticky xl:top-6 w-full">
        <Card className="bg-[#080d19]/45 border-slate-900/60 overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-900/30 bg-slate-950/25">
            <CardTitle className="text-xs font-bold flex items-center gap-1.5 text-white">
              <Activity className="h-4 w-4 text-cyan-400" />
              Executive Context Panel
            </CardTitle>
            <CardDescription className="text-[10px] text-slate-500 font-mono">Real-time parameters parsed to Gemini</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-xs">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2.5 rounded-lg border border-slate-900 bg-slate-950/30">
                <span className="text-slate-500 font-mono text-[9px] uppercase font-semibold">Active Venue</span>
                <span className="text-cyan-400 font-bold font-mono text-[10px] truncate max-w-[130px]">{selectedStadium.name} ({selectedStadium.city})</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg border border-slate-900 bg-slate-950/30 text-center">
                  <span className="text-slate-500 block text-[8px] uppercase font-mono tracking-wider mb-1">Total Attendance</span>
                  <span className="text-white font-black text-xs">{metrics.totalAttendance.toLocaleString()}</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-900 bg-slate-950/30 text-center">
                  <span className="text-slate-500 block text-[8px] uppercase font-mono tracking-wider mb-1">Medical Calls</span>
                  <span className="text-white font-black text-xs">{metrics.medicalIncidents}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg border border-slate-900 bg-slate-950/30 text-center">
                  <span className="text-slate-500 block text-[8px] uppercase font-mono tracking-wider mb-1">Transit Delays</span>
                  <span className="text-white font-black text-xs">{metrics.transitDelayPercent}%</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-900 bg-slate-950/30 text-center">
                  <span className="text-slate-500 block text-[8px] uppercase font-mono tracking-wider mb-1">Renewable Power</span>
                  <span className="text-white font-black text-xs">{metrics.renewablePercent}%</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-dashed border-rose-950/40 bg-rose-950/10 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-rose-400 block font-mono">Highest Risk Alert</span>
                  <p className="text-[10px] text-slate-350 leading-normal">Los Angeles Gate 5 approaching congestion.</p>
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
                    onClick={() => {
                      selectStadium(s.id);
                      if (activeConv) {
                        // Create context sync
                        const updatedMeta = {
                          stadiumId: s.id,
                          stadiumName: s.name,
                          matchday: '12',
                          stage: s.match?.stage || 'Quarter Final',
                          dashboard: user!.role,
                          timestamp: new Date().toISOString()
                        };
                        DatabaseService.createConversation(user!.id, user!.role as any, activeConv.title, updatedMeta);
                      }
                    }}
                    className={`text-[9px] font-bold py-1.5 px-1 rounded transition capitalize select-none cursor-pointer text-center ${
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
