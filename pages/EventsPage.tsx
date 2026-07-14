import { useState, useEffect, type FormEvent } from 'react';
import {
  Calendar,
  Plus,
  Pencil,
  Trash2,
  Users,
  FileBadge,
} from 'lucide-react';
import { eventApi, certApi } from '../api';
import { Button, Input, Textarea, Modal, toast } from '../components/ui';
import type { Event, EventPayload, Speaker } from '../types';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [speakersModalOpen, setSpeakersModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventSpeakers, setEventSpeakers] = useState<Speaker[]>([]);
  const [certCounts, setCertCounts] = useState<Record<number, number>>({});
  const [form, setForm] = useState<EventPayload>({
    nombre: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
    color_primario: '#1a73e8',
    color_secundario: '#c8a45a',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { events: data } = await eventApi.getAll();
      setEvents(data);
      const counts: Record<number, number> = {};
      const { certificates } = await certApi.getAll();
      for (const c of certificates) {
        counts[c.evento_id] = (counts[c.evento_id] || 0) + 1;
      }
      setCertCounts(counts);
    } catch {
      toast('error', 'Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({
      nombre: '',
      descripcion: '',
      fecha: new Date().toISOString().split('T')[0],
      color_primario: '#1a73e8',
      color_secundario: '#c8a45a',
    });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (event: Event) => {
    setEditingId(event.id);
    setForm({
      nombre: event.nombre,
      descripcion: event.descripcion,
      fecha: event.fecha,
      color_primario: event.color_primario,
      color_secundario: event.color_secundario,
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nombre?.trim()) e.nombre = 'Obligatorio';
    if (!form.fecha) e.fecha = 'Obligatorio';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (editingId) {
        const { event: updated } = await eventApi.update(editingId, form);
        setEvents((prev) =>
          prev.map((ev) => (ev.id === editingId ? { ...ev, ...updated } : ev))
        );
        toast('success', 'Evento actualizado');
      } else {
        const { event: created } = await eventApi.create(form);
        setEvents((prev) => [created, ...prev]);
        toast('success', 'Evento creado');
      }
      setModalOpen(false);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || 'Error del servidor';
      toast('error', msg);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este evento? Se eliminarán también los certificados asociados.')) return;
    try {
      await eventApi.delete(id);
      setEvents((prev) => prev.filter((ev) => ev.id !== id));
      toast('success', 'Evento eliminado');
    } catch {
      toast('error', 'Error al eliminar evento');
    }
  };

  const openSpeakersModal = async (event: Event) => {
    setSelectedEvent(event);
    setSpeakersModalOpen(true);
    try {
      const { speakers } = await eventApi.getSpeakers(event.id);
      setEventSpeakers(speakers);
    } catch {
      setEventSpeakers([]);
      toast('error', 'Error al cargar ponentes');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Eventos</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {events.length} eventos registrados
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />} onClick={openCreate}>
          Nuevo evento
        </Button>
      </div>

      {/* Event Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">
          <div className="animate-spin h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
          Cargando eventos...
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Calendar size={40} className="mx-auto text-slate-200 mb-3" />
          <p className="text-slate-500 text-sm">
            No hay eventos aún. Crea el primero.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Color accent bar */}
              <div
                className="h-2"
                style={{
                  background: `linear-gradient(90deg, ${event.color_primario || '#1a73e8'}, ${event.color_secundario || '#c8a45a'})`,
                }}
              />

              <div className="p-5">
                {/* Title row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">
                      {event.nombre}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
                      <Calendar size={13} />
                      <span>{event.fecha}</span>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium
                    ${event.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                  >
                    {event.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                {/* Description */}
                {event.descripcion && (
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                    {event.descripcion}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Users size={14} />
                    <span>{event.speakers?.length ?? 0} ponentes</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <FileBadge size={14} />
                    <span>{certCounts[event.id] ?? 0} certificados</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Users size={14} />}
                    onClick={() => openSpeakersModal(event)}
                  >
                    Ponentes
                  </Button>
                  <div className="flex-1" />
                  <button
                    onClick={() => openEdit(event)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                    title="Editar"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Eliminar"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar Evento' : 'Nuevo Evento'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre del evento"
            value={form.nombre}
            error={errors.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            placeholder="Congreso Internacional de Tecnología"
          />
          <Textarea
            label="Descripción (opcional)"
            value={form.descripcion || ''}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            placeholder="Descripción breve del evento..."
          />
          <Input
            label="Fecha del evento"
            type="date"
            value={form.fecha}
            error={errors.fecha}
            onChange={(e) => setForm({ ...form, fecha: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Color primario
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.color_primario || '#1a73e8'}
                  onChange={(e) =>
                    setForm({ ...form, color_primario: e.target.value })
                  }
                  className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={form.color_primario || '#1a73e8'}
                  onChange={(e) =>
                    setForm({ ...form, color_primario: e.target.value })
                  }
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                  placeholder="#1a73e8"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Color secundario
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.color_secundario || '#c8a45a'}
                  onChange={(e) =>
                    setForm({ ...form, color_secundario: e.target.value })
                  }
                  className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={form.color_secundario || '#c8a45a'}
                  onChange={(e) =>
                    setForm({ ...form, color_secundario: e.target.value })
                  }
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                  placeholder="#c8a45a"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {editingId ? 'Guardar cambios' : 'Crear evento'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Speakers sub-modal */}
      <Modal
        open={speakersModalOpen}
        onClose={() => setSpeakersModalOpen(false)}
        title={`Ponentes de ${selectedEvent?.nombre || ''}`}
        maxWidth="max-w-md"
      >
        {eventSpeakers.length === 0 ? (
          <div className="text-center py-6">
            <Users size={32} className="mx-auto text-slate-200 mb-2" />
            <p className="text-sm text-slate-500">
              No hay ponentes registrados para este evento.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
            {eventSpeakers.map((speaker) => (
              <div
                key={speaker.id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="w-9 h-9 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center text-sm font-bold shrink-0">
                  {speaker.nombre.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {speaker.nombre}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {speaker.cargo}
                  </p>
                </div>
                <span
                  className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium
                  ${speaker.firma_guardada ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${speaker.firma_guardada ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  />
                  {speaker.firma_guardada ? 'Firma OK' : 'Sin firma'}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end mt-4">
          <Button variant="ghost" onClick={() => setSpeakersModalOpen(false)}>
            Cerrar
          </Button>
        </div>
      </Modal>
    </div>
  );
}