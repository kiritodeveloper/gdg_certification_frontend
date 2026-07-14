import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Search, Download, FileCheck, ShieldCheck, ArrowLeft,
  Loader2, KeyRound, User, CheckCircle2, XCircle,
} from 'lucide-react';
import { certApi } from '../api';
import './ActivatePage.css';

/* ── Types ─────────────────────────────────────────── */
interface CertResult {
  id: number;
  nombre_completo: string;
  email: string;
  evento_id: number;
  evento_nombre: string;
  fecha_emision: string;
  descripcion: string;
  codigo_verif: string;
  enviado: boolean;
}

/* ── Page ──────────────────────────────────────────── */
type Tab = 'buscar' | 'activar' | 'validar';

export default function ActivatePage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('buscar');

  // Si viene con code en URL → ir a activar
  useEffect(() => {
    if (code && code.trim()) setTab('activar');
  }, [code]);

  return (
    <div className="activate-bg">
      <div className="activate-shape activate-shape-1" />
      <div className="activate-shape activate-shape-2" />
      <div className="activate-shape activate-shape-3" />

      <main className="activate-container">
        <div className="activate-card">
          {/* Header */}
          <header className="activate-header">
            <div className="activate-icon-wrap">
              <ShieldCheck size={32} className="activate-icon" />
            </div>
            <h1 className="activate-title">Portal de Certificados</h1>
            <p className="activate-subtitle">
              Busca, valida o descarga tu certificado sin necesidad de registrarte
            </p>
          </header>

          {/* Tabs */}
          <nav className="activate-tabs">
            <button
              className={`activate-tab-btn ${tab === 'buscar' ? 'active' : ''}`}
              onClick={() => setTab('buscar')}
            >
              <Search size={16} />
              <span>Buscar</span>
            </button>
            <button
              className={`activate-tab-btn ${tab === 'activar' ? 'active' : ''}`}
              onClick={() => setTab('activar')}
            >
              <KeyRound size={16} />
              <span>Activar</span>
            </button>
            <button
              className={`activate-tab-btn ${tab === 'validar' ? 'active' : ''}`}
              onClick={() => setTab('validar')}
            >
              <CheckCircle2 size={16} />
              <span>Validar</span>
            </button>
          </nav>

          {/* Tab content */}
          <div className="activate-body">
            {tab === 'buscar' && <BuscarTab />}
            {tab === 'activar' && <ActivarTab initialCode={code} navigate={navigate} />}
            {tab === 'validar' && <ValidarTab />}
          </div>

          {/* Footer */}
          <footer className="activate-footer">
            <Link to="/portal" className="activate-link">
              <ArrowLeft size={14} /> Volver al portal
            </Link>
          </footer>
        </div>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TAB 1: BUSCAR POR NOMBRE O EMAIL
   ═══════════════════════════════════════════════════════ */
function BuscarTab() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CertResult[]>([]);
  const [message, setMessage] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q || q.length < 2) return;
    setLoading(true);
    setSearched(true);
    setResults([]);
    setMessage('');
    try {
      const res = await certApi.publicSearch(q);
      if (res.found && res.certificates) {
        setResults(res.certificates);
      } else {
        setMessage(res.message || 'No se encontraron certificados');
      }
    } catch {
      setMessage('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (cert: CertResult) => {
    window.open(certApi.publicActivateUrl(cert.codigo_verif), '_blank');
  };

  return (
    <>
      <form className="activate-form" onSubmit={handleSearch}>
        <label className="activate-label">Busca tu certificado</label>
        <div className="activate-search-row">
          <div className="activate-input-wrap">
            <Search size={20} className="activate-input-icon" />
            <input
              type="text"
              className="activate-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nombre completo o correo electronico"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="activate-submit-btn"
            disabled={!query.trim() || loading}
            style={{ maxWidth: 160, flexShrink: 0 }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            Buscar
          </button>
        </div>
        <p className="activate-input-hint">
          Escribe tu nombre (ej: "Maria Garcia") o tu correo electronico para encontrar tus certificados
        </p>
      </form>

      {/* Loading */}
      {loading && (
        <div className="activate-loading">
          <Loader2 size={32} className="animate-spin" />
          <p>Buscando certificados...</p>
        </div>
      )}

      {/* Sin resultados */}
      {searched && !loading && message && (
        <div className="activate-empty-box">
          <User size={28} className="text-slate-400" />
          <p>{message}</p>
        </div>
      )}

      {/* Resultados */}
      {results.length > 0 && (
        <div className="activate-results">
          <p className="activate-results-title">
            {results.length} certificado{results.length > 1 ? 's' : ''} encontrado{results.length > 1 ? 's' : ''}
          </p>
          <div className="activate-results-list">
            {results.map((cert) => (
              <div key={cert.id} className="activate-result-card">
                <div className="activate-result-info">
                  <p className="activate-result-name">{cert.nombre_completo}</p>
                  <p className="activate-result-event">
                    {cert.evento_nombre || 'Sin evento'}
                  </p>
                  <p className="activate-result-meta">
                    {cert.fecha_emision}
                    {cert.enviado ? (
                      <span className="activate-badge-enviado">Enviado</span>
                    ) : (
                      <span className="activate-badge-pendiente">Pendiente</span>
                    )}
                  </p>
                </div>
                <button
                  className="activate-dl-btn"
                  onClick={() => handleDownload(cert)}
                  title="Descargar PDF"
                >
                  <Download size={18} />
                </button>
              </div>
            ))}
          </div>
          <p className="activate-hint">
            Presiona el boton de descarga para generar y obtener tu certificado en PDF
          </p>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   TAB 2: ACTIVAR POR CODIGO
   ═══════════════════════════════════════════════════════ */
function ActivarTab({ initialCode, navigate }: { initialCode?: string; navigate: (path: string) => void }) {
  const [code, setCode] = useState(initialCode || '');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [certInfo, setCertInfo] = useState<CertResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialCode?.trim()) fetchInfo(initialCode.trim());
  }, [initialCode]);

  const fetchInfo = async (c: string) => {
    setLoading(true);
    setError('');
    setCertInfo(null);
    try {
      const res = await certApi.publicActivateInfo(c);
      if (res.valid && res.certificate) {
        setCertInfo(res.certificate as CertResult);
      } else {
        setError(res.message || 'Codigo invalido');
      }
    } catch {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (!c) return;
    navigate(`/activate/${c}`);
  };

  const handleDownload = async () => {
    const c = code.trim().toUpperCase();
    if (!c) return;
    setDownloading(true);
    try {
      const url = certApi.publicActivateUrl(c);
      const resp = await fetch(url);
      if (!resp.ok) throw new Error();
      const blob = await resp.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `certificado_${(certInfo?.nombre_completo || 'certificado').replace(/\s+/g, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      setError('No se pudo generar el PDF');
    } finally {
      setDownloading(false);
    }
  };

  // Si viene con code y ya tiene info → mostrar resultado directo
  if (certInfo) {
    return (
      <div className="activate-success-box">
        <div className="activate-success-header">
          <ShieldCheck size={28} className="text-emerald-500" />
          <div>
            <p className="activate-success-title">Certificado encontrado</p>
            <p className="activate-success-code">{certInfo.codigo_verif}</p>
          </div>
        </div>

        <div className="activate-info-grid">
          <div className="activate-info-item">
            <span className="activate-info-label">Nombre</span>
            <span className="activate-info-value">{certInfo.nombre_completo}</span>
          </div>
          <div className="activate-info-item">
            <span className="activate-info-label">Evento</span>
            <span className="activate-info-value">{certInfo.evento_nombre || '—'}</span>
          </div>
          <div className="activate-info-item">
            <span className="activate-info-label">Fecha</span>
            <span className="activate-info-value">{certInfo.fecha_emision}</span>
          </div>
          {certInfo.descripcion && (
            <div className="activate-info-item">
              <span className="activate-info-label">Descripcion</span>
              <span className="activate-info-value">{certInfo.descripcion}</span>
            </div>
          )}
        </div>

        <button className="activate-download-btn" onClick={handleDownload} disabled={downloading}>
          {downloading ? (
            <><Loader2 size={20} className="animate-spin" /> Generando PDF...</>
          ) : (
            <><Download size={20} /> Descargar mi Certificado (PDF)</>
          )}
        </button>
        <p className="activate-hint">Tu certificado se genera con tu nombre al momento de descargar.</p>
      </div>
    );
  }

  return (
    <>
      {loading ? (
        <div className="activate-loading">
          <Loader2 size={32} className="animate-spin" />
          <p>Verificando codigo...</p>
        </div>
      ) : error ? (
        <div className="activate-error-box">
          <XCircle size={28} className="text-red-400" />
          <p className="activate-error-title">Codigo no valido</p>
          <p className="activate-error-msg">{error}</p>
        </div>
      ) : (
        <>
          <form className="activate-form" onSubmit={handleSubmit}>
            <label className="activate-label">Codigo de activacion</label>
            <div className="activate-input-wrap">
              <KeyRound size={20} className="activate-input-icon" />
              <input
                type="text"
                className="activate-input"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="CERT-XXXXXXXX-XXXX"
                autoFocus={!initialCode}
              />
            </div>
            <p className="activate-input-hint">
              Este codigo te fue enviado por correo. Formato: CERT-XXXXXXXX-XXXX
            </p>
            <button type="submit" className="activate-submit-btn mt-4" disabled={!code.trim() || loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <FileCheck size={18} />}
              Activar
            </button>
          </form>
          <div className="activate-guide">
            <h3 className="activate-guide-title">Como obtener tu codigo</h3>
            <div className="activate-steps">
              <div className="activate-step">
                <div className="activate-step-num">1</div>
                <p>Revisa tu <strong>bandeja de entrada</strong> y la carpeta de <strong>spam</strong>.</p>
              </div>
              <div className="activate-step">
                <div className="activate-step-num">2</div>
                <p>Busca el correo "<strong>Tu Certificado esta Listo</strong>" y copia el codigo azul.</p>
              </div>
              <div className="activate-step">
                <div className="activate-step-num">3</div>
                <p>Pegalo arriba y presiona <strong>Activar</strong> para descargar tu PDF.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   TAB 3: VALIDAR CERTIFICADO (una sola vez)
   ═══════════════════════════════════════════════════════ */
function ValidarTab() {
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

    // Prevenir validar más de una vez
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

  // Si ya se validó, bloquear input
  if (validated && result) {
    return (
      <div className={`activate-validate-result ${result.valid ? 'valid' : 'invalid'}`}>
        <div className="activate-validate-icon">
          {result.valid ? <CheckCircle2 size={40} /> : <XCircle size={40} />}
        </div>
        <p className="activate-validate-title">
          {result.valid ? 'Certificado Valido y Autentico' : 'Certificado No Valido'}
        </p>
        {result.valid && (
          <div className="activate-validate-details">
            <div className="activate-validate-row">
              <span className="activate-validate-label">Nombre:</span>
              <span className="activate-validate-value">{result.nombre}</span>
            </div>
            <div className="activate-validate-row">
              <span className="activate-validate-label">Evento:</span>
              <span className="activate-validate-value">{result.evento || '—'}</span>
            </div>
            <div className="activate-validate-row">
              <span className="activate-validate-label">Fecha:</span>
              <span className="activate-validate-value">{result.fecha}</span>
            </div>
            <div className="activate-validate-row">
              <span className="activate-validate-label">Codigo:</span>
              <span className="activate-validate-value activate-validate-code">{result.codigo}</span>
            </div>
          </div>
        )}
        {!result.valid && (
          <p className="activate-validate-msg">{result.message}</p>
        )}
        <p className="activate-validate-stamp">
          {result.valid
            ? 'Este certificado fue emitido por nuestra plataforma y es autentico.'
            : 'El codigo ingresado no corresponde a ningun certificado registrado.'}
        </p>
      </div>
    );
  }

  return (
    <form className="activate-form" onSubmit={handleValidate}>
      <label className="activate-label">Validar autenticidad de un certificado</label>
      <p className="activate-input-hint" style={{ marginBottom: 16 }}>
        Ingresa el codigo que aparece en el certificado para comprobar si es autentico.
        Solo puedes validar <strong>una vez</strong> por sesion.
      </p>
      <div className="activate-input-wrap">
        <CheckCircle2 size={20} className="activate-input-icon" />
        <input
          type="text"
          className="activate-input"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="CERT-XXXXXXXX-XXXX"
          autoFocus
          disabled={validated}
        />
      </div>
      <button
        type="submit"
        className="activate-submit-btn mt-4"
        disabled={!code.trim() || loading || validated}
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
        Validar Certificado
      </button>
    </form>
  );
}