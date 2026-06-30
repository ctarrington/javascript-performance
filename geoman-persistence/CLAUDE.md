# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About

This project is part of the `javascript-performance` monorepo — a collection of geospatial and UI performance experiments. `geoman-persistence` explores persisting [GeoMan](https://geoman.io/) (a Leaflet drawing/editing plugin) feature data.

## Standard Tech Stack

Projects in this monorepo use: React 19, TypeScript 5.x, Vite 7.x, ESLint 9.x, Prettier. GIS projects typically add Leaflet and Turf.js.

## Development

```bash
nvm use        # set Node version from .nvmrc (LTS)
npm run dev    # start Vite dev server on port 8080
npm run build  # tsc -b && vite build
npm run lint   # ESLint check
```
