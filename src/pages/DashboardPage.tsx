import { useEffect, useMemo, useState } from 'react';
import { FileBadge, Send, TrendingUp, Clock } from 'lucide-react';
import { useCertificates, useAuth } from '../hooks';
import { eventApi } from '../api';
import { toast } from '../components/ui';
import type { Event } from '../types';

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const { certificates, fetchAll, loading, sendSingle } = useCertificates();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetchAll();
    eventApi
      .getAll()
      .then(({ events: data }) => setEvents(data))
      .catch(() => {
        toast('error', 'Error al cargar eventos');
      });
  }, [fetchAll]);

  const getEventName = (id: number) =>
    events.find((e) => e.id === id)?.nombre || `Evento #${id}`;

  const stats = useMemo(
    () => ({
      total: certificates.length,
      sent: certificates.filter((c) => c.enviado).length,
      pending: certificates.filter((c) => !c.enviado).length,
      eventsCount: events.length,
    }),
    [certificates, events]
  );

  const recent = useMemo(
    () =>
      [...certificates]
        .sort((a, b) => (a.id > b.id ? -1 : 1))
        .slice(0, 5),
    [certificates]
  );

  const cards = [
    {
      label: 'Total Certificados',
      value: stats.total,
      icon: FileBadge,
      color: 'from-primary-500 to-primary-600',
    },
    {
      label: 'Enviados',
      value: stats.sent,
      icon: Send,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      label: 'Pendientes',
      value: stats.pending,
      icon: Clock,
      color: 'from-amber-500 to-amber-600',
    },
    {
      label: isAdmin ? 'Eventos' : 'Mis Eventos',
      value: stats.eventsCount,
      icon: TrendingUp,
      color: 'from-violet-500 to-violet-600',
    },
  ];

  const handleQuickSend = async (id: number) => {
    try {
      const r = await sendSingle(id);
      if (r.success) {
        toast('success', `Certificado #${id} enviado`);
      } else {
        toast('error', r.message);
      }
    } catch {
      toast('error', 'Error al enviar');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Bienvenido, {user?.nombre?.split(' ')[0]}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {isAdmin
            ? 'Panel de administración de certificados'
            : 'Gestiona tus certificados emitidos'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color}
                  flex items-center justify-center`}
              >
                <Icon size={20} className="text-white" />
              </div>
              <span className="text-3xl font-bold text-slate-900">{value}</span>
            </div>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent */}
      <div className="bg-white rounded-2xl border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Actividad reciente</h2>
          <span className="text-xs text-slate-400">
            Últimos {recent.length} registros
          </span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-400 text-sm">
            Cargando...
          </div>
        ) : certificates.length === 0 ? (
          <div className="p-10 text-center">
            <FileBadge size={40} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-500 text-sm">
              No hay certificados aún. Crea el primero.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recent.map((c) => (
              <div
                key={c.id}
                className="px-6 py-3.5 flex items-center gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center text-sm font-bold shrink-0">
                  {c.nombre_completo.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {c.nombre_completo}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{getEventName(c.evento_id)}</p>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                    ${c.enviado ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}
                  >
                    {c.enviado ? 'Enviado' : 'Pendiente'}
                  </span>
                </div>
                {!c.enviado && (
                  <button
                    onClick={() => handleQuickSend(c.id)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
                  >
                    Enviar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}