import { Link } from "react-router"
import { Building2 } from "lucide-react"
import { ROUTING } from "@/config/constant.config"
import { cn } from "@/lib/utils"
import { SCHOOL_REQUIRED_TO_GENERATE_MESSAGE } from "../utils/school-scope"

/** Explains why question generation is disabled for a teacher without a school. */
export function SchoolRequiredNotice({ id, className }: { id?: string; className?: string }) {
  return (
    <div
      id={id}
      role="note"
      className={cn(
        "flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4",
        className,
      )}
    >
      <Building2 className="mt-0.5 size-4 shrink-0 text-amber-600" />
      <p className="text-sm font-medium text-amber-700">
        {SCHOOL_REQUIRED_TO_GENERATE_MESSAGE}{" "}
        <Link to={ROUTING.DASHBOARD_PROFILE} className="font-semibold underline">
          Ir a mi perfil
        </Link>
      </p>
    </div>
  )
}
