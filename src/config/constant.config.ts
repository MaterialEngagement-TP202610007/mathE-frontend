export enum ROUTING {
  HOME = "/",
  LOGIN = "/login",
  REGISTER = "/register",
  REGISTER_PENDING = "/register/pending",
  DASHBOARD = "/dashboard",
  DASHBOARD_NEW = "/dashboard/nuevo-cuestionario",
  QUIZ = "/cuestionario",
  QUIZ_RESULT = "/resultados/:id",
  RESULT_DETAIL = "/dashboard/resultados/:id",
  DASHBOARD_HISTORY = "/dashboard/historial",
  DASHBOARD_NOTIFICATIONS = "/dashboard/notificaciones",
  DASHBOARD_PROFILE = "/dashboard/perfil",
  DASHBOARD_QUESTIONS = "/dashboard/preguntas",
  DASHBOARD_STUDENTS = "/dashboard/estudiantes",
  DASHBOARD_QUESTION_REVIEW = "/dashboard/preguntas/:id",
  DASHBOARD_VALIDATION_HISTORY = "/dashboard/historial-validacion",
  DASHBOARD_VALIDATION_HISTORY_DETAIL = "/dashboard/historial-validacion/:id",
  DASHBOARD_REPORTS = "/dashboard/reportes",
}

export enum ENDPOINT_SERVER {
  HOME_CONTENT = "/home-content",
  AUTH_LOGIN = "/auth/login",
  AUTH_REGISTER = "/auth/register",
  AUTH_LOGOUT = "/auth/logout",
  AUTH_ME = "/auth/me",
  SCHOOLS = "/schools",
  USERS = "/users",
  USERS_STUDENTS = "/users/students",
  USERS_TEACHERS = "/users/teachers",
  QUESTIONS = "/questions",
  QUESTIONS_MY = "/questions/my",
  QUESTIONS_VALIDATED_HISTORY = "/questions/my/validated-history",
  QUESTIONNAIRES = "/questionnaires",
  QUESTIONNAIRES_ACTIVE = "/questionnaires/active",
  RESULTS = "/results",
  RESULTS_MY = "/results/my",
  NOTIFICATIONS = "/notifications",
  NOTIFICATIONS_UNREAD_COUNT = "/notifications/unread-count",
  NOTIFICATIONS_READ_ALL = "/notifications/read-all",
  ML_DATASET = "/ml-dataset",
}

export enum BREAKPOINTS {
  MOBILE = 475,
  TABLET = 744,
  LAPTOP = 1232,
  DESKTOP = 1440,
}

/** Numeric role ids — kept in sync with the backend DB seed. */
export enum ROLE {
  ADMIN = 1,
  TEACHER = 2,
  STUDENT = 3,
}
