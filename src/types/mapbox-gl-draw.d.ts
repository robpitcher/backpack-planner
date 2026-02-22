declare module 'maplibre-gl-draw' {
  import type { IControl, Map } from 'maplibre-gl'

  interface DrawOptions {
    displayControlsDefault?: boolean
    controls?: {
      point?: boolean
      line_string?: boolean
      polygon?: boolean
      trash?: boolean
      combine_features?: boolean
      uncombine_features?: boolean
    }
    defaultMode?: string
    styles?: object[]
  }

  class MapboxDraw implements IControl {
    constructor(options?: DrawOptions)
    onAdd(map: Map): HTMLElement
    onRemove(map: Map): void
    getDefaultPosition(): string
    add(geojson: object): string[]
    get(featureId: string): object | undefined
    getAll(): object
    delete(ids: string | string[]): this
    deleteAll(): this
    set(featureCollection: object): string[]
    trash(): this
    changeMode(mode: string, options?: object): this
    getMode(): string
    getSelectedIds(): string[]
    getSelected(): object
    getSelectedPoints(): object
  }

  export default MapboxDraw
}
