import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "../features/auth/hooks/useAuth";

interface PublicRoutesProps {
  children: ReactNode;
}

export const PublicRoutes = ({ children }: PublicRoutesProps) => {
  const { isLogged } = useAuth();

  /* console.log(isLogged);
  console.log(location); */

  /* useEffect(() => {
  }, [logged]) */

  return (!isLogged)
    ? children
    : <Navigate to="/events-information" replace/>
};