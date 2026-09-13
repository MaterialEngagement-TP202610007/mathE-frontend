import { useEffect, useState } from "react"
import { Loader2, UserCheck, Users } from "lucide-react"
import { motion } from "motion/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/features/dashboard/components/Avatar"
import { formatDate } from "@/features/dashboard/utils"
import { getErrorMessage } from "@/lib/http"
import { cn } from "@/lib/utils"
import { Pagination } from "@/shared/components/Pagination"
import type { TeacherListItem } from "../interfaces/user.interface"
import { userService } from "../services/user.service"

const PAGE_SIZE = 10

type ApprovalTab = "pending" | "active"

const TABS: { value: ApprovalTab; label: string }[] = [
  { value: "pending", label: "Pendientes" },
  { value: "active", label: "Activos" },
]

const EMPTY_COPY: Record<ApprovalTab, { title: string; description: string }> = {
  pending: {
    title: "Sin solicitudes pendientes",
    description: "No hay profesores esperando aprobación.",
  },
  active: {
    title: "Sin profesores activos",
    description: "Todavía no hay profesores aprobados.",
  },
}

function schoolNameOf(teacher: TeacherListItem): string {
  return teacher.school?.name ?? teacher.schoolName ?? "Sin colegio"
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-mathe-border/60", className)} />
}

const TH_CLASS = "px-3 py-3 text-[11px] font-semibold uppercase tracking-widest text-mathe-muted"

/** Admin screen: review teacher sign-ups and approve pending accounts. */
export function TeachersApprovalPage() {
  const [tab, setTab] = useState<ApprovalTab>("pending")
  const [page, setPage] = useState(1)
  const [teachers, setTeachers] = useState<TeacherListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  // Bumped after an approval to re-run the fetch effect with the same filters.
  const [reloadKey, setReloadKey] = useState(0)
  const [approvingIds, setApprovingIds] = useState<ReadonlySet<number>>(new Set())

  useEffect(() => {
    let cancelled = false

    userService
      .listTeachers({ page, limit: PAGE_SIZE, isActive: tab === "active" })
      .then((res) => {
        if (cancelled) return
        // Approving the last row of a page leaves it empty: step back one page.
        if (res.items.length === 0 && page > 1) {
          setPage(page - 1)
          return
        }
        setTeachers(res.items)
        setTotal(res.total)
        setLoadError(null)
        setLoading(false)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setTeachers([])
        setTotal(0)
        setLoadError(getErrorMessage(error, "No se pudo cargar la lista de profesores."))
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [tab, page, reloadKey])

  function changeTab(next: ApprovalTab) {
    if (next === tab) return
    setLoading(true)
    setTab(next)
    setPage(1)
  }

  function changePage(next: number) {
    if (next === page) return
    setLoading(true)
    setPage(next)
  }

  async function approve(teacher: TeacherListItem) {
    setApprovingIds((prev) => new Set(prev).add(teacher.id))
    try {
      await userService.approveTeacher(teacher.id)
      toast.success("Profesor aprobado")
      setReloadKey((k) => k + 1)
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo aprobar al profesor."))
    } finally {
      setApprovingIds((prev) => {
        const next = new Set(prev)
        next.delete(teacher.id)
        return next
      })
    }
  }

  const isPending = tab === "pending"
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const fromIdx = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const toIdx = Math.min(page * PAGE_SIZE, total)

  return (
    <motion.div
      className="grid gap-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-mathe-ink">Profesores</h1>
          <p className="mt-1 text-sm text-mathe-muted">
            Revisa las cuentas de profesor y aprueba las solicitudes pendientes
          </p>
        </div>
        {!loading && !loadError && (
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-mathe-white px-3 py-1.5 text-sm font-semibold text-mathe-ink ring-1 ring-mathe-border">
            <Users className="size-4 text-mathe-muted" />
            {total} {total === 1 ? "profesor" : "profesores"}
          </span>
        )}
      </div>

      {/* ── Tabs ── */}
      <div
        role="tablist"
        aria-label="Estado de las cuentas"
        className="flex w-fit items-center gap-0.5 rounded-pill border border-mathe-border bg-mathe-white p-1 shadow-sm"
      >
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={tab === t.value}
            onClick={() => changeTab(t.value)}
            className={cn(
              "rounded-pill px-4 py-1.5 text-sm font-semibold transition-all",
              tab === t.value
                ? "bg-mathe-blue text-mathe-white shadow-sm"
                : "text-mathe-muted hover:text-mathe-ink",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-2xl border border-mathe-border bg-mathe-white shadow-sm">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-mathe-border px-6 py-4 last:border-0"
            >
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <Skeleton className="h-4 w-32 shrink-0" />
              <Skeleton className="h-3 w-40 flex-1" />
              <Skeleton className="h-3 w-28 shrink-0" />
              <Skeleton className="h-8 w-24 shrink-0 rounded-pill" />
            </div>
          ))
        ) : loadError || teachers.length === 0 ? (
          <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-mathe-surface shadow-sm">
              {isPending ? (
                <UserCheck className="size-7 text-mathe-muted" />
              ) : (
                <Users className="size-7 text-mathe-muted" />
              )}
            </span>
            <div>
              <p className="font-semibold text-mathe-ink">
                {loadError ? "No se pudo cargar la lista" : EMPTY_COPY[tab].title}
              </p>
              <p className="mt-1 text-sm text-mathe-muted">
                {loadError ?? EMPTY_COPY[tab].description}
              </p>
            </div>
            {loadError && (
              <Button
                variant="outline"
                className="rounded-pill border-mathe-border"
                onClick={() => {
                  setLoading(true)
                  setReloadKey((k) => k + 1)
                }}
              >
                Reintentar
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-mathe-border bg-mathe-surface/60">
                  <th className={cn(TH_CLASS, "px-6")}>Profesor</th>
                  <th className={TH_CLASS}>Correo</th>
                  <th className={TH_CLASS}>Colegio</th>
                  <th className={TH_CLASS}>Registro</th>
                  {isPending && <th className={cn(TH_CLASS, "px-6 text-right")}>Acciones</th>}
                </tr>
              </thead>
              <motion.tbody
                key={`${tab}-${page}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                {teachers.map((teacher) => {
                  const approving = approvingIds.has(teacher.id)
                  return (
                    <tr
                      key={teacher.id}
                      className="border-b border-mathe-border transition-colors last:border-0 hover:bg-blue-50/20"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={teacher.name} />
                          <span className="font-semibold text-mathe-ink">{teacher.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-sm text-mathe-muted">{teacher.email}</td>
                      <td className="px-3 py-4 text-sm font-medium text-mathe-ink">
                        {schoolNameOf(teacher)}
                      </td>
                      <td className="px-3 py-4 text-sm text-mathe-muted">
                        {teacher.createdAt ? formatDate(teacher.createdAt) : "—"}
                      </td>
                      {isPending && (
                        <td className="px-6 py-4 text-right">
                          <Button
                            size="sm"
                            disabled={approving}
                            onClick={() => void approve(teacher)}
                            className="rounded-pill bg-mathe-blue px-4 font-semibold text-mathe-white hover:bg-mathe-blue-deep"
                          >
                            {approving ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <UserCheck className="size-4" />
                            )}
                            {approving ? "Aprobando…" : "Aprobar"}
                          </Button>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </motion.tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {!loading && !loadError && total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-mathe-muted">
            Mostrando{" "}
            <span className="font-semibold text-mathe-ink">
              {fromIdx}–{toIdx}
            </span>{" "}
            de <span className="font-semibold text-mathe-ink">{total}</span> profesores
          </p>
          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onChange={changePage} />
          )}
        </div>
      )}
    </motion.div>
  )
}
