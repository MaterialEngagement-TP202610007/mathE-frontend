import { useEffect, useRef, useState } from "react"
import { useNavigate, useBlocker } from "react-router"
import { Loader2, LogOut, X } from "lucide-react"
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
import { ROUTING } from "@/config/constant.config"
import { useIdleLogout } from "@/features/auth/hooks/useIdleLogout"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { HttpError, getErrorMessage } from "@/lib/http"
import { MatheLogo } from "@/shared/components/icons/MatheLogo"
import { useQuizIntroStore } from "../store/quiz-intro.store"
import { useQuizStore } from "../store/quiz.store"
import { questionnaireService } from "../services/questionnaire.service"
import { GeneratingQuiz } from "../components/GeneratingQuiz"
import { QuizRunner } from "../components/QuizRunner"
import { AbandonDialog } from "../components/AbandonDialog"
import { ActiveQuestionnaireDialog } from "../components/ActiveQuestionnaireDialog"
import { ResultSummary } from "@/features/results/components/ResultSummary"
import type {
  QuestionnaireResponse,
  QuizCompletionResult,
} from "../interfaces/questionnaire.interface"

/**
 * Phase machine:
 *  checking   → resolve localStorage / accepted / GET active
 *  choosing   → an active questionnaire exists: continue it or start a new one
 *  generating → POST /questionnaires in flight
 *  error      → generation failed: stay on screen with "Reintentar"
 *  ready      → POST succeeded, waiting for user to click "Continuar"
 *  questions  → active quiz
 *  result     → quiz submitted, showing result summary inline
 */
type Phase = "checking" | "choosing" | "generating" | "error" | "ready" | "questions" | "result"

export function QuizPage() {
  const accepted = useQuizIntroStore((s) => s.accepted)
  const resetQuizIntro = useQuizIntroStore((s) => s.reset)
  const navigate = useNavigate()
  const { startSession, clearSession } = useQuizStore()
  const logout = useAuthStore((s) => s.logout)

  const [phase, setPhase] = useState<Phase>("checking")
  const [manualAbandon, setManualAbandon] = useState(false)
  const [quizResult, setQuizResult] = useState<QuizCompletionResult | null>(null)
  // Active questionnaire fetched after a 409; only loaded into the store if the student continues it.
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [pendingActive, setPendingActive] = useState<QuestionnaireResponse | null>(null)
  const localQuestionnaireId = useQuizStore((s) => s.session?.questionnaireId ?? null)
  const abandonedRef = useRef(false)
  // Signing out must leave the page without the abandon prompt.
  const loggingOutRef = useRef(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  // Guards against a duplicate POST when effects re-run (e.g. React StrictMode).
  const createStartedRef = useRef(false)

  // ── Navigation blocker (only active while answering) ─────────
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      phase === "questions" &&
      !abandonedRef.current &&
      !loggingOutRef.current &&
      currentLocation.pathname !== nextLocation.pathname,
  )

  // ── Inactivity logout (the quiz lives outside DashboardLayout) ──
  useIdleLogout({
    onBeforeLogout: () => {
      loggingOutRef.current = true
    },
  })

  // ── Browser / tab close guard ────────────────────────────────
  useEffect(() => {
    if (phase !== "questions") return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [phase])

  // ── Initial phase resolution (runs once on mount) ────────────
  useEffect(() => {
    const existing = useQuizStore.getState().session
    if (existing?.status === "in_progress") {
      // Consent means the student asked for a new questionnaire: let them choose.
      setPhase(accepted ? "choosing" : "questions")
      return
    }
    if (accepted) {
      setPhase("generating")
      return
    }
    questionnaireService
      .getActive()
      .then((data) => {
        startSession(data)
        setPhase("questions")
      })
      .catch((error: unknown) => {
        if (error instanceof HttpError && error.status === 404) {
          toast.info("No tienes un cuestionario en progreso. Inicia uno desde tu panel.")
        } else {
          toast.error(getErrorMessage(error, "No se pudo cargar el cuestionario."))
        }
        navigate(ROUTING.DASHBOARD, { replace: true })
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Create questionnaire once generating phase is entered ────
  useEffect(() => {
    if (phase !== "generating" || createStartedRef.current) return
    createStartedRef.current = true
    questionnaireService
      .create()
      .then((data) => {
        startSession(data)
        setPhase("ready")
      })
      .catch(async (error: unknown) => {
        const hasActive =
          error instanceof HttpError &&
          (error.status === 409 ||
            /active questionnaire/i.test(error.serverMessage ?? ""))

        if (hasActive) {
          // Ask whether to continue the questionnaire already in progress or start a new one.
          try {
            setPendingActive(await questionnaireService.getActive())
            setPhase("choosing")
            return
          } catch {
            // fall through to the generic error below
          }
        }

        // Keep the student here with a retry instead of bouncing them to the dashboard.
        setGenerationError(getErrorMessage(error, "No se pudo generar el cuestionario. Intenta de nuevo."))
        setPhase("error")
      })
      // Consent is single-use: returning to /cuestionario must not create another questionnaire.
      .finally(() => resetQuizIntro())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // ── Handlers ─────────────────────────────────────────────────
  const isAbandonVisible = manualAbandon || blocker.state === "blocked"

  const handleAbandonConfirm = async () => {
    const questionnaireId = useQuizStore.getState().session?.questionnaireId
    abandonedRef.current = true

    if (questionnaireId) {
      try {
        await questionnaireService.abandon(questionnaireId)
      } catch {
        // ignore — navigate regardless
      }
    }

    clearSession()
    resetQuizIntro()
    setManualAbandon(false)
    if (blocker.state === "blocked") blocker.reset()
    navigate(ROUTING.DASHBOARD, { replace: true })
  }

  const handleAbandonCancel = () => {
    setManualAbandon(false)
    if (blocker.state === "blocked") blocker.reset()
  }

  // Re-runs the same creation flow (including the active-questionnaire check).
  const handleRetryGeneration = () => {
    setGenerationError(null)
    createStartedRef.current = false
    setPhase("generating")
  }

  const handleContinueActive = () => {
    if (pendingActive) startSession(pendingActive)
    setPendingActive(null)
    resetQuizIntro()
    setPhase("questions")
  }

  // The dialog already abandoned the active questionnaire and cleared the local session.
  const handleStartNew = () => {
    setPendingActive(null)
    createStartedRef.current = false
    setPhase("generating")
  }

  const handleChoiceDismissed = () => {
    resetQuizIntro()
    navigate(ROUTING.DASHBOARD, { replace: true })
  }

  // The questionnaire is not abandoned: it stays active server-side and the local copy is kept.
  const performLogout = async () => {
    setLoggingOut(true)
    loggingOutRef.current = true
    try {
      await logout({ keepQuiz: true })
    } catch {
      // The local session is cleared even if the logout request fails.
    }
    navigate(ROUTING.LOGIN, { replace: true })
  }

  const handleLogoutClick = () => {
    if (phase === "questions") setLogoutConfirmOpen(true)
    else void performLogout()
  }

  const handleComplete = (result: QuizCompletionResult) => {
    clearSession()
    resetQuizIntro()
    setQuizResult(result)
    setPhase("result")
  }

  // The questionnaire was abandoned server-side (e.g. from another tab): the local session is stale.
  const handleAbandonedRemotely = () => {
    abandonedRef.current = true
    clearSession()
    resetQuizIntro()
    toast.info("Este cuestionario fue abandonado y ya no puede enviarse. Puedes iniciar uno nuevo desde tu panel.")
    navigate(ROUTING.DASHBOARD, { replace: true })
  }

  const isResult = phase === "result"

  return (
    <div className="relative flex min-h-svh flex-col bg-mathe-surface">
      <header className="flex h-20 shrink-0 items-center justify-between px-6 tablet:px-10 bg-mathe-white border-b border-mathe-border">
        <MatheLogo width={108} height={48} />
        <div className="flex items-center gap-1 tablet:gap-2">
          {phase === "questions" && (
            <button
              type="button"
              onClick={() => setManualAbandon(true)}
              className="inline-flex h-11 items-center gap-2 rounded-pill px-4 text-sm font-semibold text-mathe-muted transition-colors hover:bg-mathe-white hover:text-mathe-ink"
            >
              <X className="size-4" />
              Abandonar
            </button>
          )}
          <button
            type="button"
            onClick={handleLogoutClick}
            disabled={loggingOut}
            aria-label="Cerrar sesión"
            className="inline-flex h-11 items-center gap-2 rounded-pill px-4 text-sm font-semibold text-mathe-muted transition-colors hover:bg-mathe-white hover:text-mathe-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loggingOut ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
            <span className="hidden tablet:inline">Cerrar sesión</span>
          </button>
        </div>
      </header>

      <main
        className={
          isResult
            ? "flex flex-1 justify-center overflow-y-auto px-6 pb-16 pt-2"
            : phase === "questions"
              ? "flex flex-1 overflow-hidden"
              : "flex flex-1 items-center justify-center px-6 pb-16"
        }
      >
        {isResult && quizResult ? (
          <ResultSummary result={quizResult} />
        ) : phase === "choosing" ? null : phase === "questions" ? (
          <QuizRunner onComplete={handleComplete} onAbandoned={handleAbandonedRemotely} />
        ) : (
          <GeneratingQuiz
            ready={phase === "ready"}
            error={phase === "error" ? generationError : null}
            onContinue={() => setPhase("questions")}
            onRetry={handleRetryGeneration}
          />
        )}
      </main>

      <ActiveQuestionnaireDialog
        open={phase === "choosing"}
        questionnaireId={pendingActive?.id ?? localQuestionnaireId}
        onContinue={handleContinueActive}
        onStartNew={handleStartNew}
        onDismiss={handleChoiceDismissed}
      />

      <Dialog
        open={logoutConfirmOpen}
        onOpenChange={(next) => {
          if (!loggingOut) setLogoutConfirmOpen(next)
        }}
      >
        <DialogContent className="max-w-md rounded-3xl p-7">
          <DialogHeader className="pr-6">
            <DialogTitle>¿Cerrar sesión?</DialogTitle>
            <DialogDescription className="leading-relaxed">
              Tienes un cuestionario en curso. No se abandonará: podrás continuarlo
              cuando vuelvas a iniciar sesión.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLogoutConfirmOpen(false)}
              disabled={loggingOut}
              className="h-11 rounded-pill px-6 font-semibold"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => void performLogout()}
              disabled={loggingOut}
              className="h-11 rounded-pill bg-mathe-blue px-6 font-semibold hover:bg-mathe-blue-deep"
            >
              {loggingOut ? (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              ) : (
                <LogOut data-icon="inline-start" />
              )}
              Cerrar sesión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isAbandonVisible && (
        <AbandonDialog
          onConfirm={handleAbandonConfirm}
          onCancel={handleAbandonCancel}
        />
      )}
    </div>
  )
}
