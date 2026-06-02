import Link from "next/link";

type BreadcrumbItem = { name: string; href?: string };

export function Breadcrumbs({ items, currentUrl }: { items: BreadcrumbItem[]; currentUrl?: string }) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="py-3">
      <ol
        itemScope
        itemType="https://schema.org/BreadcrumbList"
        className="flex flex-wrap items-center gap-1.5 text-sm text-gray-400"
      >
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li
              key={i}
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
              className="flex items-center gap-1.5"
            >
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  itemProp="item"
                  className="text-gray-400 hover:text-neon-blue transition-colors"
                >
                  <span itemProp="name">{item.name}</span>
                </Link>
              ) : (
                <>
                  {currentUrl && <meta itemProp="item" content={currentUrl} />}
                  <span
                    itemProp="name"
                    className={isLast ? "text-white font-medium" : "text-gray-400"}
                  >
                    {item.name}
                  </span>
                </>
              )}
              <meta itemProp="position" content={String(i + 1)} />
              {!isLast && (
                <span className="text-gray-600" aria-hidden="true">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
