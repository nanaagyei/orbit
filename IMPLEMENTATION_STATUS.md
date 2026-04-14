# Orbit Implementation Status

This document provides a comprehensive overview of what has been implemented, progress status, gaps, and what remains to be built.

## Executive Summary

| Metric | Value |
|--------|-------|
| **Overall Completion** | ~92% |
| **Core MVP** | Complete |
| **Authentication** | Implemented (Better Auth) |
| **Multi-user Data Isolation** | Implemented |
| **Dynamic Feature System** | Implemented |

Orbit's core functionality for ML practitioners—people management, interaction logging, follow-up tracking, paper reflections, events, calendar, and AI-assisted messaging—is implemented and functional. The application uses PostgreSQL (not SQLite as originally documented) and lacks authentication, multi-user support, and the planned dynamic feature system.

---

## 1. Implemented Features

### 1.1 Pages (14 routes)

| Route | File | Description |
|-------|------|-------------|
| `/` | `src/app/page.tsx` | Dashboard: next actions (overdue, due today, due this week), recent momentum, calendar overview, weekly focus |
| `/people` | `src/app/people/page.tsx` | People list with stage/tag filters and search |
| `/people/[id]` | `src/app/people/[id]/page.tsx` | Person detail: header, stage selector, timeline (interactions, events, papers) |
| `/interactions` | `src/app/interactions/page.tsx` | Interactions list with filters |
| `/follow-ups` | `src/app/follow-ups/page.tsx` | Follow-ups list with status filters |
| `/papers` | `src/app/papers/page.tsx` | Papers list with status/tag filters |
| `/papers/[id]` | `src/app/papers/[id]/page.tsx` | Paper detail with reflection sections and autosave |
| `/events` | `src/app/events/page.tsx` | Events list with RSVP status |
| `/events/[id]` | `src/app/events/[id]/page.tsx` | Event detail with attendees |
| `/calendar` | `src/app/calendar/page.tsx` | Calendar view (react-big-calendar) |
| `/relationship-map` | `src/app/relationship-map/page.tsx` | Network graph visualization |
| `/ai-studio` | `src/app/ai-studio/page.tsx` | Template-based message and question generation |
| `/weekly-review` | `src/app/weekly-review/page.tsx` | Weekly stats, interactions, suggested follow-ups, reflection |
| `/settings` | `src/app/settings/page.tsx` | Tags, positioning, import/export, calendar sync |

### 1.2 API Routes (28 endpoints)

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/dashboard` | GET, POST | Dashboard data, weekly focus |
| `/api/people` | GET, POST | List/create people |
| `/api/people/[id]` | GET, PUT, DELETE | Person CRUD |
| `/api/interactions` | GET, POST | List/create interactions |
| `/api/interactions/[id]` | GET, PUT, DELETE | Interaction CRUD |
| `/api/followups` | GET, POST | List/create follow-ups |
| `/api/followups/[id]` | GET, PUT, DELETE | Follow-up CRUD |
| `/api/papers` | GET, POST | List/create papers |
| `/api/papers/[id]` | GET, PUT, DELETE | Paper CRUD |
| `/api/papers/[id]/people` | GET, POST, DELETE | Paper-person links |
| `/api/events` | GET, POST | List/create events |
| `/api/events/[id]` | GET, PUT, DELETE | Event CRUD |
| `/api/events/ics` | GET | Export all events as .ics |
| `/api/events/[id]/ics` | GET | Export single event as .ics |
| `/api/tags` | GET | List tags with usage counts |
| `/api/positioning` | GET, POST | List/create positioning |
| `/api/positioning/[id]` | GET, PUT, DELETE | Positioning CRUD |
| `/api/search` | GET | Search people, papers, events, interactions |
| `/api/graph` | GET | Relationship graph data |
| `/api/weekly-review` | GET, POST | Weekly review data and save |
| `/api/export` | GET | JSON backup or CSV per entity |
| `/api/export/templates` | GET | Export message templates |
| `/api/import/people` | POST | CSV import for people |
| `/api/import/calendar` | POST | .ics import |
| `/api/calendar/google/auth` | GET | Google OAuth URL |
| `/api/calendar/google/callback` | GET | OAuth callback |
| `/api/calendar/google/sync` | GET | Sync from Google Calendar |
| `/api/calendar/google/disconnect` | POST | Disconnect Google Calendar |

### 1.3 Database

- **Provider:** PostgreSQL (via `DATABASE_URL`)
- **ORM:** Prisma 7 with `@prisma/adapter-pg`
- **Client output:** `src/generated/prisma`

**Models:** Person, Interaction, FollowUp, Event, Paper, Tag, PersonTag, EventAttendance, PaperTag, PaperPerson, Positioning, CalendarSync

**Indexes:** `FollowUp(dueDate, status)` for dashboard queries

### 1.4 Components (33 total)

**Layout:** `main-layout`, `sidebar`, `topbar`

**Feature:** `command-palette`, `calendar-view`, `calendar-event-card`, `calendar-overview`, `relationship-graph`, `person-timeline`, `person-form-dialog`, `paper-reflection`, `paper-form-dialog`, `paper-people-links`, `interaction-form-dialog`, `follow-up-form-dialog`, `event-form-dialog`, `calendar-sync-section`

**UI (shadcn):** `accordion`, `badge`, `button`, `card`, `checkbox`, `command`, `dialog`, `form`, `input`, `label`, `popover`, `select`, `separator`, `sonner`, `table`, `textarea`

### 1.5 Template Engine

- **Location:** `src/lib/templates/`
- **Files:** `template-engine.ts`, `messages.ts`, `questions.ts`, `paper.ts`, `shorten.ts`
- **Behavior:** Variable replacement (`{{name}}`, `{{company}}`, etc.); no external LLM

### 1.6 Calendar Sync

- Google OAuth flow (auth, callback, sync, disconnect)
- .ics export and import
- See `docs/google-oauth-setup.md` for setup

### 1.7 Relationship Map

- Uses `react-force-graph-2d` and `reagraph`
- Nodes: people; edges: shared events, companies, tags, papers

---

## 2. Partially Implemented / Gaps

| Gap | Description |
|-----|-------------|
| **Tags DELETE** | `useDeleteTag` may call `DELETE /api/tags/[id]`, but no such route exists. Tag deletion will fail. |
| **Interaction + Follow-up** | CLAUDE.md describes creating a follow-up from an interaction in one step. Current UI uses separate dialogs. |
| **Cmd+1–8 shortcuts** | Section shortcuts for Dashboard, People, etc. not implemented. |
| **Keyboard shortcuts help** | `?` to show shortcuts help not implemented. |
| **Search case sensitivity** | Prisma `contains` may be case-sensitive depending on PostgreSQL collation. |

---

## 3. Recently Implemented (Auth & Features)

| Area | Status |
|------|--------|
| **Authentication** | Better Auth with email/password, optional Google OAuth |
| **Multi-user data isolation** | `userId` on all models; API routes filter by session |
| **Dynamic feature system** | UserFeature model, onboarding API, OpenAI integration |
| **Feature filtering** | Sidebar and command palette filter by enabled features |

## 4. Not Implemented

| Area | Status |
|------|--------|
| **Tests** | No Vitest or Playwright; no `npm run test` in package.json |
| **Format script** | No `npm run format` in package.json |

---

## 5. Progress by Category

| Category | Progress | Notes |
|----------|----------|-------|
| Core entities & CRUD | ~95% | Person, Interaction, FollowUp, Paper, Event, Tag, Positioning |
| Dashboard & workflows | ~90% | Next actions, weekly review, momentum |
| Calendar & sync | ~85% | Google OAuth, .ics |
| AI Studio | ~80% | Template-only; no LLM |
| Relationship map | ~90% | Graph visualization |
| Auth & multi-user | ~95% | Better Auth, session, userId scoping |
| Dynamic features | ~90% | UserFeature, onboarding API, UI filtering |
| Testing | 0% | No test setup |

---

## 6. Discrepancies with CLAUDE.md

| CLAUDE.md | Actual |
|-----------|--------|
| SQLite, `prisma/orbit.db` | PostgreSQL, `DATABASE_URL` |
| `npx prisma db push` | Migrations used (`prisma migrate dev`) |
| Vitest, Playwright, `npm run test` | No test scripts |
| `npm run format` | Not in package.json |
| Interaction + follow-up in one request | Separate flows |

---

## 7. File References

- **Prisma schema:** `prisma/schema.prisma`
- **Auth (planned):** `src/lib/auth.ts`, `src/lib/auth-client.ts`
- **Validations:** `src/lib/validations/`
- **Hooks:** `src/hooks/`
- **Providers:** `src/providers/`
- **Future features:** `docs/future-features.md`
- **Dynamic feature plan:** `docs/dynamic-feature-system.md`
