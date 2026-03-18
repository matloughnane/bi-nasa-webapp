# Frontend — NASA Dashboard

Next.js 16 app with a squared theme based on the NASA worm logo, dark mode support (press `d` to toggle), and OKLCH colour variables throughout.

## Tech

- [Next.js (App Router)](https://nextjs.org/) with Turbopack for dev
- [TailwindCSS](https://tailwindcss.com/) v4 with [ui.shadcn](https://ui.shadcn.com/) components
- [Tanstack Query](https://tanstack.com/query/latest) for data fetching and caching
- [Tanstack Table](https://tanstack.com/table/latest) + [DiceUI Table](https://www.diceui.com/docs/components/data-table) for sortable, paginated tables
- [Visx](https://airbnb.io/visx/) for charts (XYChart, geo projections, zoom)
- [d3-geo](https://d3js.org/) for the solar flare sun map projection
- [react-markdown](https://github.com/remarkjs/react-markdown) for the about page content

## Pages

- `/` — Landing page with feature cards and APOD
- `/about` — About the project (markdown-rendered)
- `/near-earth-objects` — NEO dashboard with stacked bar chart and data table
- `/solar-flares` — Solar flare dashboard with interactive sun map and data table

## Scripts

```bash
pnpm dev              # Start dev server (Turbopack)
pnpm build            # Production build
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm format           # Run Prettier
pnpm typecheck        # Type check with tsc
pnpm test             # Run tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run tests with coverage
```

## Installation

```bash
pnpm install
pnpm dev
```

Runs on `http://localhost:3000`. Expects the backend to be running on `http://localhost:4000`.
