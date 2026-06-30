# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About

Sibling project to `geoman-persistence` — same localStorage persistence and UUID-per-feature approach, but uses [leaflet-editable](https://github.com/Leaflet/Leaflet.Editable) instead of GeoMan. Because leaflet-editable has no built-in toolbar, drawing controls are React buttons in `SimpleMap.tsx`.

## Development

```bash
nvm use        # set Node version from .nvmrc (LTS)
npm run dev    # start Vite dev server on port 8080
npm run build  # tsc -b && vite build
npm run lint   # ESLint check
```

## Key differences from geoman-persistence

- `leaflet-editable` has no toolbar — drawing is triggered via `map.editTools.startPolyline()` / `startPolygon()` / `startMarker()`
- No equivalent to `map.pm.getGeomanLayers()`; drawn layers are tracked in a `Set` (`drawnLayersRef`)
- Click a shape to enable vertex editing (`layer.enableEdit()`)
- Leaflet type augmentations for `editable` map option and `editTools` live in `src/leaflet-editable.d.ts`
