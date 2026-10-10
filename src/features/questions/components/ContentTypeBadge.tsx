import { AudioLines, Image, Type } from "lucide-react"
import type { ComponentType } from "react"
import { cn } from "@/lib/utils"
import type { Question } from "../interfaces/question.interface"

type ContentType = Question["contentType"]

const CONTENT_TYPES: Record<
  ContentType,
  { label: string; icon: ComponentType<{ className?: string }>; className: string }
> = {
  text: { label: "Texto", icon: Type, className: "bg-mathe-surface text-mathe-ink" },
  image: { label: "Imagen", icon: Image, className: "bg-violet-50 text-violet-700" },
  audio: { label: "Audio", icon: AudioLines, className: "bg-sky-50 text-sky-700" },
}

interface ContentTypeBadgeProps {
  /** Typed as string too: older or malformed rows may carry an unexpected value. */
  contentType: ContentType | string | null | undefined
  className?: string
}

/**
 * Pill badge for a question's content type (Texto / Imagen / Audio).
 * Renders nothing for a missing or unknown type so legacy rows stay clean.
 */
export function ContentTypeBadge({ contentType, className }: ContentTypeBadgeProps) {
  if (!contentType || !Object.hasOwn(CONTENT_TYPES, contentType)) return null
  const { label, icon: Icon, className: tone } = CONTENT_TYPES[contentType as ContentType]
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-semibold",
        tone,
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      {label}
    </span>
  )
}
