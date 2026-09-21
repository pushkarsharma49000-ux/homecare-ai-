# HomeCare-AI Service Architecture

This repository preserves the existing internal operations dashboard while establishing the foundation for a customer-facing AI support layer.

## 1. Service responsibility boundaries

### Internal operations layer
The dashboard in the existing app remains the operational system of record for:
- live call monitoring
- customer profile review
- service request status tracking
- agent and escalation workflows
- analytics and internal reporting

This layer should continue to use the existing Supabase domain model and service abstractions.

### Customer experience layer
The customer-facing AI support route is intentionally separate from the internal operations UI. It is designed to support:
- customer issue intake
- AI-guided troubleshooting
- service and appointment progression
- confirmation and follow-up flows

The customer path should be conversation-first, minimal-click, and not expose internal operations or model telemetry.

## 2. Service modularity

The logical service modules in this repository are:

- api-gateway: central abstraction for application-level request routing, validation, and structured errors
- conversation: conversation session creation, message handling, and user guidance
- voice: voice session lifecycle and interruption state transitions
- rag: retrieval and grounded knowledge lookup interface
- appointment: technician slot lookup and booking flow
- notification: email, SMS, and calendar notifications
- action: workflow actions such as service requests and issue resolution steps
- evaluation: future AI quality, latency, and user impact scoring

These services are intentionally logical modules inside the same application. They do not constitute separate cloud deployments or external systems.

## 3. Communication model

Services should communicate through typed interfaces and structured inputs/outputs rather than through React state. Components can orchestrate user interaction, but they should not contain hand-written AI workflow logic, provider integration code, or external API calls.

The preferred pattern is:
- UI -> service call -> typed result -> UI rendering
- no direct business logic embedded inside page components
- no external provider code inside React screens

## 4. External integration boundaries

Future external integrations belong at service boundaries only, for example:
- STT / ASR providers
- LLM providers
- RAG and vector stores
- Google Calendar APIs
- email providers
- technician scheduling systems

These should be added behind the existing service abstraction layers, not directly in page components.

## 5. Current phase constraints

This phase intentionally does not implement:
- real STT / TTS
- app-to-app LLM calls
- real RAG or embeddings
- Google Calendar booking or invitations
- email confirmations
- external paid service calls
- fake production integrations disguised as live systems

The placeholders are explicit TODO boundaries so production integration can be added safely later.

## 6. Future execution flow

The long-term customer support flow is expected to be:

WebRTC / voice channel
→ VAD + turn detection
→ STT
→ conversation orchestration
→ RAG retrieval for troubleshooting docs
→ action engine
→ technician availability check
→ customer-selected appointment
→ confirmation workflow
→ Google Calendar invite + email confirmation
→ service request tracking

## 7. Customer versus operations split

The internal dashboard remains the monitoring and operations surface for staff.
The customer-support route is a dedicated experience optimized for the user journey and preserving conversation continuity without repeated navigation.

This split protects the existing admin product while enabling a more customer-friendly AI experience.
