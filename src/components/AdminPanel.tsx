// src/components/AdminPanel.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Users, UserPlus, Search, Filter, Edit, Trash2, Key, ArrowLeft, LogOut } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface User {
user_id: string;
name: string;
email: string;
role: string;
active: string;
}

interface Role {
role_id: number;
name: string;
}

interface AdminPanelProps {
roles: Role[];
users: User[];
onRegisterUser: (data: { name: string; email: string; password: string; role_id: number }) => void;
onBackToDashboard: () => void; // Nueva prop para volver al dashboard
}

const AdminPanel = ({ roles: initialRoles, users: initialUsers, onRegisterUser, onBackToDashboard }: AdminPanelProps) => {
const [users, setUsers] = useState<User[]>(initialUsers);
const [roles, setRoles] = useState<Role[]>(initialRoles);
const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role_id: "",
});
const [filters, setFilters] = useState({
    search: "",
    role: "",
    active: "",
});
const [showFilters, setShowFilters] = useState(false);
const [editingUser, setEditingUser] = useState<User | null>(null);
const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role_id: "",
    active: "",
});
const [passwordForm, setPasswordForm] = useState({
    user_id: "",
    new_password: "",
});

// Obtener datos del usuario desde localStorage
const userRaw = localStorage.getItem("user");
const user = userRaw ? JSON.parse(userRaw) : null;

useEffect(() => {
    const fetchUsers = async () => {
    try {
        const base = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const params = new URLSearchParams(filters);
        const res = await fetch(`${base}/api/users?${params}`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.ok) {
        const data = await res.json();
        setUsers(data);
        } else {
        console.error("Error fetching users:", res.statusText);
        }
    } catch (error) {
        console.error("Error fetching users:", error);
    }
    };
    fetchUsers();
}, [filters]);

// Fetch usuarios al montar y cuando cambian filtros
useEffect(() => {
    const fetchRoles = async () => {
    try {
        const base = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const res = await fetch(`${base}/api/roles`);
        if (res.ok) {
        const data = await res.json();
        setRoles(data);
        } else {
        console.error("Error fetching roles:", res.statusText);
        }
    } catch (error) {
        console.error("Error fetching roles:", error);
    }
    };
    fetchRoles();
}, []);

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("FormData antes de enviar:", formData);  
    const token = localStorage.getItem("token");
    console.log("Token:", token);  
    if (!token) {
        toast({ title: "Error", description: "Sesión expirada.", variant: "destructive" });
        return;
    }
    try {
        await onRegisterUser({ ...formData, role_id: parseInt(formData.role_id) });
        setFormData({ name: "", email: "", password: "", role_id: "" });
        const base = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const res = await fetch(`${base}/api/users`);
        if (res.ok) {
            const data = await res.json();
            setUsers(data);
        }
        toast({ title: "Éxito", description: "Usuario registrado correctamente." });
    } catch (error) {
        console.error("Error en registro:", error);  
        toast({ title: "Error", description: "No se pudo registrar el usuario.", variant: "destructive" });
    }
};


const handleEdit = async () => {
    if (!editingUser) return;
    try {
    const base = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const res = await fetch(`${base}/api/users`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({
        user_id: editingUser.user_id,
        name: editForm.name,
        email: editForm.email,
        role_id: parseInt(editForm.role_id),
        active: editForm.active,
        }),
    });
    if (res.ok) {
        setUsers(users.map(u => u.user_id === editingUser.user_id ? { ...u, ...editForm } : u));
        setEditingUser(null);
        toast({ title: "Éxito", description: "Usuario actualizado correctamente." });
    } else {
        const error = await res.json();
        toast({ title: "Error", description: error.error, variant: "destructive" });
    }
    } catch (error) {
    toast({ title: "Error", description: "No se pudo actualizar el usuario.", variant: "destructive" });
    }
};

const handleDelete = async (user_id: string) => {
    try {
    const base = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const res = await fetch(`${base}/api/users`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ user_id }),
    });
    if (res.ok) {
        setUsers(users.filter(u => u.user_id !== user_id));
        toast({ title: "Éxito", description: "Usuario eliminado correctamente." });
    } else {
        const error = await res.json();
        toast({ title: "Error", description: error.error, variant: "destructive" });
    }
    } catch (error) {
    toast({ title: "Error", description: "No se pudo eliminar el usuario.", variant: "destructive" });
    }
};

const handleChangePassword = async () => {
    try {
    const base = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const res = await fetch(`${base}/api/users/change_password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(passwordForm),
    });
    if (res.ok) {
        setPasswordForm({ user_id: "", new_password: "" });
        toast({ title: "Éxito", description: "Contraseña cambiada correctamente." });
    } else {
        const error = await res.json();
        toast({ title: "Error", description: error.error, variant: "destructive" });
    }
    } catch (error) {
    toast({ title: "Error", description: "No se pudo cambiar la contraseña.", variant: "destructive" });
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
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 flex items-center justify-center shadow-lg">
            <Users className="w-8 h-8 text-white" />
            </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-2">
            Gestión de Usuarios
        </h1>
        <p className="text-muted-foreground text-lg">Administra usuarios, roles y permisos del sistema</p>
        <Badge variant="secondary" className="mt-2">
            Total Usuarios: {users.length}
        </Badge>
        </div>

        {/* Formulario de Registro */}
        <Card className="bg-gradient-card mb-8">
        <CardHeader className="bg-purple-600 text-white">
            <h4 className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Registrar Nuevo Usuario
            </h4>
        </CardHeader>
        <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-4">
            <div>
                <Label>Nombre Completo</Label>
                <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                />
            </div>
            <div>
                <Label>Correo</Label>
                <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                />
            </div>
            <div>
                <Label>Contraseña</Label>
                <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                />
            </div>
            <div>
                <Label>Rol</Label>
                <Select value={formData.role_id} onValueChange={(v) => setFormData({ ...formData, role_id: v })}>
                <SelectTrigger>
                <SelectValue placeholder="Seleccione rol" />
                </SelectTrigger>
                <SelectContent>
                {roles.map((role) => (
                    <SelectItem key={role.role_id} value={role.role_id.toString()}>
                    {role.name}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            </div>
            <div className="md:col-span-4 text-right">
                <Button type="submit" className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white shadow-md">
                Registrar Usuario
                </Button>
            </div>
            </form>
        </CardContent>
        </Card>
        

        <Separator className="my-8" />

        {/* Tabla de Usuarios */}
        <Card className="bg-gradient-card shadow-lg">
        <CardHeader>
            <h4 className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Usuarios Registrados
            </h4>
        </CardHeader>
        <CardContent className="p-6">
            {users.length > 0 ? (
            <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow className="bg-purple-50 border-purple-200">
                    <TableHead className="font-semibold">Nombre</TableHead>
                    <TableHead className="font-semibold">Correo</TableHead>
                    <TableHead className="font-semibold">Rol</TableHead>
                    <TableHead className="font-semibold">Estado</TableHead>
                    <TableHead className="font-semibold">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                    <TableRow key={user.user_id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                        <Badge variant={user.role === "Administrador" ? "default" : "secondary"}>
                            {user.role}
                        </Badge>
                        </TableCell>
                        <TableCell>
                        <Badge variant={user.active === "Activo" ? "default" : "destructive"}>
                            {user.active}
                        </Badge>
                        </TableCell>
                        <TableCell>
                        <div className="flex gap-2">
                            <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => {
                                setEditingUser(user);
                                setEditForm({
                                    name: user.name,
                                    email: user.email,
                                    role_id: roles.find(r => r.name === user.role)?.role_id.toString() || "",
                                    active: user.active,
                                });
                                }}>
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                <DialogTitle>Editar Usuario</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                <div>
                                    <Label>Nombre</Label>
                                    <Input
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Correo</Label>
                                    <Input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Rol</Label>
                                    <Select value={editForm.role_id} onValueChange={(v) => setEditForm({ ...editForm, role_id: v })}>
                                    <SelectTrigger>
                                    <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role.role_id} value={role.role_id.toString()}>
                                        {role.name}
                                        </SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                </div>
                                <div>
                                    <Label>Estado</Label>
                                    <Select value={editForm.active} onValueChange={(v) => setEditForm({ ...editForm, active: v })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Activo">Activo</SelectItem>
                                        <SelectItem value="Inactivo">Inactivo</SelectItem>
                                    </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={handleEdit} className="w-full">
                                    Guardar Cambios
                                </Button>
                                </div>
                            </DialogContent>
                            </Dialog>
                        
                            <Dialog>
                                <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setPasswordForm({ user_id: user.user_id, new_password: "" })}>
                                    <Key className="w-4 h-4 mr-2" />
                                    Cambiar Contraseña
                                </Button>
                                </DialogTrigger>
                                <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Cambiar Contraseña</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                    <Label>Nueva Contraseña</Label>
                                    <Input
                                        type="password"
                                        value={passwordForm.new_password}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                                    />
                                    </div>
                                    <Button onClick={handleChangePassword} className="w-full">
                                    Cambiar Contraseña
                                    </Button>
                                </div>
                                </DialogContent>
                            </Dialog>
                            
                            <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar Usuario?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar este usuario?
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(user.user_id)} className="bg-red-600 hover:bg-red-700">
                                    Eliminar
                                </AlertDialogAction>
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
                <p className="text-muted-foreground text-lg">No hay usuarios registrados.</p>
                <p className="text-sm text-muted-foreground">Registra un nuevo usuario para comenzar.</p>
            </div>
            )}
        </CardContent>
        </Card>
    </div>
    </div>
);
};

export default AdminPanel;