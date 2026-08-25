# robomine

A game where you control a fleet of robots to mine for metals, process the raw ore into refined materials, and sell your way to an empire.

## Tech stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Zustand](https://github.com/pmndrs/zustand) for shared game state
- [Descope](https://www.descope.com/) for authentication (gates score-saving)
- [React Router](https://reactrouter.com/) for routing
- [MUI](https://mui.com/) (for Descope's prebuilt auth flow) + [Tailwind CSS](https://tailwindcss.com/) for styling
- Deployed on [Vercel](https://vercel.com/), with Cloudflare Web Analytics

## Getting started

```bash
pnpm install
```

Create a `.env` file in `mining-game/` with:

```
VITE_DESCOPE_PROJECT_ID=your_descope_project_id
```

This is required — the app will crash on startup without it.

Then run the dev server:

```bash
pnpm dev
```

Other scripts:

```bash
pnpm build     # type-check (tsc -b) and build for production
pnpm lint      # run eslint
pnpm preview   # preview the production build locally
```

## How the game works

- **Mines** produce raw ore over time. Each mine has a stockpile with a max capacity - once full, the mine stops producing. Upgrading a mine increases its capacity.
- **Robots** are assigned to mines to extract ore. Each robot can be leveled up (capped at level 10), increasing its efficiency at a geometrically scaling cost.
- **Processing** converts raw ore into refined materials via recipes, each with its own ore/cash cost and output. Refined materials can be sold for cash.
- The game ends (`isGameOver`) at which point all economy actions (adding/upgrading robots, upgrading mines, selling ore) are disabled.

## Auth

Login/logout is handled by `AuthButton` and `LoginModal` (wrapping Descope's prebuilt sign-up-or-in flow). The game itself (`/` and `/countdowngame`) is playable without logging in — auth is only required to save your score.

## Architecture decisions

See [`docs/adr/`](./docs/adr) for the reasoning behind key technical decisions (frontend stack, state management, and component structure).

## Deployment

Hosted on Vercel. Cloudflare Web Analytics beacon is integrated for basic traffic tracking.
