import type { ComponentType } from "react"
import {
  BarChart2,
  Clock,
  ClipboardList,
  FileQuestion,
  History,
  Home,
  User,
  Users,
} from "lucide-react"
import { ROLE, ROUTING } from "@/config/constant.config"

export interface NavItem {
  label: string
  to: string
  icon: ComponentType<{ className?: string }>
  /** Exact match (used for the index "Inicio" link). */
  end?: boolean
}

const STUDENT_NAV: NavItem[] = [
  { label: "Inicio", to: ROUTING.DASHBOARD, icon: Home, end: true },
  {
    label: "Nuevo cuestionario",
    to: ROUTING.DASHBOARD_NEW,
    icon: ClipboardList,
  },
  { label: "Historial", to: ROUTING.DASHBOARD_HISTORY, icon: Clock },
  { label: "Perfil", to: ROUTING.DASHBOARD_PROFILE, icon: User },
]

const TEACHER_NAV: NavItem[] = [
  { label: "Inicio", to: ROUTING.DASHBOARD, icon: Home, end: true },
  { label: "Preguntas Pendientes", to: ROUTING.DASHBOARD_QUESTIONS, icon: FileQuestion },
  { label: "Historial validación", to: ROUTING.DASHBOARD_VALIDATION_HISTORY, icon: History },
  { label: "Estudiantes", to: ROUTING.DASHBOARD_STUDENTS, icon: Users },
  { label: "Reportes", to: ROUTING.DASHBOARD_REPORTS, icon: BarChart2 },
  { label: "Perfil", to: ROUTING.DASHBOARD_PROFILE, icon: User },
]

/** Sidebar items vary by role — teacher manages questions/students. */
export function navForRole(roleId: number | null): NavItem[] {
  return roleId === ROLE.TEACHER ? TEACHER_NAV : STUDENT_NAV
}

export function roleLabel(roleId: number | null): string {
  switch (roleId) {
    case ROLE.ADMIN:
      return "Administrador"
    case ROLE.TEACHER:
      return "Profesor"
    case ROLE.STUDENT:
      return "Estudiante"
    default:
      return ""
  }
}

/** "AG" from "Ana García" — first letters of the first two words. */
export function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "?"
  )
}
