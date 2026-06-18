import { create } from "zustand"

export type QuizAvailability =
  | "checking"   // initial / API in flight
  | "available"  // no active quiz anywhere, can start new
  | "has_local"  // in-progress session in localStorage
  | "has_remote" // API has active questionnaire, no local session

interface QuizStatusState {
  availability: QuizAvailability
  setAvailability: (a: QuizAvailability) => void
}

export const useQuizStatusStore = create<QuizStatusState>((set) => ({
  availability: "checking",
  setAvailability: (availability) => set({ availability }),
}))
