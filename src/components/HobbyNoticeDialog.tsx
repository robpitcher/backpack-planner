import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

const STORAGE_KEY = 'trailforge-hobby-notice-dismissed'

export default function HobbyNoticeDialog() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setOpen(true)
    }
  }, [])

  function handleDismiss() {
    localStorage.setItem(STORAGE_KEY, '1')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleDismiss() }}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Hobby Project Notice
          </DialogTitle>
          <DialogDescription>
            Please read before continuing.
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-foreground leading-relaxed">
          TrailForge is a personal hobby project and proof of concept built by an
          individual developer. It is not a commercial product, is not affiliated
          with any company, and is provided on an as-is basis purely for
          experimental and educational purposes.
        </p>
        <DialogFooter>
          <Button onClick={handleDismiss} className="w-full sm:w-auto">
            I Understand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
