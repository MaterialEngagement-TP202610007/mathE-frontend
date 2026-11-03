import { questionnaireService } from "../services/questionnaire.service"
import { useQuizStore } from "../store/quiz.store"
import { useQuizStatusStore } from "../store/quiz-status.store"
import { isQuestionnaireAbandoned } from "./complete-questionnaire"

/**
 * Abandons the active questionnaire so a new one can be created. Call it only
 * after the student's final confirmation (consent already given), right
 * before creating the replacement. Throws when the abandon request fails.
 */
export async function abandonActiveQuestionnaire(questionnaireId: number): Promise<void> {
  try {
    await questionnaireService.abandon(questionnaireId)
  } catch (error) {
    // Already abandoned (e.g. from another tab) is the state we want.
    if (!isQuestionnaireAbandoned(error)) throw error
  }
  // The abandoned questionnaire must never be resumed from the local copy.
  useQuizStore.getState().clearSession()
  useQuizStatusStore.getState().setAvailability("available")
}
