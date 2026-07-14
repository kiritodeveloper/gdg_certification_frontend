import { useState, useEffect, useRef, useCallback, type FormEvent } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  PenTool,
  Eraser,
  Save,
  Search,
  UserCircle,
} from 'lucide-react';
import { eventApi, speakerApi } from '../api';
import { Button, Input, Select, Modal, toast } from '../components/ui';
import type { Event, Speaker, SpeakerPayload } from '../types';

/* ── Inline Signature Pad Component ──────────────── */
function SignaturePad({
  onSave,
  saving,
}: {
  onSave: (dataUrl: string) => void;
  saving: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  const getCtx = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    return ctx;
  }, []);

  const getPos = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      if ('touches' in e) {
        const touch = e.touches[0];
        return {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY,
        };
      }
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    []
  );

  const startDraw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const ctx = getCtx();
      if (!ctx) return;
      drawing.current = true;
      const { x, y } = getPos(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    },
    [getCtx, getPos]
  );

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!drawing.current) return;
      const ctx = getCtx();
      if (!ctx) return;
      const { x, y } = getPos(e);
      ctx.lineTo(x, y);
      ctx.stroke();
    },
    [getCtx, getPos]
  );

  const stopDraw = useCallback(() => {
    drawing.current = false;
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  useEffect(() => {
    clearCanvas();
  }, [clearCanvas]);

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500">
        Dibuje la firma con el mouse o el dedo:
      </p>
      <canvas
        ref={canvasRef}
        width={700}
        height={240}
        className="w-full max-w-[350px] h-[120px] border border-slate-200 rounded-lg cursor-crosshair bg-white touch-none"
        style={{ imageRendering: 'auto' }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={stopDraw}
      />
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          icon={<Eraser size={14} />}
          onClick={clearCanvas}
        >
          Limpiar
        </Button>
        <Button
          variant="primary"
          size="sm"
          icon={<Save size={14} />}
          onClick={handleSave}
          loading={saving}
        >
          Guardar firma
        </Button>
      </div>
    </div>
  );
}

/* ── Speakers Page ───────────────────────────────── */
export default function SpeakersPage() {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterEvent, setFilterEvent] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [signingSpeaker, setSigningSpeaker] = useState<Speaker | null>(null);
  const [savingSignature, setSavingSignature] = useState(false);
  const [form, setForm] = useState<SpeakerPayload>({
    nombre: '',
    cargo: '',
    email: '',
    evento_id: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [speakersRes, eventsRes] = await Promise.all([
        speakerApi.getAll(),
        eventApi.getAll(),
      ]);
      setSpeakers(speakersRes.speakers);
      setEvents(eventsRes.events);
    } catch {
      toast('error', 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const getEventName = (id: number) =>
    events.find((e) => e.id === id)?.nombre || `Evento #${id}`;

  const eventOptions = [
    { value: '', label: 'Todos los eventos' },
    ...events.map((e) => ({ value: String(e.id), label: e.nombre })),
  ];

  const formEventOptions = events.map((e) => ({
    value: String(e.id),
    label: e.nombre,
  }));

  const filtered = speakers.filter((s) => {
    const matchSearch =
      !search ||
      s.nombre.toLowerCase().includes(search.toLowerCase()) ||
      s.cargo.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchEvent = !filterEvent || s.evento_id === Number(filterEvent);
    return matchSearch && matchEvent;
  });

  const openCreate = () => {
    setEditingId(null);
    setForm({ nombre: '', cargo: '', email: '', evento_id: 0 });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (speaker: Speaker) => {
    setEditingId(speaker.id);
    setForm({
      nombre: speaker.nombre,
      cargo: speaker.cargo,
      email: speaker.email,
      evento_id: speaker.evento_id,
    });
    setErrors({});
    setModalOpen(true);
  };

  const openSignature = (speaker: Speaker) => {
    setSigningSpeaker(speaker);
    setSignatureModalOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nombre?.trim()) e.nombre = 'Obligatorio';
    if (!form.cargo?.trim()) e.cargo = 'Obligatorio';
    if (!form.email?.trim()) e.email = 'Obligatorio';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido';
    if (!form.evento_id) e.evento_id = 'Seleccione un evento';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (editingId) {
        const { speaker: updated } = await speakerApi.update(editingId, form);
        setSpeakers((prev) =>
          prev.map((s) => (s.id === editingId ? updated : s))
        );
        toast('success', 'Ponente actualizado');
      } else {
        const { speaker: created } = await speakerApi.create(form);
        setSpeakers((prev) => [created, ...prev]);
        toast('success', 'Ponente creado');
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
    if (!confirm('¿Eliminar este ponente?')) return;
    try {
      await speakerApi.delete(id);
      setSpeakers((prev) => prev.filter((s) => s.id !== id));
      toast('success', 'Ponente eliminado');
    } catch {
      toast('error', 'Error al eliminar ponente');
    }
  };

  const handleSaveSignature = async (dataUrl: string) => {
    if (!signingSpeaker) return;
    setSavingSignature(true);
    try {
      await speakerApi.saveSignature(signingSpeaker.id, dataUrl);
      setSpeakers((prev) =>
        prev.map((s) =>
          s.id === signingSpeaker.id
            ? { ...s, firma_guardada: true, firma_base64: dataUrl }
            : s
        )
      );
      toast('success', 'Firma guardada correctamente');
      setSignatureModalOpen(false);
    } catch {
      toast('error', 'Error al guardar firma');
    } finally {
      setSavingSignature(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ponentes</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {speakers.length} ponentes registrados
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />} onClick={openCreate}>
          Nuevo ponente
        </Button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Buscar por nombre, cargo o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm
              focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
          />
        </div>
        <Select
          options={eventOptions}
          value={filterEvent}
          onChange={(e) => setFilterEvent(e.target.value)}
          className="sm:w-56"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <div className="animate-spin h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
            Cargando ponentes...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <UserCircle size={40} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-500 text-sm">
              {search || filterEvent
                ? 'No se encontraron resultados'
                : 'No hay ponentes. Crea el primero.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Nombre
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">
                    Cargo
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">
                    Evento
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Firma
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((speaker) => (
                  <tr
                    key={speaker.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900">
                          {speaker.nombre}
                        </p>
                        <p className="text-xs text-slate-400 md:hidden">
                          {speaker.cargo}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">
                      {speaker.cargo}
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden lg:table-cell">
                      {speaker.email}
                    </td>
                    <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">
                      {getEventName(speaker.evento_id)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                        ${speaker.firma_guardada ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${speaker.firma_guardada ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        />
                        {speaker.firma_guardada ? 'Guardada' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openSignature(speaker)}
                          title="Firma"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors cursor-pointer"
                        >
                          <PenTool size={15} />
                        </button>
                        <button
                          onClick={() => openEdit(speaker)}
                          title="Editar"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(speaker.id)}
                          title="Eliminar"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
            Mostrando {filtered.length} de {speakers.length} ponentes
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar Ponente' : 'Nuevo Ponente'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre completo"
            value={form.nombre}
            error={errors.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            placeholder="Dr. Juan Pérez"
          />
          <Input
            label="Cargo"
            value={form.cargo}
            error={errors.cargo}
            onChange={(e) => setForm({ ...form, cargo: e.target.value })}
            placeholder="Director General"
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            error={errors.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="juan@ejemplo.com"
          />
          <Select
            label="Evento"
            options={formEventOptions}
            value={form.evento_id ? String(form.evento_id) : ''}
            onChange={(e) =>
              setForm({ ...form, evento_id: Number(e.target.value) })
            }
            error={errors.evento_id}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {editingId ? 'Guardar cambios' : 'Crear ponente'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Signature Modal */}
      <Modal
        open={signatureModalOpen}
        onClose={() => setSignatureModalOpen(false)}
        title={`Firma de ${signingSpeaker?.nombre || ''}`}
        maxWidth="max-w-md"
      >
        <SignaturePad
          onSave={handleSaveSignature}
          saving={savingSignature}
        />
        <div className="flex justify-end mt-4">
          <Button
            variant="ghost"
            onClick={() => setSignatureModalOpen(false)}
          >
            Cancelar
          </Button>
        </div>
      </Modal>
    </div>
  );
}