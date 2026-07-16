/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '@/app/actions/chat';
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

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useStadium } from '@/components/stadium/StadiumContext';
import { useAuth } from '@/components/auth/AuthProvider';
import { DatabaseService } from '@/lib/db';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Send, User, Sparkles, Terminal, CheckCircle, AlertTriangle, Info, Map, 
  ShieldAlert, PhoneCall, Accessibility, Check, X, ShieldCheck, Search, Plus,
  Pin, Trash2, Edit2, Download, RefreshCw
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

let messageCounter = 0;
const generateUniqueId = (prefix: string) => `${prefix}-${++messageCounter}-${Math.random().toString(36).substring(2, 6)}`;
const getIsoTimestamp = () => new Date().toISOString();

export default function AIAssistantPage() {
  const { user } = useAuth();

  // Shared Stadium Context
  const { 
    stadiums,
    selectedStadium, 
    selectStadium, 
    executeAction, 
    rejectRecommendation 
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

  // AI assistant input states
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingIndex, setThinkingIndex] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [contextAlert, setContextAlert] = useState<string | null>(null);
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

  const quickPrompts = isVisitor ? QUICK_PROMPTS_VISITOR : QUICK_PROMPTS_STAFF;

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

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = generateUniqueId('toast');
    setToasts((prev: Toast[]) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev: Toast[]) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

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
      : (isVisitor ? 'Fan Companion Chat' : `Operations - ${selectedStadium.city} M12`);

    const newConv = await DatabaseService.createConversation(
      user.id,
      user.role as any,
      defaultTitle,
      metadata
    );

    // Add initial welcome system message if no starter query
    if (!initialQuery) {
      const welcomeText = isVisitor
        ? `Welcome to Stadium Alpha! I am your **FIFA Fan Companion AI**. \n\nI can help you locate your seat, find the nearest restrooms, locate concessions/tacos, get parking guidance, book wheelchair assistance, or request security and volunteers.\n\nWhat can I help you find in the stadium today?`
        : `Hello! I am the **StadiumOS AI Decision Engine**. \n\nI monitor live camera feeds, gate queues, transit schedules, emergency dispatches, and green grids. \n\nSubmit operational prompts to analyze risks, deploy personnel, or adjust stadium parameters.`;
      
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

  // 4. Action Handlers
  const handleApplyAction = async (actionType: string, promptText: string) => {
    setIsThinking(true);
    setThinkingIndex(0);

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
    
    if (activeConv) {
      DatabaseService.addMessage(
        activeConv.id,
        'system',
        `❌ **AI Recommendation Rejected**: ${actionType.replace('_', ' ')} declined by executive command.`
      ).then(() => {
        if (activeConv) handleSelectConversation(activeConv);
      });
    }
  };

  const executeAllPlan = async (acts: string[], promptText: string) => {
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

  // 5. Simulated Responses
  const getSimulatedResponse = (text: string): string => {
    const q = text.toLowerCase();
    
    if (isVisitor) {
      if (q.includes('seat')) {
        return `Your ticketed seat is located at **Section 102, Row H, Seat 14** (Gate 4 North Side Recommended entrance). \n[ACTION:OPEN_NAVIGATION]`;
      }
      if (q.includes('restroom') || q.includes('toilet') || q.includes('bathroom')) {
        return `The nearest restroom is located on the **Concourse West Loop Level 1**, approximately 25 meters from your seating section 102.\n[ACTION:OPEN_NAVIGATION]`;
      }
      if (q.includes('food') || q.includes('concession') || q.includes('eat') || q.includes('taco') || q.includes('drink') || q.includes('hungry')) {
        return `Concessions A (offering premium hotdogs, tacos, pre-match pretzels, and soft drinks) is directly adjacent to the **Section 102 entrance door**.\n[ACTION:OPEN_NAVIGATION]`;
      }
      if (q.includes('parking') || q.includes('car')) {
        return `Your spectator pass is assigned to **Parking Zone A** near the North boulevard. Walking distance to Gate 4 is 4 minutes.\n[ACTION:OPEN_NAVIGATION]`;
      }
      if (q.includes('medical') || q.includes('first aid') || q.includes('doctor') || q.includes('injury') || q.includes('hurt')) {
        return `Emergency Medical Pod 2 is located right beside the **Gate 4 turnstiles lobby**. Standby crews are ready.\n[ACTION:LOCATE_MEDICAL]`;
      }
      if (q.includes('lost') || q.includes('child') || q.includes('security')) {
        return `I understand you need immediate assistance. I am flagging a **Security Dispatch ticket** to Section 102 Row H immediately. A supervisor is being notified.\n[ACTION:REQUEST_HELP] [ACTION:CALL_VOLUNTEER]`;
      }
      if (q.includes('wheelchair') || q.includes('disabled') || q.includes('assist')) {
        return `We can arrange for an accessibility escort volunteer to assist with transfer or book a wheelchair.\n[ACTION:BOOK_WHEELCHAIR]`;
      }
      if (q.includes('exit') || q.includes('leave') || q.includes('evacuate')) {
        return `Spectator exits are located at all primary gates. The closest exit for you is **Gate 4 Corridor**.\n[ACTION:OPEN_NAVIGATION]`;
      }
      if (q.includes('transit') || q.includes('home') || q.includes('bus') || q.includes('metro')) {
        return `Express metro shuttles run from the North Transit hub, operating every 4 minutes. Downtown buses depart from Gate 2 taxi bay.\n[ACTION:OPEN_NAVIGATION]`;
      }
    } else {
      if (q.includes('gate') || q.includes('overcrowd') || q.includes('crowd')) {
        return `Based on live telemetry from Gate 3 and current visitor inflow, I recommend opening Gate 4 turnstiles immediately while dispatching Crowd Control Alpha. This is expected to reduce congestion by approximately 31% within the next 12 minutes.\n[CONFIDENCE:96%] [RISK:Low] [IMPROVEMENT:31% congestion reduction] [ACTION:OPEN_GATE_4]`;
      }
      if (q.includes('rain') || q.includes('weather') || q.includes('storm')) {
        return `Heavy rain is forecast to impact kick-off in 45 minutes. I have compiled a 4-step operational readiness plan to safeguard incoming spectators and coordinate staff dispatches.\n[CONFIDENCE:98%] [RISK:Low] [IMPROVEMENT:100% Dry Coverage] [PLAN:OPEN_GATE_4,REDIRECT_CROWD,ACTIVATE_ACCESSIBILITY,INCREASE_SHUTTLE]`;
      }
      if (q.includes('medical') || q.includes('help') || q.includes('sick') || q.includes('accident')) {
        return `AI safety cameras flagged a heat exhaustion medical incident at Section 108. Recommended Action: Dispatch Medical Team 2 immediately.\n[CONFIDENCE:99%] [RISK:Low] [IMPROVEMENT:45s dispatch ETA] [ACTION:DEPLOY_MEDICAL]`;
      }
      if (q.includes('shuttle') || q.includes('transit') || q.includes('bus') || q.includes('queue')) {
        return `Express shuttle terminal queues are exceeding 15 minutes due to expressway traffic. Recommended Action: Double Metro Line B dispatch frequency.\n[CONFIDENCE:94%] [RISK:Low] [IMPROVEMENT:60% queue reduction] [ACTION:INCREASE_SHUTTLE]`;
      }
      if (q.includes('accessibility') || q.includes('wheelchair') || q.includes('volunteers')) {
        return `Wheelchair companion backlog detected at Gate 4 Turnstiles lobby. Recommended Action: Mobilize standby accessibility escorts.\n[CONFIDENCE:95%] [RISK:Low] [IMPROVEMENT:Clear queue] [ACTION:ACTIVATE_ACCESSIBILITY]`;
      }
      if (q.includes('energy') || q.includes('power') || q.includes('solar')) {
        return `Peak grid consumption draw detected. Recommended Action: Dim secondary advertising screens to cut load.\n[CONFIDENCE:91%] [RISK:Low] [IMPROVEMENT:450 kW reclaimed] [ACTION:REDUCE_ENERGY]`;
      }
    }
    return '';
  };

  // 6. Send message workflow
  const handleSendMessage = async (textToSend: string, targetConv = activeConv) => {
    if (!textToSend.trim() || isThinking || !user) return;

    const conv = targetConv;
    if (!conv) {
      await handleNewChat(textToSend);
      return;
    }

    const userMsg = await DatabaseService.addMessage(conv.id, 'user', textToSend.trim());
    setMessages((prev: ChatMessage[]) => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);
    setThinkingIndex(0);

    // Simulated Thinking Loops
    for (let i = 0; i < THINKING_STEPS.length; i++) {
      setThinkingIndex(i);
      await new Promise(r => setTimeout(r, 450));
    }

    const simulated = getSimulatedResponse(textToSend);
    if (simulated) {
      const aiMsg = await DatabaseService.addMessage(conv.id, 'assistant', simulated);
      setMessages((prev: ChatMessage[]) => [...prev, aiMsg]);
      setIsThinking(false);
      
      const updatedList = await DatabaseService.getConversations(user.id, user.role);
      setConversations(updatedList);
      return;
    }

    try {
      const result = await sendChatMessage(textToSend);
      const replyContent = result.success && result.reply 
        ? result.reply 
        : `Gemini Operational Hub: Target telemetry checked. Parameters nominal. No anomalies reported.`;

      const aiMsg = await DatabaseService.addMessage(conv.id, 'assistant', replyContent);
      setMessages((prev: ChatMessage[]) => [...prev, aiMsg]);
      
      if (conv.title.startsWith('Operations -') && messages.length <= 2) {
        const autoTitle = textToSend.length > 25 ? `${textToSend.substring(0, 25)}...` : textToSend;
        await DatabaseService.updateConversationTitle(conv.id, autoTitle);
      }
      
      const updatedList = await DatabaseService.getConversations(user.id, user.role);
      setConversations(updatedList);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsThinking(false);
    }
  };

  const handleQuickPromptClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  // 7. Pin / Unpin Chats
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

  // 8. Delete Chat
  const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await DatabaseService.deleteConversation(id);
    const updatedList = await DatabaseService.getConversations(user!.id, user!.role);
    setConversations(updatedList);
    
    if (activeConv?.id === id) {
      if (updatedList.length > 0) {
        handleSelectConversation(updatedList[0]);
      } else {
        setActiveConv(null);
        setMessages([]);
      }
    }
  };

  // 9. Rename Chat
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

  // 10. Multi-format export
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
      let content = `STADIUMOS AI DECISION ENGINE EXPORT\n`;
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
      let content = `# StadiumOS AI Decision Engine Export\n\n`;
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
      doc.setTextColor(6, 182, 212); // Cyan accent
      doc.text('STADIUMOS DECISION SYSTEM REPORT', 15, 20);

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
        const labelColor = m.sender === 'user' ? [14, 165, 233] : m.sender === 'assistant' ? [6, 182, 212] : [244, 63, 94];

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

        currentY += 4;
      });

      doc.save(`${title.replace(/[\s\W]+/g, "_")}_export.pdf`);
    }
  };

  // Parses markdown, actions, confidence cards and multi-step plans
  const formatMessageContent = (content: string, promptText: string) => {
    const lines = content.split('\n');
    
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

    const hasTelemetry = confidence || risk || improvement || actions.length > 0 || plans.length > 0;

    return (
      <div className="space-y-3">
        <div className="space-y-1.5">{parsedText}</div>
        
        {hasTelemetry && (
          <div className="pt-2 border-t border-slate-900/60 mt-2 space-y-2">
            {/* KPI Telemetry row */}
            {(confidence || risk || improvement) && (
              <div className="flex flex-wrap gap-2">
                {confidence && (
                  <Badge variant="secondary" className="text-[8.5px] border-slate-805 bg-slate-950/50 text-cyan-400 font-mono">
                    AI Confidence: {confidence}
                  </Badge>
                )}
                {risk && (
                  <Badge variant="secondary" className={`text-[8.5px] border-slate-805 bg-slate-950/50 font-mono ${risk.toLowerCase() === 'low' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    Risk: {risk}
                  </Badge>
                )}
                {improvement && (
                  <Badge variant="secondary" className="text-[8.5px] border-slate-805 bg-slate-950/50 text-cyan-400 font-mono">
                    Impact: {improvement}
                  </Badge>
                )}
              </div>
            )}

            {/* Standard Actions */}
            {actions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {actions.map((act, idx) => actionButton(act, idx))}
              </div>
            )}

            {/* Multi-step plans */}
            {plans.length > 0 && (
              <div className="pt-1.5 space-y-2">
                <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-bold text-slate-500 font-mono">
                  <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Proposed Multi-Step Operational Plan</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-900 bg-slate-950/40 text-[10px] space-y-2">
                  <ol className="list-decimal list-inside space-y-1 text-slate-400">
                    {plans.map((p, idx) => {
                      let label = p;
                      if (p === 'OPEN_GATE_4') label = 'Instruct turnstiles override at Gate 4';
                      else if (p === 'REDIRECT_CROWD') label = 'Dispatch pedestrian route redirection indicators';
                      else if (p === 'ACTIVATE_ACCESSIBILITY') label = 'Mobilize accessibility volunteer taskforces';
                      else if (p === 'INCREASE_SHUTTLE') label = 'Escalate shuttle departure frequencies';
                      return <li key={idx} className="capitalize">{label}</li>;
                    })}
                  </ol>
                  <Button
                    onClick={() => executeAllPlan(plans, promptText)}
                    size="sm"
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-slate-950 font-black text-[10px] h-7 px-3.5 rounded-lg flex gap-1 items-center justify-center cursor-pointer mt-2"
                  >
                    <CheckCircle className="h-3.5 w-3.5 text-slate-950" />
                    <span>Authorize Complete Multi-Step Plan</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const filteredConvs = conversations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedChats = filteredConvs.filter(c => pinnedIds.includes(c.id));
  const recentChats = filteredConvs.filter(c => !pinnedIds.includes(c.id));

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-100px)]">
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-3 rounded-lg border shadow-lg text-xs font-semibold flex items-center gap-2 max-w-sm ${
              t.type === 'success' 
                ? 'bg-emerald-950/80 border-emerald-500/20 text-emerald-300'
                : t.type === 'warning'
                ? 'bg-rose-950/80 border-rose-500/20 text-rose-300'
                : 'bg-cyan-950/80 border-cyan-500/20 text-cyan-300'
            }`}
          >
            <Info className="h-4 w-4 shrink-0" />
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 min-h-0">
        
        {/* Left Column: Sidebar list & Quick Actions */}
        <div className="md:col-span-1 flex flex-col gap-4 h-full overflow-hidden">
          
          {/* Chat Sessions list */}
          <Card className="bg-[#080d19]/45 border-slate-900/60 p-4 space-y-3.5 flex flex-col h-[55%]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-900/50">
              <div className="flex items-center gap-1.5 text-white font-bold text-xs uppercase tracking-wider font-mono">
                <Bot className="h-4.5 w-4.5 text-cyan-400" />
                <span>Chat History</span>
              </div>
              <Button
                size="sm"
                onClick={() => handleNewChat()}
                className="bg-cyan-950/40 hover:bg-cyan-900/30 text-cyan-400 hover:text-white border border-cyan-800/40 hover:border-cyan-500/50 h-6 px-2 rounded-lg flex items-center gap-0.5 cursor-pointer text-[9px]"
              >
                <Plus className="h-3 w-3" />
                <span>New</span>
              </Button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-2 top-2 h-3 w-3 text-slate-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="pl-7 bg-slate-950/60 border-slate-900 focus-visible:ring-cyan-500/50 text-[10px] placeholder:text-slate-650 text-white rounded-lg h-8"
              />
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-[11px]">
              {/* Pinned Chats */}
              {pinnedChats.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block font-mono px-1">📌 Pinned</span>
                  {pinnedChats.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleSelectConversation(c)}
                      className={`group relative flex items-center justify-between p-2 rounded border transition-all cursor-pointer ${
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
                            className="bg-slate-950 border-slate-800 text-[10px] h-5 px-1 text-white"
                            autoFocus
                          />
                          <button onClick={() => handleSaveRename(c.id)} className="text-emerald-400 p-0.5 hover:bg-slate-900 rounded"><Check className="h-3 w-3" /></button>
                        </div>
                      ) : (
                        <>
                          <span className="truncate pr-6 font-semibold block">{c.title}</span>
                          <div className="absolute right-1 top-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => togglePinChat(c.id, e)} className="text-cyan-400 p-0.5"><Pin className="h-2.5 w-2.5 fill-cyan-400" /></button>
                            <button onClick={(e) => handleStartRename(c, e)} className="text-slate-400 p-0.5"><Edit2 className="h-2.5 w-2.5" /></button>
                            <button onClick={(e) => handleDeleteChat(c.id, e)} className="text-rose-400 p-0.5"><Trash2 className="h-2.5 w-2.5" /></button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Recent Chats */}
              <div className="space-y-1">
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block font-mono px-1">💬 Recent</span>
                {recentChats.length === 0 && pinnedChats.length === 0 ? (
                  <span className="text-[9px] text-slate-600 block text-center py-4">No sessions.</span>
                ) : (
                  recentChats.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleSelectConversation(c)}
                      className={`group relative flex items-center justify-between p-2 rounded border transition-all cursor-pointer ${
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
                            className="bg-slate-950 border-slate-800 text-[10px] h-5 px-1 text-white"
                            autoFocus
                          />
                          <button onClick={() => handleSaveRename(c.id)} className="text-emerald-400 p-0.5 hover:bg-slate-900 rounded"><Check className="h-3 w-3" /></button>
                        </div>
                      ) : (
                        <>
                          <span className="truncate pr-6 font-semibold block">{c.title}</span>
                          <div className="absolute right-1 top-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => togglePinChat(c.id, e)} className="text-slate-500 p-0.5"><Pin className="h-2.5 w-2.5" /></button>
                            <button onClick={(e) => handleStartRename(c, e)} className="text-slate-400 p-0.5"><Edit2 className="h-2.5 w-2.5" /></button>
                            <button onClick={(e) => handleDeleteChat(c.id, e)} className="text-rose-400 p-0.5"><Trash2 className="h-2.5 w-2.5" /></button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>

          {/* Quick Actions List (preset queries) */}
          <Card className="bg-[#080d19]/45 border-slate-900/60 p-4 space-y-3.5 flex flex-col h-[45%] overflow-hidden">
            <CardHeader className="p-0">
              <CardTitle className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1 font-mono">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto space-y-2 pr-1">
              {quickPrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickPromptClick(item.prompt)}
                  className="w-full text-left p-2 rounded border border-slate-900 bg-[#070b13]/60 hover:bg-[#0c1322] hover:border-cyan-500/20 transition-all duration-200 cursor-pointer"
                >
                  <span className="font-bold text-[10px] text-cyan-400 block mb-0.5">{item.label}</span>
                  <span className="text-[9px] text-slate-500 line-clamp-1 leading-normal">{item.prompt}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Chat box (3 cols) */}
        <Card className="md:col-span-3 flex flex-col min-h-0 border-slate-900/60 bg-[#080d19]/30 h-full overflow-hidden">
          <CardHeader className="border-b border-slate-900/60 p-3.5 flex flex-row items-center justify-between bg-slate-950/20">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-cyan-400 animate-ping shadow" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-350 truncate max-w-[200px]">
                {activeConv ? activeConv.title : 'Live Decision Session'}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {activeConv && messages.length > 0 && (
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleExport('txt')}
                    className="h-6.5 text-[9px] text-slate-400 hover:text-white px-2 hover:bg-slate-900 rounded-lg cursor-pointer"
                  >
                    TXT
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleExport('md')}
                    className="h-6.5 text-[9px] text-slate-400 hover:text-white px-2 hover:bg-slate-900 rounded-lg cursor-pointer"
                  >
                    MD
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleExport('pdf')}
                    className="h-6.5 text-[9px] text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/15 border border-cyan-900/20 hover:border-cyan-500/20 px-2.5 rounded-lg flex items-center gap-0.5 cursor-pointer font-bold"
                  >
                    <Download className="h-3 w-3" />
                    <span>PDF</span>
                  </Button>
                </div>
              )}
              <Badge variant="cyan" className="text-[9px] uppercase tracking-wider px-2 shrink-0">ONLINE</Badge>
            </div>
          </CardHeader>

          {/* Messages Stream Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 relative min-h-0">
            {/* Context restore banner */}
            <AnimatePresence>
              {contextAlert && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="sticky top-0 z-10 w-full p-2 rounded-lg bg-cyan-950/85 border border-cyan-500/20 text-cyan-400 text-[10px] font-semibold flex items-center gap-1.5 backdrop-blur shadow"
                >
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  <span>{contextAlert}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {!activeConv ? (
              <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6 my-auto min-h-[45vh]">
                <div className="h-10 w-10 rounded-full bg-cyan-950/15 border border-cyan-900/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <Bot className="h-5 w-5 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-350 font-bold uppercase tracking-wider font-mono">StadiumOS Decision Portal</p>
                  <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed mx-auto">
                    Select a previous session from the history sidebar or create a new session to begin auditing.
                  </p>
                </div>
                <Button
                  onClick={() => handleNewChat()}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold h-9 px-6 rounded-lg text-xs"
                >
                  Start New Session
                </Button>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4 my-auto min-h-[45vh]">
                <div className="h-9 w-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
                  <Bot className="h-4.5 w-4.5 animate-pulse" />
                </div>
                <p className="text-xs text-slate-300 font-semibold leading-relaxed max-w-[260px] mx-auto">
                  New operations chat initialized. Analyzing {selectedStadium.name}.
                </p>
                <div className="w-full pt-4 border-t border-slate-900/40 max-w-sm text-left">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 font-mono px-1">
                    Suggested Telemetry Queries
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {quickPrompts.slice(0, 3).map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(item.prompt)}
                        className="text-[9.5px] text-cyan-300 bg-cyan-950/10 hover:bg-cyan-950/30 border border-slate-900 hover:border-cyan-800/30 px-2.5 py-1.5 rounded-lg transition text-left cursor-pointer"
                      >
                        ✦ {item.prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 min-h-0 flex-1">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className={`flex gap-3 max-w-[85%] ${
                        msg.sender === 'user' 
                          ? 'ml-auto flex-row-reverse' 
                          : msg.sender === 'system'
                          ? 'mx-auto max-w-[95%]'
                          : 'mr-auto'
                      }`}
                    >
                      {msg.sender !== 'system' && (
                        <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center border ${
                          msg.sender === 'user' 
                            ? 'bg-blue-650 border-blue-500/20 text-white' 
                            : 'bg-slate-900 border-slate-800 text-cyan-400'
                        }`}>
                          {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </div>
                      )}

                      <div className={`rounded-xl px-3.5 py-2.5 border shadow-sm ${
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

                {isThinking && (
                  <div className="flex gap-3 max-w-[80%] mr-auto items-center">
                    <div className="h-8 w-8 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 flex items-center justify-center">
                      <Bot className="h-4 w-4 animate-bounce" />
                    </div>
                    <div className="rounded-xl px-4 py-2.5 bg-[#0d1324] border border-slate-800 text-slate-400 text-xs flex gap-2 items-center">
                      <div className="flex space-x-1 shrink-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" />
                      </div>
                      <span className="font-mono text-[10px] text-slate-500">{THINKING_STEPS[thinkingIndex]}</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Form input bar */}
          <div className="p-3.5 border-t border-slate-900/60 bg-slate-950/20 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(input);
              }}
              className="flex gap-2"
            >
              <Input
                placeholder={
                  !activeConv 
                    ? "Select or start a chat session..."
                    : isVisitor 
                    ? "Ask: Where is my seat? / Restrooms / Tacos / Lost child help..." 
                    : "Ask AI Copilot for crowd reroutes, transit delays, safety checks..."
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isThinking || !activeConv}
                className="flex-1 bg-[#050912] border-slate-900 focus-visible:ring-cyan-500/40 placeholder-slate-650 text-xs text-white"
              />
              <Button type="submit" size="icon" disabled={isThinking || !input.trim() || !activeConv} className="cursor-pointer bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
