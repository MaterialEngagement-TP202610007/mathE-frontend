interface PlaceholderPageProps {
  title: string
  description?: string
}

/** Stub for routes whose content isn't built yet. Keeps the layout navigable. */
export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="grid gap-2">
      <h1 className="text-2xl font-bold text-mathe-ink">{title}</h1>
      <p className="text-mathe-muted">
        {description ?? "Esta sección estará disponible próximamente."}
      </p>
    </section>
  )
}
