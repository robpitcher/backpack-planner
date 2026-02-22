import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
  onClick?: () => void
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-1 min-w-0">
      <ol className="flex items-center gap-1 min-w-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={index} className="flex items-center gap-1 min-w-0">
              {index > 0 && (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              )}
              {isLast ? (
                item.onClick ? (
                  <button
                    onClick={item.onClick}
                    className="truncate text-base font-bold tracking-tight cursor-pointer sm:text-lg"
                    aria-current="page"
                  >
                    {item.label}
                  </button>
                ) : item.href ? (
                  <Link
                    to={item.href}
                    className="truncate text-base font-bold tracking-tight sm:text-lg"
                    aria-current="page"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className="truncate text-base font-bold tracking-tight sm:text-lg"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                )
              ) : item.href ? (
                <Link
                  to={item.href}
                  className="truncate text-base font-bold tracking-tight text-muted-foreground hover:text-foreground transition-colors sm:text-lg"
                >
                  {item.label}
                </Link>
              ) : item.onClick ? (
                <button
                  onClick={item.onClick}
                  className="truncate text-base font-bold tracking-tight text-muted-foreground hover:text-foreground transition-colors cursor-pointer sm:text-lg"
                >
                  {item.label}
                </button>
              ) : (
                <span className="truncate text-base font-bold tracking-tight text-muted-foreground sm:text-lg">
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
