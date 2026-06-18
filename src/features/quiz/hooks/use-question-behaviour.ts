import { useCallback, useEffect, useRef } from "react"

interface BehaviourEntry {
  /** Total seconds accumulated across all visits to this question */
  accumulatedSeconds: number
  /** Timestamp (ms) when the current visit started */
  visitStartMs: number
  /** Number of times the selected option was changed */
  numberOfChanges: number
  /** Number of times the student returned to this question after answering and leaving */
  timesReviewed: number
  /** Whether the question has been answered at least once */
  isAnswered: boolean
  /** Tracks if student left the question while it was answered (so next entry = revisit) */
  hasLeftWithAnswer: boolean
  /** Last recorded option id, used to detect changes */
  lastOptionId: number | null
}

export interface QuestionBehaviour {
  questionTimeSeconds: number
  numberOfChanges: number
  timesReviewed: number
}

function fresh(): BehaviourEntry {
  return {
    accumulatedSeconds: 0,
    visitStartMs: Date.now(),
    numberOfChanges: 0,
    timesReviewed: 0,
    isAnswered: false,
    hasLeftWithAnswer: false,
    lastOptionId: null,
  }
}

function getOrInit(map: Map<number, BehaviourEntry>, id: number): BehaviourEntry {
  if (!map.has(id)) map.set(id, fresh())
  return map.get(id)!
}

/**
 * Tracks per-question behaviour metrics entirely in memory (no localStorage).
 * Designed to be called from QuizRunner with the current question's id.
 *
 * Three signals:
 *  - questionTimeSeconds  — accumulated seconds across all visits
 *  - numberOfChanges      — how many times the selected option changed
 *  - timesReviewed        — how many times student returned after answering + leaving
 */
export function useQuestionBehaviour(currentQuestionId: number) {
  const mapRef = useRef<Map<number, BehaviourEntry>>(new Map())
  const prevIdRef = useRef<number>(currentQuestionId)

  useEffect(() => {
    const map = mapRef.current
    const prevId = prevIdRef.current

    if (prevId !== currentQuestionId) {
      // Flush outgoing question time and mark departure
      const prev = map.get(prevId)
      if (prev) {
        prev.accumulatedSeconds += (Date.now() - prev.visitStartMs) / 1000
        if (prev.isAnswered) prev.hasLeftWithAnswer = true
      }
    }

    // Enter incoming question
    if (!map.has(currentQuestionId)) {
      map.set(currentQuestionId, fresh())
    } else {
      const curr = map.get(currentQuestionId)!
      // Only count as a revisit when actually navigating here (not strict-mode re-run)
      if (prevId !== currentQuestionId && curr.hasLeftWithAnswer) {
        curr.timesReviewed++
        curr.hasLeftWithAnswer = false
      }
      curr.visitStartMs = Date.now()
    }

    prevIdRef.current = currentQuestionId
  }, [currentQuestionId])

  /**
   * Call whenever the student selects (or changes) an option.
   * Must be called BEFORE updating the store answer so we can detect changes.
   */
  const markAnswered = useCallback((questionId: number, optionId: number) => {
    const entry = getOrInit(mapRef.current, questionId)
    if (entry.isAnswered && entry.lastOptionId !== null && entry.lastOptionId !== optionId) {
      entry.numberOfChanges++
    }
    entry.isAnswered = true
    entry.lastOptionId = optionId
  }, [])

  /**
   * Flush the current question's live session time into accumulatedSeconds.
   * Call before building the submit payload so the last question's time is captured.
   */
  const flushCurrent = useCallback(() => {
    const entry = mapRef.current.get(prevIdRef.current)
    if (entry) {
      entry.accumulatedSeconds += (Date.now() - entry.visitStartMs) / 1000
      entry.visitStartMs = Date.now()
    }
  }, [])

  /**
   * Returns the current behaviour snapshot for a question.
   * If called for the currently active question, includes live session time.
   */
  const getBehaviour = useCallback((questionId: number): QuestionBehaviour => {
    const entry = mapRef.current.get(questionId)
    if (!entry) return { questionTimeSeconds: 0, numberOfChanges: 0, timesReviewed: 0 }

    const liveSecs =
      questionId === prevIdRef.current ? (Date.now() - entry.visitStartMs) / 1000 : 0

    return {
      questionTimeSeconds: Math.round(entry.accumulatedSeconds + liveSecs),
      numberOfChanges: entry.numberOfChanges,
      timesReviewed: entry.timesReviewed,
    }
  }, [])

  return { markAnswered, flushCurrent, getBehaviour }
}
