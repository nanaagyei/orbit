# Contributing to Orbit

Thank you for contributing to Orbit. This project welcomes bug reports, documentation improvements, and focused feature contributions.

## Before You Start

- Search existing issues and pull requests to avoid duplicate work.
- Open an issue for substantial changes so maintainers can align on scope early.
- Keep pull requests small and specific to one problem.

## Local Development

Follow the setup in [`README.md`](README.md), then run:

```bash
npm run lint
npm run type-check
```

If your change touches the Prisma schema:

```bash
npx prisma migrate dev --name your_change_name
npx prisma generate
```

## Pull Request Guidelines

- Use clear commit messages that explain intent.
- Include a concise PR description with context and testing notes.
- Update documentation when behavior or setup changes.
- Keep user-facing copy professional and consistent with the project tone.

## Reporting Bugs

When filing an issue, include:

- Expected behavior
- Actual behavior
- Reproduction steps
- Environment details (OS, Node version, database setup)

## Security

Do not open public issues for suspected vulnerabilities. Report them privately to the maintainers and include reproduction details, impact, and mitigation ideas.
