# Vektr — 24-Hour Sprint PRD

**Product:** Vektr  
**Sprint:** 24-hour YC Company Brain demo build  
**Version:** v0.1 Sprint PRD  
**Date:** April 29, 2026  
**Primary goal:** Build a graph-backed, citation-backed, skill-generating company brain that can be filmed, launched, and used as a YC-facing proof of concept.

---

## 0. Executive Summary

Vektr is a **company brain for AI agents**.

It ingests messy internal artifacts — Slack exports, email threads, docs, postmortems, policies, customer notes — then turns them into:

1. A **living operating graph** of how the company works.
2. **Citation-first answers** grounded in source evidence.
3. **Executable skill files** that AI agents can use safely with approval gates.
4. **Knowledge health checks** that flag conflicts, stale workflows, missing owners, low-confidence claims, and unapproved skills.

The MVP demo uses a fictional 12-person Series A SaaS company called **Acme Labs**, centered on an enterprise refund conflict involving TeraCorp, a $48k/year customer demanding a refund after a 4-hour outage. The demo must feel real enough that a stranger can immediately understand the YC Company Brain wedge.

YC’s Company Brain RFS explicitly says this category is **not** company-wide search or a chatbot over documents. It is a system that pulls fragmented knowledge together, structures it, keeps it current, and turns it into an executable skills file for AI. Vektr’s sprint build must prove exactly that.

---

## 1. Product Thesis

### One-liner

**Vektr turns scattered company knowledge into a living operating graph and executable skills for AI agents.**

### Core belief

The future of AI work is not “chat with docs.” It is:

```text
company artifacts → company operating graph → validated skills → safe agent execution
```

Every company has important operating knowledge trapped across Slack threads, email chains, old docs, tickets, policies, CRM notes, tribal memory, and one-off decisions. AI agents cannot safely act unless they understand:

- Who owns what.
- What changed.
- Which policy is current.
- Which exceptions override the default process.
- Which actions require human approval.
- Which source supports each claim.

Vektr’s wedge is not generic retrieval. Vektr is the **memory compiler** between raw company artifacts and reliable AI agents.

---

## 2. Demo Narrative

The 24-hour sprint should produce a demo that tells this story:

> “Acme Labs had a messy refund dispute with TeraCorp after a Nov 3 outage. The context lived across Slack, email, refund policy docs, finance objections, and CEO approval. Vektr ingested those artifacts, built a graph of the people/process/decision path, answered questions with citations, flagged contradictions, and generated an Enterprise Refund Handling skill that an AI agent can follow next time.”

### Demo flow

1. Open Vektr landing page.
2. Click **Load Acme Labs Demo**.
3. See ingestion metrics:
   - Documents processed.
   - Chunks embedded.
   - Entities extracted.
   - Relationships created.
   - Skills generated.
   - Health flags detected.
4. Open **Graph**.
5. Click **TeraCorp Refund Request** node.
6. See connected nodes:
   - TeraCorp.
   - Marcus Webb.
   - Priya Nath.
   - Femi Adisa.
   - Jordan Mee.
   - Nov 3 Outage.
   - Refund Policy.
   - Enterprise Refund Handling Skill.
7. Ask:
   - “How do we handle enterprise refund requests after an outage?”
8. Receive citation-backed answer.
9. Open **Skills**.
10. View generated **Enterprise Refund Handling** skill with trigger, steps, required inputs, approval gates, forbidden actions, and source citations.
11. Open **Health**.
12. See conflict cards:
    - Finance pushes back on 2-month refund.
    - CEO approves exception.
    - Policy says Finance approval required above threshold.
13. End with:
    - “Vektr is the company brain layer agents need before they can act.”

---

## 3. MVP Feature Scope

Vektr v0.1 ships with four primary tabs:

```text
1. Ask
2. Graph
3. Skills
4. Health
```

Plus:

```text
5. Landing page
6. Demo ingestion / upload page
```

---

## 4. Features to Beat / Join / Skip

### 4.1 Features to Beat

These are the differentiators. They must be visible in the demo.

#### A. Operating Graph Canvas

Not a generic AI canvas. Not a Miro clone. Not “mind map with AI.”

The graph is a company operating map showing:

- People.
- Customers.
- Incidents.
- Policies.
- Decisions.
- Risks.
- Workflows.
- Skills.
- Documents.
- Approval gates.

Clicking a node opens a right drawer with:

- Summary.
- Evidence snippets.
- Related documents.
- Related people.
- Related decisions.
- Related skills.
- Confidence.
- Source freshness.

#### B. Skill Compiler

This is the YC wedge.

Vektr must generate executable skill files from company artifacts.

Example skill:

```json
{
  "skill_id": "enterprise-refund-handling",
  "version": "0.1",
  "name": "Enterprise Refund Handling",
  "trigger": "Enterprise customer requests refund or service credit after outage",
  "inputs_required": [
    "customer_arr",
    "outage_duration",
    "contract_terms",
    "customer_sentiment",
    "prior_credits",
    "finance_approval_threshold"
  ],
  "steps": [
    "CSM acknowledges the request and gathers account context.",
    "Head of Sales evaluates relationship risk and renewal impact.",
    "Finance evaluates credit amount against policy and ARR.",
    "CEO approves strategic exceptions above the default threshold.",
    "CSM sends final resolution to customer."
  ],
  "approval_gates": [
    {
      "gate": "Finance approval",
      "required_when": "Credit exceeds default policy threshold"
    },
    {
      "gate": "CEO approval",
      "required_when": "Strategic enterprise account exception"
    }
  ],
  "allowed_actions": [
    "summarize_context",
    "draft_customer_email",
    "request_human_approval"
  ],
  "forbidden_actions": [
    "send_email_without_review",
    "issue_refund",
    "modify_contract",
    "promise_credit_without_approval"
  ],
  "status": "draft",
  "confidence": 0.88,
  "source_citations": []
}
```

#### C. Citation-First Answers

Every answer must include source evidence.

Rules:

- No citations → no answer.
- Low confidence → say what is missing.
- Conflicting sources → surface the conflict instead of hiding it.
- Source snippets must be shown, not just document names.

#### D. Knowledge Health

Vektr must proactively flag:

- Conflicting policies.
- Missing owners.
- Stale workflows.
- Unapproved generated skills.
- Low-confidence claims.
- Customer risk signals.
- Contradictory status values.

This is where Vektr feels alive, not passive.

#### E. Local + Global GraphRAG Query Modes

Vektr should visibly support two kinds of questions:

**Local/entity questions:**

- “Who made the final call on TeraCorp?”
- “What did Femi object to?”
- “What documents mention the refund policy?”

**Global/company-wide questions:**

- “What are Acme’s biggest operational risks?”
- “Where do our processes break down?”
- “What workflows should we turn into skills?”

Microsoft GraphRAG’s local/global retrieval model maps directly to this UX.

---

### 4.2 Features to Join

These are table stakes. They need to exist enough to not look unserious.

#### A. Upload / Import Flow

Support:

- `.json` Slack export.
- `.json` email thread export.
- `.md` markdown docs.
- `.txt` docs.
- `.pdf` only if easy and not blocking.

#### B. Connector-Looking Interface

Show future connectors as cards:

- Slack.
- Google Drive.
- Gmail.
- Notion.
- GitHub.
- Linear.
- Jira.
- Zendesk.
- Intercom.

For v0.1, mark them:

```text
Coming soon / Join waitlist
```

Do not build OAuth in this sprint.

#### C. Basic Workspace Model

Need:

- User.
- Organization.
- Workspace / brain.
- Demo workspace.
- Membership role.
- `org_id` scoping everywhere.

#### D. Search / Chat Surface

Vektr should have “Ask,” but it should not lead with chat as the core product. Lead with graph + skills.

#### E. Skill JSON Export

Users should be able to export a skill as JSON. This makes “agent-ready company brain” concrete.

---

### 4.3 Features to Skip

Do not build these in the 24-hour sprint:

```text
- Real Slack OAuth.
- Real Google Drive OAuth.
- Real Gmail OAuth.
- Full permission mirroring.
- Multi-tenant enterprise admin console.
- Billing.
- SOC2/security marketing page beyond basic security notes.
- Real agent execution.
- Sending emails/refunds/actions.
- Browser extension.
- Mobile app.
- Generic AI canvas/artifact builder.
- Image/audio/video generation.
- Deep GraphRAG tuning.
- Perfect entity resolution.
- Perfect PDF parsing.
```

---

## 5. Technical Architecture

### 5.1 Final Stack

```text
Frontend
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Flow for graph canvas

Backend
- Next.js route handlers for app APIs
- FastAPI Python worker for ingestion, GraphRAG jobs, Neo4j import, extraction tasks
- Async queue: Upstash Redis + RQ/Celery/Arq

Auth / App DB / Storage
- Supabase Auth
- Supabase Postgres
- Supabase RLS
- Supabase Storage or S3-compatible storage

Citation Retrieval
- Supabase pgvector or Qdrant
- v0.1 default: Supabase pgvector unless Qdrant setup is faster

Graph
- Neo4j AuraDB

Graph/RAG
- Microsoft GraphRAG for indexing, entity extraction, relationship extraction, community detection, community summaries
- Neo4j import adapter for GraphRAG outputs

LLM
- Claude / GPT for extraction cleanup, answer synthesis, and skill generation
- Strict JSON schemas for all model outputs

Deployment
- Vercel for Next.js
- Render / Fly.io / Railway for FastAPI worker
- Supabase hosted project
- Neo4j AuraDB
```

---

### 5.2 Why This Stack

#### Microsoft GraphRAG

Use GraphRAG as the serious company-brain indexing layer.

Vektr needs:

- Entity extraction.
- Relationship extraction.
- Community detection.
- Community summaries.
- Local/entity search.
- Global/corpus-level search.
- DRIFT-style hybrid reasoning later.

GraphRAG gives us a credible starting point for the “structured company brain” layer without inventing graph extraction from scratch.

#### Neo4j AuraDB

Use Neo4j as the graph database for:

- Operating graph storage.
- Cypher traversal.
- Relationship-heavy queries.
- React Flow graph rendering.
- Future graph analytics.

Neo4j is not the moat. It is the graph system of record for the sprint.

#### Supabase

Use Supabase for:

- Auth.
- Organizations.
- Memberships.
- Documents.
- Chunks.
- Skills.
- Health flags.
- Storage.
- pgvector citation retrieval.
- RLS-backed app data authorization.

#### FastAPI

Use FastAPI for Python-native AI/indexing work:

- GraphRAG CLI/library orchestration.
- File parsing.
- Embeddings.
- Neo4j import.
- Async background jobs.

#### Next.js

Use Next.js for:

- Landing page.
- App UI.
- Auth flow.
- Route handlers.
- Demo flow.
- Product Hunt-ready polish.

#### React Flow

Use React Flow for the visual graph wow factor:

- Pan/zoom canvas.
- Custom typed nodes.
- Labeled edges.
- Minimap.
- Controls.
- Right drawer interactions.

---

## 6. System Diagram

```text
                          ┌──────────────────────────┐
                          │        Next.js App        │
                          │ Landing / Ask / Graph UI  │
                          └─────────────┬────────────┘
                                        │
                                        ▼
                          ┌──────────────────────────┐
                          │  Next.js Route Handlers   │
                          │  Auth + workspace APIs    │
                          └──────┬──────────────┬────┘
                                 │              │
                                 ▼              ▼
                    ┌──────────────────┐   ┌──────────────────┐
                    │ Supabase Postgres│   │  FastAPI Worker   │
                    │ Auth/App DB/RLS  │   │ Ingest/GraphRAG   │
                    └──────┬───────────┘   └──────┬───────────┘
                           │                      │
                           ▼                      ▼
                    ┌──────────────┐       ┌───────────────┐
                    │ pgvector /   │       │ Microsoft      │
                    │ citation idx │       │ GraphRAG       │
                    └──────┬───────┘       └──────┬────────┘
                           │                      │
                           ▼                      ▼
                    ┌─────────────────────────────────────┐
                    │             Neo4j AuraDB             │
                    │ Operating graph + communities + edges │
                    └─────────────────────────────────────┘
```

---

## 7. Data Pipeline

### 7.1 Ingestion Pipeline

```text
User uploads / loads Acme demo
        ↓
Raw file saved to object storage
        ↓
Parser normalizes Slack JSON, email JSON, markdown, text
        ↓
Document row created in Supabase
        ↓
Chunker creates citation chunks
        ↓
Embeddings stored in pgvector/Qdrant
        ↓
Microsoft GraphRAG indexes corpus
        ↓
GraphRAG outputs entities, relationships, claims/covariates, communities, summaries
        ↓
Adapter imports graph artifacts into Neo4j
        ↓
Vektr generates skills and health flags
        ↓
UI updates ingestion dashboard
```

### 7.2 Query Pipeline

```text
User asks question
        ↓
Classify query type:
- local/entity question
- global/company-wide question
- skill/workflow question
- conflict/health question
        ↓
Retrieve evidence:
- vector chunks from pgvector/Qdrant for citations
- Neo4j neighborhood for graph context
- GraphRAG local/global output if useful
        ↓
Assemble context pack
        ↓
LLM answer synthesis with strict answer schema
        ↓
Return:
- answer
- citations
- related graph nodes
- confidence
- missing information
- suggested skill/action
```

### 7.3 Skill Generation Pipeline

```text
Graph entities + relationships + evidence chunks
        ↓
Identify repeated workflow / process / escalation pattern
        ↓
Generate draft skill JSON
        ↓
Attach source citations
        ↓
Infer allowed actions, forbidden actions, and approval gates
        ↓
Mark status = draft
        ↓
Surface in Skills page and Health page
```

---

## 8. Data Model

### 8.1 Supabase Tables

```sql
organizations
- id uuid primary key
- name text
- slug text unique
- created_at timestamptz
- updated_at timestamptz

memberships
- id uuid primary key
- org_id uuid references organizations(id)
- user_id uuid references auth.users(id)
- role text -- owner | admin | member
- created_at timestamptz

documents
- id uuid primary key
- org_id uuid references organizations(id)
- title text
- source_type text -- slack_json | email_json | markdown | text | pdf | demo_seed
- source_date timestamptz null
- storage_path text null
- raw_text text
- metadata jsonb
- created_at timestamptz
- updated_at timestamptz

chunks
- id uuid primary key
- org_id uuid references organizations(id)
- document_id uuid references documents(id)
- chunk_index int
- content text
- embedding vector(1536)
- metadata jsonb
- created_at timestamptz

skills
- id uuid primary key
- org_id uuid references organizations(id)
- name text
- slug text
- trigger text
- inputs_required jsonb
- steps jsonb
- approval_gates jsonb
- allowed_actions jsonb
- forbidden_actions jsonb
- status text -- draft | approved | rejected
- confidence numeric
- source_chunk_ids uuid[]
- source_entity_ids text[] -- Neo4j ids or external ids
- version text
- metadata jsonb
- created_at timestamptz
- updated_at timestamptz

health_flags
- id uuid primary key
- org_id uuid references organizations(id)
- severity text -- info | warning | critical
- type text -- conflict | missing_owner | stale_skill | low_confidence | unapproved_skill | customer_risk
- title text
- description text
- related_entity_ids text[]
- evidence_chunk_ids uuid[]
- status text -- open | dismissed | resolved
- created_at timestamptz
- updated_at timestamptz

ask_logs
- id uuid primary key
- org_id uuid references organizations(id)
- user_id uuid references auth.users(id)
- question text
- answer jsonb
- citation_chunk_ids uuid[]
- created_at timestamptz
```

### 8.2 Neo4j Node Types

```text
:Person
:Team
:Customer
:Incident
:Decision
:Policy
:Workflow
:Skill
:Risk
:Document
:Chunk
:ApprovalGate
:Community
```

### 8.3 Neo4j Relationship Types

```text
OWNS
WORKS_ON
MENTIONED_IN
CAUSED_BY
BLOCKED_BY
APPROVED_BY
PUSHED_BACK_ON
ESCALATES_TO
REQUIRES_APPROVAL_FROM
GENERATED_FROM
CONFLICTS_WITH
SUPERSEDES
DEPENDS_ON
RELATED_TO
HAS_RISK
HAS_POLICY
HAS_SKILL
```

### 8.4 Canonical Acme Graph

Minimum graph demo must include:

```text
TeraCorp Refund Request
├── caused_by → Nov 3 Outage
├── customer → TeraCorp
├── owned_by → Marcus Webb
├── escalates_to → Priya Nath
├── finance_review → Femi Adisa
├── approved_by → Jordan Mee
├── governed_by → Refund Policy
├── conflicts_with → Finance Objection
└── generated_skill → Enterprise Refund Handling
```

---

## 9. GraphRAG + Neo4j Implementation Plan

### 9.1 Minimum Viable Integration

Use GraphRAG normally, then import its artifacts into Neo4j.

```text
GraphRAG index output
→ entities
→ relationships
→ text units / chunks
→ community reports
→ covariates / claims
→ import to Neo4j
```

Neo4j becomes:

- Live graph query layer.
- UI graph data source.
- Relationship traversal system.
- Graph context source for Ask Vektr.

GraphRAG remains:

- Indexing engine.
- Community summary engine.
- Local/global retrieval enhancer.

### 9.2 Sprint Integration Path

1. Run GraphRAG indexing on Acme corpus.
2. Inspect output files.
3. Write `import_graphrag_to_neo4j.py`.
4. Map GraphRAG entities to Neo4j nodes.
5. Map relationships to Neo4j relationships.
6. Store GraphRAG community summaries as `:Community` nodes.
7. Link entities to communities.
8. Link documents/chunks to entities.
9. Query Neo4j for React Flow.
10. Query Neo4j for Ask context.

### 9.3 Fallback If GraphRAG Setup Fights Us

Codex should build a fallback extraction pipeline in parallel.

Fallback:

```text
LLM strict JSON extraction
→ entities / relationships / claims / skills
→ Neo4j import
→ pgvector citation retrieval
```

This fallback must not be shown as the preferred architecture. It is insurance so the demo ships.

---

## 10. API Surface

### 10.1 Next.js Routes

```text
GET  /api/me
GET  /api/orgs/current
POST /api/demo/load
POST /api/upload
POST /api/ask
GET  /api/graph
GET  /api/entities/:id
GET  /api/skills
GET  /api/skills/:id
POST /api/skills/:id/approve
GET  /api/skills/:id/export
GET  /api/health
POST /api/health/:id/dismiss
```

### 10.2 FastAPI Worker Routes

```text
POST /worker/ingest/document
POST /worker/ingest/demo
POST /worker/graphrag/index
POST /worker/graphrag/import-neo4j
POST /worker/extract/fallback
POST /worker/skills/generate
POST /worker/health/generate
GET  /worker/jobs/:id
```

### 10.3 Ask Response Schema

```json
{
  "answer": "The final call on TeraCorp was made by Jordan Mee after Finance pushed back on a two-month refund and Sales argued for preserving the enterprise relationship.",
  "citations": [
    {
      "chunk_id": "uuid",
      "document_id": "uuid",
      "document_title": "customer-success-slack.json",
      "source_type": "slack_json",
      "source_date": "2024-11-10T15:42:00Z",
      "snippet": "Jordan: let's approve a one-month credit and frame it as goodwill..."
    }
  ],
  "confidence": "high",
  "missing_info": [],
  "related_entities": [
    {
      "id": "neo4j-id-or-stable-id",
      "name": "TeraCorp Refund Request",
      "type": "Decision"
    }
  ],
  "suggested_skills": [
    "Enterprise Refund Handling"
  ]
}
```

---

## 11. UI Specification

### 11.1 Landing Page

#### Hero

```text
Your company brain, mapped.

Vektr turns Slack threads, emails, docs, and tickets into a living operating graph — then generates executable skills for AI agents.
```

#### CTA

- **Try Acme Labs Demo**
- **Join Waitlist**

#### Sections

1. **Upload messy company artifacts**
   - Slack exports, email threads, policies, postmortems, docs.
2. **Build the operating graph**
   - People, decisions, workflows, customers, risks.
3. **Ask with citations**
   - No evidence, no answer.
4. **Generate agent skills**
   - Triggers, steps, approval gates, forbidden actions.
5. **Catch broken knowledge**
   - Conflicts, missing owners, stale workflows.

### 11.2 Demo Ingestion Page

Path: `/demo`

Elements:

- Button: **Load Acme Labs Brain**
- Progress cards:
  - Documents processed.
  - Chunks embedded.
  - Entities extracted.
  - Relationships created.
  - Communities generated.
  - Skills generated.
  - Health flags detected.
- Timeline log.

Example final state:

```text
Acme Labs Brain Ready

12 documents processed
184 chunks embedded
67 entities extracted
142 relationships created
8 communities summarized
5 skills generated
6 health flags detected
```

### 11.3 Ask Page

Path: `/ask`

Layout:

```text
Left: chat / answer area
Right: citations + related graph nodes
```

Required demo prompts as buttons:

```text
How do we handle enterprise refund requests after an outage?
Who made the final call on TeraCorp and why?
Where do our sources disagree about refund approval?
What skill should an AI agent follow next time a customer asks for a service credit?
What are the biggest operational risks in Acme Labs right now?
```

Answer card:

- Answer.
- Confidence pill.
- Citations.
- Related nodes.
- Missing info.
- Suggested skill.

### 11.4 Graph Page

Path: `/graph`

Use React Flow.

Features:

- Custom node cards by type.
- Labeled edges.
- Pan/zoom.
- Minimap.
- Controls.
- Fit view.
- Filters.
- Right drawer on node click.

Node filters:

```text
People
Customers
Incidents
Decisions
Policies
Workflows
Risks
Skills
Documents
Communities
```

Right drawer fields:

- Name.
- Type.
- Summary.
- Confidence.
- Evidence snippets.
- Related documents.
- Related skills.
- Connected nodes.
- Ask about this node.

### 11.5 Skills Page

Path: `/skills`

List cards:

```text
Enterprise Refund Handling
Trigger: Enterprise customer requests refund/service credit after outage
Status: Draft
Confidence: 88%
Approval: Human required
Sources: 5
[View] [Export JSON] [Approve]
```

Required demo skills:

1. Enterprise Refund Handling.
2. Outage Incident Response.
3. Security Questionnaire Handling.
4. Vendor Renewal Negotiation.
5. Enterprise Lead Qualification.

Skill detail fields:

- Name.
- Version.
- Trigger.
- Inputs required.
- Steps.
- Approval gates.
- Allowed actions.
- Forbidden actions.
- Source citations.
- Confidence.
- Status.
- Export JSON button.

### 11.6 Health Page

Path: `/health`

Cards grouped by severity:

```text
Critical
- Refund approval conflict

Warning
- Missing owner for Security Questionnaire Handling
- Enterprise Refund Handling is unapproved
- Vendor Renewal Negotiation workflow is stale

Info
- Low-confidence relationship between pricing exception and renewal risk
```

Each card:

- Severity.
- Type.
- Title.
- Description.
- Related graph nodes.
- Evidence snippets.
- Suggested fix.

---

## 12. Security Requirements

Security cannot be fake. The sprint version must at least be architected correctly.

### 12.1 Required Controls

```text
[ ] Supabase RLS enabled on every exposed table.
[ ] Every app table has org_id where relevant.
[ ] Every query filters by org_id or uses an RLS policy.
[ ] No service role key in client bundle.
[ ] Neo4j credentials server-only.
[ ] LLM provider keys server-only.
[ ] Upload size limits enforced.
[ ] Upload type allowlist enforced.
[ ] User input schema validation with Zod/Pydantic.
[ ] LLM output schema validation before persistence.
[ ] Citation-required answer contract.
[ ] No autonomous external actions.
[ ] Skill files include forbidden actions.
[ ] Rate limiting on upload and ask endpoints.
[ ] Error messages do not leak stack traces.
[ ] Logs avoid storing secrets or raw keys.
```

### 12.2 LLM Security Rules

Vektr treats source documents as untrusted input.

Potential risks:

- Prompt injection inside uploaded docs.
- Sensitive info leakage.
- Excessive agency.
- Insecure output handling.
- Hallucinated answers.
- Cross-tenant data leakage.

Rules:

1. Never let retrieved documents override system/developer instructions.
2. Never execute actions from retrieved text.
3. Never answer without source citations.
4. Never expose documents outside the active org.
5. Never let the model directly write approved skills.
6. Generated skills start as `draft`.
7. Human approval required before any skill is considered active.
8. Skills must explicitly list allowed and forbidden actions.

### 12.3 Data Access Layer

All data access should go through server-only functions:

```text
lib/server/db/orgs.ts
lib/server/db/documents.ts
lib/server/db/chunks.ts
lib/server/db/skills.ts
lib/server/db/health.ts
lib/server/db/graph.ts
```

Each function must:

- Authenticate user.
- Authorize org access.
- Validate input.
- Constrain returned fields.
- Avoid returning raw secrets/internal metadata.

---

## 13. 24-Hour Sprint Plan

### Hour 0–1: Repo + Infra

Owner: Codex Session A

Tasks:

- Create Next.js app.
- Install Tailwind, shadcn/ui, React Flow.
- Create FastAPI worker.
- Connect Supabase.
- Connect Neo4j AuraDB.
- Set env var schema.
- Add README setup.

Deliverable:

- App boots.
- Worker boots.
- DB connections work.

### Hour 1–3: Database + RLS + Auth

Owner: Codex Session A

Tasks:

- Create Supabase migrations.
- Enable pgvector.
- Create organizations, memberships, documents, chunks, skills, health_flags, ask_logs.
- Enable RLS.
- Create policies.
- Create `match_chunks` RPC.
- Create server-only DAL.

Deliverable:

- Authenticated user can load workspace data.
- RLS blocks cross-org access.

### Hour 2–5: Acme Seed Dataset

Owner: Codex Session B

Tasks:

Create seed files:

```text
seed/acme/customer-success-slack.json
seed/acme/email-threads.json
seed/acme/welcome-to-acme.md
seed/acme/refund-policy.md
seed/acme/nov-3-outage-postmortem.md
seed/acme/security-procurement-gap.md
seed/acme/pricing-exceptions.md
seed/acme/dataflow-vendor-renewal.json
```

Include:

- TeraCorp pays $48k/year.
- Nov 3 outage lasted 4 hours.
- Customer demands 2-month refund.
- Marcus opens thread.
- Priya pulled in.
- Femi pushes back on amount.
- Jordan makes final call.
- Someone tags wrong person.
- Policy conflicts with exception.
- Slack + email + docs disagree slightly.

Deliverable:

- Acme demo corpus ready.

### Hour 3–6: Ingestion + Chunking + Embeddings

Owner: Codex Session B

Tasks:

- Implement `/api/demo/load`.
- Implement `/api/upload`.
- Normalize `.json`, `.md`, `.txt`.
- Store raw document.
- Chunk text.
- Generate embeddings.
- Store chunks in pgvector.

Deliverable:

- Demo load creates documents/chunks/embeddings.

### Hour 5–9: GraphRAG + Neo4j Import

Owner: Codex Session C

Tasks:

- Configure GraphRAG for Acme corpus.
- Run index job.
- Inspect output artifacts.
- Write import script.
- Import entities into Neo4j.
- Import relationships into Neo4j.
- Import communities into Neo4j.
- Link documents/chunks.

Deliverable:

- Neo4j contains Acme graph.

### Hour 7–10: Fallback Extraction Pipeline

Owner: Codex Session D

Tasks:

- Build strict JSON extraction fallback.
- Extract entities, relationships, claims, skills, flags.
- Persist to Neo4j + Supabase.
- Use only if GraphRAG integration stalls.

Deliverable:

- Demo can ship even if GraphRAG import is imperfect.

### Hour 9–12: Ask Vektr

Owner: Codex Session E

Tasks:

- Implement `/api/ask`.
- Classify question type.
- Retrieve vector citations.
- Pull Neo4j graph neighborhood.
- Optionally invoke GraphRAG local/global result.
- Generate answer with strict schema.
- Fail closed without citations.

Deliverable:

- Five demo questions work.

### Hour 12–15: Graph UI

Owner: Codex Session F

Tasks:

- Build `/graph`.
- Fetch graph from API.
- Render React Flow nodes/edges.
- Create node type styles.
- Add filters.
- Add minimap/controls.
- Add right drawer.
- Add evidence snippets.

Deliverable:

- Graph has wow factor.

### Hour 15–17: Skills Page

Owner: Codex Session G

Tasks:

- Build `/skills`.
- Build skill cards.
- Build skill detail drawer/page.
- Implement export JSON.
- Implement approve button.
- Link source citations.

Deliverable:

- Enterprise Refund Handling skill is demo-ready.

### Hour 17–19: Knowledge Health

Owner: Codex Session H

Tasks:

- Build health detection rules.
- Build `/health`.
- Group by severity.
- Link flags to graph nodes and evidence.
- Add suggested fix copy.

Deliverable:

- Conflicts/missing owners/stale workflows visible.

### Hour 19–21: Landing + Product Hunt Assets

Owner: Codex Session I

Tasks:

- Build landing page.
- Add waitlist form.
- Add demo CTA.
- Add graph screenshot/animation area.
- Write Product Hunt copy.
- Add OpenGraph image.
- Add crisp mobile version.

Deliverable:

- Public launch page ready.

### Hour 21–22: Demo Script + Recording Prep

Owner: Human + Codex polish

Tasks:

- Test demo route.
- Test five questions.
- Capture graph screenshots.
- Prepare 90-second script.
- Prepare 3-minute deep demo.

Deliverable:

- Ready to film.

### Hour 22–24: Security + QA Lockdown

Owner: Everyone

Tasks:

No new features.

Checklist:

```text
[ ] RLS enabled on all public tables.
[ ] No service role key in client.
[ ] No Neo4j credentials in client.
[ ] No LLM keys in client.
[ ] All API routes auth-gated except landing/waitlist/demo preview.
[ ] org_id checked everywhere.
[ ] Upload size/type validation.
[ ] Rate limiting.
[ ] LLM JSON schema validation.
[ ] Empty citation answers fail closed.
[ ] Demo reset works.
[ ] Graph renders 50+ nodes.
[ ] Five demo questions work.
[ ] Skill export works.
[ ] Health flags work.
[ ] Product Hunt page works on mobile.
[ ] No raw stack traces.
[ ] Error states are readable.
```

Deliverable:

- Launchable demo.

---

## 14. Codex Workstreams

### Session A — App Shell + Infrastructure

```text
Build the Vektr app shell.

Stack:
- Next.js App Router
- TypeScript
- Tailwind
- shadcn/ui
- React Flow
- Supabase client/server setup
- FastAPI worker scaffold

Create routes:
- /
- /demo
- /ask
- /graph
- /skills
- /health

Do not implement business logic yet. Focus on clean structure, env vars, layout, navigation, and typed API clients.
```

### Session B — Supabase Schema + RLS

```text
Build Supabase migrations for Vektr.

Tables:
- organizations
- memberships
- documents
- chunks
- skills
- health_flags
- ask_logs

Requirements:
- Enable pgvector.
- chunks.embedding vector(1536).
- Enable RLS on every table.
- Policies restrict reads/writes to users with membership in org_id.
- Create match_chunks RPC for vector similarity scoped by org_id.
- Generate TypeScript DB types if possible.
- Build server-only DAL in lib/server/db.
```

### Session C — Acme Demo Corpus

```text
Create the Acme Labs demo corpus.

Files:
- customer-success-slack.json
- email-threads.json
- welcome-to-acme.md
- refund-policy.md
- nov-3-outage-postmortem.md
- security-procurement-gap.md
- pricing-exceptions.md
- dataflow-vendor-renewal.json

Scenario:
TeraCorp pays $48k/year and demands a two-month refund after a 4-hour Nov 3 outage. Marcus opens Slack thread, Priya gets pulled in, Femi pushes back, Jordan makes final call. Include contradictions across Slack/email/policy. Include enough signal to generate an Enterprise Refund Handling skill.
```

### Session D — Ingestion Pipeline

```text
Build ingestion.

Implement:
- POST /api/demo/load
- POST /api/upload
- parser for json/md/txt
- document normalization
- chunking with overlap
- OpenAI embeddings
- store documents/chunks in Supabase
- queue GraphRAG job
- ingestion status response
```

### Session E — GraphRAG + Neo4j

```text
Build Microsoft GraphRAG + Neo4j integration.

Implement:
- FastAPI endpoint to run GraphRAG index on org corpus
- script to import GraphRAG entities/relationships/text units/community reports into Neo4j
- Neo4j node labels: Person, Customer, Incident, Decision, Policy, Workflow, Skill, Risk, Document, Chunk, Community
- Neo4j edge types: OWNS, MENTIONED_IN, CAUSED_BY, BLOCKED_BY, APPROVED_BY, PUSHED_BACK_ON, ESCALATES_TO, REQUIRES_APPROVAL_FROM, GENERATED_FROM, CONFLICTS_WITH, RELATED_TO
- endpoint GET /api/graph returning React Flow nodes/edges
```

### Session F — Ask Pipeline

```text
Build citation-first Ask Vektr.

Implement:
- POST /api/ask
- classify query type: local, global, skill, health
- embed query
- vector retrieve top chunks scoped by org_id
- query Neo4j neighborhood for related entities
- optionally call GraphRAG local/global results if available
- synthesize answer with strict JSON schema
- require citations; fail closed if none
- return answer, citations, confidence, missing_info, related_entities, suggested_skills
```

### Session G — Graph Canvas UI

```text
Build /graph with React Flow.

Requirements:
- Render typed nodes and labeled edges.
- Support filters for People, Customers, Incidents, Decisions, Policies, Workflows, Risks, Skills, Documents, Communities.
- Add minimap, controls, fit view, panning, zoom.
- Click node opens right drawer with summary, evidence, related docs, related skills, connected nodes.
- Make TeraCorp Refund Request the hero node for demo.
```

### Session H — Skills + Health

```text
Build /skills and /health.

Skills:
- Cards with trigger, confidence, status, source count.
- Detail view with inputs, steps, approval gates, allowed actions, forbidden actions, citations.
- Export JSON.
- Approve draft skill.

Health:
- Cards grouped by severity.
- Types: conflict, missing_owner, stale_skill, low_confidence, unapproved_skill, customer_risk.
- Evidence snippets and related graph nodes.
```

### Session I — Landing + Launch

```text
Build the landing page and Product Hunt launch assets.

Hero:
Your company brain, mapped.

Subheadline:
Vektr turns Slack threads, emails, docs, and tickets into a living operating graph — then generates executable skills for AI agents.

CTA:
Try Acme Labs Demo
Join Waitlist

Add sections for:
- ingest artifacts
- build graph
- ask with citations
- generate skills
- catch broken knowledge

Add mobile polish and OpenGraph metadata.
```

---

## 15. Demo Questions

These five questions must work perfectly:

```text
1. How do we handle enterprise refund requests after an outage?
2. Who made the final call on TeraCorp and why?
3. Where do our sources disagree about refund approval?
4. What skill should an AI agent follow next time a customer asks for a service credit?
5. What are the biggest operational risks in Acme Labs right now?
```

Expected answer behavior:

- Strong direct answer.
- Citations shown.
- Related graph nodes shown.
- Suggested skill shown where relevant.
- Conflicts surfaced when relevant.

---

## 16. Product Hunt Launch Assets

### Name

Vektr

### Tagline

The company brain for AI agents.

### Short Description

Vektr turns scattered Slack threads, emails, docs, and tickets into a living operating graph. Ask questions with citations, see how your company really works, and generate executable skills AI agents can follow safely.

### First Comment

```text
Hey Product Hunt — I built Vektr because every company is about to hit the same wall with AI agents.

The models are good enough. The missing layer is company knowledge.

Refunds, pricing exceptions, incident response, customer escalations — all of that lives across Slack threads, email chains, old docs, and people’s heads. Agents can’t safely do work unless they understand that operating context.

Vektr ingests messy company artifacts, extracts a living graph of people/projects/customers/decisions/workflows, answers with citations, and generates “skills” agents can use with human approval.

This demo uses a fictional SaaS company called Acme Labs, but the workflow is real:
- upload messy docs
- build the company brain
- ask operational questions
- inspect the graph
- generate agent skills
- catch conflicts before agents act

Would love feedback, especially from founders/operators drowning in internal knowledge chaos.
```

### Launch Rules

- Launch at 12:01 AM Pacific if possible.
- Do not directly ask for upvotes.
- Ask people to visit, try, and comment.
- Optimize for waitlist signups and demo usage, not vanity votes.

---

## 17. Acceptance Criteria

The sprint is successful if:

```text
[ ] Stranger can open landing page and understand product in 10 seconds.
[ ] User can load Acme Labs demo in one click.
[ ] Ingestion dashboard shows completed processing.
[ ] Ask page answers all five demo questions with citations.
[ ] Graph page renders an interactive graph with TeraCorp-centered workflow.
[ ] Clicking graph nodes reveals evidence.
[ ] Skills page shows Enterprise Refund Handling and at least four other draft skills.
[ ] Skill JSON export works.
[ ] Health page shows at least five useful flags.
[ ] Security checklist passes.
[ ] Product Hunt-ready landing page is deployed.
[ ] 90-second demo can be filmed without manual DB fiddling.
```

---

## 18. Risk Register

### Risk 1: GraphRAG setup takes too long

Mitigation:

- Build fallback strict JSON extraction in parallel.
- Do not let GraphRAG block UI/demo.
- If GraphRAG fails, still use Neo4j populated by fallback extractor.

### Risk 2: Neo4j import complexity

Mitigation:

- Keep node/edge schema simple.
- Import only essential fields.
- Use stable names/types for demo graph.

### Risk 3: Ask answers hallucinate

Mitigation:

- Citation-required contract.
- Fail closed without citations.
- Keep demo questions aligned with seed data.

### Risk 4: UI graph looks messy

Mitigation:

- Hardcode initial layout around TeraCorp hero graph if needed.
- Use filtered demo graph, not full graph dump.
- Prioritize visual clarity over exhaustive graph completeness.

### Risk 5: Security hole in public demo

Mitigation:

- Public users only access demo org.
- Strict RLS.
- No file uploads publicly if upload security is incomplete.
- Allow demo mode first; waitlist for real uploads.

---

## 19. Non-Negotiables

```text
1. The product must not look like generic chat with docs.
2. The graph must be central to the demo.
3. Skills must be central to the demo.
4. Every answer must cite sources.
5. The system must surface contradictions.
6. No autonomous external actions.
7. No credentials in frontend.
8. Do not waste time on real OAuth integrations.
9. Do not build generic AI canvas features.
10. Ship the demo.
```

---

## 20. Final Build Target

At the end of 24 hours, this sentence must be true:

> A stranger can open Vektr, load Acme Labs, ask “How do we handle enterprise refund requests?”, get a cited answer, inspect the TeraCorp graph, see the refund escalation path, export an Enterprise Refund Handling skill, and understand why this is the company brain agents need.

That is enough to film.

That is enough to launch.

That is enough to make the YC wedge obvious.

---

## References

- YC Requests for Startups — Company Brain: https://www.ycombinator.com/rfs
- Microsoft GraphRAG documentation: https://microsoft.github.io/graphrag/
- Microsoft Research DRIFT Search / GraphRAG overview: https://www.microsoft.com/en-us/research/blog/introducing-drift-search-combining-global-and-local-search-methods-to-improve-quality-and-efficiency/
- Neo4j Microsoft GraphRAG integration: https://neo4j.com/blog/developer/microsoft-graphrag-neo4j/
- Supabase pgvector docs: https://supabase.com/docs/guides/database/extensions/pgvector
- Supabase Row Level Security docs: https://supabase.com/docs/guides/database/postgres/row-level-security
- Next.js Data Security docs: https://nextjs.org/docs/app/guides/data-security
- Next.js `use server` security docs: https://nextjs.org/docs/app/api-reference/directives/use-server
- OWASP Top 10 for LLM Applications: https://owasp.org/www-project-top-10-for-large-language-model-applications/
- React Flow docs: https://reactflow.dev/
- FastAPI docs: https://fastapi.tiangolo.com/
- Product Hunt Launch Guide: https://www.producthunt.com/launch
