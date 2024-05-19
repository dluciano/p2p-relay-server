# Use specific Node.js Alpine base image
FROM node:current-alpine3.19@sha256:181d0e0248e825fa1c056c7ef85e91fbad340caf0814d30b81467daea4637045 AS base

# Set environment variables for a secure user
ENV USER=node
ENV HOME=/home/$USER

# Set working directory
WORKDIR $HOME/app

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install production 
FROM base AS prod-deps

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install production dependencies
RUN --mount=type=cache,id=pnpm,target=/Users/dawlin/Library/pnpm/store pnpm install --prod --frozen-lockfile

# Build project
FROM base AS build

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install alpine's dependencies
RUN apk add --no-cache --upgrade g++ cmake

# Copy all content of the src folder
COPY src ./src
COPY tsconfig.json ./tsconfig.json

# Install build dependencies
RUN --mount=type=cache,id=pnpm,target=/Users/dawlin/Library/pnpm/store pnpm install --frozen-lockfile

# Build project
RUN pnpm build

# Production image layer
FROM base as prod

# Copy dependencies
COPY --from=prod-deps $HOME/app/node_modules $HOME/app/node_modules
COPY --from=build $HOME/app/dist $HOME/app/dist

WORKDIR $HOME/app

# Expose port
EXPOSE 8080

# Create a secure user and group, and set ownership
RUN addgroup -S nodegroup && adduser node nodegroup && \
    chown -R node:nodegroup $HOME/app

# # Harden the Dockerfile
RUN apk add --no-cache --upgrade bash && \
    apk add --no-cache tini && \
    chmod +rw $HOME/app/dist && \
    chown -R node:nodegroup $HOME/app/dist && \
    chmod -R 700 $HOME/app

# # Switch to the secure user
USER node

# Use Tini as the entrypoint to manage zombie processes and signal forwarding
ENTRYPOINT ["/sbin/tini", "--"]

# Run the application
CMD ["node", "./dist/app.js"]
