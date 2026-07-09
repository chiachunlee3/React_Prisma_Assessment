# Support Request Tracker

React + Prisma take-home assessment project for the Support Request Tracker task.

## Local Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   # Windows (Command Prompt)
   copy .env.example .env
   # Or Mac/Linux: cp .env.example .env
   ```

3. **Initialize Database and Seed Data**
   ```bash
   npm run prisma:migrate
   npm run prisma:seed
   ```

4. **Run the Application**
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://127.0.0.1:5173` and the API at `http://127.0.0.1:4000`.

## Assumptions Made During Development
- The application uses a mock "Role Selector" (Editor/Viewer) in the header to simulate authenticated user permissions without a real backend authentication system.
- Request history events are generated automatically by the backend whenever a request is created or updated.
- Soft-delete or archiving was not requested, so it was excluded to keep the scope tight.
- Filtering by "Assigned To" relies on the `UserOption` table.

## Known Limitations
- Since this is a prototype, there is no real user login or session management (JWTs/cookies). The role is simply passed via a React state toggle.
- The UI filters data locally for the "Viewer" role (or passes the role to the backend) but a production app would enforce strict row-level security or authorization checks in the Express API middleware.
- Pagination is omitted for simplicity; all requests are fetched and displayed at once.

## QA Checklist

| QA Case | Expected Result | Status |
|---|---|---|
| **Setup and seed** | Dependencies install, Prisma seed runs, seeded requests appear | ✅ Verified |
| **Search and filters** | List updates correctly by text, status, priority, category, assigned person | ✅ Verified |
| **Open detail** | Request detail and event history are visible | ✅ Verified |
| **Viewer tries update** | Action is hidden, disabled, or clearly blocked ("+ Create" disabled, "Edit" hidden) | ✅ Verified |
| **Editor creates request** | New request saved via Prisma, appears in list dynamically | ✅ Verified |
| **Editor updates status** | Status change persists via Prisma, UI shows success, Dashboard updates live | ✅ Verified |
| **Validation & empty states**| Invalid forms and no search results show helpful messages and banners | ✅ Verified |
| **Mobile-width view** | Dashboard, filters, list, detail usable on phone-width screen (stacking cards) | ✅ Verified |
