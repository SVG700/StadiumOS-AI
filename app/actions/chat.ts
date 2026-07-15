'use server';

import { askGemini, isGeminiConfigured } from '@/lib/gemini';

export async function checkGeminiStatus() {
  return { online: isGeminiConfigured };
}

const SYSTEM_INSTRUCTION = `
You are the StadiumOS AI operations copilot for the FIFA World Cup 2026.
Your role is to assist stadium managers, security, volunteers, medical, and logistics teams.
You have access to simulated live feeds including crowd density, alerts, transport ETAs, accessibility tickets, and energy grids.
Provide professional, concise, operational instructions. Help dispatch units, resolve safety issues, and manage crowd bottlenecks.
Maintain a high-tech, calm, and authoritative operational tone.
`;

export async function sendChatMessage(prompt: string) {
  try {
    const reply = await askGemini(prompt, SYSTEM_INSTRUCTION);
    return { success: true, reply };
  } catch (error) {
    const err = error as Error;
    console.error('Error in sendChatMessage action:', err);
    return { 
      success: false, 
      error: err.message || 'Failed to generate operational response' 
    };
  }
}

export async function sendExecutiveChatMessage(prompt: string, dashboardContext?: string) {
  try {
    const systemPrompt = `You are FIFA Executive AI Copilot for StadiumOS.

You assist FIFA executives with:

* Stadium Operations
* Security Decisions
* Crowd Analytics
* Medical Incident Analysis
* Sustainability Reports
* Energy Optimization
* Transportation Logistics
* Match Operations
* Risk Assessment
* Executive Decision Support

Always answer professionally.

If numerical data is available on the dashboard, reference it naturally.

Never pretend to access unavailable information.`;

    const fullPrompt = dashboardContext 
      ? `Dashboard Context:\n${dashboardContext}\n\nUser Question:\n${prompt}`
      : prompt;

    const reply = await askGemini(fullPrompt, systemPrompt);
    
    // Check if the reply indicates offline or configuration issues
    if (
      reply.includes('[Gemini API Offline]') || 
      reply.includes('AI Assistant is currently unavailable')
    ) {
      return { 
        success: false, 
        error: 'Gemini AI is temporarily unavailable.' 
      };
    }
    
    return { success: true, reply };
  } catch (error) {
    const err = error as Error;
    console.error('Error in sendExecutiveChatMessage action:', err);
    return { 
      success: false, 
      error: 'Gemini AI is temporarily unavailable.' 
    };
  }
}

