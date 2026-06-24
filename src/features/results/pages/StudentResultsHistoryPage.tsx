import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  BarChart2,
  BookOpen,
  BrainCircuit,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  Eye,
  TrendingUp,
  Volume2,
  X,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { DatePickerInput } from "@/components/ui/date-picker";
import { VakBadge } from "@/features/dashboard/components/VakBadge";
import { userService } from "@/features/users/services/user.service";
import { resultService } from "../services/result.service";
import { toDisplayStyle } from "../utils/vak";
import { ACADEMIC_GRADES } from "@/data/academic-grades";
import { ROUTING } from "@/config/constant.config";
import type { User } from "@/features/users/interfaces/user.interface";
import type { QuizResult, VakStyleApi } from "../interfaces/result.interface";
import type {
  UserResultStats,
  UserEvolutionResult,
} from "../interfaces/stats.interface";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

type Granularity = "day" | "month" | "year";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function gradeName(id: number | null) {
  if (!id) return null;
  const g = ACADEMIC_GRADES.find((a) => a.id === id);
  return g?.name ?? `Grado ${id}`;
}

function formatPeriod(period: string, granularity: Granularity) {
  if (granularity === "year") return period;
  if (granularity === "month") {
    const [y, m] = period.split("-");
    const date = new Date(Number(y), Number(m) - 1);
    return date.toLocaleDateString("es-PE", {
      month: "short",
      year: "2-digit",
    });
  }
  const date = new Date(period + "T00:00:00");
  return date.toLocaleDateString("es-PE", { day: "numeric", month: "short" });
}

function formatRangeDate(iso: string) {
  return new Date(
    iso + (iso.length === 10 ? "T00:00:00" : ""),
  ).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Design tokens ─────────────────────────────────────────────────────────────

const STYLE_META: Record<
  string,
  {
    label: string;
    color: string;
    bgClass: string;
    textClass: string;
    Icon: React.ElementType;
  }
> = {
  Visual: {
    label: "Visual",
    color: "#0056d2",
    bgClass: "bg-blue-50",
    textClass: "text-mathe-blue",
    Icon: Eye,
  },
  Auditory: {
    label: "Auditivo",
    color: "#10b981",
    bgClass: "bg-emerald-50",
    textClass: "text-emerald-600",
    Icon: Volume2,
  },
  Kinesthetic: {
    label: "Kinestésico",
    color: "#f59e0b",
    bgClass: "bg-amber-50",
    textClass: "text-amber-600",
    Icon: Zap,
  },
};

const chartConfig = {
  visual: { label: "Visual", color: "#0056d2" },
  auditory: { label: "Auditivo", color: "#10b981" },
  kinesthetic: { label: "Kinestésico", color: "#f59e0b" },
} satisfies ChartConfig;

const GRANULARITY_LABELS: Record<Granularity, string> = {
  day: "Día",
  month: "Mes",
  year: "Año",
};

// ── Constants ─────────────────────────────────────────────────────────────────

const RESULTS_PAGE_SIZE = 10;

const CLASSIFIER_LABEL: Record<string, string> = {
  xgboost: "XGBoost",
  simple_score: "Score simple",
};

const STYLE_OPTIONS: { value: VakStyleApi; label: string }[] = [
  { value: "Visual", label: "Visual" },
  { value: "Auditory", label: "Auditivo" },
  { value: "Kinesthetic", label: "Kinestésico" },
];

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-mathe-border/60", className)}
    />
  );
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
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | "…")[]>((acc, p, i, arr) => {
      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
      acc.push(p);
      return acc;
    }, []);

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
                ? "border-mathe-blue bg-mathe-blue text-white"
                : "border-mathe-border bg-mathe-white text-mathe-muted hover:bg-mathe-surface",
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

// ── Page ──────────────────────────────────────────────────────────────────────

export function StudentResultsHistoryPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const id = Number(studentId);

  const [student, setStudent] = useState<User | null>(null);
  const [studentLoading, setStudentLoading] = useState(true);

  const [stats, setStats] = useState<UserResultStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [evolution, setEvolution] = useState<UserEvolutionResult | null>(null);
  const [evolutionLoading, setEvolutionLoading] = useState(true);
  const [selectedGranularity, setSelectedGranularity] = useState<
    Granularity | undefined
  >(undefined);

  // Results table
  const [results, setResults] = useState<QuizResult[]>([]);
  const [resultsTotal, setResultsTotal] = useState(0);
  const [resultsPage, setResultsPage] = useState(1);
  const [resultsLoading, setResultsLoading] = useState(true);
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterStyle, setFilterStyle] = useState<string>("");
  const [filterClassifier, setFilterClassifier] = useState<string>("");

  useEffect(() => {
    if (!id) return;
    userService
      .getById(id)
      .then(setStudent)
      .catch(() => setStudent(null))
      .finally(() => setStudentLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setStatsLoading(true);
    resultService
      .getUserStats(id)
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setEvolutionLoading(true);
    resultService
      .getEvolution(id, { granularity: selectedGranularity })
      .then(setEvolution)
      .catch(() => setEvolution(null))
      .finally(() => setEvolutionLoading(false));
  }, [id, selectedGranularity]);

  useEffect(() => {
    if (!id) return;
    setResultsLoading(true);
    resultService
      .listByStudent(id, {
        page: resultsPage,
        limit: RESULTS_PAGE_SIZE,
        startDate: filterStartDate || undefined,
        endDate: filterEndDate || undefined,
        predominantStyle: filterStyle as VakStyleApi || undefined,
        classifierType: filterClassifier || undefined,
      })
      .then((res) => {
        setResults(res.items);
        setResultsTotal(res.total);
      })
      .catch(() => setResults([]))
      .finally(() => setResultsLoading(false));
  }, [id, resultsPage, filterStartDate, filterEndDate, filterStyle, filterClassifier]);

  const initials = student ? getInitials(student.name) : "?";
  const grade = gradeName(student?.academicGradeId ?? null);
  const predominantMeta = stats?.predominantStyle
    ? STYLE_META[stats.predominantStyle]
    : null;

  const chartData =
    evolution?.dataPoints.map((dp) => ({
      period: formatPeriod(dp.period, evolution.granularity),
      visual: Math.round(dp.avgVisualProbability * 10) / 10,
      auditory: Math.round(dp.avgAuditoryProbability * 10) / 10,
      kinesthetic: Math.round(dp.avgKinestheticProbability * 10) / 10,
    })) ?? [];

  const activeGranularity = evolution?.granularity;

  function toggleGranularity(g: Granularity) {
    setSelectedGranularity((prev) => (prev === g ? undefined : g));
  }

  const resultsTotalPages = Math.max(1, Math.ceil(resultsTotal / RESULTS_PAGE_SIZE));
  const hasFilters = Boolean(filterStartDate || filterEndDate || filterStyle || filterClassifier);

  function resetResultsPage() {
    setResultsPage(1);
  }

  function clearFilters() {
    setFilterStartDate("");
    setFilterEndDate("");
    setFilterStyle("");
    setFilterClassifier("");
    setResultsPage(1);
  }

  return (
    <motion.div
      className="grid gap-6"
      initial="hidden"
      animate="show"
      variants={stagger}
    >
      {/* ── Back ── */}
      <motion.div variants={fadeUp}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-mathe-muted transition-colors hover:text-mathe-ink"
        >
          <ArrowLeft className="size-4" />
          Volver a reportes
        </button>
      </motion.div>

      {/* ── Student header ── */}
      <motion.div variants={fadeUp}>
        {studentLoading ? (
          <div className="flex items-center gap-5">
            <Skeleton className="size-16 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-7 w-52" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-5">
            <div className="grid size-16 shrink-0 place-items-center rounded-full bg-mathe-blue text-xl font-bold text-white shadow-md">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-mathe-ink">
                {student?.name ?? `Estudiante #${id}`}
              </h1>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-mathe-muted">
                <BookOpen className="size-3.5 shrink-0" />
                {grade ?? "Sin grado asignado"}
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Stat cards ── */}
      <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-3">
        {/* Total evaluaciones */}
        <Card className="border-mathe-border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-[11px] font-semibold uppercase tracking-widest">
                Total evaluaciones
              </CardDescription>
              <span className="grid size-8 place-items-center rounded-lg bg-mathe-surface">
                <BarChart2 className="size-4 text-mathe-blue" />
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-10 w-16" />
            ) : (
              <>
                <p className="text-4xl font-bold text-mathe-ink tabular-nums">
                  {stats?.total ?? 0}
                </p>
                <p className="mt-1 text-xs text-mathe-muted">
                  {(stats?.total ?? 0) === 1
                    ? "evaluación completada"
                    : "evaluaciones completadas"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Estilo predominante */}
        <Card className="border-mathe-border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-[11px] font-semibold uppercase tracking-widest">
                Estilo predominante
              </CardDescription>
              {statsLoading ? null : predominantMeta ? (
                <span
                  className={cn(
                    "grid size-8 place-items-center rounded-lg",
                    predominantMeta.bgClass,
                  )}
                >
                  <predominantMeta.Icon
                    className={cn("size-4", predominantMeta.textClass)}
                  />
                </span>
              ) : (
                <span className="grid size-8 place-items-center rounded-lg bg-mathe-surface">
                  <BrainCircuit className="size-4 text-mathe-muted" />
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-10 w-32" />
            ) : predominantMeta ? (
              <>
                <p
                  className={cn(
                    "text-4xl font-bold",
                    predominantMeta.textClass,
                  )}
                >
                  {predominantMeta.label}
                </p>
                <p className="mt-1 text-xs text-mathe-muted">
                  estilo más frecuente
                </p>
              </>
            ) : (
              <p className="text-xl font-semibold text-mathe-muted">
                Sin datos
              </p>
            )}
          </CardContent>
        </Card>

        {/* Tipo de perfil */}
        <Card className="border-mathe-border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-[11px] font-semibold uppercase tracking-widest">
                Tipo de perfil
              </CardDescription>
              {!statsLoading && (
                <span
                  className={cn(
                    "grid size-8 place-items-center rounded-lg",
                    stats?.profile === "Estable"
                      ? "bg-emerald-50"
                      : stats?.profile === "Variable"
                        ? "bg-amber-50"
                        : "bg-mathe-surface",
                  )}
                >
                  <TrendingUp
                    className={cn(
                      "size-4",
                      stats?.profile === "Estable"
                        ? "text-emerald-600"
                        : stats?.profile === "Variable"
                          ? "text-amber-600"
                          : "text-mathe-muted",
                    )}
                  />
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-10 w-24" />
            ) : stats?.profile ? (
              <>
                <p
                  className={cn(
                    "text-4xl font-bold",
                    stats.profile === "Estable"
                      ? "text-emerald-600"
                      : "text-amber-600",
                  )}
                >
                  {stats.profile}
                </p>
                <p className="mt-1 text-xs text-mathe-muted">
                  {stats.profile === "Estable"
                    ? "estilo consistente en el tiempo"
                    : "estilo varía entre evaluaciones"}
                </p>
              </>
            ) : (
              <p className="text-xl font-semibold text-mathe-muted">
                Sin datos
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Line chart ── */}
      <motion.div variants={fadeUp}>
        <Card className="border-mathe-border shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <CalendarRange className="size-4 text-mathe-muted" />
                  <CardTitle className="text-sm font-semibold uppercase tracking-widest text-mathe-muted">
                    Evolución del estilo de aprendizaje
                  </CardTitle>
                </div>
                {evolution && !evolutionLoading && (
                  <p className="text-xs text-mathe-muted">
                    {evolution.totalEvaluations}{" "}
                    {evolution.totalEvaluations === 1
                      ? "evaluación"
                      : "evaluaciones"}{" "}
                    · {formatRangeDate(evolution.from)} —{" "}
                    {formatRangeDate(evolution.to)}
                  </p>
                )}
              </div>
              {/* Granularity toggle */}
              <div className="flex items-center gap-1 self-start rounded-xl border border-mathe-border bg-mathe-surface p-1">
                {(["day", "month", "year"] as Granularity[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGranularity(g)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                      activeGranularity === g
                        ? "bg-mathe-white text-mathe-ink shadow-sm"
                        : "text-mathe-muted hover:text-mathe-ink",
                    )}
                  >
                    {GRANULARITY_LABELS[g]}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {evolutionLoading ? (
              <Skeleton className="h-64 w-full rounded-xl" />
            ) : !chartData.length ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <span className="grid size-14 place-items-center rounded-2xl bg-mathe-surface shadow-sm">
                  <BarChart2 className="size-7 text-mathe-muted" />
                </span>
                <div>
                  <p className="font-semibold text-mathe-ink">
                    Sin datos de evolución
                  </p>
                  <p className="mt-1 text-sm text-mathe-muted">
                    Este estudiante aún no tiene evaluaciones registradas.
                  </p>
                </div>
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-64 w-full">
                <LineChart
                  data={chartData}
                  margin={{ top: 8, right: 16, left: -16, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#d9e3f5"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend
                    wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
                    formatter={(value) => {
                      const map: Record<string, string> = {
                        visual: "Visual",
                        auditory: "Auditivo",
                        kinesthetic: "Kinestésico",
                      };
                      return map[value] ?? value;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="visual"
                    stroke="#0056d2"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#0056d2", strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="auditory"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="kinesthetic"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#f59e0b", strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Results table ── */}
      <motion.div variants={fadeUp} className="flex flex-col gap-4">
        {/* Section header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-mathe-ink">
              Historial de evaluaciones
            </h2>
            {!resultsLoading && (
              <p className="mt-0.5 text-xs text-mathe-muted">
                {resultsTotal}{" "}
                {resultsTotal === 1
                  ? "evaluación encontrada"
                  : "evaluaciones encontradas"}
              </p>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card className="border-mathe-border shadow-sm">
          <CardContent className="py-0">
            <div className="flex flex-wrap items-end gap-4">

              {/* Date range */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-mathe-muted">
                  Período
                </span>
                <div className="flex items-center gap-2">
                  <DatePickerInput
                    value={filterStartDate}
                    onChange={(v) => {
                      setFilterStartDate(v);
                      resetResultsPage();
                    }}
                    placeholder="Desde"
                    className="w-36"
                  />
                  <span className="text-mathe-muted">—</span>
                  <DatePickerInput
                    value={filterEndDate}
                    onChange={(v) => {
                      setFilterEndDate(v);
                      resetResultsPage();
                    }}
                    placeholder="Hasta"
                    className="w-36"
                  />
                </div>
              </div>

              {/* Style */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-mathe-muted">
                  Estilo
                </span>
                <Select
                  value={filterStyle || "all"}
                  onValueChange={(v) => {
                    setFilterStyle(v === "all" ? "" : v);
                    resetResultsPage();
                  }}
                >
                  <SelectTrigger className="h-10 w-44 rounded-pill border-mathe-border">
                    <SelectValue placeholder="Todos los estilos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estilos</SelectItem>
                    {STYLE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Classifier (etiqueta) */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-mathe-muted">
                  Etiqueta
                </span>
                <Select
                  value={filterClassifier || "all"}
                  onValueChange={(v) => {
                    setFilterClassifier(v === "all" ? "" : v);
                    resetResultsPage();
                  }}
                >
                  <SelectTrigger className="h-10 w-44 rounded-pill border-mathe-border">
                    <SelectValue placeholder="Cualquier etiqueta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Cualquiera</SelectItem>
                    <SelectItem value="xgboost">XGBoost</SelectItem>
                    <SelectItem value="simple_score">Score simple</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear */}
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex h-10 items-center gap-1.5 self-end rounded-pill border border-mathe-border bg-mathe-white px-3 text-xs font-semibold text-mathe-muted transition-colors hover:bg-mathe-surface hover:text-mathe-ink"
                >
                  <X className="size-3.5" />
                  Limpiar
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Table card */}
        <div className="overflow-hidden rounded-2xl border border-mathe-border bg-mathe-white shadow-sm">
          {resultsLoading ? (
            <>
              <div className="flex gap-6 border-b border-mathe-border bg-mathe-surface/60 px-6 py-3">
                {[12, 24, 16, 20, 16, 20].map((w, i) => (
                  <Skeleton key={i} className={`h-3 w-${w}`} />
                ))}
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-5 border-b border-mathe-border px-6 py-4 last:border-0"
                >
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-6 w-24 rounded-pill" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="ml-auto h-8 w-28 rounded-pill" />
                </div>
              ))}
            </>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <span className="grid size-14 place-items-center rounded-2xl bg-mathe-surface shadow-sm">
                <ClipboardList className="size-7 text-mathe-muted" />
              </span>
              <div>
                <p className="font-semibold text-mathe-ink">
                  {hasFilters
                    ? "Sin resultados para los filtros aplicados"
                    : "Sin evaluaciones registradas"}
                </p>
                <p className="mt-1 text-sm text-mathe-muted">
                  {hasFilters
                    ? "Prueba ajustando o limpiando los filtros."
                    : "Este estudiante aún no ha completado ningún cuestionario."}
                </p>
              </div>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 rounded-pill border border-mathe-border bg-mathe-white px-4 py-2 text-sm font-semibold text-mathe-muted transition-colors hover:bg-mathe-surface"
                >
                  <X className="size-3.5" />
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-mathe-border bg-mathe-surface/60">
                  {[
                    "#",
                    "Estilo predominante",
                    "Confianza",
                    "Etiqueta",
                    "Fecha",
                    "",
                  ].map((h, i) => (
                    <th
                      key={i}
                      className={cn(
                        "px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-mathe-muted",
                        i === 5 && "text-right",
                      )}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <motion.tbody
                key={`${resultsPage}-${filterStyle}-${filterClassifier}-${filterStartDate}-${filterEndDate}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.18 }}
              >
                {results.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-mathe-border transition-colors last:border-0 hover:bg-blue-50/30"
                  >
                    <td className="px-5 py-4">
                      <code className="font-mono text-sm font-semibold text-mathe-blue">
                        #{r.id}
                      </code>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1 w-max">
                        {r.predominantStyle ? (
                          <VakBadge style={toDisplayStyle(r.predominantStyle)} />
                        ) : (
                          <span className="text-sm text-mathe-muted">—</span>
                        )}
                        {/* {r.secondaryStyle && (
                          <span className="text-xs text-mathe-muted">
                            2°:{" "}
                            {toDisplayStyle(r.secondaryStyle as VakStyleApi)}
                          </span>
                        )} */}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {r.predominantConfidence != null ? (
                        <span className="text-sm font-bold tabular-nums text-mathe-ink">
                          {r.predominantConfidence.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-sm text-mathe-muted">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-lg bg-mathe-surface px-2.5 py-1 text-xs font-semibold text-mathe-ink ring-1 ring-mathe-border">
                        {r.classifierType
                          ? (CLASSIFIER_LABEL[r.classifierType] ??
                            r.classifierType)
                          : "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-mathe-muted">
                      {new Date(r.createdAt).toLocaleDateString("es-PE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            ROUTING.RESULT_DETAIL.replace(
                              ":id",
                              String(r.id),
                            ),
                          )
                        }
                        className="inline-flex h-8 items-center gap-1.5 rounded-pill border border-mathe-border bg-mathe-white px-3 text-xs font-semibold text-mathe-ink transition-colors hover:bg-mathe-surface"
                      >
                        <ExternalLink className="size-3.5" />
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </motion.tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!resultsLoading && resultsTotal > RESULTS_PAGE_SIZE && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-mathe-muted">
              Página{" "}
              <span className="font-semibold text-mathe-ink">{resultsPage}</span>{" "}
              de{" "}
              <span className="font-semibold text-mathe-ink">
                {resultsTotalPages}
              </span>{" "}
              ·{" "}
              <span className="font-semibold text-mathe-ink">{resultsTotal}</span>{" "}
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
    </motion.div>
  );
}
