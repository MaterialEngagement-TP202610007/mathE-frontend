export enum ROUTING {
  HOME = "/",
  LOGIN = "/login",
  REGISTER = "/register",
  REGISTER_PENDING = "/register/pending",
  DASHBOARD = "/dashboard",
}

export enum ENDPOINT_SERVER {
  HOME_CONTENT = "/home-content",
  AUTH_LOGIN = "/auth/login",
  AUTH_REGISTER = "/auth/register",
  AUTH_LOGOUT = "/auth/logout",
  AUTH_ME = "/auth/me",
  SCHOOLS = "/schools",
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
