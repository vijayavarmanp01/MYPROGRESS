# MyProgress — DSA Command Center

A modern personal study tracker for daily coding and placement preparation.

## Features

- **Dashboard** — Today's progress with circular indicator, streaks, and weak topic alerts
- **Daily Tasks** — 15 study categories with checkboxes, problems, difficulty, time, and notes
- **Topic Progress** — Long-term progress bars for every DSA topic
- **Problem Tracker** — Add, filter, and manage individual problems
- **Revision System** — Important, needs revision, mastered with scheduled revisit dates
- **Analytics** — Weekly charts for problems, hours, and task completion
- **Study Calendar** — GitHub-style contribution graph with day details
- **Interview Prep** — DSA, Core CS, and Interview Skills progress tracking
- **Settings** — Goals, theme (dark/light/system), category toggles, export/reset

## Tech Stack

- React 19 + TypeScript
- Tailwind CSS v4
- Recharts
- React Router
- localStorage persistence

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build

```bash
npm run build
```

## Data

All progress is stored in `localStorage` under the key `myprogress-app-state`. Export your data anytime from Settings as JSON or CSV.
