import type { MviRule } from "../interfaces/question.interface"

/** Teacher-friendly copy for an MVI catalog rule. */
export interface MviRuleCopy {
  name: string
  why: string
}

/**
 * Friendly Spanish names and "why it matters" lines for the known MVI rule ids.
 * Rules not listed here fall back to the catalog `description` (see `getMviRuleCopy`).
 */
export const MVI_RULES: Record<string, MviRuleCopy> = {
  "longitud-enunciado": {
    name: "Enunciado breve",
    why: "Se lee rápido.",
  },
  "legibilidad-nivel": {
    name: "Fácil de leer para su edad",
    why: "El estudiante entiende la pregunta sin esfuerzo adicional.",
  },
  "vocabulario-nivel": {
    name: "Palabras adecuadas al grado",
    why: "Usa términos que el estudiante ya conoce.",
  },
  "redaccion-positiva": {
    name: "Redacción en positivo",
    why: "Sin dobles negaciones.",
  },
  "longitud-opciones": {
    name: "Opciones de largo parejo",
    why: "Ninguna destaca por su tamaño.",
  },
  "homogeneidad-opciones": {
    name: "Opciones con estructura similar",
    why: "Todas se redactan de la misma forma, sin pistas en el formato.",
  },
  "exclusividad-opciones": {
    name: "Opciones distintas entre sí",
    why: "Cada opción describe una preferencia diferente.",
  },
  "independencia-banco": {
    name: "No repite preguntas del banco",
    why: "Aporta información nueva al cuestionario.",
  },
  "correspondencia-dimension": {
    name: "Cada opción refleja su estilo (visual, auditivo, kinestésico)",
    why: "Así la respuesta del estudiante indica su estilo de aprendizaje.",
  },
  "composicion-dimensiones": {
    name: "Opciones balanceadas entre los tres estilos",
    why: "Ningún estilo de aprendizaje queda favorecido.",
  },
}

/**
 * Copy for a rule id. Unknown ids use the catalog `description` as name (or the raw id
 * when the catalog is not available) and have no "why" line.
 */
export function getMviRuleCopy(ruleId: string, rule?: Pick<MviRule, "description">): MviRuleCopy {
  const known = MVI_RULES[ruleId]
  if (known) return known
  return { name: rule?.description?.trim() || ruleId, why: "" }
}
