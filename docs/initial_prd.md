Product name

Orbit (working name) — Local-first relationship + ML career grounding hub

Problem

You’re doing high-quality outreach (Austin ML engineers, coffee chats, follow-ups, meetups, projects, reading papers), but it’s hard to:

Keep everything organized

Follow up consistently without being awkward

Track patterns across conversations

Generate personalized outreach and follow-ups fast

Stay grounded in your ML goals and niche strategy

Goal

A local-first web app that lets you:

Track people, conversations, events, and follow-ups

Store your positioning statement + evolving narrative

Generate personalized messages + questions (AI-assisted)

Import/export everything (CSV/JSON)

Search quickly, see next actions, and never drop the ball

Non-goals (for v1)

Multi-user accounts/auth

Cloud sync

Public social features

Full calendar/email integration

Mobile native app (web responsive is enough)

Target user

You (primary)

Later: other early-career ML/SWE folks building intentional networks

Key outcomes / success metrics

0 missed follow-ups you intended to do

Faster outreach (write high-quality messages in <2 minutes)

Clear visibility into: “who to talk to next, what to ask, what to do”

Weekly review becomes 10 minutes, not chaos

Core User Stories (MVP)
People & relationships

As a user, I can add a person with role/company/location, LinkedIn URL, tags, and notes.

I can log interactions (coffee chat, meetup chat, DM, etc.) with key takeaways.

I can set relationship stage: New → Connected → Chatted → Ongoing → Inner circle.

I can assign tags like GenAI, Recsys, Apple, Austin, Mentor, Recruiter.

Coffee chats

I can schedule a coffee chat entry with date/time and agenda.

I can store “Questions I asked” + “Advice received” + “Next action”.

I can generate:

a warm intro message

2–3 tailored questions

thank-you message

2–4 week follow-up

2–3 month “value reconnect” message

Follow-up system

As a user, I can create follow-ups with due date and type.

Dashboard shows “Due Today / This Week / Overdue”.

I can mark follow-ups done with one click.

Positioning & narrative

I can store:

positioning statements (primary + variants)

my current “north star”

niche focus areas

active projects (e.g., transformer implementation, OSS profiler)

Events & community pipeline

I can track meetups/events with RSVP status, notes, and people met.

I can link people to events.

Search & quick find

I can search across people, companies, tags, notes, interactions.

Import / Export

I can import people from CSV (LinkedIn exports, manual lists).

I can export the entire database to JSON and CSV.

UX Requirements (don’t feel “generic AI”)

Minimal, calm, “operator” UI

No clutter, no “AI hype” copy

“Next actions” is the main screen

Keyboard-first: quick add, quick search

A “Weekly Review” guided page (10 minutes)

Core Screens

Dashboard

Next Actions (follow-ups due)

“People to reconnect with”

“This week’s events”

“Streaks” (e.g., coffee chats this month)

People

Table + filters (tags, stage, company)

Person detail: timeline, notes, follow-ups, AI tools

Interactions

Log entry with “Key insight”, “Advice”, “My next step”

Link to person

Follow-ups

Kanban or list view by due date

Templates for follow-up types

Events

Event list + details

Attended? Who met? Notes?

AI Studio

Message generator (intro, ask, thank you, follow-ups)

Question generator for coffee chats

“My positioning” helper (suggest variants)

Settings

Export/Import

Model/provider config (later)

Data backup path

AI Features (MVP vs v1.1)
MVP AI (offline-friendly)

Template-based generation using structured prompts + optional local LLM later

“Personalization variables” pulled from your notes:

person role/company

why you reached out

what stood out

your positioning statement

v1.1 AI (plug-in provider)

Add OpenAI/local model support via provider interface

“Message quality” slider (short, medium)

Auto-suggest next question based on last interaction notes

Summarize notes into “one-line memory” per person

Technical Overview
Architecture (local-first)

Frontend: Next.js (App Router) + TypeScript + Tailwind

Backend: Next.js API routes (or Fastify/Express if you prefer)

DB: SQLite (local file) using Prisma ORM

State: TanStack Query for server state

Search: SQLite FTS5 (full-text search) or simple Prisma contains for MVP

Import/export:

CSV parsing (PapaParse)

JSON backup/restore

AI:

Provider interface:

TemplateProvider (MVP)

OpenAIProvider (later)

LocalLLMProvider (later)

Data model (MVP)

Person

id (uuid)

name

headline (e.g., “Senior ML Eng @ Reddit”)

company

location

linkedinUrl

tags (many-to-many)

stage (enum)

notes (text)

createdAt/updatedAt

Interaction

id

personId

type (coffee_chat, message, meetup, etc.)

date

summary (text)

keyInsights (text)

advice (text)

nextSteps (text)

createdAt

FollowUp

id

personId (nullable if general)

dueDate

type (thank_you, nudge, value_reconnect, etc.)

status (open/done)

notes

createdAt

Event

id

title

host

dateTime

location

link

status (interested/going/went)

notes

Tag

id

name

color (optional)

PersonTag join table
EventAttendance join table (personId, eventId)

Non-functional requirements

Works fully offline

Data stored in a single local folder

“Export backup” produces one JSON file + optional CSV bundle

Fast, no-lag UI for ~2k people records

Step-by-step instructions for AI agents to build
Repo + standards

Monorepo not needed for MVP; single Next.js app.

Use:

ESLint + Prettier

Zod for validation

Prisma migrations

Playwright smoke tests (later)

Milestone plan
Milestone 0 — Project scaffolding

Agent tasks

Create Next.js TS app

Add Tailwind

Add Prisma + SQLite

Create base layout (Dashboard, People, Events, AI Studio, Settings)

Add shadcn/ui components (optional)

Acceptance

App runs locally

SQLite DB created with Prisma migrate

Milestone 1 — Data model + CRUD

Agent tasks

Implement Prisma schema for Person, Interaction, FollowUp, Event, Tag + joins

Create API routes:

GET/POST /api/people

GET/PUT/DELETE /api/people/:id

POST /api/interactions

POST /api/followups

GET /api/dashboard

Build UI:

People list + filters + add person modal

Person detail page with timeline + add interaction + add follow-up

Acceptance

Can add/edit people

Can log interactions

Follow-up appears on dashboard

Milestone 2 — Follow-up engine + Weekly Review

Agent tasks

Dashboard “Next Actions” widget

Follow-up list with:

Due today

This week

Overdue

Weekly Review page:

“Who did you talk to?”

“Who needs follow-up?”

“Which event did you attend?”

“What did you build/learn this week?”

Acceptance

Weekly review takes <10 minutes

Follow-ups can be completed quickly

Milestone 3 — Search + tagging

Agent tasks

Implement tags and tag filters

Implement global search:

by name/company/tag/notes

Add “Quick Add” command palette (Cmd+K):

Add person

Add interaction

Add follow-up

Acceptance

Find any person in <2 seconds

Filters work reliably

Milestone 4 — Import/Export

Agent tasks

Export:

Full JSON backup

CSV: people.csv, interactions.csv, followups.csv, events.csv

Import:

CSV import for people with mapping UI

“Backup reminder” on Settings page

Acceptance

You can migrate data to a new machine easily

Milestone 5 — AI Studio (MVP templates)

Agent tasks

Build “AI Studio” page with generators:

Connection follow-up after accept

Coffee chat request

Thank-you note

2–4 week follow-up

2–3 month value reconnect

2–3 tailored coffee chat questions

Template system:

Inputs: person, your positioning, your current focus, event context

Outputs: copy-ready messages + “shorten” button

Add “Save to interaction note” button

Acceptance

You can generate a message in 30 seconds

Output feels personalized and not generic

Build instructions: agent operating rules
Engineering constraints

Keep code modular: features/people, features/followups, etc.

No heavy auth or cloud dependencies.

All writes must be validated with Zod.

Prisma queries must be paginated when list grows.

Definition of Done (each milestone)

UI works

Error states handled

Basic tests: at least one Playwright smoke test per milestone

No console errors

Data persists in SQLite

Bonus: “Set me apart” features (after MVP)

“Relationship Map” graph view (people connected through events/companies)

“Niche tracker” (GenAI, Recsys, Security ML, etc.) with progress and projects

“Paper reading log” (papers read, implemented, notes, links)

Calendar sync (optional)

Email templates export