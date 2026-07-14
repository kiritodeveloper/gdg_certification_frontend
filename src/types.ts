export type LoginCredentials = {
  email: string;
  password: string;
};

export type User = {
  nombre: string;
  email: string;
  rol: 'admin' | 'usuario';
};

export type Certificate = {
  id: number;
  nombre_completo: string;
  email: string;
  curso: string;
  fecha_emision: string;
  codigo_verif: string;
  enviado: boolean;
  descripcion: string;
};

export type CertificatePayload = {
  nombre_completo: string;
  email: string;
  curso: string;
  fecha_emision: string;
  descripcion: string;
};

export type VerifyResponse = {
  valid: boolean;
  message: string;
  certificate?: Certificate;
};

export type AuthResponse = {
  token: string;
  user: User;
};