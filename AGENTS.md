## Purpose

Guide AI agents (Cursor, Copilot, etc.) to generate consistent, production-ready code for this project.

## Tech Stack

- Next.js (App Router)
- TypeScript (strict)
- Tailwind CSS
- Server Actions / Route Handlers

## Core Principles

- Keep solutions simple, maintainable, and scalable
- Avoid over-engineering and unnecessary abstractions
- Prefer clarity over cleverness
- Minimize dependencies

## Architecture Rules

- Use feature-based folder structure
- Separate concerns:
  - UI components
  - business logic
  - API/data layer
- Reuse existing components before creating new ones
- Do not duplicate logic

## Frontend Guidelines

- Mobile-first design
- Full RTL support (Hebrew-first UX)
- Accessible and semantic HTML
- Clean Tailwind usage (no inline hacks)

## Data & API

- Use Route Handlers for server logic
- Validate all inputs
- Handle errors explicitly
- Avoid unnecessary client-side fetching

## Code Quality

- Use strict TypeScript types
- Avoid `any`
- Add loading, error, and empty states
- Write readable and self-explanatory code

## Performance

- Avoid unnecessary re-renders
- Keep components small and focused
- Do not fetch data multiple times unnecessarily

## Prohibited

- No over-complex patterns
- No premature optimization
- No unused code or dependencies
- No breaking existing functionality

## Output Expectations

- Production-ready code
- Clear structure
- Minimal explanation unless requested
