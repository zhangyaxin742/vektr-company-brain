import { z } from "zod";

export const connectorStateSchema = z.enum(["ready", "not_configured", "error"]);

export const connectorStatusSchema = z.object({
  name: z.string(),
  state: connectorStateSchema,
  summary: z.string(),
  detail: z.string().optional(),
});

export type ConnectorStatus = z.infer<typeof connectorStatusSchema>;

export const appEnvironmentStatusSchema = z.object({
  valid: z.boolean(),
  fastapiWorkerUrl: z.string(),
  missingKeys: z.array(z.string()),
});

export const appHealthResponseSchema = z.object({
  generatedAt: z.string().datetime(),
  environment: appEnvironmentStatusSchema,
  connectors: z.array(connectorStatusSchema),
});

export type AppHealthResponse = z.infer<typeof appHealthResponseSchema>;

export const workerHealthResponseSchema = z.object({
  status: z.literal("ok"),
  environment: z.string(),
  host: z.string(),
  port: z.number(),
});

export type WorkerHealthResponse = z.infer<typeof workerHealthResponseSchema>;

export const workerConnectorHealthStatusSchema = z.enum([
  "ready",
  "partial",
  "not_configured",
]);

export const workerConnectorCheckSchema = z.object({
  name: z.string(),
  state: connectorStateSchema,
  summary: z.string(),
  detail: z.string().optional(),
});

export type WorkerConnectorCheck = z.infer<typeof workerConnectorCheckSchema>;

export const workerConnectorHealthResponseSchema = z.object({
  status: workerConnectorHealthStatusSchema,
  checks: z.array(workerConnectorCheckSchema),
});

export type WorkerConnectorHealthResponse = z.infer<
  typeof workerConnectorHealthResponseSchema
>;

export const loadDemoResponseSchema = z.object({
  jobId: z.string().uuid(),
  jobType: z.enum(["demo_load"]),
  status: z.enum(["queued", "running", "completed", "failed", "partial"]),
  orgSlug: z.string(),
  source: z.enum(["public_demo"]),
});

export type LoadDemoResponse = z.infer<typeof loadDemoResponseSchema>;

export const pipelineJobTypeSchema = z.enum([
  "demo_load",
  "upload_ingest",
  "graphrag_index",
]);

export type PipelineJobType = z.infer<typeof pipelineJobTypeSchema>;

export const pipelineJobStatusSchema = z.enum([
  "queued",
  "running",
  "completed",
  "failed",
  "partial",
]);

export type PipelineJobStatus = z.infer<typeof pipelineJobStatusSchema>;

export const ingestionCountsSchema = z.object({
  childJobsQueued: z.number().int().nonnegative().default(0),
  chunks: z.number().int().nonnegative().default(0),
  documents: z.number().int().nonnegative().default(0),
  embeddings: z.number().int().nonnegative().default(0),
  failures: z.number().int().nonnegative().default(0),
  filesAccepted: z.number().int().nonnegative().default(0),
  filesRejected: z.number().int().nonnegative().default(0),
  warnings: z.number().int().nonnegative().default(0),
});

export type IngestionCounts = z.infer<typeof ingestionCountsSchema>;

export const ingestionJobStatusSchema = z.object({
  childJobIds: z.array(z.string().uuid()).default([]),
  completedAt: z.string().datetime().nullable(),
  counts: ingestionCountsSchema,
  createdAt: z.string().datetime(),
  errorMessage: z.string().nullable(),
  jobId: z.string().uuid(),
  jobType: pipelineJobTypeSchema,
  message: z.string().nullable(),
  orgId: z.string().uuid(),
  orgSlug: z.string(),
  source: z.enum(["public_demo", "authenticated_upload", "system"]),
  startedAt: z.string().datetime().nullable(),
  status: pipelineJobStatusSchema,
});

export type IngestionJobStatus = z.infer<typeof ingestionJobStatusSchema>;

export const uploadAcceptedFileSchema = z.object({
  contentType: z.string(),
  name: z.string(),
  sizeBytes: z.number().int().nonnegative(),
});

export type UploadAcceptedFile = z.infer<typeof uploadAcceptedFileSchema>;

export const uploadRejectedFileSchema = z.object({
  name: z.string(),
  reason: z.string(),
});

export type UploadRejectedFile = z.infer<typeof uploadRejectedFileSchema>;

export const uploadResponseSchema = z.object({
  acceptedFiles: z.array(uploadAcceptedFileSchema),
  jobId: z.string().uuid(),
  rejectedFiles: z.array(uploadRejectedFileSchema),
  status: pipelineJobStatusSchema,
});

export type UploadResponse = z.infer<typeof uploadResponseSchema>;

export const landingSectionSchema = z.object({
  title: z.string(),
  description: z.string(),
});

export type LandingSection = z.infer<typeof landingSectionSchema>;

export const demoMetricSchema = z.object({
  label: z.string(),
  value: z.string(),
  detail: z.string(),
});

export type DemoMetric = z.infer<typeof demoMetricSchema>;

export const graphNodeKindSchema = z.enum([
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

export type GraphNodeKind = z.infer<typeof graphNodeKindSchema>;

export const citationSchema = z.object({
  title: z.string(),
  snippet: z.string(),
});

export type Citation = z.infer<typeof citationSchema>;

export const relatedNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: graphNodeKindSchema,
});

export type RelatedNode = z.infer<typeof relatedNodeSchema>;

export const askAnswerSchema = z.object({
  answer: z.string(),
  confidence: z.string(),
  citations: z.array(citationSchema),
  relatedNodes: z.array(relatedNodeSchema),
  missingInfo: z.string(),
  suggestedSkill: z.string(),
});

export type AskAnswer = z.infer<typeof askAnswerSchema>;

export const askAnswerMapSchema = z.record(z.string(), askAnswerSchema);

export type AskAnswerMap = z.infer<typeof askAnswerMapSchema>;

export const graphNodeDataSchema = z.object({
  label: z.string(),
});

export type GraphNodeData = z.infer<typeof graphNodeDataSchema>;

export const graphNodeDetailSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: graphNodeKindSchema,
  summary: z.string(),
  confidence: z.string(),
  evidence: z.array(z.string()),
  relatedDocuments: z.array(z.string()),
  relatedSkills: z.array(z.string()),
  connectedNodes: z.array(z.string()),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  width: z.number().optional(),
});

export type GraphNodeDetail = z.infer<typeof graphNodeDetailSchema>;

export const approvalGateSchema = z.object({
  gate: z.string(),
  requiredWhen: z.string(),
});

export type ApprovalGate = z.infer<typeof approvalGateSchema>;

export const skillCardSchema = z.object({
  id: z.string(),
  name: z.string(),
  trigger: z.string(),
  status: z.string(),
  confidence: z.string(),
  approval: z.string(),
  sources: z.number(),
});

export type SkillCard = z.infer<typeof skillCardSchema>;

export const skillDetailSchema = skillCardSchema.extend({
  version: z.string(),
  inputsRequired: z.array(z.string()),
  steps: z.array(z.string()),
  approvalGates: z.array(approvalGateSchema),
  allowedActions: z.array(z.string()),
  forbiddenActions: z.array(z.string()),
  sourceCitations: z.array(z.string()),
});

export type SkillDetail = z.infer<typeof skillDetailSchema>;

export const healthFlagSeveritySchema = z.enum(["critical", "warning", "info"]);

export const healthFlagTypeSchema = z.enum([
  "conflict",
  "missing_owner",
  "stale_skill",
  "low_confidence",
  "unapproved_skill",
  "customer_risk",
]);

export const healthFlagSchema = z.object({
  id: z.string(),
  severity: healthFlagSeveritySchema,
  type: healthFlagTypeSchema,
  title: z.string(),
  description: z.string(),
  relatedNodes: z.array(z.string()),
  evidence: z.array(z.string()),
  suggestedFix: z.string(),
});

export type HealthFlag = z.infer<typeof healthFlagSchema>;
