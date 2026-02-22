# Skill: Callback Ref Pattern for Imperative DOM Elements

## When to Use
When React components create imperative DOM elements (e.g., map markers via MapLibre/Mapbox GL) with event listeners that reference props or state, and you need those listeners to always use the latest values **without** recreating the DOM elements.

## Pattern
1. Create a `useRef` for each prop/state value used inside the event listener.
2. Keep the ref synced with a `useEffect`.
3. In the event listener, read from the ref instead of the closure-captured prop.

```tsx
// 1. Create refs
const onClickRef = useRef(onClick)
const selectedIdRef = useRef(selectedId)

// 2. Keep refs current
useEffect(() => { onClickRef.current = onClick }, [onClick])
useEffect(() => { selectedIdRef.current = selectedId }, [selectedId])

// 3. Use refs in imperative handlers (created once, never stale)
el.addEventListener('click', () => {
  onClickRef.current?.(selectedIdRef.current)
})
```

## Why
- Avoids destroying and recreating DOM elements (markers, overlays) on every prop change
- Prevents stale closures in event listeners
- Keeps dependency arrays minimal in effects that create DOM elements

## Examples in Codebase
- `DashboardMap.tsx`: `onMapClickRef`, `onWaypointClickRef`, `selectedTripIdRef`
