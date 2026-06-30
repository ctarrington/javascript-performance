import 'leaflet'

declare module 'leaflet-path-transform' {
  export {}
}

declare module 'leaflet' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Handler {
    interface PathTransformOptions {
      rotation?: boolean
      scaling?: boolean
      uniformScaling?: boolean
    }
    class PathTransform {
      constructor(path: L.Path, options?: PathTransformOptions)
      enable(options?: PathTransformOptions): void
      disable(): void
      enabled(): boolean
    }
  }
  interface Path {
    transform?: Handler.PathTransform
  }
}
