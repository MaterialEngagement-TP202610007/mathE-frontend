import { useAuthStore } from "@/features/auth/store/auth.store"
import { ACADEMIC_GRADES } from "@/data/academic-grades"
import { Avatar } from "./Avatar"
import { roleLabel } from "../utils/nav"

/** Top bar: current user name, role/grade meta and avatar. */
export function Topbar() {
  const user = useAuthStore((s) => s.user)
  const roleId = useAuthStore((s) => s.roleId)

  const name = user?.name ?? "Usuario"
  const grade = ACADEMIC_GRADES.find((g) => g.id === user?.academicGradeId)
  const meta = [grade?.name.split(" ")[0], roleLabel(roleId)]
    .filter(Boolean)
    .join(" · ")

  return (
    <header className="flex h-20 shrink-0 items-center justify-end gap-3 border-b border-mathe-border bg-mathe-white px-8">
      <div className="text-right leading-tight">
        <p className="text-sm font-semibold text-mathe-ink">{name}</p>
        {meta && <p className="text-xs text-mathe-muted">{meta}</p>}
      </div>
      <Avatar name={name} />
    </header>
  )
}
