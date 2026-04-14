Product Requirements Document (PRD)
Product Name

Orbit (working title)

Tagline:
A local-first system for building, tracking, and compounding meaningful ML relationships and career momentum.

1. Background & Motivation

Building a career in Machine Learning is not only about technical skill, but also about:

Sustained relationships

Thoughtful follow-ups

Community participation

Clear positioning and narrative

Continuous grounding in learning and contribution

Currently, these activities are fragmented across notes, calendars, spreadsheets, LinkedIn messages, and memory.

Orbit consolidates all of this into a single, local-first web application that helps a user:

Track people, conversations, events, and follow-ups

Maintain a clear ML positioning and niche focus

Generate high-quality, personalized outreach and follow-ups

Build long-term community relationships intentionally

2. Goals
Primary Goals

Provide a single source of truth for ML networking, community engagement, and career grounding

Make high-quality follow-ups easy, consistent, and human

Support deep learning and reflection, not shallow networking

Work entirely offline / locally by default

Success Metrics

Zero missed intentional follow-ups

Outreach message generation in under 2 minutes

Weekly review completed in under 10 minutes

Clear visibility into:

Who to talk to next

What to ask

What actions to take

3. Non-Goals (v1)

Authentication or multi-user support

Cloud sync or hosted backend

Public social features

Full email/calendar integrations

Mobile-native apps (responsive web only)

4. Target User
Primary

A technically serious ML/AI practitioner (early–mid career)

Actively building projects, reading papers, and seeking community

Wants structure, not “networking hacks”

Secondary (future)

ML students, researchers, and engineers using Orbit for intentional relationship-building

5. Core User Stories
People & Relationships

Add and manage people with role, company, location, LinkedIn URL, tags, and notes

Track relationship stage:

New → Connected → Chatted → Ongoing → Inner Circle

Tag people by domain (e.g., GenAI, Recsys, Infra ML)

Coffee Chats & Interactions

Log interactions (coffee chat, meetup, DM)

Capture:

Key insights

Advice received

My next action

Attach follow-ups directly to people or interactions

Follow-Up System

Create follow-ups with due dates and types

View follow-ups by:

Due today

This week

Overdue

Mark follow-ups complete in one click

Positioning & Narrative

Store:

Personal ML positioning statement(s)

North star goals

Active ML niches

Current projects and learning focus

Events & Community

Track events (meetups, talks, reading groups)

RSVP status

Notes from attendance

Link people met at events

AI-Assisted Writing

Generate:

Connection follow-up messages

Coffee chat requests

Thank-you notes

2–4 week follow-ups

2–3 month value reconnects

2–3 tailored coffee chat questions

Use personal notes + positioning for personalization

Import / Export

Import people from CSV

Export full database to:

JSON (backup)

CSV (people, interactions, follow-ups, events)

6. UX / UI Principles

Calm, minimal, “operator-style” UI

No generic AI fluff

Keyboard-first workflows

Clear “Next Actions” focus

Guided Weekly Review experience

Core Screens

Dashboard (Next Actions, Upcoming Events, Streaks)

People (table + filters + detail pages)

Interactions (timeline)

Follow-Ups (list or kanban)

Events

AI Studio

Settings (import/export, backup)

7. AI Features
MVP (Template-Based)

Structured templates using user-provided data

No hard dependency on external AI APIs

Future

Provider interface for:

OpenAI

Local LLMs

Message refinement controls

Auto-summarization of conversations

8. Technical Overview
Architecture

Frontend: Next.js (App Router) + TypeScript

Backend: Next.js API routes

Database: SQLite (local file) via Prisma

Styling: Tailwind CSS

State: TanStack Query

Validation: Zod

Data Models (MVP)

Person

Interaction

FollowUp

Event

Tag

Join tables (PersonTag, EventAttendance)

Non-Functional Requirements

Fully offline-capable

Fast for ~2,000 people records

All data stored locally

One-click export/backup

9. Milestones

Project scaffolding

Data model + CRUD

Follow-up engine + Dashboard

Search + Tagging

Import / Export

AI Studio (MVP templates)

10. Out of Scope (Explicit)

Job application tracking

Resume parsing

CRM-style automation

Growth hacks or mass messaging
11. Advanced Features (Core, Post-MVP)
11.1 Relationship Map (Graph View)
Purpose

Provide a visual, systems-level view of your professional network to:

Identify strong vs weak ties

Discover clusters (companies, events, domains)

See how community participation compounds over time

This mirrors how experienced practitioners mentally model their network.

User Capabilities

View an interactive graph of people

Nodes represent people

Edges represent:

Shared events

Shared companies

Shared tags (e.g. GenAI, Apple, UT Austin)

Hover/click a node to see:

Name, role, company

Relationship stage

Last interaction

Next follow-up

Filters & Controls

Filter graph by:

Tag (e.g. “GenAI”)

Company

Event

Relationship stage

Toggle edge types:

Event-based

Company-based

Tag-based

Time slider:

“Show connections active in last 3 / 6 / 12 months”

UX Requirements

Calm, minimal graph (not noisy)

Focus on clarity over density

Progressive disclosure (don’t show everything at once)

Graph is read-only (no dragging required in v1)

Technical Notes

Use D3.js or vis-network

Graph data derived from:

Person

EventAttendance

Shared tags

Computed edges (not stored directly)

11.2 Paper Reading Log (Major Differentiator)
Purpose

Turn paper reading into a tracked, compounding skill, not passive consumption.

This feature explicitly signals:

“I don’t just read papers — I implement, reflect, and integrate them.”

Paper Entity

Each paper includes:

Title

Authors

Year

Venue (NeurIPS, ICML, arXiv, etc.)

URL (arXiv / PDF)

Tags (Transformers, Attention, Optimization, etc.)

Status:

Planned

Reading

Read

Implemented

Revisited

Structured Reflection Fields

Each paper has:

Why I read this

Core idea in my own words

Key equations / concepts

Implementation notes

What surprised me

How this changes my thinking

Follow-up papers

Linking Capabilities

Link paper to:

Projects (e.g. Transformer implementation)

People (who recommended it)

Coffee chats (discussion topics)

Auto-surface:

“Papers discussed with this person”

“Papers implemented this quarter”

Views

Timeline view (learning progression)

Status board (Planned → Implemented)

Tag-based filters (e.g. “Attention mechanisms”)

AI-Assisted Features (Later)

Generate:

One-paragraph paper summary

“Explain like I’m an ML engineer”

Implementation checklist

Compare two papers (e.g. original Transformer vs later variants)

11.3 Calendar Sync (Optional but Powerful)
Purpose

Reduce cognitive load and prevent dropped commitments without turning Orbit into a calendar app.

Supported Events

Coffee chats

Meetups

Talks

Personal learning sessions (optional)

MVP Scope

Export calendar events as:

.ics files (manual import)

Fields included:

Title

Date/time

Location

Notes (agenda / questions)

v1.1 Scope

Two-way sync (optional, opt-in):

Google Calendar

Read-only pull initially

Orbit remains source of truth

UX Rules

Calendar is supporting, not primary

Orbit always drives:

context

notes

follow-ups

11.4 Email Templates Export
Purpose

Let users own their communication, use preferred tools, and avoid lock-in.

Export Capabilities

Export templates as:

Plain text

Markdown

Categories:

Connection follow-up

Coffee chat request

Thank-you note

Soft follow-up

Value reconnect

Each template supports:

Variable placeholders

{Name}

{Company}

{Topic}

{LastConversation}

Integration

Copy-to-clipboard

Download as .txt or .md

Optional:

Export all templates as a single bundle

Design Rule

No automatic sending.
Orbit assists, never spams.

🔧 AI-Agent-Friendly Addendum (Implementation Guidance)
New Models to Add
Paper
id
title
authors
year
venue
url
status
notes_core
notes_implementation
notes_reflection
createdAt
updatedAt

PaperTag (join)
paperId
tagId

PaperPerson (optional join)
paperId
personId
context (recommended_by / discussed_with)

New Views to Implement

/papers

List + filters + status board

/papers/:id

Structured reflection editor

Linked people/projects

/graph

Relationship map visualization

/calendar

Export + upcoming events preview

/templates

Email/message templates

Export tools

Agent Operating Constraints

Do NOT overload the UI

Progressive disclosure for advanced features

Favor reflection over automation

Never auto-send messages or emails

All exports must be user-initiated

Acceptance Criteria (Global)

Paper log feels like a research notebook, not a bookmark list

Relationship map reveals insights you couldn’t see in tables

Calendar sync reduces friction without adding complexity

Email templates feel human, flexible, and reusable

Why This Truly Sets You Apart

Most people:

Read papers → forget

Meet people → don’t follow up

Network → without reflection

You will:

Read → implement → reflect → revisit

Meet → connect → compound

Build a living system around ML growth

This is PhD-level intentionality applied to industry ML.