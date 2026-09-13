import { HttpError, isTransientError, sleep } from "@/lib/http"
import { resultService } from "@/features/results/services/result.service"
import type { QuizResult } from "@/features/results/interfaces/result.interface"
import { questionnaireService, type SubmitPayload } from "../services/questionnaire.service"
import type { QuizCompletionResult } from "../interfaces/questionnaire.interface"

/** Waits between result lookups after an ambiguous completion failure. */
const RECOVERY_DELAYS_MS = [2_000, 4_000, 8_000, 8_000]

/**
 * A 409 means another submit of the same questionnaire is still being
 * processed. Completion is idempotent server-side, so re-sending the same
 * PATCH shortly after returns the stored result.
 */
const CONFLICT_RETRY_DELAY_MS = 1_750
const MAX_SUBMIT_ATTEMPTS = 3

function toCompletionResult(result: QuizResult): QuizCompletionResult {
  return {
    resultId: result.id,
    predominantStyle: result.predominantStyle,
    visualProbability: result.visualProbability,
    auditoryProbability: result.auditoryProbability,
    kinestheticProbability: result.kinestheticProbability,
    isMixedProfile: result.isMixedProfile,
    classifierType: result.classifierType,
    aiFeedback: result.aiFeedback,
    feedbackSource: result.feedbackSource,
  }
}

function isConflict(error: unknown): boolean {
  return error instanceof HttpError && error.status === 409
}

/** True when the backend rejected the submit because the questionnaire was abandoned. */
export function isQuestionnaireAbandoned(error: unknown): boolean {
  return (
    error instanceof HttpError &&
    error.status === 400 &&
    /already abandoned/i.test(error.serverMessage ?? "")
  )
}

/**
 * A completion may have succeeded server-side even though the client saw an
 * error (proxy timeout, dropped connection) or a concurrent-submit conflict.
 */
function mayHaveCompleted(error: unknown): boolean {
  if (isTransientError(error) || isConflict(error)) return true
  return (
    error instanceof HttpError &&
    error.status === 400 &&
    /already (being )?completed/i.test(error.serverMessage ?? "")
  )
}

async function recoverResult(questionnaireId: number): Promise<QuizCompletionResult | null> {
  for (const delay of RECOVERY_DELAYS_MS) {
    await sleep(delay)
    try {
      return toCompletionResult(await resultService.getByQuestionnaire(questionnaireId))
    } catch (error) {
      // 404 → result not persisted yet; transient → server still waking up. Anything else is final.
      const retryable =
        isTransientError(error) || (error instanceof HttpError && error.status === 404)
      if (!retryable) return null
    }
  }
  return null
}

/** Sends the completion, re-sending the same payload while the backend reports a concurrent submit. */
async function submitWithConflictRetry(
  questionnaireId: number,
  payload: SubmitPayload,
): Promise<QuizCompletionResult> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await questionnaireService.submit(questionnaireId, payload)
    } catch (error) {
      if (!isConflict(error) || attempt >= MAX_SUBMIT_ATTEMPTS) throw error
      await sleep(CONFLICT_RETRY_DELAY_MS)
    }
  }
}

/**
 * Submits a questionnaire and, when the outcome is ambiguous, recovers the
 * stored result by questionnaire id. Throws the original error if no result
 * can be recovered.
 */
export async function completeQuestionnaire(
  questionnaireId: number,
  payload: SubmitPayload,
): Promise<QuizCompletionResult> {
  try {
    return await submitWithConflictRetry(questionnaireId, payload)
  } catch (error) {
    if (!mayHaveCompleted(error)) throw error
    const recovered = await recoverResult(questionnaireId)
    if (recovered) return recovered
    throw error
  }
}
