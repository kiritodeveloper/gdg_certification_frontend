import { useState, useCallback } from 'react';
import { certApi } from '../api';
import type { Certificate, CertificatePayload, BulkResult } from '../types';

export function useCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { certificates: data } = await certApi.getAll();
      setCertificates(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error cargando certificados');
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: CertificatePayload) => {
    const { certificate } = await certApi.create(payload);
    setCertificates((prev) => [certificate, ...prev]);
    return certificate;
  }, []);

  const update = useCallback(async (id: number, payload: Partial<CertificatePayload>) => {
    const { certificate } = await certApi.update(id, payload);
    setCertificates((prev) =>
      prev.map((c) => (c.id === id ? certificate : c))
    );
    return certificate;
  }, []);

  const remove = useCallback(async (id: number) => {
    await certApi.delete(id);
    setCertificates((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const sendSingle = useCallback(async (id: number) => {
    const result = await certApi.send(id);
    if (result.success) {
      setCertificates((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, enviado: true, fecha_envio: new Date().toLocaleString() } : c
        )
      );
    }
    return result;
  }, []);

  const sendBulk = useCallback(
    async (ids: number[]): Promise<BulkResult> => {
      const result = await certApi.sendBulk({ certificate_ids: ids });
      if (result.sent.length > 0) {
        setCertificates((prev) =>
          prev.map((c) =>
            result.sent.includes(c.id)
              ? { ...c, enviado: true, fecha_envio: new Date().toLocaleString() }
              : c
          )
        );
      }
      return result;
    },
    []
  );

  return {
    certificates,
    loading,
    error,
    fetchAll,
    create,
    update,
    remove,
    sendSingle,
    sendBulk,
  };
}