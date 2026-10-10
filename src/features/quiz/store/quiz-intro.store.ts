import { create } from "zustand"

/**
 * Controls the terms & conditions modal shown before a quiz starts. The modal
 * is mounted once in the dashboard shell; any trigger (home CTA, sidebar link)
 * just flips `isOpen`. Acceptance is gated here so the quiz route can verify the
 * student actually consented before generating questions.
 */
interface QuizIntroState {
  isOpen: boolean
  accepted: boolean
  /**
   * Active questionnaire the student chose to replace ("Iniciar nuevo"). It is
   * only abandoned after consent, right before the new one is created; closing
   * the modal drops the intent so nothing is abandoned.
   */
  replaceQuestionnaireId: number | null
  open: () => void
  /** Opens the consent modal recording the intent to replace an active questionnaire. */
  openToReplace: (questionnaireId: number) => void
  close: () => void
  accept: () => void
  /** Clears consent — required again before another questionnaire is created. */
  reset: () => void
}

export const useQuizIntroStore = create<QuizIntroState>((set) => ({
  isOpen: false,
  accepted: false,
  replaceQuestionnaireId: null,
  open: () => set({ isOpen: true, replaceQuestionnaireId: null }),
  openToReplace: (questionnaireId) => set({ isOpen: true, replaceQuestionnaireId: questionnaireId }),
  close: () => set({ isOpen: false, replaceQuestionnaireId: null }),
  accept: () => set({ isOpen: false, accepted: true }),
  reset: () => set({ isOpen: false, accepted: false, replaceQuestionnaireId: null }),
}))
