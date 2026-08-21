# ADR-003: Use Component Extraction to Separate Robot Presentation from Robot Collection Logic

**Status:** Accepted
**Date:** 2026-08-20
**Authors:** Conrad Hansen-Quartey
**Deciders:** Conrad Hansen-Quartey

# Context

`RobotPanel` originally contained the logic for rendering individual robots as part of the overall robot fleet UI.

As the panel evolved, it gained additional functionality for filtering robots by mine type. The resulting component was responsible for both:

managing/filtering the robot collection
rendering the individual robot information and upgrade controls

The repository history contains the explicit refactor:

> `refactor(robot-panel): extract RobotInfoTile to functional component`

The updated implementation maps over `visibleRobots` and passes each robot's data and upgrade behavior to `RobotInfoTile`.

# Decision

We will separate individual robot presentation from robot collection management.

`RobotPanel` will manage the robot collection, filtering, and overall layout.

`RobotInfoTile` will be responsible for rendering an individual robot and receiving the data and behavior it needs through props.

# Consequences

### Positive (Pros)

- **Clear component responsibilities:** Collection-level concerns remain in `RobotPanel`, while individual robot presentation is isolated.
- **Improved maintainability:** Changes to an individual robot's UI can be made without unnecessarily modifying collection-level logic.
- **Better reuse potential:** `RobotInfoTile` can potentially be reused in other contexts.
- **Easier testing:** Individual robot presentation can be tested independently from the robot collection.

### Negative (Cons / Trade-offs)

- **More component boundaries:** Developers must pass data and callbacks between the parent and child.
- **Potential prop growth:** If the tile's responsibilities expand significantly, its prop interface could become cumbersome.
- **Abstraction overhead:** Component extraction is useful when responsibilities warrant it; unnecessary extraction could make simple UI harder to follow.
