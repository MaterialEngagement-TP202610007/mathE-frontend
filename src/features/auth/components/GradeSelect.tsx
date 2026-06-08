import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ACADEMIC_GRADES } from "@/data/academic-grades"

interface GradeSelectProps {
  label: string
  name: string
  value: number | null
  onChange: (academicGradeId: number) => void
  error?: string
}

const PRIMARIA = ACADEMIC_GRADES.filter((g) => g.level === "primaria")
const SECUNDARIA = ACADEMIC_GRADES.filter((g) => g.level === "secundaria")

export function GradeSelect({
  label,
  name,
  value,
  onChange,
  error,
}: GradeSelectProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Select
        value={value === null ? undefined : String(value)}
        onValueChange={(v) => onChange(Number(v))}
      >
        <SelectTrigger id={name} aria-invalid={Boolean(error)}>
          <SelectValue placeholder="Seleccionar grado" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Primaria</SelectLabel>
            {PRIMARIA.map((g) => (
              <SelectItem key={g.id} value={String(g.id)}>
                {g.name}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Secundaria</SelectLabel>
            {SECUNDARIA.map((g) => (
              <SelectItem key={g.id} value={String(g.id)}>
                {g.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
