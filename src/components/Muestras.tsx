// src/components/Muestras.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { FlaskConical, Search, Filter, Trash2, ArrowLeft, LogOut } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Sample {
sample_id: string;
sample_date: string;
analyst: string;
observations: string;
lot_name: string;
created_by: string | null;
}

interface MuestrasProps {
lots: any[]; 
samples: Sample[];
onRegisterSample: (data: any) => void; 
onBackToDashboard: () => void;
}

const Muestras = ({ lots, samples: initialSamples, onRegisterSample, onBackToDashboard }: MuestrasProps) => {
const [samples, setSamples] = useState<Sample[]>(initialSamples);
const [filters, setFilters] = useState({
    search: "",
    lot_name: "",
    sample_date_from: "",
    sample_date_to: "",
    analyst: "",
});
const [showFilters, setShowFilters] = useState(false);

const userRaw = localStorage.getItem("user");
const user = userRaw ? JSON.parse(userRaw) : null;

useEffect(() => {
    const fetchSamples = async () => {
    if (!user?.user_id) return;
    
    try {
        const base = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const params = new URLSearchParams({
        user_id: user.user_id,
        ...filters,
        });
        const res = await fetch(`${base}/api/samples?${params}`);
        if (res.ok) {
        const data = await res.json();
        setSamples(data);
        } else {
        console.error("Error fetching samples:", res.statusText);
        }
    } catch (error) {
        console.error("Error fetching samples:", error);
    }
    };
    fetchSamples();
}, [user?.user_id, filters]);

const handleDelete = async (sample_id: string) => {
    try {
    const base = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const res = await fetch(`${base}/api/samples`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sample_id, user_id: user?.user_id }),
    });
    if (res.ok) {
        setSamples(samples.filter(s => s.sample_id !== sample_id));
        toast({ title: "Éxito", description: "Muestra eliminada correctamente." });
    } else {
        const error = await res.json();
        toast({ title: "Error", description: error.error, variant: "destructive" });
    }
    } catch (error) {
    toast({ title: "Error", description: "No se pudo eliminar la muestra.", variant: "destructive" });
    }
};

const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
};

return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
    {/* Navbar */}
    <nav className="bg-green-600 text-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <a className="text-xl font-bold">SeedDSS</a>
        <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBackToDashboard} className="text-white hover:bg-green-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
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
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
            <FlaskConical className="w-8 h-8 text-white" />
            </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
            Gestión de Muestras
        </h1>
        <p className="text-muted-foreground text-lg">Administra las muestras de semillas registradas</p>
        <Badge variant="secondary" className="mt-2">
            Total Muestras: {samples.length}
        </Badge>
        </div>

        {/* Búsqueda y Filtros */}
        <Card className="bg-gradient-card mb-8">
        <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
                <Label>Búsqueda General</Label>
                <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-muted-foreground" />
                <Input
                    placeholder="Buscar por analista, observaciones, productor o variedad..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
                </div>
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
            </Button>
            </div>
            {showFilters && (
            <div className="grid gap-4 md:grid-cols-4">
                <div>
                <Label>Lote</Label>
                <Input
                    value={filters.lot_name}
                    onChange={(e) => setFilters({ ...filters, lot_name: e.target.value })}
                />
                </div>
                <div>
                <Label>Analista</Label>
                <Input
                    value={filters.analyst}
                    onChange={(e) => setFilters({ ...filters, analyst: e.target.value })}
                />
                </div>
                <div>
                <Label>Fecha Desde</Label>
                <Input
                    type="date"
                    value={filters.sample_date_from}
                    onChange={(e) => setFilters({ ...filters, sample_date_from: e.target.value })}
                />
                </div>
                <div>
                <Label>Fecha Hasta</Label>
                <Input
                    type="date"
                    value={filters.sample_date_to}
                    onChange={(e) => setFilters({ ...filters, sample_date_to: e.target.value })}
                />
                </div>
            </div>
            )}
        </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* Tabla de Muestras */}
        <Card className="bg-gradient-card shadow-lg">
        <CardHeader>
            <h4 className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5" />
            Muestras Registradas
            </h4>
        </CardHeader>
        <CardContent className="p-6">
            {samples.length > 0 ? (
            <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow className="bg-blue-50 border-blue-200">
                    <TableHead className="font-semibold">Lote Asociado</TableHead>
                    <TableHead className="font-semibold">Fecha Muestra</TableHead>
                    <TableHead className="font-semibold">Analista</TableHead>
                    <TableHead className="font-semibold">Observaciones</TableHead>
                    <TableHead className="font-semibold">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {samples.map((sample) => (
                    <TableRow key={sample.sample_id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">{sample.lot_name}</TableCell>
                        <TableCell>{new Date(sample.sample_date).toLocaleDateString("es-ES")}</TableCell>
                        <TableCell>{sample.analyst}</TableCell>
                        <TableCell className="max-w-xs truncate">{sample.observations}</TableCell>
                        <TableCell>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar
                            </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar Muestra?</AlertDialogTitle>
                                <AlertDialogDescription>
                                Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar esta muestra?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(sample.sample_id)} className="bg-red-600 hover:bg-red-700">
                                Eliminar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
            ) : (
            <div className="text-center py-12">
                <FlaskConical className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">No hay muestras registradas.</p>
                <p className="text-sm text-muted-foreground">Las muestras se asocian automáticamente a lotes.</p>
            </div>
            )}
        </CardContent>
        </Card>
    </div>
    </div>
);
};

export default Muestras;