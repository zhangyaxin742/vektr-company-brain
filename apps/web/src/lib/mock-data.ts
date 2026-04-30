import type { Edge } from "@xyflow/react";

import {
  askAnswerMapSchema,
  demoMetricSchema,
  graphNodeDetailSchema,
  graphNodeKindSchema,
  healthFlagSchema,
  landingSectionSchema,
  skillDetailSchema,
} from "@/lib/types";
import type {
  AskAnswerMap,
  DemoMetric,
  GraphNodeDetail,
  GraphNodeKind,
  HealthFlag,
  LandingSection,
  SkillDetail,
} from "@/lib/types";

export const landingSections: LandingSection[] = landingSectionSchema.array().parse([
  {
    title: "Upload messy company artifacts",
    description:
      "Slack exports, email threads, policies, postmortems, docs, and tickets all enter one structured pipeline.",
  },
  {
    title: "Build the operating graph",
    description:
      "Map people, customers, incidents, workflows, policies, and risks instead of hiding them inside search results.",
  },
  {
    title: "Ask with citations",
    description:
      "No evidence, no answer. The UI is shaped for grounded responses and visible uncertainty.",
  },
  {
    title: "Generate agent skills",
    description:
      "Turn messy operating context into trigger-driven, approval-gated skills agents can safely follow.",
  },
  {
    title: "Catch broken knowledge",
    description:
      "Flag contradictions, stale workflows, low-confidence links, and unapproved skills before they hurt execution.",
  },
]);

export const demoMetrics: DemoMetric[] = demoMetricSchema.array().parse([
  { label: "Documents processed", value: "12", detail: "Slack, email, docs, and policy sources normalized." },
  { label: "Chunks embedded", value: "184", detail: "Citation units ready for retrieval once the vector layer is wired." },
  { label: "Entities extracted", value: "67", detail: "People, customers, incidents, decisions, policies, skills." },
  { label: "Relationships created", value: "142", detail: "Approval gates, pushback, causality, and ownership edges." },
  { label: "Communities generated", value: "8", detail: "Operational clusters the global graph view can summarize later." },
  { label: "Skills generated", value: "5", detail: "Draft skills that can later be produced by the generation pipeline." },
  { label: "Health flags detected", value: "6", detail: "Conflicts, stale workflows, missing owners, and unapproved skills." },
]);

export const demoTimeline = [
  "Acme Labs documents ingested into the workspace.",
  "Citation chunks and retrieval records prepared.",
  "Graph extraction staged for Neo4j import.",
  "Draft skills and health checks attached to the workspace.",
];

export const askPrompts = [
  "How do we handle enterprise refund requests after an outage?",
  "Who made the final call on TeraCorp and why?",
  "Where do our sources disagree about refund approval?",
  "What skill should an AI agent follow next time a customer asks for a service credit?",
  "What are the biggest operational risks in Acme Labs right now?",
] as const;

export const askAnswers: AskAnswerMap = askAnswerMapSchema.parse({
  "How do we handle enterprise refund requests after an outage?": {
    answer:
      "Acknowledge the request, gather account context, route through sales and finance, then escalate strategic exceptions to the CEO before the CSM sends the final response.",
    confidence: "0.88",
    citations: [
      {
        title: "Refund policy",
        snippet: "Credits above the standard threshold require finance approval.",
      },
      {
        title: "CEO approval thread",
        snippet: "Jordan approves an exception because TeraCorp is a strategic renewal risk.",
      },
    ],
    relatedNodes: [
      { id: "teracorp", label: "TeraCorp", type: "customers" },
      { id: "refund-skill", label: "Enterprise Refund Handling", type: "skills" },
      { id: "refund-policy", label: "Refund Policy", type: "policies" },
    ],
    missingInfo: "Contract-specific language and prior credit history still need to be checked.",
    suggestedSkill: "Enterprise Refund Handling",
  },
  "Who made the final call on TeraCorp and why?": {
    answer:
      "Jordan Mee made the final exception call after finance pushed back, because the account carried renewal risk and the outage materially affected trust.",
    confidence: "0.84",
    citations: [
      {
        title: "Executive escalation thread",
        snippet: "Jordan frames the credit as a strategic retention decision, not a policy default.",
      },
    ],
    relatedNodes: [
      { id: "jordan-mee", label: "Jordan Mee", type: "people" },
      { id: "teracorp", label: "TeraCorp", type: "customers" },
    ],
    missingInfo: "The final negotiated credit amount is not yet normalized into a structured field.",
    suggestedSkill: "Enterprise Refund Handling",
  },
  "Where do our sources disagree about refund approval?": {
    answer:
      "The refund policy requires finance approval above threshold, while the CEO thread approves a faster strategic exception and finance objects to the size of the credit.",
    confidence: "0.9",
    citations: [
      {
        title: "Refund policy",
        snippet: "Finance approval is required above the default threshold.",
      },
      {
        title: "Finance objection thread",
        snippet: "Femi pushes back on a two-month credit and asks to stay closer to policy.",
      },
    ],
    relatedNodes: [
      { id: "refund-policy", label: "Refund Policy", type: "policies" },
      { id: "femi-adisa", label: "Femi Adisa", type: "people" },
    ],
    missingInfo: "We still need a formal exception policy document to reconcile the strategic path.",
    suggestedSkill: "Knowledge Health Review",
  },
  "What skill should an AI agent follow next time a customer asks for a service credit?": {
    answer:
      "The agent should follow Enterprise Refund Handling, which explicitly lists inputs, approval gates, allowed actions, and forbidden actions before any customer communication goes out.",
    confidence: "0.92",
    citations: [
      {
        title: "Enterprise Refund Handling",
        snippet: "The skill requires human approvals before any credit promise is communicated.",
      },
    ],
    relatedNodes: [
      { id: "refund-skill", label: "Enterprise Refund Handling", type: "skills" },
      { id: "csm-workflow", label: "CSM resolution workflow", type: "workflows" },
    ],
    missingInfo: "The skill remains draft until later approval logic is implemented.",
    suggestedSkill: "Enterprise Refund Handling",
  },
  "What are the biggest operational risks in Acme Labs right now?": {
    answer:
      "Refund exception handling, unclear ownership around security questionnaire work, and stale vendor-renewal workflows are the biggest visible operating risks.",
    confidence: "0.79",
    citations: [
      {
        title: "Knowledge health flags",
        snippet: "Multiple unresolved exceptions and missing owners appear in the current graph.",
      },
    ],
    relatedNodes: [
      { id: "security-skill", label: "Security Questionnaire Handling", type: "skills" },
      { id: "vendor-renewal", label: "Vendor Renewal Negotiation", type: "skills" },
    ],
    missingInfo: "The risk ranking is still based on static demo data, not live scoring.",
    suggestedSkill: "Knowledge Health Review",
  },
});

export const graphFilters: GraphNodeKind[] = graphNodeKindSchema.array().parse([
  "people",
  "customers",
  "incidents",
  "decisions",
  "policies",
  "workflows",
  "risks",
  "skills",
  "documents",
  "communities",
]);

export const graphNodeDetails: GraphNodeDetail[] = graphNodeDetailSchema.array().parse([
  {
    id: "teracorp-refund",
    label: "TeraCorp Refund Request",
    type: "customers",
    summary: "Enterprise refund request triggered by the Nov 3 outage and escalated due to renewal risk.",
    confidence: "0.93",
    evidence: [
      "Customer success thread describes the outage impact and renewal sensitivity.",
      "Sales thread frames TeraCorp as a strategic $48k ARR account.",
    ],
    relatedDocuments: ["Customer escalation email", "CSM recap"],
    relatedSkills: ["Enterprise Refund Handling"],
    connectedNodes: ["Nov 3 Outage", "Refund Policy", "Jordan Mee", "Femi Adisa"],
    position: { x: 40, y: 230 },
    width: 250,
  },
  {
    id: "nov-3-outage",
    label: "Nov 3 Outage",
    type: "incidents",
    summary: "A four-hour outage that triggered refund discussions, executive escalation, and health flags.",
    confidence: "0.91",
    evidence: [
      "Postmortem records four hours of enterprise impact.",
      "Incident summary is repeatedly cited in the refund discussion.",
    ],
    relatedDocuments: ["Nov 3 postmortem"],
    relatedSkills: ["Outage Incident Response"],
    connectedNodes: ["TeraCorp Refund Request", "Enterprise Refund Handling"],
    position: { x: 280, y: 54 },
  },
  {
    id: "refund-policy",
    label: "Refund Policy",
    type: "policies",
    summary: "Current policy says finance approval is required above the standard credit threshold.",
    confidence: "0.86",
    evidence: [
      "Policy doc states approval thresholds explicitly.",
      "Finance thread cites the document during pushback.",
    ],
    relatedDocuments: ["Refund policy"],
    relatedSkills: ["Enterprise Refund Handling"],
    connectedNodes: ["Femi Adisa", "TeraCorp Refund Request"],
    position: { x: 314, y: 330 },
  },
  {
    id: "refund-skill",
    label: "Enterprise Refund Handling",
    type: "skills",
    summary: "Draft agent skill for service credits and refunds after outages.",
    confidence: "0.88",
    evidence: [
      "Skill draft combines policy requirements with executive exception handling.",
    ],
    relatedDocuments: ["Skill draft v0.1"],
    relatedSkills: ["Outage Incident Response"],
    connectedNodes: ["TeraCorp Refund Request", "Refund Policy", "Jordan Mee"],
    position: { x: 580, y: 214 },
    width: 260,
  },
  {
    id: "jordan-mee",
    label: "Jordan Mee",
    type: "people",
    summary: "CEO who approved the strategic exception.",
    confidence: "0.81",
    evidence: ["Executive thread documents the final approval."],
    relatedDocuments: ["Executive escalation thread"],
    relatedSkills: ["Enterprise Refund Handling"],
    connectedNodes: ["TeraCorp Refund Request", "Refund Policy"],
    position: { x: 850, y: 136 },
  },
  {
    id: "femi-adisa",
    label: "Femi Adisa",
    type: "people",
    summary: "Finance stakeholder who objected to the size of the requested credit.",
    confidence: "0.78",
    evidence: ["Finance thread pushes back on a two-month credit."],
    relatedDocuments: ["Finance objection thread"],
    relatedSkills: ["Enterprise Refund Handling"],
    connectedNodes: ["Refund Policy", "TeraCorp Refund Request"],
    position: { x: 780, y: 360 },
  },
  {
    id: "approval-workflow",
    label: "Approval Workflow",
    type: "workflows",
    summary: "Workflow connecting CSM, Sales, Finance, and CEO approvals for exceptions.",
    confidence: "0.74",
    evidence: ["Slack thread reconstructs the escalation chain."],
    relatedDocuments: ["Cross-functional Slack summary"],
    relatedSkills: ["Enterprise Refund Handling"],
    connectedNodes: ["Jordan Mee", "Femi Adisa"],
    position: { x: 1060, y: 248 },
  },
  {
    id: "renewal-risk",
    label: "Renewal Risk",
    type: "risks",
    summary: "Operational risk created by outage recovery and inconsistent refund handling.",
    confidence: "0.68",
    evidence: ["Sales notes mention churn risk if the exception is mishandled."],
    relatedDocuments: ["Renewal risk notes"],
    relatedSkills: ["Enterprise Lead Qualification"],
    connectedNodes: ["TeraCorp Refund Request", "Jordan Mee"],
    position: { x: 1140, y: 92 },
  },
  {
    id: "ceo-thread",
    label: "CEO Approval Thread",
    type: "documents",
    summary: "Primary source for the strategic exception and approval rationale.",
    confidence: "0.83",
    evidence: ["Thread contains direct approval language from the CEO."],
    relatedDocuments: ["CEO Approval Thread"],
    relatedSkills: ["Enterprise Refund Handling"],
    connectedNodes: ["Jordan Mee", "TeraCorp Refund Request"],
    position: { x: 1040, y: 420 },
  },
  {
    id: "revenue-community",
    label: "Revenue Exceptions Cluster",
    type: "communities",
    summary: "Community-level view grouping refund, pricing, and renewal exception patterns.",
    confidence: "0.63",
    evidence: ["Global graph summary clusters refund discussions with renewal risk."],
    relatedDocuments: ["Community summary report"],
    relatedSkills: ["Vendor Renewal Negotiation"],
    connectedNodes: ["Renewal Risk", "Approval Workflow"],
    position: { x: 560, y: 476 },
    width: 280,
  },
]);

export const graphEdges: Edge[] = [
  { id: "edge-1", source: "nov-3-outage", target: "teracorp-refund", label: "caused", animated: true },
  { id: "edge-2", source: "teracorp-refund", target: "refund-policy", label: "checks" },
  { id: "edge-3", source: "refund-policy", target: "refund-skill", label: "compiles into" },
  { id: "edge-4", source: "refund-skill", target: "jordan-mee", label: "approved by" },
  { id: "edge-5", source: "refund-policy", target: "femi-adisa", label: "pushed back on" },
  { id: "edge-6", source: "approval-workflow", target: "jordan-mee", label: "escalates to" },
  { id: "edge-7", source: "approval-workflow", target: "femi-adisa", label: "requires approval from" },
  { id: "edge-8", source: "teracorp-refund", target: "renewal-risk", label: "creates" },
  { id: "edge-9", source: "jordan-mee", target: "ceo-thread", label: "mentioned in" },
  { id: "edge-10", source: "renewal-risk", target: "revenue-community", label: "belongs to" },
];

export const skills: SkillDetail[] = skillDetailSchema.array().parse([
  {
    id: "enterprise-refund-handling",
    name: "Enterprise Refund Handling",
    version: "0.1",
    trigger: "Enterprise customer requests refund or service credit after outage",
    status: "Draft",
    confidence: "88%",
    approval: "Human required",
    sources: 5,
    inputsRequired: [
      "customer_arr",
      "outage_duration",
      "contract_terms",
      "customer_sentiment",
      "prior_credits",
      "finance_approval_threshold",
    ],
    steps: [
      "CSM acknowledges the request and gathers account context.",
      "Head of Sales evaluates relationship risk and renewal impact.",
      "Finance evaluates credit amount against policy and ARR.",
      "CEO approves strategic exceptions above the default threshold.",
      "CSM sends final resolution to customer.",
    ],
    approvalGates: [
      {
        gate: "Finance approval",
        requiredWhen: "Credit exceeds default policy threshold",
      },
      {
        gate: "CEO approval",
        requiredWhen: "Strategic enterprise account exception",
      },
    ],
    allowedActions: ["summarize_context", "draft_customer_email", "request_human_approval"],
    forbiddenActions: ["send_email_without_review", "issue_refund", "modify_contract", "promise_credit_without_approval"],
    sourceCitations: [
      "Refund policy",
      "Finance objection thread",
      "CEO approval thread",
      "CSM recap",
      "Outage postmortem",
    ],
  },
  {
    id: "outage-incident-response",
    name: "Outage Incident Response",
    version: "0.1",
    trigger: "Incident impacts enterprise customers and requires cross-functional coordination",
    status: "Draft",
    confidence: "81%",
    approval: "Human required",
    sources: 4,
    inputsRequired: ["incident_scope", "customer_impact", "status_page_state"],
    steps: [
      "Acknowledge the incident.",
      "Collect affected accounts.",
      "Escalate to the incident commander and customer teams.",
    ],
    approvalGates: [{ gate: "Incident commander review", requiredWhen: "Customer-facing timeline is published" }],
    allowedActions: ["summarize_context", "request_human_approval"],
    forbiddenActions: ["promise_compensation", "publish_unreviewed_update"],
    sourceCitations: ["Nov 3 postmortem", "Incident Slack"],
  },
  {
    id: "security-questionnaire-handling",
    name: "Security Questionnaire Handling",
    version: "0.1",
    trigger: "Prospect or customer requests a security questionnaire",
    status: "Draft",
    confidence: "76%",
    approval: "Human required",
    sources: 3,
    inputsRequired: ["questionnaire", "deadline", "owner"],
    steps: ["Assign owner.", "Collect source answers.", "Escalate legal or product risk."],
    approvalGates: [{ gate: "Security owner review", requiredWhen: "Answers include new claims" }],
    allowedActions: ["summarize_context", "draft_response"],
    forbiddenActions: ["submit_without_review"],
    sourceCitations: ["Security process doc"],
  },
  {
    id: "vendor-renewal-negotiation",
    name: "Vendor Renewal Negotiation",
    version: "0.1",
    trigger: "Key vendor agreement approaches renewal",
    status: "Draft",
    confidence: "69%",
    approval: "Human required",
    sources: 2,
    inputsRequired: ["vendor", "renewal_date", "current_terms"],
    steps: ["Review terms.", "Assess leverage.", "Escalate finance and legal."],
    approvalGates: [{ gate: "Finance approval", requiredWhen: "Pricing changes exceed budget threshold" }],
    allowedActions: ["summarize_context"],
    forbiddenActions: ["accept_terms_without_review"],
    sourceCitations: ["Vendor renewal notes"],
  },
  {
    id: "enterprise-lead-qualification",
    name: "Enterprise Lead Qualification",
    version: "0.1",
    trigger: "Inbound enterprise lead is routed to sales",
    status: "Draft",
    confidence: "73%",
    approval: "Human required",
    sources: 3,
    inputsRequired: ["company_size", "budget_signal", "timeline"],
    steps: ["Gather lead facts.", "Score fit.", "Route to account executive."],
    approvalGates: [{ gate: "Sales lead review", requiredWhen: "Lead is marked strategic" }],
    allowedActions: ["summarize_context"],
    forbiddenActions: ["promise_pricing", "create_contract_terms"],
    sourceCitations: ["Sales ops guide"],
  },
]);

export const healthFlags: HealthFlag[] = healthFlagSchema.array().parse([
  {
    id: "refund-conflict",
    severity: "critical",
    type: "conflict",
    title: "Refund approval conflict",
    description:
      "Finance policy and executive exception handling disagree on the correct approval path for TeraCorp.",
    relatedNodes: ["Refund Policy", "Jordan Mee", "Femi Adisa"],
    evidence: [
      "Policy says finance approval is required above threshold.",
      "CEO thread approves an exception for strategic reasons.",
    ],
    suggestedFix: "Record a formal exception workflow and attach it to the refund skill draft.",
  },
  {
    id: "security-owner",
    severity: "warning",
    type: "missing_owner",
    title: "Missing owner for Security Questionnaire Handling",
    description: "The draft skill exists, but no explicit owner is mapped in the graph.",
    relatedNodes: ["Security Questionnaire Handling"],
    evidence: ["Current source material describes the process but not a stable owner."],
    suggestedFix: "Assign a named security operations owner and backfill the graph edge.",
  },
  {
    id: "refund-unapproved",
    severity: "warning",
    type: "unapproved_skill",
    title: "Enterprise Refund Handling is unapproved",
    description: "The most important exception-handling skill is still draft-only.",
    relatedNodes: ["Enterprise Refund Handling"],
    evidence: ["Status remains draft and no final reviewer is attached."],
    suggestedFix: "Route the draft skill through finance and executive review.",
  },
  {
    id: "vendor-stale",
    severity: "warning",
    type: "stale_skill",
    title: "Vendor Renewal Negotiation workflow is stale",
    description: "The renewal process cites old budget assumptions and outdated owners.",
    relatedNodes: ["Vendor Renewal Negotiation"],
    evidence: ["Source notes are older than the current finance planning cycle."],
    suggestedFix: "Refresh the source docs and regenerate the skill draft.",
  },
  {
    id: "pricing-confidence",
    severity: "info",
    type: "low_confidence",
    title: "Low-confidence relationship between pricing exception and renewal risk",
    description: "The graph sees a likely link, but the evidence set is still thin.",
    relatedNodes: ["Renewal Risk", "Revenue Exceptions Cluster"],
    evidence: ["Only one source explicitly links pricing exceptions to renewal risk."],
    suggestedFix: "Add CRM and renewal notes before relying on this relationship.",
  },
  {
    id: "customer-risk",
    severity: "info",
    type: "customer_risk",
    title: "TeraCorp account remains sensitive after outage recovery",
    description: "Account sentiment risk persists even after the exception path is identified.",
    relatedNodes: ["TeraCorp Refund Request", "Renewal Risk"],
    evidence: ["CSM notes describe trust damage and renewal pressure."],
    suggestedFix: "Capture the final resolution and follow-up sequence in the skill set.",
  },
]);
