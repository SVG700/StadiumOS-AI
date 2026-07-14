import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

// Check if Gemini API key is validly configured
export const isGeminiConfigured = !!(
  apiKey &&
  apiKey.trim() !== '' &&
  apiKey !== 'your-gemini-api-key'
);

const genAI = isGeminiConfigured ? new GoogleGenerativeAI(apiKey!) : null;

/**
 * Calls Gemini model to generate content.
 * This runs strictly server-side to secure the API key.
 */
export async function askGemini(prompt: string, systemInstruction?: string): Promise<string> {
  if (!isGeminiConfigured || !genAI) {
    return "AI Assistant is currently unavailable. Please configure the Gemini API key.";
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });

    const formattedPrompt = systemInstruction 
      ? `System Instructions:\n${systemInstruction}\n\nUser Question:\n${prompt}`
      : prompt;

    const result = await model.generateContent(formattedPrompt);
    const response = await result.response;
    return response.text() || 'Unable to retrieve text response from Gemini.';
  } catch (error) {
    const err = error as Error;
    console.error('Error invoking Gemini SDK:', err);
    return `[Gemini API Offline] ${simulateStadiumAI(prompt)} (Error Detail: ${err.message || String(err)})`;
  }
}

/**
 * Intelligent Mock Response Generator for FIFA 2026 Stadium Operations (Demo Mode)
 */
function simulateStadiumAI(prompt: string): string {
  const query = prompt.toLowerCase();
  
  if (query.includes('crowd') || query.includes('congestion') || query.includes('density')) {
    return `**[StadiumOS AI - Crowd Control Division]** 
Current seating bowl capacity is at **88%** (68,420 active visitors). 
- **Concourse North (Zone C)** is currently at **92% density** (critical). 
- **Recommendation:** Security teams should implement the "North Concourse Flow Divider" protocol. Redirect inbound traffic from Gate 3 to Gate 4 where density is only 45%. 
- Crowd management drones are monitoring Gate 3.`;
  }
  
  if (query.includes('emergency') || query.includes('alert') || query.includes('fire') || query.includes('medical')) {
    return `**[StadiumOS AI - Emergency Control Center]** 
We have **3 active incidents** on the radar:
1. **Critical:** Spectator experiencing heat exhaustion in Section 104, Row K. *Status: Medical Response 1 is on scene.*
2. **Medium:** Crowd congestion at Gate 3 Turnstiles. *Status: Crowd Control Alpha is re-routing traffic.*
3. **Low:** Elevator EL-4 (West Stand Level 2) outage. *Status: Maintenance Team B is on-site.*
- **System Action:** All responders are tracking locations via UWB badges. Fire systems are green. Security frequencies remain clear.`;
  }

  if (query.includes('transport') || query.includes('bus') || query.includes('metro') || query.includes('parking') || query.includes('shuttle')) {
    return `**[StadiumOS AI - Logistics & Transport]** 
Transport operations report for FIFA Matchday:
- **Stadium Express (Metro Line 1):** Running at 4-minute intervals. Peak capacity.
- **Downtown Shuttle (Route A):** Experiencing a 12-minute delay due to minor congestion near the highway ramp. 3 shuttles are currently rerouted via Sector 7.
- **West Parking Shuttle:** High efficiency, 3-minute ETA.
- **Tip:** Advise departing fans in Zone B/C to utilize Metro Gate 2 to reduce bottlenecking at the central terminus.`;
  }

  if (query.includes('access') || query.includes('wheelchair') || query.includes('sensory') || query.includes('disabled')) {
    return `**[StadiumOS AI - Accessibility Services]** 
Current status of accessibility assistance requests:
- **Active Requests:** 2 pending/in-progress.
- **Request 1:** Wheelchair transfer needed at Gate 1 Drop-off. Assigned to *Volunteer Sarah M.* (Status: In-progress).
- **Request 2:** Sensory room booking for Suite 24. *Status: Pending assignment.*
- **Action:** Inform staff near Suite 24 to prepare the noise-dampening kits and sensory visualizer. Let me know if you would like me to dispatch volunteer Kenji S. to assist.`;
  }

  if (query.includes('sustain') || query.includes('green') || query.includes('energy') || query.includes('recycle') || query.includes('carbon')) {
    return `**[StadiumOS AI - Sustainability Ledger]** 
Real-time environmental impact tracking:
- **Energy Draw:** 4,200 kW. **86%** is sourced from the solar-canopy and local wind batteries.
- **Offset:** 3,240 kg of CO2 equivalent saved today.
- **Waste Management:** 1,480 kg of organic waste recycled via composting bins at Concourse level.
- **Tip:** Water pressure in South Stand restroom block has been optimized, saving approximately 12,400 litres so far.`;
  }

  if (query.includes('volunteer') || query.includes('staff')) {
    return `**[StadiumOS AI - Workforce Management]** 
Workforce summary:
- **Checked-in Volunteers:** 1,240 total.
- **On Duty:** 980 active. **On Break:** 260.
- **Featured Activities:**
  - *Marcus Vance* is managing crowd flow at Gate 3.
  - *Elena Rostova* is stationed at Medical Aid Post B (Section 112).
  - *Kenji Sato* is performing an accessibility escort at Gate 1.
- You can allocate new tasks using the **Workforce Console** or assign pending Accessibility tickets.`;
  }

  return `**[StadiumOS AI Operations Center]** 
Welcome to the FIFA World Cup 2026 Stadium Operating System. 

I am your Gemini-powered Operations Copilot. I can query real-time dashboards, manage emergency dispatches, audit energy parameters, coordinates workforce activities, and track transport logistics.

How can I assist you with stadium management, safety patrols, or accessibility services today?`;
}
