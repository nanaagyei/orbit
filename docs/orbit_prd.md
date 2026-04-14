ORBIT — FULL PRODUCT REQUIREMENTS DOCUMENT (UPDATED)

(Paste-ready for GitHub / Claude Code)

Product Name

Orbit

Tagline:
A local-first operating system for building ML mastery, relationships, and long-term career momentum.

1. Background & Motivation

Modern ML careers are built on more than technical skill alone. The strongest practitioners compound across:

Deep technical learning (papers, implementations)

High-quality professional relationships

Community participation

Clear positioning and long-term focus

Consistent reflection and follow-through

These activities are usually fragmented across tools: notes, calendars, spreadsheets, LinkedIn messages, PDFs, and memory.

Orbit unifies all of this into a single, local-first web application designed for serious ML practitioners who want structure without noise.

2. Goals
Primary Goals

Centralize ML career grounding: people, learning, events, follow-ups

Make intentional follow-ups easy, human, and consistent

Support deep learning and reflection, not shallow networking

Work fully offline and remain user-owned

Success Metrics

Zero missed intentional follow-ups

Message generation < 2 minutes

Weekly review < 10 minutes

Clear answers to:

Who should I talk to next?

What should I ask?

What am I learning and building right now?

3. Non-Goals (v1)

Multi-user authentication

Cloud sync

Social feeds

Automated outreach

Resume parsing or job applications

4. Target User
Primary

ML / AI engineer-in-training or early-career practitioner

Strong technical foundation (math, CS, ML)

Actively building projects and reading research

Wants intentional growth, not “networking hacks”

5. Core Features (MVP)
5.1 People & Relationships

Store people with:

Name, role, company, location

LinkedIn URL

Relationship stage (New → Connected → Chatted → Ongoing → Inner Circle)

Tags (GenAI, Recsys, Infra ML, etc.)

Notes

Timeline of interactions per person

5.2 Interactions & Coffee Chats

Log interactions:

Coffee chats

Meetups

DMs

Capture:

Key insights

Advice received

My next action

Attach follow-ups directly

5.3 Follow-Up Engine

Create follow-ups with:

Due date

Type (thank-you, nudge, value reconnect)

Dashboard views:

Due today

This week

Overdue

One-click completion

5.4 Events & Community

Track events:

Title, host, date/time, location

RSVP status

Notes

Link people met at events

Support meetups, talks, reading groups

5.5 Positioning & Narrative

Store:

Personal ML positioning statements

North star goals

Active niches

Current projects and learning focus

5.6 AI Studio (MVP)

Generate:

Coffee chat requests

Thank-you notes

Follow-ups (2–4 week, 2–3 month)

Tailored coffee chat questions

Template-based, personalization-driven

No auto-sending

5.7 Import / Export

Import people via CSV

Export:

Full JSON backup

CSV per entity

User-initiated only

6. Advanced Core Features (Post-MVP, First-Class)
6.1 Relationship Map (Graph View)
Purpose

Provide a systems-level visualization of relationships to reveal:

Strong vs weak ties

Clusters (companies, events, niches)

Community structure over time

Features

Interactive graph:

Nodes: people

Edges: shared events, companies, tags

Filters:

Tags

Relationship stage

Time window

Hover/click for context:

Last interaction

Next follow-up

6.2 Paper Reading Log (Core Differentiator)
Purpose

Transform paper reading into a tracked, reflective, compounding practice.

Capabilities

Track papers with metadata:

Title, authors, year, venue, URL

Status pipeline:

Planned → Reading → Read → Implemented → Revisited

Structured reflection (see UX section)

Link papers to:

Projects

People

Coffee chats

Views:

Timeline

Status board

Tag filters

6.3 Calendar Sync (Optional)
MVP

Export events as .ics files

Include agenda, questions, and notes

Later

Optional Google Calendar sync

Orbit remains system of record

6.4 Email Templates Export
Features

Export templates as:

Plain text

Markdown

Categories:

Connection follow-up

Coffee chat request

Thank-you

Value reconnect

Variable placeholders supported

Copy/download only (no sending)

7. Technical Overview
Stack

Frontend: Next.js + TypeScript

Backend: Next.js API routes

DB: SQLite via Prisma

Styling: Tailwind

Validation: Zod

Non-Functional

Fully offline

Fast for ~2k records

Single-folder local data storage

8. Milestones

Setup & schema

Core CRUD

Follow-ups & dashboard

Search & tagging

Import/export

AI Studio

Advanced features

9. Explicitly Out of Scope

Auto-emailing

CRM-style automation

Growth hacking tools

🧠 PAPER READING UX — DETAILED DESIGN

This section defines how this feature should feel, not just function.

1. Design Philosophy

The Paper Log should feel like:

A research notebook

A thinking aid

A record of intellectual growth

Not:

A bookmark list

A reading tracker for vanity metrics

2. Paper Lifecycle UX
Status Board View

Columns:

Planned

Reading

Read

Implemented

Revisited

Each card shows:

Title

Year / venue

Tags

Linked project (if any)

Drag between stages (optional).

3. Paper Detail Page (Core Experience)
Header

Title

Authors

Year / venue

External link (PDF/arXiv)

Status selector

Tags

Structured Reflection Sections
1. Why I Read This

Intent and context.

Prompt shown in UI:

What question or gap led me to this paper?

2. Core Idea (In My Own Words)

Forcing compression and understanding.

Prompt:

Explain the main idea as if to another ML engineer.

3. Key Concepts / Equations

Optional but encouraged.

Bullet-friendly

LaTeX support later (optional)

4. Implementation Notes

Bridge from theory to practice.

Prompts:

What parts are straightforward to implement?

What parts are ambiguous or underspecified?

What assumptions matter?

5. What Surprised Me

Signal of real engagement.

Prompt:

What did I not expect before reading this?

6. How This Changed My Thinking

The most important section.

Prompt:

How will this influence my future modeling or system design decisions?

7. Follow-Ups

Papers to read next

Experiments to run

Concepts to revisit

4. Linking UX
Link to People

“Recommended by”

“Discussed with”

Auto-surface on person profile:

“Papers discussed together”

Link to Projects

Show:

Papers informing a project

Papers implemented in code

5. Review & Reflection Views
Quarterly Paper Review

Papers read vs implemented

Themes emerging

Gaps in knowledge

“Explain It Again” Mode

Revisit old papers

Rewrite core idea after 3–6 months

6. Future AI Assist (Preview)

Draft first-pass summary

Generate implementation checklist

Compare two related papers

Generate discussion questions

(Manual-first always.)

Why This Matters

Most ML practitioners:

Read papers → forget

Implement → move on

Orbit enables:

Read → implement → reflect → revisit

Deep understanding → better judgment

Strong signals of seriousness and growth