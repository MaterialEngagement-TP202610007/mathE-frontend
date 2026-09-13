import { create } from "zustand"

/** After this long a batch is considered finished even if some SSE events never arrived. */
export const GENERATION_MAX_DURATION_MS = 3 * 60_000

interface GenerationBatch {
  id: number
  expected: number
  received: number
  startedAt: number
}

interface QuestionGenerationState {
  batches: GenerationBatch[]
  /** Registers a background generation request the backend accepted (202). */
  startBatch: (expected: number) => void
  /**
   * Counts one `question_generated` / `question_failed` event. Events carry no
   * batch id, so they are attributed to the oldest batch still in flight.
   */
  recordEvent: () => void
  /** Drops batches that exceeded the maximum expected duration. */
  pruneExpired: (now?: number) => void
  reset: () => void
}

let nextBatchId = 1

/**
 * Tracks in-flight question generations shared by every teacher page, so lists
 * can poll while SSE events may be buffered or dropped by the proxy.
 */
export const useQuestionGenerationStore = create<QuestionGenerationState>((set) => ({
  batches: [],

  startBatch: (expected) =>
    set((s) => ({
      batches: [
        ...s.batches,
        { id: nextBatchId++, expected: Math.max(1, expected), received: 0, startedAt: Date.now() },
      ],
    })),

  recordEvent: () =>
    set((s) => {
      const [oldest, ...rest] = s.batches
      if (!oldest) return s
      const received = oldest.received + 1
      return {
        batches: received >= oldest.expected ? rest : [{ ...oldest, received }, ...rest],
      }
    }),

  pruneExpired: (now = Date.now()) =>
    set((s) => {
      const batches = s.batches.filter((b) => now - b.startedAt < GENERATION_MAX_DURATION_MS)
      return batches.length === s.batches.length ? s : { batches }
    }),

  reset: () => set({ batches: [] }),
}))
