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
  open: () => void
  close: () => void
  accept: () => void
}

export const useQuizIntroStore = create<QuizIntroState>((set) => ({
  isOpen: false,
  accepted: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  accept: () => set({ isOpen: false, accepted: true }),
}))
