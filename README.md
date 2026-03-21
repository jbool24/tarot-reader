# Mystic Tarot Reader

An AI-powered tarot reading application built with Nuxt 3 and Claude (Anthropic). Ask a question, receive a mystical card reading drawn from the wisdom of the tarot — powered by Claude Sonnet on the server side.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Development Setup](#development-setup)
- [Production Deployment](#production-deployment)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)

---

## Overview

| Property | Value |
|---|---|
| Framework | Nuxt 3 (Vue 3 + Nitro) |
| AI Provider | Anthropic Claude (`claude-sonnet-4-20250514`) |
| Deployment target | Netlify (SSR via Netlify Functions) |
| Node version | 20 |
| Package manager | npm |

The application is stateless. Conversation history is held client-side only; there is no database or session store.

---

## Architecture

```
Browser (Vue 3 SPA)
  └── POST /api/tarot  (Nitro server route — runs as a Netlify Function in prod)
        └── Anthropic SDK  →  Claude Sonnet API
```

- **`pages/index.vue`** — full chat interface, animated tarot-themed UI
- **`server/api/tarot.post.ts`** — Nitro endpoint; calls Anthropic, returns `{ reply: string }`
- **`nuxt.config.ts`** — injects `ANTHROPIC_API_KEY` via `runtimeConfig` (server-only)

---

## Prerequisites

### All environments

| Tool | Minimum version | Install |
|---|---|---|
| Node.js | 20.x | [nodejs.org](https://nodejs.org) |
| npm | 9.x (bundled with Node 20) | — |
| Git | any recent version | — |

### Development only

| Tool | Purpose |
|---|---|
| Anthropic API key | Required for AI responses |

### Production (Netlify)

| Tool | Purpose |
|---|---|
| Netlify CLI or Netlify account | Deployment and environment variable management |
| Anthropic API key | Must be set as a Netlify environment variable |

---

## Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

### Variable reference

| Variable | Required | Description | Where to obtain |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | **Yes** | Authenticates requests to the Claude API | [console.anthropic.com](https://console.anthropic.com/) → API Keys |

> **Security note:** `ANTHROPIC_API_KEY` is consumed exclusively by the Nitro server layer via `runtimeConfig`. It is never exposed to the browser. Do not prefix it with `NUXT_PUBLIC_`.

### `.env` file (development)

```dotenv
# .env  — never commit this file
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxx
```

The `.env` file is loaded automatically by Nuxt in development. It is listed in `.gitignore` and must never be committed.

---

## Development Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd tarot-reader
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env and set ANTHROPIC_API_KEY
```

### 4. Start the dev server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

Hot module replacement (HMR) is enabled. Changes to Vue components and server routes take effect immediately without a full restart.

### 5. Verify the API is working

```bash
curl -X POST http://localhost:3000/api/tarot \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "What does my day hold?"}]}'
```

Expected response shape:

```json
{ "reply": "The cards speak..." }
```

### Dev container (optional)

A pre-configured VS Code dev container is included at `.devcontainer/`. It installs Node 20, the Netlify CLI, and the Claude Code CLI automatically. Open the repo in VS Code and select **Reopen in Container** when prompted.

---

## Production Deployment

The application is configured for **Netlify** via `nitro.preset: 'netlify'` in `nuxt.config.ts`. The Nuxt build produces a static frontend and a Netlify Function for the `/api/tarot` server route.

### Option A — Deploy via Netlify UI

1. Push the repository to GitHub/GitLab.
2. In the Netlify dashboard, select **Add new site → Import an existing project**.
3. Connect your repository.
4. Confirm the build settings match the table below (Netlify usually detects them automatically):

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Publish directory | `dist` |
| Node version | `20` |

5. Add the environment variable under **Site settings → Environment variables**:

| Key | Value |
|---|---|
| `ANTHROPIC_API_KEY` | `sk-ant-xxxxxxxxxxxxxxxxxxxx` |

6. Trigger a deploy.

### Option B — Deploy via Netlify CLI

```bash
# Install the CLI if not already present
npm install -g netlify-cli

# Authenticate
netlify login

# Link to an existing site or create a new one
netlify init

# Set the environment variable (one-time)
netlify env:set ANTHROPIC_API_KEY sk-ant-xxxxxxxxxxxxxxxxxxxx

# Build and deploy to production
npm run build
netlify deploy --prod --dir dist
```

### Build verification

After a successful build the `dist/` directory should contain:

```
dist/
├── _nuxt/          # Client-side JS and CSS chunks
├── netlify/
│   └── functions/  # Server-side Netlify Function (tarot API)
└── index.html      # Entry point for the SPA
```

### Preview a production build locally

```bash
npm run build
npm run preview
```

The preview server runs the Nitro output locally, behaving identically to the Netlify Function environment. Environment variables from `.env` are still used in this mode.

---

## Project Structure

```
tarot-reader/
├── pages/
│   └── index.vue              # Main UI — chat interface, animations, styling
├── server/
│   └── api/
│       └── tarot.post.ts      # POST /api/tarot — Anthropic integration
├── app.vue                    # Root component (renders <NuxtPage />)
├── nuxt.config.ts             # Nuxt config — fonts, runtimeConfig, Nitro preset
├── package.json               # Dependencies and npm scripts
├── netlify.toml               # Netlify build settings
├── .env.example               # Environment variable template
└── tsconfig.json              # TypeScript config
```

---

## API Reference

### `POST /api/tarot`

Sends a conversation to Claude and returns a tarot reading.

**Request body**

```json
{
  "messages": [
    { "role": "user", "content": "What does my love life hold?" }
  ]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `messages` | `array` | Yes | Conversation history. Each item must have `role` (`"user"` or `"assistant"`) and `content` (string). |

**Success response — `200 OK`**

```json
{ "reply": "The Lovers card appears before you..." }
```

**Error responses**

| Status | Condition |
|---|---|
| `400 Bad Request` | `messages` is missing or empty |
| `500 Internal Server Error` | `ANTHROPIC_API_KEY` not configured, or upstream API failure |

---

## Troubleshooting

### "The cards are silent..." response in production

The fallback message is returned when the Anthropic API response contains no text content. Check:

1. `ANTHROPIC_API_KEY` is set in Netlify environment variables.
2. The API key has sufficient quota and is active at [console.anthropic.com](https://console.anthropic.com/).
3. The Netlify Function logs under **Functions → tarot** for upstream error details.

### `ANTHROPIC_API_KEY` not found error on startup

Ensure the variable is defined before starting the server:

```bash
# Verify the variable is present in your shell / .env
echo $ANTHROPIC_API_KEY

# Or check .env directly
grep ANTHROPIC_API_KEY .env
```

In development, Nuxt reads `.env` from the project root automatically. The variable does **not** need to be exported in your shell.

### Build fails with `Cannot find module` errors

```bash
# Delete build artefacts and reinstall
rm -rf .nuxt dist node_modules
npm install
npm run build
```

### Port 3000 already in use

```bash
# Start dev server on a different port
npm run dev -- --port 3001
```

### Netlify Function cold-start timeouts

The default Netlify Function timeout is 10 seconds. Claude Sonnet responses are typically well within this limit (1–4 seconds), but if you see timeout errors under load, increase the timeout in `netlify.toml`:

```toml
[functions]
  included_files = ["dist/server/**"]

[[headers]]
  [headers.values]
    X-Frame-Options = "DENY"
```

Netlify Background Functions (async) can be enabled for timeouts up to 15 minutes, but are not required for this workload.
