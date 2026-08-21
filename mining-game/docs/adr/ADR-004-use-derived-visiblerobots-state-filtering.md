# ADR-004: Use Derived `visibleRobots` State for Robot Filtering

**Status:** Accepted
**Date:** 2026-08-21
**Authors:** Conrad Hansen-Quartey
**Deciders:** Conrad Hansen-Quartey

## Context

The robot fleet needs to support filtering by mine type while retaining the complete robot collection.

The `RobotPanel` implementation introduces a selected mine type and derives `visibleRobots` by filtering the existing `robots` collection. When no type is selected, the complete collection is displayed. When a type is selected, only robots matching that mine type are shown.

The UI also provides an explicit "Show All" option and displays an empty-state message when no robots match the selected filter.

## Decision

We will retain the complete `robots` collection as the source of truth and derive `visibleRobots` from the selected mine-type filter.

We will not create a second persisted collection containing the filtered robots.

The UI will provide an explicit way to clear the filter and return to the complete robot collection.

## Consequences

### Positive (Pros)

- **Single source of truth:** The application maintains one canonical robot collection.
- **Simple filtering model:** Filtering is derived from current state rather than duplicated into another state structure.
- **Easy filter reset:** Clearing the selected type returns the UI to the complete collection.
- **Clear empty state:** Users receive explicit feedback when a filter has no matching robots.

### Negative (Cons / Trade-offs)

- **Filtering occurs during rendering/derivation:** The collection is filtered whenever the relevant state is evaluated.
- **Potential scaling concern:** If the robot collection becomes extremely large, filtering strategy may need to be revisited.
- **More UI state:** The selected filter adds another piece of component state to manage.
