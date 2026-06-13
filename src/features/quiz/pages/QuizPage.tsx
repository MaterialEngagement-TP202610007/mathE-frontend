import { useEffect, useState } from "react"
import { Navigate, useNavigate } from "react-router"
import { ClipboardList, Sparkles, X } from "lucide-react"
import { ROUTING } from "@/config/constant.config"
import { MatheLogo } from "@/shared/components/icons/MatheLogo"
import { useQuizIntroStore } from "../store/quiz-intro.store"
import { GeneratingQuiz } from "../components/GeneratingQuiz"

type Phase = "generating" | "ready" | "questions"

/**
 * Full-screen quiz route, rendered OUTSIDE the dashboard shell (no sidebar/
 * topbar). Flow: generating loader → questions. Reaching this route requires
 * having accepted the terms; otherwise we bounce back to the dashboard.
 */
export function QuizPage() {
  const accepted = useQuizIntroStore((s) => s.accepted)
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>("generating")

  // Simulate question generation — swap for the real request later.
  useEffect(() => {
    if (phase !== "generating") return
    const t = setTimeout(() => setPhase("ready"), 2600)
    return () => clearTimeout(t)
  }, [phase])

  if (!accepted) return <Navigate to={ROUTING.DASHBOARD} replace />

  const abandon = () => navigate(ROUTING.DASHBOARD, { replace: true })

  return (
    <div className="relative flex min-h-svh flex-col bg-mathe-surface">
      {/* Minimal top bar: brand + abandon */}
      <header className="flex h-20 shrink-0 items-center justify-between px-6 tablet:px-10">
        <MatheLogo width={108} height={48} />
        <button
          type="button"
          onClick={abandon}
          className="inline-flex h-11 items-center gap-2 rounded-pill px-4 text-sm font-semibold text-mathe-muted transition-colors hover:bg-mathe-white hover:text-mathe-ink"
        >
          <X className="size-4" />
          Abandonar
        </button>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 pb-16">
        {phase === "questions" ? (
          <QuestionsPlaceholder />
        ) : (
          <GeneratingQuiz
            ready={phase === "ready"}
            onContinue={() => setPhase("questions")}
          />
        )}
      </main>
    </div>
  )
}

/** Temporary stand-in for the question runner. */
function QuestionsPlaceholder() {
  return (
    <div className="w-full max-w-2xl rounded-3xl border border-mathe-border bg-mathe-white p-10 text-center shadow-sm animate-fade-in-up">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-mathe-surface text-mathe-blue">
        <ClipboardList className="size-7" />
      </span>
      <h1 className="mt-5 text-2xl font-bold text-mathe-ink">
        Tu cuestionario está listo
      </h1>
      <p className="mx-auto mt-2 max-w-md text-mathe-muted">
        Aquí se mostrarán las 10 preguntas del cuestionario. Esta pantalla es un
        marcador de posición mientras se conecta el motor de preguntas.
      </p>
      <span className="mt-6 inline-flex items-center gap-2 rounded-pill bg-mathe-surface px-4 py-2 text-sm font-semibold text-mathe-blue">
        <Sparkles className="size-4" />
        Preguntas personalizadas
      </span>
    </div>
  )
}
