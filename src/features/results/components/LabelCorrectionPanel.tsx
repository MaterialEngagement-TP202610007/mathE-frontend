import { useState } from "react"
import { Loader2, PencilLine, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { VakBadge } from "@/features/dashboard/components/VakBadge"
import { getErrorMessage } from "@/lib/http"
import { resultService } from "../services/result.service"
import { isVakStyleApi, toDisplayStyle } from "../utils/vak"
import type { QuizResult, VakStyleApi } from "../interfaces/result.interface"

/** Exactly the values accepted by `PATCH /api/results/:id/correct-label`. */
const CORRECTABLE_LABELS: VakStyleApi[] = ["Visual", "Auditory", "Kinesthetic"]

export type LabelCorrection = Pick<QuizResult, "correctedVakLabel" | "correctedAt">

interface LabelCorrectionPanelProps {
  result: QuizResult
  /** Called after the backend accepted the correction. */
  onCorrected: (correction: LabelCorrection) => void
}

function formatCorrectedAt(value: string): string | null {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" })
}

/**
 * HU-44 (pilot phase): lets a teacher correct the VAK label of a result. The
 * backend stores it on the result and marks the matching ML dataset row as
 * teacher-validated, so it is used to retrain the model.
 */
export function LabelCorrectionPanel({ result, onCorrected }: LabelCorrectionPanelProps) {
  const correctedLabel = isVakStyleApi(result.correctedVakLabel) ? result.correctedVakLabel : null
  const predictedLabel = isVakStyleApi(result.predominantStyle) ? result.predominantStyle : null
  const effectiveLabel = correctedLabel ?? predictedLabel

  const [selected, setSelected] = useState<VakStyleApi | null>(effectiveLabel)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSave = selected !== null && selected !== effectiveLabel && !saving
  const correctedAtLabel = result.correctedAt ? formatCorrectedAt(result.correctedAt) : null

  const handleConfirm = async () => {
    if (!selected || saving) return
    setSaving(true)
    setError(null)
    try {
      const updated = await resultService.correctLabel(result.id, selected)
      // The deployed backend does not echo `correctedVakLabel`; the accepted
      // request value is the stored label.
      const label = isVakStyleApi(updated.correctedVakLabel) ? updated.correctedVakLabel : selected
      onCorrected({ correctedVakLabel: label, correctedAt: updated.correctedAt ?? undefined })
      setConfirmOpen(false)
      toast.success(`Etiqueta corregida a ${toDisplayStyle(label)}.`)
    } catch (err) {
      setConfirmOpen(false)
      setError(getErrorMessage(err, "No se pudo guardar la corrección. Intenta de nuevo."))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section
      aria-labelledby="label-correction-title"
      className="rounded-2xl border border-mathe-border bg-mathe-white p-6 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-mathe-blue">
          <ShieldCheck className="size-4" />
        </span>
        <div>
          <h2
            id="label-correction-title"
            className="text-xs font-semibold uppercase tracking-widest text-mathe-muted"
          >
            Corrección de etiqueta (fase piloto)
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-mathe-muted">
            Si el estilo predicho no corresponde al estudiante, corrígelo. La etiqueta
            corregida se usará para entrenar el modelo.
          </p>
        </div>
      </div>

      <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-4">
        <div>
          <dt className="text-xs text-mathe-muted">Etiqueta predicha</dt>
          <dd className="mt-1">
            <VakBadge style={toDisplayStyle(result.predominantStyle)} />
          </dd>
        </div>
        {result.correctedVakLabel !== undefined ? (
          <div>
            <dt className="text-xs text-mathe-muted">Etiqueta corregida</dt>
            <dd className="mt-1">
              {correctedLabel ? (
                <VakBadge style={toDisplayStyle(correctedLabel)} />
              ) : (
                <span className="text-sm font-medium text-mathe-ink">Sin corrección</span>
              )}
            </dd>
            {correctedLabel && correctedAtLabel ? (
              <dd className="mt-1 text-xs text-mathe-muted">Corregido el {correctedAtLabel}</dd>
            ) : null}
          </div>
        ) : null}
      </dl>

      <div className="mt-5 flex flex-col gap-3 tablet:flex-row tablet:items-end">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="label-correction-select" className="text-xs text-mathe-muted">
            Nueva etiqueta
          </label>
          <Select
            value={selected ?? undefined}
            onValueChange={(value) => {
              if (isVakStyleApi(value)) setSelected(value)
              setError(null)
            }}
            disabled={saving}
          >
            <SelectTrigger
              id="label-correction-select"
              className="h-11 w-full rounded-pill tablet:w-52"
            >
              <SelectValue placeholder="Selecciona un estilo" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {CORRECTABLE_LABELS.map((label) => (
                  <SelectItem key={label} value={label}>
                    {toDisplayStyle(label)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={!canSave}
          className="h-11 rounded-pill bg-mathe-blue px-6 font-semibold hover:bg-mathe-blue-deep"
        >
          {saving ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <PencilLine data-icon="inline-start" />
          )}
          Guardar corrección
        </Button>
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <Dialog
        open={confirmOpen}
        onOpenChange={(next) => {
          if (!saving) setConfirmOpen(next)
        }}
      >
        <DialogContent className="max-w-md rounded-3xl p-7">
          <DialogHeader className="pr-6">
            <DialogTitle>¿Confirmar corrección?</DialogTitle>
            <DialogDescription className="leading-relaxed">
              Esta corrección actualizará la etiqueta usada para entrenar el modelo.
              {selected ? (
                <>
                  {" "}
                  Nueva etiqueta:{" "}
                  <span className="font-semibold text-mathe-ink">{toDisplayStyle(selected)}</span>.
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={saving}
              className="h-11 rounded-pill px-6 font-semibold"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={saving}
              className="h-11 rounded-pill bg-mathe-blue px-6 font-semibold hover:bg-mathe-blue-deep"
            >
              {saving ? <Loader2 data-icon="inline-start" className="animate-spin" /> : null}
              Confirmar corrección
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
