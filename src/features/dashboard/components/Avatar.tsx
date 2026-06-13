import { cn } from "@/lib/utils"
import { initials } from "../utils/nav"

interface AvatarProps {
  name: string
  className?: string
}

export function Avatar({ name, className }: AvatarProps) {
  return (
    <span
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full bg-mathe-blue text-sm font-semibold text-mathe-white",
        className,
      )}
    >
      {initials(name)}
    </span>
  )
}
