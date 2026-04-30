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


  # Session A Gap-Fill Plan: App Shell + Infrastructure

  ## Summary

  Complete Session A as a UI-and-structure pass, not a
  data/business-logic pass. The result will be a clean
  Next.js App Router shell with the six required routes,
  shared layout/navigation, PRD-aligned landing/demo/page
  scaffolds, typed frontend API client boundaries, and a
  FastAPI worker scaffold that remains bootable. Real
  Supabase and Neo4j connectivity will stay explicitly
  deferred to a later infra/data step, but the env
  contract and server-only boundaries will remain in
  place.

  Brand and copy will follow the PRD:

  - Product name: Vektr
  - Tagline: The company brain for AI agents.
  - Hero headline: Your company brain, mapped.
  - Core subheadline: Vektr turns Slack threads, emails,
    docs, and tickets into a living operating graph — then
    generates executable skills for AI agents.

  ## Implementation Changes

  ### App shell and route structure

  Create the full App Router surface:

  - /
  - /demo
  - /ask
  - /graph
  - /skills
  - /health

  Implement a shared app shell with:

  - Top navigation linking to all required routes
  - A clear distinction between the marketing landing page
    and the in-app workspace pages
  - Consistent page container, spacing, typography, badge
    styles, and card primitives
  - Shared page header pattern: title, one-line
    explanation, and route-specific status/actions

  Layout decisions:

  - / is the landing page and uses marketing-style
    sections and CTA treatment
  - /demo, /ask, /graph, /skills, and /health use a
    unified “product app” layout
  - Navigation should lead with Graph and Skills visually
    over Ask, matching the PRD’s emphasis that Vektr is
    not “chat with docs”
  - Add metadata/OpenGraph basics for the landing page
    only; keep them lightweight for this session

  ### Landing page and brand expression

  Rebuild / to match PRD copy and hierarchy:

  - Hero with tagline, headline, subheadline, and two
    CTAs: Try Acme Labs Demo and Join Waitlist
  - A compact visual graph preview that supports the
    “company brain” framing
  - Five PRD sections:
      - Upload messy company artifacts
      - Build the operating graph
      - Ask with citations
      - Generate agent skills
      - Catch broken knowledge
  - Connector cards section showing future integrations as
    Coming soon / Join waitlist
  - Mobile-friendly layout and clean launch-ready framing

  Defaults:

  - Try Acme Labs Demo links to /demo
  - Join Waitlist is a non-functional placeholder CTA for
    now, styled as secondary, with no backend submission
    logic in Session A

  ### Page scaffolds for demo/app tabs

  Each required route gets a PRD-shaped static scaffold
  with mock/demo content only.

  /demo

  - Primary CTA: Load Acme Labs Brain
  - Static progress cards for:
      - Documents processed
      - Chunks embedded
      - Entities extracted
      - Relationships created
      - Communities generated
      - Skills generated
      - Health flags detected
  - Static timeline log
  - Final “Acme Labs Brain Ready” state block

  /ask

  - Two-column layout:
      - Left: prompt buttons and answer area
      - Right: citations and related graph nodes
  - Include all five required demo prompt buttons from the
    PRD
  - Static answer card structure with:
      - Answer
      - Confidence pill
      - Citations
      - Related nodes
      - Missing info
      - Suggested skill

  /graph

  - Full React Flow page scaffold with:
      - Typed demo nodes/edges
      - Controls, minimap, fit view
      - Filter chips for all PRD node categories
      - Right-side node drawer shell that opens from local
        UI state only
  - TeraCorp refund workflow is the visible hero graph
    center

  /skills

  - Static list/detail shell with the five required demo
    skills
  - Card fields:
      - Name
      - Trigger
      - Status
      - Confidence
      - Approval
      - Sources
  - Detail panel fields from the PRD, including allowed/
    forbidden actions and export button shell

  /health

  - Static grouped severity sections:
      - Critical
      - Warning
      - Info
  - Demo cards for PRD health types:
      - conflict
      - missing_owner
      - stale_skill
      - low_confidence
      - unapproved_skill
      - customer_risk
  - Each card includes severity, description, related
    nodes, evidence snippets, and suggested fix shell

  ### Typed client boundaries and env structure

  Add clear typed frontend boundaries without implementing
  live business logic:

  - Shared TypeScript types for:
      - demo ingestion metrics
      - ask answer card
      - graph nodes/edges
      - skill summaries/details
      - health flags
      - worker health/connectors
  - A typed worker client module for calling FastAPI
    endpoints later
  - A typed app API client module for local Next.js API
    routes later
  - Mock data lives behind typed adapters, not directly
    inside pages where avoidable

  Env and server/client boundaries:

  - Keep env validation centralized
  - Keep Neo4j credentials server-only
  - Keep service-role usage server-only
  - Do not expose DB credentials or pretend DB setup is
    complete
  - Mark DB-backed checks as deferred in UI copy where
    relevant

  ### FastAPI worker scaffold cleanup

  Keep the worker as scaffold-only for Session A, but
  align it to the frontend shell:

  - Preserve /worker/health
  - Preserve /worker/health/connectors
  - Keep stub routes for ingest/GraphRAG/skills/health
    generation
  - Ensure response shapes are simple and typed for later
    client use
  - Do not add GraphRAG, ingestion, or database write
    logic in this session

  ## Important Interface Additions

  Frontend route interfaces:

  - Add page-level UI contracts for DemoMetrics,
    AskAnswer, GraphNodeData, SkillCard, SkillDetail, and
    HealthFlag

  Typed API client interfaces:

  - workerClient.getHealth()
  - workerClient.getConnectorHealth()
  - workerClient.loadDemo() as a typed placeholder
    returning mocked or stubbed shape for now
  - appHealthClient.getStatus() for /api/health

  UI state interfaces:

  - graph filter state
  - selected graph node state
  - selected skill state
  - active demo prompt state

  These should be explicit TypeScript types/interfaces,
  even if backed by static data in Session A.

  ## Test Plan

  Verification for this session:

  - npm.cmd run build succeeds for the web app
  - Python compile/import check succeeds for the worker
  - Each route renders without runtime errors:
      - /
      - /demo
      - /ask
      - /graph
      - /skills
      - /health
  - Navigation works across all routes
  - React Flow page renders with demo nodes, filters, and
    node drawer shell
  - All five required Ask prompts are visible
  - All five required demo skills are visible
  - Health page shows grouped severities and
    representative flag cards
  - /api/health remains reachable
  - /worker/health and /worker/health/connectors remain
    reachable
  - No server-only env values are imported into client
    components

  Acceptance criteria:

  - A stranger can open / and understand the product in
    about 10 seconds
  - The product shell visibly prioritizes graph + skills
    over chat
  - The app feels like a real product skeleton, not a
    generic starter
  - No business logic is implied as complete where it is
    actually deferred

  ## Assumptions and Defaults

  - Real Supabase and Neo4j connections are deferred to a
    later step; Session A will only preserve env schema
    and typed connector surfaces
  - No auth flow, RLS implementation, uploads, or waitlist
    backend is added in this session
  - Demo data is hardcoded/static, because the spec
    explicitly says not to implement business logic yet
  - The landing page uses the PRD’s tagline, hero copy,
    Acme Labs demo CTA, and connector-preview framing
  - /health is a product page route distinct from /api/
    health
  - The current existing /api/health route remains as an
    infrastructure endpoint and is not treated as
    fulfilling the page-route requirement

  ## Global Design Token and Typography Rollout

  Extract the screenshot system into global tokens and
  apply it consistently across landing and app pages.

  Design tokens to implement globally:

  - Background base: #0D0D0D
  - Text primary: #FFFFFF
  - Text secondary: rgba(255,255,255,0.5)
  - Surface: near-black cards on black background, with
    subtle 1px borders using low-opacity white
  - Accent gradient stops:
      - #FF00C1
      - #F200FF
      - #7A00F4
      - #0C00EA
      - #005EE3
      - #0DBFD7
      - #19CD88
      - #24C231
      - #76B82F
      - #AE9C2C
      - #B1532A
      - #B72727
      - #FF0000

  Typography system to implement:

  - Font family: Inter everywhere
  - Heading 01: 60 / 68 / -1, medium
  - Heading 02: 52 / 60 / -1, medium
  - Heading 03: 40 / 48 / -1, medium
  - Heading 04: 32 / 40 / -1, medium
  - Heading 05: 24 / 32 / -1, medium
  - Heading 06: 20 / 28 / -1, medium
  - Body XXL 300: 16 / 24 / 0, regular
  - Body XXL 400: 16 / 24 / 0, medium
  - Body XL 300: 16 / 24 / 0, semibold
  - Body Large 300: 14 / 22 / 0, regular
  - Body Large 400: 14 / 22 / 0, semibold

  Implementation approach:

  - Define all typography, color, radius, border, and
    gradient tokens as CSS custom properties in the global
    stylesheet
  - Add semantic utility classes or Tailwind theme aliases
    for:
      - page background
      - elevated surface
      - primary text
      - muted text
      - gradient stroke
      - heading-01 through heading-06
      - body-xxl-300, body-xxl-400, body-xl-300, body-lg-
        300, body-lg-400
  - Keep these semantic names stable and avoid hardcoding
    raw sizes/colors in page components

  Global page application rules:

  - Landing page hero uses Heading 01 on desktop, stepping
    down responsively to Heading 03 or Heading 04 on
    mobile
  - Section headings use Heading 04 or Heading 05
  - App page titles use Heading 04
  - Card titles use Heading 06
  - Primary body copy uses Body XXL 300
  - Labels, metadata, pills, and filter controls use the
    14/22 body styles
  - Use the white-50 token for supportive copy, hints, and
    inactive nav items

  Component styling rules derived from the screenshots:

  - Buttons should be pill-shaped with large horizontal
    padding
  - Primary dark button: charcoal fill on dark background
    with white text
  - Gradient-accent button: dark interior with multicolor
    gradient border stroke
  - Icon-only button: circular dark surface
  - Cards and panels: rounded dark surfaces with subtle
    borders, not bright shadows
  - Use restrained contrast and large negative space;
    avoid light-theme sections in this pass

  - Apply tokens to globals.css first
    system, with drawer/cards matching the rest of the app

  Validation:

  - Confirm every page uses the same black background,
    white/white-50 text hierarchy, and Inter typescale
  - Confirm no route introduces ad hoc colors or font
    sizes outside the token system
  - Confirm the gradient accent appears only in strategic
    CTAs and highlights, not everywhere