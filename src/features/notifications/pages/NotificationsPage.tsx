import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { motion } from "motion/react"
import { toast } from "sonner"
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ChartPie,
} from "lucide-react"
import { notificationService } from "../services/notification.service"
import type { Notification, NotificationType } from "../interfaces/notification.interface"
import { cn } from "@/lib/utils"

const LIMIT = 10

// ── Animations ───────────────────────────────────────────────────────────────

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 0 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "Ahora"
  if (mins < 60) return `Hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Hace ${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days === 1) return "Ayer"
  if (days < 7) return `Hace ${days} días`
  if (days < 30) return `Hace ${Math.floor(days / 7)} sem.`
  return new Date(iso).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

// ── Notification type metadata ────────────────────────────────────────────────

const TYPE_META: Record<string, { label: string; Icon: React.ComponentType<{ className?: string }> }> = {
  result_available: { label: "Resultado disponible", Icon: ChartPie },
  account_activated: { label: "Cuenta activada", Icon: CheckCircle2 },
}

function getTypeMeta(type: NotificationType) {
  return TYPE_META[type] ?? { label: "Notificación", Icon: Bell }
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-mathe-border/60", className)} />
}

function SkeletonCard() {
  return (
    <div className="flex gap-4 rounded-2xl border border-mathe-border bg-mathe-white p-5">
      <Skeleton className="mt-0.5 size-9 shrink-0 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-full max-w-xs" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}

// ── Notification card ─────────────────────────────────────────────────────────

function NotificationCard({
  notification: n,
  onMarkRead,
  onNavigate,
}: {
  notification: Notification
  onMarkRead: (id: number) => void
  onNavigate: (n: Notification) => void
}) {
  const { label, Icon } = getTypeMeta(n.type)

  function handleClick() {
    if (!n.isRead) onMarkRead(n.id)
    onNavigate(n)
  }

  return (
    <motion.div
      variants={fadeUp}
      onClick={handleClick}
      className={cn(
        "group flex cursor-pointer gap-4 rounded-2xl border bg-mathe-white p-5 shadow-sm transition-all select-none",
        n.isRead
          ? "border-mathe-border hover:border-mathe-blue/20 hover:shadow-md"
          : "border-l-[3px] border-mathe-blue/20 border-l-mathe-blue bg-blue-50/20 hover:shadow-md",
      )}
    >
      {/* Icon */}
      <span
        className={cn(
          "mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl transition-colors",
          n.isRead
            ? "bg-mathe-surface text-mathe-muted"
            : "bg-mathe-blue/10 text-mathe-blue",
        )}
      >
        <Icon className="size-4" />
      </span>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm leading-snug",
            n.isRead ? "font-medium text-mathe-muted" : "font-semibold text-mathe-ink",
          )}
        >
          {label}
        </p>
        <p className="mt-1 line-clamp-2 text-sm text-mathe-muted">{n.message}</p>
        <div className="mt-2 flex items-center gap-2">
          <p className="text-xs text-mathe-muted">{formatRelative(n.createdAt)}</p>
          {n.resultId && (
            <span className="text-xs font-semibold text-mathe-blue">
              · Ver resultado →
            </span>
          )}
        </div>
      </div>

      {/* Read indicator */}
      <div className="shrink-0 pt-0.5">
        {n.isRead ? (
          <span className="flex items-center gap-1 text-xs text-mathe-muted/60">
            <Check className="size-3.5" />
            Leída
          </span>
        ) : (
          <span className="flex size-2.5 rounded-full bg-mathe-blue" />
        )}
      </div>
    </motion.div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function NotificationsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)

  const totalPages = Math.ceil(total / LIMIT)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const data = await notificationService.list({
        page,
        limit: LIMIT,
        ...(unreadOnly ? { unread: true } : {}),
      })
      setNotifications(data.items)
      setTotal(data.total)
    } catch {
      setNotifications([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page, unreadOnly])

  useEffect(() => { void fetchNotifications() }, [fetchNotifications])

  function handleMarkRead(id: number) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    )
    notificationService.markOneRead(id).catch(() => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)),
      )
    })
  }

  async function handleMarkAll() {
    setMarkingAll(true)
    try {
      await notificationService.markAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      toast.success("Todas las notificaciones marcadas como leídas")
    } catch {
      toast.error("Error al marcar notificaciones. Intenta de nuevo.")
    } finally {
      setMarkingAll(false)
    }
  }

  const hasUnread = notifications.some((n) => !n.isRead)

  function handleNavigate(n: Notification) {
    if (n.resultId) {
      void navigate(`/dashboard/resultados/${n.resultId}`)
    }
  }

  return (
    <motion.div className="grid gap-8" initial="hidden" animate="show" variants={stagger}>

      {/* ── Header ── */}
      <motion.div variants={fadeUp} className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-mathe-surface">
              <Bell className="size-4 text-mathe-muted" />
            </span>
            <p className="text-xs font-semibold uppercase tracking-wide text-mathe-muted">
              Centro de mensajes
            </p>
          </div>
          <h1 className="text-2xl font-bold text-mathe-ink">Notificaciones</h1>
          <p className="mt-1 text-sm text-mathe-muted">
            Mantente al tanto de la actividad de tu cuenta y tus evaluaciones.
          </p>
        </div>

        {hasUnread && (
          <button
            type="button"
            onClick={() => { void handleMarkAll() }}
            disabled={markingAll}
            className="inline-flex h-10 items-center gap-2 rounded-pill border border-mathe-border bg-mathe-white px-5 text-sm font-semibold text-mathe-ink transition-colors hover:bg-mathe-surface hover:text-mathe-blue disabled:opacity-50"
          >
            <CheckCheck className="size-4" />
            {markingAll ? "Marcando…" : "Marcar todas como leídas"}
          </button>
        )}
      </motion.div>

      {/* ── Filter chips + count ── */}
      <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-2">
        {[
          { label: "Todas", value: false },
          { label: "No leídas", value: true },
        ].map((chip) => (
          <button
            key={String(chip.value)}
            type="button"
            onClick={() => {
              setUnreadOnly(chip.value)
              setPage(1)
            }}
            className={cn(
              "h-8 rounded-pill px-4 text-xs font-semibold transition-colors",
              unreadOnly === chip.value
                ? "bg-mathe-blue text-mathe-white shadow-sm"
                : "border border-mathe-border bg-mathe-surface text-mathe-muted hover:border-mathe-blue/40 hover:text-mathe-blue",
            )}
          >
            {chip.label}
          </button>
        ))}

        {!loading && (
          <p className="ml-auto text-sm text-mathe-muted">
            {total} notificación{total !== 1 ? "es" : ""}
          </p>
        )}
      </motion.div>

      {/* ── List ── */}
      <motion.section variants={fadeUp} className="grid gap-3">
        {loading ? (
          <div className="grid gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-mathe-border bg-mathe-surface py-16 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-mathe-white shadow-sm">
              <BellOff className="size-7 text-mathe-muted" />
            </span>
            <div>
              <p className="font-semibold text-mathe-ink">
                {unreadOnly ? "No tienes notificaciones sin leer" : "No tienes notificaciones"}
              </p>
              <p className="mt-1 text-sm text-mathe-muted">
                {unreadOnly
                  ? "Estás al día con todo."
                  : "Las notificaciones de tu cuenta aparecerán aquí."}
              </p>
              {unreadOnly && (
                <button
                  type="button"
                  onClick={() => setUnreadOnly(false)}
                  className="mt-3 text-xs font-semibold text-mathe-blue hover:underline"
                >
                  Ver todas las notificaciones
                </button>
              )}
            </div>
          </div>
        ) : (
          <motion.div className="grid gap-3" initial="hidden" animate="show" variants={stagger}>
            {notifications.map((n) => (
              <NotificationCard
                key={n.id}
                notification={n}
                onMarkRead={handleMarkRead}
                onNavigate={handleNavigate}
              />
            ))}
          </motion.div>
        )}
      </motion.section>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="inline-flex h-9 items-center gap-1.5 rounded-pill border border-mathe-border px-4 text-sm font-semibold text-mathe-ink transition-colors hover:bg-mathe-surface disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
            Anterior
          </button>

          <p className="text-sm text-mathe-muted">
            Página <span className="font-semibold text-mathe-ink">{page}</span>{" "}
            de <span className="font-semibold text-mathe-ink">{totalPages}</span>
          </p>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
            className="inline-flex h-9 items-center gap-1.5 rounded-pill border border-mathe-border px-4 text-sm font-semibold text-mathe-ink transition-colors hover:bg-mathe-surface disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente
            <ChevronRight className="size-4" />
          </button>
        </motion.div>
      )}

    </motion.div>
  )
}
