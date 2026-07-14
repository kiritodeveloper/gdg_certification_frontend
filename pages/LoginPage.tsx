import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileBadge, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks';
import { Input, Button, toast } from '../components/ui';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email.trim()) e.email = 'El email es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido';
    if (!form.password) e.password = 'La contraseña es obligatoria';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast('success', 'Sesión iniciada correctamente');
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || 'Credenciales inválidas';
      toast('error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-4">
            <FileBadge size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Certificados</h1>
          <p className="text-primary-200 text-sm mt-1">Inicia sesión para continuar</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-2xl p-8 space-y-5"
          noValidate
        >
          <Input
            label="Correo electrónico"
            type="email"
            placeholder="admin@ejemplo.com"
            value={form.email}
            error={errors.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            autoComplete="email"
          />

          <div className="relative">
            <Input
              label="Contraseña"
              type={show ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              error={errors.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full !py-3 !text-base"
          >
            Iniciar sesión
          </Button>
        </form>

        <p className="text-center text-primary-300/60 text-xs mt-6">
          Sistema de Gestión de Certificados v1.0
        </p>
      </div>
    </div>
  );
}