import api from './client';
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  Certificate,
  CertificatePayload,
  BulkSendPayload,
  SendResult,
  BulkResult,
  VerifyResponse,
  User,
  Event,
  EventPayload,
  Speaker,
  SpeakerPayload,
  PublicCertificate,
} from '../types';

/* ── Auth ─────────────────────────────────────────── */
export const authApi = {
  login: (data: LoginPayload) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  register: (data: RegisterPayload) =>
    api.post('/auth/register', data).then((r) => r.data),

  me: () => api.get<User>('/auth/me').then((r) => r.data),

  getUsers: () =>
    api.get<{ users: User[]; total: number }>('/auth/users').then((r) => r.data),

  deleteUser: (email: string) =>
    api.delete(`/auth/users/${email}`).then((r) => r.data),
};

/* ── Events ───────────────────────────────────────── */
export const eventApi = {
  getAll: () =>
    api
      .get<{ events: Event[]; total: number }>('/events/')
      .then((r) => r.data),

  getById: (id: number) =>
    api.get<{ event: Event }>(`/events/${id}`).then((r) => r.data),

  create: (data: EventPayload) =>
    api
      .post<{ message: string; event: Event }>('/events/', data)
      .then((r) => r.data),

  update: (id: number, data: Partial<EventPayload>) =>
    api
      .put<{ message: string; event: Event }>(`/events/${id}`, data)
      .then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/events/${id}`).then((r) => r.data),

  getSpeakers: (id: number) =>
    api.get<{ speakers: Speaker[] }>(`/events/${id}/speakers`).then((r) => r.data),
};

/* ── Speakers ─────────────────────────────────────── */
export const speakerApi = {
  getAll: () =>
    api.get<{ speakers: Speaker[] }>('/speakers/').then((r) => r.data),

  create: (data: SpeakerPayload) =>
    api
      .post<{ message: string; speaker: Speaker }>('/speakers/', data)
      .then((r) => r.data),

  update: (id: number, data: Partial<SpeakerPayload>) =>
    api
      .put<{ message: string; speaker: Speaker }>(`/speakers/${id}`, data)
      .then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/speakers/${id}`).then((r) => r.data),

  saveSignature: (id: number, firma_base64: string) =>
    api.post(`/speakers/${id}/signature`, { firma_base64 }).then((r) => r.data),
};

/* ── Certificates ─────────────────────────────────── */
export const certApi = {
  getAll: () =>
    api
      .get<{ certificates: Certificate[]; total: number }>('/certificates/')
      .then((r) => r.data),

  getById: (id: number) =>
    api.get<{ certificate: Certificate }>(`/certificates/${id}`).then((r) => r.data),

  create: (data: CertificatePayload) =>
    api
      .post<{ message: string; certificate: Certificate }>('/certificates/', data)
      .then((r) => r.data),

  update: (id: number, data: Partial<CertificatePayload>) =>
    api
      .put<{ message: string; certificate: Certificate }>(`/certificates/${id}`, data)
      .then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/certificates/${id}`).then((r) => r.data),

  send: (id: number) =>
    api.post<SendResult>(`/certificates/${id}/send`).then((r) => r.data),

  sendBulk: (data: BulkSendPayload) =>
    api.post<BulkResult>('/certificates/send-bulk', data).then((r) => r.data),

  verify: (code: string) =>
    api.get<VerifyResponse>(`/certificates/verify/${code}`).then((r) => r.data),

  // Portal público (sin auth)
  publicLookup: (email: string) =>
    api
      .post<{ found: boolean; message?: string; certificates?: PublicCertificate[]; total?: number }>(
        '/certificates/public/lookup',
        { email }
      )
      .then((r) => r.data),

  publicDownloadUrl: (certId: number, email: string) => {
    const base = import.meta.env.VITE_API_URL || '/api';
    return `${base}/certificates/public/download/${certId}?email=${encodeURIComponent(email)}`;
  },

  // Activación por código (sin auth) — genera y descarga PDF
  publicActivateUrl: (code: string) => {
    const base = import.meta.env.VITE_API_URL || '/api';
    return `${base}/certificates/public/activate/${code}`;
  },

  publicActivateInfo: (code: string) =>
    api.get<{ valid: boolean; message?: string; certificate?: { nombre_completo: string; evento_nombre: string; fecha_emision: string; descripcion: string; codigo_verif: string } }>(
      `/certificates/public/activate/${code}/info`
    ).then((r) => r.data),

  // Búsqueda pública por nombre o email (sin auth)
  publicSearch: (query: string) =>
    api.post<{ found: boolean; message?: string; certificates?: Array<{ id: number; nombre_completo: string; email: string; evento_id: number; evento_nombre: string; fecha_emision: string; descripcion: string; codigo_verif: string; enviado: boolean }>; total?: number }>(
      '/certificates/public/search',
      { query }
    ).then((r) => r.data),

  importExcel: (file: File, eventoId: number, fechaEmision?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('evento_id', String(eventoId));
    if (fechaEmision) formData.append('fecha_emision', fechaEmision);
    return api
      .post<{
        message: string;
        created_count: number;
        failed_count: number;
        certificates: Certificate[];
        failed: Array<{ row: number; reason: string }>;
        evento: string;
      }>('/certificates/import-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
};