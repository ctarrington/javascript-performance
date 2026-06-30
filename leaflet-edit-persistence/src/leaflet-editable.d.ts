import 'leaflet'

declare module 'leaflet' {
  interface MapOptions {
    editable?: boolean
  }

  interface EditTools {
    startPolyline(): L.Polyline
    startPolygon(): L.Polygon
    startMarker(): L.Marker
    startRectangle(): L.Rectangle
    stopDrawing(): void
  }

  interface Map {
    editTools: EditTools
  }

  interface Layer {
    enableEdit(): void
    disableEdit(): void
    editEnabled(): boolean
  }
}
