import { User, Users } from "lucide-react"

export type AccountType = "student" | "teacher"

export const ACCOUNT_TABS = [
  { value: "student", label: "Estudiante", noun: "estudiante", icon: User },
  { value: "teacher", label: "Profesor", noun: "profesor", icon: Users },
] as const

/** Display noun ("estudiante" / "profesor") for the given account type. */
export function accountNoun(type: AccountType): string {
  return ACCOUNT_TABS.find((t) => t.value === type)!.noun
}
