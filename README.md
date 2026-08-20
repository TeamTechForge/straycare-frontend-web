# StrayCare Web Dashboard

The StrayCare web client is an administrative dashboard built with React, TypeScript, Vite, Material UI, React Router, and Recharts. It provides browser-based tools for managing users, donations, rescues, reports, notifications, and other platform operations.

## Project overview

StrayCare is an animal-welfare platform that helps people report stray animals, coordinate rescues, connect with rescuers and veterinary professionals, and support organizations through donations. This dashboard is one of three applications in the platform, alongside the Expo mobile client and the shared Node.js backend API with MongoDB and Socket.IO real-time services.

## Requirements

- Node.js and npm
- A running StrayCare backend for API-backed development

## Setup

```bash
npm install
npm run dev
```

Vite prints the local development URL, normally `http://localhost:5173`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the production bundle |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build locally |

## Project layout

- `src` - React application source, routes, components, and styles
- `public` - Static assets copied into the production bundle
- `dist` - Generated output from `npm run build`

## Firebase Hosting

The repository includes `firebase.json` configured to deploy the `dist` directory and rewrite routes to `index.html` for client-side routing.

```bash
npm run build
firebase deploy
```

Configure Firebase CLI authentication and project selection before deploying. Keep deployment credentials and environment-specific values out of version control.
