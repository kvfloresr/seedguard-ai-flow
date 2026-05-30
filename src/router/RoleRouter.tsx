import { Navigate } from "react-router-dom";
import Index from "@/pages/Index";
import SeedVerificationWizard from "@/components/SeedVerificationWizard";

const RoleRouter = ({ user }) => {
if (!user) return <Navigate to="/login" replace />;

switch (user.role) {
    case "Administrador":
    return <Index />; 
    case "Supervisor":
    return <Index />; 
    case "Laboratista":
    return <SeedVerificationWizard />; 
    default:
    return <Navigate to="/login" replace />;
}
};

export default RoleRouter;
