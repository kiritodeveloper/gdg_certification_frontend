import { useState } from 'react';
import { Search, FileCheck, Shield } from 'lucide-react';
import { certApi } from '../api';
import { Input, Button, toast } from '../components/ui';
import type { VerifyResponse } from '../types';

export default function VerifyPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResponse | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast('error', 'Ingresa un código de verificación');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await certApi.verify(code.trim());
      setResult(res);
    } catch {
      setResult({ valid: false, message: 'Error al conectar con el servidor' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Verificar Certificado
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Ingresa el código de verificación para comprobar la autenticidad de un
          certificado
        </p>
      </div>

      {/* Search card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
            <Search size={24} className="text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Código de verificación</h3>
            <p className="text-xs text-slate-400">
              Formato: CERT-XXXXXXXX-XXXX
            </p>
          </div>
        </div>

        <form onSubmit={handleVerify} className="flex gap-3">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="CERT-XXXXXXXX-XXXX"
            className="flex-1 !text-lg !tracking-wider font-mono"
          />
          <Button type="submit" loading={loading} icon={<Search size={16} />}>
            Verificar
          </Button>
        </form>
      </div>

      {/* Result */}
      {result && (
        <div
          className={`rounded-2xl border-2 p-8 transition-all ${
            result.valid
              ? 'border-emerald-200 bg-emerald-50/50'
              : 'border-red-200 bg-red-50/50'
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                result.valid ? 'bg-emerald-100' : 'bg-red-100'
              }`}
            >
              {result.valid ? (
                <Shield size={24} className="text-emerald-600" />
              ) : (
                <FileCheck size={24} className="text-red-600" />
              )}
            </div>
            <div>
              <h3
                className={`font-bold text-lg ${
                  result.valid ? 'text-emerald-800' : 'text-red-800'
                }`}
              >
                {result.valid
                  ? 'Certificado Válido'
                  : 'Certificado No Encontrado'}
              </h3>
              <p
                className={`text-sm ${
                  result.valid ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {result.valid
                  ? 'Este certificado ha sido verificado y es auténtico'
                  : result.message}
              </p>
            </div>
          </div>

          {result.valid && result.certificate && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {[
                { label: 'Nombre', value: result.certificate.nombre_completo },
                { label: 'Evento', value: result.certificate.evento_id ? `Evento #${result.certificate.evento_id}` : '' },
                {
                  label: 'Fecha de emisión',
                  value: result.certificate.fecha_emision,
                },
                {
                  label: 'Estado',
                  value: result.certificate.enviado ? 'Enviado' : 'Emitido',
                },
                {
                  label: 'Descripción',
                  value: result.certificate.descripcion || '—',
                },
                {
                  label: 'Código',
                  value: result.certificate.codigo_verif || '',
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="bg-white/70 rounded-xl p-4 border border-white"
                >
                  <p className="text-xs text-slate-500 mb-1">{label}</p>
                  <p className="text-sm font-semibold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}