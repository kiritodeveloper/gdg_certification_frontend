import { useState, useEffect } from 'react';
import { UserPlus, Trash2, Shield, User } from 'lucide-react';
import { authApi } from '../api';
import { useAuth } from '../hooks';
import { Button, Input, Select, Modal, toast } from '../components/ui';
import type { User as UserType } from '../types';

export default function UsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'usuario' as 'admin' | 'usuario',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await authApi.getUsers();
      setUsers(data.users);
    } catch {
      toast('error', 'Error cargando usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.nombre.trim()) errs.nombre = 'Obligatorio';
    if (!form.email.trim()) errs.email = 'Obligatorio';
    if (form.password.length < 6) errs.password = 'Mínimo 6 caracteres';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      const user = await authApi.register(form);
      setUsers((prev) => [...prev, user.user]);
      toast('success', `Usuario ${form.email} creado`);
      setModalOpen(false);
      setForm({ nombre: '', email: '', password: '', rol: 'usuario' });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || 'Error al crear usuario';
      toast('error', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (email: string) => {
    if (!confirm(`¿Eliminar al usuario ${email}?`)) return;
    try {
      await authApi.deleteUser(email);
      setUsers((prev) => prev.filter((u) => u.email !== email));
      toast('success', 'Usuario eliminado');
    } catch {
      toast('error', 'Error al eliminar');
    }
  };

  const adminCount = users.filter((u) => u.rol === 'admin').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Usuarios</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {users.length} usuarios registrados ({adminCount} administradores)
          </p>
        </div>
        <Button icon={<UserPlus size={16} />} onClick={() => setModalOpen(true)}>
          Nuevo usuario
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Cargando...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No hay usuarios registrados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Usuario
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">
                    Email
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Rol
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u) => (
                  <tr key={u.email} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center text-sm font-bold">
                          {u.nombre.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-900">
                          {u.nombre}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 hidden sm:table-cell">
                      {u.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                        ${u.rol === 'admin' ? 'bg-gold-500/10 text-gold-600' : 'bg-slate-100 text-slate-600'}`}
                      >
                        {u.rol === 'admin' ? (
                          <Shield size={12} />
                        ) : (
                          <User size={12} />
                        )}
                        {u.rol === 'admin' ? 'Admin' : 'Usuario'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(u.email)}
                        title="Eliminar"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Usuario">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Nombre completo"
            value={form.nombre}
            error={errors.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            placeholder="Juan Pérez"
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            error={errors.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="juan@ejemplo.com"
          />
          <Input
            label="Contraseña"
            type="password"
            value={form.password}
            error={errors.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Mínimo 6 caracteres"
          />
          <Select
            label="Rol"
            value={form.rol}
            onChange={(e) =>
              setForm({ ...form, rol: e.target.value as 'admin' | 'usuario' })
            }
            options={[
              { value: 'usuario', label: 'Usuario' },
              { value: 'admin', label: 'Administrador' },
            ]}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Crear usuario
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}