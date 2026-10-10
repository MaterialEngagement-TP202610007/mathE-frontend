import { useState } from "react"
import { Loader2, PlayCircle, RotateCcw } from "lucide-react"
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
import { getErrorMessage } from "@/lib/http"
import { questionnaireService } from "../services/questionnaire.service"
import { useQuizStore } from "../store/quiz.store"
import { useQuizStatusStore } from "../store/quiz-status.store"
import { isQuestionnaireAbandoned } from "../utils/complete-questionnaire"

interface ActiveQuestionnaireDialogProps {
  open: boolean
  /** Id of the questionnaire that is still in progress server-side. */
  questionnaireId: number | null
  /** Resume the active questionnaire. */
  onContinue: () => void
  /** Runs once the active questionnaire was abandoned and the local session cleared. */
  onStartNew: () => void
  /** The dialog was closed without choosing (Escape, overlay or close button). */
  onDismiss: () => void
}

/**
 * Asks the student whether to resume the questionnaire already in progress or
 * abandon it and start a new one (HU-16 / HU-29). Abandoning reuses
 * `PATCH /questionnaires/:id/abandon`; on failure the dialog stays usable.
 */
export function ActiveQuestionnaireDialog({
  open,
  questionnaireId,
  onContinue,
  onStartNew,
  onDismiss,
}: ActiveQuestionnaireDialogProps) {
  const [abandoning, setAbandoning] = useState(false)

  const handleStartNew = async () => {
    if (questionnaireId === null || abandoning) return
    setAbandoning(true)
    try {
      await questionnaireService.abandon(questionnaireId)
    } catch (error) {
      // Already abandoned (e.g. from another tab) is the state we want: carry on.
      if (!isQuestionnaireAbandoned(error)) {
        toast.error(
          getErrorMessage(error, "No se pudo descartar el cuestionario en curso. Intenta de nuevo."),
        )
        setAbandoning(false)
        return
      }
    }
    // The abandoned questionnaire must never be resumed from the local copy.
    useQuizStore.getState().clearSession()
    useQuizStatusStore.getState().setAvailability("available")
    setAbandoning(false)
    onStartNew()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !abandoning) onDismiss()
      }}
    >
      <DialogContent className="max-w-md rounded-3xl p-7">
        <DialogHeader className="pr-6">
          <DialogTitle>Tienes un cuestionario en curso</DialogTitle>
          <DialogDescription className="leading-relaxed">
            Puedes continuarlo donde lo dejaste o iniciar uno nuevo. Si inicias uno
            nuevo, el cuestionario en curso se abandonará y sus respuestas no se
            conservarán.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleStartNew}
            disabled={abandoning || questionnaireId === null}
            className="h-11 rounded-pill px-6 font-semibold"
          >
            {abandoning ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : (
              <RotateCcw data-icon="inline-start" />
            )}
            Iniciar nuevo
          </Button>
          <Button
            type="button"
            onClick={onContinue}
            disabled={abandoning}
            className="h-11 rounded-pill bg-mathe-blue px-6 font-semibold hover:bg-mathe-blue-deep"
          >
            <PlayCircle data-icon="inline-start" />
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
