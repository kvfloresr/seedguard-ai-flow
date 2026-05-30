import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
Loader2,
KeyRound,
Mail,
CheckCircle2,
AlertCircle,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const LoginPage = () => {
const navigate = useNavigate();

const [status, setStatus] = useState<
    "idle" | "validating" | "success" | "error"
>("idle");

const [progress, setProgress] = useState(0);

const [formData, setFormData] = useState({
    email: "",
    password: "",
});

const updateField = (e) => {
    setFormData({
    ...formData,
    [e.target.name]: e.target.value,
    });
};


const handleLogin = async (e) => {
    e.preventDefault();
    setStatus("validating");
    setProgress(10);
    try {
    const base = import.meta.env.VITE_API_URL;
    setProgress(30);
    const resp = await fetch(`${base}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
    });
    setProgress(60);
    const data = await resp.json();
    if (!resp.ok) {
        setStatus("error");
        toast({
        title: "Error",
        description: data.error || "Credenciales incorrectas",
        variant: "destructive",
        });
        setProgress(0);
        return;
    }
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.token);  
    setProgress(100);
    setStatus("success");
    toast({
        title: "Bienvenido",
        description: `Sesión iniciada como ${data.user.role_name}`,  
    });
    setTimeout(() => {
        navigate("/wizard", { replace: true });
    }, 600);
    } catch (err) {
    console.error(err);
    setStatus("error");
    toast({
        title: "Error de servidor",
        description: "No se pudo conectar con la API",
        variant: "destructive",
    });
    setProgress(0);
    }
};


const getStatusSection = () => {
    switch (status) {
    case "validating":
        return (
        <div className="flex flex-col items-center mt-4">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <p className="text-sm mt-2">Validando credenciales...</p>
            <Progress value={progress} className="w-full h-2 mt-3" />
        </div>
        );

    case "success":
        return (
        <div className="flex flex-col items-center mt-4 text-success">
            <CheckCircle2 className="w-8 h-8" />
            <p className="text-sm mt-2">Acceso concedido</p>
            <Progress value={progress} className="w-full h-2 mt-3" />
        </div>
        );

    case "error":
        return (
        <div className="flex flex-col items-center mt-4 text-destructive">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm mt-2">Error al iniciar sesión</p>
            <Progress value={progress} className="w-full h-2 mt-3" />
        </div>
        );

    default:
        return null;
    }
};

return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-muted">
    <div className="bg-card rounded-xl shadow-lg p-8 w-full max-w-md border border-border">
        {/* Título */}
        <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-primary bg-clip-text text-transparent">
        Inicio de Sesión
        </h1>
        <p className="text-center text-muted-foreground mb-6">
        Accede al sistema de verificación inteligente de semillas
        </p>

        <form onSubmit={handleLogin} className="space-y-5">

        {/* Email */}
        <div>
            <label className="font-medium text-sm">Correo electrónico</label>
            <div className="flex items-center gap-2 border border-input bg-background rounded-lg px-3 mt-1">
            <Mail className="w-5 h-5 text-muted-foreground" />
            <input
                type="email"
                name="email"
                required
                onChange={updateField}
                className="w-full p-3 bg-transparent outline-none"
            />
            </div>
        </div>

        {/* Password */}
        <div>
            <label className="font-medium text-sm">Contraseña</label>
            <div className="flex items-center gap-2 border border-input bg-background rounded-lg px-3 mt-1">
            <KeyRound className="w-5 h-5 text-muted-foreground" />
            <input
                type="password"
                name="password"
                required
                onChange={updateField}
                className="w-full p-3 bg-transparent outline-none"
            />
            </div>
        </div>

        <Button
            type="submit"
            className="w-full py-3 bg-gradient-primary hover:opacity-90 transition-opacity"
            disabled={status === "validating"}
        >
            {status === "validating" ? (
            <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Validando...
            </div>
            ) : (
            "Iniciar Sesión"
            )}
        </Button>

        {getStatusSection()}
        </form>

        
    </div>
    </div>
);
};

export default LoginPage;
