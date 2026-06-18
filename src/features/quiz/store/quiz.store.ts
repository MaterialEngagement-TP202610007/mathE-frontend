import { create } from "zustand"
import { persist } from "zustand/middleware"
import type {
  QuizSession,
  QuizAnswerRecord,
  QuestionnaireResponse,
} from "../interfaces/questionnaire.interface"

interface QuizState {
  session: QuizSession | null
  startSession: (data: QuestionnaireResponse) => void
  setAnswer: (questionId: number, answer: QuizAnswerRecord) => void
  setCurrentIndex: (index: number) => void
  clearSession: () => void
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set) => ({
      session: null,

      startSession: (data) =>
        set({
          session: {
            questionnaireId: data.id,
            studentId: data.studentId,
            questions: data.questions,
            answers: {},
            currentIndex: 0,
            startTime: data.startTime,
            status: "in_progress",
          },
        }),

      setAnswer: (questionId, answer) =>
        set((state) => {
          if (!state.session) return state
          return {
            session: {
              ...state.session,
              answers: { ...state.session.answers, [questionId]: answer },
            },
          }
        }),

      setCurrentIndex: (index) =>
        set((state) => {
          if (!state.session) return state
          return { session: { ...state.session, currentIndex: index } }
        }),

      clearSession: () => set({ session: null }),
    }),
    {
      name: "mathe-quiz-session",
      partialize: (s) => ({ session: s.session }),
    },
  ),
)
