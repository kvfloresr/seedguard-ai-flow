// src/components/Producers.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Users, UserPlus, Search, Edit, Trash2, ArrowLeft, LogOut } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Producer {
producer_id: string;
name: string;
cod_producer: string;
phone: string;
address: string;
}

interface ProducersProps {
onBackToDashboard: () => void;
}

const Producers = ({ onBackToDashboard }: ProducersProps) => {
const [producers, setProducers] = useState<Producer[]>([]);
const [formData, setFormData] = useState({ name: "", cod_producer: "", phone: "", address: "" });
const [search, setSearch] = useState("");
const [editingProducer, setEditingProducer] = useState<Producer | null>(null);
const [editForm, setEditForm] = useState({ name: "", cod_producer: "", phone: "", address: "" });

const userRaw = localStorage.getItem("user");
const user = userRaw ? JSON.parse(userRaw) : null;
const base = import.meta.env.VITE_API_URL || "http://localhost:8000";

const fetchProducers = async () => {
try {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    const res = await fetch(`${base}/api/producers?${params}`, {
    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
    });
    if (res.ok) setProducers(await res.json());
} catch (error) {
    console.error("Error fetching producers:", error);
}
};

useEffect(() => { fetchProducers(); }, [search]);

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
try {
    const res = await fetch(`${base}/api/producers`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
    body: JSON.stringify(formData),
    });
    if (res.ok) {
    setFormData({ name: "", cod_producer: "", phone: "", address: "" });
    await fetchProducers();
    toast({ title: "Éxito", description: "Productor registrado correctamente." });
    } else {
    const error = await res.json();
    toast({ title: "Error", description: error.error || "No se pudo registrar.", variant: "destructive" });
    }
} catch (error) {
    toast({ title: "Error", description: "No se pudo registrar el productor.", variant: "destructive" });
}
};

const handleEdit = async () => {
if (!editingProducer) return;
try {
    const res = await fetch(`${base}/api/producers`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
    body: JSON.stringify({ producer_id: editingProducer.producer_id, ...editForm }),
    });
    if (res.ok) {
    setEditingProducer(null);
    await fetchProducers();
    toast({ title: "Éxito", description: "Productor actualizado correctamente." });
    } else {
    const error = await res.json();
    toast({ title: "Error", description: error.error, variant: "destructive" });
    }
} catch (error) {
    toast({ title: "Error", description: "No se pudo actualizar el productor.", variant: "destructive" });
}
};

const handleDelete = async (producer_id: string) => {
try {
    const res = await fetch(`${base}/api/producers`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
    body: JSON.stringify({ producer_id }),
    });
    if (res.ok) {
    await fetchProducers();
    toast({ title: "Éxito", description: "Productor eliminado correctamente." });
    } else {
    const error = await res.json();
    toast({ title: "Error", description: error.error, variant: "destructive" });
    }
} catch (error) {
    toast({ title: "Error", description: "No se pudo eliminar el productor.", variant: "destructive" });
}
};

const handleLogout = () => { localStorage.removeItem("user"); window.location.href = "/login"; };

return (
<div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
    <nav className="bg-green-600 text-white shadow-sm">
    <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <a className="text-xl font-bold">SeedDSS</a>
        <div className="hidden md:flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onBackToDashboard} className="text-white hover:bg-green-700">
            <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
        </Button>
        <span>{user?.name}</span>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Cerrar sesión
        </Button>
        </div>
    </div>
    </nav>

    <div className="p-6">
    <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-green-700 flex items-center justify-center shadow-lg">
            <Users className="w-8 h-8 text-white" />
        </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-2">
        Gestión de Productores
        </h1>
        <Badge variant="secondary" className="mt-2">Total Productores: {producers.length}</Badge>
    </div>

    <Card className="bg-gradient-card mb-8">
        <CardHeader className="bg-green-600 text-white">
        <h4 className="flex items-center gap-2"><UserPlus className="w-5 h-5" /> Registrar Nuevo Productor</h4>
        </CardHeader>
        <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-4">
            <div><Label>Nombre</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
            <div><Label>Código de Productor</Label><Input value={formData.cod_producer} onChange={(e) => setFormData({ ...formData, cod_producer: e.target.value })} required /></div>
            <div><Label>Teléfono</Label><Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required /></div>
            <div><Label>Dirección</Label><Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required /></div>
            <div className="md:col-span-4 text-right">
            <Button type="submit" className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white shadow-md">
                Registrar Productor
            </Button>
            </div>
        </form>
        </CardContent>
    </Card>

    <Card className="bg-gradient-card mb-8">
        <CardContent className="p-6">
        <Label>Búsqueda</Label>
        <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input placeholder="Buscar por nombre o código..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        </CardContent>
    </Card>

    <Separator className="my-8" />

    <Card className="bg-gradient-card shadow-lg">
        <CardHeader><h4 className="flex items-center gap-2"><Users className="w-5 h-5" /> Productores Registrados</h4></CardHeader>
        <CardContent className="p-6">
        {producers.length > 0 ? (
            <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                <TableRow className="bg-green-50 border-green-200">
                    <TableHead className="font-semibold">Nombre</TableHead>
                    <TableHead className="font-semibold">Código</TableHead>
                    <TableHead className="font-semibold">Teléfono</TableHead>
                    <TableHead className="font-semibold">Dirección</TableHead>
                    <TableHead className="font-semibold">Acciones</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {producers.map((p) => (
                    <TableRow key={p.producer_id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.cod_producer}</TableCell>
                    <TableCell>{p.phone}</TableCell>
                    <TableCell>{p.address}</TableCell>
                    <TableCell>
                        <div className="flex gap-2">
                        <Dialog>
                            <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => {
                                setEditingProducer(p);
                                setEditForm({ name: p.name, cod_producer: p.cod_producer, phone: p.phone, address: p.address });
                            }}>
                                <Edit className="w-4 h-4 mr-2" /> Editar
                            </Button>
                            </DialogTrigger>
                            <DialogContent>
                            <DialogHeader><DialogTitle>Editar Productor</DialogTitle></DialogHeader>
                            <div className="space-y-4">
                                <div><Label>Nombre</Label><Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></div>
                                <div><Label>Código de Productor</Label><Input value={editForm.cod_producer} onChange={(e) => setEditForm({ ...editForm, cod_producer: e.target.value })} /></div>
                                <div><Label>Teléfono</Label><Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} /></div>
                                <div><Label>Dirección</Label><Input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} /></div>
                                <Button onClick={handleEdit} className="w-full">Guardar Cambios</Button>
                            </div>
                            </DialogContent>
                        </Dialog>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800">
                                <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                            </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar Productor?</AlertDialogTitle>
                                <AlertDialogDescription>Esta acción no se puede deshacer. ¿Seguro que querés eliminar este productor?</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(p.producer_id)} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction>
                            </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        </div>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </div>
        ) : (
            <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No hay productores registrados.</p>
            </div>
        )}
        </CardContent>
    </Card>
    </div>
</div>
);
};

export default Producers;