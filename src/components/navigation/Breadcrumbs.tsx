import { Link } from "react-router"

export type BreadcrumbItem = {
  label: string
  to?: string
}

type BreadcrumbsProps = {
  items: BreadcrumbItem[]
}

function Breadcrumbs({
  items,
}: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-6"
    >
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--muted)]">
        {items.map((item, index) => {
          const isLast =
            index === items.length - 1

          return (
            <li
              key={`${item.label}-${index}`}
              className="flex items-center gap-2"
            >
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className="text-[var(--border)]"
                >
                  /
                </span>
              )}

              {item.to && !isLast ? (
                <Link
                  to={item.to}
                  className="transition hover:text-[var(--accent)]"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={
                    isLast
                      ? "page"
                      : undefined
                  }
                  className={
                    isLast
                      ? "text-[var(--foreground)]"
                      : undefined
                  }
                >
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

export default Breadcrumbs