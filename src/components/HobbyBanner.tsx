import { AlertTriangle } from 'lucide-react'

export default function HobbyBanner() {
  return (
    <div className="flex items-center justify-center gap-2 border-b border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 text-center text-xs text-muted-foreground">
      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-yellow-500" />
      <span>
        TrailForge is a personal hobby project — not a professional navigation tool.
        Please don&apos;t rely on it as your only source of trip planning. Stay safe out there.
      </span>
    </div>
  )
}
