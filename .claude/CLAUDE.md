# Agent Suite — Project Context

## Overview

AI Backend-as-a-Service (AI-BaaS) platform — "Firebase for AI agents." The engine handles orchestration, routing, memory, security, and workflows while treating LLM models and UIs as interchangeable peripherals. Local-first deployment model where each client gets an isolated stack. Built for a small development studio (DreamRock SmartTech) with future SME client deployments (5-30 person teams).

## Strategic Pivot (Feb 2026)

**Decision:** Adopt LangChain DeepAgents (TypeScript) as the agent execution harness instead of building custom executor primitives from scratch. DeepAgents provides planning, sub-agent spawning, context management, memory backends, HITL, and streaming — all things we were building manually.

**Rationale:** Our value is the platform (API, workflows, deployment, admin UI), not the agent execution primitives. DeepAgents gives us a production-tested "crate engine" so we can focus on building the car. We can always rewrite the adapter layer later for full proprietary ownership.

**Anti-corruption principle:** DeepAgents and all `@langchain/*` imports are isolated behind owned interfaces in a single adapter layer. The rest of Agent Suite never imports from LangChain directly. If we need to go fully custom later, we rewrite only the adapter — nothing else changes.

## Core Principles

- **Vendor neutrality above all** — Abstraction layers treat external services as interchangeable components. This now applies to DeepAgents/LangGraph the same way it applied to Vercel AI SDK.
- **Interface-first, adapter-second** — Define contracts (types.ts) before writing any implementation. Adapters implement the contract and are the ONLY place vendor libraries get imported.
- **Configuration over code** — Agents defined as typed configs, prompts as Markdown files
- **Workflows as data** — JSON definitions, git-tracked, migratable
- **Functional/procedural style** — Avoid OOP; prefer explicit types and pure functions
- **Defer complexity** — Start simple, add sophistication only when required
- **Prototype fast, replace later** — Use DeepAgents to demo, rewrite adapter if/when needed

## Technology Stack

| Component        | Choice                                      | Notes                                  |
| ---------------- | ------------------------------------------- | -------------------------------------- |
| Runtime          | Deno 2.6+                                   | Use `npm:` specifier for Node packages |
| Language         | TypeScript (strict mode)                    |                                        |
| Agent Harness    | DeepAgents.js (`npm:deepagents`)            | Behind adapter interface               |
| Agent Runtime    | LangGraph.js (`npm:@langchain/langgraph`)   | Pulled in by DeepAgents                |
| LLM Integration  | `@langchain/anthropic`, `@langchain/openai` | Via DeepAgents model param             |
| Local Inference  | Ollama (via LangChain adapter)              |                                        |
| Production LLM   | Anthropic Claude                            |                                        |
| State Management | Redis (StateStore, distributed locking)     |                                        |
| Identity         | Keycloak                                    |                                        |
| Workflow Engine  | Custom (simplified) — replaces n8n          | Steps call orchestrator.invoke()       |
| API Framework    | Hono                                        |                                        |
| Validation       | Zod                                         |                                        |
| UI               | Vue/Nuxt                                    |                                        |
| IaC              | OpenTofu                                    |                                        |
| Proxy/TLS        | Traefik                                     |                                        |

### Removed/Deprecated from Stack

| Component           | Status         | Reason                                                        |
| ------------------- | -------------- | ------------------------------------------------------------- |
| Vercel AI SDK       | **Replaced**   | DeepAgents uses LangChain model adapters directly             |
| n8n                 | **Replaced**   | Custom workflow engine; steps call orchestrator interface     |
| Custom Worker Pool  | **Deprecated** | LangGraph runtime handles execution, checkpointing, isolation |
| Custom Agent Worker | **Deprecated** | DeepAgents `createDeepAgent()` replaces this                  |
| Custom LLM Proxy    | **Deprecated** | LangChain handles LLM calls within the agent graph            |

## Architecture Model

```
┌─────────────────────────────────────────────┐
│  Agent Suite API  (Hono REST — we own)      │  ← Our code, unchanged
├─────────────────────────────────────────────┤
│  Orchestrator Interface Layer               │  ← Our contracts (types.ts)
│  AgentOrchestrator, WorkflowRunner,         │
│  MemoryBackend, ExecutionTrace              │
├─────────────────────────────────────────────┤
│  DeepAgents Adapter                         │  ← Implements our interfaces
│  (ONLY file that imports from langchain/*)  │     using DeepAgents/LangGraph
├─────────────────────────────────────────────┤
│  DeepAgents / LangGraph.js                  │  ← Library (replaceable)
└─────────────────────────────────────────────┘
```

Key architectural rules:

- **Adapter boundary is sacred** — `deepagents` and `@langchain/*` imports appear ONLY in files under `src/core/orchestrator/adapters/`. Nowhere else in the codebase.
- **Planner-first routing** with task decomposition (now via DeepAgents planning tool)
- **MCP protocol** for tool integration (DeepAgents supports MCP via langchain-mcp-adapters)
- **Microkernel architecture** — modules declare dependencies, compose at application root
- **Event-driven communication** between modules
- Design for evolution: swap adapter to go fully custom with zero impact on API/UI/workflows

## Directory Structure

```
.claude/
├── CLAUDE.md              # This file - project context
├── settings.json          # Permissions and configuration
├── rules/                 # Coding conventions (enforced)
│   ├── 01-type-organization.md
│   ├── 02-interface-driven-design.md
│   └── 03-test-driven-development.md
└── skills/                # Workflow skills (activated on demand)
    └── quality-control.md # Code review & MR preparation

docs/decisions/            # Architecture Decision Records (ADRs)
├── TEMPLATE.md            # Decision record template
└── YYYYMMDD-HHMMSS-*.md   # Timestamped decisions
```

## Source Directory Structure (Target State)

```
src/
├── agents/                    # Agent definitions (KEEP — configs + prompts)
│   ├── index.ts               # Agent registry and loader
│   ├── types.ts               # AgentDefinition type (extended)
│   └── *.agent.ts             # Per-agent config files
│
├── api/                       # REST API layer (KEEP — unchanged)
│   ├── routes/                # Hono route handlers
│   ├── middleware/             # Logging, error handling, validation
│   └── schemas/               # Zod request/response schemas
│
├── core/
│   ├── orchestrator/          # NEW — replaces executor/
│   │   ├── types.ts           # AgentOrchestrator, WorkflowRunner interfaces
│   │   ├── factory.ts         # Creates orchestrator from AgentDefinition
│   │   └── adapters/
│   │       └── deepagents.adapter.ts  # THE adapter (only LC import point)
│   │
│   ├── workflow/              # NEW — simplified custom workflow engine
│   │   ├── types.ts           # WorkflowDefinition, Step, Transition
│   │   ├── runner.ts          # Executes workflows via orchestrator
│   │   └── store.ts           # CRUD for workflow definitions
│   │
│   ├── memory/                # NEW — pluggable memory interface
│   │   ├── types.ts           # MemoryBackend interface
│   │   └── adapters/
│   │       └── langgraph-store.adapter.ts
│   │
│   ├── telemetry/             # KEEP — structured logging, audit trail
│   ├── config/                # KEEP — configuration loading
│   ├── secrets/               # KEEP — secret management
│   ├── chat/                  # KEEP — but refactor to use orchestrator interface
│   ├── conversation/          # KEEP
│   ├── identity/              # KEEP
│   │
│   ├── executor/              # DEPRECATED — replaced by orchestrator/
│   ├── llm/                   # DEPRECATED — DeepAgents handles LLM calls
│   ├── orchestration/         # DEPRECATED — replaced by workflow/
│   └── tools/                 # REFACTOR — tool types stay, implementations
│                              #   convert to LangChain tool() interface
│
├── tools/                     # Tool implementations (REFACTOR to LC tool interface)
└── prompts/                   # Agent system prompts (KEEP — Markdown files)
```

## What's Preserved vs. Deprecated

### KEEP (still valuable)

- API layer (Hono routes, middleware, schemas)
- Agent definitions (configs + markdown prompts)
- Chat service (refactor to call orchestrator instead of executor)
- Telemetry/audit (structured logging, lifecycle hooks)
- Configuration and secrets modules
- Identity (Keycloak integration)
- All infrastructure (Docker, IaC, Traefik)
- Test infrastructure and patterns
- Path alias system

### DEPRECATED (replaced by DeepAgents/LangGraph)

- `src/core/executor/` — worker pool, agent worker, worker executor bridge
- `src/core/llm/` — Vercel AI SDK adapters, provider abstraction
- `src/core/orchestration/` — custom plan executor
- `src/core/tools/registry.ts` — tool registry (replace with LangChain tool registration)
- Output validation framework (Phase 2.1) — reimplement as guardrail nodes in graph
- n8n workflows and integration

### REFACTOR (adapt to new interfaces)

- `src/core/chat/service.ts` — replace `executeAgent()`/`executeAgentInWorker()` calls with `orchestrator.invoke()`
- `src/tools/*.ts` — convert to LangChain `tool()` interface with Zod schemas
- `src/agents/*.agent.ts` — extend AgentDefinition type for DeepAgents params

## Implementation Priorities

### Phase A: Spike & Validate (Current)

1. Verify DeepAgents.js works on Deno 2.6+ via `npm:` imports
2. Create one agent with a custom tool end-to-end
3. Test checkpointing, streaming, sub-agent spawning
4. Document any Deno compatibility issues

### Phase B: Interface Contracts

1. Define `src/core/orchestrator/types.ts` — AgentOrchestrator, WorkflowRunner
2. Define `src/core/memory/types.ts` — MemoryBackend
3. Define extended AgentDefinition type
4. These interfaces are the most important artifacts — get them right

### Phase C: Adapter & Migration

1. Implement `deepagents.adapter.ts` wrapping `createDeepAgent()`
2. Implement `langgraph-store.adapter.ts` for memory
3. Refactor chat service to use orchestrator interface
4. Convert 2-3 tools to LangChain tool() interface
5. Wire up API routes to new orchestrator

### Phase D: Workflow Engine

1. Implement simplified workflow runner (steps call orchestrator.invoke())
2. JSON workflow definitions with conditional transitions
3. Migrate one real workflow end-to-end

### Phase E: Demo

1. End-to-end demo workflow (e.g., sprint planning)
2. Multiple agents collaborating via sub-agent spawning
3. HITL approval gate demo
4. Admin UI showing execution traces

## Deno Compatibility Notes

DeepAgents.js is an npm package targeting Node.js. Import via `npm:` specifier:

```json
{
  "imports": {
    "deepagents": "npm:deepagents@^1.7.0",
    "@langchain/langgraph": "npm:@langchain/langgraph@^0.2.0",
    "@langchain/anthropic": "npm:@langchain/anthropic@^0.3.0"
  }
}
```

**Known risk:** LangGraph.js uses `AsyncLocalStorage` for context propagation. Test early on Deno's Node compatibility layer. If issues arise, fallback is running orchestration as a Node subprocess behind the same interface.

## Skills

Skills are workflow-specific guides activated for particular tasks:

- **quality-control** — Code review, MR preparation, branching strategy

## Key Rules

1. **Never import `deepagents` or `@langchain/*` outside of `src/core/orchestrator/adapters/` or `src/core/memory/adapters/`**
2. All agent execution goes through the `AgentOrchestrator` interface
3. All memory access goes through the `MemoryBackend` interface
4. Write interface types.ts BEFORE any adapter implementation
5. Tests for adapters mock at the interface boundary, not at the library level
6. ADR required for any architectural decision that affects the adapter boundary
