import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'

const STORAGE_KEY = 'geoman-features'

type VectorLayer = (L.Path | L.Marker) & { toGeoJSON(): GeoJSON.Feature }
type GeoJSONLayer = L.Layer & { feature: GeoJSON.Feature }

function assignId(layer: L.Layer) {
  const gl = layer as GeoJSONLayer
  gl.feature ??= { type: 'Feature', properties: {}, geometry: null! }
  gl.feature.properties ??= {}
  gl.feature.properties.id = crypto.randomUUID()
}

function saveFeatures(map: L.Map) {
  const features = map.pm.getGeomanLayers()
    .filter((layer): layer is VectorLayer =>
      layer instanceof L.Path || layer instanceof L.Marker
    )
    .map(layer => layer.toGeoJSON())
  localStorage.setItem(STORAGE_KEY, JSON.stringify(features))
}

function restoreFeatures(map: L.Map, onChange: () => void) {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return
  try {
    const features = JSON.parse(saved) as GeoJSON.Feature[]
    L.geoJSON(features).eachLayer(layer => {
      layer.addTo(map)
      layer.on('pm:edit pm:dragend', onChange)
    })
  } catch {
    localStorage.removeItem(STORAGE_KEY)
  }
}

function SimpleMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current).setView([39.5, -98.35], 4)
    mapRef.current = map

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    map.pm.addControls({ position: 'topleft' })

    const save = () => saveFeatures(map)

    restoreFeatures(map, save)

    map.on('pm:create', ({ layer }) => {
      assignId(layer)
      layer.on('pm:edit pm:dragend', save)
      save()
    })
    map.on('pm:remove', save)
    map.on('pm:cut', save)

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}

export default SimpleMap
