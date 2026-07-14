export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'usuario';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  nombre: string;
  email: string;
  password: string;
  rol: 'admin' | 'usuario';
}

export interface Event {
  id: number;
  nombre: string;
  descripcion: string;
  fecha: string;
  color_primario: string;
  color_secundario: string;
  activo: boolean;
  creado_por: string;
  fecha_creacion: string;
  speakers?: Speaker[];
}

export interface Speaker {
  id: number;
  nombre: string;
  cargo: string;
  email: string;
  evento_id: number;
  firma_base64?: string;
  firma_guardada: boolean;
}

export interface EventPayload {
  nombre: string;
  descripcion?: string;
  fecha: string;
  color_primario?: string;
  color_secundario?: string;
}

export interface SpeakerPayload {
  nombre: string;
  cargo: string;
  email: string;
  evento_id: number;
}

export interface Certificate {
  id: number;
  nombre_completo: string;
  email: string;
  evento_id: number;
  fecha_emision: string;
  descripcion: string;
  codigo_verif: string;
  enviado: boolean;
  fecha_envio: string;
  creado_por: string;
}

export interface CertificatePayload {
  nombre_completo: string;
  email: string;
  evento_id: number;
  fecha_emision?: string;
  descripcion?: string;
}

export interface BulkSendPayload {
  certificate_ids: number[];
}

export interface SendResult {
  success: boolean;
  message: string;
  pdf_path?: string;
}

export interface BulkResult {
  sent: number[];
  failed: Array<{ id: number; reason: string }>;
  sent_count: number;
  failed_count: number;
  message: string;
}

export interface VerifyResponse {
  valid: boolean;
  message?: string;
  certificate?: Partial<Certificate>;
}

export interface PublicCertificate {
  id: number;
  nombre_completo: string;
  evento_id: number;
  evento_nombre: string;
  fecha_emision: string;
  descripcion: string;
  codigo_verif: string;
  enviado: boolean;
}