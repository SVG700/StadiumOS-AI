'use server';

import { askGemini } from '@/lib/gemini';

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
