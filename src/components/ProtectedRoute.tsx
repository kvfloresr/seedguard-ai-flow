import React from "react";
import { Navigate } from "react-router-dom";

interface Props {
children: JSX.Element;
}

const ProtectedRoute = ({ children }: Props) => {
const user = localStorage.getItem("user");
if (!user) {
    // No hay usuario -> redirigir al login
    return <Navigate to="/login" replace />;
}
return children;
};

export default ProtectedRoute;
