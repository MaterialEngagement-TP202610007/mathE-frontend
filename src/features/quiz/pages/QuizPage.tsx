import { useEffect, useRef, useState } from "react"
import { useNavigate, useBlocker } from "react-router"
import { X } from "lucide-react"
import { ROUTING } from "@/config/constant.config"
import { MatheLogo } from "@/shared/components/icons/MatheLogo"
import { useQuizIntroStore } from "../store/quiz-intro.store"
import { useQuizStore } from "../store/quiz.store"
import { questionnaireService } from "../services/questionnaire.service"
import { GeneratingQuiz } from "../components/GeneratingQuiz"
import { QuizRunner } from "../components/QuizRunner"
import { AbandonDialog } from "../components/AbandonDialog"
import { ResultSummary } from "@/features/results/components/ResultSummary"
import type { QuizResult } from "@/features/results/interfaces/result.interface"

/**
 * Phase machine:
 *  checking   → resolve localStorage / accepted / GET active
 *  generating → POST /questionnaires in flight
 *  ready      → POST succeeded, waiting for user to click "Continuar"
 *  questions  → active quiz
 *  result     → quiz submitted, showing result summary inline
 */
type Phase = "checking" | "generating" | "ready" | "questions" | "result"

export function QuizPage() {
  const accepted = useQuizIntroStore((s) => s.accepted)
  const navigate = useNavigate()
  const { startSession, clearSession } = useQuizStore()

  const [phase, setPhase] = useState<Phase>("checking")
  const [manualAbandon, setManualAbandon] = useState(false)
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null)
  const abandonedRef = useRef(false)

  // ── Navigation blocker (only active while answering) ─────────
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      phase === "questions" &&
      !abandonedRef.current &&
      currentLocation.pathname !== nextLocation.pathname,
  )

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
      setPhase("questions")
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
      .catch(() => navigate(ROUTING.DASHBOARD, { replace: true }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Create questionnaire once generating phase is entered ────
  useEffect(() => {
    if (phase !== "generating") return
    questionnaireService
      .create()
      .then((data) => {
        startSession(data)
        setPhase("ready")
      })
      .catch(() => navigate(ROUTING.DASHBOARD, { replace: true }))
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
    setManualAbandon(false)
    if (blocker.state === "blocked") blocker.reset()
    navigate(ROUTING.DASHBOARD, { replace: true })
  }

  const handleAbandonCancel = () => {
    setManualAbandon(false)
    if (blocker.state === "blocked") blocker.reset()
  }

  const handleComplete = (result: QuizResult) => {
    clearSession()
    setQuizResult(result)
    setPhase("result")
  }

  const isResult = phase === "result"

  return (
    <div className="relative flex min-h-svh flex-col bg-mathe-surface">
      <header className="flex h-20 shrink-0 items-center justify-between px-6 tablet:px-10">
        <MatheLogo width={108} height={48} />
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
      </header>

      <main
        className={
          isResult
            ? "flex flex-1 justify-center overflow-y-auto px-6 pb-16 pt-2"
            : "flex flex-1 items-center justify-center px-6 pb-16"
        }
      >
        {isResult && quizResult ? (
          <ResultSummary result={quizResult} />
        ) : phase === "questions" ? (
          <QuizRunner onComplete={handleComplete} />
        ) : (
          <GeneratingQuiz
            ready={phase === "ready"}
            onContinue={() => setPhase("questions")}
          />
        )}
      </main>

      {isAbandonVisible && (
        <AbandonDialog
          onConfirm={handleAbandonConfirm}
          onCancel={handleAbandonCancel}
        />
      )}
    </div>
  )
}
