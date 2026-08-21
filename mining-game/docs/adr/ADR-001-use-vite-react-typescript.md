# ADR-001: Use Vite, React, and TypeScript as the Frontend Foundation

- Status: Accepted
- Date: 2026-08-20
- Authors: Conrad Hansen-Quartey
- Deciders: Conrad Hansen-Quartey

## Context

The project needed an initial frontend foundation for the mining game application. The repository was started as a new application rather than an extension of an existing frontend.

The initial project setup explicitly introduced:

- Vite
- React
- TypeScript
- ESLint
- Zustand for state management
- lucide-react for UI
- pnpm lockfile and project structure

The initial commit was made on August 11, 2026 and is described as `feat: setup initial Vite + React + TypeScript project.`

The application also requires a structured domain model for entities such as robots, mines, materials, and game state. The repository therefore benefits from TypeScript's type system as the application grows.

## Decision

We will use Vite, React, and TypeScript as the foundation of the frontend application.

We will use ESLint to establish baseline code-quality practices and pnpm for dependency management.

We will use Zustand as the application's state-management solution.

## Consequences

Positive (Pros)

- Fast frontend development: Vite provides a lightweight development/build foundation for a React application.
- Type safety: TypeScript gives the application explicit models for Robot, Mine, Material, and GameState.
- Maintainability: ESLint establishes baseline consistency as the codebase grows.
- Simple state management: Zustand provides shared application state without requiring a larger state-management framework.
- Developer experience: The combination keeps the initial stack relatively small and focused.

## Negative (Cons / Trade-offs)

- Additional type overhead: TypeScript requires maintaining interfaces and types as the domain evolves.
- Tooling decisions become conventions: Future contributors will inherit the Vite/React/TypeScript/Zustand stack.
- Zustand requires discipline: As the state model grows, developers need clear patterns for subscriptions and derived state.
