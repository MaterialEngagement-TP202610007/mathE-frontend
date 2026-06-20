import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { toast } from "sonner"
import {
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  Edit2,
  GraduationCap,
  Hash,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
  User,
  X,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SchoolSearchBox } from "@/features/auth/components/SchoolSearchBox"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { ROLE } from "@/config/constant.config"
import { ACADEMIC_GRADES } from "@/data/academic-grades"
import { userService } from "@/features/users/services/user.service"
import type { UpdateProfilePayload } from "@/features/users/interfaces/user.interface"
import { getSchoolById, type School } from "@/shared/services/school.service"
import { authService } from "@/features/auth/services/auth.service"

// ── Animations ───────────────────────────────────────────────────────────────

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
}

const slideIn = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

function formatBirthDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

const ROLE_LABELS: Record<number, string> = {
  1: "Administrador",
  2: "Docente",
  3: "Estudiante",
}

// ── Info row ──────────────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="flex items-start gap-3 py-3.5">
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-mathe-surface text-mathe-muted">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-mathe-muted">{label}</p>
        <p className="mt-0.5 truncate text-sm font-medium text-mathe-ink">{value ?? "—"}</p>
      </div>
    </div>
  )
}

// ── Skeleton row ──────────────────────────────────────────────────────────────

function SkeletonInfoRow() {
  return (
    <div className="flex items-start gap-3 py-3.5">
      <div className="mt-0.5 size-8 shrink-0 animate-pulse rounded-xl bg-mathe-border/60" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-20 animate-pulse rounded bg-mathe-border/60" />
        <div className="h-4 w-36 animate-pulse rounded bg-mathe-border/60" />
      </div>
    </div>
  )
}

// ── Form field wrapper ────────────────────────────────────────────────────────

function FormField({
  id,
  label,
  children,
}: {
  id?: string
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-2">
      <Label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-wide text-mathe-muted"
      >
        {label}
      </Label>
      {children}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const roleId = useAuthStore((s) => s.roleId)
  const setSession = useAuthStore((s) => s.setSession)

  const [school, setSchool] = useState<School | null>(null)
  const [loadingSchool, setLoadingSchool] = useState(false)

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Edit form fields
  const [editName, setEditName] = useState("")
  const [editBirthDate, setEditBirthDate] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editGradeId, setEditGradeId] = useState<number | null>(null)
  const [editSchoolId, setEditSchoolId] = useState<number | null>(null)
  const [editSchoolName, setEditSchoolName] = useState("")

  useEffect(() => {
    const schoolId = user?.school?.id
    if (!schoolId) return
    setLoadingSchool(true)
    getSchoolById(schoolId)
      .then((s) => setSchool(s))
      .catch(() => setSchool(null))
      .finally(() => setLoadingSchool(false))
  // run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function openEdit() {
    if (!user) return
    setEditName(user.name)
    setEditBirthDate(user.birthDate ?? "")
    setEditPhone(user.phoneNumber ?? "")
    setEditGradeId(user.academicGradeId)
    setEditSchoolId(user.school?.id ?? null)
    setEditSchoolName(school?.cenEdu ?? "")
    setIsEditing(true)
  }

  async function handleSave() {
    if (!user) return
    setIsSaving(true)
    try {
      const payload: UpdateProfilePayload = {}

      const trimName = editName.trim()
      if (trimName && trimName !== user.name) payload.name = trimName
      if (editBirthDate && editBirthDate !== (user.birthDate ?? ""))
        payload.birthDate = editBirthDate
      const trimPhone = editPhone.trim()
      if (trimPhone !== (user.phoneNumber ?? "")) {
        if (trimPhone) payload.phoneNumber = trimPhone
      }
      if (editGradeId !== user.academicGradeId)
        payload.academicGradeId = editGradeId ?? undefined
      if (editSchoolId !== (user.school?.id ?? null))
        payload.schoolId = editSchoolId ?? undefined

      await userService.updateProfile(user.id, payload)
      const { user: refreshed } = await authService.me()
      setSession(refreshed)

      if (editSchoolId) {
        getSchoolById(editSchoolId)
          .then(setSchool)
          .catch(() => setSchool(null))
      } else {
        setSchool(null)
      }

      toast.success("Perfil actualizado correctamente")
      setIsEditing(false)
    } catch {
      toast.error("Error al actualizar el perfil. Intenta de nuevo.")
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) return null

  const initials = getInitials(user.name)
  const gradeName = ACADEMIC_GRADES.find((g) => g.id === user.academicGradeId)?.name
  const roleLabel = user.roleId ? (ROLE_LABELS[user.roleId] ?? "Usuario") : "Usuario"

  return (
    <motion.div className="grid gap-8" initial="hidden" animate="show" variants={stagger}>

      {/* ── Hero card ── */}
      <motion.div
        variants={fadeUp}
        className="flex flex-wrap items-start gap-6 rounded-2xl border border-mathe-border bg-mathe-white p-8 shadow-sm"
      >
        {/* Avatar */}
        <div className="grid size-20 shrink-0 place-items-center rounded-full bg-mathe-blue text-2xl font-bold text-mathe-white shadow-md ring-4 ring-blue-100">
          {initials}
        </div>

        {/* Name, badges, email */}
        <div className="flex flex-1 flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-mathe-ink">{user.name}</h1>
            <p className="mt-0.5 text-sm text-mathe-muted">{user.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-blue-50 px-2.5 py-1 text-xs font-semibold text-mathe-blue">
                <Shield className="size-3.5" />
                {roleLabel}
              </span>
              {gradeName && roleId !== ROLE.TEACHER && (
                <span className="inline-flex items-center gap-1.5 rounded-pill bg-mathe-surface px-2.5 py-1 text-xs font-semibold text-mathe-muted">
                  <GraduationCap className="size-3.5" />
                  {gradeName}
                </span>
              )}
              {user.isActive && (
                <span className="inline-flex items-center gap-1.5 rounded-pill bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                  <CheckCircle2 className="size-3.5" />
                  Activo
                </span>
              )}
            </div>
          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={openEdit}
              className="inline-flex h-10 items-center gap-2 rounded-pill border border-mathe-border bg-mathe-white px-5 text-sm font-semibold text-mathe-ink transition-colors hover:bg-mathe-surface hover:text-mathe-blue"
            >
              <Edit2 className="size-4" />
              Editar perfil
            </button>
          )}
        </div>
      </motion.div>

      {/* ── Body (view / edit) ── */}
      <AnimatePresence mode="wait">
        {isEditing ? (

          /* ── Edit form ── */
          <motion.div
            key="edit"
            variants={slideIn}
            initial="hidden"
            animate="show"
            exit="exit"
            className="rounded-2xl border border-mathe-border bg-mathe-white p-6 shadow-sm"
          >
            <div className="mb-6 flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-xl bg-mathe-surface">
                <Edit2 className="size-4 text-mathe-muted" />
              </span>
              <h2 className="text-sm font-bold text-mathe-ink">Editar información personal</h2>
            </div>

            <div className="grid gap-5 tablet:grid-cols-2">
              <FormField id="edit-name" label="Nombre completo">
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Tu nombre completo"
                  className="h-11 rounded-pill"
                />
              </FormField>

              <FormField id="edit-birth" label="Fecha de nacimiento">
                <Input
                  id="edit-birth"
                  type="date"
                  value={editBirthDate}
                  onChange={(e) => setEditBirthDate(e.target.value)}
                  className="h-11 rounded-pill"
                />
              </FormField>

              <FormField id="edit-phone" label="Teléfono">
                <Input
                  id="edit-phone"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+51 999 999 999"
                  className="h-11 rounded-pill"
                />
              </FormField>

              {roleId !== ROLE.TEACHER && (
                <FormField label="Grado académico">
                  <Select
                    value={editGradeId?.toString() ?? ""}
                    onValueChange={(v) => setEditGradeId(v ? Number(v) : null)}
                  >
                    <SelectTrigger className="h-11 rounded-pill">
                      <SelectValue placeholder="Selecciona tu grado" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACADEMIC_GRADES.map((g) => (
                        <SelectItem key={g.id} value={g.id.toString()}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              )}

              <div className="tablet:col-span-2">
                <SchoolSearchBox
                  label="Institución educativa"
                  name="edit-school"
                  value={editSchoolId}
                  displayValue={editSchoolName}
                  onSelect={(s) => {
                    setEditSchoolId(s.id)
                    setEditSchoolName(s.cenEdu)
                  }}
                />
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-mathe-border pt-5">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="inline-flex h-10 items-center gap-2 rounded-pill border border-mathe-border px-5 text-sm font-semibold text-mathe-ink transition-colors hover:bg-mathe-surface disabled:opacity-50"
              >
                <X className="size-4" />
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => { void handleSave() }}
                disabled={isSaving}
                className="inline-flex h-10 items-center gap-2 rounded-pill bg-mathe-blue px-6 text-sm font-semibold text-mathe-white transition-colors hover:bg-mathe-blue/90 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                {isSaving ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </motion.div>

        ) : (

          /* ── View mode ── */
          <motion.div
            key="view"
            className="grid gap-6 laptop:grid-cols-2"
            initial="hidden"
            animate="show"
            variants={stagger}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
          >
            {/* Personal info */}
            <motion.div
              variants={fadeUp}
              className="rounded-2xl border border-mathe-border bg-mathe-white p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center gap-2">
                {/* <span className="grid size-8 place-items-center rounded-xl bg-mathe-surface">
                  <User className="size-4 text-mathe-muted" />
                </span> */}
                <h2 className="text-sm font-bold text-mathe-ink">Información personal</h2>
              </div>
              <div className="divide-y divide-mathe-border">
                <InfoRow icon={<User className="size-4" />} label="Nombre" value={user.name} />
                <InfoRow
                  icon={<Mail className="size-4" />}
                  label="Correo electrónico"
                  value={user.email}
                />
                <InfoRow
                  icon={<Calendar className="size-4" />}
                  label="Fecha de nacimiento"
                  value={user.birthDate ? formatBirthDate(user.birthDate) : null}
                />
                <InfoRow
                  icon={<Phone className="size-4" />}
                  label="Teléfono"
                  value={user.phoneNumber}
                />
                {roleId !== ROLE.TEACHER && (
                  <InfoRow
                    icon={<GraduationCap className="size-4" />}
                    label="Grado académico"
                    value={gradeName}
                  />
                )}
              </div>
            </motion.div>

            {/* School info */}
            <motion.div
              variants={fadeUp}
              className="rounded-2xl border border-mathe-border bg-mathe-white p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center gap-2">
                {/* <span className="grid size-8 place-items-center rounded-xl bg-mathe-surface">
                  <Building2 className="size-4 text-mathe-muted" />
                </span> */}
                <h2 className="text-sm font-bold text-mathe-ink">Institución educativa</h2>
              </div>

              {loadingSchool ? (
                <div className="divide-y divide-mathe-border">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <SkeletonInfoRow key={i} />
                  ))}
                </div>
              ) : school ? (
                <div className="divide-y divide-mathe-border">
                  <InfoRow
                    icon={<Building2 className="size-4" />}
                    label="Nombre"
                    value={school.cenEdu}
                  />
                  <InfoRow
                    icon={<BookOpen className="size-4" />}
                    label="Nivel"
                    value={school.level}
                  />
                  <InfoRow
                    icon={<MapPin className="size-4" />}
                    label="Distrito"
                    value={school.district}
                  />
                  <InfoRow
                    icon={<MapPin className="size-4" />}
                    label="Dirección"
                    value={school.address}
                  />
                  <InfoRow
                    icon={<Hash className="size-4" />}
                    label="Código modular"
                    value={school.codMod}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 rounded-xl bg-mathe-surface py-10 text-center">
                  <Building2 className="size-9 text-mathe-muted/40" />
                  <div>
                    <p className="text-sm font-semibold text-mathe-ink">
                      Sin institución registrada
                    </p>
                    <p className="mt-0.5 text-xs text-mathe-muted">
                      Agrega tu colegio editando el perfil
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={openEdit}
                    className="text-xs font-semibold text-mathe-blue hover:underline"
                  >
                    Agregar colegio
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>

        )}
      </AnimatePresence>

    </motion.div>
  )
}
