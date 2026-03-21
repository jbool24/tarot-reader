ARG NODE_VERSION=20
FROM mcr.microsoft.com/devcontainers/typescript-node:${NODE_VERSION}

# Install Deno for the node user
USER node
RUN curl -fsSL https://deno.land/install.sh | sh
ENV DENO_INSTALL="/home/node/.deno"
ENV PATH="${DENO_INSTALL}/bin:${PATH}"

# Install Claude Code CLI globally for node user
RUN npm install -g @anthropic-ai/claude-code netlify-cli

# Switch to root for system packages
USER root
RUN apt-get update && apt-get install -y \
    && rm -rf /var/lib/apt/lists/*

# Back to node for runtime
USER node
WORKDIR /workspace