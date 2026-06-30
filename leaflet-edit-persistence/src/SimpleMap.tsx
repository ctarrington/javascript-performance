import { useRef, useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-editable'
import 'leaflet-path-transform'

const STORAGE_KEY = 'editable-features'

type VectorLayer = (L.Path | L.Marker) & { toGeoJSON(): GeoJSON.Feature }
type GeoJSONLayer = L.Layer & { feature: GeoJSON.Feature }

function assignId(layer: L.Layer) {
  const gl = layer as GeoJSONLayer
  gl.feature ??= { type: 'Feature', properties: {}, geometry: null! }
  gl.feature.properties ??= {}
  gl.feature.properties.id = crypto.randomUUID()
}

function tagRectangle(layer: L.Layer) {
  const gl = layer as GeoJSONLayer
  gl.feature ??= { type: 'Feature', properties: {}, geometry: null! }
  gl.feature.properties ??= {}
  gl.feature.properties.shapeType = 'rectangle'
}

function isRectangle(layer: L.Layer): boolean {
  return (layer as GeoJSONLayer).feature?.properties?.shapeType === 'rectangle'
}

function toggleTransform(path: L.Path) {
  if (path.transform?.enabled()) {
    path.transform.disable()
  } else {
    if (!path.transform) {
      path.transform = new L.Handler.PathTransform(path)
    }
    path.transform.enable({ rotation: true, scaling: true })
  }
}

function SimpleMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const drawnLayersRef = useRef(new Set<L.Layer>())

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, { editable: true }).setView([39.5, -98.35], 4)
    mapRef.current = map

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    const save = () => {
      const features = Array.from(drawnLayersRef.current)
        .filter((l): l is VectorLayer => l instanceof L.Path || l instanceof L.Marker)
        .map(l => l.toGeoJSON())
      localStorage.setItem(STORAGE_KEY, JSON.stringify(features))
    }

    const attachListeners = (layer: L.Layer) => {
      layer.on('editable:vertex:dragend editable:vertex:deleted', save)
      if (isRectangle(layer)) {
        layer.on('transformed', save)
        layer.on('click', () => toggleTransform(layer as L.Path))
      } else {
        layer.on('click', () => layer.enableEdit())
      }
    }

    // Restore saved features
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const features = JSON.parse(saved) as GeoJSON.Feature[]
        L.geoJSON(features).eachLayer(layer => {
          layer.addTo(map)
          drawnLayersRef.current.add(layer)
          attachListeners(layer)
        })
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }

    map.on('editable:drawing:commit', (e: L.LeafletEvent) => {
      const layer = (e as L.LeafletEvent & { layer: L.Layer }).layer
      assignId(layer)
      if (layer instanceof L.Rectangle) tagRectangle(layer)
      drawnLayersRef.current.add(layer)
      attachListeners(layer)
      save()
    })

    return () => {
      map.remove()
      mapRef.current = null
      drawnLayersRef.current.clear()
    }
  }, [])

  return (
    <>
      <div className="toolbar">
        <button onClick={() => mapRef.current?.editTools.startPolyline()}>Line</button>
        <button onClick={() => mapRef.current?.editTools.startPolygon()}>Polygon</button>
        <button onClick={() => mapRef.current?.editTools.startMarker()}>Marker</button>
        <button onClick={() => mapRef.current?.editTools.startRectangle()}>Rectangle</button>
      </div>
      <div ref={containerRef} className="map" />
    </>
  )
}

export default SimpleMap
