/** Questions are scoped per school: the backend answers 403 for another school's question. */
export const QUESTION_OTHER_SCHOOL_MESSAGE = "Esta pregunta pertenece a otro colegio."

/** Hint shown when a teacher without a school tries to generate questions (backend returns 400). */
export const SCHOOL_REQUIRED_TO_GENERATE_MESSAGE =
  "Necesitas un colegio asociado para generar preguntas. Agrégalo desde tu perfil."
