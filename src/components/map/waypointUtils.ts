import type { WaypointType } from '@/types'

export interface WaypointStyle {
  color: string
  label: string
}

export const WAYPOINT_STYLES: Record<WaypointType, WaypointStyle> = {
  trailhead: { color: '#16a34a', label: 'Trailhead' },
  campsite: { color: '#ea580c', label: 'Campsite' },
  water_source: { color: '#2563eb', label: 'Water Source' },
  summit: { color: '#dc2626', label: 'Summit' },
  hazard: { color: '#eab308', label: 'Hazard' },
  poi: { color: '#9333ea', label: 'Point of Interest' },
  resupply: { color: '#92400e', label: 'Resupply' },
}

export const WAYPOINT_TYPES: WaypointType[] = [
  'trailhead',
  'campsite',
  'water_source',
  'summit',
  'hazard',
  'poi',
  'resupply',
]

/** SVG icon paths for each waypoint type (16x16 viewBox) */
const ICON_PATHS: Record<WaypointType, string> = {
  trailhead:
    'M4 14V4l8 2-8 8zM4 14h8',
  campsite:
    'M2 14l6-10 6 10H2z',
  water_source:
    'M8 2C5 7 3 9.5 3 11.5a5 5 0 0010 0C13 9.5 11 7 8 2z',
  summit:
    'M1 14l5-10 3 5 3-5 4 10H1z',
  hazard:
    'M8 1L1 15h14L8 1zM8 6v4M8 12v1',
  poi:
    'M8 1a4 4 0 014 4c0 3-4 7-4 7S4 8 4 5a4 4 0 014-4z',
  resupply:
    'M2 4h12v9H2V4zM5 4V2h6v2M2 8h12',
}

/** Create an HTML element for a waypoint marker */
export function createMarkerElement(type: WaypointType): HTMLDivElement {
  const style = WAYPOINT_STYLES[type]
  const el = document.createElement('div')
  el.className = 'waypoint-marker'
  el.style.cssText = `
    width: 28px;
    height: 28px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  `
  el.innerHTML = `
    <svg width="28" height="28" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r="12" fill="${style.color}" stroke="white" stroke-width="2.5"/>
      <g transform="translate(6,6) scale(1)" stroke="white" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        ${ICON_PATHS[type]}
      </g>
    </svg>
  `
  return el
}
