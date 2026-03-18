export const aboutContent = `
Hi, I'm Matthew Loughnane - here's my submission for the [Bounce Insights](https://www.bounceinsights.com/) coding challenge. I wanted to share a landing page, a dashboard with dense data and clear consistent theme.

### Frontend

- **Theme:** A simple squared theme based on the NASA worm logo, using the same red throughout with dark mode support (press d on keyboard to toggle).
- **Design:** I used [TailwindCSS](https://tailwindcss.com/) with [ui.shadcn](https://ui.shadcn.com/) components.
- **Tech:** [Next.js (App Router)](https://nextjs.org/), [Tanstack Query](https://tanstack.com/query/latest), [Tanstack Table](https://tanstack.com/table/latest), [DiceUI Table](https://www.diceui.com/docs/components/data-table), [Visx](https://airbnb.io/visx/).

### Backend

- **Tech:** [ExpressJS](https://expressjs.com), [Helmet](https://helmetjs.github.io/) for security headers and [Winston](https://github.com/winstonjs/winston) for structured logging.
- I added in-memory caching (I didn't want to include \`redis\`) per date range so repeated requests skip the NASA API call. Pagination is handled server-side.
- Zod schema validation on all query parameters via middleware.

### Tools

- I used Claude Code to develop UI and generate test cases, I reviewed and ran them before commiting.

### Hosting

- I'm hosting this on my own VPS, using Coolify, using nixpacks. It redeploys on a git push.
- Both 'applications' could go straight onto Vercel / Railway / Heroku or GCP cloud run without changes.

### Stray Notes

- The Near Earth Objects (NEO) page makes two calls - one for the full data and one for the table data. I separated them so that the data could be rendered into the chart fully - the pagination of the table (handled server side) was showing empty days. It was a tradeoff between being efficient and looking complete.
- I used Visx to show the data, because I wanted to play with the library and learn something new. It might slightly heavier than other libraries. Ordinarily I would use [recharts](https://recharts.github.io/) or [d3](https://d3js.org/).
- I would not use a red colour scheme to highlight data usually - I just love this logo and wanted to have fun with the design of it. Red having negative / destructive connotations would ordinarily be difficult to work with for showing errors etc.
- The API logging isn't set up to rotate and logs are stored locally. For production, I would use a logging service or Grafana for monitoring.
- Using AI required heavy packages to be installed to stream data. Because I only wanted one feature, I've used Mastra in the past and it can be added to ExpressJS.

### Next Steps

- Add more API endpoints.
- Add a memory for the AI functionality.
- Add more tests for coverage.
- Re-use this theme for another project (I enjoyed building this).
`
