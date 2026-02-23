import { AlertTriangle } from 'lucide-react'

export default function HobbyNoticeBadge() {
  return (
    <div className="flex items-start gap-2 rounded-md border border-yellow-500/30 bg-yellow-500/5 px-3 py-2 text-[11px] leading-snug text-muted-foreground">
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-yellow-500" />
      <span>
        This is a <strong className="text-foreground">hobby project</strong> — not
        a commercial product. Use at your own risk.
      </span>
    </div>
  )
}
