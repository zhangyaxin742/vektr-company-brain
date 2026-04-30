# Vektr Project Memory

Vektr is a sprint-built "company brain for AI agents." Its purpose is to turn scattered internal artifacts into a living operating graph, citation-backed answers, executable skill files, and proactive knowledge health checks so agents can act with evidence and approval gates instead of guessing from docs.

The PRD's sprint stack is a split web-plus-worker architecture: a Next.js App Router frontend in TypeScript, styled with Tailwind CSS and shadcn/ui, using React Flow for the operating graph canvas; a FastAPI Python worker for ingestion, GraphRAG, extraction, and graph import jobs; Supabase for auth, Postgres, storage, and vector-backed retrieval; and Neo4j AuraDB as the graph system of record.
