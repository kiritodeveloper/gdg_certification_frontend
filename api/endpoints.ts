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
};