import { useCallback, useEffect, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Mail,
  Phone,
  Trash2,
  UserCheck,
  UserMinus,
  Users,
  X,
} from "lucide-react"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DatePickerInput } from "@/components/ui/date-picker"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { userService } from "../services/user.service"
import type { User } from "../interfaces/user.interface"
import { cn } from "@/lib/utils"
import { formatDate } from "@/features/dashboard/utils"

const PAGE_SIZE = 10

// ── Grade helpers ──────────────────────────────────────────────────────────────

const GRADE_LABELS: Record<number, string> = {
  1: "1° Prim.",
  2: "2° Prim.",
  3: "3° Prim.",
  4: "4° Prim.",
  5: "5° Prim.",
  6: "6° Prim.",
  7: "1° Sec.",
  8: "2° Sec.",
  9: "3° Sec.",
  10: "4° Sec.",
  11: "5° Sec.",
}

function gradeLabel(id: number | null) {
  if (!id) return "—"
  return GRADE_LABELS[id] ?? `Grado ${id}`
}

const GRADE_OPTIONS = [
  { value: "0", label: "Todos los grados" },
  { value: "1", label: "1° Primaria" },
  { value: "2", label: "2° Primaria" },
  { value: "3", label: "3° Primaria" },
  { value: "4", label: "4° Primaria" },
  { value: "5", label: "5° Primaria" },
  { value: "6", label: "6° Primaria" },
  { value: "7", label: "1° Secundaria" },
  { value: "8", label: "2° Secundaria" },
  { value: "9", label: "3° Secundaria" },
  { value: "10", label: "4° Secundaria" },
  { value: "11", label: "5° Secundaria" },
]

// ── Avatar ─────────────────────────────────────────────────────────────────────

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()
  const sz =
    size === "lg" ? "size-16 text-lg" : size === "sm" ? "size-8 text-xs" : "size-10 text-sm"
  return (
    <span
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full bg-blue-100 font-bold text-mathe-blue",
        sz,
      )}
    >
      {initials}
    </span>
  )
}

// ── Status badge ───────────────────────────────────────────────────────────────

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-semibold ring-1",
        isActive
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
          : "bg-rose-50 text-rose-600 ring-rose-200",
      )}
    >
      <span className={cn("size-1.5 rounded-full", isActive ? "bg-emerald-500" : "bg-rose-500")} />
      {isActive ? "Activo" : "Inactivo"}
    </span>
  )
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-mathe-border/60", className)} />
}

// ── Pagination ─────────────────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (p: number) => void
}) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        aria-label="Página anterior"
        className="rounded-xl border-mathe-border shadow-sm"
      >
        <ChevronLeft className="size-4" />
      </Button>

      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
        .reduce<(number | "…")[]>((acc, p, i, arr) => {
          if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…")
          acc.push(p)
          return acc
        }, [])
        .map((p, i) =>
          p === "…" ? (
            <span key={`e-${i}`} className="grid size-9 place-items-center text-sm text-mathe-muted">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p as number)}
              className={cn(
                "grid size-9 place-items-center rounded-xl border text-sm font-semibold transition-colors",
                page === p
                  ? "border-mathe-blue bg-mathe-blue text-mathe-white shadow-sm"
                  : "border-mathe-border bg-mathe-white text-mathe-muted shadow-sm hover:bg-mathe-surface",
              )}
            >
              {p}
            </button>
          ),
        )}

      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        aria-label="Página siguiente"
        className="rounded-xl border-mathe-border shadow-sm"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  )
}

// ── Detail dialog ──────────────────────────────────────────────────────────────

function DetailDialog({
  student,
  onClose,
}: {
  student: User | null
  onClose: () => void
}) {
  return (
    <Dialog open={student !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        {student && (
          <>
            <DialogHeader>
              <DialogTitle>Detalle del estudiante</DialogTitle>
            </DialogHeader>

            <div className="flex items-center gap-4">
              <Avatar name={student.name} size="lg" />
              <div>
                <p className="text-xl font-bold text-mathe-ink">{student.name}</p>
                <div className="mt-1">
                  <StatusBadge isActive={student.isActive} />
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              {[
                { icon: Mail, label: "Correo electrónico", value: student.email },
                { icon: Phone, label: "Teléfono", value: student.phoneNumber ?? "—" },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-xl border border-mathe-border bg-mathe-surface/40 px-4 py-3"
                >
                  <Icon className="size-4 shrink-0 text-mathe-muted" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-mathe-muted">
                      {label}
                    </p>
                    <p className="truncate text-sm font-medium text-mathe-ink">{value}</p>
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Grado", value: gradeLabel(student.academicGradeId) },
                  {
                    label: "Fecha de nacimiento",
                    value: student.birthDate ? formatDate(student.birthDate) : "—",
                  },
                  { label: "Fecha de registro", value: formatDate(student.createdAt) },
                  { label: "Última actualización", value: formatDate(student.updatedAt) },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-mathe-border bg-mathe-surface/40 px-4 py-3"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-mathe-muted">
                      {label}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-mathe-ink">{value}</p>
                  </div>
                ))}
              </div>

              {student.deletedAt && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-rose-600">
                    Cuenta eliminada
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-rose-700">
                    {formatDate(student.deletedAt)}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ── Confirm dialog ─────────────────────────────────────────────────────────────

const CONFIRM_CONFIG = {
  activate: {
    title: "¿Activar cuenta?",
    description: (name: string) =>
      `${name} podrá iniciar sesión y realizar el cuestionario.`,
    confirmLabel: "Activar",
    confirmVariant: "default" as const,
    confirmClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
    icon: UserCheck,
    iconClass: "bg-emerald-50 text-emerald-600",
  },
  deactivate: {
    title: "¿Desactivar cuenta?",
    description: (name: string) =>
      `${name} no podrá iniciar sesión hasta ser reactivado.`,
    confirmLabel: "Desactivar",
    confirmVariant: "default" as const,
    confirmClass: "bg-amber-500 hover:bg-amber-600 text-white",
    icon: UserMinus,
    iconClass: "bg-amber-50 text-amber-600",
  },
  delete: {
    title: "¿Eliminar cuenta?",
    description: (name: string) =>
      `Se desactivará la cuenta de ${name}. Esta acción es reversible por un administrador.`,
    confirmLabel: "Eliminar",
    confirmVariant: "destructive" as const,
    confirmClass: "",
    icon: Trash2,
    iconClass: "bg-rose-50 text-rose-600",
  },
}

function ConfirmDialog({
  confirm,
  onConfirm,
  onCancel,
}: {
  confirm: { mode: "activate" | "deactivate" | "delete"; student: User } | null
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!confirm) return null
  const cfg = CONFIRM_CONFIG[confirm.mode]
  const Icon = cfg.icon

  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className={cn("mb-2 grid size-12 place-items-center rounded-xl", cfg.iconClass)}>
            <Icon className="size-6" />
          </div>
          <DialogTitle>{cfg.title}</DialogTitle>
          <DialogDescription>{cfg.description(confirm.student.name)}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-2">
          <Button variant="outline" className="rounded-pill" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            variant={cfg.confirmVariant}
            className={cn("rounded-pill", cfg.confirmClass)}
            onClick={onConfirm}
          >
            {cfg.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Filter group ───────────────────────────────────────────────────────────────

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-mathe-muted">
        {label}
      </span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

type ActiveFilter = "all" | "active" | "inactive"

const ACTIVE_TABS: { value: ActiveFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
]

export function StudentsPage() {
  const schoolId = useAuthStore((s) => s.user?.school?.id)

  const [students, setStudents] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all")
  const [gradeFilter, setGradeFilter] = useState("0")
  const [birthFrom, setBirthFrom] = useState("")
  const [birthTo, setBirthTo] = useState("")
  const [createdFrom, setCreatedFrom] = useState("")
  const [createdTo, setCreatedTo] = useState("")
  const [page, setPage] = useState(1)

  const [detailStudent, setDetailStudent] = useState<User | null>(null)
  const [confirm, setConfirm] = useState<{
    mode: "activate" | "deactivate" | "delete"
    student: User
  } | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const fetchStudents = useCallback(async () => {
    if (!schoolId) return
    setLoading(true)
    try {
      const params: Record<string, unknown> = { page, limit: PAGE_SIZE }
      if (activeFilter === "active") params.isActive = true
      if (activeFilter === "inactive") params.isActive = false
      if (gradeFilter !== "0") params.academicGradeId = Number(gradeFilter)
      if (birthFrom) params.birthDateFrom = birthFrom
      if (birthTo) params.birthDateTo = birthTo
      if (createdFrom) params.createdAtFrom = createdFrom
      if (createdTo) params.createdAtTo = createdTo

      const res = await userService.listStudentsBySchool(schoolId, params)
      setStudents(res.items)
      setTotal(res.total)
    } catch {
      setStudents([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [schoolId, page, activeFilter, gradeFilter, birthFrom, birthTo, createdFrom, createdTo])

  useEffect(() => {
    void fetchStudents()
  }, [fetchStudents])

  function resetPage() {
    setPage(1)
  }

  async function handleConfirmAction() {
    if (!confirm) return
    const { mode, student } = confirm
    setConfirm(null)
    setActionLoading(student.id)
    try {
      if (mode === "activate") {
        await userService.activate(student.id)
      } else {
        await userService.delete(student.id)
      }
      await fetchStudents()
    } catch {
      // silent
    } finally {
      setActionLoading(null)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const fromIdx = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const toIdx = Math.min(page * PAGE_SIZE, total)

  const hasBirthFilter = Boolean(birthFrom || birthTo)
  const hasCreatedFilter = Boolean(createdFrom || createdTo)

  return (
    <>
      <motion.div
        className="grid gap-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-mathe-ink">Estudiantes</h1>
            <p className="mt-1 text-sm text-mathe-muted">
              Estudiantes registrados en tu institución educativa
            </p>
          </div>
          {!loading && (
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-mathe-surface px-3 py-1.5 text-sm font-semibold text-mathe-ink ring-1 ring-mathe-border">
              <Users className="size-4 text-mathe-muted" />
              {total} {total === 1 ? "estudiante" : "estudiantes"}
            </span>
          )}
        </div>

        {/* ── Filters ── */}
        <div className="rounded-2xl border border-mathe-border bg-mathe-white p-4 shadow-sm">
          {/* Row 1: status + grade */}
          <div className="flex flex-wrap items-end gap-6">
            <FilterGroup label="Estado">
              <div className="flex items-center gap-0.5 rounded-pill border border-mathe-border bg-mathe-surface p-1">
                {ACTIVE_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => {
                      setActiveFilter(tab.value)
                      resetPage()
                    }}
                    className={cn(
                      "rounded-pill px-4 py-1.5 text-sm font-semibold transition-all",
                      activeFilter === tab.value
                        ? "bg-mathe-blue text-mathe-white shadow-sm"
                        : "text-mathe-muted hover:text-mathe-ink",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </FilterGroup>

            <FilterGroup label="Grado académico">
              <Select
                value={gradeFilter}
                onValueChange={(v) => {
                  setGradeFilter(v)
                  resetPage()
                }}
              >
                <SelectTrigger className="h-10 w-44 rounded-pill border-mathe-border">
                  <SelectValue placeholder="Todos los grados" />
                </SelectTrigger>
                <SelectContent>
                  {GRADE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterGroup>
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-mathe-border" />

          {/* Row 2: date ranges */}
          <div className="flex flex-wrap items-end gap-6">
            <FilterGroup label="Fecha de nacimiento">
              <DatePickerInput
                value={birthFrom}
                onChange={(v) => { setBirthFrom(v); resetPage() }}
                placeholder="Desde"
                className="w-40"
              />
              <span className="text-xs text-mathe-muted">—</span>
              <DatePickerInput
                value={birthTo}
                onChange={(v) => { setBirthTo(v); resetPage() }}
                placeholder="Hasta"
                className="w-40"
              />
              {hasBirthFilter && (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => { setBirthFrom(""); setBirthTo(""); resetPage() }}
                >
                  <X className="size-3" />
                  Limpiar
                </Button>
              )}
            </FilterGroup>

            <FilterGroup label="Fecha de registro">
              <DatePickerInput
                value={createdFrom}
                onChange={(v) => { setCreatedFrom(v); resetPage() }}
                placeholder="Desde"
                className="w-40"
              />
              <span className="text-xs text-mathe-muted">—</span>
              <DatePickerInput
                value={createdTo}
                onChange={(v) => { setCreatedTo(v); resetPage() }}
                placeholder="Hasta"
                className="w-40"
              />
              {hasCreatedFilter && (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => { setCreatedFrom(""); setCreatedTo(""); resetPage() }}
                >
                  <X className="size-3" />
                  Limpiar
                </Button>
              )}
            </FilterGroup>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="overflow-hidden rounded-2xl border border-mathe-border bg-mathe-white shadow-sm">
          {loading ? (
            <>
              <div className="border-b border-mathe-border bg-mathe-surface/60 px-6 py-3">
                <div className="flex gap-6">
                  {[32, 40, 20, 20, 20, 16, 20].map((w, i) => (
                    <Skeleton key={i} className={`h-3 w-${w}`} />
                  ))}
                </div>
              </div>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 border-b border-mathe-border px-6 py-4 last:border-0"
                >
                  <Skeleton className="size-10 shrink-0 rounded-full" />
                  <Skeleton className="h-4 w-32 shrink-0" />
                  <Skeleton className="h-3 w-40 flex-1" />
                  <Skeleton className="h-3 w-16 shrink-0" />
                  <Skeleton className="h-3 w-20 shrink-0" />
                  <Skeleton className="h-3 w-20 shrink-0" />
                  <Skeleton className="h-6 w-20 shrink-0 rounded-pill" />
                  <Skeleton className="h-8 w-24 shrink-0 rounded-xl" />
                </div>
              ))}
            </>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <span className="grid size-14 place-items-center rounded-2xl bg-mathe-surface shadow-sm">
                <Users className="size-7 text-mathe-muted" />
              </span>
              <div>
                <p className="font-semibold text-mathe-ink">Sin estudiantes</p>
                <p className="mt-1 text-sm text-mathe-muted">
                  {activeFilter !== "all" || gradeFilter !== "0" || hasBirthFilter || hasCreatedFilter
                    ? "Prueba ajustando los filtros"
                    : "No hay estudiantes registrados en tu institución"}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-mathe-border bg-mathe-surface/60">
                    <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-widest text-mathe-muted">
                      Estudiante
                    </th>
                    <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-widest text-mathe-muted">
                      Correo
                    </th>
                    <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-widest text-mathe-muted">
                      Grado
                    </th>
                    <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-widest text-mathe-muted">
                      Cumpleaños
                    </th>
                    <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-widest text-mathe-muted">
                      Registro
                    </th>
                    <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-widest text-mathe-muted">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-mathe-muted">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <motion.tbody
                  key={`${page}-${activeFilter}-${gradeFilter}-${birthFrom}-${birthTo}-${createdFrom}-${createdTo}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  {students.map((student) => {
                    const busy = actionLoading === student.id
                    return (
                      <tr
                        key={student.id}
                        className="group border-b border-mathe-border transition-colors last:border-0 hover:bg-blue-50/20"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={student.name} />
                            <span className="font-semibold text-mathe-ink">{student.name}</span>
                          </div>
                        </td>

                        <td className="px-3 py-4">
                          <span className="text-sm text-mathe-muted">{student.email}</span>
                        </td>

                        <td className="px-3 py-4">
                          <span className="text-sm font-medium text-mathe-ink">
                            {gradeLabel(student.academicGradeId)}
                          </span>
                        </td>

                        <td className="px-3 py-4">
                          <span className="text-sm text-mathe-muted">
                            {student.birthDate ? formatDate(student.birthDate) : "—"}
                          </span>
                        </td>

                        <td className="px-3 py-4">
                          <span className="text-sm text-mathe-muted">
                            {formatDate(student.createdAt)}
                          </span>
                        </td>

                        <td className="px-3 py-4">
                          <StatusBadge isActive={student.isActive} />
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="icon-sm"
                              title="Ver detalles"
                              onClick={() => setDetailStudent(student)}
                              className="rounded-xl border-mathe-border text-mathe-muted hover:border-mathe-blue/30 hover:text-mathe-blue"
                            >
                              <Info className="size-4" />
                            </Button>

                            {student.isActive ? (
                              <Button
                                variant="outline"
                                size="icon-sm"
                                title="Desactivar cuenta"
                                disabled={busy}
                                onClick={() => setConfirm({ mode: "deactivate", student })}
                                className="rounded-xl border-mathe-border text-mathe-muted hover:border-amber-300 hover:text-amber-600"
                              >
                                <UserMinus className="size-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="icon-sm"
                                title="Activar cuenta"
                                disabled={busy}
                                onClick={() => setConfirm({ mode: "activate", student })}
                                className="rounded-xl border-mathe-border text-mathe-muted hover:border-emerald-300 hover:text-emerald-600"
                              >
                                <UserCheck className="size-4" />
                              </Button>
                            )}

                            <Button
                              variant="outline"
                              size="icon-sm"
                              title="Eliminar estudiante"
                              disabled={busy || Boolean(student.deletedAt)}
                              onClick={() => setConfirm({ mode: "delete", student })}
                              className="rounded-xl border-mathe-border text-mathe-muted hover:border-rose-300 hover:text-rose-600"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </motion.tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Pagination ── */}
        {!loading && total > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-mathe-muted">
              Mostrando{" "}
              <span className="font-semibold text-mathe-ink">{fromIdx}–{toIdx}</span> de{" "}
              <span className="font-semibold text-mathe-ink">{total}</span> estudiantes
            </p>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        )}

        {!schoolId && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
            <p className="text-sm font-medium text-amber-700">
              Tu cuenta no tiene una institución asociada. Contacta a un administrador.
            </p>
          </div>
        )}

      </motion.div>

      <DetailDialog student={detailStudent} onClose={() => setDetailStudent(null)} />
      <ConfirmDialog
        confirm={confirm}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirm(null)}
      />
    </>
  )
}
