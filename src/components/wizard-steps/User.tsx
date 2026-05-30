import { useState, useEffect } from 'react';
import axios from 'axios';

const Users = () => {
const [users, setUsers] = useState([]);
const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Laboratorista' });

useEffect(() => {
    axios.get('/api/users', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
    .then(res => setUsers(res.data));
}, []);

const handleCreate = async () => {
    await axios.post('/api/users', form, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    // Recargar lista
};

return (
    <div>
    <h1 className="text-2xl font-bold mb-4">Gestión de Usuarios</h1>
    {/* Formulario para crear usuario */}
    <form onSubmit={handleCreate} className="mb-6">
        <input placeholder="Nombre" onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Contraseña" onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <select onChange={(e) => setForm({ ...form, role: e.target.value })}>
        <option>Laboratorista</option>
        <option>Supervisor</option>
        <option>Administrador</option>
        </select>
        <button type="submit" className="bg-primary text-white p-2">Crear Usuario</button>
    </form>
    {/* Lista de usuarios */}
    <ul>
        {users.map((user: any) => (
        <li key={user.user_id}>{user.name} - {user.role}</li>
        ))}
    </ul>
    </div>
);
};

export default Users;