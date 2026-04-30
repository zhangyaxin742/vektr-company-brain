export type ConnectorStatus = {
  name: string;
  state: "ready" | "not_configured" | "error";
  summary: string;
  detail?: string;
};

export type AppHealthResponse = {
  generatedAt: string;
  environment: {
    valid: boolean;
    fastapiWorkerUrl: string;
    missingKeys: string[];
  };
  connectors: ConnectorStatus[];
};

export type WorkerHealthResponse = {
  status: string;
  environment: string;
  host: string;
  port: number;
};

export type WorkerConnectorHealthResponse = {
  status: string;
  checks: Array<{
    name: string;
    state: string;
    summary: string;
  }>;
};

export type LandingSection = {
  title: string;
  description: string;
};

export type DemoMetric = {
  label: string;
  value: string;
  detail: string;
};

export type Citation = {
  title: string;
  snippet: string;
};

export type RelatedNode = {
  id: string;
  label: string;
  type: GraphNodeKind;
};

export type AskAnswer = {
  answer: string;
  confidence: string;
  citations: Citation[];
  relatedNodes: RelatedNode[];
  missingInfo: string;
  suggestedSkill: string;
};

export type AskAnswerMap = Record<string, AskAnswer>;

export type GraphNodeKind =
  | "people"
  | "customers"
  | "incidents"
  | "decisions"
  | "policies"
  | "workflows"
  | "risks"
  | "skills"
  | "documents"
  | "communities";

export type GraphNodeDetail = {
  id: string;
  label: string;
  type: GraphNodeKind;
  summary: string;
  confidence: string;
  evidence: string[];
  relatedDocuments: string[];
  relatedSkills: string[];
  connectedNodes: string[];
  position: { x: number; y: number };
  width?: number;
};

export type ApprovalGate = {
  gate: string;
  requiredWhen: string;
};

export type SkillDetail = {
  id: string;
  name: string;
  version: string;
  trigger: string;
  status: string;
  confidence: string;
  approval: string;
  sources: number;
  inputsRequired: string[];
  steps: string[];
  approvalGates: ApprovalGate[];
  allowedActions: string[];
  forbiddenActions: string[];
  sourceCitations: string[];
};

export type HealthFlag = {
  id: string;
  severity: "critical" | "warning" | "info";
  type:
    | "conflict"
    | "missing_owner"
    | "stale_skill"
    | "low_confidence"
    | "unapproved_skill"
    | "customer_risk";
  title: string;
  description: string;
  relatedNodes: string[];
  evidence: string[];
  suggestedFix: string;
};
