# HomeCare AI — Inbound Voice Customer Support & Service Resolution

> **AI-powered inbound customer support and autonomous service resolution for home appliances.**
> *Understand every customer call. Resolve issues faster. Automate service actions.*

HomeCare AI is an enterprise B2B platform purpose-built for home-appliance manufacturers and after-sales service operations handling inbound calls across India for:
- ❄️ **Air Conditioners**
- 🧺 **Washing Machines**
- 🧊 **Refrigerators**
- 📺 **Televisions**
- 💧 **Water Purifiers**

---

## The Inbound Product Journey

```
Customer calls +91 Toll-Free Helpline
        │
    VoiceLink receives inbound call & initiates low-latency audio stream
        │
  AI Voice Agent answers, greets caller & verifies caller identity (+91 phone)
        │
  AI identifies registered appliance & extracts core customer grievance
        │
  AI conducts diagnostic inquiry (acoustic cues, error codes, fault symptoms)
        │
  AI decides action (troubleshooting vs service ticket vs escalation)
        │
  Action Engine creates Service Request & dispatches confirmation SMS
        │
  Customer receives immediate resolution; Support Team monitors via Dashboard
```

### The Autonomous Product Loop
**UNDERSTAND** → **DECIDE** → **ACT** → **RECORD** → **MEASURE**

> **IMPORTANT:** HomeCare AI is strictly an **INBOUND customer-support platform**. The customer calls the company; the AI does NOT make unsolicited outbound calls.

---

## Phase 1 Architecture & Implementation

Phase 1 establishes the complete, production-grade frontend experience, data models, and modular service abstractions.

### What is Included in Phase 1:
1. **Full Application Navigation & Shell**:
   - Persistent desktop sidebar with active route states, live call badges, and user profile.
   - Responsive mobile/tablet slide-over drawer.
   - Global search, inbound line status (`+91 1800 209 8899`), and real-time IST clock.
   - Continuous Product Loop banner (*Understand → Decide → Act → Record → Measure*).

2. **9 Core Modules + Deep Detail Views**:
   - **Dashboard (`/`)**: "Good evening" greeting, 5 primary KPIs (Total Calls 147, AI Resolution 82%, Service Requests 34, Human Escalations 18, Avg Duration 02:41), active calls snapshot, horizontal bar chart for top problems, AI performance metrics, and recent service requests.
   - **Live Calls (`/live-calls`) & Detail (`/live-calls/[id]`)**: Real-time monitoring center with live state indicators (*Listening*, *Thinking*, *Taking Action*), audio metrics, speaker-by-speaker live transcript, AI understanding card, and current action with live pulse indicator.
   - **Calls History (`/calls`) & Detail (`/calls/[id]`)**: Searchable & filterable table across appliances, intents, sentiments, and outcomes. Detail view with AI summary, full speaker transcript, AI analysis, and actions-taken checklist.
   - **Customers (`/customers`) & Customer 360 (`/customers/[id]`)**: Searchable directory, registered appliance cards, service history timeline, open tickets, and recent call logs.
   - **Appliances (`/appliances`) & Detail (`/appliances/[id]`)**: Hardware inventory across ACs, Washing Machines, Refrigerators, TVs, and Water Purifiers, technical specs, warranty validity, and service history.
   - **Service Requests (`/service-requests`) & Detail (`/service-requests/[id]`)**: Filterable dispatch pipeline (New, Assigned, Technician Scheduled, In Progress, Resolved), call source links (`CALL-83921`), and milestone timelines.
   - **Knowledge Base (`/knowledge-base`)**: 16 categorized troubleshooting guides and policies prepared for future vector RAG with interactive modal reader.
   - **Analytics (`/analytics`)**: Time-series inbound volume charts, AI resolution share donut gauge, appliance breakdown, root problem analysis, and operational quality metrics.
   - **Settings (`/settings`)**: Voice agent configuration (persona name, greeting, language, tone), AI confidence safety thresholds (80%), escalation rules, company profile, and placeholder integration cards (*VoiceLink*, *Supabase*, *AI Provider*).

3. **Pluggable Service Abstraction Layer (`/lib/services/*`)**:
   - Asynchronous service modules (`voice`, `customers`, `calls`, `appliances`, `service-requests`, `knowledge-base`, `ai`, `actions`) returning structured domain data.
   - Designed so future Supabase, VoiceLink, and Gemini APIs can be plugged in without refactoring UI components.

4. **Realistic Mock Repository (`/lib/mock-data/*`)**:
   - 22 realistic customer profiles with masked Indian phone numbers (`+91 98XXX XXXXX`).
   - 32 appliances with real OEM models, serial numbers, and warranty dates.
   - 45 calls (including 6 active live calls with full transcripts).
   - 26 service requests across all statuses and priorities.
   - 16 knowledge documents.

---

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server & Client Components)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict domain typing)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Enterprise modern design system)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Utility**: `clsx`, `tailwind-merge`, `class-variance-authority`

---

## Local Development Setup

### Prerequisites
- Node.js 18.17.0+ or Node.js 20+
- npm 9+

### 1. Clone the repository
```bash
git clone https://github.com/your-org/homecare-ai.git
cd homecare-ai
```

### 2. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
*(No real credentials are required in Phase 1).*

### 3. Install dependencies
```bash
npm install
```

### 4. Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build Verification
```bash
npm run build
npm run start
```

---

## Future Integration Roadmap

```
Phase 1 (Complete): Production UI & Service Abstractions
        │
Phase 2: VoiceLink SIP Trunking + WebSocket Realtime Voice
        │
Phase 3: Google Gemini Multimodal Live API (Intent, Acoustics & Function Calling)
        │
Phase 4: Supabase PostgreSQL (Persistence, Realtime Subscriptions & RLS)
        │
Phase 5: Vector RAG for Appliance Technical Manuals & Service Network Dispatch
```

---

## License
Proprietary & Confidential — HomeCare AI Operations
