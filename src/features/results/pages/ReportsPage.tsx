import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  BarChart2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  ExternalLink,
  Headphones,
  Target,
  TrendingUp,
  UserRound,
  Users,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VakBadge } from "@/features/dashboard/components/VakBadge";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { resultService } from "../services/result.service";
import { userService } from "@/features/users/services/user.service";
import { toDisplayStyle } from "../utils/vak";
import { ACADEMIC_GRADES } from "@/data/academic-grades";
import { ROUTING } from "@/config/constant.config";
import type { SchoolStats, GradeStats } from "../interfaces/stats.interface";
import type { QuizResult } from "../interfaces/result.interface";
import type { User } from "@/features/users/interfaces/user.interface";
import { cn } from "@/lib/utils";

// ── Constants ─────────────────────────────────────────────────────────────────

type Level = "Primaria" | "Secundaria";

const VAK_COLORS = {
  visual: "#0056D2",
  auditory: "#2a9d6f",
  kinesthetic: "#c4922a",
} as const;

const VAK_LABEL: Record<string, string> = {
  Visual: "Visual",
  Auditory: "Auditivo",
  Kinesthetic: "Kinestésico",
};

const VAK_ICON: Record<string, React.ReactNode> = {
  Visual: <Eye className="size-5" />,
  Auditory: <Headphones className="size-5" />,
  Kinesthetic: <Zap className="size-5" />,
};

const VAK_CARD_STYLES: Record<string, { value: string; icon: string }> = {
  Visual: { value: "text-mathe-blue", icon: "bg-blue-50 text-mathe-blue" },
  Auditory: {
    value: "text-emerald-600",
    icon: "bg-emerald-50 text-emerald-600",
  },
  Kinesthetic: { value: "text-amber-600", icon: "bg-amber-50 text-amber-600" },
};

const LEGEND_ITEMS = [
  { key: "visual", label: "Visual", color: VAK_COLORS.visual },
  { key: "auditory", label: "Auditivo", color: VAK_COLORS.auditory },
  { key: "kinesthetic", label: "Kinestésico", color: VAK_COLORS.kinesthetic },
] as const;

const RESULTS_PAGE_SIZE = 10;

// ── Helpers ───────────────────────────────────────────────────────────────────

function gradeLabel(
  gradeId: number | null | undefined,
  fallback?: string,
): string {
  if (fallback) return fallback;
  if (!gradeId) return "—";
  const g = ACADEMIC_GRADES.find((a) => a.id === gradeId);
  return g
    ? g.name.charAt(0).toUpperCase() + g.name.slice(1)
    : `Grado ${gradeId}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Animations ────────────────────────────────────────────────────────────────

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 280, damping: 28 },
  },
};

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-mathe-border/60", className)}
      style={style}
    />
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  icon,
  iconClass,
  children,
  sub,
  loading,
}: {
  label: string;
  icon: React.ReactNode;
  iconClass: string;
  children: React.ReactNode;
  sub: string;
  loading: boolean;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-2xl border border-mathe-border bg-mathe-white p-6 shadow-sm"
    >
      <div className="mb-4 flex items-start justify-between">
        <p className="self-center text-[11px] font-semibold uppercase tracking-widest text-mathe-muted">
          {label}
        </p>
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-xl",
            iconClass,
          )}
        >
          {icon}
        </span>
      </div>
      {loading ? (
        <>
          <Skeleton className="mb-2 h-10 w-24" />
          <Skeleton className="h-3.5 w-36" />
        </>
      ) : (
        <>
          <div className="mb-1.5">{children}</div>
          <p className="text-sm text-mathe-muted">{sub}</p>
        </>
      )}
    </motion.div>
  );
}

// ── Chart tooltip ─────────────────────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; fill: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-mathe-border bg-mathe-white px-4 py-3 shadow-md">
      <p className="mb-2 text-xs font-semibold text-mathe-ink">{label}</p>
      {payload.map((item) => (
        <div key={item.name} className="flex items-center gap-2 text-xs">
          <span
            className="size-2.5 shrink-0 rounded-sm"
            style={{ backgroundColor: item.fill }}
          />
          <span className="text-mathe-muted">
            {VAK_LABEL[item.name] ?? item.name}
          </span>
          <span className="ml-4 font-semibold tabular-nums text-mathe-ink">
            {Number(item.value).toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  const pages = useMemo(() => {
    const all = Array.from({ length: totalPages }, (_, i) => i + 1);
    return all
      .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
      .reduce<(number | "…")[]>((acc, p, i, arr) => {
        if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
        acc.push(p);
        return acc;
      }, []);
  }, [page, totalPages]);

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="grid size-9 place-items-center rounded-xl border border-mathe-border bg-mathe-white text-mathe-muted shadow-sm transition-colors hover:bg-mathe-surface disabled:opacity-40"
      >
        <ChevronLeft className="size-4" />
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={`e-${i}`}
            className="grid size-9 place-items-center text-sm text-mathe-muted"
          >
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
                ? "border-mathe-blue bg-mathe-blue text-white shadow-sm"
                : "border-mathe-border bg-mathe-white text-mathe-muted shadow-sm hover:bg-mathe-surface",
            )}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="grid size-9 place-items-center rounded-xl border border-mathe-border bg-mathe-white text-mathe-muted shadow-sm transition-colors hover:bg-mathe-surface disabled:opacity-40"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}

// ── Student profile modal ─────────────────────────────────────────────────────

function StudentProfileModal({
  student,
  studentId,
  onClose,
}: {
  student: User | null;
  studentId: number;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const name = student?.name ?? `Estudiante #${studentId}`;
  const initials = student ? getInitials(student.name) : "?";
  const grade = student?.academicGradeId
    ? gradeLabel(student.academicGradeId)
    : "—";

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Información del estudiante</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-4">
          <div className="grid size-14 shrink-0 place-items-center rounded-full bg-mathe-blue/10 text-xl font-bold text-mathe-blue">
            {initials}
          </div>
          <div>
            <p className="text-lg font-bold text-mathe-ink">{name}</p>
            {student && (
              <span
                className={cn(
                  "mt-1 inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-semibold ring-1",
                  student.isActive
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    : "bg-rose-50 text-rose-600 ring-rose-200",
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    student.isActive ? "bg-emerald-500" : "bg-rose-500",
                  )}
                />
                {student.isActive ? "Activo" : "Inactivo"}
              </span>
            )}
          </div>
        </div>

        {student && (
          <div className="grid gap-2.5">
            {[
              { label: "Correo", value: student.email },
              { label: "Grado", value: grade },
              ...(student.phoneNumber
                ? [{ label: "Teléfono", value: student.phoneNumber }]
                : []),
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl border border-mathe-border bg-mathe-surface/40 px-4 py-3"
              >
                <p className="text-[11px] font-semibold uppercase tracking-widest text-mathe-muted">
                  {label}
                </p>
                <p className="mt-0.5 text-sm font-medium text-mathe-ink">
                  {value}
                </p>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            navigate(
              ROUTING.DASHBOARD_STUDENT_EVOLUTION.replace(
                ":studentId",
                String(studentId),
              ),
            );
            onClose();
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-pill bg-mathe-blue py-2.5 text-sm font-semibold text-white transition-colors hover:bg-mathe-blue/90"
        >
          <TrendingUp className="size-4" />
          Ver evolución del estudiante
        </button>
      </DialogContent>
    </Dialog>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function ReportsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const schoolId = user?.school?.id;

  // ── Stats section ──
  const [stats, setStats] = useState<SchoolStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // ── Chart section ──
  const [level, setLevel] = useState<Level>("Primaria");
  const [gradeData, setGradeData] = useState<GradeStats[]>([]);
  const [gradeLoading, setGradeLoading] = useState(true);

  // ── Results table ──
  const [results, setResults] = useState<QuizResult[]>([]);
  const [resultsTotal, setResultsTotal] = useState(0);
  const [resultsPage, setResultsPage] = useState(1);
  const [resultsLoading, setResultsLoading] = useState(true);

  // Filters
  const [filterGrade] = useState<string>("all");
  const [filterClassifier, setFilterClassifier] = useState<string>("all");

  // Student map (id → User) for name/grade lookup
  const [studentMap, setStudentMap] = useState<Map<number, User>>(new Map());

  // Student info modal
  const [studentModalId, setStudentModalId] = useState<number | null>(null);

  // ── Fetch stats ──
  useEffect(() => {
    if (!schoolId) return;
    resultService
      .getSchoolStats(schoolId)
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fetch chart data ──
  useEffect(() => {
    if (!schoolId) return;
    setGradeLoading(true);
    resultService
      .getSchoolStatsByGrade(schoolId, level)
      .then(setGradeData)
      .catch(() => setGradeData([]))
      .finally(() => setGradeLoading(false));
  }, [schoolId, level]);

  // ── Fetch students for name lookup ──
  useEffect(() => {
    if (!schoolId) return;
    userService
      .listStudentsBySchool(schoolId, { limit: 200 })
      .then((res) => {
        const map = new Map<number, User>();
        res.items.forEach((s) => map.set(s.id, s));
        setStudentMap(map);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fetch results ──
  useEffect(() => {
    if (!schoolId) return;
    setResultsLoading(true);
    resultService
      .listAll({
        schoolId,
        gradeId: filterGrade !== "all" ? Number(filterGrade) : undefined,
        classifierType:
          filterClassifier !== "all" ? filterClassifier : undefined,
        page: resultsPage,
        limit: RESULTS_PAGE_SIZE,
      })
      .then((res) => {
        setResults(res.items);
        setResultsTotal(res.total);
      })
      .catch(() => setResults([]))
      .finally(() => setResultsLoading(false));
  }, [schoolId, filterGrade, filterClassifier, resultsPage]);

  function handleFilterChange<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setResultsPage(1);
    };
  }

  const chartData = gradeData.map((g) => ({
    grade: gradeLabel(g.gradeId, g.gradeName),
    Visual: g.avgVisualProbability,
    Auditory: g.avgAuditoryProbability,
    Kinesthetic: g.avgKinestheticProbability,
  }));
  const hasChartData = chartData.some(
    (d) => d.Visual > 0 || d.Auditory > 0 || d.Kinesthetic > 0,
  );

  const commonStyle = stats?.mostCommonStyle ?? null;
  const commonStyleLabel = commonStyle
    ? (VAK_LABEL[commonStyle] ?? commonStyle)
    : "—";
  const commonStyleVariant = commonStyle
    ? (VAK_CARD_STYLES[commonStyle] ?? null)
    : null;

  const resultsTotalPages = Math.max(
    1,
    Math.ceil(resultsTotal / RESULTS_PAGE_SIZE),
  );

  return (
    <motion.div
      className="grid gap-6"
      initial="hidden"
      animate="show"
      variants={stagger}
    >
      {/* ── Header ── */}
      <motion.div variants={fadeUp}>
        <h1 className="text-3xl font-bold text-mathe-ink">
          Reporte de resultados
        </h1>
        <p className="mt-1 text-sm text-mathe-muted">
          Visualiza el desempeño VAK de tu institución: estudiantes evaluados,
          estilo predominante y distribución por grado.
        </p>
      </motion.div>

      {/* ── Stat cards ── */}
      <motion.div variants={stagger} className="grid gap-4 tablet:grid-cols-3">
        <StatCard
          label="Estudiantes evaluados"
          icon={<Users className="size-4" />}
          iconClass="bg-blue-50 text-mathe-blue"
          sub="con al menos 1 evaluación completada"
          loading={statsLoading}
        >
          <p className="text-4xl font-bold tabular-nums text-mathe-blue">
            {stats?.evaluatedStudents ?? 0}
          </p>
        </StatCard>

        <StatCard
          label="Estilo más común"
          icon={
            commonStyle ? (
              (VAK_ICON[commonStyle] ?? <Eye className="size-4" />)
            ) : (
              <Eye className="size-4" />
            )
          }
          iconClass={
            commonStyleVariant?.icon ?? "bg-mathe-surface text-mathe-muted"
          }
          sub="predominante en estudiantes evaluados"
          loading={statsLoading}
        >
          <p
            className={cn(
              "text-4xl font-bold",
              commonStyleVariant?.value ?? "text-mathe-ink",
            )}
          >
            {commonStyleLabel}
          </p>
        </StatCard>

        <StatCard
          label="Confianza promedio"
          icon={<Target className="size-4" />}
          iconClass="bg-emerald-50 text-emerald-600"
          sub="tasa de certeza en los resultados"
          loading={statsLoading}
        >
          <p className="text-4xl font-bold tabular-nums text-emerald-600">
            {stats
              ? `${Number(stats.avgPredominantConfidence ?? 0).toFixed(1)}%`
              : "—"}
          </p>
        </StatCard>
      </motion.div>

      {/* ── Chart section ── */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl border border-mathe-border bg-mathe-white p-6 shadow-sm"
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-mathe-surface">
              <BarChart2 className="size-4 text-mathe-muted" />
            </span>
            <div>
              <p className="text-sm font-bold text-mathe-ink">
                Distribución VAK por grado
              </p>
              <p className="text-xs text-mathe-muted">
                Probabilidad promedio (%) por estilo
              </p>
            </div>
          </div>
          <Select value={level} onValueChange={(v) => setLevel(v as Level)}>
            <SelectTrigger className="h-9 w-36 rounded-pill text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Primaria">Primaria</SelectItem>
              <SelectItem value="Secundaria">Secundaria</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {gradeLoading ? (
          <div className="space-y-3">
            <div className="flex h-[240px] items-end gap-6 px-4 pb-6">
              {[52, 68, 44, 75, 38].map((h, i) => (
                <div key={i} className="flex flex-1 items-end gap-1">
                  <Skeleton
                    className="flex-1 rounded-t-lg"
                    style={{ height: `${h}%` }}
                  />
                  <Skeleton
                    className="flex-1 rounded-t-lg"
                    style={{ height: `${h * 0.7}%` }}
                  />
                  <Skeleton
                    className="flex-1 rounded-t-lg"
                    style={{ height: `${h * 0.5}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-6">
              {LEGEND_ITEMS.map((l) => (
                <Skeleton key={l.key} className="h-3 w-20" />
              ))}
            </div>
          </div>
        ) : !hasChartData ? (
          <div className="flex h-[280px] flex-col items-center justify-center gap-3 rounded-xl bg-mathe-surface/60 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-mathe-white shadow-sm">
              <BarChart2 className="size-7 text-mathe-muted/50" />
            </span>
            <div>
              <p className="font-semibold text-mathe-ink">
                Sin datos para {level}
              </p>
              <p className="mt-0.5 text-sm text-mathe-muted">
                Aún no hay evaluaciones completadas en este nivel educativo
              </p>
            </div>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={chartData}
                barGap={3}
                barCategoryGap="32%"
                margin={{ top: 4, right: 4, bottom: 0, left: -16 }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="#e5e7eb"
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="grade"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  width={32}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: "#f3f4f6", radius: 4 }}
                />
                <Bar
                  dataKey="Visual"
                  fill={VAK_COLORS.visual}
                  radius={[4, 4, 0, 0]}
                  animationDuration={700}
                  animationEasing="ease-out"
                />
                <Bar
                  dataKey="Auditory"
                  fill={VAK_COLORS.auditory}
                  radius={[4, 4, 0, 0]}
                  animationDuration={850}
                  animationEasing="ease-out"
                />
                <Bar
                  dataKey="Kinesthetic"
                  fill={VAK_COLORS.kinesthetic}
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 flex items-center justify-center gap-6 border-t border-mathe-border pt-4">
              {LEGEND_ITEMS.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center gap-2 text-sm text-mathe-muted"
                >
                  <span
                    className="size-3 shrink-0 rounded-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.label}
                </div>
              ))}
            </div>
          </>
        )}
      </motion.div>

      {/* ── Results table ── */}
      <motion.div variants={fadeUp} className="grid gap-4 mt-2">
        {/* Section header + filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-mathe-ink">
              Resultados individuales
            </h2>
            <p className="text-xs text-mathe-muted">
              Todos los estudiantes con evaluaciones completadas
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* <Select
              value={filterGrade}
              onValueChange={handleFilterChange(setFilterGrade)}
            >
              <SelectTrigger className="h-9 w-44 rounded-pill text-xs">
                <SelectValue placeholder="Todos los grados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los grados</SelectItem>
                {ACADEMIC_GRADES.map((g) => (
                  <SelectItem key={g.id} value={String(g.id)}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> */}
            <Select
              value={filterClassifier}
              onValueChange={handleFilterChange(setFilterClassifier)}
            >
              <SelectTrigger className="h-9 w-44 rounded-pill text-xs">
                <SelectValue placeholder="Clasificador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Cualquier clasificador</SelectItem>
                <SelectItem value="xgboost">XGBoost</SelectItem>
                <SelectItem value="simple_score">Score simple</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-mathe-border bg-mathe-white shadow-sm">
          {resultsLoading ? (
            <>
              <div className="border-b border-mathe-border bg-mathe-surface/60 px-6 py-3 flex gap-6">
                {[32, 16, 20, 16, 24, 20].map((w, i) => (
                  <Skeleton key={i} className={`h-3 w-${w}`} />
                ))}
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-5 border-b border-mathe-border px-6 py-4 last:border-0"
                >
                  <Skeleton className="size-9 rounded-full shrink-0" />
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-16 ml-auto" />
                  <Skeleton className="h-6 w-24 rounded-pill" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-32 rounded-pill" />
                </div>
              ))}
            </>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <span className="grid size-14 place-items-center rounded-2xl bg-mathe-surface shadow-sm">
                <ClipboardList className="size-7 text-mathe-muted" />
              </span>
              <div>
                <p className="font-semibold text-mathe-ink">Sin resultados</p>
                <p className="mt-1 text-sm text-mathe-muted">
                  {filterGrade !== "all" || filterClassifier !== "all"
                    ? "Prueba ajustando los filtros"
                    : "Aún no hay evaluaciones completadas en tu institución"}
                </p>
              </div>
            </div>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-mathe-border bg-mathe-surface/60">
                  <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-widest text-mathe-muted">
                    Estudiante
                  </th>
                  <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-widest text-mathe-muted">
                    Grado
                  </th>
                  <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-widest text-mathe-muted">
                    Estilo
                  </th>
                  <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-widest text-mathe-muted">
                    Confianza
                  </th>
                  <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-widest text-mathe-muted">
                    Última evaluación
                  </th>
                  <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-mathe-muted">
                    Acciones
                  </th>
                </tr>
              </thead>
              <motion.tbody
                key={`${resultsPage}-${filterGrade}-${filterClassifier}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.18 }}
              >
                {results.map((r) => {
                  const student = studentMap.get(r.studentId) ?? null;
                  const name = student?.name ?? `Estudiante #${r.studentId}`;
                  const initials = student ? getInitials(student.name) : "?";
                  const grade = gradeLabel(student?.academicGradeId);

                  return (
                    <tr
                      key={r.id}
                      className="border-b border-mathe-border last:border-0 transition-colors hover:bg-blue-50/30"
                    >
                      {/* Student */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-mathe-blue/10 text-xs font-bold text-mathe-blue">
                            {initials}
                          </div>
                          <span className="text-sm font-medium text-mathe-ink">
                            {name}
                          </span>
                        </div>
                      </td>
                      {/* Grade */}
                      <td className="px-3 py-4 text-sm text-mathe-muted">
                        {grade}
                      </td>
                      {/* Style */}
                      <td className="px-3 py-4">
                        <VakBadge style={toDisplayStyle(r.predominantStyle)} />
                      </td>
                      {/* Confidence */}
                      <td className="px-3 py-4">
                        <span className="text-sm font-bold tabular-nums text-mathe-ink">
                          {r.predominantConfidence.toFixed(1)}%
                        </span>
                      </td>
                      {/* Date */}
                      <td className="px-3 py-4 text-sm text-mathe-muted">
                        {formatDate(r.createdAt)}
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            title="Ver resultado completo"
                            onClick={() =>
                              navigate(
                                ROUTING.RESULT_DETAIL.replace(":id", String(r.id)),
                              )
                            }
                            className="inline-flex h-8 items-center gap-1.5 rounded-pill border border-mathe-border bg-mathe-white px-3 text-xs font-semibold text-mathe-ink transition-colors hover:bg-mathe-surface"
                          >
                            <ExternalLink className="size-3.5" />
                            Resultado
                          </button>
                          <button
                            type="button"
                            title="Ver información del estudiante"
                            onClick={() => setStudentModalId(r.studentId)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-pill bg-mathe-blue px-3 text-xs font-semibold text-white transition-colors hover:bg-mathe-blue/90"
                          >
                            <UserRound className="size-3.5" />
                            Estudiante
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </motion.tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!resultsLoading && resultsTotal > RESULTS_PAGE_SIZE && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-mathe-muted">
              Mostrando{" "}
              <span className="font-semibold text-mathe-ink">
                {(resultsPage - 1) * RESULTS_PAGE_SIZE + 1}–
                {Math.min(resultsPage * RESULTS_PAGE_SIZE, resultsTotal)}
              </span>{" "}
              de{" "}
              <span className="font-semibold text-mathe-ink">
                {resultsTotal}
              </span>{" "}
              resultados
            </p>
            <Pagination
              page={resultsPage}
              totalPages={resultsTotalPages}
              onChange={setResultsPage}
            />
          </div>
        )}
      </motion.div>

      {/* ── Student info modal ── */}
      {studentModalId !== null && (
        <StudentProfileModal
          student={studentMap.get(studentModalId) ?? null}
          studentId={studentModalId}
          onClose={() => setStudentModalId(null)}
        />
      )}
    </motion.div>
  );
}
