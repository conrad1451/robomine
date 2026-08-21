# ADR-002: Use Zustand for Shared Application State

- **Status:** Accepted
- **Date:** 2026-08-20
- **Authors:** Conrad Hansen-Quartey
- **Deciders:** Conrad Hansen-Quartey

## Context

The application has shared state spanning multiple parts of the UI, including:

- player balance
- robots
- mines
- materials
- total mined resources
- game time

The repository's initial setup explicitly added Zustand for state management. The domain model defines a central `GameState` containing these values.

As the application evolved, components such as `Dashboard` needed access to only specific portions of this shared state. Subscribing to the entire store could cause components to update when unrelated state changed.

The git history subsequently records a refactor described as:

> `refactor(dashboard): optimize state subscriptions with atomic selectors`

The implementation changed the Dashboard from consuming the whole store to subscribing to individual state properties such as `balance`, `totalMined`, and `gameTime`.

## Decision

We will use Zustand for shared application state.

We will access Zustand state through specific selectors rather than subscribing components to the entire store when a component only needs a subset of state.

For example, components should prefer subscribing to the individual state they consume rather than retrieving the complete store.

## Consequences

### Positive (Pros)

- **Reduced unnecessary rendering:** Components can subscribe only to the state they actually use.
- **Clear dependencies:** A component's state requirements are explicit at the point where it subscribes.
- **Simple shared state model:** Application state remains centralized without introducing unnecessary complexity.
- **Better scalability:** More granular subscriptions provide a better foundation as the number of components and state properties grows.

### Negative (Cons / Trade-offs)

- **More selector code:** Developers need to explicitly select state rather than simply retrieving the entire store.
- **Requires consistency:** The performance benefit depends on contributors continuing to use appropriately scoped selectors.
- **Store design still matters:** Poorly structured state can create complexity even when selectors are used correctly.
