import { Link } from 'react-router-dom';

const Sidebar = ({ user }: { user: any }) => {
const menuItems = [
    { path: '/dashboard', label: 'Dashboard', roles: ['Laboratorista', 'Administrador', 'Supervisor'] },
    { path: '/lots', label: 'Lotes', roles: ['Laboratorista', 'Administrador', 'Supervisor'] },
    { path: '/samples', label: 'Muestras', roles: ['Laboratorista', 'Administrador', 'Supervisor'] },
    { path: '/analysis', label: 'Análisis', roles: ['Laboratorista', 'Administrador', 'Supervisor'] },
    { path: '/history', label: 'Historial', roles: ['Laboratorista', 'Administrador', 'Supervisor'] },
    { path: '/users', label: 'Usuarios', roles: ['Administrador', 'Supervisor'] },
];

return (
    <div className="w-64 bg-gray-800 text-white h-screen p-4">
    <h2 className="text-xl font-bold mb-6">Sistema DSS</h2>
    <ul>
        {menuItems
        .filter(item => item.roles.includes(user.role))
        .map(item => (
            <li key={item.path} className="mb-2">
            <Link to={item.path} className="block p-2 hover:bg-gray-700 rounded">
                {item.label}
            </Link>
            </li>
        ))}
    </ul>
    <button
        onClick={() => { localStorage.removeItem('token'); window.location.reload(); }}
        className="mt-6 w-full bg-red-500 p-2 rounded"
    >
        Cerrar Sesión
    </button>
    </div>
);
};

export default Sidebar;