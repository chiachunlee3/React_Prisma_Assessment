# Support Request Tracker

React + Prisma take-home assessment project for the Support Request Tracker task.

## Implementation Plan

1. Scaffold project structure and base run scripts.
2. Add Prisma schema, SQLite config, and seed data.
3. Build Prisma-backed API routes for request data.
4. Build React dashboard, filters, list, detail, create/edit flows, and role selector.
5. Add loading, error, empty, validation, blocked-action, success, and responsive states.
6. Document setup, assumptions, limitations, and QA checklist.
7. Capture screenshots for the submission PDF.

## Current Status

Step 1 is complete:

- Vite React app scaffold.
- Express API placeholder with `GET /api/health`.
- Root scripts for local development and future Prisma setup.
- `.env.example` and `.gitignore` for local database and secret hygiene.

## Planned Local Setup

After the Prisma schema is added, the intended workflow will be:

```bash
npm install
copy .env.example .env
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

The app will run at `http://127.0.0.1:5173`, with the API at `http://127.0.0.1:4000`.
