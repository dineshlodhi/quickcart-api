# Phase 2 - Production Deployment

## Educational Constraint
Prefer the simplest production-grade solution over the most feature-rich one. Introduce only one new concept at a time. Avoid adding frameworks or tools unless they directly support the learning objectives.

## Objective

Transform the existing TypeScript Express backend into a deployable production service.

The goal of this phase is to learn how a modern backend application moves from a developer's machine to a publicly accessible cloud service using industry-standard tools and workflows.

This phase intentionally focuses on the smallest realistic production setup while introducing concepts incrementally.

The emphasis should remain on learning **how production software is built and deployed**, not simply getting an application online.

---

# Overall Goal

By the end of this phase I should be able to:

* Clone the repository
* Run the application locally
* Run the application using Docker
* Push code to GitHub
* Have GitHub automatically validate the application
* Automatically deploy the application to Render
* Access the API over a public HTTPS URL
* Deploy new versions simply by pushing to the `main` branch

After the initial Render setup, there should be **no manual deployment steps**.

---

# Learning Objectives

This phase should teach practical production engineering concepts including:

* Docker fundamentals
* Multi-stage Docker builds
* Docker image optimization
* Docker Compose
* Environment variables
* GitHub Actions
* Continuous Integration (CI)
* Continuous Deployment (CD)
* Production configuration
* Health checks
* Graceful shutdown
* Build artifacts
* Production logging basics
* Cloud deployment using Render

Every configuration file should include concise comments explaining **why it exists** and **when it is used**.

---

# Technology Stack

## Runtime

* Node.js
* TypeScript
* Express

## Containerization

* Docker
* Docker Compose

## Source Control

* GitHub

## Continuous Integration

* GitHub Actions

## Continuous Deployment

* Render

## Future Migration

The project should be designed so that it can later be deployed to AWS ECS/Fargate with minimal or no application code changes.

The Docker image should remain platform independent.

---

# Tasks

## Task 1 - Production Dockerfile

Create a production-ready Dockerfile.

Requirements:

* Multi-stage build
* Use npm ci
* Compile TypeScript during build stage
* Copy only required production files
* Keep final image as small as practical
* Run as a non-root user
* Expose application port
* Start compiled JavaScript from the dist folder

Explain each Docker stage with comments.

---

## Task 2 - Docker Ignore

Create a `.dockerignore`.

Exclude:

* node_modules
* dist
* .git
* logs
* editor files
* local environment files

Explain why each exclusion improves Docker builds.

---

## Task 3 - Docker Compose

Create a simple `docker-compose.yml`.

Support:

* Local development
* Port mapping
* Environment variables

Keep it intentionally simple.

---

## Task 4 - NPM Scripts

Update package.json with useful scripts.

Include:

* dev
* build
* start
* lint
* typecheck
* docker:build
* docker:run
* docker:compose

Scripts should be easy to understand.

---

## Task 5 - Environment Configuration

Move configuration into environment variables.

Include:

* PORT
* NODE_ENV
* APP_NAME

Provide:

* `.env.example`

Never commit secrets.

Document how Render manages environment variables.

---

## Task 6 - Improve Health Endpoint

Expand the health endpoint.

Return:

* application name
* application version
* uptime
* current environment
* timestamp
* process id

The endpoint should be suitable for production health checks.

---

## Task 7 - Graceful Shutdown

Implement graceful shutdown.

Handle:

* SIGINT
* SIGTERM

Close:

* HTTP server
* Any future resources cleanly

Explain why containers require graceful shutdown.

---

## Task 8 - GitHub Actions (Continuous Integration)

Create a GitHub Actions workflow.

Run on:

* Push
* Pull Request

Pipeline:

Checkout Repository

↓

Install Dependencies

↓

Type Check

↓

Lint

↓

Build Application

↓

Verify Docker Image Builds Successfully

The pipeline should fail immediately if any step fails.

The workflow should be clean, well commented, and easy to understand.

---

## Task 9 - Render Deployment (Continuous Deployment)

Deploy the Dockerized application to Render.

### Objectives

The application should be publicly accessible over HTTPS.

Deployment should happen automatically whenever code is pushed to the `main` branch.

The deployment process should require no manual server access.

---

### Requirements

Prepare everything required for Render deployment.

Include:

* Production Dockerfile
* Render configuration (if applicable)
* Environment variable documentation
* Health check endpoint
* Production startup configuration

---

### Deployment Flow

The final deployment pipeline should look like:

Developer writes code

↓

git commit

↓

git push origin main

↓

GitHub

↓

GitHub Actions

* Install Dependencies
* Type Check
* Lint
* Build
* Verify Docker Build

↓

Render detects the latest commit

↓

Render builds Docker image

↓

Container starts

↓

Health Check Passes

↓

Application becomes publicly available

---

## Task 10 - Deployment Documentation

Create `RENDER_DEPLOYMENT.md`.

Document:

### Local Development

* Install dependencies
* Run locally
* Build project
* Run Docker image
* Run Docker Compose

---

### Initial Render Setup

Explain every step required to deploy.

Include:

* Creating Render account
* Connecting GitHub repository
* Creating Web Service
* Selecting Docker deployment
* Configuring build settings
* Configuring environment variables
* Configuring health check
* First deployment

Assume the reader has never used Render before.

---

### Automatic Deployments

Explain:

* How Render watches the GitHub repository
* How deployments are triggered
* How to disable/enable automatic deploys
* How to manually redeploy

---

### Environment Variables

Document:

* PORT
* NODE_ENV
* APP_NAME

Provide `.env.example`.

---

### Rollback

Explain how to deploy a previous successful version from the Render dashboard.

---

### Troubleshooting

Include common deployment issues.

Examples:

* Docker build failures
* Missing environment variables
* Failed health checks
* Incorrect port binding
* TypeScript build failures
* Container startup failures

Explain likely causes and solutions.

---

# Documentation

Every major configuration file should include concise educational comments explaining:

* Why the file exists
* When it runs
* How it fits into the deployment pipeline

Avoid unnecessary comments that explain obvious syntax.

Focus on teaching production concepts.

---

# Success Criteria

At the end of this phase the following workflow should work without manual deployment:

Developer writes code

↓

git commit

↓

git push origin main

↓

GitHub Actions validates the application

↓

Render automatically builds the Docker image

↓

Render deploys the latest version

↓

Application becomes publicly available over HTTPS

↓

GET /health returns a successful response

The project should now resemble a small production-ready backend that follows modern deployment practices.

---

# Learning Outcomes

By completing this phase I should understand:

* Why Docker is used in production
* How multi-stage Docker builds work
* How Docker Compose simplifies local development
* The difference between CI and CD
* How GitHub Actions automates quality checks
* How Render deploys containerized applications
* How production applications use environment variables
* Why health endpoints are required
* Why graceful shutdown is important
* What happens from `git push` until an application is running in production

This knowledge should directly prepare the project for the next phase, where the deployment target will evolve from Render to AWS ECS/Fargate with minimal application changes.
