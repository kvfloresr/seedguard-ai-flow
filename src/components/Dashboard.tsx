// src/components/Dashboard.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Package, FlaskConical, Users, FileText, TrendingUp, Activity, User, LogOut, ArrowLeft, Eye, Brain } from "lucide-react";
import Lotes from "./Lotes";
import Muestras from "./Muestras";
import AdminPanel from "./AdminPanel";
import ModelEvaluation from "./ModelEvaluation";
import Producers from "./Productores";

interface Report {
_id: string;
analysis_id: string;
image_id: string;
sample_guid: string;
sample_id: string;
predicted_class: string;
probability: number;
probability_vector: number[];
features: Record<string, any>;
model_version: string;
path: string;
captured_at: string;
processed_at: string;
reviewed: boolean;
review_notes: string | null;
}

interface DashboardProps {
name: string;
role_name: string;
reports: Report[];
onBackToWizard: () => void;
}

const Dashboard = ({ name, role_name, reports: initialReports, onBackToWizard }: DashboardProps) => {
const [currentView, setCurrentView] = useState<'dashboard' | 'lotes' | 'muestras' | 'admin' | 'model-evaluation' | 'producers'>('dashboard');
const [allReports, setAllReports] = useState<Report[]>([]);
const [displayedReports, setDisplayedReports] = useState<Report[]>([]);
const [showAll, setShowAll] = useState(false);

// Obtener datos del usuario desde localStorage
const userRaw = localStorage.getItem("user");
const user = userRaw ? JSON.parse(userRaw) : null;

// Fetch reports desde MongoDB al montar
useEffect(() => {
    const fetchReports = async () => {
    try {
        const base = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const res = await fetch(`${base}/api/analyses?limit=100`);
        if (res.ok) {
        const data = await res.json();
        setAllReports(data);
        setDisplayedReports(data.slice(0, 5));
        } else {
        console.error("Error fetching analyses:", res.statusText);
        }
    } catch (error) {
        console.error("Error fetching analyses:", error);
    }
    };
    fetchReports();
}, []);

const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
};

const handleViewMore = () => {
    setDisplayedReports(allReports);
    setShowAll(true);
};

const handleRegisterUser = async (data: { name: string; email: string; password: string; role_id: number }) => {
    const base = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const res = await fetch(`${base}/api/users`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`, 
    },
    body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role_id.toString(),  
    }),
    });
    if (!res.ok) {
    throw new Error("Error registrando usuario");
    }
};

// Estadísticas rápidas
const totalReports = allReports.length;
const averageQuality = allReports.length > 0 ? allReports.reduce((sum, r) => sum + r.probability, 0) / allReports.length : 0;

// Renderizar vista actual
if (currentView === 'lotes') {
    return <Lotes lots={[]} onRegisterLot={() => {}} onBackToDashboard={() => setCurrentView('dashboard')} />;
}
if (currentView === 'muestras') {
    return <Muestras lots={[]} samples={[]} onRegisterSample={() => {}} onBackToDashboard={() => setCurrentView('dashboard')} />;
}
if (currentView === 'admin') {
    return <AdminPanel roles={[]} users={[]} onRegisterUser={handleRegisterUser} onBackToDashboard={() => setCurrentView('dashboard')} />;
}
if (currentView === 'model-evaluation') {
    return <ModelEvaluation onBackToDashboard={() => setCurrentView('dashboard')} />;
}
if (currentView === 'producers') {
    return <Producers onBackToDashboard={() => setCurrentView('dashboard')} />;
}


return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
    {/* Navbar */}
    <nav className="bg-green-600 text-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <a className="text-xl font-bold">SeedDSS</a>
        <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBackToWizard} className="text-white hover:bg-green-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Análisis
            </Button>
            <span>{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
            </Button>
        </div>
        </div>
    </nav>

    <div className="p-6">
        {/* Header Profesional */}
        <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-green-700 flex items-center justify-center shadow-lg">
            <User className="w-8 h-8 text-white" />
            </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-2">
            Bienvenido(a), {name}
        </h1>
        <p className="text-muted-foreground text-lg">Panel principal del Sistema SeedDSS</p>
        <Badge variant="secondary" className="mt-2">
            Rol: {role_name}
        </Badge>
        </div>

        {/* Estadísticas Rápidas */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
            <CardContent className="flex items-center p-6">
            <Activity className="w-10 h-10 text-blue-600 mr-4" />
            <div>
                <p className="text-sm text-muted-foreground">Total Análisis</p>
                <p className="text-2xl font-bold text-blue-600">{totalReports}</p>
            </div>
            </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
            <CardContent className="flex items-center p-6">
            <TrendingUp className="w-10 h-10 text-green-600 mr-4" />
            <div>
                <p className="text-sm text-muted-foreground">Calidad Promedio</p>
                <p className="text-2xl font-bold text-green-600">{(averageQuality * 100).toFixed(1)}%</p>
            </div>
            </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
            <CardContent className="flex items-center p-6">
            <FileText className="w-10 h-10 text-purple-600 mr-4" />
            <div>
                <p className="text-sm text-muted-foreground">Análisis Recientes</p>
                <p className="text-2xl font-bold text-purple-600">{allReports.filter(r => new Date(r.processed_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</p>
            </div>
            </CardContent>
        </Card>
        </div>

        {/* Cards de Módulos */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="bg-gradient-card hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="text-center p-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="text-xl font-semibold mb-2">Lotes</h4>
            <p className="text-muted-foreground mb-4">Gestiona los lotes de semillas registrados.</p>
            <Button
                onClick={() => setCurrentView('lotes')}
                className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white shadow-md"
            >
                Ver Lotes
            </Button>
            </CardContent>
        </Card>

        <Card className="bg-gradient-card hover:shadow-xl transition-all duration-300 transform hover:scale-105">
        <CardContent className="text-center p-8">
            <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-teal-600" />
            </div>
            <h4 className="text-xl font-semibold mb-2">Productores</h4>
            <p className="text-muted-foreground mb-4">Registra y gestiona los productores de semillas.</p>
            <Button
            onClick={() => setCurrentView('producers')}
            className="bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 text-white shadow-md"
            >
            Ver Productores
            </Button>
        </CardContent>
        </Card>

        <Card className="bg-gradient-card hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="text-center p-8">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <FlaskConical className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="text-xl font-semibold mb-2">Muestras</h4>
            <p className="text-muted-foreground mb-4">Asocia muestras y consulta registros a los lotes de semillas.</p>
            <Button
                onClick={() => setCurrentView('muestras')}
                className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white shadow-md"
            >
                Ver Muestras
            </Button>
            </CardContent>
        </Card>

        {role_name === "Administrador" && (
            <Card className="bg-gradient-card hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="text-center p-8">
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Usuarios</h4>
                <p className="text-muted-foreground mb-4">Administra cuentas y permisos del sistema.</p>
                <Button
                onClick={() => setCurrentView('admin')}
                className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white shadow-md"
                >
                Gestionar Usuarios
                </Button>
            </CardContent>
            </Card>

        )}

        <Card className="bg-gradient-card hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="text-center p-8">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-orange-600" />
            </div>
            <h4 className="text-xl font-semibold mb-2">Evaluación del Modelo</h4>
            <p className="text-muted-foreground mb-4">Evalúa el rendimiento de la red neuronal con métricas detalladas y predicciones paso a paso.</p>
            <Button
                onClick={() => setCurrentView('model-evaluation')}
                className="bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white shadow-md"
            >
                Evaluar Modelo
            </Button>
            </CardContent>
        </Card>
        </div>

        <Separator className="my-8" />

        {/* Historial de Análisis IA */}
        <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-green-600">Historial de Análisis IA</h2>
        <p className="text-muted-foreground">Reportes generados por el sistema de verificación</p>
        </div>

        <Card className="bg-gradient-card shadow-lg">
        <CardContent className="p-6">
            {displayedReports.length > 0 ? (
            <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow className="bg-green-50 border-green-200">
                    <TableHead className="font-semibold">Clase Predicha</TableHead>
                    <TableHead className="font-semibold">Probabilidad</TableHead>
                    <TableHead className="font-semibold">Fecha Procesado</TableHead>
                    <TableHead className="font-semibold">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {displayedReports.map((r) => (
                    <TableRow key={r.analysis_id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                        <Badge variant={r.probability > 0.8 ? "default" : "secondary"}>
                            {r.predicted_class}
                        </Badge>
                        </TableCell>
                        <TableCell>{(r.probability * 100).toFixed(2)}%</TableCell>
                        <TableCell>{new Date(r.processed_at).toLocaleDateString("es-ES")}</TableCell>
                        <TableCell>
                        <AnalysisDetailsModal analysis={r} />
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
                {!showAll && allReports.length > 5 && (
                <div className="text-center mt-4">
                    <Button onClick={handleViewMore} variant="outline">
                    Ver Más
                    </Button>
                </div>
                )}
            </div>
            ) : (
            <div className="text-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">Aún no hay análisis registrados.</p>
                <p className="text-sm text-muted-foreground">Comienza verificando una muestra para ver reportes aquí.</p>
            </div>
            )}
        </CardContent>
        </Card>
    </div>
    </div>
);
};

// Componente separado para el modal de detalles
const AnalysisDetailsModal = ({ analysis }: { analysis: Report }) => {
const [overlayImages, setOverlayImages] = useState<any[]>([]);
const [loadingImages, setLoadingImages] = useState(false);

useEffect(() => {
    const loadImages = async () => {
    setLoadingImages(true);
    try {
        const base = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const res = await fetch(`${base}/api/get_overlay_images/${analysis.analysis_id}`);
        if (res.ok) {
        const data = await res.json();
        setOverlayImages(data.images || []);
        }
    } catch (error) {
        console.error("Error cargando imágenes:", error);
    } finally {
        setLoadingImages(false);
    }
    };
    loadImages();
}, [analysis.analysis_id]);

return (
    <Dialog>
    <DialogTrigger asChild>
        <Button variant="outline" size="sm">
        <Eye className="w-4 h-4 mr-2" />
        Ver Detalles
        </Button>
    </DialogTrigger>
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
        <DialogTitle>Detalles del Análisis</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
        <div><strong>Clase Predicha:</strong> {analysis.predicted_class}</div>
        <div><strong>Probabilidad:</strong> {(analysis.probability * 100).toFixed(2)}%</div>
        <div><strong>Vector de Probabilidades:</strong> {JSON.stringify(analysis.probability_vector)}</div>
        <div><strong>Fecha Capturado:</strong> {analysis.captured_at}</div>
        <div><strong>Fecha Procesado:</strong> {analysis.processed_at}</div>
        <div><strong>Revisado:</strong> {analysis.reviewed ? "Sí" : "No"}</div>
        <div><strong>Notas de Revisión:</strong> {analysis.review_notes || "Ninguna"}</div>
        
        <div>
            <strong>Imágenes Procesadas:</strong>
            {loadingImages ? (
            <p>Cargando imágenes...</p>
            ) : overlayImages.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-2">
                {overlayImages.map((img, index) => (
                <div key={index} className="text-center">
                    <img src={img.image_base64} alt={img.filename} className="w-full h-auto rounded-lg" />
                    <p className="text-sm text-muted-foreground mt-2">{img.filename}</p>
                </div>
                ))}
            </div>
            ) : (
            <p>No hay imágenes disponibles.</p>
            )}
        </div>
        </div>
    </DialogContent>
    </Dialog>
);
};

export default Dashboard;
