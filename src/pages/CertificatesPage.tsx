import { useState, useEffect, useRef, type FormEvent } from 'react';
import {
  Plus,
  Search,
  Send,
  Pencil,
  Trash2,
  Mail,
  FileCheck,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useAuth, useCertificates } from '../hooks';
import { eventApi, certApi } from '../api';
import {
  Button,
  Input,
  Textarea,
  Select,
  Modal,
  toast,
} from '../components/ui';
import type { Certificate, CertificatePayload, Event } from '../types';

interface ImportError {
  row: number;
  reason: string;
}

export default function CertificatesPage() {
  const { isAdmin } = useAuth();
  const {
    certificates,
    loading,
    fetchAll,
    create,
    update,
    remove,
    sendSingle,
    sendBulk,
  } = useCertificates();

  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'sent' | 'pending'>('all');
  const [filterEvent, setFilterEvent] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [sending, setSending] = useState<number | null>(null);
  const [form, setForm] = useState<CertificatePayload>({
    nombre_completo: '',
    email: '',
    evento_id: 0,
    fecha_emision: new Date().toISOString().split('T')[0],
    descripcion: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Import Excel state ──
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importEventId, setImportEventId] = useState(0);
  const [importFecha, setImportFecha] = useState(new Date().toISOString().split('T')[0]);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    created_count: number;
    failed_count: number;
    failed: ImportError[];
    evento: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAll();
    fetchEvents();
  }, [fetchAll]);

  const fetchEvents = async () => {
    try {
      const { events: data } = await eventApi.getAll();
      setEvents(data);
    } catch {
      // Non-critical
    }
  };

  const getEventName = (id: number) =>
    events.find((e) => e.id === id)?.nombre || `Evento #${id}`;

  const eventOptions = events.map((e) => ({
    value: String(e.id),
    label: e.nombre,
  }));

  const filterEventOptions = [
    { value: '', label: 'Todos los eventos' },
    ...eventOptions,
  ];

  // Filter & search
  const filtered = certificates.filter((c) => {
    const eventName = getEventName(c.evento_id);
    const matchSearch =
      !search ||
      c.nombre_completo.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      eventName.toLowerCase().includes(search.toLowerCase()) ||
      c.codigo_verif.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'sent' && c.enviado) ||
      (filterStatus === 'pending' && !c.enviado);
    const matchEvent = !filterEvent || c.evento_id === Number(filterEvent);
    return matchSearch && matchStatus && matchEvent;
  });

  // ── Form handling ──
  const openCreate = () => {
    setEditingId(null);
    setForm({
      nombre_completo: '',
      email: '',
      evento_id: 0,
      fecha_emision: new Date().toISOString().split('T')[0],
      descripcion: '',
    });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (cert: Certificate) => {
    setEditingId(cert.id);
    setForm({
      nombre_completo: cert.nombre_completo,
      email: cert.email,
      evento_id: cert.evento_id,
      fecha_emision: cert.fecha_emision,
      descripcion: cert.descripcion,
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nombre_completo?.trim()) e.nombre_completo = 'Obligatorio';
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
        await update(editingId, form);
        toast('success', 'Certificado actualizado');
      } else {
        await create(form);
        toast('success', 'Certificado creado');
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
    if (!confirm('¿Eliminar este certificado?')) return;
    try {
      await remove(id);
      setSelected((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
      toast('success', 'Certificado eliminado');
    } catch {
      toast('error', 'Error al eliminar');
    }
  };

  const handleSend = async (id: number) => {
    setSending(id);
    try {
      const r = await sendSingle(id);
      toast(r.success ? 'success' : 'error', r.message);
    } catch {
      toast('error', 'Error al enviar');
    } finally {
      setSending(null);
    }
  };

  const handleBulkSend = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    try {
      const r = await sendBulk(ids);
      toast('info', `${r.sent_count} enviados, ${r.failed_count} fallidos`);
      setSelected(new Set());
    } catch {
      toast('error', 'Error en envío masivo');
    }
  };

  const toggleSelect = (id: number) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((c) => c.id)));
  };

  // ── Import Excel handling ──
  const openImportModal = () => {
    setImportEventId(0);
    setImportFecha(new Date().toISOString().split('T')[0]);
    setImportFile(null);
    setImportResult(null);
    setImporting(false);
    setImportModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImportFile(file);
    setImportResult(null);
  };

  const handleImport = async () => {
    if (!importEventId) {
      toast('error', 'Seleccione un evento');
      return;
    }
    if (!importFile) {
      toast('error', 'Seleccione un archivo Excel');
      return;
    }
    setImporting(true);
    setImportResult(null);
    try {
      const result = await certApi.importExcel(importFile, importEventId, importFecha);
      setImportResult({
        created_count: result.created_count,
        failed_count: result.failed_count,
        failed: result.failed,
        evento: result.evento,
      });
      fetchAll();
      if (result.failed_count === 0) {
        toast('success', `${result.created_count} certificados importados`);
      } else {
        toast('info', `${result.created_count} creados, ${result.failed_count} con errores`);
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || 'Error al importar el archivo';
      toast('error', msg);
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    // Genera un archivo TSV (tab-separated) que Excel abre correctamente como .xls
    const header = 'Nombre completo\tEmail\tFecha de emisión\tDescripción';
    const row1 = 'María García López\tmaria@ejemplo.com\t2026-07-12\t120 horas lectivas';
    const row2 = 'Juan Pérez Ruiz\tjuan@ejemplo.com\t\t';
    const content = header + '\n' + row1 + '\n' + row2;
    const blob = new Blob(['\uFEFF' + content], { type: 'text/tab-separated-values;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_participantes.xls';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Certificados</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {certificates.length} certificados en total
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <Button
              variant="primary"
              icon={<Mail size={16} />}
              onClick={handleBulkSend}
            >
              Enviar ({selected.size})
            </Button>
          )}
          {isAdmin && (
            <>
              <Button
                variant="outline"
                icon={<FileSpreadsheet size={16} />}
                onClick={openImportModal}
              >
                Importar Excel
              </Button>
              <Button
                variant="primary"
                icon={<Plus size={16} />}
                onClick={openCreate}
              >
                Nuevo certificado
              </Button>
            </>
          )}
        </div>
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
            placeholder="Buscar por nombre, email, evento o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm
              focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
          />
        </div>
        <Select
          options={filterEventOptions}
          value={filterEvent}
          onChange={(e) => setFilterEvent(e.target.value)}
          className="sm:w-52"
        />
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {(['all', 'pending', 'sent'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer
                ${
                  filterStatus === f
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              {f === 'all' ? 'Todos' : f === 'sent' ? 'Enviados' : 'Pendientes'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <div className="animate-spin h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
            Cargando certificados...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FileCheck size={40} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-500 text-sm">
              {search || filterStatus !== 'all'
                ? 'No se encontraron resultados'
                : 'No hay certificados. Crea el primero.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.size === filtered.length && filtered.length > 0}
                      onChange={toggleAll}
                      className="rounded border-slate-300"
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Nombre
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">
                    Evento
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">
                    Fecha
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Estado
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((cert) => (
                  <tr
                    key={cert.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(cert.id)}
                        onChange={() => toggleSelect(cert.id)}
                        className="rounded border-slate-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900">{cert.nombre_completo}</p>
                        <p className="text-xs text-slate-400 md:hidden">{cert.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">
                      {cert.email}
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden lg:table-cell max-w-[200px] truncate">
                      {getEventName(cert.evento_id)}
                    </td>
                    <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">
                      {cert.fecha_emision}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                        ${cert.enviado ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${cert.enviado ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        />
                        {cert.enviado ? 'Enviado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {!cert.enviado && (
                          <button
                            onClick={() => handleSend(cert.id)}
                            disabled={sending === cert.id}
                            title="Enviar por email"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors cursor-pointer"
                          >
                            <Send size={15} />
                          </button>
                        )}
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => openEdit(cert)}
                              title="Editar"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(cert.id)}
                              title="Eliminar"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
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
            Mostrando {filtered.length} de {certificates.length} certificados
          </div>
        )}
      </div>

      {/* ═══ Create / Edit Modal (2 columns) ═══ */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar Certificado' : 'Nuevo Certificado'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombre completo"
              value={form.nombre_completo || ''}
              error={errors.nombre_completo}
              onChange={(e) =>
                setForm({ ...form, nombre_completo: e.target.value })
              }
              placeholder="María García López"
            />
            <Input
              label="Email del destinatario"
              type="email"
              value={form.email || ''}
              error={errors.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="maria@ejemplo.com"
            />
            {eventOptions.length === 0 ? (
              <div className="sm:col-span-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                No hay eventos creados. Ve a{' '}
                <a href="/events" className="font-semibold underline hover:text-amber-900">
                  Eventos
                </a>{' '}
                y crea uno antes de generar certificados.
              </div>
            ) : (
              <Select
                label="Evento"
                options={eventOptions}
                value={form.evento_id ? String(form.evento_id) : ''}
                onChange={(e) =>
                  setForm({ ...form, evento_id: Number(e.target.value) })
                }
                error={errors.evento_id}
                placeholder="Seleccionar evento"
              />
            )}
            <Input
              label="Fecha de emisión"
              type="date"
              value={form.fecha_emision || ''}
              onChange={(e) =>
                setForm({ ...form, fecha_emision: e.target.value })
              }
            />
          </div>
          <Textarea
            label="Descripción (opcional)"
            value={form.descripcion || ''}
            onChange={(e) =>
              setForm({ ...form, descripcion: e.target.value })
            }
            placeholder="120 horas lectivas, nota sobresaliente..."
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
              {editingId ? 'Guardar cambios' : 'Crear certificado'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ═══ Import Excel Modal ═══ */}
      <Modal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Importar Participantes desde Excel"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-5">
          {/* Info banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <p className="font-medium mb-1">Formato del archivo requerido (.xlsx):</p>
            <p className="text-blue-600">
              Columna A: <strong>Nombre completo</strong> | Columna B: <strong>Email</strong> | Columna C: Fecha (opcional) | Columna D: Descripción (opcional)
            </p>
            <button
              type="button"
              onClick={downloadTemplate}
              className="mt-2 text-xs font-semibold text-blue-700 underline hover:text-blue-900 cursor-pointer"
            >
              Descargar plantilla de ejemplo
            </button>
          </div>

          {/* Form: 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Evento"
              options={eventOptions}
              value={importEventId ? String(importEventId) : ''}
              onChange={(e) => {
                setImportEventId(Number(e.target.value));
                setImportResult(null);
              }}
              placeholder="Seleccionar evento"
            />
            <Input
              label="Fecha de emisión (para filas sin fecha)"
              type="date"
              value={importFecha}
              onChange={(e) => setImportFecha(e.target.value)}
            />
          </div>

          {/* File upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Archivo Excel
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors
                ${importFile
                  ? 'border-emerald-300 bg-emerald-50/50 hover:border-emerald-400'
                  : 'border-slate-200 bg-slate-50/50 hover:border-primary-400 hover:bg-primary-50/30'
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              {importFile ? (
                <div className="flex items-center justify-center gap-3">
                  <FileSpreadsheet size={24} className="text-emerald-600" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-slate-900">{importFile.name}</p>
                    <p className="text-xs text-slate-500">
                      {(importFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImportFile(null);
                      setImportResult(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={28} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500">
                    Haz clic para seleccionar un archivo
                  </p>
                  <p className="text-xs text-slate-400 mt-1">.xlsx (recomendado) o .csv</p>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setImportModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleImport}
              loading={importing}
              disabled={!importEventId || !importFile}
              icon={<Upload size={16} />}
            >
              {importing ? 'Importando...' : 'Importar participantes'}
            </Button>
          </div>

          {/* Results */}
          {importResult && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              {/* Summary bar */}
              <div className="flex items-center gap-4 px-4 py-3 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-1.5 text-sm">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span className="font-medium text-emerald-700">
                    {importResult.created_count} creados
                  </span>
                </div>
                {importResult.failed_count > 0 && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <AlertCircle size={16} className="text-red-500" />
                    <span className="font-medium text-red-600">
                      {importResult.failed_count} con error
                    </span>
                  </div>
                )}
                <span className="ml-auto text-xs text-slate-400">
                  Evento: {importResult.evento}
                </span>
              </div>

              {/* Failed rows */}
              {importResult.failed.length > 0 && (
                <div className="max-h-48 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-red-50/50">
                        <th className="text-left px-4 py-2 text-xs font-semibold text-red-600 uppercase">
                          Fila
                        </th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-red-600 uppercase">
                          Error
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-red-50">
                      {importResult.failed.map((f, i) => (
                        <tr key={i} className="hover:bg-red-50/30">
                          <td className="px-4 py-2 text-slate-600 font-mono text-xs">
                            #{f.row}
                          </td>
                          <td className="px-4 py-2 text-red-600 text-xs">
                            {f.reason}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}