import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { certApi } from '../api';
import './VerCertificadoPage.css';

export default function ValidarCertificadoPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    valid: boolean;
    nombre?: string;
    evento?: string;
    fecha?: string;
    codigo?: string;
    message?: string;
  } | null>(null);
  const [validated, setValidated] = useState(false);

  const handleValidate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const c = code.trim();
    if (!c) return;
    if (validated) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await certApi.publicActivateInfo(c);
      if (res.valid && res.certificate) {
        setResult({
          valid: true,
          nombre: res.certificate.nombre_completo,
          evento: res.certificate.evento_nombre,
          fecha: res.certificate.fecha_emision,
          codigo: res.certificate.codigo_verif,
        });
      } else {
        setResult({ valid: false, message: res.message || 'Certificado no encontrado' });
      }
      setValidated(true);
    } catch {
      setResult({ valid: false, message: 'Error al conectar con el servidor' });
      setValidated(true);
    } finally {
      setLoading(false);
    }
  }, [code, validated]);

  return (
    <div className="ver-bg">
      <div className="ver-bg-gradient" />
      <div className="ver-bubble ver-bubble-1" />
      <div className="ver-bubble ver-bubble-2" />

      <Link to="/login" className="ver-admin-btn" title="Panel de Administración">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
        </svg>
      </Link>

      <div className="ver-container">
        <div className="ver-card">
          {/* Header */}
          <header className="ver-header">
            <div className="ver-badge-icon" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(4, 120, 87, 0.15) 100%)' }}>
              <ShieldCheck size={32} style={{ color: '#10b981' }} />
            </div>
            <h1>Validar Certificado</h1>
            <p className="ver-subtitle">
              Verifica la autenticidad de un certificado con su código de verificación.
            </p>
          </header>

          {/* Body */}
          <div>
            {validated && result ? (
              /* ── Resultado de validación ─────────────── */
              <div
                className="ver-alert"
                style={result.valid
                  ? { background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '24px', borderRadius: '14px', textAlign: 'center', animation: 'verSectionFadeIn 0.3s ease forwards' }
                  : { background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', padding: '24px', borderRadius: '14px', textAlign: 'center', animation: 'verSectionFadeIn 0.3s ease forwards' }
                }
              >
                <div style={{ marginBottom: 12 }}>
                  {result.valid
                    ? <CheckCircle2 size={40} style={{ color: '#10b981' }} />
                    : <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
                  }
                </div>
                <p style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  margin: '0 0 16px',
                  color: result.valid ? '#065f46' : '#dc2626',
                }}>
                  {result.valid ? 'Certificado Válido y Auténtico' : 'Certificado No Válido'}
                </p>

                {result.valid && (
                  <div style={{
                    background: 'rgba(255,255,255,0.6)',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'left',
                    maxWidth: '360px',
                    margin: '0 auto 16px',
                  }}>
                    {[
                      ['Nombre', result.nombre],
                      ['Evento', result.evento || '—'],
                      ['Fecha', result.fecha],
                      ['Código', result.codigo],
                    ].map(([label, value]) => (
                      <div key={label} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '8px 0',
                        borderBottom: '1px solid rgba(0,0,0,0.06)',
                      }}>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>{label}:</span>
                        <span style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#0f172a',
                          textAlign: 'right',
                          maxWidth: '60%',
                          wordBreak: 'break-word',
                          fontFamily: label === 'Código' ? "'Courier New', monospace" : 'inherit',
                          letterSpacing: label === 'Código' ? '1px' : 'normal',
                        }}>{value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {!result.valid && (
                  <p style={{ fontSize: '14px', color: '#b91c1c', margin: '0' }}>{result.message}</p>
                )}

                <p style={{
                  fontSize: '12px',
                  color: '#64748b',
                  margin: '16px 0 0',
                  fontStyle: 'italic',
                }}>
                  {result.valid
                    ? 'Este certificado fue emitido por nuestra plataforma y es auténtico.'
                    : 'El código ingresado no corresponde a ningún certificado registrado.'}
                </p>
              </div>
            ) : loading ? (
              /* ── Cargando ──────────────────────────── */
              <div className="ver-loading">
                <div className="ver-spinner" />
                <p>Verificando certificado...</p>
              </div>
            ) : (
              /* ── Formulario ────────────────────────── */
              <>
                <p className="ver-instructions">
                  Ingresa el código que aparece en el certificado para comprobar si es auténtico.
                  Solo puedes validar <strong>una vez</strong> por sesión.
                </p>

                <form onSubmit={handleValidate}>
                  <div className="ver-input-group">
                    <label>Código de Verificación</label>
                    <input
                      type="text"
                      className="ver-code-input"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="CERT-XXXXXXXX-XXXX"
                      autoFocus
                      disabled={validated}
                    />
                  </div>
                  <button
                    type="submit"
                    className="ver-btn ver-btn-primary"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                    disabled={!code.trim() || loading || validated}
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                    Validar Certificado
                  </button>
                </form>

                {/* Preview */}
                <div className="ver-cert-preview" style={{ marginTop: 24 }}>
                  <div className="ver-preview-overlay">Validación</div>
                  <img src="/plantilla.png" alt="Plantilla de certificado" />
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="ver-footer">
            <Link to="/" className="ver-link">
              <ArrowLeft size={14} /> Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}