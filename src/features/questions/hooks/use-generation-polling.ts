import { useEffect, useRef } from "react"
import { useQuestionGenerationStore } from "../store/question-generation.store"

const POLL_INTERVAL_MS = 10_000

/**
 * While any question generation is in flight, calls `onPoll` every 10 s as a
 * fallback for SSE events buffered or cut by the proxy, and once more when the
 * generation settles so the list reflects the final state.
 */
export function useGenerationPolling(onPoll: () => void) {
  const isGenerating = useQuestionGenerationStore((s) => s.batches.length > 0)
  const pruneExpired = useQuestionGenerationStore((s) => s.pruneExpired)
  const onPollRef = useRef(onPoll)
  const wasGeneratingRef = useRef(isGenerating)

  useEffect(() => {
    onPollRef.current = onPoll
  })

  useEffect(() => {
    const wasGenerating = wasGeneratingRef.current
    wasGeneratingRef.current = isGenerating

    if (!isGenerating) {
      if (wasGenerating) onPollRef.current()
      return
    }

    pruneExpired()
    const id = setInterval(() => {
      pruneExpired()
      onPollRef.current()
    }, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [isGenerating, pruneExpired])
}
