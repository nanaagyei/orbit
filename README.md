# Orbit

![Orbit](./public/orbit-white-bg.png)

![License](https://img.shields.io/badge/License-MIT-green.svg)
![Open_Source](https://img.shields.io/badge/Open%20Source-Yes-4F46E5)
![Next.js](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-149eca?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.16-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)
![Tailwind_CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)
![TanStack_Query](https://img.shields.io/badge/TanStack_Query-5-FF4154?logo=reactquery)
![Zod](https://img.shields.io/badge/Zod-4-3E67B1)

Open-source, local-first workspace for ML practitioners to build stronger relationships, consistent follow-through, and deeper technical learning.

Orbit helps you manage people, interactions, and reflection workflows in one calm system. It is designed for long-term career compounding instead of high-volume activity tracking, with optional integrations that keep your data ownership clear.

## Highlights

- Relationship tracking with stage progression, notes, and tags
- Interaction logging with structured insights and follow-up workflows
- Paper reading pipeline with reflection-first writing prompts
- Calendar and event context, including import and optional Google Calendar connectivity
- AI-assisted writing tools based on templates and user-provided context

## Stack

- Next.js App Router + React + TypeScript
- Prisma ORM with PostgreSQL
- Tailwind CSS + shadcn/ui
- TanStack Query for server-state management
- Zod for runtime validation

## Quick Start

### Prerequisites

- Node.js 18+
- npm
- Docker (recommended for local Postgres)

### Setup

```bash
git clone <repository-url>
cd orbit
npm install
```

Set `DATABASE_URL` in `.env`:

```env
DATABASE_URL="postgresql://orbit:orbit_local_dev@localhost:5433/orbit"
```

Start Postgres and run migrations:

```bash
docker compose up -d
npx prisma migrate dev
npx prisma generate
```

Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` - Start local development server
- `npm run build` - Build production bundle
- `npm run start` - Run production server
- `npm run lint` - Run linter
- `npm run type-check` - Run TypeScript checks

## Docs

- [`docs/google-oauth-setup.md`](docs/google-oauth-setup.md) - Google Calendar OAuth setup
- [`docs/better-auth-troubleshooting.md`](docs/better-auth-troubleshooting.md) - Auth and install troubleshooting
- [`docs/dynamic-feature-system.md`](docs/dynamic-feature-system.md) - Feature system design notes
- [`docs/future-features.md`](docs/future-features.md) - Public roadmap ideas

## Contributing

Contributions are welcome. Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening a pull request.

## Code of Conduct

This project follows the Contributor Covenant. Please read [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).

## Security

Please report vulnerabilities privately using the process in [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Support

If Orbit is useful to you, you can support ongoing development here:

- [Buy Me a Coffee](https://www.buymeacoffee.com/nanaagyei)

## License

Orbit is licensed under the MIT License. See [`LICENSE`](LICENSE).
