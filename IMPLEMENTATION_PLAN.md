# Implementation Plan — Phase 2: Production Deployment

This document breaks the Phase 2 work into **7 small, sequential phases**. Each phase builds on the previous one and introduces a focused set of production concepts.

No code changes will be made until you approve each phase individually.

---

## Phase 2A — Environment Configuration

### What
- Create a `.env.example` file documenting all environment variables.
- Update `src/config/index.ts` to read `APP_NAME` from environment variables (currently hardcoded).
- Add a `.env` entry to `.gitignore`.

### Why
Production applications never hardcode configuration. Environment variables allow the **same Docker image** to run differently in development, staging, and production without rebuilding. This is one of the [12-Factor App](https://12factor.net/config) principles.

Render, AWS, and every cloud platform inject configuration through environment variables — learning this pattern now is essential.

### Files
| Action | File |
|--------|------|
| Create | `.env.example` |
| Create | `.gitignore` |
| Modify | `src/config/index.ts` |
| Modify | `package.json` (add `version` field reference) |

---

## Phase 2B — Improved Health Endpoint & Graceful Shutdown

### What
- Expand the `/health` endpoint to return: app name, version (from `package.json`), uptime, environment, timestamp, and process ID.
- Implement graceful shutdown in `server.ts` — listen for `SIGINT` and `SIGTERM`, close the HTTP server, then exit.

### Why
**Health endpoint:** Cloud platforms (Render, AWS ECS, Kubernetes) periodically hit a health endpoint to verify the app is alive. If it stops responding, the platform restarts the container. A rich health response also helps with debugging deployed instances ("which version is running? what environment?").

**Graceful shutdown:** When a container is stopped (deploy, scale-down, restart), the platform sends `SIGTERM`. Without handling it, in-flight requests are dropped mid-response. Graceful shutdown finishes active requests before exiting, preventing data corruption and client errors. This is critical for containers.

### Files
| Action | File |
|--------|------|
| Modify | `src/app.ts` (health endpoint) |
| Modify | `src/server.ts` (graceful shutdown) |

---

## Phase 2C — Containerization (Dockerfile + .dockerignore)

### What
- Create a production-grade, multi-stage `Dockerfile`.
  - **Stage 1 (builder):** Install all dependencies, compile TypeScript to JavaScript.
  - **Stage 2 (production):** Copy only compiled JS + production `node_modules`. Run as non-root user.
- Create `.dockerignore` to exclude unnecessary files from the Docker build context.

### Why
Docker packages your application and its dependencies into a single, portable image. This image runs identically on your laptop, in CI, and in production — eliminating "works on my machine" problems.

**Multi-stage builds** keep the final image small (no TypeScript compiler, no dev dependencies, no source files) while still compiling TypeScript during the build. A smaller image means faster deploys and less attack surface.

**Non-root user** is a security best practice — if the container is compromised, the attacker has limited permissions.

### Files
| Action | File |
|--------|------|
| Create | `Dockerfile` |
| Create | `.dockerignore` |

### How to verify locally (Podman)
```bash
podman build -t mini-zepto .
podman run -p 3000:3000 -e NODE_ENV=production mini-zepto
curl http://localhost:3000/health
```

---

## Phase 2D — Docker Compose & NPM Scripts

### What
- Create `docker-compose.yml` for one-command local container startup with port mapping and environment variables.
- Update `package.json` scripts: add `typecheck`, `lint`, `docker:build`, `docker:run`, `docker:compose`.
- Install ESLint as a dev dependency with a minimal TypeScript-aware config.

### Why
**Docker Compose** simplifies multi-option `podman run` commands into a declarative YAML file. In real projects with databases, caches, and queues, Compose lets you spin up the entire stack with one command. We start simple (single service) but the pattern scales.

**NPM scripts** provide a consistent interface. Whether a developer uses Podman, Docker, or neither, `npm run typecheck` always works. CI pipelines also rely on these scripts.

**Linting** enforces consistent code style across the team. CI will run the linter to catch issues before merge.

### Files
| Action | File |
|--------|------|
| Create | `docker-compose.yml` |
| Create | `eslint.config.js` |
| Modify | `package.json` (scripts + eslint devDependencies) |

### How to verify locally
```bash
npm run typecheck        # Should pass with zero errors
npm run lint             # Should pass cleanly
podman compose up        # Should start the app on port 3000
```

---

## Phase 2E — GitHub Actions (CI)

### What
- Create `.github/workflows/ci.yml` — a GitHub Actions workflow that runs on every push and pull request.
- Pipeline steps: checkout → install dependencies → typecheck → lint → build → verify Docker image builds.

### Why
**Continuous Integration** automatically validates every code change. If someone introduces a type error, breaks the build, or pushes code that doesn't lint, CI catches it *before* it reaches production. This is the safety net between `git push` and deployment.

GitHub Actions is free for public repos and deeply integrated with GitHub — it's the most common CI tool for open-source and small-team projects.

### Files
| Action | File |
|--------|------|
| Create | `.github/workflows/ci.yml` |

### How to verify
Push the code to a GitHub repository and observe the Actions tab. The workflow should show all steps passing with green checkmarks.

---

## Phase 2F — Render Deployment (CD)

### What
- Create `render.yaml` (Render Blueprint / Infrastructure-as-Code) to define the service configuration declaratively.
- Verify the Dockerfile works on Render's build system (it uses Docker, not Podman, but the OCI image is identical).

### Why
**Continuous Deployment** closes the loop: once CI passes, Render automatically builds and deploys the new version. The entire path from `git push` to live production runs without human intervention.

`render.yaml` is Render's equivalent of Terraform — it defines your infrastructure in a file that lives in your repository, so deployment configuration is versioned alongside your code.

### Files
| Action | File |
|--------|------|
| Create | `render.yaml` |

### Manual steps (documented, not automated)
After the code is pushed, you will need to:
1. Create a Render account.
2. Connect the GitHub repository.
3. Create a Web Service using the Blueprint (`render.yaml`).
4. Set environment variables in the Render dashboard.
5. Trigger the first deploy.

All subsequent deploys are automatic on push to `main`.

---

## Phase 2G — Deployment Documentation

### What
- Create `RENDER_DEPLOYMENT.md` — a comprehensive guide covering local development, Render setup, automatic deployments, environment variables, rollbacks, and troubleshooting.
- Update `LEARNING_NOTES.md` with Phase 2 production concepts (Docker, CI/CD, graceful shutdown, health checks).

### Why
Documentation is part of production readiness. A new team member should be able to go from zero to deployed by following the guide. Troubleshooting docs prevent the same issues from being debugged repeatedly.

### Files
| Action | File |
|--------|------|
| Create | `RENDER_DEPLOYMENT.md` |
| Modify | `LEARNING_NOTES.md` (append Phase 2 concepts) |

---

## Summary

| Phase | Focus | Key Concept |
|-------|-------|-------------|
| **2A** | Environment configuration | 12-factor app, env vars |
| **2B** | Health endpoint + graceful shutdown | Container lifecycle |
| **2C** | Dockerfile + .dockerignore | Multi-stage builds, image optimization |
| **2D** | Docker Compose + NPM scripts + lint | Developer experience, CI readiness |
| **2E** | GitHub Actions | Continuous Integration |
| **2F** | Render deployment | Continuous Deployment |
| **2G** | Documentation | Production readiness |

Each phase is small enough to review, understand, and verify before moving on.

**Ready to start with Phase 2A?**
