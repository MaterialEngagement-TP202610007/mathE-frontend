import { create } from "zustand"

interface QuestionLoaderState {
  loading: boolean
  message: string
  setLoading: (loading: boolean, message?: string) => void
}

export const useQuestionLoaderStore = create<QuestionLoaderState>((set) => ({
  loading: false,
  message: "Procesando...",
  setLoading: (loading, message = "Procesando...") => set({ loading, message }),
}))
