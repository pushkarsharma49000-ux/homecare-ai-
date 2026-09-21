'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building2,
  Mic,
  Brain,
  BookOpen,
  AlertTriangle,
  Blocks,
  Users,
  CreditCard,
  Save,
  CheckCircle2,
  PhoneCall,
  Database,
  Sparkles,
  Sliders,
  ShieldAlert,
  Info,
  ExternalLink,
  Clock,
  Loader2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  mockAgentConfiguration,
  mockEscalationRules,
  mockCompanyProfile,
  mockIntegrations,
} from '@/lib/mock-data/settings';
import { getAgentConfiguration, updateAgentConfiguration } from '@/lib/services/settings';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'voice-agent' | 'ai-behavior' | 'escalation' | 'integrations' | 'company' | 'users' | 'billing'>('voice-agent');

  // Voice Agent Form State
  const [agentName, setAgentName] = useState(mockAgentConfiguration.agentName);
  const [greeting, setGreeting] = useState(mockAgentConfiguration.greeting);
  const [language, setLanguage] = useState(mockAgentConfiguration.language);
  const [tone, setTone] = useState(mockAgentConfiguration.tone);
  const [maxDuration, setMaxDuration] = useState(mockAgentConfiguration.maxConversationDurationMinutes);
  const [confidenceThreshold, setConfidenceThreshold] = useState(mockAgentConfiguration.aiConfidenceThreshold);
  const [escalationThreshold, setEscalationThreshold] = useState(mockAgentConfiguration.humanEscalationThreshold);

  // Escalation rules state
  const [rules, setRules] = useState(mockEscalationRules);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveMessage, setSaveMessage] = useState('Configuration saved');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        const config = await getAgentConfiguration();
        if (config) {
          if (config.agentName) setAgentName(config.agentName);
          if (config.greeting) setGreeting(config.greeting);
          if (config.language) setLanguage(config.language);
          if (config.tone) setTone(config.tone);
          if (config.maxConversationDurationMinutes) setMaxDuration(config.maxConversationDurationMinutes);
          if (config.aiConfidenceThreshold) setConfidenceThreshold(config.aiConfidenceThreshold);
          if (config.humanEscalationThreshold) setEscalationThreshold(config.humanEscalationThreshold);
        }
      } catch (err) {
        console.error('Error loading config:', err);
      }
    }
    loadConfig();
  }, []);

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await updateAgentConfiguration({
        agentName,
        greeting,
        language,
        tone,
        maxConversationDurationMinutes: maxDuration,
        aiConfidenceThreshold: confidenceThreshold,
      });

      setSaveMessage(res.success ? 'Configuration saved to Supabase' : 'Configuration saved locally');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch {
      setSaveMessage('Configuration saved locally');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'voice-agent', label: 'Voice Agent', icon: Mic },
    { id: 'ai-behavior', label: 'AI Behavior', icon: Brain },
    { id: 'escalation', label: 'Escalation Rules', icon: AlertTriangle },
    { id: 'integrations', label: 'Integrations', icon: Blocks },
    { id: 'company', label: 'Company Profile', icon: Building2 },
    { id: 'users', label: 'Users & Roles', icon: Users },
    { id: 'billing', label: 'Billing & Usage', icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Configuration</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure autonomous voice persona, threshold safety guardrails, and enterprise settings
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {saveMessage}
          </div>
        )}
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap border-b-2 ${
                isActive
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* 1. VOICE AGENT SETTINGS (Section 25) */}
      {activeTab === 'voice-agent' && (
        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div>
              <CardTitle>Inbound Voice Agent Configuration</CardTitle>
              <p className="text-xs text-slate-500">
                Persona, greeting phrases, and conversational parameters for inbound calls
              </p>
            </div>
            <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-1.5 text-xs">
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6 pt-6 max-w-3xl">
            {/* Agent Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">Agent Persona Name</label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <p className="text-[11px] text-slate-400">
                Announced to customers during inbound call connection.
              </p>
            </div>

            {/* Inbound Greeting */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">Inbound Call Greeting</label>
              <textarea
                rows={3}
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <p className="text-[11px] text-slate-400">
                Opening sentence spoken immediately when the +91 customer call connects.
              </p>
            </div>

            {/* Grid: Language, Tone, Max Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">Primary Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="Indian English (with Hindi support)">Indian English (with Hindi support)</option>
                  <option value="Hindi (Formal)">Hindi (Formal)</option>
                  <option value="English (Global)">English (Global)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">Conversational Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as any)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="Empathetic">Empathetic</option>
                  <option value="Professional">Professional</option>
                  <option value="Direct">Direct</option>
                  <option value="Friendly">Friendly</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">Max Call Duration</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={3}
                    max={20}
                    value={maxDuration}
                    onChange={(e) => setMaxDuration(Number(e.target.value))}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-xs text-slate-500">minutes</span>
                </div>
              </div>
            </div>

            {/* Supported Appliances Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800 block">
                Supported Appliance Categories
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  'Air Conditioner',
                  'Washing Machine',
                  'Refrigerator',
                  'Television',
                  'Water Purifier',
                ].map((item) => (
                  <label
                    key={item}
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 cursor-pointer hover:bg-slate-50"
                  >
                    <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500" />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2. AI BEHAVIOR & THRESHOLDS (Section 25) */}
      {activeTab === 'ai-behavior' && (
        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div>
              <CardTitle>AI Decision Thresholds & Safety Limits</CardTitle>
              <p className="text-xs text-slate-500">
                Configure autonomous boundaries before triggering human supervisor handoff
              </p>
            </div>
            <Button size="sm" onClick={handleSave} className="gap-1.5 text-xs">
              <Save className="w-3.5 h-3.5" />
              Save Thresholds
            </Button>
          </CardHeader>
          <CardContent className="space-y-6 pt-6 max-w-2xl">
            {/* AI Confidence Threshold (Section 25) */}
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-blue-900">AI Confidence Safety Threshold</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    If AI confidence falls below this value, the system will automatically escalate to a human agent.
                  </p>
                </div>
                <span className="text-xl font-bold text-blue-700 font-mono">{confidenceThreshold}%</span>
              </div>

              <input
                type="range"
                min={60}
                max={95}
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                <span>60% (Permissive)</span>
                <span className="text-blue-700 font-bold">80% (Recommended Standard)</span>
                <span>95% (Strict Escalate)</span>
              </div>
            </div>

            {/* Human Escalation Threshold */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Sentiment Distress Limit</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Escalate when customer frustration persists over consecutive conversational turns.
                  </p>
                </div>
                <span className="text-xl font-bold text-slate-800 font-mono">Turn 2</span>
              </div>
            </div>

            {/* Structured Action Auto-Execution Mode */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-900">Action Execution Mode</h4>
              <p className="text-[11px] text-slate-500">
                Determine whether created service requests are immediately committed or require queue dispatch signoff.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="p-3 rounded-lg border border-blue-500 bg-blue-50/50 flex items-start gap-2.5 cursor-pointer">
                  <input type="radio" name="mode" defaultChecked className="mt-0.5 text-blue-600" />
                  <div>
                    <span className="font-bold text-xs text-blue-900 block">Autonomous Immediate</span>
                    <span className="text-[10px] text-slate-500">Directly dispatch ticket to technician</span>
                  </div>
                </label>
                <label className="p-3 rounded-lg border border-slate-200 bg-white flex items-start gap-2.5 cursor-pointer">
                  <input type="radio" name="mode" className="mt-0.5 text-blue-600" />
                  <div>
                    <span className="font-bold text-xs text-slate-800 block">Supervised Review</span>
                    <span className="text-[10px] text-slate-500">Queue in New status for dispatcher signoff</span>
                  </div>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3. ESCALATION RULES (Section 26) */}
      {activeTab === 'escalation' && (
        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div>
              <CardTitle>Autonomous Escalation Guardrail Rules</CardTitle>
              <p className="text-xs text-slate-500">
                Deterministic policy triggers that transfer the live call to human specialists
              </p>
            </div>
            <Badge variant="secondary">{rules.filter((r) => r.enabled).length} Rules Active</Badge>
          </CardHeader>
          <CardContent className="pt-5 space-y-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">{rule.title}</span>
                    <Badge
                      variant={
                        rule.severity === 'Critical'
                          ? 'destructive'
                          : rule.severity === 'High'
                          ? 'warning'
                          : 'default'
                      }
                      className="text-[10px]"
                    >
                      {rule.severity} Severity
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600">{rule.condition}</p>
                  <p className="text-[11px] text-blue-600 font-medium pt-1">
                    Route Target: {rule.actionTarget}
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={() => toggleRule(rule.id)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 4. INTEGRATIONS (Section 24) */}
      {activeTab === 'integrations' && (
        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div>
              <CardTitle>External AI & Cloud Integrations</CardTitle>
              <p className="text-xs text-slate-500">
                Connected backends for Supabase, AI orchestration, and browser-based voice infrastructure
              </p>
            </div>
            <Badge variant="secondary">Phase 1: Zero External Credentials</Badge>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                <strong>Architectural Isolation:</strong> In Phase 1, integrations are deliberately not connected. All schemas and service abstraction layers are pre-built to connect without rebuilding UI components.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {mockIntegrations.map((int) => {
                const isDB = int.id === 'supabase';
                const isAI = int.id === 'gemini';

                return (
                  <Card key={int.id} className="border border-slate-200 p-5 flex flex-col justify-between h-full">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                          {isDB && <Database className="w-5 h-5 text-emerald-600" />}
                          {isAI && <Sparkles className="w-5 h-5 text-indigo-600" />}
                        </div>
                        <Badge variant="secondary" className="text-[10px] font-semibold">
                          {int.status}
                        </Badge>
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                          {int.category}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-0.5">{int.name}</h4>
                        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                          {int.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-mono text-slate-400">{int.badgeText}</span>
                      <Button variant="outline" size="sm" disabled className="h-7 text-xs">
                        Configure (Phase 2)
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 5. COMPANY PROFILE */}
      {activeTab === 'company' && (
        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Company & Operations Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-5 max-w-2xl text-xs">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Company Name</label>
              <input
                type="text"
                readOnly
                value={mockCompanyProfile.companyName}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
            <div>
              <label className="font-bold text-slate-800 block mb-1">Brand Tagline</label>
              <input
                type="text"
                readOnly
                value={mockCompanyProfile.brandTagline}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Support Experience</label>
                <input
                  type="text"
                  readOnly
                  value="Website chat and browser voice support"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800"
                />
              </div>
              <div>
                <label className="font-bold text-slate-800 block mb-1">Service Coverage</label>
                <input
                  type="text"
                  readOnly
                  value={mockCompanyProfile.serviceNetworkCities}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
            </div>
            <div>
              <label className="font-bold text-slate-800 block mb-1">Corporate Support Center</label>
              <input
                type="text"
                readOnly
                value={mockCompanyProfile.primaryOffice}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* 6. USERS & ROLES */}
      {activeTab === 'users' && (
        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Support Team & Supervisors</CardTitle>
            <Button size="sm" variant="outline" className="text-xs">
              + Add Member
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="divide-y divide-slate-100 text-xs">
              {[
                { name: 'Pooja Nair', email: 'pooja.nair@homecare.example.in', role: 'Operations Lead', status: 'Active' },
                { name: 'Karan Mehra', email: 'karan.m@homecare.example.in', role: 'Tier-2 Supervisor', status: 'Active' },
                { name: 'Ananya Roy', email: 'ananya.r@homecare.example.in', role: 'Service Dispatcher', status: 'Active' },
                { name: 'Sameer Kulkarni', email: 'sameer.k@homecare.example.in', role: 'HVAC Quality Analyst', status: 'Active' },
              ].map((user) => (
                <div key={user.email} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{user.name}</p>
                    <p className="text-slate-400 text-[11px]">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-600 font-medium">{user.role}</span>
                    <Badge variant="success" className="text-[10px]">{user.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 7. BILLING & USAGE */}
      {activeTab === 'billing' && (
        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div>
              <CardTitle>Subscription & Inbound Minutes</CardTitle>
              <p className="text-xs text-slate-500">Enterprise Voice AI plan and inbound capacity</p>
            </div>
            <Badge variant="default">Enterprise Tier</Badge>
          </CardHeader>
          <CardContent className="pt-5 space-y-4 max-w-xl text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Voice Minutes Consumed</span>
                <span className="text-xl font-bold text-slate-900 mt-1 block">14,820 / 50,000 mins</span>
                <span className="text-[11px] text-emerald-600 font-medium">70.4% minutes remaining</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
