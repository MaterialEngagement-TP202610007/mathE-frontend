import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "../features/auth/hooks/useAuth";

interface ProtectedRoutesProps {
  children: ReactNode;
}

export const ProtectedRoutes = ({ children }: ProtectedRoutesProps) => {
  const { isLogged } = useAuth();
  //console.log(isLogged);

  // si el usuario no está autenticado lo mandamos a la página de inicio de sesión
  return isLogged ? children : <Navigate to="/login" replace/>;
};