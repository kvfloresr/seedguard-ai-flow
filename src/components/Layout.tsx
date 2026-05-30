// src/components/Layout.tsx
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert"; 
import { User, Package, FlaskConical, Users, LogOut } from "lucide-react";

interface LayoutProps {
children: ReactNode;
user?: { name: string; role_name: string; user_id: number }; // Simula sesión
messages?: { category: string; message: string }[]; // Mensajes flash
onLogout?: () => void;
}

const Layout = ({ children, user, messages, onLogout }: LayoutProps) => {
return (
    <div className="min-h-screen bg-background">
    {/* Navbar */}
    <nav className="bg-green-600 text-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/dashboard" className="text-xl font-bold">SeedDSS</a>
        <button className="md:hidden" aria-label="Toggle navigation">
            {/* Toggle para mobile, puedes agregar lógica */}
            <span>☰</span>
        </button>
        <div className="hidden md:flex items-center space-x-4">
            {user && (
            <>
                <ul className="flex space-x-4">
                <li><a href="/dashboard" className="hover:underline">Inicio</a></li>
                <li><a href="/lotes" className="hover:underline">Lotes</a></li>
                <li><a href="/muestras" className="hover:underline">Muestras</a></li>
                {user.role_name === "Administrador" && (
                    <li><a href="/admin_panel" className="hover:underline">Usuarios</a></li>
                )}
                </ul>
                <span>{user.name}</span>
                <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
                </Button>
            </>
            )}
        </div>
        </div>
    </nav>

    {/* Container */}
    <div className="container mx-auto mt-4 px-4">
        {/* Mensajes flash */}
        {messages && messages.map((msg, idx) => (
        <Alert key={idx} className={`mb-4 alert-${msg.category}`}>
            <AlertDescription>{msg.message}</AlertDescription>
        </Alert>
        ))}

        {children}
    </div>
    </div>
);
};

export default Layout;