# Documentation Sync Conventions

All code changes must keep documentation in sync across three layers: **inline docstrings**, the **doc site**, and **diagrams**.

## Layer 1: Inline Docstrings (JSDoc)

### What Gets Documented

Every **exported** function, interface, type, and class must have a JSDoc docstring. Internal/private helpers do not require docstrings unless the logic is non-obvious.

### File-Level Docstring

New modules should have a `@module` docstring at the top of the file:

```typescript
/**
 * @module orchestrator/factory
 *
 * Creates AgentOrchestrator instances from AgentDefinition configs.
 * This is the entry point for wiring agent definitions to the adapter layer.
 */
```

### Function Docstrings

```typescript
/**
 * Creates an AgentOrchestrator from the given agent definition.
 *
 * @param definition - The agent configuration to build from
 * @param options - Optional overrides for model, memory backend, etc.
 * @returns A configured AgentOrchestrator ready to invoke
 *
 * @example
 * ```ts
 * const orchestrator = createOrchestrator(agentDef);
 * const result = await orchestrator.invoke({ input: "Plan a sprint" });
 * ```
 */
export function createOrchestrator(
  definition: AgentDefinition,
  options?: OrchestratorOptions,
): AgentOrchestrator {
  // ...
}
```

### Interface/Type Docstrings

```typescript
/**
 * Core orchestration contract. All agent execution flows through this interface.
 * Implementations live in `src/core/orchestrator/adapters/`.
 */
export interface AgentOrchestrator {
  /** Execute the agent with the given input and return a result. */
  invoke(input: InvokeInput): Promise<InvokeResult>;

  /** Stream execution events as they occur. */
  stream(input: InvokeInput): AsyncIterable<ExecutionEvent>;
}
```

### Rules

- Use `@param`, `@returns`, `@throws`, `@example` tags as appropriate
- Keep descriptions concise — one sentence for simple functions, a short paragraph for complex ones
- Do NOT add docstrings to unexported/internal functions unless the logic is non-obvious
- Do NOT add docstrings to trivially obvious getters/setters

---

## Layer 2: Doc Site (`docs/docs-site/`)

The doc site is a set of static HTML pages that provide a high-level view of the project for stakeholders and new developers.

### Current Pages

| Page                        | Content                              | Update When                                |
| --------------------------- | ------------------------------------ | ------------------------------------------ |
| `index.html`                | Executive summary, project goals     | Project scope or goals change              |
| `architecture.html`         | System architecture, component map   | Modules added/removed, layers restructured |
| `project-structure.html`    | Directory layout and file purposes   | New directories or major file moves        |
| `development-phases.html`   | Phase milestones and deliverables    | Phase scope or completion status changes   |
| `testing-strategy.html`     | TDD approach, coverage targets       | Testing approach or tooling changes        |
| `getting-started.html`      | Setup instructions, prerequisites    | Dependencies, setup steps, or env changes  |
| `business-requirements.html`| Functional/non-functional reqs       | Requirements change                        |
| `risk-mitigation.html`      | Risk assessment and mitigations      | New risks identified or mitigated          |
| `timeline.html`             | Timeline and milestones              | Schedule changes                           |

### How to Update

1. Read the existing page to understand current content
2. Edit the HTML directly — follow the existing structure and CSS classes
3. Keep the sidebar navigation (`<nav class="sidebar">`) consistent across all pages
4. If adding a new page, add it to the sidebar nav in **every** existing page

### Style Conventions

- Use existing CSS classes from `styles.css` (`.section`, `.highlight-card`, `.goal-card`, etc.)
- Keep content factual and concise — this is reference documentation, not marketing
- Use consistent heading hierarchy (`<h2>` for sections, `<h3>` for subsections)

---

## Layer 3: Diagrams (`docs/diagrams/`)

Diagrams are Mermaid files (`.mermaid`) that visualize system architecture and module relationships.

### Current Diagrams

| Diagram                                | Shows                                           | Update When                          |
| -------------------------------------- | ----------------------------------------------- | ------------------------------------ |
| `agent-suite-internal-diagram.mermaid` | Internal module structure and data flow          | Modules added, removed, or rewired   |
| `system-architecture-diagram.mermaid`  | Full deployment: layers, services, integrations  | Services or infrastructure changes   |

### How to Update

1. Read the existing diagram to understand current structure
2. Edit the `.mermaid` file directly
3. Follow existing conventions:
   - Use `flowchart TB` (top-to-bottom) layout
   - Group related nodes in `subgraph` blocks
   - Use consistent styling (colors match the existing palette)
   - Label connections with protocol or relationship type
4. Verify the diagram renders correctly (paste into a Mermaid live editor or use IDE preview)

### When to Create a New Diagram

Create a new `.mermaid` file when:

- A new subsystem is complex enough to warrant its own visual (e.g., workflow engine internals)
- A sequence of interactions needs to be documented (use `sequenceDiagram`)
- A state machine or lifecycle needs to be shown (use `stateDiagram-v2`)

### Naming Convention

```
docs/diagrams/{scope}-{description}.mermaid
```

Examples:
- `workflow-engine-state-machine.mermaid`
- `agent-execution-sequence.mermaid`
- `memory-backend-data-flow.mermaid`

### Diagram Styling

Follow the existing color palette:

| Subsystem          | Fill Color | Text Color |
| ------------------ | ---------- | ---------- |
| API Layer          | `#1e40af`  | `#fff`     |
| Agent Registry     | `#c2410c`  | `#fff`     |
| LLM / Orchestrator | `#6d28d9`  | `#fff`     |
| Executor / Core    | `#0369a1`  | `#fff`     |
| Tools Framework    | `#047857`  | `#fff`     |
| Tool Implementations | `#15803d`| `#fff`     |
| Support Modules    | `#475569`  | `#fff`     |
| External Services  | `#1e293b`  | `#e2e8f0`  |
| Outer Container    | `#0f172a`  | `#e2e8f0`  |

---

## Decision: What to Skip

Not every change needs all three layers updated. Use this guide:

- **Inline docstrings**: Always for new/changed exports. Skip for internal-only changes.
- **Doc site**: Only when the change affects architecture, structure, setup, or project scope. Skip for implementation-only changes within existing modules.
- **Diagrams**: Only when modules are added, removed, renamed, or their connections change. Skip for internal refactors that don't change the module graph.

When in doubt, update the docs. Stale documentation is worse than no documentation.
