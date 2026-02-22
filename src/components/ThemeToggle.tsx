import { Palette, Moon, Sun, Trees, Sunset, Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/lib/theme'

export default function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Toggle theme" className="cursor-pointer">
          <Palette className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          System
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setTheme('deep-forest')}>
          <Trees className="h-4 w-4" />
          Deep Forest
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dusk-ridge')}>
          <Sunset className="h-4 w-4" />
          Dusk on the Ridge
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('canopy')}>
          <Leaf className="h-4 w-4" />
          Canopy
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
