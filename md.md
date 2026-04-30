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

      # Session A Plan: Database + RLS + Auth
  Vertical Slice

  ## Summary

  Current anchors:

  - PRD schema and deliverables live in /abs/
    path/C:/Users/user/Desktop/vektr-company-
    brain/vektr_24h_sprint_prd.md:578, /abs/path/
    C:/Users/user/Desktop/vektr-company-brain/
    vektr_24h_sprint_prd.md:1139, and /abs/path/
    C:/Users/user/Desktop/vektr-company-brain/
    vektr_24h_sprint_prd.md:1414.
  - The only Supabase server code today is a
    service-role admin client in /abs/path/C:/
    Users/user/Desktop/vektr-company-brain/apps/
    web/src/lib/supabase/server.ts:1.
  - There is no supabase/ directory, no
    migrations, no SSR auth client, no proxy.ts,
    and no lib/server/db DAL yet.

  Plan intent:

  - Implement the PRD tables plus production-
    grade constraints, indexes, helper functions,
    RLS, and a match_chunks RPC.
  - Add real Supabase SSR auth for Next.js 16
    with proxy.ts, magic-link sign-in, protected
    product routes, and org-scoped server-only
    data access.
  - Use URL slug as the active org context and
    keep compatibility by redirecting legacy
    product routes to the user’s default org
    route.

  Research-based additions beyond the PRD:

  - Add pgcrypto for UUID defaults alongside
    vector.
  - Use check constraints, not null, JSON/array
    defaults, updated_at trigger, and targeted
    indexes for RLS performance.
  - Put membership helper functions in a non-
    exposed schema with hardened function
    privileges.
  - Keep match_chunks as security invoker so RLS
    still applies; explicitly revoke default
    function execution and grant only what is
    needed.
  - Replace the current service-role-first app
    pattern with user-scoped SSR clients for
    reads; reserve service role for admin/worker
    paths only.

  ## Action Items

  1. Create the Supabase project structure in-
     repo.
      - Add supabase/migrations/ for SQL
        migrations.
      - Add a local docs note or README section
        covering supabase db push / supabase
        migration up usage.
      - Add generated DB types output path in the
        web app, for example apps/web/src/lib/
        supabase/database.types.ts.
  2. Add the foundational extensions and schemas.
      - Create a first migration enabling
        pgcrypto and vector.
      - Create a non-exposed helper schema such
        as private.
      - Set default privileges so new public
        functions are not executable by anon/
        authenticated unless explicitly granted.
  3. Create the seven PRD tables with production-
     safe defaults.
      - organizations
      - memberships
      - documents
      - chunks
      - skills
      - health_flags
      - ask_logs
      - Use uuid primary key default
        gen_random_uuid().
      - Use created_at default now() everywhere
        and updated_at default now() where
        mutable.
      - Use metadata jsonb not null default
        '{}'::jsonb and array fields with empty-
        array defaults where appropriate.
      - Add not null to all required PRD columns
        instead of leaving shape loose.
  4. Add relational integrity and lifecycle
     rules.
      - memberships.org_id -> organizations.id
        with on delete cascade.
      - documents.org_id -> organizations.id with
        on delete cascade.
      - chunks.org_id -> organizations.id and
        chunks.document_id -> documents.id with
        on delete cascade.
      - skills.org_id, health_flags.org_id,
        ask_logs.org_id all reference
        organizations.id with on delete cascade.
      - memberships.user_id and ask_logs.user_id
        reference auth.users(id).
      - Add a consistency trigger on chunks to
        ensure the referenced document belongs to
        the same org_id.
  5. Add robustness constraints the PRD implies
     but does not spell out.
      - Unique organizations.slug.
      - Unique memberships (org_id, user_id).
      - Unique chunks (document_id, chunk_index).
      - Unique skills (org_id, slug, version) or,
        if versioning stays single-current for
        now, unique (org_id, slug).
      - Check constraints for:
          - membership role: owner | admin |
            member
          - document source_type: slack_json |
            email_json | markdown | text | pdf |
            demo_seed
          - skill status: draft | approved |
            rejected
          - health severity: info | warning |
            critical
          - health type: conflict | missing_owner
            | stale_skill | low_confidence |
            unapproved_skill | customer_risk
          - health status: open | dismissed |
            resolved
          - confidence ranges such as 0 <=
            confidence <= 1
  6. Add indexes required for both app queries
     and RLS performance.
      - B-tree indexes on all policy/filter
        columns: org_id, user_id, and common sort
        columns like created_at.
      - Composite indexes:
          - memberships (user_id, org_id)
          - documents (org_id, created_at desc)
          - chunks (org_id, document_id)
          - skills (org_id, status, updated_at
            desc)
          - health_flags (org_id, status,
            severity, created_at desc)
          - ask_logs (org_id, user_id, created_at
            desc)
      - Vector index on chunks.embedding using
        cosine distance, partial on non-null
        embeddings.
      - Start with HNSW for production-readiness
        unless Supabase project/version blocks
        it; otherwise fall back to IVFFlat.
  7. Add timestamp maintenance.
      - Create one reusable trigger function to
        set updated_at = now().
      - Attach it to organizations, documents,
        skills, and health_flags.
  8. Implement RLS helper functions in private.
      - private.is_authenticated() or inline
        (select auth.uid()) is not null.
      - private.is_org_member(target_org_id uuid)
        returns boolean.
      - private.is_org_admin(target_org_id uuid)
        returns boolean.
      - private.is_org_owner(target_org_id uuid)
        returns boolean.
      - Make these security definer, set
        search_path = '', schema-qualify all
        relations, and keep them out of exposed
        schemas.
  9. Enable RLS on every exposed table.
      - Explicitly enable row level security on
        all seven public tables.
      - Do not rely on dashboard defaults.
      - Do not use permissive “authenticated can
        read all” shortcuts.
  10. Create the policies.

  - organizations: members can select; admins/
    owners can update; inserts/deletes remain
    server-managed for now.
  - memberships: org members can select
    memberships in their org; only owners/admins
    can insert/update/delete memberships.
  - documents: org members can select; writes
    limited to admins/owners or server-managed
    ingestion paths.
  - chunks: org members can select; writes
    limited to admins/owners or ingestion paths.
  - skills: org members can select; admins/owners
    can update approval/status fields; creation
    stays server/worker managed.
  - health_flags: org members can select; admins/
    owners can update resolution fields; creation
    stays server/worker managed.
  - ask_logs: org members can insert rows only
    for user_id = auth.uid() in orgs they belong
    to; users can read their own ask logs;
    admins/owners can read org logs if desired
    for audit.
  - Use to authenticated and (select auth.uid())
    patterns for policy performance.

  11. Create match_chunks RPC.

  - Signature should accept target_org_id uuid,
    query_embedding vector(1536), match_count
    integer, and optional similarity threshold.
  - Return chunk id, document id, content,
    metadata, similarity score, and optionally
    document title/source_type.
  - Filter by org_id = target_org_id.
  - Keep function security invoker so table RLS
    still applies.
  - Revoke execute from public and anon; grant
    execute to authenticated only.

  12. Add generated DB types.

  - Generate TypeScript database types from the
    Supabase schema after migrations.
  - Wire those types into the web DAL and
    Supabase clients so queries are typed.

  13. Replace the current Supabase client setup
     with SSR-safe separation.

  - Keep an admin client for server-only admin/
    worker operations, but rename it clearly to
    avoid accidental use in request-path reads.
  - Add a browser client using @supabase/ssr.
  - Add a server request client that reads/writes
    auth cookies.
  - Remove the assumption that normal page loads
    use the service role key.

  14. Add Next.js 16 auth session refresh via
     proxy.ts.

  - Create proxy.ts at the app root for Supabase
    cookie refresh.
  - Match product and auth routes only.
  - Keep the proxy thin: token refresh and
    redirect decisions only, no DAL work.

  15. Add the minimal auth flow for this slice.

  - Add magic-link sign-in page and sign-out
    action.
  - Add callback/verification route if needed by
    the chosen Supabase flow.
  - Add protected product access: unauthenticated
    users are redirected to sign-in.

  16. Add org-scoped routing and compatibility
     redirects.

  - Adopt /org/[slug]/ask, /org/[slug]/graph, /
    org/[slug]/skills, /org/[slug]/health.
  - Keep existing /ask, /graph, /skills, /health
    as redirects to the user’s default org.
  - Default org selection = first membership by
    creation date only for redirect
    bootstrapping; once redirected, all app reads
    are explicitly slug-scoped.

  17. Build the server-only DAL in apps/web/src/
     lib/server/db.

  - Modules from the PRD:
      - orgs.ts
      - documents.ts
      - chunks.ts
      - skills.ts
      - health.ts
      - graph.ts stubbed if graph DB work is not
        in this slice
  - Each function must:
      - create a request-scoped Supabase server
        client
      - call auth.getUser() and fail closed if
        missing
      - resolve org by slug
      - verify membership
      - select only needed columns
      - validate inbound params with Zod
      - never expose service-role credentials or
        raw internal metadata
  - Add one shared helper for “load current user
    + org membership by slug”.

  18. Define the initial DAL surface needed to
     satisfy the deliverable.

  - getAccessibleOrganizationsForUser()
  - getOrganizationBySlug(slug)
  - getWorkspaceDocuments(orgSlug)
  - getWorkspaceSkills(orgSlug)
  - getWorkspaceHealthFlags(orgSlug)
  - searchChunks(orgSlug, embedding, count,
    threshold?) via match_chunks
  - createAskLog(orgSlug, payload) with self-user
    enforcement
  - This is enough for “authenticated user can
    load workspace data” without overbuilding the
    rest of the app.

  19. Update env validation and naming.

  - Keep NEXT_PUBLIC_SUPABASE_URL and
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
  - Keep SUPABASE_SERVICE_ROLE_KEY server-only
    and mark it optional-but-dangerous in docs.
  - Add any auth callback base URL or site URL
    config required by Supabase magic links.
  - Update env validation to distinguish browser-
    safe keys from server-only keys.

  20. Add verification coverage for the slice.

  - SQL verification queries for same-user/same-
    org reads and cross-org denials.
  - App-level checks for unauthenticated
    redirect, authenticated load, and org slug
    access control.
  - One DAL test path proving a user cannot read
    another org even if they guess its slug.
  - One RPC test proving match_chunks only
    returns chunks from the requested org.

  ## Public Interfaces / Types

  - New database objects:
      - Public tables: organizations,
        memberships, documents, chunks, skills,
        health_flags, ask_logs
      - Public RPC: public.match_chunks(...)
      - Private helpers:
        private.is_org_member(...),
        private.is_org_admin(...),
        private.is_org_owner(...)
  - New app route shape:
      - /org/[slug]/ask
      - /org/[slug]/graph
      - /org/[slug]/skills
      - /org/[slug]/health
      - /auth/sign-in
  - New server-only modules:
      - apps/web/src/lib/server/db/*
  - New generated types:
      - apps/web/src/lib/supabase/
        database.types.ts

  ## Test Plan

  1. Migration test: a clean Supabase database
     can apply all migrations without manual SQL
     fixes.
  2. Auth test: unauthenticated request to any /
     org/[slug]/* product route redirects to
     sign-in.
  3. Membership test: authenticated user can load
     org rows only for orgs they belong to.
  4. Cross-org denial test: authenticated user
     cannot read another org’s documents, chunks,
     skills, health_flags, or ask_logs.
  5. Policy write test: non-admin member cannot
     create memberships or mutate approval/status
     fields they should not control.
  6. Ask-log test: a user can insert an ask log
     only with their own user_id and only inside
     a joined org.
  7. RPC test: match_chunks returns ranked rows
  8. Redirect test: legacy /ask and /skills
  - PRD remains the source of truth for table
    names and core fields; this plan adds
    constraints, indexes, and auth architecture
    needed for production-readiness.
  - Embeddings stay at vector(1536) per PRD for
    the first slice.
  - Initial auth flow is Supabase magic link.
  - Active org is chosen by URL slug; legacy
    routes redirect to the user’s default org.
  - Org creation and ingestion writes are server-
    managed in this slice, not user-self-service.
  - match_chunks uses cosine similarity and
    returns citation-ready chunk rows.
