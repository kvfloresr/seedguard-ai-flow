// src/components/Lotes.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Package, Plus, Search, Filter, Trash2, ArrowLeft, LogOut } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Lot {
lot_id: string;
producer: string;
species: string;
variety: string;
category: string;
reception: string;
created_by: string;
}

interface LotesProps {
lots: Lot[];
onRegisterLot: (data: { producer: string; species: string; variety: string; category: string; reception: string; created_by?: string }) => void;
onBackToDashboard: () => void; 
}

const Lotes = ({ lots: initialLots, onRegisterLot, onBackToDashboard }: LotesProps) => {
const [lots, setLots] = useState<Lot[]>(initialLots);
const [formData, setFormData] = useState({
    producer: "",
    species: "",
    variety: "",
    category: "",
    reception: "",
});
const [filters, setFilters] = useState({
    search: "",
    producer: "",
    species: "",
    variety: "",
    category: "",
    reception_from: "",
    reception_to: "",
});
const [showFilters, setShowFilters] = useState(false);


const userRaw = localStorage.getItem("user");
const user = userRaw ? JSON.parse(userRaw) : null;


useEffect(() => {
    const fetchLots = async () => {
    if (!user?.user_id) return;
    
    try {
        const base = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const params = new URLSearchParams({
        user_id: user.user_id,
        ...filters,
        });
        const res = await fetch(`${base}/api/lots?${params}`);
        if (res.ok) {
        const data = await res.json();
        setLots(data);
        } else {
        console.error("Error fetching lots:", res.statusText);
        }
    } catch (error) {
        console.error("Error fetching lots:", error);
    }
    };
    fetchLots();
}, [user?.user_id, filters]);

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
    await onRegisterLot({ ...formData, created_by: user?.user_id });
    setFormData({ producer: "", species: "", variety: "", category: "", reception: "" });
    const base = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const res = await fetch(`${base}/api/lots?user_id=${user?.user_id}`);
    if (res.ok) {
        const data = await res.json();
        setLots(data);
    }
    toast({ title: "Éxito", description: "Lote registrado correctamente." });
    } catch (error) {
    toast({ title: "Error", description: "No se pudo registrar el lote.", variant: "destructive" });
    }
};

const handleDelete = async (lot_id: string) => {
    try {
    const base = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const res = await fetch(`${base}/api/lots`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lot_id, user_id: user?.user_id }),
    });
    if (res.ok) {
        setLots(lots.filter(l => l.lot_id !== lot_id));
        toast({ title: "Éxito", description: "Lote eliminado correctamente." });
    } else {
        const error = await res.json();
        toast({ title: "Error", description: error.error, variant: "destructive" });
    }
    } catch (error) {
    toast({ title: "Error", description: "No se pudo eliminar el lote.", variant: "destructive" });
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
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-green-700 flex items-center justify-center shadow-lg">
            <Package className="w-8 h-8 text-white" />
            </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-2">
            Gestión de Lotes
        </h1>
        <p className="text-muted-foreground text-lg">Administra los lotes de semillas registrados</p>
        <Badge variant="secondary" className="mt-2">
            Total Lotes: {lots.length}
        </Badge>
        </div>

        {/* Formulario de Registro */}
        <Card className="bg-gradient-card mb-8">
        
        </Card>

        {/* Búsqueda y Filtros */}
        <Card className="bg-gradient-card mb-8">
        <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
                <Label>Búsqueda General</Label>
                <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-muted-foreground" />
                <Input
                    placeholder="Buscar por productor, especie, variedad o categoría..."
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
                <Label>Productor</Label>
                <Input
                    value={filters.producer}
                    onChange={(e) => setFilters({ ...filters, producer: e.target.value })}
                />
                </div>
                <div>
                <Label>Especie</Label>
                <Input
                    value={filters.species}
                    onChange={(e) => setFilters({ ...filters, species: e.target.value })}
                />
                </div>
                <div>
                <Label>Variedad</Label>
                <Input
                    value={filters.variety}
                    onChange={(e) => setFilters({ ...filters, variety: e.target.value })}
                />
                </div>
                <div>
                <Label>Categoría</Label>
                <Input
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                />
                </div>
                <div>
                <Label>Fecha Desde</Label>
                <Input
                    type="date"
                    value={filters.reception_from}
                    onChange={(e) => setFilters({ ...filters, reception_from: e.target.value })}
                />
                </div>
                <div>
                <Label>Fecha Hasta</Label>
                <Input
                    type="date"
                    value={filters.reception_to}
                    onChange={(e) => setFilters({ ...filters, reception_to: e.target.value })}
                />
                </div>
            </div>
            )}
        </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* Tabla de Lotes */}
        <Card className="bg-gradient-card shadow-lg">
        <CardHeader>
            <h4 className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Lotes Registrados
            </h4>
        </CardHeader>
        <CardContent className="p-6">
            {lots.length > 0 ? (
            <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow className="bg-green-50 border-green-200">
                    <TableHead className="font-semibold">Productor</TableHead>
                    <TableHead className="font-semibold">Especie</TableHead>
                    <TableHead className="font-semibold">Variedad</TableHead>
                    <TableHead className="font-semibold">Categoría</TableHead>
                    <TableHead className="font-semibold">Recepción</TableHead>
                    <TableHead className="font-semibold">Creado Por</TableHead>
                    <TableHead className="font-semibold">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {lots.map((lot) => (
                    <TableRow key={lot.lot_id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">{lot.producer}</TableCell>
                        <TableCell>{lot.species}</TableCell>
                        <TableCell>{lot.variety}</TableCell>
                        <TableCell>{lot.category}</TableCell>
                        <TableCell>{new Date(lot.reception).toLocaleDateString("es-ES")}</TableCell>
                        <TableCell>{lot.created_by}</TableCell>
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
                                <AlertDialogTitle>¿Eliminar Lote?</AlertDialogTitle>
                                <AlertDialogDescription>
                                Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar este lote?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(lot.lot_id)} className="bg-red-600 hover:bg-red-700">
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
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">No hay lotes registrados.</p>
                <p className="text-sm text-muted-foreground">Registra un nuevo lote para comenzar.</p>
            </div>
            )}
        </CardContent>
        </Card>
    </div>
    </div>
);
};

export default Lotes;