# Orbit

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Prisma](https://img.shields.io/badge/Prisma-7.2-2D3748?logo=prisma)

> A local-first operating system for building ML mastery, relationships, and long-term career momentum.

Orbit is a comprehensive web application designed for serious ML practitioners who want to build intentional professional relationships, track learning, and maintain consistent follow-through—all while keeping their data local and under their control.

## Overview

Modern ML careers are built on more than technical skill alone. The strongest practitioners compound across:

- **Deep technical learning** (papers, implementations)
- **High-quality professional relationships**
- **Community participation**
- **Clear positioning and long-term focus**
- **Consistent reflection and follow-through**

Orbit unifies all of this into a single, local-first web application designed for serious ML practitioners who want structure without noise.

### Philosophy

- **Local-First**: Your data stays on your machine. Export anytime.
- **Reflection Over Automation**: Built for thoughtful engagement, not mindless networking
- **Calm > Clever**: No dopamine-driven UI, no gamification noise
- **Next Action First**: Every screen answers "What is the most meaningful thing I can do next?"

## Features

### People & Relationships
- Track people with role, company, location, LinkedIn URL
- Relationship stage progression (New → Connected → Chatted → Ongoing → Inner Circle)
- Tag-based organization
- Timeline of interactions per person
- Rich notes and context

### Interactions & Coffee Chats
- Log interactions: coffee chats, meetups, DMs, emails, calls
- Capture key insights, advice received, and next steps
- Link interactions to people, events, and papers
- Structured reflection prompts

### Follow-Up Engine
- Create follow-ups with due dates and types (thank-you, nudge, value reconnect, check-in)
- Dashboard views: Due today, This week, Overdue
- One-click completion
- Never miss an intentional follow-up

### Events & Community
- Track events: title, host, date/time, location
- RSVP status management
- Link people met at events
- Export to calendar (.ics)
- Import from calendar files

### Paper Reading Log
Transform paper reading into a tracked, reflective, compounding practice:
- Status pipeline: Planned → Reading → Read → Implemented → Revisited
- Structured reflection fields:
  - Why I read this
  - Core idea (in my own words)
  - Key concepts/equations
  - Implementation notes
  - What surprised me
  - How this changed my thinking
- Link papers to people, projects, and coffee chats

### AI Studio
Generate personalized messages and coffee chat questions:
- Template-based message generation
- Coffee chat question generator
- Variable placeholders for personalization
- Message shortening and variant selection
- Copy to clipboard functionality

### Relationship Map
Visualize your professional network:
- Interactive graph view (nodes = people, edges = connections)
- Filter by tags, relationship stage, time window
- Discover hidden connections through shared events, companies, tags, and papers
- Click nodes to see details and connections

### Calendar View & Sync
- **In-App Calendar**: Month, week, and day views
- **Calendar Import**: Import events from .ics files (Google Calendar, Apple Calendar, Outlook)
- **Google Calendar Sync**: Optional two-way sync (read-only initially)
- Color-coded events, follow-ups, and interactions
- Orbit remains the source of truth for context and notes

### Import/Export
- Full JSON backup
- CSV export per entity (people, events, interactions, etc.)
- CSV import for people
- Calendar .ics import
- User-initiated only (no auto-sync without consent)

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL 16
- **ORM**: Prisma 7
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: TanStack Query
- **Validation**: Zod
- **Date Handling**: date-fns
- **Graph Visualization**: react-force-graph-2d
- **Calendar**: react-big-calendar

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 16+ (or use Docker Compose)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd orbit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://orbit:orbit_local_dev@localhost:5433/orbit"
   
   # Google Calendar OAuth (optional, for calendar sync)
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/google/callback
   ```

4. **Start PostgreSQL database**
   
   Using Docker Compose:
   ```bash
   docker-compose up -d
   ```
   
   Or use your own PostgreSQL instance and update `DATABASE_URL` accordingly.

5. **Run database migrations**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### First Steps

1. Add your first person (People → Add Person)
2. Log an interaction (Interactions → Log Interaction)
3. Create a follow-up (Follow-Ups → Add Follow-Up)
4. Explore the dashboard to see your momentum

## Project Structure

```
orbit/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── api/               # API routes
│   │   ├── calendar/          # Calendar view page
│   │   ├── people/            # People pages
│   │   ├── events/            # Events pages
│   │   └── ...
│   ├── components/            # React components
│   │   ├── calendar/         # Calendar components
│   │   ├── layout/           # Layout components
│   │   └── ui/               # shadcn/ui components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities and helpers
│   │   ├── calendar/         # Calendar utilities
│   │   ├── templates/        # AI message templates
│   │   └── validations/      # Zod schemas
│   └── providers/            # React context providers
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
├── docs/                     # Documentation
├── docker-compose.yml        # PostgreSQL setup
└── package.json
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

### Database Migrations

When you modify the Prisma schema:

```bash
npx prisma migrate dev --name descriptive_name
npx prisma generate
```

### Code Style

- TypeScript strict mode enabled
- ESLint with Next.js config
- Prettier (via ESLint)

## Configuration

### Google Calendar Sync

To enable Google Calendar sync, you need to set up OAuth credentials. See [Google OAuth Setup Guide](docs/google-oauth-setup.md) for detailed instructions.

### Database Connection

The app uses PostgreSQL. Update `DATABASE_URL` in your `.env` file to point to your database:

```
DATABASE_URL="postgresql://user:password@host:port/database"
```

For local development with Docker Compose:
```
DATABASE_URL="postgresql://orbit:orbit_local_dev@localhost:5433/orbit"
```

## Future Plans

### Authentication System

We're planning to add a multi-user authentication system where:

- Each user can log in with their own credentials
- Users get their own isolated database/tenant
- Data remains private to each user
- Optional cloud sync for multi-device access

### Additional Features

- Mobile app (React Native)
- Advanced analytics and insights
- Paper comparison tools
- Enhanced AI assistance
- Email integration
- More calendar providers (Outlook, Apple Calendar)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Built with ❤️ for the ML community**
