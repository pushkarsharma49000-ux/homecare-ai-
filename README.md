# HomeCare AI — Website-Based AI Customer Support

> **AI-powered browser customer support and autonomous service resolution for home appliances.**
> *Understand every customer conversation. Resolve issues faster. Automate service actions.*

HomeCare AI is an enterprise B2B platform purpose-built for home-appliance manufacturers and after-sales service operations supporting customers through web chat and browser voice for:
- ❄️ **Air Conditioners**
- 🧺 **Washing Machines**
- 🧊 **Refrigerators**
- 📺 **Televisions**
- 💧 **Water Purifiers**

---

## The Customer Experience Journey

```
Customer opens website
        │
    AI Support experience loads in browser
        │
  Customer chooses text or browser-based voice
        │
  Conversation orchestrator identifies appliance, issue, and intent
        │
  RAG and troubleshooting guides advise next steps
        │
  AI recommends action or technician visit
        │
  Customer reviews appointment slots and confirms booking
        │
  Booking and confirmation flows are sent to calendar and email
        │
  Support team monitors progress via dashboard
```

### The Autonomous Product Loop
**UNDERSTAND** → **DECIDE** → **ACT** → **RECORD** → **MEASURE**

> **IMPORTANT:** HomeCare AI is a **website-based customer-support platform**. Customers start a support session in the browser, and the AI does not initiate unsolicited contact.

---

## Phase 1 Architecture & Implementation

Phase 1 establishes the complete, production-grade frontend experience, data models, and modular service abstractions.

### What is Included in Phase 1:
1. **Full Application Navigation & Shell**:
   - Persistent desktop sidebar with active route states, live session badges, and user profile.
   - Responsive mobile/tablet slide-over drawer.
   - Global search, browser voice status, and realtime operational context.
   - Continuous Product Loop banner (*Understand → Decide → Act → Record → Measure*).

2. **9 Core Modules + Deep Detail Views**:
   - **Dashboard (`/`)**: KPI overview, active sessions snapshot, problem breakdown, AI performance metrics, and recent service requests.
   - **Live Calls (`/live-calls`) & Detail (`/live-calls/[id]`)**: Real-time monitoring center with live state indicators (*Listening*, *Thinking*, *Taking Action*), session metrics, transcript tracking, and AI understanding cards.
   - **Calls History (`/calls`) & Detail (`/calls/[id]`)**: Searchable & filterable table across appliances, intents, sentiments, and outcomes. Detail view with AI summary, transcript, analysis, and action history.
   - **Customers (`/customers`) & Customer 360 (`/customers/[id]`)**: Searchable directory, registered appliance cards, service history timeline, open tickets, and recent session logs.
   - **Appliances (`/appliances`) & Detail (`/appliances/[id]`)**: Hardware inventory across ACs, Washing Machines, Refrigerators, TVs, and Water Purifiers, technical specs, warranty validity, and service history.
   - **Service Requests (`/service-requests`) & Detail (`/service-requests/[id]`)**: Filterable dispatch pipeline, session source links, and milestone timelines.
   - **Knowledge Base (`/knowledge-base`)**: Categorized troubleshooting guides and policies prepared for future vector RAG with interactive reader.
   - **Analytics (`/analytics`)**: Signal volume charts, AI resolution share metrics, appliance breakdown, root problem analysis, and operational quality metrics.
   - **Settings (`/settings`)**: AI agent configuration, safety thresholds, escalation rules, company profile, and placeholder integration cards for future AI and cloud services.

3. **Pluggable Service Abstraction Layer (`/lib/services/*`)**:
   - Asynchronous service modules (`voice`, `customers`, `calls`, `appliances`, `service-requests`, `knowledge-base`, `ai`, `actions`) returning structured domain data.
      - Designed so future Supabase, browser voice, and AI provider APIs can be plugged in without refactoring UI components.

4. **Realistic Mock Repository (`/lib/mock-data/*`)**:
   - 22 realistic customer profiles with masked Indian phone numbers (`+91 98XXX XXXXX`).
   - 32 appliances with real OEM models, serial numbers, and warranty dates.
      - 45 support sessions (including 6 active live sessions with full transcripts).
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
Phase 2: Browser Voice Foundation (WebRTC + VAD + Streaming STT)
        │
Phase 3: Conversation Orchestration + Grounded RAG
        │
Phase 4: Appointment Booking + Calendar + Email Confirmation
        │
Phase 5: Operational Observability & Production Hardening
```

---

## License
Proprietary & Confidential — HomeCare AI Operations
